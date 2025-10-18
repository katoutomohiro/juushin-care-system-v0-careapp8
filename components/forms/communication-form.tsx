"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClickableDropdown } from "@/components/clickable-dropdown"
import { NumberSelector } from "@/components/number-selector"
import { CareFormLayout } from "@/components/care-form-layout"
import { Label } from "@/components/ui/label" // Import Label component

interface CommunicationFormData {
  time: string
  communicationMethod: string
  responseLevel: string
  understandingLevel: number
  assistiveDevice: string
  emotionalExpression: string
  socialInteraction: string
  communicationGoal: string
  effectiveness: number
  challenges: string
  supportStrategies: string
  familyInteraction: string
  notes: string
}

interface CommunicationFormProps {
  selectedUser: string
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function CommunicationForm({ selectedUser: _selectedUser, onSubmit, onCancel }: CommunicationFormProps) {
  const [formData, setFormData] = useState<CommunicationFormData>({
    time: new Date().toISOString().slice(0, 16),
    communicationMethod: "",
    responseLevel: "",
    understandingLevel: 50,
    assistiveDevice: "",
    emotionalExpression: "",
    socialInteraction: "",
    communicationGoal: "",
    effectiveness: 50,
    challenges: "",
    supportStrategies: "",
    familyInteraction: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const careEvent = {
      ...formData,
      timestamp: new Date(formData.time).toISOString(),
      eventType: "communication",
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
        return options.communication?.[key] || defaultOptions
      }
    } catch (error) {
      console.error("Error loading custom options:", error)
    }
    return defaultOptions
  }

  const communicationMethodOptions = getCustomOptions("communicationMethod", [
    "言語",
    "身振り・手振り",
    "表情",
    "視線",
    "発声",
    "タッチ",
    "絵カード",
    "文字盤",
    "音声出力装置",
    "スイッチ操作",
    "その他",
  ])

  const responseLevelOptions = getCustomOptions("responseLevel", [
    "積極的反応",
    "適切な反応",
    "遅延反応",
    "部分的反応",
    "最小限反応",
    "反応なし",
    "拒否反応",
    "評価困難",
  ])

  const assistiveDeviceOptions = getCustomOptions("assistiveDevice", [
    "なし",
    "コミュニケーションボード",
    "音声出力装置",
    "タブレット",
    "スイッチ",
    "視線入力装置",
    "筆談用具",
    "絵カード",
    "その他",
  ])

  const emotionalExpressionOptions = getCustomOptions("emotionalExpression", [
    "喜び",
    "満足",
    "興味",
    "驚き",
    "困惑",
    "不安",
    "怒り",
    "悲しみ",
    "無表情",
    "評価困難",
  ])

  const socialInteractionOptions = getCustomOptions("socialInteraction", [
    "積極的参加",
    "受動的参加",
    "選択的参加",
    "回避的",
    "拒否的",
    "無関心",
    "観察のみ",
    "評価困難",
  ])

  const communicationGoalOptions = getCustomOptions("communicationGoal", [
    "基本的欲求表現",
    "感情表現",
    "選択・決定",
    "社会的交流",
    "学習活動",
    "日常会話",
    "緊急時対応",
    "その他",
  ])

  const challengesOptions = getCustomOptions("challenges", [
    "なし",
    "理解困難",
    "表現困難",
    "注意集中困難",
    "身体的制約",
    "認知的制約",
    "感覚的制約",
    "環境的要因",
    "その他",
  ])

  const supportStrategiesOptions = getCustomOptions("supportStrategies", [
    "視覚的支援",
    "聴覚的支援",
    "触覚的支援",
    "環境調整",
    "時間調整",
    "個別対応",
    "集団活動",
    "家族連携",
    "その他",
  ])

  const familyInteractionOptions = getCustomOptions("familyInteraction", [
    "良好",
    "普通",
    "限定的",
    "困難",
    "家族不在",
    "家族希望あり",
    "支援必要",
    "その他",
  ])

  return (
    <CareFormLayout title="💬 コミュニケーション支援" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        {/* 記録時刻 */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <Label className="text-pink-600 font-medium mb-3 block">🕐 記録時刻</Label>
          <div className="flex gap-2">
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

        {/* コミュニケーション方法 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Label className="text-blue-600 font-medium mb-3 block">🗣️ コミュニケーション方法</Label>
          <ClickableDropdown
            options={communicationMethodOptions}
            value={formData.communicationMethod}
            onChange={(value) => setFormData((prev) => ({ ...prev, communicationMethod: value }))}
            placeholder="使用したコミュニケーション方法を選択してください"
            className="text-lg"
          />
        </div>

        {/* 反応レベル */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Label className="text-green-600 font-medium mb-3 block">📊 反応レベル</Label>
          <ClickableDropdown
            options={responseLevelOptions}
            value={formData.responseLevel}
            onChange={(value) => setFormData((prev) => ({ ...prev, responseLevel: value }))}
            placeholder="反応レベルを選択してください"
            className="text-lg"
          />
        </div>

        {/* 理解度 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <Label className="text-purple-600 font-medium mb-3 block">🧠 理解度（%）</Label>
          <NumberSelector
            value={formData.understandingLevel}
            onChange={(value) => setFormData((prev) => ({ ...prev, understandingLevel: value }))}
            min={0}
            max={100}
            step={10}
            unit="%"
            className="text-lg"
          />
        </div>

        {/* 支援機器 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <Label className="text-orange-600 font-medium mb-3 block">🔧 支援機器</Label>
          <ClickableDropdown
            options={assistiveDeviceOptions}
            value={formData.assistiveDevice}
            onChange={(value) => setFormData((prev) => ({ ...prev, assistiveDevice: value }))}
            placeholder="使用した支援機器を選択してください"
            className="text-lg"
          />
        </div>

        {/* 感情表現 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Label className="text-red-600 font-medium mb-3 block">😊 感情表現</Label>
          <ClickableDropdown
            options={emotionalExpressionOptions}
            value={formData.emotionalExpression}
            onChange={(value) => setFormData((prev) => ({ ...prev, emotionalExpression: value }))}
            placeholder="観察された感情表現を選択してください"
            className="text-lg"
          />
        </div>

        {/* 社会的相互作用 */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <Label className="text-teal-600 font-medium mb-3 block">👥 社会的相互作用</Label>
          <ClickableDropdown
            options={socialInteractionOptions}
            value={formData.socialInteraction}
            onChange={(value) => setFormData((prev) => ({ ...prev, socialInteraction: value }))}
            placeholder="社会的相互作用を選択してください"
            className="text-lg"
          />
        </div>

        {/* コミュニケーション目標 */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <Label className="text-indigo-600 font-medium mb-3 block">🎯 コミュニケーション目標</Label>
          <ClickableDropdown
            options={communicationGoalOptions}
            value={formData.communicationGoal}
            onChange={(value) => setFormData((prev) => ({ ...prev, communicationGoal: value }))}
            placeholder="コミュニケーション目標を選択してください"
            className="text-lg"
          />
        </div>

        {/* 効果度 */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <Label className="text-cyan-600 font-medium mb-3 block">✨ 効果度（%）</Label>
          <NumberSelector
            value={formData.effectiveness}
            onChange={(value) => setFormData((prev) => ({ ...prev, effectiveness: value }))}
            min={0}
            max={100}
            step={10}
            unit="%"
            className="text-lg"
          />
        </div>

        {/* 課題・困難 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <Label className="text-yellow-600 font-medium mb-3 block">⚠️ 課題・困難</Label>
          <ClickableDropdown
            options={challengesOptions}
            value={formData.challenges}
            onChange={(value) => setFormData((prev) => ({ ...prev, challenges: value }))}
            placeholder="観察された課題・困難を選択してください"
            className="text-lg"
          />
        </div>

        {/* 支援方略 */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
          <Label className="text-violet-600 font-medium mb-3 block">🛠️ 支援方略</Label>
          <ClickableDropdown
            options={supportStrategiesOptions}
            value={formData.supportStrategies}
            onChange={(value) => setFormData((prev) => ({ ...prev, supportStrategies: value }))}
            placeholder="実施した支援方略を選択してください"
            className="text-lg"
          />
        </div>

        {/* 家族との相互作用 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <Label className="text-emerald-600 font-medium mb-3 block">👨‍👩‍👧‍👦 家族との相互作用</Label>
          <ClickableDropdown
            options={familyInteractionOptions}
            value={formData.familyInteraction}
            onChange={(value) => setFormData((prev) => ({ ...prev, familyInteraction: value }))}
            placeholder="家族との相互作用を選択してください"
            className="text-lg"
          />
        </div>

        {/* 備考 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
