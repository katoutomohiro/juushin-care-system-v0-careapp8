import { test, expect } from '@playwright/test';

test('diary page smoke', async ({ page }) => {
  // 最小スモークテスト: ページが開けて基本要素が存在するか
  await page.goto('/diary');
  await expect(page.locator('text=Diary')).toBeVisible();
  // 保存ボタン確認
  const saveButton = page.locator('button:has-text("Save")');
  await expect(saveButton).toBeVisible();
  // 月次チャートページに遷移
  await page.goto('/diary/monthly');
  await expect(page.locator('text=Monthly Vitals')).toBeVisible();
});
