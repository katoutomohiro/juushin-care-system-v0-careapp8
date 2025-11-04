import { monthlyStats } from '../hooks/useDiary';

export type MonthlyReportData = {
  ym: string; // YYYY-MM
  totals: {
    entries: number;
    seizureCount: number;
    avgHeartRate: number | null;
    avgTemperature: number | null;
    avgSpO2: number | null;
  };
  days: Array<{
    date: string;
    hr: number | null;
    temp: number | null;
    spO2: number | null;
    seizure: number; // 0/1
  }>;
};

export async function generateMonthlyReport(ym: string): Promise<MonthlyReportData> {
  const days = await monthlyStats(ym);
  const vals = (key: 'hr'|'temp'|'spO2') => days.map(d => d[key]).filter((v): v is number => v != null);
  const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;

  return {
    ym,
    totals: {
      entries: days.length,
      seizureCount: days.reduce((a,b)=> a + (b.seizure||0), 0),
      avgHeartRate: avg(vals('hr')),
      avgTemperature: avg(vals('temp')),
      avgSpO2: avg(vals('spO2')),
    },
    days,
  };
}
