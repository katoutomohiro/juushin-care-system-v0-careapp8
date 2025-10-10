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

export function SwallowingForm({ selectedUser, onSubmit, onCancel }: SwallowingFormProps) {
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
      id: Date.now().toString(),
      userId: selectedUser,
      type: "swallowing" as const,
      timestamp: new Date(formData.time).toISOString(),
      details: {
        mealType: formData.mealType,
        foodTexture: formData.foodTexture,
        liquidConsistency: formData.liquidConsistency,
        feedingMethod: formData.feedingMethod,
        feedingPosition: formData.feedingPosition,
        swallowingFunction: formData.swallowingFunction,
        aspirationRisk: formData.aspirationRisk,
        droolingManagement: formData.droolingManagement,
        intakeAmount: formData.intakeAmount,
        feedingDuration: formData.feedingDuration,
        observedSymptoms: formData.observedSymptoms,
        interventions: formData.interventions,
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

      {/* 食事種類 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-600">🍽️ 食事種類</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={mealTypeOptions}
            value={formData.mealType}
            onChange={(value) => setFormData((prev) => ({ ...prev, mealType: value }))}
            placeholder="食事種類を選択してください"
          />
        </CardContent>
      </Card>

      {/* 食事形態 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-600">🥄 食事形態</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={foodTextureOptions}
            value={formData.foodTexture}
            onChange={(value) => setFormData((prev) => ({ ...prev, foodTexture: value }))}
            placeholder="食事形態を選択してください"
          />
        </CardContent>
      </Card>

      {/* 水分とろみ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-cyan-600">💧 水分とろみ</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={liquidConsistencyOptions}
            value={formData.liquidConsistency}
            onChange={(value) => setFormData((prev) => ({ ...prev, liquidConsistency: value }))}
            placeholder="水分のとろみを選択してください"
          />
        </CardContent>
      </Card>

      {/* 摂取方法 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-600">🤲 摂取方法</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={feedingMethodOptions}
            value={formData.feedingMethod}
            onChange={(value) => setFormData((prev) => ({ ...prev, feedingMethod: value }))}
            placeholder="摂取方法を選択してください"
          />
        </CardContent>
      </Card>

      {/* 摂取姿勢 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-orange-600">🪑 摂取姿勢</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={feedingPositionOptions}
            value={formData.feedingPosition}
            onChange={(value) => setFormData((prev) => ({ ...prev, feedingPosition: value }))}
            placeholder="摂取姿勢を選択してください"
          />
        </CardContent>
      </Card>

      {/* 嚥下機能 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-red-600">🫗 嚥下機能</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={swallowingFunctionOptions}
            value={formData.swallowingFunction}
            onChange={(value) => setFormData((prev) => ({ ...prev, swallowingFunction: value }))}
            placeholder="嚥下機能を選択してください"
          />
        </CardContent>
      </Card>

      {/* 誤嚥リスク */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-yellow-600">⚠️ 誤嚥リスク</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={aspirationRiskOptions}
            value={formData.aspirationRisk}
            onChange={(value) => setFormData((prev) => ({ ...prev, aspirationRisk: value }))}
            placeholder="誤嚥リスクを選択してください"
          />
        </CardContent>
      </Card>

      {/* 流涎管理 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-teal-600">💧 流涎管理</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={droolingManagementOptions}
            value={formData.droolingManagement}
            onChange={(value) => setFormData((prev) => ({ ...prev, droolingManagement: value }))}
            placeholder="流涎管理を選択してください"
          />
        </CardContent>
      </Card>

      {/* 摂取量 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-indigo-600">📊 摂取量（%）</CardTitle>
        </CardHeader>
        <CardContent>
          <NumberSelector
            value={formData.intakeAmount}
            onChange={(value) => setFormData((prev) => ({ ...prev, intakeAmount: value }))}
            min={0}
            max={100}
            step={10}
            unit="%"
          />
        </CardContent>
      </Card>

      {/* 摂取時間 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-violet-600">⏱️ 摂取時間（分）</CardTitle>
        </CardHeader>
        <CardContent>
          <NumberSelector
            value={formData.feedingDuration}
            onChange={(value) => setFormData((prev) => ({ ...prev, feedingDuration: value }))}
            min={5}
            max={120}
            step={5}
            unit="分"
          />
        </CardContent>
      </Card>

      {/* 観察された症状 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-rose-600">👁️ 観察された症状</CardTitle>
        </CardHeader>
        <CardContent>
          <ClickableDropdown
            options={observedSymptomsOptions}
            value={formData.observedSymptoms}
            onChange={(value) => setFormData((prev) => ({ ...prev, observedSymptoms: value }))}
            placeholder="観察された症状を選択してください"
          />
        </CardContent>
      </Card>

      {/* 実施した対応 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-emerald-600">🛠️ 実施した対応</CardTitle>
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
