import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createBookingRecord, SeatTakenError } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

/**
 * Integration test for the double-booking guard. Requires a reachable Postgres
 * with migrations applied; self-skips otherwise so `npm test` stays green in
 * environments without a database (CI provisions one — see the workflow).
 */

const PHONES = ["+9647000000001", "+9647000000002", "+9647000000003"];
let dbReady = false;
let tripId = "";
let p1 = "";
let p2 = "";

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbReady = true;
  } catch {
    dbReady = false;
    return;
  }

  // Clean any leftovers from a previous run, then build an isolated trip.
  await prisma.user.deleteMany({ where: { phone: { in: PHONES } } });

  const driver = await prisma.user.create({
    data: {
      name: "سائق اختبار",
      phone: PHONES[0],
      role: "DRIVER",
      vehicles: {
        create: {
          type: "SEDAN",
          model: "Test Car",
          plate: `TEST-${Date.now()}`,
          seats: 4,
        },
      },
    },
    include: { vehicles: true },
  });
  const trip = await prisma.trip.create({
    data: {
      driverId: driver.id,
      vehicleId: driver.vehicles[0].id,
      originId: "baghdad",
      destinationId: "basra",
      departureAt: new Date(Date.now() + 86_400_000),
      durationMinutes: 300,
      pricePerSeat: 25_000,
      totalSeats: 4,
    },
  });
  tripId = trip.id;
  p1 = (await prisma.user.create({ data: { name: "راكب ١", phone: PHONES[1] } })).id;
  p2 = (await prisma.user.create({ data: { name: "راكب ٢", phone: PHONES[2] } })).id;
});

afterAll(async () => {
  if (dbReady && tripId) {
    await prisma.trip.deleteMany({ where: { id: tripId } }); // cascades bookings + seats
    await prisma.user.deleteMany({ where: { phone: { in: PHONES } } });
  }
  await prisma.$disconnect();
});

describe("createBookingRecord — seat integrity", () => {
  it("lets exactly one of two concurrent bookings win the same seat", async (ctx) => {
    if (!dbReady) return ctx.skip();
    const seat = 2;

    const results = await Promise.allSettled([
      createBookingRecord({ tripId, passengerId: p1, seatNumbers: [seat], totalPrice: 25_000 }),
      createBookingRecord({ tripId, passengerId: p2, seatNumbers: [seat], totalPrice: 25_000 }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(SeatTakenError);

    const held = await prisma.bookingSeat.count({
      where: { tripId, seatNumber: seat },
    });
    expect(held).toBe(1);
  });

  it("rejects booking a seat that is already held", async (ctx) => {
    if (!dbReady) return ctx.skip();
    await createBookingRecord({ tripId, passengerId: p1, seatNumbers: [1], totalPrice: 25_000 });
    await expect(
      createBookingRecord({ tripId, passengerId: p2, seatNumbers: [1], totalPrice: 25_000 }),
    ).rejects.toBeInstanceOf(SeatTakenError);
  });

  it("allows concurrent bookings for different seats", async (ctx) => {
    if (!dbReady) return ctx.skip();
    const [r1, r2] = await Promise.all([
      createBookingRecord({ tripId, passengerId: p1, seatNumbers: [3], totalPrice: 25_000 }),
      createBookingRecord({ tripId, passengerId: p2, seatNumbers: [4], totalPrice: 25_000 }),
    ]);
    expect(r1.reference).toMatch(/^AMN-/);
    expect(r2.reference).toMatch(/^AMN-/);
  });
});
