import 'server-only'

/* Environment guard utilities (server-only intended) */

function parseFloatEnv(name: string, def: number): number {
  const raw = process.env[name];
  if (!raw) return def;
  const trimmed = raw.trim();
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return def;
  // 温度は一般的に 0.0〜2.0 程度を想定。過剰値は丸める。
  if (name === 'LLM_TEMPERATURE') {
    const clamped = Math.max(0, Math.min(num, 2));
    return clamped;
  }
  return num;
}

function parseIntEnv(name: string, def: number): number {
  const raw = process.env[name];
  if (!raw) return def;
  const trimmed = raw.trim();
  const num = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(num)) return def;
  // シードは0以上の整数を想定
  return Math.max(0, num);
}

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const LLM_TEMPERATURE = parseFloatEnv('LLM_TEMPERATURE', 0.2);
export const LLM_SEED = parseIntEnv('LLM_SEED', 123);
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';
