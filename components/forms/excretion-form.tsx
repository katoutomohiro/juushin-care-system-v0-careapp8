"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import CareFormLayout from "@/components/care-form-layout"

interface ExcretionFormData {
  timestamp: string
  excretionType: string
  urineCharacteristics: string
  stoolCharacteristics: string
  amount: string
  consistency: string
  color: string
  odor: string
  excretionMethod: string
  assistanceLevel: string
  excretionState: string
  observedSymptoms: string
  complications: string
  incontinence: boolean
  diaperChange: boolean
  skinCondition: string
  notes: string
  time: string
}

interface ExcretionFormProps {
  onSubmit: (data: ExcretionFormData) => void
  onCancel: () => void
}

const ClickableDropdown = ({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className = "",
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <div
        className="w-full h-12 px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? options.find((opt) => opt.value === value)?.label : placeholder}
        </span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
              onClick={() => {
                onValueChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ExcretionForm({ onSubmit, onCancel }: ExcretionFormProps) {
  const [formData, setFormData] = useState<ExcretionFormData>({
    timestamp: new Date().toISOString().slice(0, 16),
    excretionType: "",
    urineCharacteristics: "",
    stoolCharacteristics: "",
    amount: "",
    consistency: "",
    color: "",
    odor: "",
    excretionMethod: "",
    assistanceLevel: "",
    excretionState: "",
    observedSymptoms: "", // Changed from array to string for dropdown
    complications: "", // Changed from array to string for dropdown
    incontinence: false,
    diaperChange: false,
    skinCondition: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Excretion form submitted with data:", formData)
    const submitData = {
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "excretion",
    }
    console.log("[v0] Final submit data:", submitData)
    onSubmit(submitData)
  }

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  return (
    <CareFormLayout title="🚽 排泄記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label htmlFor="time" className="text-blue-700 font-medium">
            ⏰ 記録時刻
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="text-lg flex-1"
            />
            <Button
              type="button"
              onClick={setCurrentTime}
              variant="outline"
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 font-medium"
            >
              今すぐ
            </Button>
          </div>
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-700 font-medium mb-3 block">🚽 排泄の種類</Label>
          <ClickableDropdown
            label="排泄の種類"
            value={formData.excretionType}
            onValueChange={(value) => setFormData({ ...formData, excretionType: value })}
            options={[
              { value: "urine", label: "尿" },
              { value: "stool", label: "便" },
              { value: "both", label: "尿・便両方" },
            ]}
            placeholder="排泄の種類を選択してください"
          />
        </div>

        <div className="border-yellow-200 bg-yellow-50/30 border rounded-lg p-4">
          <Label className="text-yellow-700 font-medium mb-3 block">💧 尿の性状</Label>
          <ClickableDropdown
            label="尿の性状"
            value={formData.urineCharacteristics}
            onValueChange={(value) => setFormData({ ...formData, urineCharacteristics: value })}
            options={[
              { value: "normal", label: "正常" },
              { value: "concentrated", label: "濃縮" },
              { value: "dilute", label: "薄い" },
              { value: "hematuria", label: "血尿" },
              { value: "cloudy", label: "混濁" },
              { value: "foamy", label: "泡立ち" },
            ]}
            placeholder="尿の性状を選択してください"
          />
        </div>

        <div className="border-amber-200 bg-amber-50/30 border rounded-lg p-4">
          <Label className="text-amber-700 font-medium mb-3 block">💩 便の性状</Label>
          <ClickableDropdown
            label="便の性状"
            value={formData.stoolCharacteristics}
            onValueChange={(value) => setFormData({ ...formData, stoolCharacteristics: value })}
            options={[
              { value: "normal", label: "正常便" },
              { value: "soft", label: "軟便" },
              { value: "diarrhea", label: "下痢" },
              { value: "constipation", label: "便秘" },
              { value: "bloody", label: "血便" },
              { value: "mucous", label: "粘液便" },
            ]}
            placeholder="便の性状を選択してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
            <Label className="text-cyan-700 font-medium mb-3 block">📏 排泄量</Label>
            <ClickableDropdown
              label="排泄量"
              value={formData.amount}
              onValueChange={(value) => setFormData({ ...formData, amount: value })}
              options={[
                { value: "微量", label: "微量" },
                { value: "少量", label: "少量" },
                { value: "普通", label: "普通" },
                { value: "多量", label: "多量" },
              ]}
              placeholder="排泄量を選択"
            />
          </div>
          <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
            <Label className="text-indigo-700 font-medium mb-3 block">🔧 排泄方法</Label>
            <ClickableDropdown
              label="排泄方法"
              value={formData.excretionMethod}
              onValueChange={(value) => setFormData({ ...formData, excretionMethod: value })}
              options={[
                { value: "natural", label: "自然排泄" },
                { value: "diaper", label: "おむつ" },
                { value: "catheter", label: "導尿" },
                { value: "enema", label: "浣腸" },
                { value: "manual", label: "摘便" },
              ]}
              placeholder="排泄方法を選択"
            />
          </div>
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-700 font-medium mb-3 block">🤝 介助レベル</Label>
          <ClickableDropdown
            label="介助レベル"
            value={formData.assistanceLevel}
            onValueChange={(value) => setFormData({ ...formData, assistanceLevel: value })}
            options={[
              { value: "independent", label: "自立" },
              { value: "supervision", label: "見守り" },
              { value: "partial", label: "一部介助" },
              { value: "full", label: "全介助" },
            ]}
            placeholder="介助レベルを選択してください"
          />
        </div>

        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-700 font-medium mb-3 block">🧠 排泄時の状態</Label>
          <ClickableDropdown
            label="排泄時の状態"
            value={formData.excretionState}
            onValueChange={(value) => setFormData({ ...formData, excretionState: value })}
            options={[
              { value: "alert", label: "意識清明" },
              { value: "drowsy", label: "傾眠" },
              { value: "agitated", label: "不穏" },
              { value: "pain", label: "痛み" },
            ]}
            placeholder="排泄時の状態を選択してください"
          />
        </div>

        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <Label className="text-pink-700 font-medium mb-3 block">👁️ 観察された症状</Label>
          <ClickableDropdown
            label="観察された症状"
            value={formData.observedSymptoms}
            onValueChange={(value) => setFormData({ ...formData, observedSymptoms: value })}
            options={[
              { value: "incontinence", label: "失禁" },
              { value: "urge-urine", label: "尿意あり" },
              { value: "urge-stool", label: "便意あり" },
              { value: "abdominal-distension", label: "腹部膨満" },
              { value: "abdominal-pain", label: "腹痛" },
              { value: "urination-difficulty", label: "排尿困難" },
              { value: "defecation-difficulty", label: "排便困難" },
              { value: "frequent-urination", label: "頻尿" },
              { value: "residual-urine", label: "残尿感" },
              { value: "straining", label: "いきみ" },
              { value: "discomfort", label: "不快感" },
              { value: "relief", label: "安堵感" },
            ]}
            placeholder="観察された症状を選択してください"
          />
        </div>

        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-700 font-medium mb-3 block">⚠️ 合併症・問題</Label>
          <ClickableDropdown
            label="合併症・問題"
            value={formData.complications}
            onValueChange={(value) => setFormData({ ...formData, complications: value })}
            options={[
              { value: "skin-rash", label: "皮膚のかぶれ" },
              { value: "redness", label: "発赤" },
              { value: "sores", label: "ただれ" },
              { value: "infection-suspected", label: "感染症の疑い" },
              { value: "bleeding", label: "出血" },
              { value: "dehydration", label: "脱水症状" },
              { value: "electrolyte-imbalance", label: "電解質異常" },
              { value: "medication-side-effects", label: "薬剤の副作用" },
            ]}
            placeholder="合併症・問題を選択してください"
          />
        </div>

        <div className="border-rose-200 bg-rose-50/30 border rounded-lg p-4">
          <Label className="text-rose-700 font-medium mb-3 block">✅ 追加情報</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-white rounded border">
              <Checkbox
                id="incontinence"
                checked={formData.incontinence}
                onCheckedChange={(checked) => setFormData({ ...formData, incontinence: checked as boolean })}
              />
              <Label htmlFor="incontinence" className="text-sm font-medium">
                失禁あり
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-white rounded border">
              <Checkbox
                id="diaperChange"
                checked={formData.diaperChange}
                onCheckedChange={(checked) => setFormData({ ...formData, diaperChange: checked as boolean })}
              />
              <Label htmlFor="diaperChange" className="text-sm font-medium">
                おむつ交換実施
              </Label>
            </div>
          </div>
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label htmlFor="skinCondition" className="text-emerald-700 font-medium">
            🩹 皮膚状態
          </Label>
          <Input
            id="skinCondition"
            value={formData.skinCondition}
            onChange={(e) => setFormData({ ...formData, skinCondition: e.target.value })}
            placeholder="発赤、かぶれ、正常など"
            className="mt-2 text-lg"
          />
        </div>

        <div className="border-gray-200 bg-gray-50/30 border rounded-lg p-4">
          <Label htmlFor="notes" className="text-gray-700 font-medium">
            📝 詳細・備考
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="その他の観察事項や特記事項"
            rows={3}
            className="mt-2"
          />
        </div>
      </div>
    </CareFormLayout>
  )
}
