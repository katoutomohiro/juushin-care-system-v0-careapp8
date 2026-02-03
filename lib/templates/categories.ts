/**
 * Care record template categories
 * These are fixed categories for organizing care record fields
 */

export enum CareCategory {
  BASIC = "basic",
  VITAL = "vital",
  HYDRATION = "hydration",
  MEAL = "meal",
  EXCRETION = "excretion",
  BATHING = "bathing",
  REHAB = "rehab",
  COMMUNICATION = "communication",
  ACTIVITY = "activity",
  RESTRAINT = "restraint",
  NOTES = "notes",
}

export const CATEGORY_LABELS: Record<CareCategory, string> = {
  [CareCategory.BASIC]: "基本情報",
  [CareCategory.VITAL]: "バイタル",
  [CareCategory.HYDRATION]: "水分補給",
  [CareCategory.MEAL]: "食事/内服/口腔ケア",
  [CareCategory.EXCRETION]: "排泄",
  [CareCategory.BATHING]: "入浴",
  [CareCategory.REHAB]: "リハ/課題",
  [CareCategory.COMMUNICATION]: "意思疎通",
  [CareCategory.ACTIVITY]: "活動",
  [CareCategory.RESTRAINT]: "身体拘束",
  [CareCategory.NOTES]: "特記",
};

export const CATEGORY_ORDER = [
  CareCategory.BASIC,
  CareCategory.VITAL,
  CareCategory.HYDRATION,
  CareCategory.MEAL,
  CareCategory.EXCRETION,
  CareCategory.BATHING,
  CareCategory.REHAB,
  CareCategory.COMMUNICATION,
  CareCategory.ACTIVITY,
  CareCategory.RESTRAINT,
  CareCategory.NOTES,
];
