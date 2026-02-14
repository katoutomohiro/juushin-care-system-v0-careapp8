import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { 
  requireApiUser, 
  unauthorizedResponse,
  ensureSupabaseAdmin,
  unexpectedErrorResponse,
  supabaseErrorResponse,
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
      return jsonError("id or code or serviceId is required", 400, { ok: false })
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return jsonError("Database connection not available", 503, { ok: false })
    }

    // LIST MODE: Get all care receivers for a service
    if (serviceId) {
      let query = supabaseAdmin!
        .from("care_receivers")
        .select("id, code, name, age, gender, care_level, condition, medical_care")

      query = query.eq("service_id", serviceId)

      const { data, error } = await query

      if (error) {
        console.error("[care-receivers list] Query failed for serviceId:", serviceId, "Error:", error.message)
        return supabaseErrorResponse('care-receivers GET (list)', error)
      }

      const count = data?.length || 0
      console.log(`[care-receivers list] Fetched ${count} records for serviceId: ${serviceId}`)
      
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

    let query = supabaseAdmin!
      .from("care_receivers")
      .select("id, code, name, age, gender, care_level, condition, medical_care")

    if (id) {
      query = query.eq("id", id)
    } else if (normalizedCode) {
      query = query.eq("code", normalizedCode)
    } else {
      return jsonError("Invalid code", 400, { ok: false })
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      return supabaseErrorResponse('care-receivers GET (single)', error)
    }

    if (!data) {
      return jsonError("care_receiver not found", 404, { ok: false })
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
    return unexpectedErrorResponse('care-receivers GET', error)
  }
}
