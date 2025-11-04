export type AlertCsvRow = {
  date: string
  alerts_critical_count: number
  alerts_warn_count: number
  latest_alert_titles: string[]
}

type SummarizeOptions = {
  latestLimit?: number
}

export function summarizeAlertsForDate(
  alerts: Array<{ date: string; level: string; title?: string; message?: string; createdAt: number }>,
  date: string,
  { latestLimit = 5 }: SummarizeOptions = {},
): AlertCsvRow {
  const list = alerts.filter((alert) => alert.date === date)
  const critical = list.filter((alert) => alert.level === "critical").length
  const warn = list.filter((alert) => alert.level === "warn").length
  const latest = [...list]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, latestLimit)
    .map((alert) => alert.title || alert.message || "")

  return {
    date,
    alerts_critical_count: critical,
    alerts_warn_count: warn,
    latest_alert_titles: latest,
  }
}

export function alertCsvColumns() {
  return [
    { key: "date", label: "date" },
    { key: "alerts_critical_count", label: "alerts_critical_count" },
    { key: "alerts_warn_count", label: "alerts_warn_count" },
    { key: "latest_alert_titles", label: "latest_alert_titles" },
  ] as const
}
