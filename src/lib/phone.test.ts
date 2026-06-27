import { describe, expect, it } from "vitest";

import {
  isValidIraqiPhone,
  normalizeIraqiPhone,
  toE164,
  toLocalPhone,
  toWesternDigits,
} from "@/lib/phone";

describe("toWesternDigits", () => {
  it("converts Arabic-Indic digits", () => {
    expect(toWesternDigits("٠٧٧٠١٢٣٤٥٦٧")).toBe("07701234567");
  });
  it("converts Eastern-Arabic digits", () => {
    expect(toWesternDigits("۰۷۷")).toBe("077");
  });
  it("leaves ASCII and other characters untouched", () => {
    expect(toWesternDigits("07-70")).toBe("07-70");
  });
});

describe("normalizeIraqiPhone — accepted forms", () => {
  const expected = { e164: "+9647701234567", local: "07701234567" };
  for (const input of [
    "07701234567",
    "+9647701234567",
    "009647701234567",
    "9647701234567",
    "7701234567",
    "0770 123 4567",
    "0770-123-4567",
    "(0770) 123 4567",
    "٠٧٧٠١٢٣٤٥٦٧",
    "  07701234567  ",
  ]) {
    it(`normalizes ${JSON.stringify(input)}`, () => {
      expect(normalizeIraqiPhone(input)).toEqual(expected);
    });
  }
});

describe("normalizeIraqiPhone — rejected forms", () => {
  for (const input of [
    "",
    null,
    undefined,
    "0612345678", // NSN doesn't start with 7
    "077012345", // too short
    "077012345678", // too long
    "+19999999999", // wrong country
    "abcdefghijk",
    "0770123456a",
  ]) {
    it(`rejects ${JSON.stringify(input)}`, () => {
      expect(normalizeIraqiPhone(input)).toBeNull();
      expect(isValidIraqiPhone(input)).toBe(false);
    });
  }
});

describe("toE164 / toLocalPhone", () => {
  it("round-trips local -> E.164 -> local", () => {
    const e164 = toE164("07701234567");
    expect(e164).toBe("+9647701234567");
    expect(toLocalPhone(e164)).toBe("07701234567");
  });
  it("returns null for invalid input", () => {
    expect(toE164("123")).toBeNull();
    expect(toLocalPhone("123")).toBeNull();
  });
  it("normalizes all seeded driver numbers", () => {
    // Sanity: every seeded local number is valid and stable.
    for (const local of [
      "07701234567",
      "07712345678",
      "07723456789",
      "07734567890",
      "07900000000",
    ]) {
      expect(isValidIraqiPhone(local)).toBe(true);
      expect(toLocalPhone(toE164(local))).toBe(local);
    }
  });
});
