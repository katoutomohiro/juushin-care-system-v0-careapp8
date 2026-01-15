import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers/list
 * 
 * Query params:
 *   - serviceCode: "life-care" | "after-school" | etc. (required)
 * 
 * Returns:
 *   - Success: { ok: true, users: [...], count: number }
 *   - Error: { ok: false, error: "message", detail?: "..." }
 * 
 * Note: Always returns HTTP 200/500 (never 400) to avoid client fetch errors on params
 * Errors are always logged to console for debugging
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const serviceCode = searchParams.get("serviceCode")

    console.log("[GET /api/care-receivers/list] Request received", {
      serviceCode,
    })

    // serviceCode is required for this endpoint
    if (!serviceCode) {
      const error = "serviceCode parameter is required"
      console.error("[GET /api/care-receivers/list]", error)
      return NextResponse.json(
        { ok: false, error },
        { status: 400 },
      )
    }

    if (!supabaseAdmin) {
      const error = "Database connection not available"
      console.error("[GET /api/care-receivers/list]", error)
      return NextResponse.json(
        { ok: false, error },
        { status: 500 },
      )
    }

    // Query care receivers by service_code
    // Select all necessary columns for display
    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .select(
        "id, code, display_name, age, gender, care_level, condition, medical_care, service_code, created_at, updated_at"
      )
      .eq("service_code", serviceCode)
      .order("display_name", { ascending: true })

    if (error) {
      console.error("[GET /api/care-receivers/list] Supabase query error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to fetch care receivers",
          detail: error.message,
        },
        { status: 500 },
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
      serviceCode: row.service_code,
    }))

    console.log("[GET /api/care-receivers/list] Success", {
      serviceCode,
      count: users.length,
    })

    return NextResponse.json({
      ok: true,
      users,
      count: users.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[GET /api/care-receivers/list] Unexpected error:", {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
        detail: message,
      },
      { status: 500 },
    )
  }
}
