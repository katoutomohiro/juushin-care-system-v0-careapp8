"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { CareFormLayout } from "@/components/care-form-layout"

interface SkinOralCareFormData {
  timestamp: string
  careType: string
  careArea: string
  skinCondition: string
  skinProblems: string
  oralCondition: string
  oralProblems: string
  careMethod: string
  careProducts: string
  assistanceLevel: string
  careFrequency: string
  environmentalFactors: string
  skinObservations: string
  oralObservations: string
  skinIssues: boolean
  oralIssues: boolean
  preventiveMeasures: string
  response: string
  notes: string
  time: string
}

interface SkinOralCareFormProps {
  onSubmit: (data: SkinOralCareFormData) => void
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

export function SkinOralCareForm({ onSubmit, onCancel }: SkinOralCareFormProps) {
  const [formData, setFormData] = useState<SkinOralCareFormData>({
    timestamp: new Date().toISOString().slice(0, 16),
    careType: "",
    careArea: "",
    skinCondition: "",
    skinProblems: "",
    oralCondition: "",
    oralProblems: "",
    careMethod: "",
    careProducts: "",
    assistanceLevel: "",
    careFrequency: "",
    environmentalFactors: "",
    skinObservations: "",
    oralObservations: "",
    skinIssues: false,
    oralIssues: false,
    preventiveMeasures: "",
    response: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "skin_oral_care",
    })
  }

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  return (
    <CareFormLayout title="🧴 皮膚・口腔ケア記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-16">
        <div className="border-blue-200 bg-blue-50/30 pb-12 p-4 rounded-lg border">
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

        <div className="border-purple-200 bg-purple-50/30 pb-12 p-4 rounded-lg border">
          <Label className="text-purple-700 font-medium mb-3 block">🧼 ケアの種類</Label>
          <ClickableDropdown
            label="ケアの種類"
            value={formData.careType}
            onValueChange={(value) => setFormData({ ...formData, careType: value })}
            options={[
              { value: "skin-care", label: "皮膚ケア" },
              { value: "oral-care", label: "口腔ケア" },
              { value: "both", label: "皮膚・口腔ケア両方" },
              { value: "preventive", label: "予防的ケア" },
            ]}
            placeholder="ケアの種類を選択してください"
          />
        </div>

        <div className="border-indigo-200 bg-indigo-50/30 pb-12 p-4 rounded-lg border">
          <Label className="text-indigo-700 font-medium mb-3 block">📍 ケア部位</Label>
          <ClickableDropdown
            label="ケア部位"
            value={formData.careArea}
            onValueChange={(value) => setFormData({ ...formData, careArea: value })}
            options={[
              { value: "whole-body", label: "全身" },
              { value: "face", label: "顔面" },
              { value: "limbs", label: "四肢" },
              { value: "back", label: "背部" },
              { value: "buttocks", label: "臀部" },
              { value: "oral", label: "口腔" },
              { value: "teeth", label: "歯・歯肉" },
              { value: "pressure-points", label: "圧迫部位" },
            ]}
            placeholder="ケア部位を選択してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-pink-200 bg-pink-50/30 pb-12 p-4 rounded-lg border">
            <Label className="text-pink-700 font-medium mb-3 block">🌸 皮膚の状態</Label>
            <ClickableDropdown
              label="皮膚の状態"
              value={formData.skinCondition}
              onValueChange={(value) => setFormData({ ...formData, skinCondition: value })}
              options={[
                { value: "normal", label: "正常" },
                { value: "dry", label: "乾燥" },
                { value: "moist", label: "湿潤" },
                { value: "redness", label: "発赤" },
                { value: "pale", label: "蒼白" },
                { value: "cyanosis", label: "チアノーゼ" },
                { value: "sweating", label: "発汗" },
              ]}
              placeholder="皮膚の状態を選択してください"
            />
          </div>
          <div className="border-red-200 bg-red-50/30 pb-12 p-4 rounded-lg border">
            <Label className="text-red-700 font-medium mb-3 block">⚠️ 皮膚の問題</Label>
            <ClickableDropdown
              label="皮膚の問題"
              value={formData.skinProblems}
              onValueChange={(value) => setFormData({ ...formData, skinProblems: value })}
              options={[
                { value: "none", label: "問題なし" },
                { value: "pressure-sore", label: "褥瘡" },
                { value: "laceration", label: "裂傷" },
                { value: "infection", label: "感染症" },
                { value: "ulcer", label: "ただれ" },
                { value: "rash", label: "かぶれ" },
                { value: "eczema", label: "湿疹" },
              ]}
              placeholder="皮膚の問題を選択してください"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-cyan-200 bg-cyan-50/30 pb-12 p-4 rounded-lg border">
            <Label className="text-cyan-700 font-medium mb-3 block">🦷 口腔の状態</Label>
            <ClickableDropdown
              label="口腔の状態"
              value={formData.oralCondition}
              onValueChange={(value) => setFormData({ ...formData, oralCondition: value })}
              options={[
                { value: "normal", label: "正常" },
                { value: "dry", label: "乾燥" },
                { value: "inflammation", label: "炎症" },
                { value: "bleeding", label: "出血" },
                { value: "ulcer", label: "潰瘍" },
                { value: "odor", label: "口臭" },
              ]}
              placeholder="口腔の状態を選択してください"
            />
          </div>
          <div className="border-orange-200 bg-orange-50/30 pb-12 p-4 rounded-lg border">
            <Label className="text-orange-700 font-medium mb-3 block">🚨 口腔の問題</Label>
            <ClickableDropdown
              label="口腔の問題"
              value={formData.oralProblems}
              onValueChange={(value) => setFormData({ ...formData, oralProblems: value })}
              options={[
                { value: "none", label: "問題なし" },
                { value: "plaque", label: "歯垢付着" },
                { value: "gingivitis", label: "歯肉炎" },
                { value: "tooth-decay", label: "虫歯" },
                { value: "oral-thrush", label: "口腔カンジダ" },
                { value: "dry-mouth", label: "口腔乾燥症" },
              ]}
              placeholder="口腔の問題を選択してください"
            />
          </div>
        </div>
        <div className="border-green-200 bg-green-50/30 pb-12 p-4 rounded-lg border">
          <Label className="text-green-700 font-medium mb-3 block">🧽 ケア方法</Label>
          <ClickableDropdown
            label="ケア方法"
            value={formData.careMethod}
            onValueChange={(value) => setFormData({ ...formData, careMethod: value })}
            options={[
              { value: "cleansing", label: "清拭" },
              { value: "moisturizing", label: "保湿" },
              { value: "medication", label: "薬剤塗布" },
              { value: "oral-cleaning", label: "口腔清拭" },
              { value: "brushing", label: "歯磨き" },
              { value: "gargling", label: "うがい" },
              { value: "massage", label: "マッサージ" },
              { value: "positioning", label: "体位変換" },
            ]}
            placeholder="ケア方法を選択してください"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-teal-200 bg-teal-50/30 pb-12 p-4 rounded-lg border">
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
          <div className="border-amber-200 bg-amber-50/30 pb-12 p-4 rounded-lg border">
            <Label className="text-amber-700 font-medium mb-3 block">⏰ ケア頻度</Label>
            <ClickableDropdown
              label="ケア頻度"
              value={formData.careFrequency}
              onValueChange={(value) => setFormData({ ...formData, careFrequency: value })}
              options={[
                { value: "daily", label: "毎日" },
                { value: "twice-daily", label: "1日2回" },
                { value: "as-needed", label: "必要時" },
                { value: "weekly", label: "週1回" },
              ]}
              placeholder="ケア頻度を選択してください"
            />
          </div>
        </div>
        <div className="border-violet-200 bg-violet-50/30 pb-12 p-4 rounded-lg border">
          <Label className="text-violet-700 font-medium mb-3 block">👁️ 皮膚観察項目</Label>
          <ClickableDropdown
            label="皮膚観察項目"
            value={formData.skinObservations}
            onValueChange={(value) => setFormData({ ...formData, skinObservations: value })}
            options={[
              { value: "color-change", label: "色調変化" },
              { value: "temperature-change", label: "温度変化" },
              { value: "humidity-change", label: "湿度変化" },
              { value: "elasticity", label: "弾力性" },
              { value: "swelling", label: "腫脹" },
              { value: "induration", label: "硬結" },
              { value: "pain", label: "疼痛" },
              { value: "itching", label: "かゆみ" },
              { value: "sensory-abnormality", label: "感覚異常" },
              { value: "hair-condition", label: "毛髪の状態" },
              { value: "nail-condition", label: "爪の状態" },
              { value: "wound-healing", label: "傷の治癒状況" },
            ]}
            placeholder="皮膚観察項目を選択してください"
          />
        </div>
        <div className="border-sky-200 bg-sky-50/30 pb-12 p-4 rounded-lg border">
          <Label className="text-sky-700 font-medium mb-3 block">🦷 口腔観察項目</Label>
          <ClickableDropdown
            label="口腔観察項目"
            value={formData.oralObservations}
            onValueChange={(value) => setFormData({ ...formData, oralObservations: value })}
            options={[
              { value: "teeth-condition", label: "歯の状態" },
              { value: "gum-color", label: "歯肉の色調" },
              { value: "tongue-condition", label: "舌の状態" },
              { value: "oral-mucosa", label: "口腔粘膜" },
              { value: "saliva-secretion", label: "唾液分泌" },
              { value: "swallowing-function", label: "嚥下機能" },
              { value: "halitosis-degree", label: "口臭の程度" },
              { value: "oral-cleanliness", label: "口腔内清潔度" },
              { value: "denture-fit", label: "義歯の適合" },
              { value: "chewing-function", label: "咀嚼機能" },
            ]}
            placeholder="口腔観察項目を選択してください"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-emerald-200 bg-emerald-50/30 p-4 rounded-lg border">
            <Label htmlFor="careProducts" className="text-emerald-700 font-medium">
              🧴 使用製品・用具
            </Label>
            <Input
              id="careProducts"
              value={formData.careProducts}
              onChange={(e) => setFormData({ ...formData, careProducts: e.target.value })}
              placeholder="保湿剤、歯ブラシ、うがい薬など"
              className="mt-2 text-lg"
            />
          </div>
          <div className="border-lime-200 bg-lime-50/30 p-4 rounded-lg border">
            <Label htmlFor="environmentalFactors" className="text-lime-700 font-medium">
              🌍 環境要因
            </Label>
            <Input
              id="environmentalFactors"
              value={formData.environmentalFactors}
              onChange={(e) => setFormData({ ...formData, environmentalFactors: e.target.value })}
              placeholder="湿度、温度、清潔度など"
              className="mt-2 text-lg"
            />
          </div>
        </div>
        <div className="border-rose-200 bg-rose-50/30 p-4 rounded-lg border">
          <Label className="text-rose-700 font-medium mb-3 block">⚠️ トラブル状況</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-white rounded border">
              <Checkbox
                id="skinIssues"
                checked={formData.skinIssues}
                onCheckedChange={(checked) => setFormData({ ...formData, skinIssues: checked as boolean })}
              />
              <Label htmlFor="skinIssues" className="text-sm font-medium">
                皮膚トラブルあり
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-white rounded border">
              <Checkbox
                id="oralIssues"
                checked={formData.oralIssues}
                onCheckedChange={(checked) => setFormData({ ...formData, oralIssues: checked as boolean })}
              />
              <Label htmlFor="oralIssues" className="text-sm font-medium">
                口腔トラブルあり
              </Label>
            </div>
          </div>
        </div>
        <div className="border-indigo-200 bg-indigo-50/30 p-4 rounded-lg border">
          <Label htmlFor="preventiveMeasures" className="text-indigo-700 font-medium">
            🛡️ 予防的対応
          </Label>
          <Input
            id="preventiveMeasures"
            value={formData.preventiveMeasures}
            onChange={(e) => setFormData({ ...formData, preventiveMeasures: e.target.value })}
            placeholder="体位変換、保湿、清拭など"
            className="mt-2 text-lg"
          />
        </div>
        <div className="border-gray-200 bg-gray-50/30 p-4 rounded-lg border">
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
