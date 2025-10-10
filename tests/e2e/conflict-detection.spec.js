import { test, expect } from "@playwright/test"

test.describe("Conflict Detection Tests", () => {
  test("should detect component import conflicts", async ({ page }) => {
    // Test that components can be imported without conflicts
    await page.goto("/")

    // Check for console errors that might indicate import conflicts
    const errors = []
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("favicon")) {
        errors.push(msg.text())
      }
    })

    await page.waitForLoadState("networkidle")

    // Should not have import-related errors
    const importErrors = errors.filter(
      (error) => error.includes("import") || error.includes("module") || error.includes("Cannot resolve"),
    )

    expect(importErrors).toHaveLength(0)
  })

  test("should handle duplicate component definitions", async ({ page }) => {
    await page.goto("/")

    // Check that components render without duplication issues
    const careCards = page.locator('button:has-text("記録する")')
    const cardCount = await careCards.count()

    // Should have expected number of care category cards (13 based on eventCategories)
    expect(cardCount).toBe(13)

    // Each card should be unique
    const cardTexts = []
    for (let i = 0; i < cardCount; i++) {
      const card = careCards.nth(i)
      const parentCard = card.locator("..").locator("..")
      const cardText = await parentCard.textContent()
      cardTexts.push(cardText)
    }

    // Check for duplicates
    const uniqueTexts = [...new Set(cardTexts)]
    expect(uniqueTexts.length).toBe(cardTexts.length)
  })

  test("should handle CSS class conflicts", async ({ page }) => {
    await page.goto("/")

    // Check that styling is applied correctly without conflicts
    const header = page.locator("header")
    await expect(header).toBeVisible()

    // Check that cards have proper styling
    const firstCard = page.locator('button:has-text("記録する")').first().locator("..").locator("..")
    await expect(firstCard).toBeVisible()

    // Verify card has expected styling classes
    const cardClass = await firstCard.getAttribute("class")
    expect(cardClass).toContain("group")
    expect(cardClass).toContain("hover:shadow-xl")
  })

  test("should handle state management conflicts", async ({ page }) => {
    await page.goto("/")

    // Test user selection state
    const userSelect = page.locator('select[aria-label="利用者を選択"]')
    await expect(userSelect).toHaveValue("利用者A")

    // Change user and verify state is consistent
    await userSelect.selectOption("利用者B")
    await expect(userSelect).toHaveValue("利用者B")

    // Open a form and check if user context is maintained
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await seizureButton.click()

    // Form should open without state conflicts
    await expect(page.locator("text=発作記録")).toBeVisible()

    // Close form and verify user selection is still correct
    const cancelButton = page.locator('button:has-text("キャンセル")')
    if ((await cancelButton.count()) > 0) {
      await cancelButton.click()
    }

    await expect(userSelect).toHaveValue("利用者B")
  })

  test("should handle localStorage conflicts", async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.clear())

    await page.goto("/")

    // Add test data
    await page.evaluate(() => {
      const testEvent1 = {
        id: "test-1",
        eventType: "seizure",
        timestamp: new Date().toISOString(),
        userId: "利用者A",
      }

      const testEvent2 = {
        id: "test-2",
        eventType: "vitals",
        timestamp: new Date().toISOString(),
        userId: "利用者A",
      }

      localStorage.setItem("careEvents", JSON.stringify([testEvent1, testEvent2]))
    })

    // Reload and verify data persistence
    await page.reload()
    await page.waitForLoadState("networkidle")

    const storedData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("careEvents") || "[]")
    })

    expect(storedData).toHaveLength(2)
    expect(storedData[0].id).toBe("test-1")
    expect(storedData[1].id).toBe("test-2")
  })

  test("should handle form validation conflicts", async ({ page }) => {
    await page.goto("/")

    // Open vitals form
    const vitalsButton = page
      .locator("text=バイタル")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await vitalsButton.click()

    // Test that form validation works consistently
    const timeInput = page.locator('input[type="time"]').first()
    await expect(timeInput).toBeVisible()

    // Fill required field
    await timeInput.fill("14:30")

    // Try to submit (should work with minimal required data)
    const submitButton = page.locator('button[type="submit"], button:has-text("保存")')
    if ((await submitButton.count()) > 0) {
      await submitButton.click()

      // Should either show success or validation message, not crash
      await page.waitForTimeout(1000)

      // Page should still be functional
      await expect(page.locator("h1")).toBeVisible()
    }
  })

  test("should handle concurrent form submissions", async ({ page }) => {
    await page.goto("/")

    // Test that multiple rapid interactions don't cause conflicts
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    const vitalsButton = page
      .locator("text=バイタル")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')

    // Rapid clicks should not cause conflicts
    await seizureButton.click()
    await expect(page.locator("text=発作記録")).toBeVisible()

    // Close and open another form quickly
    const cancelButton = page.locator('button:has-text("キャンセル")')
    if ((await cancelButton.count()) > 0) {
      await cancelButton.click()
    }

    await vitalsButton.click()
    await expect(page.locator("text=バイタルサイン記録")).toBeVisible()
  })
})
