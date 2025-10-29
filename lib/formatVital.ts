export interface VitalData {
  value: number | null | undefined
  unit: string
  label: string
}

export function formatVital(vital: VitalData): string {
  const { value, unit, label } = vital
  if (value === null || value === undefined) {
    return `${label}: --`
  }

  if (typeof value !== "number" || !isFinite(value) || Number.isNaN(value)) {
    return `${label}: エラー`
  }

  if (value < 0) {
    return `${label}: 範囲外`
  }

  const needsOneDecimal = unit === "°C" || unit === "°F"
  const numStr = needsOneDecimal ? value.toFixed(1) : Number.isInteger(value) ? String(value) : String(value)
  return `${label}: ${numStr}${unit}`
}

export function formatVitalRange(vital: VitalData, min: number, max: number): string {
  const formatted = formatVital(vital)

  if (vital.value === null || vital.value === undefined) {
    return formatted
  }

  if (vital.value < min || vital.value > max) {
    return `${formatted} (警告: 正常範囲外)`
  }

  return formatted
}
