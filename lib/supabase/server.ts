import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let hasWarnedHostMismatch = false

function extractProjectRefFromServiceKey(key: string): string | null {
  const parts = key.split(".")
  if (parts.length < 2) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString())
    return payload?.ref || null
  } catch {
    return null
  }
}

function normalizeSupabaseUrl(rawUrl: string, serviceKey: string): string {
  if (!rawUrl) {
    console.error("[supabase] Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL")
    throw new Error("Supabase URL is not configured")
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl.trim())
  } catch {
    console.error("[supabase] Invalid Supabase URL format")
    throw new Error("Supabase URL is invalid")
  }

  const projectRef = extractProjectRefFromServiceKey(serviceKey)
  const hostname = parsed.hostname
  const domainSuffix = hostname.split(".").slice(1).join(".")
  const isSupabaseHost = domainSuffix.startsWith("supabase.")

  if (projectRef && isSupabaseHost && hostname.split(".")[0] !== projectRef) {
    const correctedHost = `${projectRef}.${domainSuffix}`
    if (!hasWarnedHostMismatch) {
      console.warn(
        `[supabase] URL host (${hostname}) does not match service key project (${projectRef}); using ${correctedHost}`,
      )
      hasWarnedHostMismatch = true
    }
    parsed.hostname = correctedHost
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

  const urlFromEnv = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()
  const supabaseUrl = normalizeSupabaseUrl(urlFromEnv, serviceRoleKey)

  return { supabaseUrl, serviceRoleKey }
}

export function createServerSupabaseClient(): SupabaseClient {
  const { supabaseUrl, serviceRoleKey } = resolveSupabaseConfig()
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
