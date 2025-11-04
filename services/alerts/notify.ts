import { db, type Alert, type AlertLevel } from "../../lib/db"
import { notifyLocal, ensurePermission } from "../../lib/notifications"

const levelPriority: Record<AlertLevel, number> = { info: 1, warn: 2, critical: 3 }

function isNewOrUpgraded(prev: Alert[] = [], next: Alert): boolean {
  const before = prev.find((entry) => entry.id === next.id)
  if (!before) return true
  return (levelPriority[next.level] || 0) > (levelPriority[before.level] || 0)
}

/**
 * After saving, diff alerts for the day and trigger notifications when needed.
 */
export async function compareAlertsAndNotify(userId: string, date: string, prevAlerts: Alert[]): Promise<void> {
  const latest = await db.alerts.where("userId").equals(userId).and((alert) => alert.date === date).toArray()
  const toNotify = latest.filter(
    (alert) => (alert.level === "warn" || alert.level === "critical") && isNewOrUpgraded(prevAlerts, alert),
  )
  if (toNotify.length === 0) return

  await ensurePermission().catch(() => false)

  for (const alert of toNotify) {
    const title = alert.level === "critical" ? "【重大】アラート" : "【警告】アラート"
    const body = `${alert.date} ${alert.message}`
    const url = alert.type === "seizure" ? `/daily-log/seizure?date=${alert.date}` : `/daily-log?date=${alert.date}`

    await notifyLocal({
      title,
      body,
      url,
      type: alert.type,
      date: alert.date,
      userId,
      level: alert.level,
    })
  }
}
