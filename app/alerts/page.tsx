'use client'

import { useCallback, useEffect, useState } from "react"

import { db, type Alert, type AlertLevel, type AlertType } from "@/lib/db"
import { ensurePermission } from "@/lib/notifications"
import { PushSubscriptionButton } from "@/app/service-worker-registration"
import { FEATURES } from "@/config/features"

function getLevelBadgeClass(level: AlertLevel): string {
  switch (level) {
    case "critical":
      return "bg-red-100 text-red-800"
    case "warn":
      return "bg-yellow-100 text-yellow-800"
    case "info":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

type SortBy = "createdAt-desc" | "createdAt-asc" | "level-desc"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState("default")
  const [days, setDays] = useState(7)
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all")
  const [levelFilter, setLevelFilter] = useState<AlertLevel | "all">("all")
  const [sortBy, setSortBy] = useState<SortBy>("createdAt-desc")

  const load = useCallback(async () => {
    setLoading(true)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffDate = cutoff.toISOString().slice(0, 10)

    let rows = await db.alerts.where("userId").equals(userId).and((alert) => alert.date >= cutoffDate).toArray()

    if (typeFilter !== "all") {
      rows = rows.filter((alert) => alert.type === typeFilter)
    }
    if (levelFilter !== "all") {
      rows = rows.filter((alert) => alert.level === levelFilter)
    }

    if (sortBy === "createdAt-desc") {
      rows.sort((a, b) => b.createdAt - a.createdAt)
    } else if (sortBy === "createdAt-asc") {
      rows.sort((a, b) => a.createdAt - b.createdAt)
    } else if (sortBy === "level-desc") {
      const levelPriority: Record<AlertLevel, number> = { critical: 3, warn: 2, info: 1 }
      rows.sort((a, b) => (levelPriority[b.level] || 0) - (levelPriority[a.level] || 0))
    }

    setAlerts(rows.slice(0, 20))
    setLoading(false)
  }, [userId, days, typeFilter, levelFilter, sortBy])

  useEffect(() => {
    load()
  }, [load])

  function getDetailLink(alert: Alert): string {
    if (alert.type === "seizure") {
      return `/daily-log/seizure?date=${alert.date}`
    }
    return `/daily-log?date=${alert.date}`
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">⚠️ アラート一覧</h1>
        {FEATURES.pushNotifications && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => ensurePermission()}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              通知を有効化
            </button>
            <PushSubscriptionButton className="flex flex-col gap-1 text-sm text-gray-600" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded border bg-gray-50 p-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600" htmlFor="alert-user">
            User ID
          </label>
          <input
            id="alert-user"
            className="rounded border px-3 py-2"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="default"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600" htmlFor="alert-days">
            期間
          </label>
          <select
            id="alert-days"
            className="rounded border px-3 py-2"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          >
            <option value={7}>直近7日</option>
            <option value={14}>直近14日</option>
            <option value={30}>直近30日</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600" htmlFor="alert-type">
            タイプ
          </label>
          <select
            id="alert-type"
            className="rounded border px-3 py-2"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as AlertType | "all")}
          >
            <option value="all">すべて</option>
            <option value="vital">バイタル</option>
            <option value="seizure">てんかん</option>
            <option value="hydration">水分</option>
            <option value="sleep">睡眠</option>
            <option value="other">その他</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600" htmlFor="alert-level">
            レベル
          </label>
          <select
            id="alert-level"
            className="rounded border px-3 py-2"
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value as AlertLevel | "all")}
          >
            <option value="all">すべて</option>
            <option value="critical">重大</option>
            <option value="warn">警告</option>
            <option value="info">情報</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600" htmlFor="alert-sort">
            並び順
          </label>
          <select
            id="alert-sort"
            className="rounded border px-3 py-2"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
          >
            <option value="createdAt-desc">新しい順</option>
            <option value="createdAt-asc">古い順</option>
            <option value="level-desc">重要度順</option>
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          更新
        </button>
      </div>

      <div className="divide-y rounded border bg-white">
        {loading ? (
          <div className="p-4 text-gray-500">読み込み中…</div>
        ) : alerts.length === 0 ? (
          <div className="p-4 text-gray-500">該当期間にアラートはありません。</div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-4">
              <span className={`rounded px-2 py-1 text-xs font-semibold ${getLevelBadgeClass(alert.level)}`}>
                {alert.level.toUpperCase()}
              </span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{alert.message}</div>
                <div className="text-xs text-gray-500">
                  日付: {alert.date} / タイプ: {alert.type}
                  {alert.metrics && ` / ${JSON.stringify(alert.metrics)}`}
                </div>
              </div>
              <a
                href={getDetailLink(alert)}
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                詳細へ →
              </a>
            </div>
          ))
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>※ 今後の追加予定: 通知設定、アラート詳細ページ、エクスポートなど</p>
      </div>
    </div>
  )
}
