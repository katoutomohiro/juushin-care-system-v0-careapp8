import { createClient } from "@supabase/supabase-js"

export type ExpressionLog = {
  id?: string
  serviceId?: string | null
  userId?: string | null
  occurredAt: string // ISO string
  expression: string
  reaction?: string | null
  intervention?: string | null
  discomfort?: string | null
  note?: string | null
  createdAt?: string
}

export type ExpressionListParams = {
  start?: string // ISO date/time lower bound (occurredAt >=)
  end?: string // ISO date/time upper bound (occurredAt <=)
  expression?: string // exact match for expression
  serviceId?: string | null
  userId?: string | null
  keyword?: string // ilike match against text fields
  limit?: number
  offset?: number
}

/**
 * Get Supabase client if environment variables are available.
 * Returns null if credentials are missing.
 */
function getSupabase() {
  const url = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL || "" : ""
  const key = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" : ""

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

/**
 * Save expression log to Supabase if available, otherwise to localStorage.
 * @param log ExpressionLog object (without id/createdAt)
 * @returns Saved log with id and createdAt populated
 */
export async function saveExpressionLog(
  log: Omit<ExpressionLog, "id" | "createdAt">
): Promise<ExpressionLog> {
  const supabase = getSupabase()

  if (supabase) {
    // Supabase path
    const { data, error } = await supabase
      .from("expression_logs")
      .insert({
        service_id: log.serviceId ?? null,
        user_id: log.userId ?? null,
        occurred_at: log.occurredAt,
        expression: log.expression,
        reaction: log.reaction ?? null,
        intervention: log.intervention ?? null,
        discomfort: log.discomfort ?? null,
        note: log.note ?? null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`)
    }

    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      occurredAt: data.occurred_at,
      expression: data.expression,
      reaction: data.reaction,
      intervention: data.intervention,
      discomfort: data.discomfort,
      note: data.note,
      createdAt: data.created_at,
    }
  } else {
    // localStorage fallback
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : new Date().toISOString()

    const saved: ExpressionLog = {
      ...log,
      id,
      createdAt: new Date().toISOString(),
    }

    const existing = localStorage.getItem("expressionLogs")
    const logs: ExpressionLog[] = existing ? JSON.parse(existing) : []
    logs.push(saved)
    localStorage.setItem("expressionLogs", JSON.stringify(logs))

    return saved
  }
}

/**
 * List expression logs with optional filters (Supabase first, otherwise localStorage)
 */
export async function listExpressionLogs(params: ExpressionListParams = {}): Promise<ExpressionLog[]> {
  const supabase = getSupabase()
  const {
    start,
    end,
    expression,
    serviceId,
    userId,
    keyword,
    limit = 100,
    offset = 0,
  } = params

  if (supabase) {
    let query = supabase
      .from("expression_logs")
      .select("id, service_id, user_id, occurred_at, expression, reaction, intervention, discomfort, note, created_at")
      .order("occurred_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (start) query = query.gte("occurred_at", start)
    if (end) query = query.lte("occurred_at", end)
    if (expression) query = query.eq("expression", expression)
    if (serviceId) query = query.eq("service_id", serviceId)
    if (userId) query = query.eq("user_id", userId)
    if (keyword && keyword.trim()) {
      const k = `%${keyword.trim()}%`
      // or filter across text columns
      query = query.or(
        `expression.ilike.${k},reaction.ilike.${k},intervention.ilike.${k},discomfort.ilike.${k},note.ilike.${k}`,
      )
    }

    const { data, error } = await query
    if (error) throw new Error(`Supabase list failed: ${error.message}`)

    return (data || []).map((d: any) => ({
      id: d.id,
      serviceId: d.service_id,
      userId: d.user_id,
      occurredAt: d.occurred_at,
      expression: d.expression,
      reaction: d.reaction,
      intervention: d.intervention,
      discomfort: d.discomfort,
      note: d.note,
      createdAt: d.created_at,
    }))
  }

  // localStorage path
  const existing = typeof localStorage !== "undefined" ? localStorage.getItem("expressionLogs") : null
  const logs: ExpressionLog[] = existing ? JSON.parse(existing) : []
  let filtered = logs

  if (start) filtered = filtered.filter((l) => l.occurredAt >= start)
  if (end) filtered = filtered.filter((l) => l.occurredAt <= end)
  if (expression) filtered = filtered.filter((l) => l.expression === expression)
  if (serviceId) filtered = filtered.filter((l) => l.serviceId === serviceId)
  if (userId) filtered = filtered.filter((l) => l.userId === userId)
  if (keyword && keyword.trim()) {
    const k = keyword.trim().toLowerCase()
    filtered = filtered.filter((l) =>
      [l.expression, l.reaction, l.intervention, l.discomfort, l.note]
        .filter((v) => v != null && v !== "")
        .some((v) => String(v).toLowerCase().includes(k)),
    )
  }

  // sort desc by occurredAt using localeCompare for reliability
  filtered.sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)))
  return filtered.slice(offset, offset + limit)
}

export async function getExpressionLog(id: string): Promise<ExpressionLog | null> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("expression_logs")
      .select("id, service_id, user_id, occurred_at, expression, reaction, intervention, discomfort, note, created_at")
      .eq("id", id)
      .single()
    if (error) throw new Error(`Supabase get failed: ${error.message}`)
    if (!data) return null
    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      occurredAt: data.occurred_at,
      expression: data.expression,
      reaction: data.reaction,
      intervention: data.intervention,
      discomfort: data.discomfort,
      note: data.note,
      createdAt: data.created_at,
    }
  }

  const existing = localStorage.getItem("expressionLogs")
  const logs: ExpressionLog[] = existing ? JSON.parse(existing) : []
  return logs.find((l) => l.id === id) || null
}

export async function updateExpressionLog(
  id: string,
  patch: Partial<Omit<ExpressionLog, "id" | "createdAt">>,
): Promise<ExpressionLog> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("expression_logs")
      .update({
        service_id: patch.serviceId ?? undefined,
        user_id: patch.userId ?? undefined,
        occurred_at: patch.occurredAt ?? undefined,
        expression: patch.expression ?? undefined,
        reaction: patch.reaction ?? undefined,
        intervention: patch.intervention ?? undefined,
        discomfort: patch.discomfort ?? undefined,
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
      expression: data.expression,
      reaction: data.reaction,
      intervention: data.intervention,
      discomfort: data.discomfort,
      note: data.note,
      createdAt: data.created_at,
    }
  }

  const existing = localStorage.getItem("expressionLogs")
  const logs: ExpressionLog[] = existing ? JSON.parse(existing) : []
  const idx = logs.findIndex((l) => l.id === id)
  if (idx === -1) throw new Error("Log not found")
  const updated: ExpressionLog = { ...logs[idx], ...patch }
  logs[idx] = updated
  localStorage.setItem("expressionLogs", JSON.stringify(logs))
  return updated
}

export async function deleteExpressionLog(id: string): Promise<void> {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from("expression_logs").delete().eq("id", id)
    if (error) throw new Error(`Supabase delete failed: ${error.message}`)
    return
  }
  const existing = localStorage.getItem("expressionLogs")
  const logs: ExpressionLog[] = existing ? JSON.parse(existing) : []
  const next = logs.filter((l) => l.id !== id)
  localStorage.setItem("expressionLogs", JSON.stringify(next))
}
