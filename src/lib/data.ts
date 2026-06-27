import type { Booking, Driver, Parcel, Trip } from "@/types";

/**
 * MVP data layer.
 *
 * For now this returns in-memory mock data so the UI runs without a database.
 * To go live, replace each function body with a Prisma query (see prisma/schema.prisma)
 * while keeping the same return shapes — the pages won't need to change.
 */

// ---------- helpers ----------

/** Build an ISO date `dayOffset` days from now at HH:MM local time. */
function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// ---------- drivers ----------

const DRIVERS: Driver[] = [
  { id: "d1", name: "أبو علي الكناني", phone: "07701234567", rating: 4.8, tripsCount: 312 },
  { id: "d2", name: "حيدر الموسوي", phone: "07712345678", rating: 4.6, tripsCount: 178 },
  { id: "d3", name: "سيف الدليمي", phone: "07723456789", rating: 4.9, tripsCount: 421 },
  { id: "d4", name: "كاروان أحمد", phone: "07734567890", rating: 4.7, tripsCount: 256 },
];

// ---------- trips ----------

const TRIPS: Trip[] = [
  {
    id: "t1",
    driver: DRIVERS[0],
    vehicleType: "SEDAN",
    vehicleModel: "تويوتا أفالون 2019",
    plate: "بغداد ٢٢ أ ٤٥٦٧",
    originId: "baghdad",
    destinationId: "basra",
    departureAt: at(0, 7, 30),
    durationMinutes: 330,
    pricePerSeat: 25000,
    totalSeats: 4,
    bookedSeats: [1, 3],
    status: "SCHEDULED",
    acceptsParcels: true,
    parcelBasePrice: 10000,
    notes: "انطلاق من كراج علاوي الحلة. مكيّف وواي‑فاي.",
  },
  {
    id: "t2",
    driver: DRIVERS[1],
    vehicleType: "VAN",
    vehicleModel: "كيا كارنفال 2021",
    plate: "بغداد ١٤ ب ٧٨٩٠",
    originId: "baghdad",
    destinationId: "basra",
    departureAt: at(0, 9, 0),
    durationMinutes: 360,
    pricePerSeat: 20000,
    totalSeats: 7,
    bookedSeats: [2],
    status: "SCHEDULED",
    acceptsParcels: true,
    parcelBasePrice: 8000,
  },
  {
    id: "t3",
    driver: DRIVERS[2],
    vehicleType: "SEDAN",
    vehicleModel: "كيا K5 2020",
    plate: "بغداد ٣١ ج ١٢٣٤",
    originId: "baghdad",
    destinationId: "basra",
    departureAt: at(0, 14, 0),
    durationMinutes: 320,
    pricePerSeat: 30000,
    totalSeats: 4,
    bookedSeats: [],
    status: "SCHEDULED",
    acceptsParcels: false,
    notes: "سيارة خاصة سريعة، بدون توقفات.",
  },
  {
    id: "t4",
    driver: DRIVERS[3],
    vehicleType: "VAN",
    vehicleModel: "هيونداي H1 2018",
    plate: "أربيل ٢ د ٥٥٦٦",
    originId: "baghdad",
    destinationId: "erbil",
    departureAt: at(0, 8, 0),
    durationMinutes: 300,
    pricePerSeat: 22000,
    totalSeats: 7,
    bookedSeats: [1, 2, 5],
    status: "SCHEDULED",
    acceptsParcels: true,
    parcelBasePrice: 12000,
  },
  {
    id: "t5",
    driver: DRIVERS[0],
    vehicleType: "SEDAN",
    vehicleModel: "تويوتا كامري 2022",
    plate: "النجف ٥ هـ ٩٩٨٨",
    originId: "baghdad",
    destinationId: "najaf",
    departureAt: at(0, 10, 30),
    durationMinutes: 150,
    pricePerSeat: 15000,
    totalSeats: 4,
    bookedSeats: [4],
    status: "SCHEDULED",
    acceptsParcels: true,
    parcelBasePrice: 7000,
  },
  {
    id: "t6",
    driver: DRIVERS[2],
    vehicleType: "SEDAN",
    vehicleModel: "كيا K5 2020",
    plate: "بغداد ٣١ ج ١٢٣٤",
    originId: "basra",
    destinationId: "baghdad",
    departureAt: at(1, 7, 0),
    durationMinutes: 330,
    pricePerSeat: 28000,
    totalSeats: 4,
    bookedSeats: [2, 3],
    status: "SCHEDULED",
    acceptsParcels: true,
    parcelBasePrice: 10000,
  },
  {
    id: "t7",
    driver: DRIVERS[3],
    vehicleType: "VAN",
    vehicleModel: "كيا كارنفال 2021",
    plate: "كربلاء ٧ و ٢٢١١",
    originId: "karbala",
    destinationId: "baghdad",
    departureAt: at(1, 12, 0),
    durationMinutes: 120,
    pricePerSeat: 12000,
    totalSeats: 7,
    bookedSeats: [],
    status: "SCHEDULED",
    acceptsParcels: true,
    parcelBasePrice: 6000,
  },
];

// ---------- bookings (passenger + driver dashboards) ----------

const BOOKINGS: Booking[] = [
  {
    id: "b1",
    tripId: "t1",
    passengerName: "مصطفى عبد الله",
    seatNumbers: [1],
    totalPrice: 25000,
    status: "CONFIRMED",
    createdAt: at(-1, 18, 0),
  },
  {
    id: "b2",
    tripId: "t1",
    passengerName: "زينب حسن",
    seatNumbers: [3],
    totalPrice: 25000,
    status: "CONFIRMED",
    createdAt: at(-1, 20, 0),
  },
  {
    id: "b3",
    tripId: "t4",
    passengerName: "آرام رشيد",
    seatNumbers: [1, 2],
    totalPrice: 44000,
    status: "PENDING",
    createdAt: at(0, 6, 30),
  },
  {
    id: "b4",
    tripId: "t5",
    passengerName: "علي كريم",
    seatNumbers: [4],
    totalPrice: 15000,
    status: "CONFIRMED",
    createdAt: at(0, 7, 0),
  },
];

// ---------- parcels ----------

const PARCELS: Parcel[] = [
  {
    id: "p1",
    originId: "baghdad",
    destinationId: "basra",
    senderName: "حسين الطائي",
    receiverName: "ليث الطائي",
    receiverPhone: "07801112233",
    description: "وثائق وأوراق رسمية",
    price: 10000,
    status: "IN_TRANSIT",
    createdAt: at(0, 6, 0),
  },
  {
    id: "p2",
    originId: "baghdad",
    destinationId: "erbil",
    senderName: "نور محمد",
    receiverName: "دلير عمر",
    receiverPhone: "07502223344",
    description: "قطع غيار لابتوب",
    price: 12000,
    status: "REQUESTED",
    createdAt: at(0, 8, 15),
  },
  {
    id: "p3",
    originId: "najaf",
    destinationId: "baghdad",
    senderName: "كرار جبار",
    receiverName: "أحمد سالم",
    receiverPhone: "07703334455",
    description: "هدية / علبة صغيرة",
    price: 7000,
    status: "DELIVERED",
    createdAt: at(-1, 14, 0),
  },
];

// ---------- query functions (swap these for Prisma later) ----------

export async function getAllTrips(): Promise<Trip[]> {
  return TRIPS;
}

export async function searchTrips(params: {
  from?: string;
  to?: string;
}): Promise<Trip[]> {
  const { from, to } = params;
  return TRIPS.filter((t) => {
    if (from && t.originId !== from) return false;
    if (to && t.destinationId !== to) return false;
    return t.status === "SCHEDULED";
  }).sort((a, b) => a.departureAt.localeCompare(b.departureAt));
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  return TRIPS.find((t) => t.id === id);
}

export async function getBookingsForTrip(tripId: string): Promise<Booking[]> {
  return BOOKINGS.filter((b) => b.tripId === tripId);
}

/** Trips owned by a given driver (defaults to the demo driver). */
export async function getDriverTrips(driverId = "d1"): Promise<Trip[]> {
  return TRIPS.filter((t) => t.driver.id === driverId);
}

export async function getDriverBookings(driverId = "d1"): Promise<Booking[]> {
  const tripIds = new Set(
    TRIPS.filter((t) => t.driver.id === driverId).map((t) => t.id),
  );
  return BOOKINGS.filter((b) => tripIds.has(b.tripId));
}

export async function getAllBookings(): Promise<Booking[]> {
  return BOOKINGS;
}

export async function getAllParcels(): Promise<Parcel[]> {
  return PARCELS;
}

/** Popular routes for the home page, derived from trip volume. */
export async function getPopularRoutes(): Promise<
  { originId: string; destinationId: string; fromPrice: number; count: number }[]
> {
  const map = new Map<string, { fromPrice: number; count: number }>();
  for (const t of TRIPS) {
    const key = `${t.originId}>${t.destinationId}`;
    const cur = map.get(key);
    if (cur) {
      cur.count += 1;
      cur.fromPrice = Math.min(cur.fromPrice, t.pricePerSeat);
    } else {
      map.set(key, { fromPrice: t.pricePerSeat, count: 1 });
    }
  }
  return [...map.entries()]
    .map(([key, v]) => {
      const [originId, destinationId] = key.split(">");
      return { originId, destinationId, ...v };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}
