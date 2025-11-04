import { db, type Alert, type AlertType } from "../../lib/db"
import { monthlyStats } from "../../hooks/useDiary"
import { ALERT_THRESHOLDS } from "./constants"

function generateAlertId(userId: string, date: string, type: AlertType): string {
  return `alert-${userId}-${date}-${type}`
}

function resolveMonth(target: string): string {
  if (!target) return new Date().toISOString().slice(0, 7)
  return target.length >= 7 ? target.slice(0, 7) : target
}

type DailyRecord = {
  date: string
  hr: number | null
  temp: number | null
  spO2: number | null
  seizure: number
}

/**
 * Compute alerts based on diary entries for the given user and month/date.
 * When called with a single argument the legacy signature (ym only) is accepted.
 */
export async function computeDailyAlerts(userId: string, target: string): Promise<void>
export async function computeDailyAlerts(target: string): Promise<void>
export async function computeDailyAlerts(arg1: string, arg2?: string): Promise<void> {
  const hasUser = typeof arg2 === "string"
  const userId = hasUser ? arg1 : "default"
  const target = hasUser ? (arg2 as string) : arg1
  const month = resolveMonth(target)

  const daysRaw = (await monthlyStats(month)) as DailyRecord[]

  const byDate: Record<string, DailyRecord[]> = {}
  for (const record of daysRaw) {
    if (!byDate[record.date]) byDate[record.date] = []
    byDate[record.date].push(record)
  }

  const alerts: Alert[] = []
  const now = Date.now()

  for (const [date, records] of Object.entries(byDate)) {
    const temps = records.map((r) => r.temp).filter((t): t is number => typeof t === "number")
    const seizureCount = records.reduce((sum, r) => sum + r.seizure, 0)

    if (temps.length > 0) {
      const maxTemp = Math.max(...temps)
      const minTemp = Math.min(...temps)

      if (maxTemp >= ALERT_THRESHOLDS.TEMP_CRITICAL_HIGH) {
        alerts.push({
          id: generateAlertId(userId, date, "vital"),
          userId,
          date,
          type: "vital",
          level: "critical",
          message: `高体温が検出されました（${maxTemp.toFixed(1)}℃）`,
          metrics: { tempMax: maxTemp },
          createdAt: now,
        })
      } else if (maxTemp >= ALERT_THRESHOLDS.TEMP_WARN_HIGH) {
        alerts.push({
          id: generateAlertId(userId, date, "vital"),
          userId,
          date,
          type: "vital",
          level: "warn",
          message: `発熱傾向があります（${maxTemp.toFixed(1)}℃）`,
          metrics: { tempMax: maxTemp },
          createdAt: now,
        })
      }

      if (minTemp <= ALERT_THRESHOLDS.TEMP_CRITICAL_LOW) {
        alerts.push({
          id: generateAlertId(userId, date, "vital") + "-low",
          userId,
          date,
          type: "vital",
          level: "critical",
          message: `低体温が検出されました（${minTemp.toFixed(1)}℃）`,
          metrics: { tempMin: minTemp },
          createdAt: now,
        })
      } else if (minTemp <= ALERT_THRESHOLDS.TEMP_WARN_LOW) {
        alerts.push({
          id: generateAlertId(userId, date, "vital") + "-low",
          userId,
          date,
          type: "vital",
          level: "warn",
          message: `低体温傾向があります（${minTemp.toFixed(1)}℃）`,
          metrics: { tempMin: minTemp },
          createdAt: now,
        })
      }
    }

    if (seizureCount >= ALERT_THRESHOLDS.SEIZURE_CRITICAL) {
      alerts.push({
        id: generateAlertId(userId, date, "seizure"),
        userId,
        date,
        type: "seizure",
        level: "critical",
        message: `てんかん発作が多発しています（${seizureCount}回）`,
        metrics: { seizures: seizureCount },
        createdAt: now,
      })
    } else if (seizureCount >= ALERT_THRESHOLDS.SEIZURE_WARN) {
      alerts.push({
        id: generateAlertId(userId, date, "seizure"),
        userId,
        date,
        type: "seizure",
        level: "warn",
        message: `てんかん発作が記録されました（${seizureCount}回）`,
        metrics: { seizures: seizureCount },
        createdAt: now,
      })
    }
  }

  if (alerts.length > 0) {
    await db.alerts.bulkPut(alerts)
  }
}
