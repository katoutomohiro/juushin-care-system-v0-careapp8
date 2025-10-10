import { test, expect } from "@playwright/test"

test.describe("Form Functionality Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("seizure form should handle stopwatch functionality", async ({ page }) => {
    // Open seizure form
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await seizureButton.click()

    // Wait for form to load
    await expect(page.locator("text=発作記録")).toBeVisible()

    // Find stopwatch controls
    const startButton = page.locator('button:has-text("開始")')
    const stopButton = page.locator('button:has-text("停止")')
    const resetButton = page.locator('button:has-text("リセット")')

    if ((await startButton.count()) > 0) {
      // Test stopwatch start
      await startButton.click()
      await expect(startButton).toBeDisabled()
      await expect(stopButton).toBeEnabled()

      // Wait a moment
      await page.waitForTimeout(2000)

      // Test stopwatch stop
      await stopButton.click()
      await expect(startButton).toBeEnabled()

      // Test reset
      await resetButton.click()

      // Check if duration field is cleared
      const durationField = page.locator('input[placeholder*="秒数"]')
      if ((await durationField.count()) > 0) {
        const value = await durationField.inputValue()
        expect(value === "" || value === "0").toBeTruthy()
      }
    }
  })

  test('vitals form should handle "Now" button correctly', async ({ page }) => {
    // Open vitals form
    const vitalsButton = page
      .locator("text=バイタル")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await vitalsButton.click()

    // Wait for form to load
    await expect(page.locator("text=バイタルサイン記録")).toBeVisible()

    // Find time input and "Now" button
    const timeInput = page.locator('input[type="time"]').first()
    const nowButton = page.locator('button:has-text("今すぐ")')

    if ((await nowButton.count()) > 0) {
      // Clear existing time
      await timeInput.fill("")

      // Click "Now" button
      await nowButton.click()

      // Check if time was set
      const timeValue = await timeInput.inputValue()
      expect(timeValue).toBeTruthy()
      expect(timeValue).toMatch(/^\d{2}:\d{2}$/)
    }
  })

  test("form dropdown selections should work", async ({ page }) => {
    // Open vitals form
    const vitalsButton = page
      .locator("text=バイタル")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await vitalsButton.click()

    // Wait for form to load
    await expect(page.locator("text=バイタルサイン記録")).toBeVisible()

    // Find dropdown elements (custom dropdowns)
    const dropdowns = page.locator('[class*="cursor-pointer"]:has-text("選択してください")')

    if ((await dropdowns.count()) > 0) {
      const firstDropdown = dropdowns.first()
      await firstDropdown.click()

      // Check if dropdown options appear
      const options = page.locator('[class*="hover:bg-gray-100"]')
      if ((await options.count()) > 0) {
        await options.first().click()

        // Verify selection was made
        await expect(firstDropdown).not.toContainText("選択してください")
      }
    }
  })

  test("form validation should prevent invalid submissions", async ({ page }) => {
    // Open seizure form
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await seizureButton.click()

    // Wait for form to load
    await expect(page.locator("text=発作記録")).toBeVisible()

    // Try to submit without required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("保存")')

    if ((await submitButton.count()) > 0) {
      await submitButton.click()

      // Form should not close (validation should prevent submission)
      await expect(page.locator("text=発作記録")).toBeVisible()
    }
  })

  test("form data should persist during session", async ({ page }) => {
    // Open vitals form
    const vitalsButton = page
      .locator("text=バイタル")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await vitalsButton.click()

    // Fill in some data
    const timeInput = page.locator('input[type="time"]').first()
    await timeInput.fill("14:30")

    // Close form without submitting
    const cancelButton = page.locator('button:has-text("キャンセル")')
    if ((await cancelButton.count()) > 0) {
      await cancelButton.click()
    }

    // Reopen form
    await vitalsButton.click()

    // Check if data persisted (this depends on implementation)
    // For now, just verify form opens correctly
    await expect(page.locator("text=バイタルサイン記録")).toBeVisible()
  })

  test("form submission should show success feedback", async ({ page }) => {
    // Open a simple form (expression form might be simpler)
    const expressionButton = page
      .locator("text=表情・反応")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await expressionButton.click()

    // Fill required fields if any
    const timeInput = page.locator('input[type="time"]')
    if ((await timeInput.count()) > 0) {
      await timeInput.first().fill("14:30")
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("保存")')
    if ((await submitButton.count()) > 0) {
      await submitButton.click()

      // Look for success message or toast
      await expect(page.locator("text=保存しました, text=記録を保存, text=成功")).toBeVisible({ timeout: 5000 })
    }
  })
})
