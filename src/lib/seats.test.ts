import { describe, expect, it } from "vitest";

import {
  getSeatLayout,
  seatCategory,
  seatsForVehicle,
  suggestSeatPrices,
  VEHICLE_CONFIG,
} from "@/lib/seats";

const seatNumbers = (type: Parameters<typeof getSeatLayout>[0]) =>
  getSeatLayout(type)
    .flat()
    .filter((c) => c.kind === "seat")
    .map((c) => (c.kind === "seat" ? c.n : 0));

describe("getSeatLayout", () => {
  it("puts the driver + seat 1 in the front row", () => {
    const rows = getSeatLayout("SEDAN");
    expect(rows[0][0]).toEqual({ kind: "driver" });
    expect(rows[0][1]).toEqual({ kind: "seat", n: 1, category: "front" });
  });

  it("SEDAN = 4 seats, back row window/middle/window", () => {
    expect(seatNumbers("SEDAN")).toEqual([1, 2, 3, 4]);
    const back = getSeatLayout("SEDAN")[1];
    expect(back.map((c) => (c.kind === "seat" ? c.category : "x"))).toEqual([
      "window",
      "middle",
      "window",
    ]);
  });

  it("SUV = 6 seats across a 2-row then 3-row back", () => {
    expect(seatNumbers("SUV")).toEqual([1, 2, 3, 4, 5, 6]);
    const rows = getSeatLayout("SUV");
    expect(rows[1].filter((c) => c.kind === "seat")).toHaveLength(2);
    expect(rows[2].filter((c) => c.kind === "seat")).toHaveLength(3);
  });

  it("GMC = 7 seats across two 3-rows", () => {
    expect(seatNumbers("GMC")).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("seatCategory + seatsForVehicle", () => {
  it("seat 1 is always front", () => {
    expect(seatCategory("SEDAN", 1)).toBe("front");
    expect(seatCategory("GMC", 1)).toBe("front");
  });
  it("reports the configured seat counts", () => {
    expect(seatsForVehicle("SEDAN")).toBe(4);
    expect(seatsForVehicle("SUV")).toBe(6);
    expect(seatsForVehicle("GMC")).toBe(7);
  });
});

describe("suggestSeatPrices", () => {
  it("front > window > middle, length = seat count, rounded to 1000s", () => {
    const prices = suggestSeatPrices("SEDAN", 20000);
    expect(prices).toHaveLength(VEHICLE_CONFIG.SEDAN.seats);
    expect(prices[0]).toBe(25000); // front: 20000 * 1.25
    expect(prices[1]).toBe(20000); // window
    expect(prices[2]).toBe(16000); // middle: 20000 * 0.8
    expect(prices.every((p) => p % 1000 === 0)).toBe(true);
  });
});
