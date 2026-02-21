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
import { requireServiceIdFromRequest, assertServiceAssignment } from "@/lib/authz/serviceScope"
import { auditRead } from "@/lib/audit/writeAuditLog"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

/**
 * Check if a table can be selected (exists and is accessible)
 * 
 * @param supabase - Supabase client
 * @param table - Table name
 * @returns true if table exists and is accessible, false if table doesn't exist
 * @throws Error for unexpected database errors
 */
async function canSelectTable(
  supabase: any,
  table: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .select("*")
      .limit(1);
    
    if (!error) return true;

    const code = (error as any)?.code ?? "";
    const msg = (error as any)?.message ?? "";
    
    // テーブル不存在系（PostgREST）
    if (code === "PGRST205" || code === "42P01") return false;
    if (msg.includes("Could not find the table")) return false;
    if (msg.includes("does not exist")) return false;
    
    // それ以外は想定外エラー → throw
    throw error;
  } catch (err) {
    throw err;
  }
}

/**
 * Check if a column can be selected from a table (exists and is accessible)
 * 
 * @param supabase - Supabase client
 * @param table - Table name
 * @param column - Column name
 * @returns true if column exists and is accessible, false if column doesn't exist
 * @throws Error for unexpected database errors
 */
async function canSelectColumn(
  supabase: any,
  table: string,
  column: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .select(column)
      .limit(1);
    
    if (!error) return true;

    const code = (error as any)?.code ?? "";
    const msg = (error as any)?.message ?? "";
    
    // 列が無い判定
    if (code === "PGRST205" || code === "PGRST204") return false;
    if (msg.includes("Could not find the column")) return false;
    
    // テーブルが無い判定も false 扱い
    if (code === "42P01") return false;
    if (msg.includes("does not exist")) return false;
    
    // それ以外は想定外エラー → throw
    throw error;
  } catch (err) {
    throw err;
  }
}

/**
 * GET /api/care-receivers?serviceId=life-care
 *
 * Authorization flow:
 * 1. requireApiUser() - verify authentication (401 if missing)
 * 2. requireServiceIdFromRequest() - extract serviceId parameter (400 if missing)
 * 3. Query public.services by slug - resolve to service UUID (404 if not found)
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

    // STEP 2: Extract and validate serviceSlug parameter
    let serviceSlug: string
    try {
      serviceSlug = requireServiceIdFromRequest(req)
    } catch (err) {
      if (err instanceof NextResponse) {
        return err
      }
      throw err
    }

    // STEP 3: Resolve serviceSlug to canonical service UUID by querying public.services directly
    console.log(`[care-receivers] Resolving serviceSlug from public.services: ${serviceSlug}`)
    const { data: serviceRow, error: serviceError } = await supabaseAdmin!
      .from("services")
      .select("id, slug")
      .eq("slug", serviceSlug)
      .single()

    if (serviceError || !serviceRow) {
      console.error(`[care-receivers] Service not found for slug: ${serviceSlug}`, serviceError)
      return jsonError(
        "Service not found",
        404,
        { ok: false, detail: `The requested service does not exist (slug: ${serviceSlug})` }
      )
    }

    const serviceUuid = serviceRow.id
    const resolvedSlug = serviceRow.slug
    console.log(`[care-receivers] ✅ Resolved service: slug='${serviceSlug}' -> UUID='${serviceUuid}'`)

    // STEP 4: Verify user has authorization to access this service
    const authzError = await assertServiceAssignment(supabaseAdmin!, user.id, serviceUuid)
    if (authzError) {
      // If 403, add debug info for troubleshooting
      if (authzError.status === 403) {
        const bodyJson = await authzError.json()
        console.log(`[care-receivers] 403 Authorization failed:`, {
          user_id: user.id,
          service_id: serviceUuid,
          service_slug: serviceSlug,
          resolved_slug: resolvedSlug
        })
        return NextResponse.json(
          {
            ...bodyJson,
            debug: {
              user_id: user.id,
              service_id: serviceUuid,
              service_slug: serviceSlug,
              resolved_slug: resolvedSlug,
              requestedUrl: req.url
            }
          },
          { status: 403 }
        )
      }
      return authzError
    }

    const allowRealPii = isRealPiiEnabled()

    // STEP 5: Check which columns exist in care_receivers table
    const hasServiceCode = await canSelectColumn(supabaseAdmin!, "care_receivers", "service_code")
    const hasServiceId = await canSelectColumn(supabaseAdmin!, "care_receivers", "service_id")
    const hasFacilityId = await canSelectColumn(supabaseAdmin!, "care_receivers", "facility_id")
    const hasIsActive = await canSelectColumn(supabaseAdmin!, "care_receivers", "is_active")

    // Fetch services.code for filtering care_receivers
    let serviceCode = resolvedSlug
    if (hasServiceCode) {
      // Check if services table has 'code' column
      const hasServicesCode = await canSelectColumn(supabaseAdmin!, "services", "code")

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

    // Build select fields list - include optional columns if they exist
    const selectFields = ["id", "code", "name", "created_at"]
    if (hasServiceCode) {
      selectFields.push("service_code")
    }
    if (hasServiceId) {
      selectFields.push("service_id")
    }
    if (hasFacilityId) {
      selectFields.push("facility_id")
    }
    if (hasIsActive) {
      selectFields.push("is_active")
    }

    // Query care_receivers filtered by service_code, service_id, or facility_id
    let careReceiversQuery = supabaseAdmin!
      .from("care_receivers")
      .select(selectFields.join(", "))
      .order("name")
      .order("code")

    if (hasServiceCode) {
      careReceiversQuery = careReceiversQuery.eq("service_code", serviceCode)
    } else if (hasServiceId) {
      careReceiversQuery = careReceiversQuery.eq("service_id", serviceUuid)
    } else if (hasFacilityId) {
      careReceiversQuery = careReceiversQuery.eq("facility_id", serviceUuid)
    } else {
      return jsonError(
        "Failed to fetch care receivers",
        500,
        { ok: false, detail: "Schema mismatch: no service_code, service_id, or facility_id column" }
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