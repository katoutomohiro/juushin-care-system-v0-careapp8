/**
 * Cryptographically secure UUID and random value generation
 * Works in both browser and Node.js environments
 */

/**
 * Generate a cryptographically secure RFC4122 v4 UUID
 * Priority: globalThis.crypto.randomUUID() > globalThis.crypto.getRandomValues() > Node.js crypto.randomUUID()
 * @returns UUID v4 string
 * @throws Error if no secure random source is available
 */
export function generateSecureUUID(): string {
  const crypto = globalThis.crypto as any

  // Try globalThis.crypto.randomUUID() (browser standard)
  if (typeof crypto?.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // Try globalThis.crypto.getRandomValues() (browser fallback)
  if (typeof crypto?.getRandomValues === 'function') {
    return generateUUIDFromRandomValues(crypto)
  }

  // Try Node.js crypto module
  try {
    const nodeCrypto = require('crypto')
    if (typeof nodeCrypto.randomUUID === 'function') {
      return nodeCrypto.randomUUID()
    }
  } catch {
    // crypto module not available, fall through
  }

  throw new Error(
    'Secure random UUID generation not available. ' +
    'globalThis.crypto.randomUUID(), globalThis.crypto.getRandomValues(), or Node.js crypto module required.'
  )
}

/**
 * Generate UUID v4 using crypto.getRandomValues()
 * Implements RFC4122 v4 UUID format
 */
function generateUUIDFromRandomValues(crypto: any): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Set version to 4 (bits 12-15 of 7th byte)
  bytes[6] = (bytes[6] & 0x0f) | 0x40

  // Set variant to RFC4122 (bits 6-7 of 9th byte)
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  // Convert to hex string in UUID format
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

/**
 * Generate a cryptographically secure random string
 * Useful for IDs and tokens
 * @param length Length of the random string (default: 16)
 * @returns Random hex string
 * @throws Error if no secure random source is available
 */
export function generateSecureRandomString(length: number = 16): string {
  const crypto = globalThis.crypto as any

  if (typeof crypto?.getRandomValues === 'function') {
    const byteLength = Math.ceil(length / 2)
    const bytes = new Uint8Array(byteLength)
    crypto.getRandomValues(bytes)
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
    return hex.slice(0, length)
  }

  // Try Node.js crypto module
  try {
    const nodeCrypto = require('crypto')
    if (typeof nodeCrypto.randomBytes === 'function') {
      const byteLength = Math.ceil(length / 2)
      const hex = nodeCrypto.randomBytes(byteLength).toString('hex')
      return hex.slice(0, length)
    }
  } catch {
    // crypto module not available, fall through
  }

  throw new Error(
    'Secure random string generation not available. ' +
    'globalThis.crypto.getRandomValues() or Node.js crypto module required.'
  )
}
