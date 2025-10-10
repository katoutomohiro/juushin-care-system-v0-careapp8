"use client"

interface A4RecordSheetProps {
  selectedUser: string
  dailyRecords: any[]
  date?: string
}

export function A4RecordSheet({
  selectedUser,
  dailyRecords,
  date = new Date().toLocaleDateString("ja-JP"),
}: A4RecordSheetProps) {
  const vitalsRecords = dailyRecords.filter((record) => record.eventType === "vitals")
  const careRecords = dailyRecords.filter((record) => record.eventType !== "vitals")

  const translateToJapanese = (value: string | undefined): string => {
    if (!value) return ""

    const translations: { [key: string]: string } = {
      // Seizure types
      tonic: "強直性",
      clonic: "間代性",
      "tonic-clonic": "強直間代性",
      myoclonic: "ミオクロニー",
      atonic: "脱力",
      absence: "欠神",
      focal: "焦点性",
      generalized: "全般性",

      // Severity levels
      mild: "軽度",
      moderate: "中等度",
      severe: "重度",
      "very-severe": "最重度",

      // Consciousness levels
      conscious: "意識清明",
      confused: "混乱",
      unconscious: "意識不明",
      drowsy: "傾眠",
      alert: "覚醒",
      responsive: "反応あり",
      unresponsive: "反応なし",

      // Emotional states
      happy: "喜び",
      sad: "悲しみ",
      calm: "穏やか",
      agitated: "興奮",
      anxious: "不安",
      content: "満足",
      frustrated: "イライラ",
      peaceful: "平穏",
      staring: "凝視",
      interested: "興味あり",

      // Physical conditions
      normal: "正常",
      abnormal: "異常",
      stable: "安定",
      unstable: "不安定",
      improved: "改善",
      worsened: "悪化",
      unchanged: "変化なし",

      // Care methods and positions
      standard: "標準",
      modified: "修正",
      assisted: "介助",
      independent: "自立",
      full: "全介助",
      partial: "部分介助",
      minimal: "最小介助",
      supervision: "見守り",
      "as-needed": "必要時",

      // Body positions
      sitting: "座位",
      lying: "臥位",
      standing: "立位",
      "side-lying": "側臥位",
      prone: "腹臥位",
      supine: "仰臥位",
      "semi-fowler": "半座位",
      fowler: "座位",

      // Measurement sites and methods
      oral: "口腔",
      axillary: "腋窩",
      rectal: "直腸",
      tympanic: "鼓膜",
      temporal: "側頭",
      room: "室温",
      body: "体温",

      // Tube feeding specifics
      syringe: "シリンジ",
      gravity: "自然滴下",
      pump: "ポンプ",
      bolus: "ボーラス",
      continuous: "持続",
      gastrostomy: "胃瘻",
      nasogastric: "経鼻胃管",
      jejunostomy: "腸瘻",

      // Care areas
      "whole-body": "全身",
      face: "顔面",
      hands: "手",
      feet: "足",
      back: "背部",
      chest: "胸部",
      abdomen: "腹部",
      "skin-care": "皮膚ケア",
      "oral-care": "口腔ケア",

      // Activity levels
      "very-high": "非常に高い",
      high: "高い",
      medium: "中程度",
      low: "低い",
      "very-low": "非常に低い",
      none: "なし",

      // Excretion types
      urine: "尿",
      stool: "便",
      both: "両方",

      // Common medical terms
      temperature: "体温",
      "blood-pressure": "血圧",
      "heart-rate": "心拍数",
      "respiratory-rate": "呼吸数",
      "oxygen-saturation": "酸素飽和度",
      pulse: "脈拍",
      rhythm: "リズム",
      regular: "整",
      irregular: "不整",
      strong: "強",
      weak: "弱",
      rapid: "頻",
      slow: "徐",

      // Time periods
      morning: "朝",
      afternoon: "昼",
      evening: "夕",
      night: "夜",
      before: "前",
      after: "後",
      during: "中",

      // Yes/No responses
      yes: "はい",
      no: "いいえ",
      unknown: "不明",
      "not-applicable": "該当なし",
    }

    return translations[value.toLowerCase()] || value
  }

  const getLatestVitals = () => {
    if (vitalsRecords.length === 0) return null
    return vitalsRecords[vitalsRecords.length - 1]
  }

  const getCareRecordsByType = (type: string) => {
    const records = careRecords.filter((record) => {
      const eventType = record.eventType
      return eventType === type || eventType === type.replace(/-/g, "_") || eventType === type.replace(/_/g, "-")
    })
    return records
  }

  const formatRecordDetails = (record: any) => {
    const details = []

    // Seizure form details with proper Japanese labels
    if (record.type) details.push(`発作種類: ${translateToJapanese(record.type)}`)
    if (record.severity) details.push(`重症度: ${translateToJapanese(record.severity)}`)
    if (record.consciousness) details.push(`意識状態: ${translateToJapanese(record.consciousness)}`)
    if (record.skinColor) details.push(`皮膚色変化: ${translateToJapanese(record.skinColor)}`)
    if (record.muscleResponse) details.push(`筋肉反応: ${translateToJapanese(record.muscleResponse)}`)
    if (record.eyeMovement) details.push(`眼球運動: ${translateToJapanese(record.eyeMovement)}`)
    if (record.breathing) details.push(`呼吸パターン: ${translateToJapanese(record.breathing)}`)
    if (record.postSeizureState) details.push(`発作後状態: ${translateToJapanese(record.postSeizureState)}`)
    if (record.duration) details.push(`持続時間: ${record.duration}秒`)

    // Expression form details with proper Japanese labels
    if (record.expressionType) details.push(`表情種類: ${translateToJapanese(record.expressionType)}`)
    if (record.emotionalState) details.push(`感情状態: ${translateToJapanese(record.emotionalState)}`)
    if (record.eyeMovement) details.push(`眼球運動: ${translateToJapanese(record.eyeMovement)}`)
    if (record.mouthMovement) details.push(`口の動き: ${translateToJapanese(record.mouthMovement)}`)
    if (record.communicationResponse)
      details.push(`コミュニケーション反応: ${translateToJapanese(record.communicationResponse)}`)
    if (record.socialResponse) details.push(`社会的反応: ${translateToJapanese(record.socialResponse)}`)

    // Vitals form details with proper Japanese labels
    if (record.temperature) details.push(`体温: ${record.temperature}℃`)
    if (record.bloodPressureSystolic && record.bloodPressureDiastolic) {
      details.push(`血圧: ${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}mmHg`)
    }
    if (record.heartRate) details.push(`心拍数: ${record.heartRate}回/分`)
    if (record.respiratoryRate) details.push(`呼吸数: ${record.respiratoryRate}回/分`)
    if (record.oxygenSaturation) details.push(`SpO2: ${record.oxygenSaturation}%`)
    if (record.temperatureSite) details.push(`測定部位: ${translateToJapanese(record.temperatureSite)}`)
    if (record.heartRhythm) details.push(`心拍リズム: ${translateToJapanese(record.heartRhythm)}`)
    if (record.breathingPattern) details.push(`呼吸パターン: ${translateToJapanese(record.breathingPattern)}`)
    if (record.consciousnessLevel) details.push(`意識レベル: ${translateToJapanese(record.consciousnessLevel)}`)

    // Hydration form details with proper Japanese labels
    if (record.amount) details.push(`摂取量: ${record.amount}ml`)
    if (record.fluidType) details.push(`水分種類: ${translateToJapanese(record.fluidType)}`)
    if (record.method) details.push(`摂取方法: ${translateToJapanese(record.method)}`)
    if (record.temperature) details.push(`水分温度: ${translateToJapanese(record.temperature)}`)
    if (record.intakeStatus) details.push(`摂取状況: ${translateToJapanese(record.intakeStatus)}`)
    if (record.posture) details.push(`摂取時姿勢: ${translateToJapanese(record.posture)}`)
    if (record.assistanceLevel) details.push(`介助レベル: ${translateToJapanese(record.assistanceLevel)}`)

    // Excretion form details with proper Japanese labels
    if (record.excretionType) details.push(`排泄種類: ${translateToJapanese(record.excretionType)}`)
    if (record.urineCondition) details.push(`尿の性状: ${translateToJapanese(record.urineCondition)}`)
    if (record.stoolCondition) details.push(`便の性状: ${translateToJapanese(record.stoolCondition)}`)
    if (record.amount) details.push(`排泄量: ${translateToJapanese(record.amount)}`)
    if (record.excretionMethod) details.push(`排泄方法: ${translateToJapanese(record.excretionMethod)}`)
    if (record.excretionAssistance) details.push(`介助レベル: ${translateToJapanese(record.excretionAssistance)}`)
    if (record.excretionState) details.push(`排泄時状態: ${translateToJapanese(record.excretionState)}`)

    // Activity form details with proper Japanese labels
    if (record.activityType) details.push(`活動種類: ${translateToJapanese(record.activityType)}`)
    if (record.activityCategory) details.push(`活動カテゴリー: ${translateToJapanese(record.activityCategory)}`)
    if (record.participationLevel) details.push(`参加レベル: ${translateToJapanese(record.participationLevel)}`)
    if (record.supportNeeded) details.push(`必要な支援: ${translateToJapanese(record.supportNeeded)}`)
    if (record.physicalFunction) details.push(`身体機能: ${translateToJapanese(record.physicalFunction)}`)
    if (record.cognitiveFunction) details.push(`認知機能: ${translateToJapanese(record.cognitiveFunction)}`)
    if (record.emotionalState) details.push(`感情状態: ${translateToJapanese(record.emotionalState)}`)
    if (record.enjoymentLevel) details.push(`楽しさ・満足度: ${translateToJapanese(record.enjoymentLevel)}`)

    // Skin/Oral care form details with proper Japanese labels
    if (record.careArea) details.push(`ケア部位: ${translateToJapanese(record.careArea)}`)
    if (record.skinCondition) details.push(`皮膚状態: ${translateToJapanese(record.skinCondition)}`)
    if (record.skinProblem) details.push(`皮膚の問題: ${translateToJapanese(record.skinProblem)}`)
    if (record.oralCondition) details.push(`口腔状態: ${translateToJapanese(record.oralCondition)}`)
    if (record.oralProblem) details.push(`口腔の問題: ${translateToJapanese(record.oralProblem)}`)
    if (record.careMethod) details.push(`ケア方法: ${translateToJapanese(record.careMethod)}`)
    if (record.careFrequency) details.push(`ケア頻度: ${translateToJapanese(record.careFrequency)}`)

    // Tube feeding form details with proper Japanese labels
    if (record.nutritionType) details.push(`栄養剤種類: ${translateToJapanese(record.nutritionType)}`)
    if (record.tubeType) details.push(`チューブ種類: ${translateToJapanese(record.tubeType)}`)
    if (record.patientPosition) details.push(`患者体位: ${translateToJapanese(record.patientPosition)}`)
    if (record.infusionRate) details.push(`注入速度: ${translateToJapanese(record.infusionRate)}`)
    if (record.nutritionTemperature) details.push(`栄養剤温度: ${translateToJapanese(record.nutritionTemperature)}`)
    if (record.infusionMethod) details.push(`注入方法: ${translateToJapanese(record.infusionMethod)}`)

    // Respiratory management form details
    if (record.airwayManagement) details.push(`気道管理: ${translateToJapanese(record.airwayManagement)}`)
    if (record.ventilatorSettings) details.push(`人工呼吸器設定: ${record.ventilatorSettings}`)
    if (record.oxygenTherapy) details.push(`酸素療法: ${translateToJapanese(record.oxygenTherapy)}`)
    if (record.respiratoryStatus) details.push(`呼吸状態: ${translateToJapanese(record.respiratoryStatus)}`)
    if (record.secretionManagement) details.push(`分泌物管理: ${translateToJapanese(record.secretionManagement)}`)

    // Positioning management form details
    if (record.currentPosition) details.push(`現在の体位: ${translateToJapanese(record.currentPosition)}`)
    if (record.positionDuration) details.push(`体位保持時間: ${record.positionDuration}分`)
    if (record.nextPosition) details.push(`次回体位: ${translateToJapanese(record.nextPosition)}`)
    if (record.supportDevices) details.push(`支援用具: ${translateToJapanese(record.supportDevices)}`)
    if (record.comfortLevel) details.push(`快適度: ${translateToJapanese(record.comfortLevel)}`)

    // Swallowing management form details
    if (record.mealType) details.push(`食事種類: ${translateToJapanese(record.mealType)}`)
    if (record.foodTexture) details.push(`食事形態: ${translateToJapanese(record.foodTexture)}`)
    if (record.liquidConsistency) details.push(`水分とろみ: ${translateToJapanese(record.liquidConsistency)}`)
    if (record.feedingMethod) details.push(`摂取方法: ${translateToJapanese(record.feedingMethod)}`)
    if (record.swallowingFunction) details.push(`嚥下機能: ${translateToJapanese(record.swallowingFunction)}`)
    if (record.aspirationRisk) details.push(`誤嚥リスク: ${translateToJapanese(record.aspirationRisk)}`)
    if (record.intakeAmount) details.push(`摂取量: ${record.intakeAmount}%`)

    // Infection prevention form details
    if (record.bodyTemperature) details.push(`体温: ${record.bodyTemperature}℃`)
    if (record.infectionSigns) details.push(`感染兆候: ${translateToJapanese(record.infectionSigns)}`)
    if (record.handHygiene) details.push(`手指衛生: ${translateToJapanese(record.handHygiene)}`)
    if (record.environmentalCleaning) details.push(`環境整備: ${translateToJapanese(record.environmentalCleaning)}`)
    if (record.personalProtectiveEquipment)
      details.push(`個人防護具: ${translateToJapanese(record.personalProtectiveEquipment)}`)
    if (record.preventiveMeasures) details.push(`予防策: ${translateToJapanese(record.preventiveMeasures)}`)

    // Communication support form details
    if (record.communicationMethod)
      details.push(`コミュニケーション方法: ${translateToJapanese(record.communicationMethod)}`)
    if (record.responseLevel) details.push(`反応レベル: ${translateToJapanese(record.responseLevel)}`)
    if (record.understandingLevel) details.push(`理解度: ${record.understandingLevel}%`)
    if (record.assistiveDevice) details.push(`支援機器: ${translateToJapanese(record.assistiveDevice)}`)
    if (record.emotionalExpression) details.push(`感情表現: ${translateToJapanese(record.emotionalExpression)}`)
    if (record.socialInteraction) details.push(`社会的相互作用: ${translateToJapanese(record.socialInteraction)}`)
    if (record.effectiveness) details.push(`効果度: ${record.effectiveness}%`)

    // Add array fields (checkboxes) with proper Japanese labels
    if (record.observedSymptoms && Array.isArray(record.observedSymptoms) && record.observedSymptoms.length > 0) {
      details.push(`観察された症状: ${record.observedSymptoms.map(translateToJapanese).join("、")}`)
    }
    if (record.observedBehaviors && Array.isArray(record.observedBehaviors) && record.observedBehaviors.length > 0) {
      details.push(`観察された行動: ${record.observedBehaviors.map(translateToJapanese).join("、")}`)
    }
    if (
      record.measurementDifficulties &&
      Array.isArray(record.measurementDifficulties) &&
      record.measurementDifficulties.length > 0
    ) {
      details.push(`測定困難な要因: ${record.measurementDifficulties.map(translateToJapanese).join("、")}`)
    }
    if (record.observedReactions && Array.isArray(record.observedReactions) && record.observedReactions.length > 0) {
      details.push(`観察された反応・症状: ${record.observedReactions.map(translateToJapanese).join("、")}`)
    }
    if (record.intakeDifficulties && Array.isArray(record.intakeDifficulties) && record.intakeDifficulties.length > 0) {
      details.push(`摂取困難な要因: ${record.intakeDifficulties.map(translateToJapanese).join("、")}`)
    }
    if (record.complications && Array.isArray(record.complications) && record.complications.length > 0) {
      details.push(`合併症・問題: ${record.complications.map(translateToJapanese).join("、")}`)
    }
    if (
      record.functionalLimitations &&
      Array.isArray(record.functionalLimitations) &&
      record.functionalLimitations.length > 0
    ) {
      details.push(`機能的制限: ${record.functionalLimitations.map(translateToJapanese).join("、")}`)
    }
    if (record.skinObservations && Array.isArray(record.skinObservations) && record.skinObservations.length > 0) {
      details.push(`皮膚観察項目: ${record.skinObservations.map(translateToJapanese).join("、")}`)
    }
    if (record.oralObservations && Array.isArray(record.oralObservations) && record.oralObservations.length > 0) {
      details.push(`口腔観察項目: ${record.oralObservations.map(translateToJapanese).join("、")}`)
    }
    if (record.preCare && Array.isArray(record.preCare) && record.preCare.length > 0) {
      details.push(`前処置: ${record.preCare.map(translateToJapanese).join("、")}`)
    }
    if (record.postCare && Array.isArray(record.postCare) && record.postCare.length > 0) {
      details.push(`後処置: ${record.postCare.map(translateToJapanese).join("、")}`)
    }

    // Add notes if available
    if (record.notes) details.push(`備考: ${record.notes}`)
    if (record.triggers) details.push(`誘因・きっかけ: ${record.triggers}`)
    if (record.response) details.push(`対応・処置: ${record.response}`)

    return details.join(" / ")
  }

  const latestVitals = getLatestVitals()

  return (
    <div className="w-full max-w-[210mm] mx-auto bg-white text-black print:shadow-none shadow-lg">
      <div className="min-h-[297mm] p-6 font-sans text-sm leading-tight">
        <div className="border-2 border-foreground mb-4">
          <div className="bg-muted p-2 border-b border-foreground">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">重症心身障害児者記録</div>
              <div className="text-right">
                <div className="text-base font-semibold">
                  令和 {new Date().getFullYear() - 2018} 年 {new Date().getMonth() + 1} 月 {new Date().getDate()} 日
                </div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="flex justify-between">
              <div className="text-lg font-bold">利用者名: {selectedUser}</div>
              <div className="text-base">記録日: {date}</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-primary text-primary-foreground p-2 text-center font-bold mb-2">バイタルサイン</div>
          <table className="w-full border-collapse border border-foreground">
            <thead>
              <tr className="bg-muted">
                <th className="border border-foreground p-2 text-left">項目</th>
                <th className="border border-foreground p-2 text-center">朝</th>
                <th className="border border-foreground p-2 text-center">昼</th>
                <th className="border border-foreground p-2 text-center">夕</th>
                <th className="border border-foreground p-2 text-center">備考</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-foreground p-2 font-medium">体温 (℃)</td>
                <td className="border border-foreground p-2 text-center">{latestVitals?.temperature || ""}</td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-xs">
                  {translateToJapanese(latestVitals?.temperatureSite) || ""}
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-foreground p-2 font-medium">血圧 (mmHg)</td>
                <td className="border border-foreground p-2 text-center">
                  {latestVitals?.bloodPressureSystolic && latestVitals?.bloodPressureDiastolic
                    ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`
                    : ""}
                </td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-xs">
                  {translateToJapanese(latestVitals?.bloodPressureSite) || ""}
                </td>
              </tr>
              <tr>
                <td className="border border-foreground p-2 font-medium">脈拍 (回/分)</td>
                <td className="border border-foreground p-2 text-center">{latestVitals?.heartRate || ""}</td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-xs">
                  {translateToJapanese(latestVitals?.heartRhythm) || ""}
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="border border-foreground p-2 font-medium">呼吸数 (回/分)</td>
                <td className="border border-foreground p-2 text-center">{latestVitals?.respiratoryRate || ""}</td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-xs">
                  {translateToJapanese(latestVitals?.breathingPattern) || ""}
                </td>
              </tr>
              <tr>
                <td className="border border-foreground p-2 font-medium">SpO2 (%)</td>
                <td className="border border-foreground p-2 text-center">{latestVitals?.oxygenSaturation || ""}</td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-center"></td>
                <td className="border border-foreground p-2 text-xs">
                  {translateToJapanese(latestVitals?.oxygenLevel) || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <div className="bg-secondary text-secondary-foreground p-2 text-center font-bold mb-2">ケア記録</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">水分摂取</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("hydration").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {record.amount || "記録"}ml (
                      {translateToJapanese(record.fluidType) || translateToJapanese(record.type) || "水分"})
                      {record.method && (
                        <div className="ml-2 text-gray-600">方法: {translateToJapanese(record.method)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">排泄</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("excretion").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} -{" "}
                      {translateToJapanese(record.excretionType) || translateToJapanese(record.type) || "排泄"}
                      {record.amount && (
                        <div className="ml-2 text-gray-600">量: {translateToJapanese(record.amount)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">活動</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("activity").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} -{" "}
                      {translateToJapanese(record.activityType) || translateToJapanese(record.type) || "活動"}
                      {record.participationLevel && (
                        <div className="ml-2 text-gray-600">参加: {translateToJapanese(record.participationLevel)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">皮膚・口腔ケア</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("skin-oral-care")
                    .concat(getCareRecordsByType("skin_oral_care"))
                    .map((record, index) => (
                      <div key={index} className="text-xs mb-1">
                        ✓ {record.time} -{" "}
                        {translateToJapanese(record.careType) || translateToJapanese(record.type) || "ケア"}
                        {record.careArea && (
                          <div className="ml-2 text-gray-600">部位: {translateToJapanese(record.careArea)}</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">経管栄養</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("tube-feeding")
                    .concat(getCareRecordsByType("tube_feeding"))
                    .map((record, index) => (
                      <div key={index} className="text-xs mb-1">
                        ✓ {record.time} - {record.amount || "記録"}ml
                        {record.nutritionType && (
                          <div className="ml-2 text-gray-600">種類: {translateToJapanese(record.nutritionType)}</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">発作記録</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("seizure").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {translateToJapanese(record.type)} ({record.duration}秒)
                      {record.severity && (
                        <div className="ml-2 text-gray-600">重症度: {translateToJapanese(record.severity)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">表情・反応</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("expression").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time || record.timestamp?.slice(11, 16)} -{" "}
                      {translateToJapanese(record.expressionType) || translateToJapanese(record.type) || "表情記録"}
                      {record.emotionalState && (
                        <div className="ml-2 text-gray-600">感情: {translateToJapanese(record.emotionalState)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">バイタルサイン</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("vitals").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - 測定完了
                      {record.measurementCondition && (
                        <div className="ml-2 text-gray-600">
                          状態: {translateToJapanese(record.measurementCondition)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">呼吸管理</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("respiratory").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {translateToJapanese(record.airwayManagement) || "呼吸管理"}
                      {record.oxygenTherapy && (
                        <div className="ml-2 text-gray-600">酸素: {translateToJapanese(record.oxygenTherapy)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">体位変換・姿勢管理</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("positioning").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {translateToJapanese(record.currentPosition) || "体位変換"}
                      {record.positionDuration && (
                        <div className="ml-2 text-gray-600">時間: {record.positionDuration}分</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">摂食嚥下管理</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("swallowing").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {translateToJapanese(record.mealType) || "摂食嚥下"}
                      {record.intakeAmount && <div className="ml-2 text-gray-600">摂取: {record.intakeAmount}%</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">感染予防管理</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("infection-prevention").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {translateToJapanese(record.infectionSigns) || "感染予防"}
                      {record.bodyTemperature && (
                        <div className="ml-2 text-gray-600">体温: {record.bodyTemperature}℃</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="border border-foreground">
                <div className="bg-muted p-2 font-bold text-center">コミュニケーション支援</div>
                <div className="p-3 min-h-[80px]">
                  {getCareRecordsByType("communication").map((record, index) => (
                    <div key={index} className="text-xs mb-1">
                      ✓ {record.time} - {translateToJapanese(record.communicationMethod) || "コミュニケーション"}
                      {record.effectiveness && <div className="ml-2 text-gray-600">効果: {record.effectiveness}%</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-accent text-accent-foreground p-2 text-center font-bold mb-2">詳細観察記録</div>
          <div className="border border-foreground">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-foreground p-1 w-16">時刻</th>
                  <th className="border border-foreground p-1 w-20">種類</th>
                  <th className="border border-foreground p-1">詳細内容</th>
                </tr>
              </thead>
              <tbody>
                {careRecords.length > 0 ? (
                  careRecords.map((record, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                      <td className="border border-foreground p-1 text-center font-mono">
                        {record.time || record.timestamp?.slice(11, 16)}
                      </td>
                      <td className="border border-foreground p-1 text-center font-medium">
                        {record.eventType === "seizure" && "発作"}
                        {record.eventType === "expression" && "表情"}
                        {record.eventType === "vitals" && "バイタル"}
                        {record.eventType === "hydration" && "水分"}
                        {record.eventType === "excretion" && "排泄"}
                        {record.eventType === "activity" && "活動"}
                        {(record.eventType === "skin-oral-care" || record.eventType === "skin_oral_care") && "皮膚ケア"}
                        {(record.eventType === "tube-feeding" || record.eventType === "tube_feeding") && "経管栄養"}
                        {record.eventType === "respiratory" && "呼吸管理"}
                        {record.eventType === "positioning" && "体位変換"}
                        {record.eventType === "swallowing" && "摂食嚥下"}
                        {record.eventType === "infection-prevention" && "感染予防"}
                        {record.eventType === "communication" && "コミュニケーション"}
                      </td>
                      <td className="border border-foreground p-1 leading-relaxed">{formatRecordDetails(record)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="border border-foreground p-4 text-center text-muted-foreground">
                      記録データがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="bg-primary text-primary-foreground p-2 text-center font-bold mb-2">職員記録</div>
            <div className="border border-foreground p-3 min-h-[100px]">
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">担当職員:</div>
                <div className="border-b border-foreground pb-1 mb-3"></div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">特記事項:</div>
                <div className="border-b border-foreground pb-1 mb-3"></div>
                <div className="border-b border-foreground pb-1 mb-3"></div>
                <div className="border-b border-foreground pb-1"></div>
              </div>
            </div>
          </div>
          <div>
            <div className="bg-secondary text-secondary-foreground p-2 text-center font-bold mb-2">家族確認欄</div>
            <div className="border border-foreground p-3 min-h-[100px]">
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">確認者氏名:</div>
                <div className="border-b border-foreground pb-1 mb-3"></div>
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">署名:</div>
                <div className="border-b border-foreground pb-1 mb-3"></div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">日付:</div>
                <div className="border-b border-foreground pb-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-foreground pt-2 text-xs text-center text-muted-foreground">
          ※この記録用紙は重症心身障害児者の日常ケアを記録するものです。異常時は速やかに医師・看護師に報告してください。
        </div>
      </div>
    </div>
  )
}
