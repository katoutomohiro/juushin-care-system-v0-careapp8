import "server-only"

import { createClient } from "@supabase/supabase-js"

export type SupabaseAdminEnv = {
  url: string
  key: string
  urlSource: string
  keySource: string
  branch: "server" | "public" | "missing"
  missingKeys: string[]
}

function resolveSupabaseAdminEnv(): SupabaseAdminEnv {
  const serverUrl = process.env.SUPABASE_URL || ""
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  const hasServer = !!serverUrl && !!serverKey
  const hasPublic = !!publicUrl && !!publicKey

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

  if (hasPublic) {
    return {
      url: publicUrl,
      key: publicKey,
      urlSource: "NEXT_PUBLIC_SUPABASE_URL",
      keySource: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      branch: "public",
      missingKeys: [],
    }
  }

  const missingKeys: string[] = []
  if (!serverUrl) missingKeys.push("SUPABASE_URL")
  if (!serverKey) missingKeys.push("SUPABASE_SERVICE_ROLE_KEY")
  if (!publicUrl) missingKeys.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!publicKey) missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

  return {
    url: serverUrl || publicUrl || "",
    key: serverKey || publicKey || "",
    urlSource: serverUrl ? "SUPABASE_URL" : publicUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
    keySource: serverKey ? "SUPABASE_SERVICE_ROLE_KEY" : publicKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : "",
    branch: "missing",
    missingKeys,
  }
}

export const supabaseAdminEnv = resolveSupabaseAdminEnv()
export const supabaseAdmin =
  supabaseAdminEnv.url && supabaseAdminEnv.key
    ? createClient(supabaseAdminEnv.url, supabaseAdminEnv.key)
    : null
