"use server"

import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

export type CaseRecordPayload = {
  serviceId: string
  careReceiverId: string
  careReceiverCode?: string
  date: string
  recordTime?: string
  mainStaffId: string
  subStaffId?: string | null
  recordData?: Record<string, any>
}

/**
 * Server Action: saveCaseRecord
 * 
 * 設計判断：
 * - ケース記録保存は認可フロー必須（権限チェック）
 * - service_role_key を使用（Server Action 内でのみ利用可能）
 * - RLS ポリシーで追加の権限チェック可能（service_id フィルタ）
 * - Client から直接 fetch しない（Server Action 呼び出し）
 */
export async function saveCaseRecord(payload: CaseRecordPayload) {
  try {
    if (!supabaseAdmin) {
      return {
        ok: false,
        error: "Database not available",
      }
    }

    const insertData = {
      service_id: payload.serviceId,
      care_receiver_id: payload.careReceiverId,
      record_date: payload.date,
      record_time: payload.recordTime || null,
      main_staff_id: payload.mainStaffId,
      sub_staff_id: payload.subStaffId || null,
      record_data: payload.recordData || {},
    }

    const { data, error } = await supabaseAdmin
      .from("case_records")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("[saveCaseRecord] Supabase insert error:", error)
      return {
        ok: false,
        error: error.message || "Failed to save case record",
      }
    }

    return {
      ok: true,
      data,
      message: "Case record saved successfully",
    }
  } catch (err: any) {
    console.error("[saveCaseRecord] Unexpected error:", err)
    return {
      ok: false,
      error: err.message || "Internal server error",
    }
  }
}
