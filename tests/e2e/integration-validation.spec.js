import { test, expect } from "@playwright/test"

test.describe("Integration Validation Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("should validate complete user workflow", async ({ page }) => {
    // Test complete workflow: select user -> record care -> export data

    // Step 1: Select user
    const userSelect = page.locator('select[aria-label="利用者を選択"]')
    await userSelect.selectOption("利用者B")
    await expect(userSelect).toHaveValue("利用者B")

    // Step 2: Record seizure event
    const seizureButton = page
      .locator("text=発作記録")
      .locator("..")
      .locator("..")
      .locator('button:has-text("記録する")')
    await seizureButton.click()

    await expect(page.locator("text=発作記録")).toBeVisible()

    // Fill required fields
    const timeInput = page.locator('input[type="time"]').first()
    await timeInput.fill("14:30")

    // Select seizure type if dropdown exists
    const typeDropdown = page.locator("text=発作の種類").locator("..").locator('[class*="cursor-pointer"]')
    if ((await typeDropdown.count()) > 0) {
      await typeDropdown.click()
      const firstOption = page.locator('[class*="hover:bg-gray-100"]').first()
      if ((await firstOption.count()) > 0) {
        await firstOption.click()
      }
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("保存")')
    if ((await submitButton.count()) > 0) {
      await submitButton.click()

      // Wait for success message or form close
      await page.waitForTimeout(2000)
    }

    // Step 3: Verify data was recorded
    await expect(page.locator("text=本日の記録サマリー")).toBeVisible()

    // Step 4: Test export functionality
    const a4Button = page.locator('button:has-text("A4記録用紙")')
    await a4Button.click()

    await expect(page.locator("text=A4記録用紙 - 利用者B")).toBeVisible()

    // Close A4 preview
    const closeButton = page.locator('button:has-text("閉じる")')
    await closeButton.click()
  })

  test("should validate data persistence across sessions", async ({ page }) => {
    // Add test data
    await page.evaluate(() => {
      const testEvent = {
        id: "integration-test-" + Date.now(),
        eventType: "vitals",
        timestamp: new Date().toISOString(),
        userId: "利用者A",
        temperature: "36.5",
        heartRate: "70",
      }

      const events = JSON.parse(localStorage.getItem("careEvents") || "[]")
      events.push(testEvent)
      localStorage.setItem("careEvents", JSON.stringify(events))
    })

    // Reload page
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Verify data persisted
    const persistedData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("careEvents") || "[]")
    })

    expect(persistedData.length).toBeGreaterThan(0)

    const testEvent = persistedData.find((event) => event.id?.includes("integration-test"))
    expect(testEvent).toBeTruthy()
    expect(testEvent.eventType).toBe("vitals")
  })

  test("should validate responsive design integration", async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator("h1")).toBeVisible()

    const desktopCards = page.locator('button:has-text("記録する")')
    const desktopCardCount = await desktopCards.count()
    expect(desktopCardCount).toBe(13)

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)

    await expect(page.locator("h1")).toBeVisible()
    const tabletCards = page.locator('button:has-text("記録する")')
    const tabletCardCount = await tabletCards.count()
    expect(tabletCardCount).toBe(13)

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    await expect(page.locator("h1")).toBeVisible()
    const mobileCards = page.locator('button:has-text("記録する")')
    const mobileCardCount = await mobileCards.count()
    expect(mobileCardCount).toBe(13)
  })

  test("should validate error handling integration", async ({ page }) => {
    // Test with corrupted localStorage
    await page.evaluate(() => {
      localStorage.setItem("careEvents", "{invalid json}")
      localStorage.setItem("customUserNames", "not an array")
    })

    await page.reload()
    await page.waitForLoadState("networkidle")

    // Application should still load
    await expect(page.locator("h1")).toBeVisible()

    // Should fallback to default users
    const userSelect = page.locator('select[aria-label="利用者を選択"]')
    await expect(userSelect).toBeVisible()

    // Clean up
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test("should validate performance integration", async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now()

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const loadTime = Date.now() - startTime

    // Page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000)

    // Check for performance issues
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType("navigation").map((entry) => ({
        loadEventEnd: entry.loadEventEnd,
        domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      }))
    })

    expect(performanceEntries.length).toBeGreaterThan(0)
  })

  test("should validate accessibility integration", async ({ page }) => {
    // Check for basic accessibility features

    // Heading structure
    const h1 = page.locator("h1")
    await expect(h1).toBeVisible()

    // ARIA labels
    const ariaLabels = page.locator("[aria-label]")
    const ariaLabelCount = await ariaLabels.count()
    expect(ariaLabelCount).toBeGreaterThan(0)

    // Keyboard navigation
    await page.keyboard.press("Tab")
    const focusedElement = page.locator(":focus")
    await expect(focusedElement).toBeVisible()

    // Color contrast (basic check)
    const buttons = page.locator("button")
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)

    // Check if buttons have visible text
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })

  test("should validate cross-browser compatibility", async ({ page, browserName }) => {
    // Test basic functionality across browsers
    await expect(page.locator("h1")).toBeVisible()

    // Test localStorage support
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

    // Test modern JavaScript features
    const hasModernFeatures = await page.evaluate(() => {
      try {
        // Test arrow functions, destructuring, etc.
        const test = { a: 1, b: 2 }
        const { a, b } = test
        const result = [1, 2, 3].map((x) => x * 2)
        return a === 1 && b === 2 && result.length === 3
      } catch {
        return false
      }
    })

    expect(hasModernFeatures).toBeTruthy()

    console.log(`✅ Browser compatibility validated for ${browserName}`)
  })

  test("should validate security integration", async ({ page }) => {
    // Check for potential security issues

    // No inline scripts (basic XSS protection)
    const inlineScripts = await page.locator("script:not([src])").count()
    expect(inlineScripts).toBe(0)

    // Check for proper form handling
    const forms = page.locator("form")
    const formCount = await forms.count()

    if (formCount > 0) {
      // Forms should have proper method attributes
      for (let i = 0; i < formCount; i++) {
        const form = forms.nth(i)
        const method = await form.getAttribute("method")
        // Should be POST for data submission or null for client-side handling
        expect(method === null || method === "post").toBeTruthy()
      }
    }

    // Check that sensitive data is not exposed in DOM
    const pageContent = await page.content()
    expect(pageContent).not.toContain("password")
    expect(pageContent).not.toContain("secret")
    expect(pageContent).not.toContain("api_key")
  })
})
