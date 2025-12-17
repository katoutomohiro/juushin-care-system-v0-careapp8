import type { ATCaseRecord } from "@/lib/at-case-record-template"

export type OutboxOperationType = "upsert_case_record"

export interface OutboxSyncOp {
  opId: string
  dedupeKey: string
  serviceId: string
  userId: string
  recordDate: string // YYYY-MM-DD
  operationType: OutboxOperationType
  payload: ATCaseRecord
}

/**
 * Outbox に積まれた操作
 */
export interface OutboxOp extends OutboxSyncOp {
  status: "pending" | "done" | "failed"
  attempts: number
  lastError?: string
  createdAt: number
  updatedAt: number
}

export interface OutboxSyncRequest {
  syncRequestId: string
  deviceId: string
  ops: OutboxSyncOp[]
}

/**
 * ケース記録下書き
 */
export interface CaseRecordDraft {
  key: string // `${serviceId}:${userId}:${date}`
  data: ATCaseRecord
  updatedAt: number
}

/**
 * Offline sync メタデータ
 */
export interface SyncMeta {
  lastSyncAt?: number
  isOnline: boolean
}
