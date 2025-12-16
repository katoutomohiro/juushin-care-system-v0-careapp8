"use client"

import { useState } from "react"
import { ATCaseRecord, AT_FORM_METADATA, createEmptyATCaseRecord } from "@/lib/at-case-record-template"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface ATCaseRecordFormProps {
  date?: string
  onSave?: (record: ATCaseRecord) => void
  onCancel?: () => void
}

export function ATCaseRecordForm({ date, onSave, onCancel }: ATCaseRecordFormProps) {
  const initialDate = date || new Date().toISOString().split("T")[0]
  const [record, setRecord] = useState<ATCaseRecord>(() => createEmptyATCaseRecord(initialDate))

  const handleTimeChange = (field: keyof ATCaseRecord, value: string) => {
    setRecord(prev => ({ ...prev, [field]: value }))
  }

  const handleNumberChange = (field: keyof ATCaseRecord, index: number, value: number | undefined) => {
    if (field === "bodyTemperatures") {
      const temps = [...record.bodyTemperatures]
      temps[index] = value ?? 0
      setRecord(prev => ({ ...prev, bodyTemperatures: temps }))
    }
  }

  const handleHydrationChange = (index: number, type: string | undefined, amount: number | undefined) => {
    const hydrations = [...record.hydrations]
    hydrations[index] = { type: type || "", amount }
    setRecord(prev => ({ ...prev, hydrations }))
  }

  const handleExcretionChange = (index: number, field: "urinationCount" | "defecationStatus", value: any) => {
    const excretions = [...record.excretions]
    excretions[index] = { ...excretions[index], [field]: value }
    setRecord(prev => ({ ...prev, excretions }))
  }

  const handleSave = () => {
    onSave?.(record)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">A・T さん ケース記録入力</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* ヘッダ: 日付・担当・時間 */}
          <div>
            <h3 className="font-semibold mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date" className="text-sm">
                  記録日
                </Label>
                <Input id="date" type="date" value={record.date} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="mainStaff" className="text-sm">
                  担当①
                </Label>
                <Input
                  id="mainStaff"
                  placeholder="職員名"
                  value={record.mainStaff || ""}
                  onChange={e => setRecord(prev => ({ ...prev, mainStaff: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="subStaff" className="text-sm">
                  担当②
                </Label>
                <Input
                  id="subStaff"
                  placeholder="職員名"
                  value={record.subStaff || ""}
                  onChange={e => setRecord(prev => ({ ...prev, subStaff: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* 送迎時刻 */}
          <div>
            <h3 className="font-semibold mb-4">送迎時刻</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "pickupArrive" as const, label: "迎え着" },
                { key: "officeArrive" as const, label: "事業所着" },
                { key: "officeDeparture" as const, label: "事業所発" },
                { key: "dropoffArrive" as const, label: "送り着" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type="time"
                    value={record[key] || ""}
                    onChange={e => handleTimeChange(key, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* サービス提供時間 */}
          <div>
            <h3 className="font-semibold mb-4">サービス提供時間</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceStartTime" className="text-sm">
                  開始時刻
                </Label>
                <Input
                  id="serviceStartTime"
                  type="time"
                  value={record.serviceStartTime || ""}
                  onChange={e => handleTimeChange("serviceStartTime", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="serviceEndTime" className="text-sm">
                  終了時刻
                </Label>
                <Input
                  id="serviceEndTime"
                  type="time"
                  value={record.serviceEndTime || ""}
                  onChange={e => handleTimeChange("serviceEndTime", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* バイタル: 体温（4枠） */}
          <div>
            <h3 className="font-semibold mb-4">バイタル（体温）℃</h3>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i}>
                  <Label htmlFor={`temp-${i}`} className="text-xs">
                    {i + 1}
                  </Label>
                  <Input
                    id={`temp-${i}`}
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={record.bodyTemperatures[i] ?? ""}
                    onChange={e =>
                      handleNumberChange("bodyTemperatures", i, e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    className="mt-1 text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 水分補給（4枠） */}
          <div>
            <h3 className="font-semibold mb-4">水分補給</h3>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Label className="text-xs">飲料{i + 1}</Label>
                  <Select value={record.hydrations[i]?.type || ""} onValueChange={v => handleHydrationChange(i, v || undefined, record.hydrations[i]?.amount)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="種別" />
                    </SelectTrigger>
                    <SelectContent>
                      {AT_FORM_METADATA.hydrationTypes.map(t => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="ml"
                    value={record.hydrations[i]?.amount ?? ""}
                    onChange={e =>
                      handleHydrationChange(i, record.hydrations[i]?.type, e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="text-xs text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 排尿・排便 (2行×3列) */}
          <div>
            <h3 className="font-semibold mb-4">排尿・排便</h3>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2 border p-3 rounded">
                  <Label className="text-xs font-semibold">時間帯{i + 1}</Label>
                  <div>
                    <Label className="text-xs">排尿(回)</Label>
                    <Input
                      type="number"
                      placeholder="回数"
                      value={record.excretions[i]?.urinationCount ?? ""}
                      onChange={e =>
                        handleExcretionChange(i, "urinationCount", e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">排便(状態)</Label>
                    <Select
                      value={record.excretions[i]?.defecationStatus || ""}
                      onValueChange={v => handleExcretionChange(i, "defecationStatus", v || undefined)}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="状態" />
                      </SelectTrigger>
                      <SelectContent>
                        {AT_FORM_METADATA.defecationStatuses.map(s => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 昼食 */}
          <div>
            <h3 className="font-semibold mb-4">昼食</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="lunch-main" className="text-sm">
                  主食割合(%)
                </Label>
                <Input
                  id="lunch-main"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={record.lunch.mainFoodRatio ?? ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      lunch: { ...prev.lunch, mainFoodRatio: e.target.value ? parseInt(e.target.value) : undefined },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lunch-side" className="text-sm">
                  副食割合(%)
                </Label>
                <Input
                  id="lunch-side"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={record.lunch.sideDishRatio ?? ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      lunch: { ...prev.lunch, sideDishRatio: e.target.value ? parseInt(e.target.value) : undefined },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lunch-med" className="text-sm">
                  内服時刻
                </Label>
                <Input
                  id="lunch-med"
                  type="time"
                  value={record.lunch.medicationTime || ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      lunch: { ...prev.lunch, medicationTime: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={record.lunch.oralCarePerformed ?? false}
                    onCheckedChange={checked =>
                      setRecord(prev => ({
                        ...prev,
                        lunch: { ...prev.lunch, oralCarePerformed: checked === true },
                      }))
                    }
                  />
                  <span className="text-sm">口腔ケア実施</span>
                </label>
              </div>
            </div>
          </div>

          {/* 間食 */}
          <div>
            <h3 className="font-semibold mb-4">間食</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="snack-main" className="text-sm">
                  主食割合(%)
                </Label>
                <Input
                  id="snack-main"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={record.snack.mainFoodRatio ?? ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      snack: { ...prev.snack, mainFoodRatio: e.target.value ? parseInt(e.target.value) : undefined },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="snack-side" className="text-sm">
                  副食割合(%)
                </Label>
                <Input
                  id="snack-side"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={record.snack.sideDishRatio ?? ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      snack: { ...prev.snack, sideDishRatio: e.target.value ? parseInt(e.target.value) : undefined },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="snack-med" className="text-sm">
                  内服時刻
                </Label>
                <Input
                  id="snack-med"
                  type="time"
                  value={record.snack.medicationTime || ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      snack: { ...prev.snack, medicationTime: e.target.value },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={record.snack.oralCarePerformed ?? false}
                    onCheckedChange={checked =>
                      setRecord(prev => ({
                        ...prev,
                        snack: { ...prev.snack, oralCarePerformed: checked === true },
                      }))
                    }
                  />
                  <span className="text-sm">口腔ケア実施</span>
                </label>
              </div>
            </div>
          </div>

          {/* 入浴 */}
          <div>
            <h3 className="font-semibold mb-4">入浴</h3>
            <Select value={record.bathing || ""} onValueChange={v => setRecord(prev => ({ ...prev, bathing: v || undefined }))}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {AT_FORM_METADATA.baths.map(b => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 課題①: ストレッチ・マッサージ */}
          <div>
            <h3 className="font-semibold mb-4">課題①：ストレッチ・マッサージ</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-6">
                {[
                  { key: "upperLimb" as const, label: "上肢" },
                  { key: "lowerLimb" as const, label: "下肢" },
                  { key: "shoulder" as const, label: "肩" },
                  { key: "waist" as const, label: "腰" },
                  { key: "hipJoint" as const, label: "股関節" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={record.stretch?.[key] ?? false}
                      onCheckedChange={checked =>
                        setRecord(prev => ({
                          ...prev,
                          stretch: { ...prev.stretch, [key]: checked === true },
                        }))
                      }
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <Label htmlFor="stretch-notes" className="text-sm">
                  様子（自由記述）
                </Label>
                <Textarea
                  id="stretch-notes"
                  placeholder="様子を記入してください"
                  value={record.stretch?.notes || ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      stretch: { ...prev.stretch, notes: e.target.value },
                    }))
                  }
                  className="mt-2 h-20"
                />
              </div>
            </div>
          </div>

          {/* 課題②: 立ち上がり訓練 */}
          <div>
            <h3 className="font-semibold mb-4">課題②：立ち上がり訓練</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="standup-count" className="text-sm">
                  回数
                </Label>
                <Input
                  id="standup-count"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={record.standup?.count ?? ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      standup: { ...prev.standup, count: e.target.value ? parseInt(e.target.value) : undefined },
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="standup-notes" className="text-sm">
                  様子（自由記述）
                </Label>
                <Textarea
                  id="standup-notes"
                  placeholder="様子を記入してください"
                  value={record.standup?.notes || ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      standup: { ...prev.standup, notes: e.target.value },
                    }))
                  }
                  className="mt-2 h-20"
                />
              </div>
            </div>
          </div>

          {/* 課題③: 意思疎通 */}
          <div>
            <h3 className="font-semibold mb-4">課題③：意思疎通</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={record.communication?.supported ?? false}
                  onCheckedChange={checked =>
                    setRecord(prev => ({
                      ...prev,
                      communication: { ...prev.communication, supported: checked === true },
                    }))
                  }
                />
                <span className="text-sm">支援実施</span>
              </label>
              <div>
                <Label htmlFor="communication-notes" className="text-sm">
                  内容（自由記述）
                </Label>
                <Textarea
                  id="communication-notes"
                  placeholder="内容を記入してください"
                  value={record.communication?.notes || ""}
                  onChange={e =>
                    setRecord(prev => ({
                      ...prev,
                      communication: { ...prev.communication, notes: e.target.value },
                    }))
                  }
                  className="mt-2 h-20"
                />
              </div>
            </div>
          </div>

          {/* 身体拘束（車いす） */}
          <div>
            <h3 className="font-semibold mb-4">身体拘束（車いす）</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={record.restraint?.table ?? false}
                  onCheckedChange={checked =>
                    setRecord(prev => ({
                      ...prev,
                      restraint: { ...prev.restraint, table: checked === true },
                    }))
                  }
                />
                <span className="text-sm">テーブル</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={record.restraint?.chestBelt ?? false}
                  onCheckedChange={checked =>
                    setRecord(prev => ({
                      ...prev,
                      restraint: { ...prev.restraint, chestBelt: checked === true },
                    }))
                  }
                />
                <span className="text-sm">胸ベルト</span>
              </label>
            </div>
          </div>

          {/* 活動 */}
          <div>
            <h3 className="font-semibold mb-4">活動</h3>
            <Textarea
              placeholder="活動内容を記入してください"
              value={record.activity || ""}
              onChange={e => setRecord(prev => ({ ...prev, activity: e.target.value }))}
              className="h-24"
            />
          </div>

          {/* 特記 */}
          <div>
            <h3 className="font-semibold mb-4">特記事項</h3>
            <Textarea
              placeholder="特記事項を記入してください"
              value={record.remarks || ""}
              onChange={e => setRecord(prev => ({ ...prev, remarks: e.target.value }))}
              className="h-24"
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              保存
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
