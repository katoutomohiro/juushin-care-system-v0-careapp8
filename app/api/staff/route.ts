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

/**
 * PUT /api/staff
 * Body:
 *   - id: uuid (required)
 *   - name: string (optional)
 *   - sortOrder: number (optional)
 *   - isActive: boolean (optional)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    
    if (!body?.id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      console.error("[PUT /api/staff] Supabase admin not available")
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      )
    }

    // Build update object
    const updates: Record<string, any> = {}
    
    if (body.name !== undefined) {
      updates.name = String(body.name).trim()
      if (!updates.name) {
        return NextResponse.json(
          { error: "name cannot be empty" },
          { status: 400 }
        )
      }
    }
    
    if (body.sortOrder !== undefined) {
      updates.sort_order = parseInt(String(body.sortOrder), 10)
      if (isNaN(updates.sort_order)) {
        return NextResponse.json(
          { error: "sortOrder must be a number" },
          { status: 400 }
        )
      }
    }
    
    if (body.isActive !== undefined) {
      updates.is_active = Boolean(body.isActive)
    }

    // Ensure at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("staff")
      .update(updates)
      .eq("id", body.id)
      .select("id, name, sort_order, is_active")
      .single()

    if (error) {
      console.error("[PUT /api/staff] Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to update staff", detail: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      staff: data,
    })
  } catch (error) {
    console.error("[PUT /api/staff] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
