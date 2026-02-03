/**
 * TEST_USER_01 template
 * Simple test template to verify horizontal expansion capability
 */

import { CareCategory } from "./categories";
import { TemplateField } from "./schema";

export const TEST_USER_01_TEMPLATE_FIELDS: TemplateField[] = [
  {
    id: "test_posture",
    label: "姿勢",
    category: CareCategory.ACTIVITY,
    type: "select",
    options: [
      { value: "sitting", label: "座位" },
      { value: "standing", label: "立位" },
      { value: "lying", label: "臥位" },
    ],
    required: false,
    placeholder: "姿勢を選択",
    order: 0,
  },
  {
    id: "test_tension",
    label: "緊張度",
    category: CareCategory.VITAL,
    type: "select",
    options: [
      { value: "relaxed", label: "リラックス" },
      { value: "normal", label: "普通" },
      { value: "tense", label: "緊張" },
    ],
    required: false,
    placeholder: "緊張度を選択",
    order: 1,
  },
  {
    id: "test_response",
    label: "反応",
    category: CareCategory.COMMUNICATION,
    type: "textarea",
    required: false,
    placeholder: "声掛けや刺激に対する反応を記録",
    order: 2,
  },
];
