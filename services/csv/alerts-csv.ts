import type { CsvColumn } from "@/lib/exporter/csv"

export type AlertCsvRow = {
  date: string
  alerts_critical_count: number
  alerts_warn_count: number
  latest_alert_titles: string[]
}

type SummarizeOptions = {
  latestLimit?: number
}

type AlertColumnFields = Pick<AlertCsvRow, "alerts_critical_count" | "alerts_warn_count" | "latest_alert_titles">

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

export function alertCsvColumns<T extends Partial<AlertColumnFields> = AlertColumnFields>(): CsvColumn<T>[] {
  return [
    { key: "alerts_critical_count", header: "alerts_critical_count" },
    { key: "alerts_warn_count", header: "alerts_warn_count" },
    {
      key: "latest_alert_titles",
      header: "latest_alert_titles",
      map: (value: unknown) => (Array.isArray(value) ? value.join(" | ") : value ? String(value) : ""),
    },
  ]
}
