import { test, expect } from "@playwright/test";

const service = "life-care";
const user = "A・T"; // adjust if needed for local environment

for (const form of ["seizure", "transport", "user-edit"]) {
  test(`/${form} returns 200`, async ({ page }) => {
    const path = `/forms/${form}?user=${encodeURIComponent(user)}&service=${service}`;
    const resp = await page.goto(path);
    expect(resp?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}
