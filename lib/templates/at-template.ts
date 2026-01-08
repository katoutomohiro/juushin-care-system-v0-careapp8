/**
 * AT-specific care record template
 * Based on the AT care record sheet (Excel)
 */

import { CareCategory } from "./categories";
import { TemplateField } from "./schema";

export const AT_TEMPLATE_FIELDS: TemplateField[] = [
  // 課題①【側弯・拘縮予防】
  {
    id: "at_rehab1_stretch_targets",
    label: "リハビリ対象部位",
    category: CareCategory.REHAB,
    type: "checkbox",
    required: false,
    options: [
      { value: "upper_limbs", label: "上肢" },
      { value: "lower_limbs", label: "下肢" },
      { value: "shoulder", label: "肩" },
      { value: "waist", label: "腰" },
      { value: "hip", label: "股関節" },
    ],
    order: 1,
  },
  {
    id: "at_rehab1_notes",
    label: "課題①の様子",
    category: CareCategory.REHAB,
    type: "textarea",
    required: false,
    placeholder: "側弯・拘縮予防の様子を記入",
    order: 2,
  },

  // 課題②【下肢の機能低下を防止する】
  {
    id: "at_rehab2_standing_count",
    label: "立ち上がり訓練",
    category: CareCategory.REHAB,
    type: "number",
    required: false,
    unit: "回",
    placeholder: "0",
    order: 3,
  },
  {
    id: "at_rehab2_notes",
    label: "課題②の様子",
    category: CareCategory.REHAB,
    type: "textarea",
    required: false,
    placeholder: "下肢の機能低下防止の様子を記入",
    order: 4,
  },

  // 課題③【意思疎通】
  {
    id: "at_comm_notes",
    label: "コミュニケーション",
    category: CareCategory.COMMUNICATION,
    type: "textarea",
    required: false,
    placeholder: "カード/声掛け反応/トイレ誘導など",
    order: 1,
  },

  // 活動
  {
    id: "at_activity_content",
    label: "活動内容",
    category: CareCategory.ACTIVITY,
    type: "textarea",
    required: false,
    placeholder: "本日の活動内容を記入",
    order: 1,
  },

  // 身体拘束
  {
    id: "at_restraint_wheelchair",
    label: "身体拘束（車いす）",
    category: CareCategory.RESTRAINT,
    type: "checkbox",
    required: false,
    options: [{ value: "yes", label: "実施" }],
    order: 1,
  },
  {
    id: "at_restraint_table",
    label: "テーブル",
    category: CareCategory.RESTRAINT,
    type: "checkbox",
    required: false,
    options: [{ value: "yes", label: "実施" }],
    order: 2,
  },
  {
    id: "at_restraint_chestbelt",
    label: "胸ベルト",
    category: CareCategory.RESTRAINT,
    type: "checkbox",
    required: false,
    options: [{ value: "yes", label: "実施" }],
    order: 3,
  },

  // 特記
  {
    id: "at_special_notes",
    label: "特記事項",
    category: CareCategory.NOTES,
    type: "textarea",
    required: false,
    placeholder: "スキントラブル/体調変化など",
    order: 1,
  },
];
