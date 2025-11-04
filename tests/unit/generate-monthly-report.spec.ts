import { describe, it, expect, vi } from 'vitest';

vi.mock('../../hooks/useDiary', () => ({
  monthlyStats: vi.fn(async () => [
    { date: '2025-11-01', hr: 80, temp: 36.7, spO2: 98, seizure: 0 },
    { date: '2025-11-02', hr: 90, temp: 37.1, spO2: 97, seizure: 1 },
  ]),
}));

import { generateMonthlyReport } from '../../reports/generateMonthlyReport';

describe('generateMonthlyReport', () => {
  it('aggregates averages and totals', async () => {
    const data = await generateMonthlyReport('2025-11');
    expect(data.totals.entries).toBe(2);
    expect(data.totals.seizureCount).toBe(1);
    expect(data.totals.avgHeartRate).toBeCloseTo(85);
    expect(data.days.length).toBe(2);
  });
});
