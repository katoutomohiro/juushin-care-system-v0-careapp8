"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import CareFormLayout from "@/components/care-form-layout"

interface ExpressionFormData {
  timestamp: string
  expressionType: string
  emotionalState: string
  eyeMovement: string
  mouthMovement: string
  facialExpression: string
  eyeContact: boolean
  vocalResponse: string
  bodyLanguage: string
  communicationResponse: string
  socialResponse: string
  triggerEvent: string
  duration: string
  observedBehaviors: string[]
  notes: string
}

interface ExpressionFormProps {
  onSubmit: (data: ExpressionFormData) => void
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

const defaultExpressionBehaviors = [
  { value: "手の動き", label: "手の動き" },
  { value: "足の動き", label: "足の動き" },
  { value: "体幹の動き", label: "体幹の動き" },
  { value: "頭部の動き", label: "頭部の動き" },
  { value: "首の動き", label: "首の動き" },
  { value: "肩の動き", label: "肩の動き" },
  { value: "指の動き", label: "指の動き" },
  { value: "腕の動き", label: "腕の動き" },
  { value: "笑い声", label: "笑い声" },
  { value: "うめき声", label: "うめき声" },
  { value: "発語", label: "発語" },
  { value: "呼吸の変化", label: "呼吸の変化" },
  { value: "心拍の変化", label: "心拍の変化" },
  { value: "発汗", label: "発汗" },
  { value: "筋緊張の変化", label: "筋緊張の変化" },
]

export function ExpressionForm({ onSubmit, onCancel }: ExpressionFormProps) {
  const [formData, setFormData] = useState<ExpressionFormData>({
    timestamp: new Date().toISOString().slice(0, 16),
    expressionType: "",
    emotionalState: "",
    eyeMovement: "",
    mouthMovement: "",
    facialExpression: "",
    eyeContact: false,
    vocalResponse: "",
    bodyLanguage: "",
    communicationResponse: "",
    socialResponse: "",
    triggerEvent: "",
    duration: "",
    observedBehaviors: [],
    notes: "",
  })

  const [expressionBehaviors, setExpressionBehaviors] = useState(defaultExpressionBehaviors)

  useEffect(() => {
    const loadCustomOptions = () => {
      try {
        const savedOptions = localStorage.getItem("form-options")
        if (savedOptions) {
          const parsed = JSON.parse(savedOptions)

          if (parsed.expressionBehaviors) {
            setExpressionBehaviors(
              parsed.expressionBehaviors.map((opt: any) => ({ value: opt.label, label: opt.label })),
            )
          }
        }
      } catch (error) {
        console.error("[v0] Failed to load custom expression form options:", error)
      }
    }

    loadCustomOptions()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const setCurrentTime = () => {
    const now = new Date()
    const timezoneOffset = now.getTimezoneOffset() * 60000
    const localTime = new Date(now.getTime() - timezoneOffset)
    const currentTime = localTime.toISOString().slice(0, 16)
    setFormData({ ...formData, timestamp: currentTime })
  }

  const handleBehaviorChange = (behavior: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, observedBehaviors: [...formData.observedBehaviors, behavior] })
    } else {
      setFormData({ ...formData, observedBehaviors: formData.observedBehaviors.filter((b) => b !== behavior) })
    }
  }

  return (
    <CareFormLayout title="😊 表情・反応記録" onSubmit={handleSubmit} onCancel={onCancel}>
      <div className="space-y-6">
        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">📅 基本情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timestamp" className="text-sm font-medium text-gray-700">
                記録時刻
              </Label>
              <div className="flex gap-2">
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  className="h-12 text-base flex-1"
                  required
                />
                <Button
                  type="button"
                  onClick={setCurrentTime}
                  variant="outline"
                  className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-700 font-medium"
                >
                  今すぐ
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                持続時間
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="例：5分間"
                className="h-12 text-base"
              />
            </div>
          </div>
        </div>

        <div className="border-blue-200 bg-blue-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">😊 表情・感情</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">表情の種類</Label>
              <ClickableDropdown
                value={formData.expressionType}
                onValueChange={(value) => setFormData({ ...formData, expressionType: value })}
                placeholder="表情の種類を選択してください"
                options={[
                  { value: "happy", label: "😊 喜び" },
                  { value: "sad", label: "😢 悲しみ" },
                  { value: "angry", label: "😠 怒り" },
                  { value: "surprised", label: "😲 驚き" },
                  { value: "fear", label: "😨 恐怖" },
                  { value: "neutral", label: "😐 無表情" },
                  { value: "pain", label: "😣 痛み" },
                  { value: "comfort", label: "😌 安らぎ" },
                  { value: "confused", label: "😕 困惑" },
                  { value: "interest", label: "🤔 興味" },
                ]}
                className="text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">感情状態</Label>
              <ClickableDropdown
                value={formData.emotionalState}
                onValueChange={(value) => setFormData({ ...formData, emotionalState: value })}
                placeholder="感情状態を選択してください"
                options={[
                  { value: "calm", label: "🕊️ 穏やか" },
                  { value: "excited", label: "⚡ 興奮" },
                  { value: "agitated", label: "🌊 不安定" },
                  { value: "withdrawn", label: "🐚 引きこもり" },
                  { value: "responsive", label: "🎯 反応的" },
                  { value: "alert", label: "👀 警戒" },
                  { value: "relaxed", label: "😴 リラックス" },
                ]}
                className="text-lg"
              />
            </div>
          </div>
        </div>

        <div className="border-indigo-200 bg-indigo-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-indigo-800 mb-4">👁️ 眼球・視線の動き</h3>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">眼球運動</Label>
            <ClickableDropdown
              value={formData.eyeMovement}
              onValueChange={(value) => setFormData({ ...formData, eyeMovement: value })}
              placeholder="眼球運動を選択してください"
              options={[
                { value: "normal", label: "正常" },
                { value: "staring", label: "凝視" },
                { value: "rolled-up", label: "眼球上転" },
                { value: "tracking", label: "追視" },
                { value: "blinking-abnormal", label: "瞬目異常" },
                { value: "avoidance", label: "視線回避" },
              ]}
              className="text-lg"
            />
          </div>
        </div>

        <div className="border-pink-200 bg-pink-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-pink-800 mb-4">👄 口・顔面の動き</h3>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">口の動き</Label>
            <ClickableDropdown
              value={formData.mouthMovement}
              onValueChange={(value) => setFormData({ ...formData, mouthMovement: value })}
              placeholder="口の動きを選択してください"
              options={[
                { value: "normal", label: "正常" },
                { value: "open", label: "開口" },
                { value: "closed", label: "閉口" },
                { value: "tongue-movement", label: "舌の動き" },
                { value: "drooling", label: "よだれ" },
                { value: "chewing-motion", label: "咀嚼様運動" },
                { value: "grimacing", label: "しかめ面" },
              ]}
              className="text-lg"
            />
          </div>
        </div>

        <div className="border-emerald-200 bg-emerald-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">🗣️ コミュニケーション反応</h3>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">声かけ・刺激への反応</Label>
            <ClickableDropdown
              value={formData.communicationResponse}
              onValueChange={(value) => setFormData({ ...formData, communicationResponse: value })}
              placeholder="コミュニケーション反応を選択してください"
              options={[
                { value: "responsive", label: "反応あり" },
                { value: "delayed", label: "遅延反応" },
                { value: "no-response", label: "反応なし" },
                { value: "sound-response", label: "音への反応" },
                { value: "touch-response", label: "触れ合いへの反応" },
                { value: "visual-response", label: "視覚刺激への反応" },
              ]}
              className="text-lg"
            />
          </div>
        </div>

        <div className="border-teal-200 bg-teal-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">👥 社会的反応</h3>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">他者との関わり</Label>
            <ClickableDropdown
              value={formData.socialResponse}
              onValueChange={(value) => setFormData({ ...formData, socialResponse: value })}
              placeholder="社会的反応を選択してください"
              options={[
                { value: "interested", label: "関心あり" },
                { value: "avoidant", label: "回避行動" },
                { value: "approaching", label: "接近行動" },
                { value: "neutral", label: "中立" },
                { value: "seeking-attention", label: "注意を求める" },
                { value: "social-smile", label: "社会的微笑" },
              ]}
              className="text-lg"
            />
          </div>
        </div>

        <div className="border-violet-200 bg-violet-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-violet-800 mb-4">📋 観察された行動</h3>
          <ClickableDropdown
            value={formData.observedBehaviors.join(", ")}
            onValueChange={(value) => {
              const behaviors = value ? [value] : []
              setFormData({ ...formData, observedBehaviors: behaviors })
            }}
            placeholder="観察された行動を選択してください"
            options={expressionBehaviors}
            className="text-lg"
          />
        </div>

        <div className="border-purple-200 bg-purple-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">🗣️ 反応・行動</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vocalResponse" className="text-sm font-medium text-gray-700">
                声の反応
              </Label>
              <Input
                id="vocalResponse"
                value={formData.vocalResponse}
                onChange={(e) => setFormData({ ...formData, vocalResponse: e.target.value })}
                placeholder="笑い声、うめき声、発語など"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyLanguage" className="text-sm font-medium text-gray-700">
                身体の反応
              </Label>
              <Input
                id="bodyLanguage"
                value={formData.bodyLanguage}
                onChange={(e) => setFormData({ ...formData, bodyLanguage: e.target.value })}
                placeholder="手の動き、体の向きなど"
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="triggerEvent" className="text-sm font-medium text-gray-700">
              きっかけ・要因
            </Label>
            <Input
              id="triggerEvent"
              value={formData.triggerEvent}
              onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
              placeholder="音楽、声かけ、触れ合いなど"
              className="h-12 text-base"
            />
          </div>

          <div className="mt-6 space-y-2">
            <Label htmlFor="facialExpression" className="text-sm font-medium text-gray-700">
              顔の表情詳細
            </Label>
            <Input
              id="facialExpression"
              value={formData.facialExpression}
              onChange={(e) => setFormData({ ...formData, facialExpression: e.target.value })}
              placeholder="眉間のしわ、口角の動きなど"
              className="h-12 text-base"
            />
          </div>

          <div className="mt-6 flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Checkbox
              id="eyeContact"
              checked={formData.eyeContact}
              onCheckedChange={(checked) => setFormData({ ...formData, eyeContact: checked as boolean })}
              className="h-6 w-6"
            />
            <Label htmlFor="eyeContact" className="text-base font-medium text-gray-700 cursor-pointer">
              👁️ アイコンタクトあり
            </Label>
          </div>
        </div>

        <div className="border-orange-200 bg-orange-50/30 border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">📝 詳細・備考</h3>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              その他の観察事項
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="その他の観察事項や特記事項を詳しく記録してください"
              rows={4}
              className="text-base resize-none"
            />
          </div>
        </div>
      </div>
    </CareFormLayout>
  )
}
