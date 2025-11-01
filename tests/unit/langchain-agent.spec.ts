import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MonthlyReportData } from "../../reports/generateMonthlyReport";

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

import { summarizeMonthlyReport } from "../../services/langchain/agent";
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
});
