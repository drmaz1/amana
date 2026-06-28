import { unstable_noStore as noStore } from "next/cache";

import { demoData } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import type { Booking, Parcel, Trip } from "@/types";

/**
 * Read layer. Every page/route reads through these functions; they return the
 * exact view shapes in `@/types` so pages need no changes. Writes go through
 * server actions (`@/lib/actions`), never here.
 *
 * `noStore()` opts each read out of Next's full-route cache so pages always
 * reflect current DB state (seat availability, new trips, status changes)
 * without the pages having to declare `dynamic`/`revalidate` themselves.
 */

// Phone (E.164) of the demo driver (أبو علي الكناني) used when no driver is
// supplied. Replaced by the authenticated driver once sessions exist (P2).
const DEMO_DRIVER_PHONE = "+9647701234567";

// What every trip query needs to build the `Trip` view shape.
const tripInclude = {
  driver: true,
  vehicle: true,
  bookingSeats: { select: { seatNumber: true } },
} as const;

type TripRow = {
  id: string;
  driver: { id: string; name: string; phone: string; rating: number | null; tripsCount: number };
  vehicle: { type: "SEDAN" | "SUV" | "GMC"; model: string; plate: string };
  originId: string;
  destinationId: string;
  departureAt: Date;
  durationMinutes: number | null;
  pricePerSeat: number;
  seatPrices: number[];
  totalSeats: number;
  status: Trip["status"];
  acceptsParcels: boolean;
  parcelBasePrice: number | null;
  notes: string | null;
  bookingSeats: { seatNumber: number }[];
};

function toTrip(t: TripRow): Trip {
  return {
    id: t.id,
    driver: {
      id: t.driver.id,
      name: t.driver.name,
      phone: t.driver.phone,
      rating: t.driver.rating ?? 0,
      tripsCount: t.driver.tripsCount,
    },
    vehicleType: t.vehicle.type,
    vehicleModel: t.vehicle.model,
    plate: t.vehicle.plate,
    originId: t.originId,
    destinationId: t.destinationId,
    departureAt: t.departureAt.toISOString(),
    durationMinutes: t.durationMinutes ?? 0,
    pricePerSeat: t.pricePerSeat,
    seatPrices: t.seatPrices,
    totalSeats: t.totalSeats,
    bookedSeats: t.bookingSeats.map((s) => s.seatNumber).sort((a, b) => a - b),
    status: t.status,
    acceptsParcels: t.acceptsParcels,
    parcelBasePrice: t.parcelBasePrice ?? undefined,
    notes: t.notes ?? undefined,
  };
}

type BookingRow = {
  id: string;
  tripId: string;
  passenger: { name: string };
  seatNumbers: number[];
  totalPrice: number;
  status: Booking["status"];
  createdAt: Date;
};

function toBooking(b: BookingRow): Booking {
  return {
    id: b.id,
    tripId: b.tripId,
    passengerName: b.passenger.name,
    seatNumbers: b.seatNumbers,
    totalPrice: b.totalPrice,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  };
}

type ParcelRow = {
  id: string;
  originId: string;
  destinationId: string;
  sender: { name: string } | null;
  senderName: string | null;
  receiverName: string;
  receiverPhone: string;
  description: string;
  price: number;
  status: Parcel["status"];
  createdAt: Date;
};

function toParcel(p: ParcelRow): Parcel {
  return {
    id: p.id,
    originId: p.originId,
    destinationId: p.destinationId,
    senderName: p.sender?.name ?? p.senderName ?? "",
    receiverName: p.receiverName,
    receiverPhone: p.receiverPhone,
    description: p.description,
    price: p.price,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Resolve the driver whose dashboard we show when none is supplied. */
async function resolveDriverId(driverId?: string): Promise<string | null> {
  if (driverId) return driverId;
  const demo = await prisma.user.findUnique({
    where: { phone: DEMO_DRIVER_PHONE },
    select: { id: true },
  });
  return demo?.id ?? null;
}

// ---------- query functions ----------

export async function getAllTrips(): Promise<Trip[]> {
  noStore();
  if (isDemoMode()) return demoData.allTrips();
  const trips = await prisma.trip.findMany({
    include: tripInclude,
    orderBy: { departureAt: "asc" },
  });
  return trips.map(toTrip);
}

export async function searchTrips(params: {
  from?: string;
  to?: string;
}): Promise<Trip[]> {
  noStore();
  if (isDemoMode()) return demoData.search(params);
  const { from, to } = params;
  const trips = await prisma.trip.findMany({
    where: {
      status: "SCHEDULED",
      ...(from ? { originId: from } : {}),
      ...(to ? { destinationId: to } : {}),
    },
    include: tripInclude,
    orderBy: { departureAt: "asc" },
  });
  return trips.map(toTrip);
}

export async function getTrip(id: string): Promise<Trip | undefined> {
  noStore();
  if (isDemoMode()) return demoData.trip(id);
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: tripInclude,
  });
  return trip ? toTrip(trip) : undefined;
}

export async function getBookingsForTrip(tripId: string): Promise<Booking[]> {
  noStore();
  if (isDemoMode()) return demoData.bookingsForTrip(tripId);
  const bookings = await prisma.booking.findMany({
    where: { tripId },
    include: { passenger: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return bookings.map(toBooking);
}

/** Trips owned by a given driver (defaults to the demo driver). */
export async function getDriverTrips(driverId?: string): Promise<Trip[]> {
  noStore();
  if (isDemoMode()) return demoData.driverTrips();
  const id = await resolveDriverId(driverId);
  if (!id) return [];
  const trips = await prisma.trip.findMany({
    where: { driverId: id },
    include: tripInclude,
    orderBy: { departureAt: "asc" },
  });
  return trips.map(toTrip);
}

export async function getDriverBookings(driverId?: string): Promise<Booking[]> {
  noStore();
  if (isDemoMode()) return demoData.driverBookings();
  const id = await resolveDriverId(driverId);
  if (!id) return [];
  const bookings = await prisma.booking.findMany({
    where: { trip: { driverId: id } },
    include: { passenger: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return bookings.map(toBooking);
}

export async function getAllBookings(): Promise<Booking[]> {
  noStore();
  if (isDemoMode()) return demoData.allBookings();
  const bookings = await prisma.booking.findMany({
    include: { passenger: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return bookings.map(toBooking);
}

export async function getAllParcels(): Promise<Parcel[]> {
  noStore();
  if (isDemoMode()) return demoData.allParcels();
  const parcels = await prisma.parcel.findMany({
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return parcels.map(toParcel);
}

export type MyBooking = {
  reference: string;
  status: Booking["status"];
  seatNumbers: number[];
  totalPrice: number;
  originId: string;
  destinationId: string;
  departureAt: string;
};

export type MyParcel = {
  reference: string;
  status: Parcel["status"];
  originId: string;
  destinationId: string;
  description: string;
  price: number;
};

/** Bookings made by the signed-in passenger (with route + reference). */
export async function getMyBookings(userId: string): Promise<MyBooking[]> {
  noStore();
  if (isDemoMode()) {
    return demoData.allBookings().map((b) => {
      const t = demoData.trip(b.tripId);
      return {
        reference: b.reference,
        status: b.status,
        seatNumbers: b.seatNumbers,
        totalPrice: b.totalPrice,
        originId: t?.originId ?? "",
        destinationId: t?.destinationId ?? "",
        departureAt: t?.departureAt ?? b.createdAt,
      };
    });
  }
  const rows = await prisma.booking.findMany({
    where: { passengerId: userId },
    include: {
      trip: { select: { originId: true, destinationId: true, departureAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((b) => ({
    reference: b.reference,
    status: b.status,
    seatNumbers: b.seatNumbers,
    totalPrice: b.totalPrice,
    originId: b.trip.originId,
    destinationId: b.trip.destinationId,
    departureAt: b.trip.departureAt.toISOString(),
  }));
}

/** Parcels sent by the signed-in user (with reference). */
export async function getMyParcels(userId: string): Promise<MyParcel[]> {
  noStore();
  if (isDemoMode()) {
    return demoData.allParcels().map((p) => ({
      reference: p.reference,
      status: p.status,
      originId: p.originId,
      destinationId: p.destinationId,
      description: p.description,
      price: p.price,
    }));
  }
  const rows = await prisma.parcel.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      reference: true,
      status: true,
      originId: true,
      destinationId: true,
      description: true,
      price: true,
    },
  });
  return rows;
}

export type TrackResult =
  | {
      kind: "booking";
      reference: string;
      status: Booking["status"];
      originId: string;
      destinationId: string;
      departureAt?: string;
      seatNumbers: number[];
      totalPrice: number;
      name: string;
    }
  | {
      kind: "parcel";
      reference: string;
      status: Parcel["status"];
      originId: string;
      destinationId: string;
      description: string;
      price: number;
      name: string;
    };

/** Look up a booking or parcel by its public reference (e.g. AMN-… / PKG-…). */
export async function trackByReference(
  referenceRaw: string,
): Promise<TrackResult | null> {
  noStore();
  const reference = referenceRaw.trim().toUpperCase();
  if (!reference) return null;
  const maybeParcel = !reference.startsWith("AMN");
  const maybeBooking = !reference.startsWith("PKG");

  if (isDemoMode()) {
    if (maybeBooking) {
      const b = demoData.bookingByReference(reference);
      if (b) {
        const t = demoData.trip(b.tripId);
        return {
          kind: "booking",
          reference: b.reference,
          status: b.status,
          originId: t?.originId ?? "",
          destinationId: t?.destinationId ?? "",
          departureAt: t?.departureAt,
          seatNumbers: b.seatNumbers,
          totalPrice: b.totalPrice,
          name: b.passengerName,
        };
      }
    }
    const p = demoData.parcelByReference(reference);
    return p
      ? {
          kind: "parcel",
          reference: p.reference,
          status: p.status,
          originId: p.originId,
          destinationId: p.destinationId,
          description: p.description,
          price: p.price,
          name: p.receiverName,
        }
      : null;
  }

  if (maybeBooking) {
    const b = await prisma.booking.findUnique({
      where: { reference },
      include: {
        trip: { select: { originId: true, destinationId: true, departureAt: true } },
        passenger: { select: { name: true } },
      },
    });
    if (b) {
      return {
        kind: "booking",
        reference: b.reference,
        status: b.status,
        originId: b.trip.originId,
        destinationId: b.trip.destinationId,
        departureAt: b.trip.departureAt.toISOString(),
        seatNumbers: b.seatNumbers,
        totalPrice: b.totalPrice,
        name: b.passenger.name,
      };
    }
  }
  if (maybeParcel) {
    const p = await prisma.parcel.findUnique({
      where: { reference },
      include: { sender: { select: { name: true } } },
    });
    if (p) {
      return {
        kind: "parcel",
        reference: p.reference,
        status: p.status,
        originId: p.originId,
        destinationId: p.destinationId,
        description: p.description,
        price: p.price,
        name: p.sender?.name ?? p.senderName ?? p.receiverName,
      };
    }
  }
  return null;
}

/** Popular routes for the home page, derived from trip volume. */
export async function getPopularRoutes(): Promise<
  { originId: string; destinationId: string; fromPrice: number; count: number }[]
> {
  noStore();
  if (isDemoMode()) return demoData.popularRoutes();
  const groups = await prisma.trip.groupBy({
    by: ["originId", "destinationId"],
    _count: { _all: true },
    _min: { pricePerSeat: true },
  });
  return groups
    .map((g) => ({
      originId: g.originId,
      destinationId: g.destinationId,
      fromPrice: g._min.pricePerSeat ?? 0,
      count: g._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}
