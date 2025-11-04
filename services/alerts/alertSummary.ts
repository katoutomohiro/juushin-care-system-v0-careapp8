import { db } from '../../lib/db';

export type AlertSummary = {
  warnDays: number;
  criticalDays: number;
  feverDays: number;       // temp >= 37.5
  hypothermiaDays: number; // temp <= 35.5
  seizureDays: number;
  hydrationLowDays: number;
};

/**
 * Summarize alerts for a given month and userId.
 * Returns aggregate counts for reporting.
 */
export async function summarizeAlerts(ym: string, userId: string = 'default'): Promise<AlertSummary> {
  const alerts = await db.alerts
    .where('userId').equals(userId)
    .and(a => a.date.startsWith(ym))
    .toArray();

  const warnDates = new Set<string>();
  const criticalDates = new Set<string>();
  const feverDates = new Set<string>();
  const hypothermiaDates = new Set<string>();
  const seizureDates = new Set<string>();
  const hydrationLowDates = new Set<string>();

  for (const a of alerts) {
    if (a.level === 'warn') warnDates.add(a.date);
    if (a.level === 'critical') criticalDates.add(a.date);
    if (a.type === 'vital' && a.message.includes('体温') && a.message.includes('高')) {
      feverDates.add(a.date);
    }
    if (a.type === 'vital' && a.message.includes('低体温')) {
      hypothermiaDates.add(a.date);
    }
    if (a.type === 'seizure') {
      seizureDates.add(a.date);
    }
    if (a.type === 'hydration') {
      hydrationLowDates.add(a.date);
    }
  }

  return {
    warnDays: warnDates.size,
    criticalDays: criticalDates.size,
    feverDays: feverDates.size,
    hypothermiaDays: hypothermiaDates.size,
    seizureDays: seizureDates.size,
    hydrationLowDays: hydrationLowDates.size,
  };
}
