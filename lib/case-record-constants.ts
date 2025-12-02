// A・T ケース記録用のサービス提供時間選択肢
// 将来的には設定画面から編集可能にする想定
export const AT_SERVICE_TIME_OPTIONS = [
  "9:30〜16:00",
  "9:00〜16:00",
  "10:00〜16:00",
  "10:00〜15:30",
  "ショート（午前）",
  "ショート（午後）",
] as const

export type ATServiceTimeOption = (typeof AT_SERVICE_TIME_OPTIONS)[number]

// サービスID ↔ 画面表示ラベル
export const SERVICE_LABELS: Record<string, string> = {
  "life-care": "生活介護",
}

// TODO: 職員マスタ連携後に置き換える。A・T さん担当の暫定ハードコード
export const AT_STAFF_FALLBACK_OPTIONS: { id: string; name: string }[] = [
  { id: "staff-01", name: "佐藤" },
  { id: "staff-02", name: "鈴木" },
  { id: "staff-03", name: "田中" },
]

export const SERVICE_TIME_CANDIDATES = ["09:00", "09:30", "10:00", "15:30", "16:00", "16:30", "17:00"] as const
export const HYDRATION_TYPES = ["お茶", "白湯", "ポカリ", "水", "その他"] as const
export const EXCRETION_AMOUNT_OPTIONS = ["なし", "少量", "普通", "多い"] as const
export const STOOL_QUALITY_OPTIONS = ["硬い", "普通", "軟便", "下痢", "その他"] as const
export const MEAL_RATIO_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export const BATHING_DONE_OPTIONS = ["入浴", "清拭", "なし"] as const
export const COMMUNICATION_REACTION_LEVELS = ["反応なし", "少し反応あり", "よく反応あり"] as const
export const RESTRAINT_USED_OPTIONS = ["使用なし", "使用あり"] as const
export const TOTAL_SERVICE_TIME_OPTIONS = ["〜1時間", "1〜2時間", "2〜4時間", "4〜6時間", "6時間以上"] as const
