import { describe, it, expect, beforeEach } from "vitest"
import { saveExpressionLog } from "@/lib/persistence/expression"

// Ensure no Supabase env so localStorage path is used
beforeEach(() => {
  // Clear localStorage between tests
  localStorage.clear()
})

describe("saveExpressionLog (localStorage fallback)", () => {
  it("saves a record to localStorage/expressionLogs when Supabase is not configured", async () => {
    const occurredAt = new Date().toISOString()

    const saved = await saveExpressionLog({
      occurredAt,
      expression: "笑顔",
      reaction: null,
      intervention: null,
      discomfort: null,
      note: "ユニットテスト",
      serviceId: null,
      userId: null,
    })

    // Verify return value
    expect(saved.id).toBeTruthy()
    expect(saved.createdAt).toBeTruthy()
    expect(saved.occurredAt).toBe(occurredAt)
    expect(saved.expression).toBe("笑顔")

    // Verify localStorage
    const raw = localStorage.getItem("expressionLogs")
    expect(raw).toBeTruthy()
    const list = JSON.parse(raw!)
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBe(1)
    expect(list[0].id).toBe(saved.id)
    expect(list[0].expression).toBe("笑顔")
  })
})
