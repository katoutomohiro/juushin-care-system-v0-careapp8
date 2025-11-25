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

interface SwallowingFormData {
  time: string
  mealType: string
  foodTexture: string
  liquidConsistency: string
  feedingMethod: string
  feedingPosition: string
  swallowingFunction: string
  aspirationRisk: string
  droolingManagement: string
  intakeAmount: number
  feedingDuration: number
  observedSymptoms: string
  interventions: string
  notes: string
}

interface SwallowingFormProps {
  selectedUser: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function SwallowingForm({ selectedUser: _selectedUser, onSubmit, onCancel }: SwallowingFormProps) {
  const [formData, setFormData] = useState<SwallowingFormData>({
    time: new Date().toISOString().slice(0, 16),
    mealType: "",
    foodTexture: "",
    liquidConsistency: "",
    feedingMethod: "",
    feedingPosition: "",
    swallowingFunction: "",
    aspirationRisk: "",
    droolingManagement: "",
    intakeAmount: 50,
    feedingDuration: 30,
    observedSymptoms: "",
    interventions: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const careEvent = {
      ...formData,
      timestamp: new Date(formData.time).toISOString(),
      eventType: "swallowing",
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
        return options.swallowing?.[key] || defaultOptions
      }
    } catch (error) {
      console.error("Error loading custom options:", error)
    }
    return defaultOptions
  }

  const mealTypeOptions = getCustomOptions("mealType", [
    "朝食",
    "昼食",
    "夕食",
    "間食",
    "水分補給",
    "薬剤服用",
    "栄養補助食品",
    "その他",
  ])

  const foodTextureOptions = getCustomOptions("foodTexture", [
    "常食",
    "軟菜食",
    "きざみ食",
    "極きざみ食",
    "ミキサー食",
    "ゼリー食",
    "ペースト食",
    "とろみ付き",
    "その他",
  ])

  const liquidConsistencyOptions = getCustomOptions("liquidConsistency", [
    "薄いとろみ",
    "中間のとろみ",
    "濃いとろみ",
    "ゼリー状",
    "普通の水分",
    "炭酸飲料",
    "温かい飲み物",
    "冷たい飲み物",
    "その他",
  ])

  const feedingMethodOptions = getCustomOptions("feedingMethod", [
    "自力摂取",
    "一部介助",
    "全介助",
    "スプーン介助",
    "ストロー使用",
    "コップ介助",
    "シリンジ使用",
    "経管栄養併用",
    "その他",
  ])

  const feedingPositionOptions = getCustomOptions("feedingPosition", [
    "座位",
    "半座位",
    "リクライニング位",
    "側臥位",
    "車椅子座位",
    "ベッドアップ",
    "立位",
    "その他",
  ])

  const swallowingFunctionOptions = getCustomOptions("swallowingFunction", [
    "正常",
    "軽度障害",
    "中等度障害",
    "重度障害",
    "嚥下反射遅延",
    "咽頭残留あり",
    "口腔期障害",
    "咽頭期障害",
    "評価困難",
  ])

  const aspirationRiskOptions = getCustomOptions("aspirationRisk", [
    "リスクなし",
    "軽度リスク",
    "中等度リスク",
    "高リスク",
    "誤嚥の疑い",
    "誤嚥確認",
    "サイレント誤嚥",
    "評価困難",
  ])

  const droolingManagementOptions = getCustomOptions("droolingManagement", [
    "なし",
    "口腔ケア実施",
    "唾液拭き取り",
    "体位調整",
    "口腔マッサージ",
    "薬物療法",
    "吸引実施",
    "その他",
  ])

  const observedSymptomsOptions = getCustomOptions("observedSymptoms", [
    "なし",
    "むせ",
    "咳嗽",
    "湿性嗄声",
    "呼吸困難",
    "チアノーゼ",
    "発熱",
    "食事拒否",
    "嘔吐",
    "その他",
  ])

  const interventionsOptions = getCustomOptions("interventions", [
    "なし",
    "体位調整",
    "食事形態変更",
    "摂取速度調整",
    "口腔ケア強化",
    "吸引実施",
    "医師報告",
    "経管栄養検討",
    "その他",
  ])

  return (
    <CareFormLayout title="🍽️ 嚥下・摂食記録" onSubmit={handleSubmit} onCancel={onCancel}>
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

        {/* 食事種類 */}
        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <Label className="text-blue-600 font-medium mb-3 block">🍽️ 食事種類</Label>
          <ClickableDropdown
            options={mealTypeOptions}
            value={formData.mealType}
            onChange={(value) => setFormData((prev) => ({ ...prev, mealType: value }))}
            placeholder="食事種類を選択してください"
            className="text-lg"
          />
        </div>

        {/* 食事形態 */}
        <div className="border-green-200 bg-green-50/30 border rounded-lg p-4">
          <Label className="text-green-600 font-medium mb-3 block">🥄 食事形態</Label>
          <ClickableDropdown
            options={foodTextureOptions}
            value={formData.foodTexture}
            onChange={(value) => setFormData((prev) => ({ ...prev, foodTexture: value }))}
            placeholder="食事形態を選択してください"
            className="text-lg"
          />
        </div>

        {/* 水分とろみ */}
        <div className="border-cyan-200 bg-cyan-50/30 border rounded-lg p-4">
          <Label className="text-cyan-600 font-medium mb-3 block">💧 水分とろみ</Label>
          <ClickableDropdown
            options={liquidConsistencyOptions}
            value={formData.liquidConsistency}
            onChange={(value) => setFormData((prev) => ({ ...prev, liquidConsistency: value }))}
            placeholder="水分のとろみを選択してください"
            className="text-lg"
          />
        </div>

        {/* 摂取方法 */}
        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <Label className="text-purple-600 font-medium mb-3 block">🤲 摂取方法</Label>
          <ClickableDropdown
            options={feedingMethodOptions}
            value={formData.feedingMethod}
            onChange={(value) => setFormData((prev) => ({ ...prev, feedingMethod: value }))}
            placeholder="摂取方法を選択してください"
            className="text-lg"
          />
        </div>

        {/* 摂取姿勢 */}
        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <Label className="text-orange-600 font-medium mb-3 block">🪑 摂取姿勢</Label>
          <ClickableDropdown
            options={feedingPositionOptions}
            value={formData.feedingPosition}
            onChange={(value) => setFormData((prev) => ({ ...prev, feedingPosition: value }))}
            placeholder="摂取姿勢を選択してください"
            className="text-lg"
          />
        </div>

        {/* 嚥下機能 */}
        <div className="border-red-200 bg-red-50/30 border rounded-lg p-4">
          <Label className="text-red-600 font-medium mb-3 block">🫗 嚥下機能</Label>
          <ClickableDropdown
            options={swallowingFunctionOptions}
            value={formData.swallowingFunction}
            onChange={(value) => setFormData((prev) => ({ ...prev, swallowingFunction: value }))}
            placeholder="嚥下機能を選択してください"
            className="text-lg"
          />
        </div>

        {/* 誤嚥リスク */}
        <div className="border-yellow-200 bg-yellow-50/30 border rounded-lg p-4">
          <Label className="text-yellow-600 font-medium mb-3 block">⚠️ 誤嚥リスク</Label>
          <ClickableDropdown
            options={aspirationRiskOptions}
            value={formData.aspirationRisk}
            onChange={(value) => setFormData((prev) => ({ ...prev, aspirationRisk: value }))}
            placeholder="誤嚥リスクを選択してください"
            className="text-lg"
          />
        </div>

        {/* 流涎管理 */}
        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <Label className="text-teal-600 font-medium mb-3 block">💧 流涎管理</Label>
          <ClickableDropdown
            options={droolingManagementOptions}
            value={formData.droolingManagement}
            onChange={(value) => setFormData((prev) => ({ ...prev, droolingManagement: value }))}
            placeholder="流涎管理を選択してください"
            className="text-lg"
          />
        </div>

        {/* 摂取量 */}
        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <Label className="text-indigo-600 font-medium mb-3 block">📊 摂取量（%）</Label>
          <NumberSelector
            value={formData.intakeAmount}
            onChange={(value) => setFormData((prev) => ({ ...prev, intakeAmount: value }))}
            min={0}
            max={100}
            step={10}
            unit="%"
            className="text-lg"
          />
        </div>

        {/* 摂取時間 */}
        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <Label className="text-violet-600 font-medium mb-3 block">⏱️ 摂取時間（分）</Label>
          <NumberSelector
            value={formData.feedingDuration}
            onChange={(value) => setFormData((prev) => ({ ...prev, feedingDuration: value }))}
            min={5}
            max={120}
            step={5}
            unit="分"
            className="text-lg"
          />
        </div>

        {/* 観察された症状 */}
        <div className="border-rose-200 bg-rose-50/30 border rounded-lg p-4">
          <Label className="text-rose-600 font-medium mb-3 block">👁️ 観察された症状</Label>
          <ClickableDropdown
            options={observedSymptomsOptions}
            value={formData.observedSymptoms}
            onChange={(value) => setFormData((prev) => ({ ...prev, observedSymptoms: value }))}
            placeholder="観察された症状を選択してください"
            className="text-lg"
          />
        </div>

        {/* 実施した対応 */}
        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <Label className="text-emerald-600 font-medium mb-3 block">🛠️ 実施した対応</Label>
          <ClickableDropdown
            options={interventionsOptions}
            value={formData.interventions}
            onChange={(value) => setFormData((prev) => ({ ...prev, interventions: value }))}
            placeholder="実施した対応を選択してください"
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
