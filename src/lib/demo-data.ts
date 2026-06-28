import { suggestSeatPrices } from "@/lib/seats";
import type { Booking, Driver, Parcel, Trip, VehicleType } from "@/types";

/**
 * In-memory dataset for demo mode (no database). Mirrors the view shapes in
 * `@/types`; bookings/parcels carry a `reference` used by the tracking page.
 */

function at(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function priced(type: VehicleType, base: number) {
  const seatPrices = suggestSeatPrices(type, base);
  return {
    seatPrices,
    pricePerSeat: Math.min(...seatPrices),
    totalSeats: seatPrices.length,
  };
}

const DRIVERS: Driver[] = [
  { id: "d1", name: "أبو علي الكناني", phone: "07701234567", rating: 4.8, tripsCount: 312 },
  { id: "d2", name: "حيدر الموسوي", phone: "07712345678", rating: 4.6, tripsCount: 178 },
  { id: "d3", name: "سيف الدليمي", phone: "07723456789", rating: 4.9, tripsCount: 421 },
  { id: "d4", name: "كاروان أحمد", phone: "07734567890", rating: 4.7, tripsCount: 256 },
];

const TRIPS: Trip[] = [
  { id: "t1", driver: DRIVERS[0], vehicleType: "SEDAN", vehicleModel: "تويوتا أفالون 2019", plate: "بغداد ٢٢ أ ٤٥٦٧", originId: "baghdad", destinationId: "basra", departureAt: at(0, 7, 30), durationMinutes: 330, ...priced("SEDAN", 25000), bookedSeats: [1, 3], status: "SCHEDULED", acceptsParcels: true, parcelBasePrice: 10000, notes: "انطلاق من كراج علاوي الحلة. مكيّف وواي‑فاي." },
  { id: "t2", driver: DRIVERS[1], vehicleType: "SUV", vehicleModel: "دودج دورانكو 2021", plate: "بغداد ١٤ ب ٧٨٩٠", originId: "baghdad", destinationId: "basra", departureAt: at(0, 9, 0), durationMinutes: 360, ...priced("SUV", 20000), bookedSeats: [2], status: "SCHEDULED", acceptsParcels: true, parcelBasePrice: 8000 },
  { id: "t3", driver: DRIVERS[2], vehicleType: "SEDAN", vehicleModel: "كيا K5 2020", plate: "بغداد ٣١ ج ١٢٣٤", originId: "baghdad", destinationId: "basra", departureAt: at(0, 14, 0), durationMinutes: 320, ...priced("SEDAN", 30000), bookedSeats: [], status: "SCHEDULED", acceptsParcels: false, notes: "سيارة خاصة سريعة، بدون توقفات." },
  { id: "t4", driver: DRIVERS[3], vehicleType: "GMC", vehicleModel: "جمس سوبربان 2019", plate: "أربيل ٢ د ٥٥٦٦", originId: "baghdad", destinationId: "erbil", departureAt: at(0, 8, 0), durationMinutes: 300, ...priced("GMC", 22000), bookedSeats: [1, 2, 5], status: "SCHEDULED", acceptsParcels: true, parcelBasePrice: 12000 },
  { id: "t5", driver: DRIVERS[0], vehicleType: "SEDAN", vehicleModel: "تويوتا كامري 2022", plate: "النجف ٥ هـ ٩٩٨٨", originId: "baghdad", destinationId: "najaf", departureAt: at(0, 10, 30), durationMinutes: 150, ...priced("SEDAN", 15000), bookedSeats: [4], status: "SCHEDULED", acceptsParcels: true, parcelBasePrice: 7000 },
  { id: "t6", driver: DRIVERS[2], vehicleType: "SEDAN", vehicleModel: "كيا K5 2020", plate: "بغداد ٣١ ج ١٢٣٤", originId: "basra", destinationId: "baghdad", departureAt: at(1, 7, 0), durationMinutes: 330, ...priced("SEDAN", 28000), bookedSeats: [2, 3], status: "SCHEDULED", acceptsParcels: true, parcelBasePrice: 10000 },
  { id: "t7", driver: DRIVERS[3], vehicleType: "GMC", vehicleModel: "جمس يوكن 2021", plate: "كربلاء ٧ و ٢٢١١", originId: "karbala", destinationId: "baghdad", departureAt: at(1, 12, 0), durationMinutes: 120, ...priced("GMC", 12000), bookedSeats: [], status: "SCHEDULED", acceptsParcels: true, parcelBasePrice: 6000 },
];

const seatTotal = (tripId: string, seats: number[]) => {
  const t = TRIPS.find((x) => x.id === tripId);
  return seats.reduce((s, n) => s + (t?.seatPrices[n - 1] ?? 0), 0);
};

const BOOKINGS: (Booking & { reference: string })[] = [
  { id: "b1", reference: "AMN-1001", tripId: "t1", passengerName: "مصطفى عبد الله", seatNumbers: [1], totalPrice: seatTotal("t1", [1]), status: "CONFIRMED", createdAt: at(-1, 18, 0) },
  { id: "b2", reference: "AMN-1002", tripId: "t1", passengerName: "زينب حسن", seatNumbers: [3], totalPrice: seatTotal("t1", [3]), status: "CONFIRMED", createdAt: at(-1, 20, 0) },
  { id: "b3", reference: "AMN-1003", tripId: "t4", passengerName: "آرام رشيد", seatNumbers: [1, 2], totalPrice: seatTotal("t4", [1, 2]), status: "PENDING", createdAt: at(0, 6, 30) },
  { id: "b4", reference: "AMN-1004", tripId: "t5", passengerName: "علي كريم", seatNumbers: [4], totalPrice: seatTotal("t5", [4]), status: "CONFIRMED", createdAt: at(0, 7, 0) },
];

const PARCELS: (Parcel & { reference: string })[] = [
  { id: "p1", reference: "PKG-2001", originId: "baghdad", destinationId: "basra", senderName: "حسين الطائي", receiverName: "ليث الطائي", receiverPhone: "07801112233", description: "وثائق وأوراق رسمية", price: 10000, status: "IN_TRANSIT", createdAt: at(0, 6, 0) },
  { id: "p2", reference: "PKG-2002", originId: "baghdad", destinationId: "erbil", senderName: "نور محمد", receiverName: "دلير عمر", receiverPhone: "07502223344", description: "قطع غيار لابتوب", price: 12000, status: "REQUESTED", createdAt: at(0, 8, 15) },
  { id: "p3", reference: "PKG-2003", originId: "najaf", destinationId: "baghdad", senderName: "كرار جبار", receiverName: "أحمد سالم", receiverPhone: "07703334455", description: "هدية / علبة صغيرة", price: 7000, status: "DELIVERED", createdAt: at(-1, 14, 0) },
];

const DEMO_DRIVER_ID = "d1";

export const demoData = {
  allTrips: (): Trip[] => TRIPS,
  search: ({ from, to }: { from?: string; to?: string }): Trip[] =>
    TRIPS.filter(
      (t) =>
        t.status === "SCHEDULED" &&
        (!from || t.originId === from) &&
        (!to || t.destinationId === to),
    ).sort((a, b) => a.departureAt.localeCompare(b.departureAt)),
  trip: (id: string): Trip | undefined => TRIPS.find((t) => t.id === id),
  bookingsForTrip: (tripId: string): Booking[] =>
    BOOKINGS.filter((b) => b.tripId === tripId),
  driverTrips: (): Trip[] => TRIPS.filter((t) => t.driver.id === DEMO_DRIVER_ID),
  driverBookings: (): Booking[] => {
    const ids = new Set(
      TRIPS.filter((t) => t.driver.id === DEMO_DRIVER_ID).map((t) => t.id),
    );
    return BOOKINGS.filter((b) => ids.has(b.tripId));
  },
  allBookings: (): (Booking & { reference: string })[] => BOOKINGS,
  allParcels: (): (Parcel & { reference: string })[] => PARCELS,
  popularRoutes: () => {
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
  },
  bookingByReference: (reference: string) =>
    BOOKINGS.find((b) => b.reference.toUpperCase() === reference.toUpperCase()),
  parcelByReference: (reference: string) =>
    PARCELS.find((p) => p.reference.toUpperCase() === reference.toUpperCase()),
};
