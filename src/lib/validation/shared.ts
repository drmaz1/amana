import { z } from "zod";

import { GOVERNORATES } from "@/lib/governorates";
import { isValidIraqiPhone, toE164 } from "@/lib/phone";

const GOV_IDS = GOVERNORATES.map((g) => g.id) as [string, ...string[]];

/** A known Iraqi governorate id (e.g. "baghdad"). */
export const governorateId = z.enum(GOV_IDS, { message: "محافظة غير معروفة" });

/**
 * An Iraqi mobile number in any accepted form, normalized to canonical E.164
 * (`+9647XXXXXXXXX`) on success.
 */
export const iraqiPhone = z
  .string()
  .trim()
  .refine(isValidIraqiPhone, {
    message: "رقم هاتف عراقي غير صالح (مثال: 07XXXXXXXXX)",
  })
  .transform((v) => toE164(v) as string);

/** Trimmed person name, 2–60 chars. */
export const personName = z
  .string()
  .trim()
  .min(2, { message: "الاسم قصير جداً" })
  .max(60, { message: "الاسم طويل جداً" });
