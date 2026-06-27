/**
 * Parcel price estimation.
 *
 * Transparent MVP model: a flat base fee plus a per-kilogram rate (weight
 * rounded up). Rates live here so they're changed in one place; the parcel form
 * and the `createParcel` server action both call `estimateParcelPrice` so the
 * client estimate and the server-persisted price can never diverge.
 *
 * A per-route `PriceRule` table is an optional future extension (see CLAUDE.md P6).
 */

export const PARCEL_PRICING = {
  /** Flat fee applied to every parcel (IQD). */
  baseFee: 6000,
  /** Added per (rounded-up) kilogram (IQD). */
  perKg: 1000,
} as const;

export type ParcelRates = { baseFee: number; perKg: number };

/**
 * Estimate the price of a parcel by weight in kilograms. Non-positive,
 * non-finite, or missing weights are treated as the 1 kg minimum.
 */
export function estimateParcelPrice(
  weightKg: number,
  rates: ParcelRates = PARCEL_PRICING,
): number {
  const kg = Number.isFinite(weightKg) && weightKg > 0 ? weightKg : 1;
  return rates.baseFee + Math.ceil(kg) * rates.perKg;
}
