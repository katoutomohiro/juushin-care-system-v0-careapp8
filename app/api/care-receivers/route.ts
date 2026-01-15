import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers
 * Query params:
 *   - id: uuid
 *   - code: care_receivers.code (normalized)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const codeInput = searchParams.get("code")

    if (!id && !codeInput) {
      return NextResponse.json(
        { ok: false, error: "id or code is required" },
        { status: 400 },
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 503 },
      )
    }

    const normalizedCode = codeInput ? normalizeUserId(codeInput) : null

    // Select only actual columns that exist in care_receivers table
    // Do NOT include service_id - it may not exist or be accessible
    let query = supabaseAdmin
      .from("care_receivers")
      .select("id, code, name")

    if (id) {
      query = query.eq("id", id)
    } else if (normalizedCode) {
      query = query.eq("code", normalizedCode)
    } else {
      return NextResponse.json(
        { ok: false, error: "Invalid code" },
        { status: 400 },
      )
    }

    const { data, error } = await query.maybeSingle()

    // Don't throw on Supabase error - return gracefully
    if (error) {
      console.error("[GET /api/care-receivers] Supabase query error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      // Return ok:false instead of 500 - let client decide what to do
      return NextResponse.json(
        { ok: false, error: "Failed to fetch care receiver", detail: error.message },
        { status: 200 }, // Use 200 so client doesn't treat as network error
      )
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "care_receiver not found" },
        { status: 200 }, // Use 200 to avoid fetch error handling
      )
    }

    return NextResponse.json({
      ok: true,
      careReceiver: {
        id: data.id,
        code: data.code,
        name: data.name,
        // Note: service_id is not returned - it's managed at a different layer
      },
    })
  } catch (error) {
    console.error("[GET /api/care-receivers] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 200 }, // Use 200 to avoid fetch error handling on client
    )
  }
}
