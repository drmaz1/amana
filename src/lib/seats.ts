import type { VehicleType } from "@/types";

/**
 * Seat layout + per-seat pricing for the Iraqi inter-governorate cars.
 *
 * Categories (used for default pricing and labels):
 *  - `front`  : the single seat next to the driver — most comfortable, highest.
 *  - `window` : the edge seats of a back row (next to a door) — medium.
 *  - `middle` : the squeezed middle seat of a back row — lowest.
 */

export type SeatCategory = "front" | "window" | "middle";

export type VehicleType_ = VehicleType;

export const VEHICLE_CONFIG: Record<
  VehicleType,
  { label: string; seats: number; backRows: number[] }
> = {
  SEDAN: { label: "صالون", seats: 4, backRows: [3] },
  SUV: { label: "SUV", seats: 6, backRows: [2, 3] },
  GMC: { label: "GMC", seats: 7, backRows: [3, 3] },
};

export const VEHICLE_TYPES = Object.keys(VEHICLE_CONFIG) as VehicleType[];

export function vehicleLabel(type: VehicleType): string {
  return VEHICLE_CONFIG[type]?.label ?? type;
}

/** Default passenger-seat count for a vehicle type. */
export function seatsForVehicle(type: VehicleType): number {
  return VEHICLE_CONFIG[type]?.seats ?? 4;
}

export type SeatCell =
  | { kind: "driver" }
  | { kind: "seat"; n: number; category: SeatCategory };

/** Rows of the cabin. Row 0 is the front row: [driver, seat 1]. */
export function getSeatLayout(
  type: VehicleType,
  totalSeats?: number,
): SeatCell[][] {
  const cfg = VEHICLE_CONFIG[type] ?? VEHICLE_CONFIG.SEDAN;
  const count = totalSeats ?? cfg.seats;
  const rows: SeatCell[][] = [
    [{ kind: "driver" }, { kind: "seat", n: 1, category: "front" }],
  ];

  let next = 2;
  for (const size of planRows(count - 1, cfg.backRows)) {
    const row: SeatCell[] = [];
    for (let i = 0; i < size && next <= count; i++) {
      const category: SeatCategory =
        i === 0 || i === size - 1 ? "window" : "middle";
      row.push({ kind: "seat", n: next, category });
      next += 1;
    }
    if (row.length) rows.push(row);
  }
  return rows;
}

function planRows(remaining: number, preferred: number[]): number[] {
  if (remaining <= 0) return [];
  if (preferred.reduce((a, b) => a + b, 0) === remaining) return preferred;
  // Fallback: fill rows of 3.
  const rows: number[] = [];
  let r = remaining;
  while (r > 0) {
    rows.push(Math.min(3, r));
    r -= 3;
  }
  return rows;
}

/** Category of a given seat number for a vehicle type. */
export function seatCategory(
  type: VehicleType,
  seatNumber: number,
): SeatCategory {
  for (const row of getSeatLayout(type)) {
    for (const cell of row) {
      if (cell.kind === "seat" && cell.n === seatNumber) return cell.category;
    }
  }
  return "window";
}

export function categoryLabel(c: SeatCategory): string {
  return c === "front" ? "أمامي" : c === "window" ? "شباك" : "وسط";
}

function round1000(n: number): number {
  return Math.max(1000, Math.round(n / 1000) * 1000);
}

/**
 * Suggested per-seat prices from a base (window) price: front +25%, window ×1,
 * middle −20%, rounded to the nearest 1000 IQD. The driver can edit each.
 */
export function suggestSeatPrices(type: VehicleType, base: number): number[] {
  const seats = getSeatLayout(type)
    .flat()
    .filter((c): c is Extract<SeatCell, { kind: "seat" }> => c.kind === "seat")
    .sort((a, b) => a.n - b.n);
  return seats.map((s) =>
    s.category === "front"
      ? round1000(base * 1.25)
      : s.category === "middle"
        ? round1000(base * 0.8)
        : round1000(base),
  );
}
