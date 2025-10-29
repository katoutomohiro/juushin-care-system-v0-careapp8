import { test, expect } from "@playwright/test"

test("表情→保存→履歴CSV", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "記録を入力" }).first().click()

  // Expression page form minimal inputs
  await page.getByLabel("記録時刻").click()
  // ensure some value present; the page defaults now() so skip typing
  await page.getByText("表情").click()
  await page.getByText("状態を選択").click()
  // 期待するオプション存在に依存しないよう、最初のリスト項目を選択
  await page.locator("[role='listbox'] [role='option']").first().click()
  await page.getByRole("button", { name: "保存" }).click()

  await page.waitForURL("**/daily-log")

  // move to history
  await page.goto("/daily-log/expression/history")
  // At least table present
  await expect(page.getByText("表情・反応記録 履歴")).toBeVisible()
  // CSV button works (download not asserted in CI)
  await page.getByRole("button", { name: "CSV" }).click({ force: true })
})
