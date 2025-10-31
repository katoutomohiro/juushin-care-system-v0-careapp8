import { test, expect } from '@playwright/test';

test('diary page loads', async ({ page }) => {
  await page.goto('/diary');
  await expect(page.locator('text=Diary')).toBeVisible();
});

test('monthly page loads', async ({ page }) => {
  await page.goto('/diary/monthly');
  await expect(page.locator('text=Monthly Vitals')).toBeVisible();
});

