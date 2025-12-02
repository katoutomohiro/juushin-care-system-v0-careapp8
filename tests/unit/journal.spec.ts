import { describe, expect, it } from "vitest"
import { buildTimelineEvents } from "@/lib/care-event-timeline"
import type { CareEvent } from "@/services/data-storage-service"

const sampleEvents: CareEvent[] = [
  {
    id: "1",
    eventType: "seizure",
    timestamp: "2025-01-02T10:00:00Z",
    userId: "user-a",
    serviceId: "life-care",
    time: "10:00",
    type: "強直発作",
    duration: 30,
    notes: "痙攣あり",
  },
  {
    id: "2",
    eventType: "hydration",
    timestamp: "2025-01-02T09:00:00Z",
    userId: "user-a",
    serviceId: "life-care",
    time: "09:00",
    fluidType: "水",
    amount: 200,
    method: "経口",
  },
  {
    id: "3",
    eventType: "expression",
    timestamp: "2025-01-01T09:00:00Z",
    userId: "user-b",
    serviceId: "day-support",
    time: "09:00",
    expressionType: "笑顔",
    notes: "ご機嫌",
  },
]

describe("buildTimelineEvents", () => {
  it("filters by user/service and sorts by timestamp desc", () => {
    const events = buildTimelineEvents(sampleEvents, { userId: "user-a", serviceId: "life-care" })
    expect(events).toHaveLength(2)
    expect(events.map((e) => e.id)).toEqual(["1", "2"])
    expect(events[0].category).toBe("発作記録")
    expect(events[0].description).toContain("強直発作")
  })

  it("applies limit when provided", () => {
    const events = buildTimelineEvents(sampleEvents, { limit: 1 })
    expect(events).toHaveLength(1)
    expect(events[0].id).toBe("1")
  })
})
