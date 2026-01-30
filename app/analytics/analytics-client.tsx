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

  const fetchAnalytics = async () => {
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
        {/* Query Form */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">集計期間と絞り込み</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-foreground mb-2">開始日</label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-foreground mb-2">終了日</label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="careReceiverId" className="block text-sm font-medium text-foreground mb-2">利用者ID（オプション）</label>
              <input
                id="careReceiverId"
                type="text"
                placeholder="例: user-123"
                value={careReceiverId}
                onChange={(e) => setCareReceiverId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-foreground mb-2">サービスID（オプション）</label>
              <input
                id="serviceId"
                type="text"
                placeholder="例: service-456"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "読み込み中..." : "集計を実行"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md mb-6">
            <p className="font-medium">エラー</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Analytics Viewer */}
        <AnalyticsViewer data={data} isLoading={isLoading} error={error} />

        {!data && !error && !isLoading && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg">集計を実行するとデータが表示されます</p>
          </div>
        )}
      </main>
    </div>
  )
}
