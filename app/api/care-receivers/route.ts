import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import {
  ensureSupabaseAdmin,
  isRealPiiEnabled,
  missingFieldsResponse,
  omitPii,
  requireApiUser,
  supabaseErrorResponse,
  unauthorizedResponse,
  unexpectedErrorResponse,
  validateRequiredFields,
} from "@/lib/api/route-helpers"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers?serviceId=life-care
 *
 * Response:
 *   { ok: true, careReceivers: [...], count: number, serviceCode: string }
 *   { ok: false, careReceivers: [], count: 0, error: string }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")

    const validation = validateRequiredFields({ serviceId }, ["serviceId"])
    if (!validation.valid) {
      return missingFieldsResponse(validation.missingFields.map(String))
    }

    const allowRealPii = isRealPiiEnabled()

    const { data: careReceivers, error } = await supabaseAdmin!
      .from("care_receivers")
      .select("*")
      .eq("service_code", serviceId)
      .eq("is_active", true)
      .order("name")

    if (error) {
      return supabaseErrorResponse("care-receivers GET", error, {
        serviceCode: serviceId,
        careReceivers: [],
        count: 0,
      })
    }

    const filteredCareReceivers = allowRealPii
      ? (careReceivers ?? [])
      : (careReceivers ?? []).map((row: Record<string, unknown>) => omitPii(row))

    return NextResponse.json(
      {
        ok: true,
        serviceCode: serviceId,
        careReceivers: filteredCareReceivers,
        count: filteredCareReceivers.length,
      },
      { status: 200 }
    )
  } catch (error) {
    return unexpectedErrorResponse("care-receivers GET", error)
  }
}