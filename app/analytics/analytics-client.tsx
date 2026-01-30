"use client"

import { useState, useEffect } from "react"
import type { RecordsAnalyticsResponse } from "@/src/types/recordsAnalytics"
import { AnalyticsViewer } from "@/components/AnalyticsViewer"

export default function AnalyticsPageClient() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [careReceiverId, setCareReceiverId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [data, setData] = useState<RecordsAnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Set default dates on mount
  useEffect(() => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    setDateFrom(formatDate(sevenDaysAgo))
    setDateTo(formatDate(today))
  }, [])

  const validateInputs = (): boolean => {
    if (!dateFrom || !dateTo) {
      setValidationError("開始日と終了日を入力してください")
      return false
    }
    if (dateFrom > dateTo) {
      setValidationError("開始日は終了日より前である必要があります")
      return false
    }
    setValidationError(null)
    return true
  }

  const handleReset = () => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    setDateFrom(formatDate(sevenDaysAgo))
    setDateTo(formatDate(today))
    setCareReceiverId("")
    setServiceId("")
    setData(null)
    setError(null)
    setValidationError(null)
  }

  const fetchAnalytics = async () => {
    if (!validateInputs()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append("dateFrom", dateFrom)
      if (dateTo) params.append("dateTo", dateTo)
      if (careReceiverId.trim()) params.append("careReceiverId", careReceiverId)
      if (serviceId.trim()) params.append("serviceId", serviceId)

      const response = await fetch(`/api/case-records/analytics?${params.toString()}`)

      if (!response.ok) {
        const errorBody = await response.json()
        throw new Error(errorBody.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      if (result.ok && result.data) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Unknown error")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics"
      setError(errorMessage)
      console.error("Analytics fetch error:", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Records Analytics</h1>
          <p className="text-muted-foreground mt-1">ケア記録の期間別集計と分析</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Query Form Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">集計条件</h2>
              <p className="text-sm text-gray-600 mt-1">期間と絞り込み条件を設定してください</p>
            </div>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              リセット
            </button>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-semibold text-gray-900 mb-2">
                📅 開始日 <span className="text-red-600">*</span>
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-semibold text-gray-900 mb-2">
                📅 終了日 <span className="text-red-600">*</span>
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Optional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="careReceiverId" className="block text-sm font-semibold text-gray-900 mb-2">
                👤 利用者ID（オプション）
              </label>
              <input
                id="careReceiverId"
                type="text"
                placeholder="例: abc123def"
                value={careReceiverId}
                onChange={(e) => setCareReceiverId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="serviceId" className="block text-sm font-semibold text-gray-900 mb-2">
                🏥 サービスID（オプション）
              </label>
              <input
                id="serviceId"
                type="text"
                placeholder="例: service-789"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
              <p className="text-sm text-yellow-800 font-medium">⚠️ {validationError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "読み込み中..." : "📊 集計を実行"}
            </button>
          </div>
        </div>

        {/* API Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-start space-x-3">
              <svg className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">集計エラー</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Viewer */}
        <AnalyticsViewer data={data} isLoading={isLoading} error={error} />

        {!data && !error && !isLoading && (
          <div className="text-center text-gray-500 py-16">
            <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">条件を設定して集計ボタンを押してください</p>
            <p className="text-sm mt-2">期間内のケア記録が分析表示されます</p>
          </div>
        )}
      </main>
    </div>
  )
}
