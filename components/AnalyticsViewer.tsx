"use client"

import { useState } from "react"
import type { RecordsAnalyticsResponse } from "@/src/types/recordsAnalytics"

type AnalyticsViewerProps = {
  data: RecordsAnalyticsResponse | null
  isLoading: boolean
  error: string | null
}

export function AnalyticsViewer({ data, isLoading, error }: AnalyticsViewerProps) {
  const [showJson, setShowJson] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-blue-800">Loading analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-red-800 font-semibold">Error:</p>
        <p className="text-red-700 mt-1">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-600">Click "Fetch Analytics" to load data</p>
      </div>
    )
  }

  // Sort daily data by date (ascending)
  const sortedDaily = [...data.daily].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      {/* Period Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Analysis Period: {data.range.dateFrom} ～ {data.range.dateTo}
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Seizure Count Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">発作合計</p>
              <p className="text-3xl font-bold text-rose-600 mt-2">
                {data.summary.seizureCountTotal}
              </p>
              <p className="text-xs text-gray-500 mt-1">total seizures</p>
            </div>
            <div className="bg-rose-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Sleep Average Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">平均睡眠</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {data.summary.sleepMinsAvg}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                minutes ({Math.floor(data.summary.sleepMinsAvg / 60)}h {data.summary.sleepMinsAvg % 60}m)
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Meals Completed Card */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">食事完了合計</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {data.summary.mealsCompletedTotal}
              </p>
              <p className="text-xs text-gray-500 mt-1">completed meals</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
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
                    {day.sleepMins > 0 && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({Math.floor(day.sleepMins / 60)}h {day.sleepMins % 60}m)
                      </span>
                    )}
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

      {/* JSON Toggle Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Raw JSON Data</h2>
          <button
            onClick={() => setShowJson(!showJson)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm font-medium"
          >
            {showJson ? "非表示" : "表示"}
          </button>
        </div>
        {showJson && (
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs leading-relaxed border border-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
