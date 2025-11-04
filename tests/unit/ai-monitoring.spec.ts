import { describe, it, expect } from 'vitest';
import { movingAverage, zScores, thresholdAlerts, analyzeVitals, type TimePoint } from '../../services/ai-monitoring';

describe('ai-monitoring', () => {
  const series: TimePoint[] = [
    { t: 't1', v: 80 },
    { t: 't2', v: 82 },
    { t: 't3', v: 100 },
    { t: 't4', v: 78 },
    { t: 't5', v: 76 },
  ];

  it('movingAverage produces smoothed series', () => {
    const ma = movingAverage(series, 3);
    expect(ma[0]).toBeCloseTo(80);
    expect(ma[2]).toBeCloseTo((80+82+100)/3);
  });

  it('zScores produce near zero for constant window', () => {
    const z = zScores([{t:'a', v: 1},{t:'b', v: 1},{t:'c', v: 1},{t:'d', v: 1}], 3);
    // The last z should be 0 due to zero stddev handling
    expect(z[z.length - 1]).toBe(0);
  });

  it('thresholdAlerts flags warn/crit', () => {
    const alerts = thresholdAlerts(series, { warnHigh: 90, critLow: 77 });
    expect(alerts.some(a => a.level === 'warn')).toBe(true);
    expect(alerts.some(a => a.level === 'crit')).toBe(true);
  });

  it('analyzeVitals aggregates metrics', () => {
    const res = analyzeVitals(series, { window: 2, thresholds: { warnHigh: 90 } });
    expect(res.ma.length).toBe(series.length);
    expect(res.z.length).toBe(series.length);
    expect(Array.isArray(res.alerts)).toBe(true);
  });
});
