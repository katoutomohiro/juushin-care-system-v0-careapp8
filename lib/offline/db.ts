import type { CaseRecordDraft, OutboxOp, SyncMeta } from "./types"

const DB_NAME = "care-app-offline"
const DB_VERSION = 1

let db: IDBDatabase | null = null

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // case_record_drafts
      if (!database.objectStoreNames.contains("case_record_drafts")) {
        database.createObjectStore("case_record_drafts", { keyPath: "key" })
      }

      // outbox_ops
      if (!database.objectStoreNames.contains("outbox_ops")) {
        const store = database.createObjectStore("outbox_ops", { keyPath: "opId" })
        store.createIndex("status", "status", { unique: false })
        store.createIndex("createdAt", "createdAt", { unique: false })
        store.createIndex("dedupeKey", "dedupeKey", { unique: false })
      }

      // meta
      if (!database.objectStoreNames.contains("meta")) {
        database.createObjectStore("meta", { keyPath: "key" })
      }
    }
  })
}

export async function getDB(): Promise<IDBDatabase> {
  if (db) return db
  return initDB()
}

/**
 * Draft を保存
 */
export async function saveDraft(draft: CaseRecordDraft): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("case_record_drafts", "readwrite")
    const store = tx.objectStore("case_record_drafts")
    const request = store.put(draft)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Draft を読み込み
 */
export async function loadDraft(key: string): Promise<CaseRecordDraft | undefined> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("case_record_drafts", "readonly")
    const store = tx.objectStore("case_record_drafts")
    const request = store.get(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * Draft を削除
 */
export async function clearDraft(key: string): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("case_record_drafts", "readwrite")
    const store = tx.objectStore("case_record_drafts")
    const request = store.delete(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

/**
 * Outbox に操作を追加/置き換え
 */
export async function enqueueOp(op: OutboxOp): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("outbox_ops", "readwrite")
    const store = tx.objectStore("outbox_ops")

    // dedupeKey が既に pending にあれば置き換え
    const index = store.index("dedupeKey")
    const rangeRequest = index.getAll(op.dedupeKey)

    rangeRequest.onerror = () => reject(rangeRequest.error)
    rangeRequest.onsuccess = () => {
      const existing = rangeRequest.result as OutboxOp[]
      const pendingOp = existing.find((o) => o.status === "pending")

      if (pendingOp) {
        // 置き換え
        op.opId = pendingOp.opId
      }

      const putRequest = store.put(op)
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
  })
}

/**
 * Pending な操作をすべて取得
 */
export async function listPendingOps(): Promise<OutboxOp[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("outbox_ops", "readonly")
    const store = tx.objectStore("outbox_ops")
    const index = store.index("status")
    const request = index.getAll("pending")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const ops = request.result as OutboxOp[]
      ops.sort((a, b) => a.createdAt - b.createdAt)
      resolve(ops)
    }
  })
}

/**
 * 操作のステータスを更新
 */
export async function updateOpStatus(
  opId: string,
  status: "pending" | "done" | "failed",
  error?: string,
  attempts?: number,
): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("outbox_ops", "readwrite")
    const store = tx.objectStore("outbox_ops")
    const getRequest = store.get(opId)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const op = getRequest.result as OutboxOp
      if (!op) {
        reject(new Error(`Op ${opId} not found`))
        return
      }

      op.status = status
      op.updatedAt = Date.now()
      if (error !== undefined) op.lastError = error
      if (attempts !== undefined) op.attempts = attempts

      const putRequest = store.put(op)
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
  })
}

/**
 * Done/Failed な操作を削除
 */
export async function pruneDoneOps(): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("outbox_ops", "readwrite")
    const store = tx.objectStore("outbox_ops")
    const request = store.openCursor()

    const toDelete: string[] = []
    request.onerror = () => reject(request.error)
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
      if (cursor) {
        const op = cursor.value as OutboxOp
        if (op.status === "done" || op.status === "failed") {
          toDelete.push(op.opId)
        }
        cursor.continue()
      } else {
        // すべてのカーソルが終わったので削除実行
        toDelete.forEach((opId) => {
          store.delete(opId)
        })
        resolve()
      }
    }
  })
}

/**
 * Sync メタデータ取得
 */
export async function getSyncMeta(): Promise<SyncMeta> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("meta", "readonly")
    const store = tx.objectStore("meta")
    const request = store.get("sync")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const meta = request.result as SyncMeta | undefined
      resolve(meta || { isOnline: true })
    }
  })
}

/**
 * Sync メタデータ保存
 */
export async function saveSyncMeta(meta: SyncMeta): Promise<void> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const tx = database.transaction("meta", "readwrite")
    const store = tx.objectStore("meta")
    const request = store.put({ key: "sync", ...meta })
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
