import { z } from "zod";

import { VEHICLE_TYPES } from "@/lib/seats";

const VEHICLE_TYPE_VALUES = VEHICLE_TYPES as [string, ...string[]];

export const vehicleSchema = z.object({
  type: z.enum(VEHICLE_TYPE_VALUES, { message: "نوع مركبة غير معروف" }),
  model: z
    .string()
    .trim()
    .min(2, { message: "أدخل موديل المركبة" })
    .max(60, { message: "الموديل طويل جداً" }),
  plate: z
    .string()
    .trim()
    .min(2, { message: "أدخل رقم اللوحة" })
    .max(40, { message: "رقم اللوحة طويل جداً" }),
});

export type VehicleInput = z.input<typeof vehicleSchema>;
