import type { ATCaseRecord } from "@/lib/at-case-record-template"

/**
 * Outbox に積まれた操作
 */
export interface OutboxOp {
  opId: string
  dedupeKey: string
  operationType: "upsert_case_record"
  payload: ATCaseRecord
  status: "pending" | "done" | "failed"
  attempts: number
  lastError?: string
  createdAt: number
  updatedAt: number
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
