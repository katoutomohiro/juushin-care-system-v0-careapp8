"use server"

import { supabaseAdmin } from "@/lib/supabase/serverAdmin"

/**
 * Server Action: saveVoiceNote
 * 
 * 設計判断：
 * - 音声記録は user_id が必須（認証ユーザーのコンテキスト必要）
 * - service_role_key を使用（server-only で安全）
 * - cookies から user 情報を抽出（RLS enforcement）
 */
export async function saveVoiceNote(
  text: string,
  durationMs: number,
  avgLevel?: number,
  device?: string
) {
  try {
    if (!supabaseAdmin) {
      return {
        ok: false,
        error: "Database not available",
      }
    }

    // TODO: cookies から user_id を抽出（現在は client-side user 設定）
    // const user = await getUser() // 実装予定
    // user_id は temporary（実装予定）
    const userId = "temp-user-id"

    const { data, error } = await supabaseAdmin
      .from("voice_notes")
      .insert({
        user_id: userId,
        text: text.trim(),
        duration_ms: durationMs,
        avg_level: avgLevel ?? null,
        device: device ?? null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[saveVoiceNote] Supabase insert error:", error)
      return {
        ok: false,
        error: error.message || "Database insert failed",
      }
    }

    return {
      ok: true,
      id: data.id,
      message: "Voice note saved successfully",
    }
  } catch (err: any) {
    console.error("[saveVoiceNote] Unexpected error:", err)
    return {
      ok: false,
      error: err.message || "Internal server error",
    }
  }
}
