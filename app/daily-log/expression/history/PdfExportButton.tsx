"use client"
import { Button } from "@/components/ui/button"
import type { ExpressionLog } from "@/lib/persistence/expression"
import { exportAsPdf, PdfColumn } from "@/lib/exporter/pdf"

const columns: PdfColumn<ExpressionLog>[] = [
  { 
    key: "occurredAt", 
    header: "日時", 
    width: 1.2,
    map: (v) => new Date(v).toLocaleString("ja-JP")
  },
  { key: "expression", header: "表情", width: 1 },
  { key: "reaction", header: "反応", width: 1, map: (v) => v || "-" },
  { key: "intervention", header: "対応", width: 1, map: (v) => v || "-" },
  { key: "discomfort", header: "不快サイン", width: 1, map: (v) => v || "-" },
  { key: "note", header: "メモ", width: 1.5, map: (v) => v || "" },
]

export default function PdfExportButton({ logs }: { logs: ExpressionLog[] }) {
  const handleExport = async () => {
    await exportAsPdf(logs.slice(0, 100), columns, {
      title: "表情・反応記録 履歴",
      filename: `expression-history-${Date.now()}`,
      maskFields: ["note"], // PII/自由記述をマスク
    })
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      PDF
    </Button>
  )
}

