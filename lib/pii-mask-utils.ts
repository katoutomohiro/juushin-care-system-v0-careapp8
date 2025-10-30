import piiConfigData from '../config/pii-mask.json'

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
 * Get default PII mask fields
 */
export function getDefaultMaskFields(): string[] {
  return [...piiConfig.defaultMask]
}

/**
 * Get PII mask fields by category
 */
export function getMaskFieldsByCategory(category: keyof PiiMaskConfig['categories']): string[] {
  return [...piiConfig.categories[category]]
}

/**
 * Get all PII mask fields from all categories
 */
export function getAllMaskFields(): string[] {
  const allFields = [
    ...piiConfig.defaultMask,
    ...piiConfig.categories.freeText,
    ...piiConfig.categories.contact,
    ...piiConfig.categories.medical,
  ]
  // De-duplicate
  return [...new Set(allFields)]
}

/**
 * Merge custom fields with default mask fields
 */
export function mergeMaskFields(customFields: string[] = []): string[] {
  const merged = [...piiConfig.defaultMask, ...customFields]
  // De-duplicate
  return [...new Set(merged)]
}
