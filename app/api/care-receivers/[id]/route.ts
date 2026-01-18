import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers/[id]
 * 
 * Fetch a single care receiver by ID
 * 
 * Returns:
 *   - Success: { ok: true, user: {...} }
 *   - Error: { ok: false, error: "message" }
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID parameter is required" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 500 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("[GET /api/care-receivers/[id]] Query error:", error)
      return NextResponse.json(
        { ok: false, error: "Care receiver not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.id,
        code: data.code,
        name: data.name,
        service_code: data.service_code,
        age: data.age,
        gender: data.gender,
        care_level: data.care_level,
        condition: data.condition,
        medical_care: data.medical_care,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[GET /api/care-receivers/[id]] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error", detail: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/care-receivers/[id]
 * 
 * Update a care receiver
 * 
 * Body: Partial care receiver object (any field can be updated)
 * 
 * Returns:
 *   - Success: { ok: true, user: {...} }
 *   - Error: { ok: false, error: "message" }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID parameter is required" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 500 }
      )
    }

    const body = await req.json()

    // Validate age if provided
    if (typeof body.age !== "undefined" && body.age < 0) {
      return NextResponse.json(
        { ok: false, error: "age must be >= 0" },
        { status: 400 }
      )
    }

    // Remove system fields that shouldn't be updated
    const updateData: any = { ...body }
    delete updateData.id
    delete updateData.created_at
    delete updateData.service_id  // Don't allow changing service_id
    delete updateData.code  // Don't allow changing code (unique identifier)

    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[PUT /api/care-receivers/[id]] Update error:", error)
      return NextResponse.json(
        { ok: false, error: "Failed to update care receiver" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.id,
        code: data.code,
        name: data.name,
        service_code: data.service_code,
        age: data.age,
        gender: data.gender,
        care_level: data.care_level,
        condition: data.condition,
        medical_care: data.medical_care,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[PUT /api/care-receivers/[id]] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error", detail: message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/care-receivers/[id]
 * 
 * Delete a care receiver
 * 
 * Returns:
 *   - Success: { ok: true }
 *   - Error: { ok: false, error: "message" }
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID parameter is required" },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 500 }
      )
    }

    const { error } = await supabaseAdmin
      .from("care_receivers")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[DELETE /api/care-receivers/[id]] Delete error:", error)
      return NextResponse.json(
        { ok: false, error: "Failed to delete care receiver" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[DELETE /api/care-receivers/[id]] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error", detail: message },
      { status: 500 }
    )
  }
}
