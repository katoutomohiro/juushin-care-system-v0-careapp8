import { createClient } from "@supabase/supabase-js"

export type PublicSeizureInsert = {
  episode_at: string
  type: string | null
  duration_seconds: number | null
  triggers: string[]
  interventions: string[]
  note: string | null
  user_id?: string | null
  reporter_id?: string | null
}

function normalizeUuid(value: string | null | undefined): string | null {
  const v = (value ?? "").trim()
  if (!v) return "00000000-0000-0000-0000-000000000000"
  return v
}

export async function insertSeizureToPublic(
  payload: PublicSeizureInsert,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  if (!url || !key) {
    return { ok: false, error: "Supabase env not configured" }
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    const { error } = await supabase.from("seizures").insert([
      {
        episode_at: payload.episode_at,
        type: payload.type,
        duration_seconds: payload.duration_seconds,
        triggers: Array.isArray(payload.triggers) ? payload.triggers : [],
        interventions: Array.isArray(payload.interventions) ? payload.interventions : [],
        note: payload.note ?? null,
        user_id: normalizeUuid(payload.user_id),
        reporter_id: normalizeUuid(payload.reporter_id),
      },
    ])
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) }
  }
}
