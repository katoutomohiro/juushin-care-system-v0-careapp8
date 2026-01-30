"use client"

import { useState, useEffect } from "react"
import type { RecordsAnalyticsResponse } from "@/src/types/recordsAnalytics"
import { AnalyticsViewer } from "@/components/AnalyticsViewer"

export default function AnalyticsPage() {
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
        throw new Error(result.error || "Failed to fetch analytics")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Records Analytics</h1>

      {/* Query Parameters */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Filter Parameters</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From (YYYY-MM-DD)
            </label>
            <input
              type="text"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To (YYYY-MM-DD)
            </label>
            <input
              type="text"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Care Receiver ID (UUID, optional)
            </label>
            <input
              type="text"
              value={careReceiverId}
              onChange={(e) => setCareReceiverId(e.target.value)}
              placeholder="Leave empty to skip"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service ID (UUID, optional)
            </label>
            <input
              type="text"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              placeholder="Leave empty to skip"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Loading..." : "Fetch Analytics"}
        </button>
      </div>

      {/* Analytics Viewer Component */}
      <AnalyticsViewer data={data} isLoading={isLoading} error={error} />
    </div>
  )
}
