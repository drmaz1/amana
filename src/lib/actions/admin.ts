"use server";

import { isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { roleAtLeast } from "@/lib/session-token";
import { actionError, type ActionError, type ActionResult } from "./types";

async function adminGuard(): Promise<ActionError | null> {
  const s = await getSession();
  if (!s || !roleAtLeast(s.role, "ADMIN")) {
    return actionError("صلاحية المدير مطلوبة", "FORBIDDEN");
  }
  return null;
}

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
const PARCEL_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function setBookingStatus(
  id: string,
  status: (typeof BOOKING_STATUSES)[number],
): Promise<ActionResult> {
  const err = await adminGuard();
  if (err) return err;
  if (!BOOKING_STATUSES.includes(status)) {
    return actionError("حالة غير صالحة", "VALIDATION");
  }
  if (isDemoMode()) return { ok: true };
  await prisma.booking.update({ where: { id }, data: { status } });
  return { ok: true };
}

export async function setParcelStatus(
  id: string,
  status: (typeof PARCEL_STATUSES)[number],
): Promise<ActionResult> {
  const err = await adminGuard();
  if (err) return err;
  if (!PARCEL_STATUSES.includes(status)) {
    return actionError("حالة غير صالحة", "VALIDATION");
  }
  if (isDemoMode()) return { ok: true };
  await prisma.parcel.update({ where: { id }, data: { status } });
  return { ok: true };
}

const ROLES = ["PASSENGER", "DRIVER", "ADMIN"] as const;

/** Change a user's role (PASSENGER → DRIVER → ADMIN, or back). Admin only. */
export async function promoteUser(
  userId: string,
  role: (typeof ROLES)[number],
): Promise<ActionResult> {
  const err = await adminGuard();
  if (err) return err;
  if (!ROLES.includes(role)) return actionError("دور غير صالح", "VALIDATION");
  if (isDemoMode()) return { ok: true };
  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    return { ok: true };
  } catch (e) {
    console.error("promoteUser failed:", e);
    return actionError("تعذّر تحديث الدور", "UNKNOWN");
  }
}

/** Assign a parcel to a trip (or unassign with `null`). Admin only. */
export async function assignParcelToTrip(
  parcelId: string,
  tripId: string | null,
): Promise<ActionResult> {
  const err = await adminGuard();
  if (err) return err;
  if (isDemoMode()) return { ok: true };
  try {
    if (tripId) {
      // Only allow trips that accept parcels and run the parcel's exact route.
      const [parcel, trip] = await Promise.all([
        prisma.parcel.findUnique({
          where: { id: parcelId },
          select: { originId: true, destinationId: true },
        }),
        prisma.trip.findUnique({
          where: { id: tripId },
          select: {
            originId: true,
            destinationId: true,
            acceptsParcels: true,
          },
        }),
      ]);
      if (!parcel || !trip) return actionError("غير موجود", "NOT_FOUND");
      if (
        !trip.acceptsParcels ||
        trip.originId !== parcel.originId ||
        trip.destinationId !== parcel.destinationId
      ) {
        return actionError("الرحلة لا تناسب مسار الأمانة", "VALIDATION");
      }
    }
    await prisma.parcel.update({ where: { id: parcelId }, data: { tripId } });
    return { ok: true };
  } catch (e) {
    console.error("assignParcelToTrip failed:", e);
    return actionError("تعذّر ربط الأمانة بالرحلة", "UNKNOWN");
  }
}
