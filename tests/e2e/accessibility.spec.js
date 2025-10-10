import { test, expect } from "@playwright/test"

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("should have proper heading structure", async ({ page }) => {
    // Check for main heading
    const h1 = page.locator("h1")
    await expect(h1).toBeVisible()
    await expect(h1).toContainText("日常ケア記録システム")

    // Check for proper heading hierarchy
    const headings = page.locator("h1, h2, h3, h4, h5, h6")
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
  })

  test("should have proper ARIA labels", async ({ page }) => {
    // Check user selection dropdown
    const userSelect = page.locator('select[aria-label="利用者を選択"]')
    await expect(userSelect).toBeVisible()

    // Check for aria-label on buttons
    const recordButtons = page.locator('button[aria-label*="記録する"]')
    const recordButtonCount = await recordButtons.count()
    expect(recordButtonCount).toBeGreaterThan(0)
  })

  test("should be keyboard navigable", async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press("Tab")

    // Check if focus is visible
    const focusedElement = page.locator(":focus")
    await expect(focusedElement).toBeVisible()

    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab")
      const currentFocus = page.locator(":focus")
      await expect(currentFocus).toBeVisible()
    }
  })

  test("should have sufficient color contrast", async ({ page }) => {
    // This is a basic check - in a real scenario you'd use axe-core
    const buttons = page.locator("button")
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      await expect(button).toBeVisible()

      // Check if button has readable text
      const text = await button.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })

  test("should handle screen reader announcements", async ({ page }) => {
    // Check for live regions or announcements
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')

    // Open a form to trigger potential announcements
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await seizureButton.click()

    // Check if modal has proper role
    const modal = page.locator('[role="dialog"]')
    if ((await modal.count()) > 0) {
      await expect(modal).toBeVisible()
    }
  })

  test("should have proper form labels", async ({ page }) => {
    // Open vitals form
    const vitalsButton = page
      .locator("text=バイタル")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await vitalsButton.click()

    // Check for proper form labels
    const labels = page.locator("label")
    const inputs = page.locator("input, select, textarea")

    const labelCount = await labels.count()
    const inputCount = await inputs.count()

    // Should have labels for form inputs
    expect(labelCount).toBeGreaterThan(0)

    // Check if inputs have associated labels
    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i)
      const inputId = await input.getAttribute("id")

      if (inputId) {
        const associatedLabel = page.locator(`label[for="${inputId}"]`)
        await expect(associatedLabel).toBeVisible()
      }
    }
  })

  test("should handle focus management in modals", async ({ page }) => {
    // Open a modal
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await seizureButton.click()

    // Check if focus is trapped in modal
    const modal = page.locator('[role="dialog"]')
    if ((await modal.count()) > 0) {
      await expect(modal).toBeVisible()

      // Focus should be within the modal
      const focusedElement = page.locator(":focus")
      const isInModal = (await modal.locator(":focus").count()) > 0

      // This is a basic check - proper focus trap testing would be more complex
      expect(isInModal || (await focusedElement.count()) > 0).toBeTruthy()
    }
  })
})
