import { z } from "zod";

import { iraqiPhone } from "./shared";

export const otpRequestSchema = z.object({
  phone: iraqiPhone,
});

export const otpVerifySchema = z.object({
  phone: iraqiPhone,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: "رمز التحقق مكوّن من ٦ أرقام" }),
});

export type OtpRequestInput = z.input<typeof otpRequestSchema>;
export type OtpVerifyInput = z.input<typeof otpVerifySchema>;
