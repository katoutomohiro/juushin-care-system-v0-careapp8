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

export type SeizureListParams = {
  start?: string // ISO date/time lower bound (occurredAt >=)
  end?: string // ISO date/time upper bound (occurredAt <=)
  seizureType?: string // exact match for seizure type
  serviceId?: string | null
  userId?: string | null
  keyword?: string // ilike match against text fields
  limit?: number
  offset?: number
}

/**
 * List seizure logs with optional filters (Supabase first, otherwise localStorage)
 */
export async function listSeizureLogs(params: SeizureListParams = {}): Promise<SeizureLog[]> {
  const supabase = getSupabase()
  const {
    start,
    end,
    seizureType,
    serviceId,
    userId,
    keyword,
    limit = 100,
    offset = 0,
  } = params

  if (supabase) {
    let query = supabase
      .from("seizure_logs")
      .select("id, service_id, user_id, occurred_at, seizure_type, duration, trigger, intervention, note, created_at")
      .order("occurred_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (start) query = query.gte("occurred_at", start)
    if (end) query = query.lte("occurred_at", end)
    if (seizureType) query = query.eq("seizure_type", seizureType)
    if (serviceId) query = query.eq("service_id", serviceId)
    if (userId) query = query.eq("user_id", userId)
    if (keyword && keyword.trim()) {
      const k = `%${keyword.trim()}%`
      query = query.or(
        `seizure_type.ilike.${k},trigger.ilike.${k},intervention.ilike.${k},note.ilike.${k}`,
      )
    }

    const { data, error } = await query
    if (error) throw new Error(`Supabase list failed: ${error.message}`)

    return (data || []).map((d: any) => ({
      id: d.id,
      serviceId: d.service_id,
      userId: d.user_id,
      occurredAt: d.occurred_at,
      seizureType: d.seizure_type,
      duration: d.duration,
      trigger: d.trigger,
      intervention: d.intervention,
      note: d.note,
      createdAt: d.created_at,
    }))
  }

  // localStorage path
  const existing = typeof localStorage !== "undefined" ? localStorage.getItem("seizureLogs") : null
  const logs: SeizureLog[] = existing ? JSON.parse(existing) : []
  let filtered = logs

  if (start) filtered = filtered.filter((l) => l.occurredAt >= start)
  if (end) filtered = filtered.filter((l) => l.occurredAt <= end)
  if (seizureType) filtered = filtered.filter((l) => l.seizureType === seizureType)
  if (serviceId) filtered = filtered.filter((l) => l.serviceId === serviceId)
  if (userId) filtered = filtered.filter((l) => l.userId === userId)
  if (keyword && keyword.trim()) {
    const k = keyword.trim().toLowerCase()
    filtered = filtered.filter((l) =>
      [l.seizureType, l.trigger, l.intervention, l.note]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(k)),
    )
  }

  // sort desc by occurredAt
  filtered.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : 0))
  return filtered.slice(offset, offset + limit)
}

export async function getSeizureLog(id: string): Promise<SeizureLog | null> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("seizure_logs")
      .select("id, service_id, user_id, occurred_at, seizure_type, duration, trigger, intervention, note, created_at")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Supabase get failed: ${error.message}`)
    if (!data) return null
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

  const existing = localStorage.getItem("seizureLogs")
  const logs: SeizureLog[] = existing ? JSON.parse(existing) : []
  return logs.find((l) => l.id === id) || null
}

export async function updateSeizureLog(
  id: string,
  patch: Partial<Omit<SeizureLog, "id" | "createdAt">>,
): Promise<SeizureLog> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("seizure_logs")
      .update({
        service_id: patch.serviceId ?? undefined,
        user_id: patch.userId ?? undefined,
        occurred_at: patch.occurredAt ?? undefined,
        seizure_type: patch.seizureType ?? undefined,
        duration: patch.duration ?? undefined,
        trigger: patch.trigger ?? undefined,
        intervention: patch.intervention ?? undefined,
        note: patch.note ?? undefined,
      })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new Error(`Supabase update failed: ${error.message}`)
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

  const existing = localStorage.getItem("seizureLogs")
  const logs: SeizureLog[] = existing ? JSON.parse(existing) : []
  const idx = logs.findIndex((l) => l.id === id)
  if (idx === -1) throw new Error("Log not found")
  const updated: SeizureLog = { ...logs[idx], ...patch }
  logs[idx] = updated
  localStorage.setItem("seizureLogs", JSON.stringify(logs))
  return updated
}

export async function deleteSeizureLog(id: string): Promise<void> {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from("seizure_logs").delete().eq("id", id)
    if (error) throw new Error(`Supabase delete failed: ${error.message}`)
    return
  }
  const existing = localStorage.getItem("seizureLogs")
  const logs: SeizureLog[] = existing ? JSON.parse(existing) : []
  const next = logs.filter((l) => l.id !== id)
  localStorage.setItem("seizureLogs", JSON.stringify(next))
}
