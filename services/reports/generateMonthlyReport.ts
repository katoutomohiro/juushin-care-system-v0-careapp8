import { monthlyStats } from "../../hooks/useDiary";
import { db } from "../../lib/db";
import type { MonthlyReportData } from "../langchain/agent";
import { computeDailyAlerts } from "../alerts/computeDailyAlerts";
import { summarizeAlerts, type AlertSummary } from "../alerts/alertSummary";

export type MedicationSummary = {
  total: number;
  taken: number;
  missed: number;
  rate: number; // 0-100 (%), 小数1桁
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export async function generateMonthlyReport(
  ym: string,
  opts?: { userId?: string; serviceId?: string }
): Promise<MonthlyReportData & { userId?: string; serviceId?: string; startDate: string; endDate: string; medicationSummary?: MedicationSummary; alertSummary?: AlertSummary }> {
  const userId = opts?.userId || 'default';
  
  // Compute and save alerts for this month
  await computeDailyAlerts(ym, userId);
  
  const daysRaw = await monthlyStats(ym);
  const entries = daysRaw.length;
  const seizureCount = daysRaw.reduce((s: number, d: any) => s + (d.seizure || 0), 0);
  const avg = (arr: Array<number | null>) => {
    const nums = arr.filter((v): v is number => typeof v === 'number');
    if (nums.length === 0) return null;
    return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  // 服薬集計
  const startDate = `${ym}-01`;
  const endDate = `${ym}-31`;
  let meds = await db.table('medications')
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray() as Array<{ userId?: string; taken?: boolean }>;
  if (opts?.userId) {
    meds = meds.filter(m => m.userId === opts.userId);
  }
  const total = meds.length;
  const taken = meds.filter(m => !!m.taken).length;
  const missed = total - taken;
  const rate = total > 0 ? round1((taken / total) * 100) : 0;
  const medicationSummary: MedicationSummary | undefined = total > 0 ? { total, taken, missed, rate } : { total, taken, missed, rate };

  // Alert summary
  const alertSummary = await summarizeAlerts(ym, userId);

  const report: MonthlyReportData & { userId?: string; serviceId?: string; startDate: string; endDate: string; medicationSummary?: MedicationSummary; alertSummary?: AlertSummary } = {
    ym,
    totals: {
      entries,
      seizureCount,
      avgHeartRate: avg(daysRaw.map((d: any) => d.hr)),
      avgTemperature: avg(daysRaw.map((d: any) => d.temp)),
      avgSpO2: avg(daysRaw.map((d: any) => d.spO2)),
    },
    days: daysRaw.map((d: any) => ({
      date: d.date,
      hr: d.hr,
      temp: d.temp,
      spO2: d.spO2,
      seizure: d.seizure,
    })),
    userId: opts?.userId,
    serviceId: opts?.serviceId,
    startDate,
    endDate,
    medicationSummary,
    alertSummary,
  };

  return report;
}
