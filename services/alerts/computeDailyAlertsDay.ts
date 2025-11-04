import { computeDailyAlerts } from "./computeDailyAlerts"

/**
 * Recompute alerts for a specific user/date by re-running
 * the monthly aggregation for the given date's month.
 */
export async function computeDailyAlertsDay(userId: string, date: string): Promise<void> {
  if (!date) return
  const month = date.slice(0, 7)
  await computeDailyAlerts(userId, month)
}
