"use client"

import type { RecordsAnalyticsResponse } from "@/src/types/recordsAnalytics"
import { MetricChart } from "@/components/MetricChart"
import { SummaryCard } from "@/components/analytics/SummaryCard"

type AnalyticsViewerProps = {
  data: RecordsAnalyticsResponse | null
  isLoading: boolean
  error: string | null
}

export function AnalyticsViewer({ data, isLoading, error }: AnalyticsViewerProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-700 font-medium">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-6 shadow-sm">
        <div className="flex items-start space-x-3">
          <svg className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-semibold text-lg">エラーが発生しました</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.daily.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 shadow-sm text-center">
        <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600 text-lg font-medium">該当するデータがありません</p>
        <p className="text-gray-500 mt-2">条件を変更して集計を実行してください</p>
      </div>
    )
  }

  // Sort daily data by date (ascending)
  const sortedDaily = [...data.daily].sort((a, b) => a.date.localeCompare(b.date))

  // Prepare graph data
  const chartData = sortedDaily.map((day) => ({
    date: day.date,
    seizureCount: day.seizureCount ?? 0,
    sleepMins: day.sleepMins ?? 0,
    mealsCompleted: day.mealsCompleted ?? 0,
  }))

  // Summary cards configuration
  const summaryCards = [
    {
      title: "発作合計",
      value: data.summary.seizureCountTotal,
      description: "期間内の発作回数",
      color: "rose" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    {
      title: "平均睡眠",
      value: data.summary.sleepMinsAvg,
      description: data.summary.sleepMinsAvg
        ? `${Math.floor(data.summary.sleepMinsAvg / 60)}時間${data.summary.sleepMinsAvg % 60}分 / 日平均`
        : "—",
      color: "blue" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ),
    },
    {
      title: "食事完了",
      value: data.summary.mealsCompletedTotal,
      description: "期間内の食事完了回数",
      color: "green" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">集計結果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="border-b-2 border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-gray-900">推移グラフ</h2>
          <p className="text-sm text-gray-600 mt-1">期間内の日次データの推移を視覚化</p>
        </div>

        {/* Seizure Count Line Chart */}
        <MetricChart
          title="発作回数（推移）"
          description="日別の発作回数"
          data={chartData}
          xKey="date"
          yKey="seizureCount"
          chartType="line"
          yLabel="回"
          height={300}
          formatTooltipValue={(v) => `${v} 回`}
        />

        {/* Sleep Minutes Bar Chart */}
        <MetricChart
          title="睡眠（分）"
          description="日別の睡眠時間（分）"
          data={chartData}
          xKey="date"
          yKey="sleepMins"
          chartType="bar"
          yLabel="分"
          height={300}
          formatTooltipValue={(v) => `${v} 分`}
        />

        {/* Meals Completed Bar Chart */}
        <MetricChart
          title="食事回数"
          description="日別の食事完了回数"
          data={chartData}
          xKey="date"
          yKey="mealsCompleted"
          chartType="bar"
          yLabel="回"
          height={300}
          formatTooltipValue={(v) => `${v} 回`}
        />
      </div>

      {/* Daily Table */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">日別データ</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  発作回数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  睡眠(分)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  食事完了
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDaily.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {day.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {day.seizureCount ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {day.sleepMins ?? 0}
                    {day.sleepMins > 0 ? (
                      <span className="text-xs text-gray-400 ml-1">
                        ({Math.floor(day.sleepMins / 60)}h {day.sleepMins % 60}m)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {day.mealsCompleted ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Debug Section */}
      <details className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50">
          📋 Raw JSON Data（デバッグ用）
        </summary>
        <div className="px-6 pb-6 pt-2 border-t border-gray-200">
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs leading-relaxed border border-gray-300 max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  )
}
