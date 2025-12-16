import type { SupabaseClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "./supabase/server"

const TABLE_NAME = "service_users_defaults"

// service_users defaults representation (camelCase on app side, snake_case in DB)
export type ServiceUserDefaults = {
  userId: string
  name?: string
  serviceType?: string | null
  defaultMainStaffId?: string | null
  defaultSubStaffIds?: string[] | null
  defaultServiceStartTime?: string | null
  defaultServiceEndTime?: string | null
  defaultTotalServiceMinutes?: number | null
  defaultDayServiceAmStartTime?: string | null
  defaultDayServiceAmEndTime?: string | null
  defaultDayServicePmStartTime?: string | null
  defaultDayServicePmEndTime?: string | null
  created_at?: string
  updated_at?: string
}

type ServiceUserDefaultsPayload = Omit<
  ServiceUserDefaults,
  "userId" | "name" | "serviceType" | "created_at" | "updated_at"
>

function getSupabaseServiceUsers(client?: SupabaseClient) {
  // Avoid top-level client initialization that may throw during import
  return client ?? createServerSupabaseClient()
}

function toNullIfEmpty<T extends string | number | null | undefined>(v: T): T | null {
  if (v === "" || v === undefined) return null as any
  return (v as any) ?? null
}

function normalizeSubStaffIds(input: {
  defaultSubStaffIds?: string[] | null
  defaultSubStaffId?: string | null
  default_sub_staff_ids?: string[] | null
  default_sub_staff_id?: string | null
}) {
  const ids =
    input.defaultSubStaffIds ??
    input.default_sub_staff_ids ??
    (input.defaultSubStaffId ? [input.defaultSubStaffId] : undefined) ??
    (input.default_sub_staff_id ? [input.default_sub_staff_id] : undefined)
  if (!ids) return null
  const filtered = ids.map((v) => toNullIfEmpty(v)).filter(Boolean) as string[]
  return filtered.length ? filtered : null
}

export function normalizeServiceUserDefaults(
  input: Partial<ServiceUserDefaults> | null | undefined,
  fallback?: { userId: string; name?: string; serviceType?: string | null },
): ServiceUserDefaults {
  return {
    userId: input?.userId ?? (input as any)?.user_id ?? fallback?.userId ?? "",
    name: input?.name ?? fallback?.name ?? "",
    serviceType: input?.serviceType ?? (input as any)?.service_type ?? fallback?.serviceType ?? null,
    defaultMainStaffId: toNullIfEmpty(input?.defaultMainStaffId ?? (input as any)?.default_main_staff_id),
    defaultSubStaffIds: normalizeSubStaffIds(input as any),
    defaultServiceStartTime:
      toNullIfEmpty(input?.defaultServiceStartTime ?? (input as any)?.default_service_start_time),
    defaultServiceEndTime: toNullIfEmpty(input?.defaultServiceEndTime ?? (input as any)?.default_service_end_time),
    defaultTotalServiceMinutes:
      input?.defaultTotalServiceMinutes ?? (input as any)?.default_total_service_minutes ?? null,
    defaultDayServiceAmStartTime:
      toNullIfEmpty(input?.defaultDayServiceAmStartTime ?? (input as any)?.default_day_service_am_start_time),
    defaultDayServiceAmEndTime:
      toNullIfEmpty(input?.defaultDayServiceAmEndTime ?? (input as any)?.default_day_service_am_end_time),
    defaultDayServicePmStartTime:
      toNullIfEmpty(input?.defaultDayServicePmStartTime ?? (input as any)?.default_day_service_pm_start_time),
    defaultDayServicePmEndTime:
      toNullIfEmpty(input?.defaultDayServicePmEndTime ?? (input as any)?.default_day_service_pm_end_time),
    created_at: (input as any)?.created_at,
    updated_at: (input as any)?.updated_at,
  }
}

function mapRow(row: any): ServiceUserDefaults {
  return normalizeServiceUserDefaults({
    userId: row?.user_id ?? row?.id,
    name: row?.name,
    serviceType: row?.service_type,
    defaultMainStaffId: row?.default_main_staff_id,
    defaultSubStaffIds: row?.default_sub_staff_ids,
    defaultServiceStartTime: row?.default_service_start_time,
    defaultServiceEndTime: row?.default_service_end_time,
    defaultTotalServiceMinutes: row?.default_total_service_minutes,
    defaultDayServiceAmStartTime: row?.default_day_service_am_start_time,
    defaultDayServiceAmEndTime: row?.default_day_service_am_end_time,
    defaultDayServicePmStartTime: row?.default_day_service_pm_start_time,
    defaultDayServicePmEndTime: row?.default_day_service_pm_end_time,
    created_at: row?.created_at,
    updated_at: row?.updated_at,
  })
}

function isMissingTable(code: string | undefined) {
  return code === "42P01" || code === "PGRST116" || code === "PGRST114" || code === "PGRST205"
}

export async function fetchUserServiceDefaults(
  userId: string,
  client?: SupabaseClient,
): Promise<ServiceUserDefaults | null> {
  const supabase = getSupabaseServiceUsers(client)
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("user_id", userId).maybeSingle()
  if (error) {
    if (isMissingTable((error as any).code)) {
      console.warn(
        `[${TABLE_NAME}] table missing; ensure supabase/sql/2025-11-28-service-users-defaults.sql is applied to ${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
      )
      return null
    }
    console.error(`[${TABLE_NAME}] fetch failed`, error)
    throw error
  }
  if (!data) return null
  return mapRow(data)
}

export async function upsertUserServiceDefaults(
  userId: string,
  defaults: any,
  client?: SupabaseClient,
): Promise<ServiceUserDefaults | null> {
  const supabase = getSupabaseServiceUsers(client)
  const source = defaults?.defaults ?? defaults
  if (!source || typeof source !== "object") {
    console.error("[service_users_defaults] upsert failed: defaults payload is missing or invalid")
    throw new Error("Service user defaults payload is required")
  }

  const normalizedSubStaffIds = normalizeSubStaffIds(source as any)

  const payload = {
    user_id: userId,
    name: source.name ?? defaults?.name ?? userId,
    service_type: source.serviceType ?? source.service_type ?? null,
    default_main_staff_id: toNullIfEmpty(source.defaultMainStaffId ?? source.default_main_staff_id),
    default_sub_staff_ids: normalizedSubStaffIds,
    default_service_start_time: toNullIfEmpty(
      source.defaultServiceStartTime ?? source.default_service_start_time,
    ),
    default_service_end_time: toNullIfEmpty(source.defaultServiceEndTime ?? source.default_service_end_time),
    default_total_service_minutes:
      source.defaultTotalServiceMinutes ?? source.default_total_service_minutes ?? null,
    default_day_service_am_start_time:
      toNullIfEmpty(source.defaultDayServiceAmStartTime ?? source.default_day_service_am_start_time),
    default_day_service_am_end_time: toNullIfEmpty(
      source.defaultDayServiceAmEndTime ?? source.default_day_service_am_end_time,
    ),
    default_day_service_pm_start_time:
      toNullIfEmpty(source.defaultDayServicePmStartTime ?? source.default_day_service_pm_start_time),
    default_day_service_pm_end_time: toNullIfEmpty(
      source.defaultDayServicePmEndTime ?? source.default_day_service_pm_end_time,
    ),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single()
  if (error) {
    if (isMissingTable((error as any).code)) {
      console.warn(
        `[${TABLE_NAME}] table missing; ensure supabase/sql/2025-11-28-service-users-defaults.sql is applied to ${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
      )
      return null
    }
    console.error(`[${TABLE_NAME}] upsert failed`, error)
    throw error
  }
  return mapRow(data)
}
