export type DailyVital = {
  time: string;        // ISO文字列 "2025-10-19T08:30:00+09:00"
  hr?: number;         // 心拍
  spo2?: number;       // SpO2(%)
  rr?: number;         // 呼吸数
  temp?: number;       // 体温(°C)
  seizureCount?: number; // けいれん回数（必要に応じて追加）
  pain?: number;         // 疼痛(0-10)
};

export type DailyLog = {
  date: string;        // "2025-10-19"
  notes?: string;
  vitals: DailyVital[];
};
