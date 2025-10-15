"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FormOption {
  id: string
  label: string
  value: string
}

interface FormOptionsData {
  seizureTypes: FormOption[]
  seizureSymptoms: FormOption[]
  seizureMeasurementIssues: FormOption[]
  expressionBehaviors: FormOption[]
  vitalsMeasurementIssues: FormOption[]
  hydrationTypes: FormOption[]
  hydrationMethods: FormOption[]
  hydrationTemperatures: FormOption[]
  hydrationIntakeStatus: FormOption[]
  hydrationPosture: FormOption[]
  hydrationReactions: FormOption[]
  hydrationDifficulties: FormOption[]
  excreteTypes: FormOption[]
  excreteUrineProperties: FormOption[]
  excreteStoolProperties: FormOption[]
  excreteAmounts: FormOption[]
  excreteMethods: FormOption[]
  excreteAssistanceLevels: FormOption[]
  excreteConditions: FormOption[]
  excreteSymptoms: FormOption[]
  excreteComplications: FormOption[]
  activityTypes: FormOption[]
  activityLevels: FormOption[]
  activityMoods: FormOption[]
  activitySocialInteractions: FormOption[]
  activityFunctionalLimitations: FormOption[]
  activityObservedBehaviors: FormOption[]
  skinCareTypes: FormOption[]
  skinCareProducts: FormOption[]
  skinCareAreas: FormOption[]
  skinObservations: FormOption[]
  oralCareTypes: FormOption[]
  oralCareProducts: FormOption[]
  oralObservations: FormOption[]
  tubeFeedingTypes: FormOption[]
  tubeFeedingAmounts: FormOption[]
  tubeFeedingTemperatures: FormOption[]
  tubeFeedingMethods: FormOption[]
  tubeFeedingPositions: FormOption[]
  tubeFeedingPreTreatments: FormOption[]
  tubeFeedingPostTreatments: FormOption[]
  tubeFeedingSymptoms: FormOption[]
  tubeFeedingComplications: FormOption[]
}

const defaultFormOptions: FormOptionsData = {
  seizureTypes: [
    { id: "tonic", label: "強直発作", value: "tonic" },
    { id: "clonic", label: "間代発作", value: "clonic" },
    { id: "tonic-clonic", label: "強直間代発作", value: "tonic-clonic" },
    { id: "absence", label: "欠神発作", value: "absence" },
    { id: "myoclonic", label: "ミオクローヌス発作", value: "myoclonic" },
    { id: "atonic", label: "脱力発作", value: "atonic" },
  ],
  seizureSymptoms: [
    { id: "fall", label: "転倒", value: "fall" },
    { id: "scream", label: "叫び声", value: "scream" },
    { id: "incontinence", label: "失禁", value: "incontinence" },
    { id: "body-stiffness", label: "体の硬直", value: "body-stiffness" },
    { id: "eye-rolling", label: "眼球上転", value: "eye-rolling" },
    { id: "drooling", label: "よだれ", value: "drooling" },
    { id: "breathing-difficulty", label: "呼吸困難", value: "breathing-difficulty" },
    { id: "consciousness-loss", label: "意識消失", value: "consciousness-loss" },
    { id: "limb-jerking", label: "四肢のけいれん", value: "limb-jerking" },
    { id: "facial-twitching", label: "顔面のけいれん", value: "facial-twitching" },
    { id: "tongue-biting", label: "舌咬み", value: "tongue-biting" },
    { id: "cyanosis", label: "チアノーゼ", value: "cyanosis" },
  ],
  seizureMeasurementIssues: [
    { id: "severe-movement", label: "体動が激しい", value: "severe-movement" },
    { id: "low-consciousness", label: "意識レベル低下", value: "low-consciousness" },
    { id: "poor-condition", label: "体調不良", value: "poor-condition" },
    { id: "refusal", label: "拒否行動", value: "refusal" },
    { id: "oral-issues", label: "口腔内問題", value: "oral-issues" },
    { id: "breathing-difficulty", label: "呼吸困難", value: "breathing-difficulty" },
    { id: "postural-issues", label: "姿勢保持困難", value: "postural-issues" },
    { id: "equipment-issues", label: "機器の問題", value: "equipment-issues" },
  ],
  expressionBehaviors: [
    { id: "hand-movement", label: "手の動き", value: "hand-movement" },
    { id: "foot-movement", label: "足の動き", value: "foot-movement" },
    { id: "head-movement", label: "頭の動き", value: "head-movement" },
    { id: "eye-contact", label: "アイコンタクト", value: "eye-contact" },
    { id: "smile", label: "笑顔", value: "smile" },
    { id: "vocalization", label: "発声", value: "vocalization" },
    { id: "crying", label: "泣き", value: "crying" },
    { id: "agitation", label: "興奮", value: "agitation" },
    { id: "calm", label: "落ち着き", value: "calm" },
    { id: "sleepy", label: "眠気", value: "sleepy" },
    { id: "alert", label: "覚醒", value: "alert" },
    { id: "restless", label: "不穏", value: "restless" },
    { id: "comfortable", label: "安楽", value: "comfortable" },
    { id: "discomfort", label: "不快", value: "discomfort" },
    { id: "responsive", label: "反応あり", value: "responsive" },
  ],
  vitalsMeasurementIssues: [
    { id: "severe-movement", label: "体動が激しい", value: "severe-movement" },
    { id: "low-consciousness", label: "意識レベル低下", value: "low-consciousness" },
    { id: "poor-condition", label: "体調不良", value: "poor-condition" },
    { id: "refusal", label: "拒否行動", value: "refusal" },
    { id: "oral-issues", label: "口腔内問題", value: "oral-issues" },
    { id: "breathing-difficulty", label: "呼吸困難", value: "breathing-difficulty" },
    { id: "postural-issues", label: "姿勢保持困難", value: "postural-issues" },
    { id: "equipment-issues", label: "機器の問題", value: "equipment-issues" },
  ],
  hydrationTypes: [
    { id: "water", label: "水", value: "water" },
    { id: "tea", label: "お茶", value: "tea" },
    { id: "juice", label: "ジュース", value: "juice" },
    { id: "milk", label: "牛乳", value: "milk" },
    { id: "sports-drink", label: "スポーツドリンク", value: "sports-drink" },
    { id: "nutritional-drink", label: "栄養ドリンク", value: "nutritional-drink" },
  ],
  hydrationMethods: [
    { id: "oral", label: "経口", value: "oral" },
    { id: "straw", label: "ストロー", value: "straw" },
    { id: "spoon", label: "スプーン", value: "spoon" },
    { id: "syringe", label: "シリンジ", value: "syringe" },
    { id: "tube", label: "チューブ", value: "tube" },
  ],
  hydrationTemperatures: [
    { id: "cold", label: "冷たい", value: "cold" },
    { id: "room", label: "常温", value: "room" },
    { id: "warm", label: "温かい", value: "warm" },
    { id: "hot", label: "熱い", value: "hot" },
  ],
  hydrationIntakeStatus: [
    { id: "complete", label: "完全摂取", value: "complete" },
    { id: "partial", label: "部分摂取", value: "partial" },
    { id: "minimal", label: "少量摂取", value: "minimal" },
    { id: "refused", label: "拒否", value: "refused" },
  ],
  hydrationPosture: [
    { id: "sitting", label: "座位", value: "sitting" },
    { id: "semi-sitting", label: "半座位", value: "semi-sitting" },
    { id: "lying", label: "臥位", value: "lying" },
    { id: "side-lying", label: "側臥位", value: "side-lying" },
  ],
  hydrationReactions: [
    { id: "normal-intake", label: "正常な摂取", value: "normal-intake" },
    { id: "coughing", label: "咳込み", value: "coughing" },
    { id: "choking", label: "むせ", value: "choking" },
    { id: "vomiting", label: "嘔吐", value: "vomiting" },
    { id: "refusal-reaction", label: "拒否反応", value: "refusal-reaction" },
    { id: "happy-expression", label: "喜びの表情", value: "happy-expression" },
    { id: "drowsiness", label: "眠気", value: "drowsiness" },
    { id: "alertness", label: "覚醒", value: "alertness" },
    { id: "sweating", label: "発汗", value: "sweating" },
    { id: "color-change", label: "顔色変化", value: "color-change" },
  ],
  hydrationDifficulties: [
    { id: "swallowing-difficulty", label: "嚥下困難", value: "swallowing-difficulty" },
    { id: "low-consciousness", label: "意識レベル低下", value: "low-consciousness" },
    { id: "poor-condition", label: "体調不良", value: "poor-condition" },
    { id: "refusal", label: "拒否行動", value: "refusal" },
    { id: "oral-issues", label: "口腔内問題", value: "oral-issues" },
    { id: "breathing-difficulty", label: "呼吸困難", value: "breathing-difficulty" },
    { id: "postural-issues", label: "姿勢保持困難", value: "postural-issues" },
    { id: "equipment-issues", label: "機器の問題", value: "equipment-issues" },
  ],
  excreteTypes: [
    { id: "urination", label: "排尿", value: "urination" },
    { id: "defecation", label: "排便", value: "defecation" },
    { id: "both", label: "両方", value: "both" },
  ],
  excreteUrineProperties: [
    { id: "clear", label: "透明", value: "clear" },
    { id: "yellow", label: "黄色", value: "yellow" },
    { id: "dark-yellow", label: "濃黄色", value: "dark-yellow" },
    { id: "cloudy", label: "混濁", value: "cloudy" },
    { id: "bloody", label: "血尿", value: "bloody" },
  ],
  excreteStoolProperties: [
    { id: "normal", label: "正常便", value: "normal" },
    { id: "soft", label: "軟便", value: "soft" },
    { id: "loose", label: "泥状便", value: "loose" },
    { id: "watery", label: "水様便", value: "watery" },
    { id: "hard", label: "硬便", value: "hard" },
    { id: "bloody", label: "血便", value: "bloody" },
  ],
  excreteAmounts: [
    { id: "small", label: "少量", value: "small" },
    { id: "moderate", label: "中等量", value: "moderate" },
    { id: "large", label: "多量", value: "large" },
  ],
  excreteMethods: [
    { id: "toilet", label: "トイレ", value: "toilet" },
    { id: "portable-toilet", label: "ポータブルトイレ", value: "portable-toilet" },
    { id: "diaper", label: "おむつ", value: "diaper" },
    { id: "urinal", label: "尿器", value: "urinal" },
    { id: "catheter", label: "カテーテル", value: "catheter" },
  ],
  excreteAssistanceLevels: [
    { id: "independent", label: "自立", value: "independent" },
    { id: "partial-assistance", label: "一部介助", value: "partial-assistance" },
    { id: "full-assistance", label: "全介助", value: "full-assistance" },
  ],
  excreteConditions: [
    { id: "normal", label: "正常", value: "normal" },
    { id: "constipation", label: "便秘", value: "constipation" },
    { id: "diarrhea", label: "下痢", value: "diarrhea" },
    { id: "incontinence", label: "失禁", value: "incontinence" },
    { id: "retention", label: "尿閉", value: "retention" },
  ],
  excreteSymptoms: [
    { id: "none", label: "失禁", value: "none" },
    { id: "urinary-incontinence", label: "尿意あり", value: "urinary-incontinence" },
    { id: "constipation", label: "便意あり", value: "constipation" },
    { id: "abdominal-distension", label: "腹部膨満", value: "abdominal-distension" },
    { id: "abdominal-pain", label: "腹痛", value: "abdominal-pain" },
    { id: "difficulty-urinating", label: "排尿困難", value: "difficulty-urinating" },
    { id: "difficulty-defecating", label: "排便困難", value: "difficulty-defecating" },
    { id: "frequent-urination", label: "頻尿", value: "frequent-urination" },
    { id: "residual-urine", label: "残尿感", value: "residual-urine" },
    { id: "itching", label: "いきみ", value: "itching" },
    { id: "discomfort", label: "不快感", value: "discomfort" },
    { id: "comfort", label: "安堵感", value: "comfort" },
  ],
  excreteComplications: [
    { id: "skin-rash", label: "皮膚のかぶれ", value: "skin-rash" },
    { id: "redness", label: "発赤", value: "redness" },
    { id: "swelling", label: "ただれ", value: "swelling" },
    { id: "infection-signs", label: "感染症の疑い", value: "infection-signs" },
  ],
  activityTypes: [
    { id: "physical-therapy", label: "理学療法", value: "physical-therapy" },
    { id: "occupational-therapy", label: "作業療法", value: "occupational-therapy" },
    { id: "speech-therapy", label: "言語療法", value: "speech-therapy" },
    { id: "music-therapy", label: "音楽療法", value: "music-therapy" },
    { id: "art-therapy", label: "美術療法", value: "art-therapy" },
    { id: "recreation", label: "レクリエーション", value: "recreation" },
    { id: "walking", label: "歩行", value: "walking" },
    { id: "wheelchair", label: "車椅子移動", value: "wheelchair" },
    { id: "positioning", label: "ポジショニング", value: "positioning" },
    { id: "stretching", label: "ストレッチ", value: "stretching" },
  ],
  activityLevels: [
    { id: "high", label: "高い", value: "high" },
    { id: "moderate", label: "中程度", value: "moderate" },
    { id: "low", label: "低い", value: "low" },
    { id: "minimal", label: "最小限", value: "minimal" },
    { id: "none", label: "なし", value: "none" },
  ],
  activityMoods: [
    { id: "happy", label: "喜び", value: "happy" },
    { id: "calm", label: "落ち着き", value: "calm" },
    { id: "excited", label: "興奮", value: "excited" },
    { id: "anxious", label: "不安", value: "anxious" },
    { id: "sad", label: "悲しみ", value: "sad" },
    { id: "angry", label: "怒り", value: "angry" },
    { id: "neutral", label: "普通", value: "neutral" },
  ],
  activitySocialInteractions: [
    { id: "active", label: "積極的", value: "active" },
    { id: "passive", label: "受動的", value: "passive" },
    { id: "withdrawn", label: "引きこもり", value: "withdrawn" },
    { id: "cooperative", label: "協力的", value: "cooperative" },
    { id: "resistant", label: "抵抗的", value: "resistant" },
  ],
  activityFunctionalLimitations: [
    { id: "mobility", label: "移動制限", value: "mobility" },
    { id: "communication", label: "コミュニケーション制限", value: "communication" },
    { id: "cognitive", label: "認知機能制限", value: "cognitive" },
    { id: "sensory", label: "感覚機能制限", value: "sensory" },
    { id: "motor", label: "運動機能制限", value: "motor" },
    { id: "breathing", label: "呼吸機能制限", value: "breathing" },
    { id: "swallowing", label: "嚥下機能制限", value: "swallowing" },
    { id: "vision", label: "視覚制限", value: "vision" },
    { id: "hearing", label: "聴覚制限", value: "hearing" },
    { id: "balance", label: "バランス制限", value: "balance" },
  ],
  activityObservedBehaviors: [
    { id: "participation", label: "参加", value: "participation" },
    { id: "concentration", label: "集中", value: "concentration" },
    { id: "enjoyment", label: "楽しみ", value: "enjoyment" },
    { id: "fatigue", label: "疲労", value: "fatigue" },
    { id: "restlessness", label: "不穏", value: "restlessness" },
    { id: "cooperation", label: "協力", value: "cooperation" },
    { id: "resistance", label: "抵抗", value: "resistance" },
    { id: "initiative", label: "自発性", value: "initiative" },
    { id: "dependency", label: "依存", value: "dependency" },
    { id: "independence", label: "自立", value: "independence" },
  ],
  skinCareTypes: [
    { id: "cleaning", label: "清拭", value: "cleaning" },
    { id: "moisturizing", label: "保湿", value: "moisturizing" },
    { id: "massage", label: "マッサージ", value: "massage" },
    { id: "positioning", label: "体位変換", value: "positioning" },
    { id: "wound-care", label: "創傷処置", value: "wound-care" },
    { id: "pressure-relief", label: "除圧", value: "pressure-relief" },
  ],
  skinCareProducts: [
    { id: "soap", label: "石鹸", value: "soap" },
    { id: "lotion", label: "ローション", value: "lotion" },
    { id: "cream", label: "クリーム", value: "cream" },
    { id: "oil", label: "オイル", value: "oil" },
    { id: "antiseptic", label: "消毒薬", value: "antiseptic" },
    { id: "ointment", label: "軟膏", value: "ointment" },
  ],
  skinCareAreas: [
    { id: "whole-body", label: "全身", value: "whole-body" },
    { id: "face", label: "顔", value: "face" },
    { id: "hands", label: "手", value: "hands" },
    { id: "feet", label: "足", value: "feet" },
    { id: "back", label: "背中", value: "back" },
    { id: "pressure-points", label: "圧迫部位", value: "pressure-points" },
  ],
  skinObservations: [
    { id: "normal", label: "正常", value: "normal" },
    { id: "dry", label: "乾燥", value: "dry" },
    { id: "moist", label: "湿潤", value: "moist" },
    { id: "redness", label: "発赤", value: "redness" },
    { id: "swelling", label: "腫脹", value: "swelling" },
    { id: "wound", label: "創傷", value: "wound" },
    { id: "rash", label: "発疹", value: "rash" },
    { id: "pressure-sore", label: "褥瘡", value: "pressure-sore" },
    { id: "infection", label: "感染兆候", value: "infection" },
    { id: "improvement", label: "改善", value: "improvement" },
  ],
  oralCareTypes: [
    { id: "brushing", label: "歯磨き", value: "brushing" },
    { id: "rinsing", label: "うがい", value: "rinsing" },
    { id: "wiping", label: "口腔清拭", value: "wiping" },
    { id: "moisturizing", label: "保湿", value: "moisturizing" },
    { id: "suction", label: "吸引", value: "suction" },
  ],
  oralCareProducts: [
    { id: "toothbrush", label: "歯ブラシ", value: "toothbrush" },
    { id: "toothpaste", label: "歯磨き粉", value: "toothpaste" },
    { id: "mouthwash", label: "洗口液", value: "mouthwash" },
    { id: "oral-swab", label: "口腔ケアスポンジ", value: "oral-swab" },
    { id: "moisturizer", label: "保湿剤", value: "moisturizer" },
  ],
  oralObservations: [
    { id: "normal", label: "正常", value: "normal" },
    { id: "dry", label: "乾燥", value: "dry" },
    { id: "inflammation", label: "炎症", value: "inflammation" },
    { id: "bleeding", label: "出血", value: "bleeding" },
    { id: "plaque", label: "歯垢", value: "plaque" },
    { id: "bad-breath", label: "口臭", value: "bad-breath" },
    { id: "swelling", label: "腫脹", value: "swelling" },
    { id: "ulcer", label: "潰瘍", value: "ulcer" },
    { id: "improvement", label: "改善", value: "improvement" },
  ],
  tubeFeedingTypes: [
    { id: "nasogastric", label: "経鼻胃管", value: "nasogastric" },
    { id: "gastrostomy", label: "胃瘻", value: "gastrostomy" },
    { id: "jejunostomy", label: "腸瘻", value: "jejunostomy" },
  ],
  tubeFeedingAmounts: [
    { id: "50ml", label: "50ml", value: "50ml" },
    { id: "100ml", label: "100ml", value: "100ml" },
    { id: "150ml", label: "150ml", value: "150ml" },
    { id: "200ml", label: "200ml", value: "200ml" },
    { id: "250ml", label: "250ml", value: "250ml" },
    { id: "300ml", label: "300ml", value: "300ml" },
  ],
  tubeFeedingTemperatures: [
    { id: "room", label: "常温", value: "room" },
    { id: "body", label: "体温", value: "body" },
    { id: "warm", label: "温かい", value: "warm" },
  ],
  tubeFeedingMethods: [
    { id: "gravity", label: "自然滴下", value: "gravity" },
    { id: "syringe", label: "シリンジ", value: "syringe" },
    { id: "pump", label: "ポンプ", value: "pump" },
  ],
  tubeFeedingPositions: [
    { id: "sitting", label: "座位", value: "sitting" },
    { id: "semi-sitting", label: "半座位", value: "semi-sitting" },
    { id: "side-lying", label: "側臥位", value: "side-lying" },
  ],
  tubeFeedingPreTreatments: [
    { id: "position-check", label: "体位確認", value: "position-check" },
    { id: "tube-check", label: "チューブ確認", value: "tube-check" },
    { id: "residual-check", label: "残量確認", value: "residual-check" },
    { id: "temperature-check", label: "温度確認", value: "temperature-check" },
  ],
  tubeFeedingPostTreatments: [
    { id: "tube-flush", label: "チューブ洗浄", value: "tube-flush" },
    { id: "position-maintain", label: "体位保持", value: "position-maintain" },
    { id: "observation", label: "経過観察", value: "observation" },
    { id: "tube-clamp", label: "チューブクランプ", value: "tube-clamp" },
  ],
  tubeFeedingSymptoms: [
    { id: "normal", label: "正常", value: "normal" },
    { id: "nausea", label: "嘔気", value: "nausea" },
    { id: "vomiting", label: "嘔吐", value: "vomiting" },
    { id: "diarrhea", label: "下痢", value: "diarrhea" },
    { id: "constipation", label: "便秘", value: "constipation" },
    { id: "abdominal-distension", label: "腹部膨満", value: "abdominal-distension" },
    { id: "reflux", label: "逆流", value: "reflux" },
  ],
  tubeFeedingComplications: [
    { id: "tube-displacement", label: "チューブ位置異常", value: "tube-displacement" },
    { id: "tube-blockage", label: "チューブ閉塞", value: "tube-blockage" },
    { id: "aspiration", label: "誤嚥", value: "aspiration" },
    { id: "infection", label: "感染", value: "infection" },
    { id: "skin-irritation", label: "皮膚トラブル", value: "skin-irritation" },
  ],
}

export function FormOptionsManager() {
  const { toast } = useToast()
  const [formOptions, setFormOptions] = useState<FormOptionsData>(defaultFormOptions)
  const [activeTab, setActiveTab] = useState("seizure")
  const [editingField, setEditingField] = useState<string | null>(null)
  const [newOption, setNewOption] = useState({ label: "", value: "" })
  useEffect(() => {
    const savedOptions = localStorage.getItem("form-options")
    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions)
        setFormOptions({ ...defaultFormOptions, ...parsed })
      } catch (error) {
        console.error("Failed to parse saved form options:", error)
      }
    }
  }, [])

  const saveFormOptions = (newOptions: FormOptionsData) => {
    try {
      localStorage.setItem("form-options", JSON.stringify(newOptions))
      setFormOptions(newOptions)
      toast({
        variant: "default",
        title: "保存完了",
        description: "フォーム選択項目を保存しました",
      })
    } catch (error) {
      console.error("Failed to save form options:", error)
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "フォーム選択項目の保存に失敗しました",
      })
    }
  }

  const addOption = (fieldKey: keyof FormOptionsData) => {
    if (!newOption.label.trim() || !newOption.value.trim()) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "ラベルと値の両方を入力してください",
      })
      return
    }

    const newOptions = { ...formOptions }
    const newId = `custom-${Date.now()}`
    newOptions[fieldKey] = [...newOptions[fieldKey], { id: newId, label: newOption.label, value: newOption.value }]

    saveFormOptions(newOptions)
    setNewOption({ label: "", value: "" })
    setEditingField(null)
  }

  const removeOption = (fieldKey: keyof FormOptionsData, optionId: string) => {
    const newOptions = { ...formOptions }
    newOptions[fieldKey] = newOptions[fieldKey].filter((option) => option.id !== optionId)
    saveFormOptions(newOptions)
  }

  const resetToDefault = (fieldKey: keyof FormOptionsData) => {
    const newOptions = { ...formOptions }
    newOptions[fieldKey] = defaultFormOptions[fieldKey]
    saveFormOptions(newOptions)
  }

  const resetAllToDefault = () => {
    saveFormOptions(defaultFormOptions)
    toast({
      variant: "default",
      title: "リセット完了",
      description: "全ての選択項目をデフォルトに戻しました",
    })
  }

  const renderOptionsList = (fieldKey: keyof FormOptionsData, title: string) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingField(editingField === fieldKey ? null : fieldKey)}
            >
              {editingField === fieldKey ? "キャンセル" : "追加"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => resetToDefault(fieldKey)}>
              リセット
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {formOptions[fieldKey].map((option) => (
            <div key={option.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-sm">{option.label}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOption(fieldKey, option.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          ))}
        </div>

        {editingField === fieldKey && (
          <div className="space-y-2 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`${fieldKey}-label`}>表示名</Label>
                <Input
                  id={`${fieldKey}-label`}
                  value={newOption.label}
                  onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                  placeholder="例: 新しい選択肢"
                />
              </div>
              <div>
                <Label htmlFor={`${fieldKey}-value`}>値</Label>
                <Input
                  id={`${fieldKey}-value`}
                  value={newOption.value}
                  onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  placeholder="例: new-option"
                />
              </div>
            </div>
            <Button onClick={() => addOption(fieldKey)} size="sm">
              追加
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">⚙️</div>
            フォーム選択項目管理
          </div>
          <Button onClick={resetAllToDefault} variant="outline">
            全てリセット
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">各記録フォームの選択項目を編集・追加・削除できます。</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="seizure">発作</TabsTrigger>
            <TabsTrigger value="expression">表情</TabsTrigger>
            <TabsTrigger value="vitals">バイタル</TabsTrigger>
            <TabsTrigger value="hydration">水分</TabsTrigger>
            <TabsTrigger value="excrete">排泄</TabsTrigger>
            <TabsTrigger value="activity">活動</TabsTrigger>
            <TabsTrigger value="skincare">皮膚</TabsTrigger>
            <TabsTrigger value="tubefeeding">経管</TabsTrigger>
          </TabsList>

          <TabsContent value="seizure" className="space-y-4">
            {renderOptionsList("seizureTypes", "発作の種類")}
            {renderOptionsList("seizureSymptoms", "観察された症状")}
            {renderOptionsList("seizureMeasurementIssues", "測定困難な要因")}
          </TabsContent>

          <TabsContent value="expression" className="space-y-4">
            {renderOptionsList("expressionBehaviors", "観察された行動")}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            {renderOptionsList("vitalsMeasurementIssues", "測定困難な要因")}
          </TabsContent>

          <TabsContent value="hydration" className="space-y-4">
            {renderOptionsList("hydrationTypes", "水分の種類")}
            {renderOptionsList("hydrationMethods", "補給方法")}
            {renderOptionsList("hydrationTemperatures", "温度")}
            {renderOptionsList("hydrationIntakeStatus", "摂取状況")}
            {renderOptionsList("hydrationPosture", "摂取時の姿勢")}
            {renderOptionsList("hydrationReactions", "観察された反応・症状")}
            {renderOptionsList("hydrationDifficulties", "摂取困難な要因")}
          </TabsContent>

          <TabsContent value="excrete" className="space-y-4">
            {renderOptionsList("excreteTypes", "排泄の種類")}
            {renderOptionsList("excreteUrineProperties", "尿の性状")}
            {renderOptionsList("excreteStoolProperties", "便の性状")}
            {renderOptionsList("excreteAmounts", "排泄量")}
            {renderOptionsList("excreteMethods", "排泄方法")}
            {renderOptionsList("excreteAssistanceLevels", "介助レベル")}
            {renderOptionsList("excreteConditions", "排泄時の状態")}
            {renderOptionsList("excreteSymptoms", "観察された症状")}
            {renderOptionsList("excreteComplications", "合併症・問題")}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {renderOptionsList("activityTypes", "活動の種類")}
            {renderOptionsList("activityLevels", "活動レベル")}
            {renderOptionsList("activityMoods", "気分・感情")}
            {renderOptionsList("activitySocialInteractions", "社会的反応")}
            {renderOptionsList("activityFunctionalLimitations", "機能的制限")}
            {renderOptionsList("activityObservedBehaviors", "観察された行動")}
          </TabsContent>

          <TabsContent value="skincare" className="space-y-4">
            {renderOptionsList("skinCareTypes", "皮膚ケアの種類")}
            {renderOptionsList("skinCareProducts", "使用製品")}
            {renderOptionsList("skinCareAreas", "ケア部位")}
            {renderOptionsList("skinObservations", "皮膚観察項目")}
            {renderOptionsList("oralCareTypes", "口腔ケアの種類")}
            {renderOptionsList("oralCareProducts", "使用製品")}
            {renderOptionsList("oralObservations", "口腔観察項目")}
          </TabsContent>

          <TabsContent value="tubefeeding" className="space-y-4">
            {renderOptionsList("tubeFeedingTypes", "経管栄養の種類")}
            {renderOptionsList("tubeFeedingAmounts", "注入量")}
            {renderOptionsList("tubeFeedingTemperatures", "温度")}
            {renderOptionsList("tubeFeedingMethods", "注入方法")}
            {renderOptionsList("tubeFeedingPositions", "体位")}
            {renderOptionsList("tubeFeedingPreTreatments", "前処置")}
            {renderOptionsList("tubeFeedingPostTreatments", "後処置")}
            {renderOptionsList("tubeFeedingSymptoms", "観察された症状")}
            {renderOptionsList("tubeFeedingComplications", "合併症・問題")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
