import { describe, expect, it } from "vitest"
import { buildATCaseRecordContentFromDailyLog } from "@/lib/case-records"

describe("AT case record generation", () => {
  it("fills date parts and transport fields from care events", () => {
    const recordDate = "2025-01-02"
    const careEvents = [
      {
        id: "t1",
        eventType: "transportation",
        timestamp: "2025-01-02T09:00:00Z",
        departureTime: "09:00",
        arrivalTime: "09:30",
        route: "home-to-facility",
        vehicle: "バン",
        driver: "佐藤",
        notes: "安全に移動",
        userId: "A・T",
        serviceId: "life-care",
      },
    ]

    const content = buildATCaseRecordContentFromDailyLog({
      recordDate,
      careEvents,
      userId: "A・T",
      serviceType: "life-care",
    })

    expect(content.front.year).toBe("2025")
    expect(content.front.month).toBe("01")
    expect(content.front.day).toBe("02")
    expect(content.front.weekday).toBe("木")
    expect(content.front.transportTime).toContain("09:00")
    expect(content.front.transportTime).toContain("09:30")
    expect(content.front.transportDetail).toContain("自宅↔事業所")
    expect(content.front.transportDetail).toContain("バン")
  })
})
