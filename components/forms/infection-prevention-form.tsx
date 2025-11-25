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

interface InfectionPreventionFormData {
  time: string
  bodyTemperature: number
  infectionSigns: string
  handHygiene: string
  environmentalCleaning: string
  personalProtectiveEquipment: string
  immunizationStatus: string
  preventiveMeasures: string
  riskFactors: string
  interventions: string
  followUpRequired: string
  notes: string
}

interface InfectionPreventionFormProps {
  selectedUser: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function InfectionPreventionForm({ selectedUser: _selectedUser, onSubmit, onCancel }: InfectionPreventionFormProps) {
  const [formData, setFormData] = useState<InfectionPreventionFormData>({
    time: new Date().toISOString().slice(0, 16),
    bodyTemperature: 36.5,
    infectionSigns: "",
    handHygiene: "",
    environmentalCleaning: "",
    personalProtectiveEquipment: "",
    immunizationStatus: "",
    preventiveMeasures: "",
    riskFactors: "",
    interventions: "",
    followUpRequired: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const careEvent = {
      ...formData,
      timestamp: new Date(formData.time).toISOString(),
      eventType: "infection_prevention",
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
        return options.infectionPrevention?.[key] || defaultOptions
      }
    } catch (error) {
      console.error("Error loading custom options:", error)
    }
    return defaultOptions
  }

  const infectionSignsOptions = getCustomOptions("infectionSigns", [
    "なし",
    "発熱",
    "咳嗽",
    "鼻汁",
    "咽頭痛",
    "呼吸困難",
    "下痢",
    "嘔吐",
    "皮疹",
    "創部感染兆候",
    "尿路感染兆候",
    "その他",
  ])

  const handHygieneOptions = getCustomOptions("handHygiene", [
    "実施済み",
    "アルコール消毒",
    "石鹸手洗い",
    "手袋着用",
    "実施困難",
    "部分的実施",
    "未実施",
    "その他",
  ])

  const environmentalCleaningOptions = getCustomOptions("environmentalCleaning", [
    "実施済み",
    "日常清拭",
    "消毒清拭",
    "床清掃",
    "寝具交換",
    "換気実施",
    "空気清浄",
    "未実施",
    "その他",
  ])

  const ppeOptions = getCustomOptions("personalProtectiveEquipment", [
    "なし",
    "マスク着用",
    "手袋着用",
    "ガウン着用",
    "フェイスシールド",
    "N95マスク",
    "完全防護",
    "その他",
  ])

  const immunizationStatusOptions = getCustomOptions("immunizationStatus", [
    "最新",
    "期限内",
    "要更新",
    "未接種",
    "接種予定",
    "医師相談中",
    "接種不可",
    "不明",
  ])

  const preventiveMeasuresOptions = getCustomOptions("preventiveMeasures", [
    "標準予防策",
    "接触予防策",
    "飛沫予防策",
    "空気予防策",
    "隔離実施",
    "面会制限",
    "栄養管理",
    "水分管理",
    "その他",
  ])

  const riskFactorsOptions = getCustomOptions("riskFactors", [
    "なし",
    "免疫力低下",
    "慢性疾患",
    "栄養不良",
    "脱水",
    "褥瘡",
    "カテーテル留置",
    "人工呼吸器",
    "胃ろう",
    "気管切開",
    "その他",
  ])

  const interventionsOptions = getCustomOptions("interventions", [
    "なし",
    "医師報告",
    "検査実施",
    "薬物療法開始",
    "隔離開始",
    "家族連絡",
    "他職種連携",
    "経過観察",
    "その他",
  ])

  const followUpRequiredOptions = getCustomOptions("followUpRequired", [
    "不要",
    "継続観察",
    "医師診察",
    "検査予定",
    "薬物調整",
    "感染対策強化",
    "家族説明",
    "その他",
  ])

  return (
    <CareFormLayout title="🦠 感染予防記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        {/* 記録時刻 */}
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

        {/* 体温 */}
        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-600 font-medium mb-3 block">🌡️ 体温（℃）</Label>
          <NumberSelector
            value={formData.bodyTemperature}
            onChange={(value) => setFormData((prev) => ({ ...prev, bodyTemperature: value }))}
            min={35.0}
            max={42.0}
            step={0.1}
            unit="℃"
            className="text-lg"
          />
        </div>

        {/* 感染兆候 */}
        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label className="text-orange-600 font-medium mb-3 block">🔍 感染兆候</Label>
          <ClickableDropdown
            options={infectionSignsOptions}
            value={formData.infectionSigns}
            onChange={(value) => setFormData((prev) => ({ ...prev, infectionSigns: value }))}
            placeholder="感染兆候を選択してください"
            className="text-lg"
          />
        </div>

        {/* 手指衛生 */}
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label className="text-blue-600 font-medium mb-3 block">🧼 手指衛生</Label>
          <ClickableDropdown
            options={handHygieneOptions}
            value={formData.handHygiene}
            onChange={(value) => setFormData((prev) => ({ ...prev, handHygiene: value }))}
            placeholder="手指衛生の実施状況を選択してください"
            className="text-lg"
          />
        </div>

        {/* 環境整備 */}
        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <Label className="text-green-600 font-medium mb-3 block">🧽 環境整備</Label>
          <ClickableDropdown
            options={environmentalCleaningOptions}
            value={formData.environmentalCleaning}
            onChange={(value) => setFormData((prev) => ({ ...prev, environmentalCleaning: value }))}
            placeholder="環境整備の実施状況を選択してください"
            className="text-lg"
          />
        </div>

        {/* 個人防護具 */}
        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-600 font-medium mb-3 block">🥽 個人防護具</Label>
          <ClickableDropdown
            options={ppeOptions}
            value={formData.personalProtectiveEquipment}
            onChange={(value) => setFormData((prev) => ({ ...prev, personalProtectiveEquipment: value }))}
            placeholder="個人防護具の使用状況を選択してください"
            className="text-lg"
          />
        </div>

        {/* 予防接種状況 */}
        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <Label className="text-cyan-600 font-medium mb-3 block">💉 予防接種状況</Label>
          <ClickableDropdown
            options={immunizationStatusOptions}
            value={formData.immunizationStatus}
            onChange={(value) => setFormData((prev) => ({ ...prev, immunizationStatus: value }))}
            placeholder="予防接種状況を選択してください"
            className="text-lg"
          />
        </div>

        {/* 予防策 */}
        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-600 font-medium mb-3 block">🛡️ 実施した予防策</Label>
          <ClickableDropdown
            options={preventiveMeasuresOptions}
            value={formData.preventiveMeasures}
            onChange={(value) => setFormData((prev) => ({ ...prev, preventiveMeasures: value }))}
            placeholder="実施した予防策を選択してください"
            className="text-lg"
          />
        </div>

        {/* リスク要因 */}
        <div className="border-yellow-200 bg-yellow-50/30 border rounded-lg p-4">
          <Label className="text-yellow-600 font-medium mb-3 block">⚠️ リスク要因</Label>
          <ClickableDropdown
            options={riskFactorsOptions}
            value={formData.riskFactors}
            onChange={(value) => setFormData((prev) => ({ ...prev, riskFactors: value }))}
            placeholder="感染リスク要因を選択してください"
            className="text-lg"
          />
        </div>

        {/* 実施した対応 */}
        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <Label className="text-indigo-600 font-medium mb-3 block">🛠️ 実施した対応</Label>
          <ClickableDropdown
            options={interventionsOptions}
            value={formData.interventions}
            onChange={(value) => setFormData((prev) => ({ ...prev, interventions: value }))}
            placeholder="実施した対応を選択してください"
            className="text-lg"
          />
        </div>

        {/* フォローアップ */}
        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-600 font-medium mb-3 block">📋 フォローアップ</Label>
          <ClickableDropdown
            options={followUpRequiredOptions}
            value={formData.followUpRequired}
            onChange={(value) => setFormData((prev) => ({ ...prev, followUpRequired: value }))}
            placeholder="必要なフォローアップを選択してください"
            className="text-lg"
          />
        </div>

        {/* 備考 */}
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
