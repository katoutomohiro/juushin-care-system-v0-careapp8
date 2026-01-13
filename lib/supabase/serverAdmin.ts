import "server-only"

import { createClient } from "@supabase/supabase-js"

export type SupabaseAdminEnv = {
  url: string
  key: string
  urlSource: string
  keySource: string
  branch: "server" | "missing"
  missingKeys: string[]
}

function resolveSupabaseAdminEnv(): SupabaseAdminEnv {
  const serverUrl = process.env.SUPABASE_URL || ""
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  const hasServer = !!serverUrl && !!serverKey

  if (hasServer) {
    return {
      url: serverUrl,
      key: serverKey,
      urlSource: "SUPABASE_URL",
      keySource: "SUPABASE_SERVICE_ROLE_KEY",
      branch: "server",
      missingKeys: [],
    }
  }

  const missingKeys: string[] = []
  if (!serverUrl) missingKeys.push("SUPABASE_URL")
  if (!serverKey) missingKeys.push("SUPABASE_SERVICE_ROLE_KEY")

  return {
    url: serverUrl || "",
    key: serverKey || "",
    urlSource: serverUrl ? "SUPABASE_URL" : "",
    keySource: serverKey ? "SUPABASE_SERVICE_ROLE_KEY" : "",
    branch: "missing",
    missingKeys,
  }
}

export const supabaseAdminEnv = resolveSupabaseAdminEnv()
export const supabaseAdmin =
  supabaseAdminEnv.url && supabaseAdminEnv.key
    ? createClient(supabaseAdminEnv.url, supabaseAdminEnv.key)
    : null
