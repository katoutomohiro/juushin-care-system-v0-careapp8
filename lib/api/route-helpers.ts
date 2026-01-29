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
