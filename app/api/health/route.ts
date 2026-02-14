import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  const missingEnv = [] as string[]
  if (!url) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!anonKey) missingEnv.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  if (!serviceKey) missingEnv.push("SUPABASE_SERVICE_ROLE_KEY")

  if (missingEnv.length > 0) {
    console.error("[health] Missing required env:", missingEnv.join(", "))
    return NextResponse.json(
      { ok: false, missing_env: missingEnv, supabase_error: null },
      { status: 500 }
    )
  }

  try {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { error } = await admin.from("staff_profiles").select("id").limit(1)

    if (error) {
      console.error("[health] Supabase query failed:", error.message)
      return NextResponse.json(
        { ok: false, missing_env: [], supabase_error: error.message },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, missing_env: [], supabase_error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[health] Supabase check failed:", message)
    return NextResponse.json(
      { ok: false, missing_env: [], supabase_error: message },
      { status: 502 }
    )
  }
}
