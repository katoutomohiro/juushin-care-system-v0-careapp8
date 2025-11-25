"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

interface UserDailyLogTimelineProps {
  userId?: string
  heading?: string
}

type LogEvent = {
  id: string
  timestamp: string
  category: string
  icon: string
  description: string
  color: string
}

export function UserDailyLogTimeline({ userId, heading = "日誌タイムライン" }: UserDailyLogTimelineProps) {
  const [logEvents, setLogEvents] = useState<LogEvent[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supabaseConfig = useMemo(
    () => ({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    }),
    [],
  )

  useEffect(() => {
    async function load() {
      if (!supabaseConfig.url || !supabaseConfig.key) {
        setErrorMessage("Supabase 設定がありません")
        return
      }
      const supabase = createClient(supabaseConfig.url, supabaseConfig.key, { auth: { persistSession: false } })
      const events: LogEvent[] = []

      try {
        let seizureQuery = supabase
          .from("seizure_logs")
          .select("id, recorded_at, seizure_type, duration_seconds, note")
          .order("recorded_at", { ascending: false })
          .limit(5)
        if (userId) seizureQuery = seizureQuery.eq("user_id", userId)
        const { data: seizures, error: seizureError } = await seizureQuery
        if (seizureError) throw seizureError
        seizures?.forEach((s: any) => {
          events.push({
            id: `seizure-${s.id}`,
            timestamp: s.recorded_at,
            category: "発作記録",
            icon: "⚡",
            description: `${s.seizure_type || "発作"} / ${s.duration_seconds || "不明"}秒${s.note ? ` - ${s.note}` : ""}`,
            color: "bg-red-50 border-red-200",
          })
        })
      } catch (err: any) {
        console.error("[UserDailyLogTimeline] seizure fetch error", err)
        setErrorMessage(err?.message || "発作記録の取得に失敗しました")
      }

      try {
        let expressionQuery = supabase
          .from("expression_logs")
          .select("id, recorded_at, expression_type, note")
          .order("recorded_at", { ascending: false })
          .limit(5)
        if (userId) expressionQuery = expressionQuery.eq("user_id", userId)
        const { data: expressions, error: expressionError } = await expressionQuery
        if (expressionError) throw expressionError
        expressions?.forEach((e: any) => {
          events.push({
            id: `expression-${e.id}`,
            timestamp: e.recorded_at,
            category: "表情・反応",
            icon: "😊",
            description: `${e.expression_type || "表情"}${e.note ? ` - ${e.note}` : ""}`,
            color: "bg-amber-50 border-amber-200",
          })
        })
      } catch (err: any) {
        console.error("[UserDailyLogTimeline] expression fetch error", err)
        setErrorMessage((prev) => prev || err?.message || "表情・反応記録の取得に失敗しました")
      }

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setLogEvents(events.slice(0, 10))
    }

    load()
  }, [supabaseConfig, userId])

  const displayEvents = logEvents

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold">{heading}</h2>
        <Link href="/daily-log" className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">
          全ての日誌を見る
        </Link>
      </header>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      )}

      {displayEvents.length === 0 && !errorMessage && (
        <div className="rounded-lg border bg-gray-50 p-8 text-center">
          <p className="text-gray-600">表示できる日誌がありません</p>
          <p className="mt-2 text-sm text-gray-500">発作・表情の記録を入力するとここに表示されます</p>
        </div>
      )}

      {displayEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">直近の記録 {displayEvents.length}件</h3>
          {displayEvents.map((event) => (
            <div key={event.id} className={`rounded-lg border p-4 shadow-sm ${event.color}`}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">{event.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{event.category}</span>
                    <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString("ja-JP")}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold">ヒント: 日誌の記録について</p>
        <p className="mt-1">発作・表情の記録はタイムラインに集約されます。詳細は各フォームから入力してください。</p>
      </div>
    </div>
  )
}
