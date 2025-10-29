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

/**
 * Get Supabase client if environment variables are available.
 * Returns null if credentials are missing.
 */
function getSupabase() {
  const url =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      : ""
  const key =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
      : ""

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
