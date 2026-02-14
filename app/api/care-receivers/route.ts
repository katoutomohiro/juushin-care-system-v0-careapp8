import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { 
  requireApiUser, 
  unauthorizedResponse,
  ensureSupabaseAdmin,
  unexpectedErrorResponse,
  jsonError
} from "@/lib/api/route-helpers"
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
 *   - List mode: { ok: true, careReceivers: [...], count: number }
 *   - Single mode: { ok: true, careReceiver: {...} }
 *   - Error: { ok: false, status: string, error: string }
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
      return jsonError("id or code or serviceId is required", 400, { 
        ok: false,
        extra: { status: "invalid_parameters" }
      })
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      console.error("[care-receivers] Supabase admin not available")
      return jsonError("Database connection not available", 503, { 
        ok: false,
        extra: { status: "database_unavailable" }
      })
    }

    // LIST MODE: Get all care receivers for a service
    if (serviceId) {
      let query = supabaseAdmin!
        .from("care_receivers")
        .select("id, code, name, age, gender, care_level, condition, medical_care", { count: 'exact' })

      query = query.eq("service_id", serviceId).eq("is_active", true)

      const { data, error, count } = await query

      if (error) {
        console.error("[care-receivers list] Query failed for serviceId:", serviceId, "Error:", error.message)
        return NextResponse.json(
          { 
            ok: false, 
            status: "database_error", 
            error: "データ取得に失敗しました",
            supabase_error: error.message 
          },
          { status: 502 }
        )
      }

      const resultCount = count ?? data?.length ?? 0
      console.log(`[care-receivers list] Fetched ${resultCount} records for serviceId: ${serviceId}`)
      
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
        count: resultCount
      })
    }

    // SINGLE MODE: Get care receiver by id or code
    const normalizedCode = codeInput ? normalizeUserId(codeInput) : null

    let query = supabaseAdmin!
      .from("care_receivers")
      .select("id, code, name, age, gender, care_level, condition, medical_care")

    if (id) {
      query = query.eq("id", id)
    } else if (normalizedCode) {
      query = query.eq("code", normalizedCode)
    } else {
      return jsonError("Invalid code", 400, { ok: false, extra: { status: "invalid_code" } })
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error("[care-receivers single] Query failed:", error.message)
      return NextResponse.json(
        { 
          ok: false, 
          status: "database_error", 
          error: "データ取得に失敗しました",
          supabase_error: error.message 
        },
        { status: 502 }
      )
    }

    if (!data) {
      return jsonError("care_receiver not found", 404, { ok: false, extra: { status: "not_found" } })
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
    console.error("[care-receivers] Unexpected error:", error)
    return unexpectedErrorResponse('care-receivers GET', error)
  }
}