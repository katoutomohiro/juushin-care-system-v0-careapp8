import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import {
  ensureSupabaseAdmin,
  isRealPiiEnabled,
  missingFieldsResponse,
  omitPii,
  requireApiUser,
  supabaseErrorResponse,
  unauthorizedResponse,
  unexpectedErrorResponse,
  validateRequiredFields,
  jsonError,
} from "@/lib/api/route-helpers"
import { requireServiceIdFromRequest, resolveServiceIdToUuid, assertServiceAssignment } from "@/lib/authz/serviceScope"
import { auditRead } from "@/lib/audit/writeAuditLog"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * GET /api/care-receivers?serviceId=life-care
 *
 * Authorization flow:
 * 1. requireApiUser() - verify authentication (401 if missing)
 * 2. requireServiceIdFromRequest() - extract serviceId parameter (400 if missing)
 * 3. resolveServiceIdToUuid() - normalize slug/UUID to service UUID (400/404 if invalid)
 * 4. assertServiceAssignment() - verify user has access to this service (403 if not)
 * 5. DB query scoped by service_id (UUID)
 * 6. auditRead() - log the operation (async, non-blocking)
 *
 * Response:
 *   { ok: true, careReceivers: [...], count: number, serviceCode: string }
 *   { ok: false, careReceivers: [], count: 0, error: string }
 */
export async function GET(req: NextRequest) {
  try {
    // STEP 1: Authentication
    const user = await requireApiUser()
    if (!user) {
      return unauthorizedResponse(true)
    }

    const clientError = ensureSupabaseAdmin(supabaseAdmin)
    if (clientError) {
      return clientError
    }

    // STEP 2: Extract and validate serviceSlug parameter (can be slug or UUID)
    let serviceSlug: string
    try {
      serviceSlug = requireServiceIdFromRequest(req)
    } catch (err) {
      if (err instanceof NextResponse) {
        return err
      }
      throw err
    }

    // STEP 3: Resolve serviceSlug (slug or UUID) to canonical service UUID
    const resolveResult = await resolveServiceIdToUuid(supabaseAdmin!, serviceSlug)
    if (resolveResult instanceof NextResponse) {
      return resolveResult
    }

    const { serviceUuid, serviceSlug: resolvedSlug } = resolveResult

    // STEP 4: Verify user has authorization to access this service
    const authzError = await assertServiceAssignment(supabaseAdmin!, user.id, serviceUuid)
    if (authzError) {
      return authzError
    }

    const allowRealPii = isRealPiiEnabled()

    // STEP 5: Query database scoped by facility_id (UUID)
    // care_receivers table is structured with facility_id foreign key
    const { data: careReceivers, error } = await supabaseAdmin!
      .from("care_receivers")
      .select("id, code, name, facility_id, service_code, created_at, is_active")
      .eq("facility_id", serviceUuid)
      .eq("is_active", true)
      .order("name")
      .order("code")

    // Handle specific database errors
    if (error) {
      // PGRST116 = "no rows returned from the query" → 200 with empty list
      if ((error as any).code === "PGRST116") {
        return NextResponse.json(
          {
            ok: true,
            careReceivers: [],
            count: 0,
            serviceSlug: resolvedSlug,
          },
          { status: 200 }
        )
      }
      
      // Other DB errors → 500 with structured log
      const anyError = error as Record<string, any>
      const errorLog = {
        message: anyError?.message || String(error),
        code: anyError?.code || "UNKNOWN",
        details: anyError?.details || null,
        hint: anyError?.hint || null,
        stack: anyError?.stack || null,
        userId: user.id,
        serviceUuid,
        serviceSlug: resolvedSlug,
        route: "/api/care-receivers"
      }
      console.error("[api/care-receivers] Database query error", JSON.stringify(errorLog))
      
      return jsonError(
        "Failed to fetch care receivers",
        500,
        { ok: false, detail: "Database error while querying care receivers" }
      )
    }

    const filteredCareReceivers = allowRealPii
      ? (careReceivers ?? [])
      : (careReceivers ?? []).map((row: Record<string, unknown>) => omitPii(row))

    // STEP 6: Log the operation (async, non-blocking)
    const count = filteredCareReceivers.length
    void auditRead(supabaseAdmin!, {
      actor_id: user.id,
      service_id: serviceUuid,
      resource_type: "care_receiver",
      resource_id: "list",
      count,
    })

    return NextResponse.json(
      {
        ok: true,
        careReceivers: filteredCareReceivers,
        count,
        serviceSlug: resolvedSlug,
      },
      { status: 200 }
    )
  } catch (error) {
    return unexpectedErrorResponse("care-receivers GET", error)
  }
}