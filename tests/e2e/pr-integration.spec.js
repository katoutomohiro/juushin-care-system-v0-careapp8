import { test, expect } from "@playwright/test"

test.describe("PR Integration Tests", () => {
  test("should load main page without errors", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Soul Care System/)

    // Check for console errors
    const errors = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    await page.waitForLoadState("networkidle")
    expect(errors).toHaveLength(0)
  })

  test("should render care form components", async ({ page }) => {
    await page.goto("/")

    // Check for key UI components
    const careFormExists = (await page.locator('[data-build*="form"]').count()) > 0
    expect(careFormExists).toBeTruthy()
  })

  test("should handle navigation without crashes", async ({ page }) => {
    await page.goto("/")

    // Test basic navigation
    const links = await page.locator("a[href]").all()
    for (const link of links.slice(0, 3)) {
      // Test first 3 links
      const href = await link.getAttribute("href")
      if (href && href.startsWith("/")) {
        await page.goto(href)
        await expect(page).not.toHaveURL(/error/)
      }
    }
  })
})
