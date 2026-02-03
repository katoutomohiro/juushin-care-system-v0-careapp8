import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  ensureSupabaseAdmin,
  validateRequiredFields,
  missingFieldsResponse,
  supabaseErrorResponse
} from "@/lib/api/route-helpers"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/staff
 * Query params:
 *   - serviceId: uuid (required)
 *   - activeOnly: boolean (optional, default: true)
 *
 * Client公開API：認証必須 + RLS自動適用 + anon key使用
 * 設計判断：
 * - createRouteHandlerClient(cookies) でセッション自動バインド
 * - read-only アクセス
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(false)
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const validation = validateRequiredFields(
      { serviceId },
      ['serviceId']
    )
    if (!validation.valid) {
      return missingFieldsResponse(validation.missingFields.map(String))
    }

    // Build query
    let query = supabaseAdmin!
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
      return supabaseErrorResponse('staff GET', error)
    }

    const staffList = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      sortOrder: row.sort_order ?? 0,
      isActive: row.is_active,
      serviceId: row.service_id,
    }))

    const staffOptions = staffList.map((staff: any) => ({ value: staff.id, label: staff.name }))

    return NextResponse.json({
      ok: true,
      staff: staffList,
      staffOptions,
    })
  } catch (error) {
    return unexpectedErrorResponse('staff GET', error)
  }
}
