import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createServerSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL) {
    console.error("[supabase] Missing NEXT_PUBLIC_SUPABASE_URL")
    throw new Error("Supabase URL is not configured")
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[supabase] Missing SUPABASE_SERVICE_ROLE_KEY")
    throw new Error("Supabase service role key is not configured")
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}
