#!/usr/bin/env node

/**
 * check-server.mjs
 * 
 * Checks if dev server is running on http://localhost:3000
 * Returns exit code 0 if successful, 1 if failed
 * 
 * Usage:
 *   node scripts/check-server.mjs
 *   pnpm check-server
 */

import http from 'http'

const PORT = 3000
const TIMEOUT = 2000
const MAX_RETRIES = 5
const RETRY_DELAY = 1000

async function checkServer(attempt = 1) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/',
        method: 'HEAD',
        timeout: TIMEOUT,
      },
      (res) => {
        // Accept 200, 302, 404 etc - any response means server is running
        console.log(`✅ Server is responding on http://localhost:${PORT}`)
        console.log(`   Status: ${res.statusCode}`)
        resolve(true)
      }
    )

    req.on('error', (err) => {
      if (attempt < MAX_RETRIES) {
        process.stdout.write(`.`)
        setTimeout(() => resolve(checkServer(attempt + 1)), RETRY_DELAY)
      } else {
        console.error(`\n❌ Server not responding on http://localhost:${PORT}`)
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
        console.error(`\n❌ Server timeout on http://localhost:${PORT}`)
        console.error(`\n💡 Try: pnpm run reboot`)
        resolve(false)
      }
    })

    req.end()
  })
}

// Show what we're checking
process.stdout.write(`⏳ Checking http://localhost:${PORT} `)

// Run check
const success = await checkServer()
process.exit(success ? 0 : 1)
