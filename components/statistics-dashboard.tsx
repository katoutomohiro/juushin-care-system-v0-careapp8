"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataStorageService } from "@/services/data-storage-service"

interface StatisticsData {
  totalEvents: number
  eventsByType: { [key: string]: number }
  eventsByDate: { [key: string]: number }
  eventsByUser: { [key: string]: number }
  recentActivity: any[]
  weeklyTrend: { date: string; count: number }[]
}

interface StatisticsDashboardProps {
  selectedUser?: string
}

export function StatisticsDashboard({ selectedUser }: StatisticsDashboardProps) {
  const [stats, setStats] = useState<StatisticsData | null>(null)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")

  const eventTypeNames: { [key: string]: string } = {
    seizure: "発作記録",
    expression: "表情・反応",
    vitals: "バイタル",
    hydration: "水分補給",
    excretion: "排泄",
    activity: "活動",
    skin_oral_care: "皮膚・口腔ケア",
    tube_feeding: "経管栄養",
  }

  const calculateStatistics = () => {
    const allEvents = selectedUser
      ? DataStorageService.getCareEventsByUser(selectedUser)
      : DataStorageService.getAllCareEvents()

    // Filter by time range
    const now = new Date()
    const filteredEvents = allEvents.filter((event) => {
      const eventDate = new Date(event.timestamp)
      const daysDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (timeRange) {
        case "week":
          return daysDiff <= 7
        case "month":
          return daysDiff <= 30
        case "all":
        default:
          return true
      }
    })

    // Calculate statistics
    const eventsByType: { [key: string]: number } = {}
    const eventsByDate: { [key: string]: number } = {}
    const eventsByUser: { [key: string]: number } = {}

    filteredEvents.forEach((event) => {
      // By type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1

      // By date
      const date = new Date(event.timestamp).toDateString()
      eventsByDate[date] = (eventsByDate[date] || 0) + 1

      // By user
      eventsByUser[event.userId] = (eventsByUser[event.userId] || 0) + 1
    })

    // Weekly trend (last 7 days)
    const weeklyTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      weeklyTrend.push({
        date: date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
        count: eventsByDate[dateStr] || 0,
      })
    }

    // Recent activity (last 10 events)
    const recentActivity = filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    setStats({
      totalEvents: filteredEvents.length,
      eventsByType,
      eventsByDate,
      eventsByUser,
      recentActivity,
      weeklyTrend,
    })
  }

  useEffect(() => {
    calculateStatistics()
  }, [selectedUser, timeRange])

  if (!stats) {
    return <div>統計データを読み込み中...</div>
  }

  const maxCount = Math.max(...Object.values(stats.eventsByType))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 統計ダッシュボード</h2>
        <div className="flex gap-2">
          <Button variant={timeRange === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("week")}>
            1週間
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            1ヶ月
          </Button>
          <Button variant={timeRange === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("all")}>
            全期間
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総記録数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "week" ? "過去1週間" : timeRange === "month" ? "過去1ヶ月" : "全期間"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">記録種類数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Object.keys(stats.eventsByType).length}</div>
            <p className="text-xs text-muted-foreground">異なるケアイベント</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均記録数/日</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {timeRange === "week"
                ? Math.round((stats.totalEvents / 7) * 10) / 10
                : timeRange === "month"
                  ? Math.round((stats.totalEvents / 30) * 10) / 10
                  : Math.round((stats.totalEvents / Math.max(Object.keys(stats.eventsByDate).length, 1)) * 10) / 10}
            </div>
            <p className="text-xs text-muted-foreground">1日あたり</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ケアイベント別記録数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.eventsByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{eventTypeNames[type] || type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>週間推移</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.weeklyTrend.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.max((day.count / Math.max(...stats.weeklyTrend.map((d) => d.count), 1)) * 100, 5)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {!selectedUser && Object.keys(stats.eventsByUser).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>利用者別記録数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.eventsByUser)
                .sort(([, a], [, b]) => b - a)
                .map(([user, count]) => (
                  <div key={user} className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-muted-foreground">{user}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>最近の記録</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {eventTypeNames[event.eventType] || event.eventType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{event.userId}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("ja-JP")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">記録がありません</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
