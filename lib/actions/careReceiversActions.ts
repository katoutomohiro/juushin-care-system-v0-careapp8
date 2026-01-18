"use server"

import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

/**
 * Server Action: updateCareReceiverName
 * 
 * 設計判断：
 * - 利用者情報更新は管理権限必須
 * - Server Action で権限チェック実装予定
 * - RLS 信頼（client 権限なし）
 */
export async function updateCareReceiverName(
  code: string,
  name: string
) {
  try {
    if (!supabaseAdmin) {
      return {
        ok: false,
        error: "Database not available",
      }
    }

    const { data, error } = await supabaseAdmin
      .from("care_receivers")
      .update({ name: name.trim() })
      .eq("code", code)
      .select("id, code, name")

    if (error) {
      console.error("[updateCareReceiverName] Supabase error:", error)
      return {
        ok: false,
        error: error.message || "Failed to update care receiver",
      }
    }

    if (!data || data.length === 0) {
      return {
        ok: false,
        error: `Care receiver not found: code=${code}`,
      }
    }

    const updated = data[0]
    return {
      ok: true,
      data: updated,
      message: `Name updated to "${name}"`,
    }
  } catch (err: any) {
    console.error("[updateCareReceiverName] Unexpected error:", err)
    return {
      ok: false,
      error: err.message || "Internal server error",
    }
  }
}
