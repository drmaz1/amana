import { z } from "zod";

import { iraqiPhone, personName } from "./shared";

export const bookingSchema = z.object({
  tripId: z.string().min(1, { message: "رحلة غير محددة" }),
  seats: z
    .array(z.number().int().positive())
    .min(1, { message: "اختر مقعداً واحداً على الأقل" })
    .max(10, { message: "عدد المقاعد كبير جداً" }),
  passengerName: personName,
  passengerPhone: iraqiPhone,
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingData = z.output<typeof bookingSchema>;
