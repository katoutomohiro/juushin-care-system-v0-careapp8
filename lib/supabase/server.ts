import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function extractProjectRefFromServiceRoleKey(key: string): string | null {
  const parts = key.split(".")
  if (parts.length < 2) return null

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    return typeof payload?.ref === "string" ? payload.ref : null
  } catch (error) {
    console.error("[supabase] Failed to parse SUPABASE_SERVICE_ROLE_KEY payload", error)
    return null
  }
}

function normalizeSupabaseUrl(rawUrl: string, serviceRoleKey: string): string {
  if (!rawUrl) {
    console.error("[supabase] Missing SUPABASE_URL")
    throw new Error("Supabase URL is not configured")
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl.trim())
  } catch {
    console.error("[supabase] Invalid Supabase URL format")
    throw new Error("Supabase URL is invalid")
  }

  const projectRef = extractProjectRefFromServiceRoleKey(serviceRoleKey)
  if (projectRef) {
    const expectedHost = `${projectRef}.supabase.co`
    if (parsed.hostname !== expectedHost) {
      console.warn(`[supabase] URL host (${parsed.hostname}) does not match service key project (${projectRef}); using ${expectedHost}`)
      parsed.protocol = "https:"
      parsed.hostname = expectedHost
      parsed.port = ""
    }
  }

  // Ensure we don't end up with double slashes
  parsed.pathname = ""
  parsed.search = ""
  parsed.hash = ""

  return parsed.origin
}

function resolveSupabaseConfig() {
  if (typeof window !== "undefined") {
    throw new Error("createServerSupabaseClient must be called on the server")
  }

  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  if (!serviceRoleKey) {
    console.error("[supabase] Missing SUPABASE_SERVICE_ROLE_KEY")
    throw new Error("Supabase service role key is not configured")
  }

  const supabaseUrlEnv = (process.env.SUPABASE_URL || "").trim()
  if (!supabaseUrlEnv) {
    console.error("[supabase] Missing SUPABASE_URL")
    throw new Error("Supabase URL is not configured")
  }

  const supabaseUrl = normalizeSupabaseUrl(supabaseUrlEnv, serviceRoleKey)

  return { supabaseUrl, serviceRoleKey }
}

export function createServerSupabaseClient(): SupabaseClient {
  const { supabaseUrl, serviceRoleKey } = resolveSupabaseConfig()
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

export const supabaseServer = createServerSupabaseClient()
