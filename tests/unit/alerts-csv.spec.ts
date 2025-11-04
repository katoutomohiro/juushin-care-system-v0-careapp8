import { describe, expect, it } from "vitest"

import { summarizeAlertsForDate } from "@/services/csv/alerts-csv"

describe("alerts-csv", () => {
  it("summary and titles", () => {
    const date = "2025-01-02"
    const alerts = [
      { date, level: "critical", title: "A", createdAt: 3 },
      { date, level: "warn", title: "B", createdAt: 2 },
      { date, level: "info", title: "C", createdAt: 1 },
    ]

    const summary = summarizeAlertsForDate(alerts, date, { latestLimit: 2 })

    expect(summary.alerts_critical_count).toBe(1)
    expect(summary.alerts_warn_count).toBe(1)
    expect(summary.latest_alert_titles).toEqual(["A", "B"])
  })
})
