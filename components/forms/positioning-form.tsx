"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClickableDropdown } from "@/components/clickable-dropdown"
import { NumberSelector } from "@/components/number-selector"
import { DataStorageService } from "@/services/data-storage-service"
import CareFormLayout from "@/components/care-form-layout"

interface PositioningFormData {
  time: string
  currentPosition: string
  positionDuration: number
  nextPosition: string
  supportDevices: string
  skinCondition: string
  comfortLevel: string
  respiratoryStatus: string
  observedIssues: string
  preventiveMeasures: string
  notes: string
}

interface PositioningFormProps {
  selectedUser: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function PositioningForm({ selectedUser, onSubmit, onCancel }: PositioningFormProps) {
  const [formData, setFormData] = useState<PositioningFormData>({
    time: new Date().toISOString().slice(0, 16),
    currentPosition: "",
    positionDuration: 120,
    nextPosition: "",
    supportDevices: "",
    skinCondition: "",
    comfortLevel: "",
    respiratoryStatus: "",
    observedIssues: "",
    preventiveMeasures: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const careEvent = {
      id: Date.now().toString(),
      userId: selectedUser,
      type: "positioning" as const,
      timestamp: new Date(formData.time).toISOString(),
      details: {
        currentPosition: formData.currentPosition,
        positionDuration: formData.positionDuration,
        nextPosition: formData.nextPosition,
        supportDevices: formData.supportDevices,
        skinCondition: formData.skinCondition,
        comfortLevel: formData.comfortLevel,
        respiratoryStatus: formData.respiratoryStatus,
        observedIssues: formData.observedIssues,
        preventiveMeasures: formData.preventiveMeasures,
        notes: formData.notes,
      },
    }

    DataStorageService.saveCareEvent(careEvent)
    onSubmit(careEvent)
  }

  const setCurrentTime = () => {
    const now = new Date()
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    setFormData((prev) => ({ ...prev, time: localTime.toISOString().slice(0, 16) }))
  }

  // Get custom options from localStorage
  const getCustomOptions = (key: string, defaultOptions: string[]) => {
    try {
      const customOptions = localStorage.getItem("formOptions")
      if (customOptions) {
        const options = JSON.parse(customOptions)
        return options.positioning?.[key] || defaultOptions
      }
    } catch (error) {
      console.error("Error loading custom options:", error)
    }
    return defaultOptions
  }

  const positionOptions = getCustomOptions("positions", [
    "仰臥位",
    "右側臥位",
    "左側臥位",
    "腹臥位",
    "半座位",
    "ファウラー位",
    "車椅子座位",
    "リクライニング位",
    "立位",
    "その他",
  ])

  const supportDeviceOptions = getCustomOptions("supportDevices", [
    "クッション",
    "ポジショニングピロー",
    "ウェッジクッション",
    "ロールクッション",
    "体位変換器",
    "エアマット",
    "車椅子クッション",
    "なし",
    "その他",
  ])

  const skinConditionOptions = getCustomOptions("skinCondition", [
    "正常",
    "発赤あり",
    "圧迫痕あり",
    "褥瘡リスクあり",
    "褥瘡発生",
    "乾燥",
    "湿潤",
    "その他異常",
    "観察困難",
  ])

  const comfortLevelOptions = getCustomOptions("comfortLevel", [
    "快適",
    "やや不快",
    "不快",
    "痛みあり",
    "落ち着かない",
    "眠っている",
    "評価困難",
    "その他",
  ])

  const respiratoryStatusOptions = getCustomOptions("respiratoryStatus", [
    "正常",
    "浅い呼吸",
    "努力呼吸",
    "不規則",
    "呼吸困難",
    "酸素飽和度低下",
    "痰の増加",
    "その他異常",
  ])

  const observedIssuesOptions = getCustomOptions("observedIssues", [
    "なし",
    "関節拘縮",
    "筋緊張亢進",
    "筋緊張低下",
    "不随意運動",
    "疼痛反応",
    "呼吸状態変化",
    "循環状態変化",
    "その他",
  ])

  const preventiveMeasuresOptions = getCustomOptions("preventiveMeasures", [
    "定期的体位変換",
    "マッサージ実施",
    "関節可動域訓練",
    "皮膚保護",
    "除圧実施",
    "清拭実施",
    "保湿実施",
    "その他",
  ])

  return (
    <CareFormLayout title="🛏️ 体位変換・姿勢管理記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-pink-600 mb-3">🕐 記録時刻</h3>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={formData.time}
              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              className="flex-1"
            />
            <Button type="button" onClick={setCurrentTime} variant="outline" size="sm">
              今すぐ
            </Button>
          </div>
        </div>

        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-600 mb-3">🛏️ 現在の体位</h3>
          <ClickableDropdown
            options={positionOptions}
            value={formData.currentPosition}
            onChange={(value) => setFormData((prev) => ({ ...prev, currentPosition: value }))}
            placeholder="現在の体位を選択してください"
          />
        </div>

        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-600 mb-3">⏱️ 体位保持時間（分）</h3>
          <NumberSelector
            value={formData.positionDuration}
            onChange={(value) => setFormData((prev) => ({ ...prev, positionDuration: value }))}
            min={30}
            max={480}
            step={30}
            unit="分"
          />
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-600 mb-3">🔄 次回体位</h3>
          <ClickableDropdown
            options={positionOptions}
            value={formData.nextPosition}
            onChange={(value) => setFormData((prev) => ({ ...prev, nextPosition: value }))}
            placeholder="次回の体位を選択してください"
          />
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-orange-600 mb-3">🛠️ 支援用具</h3>
          <ClickableDropdown
            options={supportDeviceOptions}
            value={formData.supportDevices}
            onChange={(value) => setFormData((prev) => ({ ...prev, supportDevices: value }))}
            placeholder="使用した支援用具を選択してください"
          />
        </div>

        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600 mb-3">🔍 皮膚状態</h3>
          <ClickableDropdown
            options={skinConditionOptions}
            value={formData.skinCondition}
            onChange={(value) => setFormData((prev) => ({ ...prev, skinCondition: value }))}
            placeholder="皮膚状態を選択してください"
          />
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-teal-600 mb-3">😌 快適度</h3>
          <ClickableDropdown
            options={comfortLevelOptions}
            value={formData.comfortLevel}
            onChange={(value) => setFormData((prev) => ({ ...prev, comfortLevel: value }))}
            placeholder="快適度を選択してください"
          />
        </div>

        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-indigo-600 mb-3">🫁 呼吸状態</h3>
          <ClickableDropdown
            options={respiratoryStatusOptions}
            value={formData.respiratoryStatus}
            onChange={(value) => setFormData((prev) => ({ ...prev, respiratoryStatus: value }))}
            placeholder="呼吸状態を選択してください"
          />
        </div>

        <div className="border-yellow-200 bg-yellow-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-600 mb-3">⚠️ 観察された問題</h3>
          <ClickableDropdown
            options={observedIssuesOptions}
            value={formData.observedIssues}
            onChange={(value) => setFormData((prev) => ({ ...prev, observedIssues: value }))}
            placeholder="観察された問題を選択してください"
          />
        </div>

        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-cyan-600 mb-3">🛡️ 予防的措置</h3>
          <ClickableDropdown
            options={preventiveMeasuresOptions}
            value={formData.preventiveMeasures}
            onChange={(value) => setFormData((prev) => ({ ...prev, preventiveMeasures: value }))}
            placeholder="実施した予防的措置を選択してください"
          />
        </div>

        <div className="border-gray-200 bg-gray-50/30 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">📝 備考</h3>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="特記事項があれば記入してください"
            rows={3}
          />
        </div>
      </div>
    </CareFormLayout>
  )
}
