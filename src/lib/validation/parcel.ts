import { z } from "zod";

import { governorateId, iraqiPhone, personName } from "./shared";

export const parcelSchema = z
  .object({
    originId: governorateId,
    destinationId: governorateId,
    senderName: personName,
    receiverName: personName,
    receiverPhone: iraqiPhone,
    description: z
      .string()
      .trim()
      .min(2, { message: "أدخل وصفاً للمحتوى" })
      .max(280, { message: "الوصف طويل جداً" }),
    weightKg: z.coerce
      .number()
      .positive({ message: "وزن غير صالح" })
      .max(100, { message: "الوزن كبير جداً" })
      .optional(),
  })
  .refine((d) => d.originId !== d.destinationId, {
    message: "اختر محافظتين مختلفتين للإرسال والاستلام",
    path: ["destinationId"],
  });

export type ParcelInput = z.input<typeof parcelSchema>;
export type ParcelData = z.output<typeof parcelSchema>;
