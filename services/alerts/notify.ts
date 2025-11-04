import { db, type Alert, type AlertLevel } from '../../lib/db'
import { notifyLocal, ensurePermission } from '../../lib/notifications'

const levelPriority: Record<AlertLevel, number> = { info: 1, warn: 2, critical: 3 }

function isNewOrUpgraded(prev: Alert[] = [], next: Alert): boolean {
  const before = prev.find(p => p.id === next.id)
  if (!before) return true
  return (levelPriority[next.level] || 0) > (levelPriority[before.level] || 0)
}

/**
 * 保存後の指定日付に対するアラート差分を検出し、必要に応じてローカル通知を発火
 */
export async function compareAlertsAndNotify(userId: string, date: string, prevAlerts: Alert[]): Promise<void> {
  // fetch latest alerts for the date
  const latest = await db.alerts.where('userId').equals(userId).and(a => a.date === date).toArray()
  const toNotify = latest.filter(a => (a.level === 'warn' || a.level === 'critical') && isNewOrUpgraded(prevAlerts, a))
  if (toNotify.length === 0) return

  const permitted = await ensurePermission().catch(() => false)
  // even if not permitted, notifyLocal will fallback to toast
  for (const a of toNotify) {
    const title = a.level === 'critical' ? '【重大】アラート' : '【警告】アラート'
    const body = `${a.date} ${a.message}`
    const url = a.type === 'seizure' ? `/daily-log/seizure?date=${a.date}` : `/daily-log?date=${a.date}`
    await notifyLocal({ title, body, data: { url } })
  }
}
