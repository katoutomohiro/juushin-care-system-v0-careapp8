import type { DailyHeaderForm, DailyRowForm } from "./schema"

const BOM = "\ufeff"
const CRLF = "\r\n"

const escapeCell = (value: string | number) => {
  const text = String(value)
  if (text.includes(",") || text.includes("\"") || text.includes("\n") || text.includes("\r")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export const toCsv = (
  header: DailyHeaderForm,
  rows: DailyRowForm[],
  options: { includeAlerts: boolean },
) => {
  const filtered = options.includeAlerts ? rows : rows.filter((row) => !row.hasAlert)
  const csvRows: string[] = []
  csvRows.push(
    [
      "サービス",
      "日付",
      "看護師看護時間(分)",
      "利用者名",
      "予定ケア",
      "実績内容",
      "達成",
      "アラート",
      "メモ",
    ]
      .map(escapeCell)
      .join(","),
  )

  for (const row of filtered) {
    csvRows.push(
      [
        header.service,
        header.date,
        header.nurseMinutes,
        row.userName,
        row.plannedCare,
        row.achievedDescription,
        row.achieved ? 1 : 0,
        row.hasAlert ? 1 : 0,
        row.notes ?? "",
      ]
        .map(escapeCell)
        .join(","),
    )
  }

  return `${BOM}${csvRows.join(CRLF)}${CRLF}`
}
