import { saveDraft, loadDraft, clearDraft } from "./db"
import type { CaseRecordDraft } from "./types"
import type { ATCaseRecord } from "@/lib/at-case-record-template"

/**
 * Draft キーを作成
 */
export function makeDraftKey(serviceId: string, userId: string, date: string): string {
  return `${serviceId}:${userId}:${date}`
}

/**
 * Draft を自動保存（debounce対応は呼び出し側で）
 */
export async function autosaveDraft(
  serviceId: string,
  userId: string,
  date: string,
  record: ATCaseRecord,
): Promise<void> {
  const key = makeDraftKey(serviceId, userId, date)
  const draft: CaseRecordDraft = {
    key,
    data: record,
    updatedAt: Date.now(),
  }
  await saveDraft(draft)
}

/**
 * Draft から復元
 */
export async function restoreDraft(
  serviceId: string,
  userId: string,
  date: string,
): Promise<ATCaseRecord | null> {
  const key = makeDraftKey(serviceId, userId, date)
  const draft = await loadDraft(key)
  return draft?.data ?? null
}

/**
 * Draft をクリア
 */
export async function removeDraft(
  serviceId: string,
  userId: string,
  date: string,
): Promise<void> {
  const key = makeDraftKey(serviceId, userId, date)
  await clearDraft(key)
}
