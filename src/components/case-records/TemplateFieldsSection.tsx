/**
 * Template Fields Section
 * Renders custom template fields grouped by category
 */

"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateField, TemplateFormValues } from "@/lib/templates/schema";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/templates/categories";

interface TemplateFieldsSectionProps {
  fields: TemplateField[];
  values: TemplateFormValues;
  onChange: (fieldId: string, value: any) => void;
}

/**
 * Group fields by category and render them
 */
export function TemplateFieldsSection({
  fields,
  values,
  onChange,
}: TemplateFieldsSectionProps) {
  if (fields.length === 0) {
    return null;
  }

  // Group fields by category, maintaining order
  const fieldsByCategory = new Map<string, TemplateField[]>();
  CATEGORY_ORDER.forEach((category) => {
    fieldsByCategory.set(
      category,
      fields.filter((f) => f.category === category).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    );
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">個別項目</h3>

      {Array.from(fieldsByCategory.entries()).map(([category, categoryFields]) => {
        if (categoryFields.length === 0) return null;

        return (
          <Card key={category} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryFields.map((field) => (
                <TemplateFieldInput
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(value) => onChange(field.id, value)}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Render individual field based on type
 */
function TemplateFieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
}) {
  const containerClass = "space-y-2";

  switch (field.type) {
    case "text":
      return (
        <div className={containerClass}>
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={field.id}
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
          {field.unit && (
            <p className="text-xs text-muted-foreground">{field.unit}</p>
          )}
        </div>
      );

    case "number":
      return (
        <div className={containerClass}>
          <Label htmlFor={field.id}>
            {field.label}
            {field.unit && ` (${field.unit})`}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id={field.id}
              type="number"
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
              placeholder={field.placeholder ?? "0"}
              required={field.required}
              className="w-24"
            />
            {field.unit && (
              <span className="text-sm text-muted-foreground">{field.unit}</span>
            )}
          </div>
        </div>
      );

    case "textarea":
      return (
        <div className={containerClass}>
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={field.id}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
          />
        </div>
      );

    case "select":
      return (
        <div className={containerClass}>
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select value={value ?? ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "checkbox":
      return (
        <div className={containerClass}>
          <Label>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="space-y-2 pl-2">
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}_${opt.value}`}
                  checked={
                    Array.isArray(value)
                      ? value.includes(opt.value)
                      : value === opt.value
                  }
                  onCheckedChange={(checked) => {
                    if (Array.isArray(value)) {
                      onChange(
                        checked
                          ? [...value, opt.value]
                          : value.filter((v: string) => v !== opt.value)
                      );
                    } else {
                      onChange(checked ? opt.value : null);
                    }
                  }}
                />
                <Label htmlFor={`${field.id}_${opt.value}`} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
