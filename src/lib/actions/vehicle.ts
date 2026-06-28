"use server";

import { isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { seatsForVehicle } from "@/lib/seats";
import { getSession } from "@/lib/session";
import { roleAtLeast, type SessionPayload } from "@/lib/session-token";
import {
  vehicleSchema,
  type VehicleInput,
} from "@/lib/validation";
import type { VehicleType } from "@/types";
import { actionError, type ActionError, type ActionResult } from "./types";

async function requireDriver(): Promise<SessionPayload | ActionError> {
  const session = await getSession();
  if (!session || !roleAtLeast(session.role, "DRIVER")) {
    return actionError("يجب تسجيل الدخول كسائق", "FORBIDDEN");
  }
  return session;
}

function validate(input: VehicleInput) {
  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: actionError(
        parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
        "VALIDATION",
      ),
    };
  }
  return { data: parsed.data };
}

/** Register a new vehicle for the signed-in driver. */
export async function createVehicle(
  input: VehicleInput,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireDriver();
  if ("ok" in session) return session;

  const { data, error } = validate(input);
  if (error) return error;

  if (isDemoMode()) return { ok: true, id: "demo-vehicle" };

  try {
    const v = await prisma.vehicle.create({
      data: {
        driverId: session.userId,
        type: data.type as VehicleType,
        model: data.model,
        plate: data.plate,
        seats: seatsForVehicle(data.type as VehicleType),
      },
      select: { id: true },
    });
    return { ok: true, id: v.id };
  } catch (e) {
    if (isUniquePlate(e)) {
      return actionError("رقم اللوحة مستخدم بالفعل", "DUPLICATE");
    }
    console.error("createVehicle failed:", e);
    return actionError("تعذّر حفظ المركبة. حاول مرة أخرى.", "UNKNOWN");
  }
}

/** Edit one of the signed-in driver's vehicles. */
export async function updateVehicle(
  id: string,
  input: VehicleInput,
): Promise<ActionResult> {
  const session = await requireDriver();
  if ("ok" in session) return session;

  const { data, error } = validate(input);
  if (error) return error;

  if (isDemoMode()) return { ok: true };

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { driverId: true },
    });
    if (!vehicle) return actionError("المركبة غير موجودة", "NOT_FOUND");
    if (vehicle.driverId !== session.userId && session.role !== "ADMIN") {
      return actionError("لا تملك صلاحية تعديل هذه المركبة", "FORBIDDEN");
    }
    await prisma.vehicle.update({
      where: { id },
      data: {
        type: data.type as VehicleType,
        model: data.model,
        plate: data.plate,
        seats: seatsForVehicle(data.type as VehicleType),
      },
    });
    return { ok: true };
  } catch (e) {
    if (isUniquePlate(e)) {
      return actionError("رقم اللوحة مستخدم بالفعل", "DUPLICATE");
    }
    console.error("updateVehicle failed:", e);
    return actionError("تعذّر حفظ المركبة. حاول مرة أخرى.", "UNKNOWN");
  }
}

function isUniquePlate(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}
