import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

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
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    if (!serviceId) {
      return NextResponse.json(
        { error: "serviceId is required" },
        { status: 400 }
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
    console.error("[GET /api/staff] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// NOTE: PUT / POST methods removed
// staff 更新は lib/actions/staffActions.ts に移行済み
// Client からは Server Action 経由で呼び出してください
