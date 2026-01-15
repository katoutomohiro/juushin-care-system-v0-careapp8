import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers/list
 * 
 * Query params:
 *   - serviceCode: "life-care" | "after-school" | etc. (required for list mode)
 * 
 * Returns: { ok: true, users: [...] } or { ok: false, error: "message" }
 * Always returns HTTP 200 (never 400/500) to avoid client-side fetch errors
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const serviceCode = searchParams.get("serviceCode")

    // No service code provided
    if (!serviceCode) {
      return NextResponse.json(
        { ok: false, error: "serviceCode parameter is required" },
        { status: 200 },
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 200 },
      )
    }

    // Query care receivers by service_code
    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .select(
        "id, code, display_name, age, gender, care_level, condition, medical_care"
      )
      .eq("service_code", serviceCode)
      .order("display_name", { ascending: true })

    if (error) {
      console.error("[GET /api/care-receivers/list] Supabase query error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      return NextResponse.json(
        { ok: false, error: "Failed to fetch care receivers", detail: error.message },
        { status: 200 },
      )
    }

    // Map database columns to API response format
    const users = (data || []).map((row: any) => ({
      id: row.id,
      code: row.code,
      name: row.display_name,
      age: row.age,
      gender: row.gender,
      careLevel: row.care_level,
      condition: row.condition,
      medicalCare: row.medical_care,
    }))

    return NextResponse.json({
      ok: true,
      users,
      count: users.length,
    })
  } catch (error) {
    console.error("[GET /api/care-receivers/list] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 200 },
    )
  }
}
