"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NowButton } from "@/components/NowButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import CareFormLayout from "@/components/care-form-layout"

interface TransportationFormProps {
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

export function TransportationForm({ selectedUser, onSubmit, onCancel }: TransportationFormProps) {
  const [formData, setFormData] = useState({
    route: "",
    departureTime: new Date().toTimeString().slice(0, 5),
    arrivalTime: "",
    timestamp: new Date().toISOString(),
    vehicle: "",
    driver: "",
    companion: "",
    physicalCondition: "",
    emotionalState: "",
    incidents: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      timestamp: formData.timestamp || new Date().toISOString(),
      eventType: "transportation",
      user: selectedUser,
    })
  }

  const handleNow = (iso: string) => {
    setFormData({ ...formData, timestamp: iso })
  }

  const setCurrentTime = (field: "departureTime" | "arrivalTime") => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    setFormData({ ...formData, [field]: currentTime })
  }

  return (
    <CareFormLayout title="🚌 送迎記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-lime-200 bg-lime-50/30 border rounded-lg p-4">
          <Label className="text-lime-700 font-medium mb-3 block">🗺️ ルート</Label>
          <ClickableDropdown
            label="ルート"
            value={formData.route}
            onValueChange={(value) => setFormData({ ...formData, route: value })}
            options={[
              { value: "home-to-facility", label: "自宅 → 事業所" },
              { value: "facility-to-home", label: "事業所 → 自宅" },
              { value: "school-to-facility", label: "学校 → 事業所" },
              { value: "facility-to-school", label: "事業所 → 学校" },
              { value: "other", label: "その他" },
            ]}
            placeholder="ルートを選択してください"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">記録時刻: {new Date(formData.timestamp).toLocaleString()}</div>
          <NowButton onNow={handleNow} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
            <Label htmlFor="departureTime" className="text-blue-700 font-medium">
              🕐 出発時刻
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                required
                className="text-lg flex-1"
              />
              <Button
                type="button"
                onClick={() => setCurrentTime("departureTime")}
                variant="outline"
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 font-medium"
              >
                今すぐ
              </Button>
            </div>
          </div>

          <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
            <Label htmlFor="arrivalTime" className="text-cyan-700 font-medium">
              🕑 到着時刻
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="arrivalTime"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="text-lg flex-1"
              />
              <Button
                type="button"
                onClick={() => setCurrentTime("arrivalTime")}
                variant="outline"
                className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 border-cyan-300 text-cyan-700 font-medium"
              >
                今すぐ
              </Button>
            </div>
          </div>
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label htmlFor="vehicle" className="text-purple-700 font-medium">
            🚗 車両
          </Label>
          <Input
            id="vehicle"
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            placeholder="車両番号または車種"
            className="mt-2 text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
            <Label htmlFor="driver" className="text-indigo-700 font-medium">
              👤 運転者
            </Label>
            <Input
              id="driver"
              value={formData.driver}
              onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
              placeholder="運転者名"
              className="mt-2 text-lg"
            />
          </div>

          <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
            <Label htmlFor="companion" className="text-teal-700 font-medium">
              👥 同乗者
            </Label>
            <Input
              id="companion"
              value={formData.companion}
              onChange={(e) => setFormData({ ...formData, companion: e.target.value })}
              placeholder="同乗者名"
              className="mt-2 text-lg"
            />
          </div>
        </div>

        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <Label className="text-green-700 font-medium mb-3 block">💪 身体状態</Label>
          <ClickableDropdown
            label="身体状態"
            value={formData.physicalCondition}
            onValueChange={(value) => setFormData({ ...formData, physicalCondition: value })}
            options={[
              { value: "good", label: "良好" },
              { value: "tired", label: "疲労" },
              { value: "sleepy", label: "眠気" },
              { value: "nausea", label: "車酔い" },
              { value: "pain", label: "痛み" },
              { value: "other", label: "その他" },
            ]}
            placeholder="身体状態を選択してください"
          />
        </div>

        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <Label className="text-pink-700 font-medium mb-3 block">😊 情緒状態</Label>
          <ClickableDropdown
            label="情緒状態"
            value={formData.emotionalState}
            onValueChange={(value) => setFormData({ ...formData, emotionalState: value })}
            options={[
              { value: "calm", label: "落ち着き" },
              { value: "happy", label: "喜び" },
              { value: "anxious", label: "不安" },
              { value: "crying", label: "泣いている" },
              { value: "excited", label: "興奮" },
              { value: "sleepy", label: "眠い" },
            ]}
            placeholder="情緒状態を選択してください"
          />
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label htmlFor="incidents" className="text-orange-700 font-medium">
            ⚠️ 特記事項・インシデント
          </Label>
          <Textarea
            id="incidents"
            value={formData.incidents}
            onChange={(e) => setFormData({ ...formData, incidents: e.target.value })}
            placeholder="遅延、事故、体調変化など"
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
