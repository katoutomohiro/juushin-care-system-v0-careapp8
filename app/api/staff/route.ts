import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/staff
 * Query params:
 *   - serviceId: uuid (required)
 *   - activeOnly: boolean (optional, default: true)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      console.error("[GET /api/staff] Supabase admin not available")
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      )
    }

    // Build query
    let query = supabaseAdmin
      .from("staff")
      .select("id, name, sort_order, is_active")
      .eq("service_id", serviceId)
      .order("sort_order", { ascending: true })

    // Filter active only if requested
    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("[GET /api/staff] Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to fetch staff", detail: error.message },
        { status: 500 }
      )
    }

    // Transform to options format for UI
    const staffOptions = (data || []).map((staff) => ({
      value: staff.id,
      label: staff.name,
    }))

    return NextResponse.json({
      ok: true,
      staff: data,
      staffOptions,
    })
  } catch (error) {
    console.error("[GET /api/staff] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
