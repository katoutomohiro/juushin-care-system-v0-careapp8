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

    // Query care receivers with service_code filtering
    // care_receivers.service_code stores the service slug directly (e.g., "life-care", "after-school")
    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .select("id, code, display_name, age, gender, care_level, condition, medical_care, created_at, updated_at")
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
      name: row.display_name || row.code, // fallback to code if display_name is empty
      age: row.age,
      gender: row.gender,
      care_level: row.care_level,
      condition: row.condition,
      medical_care: row.medical_care,
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
/**
 * POST /api/care-receivers/list
 * 
 * Create a new care receiver
 * 
 * Body:
 *   - code: string (required, unique identifier)
 *   - display_name: string (required, user-facing name)
 *   - service_code: string (required, "life-care" | "after-school" | etc.)
 *   - age?: number
 *   - gender?: string
 *   - care_level?: number
 *   - condition?: string
 *   - medical_care?: string
 *   - notes?: string
 * 
 * Returns:
 *   - Success: { ok: true, user: {...} }
 *   - Error: { ok: false, error: "message" }
 */
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const {
      code,
      display_name,
      service_code,
      age,
      gender,
      care_level,
      condition,
      medical_care,
      notes,
    } = body

    // Validation
    if (!code || !display_name || !service_code) {
      return NextResponse.json(
        {
          ok: false,
          error: "code, display_name, and service_code are required",
        },
        { status: 400 }
      )
    }

    // Check if code already exists
    const { data: existing } = await supabaseAdmin
      .from("care_receivers")
      .select("id")
      .eq("code", code)
      .eq("service_code", service_code)
      .single()

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Code "${code}" already exists in this service` },
        { status: 400 }
      )
    }

    // Create care receiver
    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .insert([
        {
          code,
          display_name,
          service_code,
          age,
          gender,
          care_level,
          condition,
          medical_care,
          notes,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[POST /api/care-receivers/list] Insert error:", error)
      return NextResponse.json(
        { ok: false, error: "Failed to create care receiver" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: data.id,
          code: data.code,
          name: data.display_name,
          service_code: data.service_code,
          age: data.age,
          gender: data.gender,
          care_level: data.care_level,
          condition: data.condition,
          medical_care: data.medical_care,
          notes: data.notes,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[POST /api/care-receivers/list] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error", detail: message },
      { status: 500 }
    )
  }
}