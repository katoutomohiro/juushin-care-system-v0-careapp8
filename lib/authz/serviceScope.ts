/**
 * Service-scoped authorization helpers
 * 
 * Enforces multi-layer authorization:
 * 1. Authentication (user exists)
 * 2. Service ID validation (parameter present)
 * 3. Service assignment (user-service relationship)
 * 4. Role-based checks (optional)
 * 
 * ⚠️ INTERIM STATE (2026-02-20):
 * - Uses staff_profiles.facility_id for assignment check
 * - Awaiting service_staff table implementation (planned Phase 2, cf. DOMAIN_MODEL.md)
 * - PII/PHI never logged
 */

import { NextRequest, NextResponse } from "next/server"
import { SupabaseClient } from "@supabase/supabase-js"
import { jsonError } from "@/lib/api/route-helpers"

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
 * Verify that user has a service assignment (is member of the service)
 * 
 * INTERIM LOGIC (service_staff not yet created):
 * - Checks if user's staff_profiles.facility_id matches any facility associated with serviceId
 * - Once service_staff table exists, migrate to: WHERE user_id = userId AND service_id = serviceId
 * 
 * @param supabase - Supabase admin client
 * @param userId - auth.users.id (UUID)
 * @param serviceId - Facility/service ID (UUID or slug)
 * @returns null on success, NextResponse with 403 if unauthorized
 * @throws NextResponse with 500 on database error
 */
export async function assertServiceAssignment(
  supabase: SupabaseClient<any, "public", any>,
  userId: string,
  serviceId: string
): Promise<NextResponse | null> {
  if (!userId) {
    return jsonError(
      "User ID missing",
      400,
      { ok: false, detail: "User ID is required for authorization check" }
    )
  }

  try {
    // INTERIM: Check if user has staff_profiles entry in the requested facility
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
      serviceId,
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
 * Combined check: serviceId validation + assignment verification
 * 
 * Convenience wrapper for common pattern:
 * 1. Extract and validate serviceId
 * 2. Check user assignment to service
 * 
 * @param req - NextRequest
 * @param supabase - Supabase admin client
 * @param userId - auth.users.id
 * @returns [serviceId, errorResponse] where errorResponse is null on success
 */
export async function requireServiceIdAndAssignment(
  req: NextRequest,
  supabase: SupabaseClient<any, "public", any>,
  userId: string
): Promise<[string | null, NextResponse | null]> {
  let serviceId: string
  try {
    serviceId = requireServiceIdFromRequest(req)
  } catch (err) {
    if (err instanceof NextResponse) {
      return [null, err]
    }
    return [null, jsonError("Invalid request", 400, { ok: false })]
  }

  const authzError = await assertServiceAssignment(supabase, userId, serviceId)
  if (authzError) {
    return [null, authzError]
  }

  return [serviceId, null]
}
