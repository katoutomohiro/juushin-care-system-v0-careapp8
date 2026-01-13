"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { buildSummary } from "@/src/types/caseRecord"

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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<CaseRecord | null>(null)

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

        if (process.env.NODE_ENV === "development") {
          console.log("[CaseRecordsListClient] Fetched:", data)
        }

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
  }, [serviceId, careReceiverId, refreshKey])

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
            // Handle record_data that might be string (backward compat)
            let recordPayload: any = record.record_data
            if (typeof recordPayload === "string") {
              try {
                recordPayload = JSON.parse(recordPayload)
              } catch {
                recordPayload = null
              }
            }
            const summary = buildSummary(recordPayload)

            return (
              <div
                key={record.id}
                className="border border-border rounded-md px-4 py-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                      <span>{displayDate}</span>
                      <span className="text-muted-foreground">{displayTime}</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{summary}</div>
                  </div>
                  <Dialog open={detailDialogOpen && selectedRecord?.id === record.id} onOpenChange={(open) => {
                    setDetailDialogOpen(open)
                    if (!open) setSelectedRecord(null)
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record)
                          setDetailDialogOpen(true)
                        }}
                      >
                        詳細
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>記録詳細 - {displayDate} {displayTime}</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="bg-muted rounded-md p-4 font-mono text-xs">
                          <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                            {JSON.stringify(record.record_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
