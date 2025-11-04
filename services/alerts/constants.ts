// Alert thresholds (future: move to UI settings)
export const ALERT_THRESHOLDS = {
  TEMP_WARN_HIGH: 37.5,
  TEMP_CRITICAL_HIGH: 38.0,
  TEMP_WARN_LOW: 35.5,
  TEMP_CRITICAL_LOW: 35.0,
  SEIZURE_WARN: 1,
  SEIZURE_CRITICAL: 3,
  HYDRATION_WARN_RATIO: 0.7, // 70% of daily target
} as const;
