import { z } from "zod";

import { governorateId } from "./shared";

export const tripSchema = z
  .object({
    originId: governorateId,
    destinationId: governorateId,
    departureAt: z.coerce.date({ message: "تاريخ/وقت غير صالح" }),
    durationMinutes: z
      .number()
      .int()
      .positive()
      .max(1440, { message: "مدة غير منطقية" }),
    vehicleType: z.enum(["SEDAN", "SUV", "GMC"]),
    vehicleModel: z
      .string()
      .trim()
      .min(2, { message: "أدخل موديل المركبة" })
      .max(60),
    plate: z.string().trim().max(40).optional(),
    seatPrices: z
      .array(z.number().int().positive().max(1_000_000))
      .min(1, { message: "أضف سعراً لكل مقعد" })
      .max(20, { message: "عدد المقاعد كبير جداً" }),
    acceptsParcels: z.boolean(),
    parcelBasePrice: z.number().int().positive().max(1_000_000).optional(),
  })
  .refine((d) => d.originId !== d.destinationId, {
    message: "اختر محافظتين مختلفتين",
    path: ["destinationId"],
  });

export type TripInput = z.input<typeof tripSchema>;
export type TripData = z.output<typeof tripSchema>;
