import { enqueueOp, listPendingOps, updateOpStatus } from "./db"
import type { OutboxOp } from "./types"
import type { ATCaseRecord } from "@/lib/at-case-record-template"

/**
 * 簡易 UUID v4 生成（ブラウザネイティブ用）
 */
function generateUuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // フォールバック: ランダム文字列
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ケース記録 upsert を Outbox に追加
 */
export async function enqueueUpsertCaseRecord(params: {
  serviceId: string
  userId: string
  date: string
  payload: ATCaseRecord
}): Promise<string> {
  const { serviceId, userId, date, payload } = params
  const dedupeKey = `${serviceId}_${userId}_${date}`
  const opId = generateUuid()
  const now = Date.now()

  const op: OutboxOp = {
    opId,
    dedupeKey,
    operationType: "upsert_case_record",
    payload,
    status: "pending",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  }

  await enqueueOp(op)
  console.log(`[outbox] Enqueued operation ${opId} with dedupeKey ${dedupeKey}`)

  return opId
}

/**
 * pending な操作をすべて取得
 */
export async function getPendingOps(): Promise<OutboxOp[]> {
  const ops = await listPendingOps()
  return ops
}

/**
 * 操作を完了としてマーク
 */
export async function markOpDone(opId: string): Promise<void> {
  await updateOpStatus(opId, "done", undefined)
}

/**
 * 操作を失敗としてマーク
 */
export async function markOpFailed(opId: string, error: string): Promise<void> {
  await updateOpStatus(opId, "failed", error)
}

/**
 * 失敗した操作をリトライ用に pending に戻す
 */
export async function resetOpForRetry(opId: string): Promise<void> {
  await updateOpStatus(opId, "pending", undefined)
}
