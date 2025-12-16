import type { SupabaseClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "./supabase/server"

type NullableString = string | null | undefined
type NullableNumber = number | string | null | undefined

export type CaseRecordDetails = {
  vital_signs: {
    temp: NullableNumber
    pulse: NullableNumber
    bp: NullableString
  }
  seizures: {
    occurred: boolean
    type: NullableString
  }
  hydration: {
    amount: NullableNumber
    method: NullableString
  }
  activities: NullableString
  comments: NullableString
}

export type CaseRecordRow = {
  id: string
  userId: string
  serviceType: string
  recordDate: string
  startTime: NullableString
  endTime: NullableString
  category: NullableString
  summary: NullableString
  details: CaseRecordDetails
  createdBy: NullableString
  createdAt?: string
  updatedAt?: string
}

type CaseRecordInsert = {
  userId: string
  serviceType: string
  recordDate: string
  startTime?: NullableString
  endTime?: NullableString
  category?: NullableString
  summary?: NullableString
  details?: Partial<CaseRecordDetails> | null
  createdBy?: NullableString
}

type CaseRecordUpdate = Partial<Omit<CaseRecordInsert, "userId" | "serviceType" | "recordDate">> & {
  recordDate?: string
}

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

function getClient(client?: SupabaseClient) {
  // Avoid top-level client to prevent import-time failures
  return client ?? createServerSupabaseClient()
}

function clampLimit(limit?: number | null) {
  if (limit === null || limit === undefined) return DEFAULT_LIMIT
  const n = Number(limit)
  if (!Number.isFinite(n)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, n))
}

function normalizeDetails(input?: Partial<CaseRecordDetails> | null): CaseRecordDetails {
  const base: CaseRecordDetails = {
    vital_signs: { temp: null, pulse: null, bp: null },
    seizures: { occurred: false, type: null },
    hydration: { amount: null, method: null },
    activities: null,
    comments: null,
  }
  if (!input) return base

  return {
    vital_signs: {
      temp: toNullNumber(input.vital_signs?.temp),
      pulse: toNullNumber(input.vital_signs?.pulse),
      bp: toNullString(input.vital_signs?.bp),
    },
    seizures: {
      occurred: Boolean(input.seizures?.occurred),
      type: toNullString(input.seizures?.type),
    },
    hydration: {
      amount: toNullNumber(input.hydration?.amount),
      method: toNullString(input.hydration?.method),
    },
    activities: toNullString(input.activities),
    comments: toNullString(input.comments),
  }
}

function toNullString(value: NullableString): string | null {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  return trimmed === "" ? null : trimmed
}

function toNullNumber(value: NullableNumber): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === "string") {
    if (value.trim() === "") return null
  }
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function mapRow(row: any): CaseRecordRow {
  return {
    id: row.id,
    userId: row.user_id,
    serviceType: row.service_type,
    recordDate: row.record_date,
    startTime: row.start_time,
    endTime: row.end_time,
    category: row.category,
    summary: row.summary,
    details: normalizeDetails(row.details),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function createCaseRecord(input: CaseRecordInsert, client?: SupabaseClient): Promise<CaseRecordRow> {
  const supabase = getClient(client)
  const details = normalizeDetails(input.details)

  const payload = {
    user_id: input.userId,
    service_type: input.serviceType,
    record_date: input.recordDate,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    category: input.category || "daily",
    summary: input.summary || "",
    details,
    created_by: input.createdBy || null,
    section: "structured",
    item_key: "root",
    source: "manual",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("case_records").insert(payload).select().single()
  if (error) {
    console.error("[case_records] create failed", error)
    throw error
  }
  return mapRow(data)
}

export async function listCaseRecords(
  params: { userId: string; serviceType?: string; limit?: number | null },
  client?: SupabaseClient,
): Promise<CaseRecordRow[]> {
  const supabase = getClient(client)
  const since = new Date()
  since.setFullYear(since.getFullYear() - 1)
  const limit = clampLimit(params.limit)

  let query = supabase
    .from("case_records")
    .select("*")
    .eq("user_id", params.userId)
    .eq("section", "structured")
    .eq("item_key", "root")
    .gte("created_at", since.toISOString())
    .order("record_date", { ascending: false })
    .limit(limit)

  if (params.serviceType) {
    query = query.eq("service_type", params.serviceType)
  }

  const { data, error } = await query
  if (error) {
    console.error("[case_records] list failed", error)
    throw error
  }
  return (data || []).map(mapRow)
}

export async function getCaseRecord(recordId: string, client?: SupabaseClient): Promise<CaseRecordRow | null> {
  const supabase = getClient(client)
  const { data, error } = await supabase.from("case_records").select("*").eq("id", recordId).maybeSingle()
  if (error) {
    console.error("[case_records] get failed", error)
    throw error
  }
  return data ? mapRow(data) : null
}

export async function updateCaseRecord(
  recordId: string,
  updates: CaseRecordUpdate,
  client?: SupabaseClient,
): Promise<CaseRecordRow> {
  const supabase = getClient(client)
  const details = updates.details ? normalizeDetails(updates.details as any) : undefined
  const payload: any = {
    start_time: updates.startTime ?? undefined,
    end_time: updates.endTime ?? undefined,
    category: updates.category ?? undefined,
    summary: updates.summary ?? undefined,
    created_by: updates.createdBy ?? undefined,
    record_date: updates.recordDate ?? undefined,
    updated_at: new Date().toISOString(),
  }
  if (details) {
    payload.details = details
  }

  const { data, error } = await supabase.from("case_records").update(payload).eq("id", recordId).select().single()
  if (error) {
    console.error("[case_records] update failed", error)
    throw error
  }
  return mapRow(data)
}
