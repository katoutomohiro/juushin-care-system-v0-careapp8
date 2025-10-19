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
    <main className="max-w-4xl mx-auto p-4">
      <DailyVitalsChart log={log} />
    </main>
  );
}
