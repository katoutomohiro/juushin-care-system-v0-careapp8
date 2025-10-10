"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import CareFormLayout from "@/components/care-form-layout"

interface VitalsFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

const ClickableDropdown = ({
  value,
  onValueChange,
  placeholder,
  options,
  className = "",
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string }[]
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <div
        className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between bg-white hover:border-gray-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {value ? options.find((opt) => opt.value === value)?.label : placeholder}
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

export function VitalsForm({ onSubmit, onCancel }: VitalsFormProps) {
  const [formData, setFormData] = useState({
    temperature: "36.5",
    temperaturePosition: "",
    bloodPressureSystolic: "120",
    bloodPressureDiastolic: "80",
    bloodPressurePosition: "",
    heartRate: "70",
    heartRhythm: "",
    respiratoryRate: "40",
    respiratoryPattern: "",
    oxygenSaturation: "98",
    oxygenLevel: "",
    consciousnessLevel: "",
    skinCondition: "",
    measurementCondition: "",
    measurementDifficulties: [] as string[],
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: new Date().toISOString(),
      eventType: "vitals",
    })
  }

  const setCurrentTime = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, time: currentTime })
  }

  const handleDifficultyChange = (difficulty: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, measurementDifficulties: [...formData.measurementDifficulties, difficulty] })
    } else {
      setFormData({
        ...formData,
        measurementDifficulties: formData.measurementDifficulties.filter((d) => d !== difficulty),
      })
    }
  }

  return (
    <CareFormLayout title="❤️ バイタルサイン記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label htmlFor="time" className="text-blue-700 font-medium">
            ⏰ 測定時刻
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

        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-700 font-medium mb-3 block">🌡️ 体温（℃）</Label>
          <NumberSelector
            value={formData.temperature}
            onValueChange={(value) => setFormData({ ...formData, temperature: value })}
            min={30.0}
            max={45.0}
            step={0.1}
            unit="℃"
            className="text-lg"
          />
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label className="text-orange-700 font-medium mb-3 block">📍 体温測定部位</Label>
          <ClickableDropdown
            value={formData.temperaturePosition}
            onValueChange={(value) => setFormData({ ...formData, temperaturePosition: value })}
            placeholder="体温測定部位を選択してください"
            options={[
              { value: "axillary", label: "腋窩" },
              { value: "oral", label: "口腔" },
              { value: "tympanic", label: "鼓膜" },
              { value: "rectal", label: "直腸" },
              { value: "forehead", label: "額（非接触）" },
              { value: "temporal", label: "側頭部" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-700 font-medium mb-3 block">🩺 血圧（mmHg）</Label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <Label className="text-sm text-purple-600 mb-2 block">収縮期血圧</Label>
              <NumberSelector
                value={formData.bloodPressureSystolic}
                onValueChange={(value) => setFormData({ ...formData, bloodPressureSystolic: value })}
                min={60}
                max={250}
                step={1}
                unit="mmHg"
                className="text-lg"
              />
            </div>
            <div>
              <Label className="text-sm text-purple-600 mb-2 block">拡張期血圧</Label>
              <NumberSelector
                value={formData.bloodPressureDiastolic}
                onValueChange={(value) => setFormData({ ...formData, bloodPressureDiastolic: value })}
                min={30}
                max={150}
                step={1}
                unit="mmHg"
                className="text-lg"
              />
            </div>
          </div>
          <Label className="text-purple-700 font-medium mb-2 block">測定部位</Label>
          <ClickableDropdown
            value={formData.bloodPressurePosition}
            onValueChange={(value) => setFormData({ ...formData, bloodPressurePosition: value })}
            placeholder="血圧測定部位を選択してください"
            options={[
              { value: "upper-arm", label: "上腕" },
              { value: "forearm", label: "前腕" },
              { value: "thigh", label: "大腿" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <Label className="text-pink-700 font-medium mb-3 block">💓 心拍数（回/分）</Label>
          <NumberSelector
            value={formData.heartRate}
            onValueChange={(value) => setFormData({ ...formData, heartRate: value })}
            min={30}
            max={200}
            step={1}
            unit="回/分"
            className="text-lg mb-4"
          />
          <Label className="text-pink-700 font-medium mb-2 block">心拍リズム</Label>
          <ClickableDropdown
            value={formData.heartRhythm}
            onValueChange={(value) => setFormData({ ...formData, heartRhythm: value })}
            placeholder="心拍リズムを選択してください"
            options={[
              { value: "regular", label: "整脈" },
              { value: "irregular", label: "不整脈" },
              { value: "tachycardia", label: "頻脈" },
              { value: "bradycardia", label: "徐脈" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <Label className="text-cyan-700 font-medium mb-3 block">🫁 呼吸数（回/分）</Label>
          <NumberSelector
            value={formData.respiratoryRate}
            onValueChange={(value) => setFormData({ ...formData, respiratoryRate: value })}
            min={10}
            max={80}
            step={1}
            unit="回/分"
            className="text-lg mb-4"
          />
          <Label className="text-cyan-700 font-medium mb-2 block">呼吸パターン</Label>
          <ClickableDropdown
            value={formData.respiratoryPattern}
            onValueChange={(value) => setFormData({ ...formData, respiratoryPattern: value })}
            placeholder="呼吸パターンを選択してください"
            options={[
              { value: "normal", label: "正常" },
              { value: "tachypnea", label: "頻呼吸" },
              { value: "bradypnea", label: "徐呼吸" },
              { value: "irregular", label: "不規則" },
              { value: "labored", label: "努力呼吸" },
              { value: "wheezing", label: "喘鳴" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-700 font-medium mb-3 block">🫧 酸素飽和度（%）</Label>
          <NumberSelector
            value={formData.oxygenSaturation}
            onValueChange={(value) => setFormData({ ...formData, oxygenSaturation: value })}
            min={70}
            max={100}
            step={1}
            unit="%"
            className="text-lg mb-4"
          />
          <Label className="text-teal-700 font-medium mb-2 block">酸素化レベル</Label>
          <ClickableDropdown
            value={formData.oxygenLevel}
            onValueChange={(value) => setFormData({ ...formData, oxygenLevel: value })}
            placeholder="酸素化レベルを選択してください"
            options={[
              { value: "normal", label: "正常（≥95%）" },
              { value: "mild-hypoxia", label: "軽度低下（90-94%）" },
              { value: "moderate-hypoxia", label: "中等度低下（85-89%）" },
              { value: "severe-hypoxia", label: "重度低下（85%未満）" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <Label className="text-indigo-700 font-medium mb-3 block">🧠 意識レベル</Label>
          <ClickableDropdown
            value={formData.consciousnessLevel}
            onValueChange={(value) => setFormData({ ...formData, consciousnessLevel: value })}
            placeholder="意識レベルを選択してください"
            options={[
              { value: "alert", label: "清明" },
              { value: "drowsy", label: "傾眠" },
              { value: "stupor", label: "昏迷" },
              { value: "coma", label: "昏睡" },
              { value: "confused", label: "混乱" },
              { value: "agitated", label: "興奮" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label className="text-emerald-700 font-medium mb-3 block">🩹 皮膚状態</Label>
          <ClickableDropdown
            value={formData.skinCondition}
            onValueChange={(value) => setFormData({ ...formData, skinCondition: value })}
            placeholder="皮膚状態を選択してください"
            options={[
              { value: "normal", label: "正常" },
              { value: "pale", label: "蒼白" },
              { value: "cyanotic", label: "チアノーゼ" },
              { value: "flushed", label: "紅潮" },
              { value: "sweating", label: "発汗" },
              { value: "dry", label: "乾燥" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-700 font-medium mb-3 block">⏰ 測定時の状態</Label>
          <ClickableDropdown
            value={formData.measurementCondition}
            onValueChange={(value) => setFormData({ ...formData, measurementCondition: value })}
            placeholder="測定時の状態を選択してください"
            options={[
              { value: "resting", label: "安静時" },
              { value: "post-activity", label: "活動後" },
              { value: "pre-meal", label: "食事前" },
              { value: "post-meal", label: "食事後" },
              { value: "pre-medication", label: "薬剤投与前" },
              { value: "post-medication", label: "薬剤投与後" },
            ]}
            className="text-lg"
          />
        </div>

        <div className="border-rose-200 bg-rose-50/30 border rounded-lg p-4">
          <Label className="text-rose-700 font-medium mb-3 block">⚠️ 測定困難な要因</Label>
          <ClickableDropdown
            value={formData.measurementDifficulties.join(", ")}
            onValueChange={(value) => {
              const difficulties = value ? [value] : []
              setFormData({ ...formData, measurementDifficulties: difficulties })
            }}
            placeholder="測定困難な要因を選択してください"
            options={[
              { value: "体動が激しい", label: "体動が激しい" },
              { value: "測定を拒否", label: "測定を拒否" },
              { value: "機器の不具合", label: "機器の不具合" },
              { value: "カフサイズ不適合", label: "カフサイズ不適合" },
              { value: "皮膚の状態不良", label: "皮膚の状態不良" },
              { value: "意識レベル低下", label: "意識レベル低下" },
              { value: "痙攣・発作", label: "痙攣・発作" },
              { value: "呼吸困難", label: "呼吸困難" },
              { value: "循環不全", label: "循環不全" },
              { value: "体位保持困難", label: "体位保持困難" },
            ]}
            className="text-lg"
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
            placeholder="測定時の状況や特記事項"
            rows={3}
            className="mt-2"
          />
        </div>
      </div>
    </CareFormLayout>
  )
}
