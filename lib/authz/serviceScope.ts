/**
 * Service-scoped authorization helpers
 *
 * Enforces multi-layer authorization:
 * 1. Authentication (user exists)
 * 2. Service ID validation (parameter present)
 * 3. Service ID normalization (slug → UUID)
 * 4. Service assignment (user-service relationship)
 * 5. Role-based checks (optional)
 *
 * 🔐 PRODUCTION STATE (2026-02-21):
 * - Uses public.services table for service lookup (slug → UUID normalization)
 * - Uses public.service_staff for authorization (user → service mapping)
 * - No facilities table fallback (facilities removed from architecture)
 * - PII/PHI never logged
 * - serviceId accepts both slug (life-care) and UUID formats
 * - Internally normalizes all to UUID for consistency
 */

import { NextRequest, NextResponse } from "next/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { jsonError, isValidUUID } from "@/lib/api/route-helpers"

/**
 * Safe JSON serialization that handles BigInt and unstringifiable values
 */
function safeJson(value: any): string {
  try {
    return JSON.stringify(
      value,
      (_k, v) => (typeof v === "bigint" ? v.toString() : v),
      2
    )
  } catch {
    try {
      return String(value)
    } catch {
      return "[unstringifiable]"
    }
  }
}

/**
 * Unwrap commonly nested error structures
 */
function unwrapError(e: any) {
  // よくある包み方をほどく
  return e?.error ?? e?.cause ?? e
}

/**
 * Extract message from error object, with fallback to stringification
 */
function pickMessage(raw: any): string {
  const msg =
    raw?.message ??
    raw?.msg ??
    raw?.error_description ??
    raw?.error?.message

  if (typeof msg === "string" && msg.trim().length > 0) return msg

  // 最後の保険：空なら stringify/文字列化
  const s = safeJson(raw)
  return s && s !== "{}" ? s : String(raw)
}

/**
 * Extract and validate serviceId from request query parameters
 *
 * @param req - NextRequest object
 * @returns serviceId (non-empty string)
 * @throws NextResponse with 400 if serviceId missing
 */
export function requireServiceIdFromRequest(req: NextRequest): string {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get("serviceId")

  if (!serviceId || serviceId.trim() === "") {
    throw jsonError(
      "Service ID required",
      400,
      {
        ok: false,
        detail: "serviceId query parameter is mandatory"
      }
    )
  }

  return serviceId
}

/**
 * Resolve serviceId (slug or UUID) to internal service UUID
 *
 * Normalizes both slug (e.g., "life-care") and UUID formats to a canonical UUID.
 *
 * Uses only public.services table (no facilities fallback).
 *
 * @param supabase - Supabase admin client
 * @param serviceId - Either UUID (e.g., "550e8400-...") or slug (e.g., "life-care")
 * @returns { serviceUuid, serviceSlug } on success
 * @returns NextResponse with 400 if serviceId is invalid format
 * @returns NextResponse with 404 if service not found
 * @throws NextResponse with 500 on database error
 */
export async function resolveServiceIdToUuid(
  supabase: SupabaseClient<any, "public", any>,
  serviceId: string
): Promise<{ serviceUuid: string; serviceSlug: string } | NextResponse> {
  if (!serviceId || serviceId.trim() === "") {
    return jsonError(
      "Service ID required",
      400,
      { ok: false, detail: "Service ID cannot be empty" }
    )
  }

  try {
    // Case 1: UUID format
    if (isValidUUID(serviceId)) {
      const { data, error } = await supabase
        .from("services")
        .select("id, slug")
        .eq("id", serviceId)
        .single()

      // PGRST116 = no rows → 404 (service not found)
      if (!data || (error as any)?.code === "PGRST116") {
        return jsonError(
          "Service not found",
          404,
          { ok: false, detail: "The requested service does not exist" }
        )
      }

      // Other PGRST errors (table not found, etc) → also 404
      if (error && (error as any).code?.includes("PGRST")) {
        return jsonError(
          "Service not found",
          404,
          { ok: false, detail: "The requested service does not exist" }
        )
      }

      // Non-PGRST error (unexpected DB error) → throw for 500
      if (error) {
        throw error
      }

      return {
        serviceUuid: data.id,
        serviceSlug: data.slug
      }
    }

    // Case 2: Slug format (non-UUID string)
    console.log(`[authz] Resolving service by slug: ${serviceId}`)
    const { data, error } = await supabase
      .from("services")
      .select("id, slug")
      .eq("slug", serviceId)
      .single()

    console.log(`[authz] Service resolution result:`, { data, error, slug: serviceId })

    // PGRST116 = no rows → 404
    if (!data || (error as any)?.code === "PGRST116") {
      console.error(`[authz] Service not found for slug: ${serviceId}`)
      return jsonError(
        "Service not found",
        404,
        { ok: false, detail: `The requested service does not exist (slug: ${serviceId})` }
      )
    }

    // Other PGRST errors → also 404
    if (error && (error as any).code?.includes("PGRST")) {
      return jsonError(
        "Service not found",
        404,
        { ok: false, detail: "The requested service does not exist" }
      )
    }

    // Non-PGRST error → throw for 500
    if (error) {
      throw error
    }

    console.log(`[authz] Resolved service slug '${serviceId}' to UUID: ${data.id}`)
    return {
      serviceUuid: data.id,
      serviceSlug: data.slug
    }
  } catch (dbError) {
    // Structured logging for database errors
    const anyError = dbError as Record<string, any>
    const errorLog = {
      code: anyError?.code || "UNKNOWN",
      message: anyError?.message || "Unknown error",
      details: anyError?.details || null,
      hint: anyError?.hint || null,
      stack: anyError?.stack || null,
      serviceId,
      function: "resolveServiceIdToUuid",
      route: "/api/care-receivers"
    }
    console.error("[authz] Database error in resolveServiceIdToUuid " + safeJson(errorLog))

    return jsonError(
      "Service lookup failed",
      500,
      {
        ok: false,
        detail: `Database error: ${anyError?.code || "UNKNOWN"} - ${anyError?.message || "Unknown error"}`
      }
    )
  }
}

/**
 * Verify that user has a service assignment (is member of the service)
 *
 * CRITICAL: Accepts UUID only (call resolveServiceIdToUuid first if needed)
 *
 * Assignment logic:
 * - Uses public.service_staff mapping (user_id + service_id)
 * - If service_staff table does not exist (42P01), returns 403
 *
 * @param supabase - Supabase admin client
 * @param userId - auth.users.id (UUID)
 * @param serviceUuid - Service UUID (must be valid UUID, not slug)
 * @param resolvedSlug - Service slug for debug info (optional)
 * @returns null on success, NextResponse with 403 if unauthorized
 * @returns NextResponse with 500 on database error
 */
export async function assertServiceAssignment(
  supabase: SupabaseClient<any, "public", any>,
  userId: string,
  serviceUuid: string,
  resolvedSlug?: string
): Promise<NextResponse | null> {
  if (!userId) {
    return jsonError(
      "User ID missing",
      400,
      { ok: false, detail: "User ID is required for authorization check" }
    )
  }

  if (!serviceUuid || !isValidUUID(serviceUuid)) {
    return jsonError(
      "Invalid service ID",
      400,
      { ok: false, detail: "Service UUID must be a valid UUID" }
    )
  }

  try {
    /**
     * 🔍 DIAGNOSTIC: Log Supabase connection details
     */
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    const urlHost = supabaseUrl.replace(/^https?:\/\//, "").split("/")[0]
    
    console.log(`[assertServiceAssignment] 🔍 DIAGNOSTIC INFO:`, {
      supabase_host: urlHost,
      has_service_role_key: hasServiceRoleKey,
      query_user_id: userId,
      query_service_id: serviceUuid,
      query_service_slug: resolvedSlug,
      table: "public.service_staff",
      filter: `user_id=${userId} AND service_id=${serviceUuid}`
    })

    /**
     * ✅ Query service_staff with full debug info
     * Select user_id, service_id, role to understand assignment details
     */
    const { data: staffRecords, error: serviceStaffError } = await supabase
      .from("service_staff")
      .select("user_id, service_id, role")
      .eq("user_id", userId)
      .eq("service_id", serviceUuid)
      .limit(5)

    console.log(`[assertServiceAssignment] 🔍 QUERY RESULT:`, {
      error: serviceStaffError ? {
        code: (serviceStaffError as any).code,
        message: (serviceStaffError as any).message,
        details: (serviceStaffError as any).details
      } : null,
      records_count: staffRecords ? staffRecords.length : 0,
      records: staffRecords || []
    })

    if (serviceStaffError) {
      // テーブルが無い等（42P01）→ ここでは「未割当扱い」で 403 に落とす
      if (
        (serviceStaffError as any).code === "42P01" ||
        (serviceStaffError as any).message?.includes('relation "public.service_staff" does not exist')
      ) {
        return jsonError(
          "Access denied",
          403,
          { 
            ok: false, 
            detail: "User not assigned to this service",
            extra: {
              debug: {
                auth_user_id: userId,
                resolved_service_id: serviceUuid,
                resolved_service_slug: resolvedSlug,
                staff_rows: null,
                staff_count: 0,
                error: "service_staff table not found"
              }
            }
          }
        )
      }

      // それ以外の DB エラーは catch で structured に吐く
      throw serviceStaffError
    }

    // 該当ユーザーとサービスの割り当てが無い場合 → 403
    if (!staffRecords || staffRecords.length === 0) {
      console.error(`[assertServiceAssignment] ❌ NO RECORDS FOUND:`, {
        reason: "staff_records is empty",
        expected_match: `user_id=${userId} AND service_id=${serviceUuid}`,
        hint: "Check if: (1) UUIDs are correct, (2) RLS is blocking, (3) DB connection is to the right project",
        supabase_host: urlHost
      })
      
      return jsonError(
        "Access denied",
        403,
        { 
          ok: false, 
          detail: "User not assigned to this service",
          extra: {
            debug: {
              auth_user_id: userId,
              resolved_service_id: serviceUuid,
              resolved_service_slug: resolvedSlug,
              staff_rows: [],
              staff_count: 0,
              supabase_host: urlHost,
              has_service_role_key: hasServiceRoleKey
            }
          }
        }
      )
    }

    console.log(`[assertServiceAssignment] ✅ AUTHORIZATION PASSED:`, {
      matched_records: staffRecords.length,
      records: staffRecords
    })

    // ✓ Authorization passed
    return null
  } catch (dbError: any) {
    const raw = unwrapError(dbError)

    const errorDetails = {
      code: raw?.code ?? raw?.status ?? raw?.error?.code ?? "UNKNOWN",
      message: pickMessage(raw),
      details: raw?.details ?? raw?.detail ?? raw?.error?.details ?? null,
      hint: raw?.hint ?? raw?.error?.hint ?? null,
      stack: raw?.stack ?? dbError?.stack ?? null,
    }

    // ✅ Vercel の message 欄で潰れにくいよう、文字列で吐く
    console.error(
      "[authz] Database error in assertServiceAssignment " +
      safeJson({
        userId,
        serviceUuid,
        function: "assertServiceAssignment",
        route: "/api/care-receivers",
        ...errorDetails,
        raw,
        original: dbError,
      })
    )

    return jsonError(
      "Authorization check failed",
      500,
      {
        ok: false,
        detail: `Database error: ${errorDetails.code} - ${errorDetails.message}`,
      }
    )
  }
}

/**
 * Combined check: serviceId resolution + assignment verification
 *
 * Convenience wrapper for common pattern:
 * 1. Extract and validate serviceId (query parameter)
 * 2. Resolve serviceId (slug/UUID) to service UUID
 * 3. Check user assignment to service
 *
 * @param req - NextRequest
 * @param supabase - Supabase admin client
 * @param userId - auth.users.id
 * @returns [serviceUuid, serviceSlug, errorResponse] where errorResponse is null on success
 */
export async function requireServiceIdAndAssignment(
  req: NextRequest,
  supabase: SupabaseClient<any, "public", any>,
  userId: string
): Promise<[string | null, string | null, NextResponse | null]> {
  let serviceId: string
  try {
    serviceId = requireServiceIdFromRequest(req)
  } catch (err) {
    if (err instanceof NextResponse) {
      return [null, null, err]
    }
    return [null, null, jsonError("Invalid request", 400, { ok: false })]
  }

  // Resolve serviceId (slug or UUID) to service UUID
  const resolveResult = await resolveServiceIdToUuid(supabase, serviceId)
  if (resolveResult instanceof NextResponse) {
    return [null, null, resolveResult]
  }

  const { serviceUuid, serviceSlug } = resolveResult

  // Check authorization (pass serviceSlug for debug info)
  const authzError = await assertServiceAssignment(supabase, userId, serviceUuid, serviceSlug)
  if (authzError) {
    return [null, null, authzError]
  }

  return [serviceUuid, serviceSlug, null]
}