/**
 * Template retrieval function
 * Maps care receiver ID to their custom template
 */

import { CareReceiverTemplate } from "./schema";
import { AT_TEMPLATE_FIELDS } from "./at-template";

/**
 * Get the template for a specific care receiver
 * @param careReceiverId - The care receiver ID (e.g., "AT", "I・K")
 * @returns The template for the care receiver, or empty template if not found
 */
export function getTemplate(careReceiverId: string | null | undefined): CareReceiverTemplate {
  if (!careReceiverId) {
    return {
      careReceiverId: "unknown",
      name: "Default Template",
      customFields: [],
    };
  }

  // AT-specific template
  if (careReceiverId === "A・T" || careReceiverId === "AT") {
    return {
      careReceiverId,
      name: "A・T 専用テンプレート",
      customFields: AT_TEMPLATE_FIELDS,
    };
  }

  // Default empty template for other care receivers
  return {
    careReceiverId,
    name: `${careReceiverId} テンプレート`,
    customFields: [],
  };
}

/**
 * Get all available care receiver IDs with templates
 */
export function getTemplatedCareReceiverIds(): string[] {
  return ["A・T"];
}
