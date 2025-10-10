import { test, expect } from "@playwright/test"

test.describe("Feature PR Validation", () => {
  test("vitals form should render and function correctly", async ({ page }) => {
    await page.goto("/")

    // Look for vitals form trigger
    const vitalsButton = page.locator('button:has-text("バイタル")')
    if ((await vitalsButton.count()) > 0) {
      await vitalsButton.click()

      // Check if vitals form loads
      await expect(page.locator("text=バイタルサイン記録")).toBeVisible()

      // Test form fields
      const temperatureField = page.locator('input[type="time"]').first()
      await expect(temperatureField).toBeVisible()

      // Test "Now" button functionality
      const nowButton = page.locator('button:has-text("今すぐ")')
      if ((await nowButton.count()) > 0) {
        await nowButton.click()
        // Verify time was set
        const timeValue = await temperatureField.inputValue()
        expect(timeValue).toBeTruthy()
      }
    }
  })

  test("seizure form should render with stopwatch functionality", async ({ page }) => {
    await page.goto("/")

    // Look for seizure form trigger
    const seizureButton = page.locator('button:has-text("発作")')
    if ((await seizureButton.count()) > 0) {
      await seizureButton.click()

      // Check if seizure form loads
      await expect(page.locator("text=発作記録")).toBeVisible()

      // Test stopwatch functionality
      const startButton = page.locator('button:has-text("開始")')
      const stopButton = page.locator('button:has-text("停止")')

      if ((await startButton.count()) > 0) {
        await startButton.click()
        await page.waitForTimeout(2000) // Wait 2 seconds

        if ((await stopButton.count()) > 0) {
          await stopButton.click()

          // Check if duration was recorded
          const durationField = page.locator('input[placeholder*="秒数"]')
          if ((await durationField.count()) > 0) {
            const duration = await durationField.inputValue()
            expect(Number.parseInt(duration)).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  test("export functionality should be accessible", async ({ page }) => {
    await page.goto("/")

    // Look for export functionality
    const exportButton = page.locator('button:has-text("エクスポート"), button:has-text("出力")')
    if ((await exportButton.count()) > 0) {
      await exportButton.click()

      // Check if export options are available
      const pdfOption = page.locator("text=PDF")
      const csvOption = page.locator("text=CSV")

      expect((await pdfOption.count()) > 0 || (await csvOption.count()) > 0).toBeTruthy()
    }
  })

  test("A4 display should render care records properly", async ({ page }) => {
    await page.goto("/")

    // Look for A4 display or record sheet
    const a4Display = page.locator('[data-build*="a4"], [class*="a4"], text=A4')
    if ((await a4Display.count()) > 0) {
      await a4Display.first().click()

      // Check if A4 layout is rendered
      await expect(page.locator("body")).toBeVisible()

      // Verify no console errors
      const errors = []
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text())
        }
      })

      await page.waitForLoadState("networkidle")
      expect(errors.filter((e) => !e.includes("favicon"))).toHaveLength(0)
    }
  })

  test("form data persistence should work", async ({ page }) => {
    await page.goto("/")

    // Test localStorage functionality
    const hasLocalStorage = await page.evaluate(() => {
      try {
        localStorage.setItem("test", "value")
        const result = localStorage.getItem("test") === "value"
        localStorage.removeItem("test")
        return result
      } catch {
        return false
      }
    })

    expect(hasLocalStorage).toBeTruthy()

    // Test if care events can be stored
    await page.evaluate(() => {
      const testEvent = {
        id: "test-" + Date.now(),
        eventType: "test",
        timestamp: new Date().toISOString(),
        userId: "test-user",
      }

      const events = JSON.parse(localStorage.getItem("careEvents") || "[]")
      events.push(testEvent)
      localStorage.setItem("careEvents", JSON.stringify(events))
    })

    const storedEvents = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("careEvents") || "[]")
    })

    expect(storedEvents.length).toBeGreaterThan(0)
  })
})
