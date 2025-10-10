"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ClickableDropdown } from "@/components/clickable-dropdown"
import { NumberSelector } from "@/components/number-selector"
import { DataStorageService } from "@/services/data-storage-service"
import { CareFormLayout } from "@/components/care-form-layout"

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

export function CommunicationForm({ selectedUser, onSubmit, onCancel }: CommunicationFormProps) {
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
      id: Date.now().toString(),
      userId: selectedUser,
      type: "communication" as const,
      timestamp: new Date(formData.time).toISOString(),
      details: {
        communicationMethod: formData.communicationMethod,
        responseLevel: formData.responseLevel,
        understandingLevel: formData.understandingLevel,
        assistiveDevice: formData.assistiveDevice,
        emotionalExpression: formData.emotionalExpression,
        socialInteraction: formData.socialInteraction,
        communicationGoal: formData.communicationGoal,
        effectiveness: formData.effectiveness,
        challenges: formData.challenges,
        supportStrategies: formData.supportStrategies,
        familyInteraction: formData.familyInteraction,
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
      {/* 記録時刻 */}
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
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

      {/* コミュニケーション方法 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-600 mb-3">🗣️ コミュニケーション方法</h3>
        <ClickableDropdown
          options={communicationMethodOptions}
          value={formData.communicationMethod}
          onChange={(value) => setFormData((prev) => ({ ...prev, communicationMethod: value }))}
          placeholder="使用したコミュニケーション方法を選択してください"
        />
      </div>

      {/* 反応レベル */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-600 mb-3">📊 反応レベル</h3>
        <ClickableDropdown
          options={responseLevelOptions}
          value={formData.responseLevel}
          onChange={(value) => setFormData((prev) => ({ ...prev, responseLevel: value }))}
          placeholder="反応レベルを選択してください"
        />
      </div>

      {/* 理解度 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-600 mb-3">🧠 理解度（%）</h3>
        <NumberSelector
          value={formData.understandingLevel}
          onChange={(value) => setFormData((prev) => ({ ...prev, understandingLevel: value }))}
          min={0}
          max={100}
          step={10}
          unit="%"
        />
      </div>

      {/* 支援機器 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-orange-600 mb-3">🔧 支援機器</h3>
        <ClickableDropdown
          options={assistiveDeviceOptions}
          value={formData.assistiveDevice}
          onChange={(value) => setFormData((prev) => ({ ...prev, assistiveDevice: value }))}
          placeholder="使用した支援機器を選択してください"
        />
      </div>

      {/* 感情表現 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-600 mb-3">😊 感情表現</h3>
        <ClickableDropdown
          options={emotionalExpressionOptions}
          value={formData.emotionalExpression}
          onChange={(value) => setFormData((prev) => ({ ...prev, emotionalExpression: value }))}
          placeholder="観察された感情表現を選択してください"
        />
      </div>

      {/* 社会的相互作用 */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-teal-600 mb-3">👥 社会的相互作用</h3>
        <ClickableDropdown
          options={socialInteractionOptions}
          value={formData.socialInteraction}
          onChange={(value) => setFormData((prev) => ({ ...prev, socialInteraction: value }))}
          placeholder="社会的相互作用を選択してください"
        />
      </div>

      {/* コミュニケーション目標 */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-indigo-600 mb-3">🎯 コミュニケーション目標</h3>
        <ClickableDropdown
          options={communicationGoalOptions}
          value={formData.communicationGoal}
          onChange={(value) => setFormData((prev) => ({ ...prev, communicationGoal: value }))}
          placeholder="コミュニケーション目標を選択してください"
        />
      </div>

      {/* 効果度 */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-cyan-600 mb-3">✨ 効果度（%）</h3>
        <NumberSelector
          value={formData.effectiveness}
          onChange={(value) => setFormData((prev) => ({ ...prev, effectiveness: value }))}
          min={0}
          max={100}
          step={10}
          unit="%"
        />
      </div>

      {/* 課題・困難 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-600 mb-3">⚠️ 課題・困難</h3>
        <ClickableDropdown
          options={challengesOptions}
          value={formData.challenges}
          onChange={(value) => setFormData((prev) => ({ ...prev, challenges: value }))}
          placeholder="観察された課題・困難を選択してください"
        />
      </div>

      {/* 支援方略 */}
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-violet-600 mb-3">🛠️ 支援方略</h3>
        <ClickableDropdown
          options={supportStrategiesOptions}
          value={formData.supportStrategies}
          onChange={(value) => setFormData((prev) => ({ ...prev, supportStrategies: value }))}
          placeholder="実施した支援方略を選択してください"
        />
      </div>

      {/* 家族との相互作用 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-emerald-600 mb-3">👨‍👩‍👧‍👦 家族との相互作用</h3>
        <ClickableDropdown
          options={familyInteractionOptions}
          value={formData.familyInteraction}
          onChange={(value) => setFormData((prev) => ({ ...prev, familyInteraction: value }))}
          placeholder="家族との相互作用を選択してください"
        />
      </div>

      {/* 備考 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-3">📝 備考</h3>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="特記事項があれば記入してください"
          rows={3}
        />
      </div>
    </CareFormLayout>
  )
}
