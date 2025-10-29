import { createClient } from "@supabase/supabase-js"

export type SeizureLog = {
  id?: string
  serviceId?: string | null
  userId?: string | null
  occurredAt: string
  seizureType: string
  duration?: number | null // seconds
  trigger?: string | null
  intervention?: string | null
  note?: string | null
  createdAt?: string
}

function getSupabase() {
  const url = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL : ""
  const key = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY : ""
  if (!url || !key) return null
  return createClient(url, key)
}

export async function saveSeizureLog(log: Omit<SeizureLog, "id" | "createdAt">): Promise<SeizureLog> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("seizure_logs")
      .insert({
        service_id: log.serviceId ?? null,
        user_id: log.userId ?? null,
        occurred_at: log.occurredAt,
        seizure_type: log.seizureType,
        duration: log.duration ?? null,
        trigger: log.trigger ?? null,
        intervention: log.intervention ?? null,
        note: log.note ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(`Supabase insert failed: ${error.message}`)
    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      occurredAt: data.occurred_at,
      seizureType: data.seizure_type,
      duration: data.duration,
      trigger: data.trigger,
      intervention: data.intervention,
      note: data.note,
      createdAt: data.created_at,
    }
  }

  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : new Date().toISOString()
  const saved: SeizureLog = { ...log, id, createdAt: new Date().toISOString() }
  const existing = localStorage.getItem("seizureLogs")
  const logs: SeizureLog[] = existing ? JSON.parse(existing) : []
  logs.push(saved)
  localStorage.setItem("seizureLogs", JSON.stringify(logs))
  return saved
}

export type SeizureListParams = { start?: string; end?: string; serviceId?: string | null; userId?: string | null }
export async function listSeizureLogs(_params: SeizureListParams = {}) {
  // v1 skeleton: leave unimplemented beyond type; future v1.2 can extend
  return [] as SeizureLog[]
}
