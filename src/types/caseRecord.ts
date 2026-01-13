/**
 * Case Record Payload Type Definition
 * Structured format for case_records.record_data
 */

export type CaseRecordPayload = {
  version: 1
  sections: {
    activity?: { text?: string }
    restraint?: {
      has?: boolean | null
      method?: string | null
      reason?: string | null
    }
    note?: { text?: string }
    rehab?: {
      title?: string
      menu?: string
      detail?: string
      risk?: string
    }
    staff?: {
      mainStaffId?: string | null
      subStaffIds?: string[]
    }
    custom?: Record<string, any>
  }
  meta?: {
    createdByStaffId?: string | null
    tags?: string[]
  }
}

/**
 * Build a one-line summary from structured payload
 * @param payload - Structured case record data
 * @returns Summary string (max 80 chars, no line breaks)
 */
export function buildSummary(payload: unknown): string {
  try {
    if (!payload || typeof payload !== "object") {
      return "—"
    }

    const data = payload as Partial<CaseRecordPayload>
    const sections = data.sections

    if (!sections) {
      return "旧形式データ"
    }

    const parts: string[] = []

    // Activity
    const activityText = sections.activity?.text?.trim()
    if (activityText) {
      parts.push(activityText)
    }

    // Note
    const noteText = sections.note?.text?.trim()
    if (noteText) {
      parts.push(noteText)
    }

    // Restraint
    if (sections.restraint?.has === true) {
      const method = sections.restraint.method?.trim()
      parts.push(method ? `拘束あり(${method})` : "拘束あり")
    }

    // Rehab
    if (sections.rehab?.title?.trim()) {
      parts.push(`リハ: ${sections.rehab.title.trim()}`)
    }

    if (parts.length === 0) {
      return ""
    }

    const summary = parts.join(" / ")
    return summary.length > 80 ? summary.substring(0, 77) + "..." : summary
  } catch (error) {
    console.error("[buildSummary] Error:", error)
    return "—"
  }
}

/**
 * Type guard to check if data is CaseRecordPayload
 */
export function isCaseRecordPayload(data: unknown): data is CaseRecordPayload {
  if (!data || typeof data !== "object") return false
  const d = data as any
  return d.version === 1 && typeof d.sections === "object"
}
