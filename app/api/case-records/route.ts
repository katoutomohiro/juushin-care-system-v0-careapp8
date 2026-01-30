import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  getPaginationParams,
  validateRequiredFields,
  missingFieldsResponse,
  ensureSupabaseAdmin,
  validateUUIDs,
  supabaseErrorResponse
} from "@/lib/api/route-helpers"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    // Validate Supabase admin client
    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId") || null
    const careReceiverId = searchParams.get("careReceiverId") || null
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const { limit, offset } = getPaginationParams(
      searchParams.get("limit"),
      searchParams.get("offset"),
      { limit: 20, minLimit: 1, maxLimit: 100, defaultOffset: 0 }
    )

    if (process.env.NODE_ENV === "development") {
      console.info("[case-records GET] Query params", {
        serviceId,
        careReceiverId,
        dateFrom,
        dateTo,
        limit,
        offset,
      })
    }

    // Validate required parameters
    const validation = validateRequiredFields(
      { serviceId, careReceiverId },
      ['serviceId', 'careReceiverId']
    )
    if (!validation.valid) {
      return missingFieldsResponse(validation.missingFields.map(String))
    }

    // Validate UUIDs
    const uuidValidation = validateUUIDs(
      { serviceId, careReceiverId },
      ['serviceId', 'careReceiverId']
    )
    if (!uuidValidation.valid && uuidValidation.response) {
      return uuidValidation.response
    }

    // Build query
    let query = supabaseAdmin!
      .from("case_records")
      .select("id, service_id, care_receiver_id, record_date, record_time, record_data, created_at", { count: "exact" })
      .eq("service_id", serviceId!)
      .eq("care_receiver_id", careReceiverId!)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Optional date filters
    if (dateFrom) {
      query = query.gte("record_date", dateFrom)
    }
    if (dateTo) {
      query = query.lte("record_date", dateTo)
    }

    const { data, error, count } = await query

    if (error) {
      return supabaseErrorResponse('case-records GET', error)
    }

    return NextResponse.json(
      {
        ok: true,
        records: data || [],
        pagination: {
          limit,
          offset,
          count: count ?? (data?.length ?? 0),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    return unexpectedErrorResponse('case-records GET', error)
  }
}
