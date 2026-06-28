"use server";

import { isDemoMode } from "@/lib/demo";
import { logError } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/reference";
import { getSession } from "@/lib/session";
import { roleAtLeast, type SessionPayload } from "@/lib/session-token";
import { tripSchema, type TripInput } from "@/lib/validation";
import { actionError, type ActionError, type ActionResult } from "./types";

/** Resolve the signed-in driver (DRIVER or ADMIN), or a typed error. */
async function requireDriver(): Promise<SessionPayload | ActionError> {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "DRIVER")) {
    return actionError("يجب تسجيل الدخول كسائق", "FORBIDDEN");
  }
  return session;
}

/**
 * Create a trip for the signed-in driver. Reuses one of the driver's vehicles
 * when type+model match, otherwise registers a new one (with a generated
 * placeholder plate, since the form collects none).
 */
export async function createTrip(
  input: TripInput,
): Promise<ActionResult<{ tripId: string }>> {
  const session = await requireDriver();
  if ("ok" in session) return session;

  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const d = parsed.data;
  const driverId = session.userId;

  if (isDemoMode()) return { ok: true, tripId: "demo-trip" };

  try {
    const vehicle =
      (await prisma.vehicle.findFirst({
        where: { driverId, type: d.vehicleType, model: d.vehicleModel },
        select: { id: true },
      })) ??
      (await prisma.vehicle.create({
        data: {
          driverId,
          type: d.vehicleType,
          model: d.vehicleModel,
          plate: d.plate?.trim() || generateReference("VH"),
          seats: d.seatPrices.length,
        },
        select: { id: true },
      }));

    const trip = await prisma.trip.create({
      data: {
        driverId,
        vehicleId: vehicle.id,
        originId: d.originId,
        destinationId: d.destinationId,
        departureAt: d.departureAt,
        durationMinutes: d.durationMinutes,
        seatPrices: d.seatPrices,
        pricePerSeat: Math.min(...d.seatPrices),
        totalSeats: d.seatPrices.length,
        acceptsParcels: d.acceptsParcels,
        parcelBasePrice: d.acceptsParcels ? d.parcelBasePrice ?? null : null,
      },
      select: { id: true },
    });

    // Reads are uncached (noStore) and the dashboard router.refresh()es, so no
    // revalidatePath is needed.
    return { ok: true, tripId: trip.id };
  } catch (e) {
    logError("createTrip", e);
    return actionError("حدث خطأ أثناء إضافة الرحلة. حاول مرة أخرى.", "UNKNOWN");
  }
}

/**
 * Edit an existing trip. Only the owning driver (or an admin) may edit, and
 * only while the trip is still `SCHEDULED`. Resolves the vehicle the same way
 * `createTrip` does (find-or-create by type+model) so shared vehicles are never
 * mutated. Refuses to shrink the cabin below an already-booked seat.
 */
export async function updateTrip(
  tripId: string,
  input: TripInput,
): Promise<ActionResult<{ tripId: string }>> {
  const session = await requireDriver();
  if ("ok" in session) return session;

  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const d = parsed.data;
  const driverId = session.userId;

  if (isDemoMode()) return { ok: true, tripId };

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        driverId: true,
        status: true,
        bookingSeats: { select: { seatNumber: true } },
      },
    });
    if (!trip) return actionError("الرحلة غير موجودة", "NOT_FOUND");
    if (trip.driverId !== session.userId && session.role !== "ADMIN") {
      return actionError("لا تملك صلاحية تعديل هذه الرحلة", "FORBIDDEN");
    }
    if (trip.status !== "SCHEDULED") {
      return actionError("لا يمكن تعديل رحلة غير مجدولة", "VALIDATION");
    }
    const maxBooked = trip.bookingSeats.reduce(
      (m, s) => Math.max(m, s.seatNumber),
      0,
    );
    if (d.seatPrices.length < maxBooked) {
      return actionError("عدد المقاعد أقل من مقعد محجوز بالفعل", "VALIDATION");
    }

    const vehicle =
      (await prisma.vehicle.findFirst({
        where: { driverId, type: d.vehicleType, model: d.vehicleModel },
        select: { id: true },
      })) ??
      (await prisma.vehicle.create({
        data: {
          driverId,
          type: d.vehicleType,
          model: d.vehicleModel,
          plate: d.plate?.trim() || generateReference("VH"),
          seats: d.seatPrices.length,
        },
        select: { id: true },
      }));

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        vehicleId: vehicle.id,
        originId: d.originId,
        destinationId: d.destinationId,
        departureAt: d.departureAt,
        durationMinutes: d.durationMinutes,
        seatPrices: d.seatPrices,
        pricePerSeat: Math.min(...d.seatPrices),
        totalSeats: d.seatPrices.length,
        acceptsParcels: d.acceptsParcels,
        parcelBasePrice: d.acceptsParcels ? d.parcelBasePrice ?? null : null,
      },
    });
    return { ok: true, tripId };
  } catch (e) {
    logError("updateTrip", e);
    return actionError("تعذّر حفظ تعديلات الرحلة. حاول مرة أخرى.", "UNKNOWN");
  }
}

const TRIP_STATUSES = [
  "SCHEDULED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
] as const;
type TripStatus = (typeof TRIP_STATUSES)[number];

/**
 * Change a trip's status. Only the owning driver (or an admin) may do so.
 */
export async function setTripStatus(
  tripId: string,
  status: TripStatus,
): Promise<ActionResult> {
  const session = await requireDriver();
  if ("ok" in session) return session;
  if (!TRIP_STATUSES.includes(status)) {
    return actionError("حالة غير صالحة", "VALIDATION");
  }

  if (isDemoMode()) return { ok: true };

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { driverId: true },
  });
  if (!trip) return actionError("الرحلة غير موجودة", "NOT_FOUND");
  if (trip.driverId !== session.userId && session.role !== "ADMIN") {
    return actionError("لا تملك صلاحية تعديل هذه الرحلة", "FORBIDDEN");
  }

  await prisma.trip.update({ where: { id: tripId }, data: { status } });
  return { ok: true };
}

/** Cancel a trip (owner or admin). */
export async function cancelTrip(tripId: string): Promise<ActionResult> {
  return setTripStatus(tripId, "CANCELLED");
}
