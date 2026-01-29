import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { requireApiUser, unauthorizedResponse } from "@/lib/api/route-helpers"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers
 * Query params:
 *   - id: uuid (single record lookup)
 *   - code: care_receivers.code (single record lookup)
 *   - serviceId: uuid (list all receivers for this service)
 *
 * Returns:
 *   - List mode: { ok: true, careReceivers: [...] }
 *   - Single mode: { ok: true, careReceiver: {...} }
 *   - Error: { ok: false, error: "message" } (200 status)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const codeInput = searchParams.get("code")
    const serviceId = searchParams.get("serviceId")

    // No required parameters provided
    if (!id && !codeInput && !serviceId) {
      return NextResponse.json(
        { ok: false, error: "id or code or serviceId is required" },
        { status: 200 }, // Use 200 to avoid console 400 spam
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { ok: false, error: "Database connection not available" },
        { status: 200 },
      )
    }

    // LIST MODE: Get all care receivers for a service
    if (serviceId) {
      let query = supabaseAdmin
        .from("care_receivers")
        .select("id, code, name, age, gender, care_level, condition, medical_care")

      query = query.eq("service_id", serviceId)

      const { data, error } = await query

      if (error) {
        console.error("[GET /api/care-receivers] List query error:", {
          message: error.message,
          code: error.code,
          details: error.details,
        })
        return NextResponse.json(
          { ok: false, error: "Failed to fetch care receivers", detail: error.message },
          { status: 200 },
        )
      }

      return NextResponse.json({
        ok: true,
        careReceivers: (data || []).map((row: any) => ({
          id: row.id,
          code: row.code,
          name: row.name,
          age: row.age,
          gender: row.gender,
          careLevel: row.care_level,
          condition: row.condition,
          medicalCare: row.medical_care,
        })),
      })
    }

    // SINGLE MODE: Get care receiver by id or code
    const normalizedCode = codeInput ? normalizeUserId(codeInput) : null

    let query = supabaseAdmin
      .from("care_receivers")
      .select("id, code, name, age, gender, care_level, condition, medical_care")

    if (id) {
      query = query.eq("id", id)
    } else if (normalizedCode) {
      query = query.eq("code", normalizedCode)
    } else {
      return NextResponse.json(
        { ok: false, error: "Invalid code" },
        { status: 200 },
      )
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error("[GET /api/care-receivers] Supabase query error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      return NextResponse.json(
        { ok: false, error: "Failed to fetch care receiver", detail: error.message },
        { status: 200 },
      )
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "care_receiver not found" },
        { status: 200 },
      )
    }

    return NextResponse.json({
      ok: true,
      careReceiver: {
        id: data.id,
        code: data.code,
        name: data.name,
        age: data.age,
        gender: data.gender,
        careLevel: data.care_level,
        condition: data.condition,
        medicalCare: data.medical_care,
      },
    })
  } catch (error) {
    console.error("[GET /api/care-receivers] Unexpected error:", error)
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 200 },
    )
  }
}
