"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type { CaseRecordDetails, CaseRecordRow } from "@/lib/case-records-structured"

type StaffOption = { id: string; name: string }

type Props = {
  userId: string
  serviceId: string
  staffOptions: StaffOption[]
}

const createEmptyDetails = (): CaseRecordDetails => ({
  vital_signs: { temp: null, pulse: null, bp: null },
  seizures: { occurred: false, type: null },
  hydration: { amount: null, method: null },
  activities: null,
  comments: null,
})

const defaultForm = (userId: string, serviceId: string) => ({
  recordDate: new Date().toISOString().slice(0, 10),
  startTime: "",
  endTime: "",
  category: "daily",
  summary: "",
  details: createEmptyDetails(),
  createdBy: "",
  userId,
  serviceType: serviceId,
})

function ensureDetails(details: CaseRecordDetails): CaseRecordDetails {
  return {
    vital_signs: {
      temp: details.vital_signs?.temp ?? null,
      pulse: details.vital_signs?.pulse ?? null,
      bp: details.vital_signs?.bp ?? null,
    },
    seizures: {
      occurred: Boolean(details.seizures?.occurred),
      type: details.seizures?.type ?? null,
    },
    hydration: {
      amount: details.hydration?.amount ?? null,
      method: details.hydration?.method ?? null,
    },
    activities: details.activities ?? null,
    comments: details.comments ?? null,
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return iso
  }
}

export function CaseRecordCards({ userId, serviceId, staffOptions }: Props) {
  const { toast } = useToast()
  const [records, setRecords] = useState<CaseRecordRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(() => defaultForm(userId, serviceId))

  const createdByOptions = useMemo(() => staffOptions ?? [], [staffOptions])

  useEffect(() => {
    setForm(defaultForm(userId, serviceId))
  }, [userId, serviceId])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const url = new URL("/api/case-records", window.location.origin)
        url.searchParams.set("userId", userId)
        url.searchParams.set("serviceType", serviceId)
        url.searchParams.set("limit", "20")
        const res = await fetch(url.toString())
        const json = await res.json()
        if (!res.ok || json?.ok === false) {
          throw new Error(json?.error || "ケース記録の取得に失敗しました")
        }
        setRecords(json.data || [])
      } catch (error) {
        console.error("[CaseRecordCards] fetch failed", error)
        toast({ variant: "destructive", title: "ケース記録の取得に失敗しました" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, serviceId, toast])

  const handleCreateClick = () => {
    setEditingId(null)
    setForm(defaultForm(userId, serviceId))
    setIsDialogOpen(true)
  }

  const handleCardClick = (record: CaseRecordRow) => {
    setEditingId(record.id)
    setForm({
      recordDate: record.recordDate,
      startTime: record.startTime || "",
      endTime: record.endTime || "",
      category: record.category || "daily",
      summary: record.summary || "",
      details: ensureDetails(record.details),
      createdBy: record.createdBy || "",
      userId,
      serviceType: serviceId,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        userId,
        serviceType: serviceId,
        recordDate: form.recordDate,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        category: form.category || "daily",
        summary: form.summary || "",
        details: ensureDetails(form.details),
        createdBy: form.createdBy || null,
      }
      const endpoint = editingId ? `/api/case-records/${editingId}` : "/api/case-records"
      const res = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || "保存に失敗しました")
      }
      const record: CaseRecordRow = json.data
      setRecords((prev) => {
        const others = prev.filter((r) => r.id !== record.id)
        return [...others, record].sort((a, b) => (a.recordDate < b.recordDate ? 1 : -1))
      })
      toast({ title: "ケース記録を保存しました" })
      setIsDialogOpen(false)
    } catch (error) {
      console.error("[CaseRecordCards] save failed", error)
      toast({ variant: "destructive", title: "ケース記録の保存に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">ケース記録</h2>
          <p className="text-sm text-muted-foreground">直近1年の記録のみ表示します</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClick}>＋ 今日のケース記録を作成</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "ケース記録を編集" : "ケース記録を作成"}</DialogTitle>
              <DialogDescription>AI 解析向けに構造化された JSON を保存します。</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>日付</Label>
                <Input
                  type="date"
                  value={form.recordDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, recordDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="daily / etc"
                />
              </div>
              <div className="space-y-2">
                <Label>シフト開始</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>シフト終了</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>サマリー（一覧表示用）</Label>
                <Input
                  value={form.summary}
                  onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="発作なし・安定"
                />
              </div>
              <div className="space-y-2">
                <Label>バイタル</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="体温"
                    value={form.details.vital_signs.temp ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          vital_signs: { ...prev.details.vital_signs, temp: e.target.value === "" ? null : Number(e.target.value) },
                        },
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="脈拍"
                    value={form.details.vital_signs.pulse ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          vital_signs: { ...prev.details.vital_signs, pulse: e.target.value === "" ? null : Number(e.target.value) },
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="血圧 120/80"
                    value={form.details.vital_signs.bp ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        details: { ...prev.details, vital_signs: { ...prev.details.vital_signs, bp: e.target.value } },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>発作</Label>
                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.details.seizures.occurred}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          details: { ...prev.details, seizures: { ...prev.details.seizures, occurred: e.target.checked } },
                        }))
                      }
                    />
                    発作あり
                  </Label>
                  <Input
                    placeholder="発作タイプ"
                    value={form.details.seizures.type ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        details: { ...prev.details, seizures: { ...prev.details.seizures, type: e.target.value } },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>水分補給</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="量(ml)"
                    value={form.details.hydration.amount ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        details: {
                          ...prev.details,
                          hydration: { ...prev.details.hydration, amount: e.target.value === "" ? null : Number(e.target.value) },
                        },
                      }))
                    }
                  />
                  <Input
                    placeholder="方法(PEGなど)"
                    value={form.details.hydration.method ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        details: { ...prev.details, hydration: { ...prev.details.hydration, method: e.target.value } },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>活動・様子</Label>
                <Textarea
                  rows={2}
                  value={form.details.activities ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      details: { ...prev.details, activities: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>コメント</Label>
                <Textarea
                  rows={3}
                  value={form.details.comments ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      details: { ...prev.details, comments: e.target.value },
                    }))
                  }
                  placeholder="今日は発作なしで安定していました..."
                />
              </div>
              <div className="space-y-2">
                <Label>記録者</Label>
                <Select
                  value={form.createdBy || ""}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, createdBy: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="担当職員を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">未選択</SelectItem>
                    {createdByOptions.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                キャンセル
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "保存中..." : "保存する"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-muted-foreground">まだケース記録がありません。ボタンから作成してください。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record) => (
            <Card
              key={record.id}
              className="hover:shadow-md transition cursor-pointer"
              onClick={() => handleCardClick(record)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{formatDate(record.recordDate)}</CardTitle>
                  <Badge variant="outline">{record.category || "daily"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{record.summary || "サマリー未入力"}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {record.startTime && <Badge variant="secondary">開始 {record.startTime}</Badge>}
                  {record.endTime && <Badge variant="secondary">終了 {record.endTime}</Badge>}
                  {record.createdBy && (
                    <Badge variant="secondary">
                      記録者: {createdByOptions.find((s) => s.id === record.createdBy)?.name || record.createdBy}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground leading-snug">
                  {record.details.comments || record.details.activities || "詳細コメントなし"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

export default CaseRecordCards
