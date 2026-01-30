import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { 
  isRealPiiEnabled, 
  piiDisabledResponse, 
  requireApiUser, 
  unauthorizedResponse, 
  withPii,
  unexpectedErrorResponse,
  ensureSupabaseAdmin,
  jsonError
} from "@/lib/api/route-helpers"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers/[id]
 * 
 * Fetch a single care receiver by ID
 * 
 * Returns:
 *   - Success: { ok: true, user: {...} }
 *   - Error: { ok: false, error: "message" }
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const allowRealPii = isRealPiiEnabled()
    const { id } = await context.params

    if (!id) {
      return jsonError("ID parameter is required", 400, { ok: false })
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    const { data, error } = await supabaseAdmin!
      .from("care_receivers")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("[GET /api/care-receivers/[id]] Query error:", error)
      return jsonError("Care receiver not found", 404, { ok: false })
    }

    // ⚠️ 個人情報を含むレスポンス（職員UIでは必要、ただしログには出力しない）
    const baseUser = {
      id: data.id,
      code: data.code,
      name: data.name,
      display_name: data.display_name,
      notes: data.notes,
      service_code: data.service_code,
      age: data.age,
      gender: data.gender,
      care_level: data.care_level,
      condition: data.condition,
      medical_care: data.medical_care,
      medical_care_detail: data.medical_care_detail,
      is_active: data.is_active,
      version: data.version,                  // 🔐 楽観ロック用
      created_at: data.created_at,
      updated_at: data.updated_at,
      updated_by: data.updated_by,
    }

    const userWithPii = withPii(
      baseUser,
      {
        full_name: data.full_name,
        birthday: data.birthday,
        address: data.address,
        phone: data.phone,
        emergency_contact: data.emergency_contact,
      },
      allowRealPii,
    )

    return NextResponse.json({
      ok: true,
      user: userWithPii,
    })
  } catch (error) {
    return unexpectedErrorResponse('care-receivers/[id] GET', error)
  }
}

/**
 * PUT /api/care-receivers/[id]
 * 
 * Update a care receiver with optimistic locking (version check)
 * 
 * Body:
 *   - version (number): Current version for optimistic locking
 *   - Other fields: Partial care receiver object (any field can be updated)
 * 
 * Returns:
 *   - Success: { ok: true, user: {...} }
 *   - 409 Conflict: { ok: false, error: "Record has been updated by another user" }
 *   - Error: { ok: false, error: "message" }
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const { id } = await context.params

    if (!id) {
      return jsonError("ID parameter is required", 400, { ok: false })
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    const body = await req.json()

    const allowRealPii = isRealPiiEnabled()
    if (!allowRealPii) {
      const piiKeys = ["full_name", "birthday", "address", "phone", "emergency_contact"]
      const hasPii = piiKeys.some((key) => Object.prototype.hasOwnProperty.call(body, key))
      if (hasPii) {
        return piiDisabledResponse()
      }
    }

    // 🔐 楽観ロック: version を取得
    const currentVersion = body.version !== undefined ? body.version : null

    // Validate age if provided
    if (typeof body.age !== "undefined" && body.age < 0) {
      return jsonError("age must be >= 0", 400, { ok: false })
    }

    // Remove system fields that shouldn't be updated
    const updateData: any = { ...body }
    delete updateData.id
    delete updateData.created_at
    delete updateData.service_id  // Don't allow changing service_id
    delete updateData.code  // Don't allow changing code (unique identifier)
    delete updateData.version  // version は DB トリガーで自動インクリメント

    // 🔐 UPDATE クエリ構築: version チェック付き
    let updateQuery = supabaseAdmin!
      .from("care_receivers")
      .update(updateData)
      .eq("id", id)

    // version が指定されている場合のみチェック
    if (currentVersion !== null) {
      updateQuery = updateQuery.eq("version", currentVersion)
    }

    const { data, error, count: _count } = await updateQuery
      .select()
      .single()

    // 🔐 409 Conflict: 更新件数が 0 件 = 他のユーザーが先に更新済み
    if (!data && !error) {
      return jsonError("Record has been updated by another user", 409, { ok: false })
    }

    if (error) {
      // PostgrestError code 406 は .single() でレコードが見つからない場合
      if (error.code === "PGRST116") {
        return jsonError("Record has been updated by another user", 409, { ok: false })
      }

      console.error("[PUT /api/care-receivers/[id]] Update error:", error)
      return jsonError("Failed to update care receiver", 500, { ok: false })
    }

    // ⚠️ 個人情報のログ出力禁止: full_name, address, phone などは除外
    const sanitizedResponse = {
      id: data.id,
      code: data.code,
      name: data.name,
      display_name: data.display_name,
      service_code: data.service_code,
      age: data.age,
      gender: data.gender,
      care_level: data.care_level,
      condition: data.condition,
      medical_care: data.medical_care,
      medical_care_detail: data.medical_care_detail,
      is_active: data.is_active,
      version: data.version,  // 🔐 新しい version を返す
      created_at: data.created_at,
      updated_at: data.updated_at,
      updated_by: data.updated_by,
      // full_name, birthday, address, phone, emergency_contact は含めない（ログ出力防止）
    }

    return NextResponse.json({
      ok: true,
      user: sanitizedResponse,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[PUT /api/care-receivers/[id]] Unexpected error:", error)
    return jsonError("Internal server error", 500, { ok: false, detail: message })
  }
}

/**
 * DELETE /api/care-receivers/[id]
 * 
 * Delete a care receiver
 * 
 * Returns:
 *   - Success: { ok: true }
 *   - Error: { ok: false, error: "message" }
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const { id } = await context.params

    if (!id) {
      return jsonError("ID parameter is required", 400, { ok: false })
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    const { error } = await supabaseAdmin!
      .from("care_receivers")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[DELETE /api/care-receivers/[id]] Delete error:", error)
      return jsonError("Failed to delete care receiver", 500, { ok: false })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[DELETE /api/care-receivers/[id]] Unexpected error:", error)
    return jsonError("Internal server error", 500, { ok: false, detail: message })
  }
}
