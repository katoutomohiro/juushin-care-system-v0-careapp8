import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"
import { 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  ensureSupabaseAdmin,
  validateRequiredFields,
  missingFieldsResponse,
  jsonError,
  supabaseErrorResponse
} from "@/lib/api/route-helpers"

export const runtime = "nodejs"

/**
 * PUT /api/care-receivers/update-display-name
 * 
 * Updates the name for a care_receiver record.
 * 
 * Request body:
 * {
 *   "code": "AT",  // Normalized user code
 *   "name": "新しい名前"
 * }
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin, "Missing required Supabase environment variables")
    if (clientError) {
      return clientError
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return jsonError(
        'Invalid request body',
        400,
        {
          ok: false,
          detail: 'Request body must be a JSON object'
        }
      )
    }

    const { code, name } = body
    
    const validation = validateRequiredFields(
      { code, name },
      ['code', 'name']
    )
    if (!validation.valid) {
      return missingFieldsResponse(validation.missingFields.map(String))
    }
    
    if (typeof code !== "string" || typeof name !== "string") {
      return jsonError(
        'Invalid field types',
        400,
        {
          ok: false,
          detail: 'code and name must be strings'
        }
      )
    }

    // Normalize the code to match care_receivers.code
    const normalizedCode = normalizeUserId(code)
    const trimmedName = name.trim()

    if (!normalizedCode || !trimmedName) {
      return jsonError(
        'Invalid input after normalization',
        400,
        {
          ok: false,
          detail: 'code and name cannot be empty after normalization'
        }
      )
    }

    // Update care_receivers.name where code = normalizedCode
    const { data: updatedRows, error } = await supabaseAdmin!
      .from("care_receivers")
      .update({ name: trimmedName })
      .eq("code", normalizedCode)
      .select("id, code, name")

    if (error) {
      return supabaseErrorResponse('care-receivers/update-display-name PUT', error, {
        code: normalizedCode,
        name: trimmedName
      })
    }

    if (!updatedRows || updatedRows.length === 0) {
      return jsonError(
        'care_receiver not found',
        404,
        {
          ok: false,
          detail: `No care_receiver found with code='${normalizedCode}'`
        }
      )
    }

    const updated = updatedRows[0]
    console.log("[care-receivers/update-name] Successfully updated:", {
      id: updated.id,
      code: updated.code,
      name: updated.name,
    })

    return NextResponse.json({
      ok: true,
      data: updated,
      message: `Name updated to "${trimmedName}"`,
    })
  } catch (error) {
    return unexpectedErrorResponse('care-receivers/update-display-name PUT', error)
  }
}


