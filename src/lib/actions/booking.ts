"use server";

import { createBookingRecord, SeatTakenError } from "@/lib/booking";
import { demoReference, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
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

  if (isDemoMode()) {
    return { ok: true, reference: demoReference("AMN"), bookingId: "demo" };
  }

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

  // Logged-in users own the booking; guests get an account keyed by phone.
  const session = await getSession();
  let passengerId: string;
  if (session) {
    passengerId = session.userId;
  } else {
    const passenger = await prisma.user.upsert({
      where: { phone: passengerPhone },
      create: { name: passengerName, phone: passengerPhone, role: "PASSENGER" },
      update: {},
      select: { id: true },
    });
    passengerId = passenger.id;
  }

  try {
    const booking = await createBookingRecord({
      tripId,
      passengerId,
      seatNumbers,
      totalPrice: seatNumbers.length * trip.pricePerSeat,
      status: "CONFIRMED",
    });
    // No revalidatePath needed: every read goes through the data layer's
    // noStore() queries, so trip/seat/driver/admin pages already render fresh
    // on each request. (Calling revalidatePath here would refresh the current
    // route and remount this form, dropping the success state.)
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
