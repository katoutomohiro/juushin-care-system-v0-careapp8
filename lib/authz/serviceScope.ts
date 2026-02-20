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
      // Try facilities table first (primary)
      let { data, error } = await supabase
        .from("facilities")
        .select("id, slug")
        .eq("id", serviceId)
        .single()

      // If facilities table not found, fallback to services table
      if (error && error.code?.includes("PGRST")) {
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("id, slug")
          .eq("id", serviceId)
          .single()
        
        data = servicesData
        error = servicesError
      }

      if (error && (error as any).code !== "PGRST116") {
        throw error
      }

      if (!data || (error as any)?.code === "PGRST116") {
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
    // Try facilities table first
    let { data, error } = await supabase
      .from("facilities")
      .select("id, slug")
      .eq("slug", serviceId)
      .single()

    // If facilities table not found or slug not found, fallback to services table
    if (error && error.code?.includes("PGRST")) {
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("id, slug")
        .eq("slug", serviceId)
        .single()
      
      data = servicesData
      error = servicesError
    }

    if (error && (error as any).code !== "PGRST116") {
      throw error
    }

    if (!data || (error as any)?.code === "PGRST116") {
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
    // Structured logging for database errors
    const anyError = dbError as Record<string, any>
    const errorLog = {
      message: anyError?.message || String(dbError),
      code: anyError?.code || "UNKNOWN",
      details: anyError?.details || null,
      hint: anyError?.hint || null,
      stack: anyError?.stack || null,
      serviceId,
      route: "/api/care-receivers"
    }
    console.error("[authz] Database error in resolveServiceIdToUuid", JSON.stringify(errorLog))

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
    // Priority 1: Check service_staff table (if it exists)
    // This provides explicit user-service mapping
    let hasAssignment = false
    
    // First try service_staff table
    const { data: serviceStaffAssignment, error: serviceStaffError } = await supabase
      .from("service_staff")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("service_id", serviceUuid)
      .single()
    
    // If table exists and assignment found, allow
    if (serviceStaffAssignment && !(serviceStaffError as any)?.code?.includes("PGRST")) {
      hasAssignment = true
    }
    
    // Priority 2: Fallback to staff_profiles + facilities mapping
    // Check if user is assigned to the facility that matches the service UUID
    if (!hasAssignment) {
      const { data: staffProfile, error: staffError } = await supabase
        .from("staff_profiles")
        .select("facility_id")
        .eq("id", userId)
        .single()
      
      if (staffProfile && !staffError) {
        // Verify the facility matches the service UUID
        // (service UUID should correspond to a facility record)
        const { data: facilitiesMatch, error: facilitiesError } = await supabase
          .from("facilities")
          .select("id")
          .eq("id", serviceUuid)
          .eq("id", staffProfile.facility_id)
          .single()
        
        hasAssignment = !!facilitiesMatch && !facilitiesError
      }
    }
    
    // If neither route succeeded, user is not assigned
    if (!hasAssignment) {
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
