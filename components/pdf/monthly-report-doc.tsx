import type { MonthlyReportData } from '../../reports/generateMonthlyReport';

interface MonthlyReportDocProps {
  data: MonthlyReportData;
}

export function MonthlyReportDoc({ data }: MonthlyReportDocProps) {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:shadow-none shadow-lg">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">月次レポート: {data.ym}</h1>
        <p className="text-sm text-gray-600">重症心身障がい児者支援システム</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm">記録件数</div>
          <div className="text-2xl font-bold text-gray-900">{data.totals.entries}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm">発作回数</div>
          <div className="text-2xl font-bold text-rose-600">{data.totals.seizureCount}</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm">平均SpO2</div>
          <div className="text-2xl font-bold text-emerald-600">{data.totals.avgSpO2 ?? '-'}%</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 p-3 rounded">日別サマリー</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 border-b text-left">日付</th>
                <th className="px-3 py-2 border-b text-right">HR</th>
                <th className="px-3 py-2 border-b text-right">体温</th>
                <th className="px-3 py-2 border-b text-right">SpO2</th>
                <th className="px-3 py-2 border-b text-right">発作</th>
              </tr>
            </thead>
            <tbody>
              {data.days.map((d) => (
                <tr key={d.date} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{d.date}</td>
                  <td className="px-3 py-2 border-b text-right">{d.hr ?? '-'}</td>
                  <td className="px-3 py-2 border-b text-right">{d.temp ?? '-'}</td>
                  <td className="px-3 py-2 border-b text-right">{d.spO2 ?? '-'}</td>
                  <td className="px-3 py-2 border-b text-right">{d.seizure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        生成日時: {new Date().toLocaleString('ja-JP')} | 重症心身障がい児者支援システム v1.0
      </div>
    </div>
  );
}
