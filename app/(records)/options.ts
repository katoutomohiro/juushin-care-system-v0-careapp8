export const SEIZURE_TYPES = [
  "強直発作",
  "間代発作",
  "欠神発作",
  "焦点発作",
  "ミオクロニー",
  "ピク付き",
  "上視線",
  "その他",
] as const
export type SeizureType = (typeof SEIZURE_TYPES)[number]
