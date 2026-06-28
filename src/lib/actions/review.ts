"use server";

import { isDemoMode } from "@/lib/demo";
import { logError } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { reviewSchema, type ReviewInput } from "@/lib/validation";
import { actionError, type ActionResult } from "./types";

/**
 * A passenger rates the driver for one of their COMPLETED bookings. One review
 * per booking. On success the driver's average `rating` is recomputed and
 * stored (so the displayed rating stops being static). `tripsCount` is left
 * untouched. Optimistic no-op in demo mode.
 */
export async function createReview(
  bookingId: string,
  input: ReviewInput,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return actionError("يجب تسجيل الدخول", "UNAUTHENTICATED");

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const { rating, comment } = parsed.data;

  if (isDemoMode()) return { ok: true };

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        passengerId: true,
        status: true,
        tripId: true,
        trip: { select: { driverId: true } },
        review: { select: { id: true } },
      },
    });
    if (!booking) return actionError("الحجز غير موجود", "NOT_FOUND");
    if (booking.passengerId !== session.userId) {
      return actionError("لا تملك صلاحية تقييم هذا الحجز", "FORBIDDEN");
    }
    if (booking.status !== "COMPLETED") {
      return actionError("يمكنك التقييم بعد اكتمال الرحلة", "VALIDATION");
    }
    if (booking.review) {
      return actionError("سبق أن قيّمت هذه الرحلة", "DUPLICATE");
    }

    const driverId = booking.trip.driverId;
    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          bookingId,
          tripId: booking.tripId,
          driverId,
          passengerId: session.userId,
          rating,
          comment: comment?.trim() || null,
        },
      });
      const agg = await tx.review.aggregate({
        where: { driverId },
        _avg: { rating: true },
      });
      await tx.user.update({
        where: { id: driverId },
        data: { rating: agg._avg.rating ?? rating },
      });
    });
    return { ok: true };
  } catch (e) {
    logError("createReview", e);
    return actionError("تعذّر حفظ التقييم. حاول مرة أخرى.", "UNKNOWN");
  }
}
