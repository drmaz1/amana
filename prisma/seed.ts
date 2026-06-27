import { PrismaClient } from "@prisma/client";

import { generateReference } from "../src/lib/reference";

const prisma = new PrismaClient();

/** Build a Date `dayOffset` days from now at HH:MM local time. */
function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding Amana database…");

  // Clean slate (respect FK order: seats/parcels/bookings → trips → vehicles → users).
  await prisma.bookingSeat.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Admin ----------
  await prisma.user.create({
    data: { name: "مدير المنصة", phone: "07900000000", role: "ADMIN" },
  });

  // ---------- Drivers (+ one vehicle each) ----------
  const d1 = await prisma.user.create({
    data: {
      name: "أبو علي الكناني",
      phone: "07701234567",
      role: "DRIVER",
      rating: 4.8,
      tripsCount: 312,
      vehicles: {
        create: {
          type: "SEDAN",
          model: "تويوتا أفالون 2019",
          plate: "بغداد ٢٢ أ ٤٥٦٧",
          seats: 4,
        },
      },
    },
    include: { vehicles: true },
  });

  const d2 = await prisma.user.create({
    data: {
      name: "حيدر الموسوي",
      phone: "07712345678",
      role: "DRIVER",
      rating: 4.6,
      tripsCount: 178,
      vehicles: {
        create: {
          type: "VAN",
          model: "كيا كارنفال 2021",
          plate: "بغداد ١٤ ب ٧٨٩٠",
          seats: 7,
        },
      },
    },
    include: { vehicles: true },
  });

  const d3 = await prisma.user.create({
    data: {
      name: "سيف الدليمي",
      phone: "07723456789",
      role: "DRIVER",
      rating: 4.9,
      tripsCount: 421,
      vehicles: {
        create: {
          type: "SEDAN",
          model: "كيا K5 2020",
          plate: "بغداد ٣١ ج ١٢٣٤",
          seats: 4,
        },
      },
    },
    include: { vehicles: true },
  });

  const d4 = await prisma.user.create({
    data: {
      name: "كاروان أحمد",
      phone: "07734567890",
      role: "DRIVER",
      rating: 4.7,
      tripsCount: 256,
      vehicles: {
        create: {
          type: "VAN",
          model: "هيونداي H1 2018",
          plate: "أربيل ٢ د ٥٥٦٦",
          seats: 7,
        },
      },
    },
    include: { vehicles: true },
  });

  const v1 = d1.vehicles[0];
  const v2 = d2.vehicles[0];
  const v3 = d3.vehicles[0];
  const v4 = d4.vehicles[0];

  // ---------- Passengers ----------
  const mustafa = await prisma.user.create({
    data: { name: "مصطفى عبد الله", phone: "07810000001" },
  });
  const zainab = await prisma.user.create({
    data: { name: "زينب حسن", phone: "07810000002" },
  });
  const aram = await prisma.user.create({
    data: { name: "آرام رشيد", phone: "07810000003" },
  });
  const ali = await prisma.user.create({
    data: { name: "علي كريم", phone: "07810000004" },
  });
  const hussein = await prisma.user.create({
    data: { name: "حسين الطائي", phone: "07820000001" },
  });
  const noor = await prisma.user.create({
    data: { name: "نور محمد", phone: "07820000002" },
  });
  const karrar = await prisma.user.create({
    data: { name: "كرار جبار", phone: "07820000003" },
  });

  // ---------- Trips ----------
  const t1 = await prisma.trip.create({
    data: {
      driverId: d1.id,
      vehicleId: v1.id,
      originId: "baghdad",
      destinationId: "basra",
      departureAt: at(0, 7, 30),
      durationMinutes: 330,
      pricePerSeat: 25000,
      totalSeats: 4,
      acceptsParcels: true,
      parcelBasePrice: 10000,
      notes: "انطلاق من كراج علاوي الحلة. مكيّف وواي‑فاي.",
    },
  });

  await prisma.trip.create({
    data: {
      driverId: d2.id,
      vehicleId: v2.id,
      originId: "baghdad",
      destinationId: "basra",
      departureAt: at(0, 9, 0),
      durationMinutes: 360,
      pricePerSeat: 20000,
      totalSeats: 7,
      acceptsParcels: true,
      parcelBasePrice: 8000,
    },
  });

  await prisma.trip.create({
    data: {
      driverId: d3.id,
      vehicleId: v3.id,
      originId: "baghdad",
      destinationId: "basra",
      departureAt: at(0, 14, 0),
      durationMinutes: 320,
      pricePerSeat: 30000,
      totalSeats: 4,
      acceptsParcels: false,
      notes: "سيارة خاصة سريعة، بدون توقفات.",
    },
  });

  const t4 = await prisma.trip.create({
    data: {
      driverId: d4.id,
      vehicleId: v4.id,
      originId: "baghdad",
      destinationId: "erbil",
      departureAt: at(0, 8, 0),
      durationMinutes: 300,
      pricePerSeat: 22000,
      totalSeats: 7,
      acceptsParcels: true,
      parcelBasePrice: 12000,
    },
  });

  const t5 = await prisma.trip.create({
    data: {
      driverId: d1.id,
      vehicleId: v1.id,
      originId: "baghdad",
      destinationId: "najaf",
      departureAt: at(0, 10, 30),
      durationMinutes: 150,
      pricePerSeat: 15000,
      totalSeats: 4,
      acceptsParcels: true,
      parcelBasePrice: 7000,
    },
  });

  await prisma.trip.create({
    data: {
      driverId: d3.id,
      vehicleId: v3.id,
      originId: "basra",
      destinationId: "baghdad",
      departureAt: at(1, 7, 0),
      durationMinutes: 330,
      pricePerSeat: 28000,
      totalSeats: 4,
      acceptsParcels: true,
      parcelBasePrice: 10000,
    },
  });

  await prisma.trip.create({
    data: {
      driverId: d4.id,
      vehicleId: v4.id,
      originId: "karbala",
      destinationId: "baghdad",
      departureAt: at(1, 12, 0),
      durationMinutes: 120,
      pricePerSeat: 12000,
      totalSeats: 7,
      acceptsParcels: true,
      parcelBasePrice: 6000,
    },
  });

  // ---------- Bookings (+ their held seats) ----------
  // BookingSeat is the source of truth for availability, so every booked seat
  // is created here alongside the booking. `seatNumbers` is the denormalized
  // display copy.
  await prisma.booking.create({
    data: {
      reference: generateReference("AMN"),
      tripId: t1.id,
      passengerId: mustafa.id,
      seatNumbers: [1],
      totalPrice: 25000,
      status: "CONFIRMED",
      bookingSeats: { create: [{ tripId: t1.id, seatNumber: 1 }] },
    },
  });
  await prisma.booking.create({
    data: {
      reference: generateReference("AMN"),
      tripId: t1.id,
      passengerId: zainab.id,
      seatNumbers: [3],
      totalPrice: 25000,
      status: "CONFIRMED",
      bookingSeats: { create: [{ tripId: t1.id, seatNumber: 3 }] },
    },
  });
  await prisma.booking.create({
    data: {
      reference: generateReference("AMN"),
      tripId: t4.id,
      passengerId: aram.id,
      seatNumbers: [1, 2],
      totalPrice: 44000,
      status: "PENDING",
      bookingSeats: {
        create: [
          { tripId: t4.id, seatNumber: 1 },
          { tripId: t4.id, seatNumber: 2 },
        ],
      },
    },
  });
  await prisma.booking.create({
    data: {
      reference: generateReference("AMN"),
      tripId: t5.id,
      passengerId: ali.id,
      seatNumbers: [4],
      totalPrice: 15000,
      status: "CONFIRMED",
      bookingSeats: { create: [{ tripId: t5.id, seatNumber: 4 }] },
    },
  });

  // ---------- Parcels ----------
  await prisma.parcel.create({
    data: {
      reference: generateReference("PKG"),
      tripId: t1.id,
      senderId: hussein.id,
      originId: "baghdad",
      destinationId: "basra",
      receiverName: "ليث الطائي",
      receiverPhone: "07801112233",
      description: "وثائق وأوراق رسمية",
      weightKg: 0.5,
      price: 10000,
      status: "IN_TRANSIT",
    },
  });

  await prisma.parcel.create({
    data: {
      reference: generateReference("PKG"),
      senderId: noor.id,
      originId: "baghdad",
      destinationId: "erbil",
      receiverName: "دلير عمر",
      receiverPhone: "07502223344",
      description: "قطع غيار لابتوب",
      weightKg: 2,
      price: 12000,
      status: "REQUESTED",
    },
  });

  await prisma.parcel.create({
    data: {
      reference: generateReference("PKG"),
      senderId: karrar.id,
      originId: "najaf",
      destinationId: "baghdad",
      receiverName: "أحمد سالم",
      receiverPhone: "07703334455",
      description: "هدية / علبة صغيرة",
      weightKg: 1,
      price: 7000,
      status: "DELIVERED",
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
