import { createHash } from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import type { OutboxSyncOp, OutboxSyncRequest } from "@/lib/offline/types"
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"

const MAX_OPS_PER_REQUEST = 50

type SyncOpResult = {
  opId: string
  status: "applied" | "already_applied" | "failed" | "processing"
  error?: string
  result?: unknown
}

type ReceiptRow = {
  op_id: string
  payload_hash: string
  status: string
  result?: unknown
  error?: string
}

const ERROR_MESSAGES = {
  MISSING_OPS: "ops is required",
  TOO_MANY_OPS: `ops must be less than or equal to ${MAX_OPS_PER_REQUEST}`,
  INVALID_OP: "invalid operation payload",
  PAYLOAD_CONFLICT: "payload hash mismatch for opId",
}

function stableStringify(value: unknown): string {
  const seen = new WeakSet()
  return JSON.stringify(value, (_key, val) => {
    if (!val || typeof val !== "object") return val
    if (seen.has(val as object)) return "[Circular]"
    seen.add(val as object)

    if (Array.isArray(val)) return val

    return Object.keys(val as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = (val as Record<string, unknown>)[key]
        return acc
      }, {})
  })
}

function hashPayload(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex")
}

function toErrorMessage(error: unknown): string {
  if (!error) return "unknown error"
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  return JSON.stringify(error)
}

function isConflict(error?: PostgrestError | null): boolean {
  return Boolean(error?.code === "23505" || error?.details?.includes("duplicate key"))
}

function normalizeOps(rawOps: unknown): OutboxSyncOp[] {
  if (!Array.isArray(rawOps)) throw new Error(ERROR_MESSAGES.MISSING_OPS)
  if (rawOps.length === 0) throw new Error(ERROR_MESSAGES.MISSING_OPS)
  if (rawOps.length > MAX_OPS_PER_REQUEST) throw new Error(ERROR_MESSAGES.TOO_MANY_OPS)

  return rawOps.map((op) => {
    if (!op || typeof op !== "object") throw new Error(ERROR_MESSAGES.INVALID_OP)
    const { opId, dedupeKey, serviceId, userId, recordDate, operationType, payload } = op as OutboxSyncOp
    if (!opId || !operationType || !payload || !serviceId || !userId || !recordDate || !dedupeKey) {
      throw new Error(ERROR_MESSAGES.INVALID_OP)
    }
    return { opId, dedupeKey, serviceId, userId, recordDate, operationType, payload }
  })
}

async function readExistingReceipt(supabase: SupabaseClient, opId: string): Promise<ReceiptRow | null> {
  const { data, error } = await supabase.from("offline_op_receipts").select("*").eq("op_id", opId).maybeSingle()
  if (error) throw error
  return (data as ReceiptRow | null) || null
}

async function saveReceiptState(
  supabase: SupabaseClient,
  opId: string,
  fields: Partial<{ status: string; result: unknown; error: string; payload_hash: string }>,
): Promise<void> {
  const { error } = await supabase.from("offline_op_receipts").update({ ...fields, updated_at: new Date().toISOString() }).eq("op_id", opId)
  if (error) throw error
}

async function applyOperation(supabase: SupabaseClient, op: OutboxSyncOp): Promise<unknown> {
  if (op.operationType !== "upsert_case_record") {
    throw new Error(`unsupported operationType ${op.operationType}`)
  }

  const payload = {
    user_id: op.userId,
    service_type: op.serviceId,
    record_date: op.recordDate,
    section: "structured",
    item_key: "root",
    item_value: null,
    details: op.payload,
    source: "offline-outbox",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("case_records")
    .upsert(payload, { onConflict: "user_id,service_type,record_date,section,item_key" })
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

async function persistRequestResponse(
  supabase: SupabaseClient,
  requestKey: string | null,
  requestHash: string,
  body: unknown,
  status: number,
): Promise<void> {
  if (!requestKey) return
  await supabase
    .from("api_idempotency_keys")
    .upsert({ key: requestKey, request_hash: requestHash, response: body, status }, { onConflict: "key" })
}

async function tryLockRequest(
  supabase: SupabaseClient,
  requestKey: string,
  requestHash: string,
): Promise<{ cached?: { body: unknown; status: number }; conflict?: boolean }> {
  const insertResult = await supabase
    .from("api_idempotency_keys")
    .insert({ key: requestKey, request_hash: requestHash })
    .select("request_hash, response, status")
    .maybeSingle()

  if (!insertResult.error && insertResult.data) return {}

  if (!isConflict(insertResult.error)) {
    throw insertResult.error || new Error("failed to reserve idempotency key")
  }

  const { data, error } = await supabase
    .from("api_idempotency_keys")
    .select("request_hash, response, status")
    .eq("key", requestKey)
    .maybeSingle()

  if (error) throw error
  if (!data) return {}
  if (data.request_hash !== requestHash) return { conflict: true }
  if (data.response && data.status) return { cached: { body: data.response, status: data.status } }
  return {}
}

/**
 * Offline Outbox からのケース記録 upsert を受け取り、冪等に保存
 */
export async function POST(request: NextRequest) {
  const supabase = supabaseServer
  try {
    const body = (await request.json()) as Partial<OutboxSyncRequest>
    const deviceId = (body.deviceId || "unknown-device").toString()
    const ops = normalizeOps(body.ops)
    const requestKey = request.headers.get("idempotency-key")?.trim() || body.syncRequestId?.toString().trim() || null
    const requestHash = hashPayload({ deviceId, ops })

    if (requestKey) {
      const reservation = await tryLockRequest(supabase, requestKey, requestHash)
      if (reservation.conflict) {
        return NextResponse.json({ ok: false, error: "payload differs for the same Idempotency-Key" }, { status: 409 })
      }
      if (reservation.cached) {
        return NextResponse.json(reservation.cached.body, { status: reservation.cached.status })
      }
    }

    const results: SyncOpResult[] = []
    let hasProcessing = false

    for (const op of ops) {
      const payloadHash = hashPayload(op.payload)

      const insertResult = await supabase
        .from("offline_op_receipts")
        .insert({
          op_id: op.opId,
          device_id: deviceId,
          user_id: op.userId,
          kind: op.operationType,
          payload_hash: payloadHash,
          status: "processing",
        })
        .select("op_id, payload_hash, status, result, error")
        .maybeSingle()

      if (insertResult.error && !isConflict(insertResult.error)) {
        throw insertResult.error
      }

      if (insertResult.error && isConflict(insertResult.error)) {
        const existing = await readExistingReceipt(supabase, op.opId)
        if (existing && existing.payload_hash !== payloadHash) {
          return NextResponse.json(
            { ok: false, error: `${ERROR_MESSAGES.PAYLOAD_CONFLICT}: ${op.opId}` },
            { status: 409 },
          )
        }

        if (existing?.status === "applied") {
          results.push({ opId: op.opId, status: "already_applied", result: existing.result })
          continue
        }

        if (existing?.status === "processing") {
          results.push({ opId: op.opId, status: "processing" })
          hasProcessing = true
          continue
        }

        if (existing?.status === "failed") {
          results.push({ opId: op.opId, status: "failed", error: existing.error || "previous failure" })
          continue
        }
      }

      try {
        const applied = await applyOperation(supabase, op)
        await saveReceiptState(supabase, op.opId, { status: "applied", result: applied, payload_hash: payloadHash })
        results.push({ opId: op.opId, status: "applied", result: applied })
      } catch (error) {
        const message = toErrorMessage(error)
        await saveReceiptState(supabase, op.opId, { status: "failed", error: message })
        results.push({ opId: op.opId, status: "failed", error: message })
      }
    }

    const responseBody = { ok: results.every((r) => r.status !== "failed"), results }
    const status = hasProcessing ? 202 : 200

    await persistRequestResponse(supabase, requestKey, requestHash, responseBody, status)

    return NextResponse.json(responseBody, { status })
  } catch (error) {
    const message = toErrorMessage(error)
    console.error("[offline-upsert] Error", error)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
