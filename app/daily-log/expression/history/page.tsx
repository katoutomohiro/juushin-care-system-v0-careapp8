"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { listExpressionLogs, getExpressionLog, updateExpressionLog, deleteExpressionLog, type ExpressionLog } from "@/lib/persistence/expression"
import { exportAsCsv } from "@/lib/exporter/csv"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// styles are defined inside PdfExportButton to avoid SSR issues

const PdfExportButton = dynamic(() => import("./PdfExportButton"), { ssr: false }) as any

export default function ExpressionHistoryPage() {
  const [logs, setLogs] = useState<ExpressionLog[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [expression, setExpression] = useState("")
  const [userId, setUserId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [start, setStart] = useState<string>("")
  const [end, setEnd] = useState<string>("")

  const csvHref = useMemo(() => {
    return exportAsCsv(
      logs,
      ["occurredAt", "expression", "reaction", "intervention", "discomfort", "note", "serviceId", "userId"],
      (l) => [l.occurredAt, l.expression, l.reaction ?? "", l.intervention ?? "", l.discomfort ?? "", l.note ?? "", l.serviceId ?? "", l.userId ?? ""]
    )
  }, [logs])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const list = await listExpressionLogs({ start: start || undefined, end: end || undefined, expression: expression || undefined, userId: userId || undefined, serviceId: serviceId || undefined, keyword: keyword || undefined, limit: 200 })
      setLogs(list)
    } catch (e: any) {
      toast.error(`一覧取得に失敗しました: ${e.message || e}`)
    } finally {
      setLoading(false)
    }
  }, [start, end, expression, userId, serviceId, keyword])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = async (id?: string) => {
    if (!id) return
    if (!confirm("削除してよろしいですか？")) return
    try {
      await deleteExpressionLog(id)
      toast.success("削除しました")
      refresh()
    } catch (e: any) {
      toast.error(`削除に失敗しました: ${e.message || e}`)
    }
  }

  const handleInlineEdit = async (id?: string) => {
    if (!id) return
    try {
      const curr = await getExpressionLog(id)
      if (!curr) return
      const nextNote = prompt("メモを編集", curr.note ?? "")
      if (nextNote === null) return
      await updateExpressionLog(id, { note: nextNote })
      toast.success("更新しました")
      refresh()
    } catch (e: any) {
      toast.error(`更新に失敗しました: ${e.message || e}`)
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">表情・反応記録 履歴</CardTitle>
          <div className="flex gap-2">
            <a href={csvHref} download={`expression_logs_${Date.now()}.csv`}>
              <Button variant="outline">CSV</Button>
            </a>
            <PdfExportButton logs={logs} />
            <Link href="/daily-log/expression"><Button>新規作成</Button></Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <Label>期間（From）</Label>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label>期間（To）</Label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div>
              <Label>表情</Label>
              <Input placeholder="例: 笑顔" value={expression} onChange={(e) => setExpression(e.target.value)} />
            </div>
            <div>
              <Label>利用者</Label>
              <Input placeholder="userId" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
            <div>
              <Label>サービス</Label>
              <Input placeholder="serviceId" value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>キーワード</Label>
                <Input placeholder="フリーワード" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
              </div>
              <Button onClick={refresh} disabled={loading}>{loading ? "検索中…" : "検索"}</Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[170px]">日時</TableHead>
                  <TableHead>表情</TableHead>
                  <TableHead>反応</TableHead>
                  <TableHead>介入</TableHead>
                  <TableHead>不快</TableHead>
                  <TableHead>メモ</TableHead>
                  <TableHead className="w-[160px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{new Date(l.occurredAt).toLocaleString("ja-JP")}</TableCell>
                    <TableCell>{l.expression}</TableCell>
                    <TableCell>{l.reaction || "-"}</TableCell>
                    <TableCell>{l.intervention || "-"}</TableCell>
                    <TableCell>{l.discomfort || "-"}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={l.note || ""}>{l.note || ""}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleInlineEdit(l.id)}>編集</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(l.id)}>削除</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">データがありません</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
