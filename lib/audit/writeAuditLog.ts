/**
 * Unified audit log writing
 * 
 * CRITICAL RULES:
 * - NEVER log PII/PHI (full_name, address, phone, medical_care_detail, field values)
 * - NEVER log resource location/identifiers that could expose user information
 * - Log only: action, resource_type, resource_id (UUID hash), timestamp, actor_id, service_id
 * 
 * ⚠️ INTERIM STATE (2026-02-20):
 * - Awaiting audit_logs table creation (cf. docs/AUDIT_LOGGING.md)
 * - writeAuditLog() returns early if table not available
 * - No audit log failure should block API operations (logs quietly fail)
 */

import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Audit log entry to persist
 */
export interface AuditLogEntry {
  /** auth.users.id of the user performing the action */
  actor_id: string
  
  /** facilities.id (service/facility scoping) */
  service_id: string
  
  /** Action performed: 'read', 'create', 'update', 'delete', 'export', etc. */
  action: string
  
  /** Resource type: 'care_receiver', 'case_record', 'staff', etc. */
  resource_type: string
  
  /** Resource identifier - prefer UUID, hash, or "list" for batch operations */
  resource_id: string
  
  /** Optional: Request metadata (count, filters, etc.) - NO PII */
  metadata?: Record<string, unknown>
}

/**
 * Persist audit log entry to database
 * 
 * DESIGN:
 * - Failures are NON-BLOCKING: logs are written best-effort
 * - If audit_logs table doesn't exist, log to console and continue
 * - Sensitive errors are NOT returned to client
 * 
 * @param supabase - Supabase admin client
 * @param entry - Audit log entry
 * @returns true if logged successfully, false otherwise
 */
export async function writeAuditLog(
  supabase: SupabaseClient<any, "public", any>,
  entry: AuditLogEntry
): Promise<boolean> {
  try {
    // Validate required fields
    if (!entry.actor_id || !entry.service_id || !entry.action || !entry.resource_type) {
      console.warn("[audit] Incomplete audit log entry, skipping", {
        actor_id: !!entry.actor_id,
        service_id: !!entry.service_id,
        action: !!entry.action,
        resource_type: !!entry.resource_type
      })
      return false
    }

    // Insert into audit_logs table
    // Using service_role to bypass RLS (we want to log all operations)
    const { error } = await supabase
      .from("audit_logs")
      .insert({
        actor_id: entry.actor_id,
        service_id: entry.service_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id || "unknown",
        metadata: entry.metadata || {},
        created_at: new Date().toISOString()
      })

    if (error) {
      // Table may not exist yet (interim state)
      if (error.code === "42P01") {
        console.debug("[audit] audit_logs table not yet created, audit logging deferred")
        return false
      }

      console.error("[audit] Failed to write audit log:", {
        code: error.code,
        message: error.message,
        // Note: DO NOT log the full error details which may contain PII
      })
      return false
    }

    return true
  } catch (err) {
    console.error("[audit] Unexpected error writing audit log:", {
      error: err instanceof Error ? err.message : String(err)
    })
    return false
  }
}

/**
 * Write audit log for resource read/list operation
 * 
 * Convenience wrapper for common READ pattern
 */
export async function auditRead(
  supabase: SupabaseClient<any, "public", any>,
  {
    actor_id,
    service_id,
    resource_type,
    resource_id = "list",
    count,
  }: {
    actor_id: string
    service_id: string
    resource_type: string
    resource_id?: string
    count?: number
  }
): Promise<boolean> {
  return writeAuditLog(supabase, {
    actor_id,
    service_id,
    action: "read",
    resource_type,
    resource_id,
    metadata: count ? { count } : undefined
  })
}

/**
 * Write audit log for resource create/update/delete operation
 */
export async function auditMutation(
  supabase: SupabaseClient<any, "public", any>,
  {
    actor_id,
    service_id,
    action,
    resource_type,
    resource_id,
  }: {
    actor_id: string
    service_id: string
    action: "create" | "update" | "delete"
    resource_type: string
    resource_id: string
  }
): Promise<boolean> {
  return writeAuditLog(supabase, {
    actor_id,
    service_id,
    action,
    resource_type,
    resource_id,
  })
}
