"use server"

import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

/**
 * Server Action: updateStaff
 * 
 * 設計判断：
 * - service_role_key を使用（Server Action 内でのみ利用可能）
 * - RLS ポリシーで追加の権限チェック可能（service_id フィルタ）
 * - Client から直接 fetch しない（Server Action 呼び出し）
 * - UI はそのままで、通信フローのみ変更
 */
export async function updateStaff(
  serviceId: string,
  staffId: string,
  payload: {
    name?: string
    sortOrder?: number
    isActive?: boolean
  }
) {
  try {
    if (!supabaseAdmin) {
      return {
        ok: false,
        error: "Database not available",
      }
    }

    const updateData: Record<string, any> = {}
    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.sortOrder !== undefined) updateData.sort_order = payload.sortOrder
    if (payload.isActive !== undefined) updateData.is_active = payload.isActive

    const { data, error } = await supabaseAdmin
      .from("staff")
      .update(updateData)
      .eq("id", staffId)
      .eq("service_id", serviceId)
      .select("id, name, sort_order, is_active, service_id")
      .single()

    if (error) {
      console.error("[updateStaff] Supabase error:", error)
      return {
        ok: false,
        error: error.message || "Failed to update staff",
      }
    }

    return {
      ok: true,
      data: {
        id: data.id,
        name: data.name,
        sortOrder: data.sort_order ?? 0,
        isActive: data.is_active,
        serviceId: data.service_id,
      },
    }
  } catch (err: any) {
    console.error("[updateStaff] Unexpected error:", err)
    return {
      ok: false,
      error: err.message || "Internal server error",
    }
  }
}
