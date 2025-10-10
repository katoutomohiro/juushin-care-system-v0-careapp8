"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CareFormLayout from "@/components/care-form-layout"

interface HydrationFormProps {
  onSubmit: (data: any) => void
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

const NumberSelector = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit = "",
  className = "",
}: {
  value: string
  onValueChange: (value: string) => void
  min: number
  max: number
  step?: number
  unit?: string
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const generateOptions = () => {
    const options = []
    for (let i = min; i <= max; i += step) {
      const val = step < 1 ? i.toFixed(1) : i.toString()
      options.push({ value: val, label: `${val}${unit}` })
    }
    return options
  }

  const options = generateOptions()

  return (
    <div className={`relative ${className}`}>
      <div
        className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between bg-white hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? `${value}${unit}` : `選択してください`}
        </span>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[1000] max-h-[200px] overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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

export function HydrationForm({ onSubmit, onCancel }: HydrationFormProps) {
  const [formData, setFormData] = useState({
    amount: "200", // Changed default value from "100" to "200"
    fluidType: "",
    method: "",
    temperature: "",
    intakeStatus: "",
    posture: "",
    assistanceLevel: "",
    reactions: "",
    difficulties: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "hydration",
    })
  }

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  return (
    <CareFormLayout title="💧 水分補給記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label htmlFor="time" className="text-blue-700 font-medium">
            ⏰ 補給時刻
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

        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <Label className="text-cyan-700 font-medium mb-3 block">🥤 水分量（ml）</Label>
          <NumberSelector
            value={formData.amount}
            onValueChange={(value) => setFormData({ ...formData, amount: value })}
            min={10}
            max={1000}
            step={10}
            unit="ml"
            className="text-lg"
          />
        </div>

        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <Label className="text-green-700 font-medium mb-3 block">🍹 水分の種類</Label>
          <ClickableDropdown
            label="水分の種類"
            value={formData.fluidType}
            onValueChange={(value) => setFormData({ ...formData, fluidType: value })}
            options={[
              { value: "water", label: "水" },
              { value: "tea", label: "お茶" },
              { value: "juice", label: "ジュース" },
              { value: "milk", label: "牛乳" },
              { value: "sports-drink", label: "スポーツドリンク" },
              { value: "oral-rehydration", label: "経口補水液" },
              { value: "supplement", label: "栄養補助飲料" },
              { value: "medicine", label: "薬液" },
              { value: "other", label: "その他" },
            ]}
            placeholder="水分の種類を選択してください"
          />
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-700 font-medium mb-3 block">🍼 補給方法</Label>
          <ClickableDropdown
            label="補給方法"
            value={formData.method}
            onValueChange={(value) => setFormData({ ...formData, method: value })}
            options={[
              { value: "oral", label: "経口摂取" },
              { value: "spoon", label: "スプーン" },
              { value: "straw", label: "ストロー" },
              { value: "syringe", label: "シリンジ" },
              { value: "tube-gastrostomy", label: "胃瘻" },
              { value: "tube-nasogastric", label: "鼻胃管" },
              { value: "iv", label: "点滴" },
              { value: "other", label: "その他" },
            ]}
            placeholder="補給方法を選択してください"
          />
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label className="text-orange-700 font-medium mb-3 block">🌡️ 温度</Label>
          <ClickableDropdown
            label="温度"
            value={formData.temperature}
            onValueChange={(value) => setFormData({ ...formData, temperature: value })}
            options={[
              { value: "cold", label: "冷たい" },
              { value: "room", label: "常温" },
              { value: "body-temp", label: "体温程度" },
              { value: "warm", label: "温かい" },
            ]}
            placeholder="温度を選択してください"
          />
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label className="text-emerald-700 font-medium mb-3 block">✅ 摂取状況</Label>
          <ClickableDropdown
            label="摂取状況"
            value={formData.intakeStatus}
            onValueChange={(value) => setFormData({ ...formData, intakeStatus: value })}
            options={[
              { value: "complete", label: "完全摂取" },
              { value: "partial", label: "部分摂取" },
              { value: "refused", label: "拒否" },
              { value: "vomited", label: "嘔吐" },
            ]}
            placeholder="摂取状況を選択してください"
          />
        </div>

        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <Label className="text-indigo-700 font-medium mb-3 block">🪑 摂取時の姿勢</Label>
          <ClickableDropdown
            label="摂取時の姿勢"
            value={formData.posture}
            onValueChange={(value) => setFormData({ ...formData, posture: value })}
            options={[
              { value: "sitting", label: "座位" },
              { value: "semi-sitting", label: "半座位" },
              { value: "side-lying", label: "側臥位" },
              { value: "supine", label: "仰臥位" },
            ]}
            placeholder="摂取時の姿勢を選択してください"
          />
        </div>

        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-700 font-medium mb-3 block">🤝 介助レベル</Label>
          <ClickableDropdown
            label="介助レベル"
            value={formData.assistanceLevel}
            onValueChange={(value) => setFormData({ ...formData, assistanceLevel: value })}
            options={[
              { value: "independent", label: "自立" },
              { value: "partial-assist", label: "一部介助" },
              { value: "full-assist", label: "全介助" },
              { value: "supervision", label: "見守り" },
            ]}
            placeholder="介助レベルを選択してください"
          />
        </div>

        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <Label className="text-pink-700 font-medium mb-3 block">😊 観察された反応・症状</Label>
          <ClickableDropdown
            label="観察された反応・症状"
            value={formData.reactions}
            onValueChange={(value) => setFormData({ ...formData, reactions: value })}
            options={[
              { value: "normal", label: "正常な摂取" },
              { value: "choking", label: "むせ" },
              { value: "coughing", label: "咳込み" },
              { value: "vomiting", label: "嘔吐" },
              { value: "refusal", label: "拒否反応" },
              { value: "happy", label: "喜びの表情" },
              { value: "dislike", label: "嫌がる表情" },
              { value: "sleepy", label: "眠気" },
              { value: "excited", label: "興奮" },
              { value: "calm", label: "落ち着き" },
              { value: "sweating", label: "発汗" },
              { value: "color-change", label: "顔色変化" },
            ]}
            placeholder="観察された反応・症状を選択してください"
          />
        </div>

        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-700 font-medium mb-3 block">⚠️ 摂取困難な要因</Label>
          <ClickableDropdown
            label="摂取困難な要因"
            value={formData.difficulties}
            onValueChange={(value) => setFormData({ ...formData, difficulties: value })}
            options={[
              { value: "swallowing", label: "嚥下困難" },
              { value: "consciousness", label: "意識レベル低下" },
              { value: "illness", label: "体調不良" },
              { value: "refusal", label: "拒否行動" },
              { value: "oral-issues", label: "口腔内問題" },
              { value: "breathing", label: "呼吸困難" },
              { value: "posture", label: "姿勢保持困難" },
              { value: "equipment", label: "機器の問題" },
            ]}
            placeholder="摂取困難な要因を選択してください"
          />
        </div>

        <div className="border-gray-200 bg-gray-50/30 border rounded-lg p-4">
          <Label htmlFor="notes" className="text-gray-700 font-medium">
            📝 備考
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="摂取状況や反応など"
            rows={3}
            className="mt-2"
          />
        </div>
      </div>
    </CareFormLayout>
  )
}
