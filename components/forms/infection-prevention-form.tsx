"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClickableDropdown } from "@/components/clickable-dropdown"
import { NumberSelector } from "@/components/number-selector"
import { DataStorageService } from "@/services/data-storage-service"

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

export function InfectionPreventionForm({ selectedUser, onSubmit, onCancel }: InfectionPreventionFormProps) {
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
      id: Date.now().toString(),
      userId: selectedUser,
      type: "infection-prevention" as const,
      timestamp: new Date(formData.time).toISOString(),
      details: {
        bodyTemperature: formData.bodyTemperature,
        infectionSigns: formData.infectionSigns,
        handHygiene: formData.handHygiene,
        environmentalCleaning: formData.environmentalCleaning,
        personalProtectiveEquipment: formData.personalProtectiveEquipment,
        immunizationStatus: formData.immunizationStatus,
        preventiveMeasures: formData.preventiveMeasures,
        riskFactors: formData.riskFactors,
        interventions: formData.interventions,
        followUpRequired: formData.followUpRequired,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 記録時刻 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-pink-600">🕐 記録時刻</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {/* 体温 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-red-600">🌡️ 体温（℃）</CardTitle>
        </CardHeader>
        <CardContent>
          <NumberSelector
            value={formData.bodyTemperature}
            onChange={(value) => setFormData((prev) => ({ ...prev, bodyTemperature: value }))}
            min={35.0}
            max={42.0}
            step={0.1}
            unit="℃"
          />
        </CardContent>
      </Card>

      {/* 感染兆候 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-orange-600">🔍 感染兆候</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={infectionSignsOptions}
            value={formData.infectionSigns}
            onChange={(value) => setFormData((prev) => ({ ...prev, infectionSigns: value }))}
            placeholder="感染兆候を選択してください"
          />
        </CardContent>
      </Card>

      {/* 手指衛生 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-600">🧼 手指衛生</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={handHygieneOptions}
            value={formData.handHygiene}
            onChange={(value) => setFormData((prev) => ({ ...prev, handHygiene: value }))}
            placeholder="手指衛生の実施状況を選択してください"
          />
        </CardContent>
      </Card>

      {/* 環境整備 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-600">🧽 環境整備</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={environmentalCleaningOptions}
            value={formData.environmentalCleaning}
            onChange={(value) => setFormData((prev) => ({ ...prev, environmentalCleaning: value }))}
            placeholder="環境整備の実施状況を選択してください"
          />
        </CardContent>
      </Card>

      {/* 個人防護具 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-600">🥽 個人防護具</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={ppeOptions}
            value={formData.personalProtectiveEquipment}
            onChange={(value) => setFormData((prev) => ({ ...prev, personalProtectiveEquipment: value }))}
            placeholder="個人防護具の使用状況を選択してください"
          />
        </CardContent>
      </Card>

      {/* 予防接種状況 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-cyan-600">💉 予防接種状況</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={immunizationStatusOptions}
            value={formData.immunizationStatus}
            onChange={(value) => setFormData((prev) => ({ ...prev, immunizationStatus: value }))}
            placeholder="予防接種状況を選択してください"
          />
        </CardContent>
      </Card>

      {/* 予防策 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-teal-600">🛡️ 実施した予防策</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={preventiveMeasuresOptions}
            value={formData.preventiveMeasures}
            onChange={(value) => setFormData((prev) => ({ ...prev, preventiveMeasures: value }))}
            placeholder="実施した予防策を選択してください"
          />
        </CardContent>
      </Card>

      {/* リスク要因 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-yellow-600">⚠️ リスク要因</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={riskFactorsOptions}
            value={formData.riskFactors}
            onChange={(value) => setFormData((prev) => ({ ...prev, riskFactors: value }))}
            placeholder="感染リスク要因を選択してください"
          />
        </CardContent>
      </Card>

      {/* 実施した対応 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-indigo-600">🛠️ 実施した対応</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={interventionsOptions}
            value={formData.interventions}
            onChange={(value) => setFormData((prev) => ({ ...prev, interventions: value }))}
            placeholder="実施した対応を選択してください"
          />
        </CardContent>
      </Card>

      {/* フォローアップ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-violet-600">📋 フォローアップ</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={followUpRequiredOptions}
            value={formData.followUpRequired}
            onChange={(value) => setFormData((prev) => ({ ...prev, followUpRequired: value }))}
            placeholder="必要なフォローアップを選択してください"
          />
        </CardContent>
      </Card>

      {/* 備考 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">📝 備考</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="特記事項があれば記入してください"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* 送信ボタン */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          記録する
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          キャンセル
        </Button>
      </div>
    </form>
  )
}
