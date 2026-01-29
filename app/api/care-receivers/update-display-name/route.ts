import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { normalizeUserId } from "@/lib/ids/normalizeUserId"
import { 
  requireApiUser, 
  unauthorizedResponse,
  unexpectedErrorResponse,
  ensureSupabaseAdmin
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
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          detail: "Request body must be a JSON object",
        },
        { status: 400 }
      )
    }

    const { code, name } = body
    if (!code || typeof code !== "string" || !name || typeof name !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing or invalid required fields",
          detail: "code and name must be non-empty strings",
        },
        { status: 400 }
      )
    }

    // Normalize the code to match care_receivers.code
    const normalizedCode = normalizeUserId(code)
    const trimmedName = name.trim()

    if (!normalizedCode || !trimmedName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid input after normalization",
          detail: "code and name cannot be empty after normalization",
        },
        { status: 400 }
      )
    }

    // Update care_receivers.name where code = normalizedCode
    const { data: updatedRows, error } = await supabaseAdmin!
      .from("care_receivers")
      .update({ name: trimmedName })
      .eq("code", normalizedCode)
      .select("id, code, name")

    if (error) {
      console.error("[care-receivers/update-name] Supabase update failed:", {
        code: normalizedCode,
        name: trimmedName,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to update care_receiver",
          detail: error.message || "Unknown database error",
        },
        { status: 400 }
      )
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "care_receiver not found",
          detail: `No care_receiver found with code='${normalizedCode}'`,
        },
        { status: 404 }
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


