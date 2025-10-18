"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import CareFormLayout from "@/components/care-form-layout"

interface MealTubeFeedingFormProps {
  selectedUser: string
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

export function MealTubeFeedingForm({ selectedUser, onSubmit, onCancel }: MealTubeFeedingFormProps) {
  const [formData, setFormData] = useState({
    mealType: "",
    feedingMethod: "",
    mealContent: "",
    oralIntake: "",
    tubeIntake: "",
    totalIntake: "",
    choking: false,
    chokingDetails: "",
    swallowingDifficulty: "",
    posture: "",
    assistanceLevel: "",
    duration: "",
    reactions: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "meal-tube-feeding",
      user: selectedUser,
    })
  }

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  return (
    <CareFormLayout title="🍱 食事・経管栄養記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label htmlFor="time" className="text-blue-700 font-medium">
            ⏰ 食事時刻
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

        <div className="border-amber-200 bg-amber-50/30 border rounded-lg p-4">
          <Label className="text-amber-700 font-medium mb-3 block">🍽️ 食事区分</Label>
          <ClickableDropdown
            label="食事区分"
            value={formData.mealType}
            onValueChange={(value) => setFormData({ ...formData, mealType: value })}
            options={[
              { value: "breakfast", label: "朝食" },
              { value: "lunch", label: "昼食" },
              { value: "dinner", label: "夕食" },
              { value: "snack", label: "おやつ" },
            ]}
            placeholder="食事区分を選択してください"
          />
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-700 font-medium mb-3 block">🍴 摂取方法</Label>
          <ClickableDropdown
            label="摂取方法"
            value={formData.feedingMethod}
            onValueChange={(value) => setFormData({ ...formData, feedingMethod: value })}
            options={[
              { value: "oral-only", label: "経口のみ" },
              { value: "tube-only", label: "経管のみ" },
              { value: "both", label: "経口+経管" },
            ]}
            placeholder="摂取方法を選択してください"
          />
        </div>

        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <Label htmlFor="mealContent" className="text-green-700 font-medium">
            🥗 食事内容
          </Label>
          <Textarea
            id="mealContent"
            value={formData.mealContent}
            onChange={(e) => setFormData({ ...formData, mealContent: e.target.value })}
            placeholder="主食、主菜、副菜など"
            rows={2}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
            <Label htmlFor="oralIntake" className="text-cyan-700 font-medium">
              👄 経口摂取量
            </Label>
            <Input
              id="oralIntake"
              value={formData.oralIntake}
              onChange={(e) => setFormData({ ...formData, oralIntake: e.target.value })}
              placeholder="例：50%"
              className="mt-2 text-lg"
            />
          </div>

          <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
            <Label htmlFor="tubeIntake" className="text-orange-700 font-medium">
              💉 経管摂取量
            </Label>
            <Input
              id="tubeIntake"
              value={formData.tubeIntake}
              onChange={(e) => setFormData({ ...formData, tubeIntake: e.target.value })}
              placeholder="例：200ml"
              className="mt-2 text-lg"
            />
          </div>

          <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
            <Label htmlFor="totalIntake" className="text-teal-700 font-medium">
              📊 総摂取量
            </Label>
            <Input
              id="totalIntake"
              value={formData.totalIntake}
              onChange={(e) => setFormData({ ...formData, totalIntake: e.target.value })}
              placeholder="例：80%"
              className="mt-2 text-lg"
            />
          </div>
        </div>

        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-700 font-medium mb-3 block">⚠️ むせの有無</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-white rounded border">
              <Checkbox
                id="choking"
                checked={formData.choking}
                onCheckedChange={(checked) => setFormData({ ...formData, choking: checked as boolean })}
              />
              <Label htmlFor="choking" className="text-sm font-medium">
                むせあり
              </Label>
            </div>
            {formData.choking && (
              <Textarea
                id="chokingDetails"
                value={formData.chokingDetails}
                onChange={(e) => setFormData({ ...formData, chokingDetails: e.target.value })}
                placeholder="むせの詳細（頻度、程度など）"
                rows={2}
                className="mt-2"
              />
            )}
          </div>
        </div>

        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <Label className="text-pink-700 font-medium mb-3 block">🫧 嚥下状態</Label>
          <ClickableDropdown
            label="嚥下状態"
            value={formData.swallowingDifficulty}
            onValueChange={(value) => setFormData({ ...formData, swallowingDifficulty: value })}
            options={[
              { value: "normal", label: "正常" },
              { value: "mild-difficulty", label: "軽度困難" },
              { value: "moderate-difficulty", label: "中等度困難" },
              { value: "severe-difficulty", label: "重度困難" },
            ]}
            placeholder="嚥下状態を選択してください"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              placeholder="姿勢を選択してください"
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
                { value: "supervision", label: "見守り" },
                { value: "partial-assist", label: "一部介助" },
                { value: "full-assist", label: "全介助" },
              ]}
              placeholder="介助レベルを選択してください"
            />
          </div>
        </div>

        <div className="border-lime-200 bg-lime-50/30 border rounded-lg p-4">
          <Label htmlFor="duration" className="text-lime-700 font-medium">
            ⏱️ 食事時間
          </Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="例：30分"
            className="mt-2 text-lg"
          />
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label htmlFor="reactions" className="text-emerald-700 font-medium">
            😊 観察された反応
          </Label>
          <Textarea
            id="reactions"
            value={formData.reactions}
            onChange={(e) => setFormData({ ...formData, reactions: e.target.value })}
            placeholder="表情、食欲、拒否反応など"
            rows={2}
            className="mt-2"
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
