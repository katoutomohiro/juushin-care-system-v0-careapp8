"use client"
import { Button } from "@/components/ui/button"
import type { SeizureLog } from "@/lib/persistence/seizure"
import { exportAsPdf, PdfColumn } from "@/lib/exporter/pdf"

const columns: PdfColumn<SeizureLog>[] = [
  { 
    key: "occurredAt", 
    header: "日時", 
    width: 1.2,
    map: (v) => new Date(v).toLocaleString("ja-JP")
  },
  { key: "seizureType", header: "発作タイプ", width: 1 },
  { 
    key: "duration", 
    header: "持続時間", 
    width: 0.8,
    map: (v) => {
      if (!v) return "-"
      const m = Math.floor(v / 60)
      const s = v % 60
      return m > 0 ? `${m}分${s}秒` : `${s}秒`
    }
  },
  { key: "trigger", header: "きっかけ", width: 1, map: (v) => v || "-" },
  { key: "intervention", header: "対応", width: 1, map: (v) => v || "-" },
  { key: "note", header: "メモ", width: 1.5, map: (v) => v || "" },
]

export default function PdfExportButton({ logs }: { logs: SeizureLog[] }) {
  const handleExport = async () => {
    await exportAsPdf(logs.slice(0, 100), columns, {
      title: "発作記録 履歴",
      filename: `seizure-history-${Date.now()}`,
      maskFields: ["note"], // PII/自由記述をマスク
    })
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      PDF
    </Button>
  )
}

