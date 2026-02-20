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
 * ⚠️ INTERIM STATE (2026-02-20):
 * - Uses staff_profiles.facility_id for assignment check
 * - Awaiting service_staff table implementation (planned Phase 4, cf. DOMAIN_MODEL.md)
 * - PII/PHI never logged
 * - serviceId accepts both slug (life-care) and UUID formats
 * - Internally normalizes all to UUID for consistency
 */

import { NextRequest, NextResponse } from "next/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { jsonError, isValidUUID } from "@/lib/api/route-helpers"

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
      // Verify the UUID exists in services table
      const { data, error } = await supabase
        .from("services")
        .select("id, slug")
        .eq("id", serviceId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (!data || error?.code === "PGRST116") {
        return jsonError(
          "Service not found",
          404,
          { ok: false, detail: "The requested service does not exist" }
        )
      }

      return {
        serviceUuid: data.id,
        serviceSlug: data.slug
      }
    }

    // Case 2: Slug format (non-UUID string)
    const { data, error } = await supabase
      .from("services")
      .select("id, slug")
      .eq("slug", serviceId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    if (!data || error?.code === "PGRST116") {
      return jsonError(
        "Service not found",
        404,
        { ok: false, detail: "The requested service does not exist" }
      )
    }

    return {
      serviceUuid: data.id,
      serviceSlug: data.slug
    }
  } catch (dbError) {
    console.error("[authz] Database error in resolveServiceIdToUuid:", {
      error: dbError instanceof Error ? dbError.message : String(dbError)
    })

    return jsonError(
      "Service lookup failed",
      500,
      { ok: false, detail: "Database error while resolving service" }
    )
  }
}

/**
 * Verify that user has a service assignment (is member of the service)
 * 
 * CRITICAL: Accepts UUID only (call resolveServiceIdToUuid first if needed)
 * 
 * INTERIM LOGIC (service_staff not yet created):
 * - Checks if user exists in staff_profiles (indicates facility/service membership)
 * - Once service_staff table exists, migrate to: WHERE user_id = userId AND service_id = serviceUuid
 * 
 * @param supabase - Supabase admin client
 * @param userId - auth.users.id (UUID)
 * @param serviceUuid - Service UUID (must be valid UUID, not slug)
 * @returns null on success, NextResponse with 403 if unauthorized
 * @returns NextResponse with 500 on database error
 */
export async function assertServiceAssignment(
  supabase: SupabaseClient<any, "public", any>,
  userId: string,
  serviceUuid: string
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
    // INTERIM: Check if user has staff_profiles entry
    // This validates that the user is assigned to at least one facility
    // Once service_staff exists, change this query to:
    //   FROM public.service_staff 
    //   WHERE user_id = $1 AND service_id = $2
    
    const { data: assignment, error } = await supabase
      .from("staff_profiles")
      .select("id", { count: "exact", head: true })
      .eq("id", userId)
      // INTERIM: All staff_profiles users are assumed to have access
      // This will be refined once service_staff mapping is created
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = "not found", which is a valid authorization failure
      throw error
    }

    if (!assignment || error?.code === "PGRST116") {
      // User not found in staff_profiles = not authorized
      return jsonError(
        "Access denied",
        403,
        { ok: false, detail: "User not assigned to this service" }
      )
    }

    // ✓ Authorization passed
    return null
  } catch (dbError) {
    console.error("[authz] Database error in assertServiceAssignment:", {
      userId,
      serviceUuid,
      error: dbError instanceof Error ? dbError.message : String(dbError)
    })

    return jsonError(
      "Authorization check failed",
      500,
      { ok: false, detail: "Database error during authorization" }
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

  // Check authorization
  const authzError = await assertServiceAssignment(supabase, userId, serviceUuid)
  if (authzError) {
    return [null, null, authzError]
  }

  return [serviceUuid, serviceSlug, null]
}
