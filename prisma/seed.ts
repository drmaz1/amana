import { PrismaClient } from "@prisma/client";

import { generateReference } from "../src/lib/reference";
import { suggestSeatPrices } from "../src/lib/seats";

const prisma = new PrismaClient();

/** Build a Date `dayOffset` days from now at HH:MM local time. */
function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** Per-seat pricing + derived fields from a base (window) price. */
function priced(type: "SEDAN" | "SUV" | "GMC", base: number) {
  const seatPrices = suggestSeatPrices(type, base);
  return {
    seatPrices,
    pricePerSeat: Math.min(...seatPrices),
    totalSeats: seatPrices.length,
  };
}

const sumSeats = (seatPrices: number[], seats: number[]) =>
  seats.reduce((s, n) => s + (seatPrices[n - 1] ?? 0), 0);

async function main() {
  console.log("🌱 Seeding Amana database…");

  // Clean slate (respect FK order).
  await prisma.otpCode.deleteMany();
  await prisma.review.deleteMany();
  await prisma.bookingSeat.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Admin ----------
  await prisma.user.create({
    data: { name: "مدير المنصة", phone: "+9647900000000", role: "ADMIN" },
  });

  // ---------- Drivers (+ one vehicle each) ----------
  const d1 = await prisma.user.create({
    data: {
      name: "أبو علي الكناني",
      phone: "+9647701234567",
      role: "DRIVER",
      rating: 4.8,
      tripsCount: 312,
      vehicles: {
        create: { type: "SEDAN", model: "تويوتا أفالون 2019", plate: "بغداد ٢٢ أ ٤٥٦٧", seats: 4 },
      },
    },
    include: { vehicles: true },
  });
  const d2 = await prisma.user.create({
    data: {
      name: "حيدر الموسوي",
      phone: "+9647712345678",
      role: "DRIVER",
      rating: 4.6,
      tripsCount: 178,
      vehicles: {
        create: { type: "SUV", model: "دودج دورانكو 2021", plate: "بغداد ١٤ ب ٧٨٩٠", seats: 6 },
      },
    },
    include: { vehicles: true },
  });
  const d3 = await prisma.user.create({
    data: {
      name: "سيف الدليمي",
      phone: "+9647723456789",
      role: "DRIVER",
      rating: 4.9,
      tripsCount: 421,
      vehicles: {
        create: { type: "SEDAN", model: "كيا K5 2020", plate: "بغداد ٣١ ج ١٢٣٤", seats: 4 },
      },
    },
    include: { vehicles: true },
  });
  const d4 = await prisma.user.create({
    data: {
      name: "كاروان أحمد",
      phone: "+9647734567890",
      role: "DRIVER",
      rating: 4.7,
      tripsCount: 256,
      vehicles: {
        create: { type: "GMC", model: "جمس سوبربان 2019", plate: "أربيل ٢ د ٥٥٦٦", seats: 7 },
      },
    },
    include: { vehicles: true },
  });

  const v1 = d1.vehicles[0];
  const v2 = d2.vehicles[0];
  const v3 = d3.vehicles[0];
  const v4 = d4.vehicles[0];

  // ---------- Passengers ----------
  const mk = (name: string, phone: string) =>
    prisma.user.create({ data: { name, phone } });
  const mustafa = await mk("مصطفى عبد الله", "+9647810000001");
  const zainab = await mk("زينب حسن", "+9647810000002");
  const aram = await mk("آرام رشيد", "+9647810000003");
  const ali = await mk("علي كريم", "+9647810000004");
  const hussein = await mk("حسين الطائي", "+9647820000001");
  const noor = await mk("نور محمد", "+9647820000002");
  const karrar = await mk("كرار جبار", "+9647820000003");

  // ---------- Trips ----------
  const p1 = priced("SEDAN", 25000);
  const t1 = await prisma.trip.create({
    data: {
      driverId: d1.id, vehicleId: v1.id, originId: "baghdad", destinationId: "basra",
      departureAt: at(0, 7, 30), durationMinutes: 330, ...p1,
      acceptsParcels: true, parcelBasePrice: 10000,
      notes: "انطلاق من كراج علاوي الحلة. مكيّف وواي‑فاي.",
    },
  });

  const p2 = priced("SUV", 20000);
  const t2 = await prisma.trip.create({
    data: {
      driverId: d2.id, vehicleId: v2.id, originId: "baghdad", destinationId: "basra",
      departureAt: at(0, 9, 0), durationMinutes: 360, ...p2,
      acceptsParcels: true, parcelBasePrice: 8000,
    },
  });

  const p3 = priced("SEDAN", 30000);
  await prisma.trip.create({
    data: {
      driverId: d3.id, vehicleId: v3.id, originId: "baghdad", destinationId: "basra",
      departureAt: at(0, 14, 0), durationMinutes: 320, ...p3,
      acceptsParcels: false, notes: "سيارة خاصة سريعة، بدون توقفات.",
    },
  });

  const p4 = priced("GMC", 22000);
  const t4 = await prisma.trip.create({
    data: {
      driverId: d4.id, vehicleId: v4.id, originId: "baghdad", destinationId: "erbil",
      departureAt: at(0, 8, 0), durationMinutes: 300, ...p4,
      acceptsParcels: true, parcelBasePrice: 12000,
    },
  });

  const p5 = priced("SEDAN", 15000);
  const t5 = await prisma.trip.create({
    data: {
      driverId: d1.id, vehicleId: v1.id, originId: "baghdad", destinationId: "najaf",
      departureAt: at(0, 10, 30), durationMinutes: 150, ...p5,
      acceptsParcels: true, parcelBasePrice: 7000,
    },
  });

  await prisma.trip.create({
    data: {
      driverId: d3.id, vehicleId: v3.id, originId: "basra", destinationId: "baghdad",
      departureAt: at(1, 7, 0), durationMinutes: 330, ...priced("SEDAN", 28000),
      acceptsParcels: true, parcelBasePrice: 10000,
    },
  });

  await prisma.trip.create({
    data: {
      driverId: d4.id, vehicleId: v4.id, originId: "karbala", destinationId: "baghdad",
      departureAt: at(1, 12, 0), durationMinutes: 120, ...priced("GMC", 12000),
      acceptsParcels: true, parcelBasePrice: 6000,
    },
  });

  // A past, completed trip so reviews + the "rate the driver" flow have data.
  const p8 = priced("SEDAN", 15000);
  const t8 = await prisma.trip.create({
    data: {
      driverId: d1.id, vehicleId: v1.id, originId: "baghdad", destinationId: "najaf",
      departureAt: at(-2, 9, 0), durationMinutes: 150, ...p8, status: "COMPLETED",
      acceptsParcels: true, parcelBasePrice: 7000,
    },
  });

  // ---------- Bookings (+ held seats); totals from per-seat prices ----------
  const book = (
    tripId: string,
    passengerId: string,
    seats: number[],
    seatPrices: number[],
    status: "CONFIRMED" | "PENDING" | "COMPLETED",
  ) =>
    prisma.booking.create({
      data: {
        reference: generateReference("AMN"),
        tripId,
        passengerId,
        seatNumbers: seats,
        totalPrice: sumSeats(seatPrices, seats),
        status,
        bookingSeats: { create: seats.map((seatNumber) => ({ tripId, seatNumber })) },
      },
    });

  await book(t1.id, mustafa.id, [1], p1.seatPrices, "CONFIRMED");
  await book(t1.id, zainab.id, [3], p1.seatPrices, "CONFIRMED");
  await book(t4.id, aram.id, [1, 2], p4.seatPrices, "PENDING");
  await book(t5.id, ali.id, [4], p5.seatPrices, "CONFIRMED");

  // Completed bookings on t8: one already reviewed, one left to rate.
  const doneReviewed = await book(t8.id, zainab.id, [1], p8.seatPrices, "COMPLETED");
  await book(t8.id, mustafa.id, [2], p8.seatPrices, "COMPLETED");
  await prisma.review.create({
    data: {
      bookingId: doneReviewed.id,
      tripId: t8.id,
      driverId: d1.id,
      passengerId: zainab.id,
      rating: 5,
      comment: "سائق محترم وملتزم بالمواعيد، السيارة نظيفة ومريحة.",
    },
  });

  // ---------- Parcels ----------
  await prisma.parcel.create({
    data: {
      reference: generateReference("PKG"), tripId: t1.id, senderId: hussein.id,
      originId: "baghdad", destinationId: "basra", receiverName: "ليث الطائي",
      receiverPhone: "+9647801112233", description: "وثائق وأوراق رسمية",
      weightKg: 0.5, price: 10000, status: "IN_TRANSIT",
    },
  });
  await prisma.parcel.create({
    data: {
      reference: generateReference("PKG"), senderId: noor.id,
      originId: "baghdad", destinationId: "erbil", receiverName: "دلير عمر",
      receiverPhone: "+9647502223344", description: "قطع غيار لابتوب",
      weightKg: 2, price: 12000, status: "REQUESTED",
    },
  });
  await prisma.parcel.create({
    data: {
      reference: generateReference("PKG"), senderId: karrar.id,
      originId: "najaf", destinationId: "baghdad", receiverName: "أحمد سالم",
      receiverPhone: "+9647703334455", description: "هدية / علبة صغيرة",
      weightKg: 1, price: 7000, status: "DELIVERED",
    },
  });

  const [users, trips, bookings, seats, parcels] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.booking.count(),
    prisma.bookingSeat.count(),
    prisma.parcel.count(),
  ]);
  console.log(
    `✅ Done — ${users} users, ${trips} trips, ${bookings} bookings, ${seats} seats, ${parcels} parcels.`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
