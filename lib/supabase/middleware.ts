import { NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

if (!url || !key) {
  console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY is missing for middleware.")
}

export function createSupabaseMiddlewareClient(req: NextRequest, res: NextResponse) {
  // mirror incoming request cookies onto the response so set/remove operations
  // performed by the Supabase client during requests will be visible to the browser
  try {
    const all = req.cookies.getAll()
    for (const c of all) {
      // preserve existing cookie attributes minimally
      res.cookies.set({ name: c.name, value: c.value })
    }
  } catch {
    // ignore
  }

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({ name, value: "", ...options, maxAge: 0 })
      },
    },
  })
}
