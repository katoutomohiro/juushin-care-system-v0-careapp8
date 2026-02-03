/**
 * AT-specific care record template
 * Based on AT記録用紙（Excel） - 重心ケア支援アプリ
 *
 * カテゴリ順序：
 * 1. 基本情報（日付、時間帯、スタッフ）
 * 2. バイタル（体温、血圧、脈拍）
 * 3. 水分補給
 * 4. 排泄
 * 5. 入浴
 * 6. ストレッチ・マッサージ（AT独自）
 * 7. リハ/課題①②③（AT独自）
 * 8. 意思疎通（カード、声掛け反応など）
 * 9. 活動内容
 * 10. 身体拘束（有/無）
 * 11. 特記事項
 */

import { CareCategory } from "./categories";
import { TemplateField } from "./schema";

export const AT_TEMPLATE_FIELDS: TemplateField[] = [
  // ============================================
  // ストレッチ・マッサージ（AT独自項目）
  // ============================================
  {
    id: "at_stretch_massage",
    label: "ストレッチ・マッサージ",
    category: CareCategory.REHAB,
    type: "textarea",
    required: false,
    placeholder: "実施内容：部位・時間・スタッフなど",
    order: 0,
  },

  // ============================================
  // 課題①：側弯・拘縮予防
  // ============================================
  {
    id: "at_challenge1_title",
    label: "課題①【側弯・拘縮予防】",
    category: CareCategory.REHAB,
    type: "text",
    required: false,
    placeholder: "固定的な項目",
    order: 1,
  },
  {
    id: "at_challenge1_details",
    label: "実施内容",
    category: CareCategory.REHAB,
    type: "textarea",
    required: false,
    placeholder: "リハビリ対象部位（上肢・下肢・肩・腰・股関節）、実施内容など",
    order: 2,
  },

  // ============================================
  // 課題②：下肢の機能低下を防止する
  // ============================================
  {
    id: "at_challenge2_title",
    label: "課題②【下肢機能低下防止】",
    category: CareCategory.REHAB,
    type: "text",
    required: false,
    placeholder: "固定的な項目",
    order: 3,
  },
  {
    id: "at_challenge2_standing_count",
    label: "立ち上がり訓練（回数）",
    category: CareCategory.REHAB,
    type: "number",
    required: false,
    unit: "回",
    placeholder: "0",
    order: 4,
  },
  {
    id: "at_challenge2_details",
    label: "実施内容",
    category: CareCategory.REHAB,
    type: "textarea",
    required: false,
    placeholder: "訓練内容、様子、スタッフなど",
    order: 5,
  },

  // ============================================
  // 課題③：意思疎通・コミュニケーション
  // ============================================
  {
    id: "at_challenge3_title",
    label: "課題③【意思疎通】",
    category: CareCategory.COMMUNICATION,
    type: "text",
    required: false,
    placeholder: "固定的な項目",
    order: 1,
  },
  {
    id: "at_challenge3_communication",
    label: "コミュニケーション方法",
    category: CareCategory.COMMUNICATION,
    type: "checkbox",
    required: false,
    options: [
      { value: "voice", label: "声掛け反応" },
      { value: "card", label: "カード" },
      { value: "eye_contact", label: "視線接触" },
      { value: "toilet_guidance", label: "トイレ誘導" },
      { value: "sign", label: "身振り" },
      { value: "other", label: "その他" },
    ],
    order: 2,
  },
  {
    id: "at_challenge3_details",
    label: "実施内容・様子",
    category: CareCategory.COMMUNICATION,
    type: "textarea",
    required: false,
    placeholder: "意思疎通の様子、反応など",
    order: 3,
  },

  // ============================================
  // 活動等（AT独自項目）
  // ============================================
  {
    id: "at_activity_content",
    label: "活動等の内容",
    category: CareCategory.ACTIVITY,
    type: "textarea",
    required: false,
    placeholder: "本日の活動内容（時間帯、内容、スタッフなど）",
    order: 1,
  },

  // ============================================
  // 身体拘束（AT独自項目）
  // ============================================
  {
    id: "at_restraint_status",
    label: "身体拘束",
    category: CareCategory.RESTRAINT,
    type: "select",
    required: false,
    options: [
      { value: "none", label: "無" },
      { value: "wheelchair", label: "有（車いす）" },
      { value: "table", label: "有（テーブル）" },
      { value: "chestbelt", label: "有（胸ベルト）" },
      { value: "other", label: "有（その他）" },
    ],
    order: 1,
  },
  {
    id: "at_restraint_reason",
    label: "身体拘束の理由（実施した場合）",
    category: CareCategory.RESTRAINT,
    type: "textarea",
    required: false,
    placeholder: "実施理由、保護者への説明内容など",
    order: 2,
  },

  // ============================================
  // 特記事項（AT独自項目）
  // ============================================
  {
    id: "at_special_notes",
    label: "特記事項",
    category: CareCategory.NOTES,
    type: "textarea",
    required: false,
    placeholder: "スキントラブル、体調変化、気づき、転倒防止対策など",
    order: 1,
  },
];

