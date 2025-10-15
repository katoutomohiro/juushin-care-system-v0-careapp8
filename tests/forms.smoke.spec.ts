import { test, expect } from "@playwright/test";

const service = "life-care";
const user = "A・T"; // adjust if needed for local environment

for (const form of ["seizure", "transport", "user-edit"]) {
  test(`/${form} returns 200`, async ({ page }) => {
    const url = `http://localhost:3000/forms/${form}?user=${encodeURIComponent(user)}&service=${service}`;
    const resp = await page.goto(url);
    expect(resp?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  });
}
