"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { buildTimelineEvents, type TimelineEvent } from "@/lib/care-event-timeline"
import { DataStorageService } from "@/services/data-storage-service"

interface UserDailyLogTimelineProps {
  userId?: string
  serviceId?: string
  heading?: string
  limit?: number
  viewAllHref?: string
}

export function UserDailyLogTimeline({
  userId,
  serviceId,
  heading = "日誌タイムライン",
  limit = 10,
  viewAllHref,
}: UserDailyLogTimelineProps) {
  const [logEvents, setLogEvents] = useState<TimelineEvent[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resolvedViewAllHref = useMemo(() => {
    if (viewAllHref) return viewAllHref
    if (userId) {
      const params = new URLSearchParams({ user: userId })
      if (serviceId) params.set("service", serviceId)
      return `/daily-log?${params.toString()}`
    }
    return "/daily-log"
  }, [serviceId, userId, viewAllHref])

  const loadEvents = useCallback(() => {
    try {
      const allEvents = DataStorageService.getAllCareEvents()
      const timeline = buildTimelineEvents(allEvents, { userId, serviceId, limit })
      setLogEvents(timeline)
      setErrorMessage(null)
    } catch (e: any) {
      console.error("[UserDailyLogTimeline] failed to load care events", e)
      setErrorMessage(e?.message || "日誌の取得に失敗しました")
    }
  }, [limit, serviceId, userId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === "careEvents") {
        loadEvents()
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [loadEvents])

  const displayEvents = logEvents

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold">{heading}</h2>
        <Link href={resolvedViewAllHref} className="rounded-lg bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">
          全ての日誌を見る
        </Link>
      </header>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</div>
      )}

      {displayEvents.length === 0 && !errorMessage && (
        <div className="rounded-lg border bg-gray-50 p-8 text-center">
          <p className="text-gray-600">表示できる日誌がありません</p>
          <p className="mt-2 text-sm text-gray-500">発作や表情などの記録を追加するとここに表示されます。</p>
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
        <p className="mt-1">記録は時系列で表示されます。入力後にページを開き直すと最新の内容が反映されます。</p>
      </div>
    </div>
  )
}
