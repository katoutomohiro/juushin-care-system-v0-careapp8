'use client';
import { useEffect, useState } from 'react';
import { monthlyStats } from '../../../hooks/useDiary';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const HR_THRESHOLD_HIGH = 100;
const HR_THRESHOLD_LOW = 60;
const TEMP_THRESHOLD_HIGH = 37.5;
const TEMP_THRESHOLD_LOW = 36.0;

export default function Monthly() {
  const [data, setData] = useState<any[]>([]);
  const ym = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState<string>(ym);
  const [serviceId, setServiceId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    monthlyStats(month).then((stats) => {
      // 日付ごとに集計
      const grouped = stats.reduce((acc: any, item: any) => {
        if (!acc[item.date]) {
          acc[item.date] = { date: item.date, hrSum: 0, hrCount: 0, tempSum: 0, tempCount: 0, seizures: 0 };
        }
        if (item.hr !== null) {
          acc[item.date].hrSum += item.hr;
          acc[item.date].hrCount += 1;
        }
        if (item.temp !== null) {
          acc[item.date].tempSum += item.temp;
          acc[item.date].tempCount += 1;
        }
        if (item.seizure) acc[item.date].seizures += 1;
        return acc;
      }, {});

      const result = Object.keys(grouped).map((date) => {
        const g = grouped[date];
        const avgHr = g.hrCount > 0 ? (g.hrSum / g.hrCount).toFixed(1) : null;
        const avgTemp = g.tempCount > 0 ? (g.tempSum / g.tempCount).toFixed(1) : null;
        return {
          date: date.slice(5), // MM-DD
          hr: avgHr ? parseFloat(avgHr) : null,
          temp: avgTemp ? parseFloat(avgTemp) : null,
          seizures: g.seizures,
        };
      });

      setData(result);
    });
  }, [month]);

  async function handleDownloadAIReport() {
    try {
      setDownloading(true);
      const { generateMonthlyReport } = await import('../../../services/reports/generateMonthlyReport');
      const reportData = await generateMonthlyReport(month, { userId, serviceId });

      const { generateMonthlyReportPDF } = await import('../../../components/pdf/monthly-report-doc');
      const blob = await generateMonthlyReportPDF(reportData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
  a.download = `monthly-report-ai-${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate AI monthly PDF', e);
      alert('PDF生成に失敗しました。しばらくしてから再度お試しください。');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">Monthly Vitals ({month})</h1>
        <div className="flex items-end gap-3">
          <div className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">対象月</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded px-2 py-1" aria-label="対象月" />
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">Service ID</label>
            <input value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="border rounded px-2 py-1" placeholder="svc_..." aria-label="Service ID" />
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-gray-600 mb-1">User ID</label>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} className="border rounded px-2 py-1" placeholder="usr_..." aria-label="User ID" />
          </div>
          <button onClick={handleDownloadAIReport} disabled={downloading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50" aria-busy={downloading} aria-live="polite">
            {downloading ? '生成中…' : 'AI月次要約PDF'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Heart Rate (bpm)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[40, 120]} />
            <Tooltip />
            <ReferenceLine y={HR_THRESHOLD_HIGH} stroke="red" strokeDasharray="3 3" label="High" />
            <ReferenceLine y={HR_THRESHOLD_LOW} stroke="blue" strokeDasharray="3 3" label="Low" />
            <Line
              type="monotone"
              dataKey="hr"
              stroke="#8884d8"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isAlert = payload.hr > HR_THRESHOLD_HIGH || payload.hr < HR_THRESHOLD_LOW;
                return (
                  <circle cx={cx} cy={cy} r={4} fill={isAlert ? 'red' : '#8884d8'} />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Temperature (°C)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[35, 39]} />
            <Tooltip />
            <ReferenceLine y={TEMP_THRESHOLD_HIGH} stroke="red" strokeDasharray="3 3" label="High" />
            <ReferenceLine y={TEMP_THRESHOLD_LOW} stroke="blue" strokeDasharray="3 3" label="Low" />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isAlert = payload.temp > TEMP_THRESHOLD_HIGH || payload.temp < TEMP_THRESHOLD_LOW;
                return (
                  <circle cx={cx} cy={cy} r={4} fill={isAlert ? 'red' : '#82ca9d'} />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Seizure Count</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="seizures" fill="#ff7c7c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

