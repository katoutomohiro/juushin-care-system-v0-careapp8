import { test, expect } from '@playwright/test';
test('diary create and monthly chart', async ({ page }) => {
  await page.goto('/diary');
  await page.fill('input[type=number]:nth-of-type(1)', '80');
  await page.fill('input[type=number]:nth-of-type(2)', '36.8');
  await page.click('text=Save');
  await page.waitForTimeout(300);
  await page.goto('/diary/monthly');
  await expect(page.locator('text=Monthly Vitals')).toBeVisible();
});
