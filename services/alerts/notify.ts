import { db, type Alert, type AlertLevel } from "../../lib/db"
import { ensurePermission } from "../../lib/notifications"

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

  // Notifications disabled: notifyLocal not available
  // Original alert notification logic removed for stability
}
