import { describe, it, expect } from "vitest"
import { formatVital, formatVitalRange, type VitalData } from "../../lib/formatVital"

describe("formatVital", () => {
  it("正常値を正しくフォーマットする", () => {
    const vital: VitalData = { value: 98.6, unit: "°F", label: "体温" }
    expect(formatVital(vital)).toBe("体温: 98.6°F")
  })

  it("null値を正しく処理する", () => {
    const vital: VitalData = { value: null, unit: "bpm", label: "心拍数" }
    expect(formatVital(vital)).toBe("心拍数: --")
  })

  it("undefined値を正しく処理する", () => {
    const vital: VitalData = { value: undefined, unit: "mmHg", label: "血圧" }
    expect(formatVital(vital)).toBe("血圧: --")
  })

  it("負の値を範囲外として処理する", () => {
    const vital: VitalData = { value: -10, unit: "°C", label: "体温" }
    expect(formatVital(vital)).toBe("体温: 範囲外")
  })

  it("無限大をエラーとして処理する", () => {
    const vital: VitalData = { value: Number.POSITIVE_INFINITY, unit: "bpm", label: "心拍数" }
    expect(formatVital(vital)).toBe("心拍数: エラー")
  })

  it("NaNをエラーとして処理する", () => {
    const vital: VitalData = { value: Number.NaN, unit: "mmHg", label: "血圧" }
    expect(formatVital(vital)).toBe("血圧: エラー")
  })

  it("最小値（0）を正しく処理する", () => {
    const vital: VitalData = { value: 0, unit: "%", label: "酸素飽和度" }
    expect(formatVital(vital)).toBe("酸素飽和度: 0%")
  })

  it("最大値を正しく処理する", () => {
    const vital: VitalData = { value: 999.9, unit: "mg/dL", label: "血糖値" }
    expect(formatVital(vital)).toBe("血糖値: 999.9mg/dL")
  })
})

describe("formatVitalRange", () => {
  it("正常範囲内の値を正しくフォーマットする", () => {
    const vital: VitalData = { value: 37.0, unit: "°C", label: "体温" }
    expect(formatVitalRange(vital, 36.0, 37.5)).toBe("体温: 37.0°C")
  })

  it("正常範囲外の値に警告を追加する", () => {
    const vital: VitalData = { value: 38.5, unit: "°C", label: "体温" }
    expect(formatVitalRange(vital, 36.0, 37.5)).toBe("体温: 38.5°C (警告: 正常範囲外)")
  })

  it("最小値未満の値に警告を追加する", () => {
    const vital: VitalData = { value: 35.0, unit: "°C", label: "体温" }
    expect(formatVitalRange(vital, 36.0, 37.5)).toBe("体温: 35.0°C (警告: 正常範囲外)")
  })

  it("null値は警告なしで処理する", () => {
    const vital: VitalData = { value: null, unit: "°C", label: "体温" }
    expect(formatVitalRange(vital, 36.0, 37.5)).toBe("体温: --")
  })
})
