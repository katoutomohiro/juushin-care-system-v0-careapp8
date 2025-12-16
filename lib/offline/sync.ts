import { getPendingOps, markOpDone, markOpFailed, resetOpForRetry } from "./outbox"
import { saveSyncMeta, getDB } from "./db"
import type { OutboxOp } from "./types"

/**
 * Outbox の pending な操作を順番に送信
 * 各操作は API を通じてサーバに送り、成功/失敗を処理
 */
export async function syncOutbox(): Promise<{
  synced: number
  failed: number
  errors: Array<{ opId: string; error: string }>
}> {
  const pendingOps = await getPendingOps()
  let synced = 0
  let failed = 0
  const errors: Array<{ opId: string; error: string }> = []

  // 操作を順番に処理
  for (const op of pendingOps) {
    try {
      await syncOp(op)
      await markOpDone(op.opId)
      synced++
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      await markOpFailed(op.opId, errorMsg)
      errors.push({ opId: op.opId, error: errorMsg })
      failed++
    }
  }

  // sync メタを更新
  await saveSyncMeta({
    lastSyncAt: Date.now(),
    isOnline: true,
  })

  return { synced, failed, errors }
}

/**
 * 1つの操作をサーバに送信
 */
async function syncOp(op: OutboxOp): Promise<void> {
  if (op.operationType !== "upsert_case_record") {
    throw new Error(`Unknown operation type: ${op.operationType}`)
  }

  const { payload } = op
  const response = await fetch("/api/case-records/offline-upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ record: payload }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `HTTP ${response.status}`)
  }
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
