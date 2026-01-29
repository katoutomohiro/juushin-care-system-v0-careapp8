import { NextResponse } from "next/server"
import type { User } from "@supabase/supabase-js"
import { getApiUser } from "@/lib/auth/get-api-user"

type PiiFields = {
  full_name?: string | null
  birthday?: string | null
  address?: string | null
  phone?: string | null
  emergency_contact?: string | null
}

type ErrorBodyOptions = {
  ok?: boolean
  detail?: string
  extra?: Record<string, unknown>
}

export async function requireApiUser(): Promise<User | null> {
  return getApiUser()
}

export function isRealPiiEnabled(): boolean {
  return process.env.ALLOW_REAL_PII === "true"
}

export function omitPii<T extends Record<string, unknown>>(data: T): Omit<T, keyof PiiFields> {
  const { full_name, birthday, address, phone, emergency_contact, ...rest } = data as T & PiiFields
  void full_name
  void birthday
  void address
  void phone
  void emergency_contact
  return rest
}

export function withPii<T extends Record<string, unknown>>(
  base: T,
  pii: PiiFields,
  allow: boolean,
): T & Partial<PiiFields> {
  return allow ? { ...base, ...pii } : base
}

export function jsonError(message: string, status: number, options: ErrorBodyOptions = {}) {
  const body = {
    ...(options.ok !== undefined ? { ok: options.ok } : {}),
    error: message,
    ...(options.detail ? { detail: options.detail } : {}),
    ...(options.extra ?? {}),
  }

  return NextResponse.json(body, { status })
}

export function unauthorizedResponse(withOk: boolean) {
  return jsonError("Unauthorized", 401, { ok: withOk })
}

export function piiDisabledResponse() {
  return jsonError("PII is disabled", 400, { ok: false })
}
/**
 * Supabase admin client availability check
 */
export function ensureSupabaseAdmin(client: any, detail?: string) {
  if (!client) {
    return jsonError("Database not available", 503, { 
      ok: false,
      detail: detail || "Supabase admin client not initialized"
    })
  }
  return null
}

/**
 * Handle Supabase database errors
 */
export function handleSupabaseError(error: any, defaultMessage: string = "Database query failed") {
  const message = error?.message || defaultMessage
  return jsonError(message, 500, { ok: false })
}

/**
 * Validate required query parameters
 */
export function validateQueryParams(params: Record<string, string | null>, required: string[]) {
  const missing = required.filter(p => !params[p])
  if (missing.length > 0) {
    return {
      valid: false,
      response: jsonError(`Missing required parameters: ${missing.join(", ")}`, 400, { ok: false })
    }
  }
  return { valid: true, response: null }
}

/**
 * Validate multiple required string fields
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): { valid: boolean; missingFields: (keyof T)[] } {
  const missingFields = fields.filter(field => !data[field])
  return {
    valid: missingFields.length === 0,
    missingFields: missingFields as (keyof T)[],
  }
}

/**
 * Build error response for missing fields
 */
export function missingFieldsResponse(missingFields: string[]) {
  return jsonError(
    `Missing required fields: ${missingFields.join(", ")}`,
    400,
    { ok: false }
  )
}

/**
 * Safely extract parsed integer from query/body
 */
export function safeParseInt(value: string | null | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? defaultValue : parsed
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Get safe pagination parameters
 */
export function getPaginationParams(
  limitStr?: string | null,
  offsetStr?: string | null,
  defaults = { limit: 50, minLimit: 1, maxLimit: 100, defaultOffset: 0 }
) {
  const limit = clamp(
    safeParseInt(limitStr, defaults.limit),
    defaults.minLimit,
    defaults.maxLimit
  )
  const offset = Math.max(safeParseInt(offsetStr, defaults.defaultOffset), 0)
  return { limit, offset }
}

/**
 * Wrap async handler with standard try/catch error logging
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  context: string
): Promise<{ result: T | null; error: any }> {
  try {
    const result = await fn()
    return { result, error: null }
  } catch (error) {
    console.error(`[${context}] Error:`, error)
    return { result: null, error }
  }
}

/**
 * Generic error response for unexpected exceptions
 */
export function unexpectedErrorResponse(context: string, error: any) {
  const message = error instanceof Error ? error.message : String(error)
  return jsonError(`Internal server error (${context})`, 500, {
    ok: false,
    detail: message,
  })
}