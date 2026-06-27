"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/reference";
import { tripSchema, type TripInput } from "@/lib/validation";
import { actionError, type ActionResult } from "./types";

// Demo driver (E.164) used until auth threads the real session driver (P2).
// Mirrors the resolver in src/lib/data.ts.
const DEMO_DRIVER_PHONE = "+9647701234567";

/**
 * Create a trip for the (demo) driver. Reuses one of the driver's vehicles when
 * the type+model match, otherwise registers a new vehicle (with a generated
 * placeholder plate, since the form collects none).
 */
export async function createTrip(
  input: TripInput,
): Promise<ActionResult<{ tripId: string }>> {
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const d = parsed.data;

  const driver = await prisma.user.findUnique({
    where: { phone: DEMO_DRIVER_PHONE },
    select: { id: true },
  });
  if (!driver) return actionError("لم يتم العثور على السائق", "NO_DRIVER");

  try {
    const vehicle =
      (await prisma.vehicle.findFirst({
        where: { driverId: driver.id, type: d.vehicleType, model: d.vehicleModel },
        select: { id: true },
      })) ??
      (await prisma.vehicle.create({
        data: {
          driverId: driver.id,
          type: d.vehicleType,
          model: d.vehicleModel,
          plate: d.plate?.trim() || generateReference("VH"),
          seats: d.totalSeats,
        },
        select: { id: true },
      }));

    const trip = await prisma.trip.create({
      data: {
        driverId: driver.id,
        vehicleId: vehicle.id,
        originId: d.originId,
        destinationId: d.destinationId,
        departureAt: d.departureAt,
        durationMinutes: d.durationMinutes,
        pricePerSeat: d.pricePerSeat,
        totalSeats: d.totalSeats,
        acceptsParcels: d.acceptsParcels,
        parcelBasePrice: d.acceptsParcels ? d.parcelBasePrice ?? null : null,
      },
      select: { id: true },
    });

    revalidatePath("/driver");
    revalidatePath("/");
    revalidatePath("/search");
    return { ok: true, tripId: trip.id };
  } catch (e) {
    console.error("createTrip failed:", e);
    return actionError("حدث خطأ أثناء إضافة الرحلة. حاول مرة أخرى.", "UNKNOWN");
  }
}
