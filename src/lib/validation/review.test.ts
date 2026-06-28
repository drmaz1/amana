import { describe, expect, it } from "vitest";

import { reviewSchema } from "./review";

describe("reviewSchema", () => {
  it("accepts a rating of 1..5 with an optional comment", () => {
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 1, comment: "جيد" }).success).toBe(
      true,
    );
  });

  it("coerces numeric strings (form inputs)", () => {
    const parsed = reviewSchema.safeParse({ rating: "4" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.rating).toBe(4);
  });

  it("rejects ratings outside 1..5 and non-integers", () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });

  it("rejects an over-long comment", () => {
    const long = "ا".repeat(501);
    expect(reviewSchema.safeParse({ rating: 4, comment: long }).success).toBe(
      false,
    );
  });
});
