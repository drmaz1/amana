import { Prisma, type PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { generateReference } from "@/lib/reference";

/** Thrown when one or more requested seats are already held on the trip. */
export class SeatTakenError extends Error {
  constructor() {
    super("SEAT_TAKEN");
    this.name = "SeatTakenError";
  }
}

type Client = PrismaClient | Prisma.TransactionClient;

export type CreateBookingParams = {
  tripId: string;
  passengerId: string;
  seatNumbers: number[];
  totalPrice: number;
  status?: "PENDING" | "CONFIRMED";
  /** Injectable for tests; defaults to the app Prisma singleton. */
  client?: PrismaClient;
};

/**
 * Atomically create a booking and hold its seats.
 *
 * The whole insert runs inside a single transaction, so the `BookingSeat`
 * `@@unique([tripId, seatNumber])` constraint makes double-booking impossible:
 * if any seat is already taken the transaction rolls back and a
 * {@link SeatTakenError} is thrown — no partial booking is ever persisted. A
 * (astronomically rare) reference collision is retried with a fresh code.
 */
export async function createBookingRecord(
  params: CreateBookingParams,
): Promise<{ id: string; reference: string }> {
  const {
    tripId,
    passengerId,
    seatNumbers,
    totalPrice,
    status = "CONFIRMED",
    client = prisma,
  } = params;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await client.$transaction(async (tx: Client) =>
        tx.booking.create({
          data: {
            reference: generateReference("AMN"),
            tripId,
            passengerId,
            seatNumbers,
            totalPrice,
            status,
            bookingSeats: {
              create: seatNumbers.map((seatNumber) => ({ tripId, seatNumber })),
            },
          },
          select: { id: true, reference: true },
        }),
      );
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        const target = Array.isArray(e.meta?.target)
          ? (e.meta.target as string[]).join(",")
          : String(e.meta?.target ?? "");
        if (target.includes("seatNumber") || target.includes("BookingSeat")) {
          throw new SeatTakenError();
        }
        if (target.includes("reference")) continue; // collision — retry
      }
      throw e;
    }
  }
  throw new Error("could not allocate a unique booking reference");
}
