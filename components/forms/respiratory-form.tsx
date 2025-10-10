"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClickableDropdown } from "@/components/clickable-dropdown"
import { NumberSelector } from "@/components/number-selector"
import { Label } from "@/components/ui/label"
import CareFormLayout from "@/components/care-form-layout"

interface RespiratoryFormData {
  time: string
  airwayManagement: string
  ventilatorSettings: string
  oxygenTherapy: string
  oxygenFlow: number
  respiratoryStatus: string
  secretionManagement: string
  breathingPattern: string
  oxygenSaturation: number
  respiratoryRate: number
  chestMovement: string
  breathingSounds: string
  interventions: string
  notes: string
}

interface RespiratoryFormProps {
  selectedUser: string
  onSubmit: (data: any) => void // Fixed onSubmit to accept data parameter
  onCancel: () => void
}

export function RespiratoryForm({ selectedUser, onSubmit, onCancel }: RespiratoryFormProps) {
  const [formData, setFormData] = useState<RespiratoryFormData>({
    time: new Date().toISOString().slice(0, 16),
    airwayManagement: "",
    ventilatorSettings: "",
    oxygenTherapy: "",
    oxygenFlow: 2,
    respiratoryStatus: "",
    secretionManagement: "",
    breathingPattern: "",
    oxygenSaturation: 98,
    respiratoryRate: 20,
    chestMovement: "",
    breathingSounds: "",
    interventions: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const careEvent = {
      eventType: "respiratory",
      time: formData.time,
      airwayManagement: formData.airwayManagement,
      ventilatorSettings: formData.ventilatorSettings,
      oxygenTherapy: formData.oxygenTherapy,
      oxygenFlow: formData.oxygenFlow,
      respiratoryStatus: formData.respiratoryStatus,
      secretionManagement: formData.secretionManagement,
      breathingPattern: formData.breathingPattern,
      oxygenSaturation: formData.oxygenSaturation,
      respiratoryRate: formData.respiratoryRate,
      chestMovement: formData.chestMovement,
      breathingSounds: formData.breathingSounds,
      interventions: formData.interventions,
      notes: formData.notes,
    }

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
        return options.respiratory?.[key] || defaultOptions
      }
    } catch (error) {
      console.error("Error loading custom options:", error)
    }
    return defaultOptions
  }

  const airwayManagementOptions = getCustomOptions("airwayManagement", [
    "自然気道",
    "気管切開",
    "気管内挿管",
    "鼻咽頭エアウェイ",
    "口咽頭エアウェイ",
    "ラリンゲアルマスク",
    "吸引実施",
    "体位ドレナージ",
    "その他",
  ])

  const oxygenTherapyOptions = getCustomOptions("oxygenTherapy", [
    "なし",
    "鼻カニューラ",
    "酸素マスク",
    "リザーバーマスク",
    "ベンチュリマスク",
    "CPAP",
    "BiPAP",
    "人工呼吸器",
    "その他",
  ])

  const respiratoryStatusOptions = getCustomOptions("respiratoryStatus", [
    "正常",
    "軽度呼吸困難",
    "中等度呼吸困難",
    "重度呼吸困難",
    "努力呼吸",
    "浅呼吸",
    "不規則呼吸",
    "無呼吸エピソード",
    "その他",
  ])

  const secretionManagementOptions = getCustomOptions("secretionManagement", [
    "なし",
    "口腔内吸引",
    "鼻腔内吸引",
    "気管内吸引",
    "体位ドレナージ",
    "胸部理学療法",
    "ネブライザー",
    "加湿療法",
    "その他",
  ])

  const breathingPatternOptions = getCustomOptions("breathingPattern", [
    "正常",
    "頻呼吸",
    "徐呼吸",
    "不規則",
    "チェーンストークス",
    "クスマウル",
    "ビオー呼吸",
    "奇異呼吸",
    "その他",
  ])

  const chestMovementOptions = getCustomOptions("chestMovement", [
    "対称",
    "非対称",
    "制限あり",
    "陥没呼吸",
    "シーソー呼吸",
    "補助筋使用",
    "腹式呼吸",
    "観察困難",
  ])

  const breathingSoundsOptions = getCustomOptions("breathingSounds", [
    "清明",
    "喘鳴",
    "ラ音",
    "摩擦音",
    "減弱",
    "消失",
    "気管支音",
    "その他異常音",
  ])

  const interventionsOptions = getCustomOptions("interventions", [
    "なし",
    "体位変換",
    "酸素投与開始",
    "酸素流量調整",
    "吸引実施",
    "薬剤投与",
    "医師報告",
    "緊急対応",
    "その他",
  ])

  return (
    <CareFormLayout title="🫁 呼吸管理記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <Label className="text-pink-600 font-medium">🕐 記録時刻</Label>
          <div className="flex gap-2 mt-2">
            <Input
              type="datetime-local"
              value={formData.time}
              onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
              className="flex-1 text-lg"
            />
            <Button
              type="button"
              onClick={setCurrentTime}
              variant="outline"
              className="px-4 py-2 bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-700 font-medium"
            >
              今すぐ
            </Button>
          </div>
        </div>

        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label className="text-blue-600 font-medium mb-3 block">🌬️ 気道管理</Label>
          <ClickableDropdown
            options={airwayManagementOptions}
            value={formData.airwayManagement}
            onChange={(value) => setFormData((prev) => ({ ...prev, airwayManagement: value }))}
            placeholder="気道管理方法を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <Label className="text-green-600 font-medium mb-3 block">⚙️ 人工呼吸器設定</Label>
          <Input
            value={formData.ventilatorSettings}
            onChange={(e) => setFormData((prev) => ({ ...prev, ventilatorSettings: e.target.value }))}
            placeholder="人工呼吸器の設定を入力してください（例：SIMV, TV 400ml, PEEP 5cmH2O）"
            className="text-lg"
          />
        </div>

        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <Label className="text-cyan-600 font-medium mb-3 block">💨 酸素療法</Label>
          <ClickableDropdown
            options={oxygenTherapyOptions}
            value={formData.oxygenTherapy}
            onChange={(value) => setFormData((prev) => ({ ...prev, oxygenTherapy: value }))}
            placeholder="酸素療法の種類を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-600 font-medium mb-3 block">🔢 酸素流量（L/分）</Label>
          <NumberSelector
            value={formData.oxygenFlow}
            onChange={(value) => setFormData((prev) => ({ ...prev, oxygenFlow: value }))}
            min={0}
            max={15}
            step={0.5}
            unit="L/分"
            className="text-lg"
          />
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label className="text-orange-600 font-medium mb-3 block">🫁 呼吸状態</Label>
          <ClickableDropdown
            options={respiratoryStatusOptions}
            value={formData.respiratoryStatus}
            onChange={(value) => setFormData((prev) => ({ ...prev, respiratoryStatus: value }))}
            placeholder="呼吸状態を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-600 font-medium mb-3 block">💧 分泌物管理</Label>
          <ClickableDropdown
            options={secretionManagementOptions}
            value={formData.secretionManagement}
            onChange={(value) => setFormData((prev) => ({ ...prev, secretionManagement: value }))}
            placeholder="分泌物管理方法を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-600 font-medium mb-3 block">📊 呼吸パターン</Label>
          <ClickableDropdown
            options={breathingPatternOptions}
            value={formData.breathingPattern}
            onChange={(value) => setFormData((prev) => ({ ...prev, breathingPattern: value }))}
            placeholder="呼吸パターンを選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <Label className="text-indigo-600 font-medium mb-3 block">📈 酸素飽和度（%）</Label>
          <NumberSelector
            value={formData.oxygenSaturation}
            onChange={(value) => setFormData((prev) => ({ ...prev, oxygenSaturation: value }))}
            min={70}
            max={100}
            step={1}
            unit="%"
            className="text-lg"
          />
        </div>

        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-600 font-medium mb-3 block">🔢 呼吸数（回/分）</Label>
          <NumberSelector
            value={formData.respiratoryRate}
            onChange={(value) => setFormData((prev) => ({ ...prev, respiratoryRate: value }))}
            min={5}
            max={60}
            step={1}
            unit="回/分"
            className="text-lg"
          />
        </div>

        <div className="border-yellow-200 bg-yellow-50/30 border rounded-lg p-4">
          <Label className="text-yellow-600 font-medium mb-3 block">🫸 胸郭運動</Label>
          <ClickableDropdown
            options={chestMovementOptions}
            value={formData.chestMovement}
            onChange={(value) => setFormData((prev) => ({ ...prev, chestMovement: value }))}
            placeholder="胸郭運動を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label className="text-emerald-600 font-medium mb-3 block">🔊 呼吸音</Label>
          <ClickableDropdown
            options={breathingSoundsOptions}
            value={formData.breathingSounds}
            onChange={(value) => setFormData((prev) => ({ ...prev, breathingSounds: value }))}
            placeholder="呼吸音を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-rose-200 bg-rose-50/30 border rounded-lg p-4">
          <Label className="text-rose-600 font-medium mb-3 block">🛠️ 実施した対応</Label>
          <ClickableDropdown
            options={interventionsOptions}
            value={formData.interventions}
            onChange={(value) => setFormData((prev) => ({ ...prev, interventions: value }))}
            placeholder="実施した対応を選択してください"
            className="text-lg"
          />
        </div>

        <div className="border-gray-200 bg-gray-50/30 border rounded-lg p-4">
          <Label className="text-gray-600 font-medium mb-3 block">📝 備考</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="特記事項があれば記入してください"
            rows={3}
            className="text-lg"
          />
        </div>
      </div>
    </CareFormLayout>
  )
}
