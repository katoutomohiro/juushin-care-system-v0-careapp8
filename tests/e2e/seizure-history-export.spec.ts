import { test, expect } from "@playwright/test"
import fs from "node:fs"

const sizeOf = async (download: any) => {
  const p = await download.path()
  if (!p) {
    const tmp = `./test-results/${Date.now()}-${download.suggestedFilename()}`
    await download.saveAs(tmp)
    return fs.statSync(tmp).size
  }
  return fs.statSync(p).size
}

test.describe("Seizure history exports", () => {
  test("CSV download works and is non-empty", async ({ page }) => {
    await page.goto("/daily-log/seizure/history")
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "CSV" }).click(),
    ])
    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.csv$/)
    const bytes = await sizeOf(download)
    expect(bytes).toBeGreaterThan(0)
  })

  test("PDF download works and is non-empty", async ({ page }) => {
    await page.goto("/daily-log/seizure/history")
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "PDF" }).click(),
    ])
    expect(download.suggestedFilename().toLowerCase()).toMatch(/\.pdf$/)
    const bytes = await sizeOf(download)
    expect(bytes).toBeGreaterThan(0)
  })
})
