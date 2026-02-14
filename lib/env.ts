import "server-only"

function parseFloatEnv(name: string, def: number): number {
  const raw = process.env[name]
  if (!raw) return def
  const value = Number(raw.trim())
  if (!Number.isFinite(value)) return def
  if (name === "LLM_TEMPERATURE") {
    return Math.max(0, Math.min(value, 2))
  }
  return value
}

function parseIntEnv(name: string, def: number): number {
  const raw = process.env[name]
  if (!raw) return def
  const value = Number.parseInt(raw.trim(), 10)
  if (!Number.isFinite(value)) return def
  return Math.max(0, value)
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini"
export const LLM_TEMPERATURE = parseFloatEnv("LLM_TEMPERATURE", 0.2)
export const LLM_SEED = parseIntEnv("LLM_SEED", 123)
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
export const NODE_ENV = process.env.NODE_ENV || "development"

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ""
export const VAPID_CONTACT = process.env.VAPID_CONTACT_EMAIL || process.env.VAPID_CONTACT || "mailto:admin@example.com"
