"use client"

import { useEffect, useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { buildSummary } from "@/src/types/caseRecord"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 未選択を表現するダミー値
const NONE = "__none__"

interface CaseRecord {
  id: string
  serviceId: string
  careReceiverId: string
  recordDate: string
  recordTime: string | null
  mainStaffId: string | null
  mainStaffName: string | null
  subStaffId: string | null
  subStaffName: string | null
  createdAt: string
  updatedAt: string
  recordData: any
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
  const toastRef = useRef(toast)
  // keep latest toast in ref so we don't need to include it in effect deps
  useEffect(() => {
    toastRef.current = toast
  }, [toast])
  const [records, setRecords] = useState<CaseRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<CaseRecord | null>(null)
  const [filterDate, setFilterDate] = useState<string>("")
  const [filterMainStaffId, setFilterMainStaffId] = useState<string>("")
  const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(`/api/staff?serviceId=${serviceId}`, { cache: "no-store" })
        const result = await response.json()
        if (response.ok && Array.isArray(result.staffOptions)) {
          setStaffOptions(result.staffOptions)
        }
      } catch (error) {
        console.error("[CaseRecordsListClient] staff fetch error", error)
      }
    }
    void fetchStaff()
  }, [serviceId])

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          serviceId,
          careReceiverId,
          limit: "50",
          offset: "0",
        })

        if (filterDate) params.set("date", filterDate)
        if (filterMainStaffId) params.set("mainStaffId", filterMainStaffId)

        const response = await fetch(`/api/case-records/list?${params}`, { signal })
        const data = await response.json()

        if (process.env.NODE_ENV === "development") {
          console.log("[CaseRecordsListClient] Fetched:", data)
        }

        if (!data.ok) {
          const errorMsg = data.detail || data.error || "不明なエラーが発生しました"
          setError(errorMsg)
          toastRef.current?.({
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
        // skip reporting for abort errors
        if ((err as any)?.name === 'AbortError') return
        toastRef.current?.({
          variant: "destructive",
          title: "保存済み記録の取得に失敗しました",
          description: errorMsg,
        })
      } finally {
        setIsLoading(false)
      }
    }

    const controller = new AbortController()
    const signal = controller.signal
    // call fetch (pass signal via closure variable)
    void fetchRecords()

    return () => {
      controller.abort()
    }
  }, [serviceId, careReceiverId, refreshKey, filterDate, filterMainStaffId])

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
        <div className="flex flex-col gap-3">
          <CardTitle>保存済み記録一覧 ({records.length}件)</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">日付</span>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="h-9 w-44"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">主担当</span>
              <Select value={filterMainStaffId || NONE} onValueChange={(v) => setFilterMainStaffId(v === NONE ? "" : v)}>
                <SelectTrigger className="h-9 w-52">
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>すべて</SelectItem>
                  {staffOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFilterDate(""); setFilterMainStaffId("") }}>
              クリア
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {records.map((record) => {
            const displayDate = record.recordDate ? new Date(record.recordDate).toLocaleDateString("ja-JP") : "--"
            const displayTime = record.recordTime || "--:--"
            // mainStaffName優先、null安全（— で表示）
            const mainStaffDisplay = record.mainStaffName ? `[主: ${record.mainStaffName}]` : "[主: —]"
            const subStaffDisplay = record.subStaffName ? `[副: ${record.subStaffName}]` : ""
            // Handle record_data that might be string (backward compat)
            let recordPayload: any = record.recordData
            if (typeof recordPayload === "string") {
              try {
                recordPayload = JSON.parse(recordPayload)
              } catch {
                recordPayload = null
              }
            }
            const summary = buildSummary(recordPayload)
            const displaySummary = summary || "（記録なし）"

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
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{mainStaffDisplay}</span>
                      {subStaffDisplay && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{subStaffDisplay}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{displaySummary}</div>
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
                            {JSON.stringify(record.recordData, null, 2)}
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
