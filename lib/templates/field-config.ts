/**
 * Common fields configuration for all care receivers
 * 全利用者共通フィールド定義
 */

import { TemplateField } from "./schema"

/**
 * Common fields used across all care receivers
 * These represent standard care record items applicable to everyone
 */
export const COMMON_FIELDS: TemplateField[] = [
  // Note: Date, time, and staff fields are handled separately in HeaderFields component
  // specialNotes and familyNotes are in NotesSection component
  // This array is for future common custom fields that may be added
]

/**
 * Field categories definition
 * - commonFields: Fields applicable to all care receivers (future expansion)
 * - individualFields: Care receiver-specific fields loaded via userId
 */
export type FieldConfiguration = {
  commonFields: TemplateField[]
  individualFields: TemplateField[]
}

/**
 * Get field configuration for a specific care receiver
 * @param userId - Normalized user ID (e.g., "AT", "IK")
 * @returns Field configuration with common and individual fields
 */
export function getFieldConfiguration(userId: string): FieldConfiguration {
  return {
    commonFields: COMMON_FIELDS,
    individualFields: getIndividualFields(userId),
  }
}

/**
 * Get individual fields for a specific care receiver
 * @param userId - Normalized user ID
 * @returns Individual fields for the care receiver
 */
function getIndividualFields(userId: string): TemplateField[] {
  // Import individual field configs dynamically based on userId
  switch (userId) {
    case "AT":
      // AT-specific fields (stretch, massage, challenges 1-3, etc.)
      return require("./at-template").AT_TEMPLATE_FIELDS
    
    case "TESTUSER01":
      // Test user for template horizontal expansion verification
      return require("./test-user-template").TEST_USER_01_TEMPLATE_FIELDS
    
    // Future: Add other care receivers here
    // case "IK":
    //   return require("./ik-template").IK_TEMPLATE_FIELDS
    // case "OS":
    //   return require("./os-template").OS_TEMPLATE_FIELDS
    
    default:
      // Return empty array for care receivers without custom fields
      return []
  }
}

/**
 * Merge common and individual fields into a single array
 * @param config - Field configuration
 * @returns Merged field array with proper ordering
 */
export function mergeFields(config: FieldConfiguration): TemplateField[] {
  return [
    ...config.commonFields,
    ...config.individualFields,
  ]
}
