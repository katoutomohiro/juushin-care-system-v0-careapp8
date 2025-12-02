import type { SupabaseClient } from "@supabase/supabase-js"
import { createServerSupabaseClient } from "./supabase/server"

export type StaffMember = {
  id: string
  name: string
  is_active: boolean
  created_at?: string
}

function getSupabaseStaff(client?: SupabaseClient) {
  return client ?? createServerSupabaseClient()
}

export async function listStaffMembers(options?: {
  activeOnly?: boolean
  limit?: number
  client?: SupabaseClient
}): Promise<StaffMember[]> {
  const supabase = getSupabaseStaff(options?.client)
  const activeOnly = options?.activeOnly ?? false
  const limit =
    typeof options?.limit === "number" ? Math.min(50, Math.max(1, Math.floor(options.limit))) : null

  let query = supabase.from("staff_members").select("id, name, is_active, created_at").order("created_at", { ascending: true })
  if (activeOnly) {
    query = query.eq("is_active", true)
  }
  if (limit !== null) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) {
    console.error("[staff] fetch failed", error)
    throw error
  }
  return data || []
}

export async function upsertStaffMember(payload: { id?: string; name: string; is_active?: boolean }): Promise<StaffMember> {
  const supabase = getSupabaseStaff()
  const row = {
    id: payload.id,
    name: payload.name,
    is_active: payload.is_active ?? true,
  }
  const { data, error } = await supabase.from("staff_members").upsert(row).select().single()
  if (error) {
    console.error("[staff] upsert failed", error)
    throw error
  }
  return data as StaffMember
}

export async function updateStaffMember(payload: { id: string; name?: string; is_active?: boolean }): Promise<StaffMember> {
  const supabase = getSupabaseStaff()
  const row: Partial<StaffMember> = {}
  if (payload.name !== undefined) row.name = payload.name
  if (payload.is_active !== undefined) row.is_active = payload.is_active
  const { data, error } = await supabase.from("staff_members").update(row).eq("id", payload.id).select().single()
  if (error) {
    console.error("[staff] update failed", error)
    throw error
  }
  return data as StaffMember
}
