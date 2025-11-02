import { db, type Alert, type AlertLevel, type AlertType } from '../../lib/db';
import { monthlyStats } from '../../hooks/useDiary';
import { ALERT_THRESHOLDS } from './constants';

function generateAlertId(userId: string, date: string, type: AlertType): string {
  return `alert-${userId}-${date}-${type}`;
}

/**
 * Compute daily alerts for a given month and user based on diary entries.
 * Saves results to db.alerts with deduplication by id.
 */
export async function computeDailyAlerts(ym: string, userId: string = 'default'): Promise<void> {
  const daysRaw = await monthlyStats(ym);
  
  // Group by date
  const byDate: Record<string, Array<{ hr: number | null; temp: number | null; spO2: number | null; seizure: number }>> = {};
  for (const d of daysRaw) {
    if (!byDate[d.date]) byDate[d.date] = [];
    byDate[d.date].push(d);
  }

  const alerts: Alert[] = [];
  const now = Date.now();

  for (const [date, records] of Object.entries(byDate)) {
    const temps = records.map(r => r.temp).filter((t): t is number => typeof t === 'number');
    const seizureCount = records.reduce((sum, r) => sum + r.seizure, 0);

    // Temperature alerts
    if (temps.length > 0) {
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);

      if (maxTemp >= ALERT_THRESHOLDS.TEMP_CRITICAL_HIGH) {
        alerts.push({
          id: generateAlertId(userId, date, 'vital'),
          userId,
          date,
          type: 'vital',
          level: 'critical',
          message: `高体温（${maxTemp.toFixed(1)}℃）`,
          metrics: { tempMax: maxTemp },
          createdAt: now,
        });
      } else if (maxTemp >= ALERT_THRESHOLDS.TEMP_WARN_HIGH) {
        alerts.push({
          id: generateAlertId(userId, date, 'vital'),
          userId,
          date,
          type: 'vital',
          level: 'warn',
          message: `発熱傾向（${maxTemp.toFixed(1)}℃）`,
          metrics: { tempMax: maxTemp },
          createdAt: now,
        });
      }

      if (minTemp <= ALERT_THRESHOLDS.TEMP_CRITICAL_LOW) {
        alerts.push({
          id: generateAlertId(userId, date, 'vital') + '-low',
          userId,
          date,
          type: 'vital',
          level: 'critical',
          message: `低体温（${minTemp.toFixed(1)}℃）`,
          metrics: { tempMin: minTemp },
          createdAt: now,
        });
      } else if (minTemp <= ALERT_THRESHOLDS.TEMP_WARN_LOW) {
        alerts.push({
          id: generateAlertId(userId, date, 'vital') + '-low',
          userId,
          date,
          type: 'vital',
          level: 'warn',
          message: `低体温傾向（${minTemp.toFixed(1)}℃）`,
          metrics: { tempMin: minTemp },
          createdAt: now,
        });
      }
    }

    // Seizure alerts
    if (seizureCount >= ALERT_THRESHOLDS.SEIZURE_CRITICAL) {
      alerts.push({
        id: generateAlertId(userId, date, 'seizure'),
        userId,
        date,
        type: 'seizure',
        level: 'critical',
        message: `てんかん発作多発（${seizureCount}回）`,
        metrics: { seizures: seizureCount },
        createdAt: now,
      });
    } else if (seizureCount >= ALERT_THRESHOLDS.SEIZURE_WARN) {
      alerts.push({
        id: generateAlertId(userId, date, 'seizure'),
        userId,
        date,
        type: 'seizure',
        level: 'warn',
        message: `てんかん発作（${seizureCount}回）`,
        metrics: { seizures: seizureCount },
        createdAt: now,
      });
    }

    // Hydration alert (future: if hydration data available)
    // For now, skip or use placeholder logic
  }

  if (alerts.length > 0) {
    await db.alerts.bulkPut(alerts);
  }
}
