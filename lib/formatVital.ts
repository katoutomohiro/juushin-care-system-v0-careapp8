export interface VitalData {
  value: number | null | undefined
  unit: string
  label: string
}

export function formatVital(vital: VitalData): string {
  if (vital.value === null || vital.value === undefined) {
    return `${vital.label}: --`
  }

  if (typeof vital.value !== "number" || !isFinite(vital.value)) {
    return `${vital.label}: エラー`
  }

  if (vital.value < 0) {
    return `${vital.label}: 範囲外`
  }

  return `${vital.label}: ${vital.value}${vital.unit}`
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
