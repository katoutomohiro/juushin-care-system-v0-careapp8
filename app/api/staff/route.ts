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
      .select("id, name, sort_order, is_active, service_id")
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

    const staffList = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active,
      serviceId: row.service_id,
    }))

    // Filter by isActive only if activeOnly is true (but activeOnly is already applied in the query)
    // So staffOptions will only contain active staff
    const staffOptions = staffList.map((staff) => ({ value: staff.id, label: staff.name }))

    return NextResponse.json({
      ok: true,
      staff: staffList,
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
 *   - serviceId: uuid (required)
 *   - staff: Array<{
 *       id?: uuid
 *       name: string
 *       sort_order?: number
 *       is_active?: boolean
 *     }>
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    
    const id = body?.id
    const serviceId = body?.serviceId || body?.service_id
    const name = body?.name
    const sortOrder = body?.sortOrder ?? body?.sort_order
    const isActive = body?.isActive ?? body?.is_active

    // Validation
    if (!serviceId || typeof serviceId !== "string") {
      return NextResponse.json(
        { ok: false, error: "serviceId is required" },
        { status: 400 }
      )
    }
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { ok: false, error: "id is required" },
        { status: 400 }
      )
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: "name is required and must be a string" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      console.error("[PUT /api/staff] Supabase admin not available")
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 503 }
      )
    }

    // Build update object
    const updates: Record<string, any> = {
      name: name.trim(),
      service_id: serviceId,
      updated_at: new Date().toISOString(),
    }
    if (sortOrder !== undefined && sortOrder !== null) {
      updates.sort_order = Number.parseInt(String(sortOrder), 10)
    }
    if (isActive !== undefined && isActive !== null) {
      updates.is_active = Boolean(isActive)
    }

    // Verify staff belongs to service before updating
    const { data: existingStaff, error: existingError } = await supabaseAdmin
      .from("staff")
      .select("id, service_id")
      .eq("id", id)
      .maybeSingle()

    if (existingError) {
      console.error("[PUT /api/staff] Lookup error:", existingError)
      return NextResponse.json(
        { ok: false, error: "Failed to verify staff", detail: existingError.message },
        { status: 500 }
      )
    }

    if (!existingStaff) {
      return NextResponse.json(
        { ok: false, error: "Staff not found" },
        { status: 404 }
      )
    }

    if (existingStaff.service_id !== serviceId) {
      return NextResponse.json(
        { ok: false, error: "Service mismatch", detail: "Staff does not belong to specified service" },
        { status: 403 }
      )
    }

    // Update staff
    const { data: updatedStaff, error: updateError } = await supabaseAdmin
      .from("staff")
      .update(updates)
      .eq("id", id)
      .select("id, name, sort_order, is_active, service_id")
      .single()

    if (updateError) {
      console.error("[PUT /api/staff] Update error:", updateError)
      return NextResponse.json(
        { ok: false, error: "Failed to update staff", detail: updateError.message },
        { status: 500 }
      )
    }

    if (!updatedStaff) {
      return NextResponse.json(
        { ok: false, error: "No data returned from database" },
        { status: 500 }
      )
    }

    const staff = {
      id: updatedStaff.id,
      name: updatedStaff.name,
      sortOrder: updatedStaff.sort_order ?? 0,
      isActive: updatedStaff.is_active,
      serviceId: updatedStaff.service_id,
    }

    return NextResponse.json({
      ok: true,
      staff,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[PUT /api/staff] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/staff
 * Body:
 *   - serviceId: uuid (required)
 *   - name: string (required)
 *   - sort_order?: number (optional, defaults to max+1)
 *   - is_active?: boolean (optional, defaults to true)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const serviceId = body?.serviceId || body?.service_id
    const name = body?.name
    const sortOrder = body?.sortOrder ?? body?.sort_order
    const isActive = body?.isActive ?? body?.is_active ?? true

    // Validation
    if (!serviceId || typeof serviceId !== "string") {
      return NextResponse.json(
        { ok: false, error: "serviceId is required" },
        { status: 400 }
      )
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: "name is required and must be a string" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      console.error("[POST /api/staff] Supabase admin not available")
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 503 }
      )
    }

    // Get max sort_order for this service
    const { data: maxOrderData, error: maxOrderError } = await supabaseAdmin
      .from("staff")
      .select("sort_order")
      .eq("service_id", serviceId)
      .order("sort_order", { ascending: false })
      .limit(1)

    if (maxOrderError) {
      console.error("[POST /api/staff] Max order lookup error:", maxOrderError)
      return NextResponse.json(
        { ok: false, error: "Failed to determine sort order", detail: maxOrderError.message },
        { status: 500 }
      )
    }

    const maxOrder = (maxOrderData && maxOrderData.length > 0) ? (maxOrderData[0]?.sort_order ?? 0) : 0
    const newSortOrder = sortOrder !== undefined && sortOrder !== null ? Number.parseInt(String(sortOrder), 10) : maxOrder + 1

    // Create new staff record
    const { data: newStaff, error: createError } = await supabaseAdmin
      .from("staff")
      .insert({
        service_id: serviceId,
        name: name.trim(),
        sort_order: newSortOrder,
        is_active: Boolean(isActive),
      })
      .select("id, name, sort_order, is_active, service_id")
      .single()

    if (createError) {
      console.error("[POST /api/staff] Create error:", createError)
      return NextResponse.json(
        { ok: false, error: "Failed to create staff", detail: createError.message },
        { status: 500 }
      )
    }

    if (!newStaff) {
      return NextResponse.json(
        { ok: false, error: "No data returned from database" },
        { status: 500 }
      )
    }

    const staff = {
      id: newStaff.id,
      name: newStaff.name,
      sortOrder: newStaff.sort_order ?? 0,
      isActive: newStaff.is_active,
      serviceId: newStaff.service_id,
    }

    return NextResponse.json(
      {
        ok: true,
        staff,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[POST /api/staff] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: message || "Internal server error" },
      { status: 500 }
    )
  }
}
