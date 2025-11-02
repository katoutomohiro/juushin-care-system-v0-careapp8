import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '../../lib/db';
import { computeDailyAlerts } from '../../services/alerts/computeDailyAlerts';
import { summarizeAlerts } from '../../services/alerts/alertSummary';
import { ALERT_THRESHOLDS } from '../../services/alerts/constants';
import { createEntry, updateEntry } from '../../hooks/useDiary';

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

describe('Alert filtering and sorting', () => {
  beforeEach(async () => {
    await db.alerts.clear();
  });

  afterEach(async () => {
    await db.alerts.clear();
  });

  it('filters alerts by date range (7 days)', async () => {
    const today = new Date();
    const dates = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });

    await db.alerts.bulkPut(
      dates.map((date, idx) => ({
        id: `alert-${idx}`,
        userId: 'user1',
        date,
        type: 'vital' as const,
        level: 'warn' as const,
        message: 'test',
        createdAt: Date.now() - idx * 86400000,
      }))
    );

    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    const filtered = await db.alerts
      .where('userId').equals('user1')
      .and(a => a.date >= cutoffDate)
      .toArray();

    expect(filtered.length).toBe(8); // today + 7 days back = 8 days
  });

  it('filters alerts by type', async () => {
    await db.alerts.bulkPut([
      {
        id: 't1',
        userId: 'user1',
        date: '2025-10-01',
        type: 'vital',
        level: 'warn',
        message: 'vital msg',
        createdAt: Date.now(),
      },
      {
        id: 't2',
        userId: 'user1',
        date: '2025-10-02',
        type: 'seizure',
        level: 'critical',
        message: 'seizure msg',
        createdAt: Date.now(),
      },
      {
        id: 't3',
        userId: 'user1',
        date: '2025-10-03',
        type: 'vital',
        level: 'info',
        message: 'vital info',
        createdAt: Date.now(),
      },
    ]);

    const vitalOnly = await db.alerts.where('userId').equals('user1').and(a => a.type === 'vital').toArray();
    expect(vitalOnly.length).toBe(2);
  });

  it('filters alerts by level', async () => {
    await db.alerts.bulkPut([
      {
        id: 'l1',
        userId: 'user1',
        date: '2025-10-01',
        type: 'vital',
        level: 'warn',
        message: 'warn',
        createdAt: Date.now(),
      },
      {
        id: 'l2',
        userId: 'user1',
        date: '2025-10-02',
        type: 'vital',
        level: 'critical',
        message: 'critical',
        createdAt: Date.now(),
      },
      {
        id: 'l3',
        userId: 'user1',
        date: '2025-10-03',
        type: 'vital',
        level: 'info',
        message: 'info',
        createdAt: Date.now(),
      },
    ]);

    const criticalOnly = await db.alerts.where('userId').equals('user1').and(a => a.level === 'critical').toArray();
    expect(criticalOnly.length).toBe(1);
    expect(criticalOnly[0].level).toBe('critical');
  });

  it('sorts alerts by createdAt descending', async () => {
    await db.alerts.bulkPut([
      {
        id: 's1',
        userId: 'user1',
        date: '2025-10-01',
        type: 'vital',
        level: 'warn',
        message: 'oldest',
        createdAt: 1000,
      },
      {
        id: 's2',
        userId: 'user1',
        date: '2025-10-02',
        type: 'vital',
        level: 'warn',
        message: 'newest',
        createdAt: 3000,
      },
      {
        id: 's3',
        userId: 'user1',
        date: '2025-10-03',
        type: 'vital',
        level: 'warn',
        message: 'middle',
        createdAt: 2000,
      },
    ]);

    const sorted = (await db.alerts.where('userId').equals('user1').toArray()).sort((a, b) => b.createdAt - a.createdAt);
    expect(sorted[0].message).toBe('newest');
    expect(sorted[2].message).toBe('oldest');
  });

  it('sorts alerts by level priority (critical > warn > info)', async () => {
    await db.alerts.bulkPut([
      {
        id: 'p1',
        userId: 'user1',
        date: '2025-10-01',
        type: 'vital',
        level: 'info',
        message: 'info',
        createdAt: Date.now(),
      },
      {
        id: 'p2',
        userId: 'user1',
        date: '2025-10-02',
        type: 'vital',
        level: 'critical',
        message: 'critical',
        createdAt: Date.now(),
      },
      {
        id: 'p3',
        userId: 'user1',
        date: '2025-10-03',
        type: 'vital',
        level: 'warn',
        message: 'warn',
        createdAt: Date.now(),
      },
    ]);

    const levelPriority = { critical: 3, warn: 2, info: 1 };
    const sorted = (await db.alerts.where('userId').equals('user1').toArray()).sort(
      (a, b) => (levelPriority[b.level] || 0) - (levelPriority[a.level] || 0)
    );

    expect(sorted[0].level).toBe('critical');
    expect(sorted[1].level).toBe('warn');
    expect(sorted[2].level).toBe('info');
  });
});

describe('Alert notifications on save (S-04)', () => {
  beforeEach(async () => {
    await db.alerts.clear();
    await db.diaryEntries.clear();
    // Mock Notification & Service Worker
    (globalThis as any).Notification = { permission: 'granted', requestPermission: () => Promise.resolve('granted') };
    (globalThis as any).navigator = {
      serviceWorker: {
        ready: Promise.resolve({ showNotification: vi.fn() } as any)
      }
    } as any;
  });

  afterEach(async () => {
    await db.alerts.clear();
    await db.diaryEntries.clear();
  });

  it('notifies once for new warn alert and does not duplicate on same-level recompute', async () => {
    const date = '2025-10-21';
    // 1st save: temp 37.6 → warn expected
    await createEntry({ date, records: [{ time: '09:00', temperature: 37.6 }] });
    const reg1: any = await (navigator as any).serviceWorker.ready;
    expect(reg1.showNotification).toHaveBeenCalledTimes(1);
    // 2nd save: another record but still warn (no upgrade) → no additional notify
    await createEntry({ date, records: [{ time: '12:00', temperature: 37.7 }] });
    const reg2: any = await (navigator as any).serviceWorker.ready;
    expect(reg2.showNotification).toHaveBeenCalledTimes(1);
  });

  it('notifies again when level upgrades to critical', async () => {
    const date = '2025-10-22';
    // initial warn
    await createEntry({ date, records: [{ time: '08:00', temperature: 37.6 }] });
    const reg1: any = await (navigator as any).serviceWorker.ready;
    expect(reg1.showNotification).toHaveBeenCalledTimes(1);
    // upgrade to critical
    await createEntry({ date, records: [{ time: '13:00', temperature: 38.1 }] });
    const reg2: any = await (navigator as any).serviceWorker.ready;
    expect(reg2.showNotification).toHaveBeenCalledTimes(2);
  });
});
