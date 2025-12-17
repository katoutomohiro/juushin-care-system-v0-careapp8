import { getPendingOps, markOpDone, markOpFailed, resetOpForRetry } from "./outbox"
import { saveSyncMeta, getDB } from "./db"
import type { OutboxOp, OutboxSyncOp, OutboxSyncRequest } from "./types"

const SYNC_ENDPOINT = "/api/case-records/offline-upsert"
const MAX_OPS_PER_SYNC = 50

type SyncOpResult = {
  opId: string
  status: "applied" | "already_applied" | "failed" | "processing"
  error?: string
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function getDeviceId(): string {
  if (typeof localStorage === "undefined") return "unknown-device"
  const KEY = "offline_device_id"
  const existing = localStorage.getItem(KEY)
  if (existing) return existing
  const newId = generateUuid()
  localStorage.setItem(KEY, newId)
  return newId
}

function buildSyncPayload(pendingOps: OutboxOp[]): OutboxSyncRequest {
  const ops: OutboxSyncOp[] = pendingOps.slice(0, MAX_OPS_PER_SYNC).map((op) => ({
    opId: op.opId,
    dedupeKey: op.dedupeKey,
    serviceId: op.serviceId,
    userId: op.userId,
    recordDate: op.recordDate,
    operationType: op.operationType,
    payload: op.payload,
  }))

  return {
    syncRequestId: generateUuid(),
    deviceId: getDeviceId(),
    ops,
  }
}

/**
 * Outbox の pending な操作をまとめて送信
 */
export async function syncOutbox(): Promise<{
  synced: number
  failed: number
  errors: Array<{ opId: string; error: string }>
}> {
  const pendingOps = await getPendingOps()
  if (!pendingOps.length) {
    await saveSyncMeta({ lastSyncAt: Date.now(), isOnline: true })
    return { synced: 0, failed: 0, errors: [] }
  }

  const payload = buildSyncPayload(pendingOps)
  const response = await fetch(SYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": payload.syncRequestId,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 202) {
    return { synced: 0, failed: 0, errors: [{ opId: "batch", error: data.error || "processing" }] }
  }

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }

  const results: SyncOpResult[] = Array.isArray(data.results) ? data.results : []
  let synced = 0
  let failed = 0
  const errors: Array<{ opId: string; error: string }> = []

  for (const result of results) {
    if (result.status === "applied" || result.status === "already_applied") {
      await markOpDone(result.opId)
      synced++
      continue
    }

    if (result.status === "failed") {
      const message = result.error || "failed"
      await markOpFailed(result.opId, message)
      failed++
      errors.push({ opId: result.opId, error: message })
      continue
    }
  }

  await saveSyncMeta({
    lastSyncAt: Date.now(),
    isOnline: true,
  })

  return { synced, failed, errors }
}

/**
 * 手動で失敗した操作を再試行キューに戻す
 */
export async function retryFailedOps(): Promise<void> {
  const failedOps = await getAllFailedOps()

  for (const op of failedOps) {
    await resetOpForRetry(op.opId)
  }
}

/**
 * すべての failed/pending 操作を取得（内部用）
 */
async function getAllFailedOps(): Promise<OutboxOp[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("outbox_ops", "readonly")
    const store = tx.objectStore("outbox_ops")
    const index = store.index("status")
    const request = index.getAll("failed")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as OutboxOp[])
  })
}
