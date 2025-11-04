import type { Alert } from "@/lib/db"
import type { CsvColumn } from "@/lib/exporter/csv"

export type AlertCsvRow = {
  date: string
  alerts_critical_count: number
  alerts_warn_count: number
  latest_alert_titles: string[]
}

/**
 * 指定日のアラートをCSV用に要約
 * - クリティカル/警告の件数
 * - 最新アラートのタイトル一覧（新しい順）
 */
export function summarizeAlertsForDate(alerts: Alert[], date: string, options?: { latestLimit?: number }): AlertCsvRow {
  const sameDay = alerts.filter((a) => a.date === date)

  const critical = sameDay.filter((a) => a.level === "critical").length
  const warn = sameDay.filter((a) => a.level === "warn").length

  const sortedByNew = [...sameDay].sort((a, b) => b.createdAt - a.createdAt)
  const limit = options?.latestLimit ?? 5
  const latest = sortedByNew.slice(0, limit).map((a) => a.message)

  return {
    date,
    alerts_critical_count: critical,
    alerts_warn_count: warn,
    latest_alert_titles: latest,
  }
}

/**
 * CSVカラム定義（S-05追加列）
 */
export function alertCsvColumns(): CsvColumn<AlertCsvRow>[] {
  return [
    { key: "date", header: "date" },
    { key: "alerts_critical_count", header: "alerts_critical_count" },
    { key: "alerts_warn_count", header: "alerts_warn_count" },
    {
      key: "latest_alert_titles",
      header: "latest_alert_titles",
      map: (v: any) => Array.isArray(v) ? v.join(" | ") : String(v ?? ""),
    },
  ]
}
