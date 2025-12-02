"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  BATHING_DONE_OPTIONS,
  COMMUNICATION_REACTION_LEVELS,
  EXCRETION_AMOUNT_OPTIONS,
  HYDRATION_TYPES,
  MEAL_RATIO_OPTIONS,
  RESTRAINT_USED_OPTIONS,
  SERVICE_LABELS,
  SERVICE_TIME_CANDIDATES,
  STOOL_QUALITY_OPTIONS,
  TOTAL_SERVICE_TIME_OPTIONS,
} from "@/lib/case-record-constants"
import type {
  ATCaseRecordBath,
  ATCaseRecordContent,
  ATCaseRecordExcretion,
  ATCaseRecordExcretionAmount,
  ATCaseRecordExcretionCondition,
  ATCaseRecordHeader,
  ATCaseRecordHydration,
  ATCaseRecordHydrationItem,
  ATCaseRecordMealAmount,
  ATCaseRecordTransportation,
} from "@/lib/at-excel-case-records"
import { DataStorageService } from "@/services/data-storage-service"

type StaffOption = { id: string; name: string }

type Props = {
  userId: string
  serviceId: string
  recordDate: string
  initialContent: ATCaseRecordContent
  staffOptions: StaffOption[]
  userDisplayName: string
  serviceTimeOptions: readonly string[]
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()] || ""
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${weekday ? `（${weekday}）` : ""}`
}

function parseNumber(value: string): number | null {
  if (value === "" || value === undefined || value === null) return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

function formatTimeHHmm(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

export default function ATExcelCaseRecordClient({
  userId,
  serviceId,
  recordDate,
  initialContent,
  staffOptions,
  userDisplayName,
  serviceTimeOptions,
}: Props) {
  const [content, setContent] = useState<ATCaseRecordContent>(initialContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(userDisplayName)

  const updateHeader = <K extends keyof ATCaseRecordHeader>(key: K, value: ATCaseRecordHeader[K]) => {
    setContent((prev) => ({ ...prev, header: { ...prev.header, [key]: value } }))
  }

  const updateTransportation = <K extends keyof ATCaseRecordTransportation>(
    key: K,
    value: ATCaseRecordTransportation[K],
  ) => {
    setContent((prev) => ({ ...prev, transportation: { ...prev.transportation, [key]: value } }))
  }

  const updateHydrationItem = <F extends keyof ATCaseRecordHydration["items"][number]>(
    index: number,
    field: F,
    value: ATCaseRecordHydration["items"][number][F],
  ) => {
    setContent((prev) => {
      const items = [...prev.hydration.items]
      if (!items[index]) {
        items[index] = { time: null, type: "", amountMl: null, note: null }
      }
      items[index] = { ...items[index], [field]: value }
      return { ...prev, hydration: { ...prev.hydration, items } }
    })
  }

  const updateExcretionEvent = <F extends keyof ATCaseRecordExcretion["events"][number]>(
    index: number,
    field: F,
    value: ATCaseRecordExcretion["events"][number][F],
  ) => {
    setContent((prev) => {
      const events = [...prev.excretion.events]
      if (!events[index]) {
        events[index] = { time: null, urineAmount: "", stoolAmount: "", stoolQuality: "" }
      }
      events[index] = { ...events[index], [field]: value }
      return { ...prev, excretion: { ...prev.excretion, events } }
    })
  }

  const updateRestraints = <F extends keyof NonNullable<ATCaseRecordContent["restraints"]>>(key: F, value: any) => {
    setContent((prev) => ({
      ...prev,
      restraints: {
        used: prev.restraints?.used ?? "",
        types: { table: false, kneeBelt: false, other: false, ...(prev.restraints?.types || {}) },
        notes: prev.restraints?.notes ?? "",
        ...(prev.restraints || {}),
        [key]: value,
      },
    }))
  }

  useEffect(() => {
    setDisplayName(userDisplayName)
  }, [userDisplayName])

  useEffect(() => {
    const profile = DataStorageService.getUserProfile(userId)
    if (profile?.name) {
      setDisplayName(profile.name)
    }
  }, [userId])

  useEffect(() => {
    setContent((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        userName: displayName,
        name: displayName ?? prev.header.name ?? prev.header.userName ?? null,
      },
    }))
  }, [displayName])

  const setServiceTimeNow = (key: "start" | "end") => {
    const now = formatTimeHHmm(new Date())
    setContent((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        serviceTime: {
          ...(prev.header.serviceTime || { start: null, end: null }),
          [key]: now,
        },
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/case-records/at-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceType: serviceId,
          recordDate,
          content: {
            ...content,
            header: {
              ...content.header,
              recordDate,
              userName: displayName,
              name: displayName ?? content.header.name ?? content.header.userName ?? null,
            },
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.ok === false) throw new Error(json.error || "保存に失敗しました")
      setMessage("ケース記録を保存しました")
    } catch (e: any) {
      console.error("[ATExcelCaseRecordClient] save failed", e)
      setMessage(e?.message || "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  const serviceTimeChoices = useMemo(() => {
    const base = [...serviceTimeOptions, ...SERVICE_TIME_CANDIDATES]
    const currentTimes = [
      content.header.serviceTime?.start,
      content.header.serviceTime?.end,
      content.header.daytimeSupportMorningStart,
      content.header.daytimeSupportMorningEnd,
      content.header.daytimeSupportAfternoonStart,
      content.header.daytimeSupportAfternoonEnd,
    ].filter((v): v is string => Boolean(v))
    return Array.from(new Set([...base, ...currentTimes].filter(Boolean)))
  }, [
    content.header.daytimeSupportAfternoonEnd,
    content.header.daytimeSupportAfternoonStart,
    content.header.daytimeSupportMorningEnd,
    content.header.daytimeSupportMorningStart,
    content.header.serviceTime?.end,
    content.header.serviceTime?.start,
    serviceTimeOptions,
  ])

  const displayDate = formatDisplayDate(recordDate)

  return (
    <main className="mx-auto max-w-[210mm] space-y-6 case-record-print">
      {message && <div className="rounded-md border border-muted-foreground/30 bg-muted/20 px-3 py-2 text-sm">{message}</div>}

      <div className="no-print mb-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">A・T様 生活介護ケース記録（Excel手入力版）</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中…" : "保存する"}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            印刷
          </Button>
        </div>
      </div>

      <div className="space-y-6 no-print">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm">氏名</Label>
                <div className="mt-1 rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">{displayName}</div>
              </div>
              <div>
                <Label className="text-sm">サービス</Label>
                <div className="mt-1 rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">
                  {SERVICE_LABELS[serviceId] || serviceId}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm">利用日</Label>
                <Input type="date" value={content.header.recordDate || recordDate} readOnly />
                <p className="text-xs text-muted-foreground mt-1">{displayDate}</p>
              </div>
              <div>
                <Label className="text-sm">主担当</Label>
                <Select
                  value={content.header.mainStaffId ?? ""}
                  onValueChange={(val) => {
                    updateHeader("mainStaffId", val)
                    updateHeader("staffId", val)
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffOptions.length ? (
                      staffOptions.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_staff__" disabled>
                        スタッフ未設定
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">従担当</Label>
                <Select value={content.header.subStaffId ?? ""} onValueChange={(val) => updateHeader("subStaffId", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="担当者を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffOptions.length ? (
                      staffOptions.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__no_staff__" disabled>
                        スタッフ未設定
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">サービス開始</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Select
                      value={content.header.serviceTime?.start ?? ""}
                      onValueChange={(val) =>
                        updateHeader("serviceTime", {
                          ...(content.header.serviceTime || { start: null, end: null }),
                          start: val,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="開始" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTimeChoices.map((opt) => (
                          <SelectItem key={`start-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setServiceTimeNow("start")}>
                      今すぐ
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">サービス終了</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Select
                      value={content.header.serviceTime?.end ?? ""}
                      onValueChange={(val) =>
                        updateHeader("serviceTime", {
                          ...(content.header.serviceTime || { start: null, end: null }),
                          end: val,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="終了" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTimeChoices.map((opt) => (
                          <SelectItem key={`end-${opt}`} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => setServiceTimeNow("end")}>
                      今すぐ
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm">サービス提供時間（旧スロット）</Label>
                <Select value={content.header.serviceTimeSlot ?? ""} onValueChange={(val) => updateHeader("serviceTimeSlot", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTimeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <Label className="text-sm">トータルサービス提供時間</Label>
                  <Select
                    value={content.header.totalServiceTimeSlot ?? ""}
                    onValueChange={(val) => updateHeader("totalServiceTimeSlot", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOTAL_SERVICE_TIME_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">日中一時支援（午前）</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={content.header.daytimeSupportMorningStart ?? ""}
                    onValueChange={(val) => updateHeader("daytimeSupportMorningStart", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="開始" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTimeChoices.map((opt) => (
                        <SelectItem key={`day-morning-start-${opt}`} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={content.header.daytimeSupportMorningEnd ?? ""}
                    onValueChange={(val) => updateHeader("daytimeSupportMorningEnd", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="終了" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTimeChoices.map((opt) => (
                        <SelectItem key={`day-morning-end-${opt}`} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">日中一時支援（午後）</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={content.header.daytimeSupportAfternoonStart ?? ""}
                    onValueChange={(val) => updateHeader("daytimeSupportAfternoonStart", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="開始" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTimeChoices.map((opt) => (
                        <SelectItem key={`day-afternoon-start-${opt}`} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={content.header.daytimeSupportAfternoonEnd ?? ""}
                    onValueChange={(val) => updateHeader("daytimeSupportAfternoonEnd", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="終了" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTimeChoices.map((opt) => (
                        <SelectItem key={`day-afternoon-end-${opt}`} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>転倒・骨折予防 / 特記 / 活動 / 合併症状 / 身体拘束</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">転倒・骨折予防</Label>
              <Textarea
                value={content.fallPrevention.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, fallPrevention: { ...prev.fallPrevention, note: e.target.value } }))}
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm">特記（スキントラブル・体調変化など）</Label>
              <Textarea
                value={content.specialNote.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, specialNote: { ...prev.specialNote, note: e.target.value } }))}
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm">活動</Label>
              <Textarea
                value={content.activity.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, activity: { ...prev.activity, note: e.target.value } }))}
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm">合併症状（気になること）</Label>
              <Textarea
                value={content.complication.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, complication: { ...prev.complication, note: e.target.value } }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">身体拘束</Label>
              <Select
                value={content.restraints?.used || ""}
                onValueChange={(val) => updateRestraints("used", val as (typeof RESTRAINT_USED_OPTIONS)[number])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {RESTRAINT_USED_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {[
                  { key: "table", label: "テーブル" },
                  { key: "kneeBelt", label: "膝ベルト" },
                  { key: "other", label: "その他" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={content.restraints?.types?.[item.key as keyof NonNullable<typeof content.restraints>["types"]] || false}
                      onChange={(e) =>
                        updateRestraints("types", {
                          ...content.restraints?.types,
                          [item.key]: e.target.checked,
                        })
                      }
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              <Textarea
                value={content.restraints?.notes || ""}
                onChange={(e) => updateRestraints("notes", e.target.value)}
                rows={2}
                placeholder="身体拘束に関するメモ"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>課題 / コミュニケーション / 下肢機能</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">筋力・拘縮予防（チェック）</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {[
                  { key: "stretchUpperLimb", label: "上肢ストレッチ" },
                  { key: "stretchLowerLimb", label: "下肢ストレッチ" },
                  { key: "shoulderMassage", label: "肩マッサージ" },
                  { key: "waistMassage", label: "腰マッサージ" },
                  { key: "hipJointRange", label: "股関節可動域" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(content.task.muscleContracturePrevention as any)?.[item.key] || false}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          task: {
                            ...prev.task,
                            muscleContracturePrevention: {
                              ...prev.task.muscleContracturePrevention,
                              [item.key]: e.target.checked,
                            },
                          },
                        }))
                      }
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
              <Textarea
                value={content.task.muscleContracturePrevention?.notes || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    task: { ...prev.task, muscleContracturePrevention: { ...prev.task.muscleContracturePrevention, notes: e.target.value } },
                  }))
                }
                rows={2}
                placeholder="メモ"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-sm">下肢機能</Label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={content.lowerLimbFunction.orthosisUsed || false}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        lowerLimbFunction: { ...prev.lowerLimbFunction, orthosisUsed: e.target.checked },
                      }))
                    }
                  />
                  <span>装具使用</span>
                </label>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">立ち上がり訓練 回数</Label>
                  <Input
                    type="number"
                    min="0"
                    value={content.lowerLimbFunction.standUpTrainingCount ?? ""}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        lowerLimbFunction: { ...prev.lowerLimbFunction, standUpTrainingCount: parseNumber(e.target.value) },
                      }))
                    }
                    className="w-28"
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Label className="text-sm">下肢メモ</Label>
                <Textarea
                  value={content.lowerLimbFunction.notes || ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      lowerLimbFunction: { ...prev.lowerLimbFunction, notes: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">意思疎通</Label>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {[
                  { key: "communicationCard", label: "コミュニケーションカード" },
                  { key: "photoCard", label: "写真カード" },
                  { key: "gesture", label: "ジェスチャー" },
                  { key: "facialExpression", label: "表情" },
                  { key: "other", label: "その他" },
                ].map((tool) => (
                  <label key={tool.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={(content.task.communication?.tools as any)?.[tool.key] || false}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          task: {
                            ...prev.task,
                            communication: {
                              ...prev.task.communication,
                              tools: { ...prev.task.communication?.tools, [tool.key]: e.target.checked },
                            },
                          },
                        }))
                      }
                    />
                    <span>{tool.label}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-sm">反応レベル</Label>
                  <Select
                    value={content.task.communication?.reactionLevel || ""}
                    onValueChange={(val) =>
                      setContent((prev) => ({
                        ...prev,
                        task: { ...prev.task, communication: { ...prev.task.communication, reactionLevel: val as any } },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNICATION_REACTION_LEVELS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm pt-6">
                  <input
                    type="checkbox"
                    checked={content.task.communication?.toiletGuidance || false}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        task: { ...prev.task, communication: { ...prev.task.communication, toiletGuidance: e.target.checked } },
                      }))
                    }
                  />
                  <span>トイレ誘導</span>
                </label>
              </div>
              <Textarea
                value={content.task.communication?.notes || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    task: { ...prev.task, communication: { ...prev.task.communication, notes: e.target.value } },
                  }))
                }
                rows={3}
                placeholder="反応の様子、声掛けなど"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>入浴</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <Label className="text-sm">実施状況</Label>
                <Select
                  value={content.bath.done || ""}
                  onValueChange={(val) => setContent((prev) => ({ ...prev, bath: { ...prev.bath, done: val as ATCaseRecordBath["done"] } }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATHING_DONE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">時間</Label>
                <Input
                  type="time"
                  value={content.bath.time || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, bath: { ...prev.bath, time: e.target.value } }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={content.bath.perinealCare || false}
                  onChange={(e) => setContent((prev) => ({ ...prev, bath: { ...prev.bath, perinealCare: e.target.checked } }))}
                />
                <span className="text-sm">陰部ケア</span>
              </div>
            </div>
            <div>
              <Label className="text-sm">様子メモ</Label>
              <Textarea
                value={content.bath.careNote || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, bath: { ...prev.bath, careNote: e.target.value } }))}
                rows={2}
                placeholder="介助内容や皮膚の様子など"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>食事</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { key: "lunchAmount", care: "lunchCareNote", med: "lunchMedication", oral: "lunchOralCare", label: "昼食" },
                { key: "dinnerAmount", care: "dinnerCareNote", med: "dinnerMedication", oral: "dinnerOralCare", label: "夕食" },
              ].map((meal) => (
                <div key={meal.key} className="space-y-2">
                  <Label className="text-sm">{meal.label} 摂取量 (0-10割)</Label>
                  <Select
                    value={
                      (content.meal as any)[meal.key] !== null && (content.meal as any)[meal.key] !== undefined
                        ? String((content.meal as any)[meal.key])
                        : ""
                    }
                    onValueChange={(val) =>
                      setContent((prev) => ({
                        ...prev,
                        meal: { ...prev.meal, [meal.key]: val === "" ? null : (Number(val) as ATCaseRecordMealAmount) },
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_RATIO_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={String(opt)}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-3 text-sm">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={(content.meal as any)[meal.med] || false}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            meal: { ...prev.meal, [meal.med]: e.target.checked },
                          }))
                        }
                      />
                      <span>内服あり</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={(content.meal as any)[meal.oral] || false}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            meal: { ...prev.meal, [meal.oral]: e.target.checked },
                          }))
                        }
                      />
                      <span>口腔ケア</span>
                    </label>
                  </div>
                  <Textarea
                    value={(content.meal as any)[meal.care] || ""}
                    onChange={(e) => setContent((prev) => ({ ...prev, meal: { ...prev.meal, [meal.care]: e.target.value } }))}
                    rows={2}
                    placeholder="介助状況 / 口腔ケアなど"
                  />
                </div>
              ))}
            </div>
            <div>
              <Label className="text-sm">その他メモ</Label>
              <Textarea
                value={content.meal.otherNote || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, meal: { ...prev.meal, otherNote: e.target.value } }))}
                rows={2}
                placeholder="間食や水分補給との関連など"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>排尿・排便</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.excretion.events.slice(0, 3).map((ev, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <Label className="text-sm">時間</Label>
                  <Input type="time" value={ev.time || ""} onChange={(e) => updateExcretionEvent(idx, "time", e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">尿量</Label>
                  <Select
                    value={ev.urineAmount || ""}
                    onValueChange={(val) => updateExcretionEvent(idx, "urineAmount", val as ATCaseRecordExcretionAmount)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXCRETION_AMOUNT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">便量</Label>
                  <Select
                    value={ev.stoolAmount || ""}
                    onValueChange={(val) => updateExcretionEvent(idx, "stoolAmount", val as ATCaseRecordExcretionAmount)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXCRETION_AMOUNT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">便性状</Label>
                  <Select
                    value={ev.stoolQuality || ""}
                    onValueChange={(val) => updateExcretionEvent(idx, "stoolQuality", val as ATCaseRecordExcretionCondition)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOOL_QUALITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <div>
              <Label className="text-sm">備考</Label>
              <Textarea
                value={content.excretion.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, excretion: { ...prev.excretion, note: e.target.value } }))}
                rows={2}
                placeholder="排泄の様子や時間など"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>水分補給</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.hydration.items.slice(0, 4).map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <Label className="text-sm">時間</Label>
                  <Input type="time" value={item.time || ""} onChange={(e) => updateHydrationItem(idx, "time", e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">種別</Label>
                  <Select
                    value={item.type || ""}
                    onValueChange={(val) => updateHydrationItem(idx, "type", val as ATCaseRecordHydrationItem | "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {HYDRATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">量 (mL)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="10"
                    value={item.amountMl ?? ""}
                    onChange={(e) => updateHydrationItem(idx, "amountMl", parseNumber(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-sm">メモ</Label>
                  <Input value={item.note || ""} onChange={(e) => updateHydrationItem(idx, "note", e.target.value)} />
                </div>
              </div>
            ))}
            <div>
              <Label className="text-sm">備考</Label>
              <Textarea
                value={content.hydration.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, hydration: { ...prev.hydration, note: e.target.value } }))}
                rows={2}
                placeholder="経口 / 経管 などのメモ"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>体温</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {[
              { key: "morning", label: "体温①（朝）" },
              { key: "noon", label: "体温②（昼）" },
              { key: "evening", label: "体温③（夕）" },
              { key: "night", label: "体温④（夜）" },
            ].map((item) => (
              <div key={item.key}>
                <Label className="text-sm">{item.label}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={(content.temperature as any)[item.key] ?? ""}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      temperature: { ...prev.temperature, [item.key]: parseNumber(e.target.value) },
                    }))
                  }
                  placeholder="36.5"
                />
              </div>
            ))}
            <div className="md:col-span-4">
              <Label className="text-sm">備考</Label>
              <Textarea
                value={content.temperature.note || ""}
                onChange={(e) => setContent((prev) => ({ ...prev, temperature: { ...prev.temperature, note: e.target.value } }))}
                rows={2}
                placeholder="計測方法や追加メモ"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>送迎</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="text-sm">グループホーム迎え</Label>
                <Input
                  placeholder="担当者"
                  value={content.transportation.pickupFromGroupHome?.by || ""}
                  onChange={(e) =>
                    updateTransportation("pickupFromGroupHome", {
                      ...content.transportation.pickupFromGroupHome,
                      by: e.target.value,
                    })
                  }
                  className="mb-2"
                />
                <Input
                  type="time"
                  value={content.transportation.pickupFromGroupHome?.time || ""}
                  onChange={(e) =>
                    updateTransportation("pickupFromGroupHome", {
                      ...content.transportation.pickupFromGroupHome,
                      time: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm">事業所着</Label>
                <Input
                  placeholder="担当者"
                  value={content.transportation.pickupToOffice?.by || ""}
                  onChange={(e) =>
                    updateTransportation("pickupToOffice", {
                      ...content.transportation.pickupToOffice,
                      by: e.target.value,
                    })
                  }
                  className="mb-2"
                />
                <Input
                  type="time"
                  value={content.transportation.pickupToOffice?.time || ""}
                  onChange={(e) =>
                    updateTransportation("pickupToOffice", {
                      ...content.transportation.pickupToOffice,
                      time: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm">事業所発</Label>
                <Input
                  placeholder="担当者"
                  value={content.transportation.dropFromOffice?.by || ""}
                  onChange={(e) =>
                    updateTransportation("dropFromOffice", {
                      ...content.transportation.dropFromOffice,
                      by: e.target.value,
                    })
                  }
                  className="mb-2"
                />
                <Input
                  type="time"
                  value={content.transportation.dropFromOffice?.time || ""}
                  onChange={(e) =>
                    updateTransportation("dropFromOffice", {
                      ...content.transportation.dropFromOffice,
                      time: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-sm">グループホーム送り</Label>
                <Input
                  placeholder="担当者"
                  value={content.transportation.dropToGroupHome?.by || ""}
                  onChange={(e) =>
                    updateTransportation("dropToGroupHome", {
                      ...content.transportation.dropToGroupHome,
                      by: e.target.value,
                    })
                  }
                  className="mb-2"
                />
                <Input
                  type="time"
                  value={content.transportation.dropToGroupHome?.time || ""}
                  onChange={(e) =>
                    updateTransportation("dropToGroupHome", {
                      ...content.transportation.dropToGroupHome,
                      time: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">送迎ルート / 特記事項</Label>
              <Textarea
                value={content.transportation.routeNote || ""}
                onChange={(e) => updateTransportation("routeNote", e.target.value)}
                rows={2}
                placeholder="送迎ルートや様子のメモ"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="print-only text-[11px] leading-tight">
        <div className="border border-black p-3 space-y-2">
          <div className="flex justify-between">
            <div>A・T様 生活介護ケース記録</div>
            <div>{displayDate}</div>
          </div>
          <div className="flex justify-between text-xs">
            <div>利用者: {displayName}</div>
            <div>サービス時間: {content.header.serviceTime?.start || "-"} ～ {content.header.serviceTime?.end || "-"}</div>
            <div>トータル提供時間: {content.header.totalServiceTimeSlot || "-"}</div>
          </div>
          <div className="flex justify-between text-xs">
            <div>日中一時（午前）: {content.header.daytimeSupportMorningStart || "-"} ～ {content.header.daytimeSupportMorningEnd || "-"}</div>
            <div>日中一時（午後）: {content.header.daytimeSupportAfternoonStart || "-"} ～ {content.header.daytimeSupportAfternoonEnd || "-"}</div>
          </div>
          <div className="flex justify-between text-xs">
            <div>主担当: {staffOptions.find((s) => s.id === content.header.mainStaffId)?.name || content.header.mainStaffId || "-"}</div>
            <div>御担当: {staffOptions.find((s) => s.id === content.header.subStaffId)?.name || content.header.subStaffId || "-"}</div>
          </div>
        </div>

        <table className="w-full border border-black text-[11px] mt-3">
          <tbody>
            <tr className="border border-black">
              <th className="border border-black px-2 py-1 text-left w-20">送迎</th>
              <td className="px-2 py-1">
                <div>迎え: {content.transportation.pickupFromGroupHome?.by || "-"} / {content.transportation.pickupFromGroupHome?.time || "-"}</div>
                <div>事業所着: {content.transportation.pickupToOffice?.by || "-"} / {content.transportation.pickupToOffice?.time || "-"}</div>
                <div>事業所発: {content.transportation.dropFromOffice?.by || "-"} / {content.transportation.dropFromOffice?.time || "-"}</div>
                <div>送り: {content.transportation.dropToGroupHome?.by || "-"} / {content.transportation.dropToGroupHome?.time || "-"}</div>
              </td>
            </tr>
            <tr className="border border-black">
              <th className="border border-black px-2 py-1 text-left">体温</th>
              <td className="px-2 py-1">
                朝: {content.temperature.morning ?? "-"} / 昼: {content.temperature.noon ?? "-"} / 夕: {content.temperature.evening ?? "-"} / 夜: {content.temperature.night ?? "-"}
              </td>
            </tr>
            <tr className="border border-black align-top">
              <th className="border border-black px-2 py-1 text-left">水分補給</th>
              <td className="px-0 py-0">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr>
                      <th className="border border-black px-1 py-0.5">時間</th>
                      <th className="border border-black px-1 py-0.5">種別</th>
                      <th className="border border-black px-1 py-0.5">量(mL)</th>
                      <th className="border border-black px-1 py-0.5">メモ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.hydration.items.slice(0, 4).map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-1 py-0.5">{item.time || "-"}</td>
                        <td className="border border-black px-1 py-0.5">{item.type || "-"}</td>
                        <td className="border border-black px-1 py-0.5">{item.amountMl ?? "-"}</td>
                        <td className="border border-black px-1 py-0.5">{item.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr className="border border-black align-top">
              <th className="border border-black px-2 py-1 text-left">排泄</th>
              <td className="px-0 py-0">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr>
                      <th className="border border-black px-1 py-0.5">時間</th>
                      <th className="border border-black px-1 py-0.5">尿量</th>
                      <th className="border border-black px-1 py-0.5">便量</th>
                      <th className="border border-black px-1 py-0.5">便性状</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.excretion.events.slice(0, 3).map((ev, idx) => (
                      <tr key={idx}>
                        <td className="border border-black px-1 py-0.5">{ev.time || "-"}</td>
                        <td className="border border-black px-1 py-0.5">{ev.urineAmount || "-"}</td>
                        <td className="border border-black px-1 py-0.5">{ev.stoolAmount || "-"}</td>
                        <td className="border border-black px-1 py-0.5">{ev.stoolQuality || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr className="border border-black align-top">
              <th className="border border-black px-2 py-1 text-left">食事</th>
              <td className="px-2 py-1">
                <div>昼: {content.meal.lunchAmount ?? "-"} 割 / 内服:{content.meal.lunchMedication ? "あり" : "なし"} / 口腔ケア:{content.meal.lunchOralCare ? "あり" : "なし"}</div>
                <div>夕: {content.meal.dinnerAmount ?? "-"} 割 / 内服:{content.meal.dinnerMedication ? "あり" : "なし"} / 口腔ケア:{content.meal.dinnerOralCare ? "あり" : "なし"}</div>
                <div>昼メモ: {content.meal.lunchCareNote || "-"}</div>
                <div>夕メモ: {content.meal.dinnerCareNote || "-"}</div>
              </td>
            </tr>
            <tr className="border border-black">
              <th className="border border-black px-2 py-1 text-left">入浴</th>
              <td className="px-2 py-1">
                状態: {content.bath.done || "-"} / 時間: {content.bath.time || "-"} / 陰部ケア: {content.bath.perinealCare ? "あり" : "なし"}
                <div>メモ: {content.bath.careNote || "-"}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="border border-black p-3 mt-3 space-y-2">
          <div>筋力・拘縮予防: {content.task.muscleContracturePrevention?.notes || "-"}</div>
          <div>下肢機能: 装具 {content.lowerLimbFunction.orthosisUsed ? "あり" : "なし"} / 立ち上がり回数 {content.lowerLimbFunction.standUpTrainingCount ?? "-"}</div>
          <div>意思疎通: 反応 {content.task.communication?.reactionLevel || "-"} / メモ {content.task.communication?.notes || "-"}</div>
          <div>転倒・骨折予防: {content.fallPrevention.note || "-"}</div>
          <div>特記: {content.specialNote.note || "-"}</div>
          <div>活動: {content.activity.note || "-"}</div>
          <div>合併症状: {content.complication.note || "-"}</div>
          <div>
            身体拘束: {content.restraints?.used || "-"} / 種類:
            {content.restraints?.types?.table ? "テーブル " : ""}
            {content.restraints?.types?.kneeBelt ? "膝ベルト " : ""}
            {content.restraints?.types?.other ? "その他 " : ""}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="border border-black px-8 py-6 text-sm">ご家族押印</div>
        </div>
      </div>
    </main>
  )
}
