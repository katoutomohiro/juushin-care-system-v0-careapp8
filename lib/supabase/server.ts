import "server-only"

import { cookies } from "next/headers"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY is missing.")
}

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(url ?? "", key ?? "", {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}
