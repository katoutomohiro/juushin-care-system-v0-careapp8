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

    // Query care receivers with service information
    // First, get the service_id from the services table using the slug (serviceCode)
    const { data: serviceData, error: serviceError } = await supabaseAdmin
      .from("services")
      .select("id")
      .eq("slug", serviceCode)
      .single()

    if (serviceError || !serviceData) {
      const error = `Service not found: ${serviceCode}`
      console.error("[GET /api/care-receivers/list]", error, serviceError)
      return NextResponse.json(
        { ok: false, error },
        { status: 400 },
      )
    }

    const serviceId = serviceData.id

    // Query care receivers by service_id
    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .select("id, code, name, service_id, created_at, updated_at")
      .eq("service_id", serviceId)
      .order("name", { ascending: true })

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
      name: row.name,
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
