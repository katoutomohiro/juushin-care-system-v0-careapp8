#!/usr/bin/env node

/**
 * check-server.mjs
 * 
 * Dev サーバーが http://localhost:3000 で起動しているか確認するスクリプト
 * 
 * Usage:
 *   node scripts/check-server.mjs
 *   pnpm check-server
 */

import http from 'http'

const PORT = 3000
const TIMEOUT = 3000
const MAX_RETRIES = 3

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
        console.log(`✅ Server is running on http://localhost:${PORT}`)
        console.log(`   Status: ${res.statusCode}`)
        resolve(true)
      }
    )

    req.on('error', (err) => {
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Attempt ${attempt}/${MAX_RETRIES}: Connection failed, retrying...`)
        setTimeout(() => resolve(checkServer(attempt + 1)), 1000)
      } else {
        console.error(`❌ Server not responding on http://localhost:${PORT}`)
        console.error(`   Error: ${err.message}`)
        console.error(`\n💡 Try: pnpm run reboot`)
        resolve(false)
      }
    })

    req.on('timeout', () => {
      req.destroy()
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Attempt ${attempt}/${MAX_RETRIES}: Timeout, retrying...`)
        setTimeout(() => resolve(checkServer(attempt + 1)), 1000)
      } else {
        console.error(`❌ Server timeout on http://localhost:${PORT}`)
        resolve(false)
      }
    })

    req.end()
  })
}

// Run check
const success = await checkServer()
process.exit(success ? 0 : 1)
