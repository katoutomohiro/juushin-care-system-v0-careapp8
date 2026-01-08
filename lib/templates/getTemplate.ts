/**
 * Template retrieval function
 * Maps care receiver ID to their custom template
 */

import { CareReceiverTemplate } from "./schema";
import { normalizeUserId } from "@/lib/ids/normalizeUserId";
import { getFieldConfiguration, mergeFields } from "./field-config";

/**
 * Get the template for a specific care receiver
 * @param careReceiverId - The care receiver ID (normalized, e.g., "AT")
 * @returns The template for the care receiver, or empty template if not found
 */
export function getTemplate(careReceiverId: string | null | undefined): CareReceiverTemplate {
  const normalizedId = normalizeUserId(careReceiverId ?? "")

  if (!normalizedId) {
    return {
      careReceiverId: "unknown",
      name: "Default Template",
      customFields: [],
    };
  }

  // Get field configuration for this care receiver (common + individual fields)
  const fieldConfig = getFieldConfiguration(normalizedId)
  const allFields = mergeFields(fieldConfig)

  // Build template name based on userId
  const templateName = normalizedId === "AT" 
    ? "A・T 専用テンプレート（重心ケア記録用紙準拠）"
    : `${normalizedId} テンプレート`

  return {
    careReceiverId: normalizedId,
    name: templateName,
    customFields: allFields,
  };
}

/**
 * Get all available care receiver IDs with templates
 */
export function getTemplatedCareReceiverIds(): string[] {
  return ["AT"];
}
