/**
 * Template retrieval function
 * Maps care receiver ID to their custom template
 */

import { CareReceiverTemplate } from "./schema";
import { AT_TEMPLATE_FIELDS } from "./at-template";
import { normalizeUserId } from "@/lib/ids/normalizeUserId";

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

  // AT-specific template（内部ID "AT" で統一）
  if (normalizedId === "AT") {
    return {
      careReceiverId: normalizedId,
      name: "A・T 専用テンプレート（重心ケア記録用紙準拠）",
      customFields: AT_TEMPLATE_FIELDS,
    };
  }

  // Default empty template for other care receivers
  return {
    careReceiverId: normalizedId,
    name: `${normalizedId} テンプレート`,
    customFields: [],
  };
}

/**
 * Get all available care receiver IDs with templates
 */
export function getTemplatedCareReceiverIds(): string[] {
  return ["AT"];
}
