"use server";

import { revalidatePath } from "next/cache";

import { createBookingRecord, SeatTakenError } from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { bookingSchema, type BookingInput } from "@/lib/validation";
import { actionError, type ActionResult } from "./types";

/**
 * Create a seat booking. Validates input, prices it from the trip (never trusts
 * the client total), upserts a passenger by phone (guest account until auth),
 * then persists the booking + held seats atomically.
 */
export async function createBooking(
  input: BookingInput,
): Promise<ActionResult<{ reference: string; bookingId: string }>> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const { tripId, seats, passengerName, passengerPhone } = parsed.data;
  const seatNumbers = [...new Set(seats)].sort((a, b) => a - b);

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { status: true, pricePerSeat: true, totalSeats: true },
  });
  if (!trip) return actionError("الرحلة غير موجودة", "NOT_FOUND");
  if (trip.status !== "SCHEDULED") {
    return actionError("لا يمكن الحجز على هذه الرحلة الآن", "TRIP_CLOSED");
  }
  if (seatNumbers.some((n) => n < 1 || n > trip.totalSeats)) {
    return actionError("رقم مقعد غير صالح", "BAD_SEAT");
  }

  // Guest account keyed by phone; replaced by the session user once auth lands.
  const passenger = await prisma.user.upsert({
    where: { phone: passengerPhone },
    create: { name: passengerName, phone: passengerPhone, role: "PASSENGER" },
    update: {},
    select: { id: true },
  });

  try {
    const booking = await createBookingRecord({
      tripId,
      passengerId: passenger.id,
      seatNumbers,
      totalPrice: seatNumbers.length * trip.pricePerSeat,
      status: "CONFIRMED",
    });
    revalidatePath(`/trips/${tripId}`);
    revalidatePath(`/trips/${tripId}/seats`);
    revalidatePath("/driver");
    revalidatePath("/admin");
    return { ok: true, reference: booking.reference, bookingId: booking.id };
  } catch (e) {
    if (e instanceof SeatTakenError) {
      return actionError(
        "عذراً، أحد المقاعد المختارة حُجز للتو. اختر مقاعد أخرى.",
        "SEAT_TAKEN",
      );
    }
    console.error("createBooking failed:", e);
    return actionError(
      "حدث خطأ غير متوقع أثناء الحجز. حاول مرة أخرى.",
      "UNKNOWN",
    );
  }
}
