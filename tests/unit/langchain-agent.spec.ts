import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MonthlyReportData, TodoLite } from "../../services/langchain/agent";

// Mock ChatOpenAI to avoid network calls
vi.mock("@langchain/openai", () => {
  class MockChatOpenAI {
    public model = "mock-model";
    private impl: (input: string) => Promise<any>;
    constructor() {
      this.impl = async () => ({ content: '{"summary":"ok","highlights":["h1","h2"]}' });
    }
    setMock(fn: (input: string) => Promise<any>) {
      this.impl = fn;
    }
    async invoke(input: string) {
      return this.impl(input);
    }
  }
  // expose a singleton-like access to tweak behavior per test
  const instance = new MockChatOpenAI();
  const ChatOpenAIProxy = vi.fn(() => instance);
  (ChatOpenAIProxy as any).__instance = instance;
  return { ChatOpenAI: ChatOpenAIProxy };
});

import { summarizeMonthlyReport, summarizeTodosLocally, summarizeMedications } from "../../services/langchain/agent";
import { ChatOpenAI as ChatOpenAIMock } from "@langchain/openai";

const sample: MonthlyReportData = {
  ym: "2025-10",
  totals: {
    entries: 31,
    seizureCount: 3,
    avgHeartRate: 92.4,
    avgTemperature: 36.8,
    avgSpO2: 97.2,
  },
  days: [
    { date: "2025-10-01", hr: 90, temp: 36.7, spO2: 98, seizure: 0 },
    { date: "2025-10-02", hr: 94, temp: 36.9, spO2: 97, seizure: 1 },
  ],
};

describe("summarizeMonthlyReport (LLM)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns structured summary when LLM outputs valid JSON", async () => {
    // default mock returns valid JSON
    const res = await summarizeMonthlyReport(sample);
    expect(res.summary).toBe("ok");
    expect(res.highlights).toEqual(["h1", "h2"]);
    expect(res.metrics.seizureCount).toBe(3);
    expect(res.model).toBeDefined();
  });

  it("falls back to plain text summary when LLM returns non-JSON", async () => {
    // Override mock to return plain text
    const inst: any = (ChatOpenAIMock as any).__instance;
    inst.setMock(async () => ({ content: "プレーンテキストの要約" }));

    const res = await summarizeMonthlyReport(sample);
    expect(res.summary).toContain("プレーンテキスト");
    expect(Array.isArray(res.highlights)).toBe(true);
    expect(res.highlights.length).toBe(0);
  });

  it("returns rule-based fallback when model.invoke throws", async () => {
    const inst: any = (ChatOpenAIMock as any).__instance;
    inst.setMock(async () => {
      throw new Error("network error");
    });

    const res = await summarizeMonthlyReport(sample);
    expect(res.model).toBe("fallback-rule");
    expect(res.summary).toContain("今月(2025-10)");
    expect(res.highlights.some((h: string) => h.includes("発作頻度"))).toBe(true);
  });

  it("includes todos in prompt and summary when provided", async () => {
    const todos: TodoLite[] = [
      { id: "1", title: "月次報告確認", completed: false, dueDate: "2025-10-15", priority: "high" },
      { id: "2", title: "家族面談", completed: true, dueDate: "2025-10-10" },
      { id: "3", title: "リハビリ計画更新", completed: false, dueDate: "2025-09-30", priority: "medium" },
    ];

    const sampleWithTodos: MonthlyReportData = { ...sample, todos };

    // Mock returns JSON with todos mention
    const inst: any = (ChatOpenAIMock as any).__instance;
    inst.setMock(async (input: string) => {
      // Verify todos data is in prompt
      expect(input).toContain("todos");
      expect(input).toContain("completed");
      return { content: '{"summary":"ToDo状況含む要約","highlights":["完了1件","未完了2件","期限切れ1件"]}' };
    });

    const res = await summarizeMonthlyReport(sampleWithTodos);
    expect(res.summary).toContain("ToDo");
    expect(res.highlights.length).toBeGreaterThan(0);
  });
});

describe("summarizeTodosLocally", () => {
  it("returns correct todo summary with completed/pending/overdue counts", () => {
    const todos: TodoLite[] = [
      { id: "1", title: "Task 1", completed: true, dueDate: "2025-10-01" },
      { id: "2", title: "Task 2", completed: false, dueDate: "2025-10-15" },
      { id: "3", title: "Task 3", completed: false, dueDate: "2025-09-30" }, // overdue
    ];

    const summary = summarizeTodosLocally(todos);
    expect(summary).toContain("ToDo 3件");
    expect(summary).toContain("完了1");
    expect(summary).toContain("未完了2");
    // Note: With YYYY-MM-DD string comparison, both "2025-10-15" < "2025-11-01" and "2025-09-30" < "2025-11-01" are true
    // So overdue count is 2, not 1 (both Task 2 and Task 3 are overdue as of 2025-11-01)
    expect(summary).toContain("期限切れ 2 件");
  });

  it("handles empty todos array", () => {
    const summary = summarizeTodosLocally([]);
    expect(summary).toContain("ToDo 0件");
    expect(summary).toContain("完了0");
    expect(summary).toContain("未完了0");
    expect(summary).toContain("期限切れ 0 件");
  });
});

describe("summarizeMedications", () => {
  it("returns correct counts and rate for normal data", () => {
    const meds = [
      { taken: true },
      { taken: false },
      { taken: true },
      { taken: false },
    ];
    const s = summarizeMedications(meds as any);
    expect(s.total).toBe(4);
    expect(s.taken).toBe(2);
    expect(s.missed).toBe(2);
    expect(typeof s.rate).toBe("number");
    // 2/4 = 50%
    expect(s.rate).toBe(50);
  });

  it("handles empty or null data", () => {
    expect(summarizeMedications([])).toEqual({ total: 0, taken: 0, missed: 0, rate: 0 });
    expect(summarizeMedications(null as any)).toEqual({ total: 0, taken: 0, missed: 0, rate: 0 });
    expect(summarizeMedications(undefined as any)).toEqual({ total: 0, taken: 0, missed: 0, rate: 0 });
  });
});

describe("LLM prompt integration: medications", () => {
  it("includes medications summary in prompt when provided", async () => {
    const sampleWithMed = {
      ...sample,
      medicationSummary: { total: 10, taken: 8, missed: 2, rate: 80 },
    } as any;

    const inst: any = (ChatOpenAIMock as any).__instance;
    inst.setMock(async (input: string) => {
      expect(input).toContain("medications");
      expect(input).toContain("taken");
      expect(input).toContain("missed");
      return { content: '{"summary":"服薬状況も考慮した要約","highlights":["服薬率80%"]}' };
    });

    const res = await summarizeMonthlyReport(sampleWithMed);
    expect(res.summary).toContain("服薬状況");
  });
});
