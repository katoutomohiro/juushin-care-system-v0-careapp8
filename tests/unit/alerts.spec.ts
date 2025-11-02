import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../lib/db';
import { computeDailyAlerts } from '../../services/alerts/computeDailyAlerts';
import { summarizeAlerts } from '../../services/alerts/alertSummary';
import { ALERT_THRESHOLDS } from '../../services/alerts/constants';

describe('Alert computation', () => {
  beforeEach(async () => {
    // Clear alerts table
    await db.alerts.clear();
    await db.diaryEntries.clear();
  });

  afterEach(async () => {
    await db.alerts.clear();
    await db.diaryEntries.clear();
  });

  it('generates fever alert when temp >= 37.5', async () => {
    // Setup: Create diary entry with high temp
    const date = '2025-10-15';
    await db.diaryEntries.put({
      id: 'test-1',
      date,
      records: [{ time: '10:00', temperature: 37.8 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await computeDailyAlerts('2025-10', 'test-user');

    const alerts = await db.alerts.where('userId').equals('test-user').toArray();
    expect(alerts.length).toBeGreaterThan(0);
    const feverAlert = alerts.find(a => a.message.includes('発熱') || a.message.includes('高体温'));
    expect(feverAlert).toBeDefined();
    expect(feverAlert?.level).toBe('warn');
  });

  it('generates critical fever alert when temp >= 38.0', async () => {
    const date = '2025-10-16';
    await db.diaryEntries.put({
      id: 'test-2',
      date,
      records: [{ time: '14:00', temperature: 38.5 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await computeDailyAlerts('2025-10', 'test-user');

    const alerts = await db.alerts.where('userId').equals('test-user').toArray();
    const criticalFever = alerts.find(a => a.level === 'critical' && a.type === 'vital');
    expect(criticalFever).toBeDefined();
    expect(criticalFever?.message).toContain('高体温');
  });

  it('generates seizure alert when seizure count >= 1', async () => {
    const date = '2025-10-17';
    await db.diaryEntries.put({
      id: 'test-3',
      date,
      records: [
        { time: '08:00', seizureType: 'focal' },
        { time: '12:00', seizureType: 'generalized' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await computeDailyAlerts('2025-10', 'test-user');

    const alerts = await db.alerts.where('userId').equals('test-user').toArray();
    const seizureAlert = alerts.find(a => a.type === 'seizure');
    expect(seizureAlert).toBeDefined();
    expect(seizureAlert?.message).toContain('てんかん');
  });

  it('generates critical seizure alert when count >= 3', async () => {
    const date = '2025-10-18';
    await db.diaryEntries.put({
      id: 'test-4',
      date,
      records: [
        { time: '08:00', seizureType: 'focal' },
        { time: '12:00', seizureType: 'focal' },
        { time: '16:00', seizureType: 'generalized' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await computeDailyAlerts('2025-10', 'test-user');

    const alerts = await db.alerts.where('userId').equals('test-user').toArray();
    const criticalSeizure = alerts.find(a => a.type === 'seizure' && a.level === 'critical');
    expect(criticalSeizure).toBeDefined();
    expect(criticalSeizure?.message).toContain('多発');
  });

  it('generates hypothermia alert when temp <= 35.5', async () => {
    const date = '2025-10-19';
    await db.diaryEntries.put({
      id: 'test-5',
      date,
      records: [{ time: '06:00', temperature: 35.2 }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await computeDailyAlerts('2025-10', 'test-user');

    const alerts = await db.alerts.where('userId').equals('test-user').toArray();
    const hypoAlert = alerts.find(a => a.message.includes('低体温'));
    expect(hypoAlert).toBeDefined();
    expect(hypoAlert?.level).toBe('warn');
  });
});

describe('Alert summary', () => {
  beforeEach(async () => {
    await db.alerts.clear();
  });

  afterEach(async () => {
    await db.alerts.clear();
  });

  it('counts warn and critical days correctly', async () => {
    await db.alerts.bulkPut([
      {
        id: 'a1',
        userId: 'test',
        date: '2025-10-01',
        type: 'vital',
        level: 'warn',
        message: '発熱傾向',
        createdAt: Date.now(),
      },
      {
        id: 'a2',
        userId: 'test',
        date: '2025-10-02',
        type: 'seizure',
        level: 'critical',
        message: 'てんかん発作多発',
        createdAt: Date.now(),
      },
      {
        id: 'a3',
        userId: 'test',
        date: '2025-10-02',
        type: 'vital',
        level: 'warn',
        message: '低体温傾向',
        createdAt: Date.now(),
      },
    ]);

    const summary = await summarizeAlerts('2025-10', 'test');
    expect(summary.warnDays).toBe(2); // day 01 and 02 both have warn
    expect(summary.criticalDays).toBe(1); // only day 02
    expect(summary.seizureDays).toBe(1);
  });

  it('handles empty alerts', async () => {
    const summary = await summarizeAlerts('2025-10', 'nonexistent');
    expect(summary.warnDays).toBe(0);
    expect(summary.criticalDays).toBe(0);
    expect(summary.feverDays).toBe(0);
    expect(summary.hypothermiaDays).toBe(0);
    expect(summary.seizureDays).toBe(0);
    expect(summary.hydrationLowDays).toBe(0);
  });
});
