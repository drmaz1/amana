export type VehicleType = "SEDAN" | "SUV" | "GMC";
export type TripStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type ParcelStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type Driver = {
  id: string;
  name: string;
  phone: string;
  rating: number; // 0..5
  tripsCount: number;
};

export type Trip = {
  id: string;
  driver: Driver;
  vehicleType: VehicleType;
  vehicleModel: string;
  plate: string;
  originId: string;
  destinationId: string;
  departureAt: string; // ISO
  durationMinutes: number;
  pricePerSeat: number; // IQD — the lowest seat price ("starts from")
  seatPrices: number[]; // IQD per seat, index 0 = seat 1
  totalSeats: number;
  bookedSeats: number[]; // taken seat indexes (1-based)
  status: TripStatus;
  acceptsParcels: boolean;
  parcelBasePrice?: number;
  notes?: string;
};

export type Booking = {
  id: string;
  tripId: string;
  passengerName: string;
  seatNumbers: number[];
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
};

export type Parcel = {
  id: string;
  originId: string;
  destinationId: string;
  senderName: string;
  receiverName: string;
  receiverPhone: string;
  description: string;
  price: number;
  status: ParcelStatus;
  createdAt: string;
};
