'use client';
import { useEffect, useState } from 'react';
import { monthlyStats } from '../../../hooks/useDiary';
import { generateMonthlyReport, type MonthlyReportData } from '../../../reports/generateMonthlyReport';
import { MonthlyReportDoc } from '../../../components/pdf/monthly-report-doc';
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
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const ym = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    monthlyStats(ym).then((stats) => {
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
  }, [ym]);

  const handlePrint = async () => {
    const report = await generateMonthlyReport(ym);
    setReportData(report);
    setShowPrintModal(true);
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setReportData(null);
  };

  const handlePrintNow = () => {
    window.print();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Vitals ({ym})</h1>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden"
          aria-label="月次レポートを印刷"
        >
          📄 印刷用レポート
        </button>
      </div>

      {showPrintModal && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-auto p-6 relative">
            <button
              onClick={handleClosePrintModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
              aria-label="閉じる"
            >
              ✕
            </button>
            <div className="mb-4 flex justify-end space-x-2">
              <button
                onClick={handlePrintNow}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                🖨️ 印刷実行
              </button>
            </div>
            <MonthlyReportDoc data={reportData} />
          </div>
        </div>
      )}

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

