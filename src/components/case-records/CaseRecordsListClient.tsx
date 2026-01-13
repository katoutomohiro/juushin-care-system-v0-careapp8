"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface CaseRecord {
  id: string
  service_id: string
  care_receiver_id: string
  record_date: string
  record_time: string | null
  created_at: string
  updated_at: string
  record_data: any
}

export function CaseRecordsListClient({
  serviceId,
  careReceiverId,
  refreshKey = 0,
}: {
  serviceId: string
  careReceiverId: string
  refreshKey?: number
}) {
  const { toast } = useToast()
  const [records, setRecords] = useState<CaseRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          serviceId,
          careReceiverId,
          limit: "20",
          offset: "0",
        })

        const response = await fetch(`/api/case-records?${params}`)
        const data = await response.json()

        console.log("[CaseRecordsListClient] Fetched:", data)

        if (!data.ok) {
          const errorMsg = data.detail || data.error || "不明なエラーが発生しました"
          setError(errorMsg)
          toast({
            variant: "destructive",
            title: "保存済み記録の取得に失敗しました",
            description: errorMsg,
          })
          return
        }

        setRecords(data.records || [])
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "ネットワークエラーが発生しました"
        console.error("[CaseRecordsListClient] Error:", errorMsg)
        setError(errorMsg)
        toast({
          variant: "destructive",
          title: "保存済み記録の取得に失敗しました",
          description: errorMsg,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [serviceId, careReceiverId, refreshKey, toast])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>保存済み記録一覧</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            保存済み記録一覧
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-800">
          <p className="font-semibold mb-2">エラーが発生しました</p>
          <p className="text-sm mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            再読み込み
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>保存済み記録一覧</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>保存済みの記録がありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>保存済み記録一覧 ({records.length}件)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {records.map((record) => {
            const displayDate = record.record_date ? new Date(record.record_date).toLocaleDateString("ja-JP") : "--"
            const displayTime = record.record_time || "--:--"
            const createdAt = new Date(record.created_at).toLocaleString("ja-JP")
            const expanded = expandedId === record.id

            return (
              <div
                key={record.id}
                className="border border-border rounded-md overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">ID: <span className="font-mono">{record.id}</span></div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span>{displayDate}</span>
                      <span className="text-muted-foreground">{displayTime}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">作成: {createdAt}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setExpandedId(expanded ? null : record.id)}>
                    {expanded ? "閉じる" : "詳細"}
                  </Button>
                </div>

                {expanded && (
                  <div className="border-t border-border px-4 py-3 bg-muted/20">
                    <div className="bg-background rounded p-3 font-mono text-xs max-h-96 overflow-auto">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(record.record_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
