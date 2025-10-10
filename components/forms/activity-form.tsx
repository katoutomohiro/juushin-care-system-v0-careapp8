"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import CareFormLayout from "@/components/care-form-layout"

interface ActivityFormData {
  timestamp: string
  activityType: string
  activityCategory: string
  duration: string
  participationLevel: string
  assistanceRequired: string
  bodyFunction: string
  cognitiveFunction: string
  emotionalState: string
  enjoymentLevel: string
  physicalResponse: string
  cognitiveResponse: string
  functionalLimitations: string // Changed from array to string for dropdown
  observedBehaviors: string // Changed from array to string for dropdown
  socialInteraction: boolean
  adaptationsUsed: string
  environmentalFactors: string
  notes: string
  time: string
}

interface ActivityFormProps {
  onSubmit: (data: ActivityFormData) => void
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

export function ActivityForm({ onSubmit, onCancel }: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    timestamp: new Date().toISOString().slice(0, 16),
    activityType: "",
    activityCategory: "",
    duration: "",
    participationLevel: "",
    assistanceRequired: "",
    bodyFunction: "",
    cognitiveFunction: "",
    emotionalState: "",
    enjoymentLevel: "",
    physicalResponse: "",
    cognitiveResponse: "",
    functionalLimitations: "", // Changed from array to string
    observedBehaviors: "", // Changed from array to string
    socialInteraction: false,
    adaptationsUsed: "",
    environmentalFactors: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "activity",
    })
  }

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  return (
    <CareFormLayout title="🏃 活動記録" onSubmit={handleSubmit} onCancel={onCancel}>
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
          <Label className="text-purple-700 font-medium mb-3 block">🎯 活動の種類</Label>
          <ClickableDropdown
            label="活動の種類"
            value={formData.activityType}
            onValueChange={(value) => setFormData({ ...formData, activityType: value })}
            options={[
              { value: "rehabilitation", label: "リハビリテーション" },
              { value: "recreation", label: "レクリエーション" },
              { value: "daily-living", label: "日常生活動作" },
              { value: "learning", label: "学習活動" },
              { value: "sensory", label: "感覚刺激活動" },
              { value: "music", label: "音楽活動" },
              { value: "art", label: "創作活動" },
              { value: "social", label: "社会活動" },
            ]}
            placeholder="活動の種類を選択してください"
          />
        </div>

        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-700 font-medium mb-3 block">📂 活動カテゴリー</Label>
          <ClickableDropdown
            label="活動カテゴリー"
            value={formData.activityCategory}
            onValueChange={(value) => setFormData({ ...formData, activityCategory: value })}
            options={[
              { value: "physical", label: "身体機能" },
              { value: "cognitive", label: "認知機能" },
              { value: "communication", label: "コミュニケーション" },
              { value: "self-care", label: "セルフケア" },
            ]}
            placeholder="活動カテゴリーを選択してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
            <Label htmlFor="duration" className="text-cyan-700 font-medium">
              ⏱️ 活動時間
            </Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="例：30分間"
              className="mt-2 text-lg"
            />
          </div>
          <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
            <Label className="text-green-700 font-medium mb-3 block">📊 参加レベル</Label>
            <ClickableDropdown
              label="参加レベル"
              value={formData.participationLevel}
              onValueChange={(value) => setFormData({ ...formData, participationLevel: value })}
              options={[
                { value: "active", label: "積極的" },
                { value: "passive", label: "消極的" },
                { value: "refused", label: "拒否" },
                { value: "no-response", label: "無反応" },
                { value: "partial", label: "部分参加" },
              ]}
              placeholder="参加レベルを選択してください"
            />
          </div>
        </div>

        <div className="border-amber-200 bg-amber-50/30 border rounded-lg p-4">
          <Label className="text-amber-700 font-medium mb-3 block">🤝 必要な支援</Label>
          <ClickableDropdown
            label="必要な支援"
            value={formData.assistanceRequired}
            onValueChange={(value) => setFormData({ ...formData, assistanceRequired: value })}
            options={[
              { value: "independent", label: "自立" },
              { value: "supervision", label: "見守り" },
              { value: "partial-assist", label: "一部介助" },
              { value: "full-assist", label: "全介助" },
              { value: "equipment", label: "機器使用" },
              { value: "adaptive", label: "適応支援" },
            ]}
            placeholder="必要な支援を選択してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
            <Label className="text-red-700 font-medium mb-3 block">💪 身体機能</Label>
            <ClickableDropdown
              label="身体機能"
              value={formData.bodyFunction}
              onValueChange={(value) => setFormData({ ...formData, bodyFunction: value })}
              options={[
                { value: "good", label: "良好" },
                { value: "limited", label: "制限あり" },
                { value: "poor", label: "困難" },
                { value: "variable", label: "変動" },
              ]}
              placeholder="身体機能を選択してください"
            />
          </div>
          <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
            <Label className="text-blue-700 font-medium mb-3 block">🧠 認知機能</Label>
            <ClickableDropdown
              label="認知機能"
              value={formData.cognitiveFunction}
              onValueChange={(value) => setFormData({ ...formData, cognitiveFunction: value })}
              options={[
                { value: "alert", label: "良好" },
                { value: "impaired", label: "軽度障害" },
                { value: "severe", label: "重度障害" },
                { value: "fluctuating", label: "変動" },
              ]}
              placeholder="認知機能を選択してください"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
            <Label className="text-pink-700 font-medium mb-3 block">😊 感情状態</Label>
            <ClickableDropdown
              label="感情状態"
              value={formData.emotionalState}
              onValueChange={(value) => setFormData({ ...formData, emotionalState: value })}
              options={[
                { value: "happy", label: "喜び" },
                { value: "calm", label: "落ち着き" },
                { value: "excited", label: "興奮" },
                { value: "stressed", label: "ストレス" },
                { value: "neutral", label: "平静" },
              ]}
              placeholder="感情状態を選択してください"
            />
          </div>
          <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
            <Label className="text-emerald-700 font-medium mb-3 block">⭐ 楽しさ・満足度</Label>
            <ClickableDropdown
              label="楽しさ・満足度"
              value={formData.enjoymentLevel}
              onValueChange={(value) => setFormData({ ...formData, enjoymentLevel: value })}
              options={[
                { value: "very-high", label: "非常に高い" },
                { value: "high", label: "高い" },
                { value: "medium", label: "普通" },
                { value: "low", label: "低い" },
                { value: "unknown", label: "不明" },
              ]}
              placeholder="楽しさ・満足度を選択してください"
            />
          </div>
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label className="text-orange-700 font-medium mb-3 block">⚠️ 機能的制限</Label>
          <ClickableDropdown
            label="機能的制限"
            value={formData.functionalLimitations}
            onValueChange={(value) => setFormData({ ...formData, functionalLimitations: value })}
            options={[
              { value: "motor-limitation", label: "運動制限" },
              { value: "sensory-limitation", label: "感覚制限" },
              { value: "cognitive-limitation", label: "認知制限" },
              { value: "communication-limitation", label: "コミュニケーション制限" },
              { value: "range-of-motion", label: "可動域制限" },
              { value: "muscle-weakness", label: "筋力低下" },
              { value: "balance-disorder", label: "バランス障害" },
              { value: "coordination-disorder", label: "協調性障害" },
              { value: "attention-disorder", label: "注意力障害" },
              { value: "memory-disorder", label: "記憶障害" },
              { value: "comprehension-disorder", label: "理解力障害" },
              { value: "judgment-disorder", label: "判断力障害" },
            ]}
            placeholder="機能的制限を選択してください"
          />
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-700 font-medium mb-3 block">👁️ 観察された行動</Label>
          <ClickableDropdown
            label="観察された行動"
            value={formData.observedBehaviors}
            onValueChange={(value) => setFormData({ ...formData, observedBehaviors: value })}
            options={[
              { value: "smile", label: "笑顔" },
              { value: "vocalization", label: "発声" },
              { value: "hand-movement", label: "手の動き" },
              { value: "eye-tracking", label: "視線追従" },
              { value: "body-movement", label: "体の動き" },
              { value: "refusal-behavior", label: "拒否行動" },
              { value: "self-harm", label: "自傷行動" },
              { value: "stereotyped-behavior", label: "常同行動" },
              { value: "focused-behavior", label: "集中行動" },
              { value: "exploratory-behavior", label: "探索行動" },
              { value: "imitative-behavior", label: "模倣行動" },
              { value: "social-response", label: "社会的反応" },
            ]}
            placeholder="観察された行動を選択してください"
          />
        </div>

        <div className="border-rose-200 bg-rose-50/30 border rounded-lg p-4">
          <Label className="text-rose-700 font-medium mb-3 block">👥 社会的交流</Label>
          <div className="flex items-center space-x-3 p-2 bg-white rounded border">
            <Checkbox
              id="socialInteraction"
              checked={formData.socialInteraction}
              onCheckedChange={(checked) => setFormData({ ...formData, socialInteraction: checked as boolean })}
            />
            <Label htmlFor="socialInteraction" className="text-sm font-medium">
              他者との交流あり
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
            <Label htmlFor="adaptationsUsed" className="text-indigo-700 font-medium">
              🔧 使用した配慮・工夫
            </Label>
            <Input
              id="adaptationsUsed"
              value={formData.adaptationsUsed}
              onChange={(e) => setFormData({ ...formData, adaptationsUsed: e.target.value })}
              placeholder="環境調整、道具の工夫など"
              className="mt-2 text-lg"
            />
          </div>
          <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
            <Label htmlFor="environmentalFactors" className="text-cyan-700 font-medium">
              🌍 環境要因
            </Label>
            <Input
              id="environmentalFactors"
              value={formData.environmentalFactors}
              onChange={(e) => setFormData({ ...formData, environmentalFactors: e.target.value })}
              placeholder="騒音、照明、温度など"
              className="mt-2 text-lg"
            />
          </div>
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
