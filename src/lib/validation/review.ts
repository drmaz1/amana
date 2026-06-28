import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, { message: "اختر تقييماً من ١ إلى ٥" })
    .max(5, { message: "اختر تقييماً من ١ إلى ٥" }),
  comment: z
    .string()
    .trim()
    .max(500, { message: "التعليق طويل جداً" })
    .optional(),
});

export type ReviewInput = z.input<typeof reviewSchema>;
