#!/usr/bin/env node

/**
 * check-server.mjs
 * 
 * Checks if dev server is running on the configured base URL
 * Returns exit code 0 if successful, 1 if failed
 * 
 * Usage:
 *   node scripts/check-server.mjs
 *   pnpm check-server
 */

import http from 'http'

const DEFAULT_PORT = 3000
const TIMEOUT = 2000
const MAX_RETRIES = 5
const RETRY_DELAY = 1000

const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL
if (!baseUrl) {
  console.error("\n❌ APP_BASE_URL (or NEXT_PUBLIC_APP_URL) is not set")
  console.error("   Set APP_BASE_URL to your dev server URL, then retry.")
  process.exit(1)
}

let parsed
try {
  parsed = new URL(baseUrl)
} catch {
  console.error("\n❌ APP_BASE_URL is not a valid URL:", baseUrl)
  process.exit(1)
}

const hostname = parsed.hostname
const PORT = Number(parsed.port || DEFAULT_PORT)

async function checkServer(attempt = 1) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname,
        port: PORT,
        path: '/',
        method: 'HEAD',
        timeout: TIMEOUT,
      },
      (res) => {
        // Accept 200, 302, 404 etc - any response means server is running
        console.log(`✅ Server is responding on ${parsed.origin}`)
        console.log(`   Status: ${res.statusCode}`)
        resolve(true)
      }
    )

    req.on('error', (err) => {
      if (attempt < MAX_RETRIES) {
        process.stdout.write(`.`)
        setTimeout(() => resolve(checkServer(attempt + 1)), RETRY_DELAY)
      } else {
        console.error(`\n❌ Server not responding on ${parsed.origin}`)
        console.error(`   Error: ${err.code || err.message}`)
        console.error(`\n💡 Try: pnpm run reboot`)
        resolve(false)
      }
    })

    req.on('timeout', () => {
      req.destroy()
      if (attempt < MAX_RETRIES) {
        process.stdout.write(`.`)
        setTimeout(() => resolve(checkServer(attempt + 1)), RETRY_DELAY)
      } else {
        console.error(`\n❌ Server timeout on ${parsed.origin}`)
        console.error(`\n💡 Try: pnpm run reboot`)
        resolve(false)
      }
    })

    req.end()
  })
}

// Show what we're checking
process.stdout.write(`⏳ Checking ${parsed.origin} `)

// Run check
const success = await checkServer()
process.exit(success ? 0 : 1)
