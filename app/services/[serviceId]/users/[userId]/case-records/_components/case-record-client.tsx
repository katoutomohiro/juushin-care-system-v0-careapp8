"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ATCaseRecordBack, ATCaseRecordContent, ATCaseRecordFront } from "@/lib/case-records"
import { AT_SERVICE_TIME_OPTIONS, SERVICE_LABELS } from "@/lib/case-record-constants"

type StaffOption = { id: string; name: string }

type Props = {
  userId: string
  serviceId: string
  initialContent: ATCaseRecordContent
  staffOptions: StaffOption[]
}

const emptyVitalRow = { time: "", temperature: "", spo2: "", pulse: "", respiration: "", condition: "" }
const emptyHydrationRow = { time: "", kind: "", amount: "", route: "", note: "" }
const emptyEliminationRow = { time: "", urine: "", stool: "", note: "" }
const emptyTransport = { ghArrivalTime: "", officeArrivalTime: "", officeDepartureTime: "", ghReturnTime: "" }

function mergeRows<T extends Record<string, string>>(template: T[], incoming?: T[]): T[] {
  const rows = Array.isArray(incoming) ? incoming : []
  return template.map((row, idx) => ({ ...row, ...(rows[idx] || {}) }))
}

function getDatePartsFromRecordDate(
  recordDate: string | undefined,
  fallback: { year: string; month: string; day: string; weekday: string },
) {
  if (!recordDate) return fallback
  const d = new Date(recordDate)
  if (Number.isNaN(d.getTime())) return fallback
  const weekdayList = ["日", "月", "火", "水", "木", "金", "土"]
  return {
    year: d.toISOString().slice(0, 4),
    month: d.toISOString().slice(5, 7),
    day: d.toISOString().slice(8, 10),
    weekday: weekdayList[d.getDay()] || "",
  }
}

export default function CaseRecordClient({ userId, serviceId, initialContent, staffOptions }: Props) {
  const [content, setContent] = useState<ATCaseRecordContent>(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setContent((prev) => ({
      front: { ...prev.front, ...initialContent.front, transport: { ...emptyTransport, ...initialContent.front.transport } },
      back: {
        ...prev.back,
        ...initialContent.back,
        vitalRows: mergeRows(prev.back.vitalRows, initialContent.back.vitalRows),
        hydrationRows: mergeRows(prev.back.hydrationRows, initialContent.back.hydrationRows),
        eliminationRows: mergeRows(prev.back.eliminationRows, initialContent.back.eliminationRows),
      },
    }))
  }, [initialContent])

  const recordDate = content.front.date || ""
  const dateParts = useMemo(
    () =>
      getDatePartsFromRecordDate(recordDate, {
        year: content.front.year || "",
        month: content.front.month || "",
        day: content.front.day || "",
        weekday: content.front.weekday || "",
      }),
    [content.front.day, content.front.month, content.front.weekday, content.front.year, recordDate],
  )

  const formattedTitleDate = useMemo(() => {
    if (!recordDate && !dateParts.year) return ""
    if (recordDate) {
      const d = new Date(recordDate)
      if (!Number.isNaN(d.getTime())) {
        const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()] || ""
        return `記録日: ${d.toISOString().slice(0, 10)}${weekday ? `（${weekday}）` : ""}`
      }
    }
    return `記録日: ${dateParts.year}-${dateParts.month}-${dateParts.day}${dateParts.weekday ? `（${dateParts.weekday}）` : ""}`
  }, [dateParts.day, dateParts.month, dateParts.weekday, dateParts.year, recordDate])

  const serviceLabel = useMemo(
    () => SERVICE_LABELS[serviceId] || content.front.serviceName || serviceId,
    [content.front.serviceName, serviceId],
  )

  const staffSelectValue = useMemo(() => {
    if (!content.front.staffId) return ""
    return staffOptions.some((s) => s.id === content.front.staffId) ? content.front.staffId : ""
  }, [content.front.staffId, staffOptions])

  const serviceTimeChoices = useMemo(() => {
    const base = [...AT_SERVICE_TIME_OPTIONS]
    const current = content.front.serviceTimeSlot || content.front.serviceTime || ""
    if (current && !base.includes(current as any)) base.unshift(current as any)
    return base
  }, [content.front.serviceTime, content.front.serviceTimeSlot])

  const updateFront = <K extends keyof ATCaseRecordFront>(key: K, value: ATCaseRecordFront[K]) => {
    const nextFront = { ...content.front, [key]: value }
    if (key === "serviceTimeSlot" || key === "serviceTime") {
      nextFront.serviceTime = value as any
      nextFront.serviceTimeSlot = value as any
    }
    if (key === "date" && typeof value === "string") {
      const parts = getDatePartsFromRecordDate(value, dateParts)
      nextFront.year = parts.year
      nextFront.month = parts.month
      nextFront.day = parts.day
      nextFront.weekday = parts.weekday
    }
    setContent({ ...content, front: nextFront })
  }

  const updateTransport = (key: keyof ATCaseRecordFront["transport"], value: string) => {
    const transport = { ...(content.front.transport || { ...emptyTransport }), [key]: value }
    setContent({ ...content, front: { ...content.front, transport } })
  }

  const updateVitalRow = (index: number, key: keyof ATCaseRecordBack["vitalRows"][number], value: string) => {
    const rows = mergeRows(content.back.vitalRows)
    rows[index] = { ...(rows[index] || emptyVitalRow), [key]: value }
    setContent({ ...content, back: { ...content.back, vitalRows: rows } })
  }

  const updateHydrationRow = (index: number, key: keyof ATCaseRecordBack["hydrationRows"][number], value: string) => {
    const rows = mergeRows(content.back.hydrationRows)
    rows[index] = { ...(rows[index] || emptyHydrationRow), [key]: value }
    setContent({ ...content, back: { ...content.back, hydrationRows: rows } })
  }

  const updateEliminationRow = (index: number, key: keyof ATCaseRecordBack["eliminationRows"][number], value: string) => {
    const rows = mergeRows(content.back.eliminationRows)
    rows[index] = { ...(rows[index] || emptyEliminationRow), [key]: value }
    setContent({ ...content, back: { ...content.back, eliminationRows: rows } })
  }

  const handleSave = async () => {
    if (!userId || !serviceId || !recordDate) {
      setMessage("利用者・サービス・日付が指定されていません")
      return
    }
    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/case-records/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceType: serviceId,
          recordDate,
          content,
          template: "AT",
          source: "manual",
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) throw new Error(json.error || "保存に失敗しました")
      setMessage("ケース記録を保存しました")
    } catch (e: any) {
      setMessage(e?.message || "保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setMessage(null)
    try {
      const dailyLogRaw = typeof window !== "undefined" ? localStorage.getItem("dailyLog") : null
      const careEventsRaw = typeof window !== "undefined" ? localStorage.getItem("careEvents") : null
      const dailyLog = dailyLogRaw ? JSON.parse(dailyLogRaw) : null
      const careEvents = careEventsRaw ? JSON.parse(careEventsRaw) : []

      const res = await fetch("/api/case-records/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceType: serviceId,
          recordDate,
          dailyLog,
          careEvents,
          source: "daily-log",
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) throw new Error(json.error || "生成に失敗しました")
      if (json.content?.data) {
        setContent(json.content.data as ATCaseRecordContent)
      }
      setMessage("日誌から自動反映しました")
    } catch (e: any) {
      setMessage(e?.message || "生成に失敗しました")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">
            <Link href={`/services/${serviceId}/users/${encodeURIComponent(userId)}`} className="underline">
              ← {content.front.userName} の詳細へ戻る
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">ケース記録（A・T様テンプレート）</h1>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{serviceLabel}</span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="text-base font-semibold">{formattedTitleDate}</div>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Button variant="secondary" onClick={handleGenerate} disabled={isGenerating || isSaving}>
              {isGenerating ? "生成中…" : "日誌からケース記録を生成"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "保存中…" : "保存"}
            </Button>
          </div>
        </div>
      </div>

      {message && <div className="rounded-md border border-muted-foreground/30 bg-muted/20 px-3 py-2 text-sm">{message}</div>}

      <Tabs defaultValue="front">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="front">ケース記録 表</TabsTrigger>
          <TabsTrigger value="back">ケース記録 裏</TabsTrigger>
        </TabsList>

        <TabsContent value="front" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-sm">
                <div>
                  <div className="text-muted-foreground">氏名</div>
                  <div className="font-semibold">{content.front.userName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">年齢</div>
                  <div className="font-semibold">{content.front.age ? `${content.front.age}歳` : "-"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">性別</div>
                  <div className="font-semibold">{content.front.sex || "-"}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm">サービス</Label>
                  <div className="mt-1 rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">{serviceLabel}</div>
                </div>
                <div>
                  <Label className="text-sm">サービス提供時間</Label>
                  <Select
                    value={content.front.serviceTimeSlot || ""}
                    onValueChange={(val) => {
                      updateFront("serviceTimeSlot", val as ATCaseRecordFront["serviceTimeSlot"])
                      updateFront("serviceTime", val as ATCaseRecordFront["serviceTime"])
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTimeChoices.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">記録日</Label>
                  <Input value={recordDate} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <Label className="text-sm">年</Label>
                  <Input value={dateParts.year} readOnly />
                </div>
                <div>
                  <Label className="text-sm">月</Label>
                  <Input value={dateParts.month} readOnly />
                </div>
                <div>
                  <Label className="text-sm">日</Label>
                  <Input value={dateParts.day} readOnly />
                </div>
                <div>
                  <Label className="text-sm">曜日</Label>
                  <Input value={dateParts.weekday} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm">担当</Label>
                  {staffOptions.length > 0 ? (
                    <Select
                      value={staffSelectValue}
                      onValueChange={(val) => {
                        const selected = staffOptions.find((s) => s.id === val)
                        updateFront("staffId", val as ATCaseRecordFront["staffId"])
                        updateFront("staffName", (selected?.name || "") as ATCaseRecordFront["staffName"])
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="担当者を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffOptions.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="担当者名"
                      value={content.front.staffName || ""}
                      onChange={(e) => {
                        updateFront("staffId", null as ATCaseRecordFront["staffId"])
                        updateFront("staffName", e.target.value as ATCaseRecordFront["staffName"])
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">送迎・移動 時刻</Label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <Label className="text-sm">グループホーム迎え着</Label>
                    <Input
                      type="time"
                      value={content.front.transport?.ghArrivalTime || ""}
                      onChange={(e) => updateTransport("ghArrivalTime", e.target.value)}
                      placeholder="例：09:00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">事業所着</Label>
                    <Input
                      type="time"
                      value={content.front.transport?.officeArrivalTime || ""}
                      onChange={(e) => updateTransport("officeArrivalTime", e.target.value)}
                      placeholder="例：09:30"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">事業所発</Label>
                    <Input
                      type="time"
                      value={content.front.transport?.officeDepartureTime || ""}
                      onChange={(e) => updateTransport("officeDepartureTime", e.target.value)}
                      placeholder="例：16:00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">グループホーム送り着</Label>
                    <Input
                      type="time"
                      value={content.front.transport?.ghReturnTime || ""}
                      onChange={(e) => updateTransport("ghReturnTime", e.target.value)}
                      placeholder="例：16:30"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm">送迎・移動 備考</Label>
                  <Textarea
                    value={content.front.transportDetail || ""}
                    onChange={(e) => updateFront("transportDetail", e.target.value)}
                    rows={2}
                    placeholder="ルートや様子などを記入"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>水分補給</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(["hydration1", "hydration2", "hydration3", "hydration4", "hydration5", "hydration6"] as const).map(
                (key, idx) => (
                  <div key={key}>
                    <Label className="text-sm">水分補給 {idx + 1}</Label>
                    <Input
                      value={content.front[key]}
                      onChange={(e) => updateFront(key, e.target.value)}
                      placeholder="時間 / 種類 / 量 など"
                      className="mt-1"
                    />
                  </div>
                ),
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>排尿 / 排便</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {(["elimination1", "elimination2", "elimination3"] as const).map((key, idx) => (
                <div key={key}>
                  <Label className="text-sm">排尿/排便 {idx + 1}</Label>
                  <Input
                    value={content.front[key]}
                    onChange={(e) => updateFront(key, e.target.value)}
                    placeholder="尿() / 便() / 時刻"
                    className="mt-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>食事</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm">朝食</Label>
                <Textarea
                  value={content.front.breakfast}
                  onChange={(e) => updateFront("breakfast", e.target.value)}
                  rows={2}
                  placeholder="主食 / 副菜 / 量 / 口腔ケア"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">昼食</Label>
                <Textarea
                  value={content.front.lunch}
                  onChange={(e) => updateFront("lunch", e.target.value)}
                  rows={2}
                  placeholder="主食 / 副菜 / 量 / 口腔ケア"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">間食</Label>
                <Textarea
                  value={content.front.snack}
                  onChange={(e) => updateFront("snack", e.target.value)}
                  rows={2}
                  placeholder="内容 / 量"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">夕食</Label>
                <Textarea
                  value={content.front.dinner}
                  onChange={(e) => updateFront("dinner", e.target.value)}
                  rows={2}
                  placeholder="主食 / 副菜 / 量 / 口腔ケア"
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm">入浴</Label>
                <Textarea
                  value={content.front.bathing}
                  onChange={(e) => updateFront("bathing", e.target.value)}
                  rows={2}
                  placeholder="実施状況や介助の様子"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>課題・様子</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold">{content.front.task1Title}</div>
                <Textarea
                  value={content.front.task1Note}
                  onChange={(e) => updateFront("task1Note", e.target.value)}
                  rows={3}
                  placeholder="ストレッチ・マッサージの様子"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold">{content.front.task2Title}</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    value={content.front.task2Count}
                    onChange={(e) => updateFront("task2Count", e.target.value)}
                    placeholder="立ち上がり訓練 回数"
                  />
                  <Textarea
                    value={content.front.task2Note}
                    onChange={(e) => updateFront("task2Note", e.target.value)}
                    rows={2}
                    placeholder="様子や声掛け"
                    className="md:col-span-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold">{content.front.task3Title}</div>
                <Textarea
                  value={content.front.task3Note}
                  onChange={(e) => updateFront("task3Note", e.target.value)}
                  rows={3}
                  placeholder="コミュニケーションの様子"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>活動・特記・身体拘束</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">活動内容</Label>
                <Textarea
                  value={content.front.activityDetail}
                  onChange={(e) => updateFront("activityDetail", e.target.value)}
                  rows={2}
                  placeholder="活動内容 / 声掛け"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">特記</Label>
                <Textarea
                  value={content.front.specialNote}
                  onChange={(e) => updateFront("specialNote", e.target.value)}
                  rows={2}
                  placeholder="スキントラブルや体調の変化など"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">身体拘束（車いす等）</Label>
                <Textarea
                  value={content.front.restraint}
                  onChange={(e) => updateFront("restraint", e.target.value)}
                  rows={2}
                  placeholder="テーブル・胸ベルトなど"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="back" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>バイタル</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.back.vitalRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-6">
                  <Input placeholder="時間" value={row.time} onChange={(e) => updateVitalRow(idx, "time", e.target.value)} />
                  <Input
                    placeholder="体温"
                    value={row.temperature}
                    onChange={(e) => updateVitalRow(idx, "temperature", e.target.value)}
                  />
                  <Input placeholder="SpO2" value={row.spo2} onChange={(e) => updateVitalRow(idx, "spo2", e.target.value)} />
                  <Input placeholder="脈拍" value={row.pulse} onChange={(e) => updateVitalRow(idx, "pulse", e.target.value)} />
                  <Input
                    placeholder="呼吸数"
                    value={row.respiration}
                    onChange={(e) => updateVitalRow(idx, "respiration", e.target.value)}
                  />
                  <Input placeholder="備考" value={row.condition} onChange={(e) => updateVitalRow(idx, "condition", e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>水分補給・詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.back.hydrationRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-5">
                  <Input placeholder="時間" value={row.time} onChange={(e) => updateHydrationRow(idx, "time", e.target.value)} />
                  <Input placeholder="種類" value={row.kind} onChange={(e) => updateHydrationRow(idx, "kind", e.target.value)} />
                  <Input placeholder="量" value={row.amount} onChange={(e) => updateHydrationRow(idx, "amount", e.target.value)} />
                  <Input placeholder="経口 / 経管 など" value={row.route} onChange={(e) => updateHydrationRow(idx, "route", e.target.value)} />
                  <Input placeholder="備考" value={row.note} onChange={(e) => updateHydrationRow(idx, "note", e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>排尿 / 排便・詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.back.eliminationRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <Input placeholder="時間" value={row.time} onChange={(e) => updateEliminationRow(idx, "time", e.target.value)} />
                  <Input placeholder="尿" value={row.urine} onChange={(e) => updateEliminationRow(idx, "urine", e.target.value)} />
                  <Input placeholder="便" value={row.stool} onChange={(e) => updateEliminationRow(idx, "stool", e.target.value)} />
                  <Input placeholder="備考" value={row.note} onChange={(e) => updateEliminationRow(idx, "note", e.target.value)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>発作・その他</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">発作・てんかん</Label>
                <Textarea
                  value={content.back.seizureNote}
                  onChange={(e) => setContent({ ...content, back: { ...content.back, seizureNote: e.target.value } })}
                  rows={3}
                  placeholder="発作回数や時間・対応など"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">その他</Label>
                <Textarea
                  value={content.back.otherNote}
                  onChange={(e) => setContent({ ...content, back: { ...content.back, otherNote: e.target.value } })}
                  rows={3}
                  placeholder="裏面メモ"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
