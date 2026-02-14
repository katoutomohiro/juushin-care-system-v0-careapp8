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
      { ok: false, status: "missing_env", missing_env: missingEnv },
      { status: 500 }
    )
  }

  try {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { error } = await admin.from("staff_profiles").select("id").limit(1)

    if (error) {
      console.error("[health] Supabase query failed:", error.message)
      return NextResponse.json(
        { ok: false, status: "database_error", error: error.message },
        { status: 502 }
      )
    }

    console.log("[health] Health check passed")
    return NextResponse.json({ ok: true, status: "healthy" })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[health] Supabase connection failed:", message)
    return NextResponse.json(
      { ok: false, status: "connection_error", error: message },
      { status: 502 }
    )
  }
}
