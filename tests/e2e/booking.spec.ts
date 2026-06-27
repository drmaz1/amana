import { expect, test } from "@playwright/test";

/**
 * Happy path: a guest searches Baghdad → Basra, opens a trip that still has
 * seats, picks one, and confirms the booking. Requires a seeded database
 * (`npm run db:seed`).
 */
test("guest can book a seat end to end", async ({ page }) => {
  await page.goto("/search?from=baghdad&to=basra");

  // Open the first trip that still has seats (its CTA reads "…والحجز").
  await page
    .getByRole("link", { name: /عرض التفاصيل والحجز/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { name: "تفاصيل الرحلة" })).toBeVisible();

  // Go to seat selection and pick the first available seat.
  await page.getByRole("link", { name: /اختر مقعدك/ }).click();
  await page
    .locator('button[aria-label^="مقعد"]:not([disabled])')
    .first()
    .click();
  await page.getByRole("button", { name: /متابعة الحجز/ }).click();

  // Confirm the booking.
  await expect(page).toHaveURL(/\/booking\/confirmation/);
  await page.locator("#name").fill("راكب اختبار");
  await page.locator("#phone").fill("07712223344");
  await page.getByRole("button", { name: /تأكيد الحجز/ }).click();

  await expect(
    page.getByRole("heading", { name: /تم تأكيد حجزك/ }),
  ).toBeVisible();
  await expect(page.getByText(/AMN-/)).toBeVisible();
});
