import piiConfigData from '../config/pii-mask.json'

/**
 * PIIマスク設定を読み込む共通ユーティリティ
 * config/pii-mask.json を単一ソースとして使用
 */

export type PiiMaskConfig = {
  defaultMask: string[]
  categories: {
    freeText: string[]
    contact: string[]
    medical: string[]
  }
}

const piiConfig = piiConfigData as PiiMaskConfig

/**
 * デフォルトマスクフィールドを取得
 */
export function getDefaultMaskFields(): string[] {
  return [...piiConfig.defaultMask]
}

/**
 * カテゴリ別マスクフィールドを取得
 */
export function getMaskFieldsByCategory(category: keyof PiiMaskConfig['categories']): string[] {
  return [...(piiConfig.categories[category] || [])]
}

/**
 * すべてのPIIフィールドを取得
 */
export function getAllMaskFields(): string[] {
  const allFields = new Set<string>(piiConfig.defaultMask)
  Object.values(piiConfig.categories).forEach((fields: string[]) => {
    fields.forEach((f: string) => allFields.add(f))
  })
  return Array.from(allFields)
}

/**
 * カスタムマスクフィールドをデフォルトとマージ
 */
export function mergeMaskFields(customFields?: string[]): string[] {
  if (!customFields) return getDefaultMaskFields()
  const merged = new Set([...piiConfig.defaultMask, ...customFields])
  return Array.from(merged)
}
