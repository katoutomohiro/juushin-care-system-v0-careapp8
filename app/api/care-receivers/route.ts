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

    let query = supabaseAdmin
      .from("care_receivers")
      .select("id, code, name, service_id")

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

    if (error) {
      console.error("[GET /api/care-receivers] Supabase error:", error)
      return NextResponse.json(
        { ok: false, error: "Failed to fetch care receiver", detail: error.message },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "care_receiver not found" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      ok: true,
      careReceiver: {
        id: data.id,
        code: data.code,
        name: data.name,
        serviceId: data.service_id,
      },
    })
  } catch (error) {
    console.error("[GET /api/care-receivers] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 },
    )
  }
}
