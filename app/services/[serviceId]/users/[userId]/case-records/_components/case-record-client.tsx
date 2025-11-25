"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ATCaseRecordContent, ATCaseRecordBack, ATCaseRecordFront } from "@/lib/case-records"
import type { UserProfileDetail } from "@/types/user-profile"
import GenerateCaseRecordButton from "./generate-button"

interface Props {
  userId: string
  serviceId: string
  date: string
  userName: string
  profile: UserProfileDetail
  initialContent: ATCaseRecordContent
}

const emptyVitalRow = { time: "", temperature: "", spo2: "", pulse: "", respiration: "", condition: "" }
const emptyHydrationRow = { time: "", kind: "", amount: "", route: "", note: "" }
const emptyEliminationRow = { time: "", urine: "", stool: "", note: "" }

function mergeFront(current: ATCaseRecordFront, incoming?: Partial<ATCaseRecordFront>): ATCaseRecordFront {
  if (!incoming) return current
  const merged = { ...current }
  ;(Object.keys(incoming) as (keyof ATCaseRecordFront)[]).forEach((key) => {
    const next = incoming[key]
    merged[key] = next !== undefined && next !== "" ? (next as ATCaseRecordFront[typeof key]) : current[key]
  })
  return merged
}

function mergeRows<T extends Record<string, string>>(current: T[], incoming: T[] | undefined, emptyRow: T): T[] {
  const length = Math.max(current.length, incoming?.length || 0)
  return Array.from({ length }).map((_, idx) => {
    const currentRow = current[idx] || emptyRow
    const incomingRow = incoming?.[idx]
    if (!incomingRow) return currentRow
    const mergedRow = { ...currentRow }
    ;(Object.keys(incomingRow) as (keyof T)[]).forEach((key) => {
      const next = incomingRow[key]
      mergedRow[key] = next !== undefined && next !== "" ? next : currentRow[key]
    })
    return mergedRow
  })
}

function mergeContent(current: ATCaseRecordContent, incoming: ATCaseRecordContent): ATCaseRecordContent {
  return {
    front: mergeFront(current.front, incoming.front),
    back: {
      vitalRows: mergeRows(current.back.vitalRows, incoming.back?.vitalRows, emptyVitalRow),
      hydrationRows: mergeRows(current.back.hydrationRows, incoming.back?.hydrationRows, emptyHydrationRow),
      eliminationRows: mergeRows(current.back.eliminationRows, incoming.back?.eliminationRows, emptyEliminationRow),
      seizureNote: incoming.back?.seizureNote ?? current.back.seizureNote,
      otherNote: incoming.back?.otherNote ?? current.back.otherNote,
    },
  }
}

export default function CaseRecordClient({ userId, serviceId, date, userName, profile, initialContent }: Props) {
  const [content, setContent] = useState<ATCaseRecordContent>(initialContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setContent((prev) => mergeContent(prev, initialContent))
  }, [initialContent])

  useEffect(() => {
    setContent((prev) => ({
      ...prev,
      front: {
        ...prev.front,
        userName,
        serviceName: prev.front.serviceName || serviceId,
        age: prev.front.age || (profile.age ? String(profile.age) : ""),
        sex: prev.front.sex || profile.gender || "",
        date,
      },
    }))
  }, [userName, serviceId, profile.age, profile.gender, date])

  const formattedTitleDate = useMemo(() => {
    try {
      const d = new Date(date)
      return d.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })
    } catch {
      return date
    }
  }, [date])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/case-records/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceType: serviceId,
          recordDate: date,
          content,
          template: "AT",
          source: "manual",
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) throw new Error(json.error || "保存に失敗しました")
      setMessage("ケース記録を保存しました")
    } catch (e: any) {
      setMessage(e.message || "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  const updateFront = <K extends keyof ATCaseRecordFront>(key: K, value: ATCaseRecordFront[K]) => {
    setContent((prev) => ({ ...prev, front: { ...prev.front, [key]: value } }))
  }

  const updateVitalRow = (index: number, key: keyof ATCaseRecordBack["vitalRows"][number], value: string) => {
    setContent((prev) => {
      const rows = [...prev.back.vitalRows]
      rows[index] = { ...(rows[index] || emptyVitalRow), [key]: value }
      return { ...prev, back: { ...prev.back, vitalRows: rows } }
    })
  }

  const updateHydrationRow = (
    index: number,
    key: keyof ATCaseRecordBack["hydrationRows"][number],
    value: string,
  ) => {
    setContent((prev) => {
      const rows = [...prev.back.hydrationRows]
      rows[index] = { ...(rows[index] || emptyHydrationRow), [key]: value }
      return { ...prev, back: { ...prev.back, hydrationRows: rows } }
    })
  }

  const updateEliminationRow = (
    index: number,
    key: keyof ATCaseRecordBack["eliminationRows"][number],
    value: string,
  ) => {
    setContent((prev) => {
      const rows = [...prev.back.eliminationRows]
      rows[index] = { ...(rows[index] || emptyEliminationRow), [key]: value }
      return { ...prev, back: { ...prev.back, eliminationRows: rows } }
    })
  }

  const handleGenerated = (generated: ATCaseRecordContent) => {
    setContent((prev) => mergeContent(prev, generated))
    setMessage("日誌から自動反映しました")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link href={`/services/${serviceId}/users/${encodeURIComponent(userId)}`} className="underline">
              〈 {userName} の詳細へ戻る
            </Link>
          </div>
          <h1 className="text-2xl font-bold">ケース記録（A・T様テンプレート）</h1>
          <p className="text-sm text-muted-foreground">{formattedTitleDate}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <GenerateCaseRecordButton userId={userId} serviceType={serviceId} date={date} onGenerated={handleGenerated} />
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "保存中…" : "保存"}
          </Button>
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
                  <Input value={content.front.serviceName} onChange={(e) => updateFront("serviceName", e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">サービス提供時間</Label>
                  <Input
                    value={content.front.serviceTime}
                    onChange={(e) => updateFront("serviceTime", e.target.value)}
                    placeholder="【　　：　～　　：　】"
                  />
                </div>
                <div>
                  <Label className="text-sm">記録日</Label>
                  <Input value={content.front.date} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm">記録者</Label>
                  <Input
                    value={content.front.recorder}
                    onChange={(e) => updateFront("recorder", e.target.value)}
                    placeholder="担当者名"
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
                  placeholder="主食/副食/内服/口腔ケア"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">昼食</Label>
                <Textarea
                  value={content.front.lunch}
                  onChange={(e) => updateFront("lunch", e.target.value)}
                  rows={2}
                  placeholder="主食/副食/内服/口腔ケア"
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
                  placeholder="主食/副食/内服/口腔ケア"
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
                    placeholder="様子・声掛け"
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
                <Label className="text-sm">身体拘束（車いす）</Label>
                <Textarea
                  value={content.front.restraint}
                  onChange={(e) => updateFront("restraint", e.target.value)}
                  rows={2}
                  placeholder="テーブル・胸ベルト など"
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
                  <Input
                    placeholder="時間"
                    value={row.time}
                    onChange={(e) => updateVitalRow(idx, "time", e.target.value)}
                  />
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
                  <Input
                    placeholder="備考"
                    value={row.condition}
                    onChange={(e) => updateVitalRow(idx, "condition", e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>水分補給（詳細）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.back.hydrationRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-5">
                  <Input
                    placeholder="時間"
                    value={row.time}
                    onChange={(e) => updateHydrationRow(idx, "time", e.target.value)}
                  />
                  <Input
                    placeholder="種類"
                    value={row.kind}
                    onChange={(e) => updateHydrationRow(idx, "kind", e.target.value)}
                  />
                  <Input
                    placeholder="量"
                    value={row.amount}
                    onChange={(e) => updateHydrationRow(idx, "amount", e.target.value)}
                  />
                  <Input
                    placeholder="経口 / 経管 等"
                    value={row.route}
                    onChange={(e) => updateHydrationRow(idx, "route", e.target.value)}
                  />
                  <Input
                    placeholder="備考"
                    value={row.note}
                    onChange={(e) => updateHydrationRow(idx, "note", e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>排尿 / 排便（詳細）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.back.eliminationRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <Input
                    placeholder="時間"
                    value={row.time}
                    onChange={(e) => updateEliminationRow(idx, "time", e.target.value)}
                  />
                  <Input
                    placeholder="尿"
                    value={row.urine}
                    onChange={(e) => updateEliminationRow(idx, "urine", e.target.value)}
                  />
                  <Input
                    placeholder="便"
                    value={row.stool}
                    onChange={(e) => updateEliminationRow(idx, "stool", e.target.value)}
                  />
                  <Input
                    placeholder="備考"
                    value={row.note}
                    onChange={(e) => updateEliminationRow(idx, "note", e.target.value)}
                  />
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
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, back: { ...prev.back, seizureNote: e.target.value } }))
                  }
                  rows={3}
                  placeholder="発作回数や時間・対応など"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">その他</Label>
                <Textarea
                  value={content.back.otherNote}
                  onChange={(e) => setContent((prev) => ({ ...prev, back: { ...prev.back, otherNote: e.target.value } }))}
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
