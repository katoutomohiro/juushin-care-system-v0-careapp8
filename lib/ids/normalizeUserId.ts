/**
 * Normalize userId from display format to internal format
 * 
 * Examples:
 * - "A・T" → "AT"
 * - "A･T" → "AT"
 * - "A.T" → "AT"
 * - "A T" → "AT"
 * - "A-T" → "AT"
 * - "%E3%83%BB" (encoded) → "AT"
 * 
 * Rules:
 * 1. Decode URI component
 * 2. Remove full-width/half-width middle dots (・･)
 * 3. Remove periods (.)
 * 4. Remove spaces (both ASCII and full-width)
 * 5. Remove hyphens (-)
 * 6. Remove all non-alphanumeric characters
 * 7. Convert to uppercase
 */
export function normalizeUserId(raw: string | null | undefined): string {
  if (!raw) return ""

  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }

  return decoded
    .replace(/[・･.\s　-]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toUpperCase()
}

/**
 * Check if two userIds are equivalent after normalization
 */
export function isSameUserId(a: string | null | undefined, b: string | null | undefined): boolean {
  return normalizeUserId(a) === normalizeUserId(b)
}
