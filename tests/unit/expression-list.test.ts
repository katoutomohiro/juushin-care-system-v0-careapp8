import { beforeEach, describe, expect, it } from "vitest"
import { listExpressionLogs, type ExpressionLog } from "../../lib/persistence/expression"

beforeEach(() => {
  localStorage.clear()
})

describe("listExpressionLogs (local)", () => {
  const seed = (items: Partial<ExpressionLog>[]) => {
    const now = new Date().toISOString()
    const logs = items.map((p, i) => ({
      id: `id-${i}`,
      occurredAt: p.occurredAt || now,
      expression: p.expression || "笑顔",
      reaction: p.reaction ?? null,
      intervention: p.intervention ?? null,
      discomfort: p.discomfort ?? null,
      note: p.note ?? null,
      serviceId: p.serviceId ?? null,
      userId: p.userId ?? null,
      createdAt: now,
    })) as ExpressionLog[]
    localStorage.setItem("expressionLogs", JSON.stringify(logs))
  }

  it("filters by keyword across text fields", async () => {
    seed([
      { occurredAt: "2025-10-01T10:00:00Z", expression: "笑顔", note: "明るい表情" },
      { occurredAt: "2025-10-02T10:00:00Z", expression: "しかめ面", reaction: "やや不安" },
    ])
    const list = await listExpressionLogs({ keyword: "明るい" })
    expect(list.length).toBe(1)
    expect(list[0].note).toContain("明るい")
  })

  it("filters by date range and expression", async () => {
    seed([
      { occurredAt: "2025-10-01T10:00:00Z", expression: "笑顔" },
      { occurredAt: "2025-10-05T10:00:00Z", expression: "無表情" },
      { occurredAt: "2025-10-06T10:00:00Z", expression: "笑顔" },
    ])
    const list = await listExpressionLogs({ start: "2025-10-02", end: "2025-10-06T23:59:59Z", expression: "笑顔" })
    expect(list.length).toBe(1)
    expect(list[0].occurredAt).toBe("2025-10-06T10:00:00Z")
  })
})
