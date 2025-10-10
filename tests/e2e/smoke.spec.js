import { test, expect } from "@playwright/test"

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/")

    // Check if the main title is visible
    await expect(page.locator("h1")).toContainText("日常ケア記録システム")

    // Check if user selector is present
    await expect(page.locator("select")).toBeVisible()

    // Check if navigation buttons are present
    await expect(page.locator("text=記録")).toBeVisible()
    await expect(page.locator("text=統計")).toBeVisible()
    await expect(page.locator("text=設定")).toBeVisible()
  })

  test("care form modals can be opened", async ({ page }) => {
    await page.goto("/")

    // Test opening seizure form
    await page.locator("text=発作記録").first().click()
    await page.locator("text=記録する").first().click()

    // Check if modal opened
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Close modal
    await page.keyboard.press("Escape")
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test("export functionality is accessible", async ({ page }) => {
    await page.goto("/")

    // Check if export buttons are present
    await expect(page.locator("text=A4記録用紙")).toBeVisible()
    await expect(page.locator("text=PDFプレビュー")).toBeVisible()
    await expect(page.locator("text=CSV出力")).toBeVisible()
  })

  test("navigation between views works", async ({ page }) => {
    await page.goto("/")

    // Test statistics view
    await page.locator("text=統計").click()
    await expect(page.locator("text=統計")).toHaveClass(/default/)

    // Test settings view
    await page.locator("text=設定").click()
    await expect(page.locator("text=設定")).toHaveClass(/default/)

    // Return to dashboard
    await page.locator("text=記録").click()
    await expect(page.locator("text=記録")).toHaveClass(/default/)
  })
})
