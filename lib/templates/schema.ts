/**
 * Template schema definitions
 * Defines the structure of care record templates
 */

import { CareCategory } from "./categories";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select";

export interface TemplateFieldOption {
  value: string;
  label: string;
}

export interface TemplateField {
  /**
   * Unique identifier for the field (used as database key)
   * Example: "at_rehab1_stretch_targets"
   */
  id: string;

  /**
   * Display label for the form
   * Example: "リハビリ対象部位"
   */
  label: string;

  /**
   * Category this field belongs to
   */
  category: CareCategory;

  /**
   * Type of input field
   */
  type: FieldType;

  /**
   * Whether this field is required
   */
  required: boolean;

  /**
   * Options for select/checkbox types
   */
  options?: TemplateFieldOption[];

  /**
   * Unit of measurement (e.g., "ml", "回", "cm")
   */
  unit?: string;

  /**
   * Help text or placeholder
   */
  placeholder?: string;

  /**
   * Display order within category
   */
  order?: number;
}

export interface CareReceiverTemplate {
  /**
   * The care receiver ID (e.g., "AT", "I・K")
   */
  careReceiverId: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Custom fields specific to this care receiver
   */
  customFields: TemplateField[];

  /**
   * Created timestamp
   */
  createdAt?: Date;

  /**
   * Last updated timestamp
   */
  updatedAt?: Date;
}

/**
 * Form value structure for storing submitted data
 */
export type TemplateFormValues = Record<string, any>;
