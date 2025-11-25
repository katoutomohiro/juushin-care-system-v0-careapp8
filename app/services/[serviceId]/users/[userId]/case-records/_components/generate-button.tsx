"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { ATCaseRecordContent } from "@/lib/case-records"

interface Props {
  userId: string
  serviceType: string
  date: string
  onGenerated?: (content: ATCaseRecordContent) => void
}

export default function GenerateCaseRecordButton({ userId, serviceType, date, onGenerated }: Props) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const dailyLogRaw = typeof window !== "undefined" ? localStorage.getItem("dailyLog") : null
      const careEventsRaw = typeof window !== "undefined" ? localStorage.getItem("careEvents") : null
      const dailyLog = dailyLogRaw ? JSON.parse(dailyLogRaw) : null
      const careEvents = careEventsRaw ? JSON.parse(careEventsRaw) : []

      const res = await fetch("/api/case-records/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, serviceType, recordDate: date, dailyLog, careEvents, source: "daily-log" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "生成に失敗しました")
      if (json.content?.data) {
        onGenerated?.(json.content.data as ATCaseRecordContent)
      }
      setStatus("ケース記録を生成しました。読み込み済みです。")
    } catch (e: any) {
      setStatus(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button size="sm" variant="secondary" disabled={loading} onClick={handleGenerate}>
        {loading ? "生成中…" : "日誌からケース記録を生成"}
      </Button>
      {status && <p className="text-xs text-muted-foreground">{status}</p>}
    </div>
  )
}
