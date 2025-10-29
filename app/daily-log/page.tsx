import Link from "next/link";
import DailyVitalsChart from "../../src/components/DailyVitalsChart";
import type { DailyLog } from "../../src/lib/daily-log";

export default function Page() {
  const log: DailyLog = {
    date: "2025-10-19",
    vitals: [
      { time: "2025-10-19T08:00:00+09:00", hr: 92, spo2: 95, rr: 20, temp: 36.8 },
      { time: "2025-10-19T10:00:00+09:00", hr: 88, spo2: 91, rr: 22, temp: 37.0 },
      { time: "2025-10-19T12:00:00+09:00", hr: 100, spo2: 96, rr: 19, temp: 36.9 },
      { time: "2025-10-19T14:00:00+09:00", hr: 86, spo2: 93, rr: 21, temp: 36.7 },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex gap-4 items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">日誌</h1>
        <div className="flex gap-2">
          <Link
            href="/daily-log/expression"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            😊 表情・反応記録（新UI）
          </Link>
          <Link
            href="/daily-log/seizure"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            ⚡ 発作記録（新UI）
          </Link>
        </div>
      </div>
      <DailyVitalsChart log={log} />
    </main>
  );
}
