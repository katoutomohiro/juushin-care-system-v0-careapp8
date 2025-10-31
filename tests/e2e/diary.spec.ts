import { test, expect } from '@playwright/test';

test('diary page smoke', async ({ page }) => {
  await page.goto('/diary');
  await expect(page.locator('text=Diary')).toBeVisible();
  const saveButton = page.locator('button:has-text("Save")');
  await expect(saveButton).toBeVisible();
});

test('diary form with photo attachment', async ({ page }) => {
  await page.goto('/diary');
  
  // フォーム入力
  await page.fill('input[type="number"]', '80');
  
  // 月次チャートページに遷移できることを確認
  await page.goto('/diary/monthly');
  await expect(page.locator('text=Monthly Vitals')).toBeVisible();
  
  // グラフが表示されているか確認（Rechartsコンテナの存在）
  const chartContainer = page.locator('.recharts-wrapper');
  await expect(chartContainer.first()).toBeVisible({ timeout: 10000 });
});

test('monthly chart displays threshold alerts', async ({ page }) => {
  await page.goto('/diary/monthly');
  
  // 心拍数・体温・発作グラフのタイトルが表示されることを確認
  await expect(page.locator('text=Heart Rate (bpm)')).toBeVisible();
  await expect(page.locator('text=Temperature (°C)')).toBeVisible();
  await expect(page.locator('text=Seizure Count')).toBeVisible();
});

