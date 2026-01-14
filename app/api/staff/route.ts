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

    const staffOptions = staffList
      .filter((staff) => staff.isActive)
      .map((staff) => ({ value: staff.id, label: staff.name }))

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
    const serviceId = body?.serviceId || body?.service_id
    const staffInputArray = Array.isArray(body?.staff)
      ? body.staff
      : body && typeof body === "object"
        ? [body]
        : null

    if (!serviceId || typeof serviceId !== "string") {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
      )
    }

    if (!staffInputArray || staffInputArray.length === 0) {
      return NextResponse.json(
        { error: "staff array is required" },
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
    const now = new Date().toISOString()
    const rows = staffInputArray.map((row: any) => {
      const trimmedName = typeof row?.name === "string" ? row.name.trim() : ""
      if (!trimmedName) {
        throw new Error("name cannot be empty")
      }
      const parsedSort = row?.sort_order ?? row?.sortOrder
      const sortOrder = parsedSort == null ? null : Number.parseInt(String(parsedSort), 10)
      if (sortOrder !== null && Number.isNaN(sortOrder)) {
        throw new Error("sort_order must be a number")
      }
      return {
        id: row?.id ?? undefined,
        service_id: serviceId,
        name: trimmedName,
        sort_order: sortOrder ?? 0,
        is_active: row?.is_active ?? row?.isActive ?? true,
        updated_at: now,
      }
    })

    const { data, error } = await supabaseAdmin
      .from("staff")
      .upsert(rows, { onConflict: "id" })
      .select("id, name, sort_order, is_active, service_id")
      .eq("service_id", serviceId)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("[PUT /api/staff] Supabase upsert error:", error)
      return NextResponse.json(
        { error: "Failed to upsert staff", detail: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      staff: data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[PUT /api/staff] Unexpected error:", error)
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 }
    )
  }
}
