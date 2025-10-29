import { test, expect } from '@playwright/test'

test.describe('Expression History Page', () => {
  test('should display expression history page', async ({ page }) => {
    await page.goto('/daily-log/expression/history')
    
    // ページタイトルの確認
    await expect(page.getByRole('heading', { name: '表情・反応記録 履歴' })).toBeVisible()
    
    // 新規作成ボタンの確認
    await expect(page.getByRole('link', { name: '新規作成' })).toBeVisible()
    
    // テーブルが表示されること
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should filter expression logs by date range', async ({ page }) => {
    await page.goto('/daily-log/expression/history')
    
    // 期間フィルタを入力
    const today = new Date().toISOString().split('T')[0]
    await page.locator('input[type="datetime-local"]').first().fill(`${today}T00:00`)
    await page.locator('input[type="datetime-local"]').nth(1).fill(`${today}T23:59`)
    
    // 検索ボタンをクリック
    await page.getByRole('button', { name: /検索/ }).click()
    
    // テーブルが描画されること
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should filter by keyword', async ({ page }) => {
    await page.goto('/daily-log/expression/history')
    
    // キーワード検索
    await page.getByPlaceholder('フリーワード').fill('テスト')
    await page.getByRole('button', { name: /検索/ }).click()
    
    // テーブルが描画されること
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('should export CSV', async ({ page }) => {
    await page.goto('/daily-log/expression/history')
    
    // CSVエクスポート（ダウンロード発火を確認）
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('link', { name: 'CSV' }).click()
    const download = await downloadPromise
    
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/expression_logs_\d+\.csv$/)
  })

  test('should have PDF export button', async ({ page }) => {
    await page.goto('/daily-log/expression/history')
    
    // PDFボタンが表示されること（クリックはせず存在確認のみ）
    await expect(page.getByRole('button', { name: /PDF/ })).toBeVisible()
  })

  test('should navigate to new expression log form', async ({ page }) => {
    await page.goto('/daily-log/expression/history')
    
    // 新規作成ボタンをクリック
    await page.getByRole('link', { name: '新規作成' }).click()
    
    // 表情記録ページに遷移すること
    await expect(page).toHaveURL('/daily-log/expression')
    await expect(page.getByRole('heading', { name: '表情・反応記録' })).toBeVisible()
  })
})
