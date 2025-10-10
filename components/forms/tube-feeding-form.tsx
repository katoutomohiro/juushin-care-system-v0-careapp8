"use client"

import type React from "react"
import CareFormLayout from "@/components/care-form-layout"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TubeFeedingFormProps {
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

export function TubeFeedingForm({ onSubmit, onCancel }: TubeFeedingFormProps) {
  const [formData, setFormData] = useState({
    amount: "200", // Changed default value from empty to "200"
    nutritionBrand: "",
    nutritionType: "",
    tubeType: "",
    infusionMethod: "",
    infusionRate: "100",
    temperature: "",
    patientPosition: "",
    preCare: "",
    postCare: "",
    observedSymptoms: "",
    complications: "",
    tubeCondition: "",
    patientResponse: "",
    environmentalFactors: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "tube_feeding",
    })
  }

  return (
    <CareFormLayout title="🍼 経管栄養記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label htmlFor="time" className="text-blue-700 font-medium">
            ⏰ 実施時刻
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

        <div className="grid grid-cols-2 gap-4">
          <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
            <Label className="text-green-700 font-medium mb-3 block">🥤 栄養剤ブランド</Label>
            <ClickableDropdown
              label="栄養剤ブランド"
              value={formData.nutritionBrand}
              onValueChange={(value) => setFormData({ ...formData, nutritionBrand: value })}
              options={[
                { value: "ensure", label: "エンシュア" },
                { value: "racol", label: "ラコール" },
                { value: "elental", label: "エレンタール" },
                { value: "mein", label: "メイン" },
                { value: "impact", label: "インパクト" },
                { value: "peptamen", label: "ペプタメン" },
                { value: "other", label: "その他" },
              ]}
              placeholder="栄養剤ブランドを選択してください"
            />
          </div>
          <div className="border-lime-200 bg-lime-50/30 border rounded-lg p-4">
            <Label className="text-lime-700 font-medium mb-3 block">🧪 栄養剤タイプ</Label>
            <ClickableDropdown
              label="栄養剤タイプ"
              value={formData.nutritionType}
              onValueChange={(value) => setFormData({ ...formData, nutritionType: value })}
              options={[
                { value: "standard", label: "標準型" },
                { value: "semi-digested", label: "半消化態" },
                { value: "elemental", label: "成分栄養" },
                { value: "high-calorie", label: "高カロリー" },
                { value: "disease-specific", label: "疾患対応" },
              ]}
              placeholder="栄養剤タイプを選択してください"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
            <Label className="text-indigo-700 font-medium mb-3 block">🔗 チューブの種類</Label>
            <ClickableDropdown
              label="チューブの種類"
              value={formData.tubeType}
              onValueChange={(value) => setFormData({ ...formData, tubeType: value })}
              options={[
                { value: "gastrostomy", label: "胃瘻" },
                { value: "nasogastric", label: "鼻胃管" },
                { value: "jejunostomy", label: "腸瘻" },
                { value: "nasojejunal", label: "鼻腸管" },
              ]}
              placeholder="チューブの種類を選択してください"
            />
          </div>
          <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
            <Label className="text-purple-700 font-medium mb-3 block">⚙️ 注入方法</Label>
            <ClickableDropdown
              label="注入方法"
              value={formData.infusionMethod}
              onValueChange={(value) => setFormData({ ...formData, infusionMethod: value })}
              options={[
                { value: "gravity", label: "自然滴下" },
                { value: "pump", label: "ポンプ使用" },
                { value: "syringe", label: "シリンジ押し" },
                { value: "bolus", label: "ボーラス投与" },
              ]}
              placeholder="注入方法を選択してください"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
            <Label className="text-teal-700 font-medium mb-3 block">⏱️ 注入速度（ml/h）</Label>
            <NumberSelector
              value={formData.infusionRate}
              onValueChange={(value) => setFormData({ ...formData, infusionRate: value })}
              min={10}
              max={500}
              step={1}
              unit="ml/h"
              className="text-lg"
            />
          </div>
          <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
            <Label className="text-pink-700 font-medium mb-3 block">🌡️ 栄養剤温度</Label>
            <ClickableDropdown
              label="栄養剤温度"
              value={formData.temperature}
              onValueChange={(value) => setFormData({ ...formData, temperature: value })}
              options={[
                { value: "room", label: "常温" },
                { value: "body-temp", label: "体温程度" },
                { value: "warm", label: "温かい" },
                { value: "cold", label: "冷たい" },
              ]}
              placeholder="栄養剤温度を選択してください"
            />
          </div>
        </div>

        <div className="border-amber-200 bg-amber-50/30 border rounded-lg p-4">
          <Label className="text-amber-700 font-medium mb-3 block">🛏️ 患者体位</Label>
          <ClickableDropdown
            label="患者体位"
            value={formData.patientPosition}
            onValueChange={(value) => setFormData({ ...formData, patientPosition: value })}
            options={[
              { value: "semi-fowler", label: "半座位" },
              { value: "fowler", label: "座位" },
              { value: "right-side", label: "右側臥位" },
              { value: "left-side", label: "左側臥位" },
              { value: "supine", label: "仰臥位" },
              { value: "prone", label: "腹臥位" },
            ]}
            placeholder="患者体位を選択してください"
          />
        </div>

        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <Label className="text-cyan-700 font-medium mb-3 block">🔍 前処置</Label>
          <ClickableDropdown
            label="前処置"
            value={formData.preCare}
            onValueChange={(value) => setFormData({ ...formData, preCare: value })}
            options={[
              { value: "position-check", label: "体位確認" },
              { value: "tube-check", label: "チューブ確認" },
              { value: "gastric-content-check", label: "胃内容確認" },
              { value: "temperature-check", label: "温度確認" },
              { value: "hand-hygiene", label: "手指衛生" },
              { value: "tube-flush", label: "チューブ洗浄" },
              { value: "residual-volume", label: "残胃量測定" },
              { value: "vital-signs", label: "バイタル測定" },
            ]}
            placeholder="前処置を選択してください"
          />
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-700 font-medium mb-3 block">✅ 後処置</Label>
          <ClickableDropdown
            label="後処置"
            value={formData.postCare}
            onValueChange={(value) => setFormData({ ...formData, postCare: value })}
            options={[
              { value: "flush", label: "フラッシュ" },
              { value: "position-maintain", label: "体位保持" },
              { value: "tube-clamp", label: "チューブクランプ" },
              { value: "observation-record", label: "観察記録" },
              { value: "tube-fixation-check", label: "チューブ固定確認" },
              { value: "oral-care", label: "口腔ケア" },
              { value: "vital-measurement", label: "バイタル測定" },
              { value: "safety-check", label: "安全確認" },
            ]}
            placeholder="後処置を選択してください"
          />
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label className="text-emerald-700 font-medium mb-3 block">👁️ 観察された症状</Label>
          <ClickableDropdown
            label="観察された症状"
            value={formData.observedSymptoms}
            onValueChange={(value) => setFormData({ ...formData, observedSymptoms: value })}
            options={[
              { value: "normal-intake", label: "正常な摂取" },
              { value: "vomiting", label: "嘔吐" },
              { value: "reflux", label: "逆流" },
              { value: "abdominal-distension", label: "腹部膨満" },
              { value: "diarrhea", label: "下痢" },
              { value: "constipation", label: "便秘" },
              { value: "abdominal-pain", label: "腹痛" },
              { value: "discomfort", label: "不快感" },
              { value: "fever", label: "発熱" },
              { value: "blood-sugar-change", label: "血糖変動" },
              { value: "allergic-reaction", label: "アレルギー反応" },
              { value: "dehydration", label: "脱水症状" },
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
              { value: "tube-occlusion", label: "チューブ閉塞" },
              { value: "tube-removal", label: "チューブ抜去" },
              { value: "infection", label: "感染症" },
              { value: "bleeding", label: "出血" },
              { value: "granulation", label: "肉芽形成" },
              { value: "skin-trouble", label: "皮膚トラブル" },
              { value: "aspiration", label: "誤嚥" },
              { value: "electrolyte-imbalance", label: "電解質異常" },
            ]}
            placeholder="合併症・問題を選択してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
            <Label className="text-violet-700 font-medium mb-3 block">🔗 チューブ状態</Label>
            <ClickableDropdown
              label="チューブ状態"
              value={formData.tubeCondition}
              onValueChange={(value) => setFormData({ ...formData, tubeCondition: value })}
              options={[
                { value: "normal", label: "正常" },
                { value: "partial-block", label: "部分閉塞" },
                { value: "blocked", label: "閉塞" },
                { value: "displaced", label: "位置異常" },
              ]}
              placeholder="チューブ状態を選択してください"
            />
          </div>
          <div className="border-rose-200 bg-rose-50/30 border rounded-lg p-4">
            <Label className="text-rose-700 font-medium mb-3 block">😊 患者の反応</Label>
            <ClickableDropdown
              label="患者の反応"
              value={formData.patientResponse}
              onValueChange={(value) => setFormData({ ...formData, patientResponse: value })}
              options={[
                { value: "comfortable", label: "快適" },
                { value: "neutral", label: "普通" },
                { value: "uncomfortable", label: "不快" },
                { value: "distressed", label: "苦痛" },
              ]}
              placeholder="患者の反応を選択してください"
            />
          </div>
        </div>

        <div className="border-sky-200 bg-sky-50/30 border rounded-lg p-4">
          <Label htmlFor="environmentalFactors" className="text-sky-700 font-medium">
            🌍 環境要因
          </Label>
          <Input
            id="environmentalFactors"
            value={formData.environmentalFactors}
            onChange={(e) => setFormData({ ...formData, environmentalFactors: e.target.value })}
            placeholder="室温、湿度、騒音レベルなど"
            className="mt-2 text-lg"
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
            placeholder="その他の観察事項"
            rows={3}
            className="mt-2"
          />
        </div>
      </div>
    </CareFormLayout>
  )
}
