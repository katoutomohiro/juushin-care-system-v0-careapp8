/**
 * A・Tさん専用ケース記録テンプレート
 * 生活介護A4用紙レイアウトに対応
 */

export const AT_USER_ID = "A・T"

export interface ATCaseRecord {
  date: string // YYYY-MM-DD
  mainStaff?: string // 担当①
  subStaff?: string // 担当②
  serviceStartTime?: string // HH:mm
  serviceEndTime?: string // HH:mm
  pickupArrive?: string // 迎え着 時刻
  officeArrive?: string // 事業所着 時刻
  officeDeparture?: string // 事業所発 時刻
  dropoffArrive?: string // 送り着 時刻

  // バイタル（体温）
  bodyTemperatures: number[] // 最大4枠

  // 水分補給
  hydrations: Array<{ type: string; amount?: number }> // 最大4枠

  // 排尿・排便 (2行×3列)
  excretions: Array<{
    urinationCount?: number
    defecationStatus?: string
  }> // 最大6枠

  // 昼食
  lunch: {
    mainFoodRatio?: number // %
    sideDishRatio?: number // %
    medicationTime?: string // HH:mm
    oralCarePerformed?: boolean
  }

  // 間食
  snack: {
    mainFoodRatio?: number // %
    sideDishRatio?: number // %
    medicationTime?: string // HH:mm
    oralCarePerformed?: boolean
  }

  // 入浴
  bathing?: string // "入浴" | "清拭" | "なし" など

  // 課題①：ストレッチ・マッサージ
  stretch?: {
    upperLimb?: boolean
    lowerLimb?: boolean
    shoulder?: boolean
    waist?: boolean
    hipJoint?: boolean
    notes?: string
  }

  // 課題②：立ち上がり訓練
  standup?: {
    count?: number
    notes?: string
  }

  // 課題③：意思疎通
  communication?: {
    supported?: boolean
    notes?: string
  }

  // 特記事項
  remarks?: string

  // 活動
  activity?: string

  // 身体拘束(車いす)
  restraint?: {
    table?: boolean
    chestBelt?: boolean
  }
}

/**
 * A.Tテンプレートのデフォルト値
 */
export function createEmptyATCaseRecord(date: string): ATCaseRecord {
  return {
    date,
    mainStaff: undefined,
    subStaff: undefined,
    serviceStartTime: undefined,
    serviceEndTime: undefined,
    pickupArrive: undefined,
    officeArrive: undefined,
    officeDeparture: undefined,
    dropoffArrive: undefined,
    bodyTemperatures: [],
    hydrations: [],
    excretions: Array(6).fill({ urinationCount: undefined, defecationStatus: undefined }),
    lunch: {},
    snack: {},
    bathing: undefined,
    stretch: {},
    standup: {},
    communication: {},
    remarks: undefined,
    activity: undefined,
    restraint: {},
  }
}

/**
 * 入力項目のメタデータ（UI生成用）
 */
export const AT_FORM_METADATA = {
  hydrationTypes: ["お茶", "白湯", "ポカリ", "その他"],
  baths: ["入浴", "清拭", "シャワー", "なし"],
  defecationStatuses: ["便秘", "普通", "軟便", "下痢"],
  staffOptions: [
    { label: "職員①", value: "staff1" },
    { label: "職員②", value: "staff2" },
    { label: "職員③", value: "staff3" },
  ],
}
