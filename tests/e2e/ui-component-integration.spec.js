import { test, expect } from "@playwright/test"

test.describe("UI Component Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("main dashboard should render all care categories", async ({ page }) => {
    // Check if main title is visible
    await expect(page.locator("h1")).toContainText("日常ケア記録システム")

    // Check if all care category cards are present
    const expectedCategories = [
      "発作記録",
      "表情・反応",
      "バイタル",
      "水分補給",
      "排泄",
      "活動",
      "皮膚・口腔ケア",
      "経管栄養",
      "呼吸管理",
      "体位変換・姿勢管理",
      "摂食嚥下管理",
      "感染予防管理",
      "コミュニケーション支援",
    ]

    for (const category of expectedCategories) {
      await expect(page.locator(`text=${category}`)).toBeVisible()
    }

    // Check if record buttons are present
    const recordButtons = page.locator('button:has-text("記録する")')
    await expect(recordButtons).toHaveCount(expectedCategories.length)
  })

  test("user selection dropdown should work correctly", async ({ page }) => {
    const userSelect = page.locator('select[aria-label="利用者を選択"]')
    await expect(userSelect).toBeVisible()

    // Check default selection
    await expect(userSelect).toHaveValue("利用者A")

    // Change user selection
    await userSelect.selectOption("利用者B")
    await expect(userSelect).toHaveValue("利用者B")
  })

  test("navigation tabs should switch views correctly", async ({ page }) => {
    // Test dashboard tab (default)
    const dashboardTab = page.locator('button:has-text("📝 記録")')
    await expect(dashboardTab).toHaveAttribute("data-state", "active")

    // Switch to statistics view
    const statisticsTab = page.locator('button:has-text("📊 統計")')
    await statisticsTab.click()
    await expect(page.locator("text=統計")).toBeVisible()

    // Switch to settings view
    const settingsTab = page.locator('button:has-text("⚙️ 設定")')
    await settingsTab.click()
    await expect(page.locator("text=設定")).toBeVisible()

    // Switch back to dashboard
    await dashboardTab.click()
    await expect(page.locator("text=記録する")).toBeVisible()
  })

  test("care form modal should open and close correctly", async ({ page }) => {
    // Click on seizure record button
    const seizureCard = page.locator("text=発作記録").locator("..").locator("..").locator('button:has-text("記録する")')
    await seizureCard.click()

    // Check if modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator("text=発作記録")).toBeVisible()

    // Close modal by clicking cancel or close button
    const cancelButton = page.locator('button:has-text("キャンセル"), button:has-text("閉じる")')
    if ((await cancelButton.count()) > 0) {
      await cancelButton.first().click()
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    }
  })

  test("vitals form should render with proper fields", async ({ page }) => {
    // Open vitals form
    const vitalsCard = page.locator("text=バイタル").locator("..").locator("..").locator('button:has-text("記録する")')
    await vitalsCard.click()

    // Check if vitals form is loaded
    await expect(page.locator("text=バイタルサイン記録")).toBeVisible()

    // Check for key form elements
    await expect(page.locator('input[type="time"]')).toBeVisible()
    await expect(page.locator('button:has-text("今すぐ")')).toBeVisible()

    // Check for temperature field
    await expect(page.locator("text=体温")).toBeVisible()

    // Check for blood pressure fields
    await expect(page.locator("text=血圧")).toBeVisible()

    // Check for heart rate field
    await expect(page.locator("text=心拍数")).toBeVisible()
  })

  test("export functionality should be accessible", async ({ page }) => {
    // Check if export section is visible
    await expect(page.locator("text=記録の出力")).toBeVisible()

    // Check export buttons
    await expect(page.locator('button:has-text("A4記録用紙")')).toBeVisible()
    await expect(page.locator('button:has-text("PDFプレビュー")')).toBeVisible()
    await expect(page.locator('button:has-text("CSV出力")')).toBeVisible()
  })

  test("A4 record sheet should open and display correctly", async ({ page }) => {
    // Click A4 record sheet button
    const a4Button = page.locator('button:has-text("A4記録用紙")')
    await a4Button.click()

    // Wait for modal to open
    await expect(page.locator("text=A4記録用紙 - 利用者A")).toBeVisible()

    // Check if print button is available
    await expect(page.locator('button:has-text("🖨️ 印刷")')).toBeVisible()

    // Close the modal
    const closeButton = page.locator('button:has-text("閉じる")')
    await closeButton.click()
    await expect(page.locator("text=A4記録用紙 - 利用者A")).not.toBeVisible()
  })

  test("keyboard shortcuts should work", async ({ page }) => {
    // Test Ctrl+1 for dashboard
    await page.keyboard.press("Control+1")
    await expect(page.locator('button:has-text("📝 記録")')).toHaveAttribute("data-state", "active")

    // Test Ctrl+2 for statistics
    await page.keyboard.press("Control+2")
    await expect(page.locator("text=統計")).toBeVisible()

    // Test Ctrl+3 for settings
    await page.keyboard.press("Control+3")
    await expect(page.locator("text=設定")).toBeVisible()
  })

  test("daily log summary should display when data exists", async ({ page }) => {
    // Add some test data to localStorage
    await page.evaluate(() => {
      const testEvent = {
        id: "test-" + Date.now(),
        eventType: "seizure",
        timestamp: new Date().toISOString(),
        userId: "利用者A",
        type: "テスト発作",
        duration: "30",
        severity: "mild",
      }

      const events = JSON.parse(localStorage.getItem("careEvents") || "[]")
      events.push(testEvent)
      localStorage.setItem("careEvents", JSON.stringify(events))
    })

    // Reload page to trigger daily log generation
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Check if daily log summary appears
    await expect(page.locator("text=本日の記録サマリー")).toBeVisible()
  })

  test("responsive design should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check if main elements are still visible and accessible
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.locator('select[aria-label="利用者を選択"]')).toBeVisible()

    // Check if care category cards are still accessible
    const recordButtons = page.locator('button:has-text("記録する")')
    await expect(recordButtons.first()).toBeVisible()

    // Test that cards are properly stacked on mobile
    const firstCard = page.locator('button:has-text("記録する")').first()
    await expect(firstCard).toBeVisible()
  })

  test("error handling should work gracefully", async ({ page }) => {
    // Test with invalid localStorage data
    await page.evaluate(() => {
      localStorage.setItem("careEvents", "invalid-json")
    })

    await page.reload()
    await page.waitForLoadState("networkidle")

    // Page should still load without crashing
    await expect(page.locator("h1")).toBeVisible()

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem("careEvents")
    })
  })
})
