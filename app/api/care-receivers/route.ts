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

    // STEP 5: Query database based on actual care_receivers schema
    const { data: careReceiverColumns, error: careReceiverColumnsError } = await supabaseAdmin!
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", "care_receivers")

    if (careReceiverColumnsError) {
      const anyError = careReceiverColumnsError as Record<string, any>
      const errorLog = {
        code: anyError?.code || "UNKNOWN",
        message: anyError?.message || "Unknown error",
        details: anyError?.details || null,
        hint: anyError?.hint || null,
        stack: anyError?.stack || null,
        userId: user.id,
        serviceUuid,
        serviceSlug: resolvedSlug,
        route: "/api/care-receivers",
        step: "schema-check"
      }
      console.error("[api/care-receivers] Schema lookup error", JSON.stringify(errorLog))

      return jsonError(
        "Failed to fetch care receivers",
        500,
        { ok: false, detail: `Database error: ${anyError?.code || "UNKNOWN"} - ${anyError?.message || "Unknown error"}` }
      )
    }

    const careReceiverColumnSet = new Set(
      (careReceiverColumns ?? []).map((row: { column_name: string }) => row.column_name)
    )
    const hasServiceCode = careReceiverColumnSet.has("service_code")
    const hasServiceId = careReceiverColumnSet.has("service_id")
    const hasIsActive = careReceiverColumnSet.has("is_active")

    // Fetch services.code for filtering care_receivers
    let serviceCode = resolvedSlug
    if (hasServiceCode) {
      const { data: servicesColumns, error: servicesColumnsError } = await supabaseAdmin!
        .from("information_schema.columns")
        .select("column_name")
        .eq("table_schema", "public")
        .eq("table_name", "services")

      if (servicesColumnsError) {
        const anyError = servicesColumnsError as Record<string, any>
        const errorLog = {
          code: anyError?.code || "UNKNOWN",
          message: anyError?.message || "Unknown error",
          details: anyError?.details || null,
          hint: anyError?.hint || null,
          stack: anyError?.stack || null,
          userId: user.id,
          serviceUuid,
          serviceSlug: resolvedSlug,
          route: "/api/care-receivers",
          step: "services-schema-check"
        }
        console.error("[api/care-receivers] Schema lookup error", JSON.stringify(errorLog))

        return jsonError(
          "Failed to fetch care receivers",
          500,
          { ok: false, detail: `Database error: ${anyError?.code || "UNKNOWN"} - ${anyError?.message || "Unknown error"}` }
        )
      }

      const servicesColumnSet = new Set(
        (servicesColumns ?? []).map((row: { column_name: string }) => row.column_name)
      )
      const hasServicesCode = servicesColumnSet.has("code")

      const { data: serviceRow, error: serviceRowError } = await supabaseAdmin!
        .from("services")
        .select(hasServicesCode ? "code" : "slug")
        .eq("id", serviceUuid)
        .single()

      if (serviceRowError) {
        if ((serviceRowError as any).code === "PGRST116") {
          return jsonError(
            "Service not found",
            404,
            { ok: false, detail: "The requested service does not exist" }
          )
        }

        if ((serviceRowError as any).code?.includes("PGRST")) {
          return jsonError(
            "Service not found",
            404,
            { ok: false, detail: "The requested service does not exist" }
          )
        }

        const anyError = serviceRowError as Record<string, any>
        const errorLog = {
          code: anyError?.code || "UNKNOWN",
          message: anyError?.message || "Unknown error",
          details: anyError?.details || null,
          hint: anyError?.hint || null,
          stack: anyError?.stack || null,
          userId: user.id,
          serviceUuid,
          serviceSlug: resolvedSlug,
          route: "/api/care-receivers",
          step: "service-code-lookup"
        }
        console.error("[api/care-receivers] Service lookup error", JSON.stringify(errorLog))

        return jsonError(
          "Failed to fetch care receivers",
          500,
          { ok: false, detail: `Database error: ${anyError?.code || "UNKNOWN"} - ${anyError?.message || "Unknown error"}` }
        )
      }

      serviceCode = (serviceRow as { code?: string; slug?: string } | null)?.code
        ?? (serviceRow as { code?: string; slug?: string } | null)?.slug
        ?? resolvedSlug
    }

    // Build select fields list (no facility_id)
    const selectFields = ["id", "code", "name", "created_at"]
    if (hasServiceCode) {
      selectFields.push("service_code")
    }
    if (hasServiceId) {
      selectFields.push("service_id")
    }
    if (hasIsActive) {
      selectFields.push("is_active")
    }

    // Query care_receivers filtered by service_code or service_id
    let careReceiversQuery = supabaseAdmin!
      .from("care_receivers")
      .select(selectFields.join(", "))
      .order("name")
      .order("code")

    if (hasServiceCode) {
      careReceiversQuery = careReceiversQuery.eq("service_code", serviceCode)
    } else if (hasServiceId) {
      careReceiversQuery = careReceiversQuery.eq("service_id", serviceUuid)
    } else {
      return jsonError(
        "Failed to fetch care receivers",
        500,
        { ok: false, detail: "Schema mismatch: no service_code or service_id column" }
      )
    }

    if (hasIsActive) {
      careReceiversQuery = careReceiversQuery.eq("is_active", true)
    }

    const { data: careReceivers, error } = await careReceiversQuery

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
            serviceCode,
          },
          { status: 200 }
        )
      }
      
      // Other DB errors → 500 with structured log
      const anyError = error as Record<string, any>
      const errorLog = {
        code: anyError?.code || "UNKNOWN",
        message: anyError?.message || "Unknown error",
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

    const careReceiverRows = (careReceivers ?? []) as unknown as Record<string, unknown>[]
    const filteredCareReceivers = allowRealPii
      ? careReceiverRows
      : careReceiverRows.map((row) => omitPii(row))

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
        serviceCode,
      },
      { status: 200 }
    )
  } catch (error) {
    return unexpectedErrorResponse("care-receivers GET", error)
  }
}