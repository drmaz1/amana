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
