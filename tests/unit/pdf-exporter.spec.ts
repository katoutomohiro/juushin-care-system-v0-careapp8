import { describe, it, expect } from "vitest";
import { toTableData } from "@/lib/exporter/pdf";

describe("pdf exporter toTableData", () => {
  it("maps & masks", () => {
    const rows = [
      { a: "x", b: "secret", c: 10 },
    ];
    const columns = [
      { key: "a", header: "A" },
      { key: "b", header: "B" },
      { key: "c", header: "C", map: (v: any) => `#${v}` },
    ];
    const { headers, body } = toTableData(rows, columns as any, {
      maskFields: ["b"],
      rowMapper: (r: any) => ({ ...r, a: r.a.toUpperCase() }),
    });
    expect(headers).toEqual(["A", "B", "C"]);
    expect(body[0]).toEqual(["X", "***", "#10"]);
  });

  it("handles empty arrays", () => {
    const { headers, body } = toTableData(
      [],
      [{ key: "x", header: "X" }] as any,
      {}
    );
    expect(headers).toEqual(["X"]);
    expect(body).toEqual([]);
  });

  it("handles nested paths", () => {
    const rows = [{ user: { name: "Alice" } }];
    const columns = [{ key: "user.name", header: "Name" }];
    const { body } = toTableData(rows, columns as any, {});
    expect(body[0][0]).toBe("Alice");
  });
});
