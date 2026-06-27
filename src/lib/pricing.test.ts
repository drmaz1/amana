import { describe, expect, it } from "vitest";

import { estimateParcelPrice, PARCEL_PRICING } from "@/lib/pricing";

describe("estimateParcelPrice", () => {
  it("charges base fee + per-kg for 1 kg", () => {
    expect(estimateParcelPrice(1)).toBe(7000);
  });

  it("rounds weight up to the next whole kg", () => {
    expect(estimateParcelPrice(0.5)).toBe(7000); // ceil -> 1
    expect(estimateParcelPrice(2.1)).toBe(9000); // ceil -> 3
    expect(estimateParcelPrice(2)).toBe(8000);
    expect(estimateParcelPrice(10)).toBe(16000);
  });

  it("treats invalid/non-positive weights as the 1 kg minimum", () => {
    expect(estimateParcelPrice(0)).toBe(7000);
    expect(estimateParcelPrice(-5)).toBe(7000);
    expect(estimateParcelPrice(Number.NaN)).toBe(7000);
    expect(estimateParcelPrice(Number.POSITIVE_INFINITY)).toBe(7000);
  });

  it("honors custom rates", () => {
    expect(estimateParcelPrice(3, { baseFee: 5000, perKg: 2000 })).toBe(11000);
  });

  it("uses the published default rates", () => {
    expect(PARCEL_PRICING.baseFee).toBe(6000);
    expect(PARCEL_PRICING.perKg).toBe(1000);
  });
});
