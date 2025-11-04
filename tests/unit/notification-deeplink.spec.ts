import { describe, expect, it, vi } from "vitest"

describe("notification deep link and throttling", () => {
  it("focuses existing window and throttles duplicate alerts", async () => {
    const originalNotification = globalThis.Notification
    const originalNavigator = globalThis.navigator

    vi.useFakeTimers()
    vi.resetModules()

    const showNotification = vi.fn()
    globalThis.Notification = { permission: "granted" } as any
    globalThis.navigator = {
      serviceWorker: {
        ready: Promise.resolve({ showNotification }),
      },
    } as any

    const { notifyLocal } = await import("@/lib/notifications")

    const baseOpts = {
      title: "Alert",
      body: "High temperature detected",
      url: "/alerts",
      type: "vital",
      date: "2025-11-04",
      userId: "user-1",
      level: "warn",
    }

    await notifyLocal(baseOpts)
    await Promise.resolve()
    expect(showNotification).toHaveBeenCalledTimes(1)

    await notifyLocal(baseOpts)
    await Promise.resolve()
    expect(showNotification).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(5 * 60 * 1000 + 1)

    await notifyLocal(baseOpts)
    await Promise.resolve()
    expect(showNotification).toHaveBeenCalledTimes(2)

    vi.useRealTimers()

    vi.resetModules()

    const listeners = new Map<string, (event: any) => void>()
    const matchAll = vi.fn()
    const openWindow = vi.fn(() => Promise.resolve())

    const focus = vi.fn(() => Promise.resolve())
    matchAll.mockResolvedValueOnce([
      {
        url: "https://example.com/alerts",
        focus,
      },
    ])

    const waitUntil = vi.fn((promise: Promise<unknown>) => promise)

    const selfMock: any = {
      addEventListener: (name: string, handler: (event: any) => void) => listeners.set(name, handler),
      clients: {
        matchAll,
        openWindow,
      },
      registration: { showNotification: vi.fn() },
      skipWaiting: vi.fn(),
      location: { origin: "https://example.com" },
    }

    Object.assign(globalThis, { self: selfMock, clients: selfMock.clients })

    await import("../../public/sw.js")

    const handler = listeners.get("notificationclick")!

    const event = {
      notification: { close: vi.fn(), data: { url: "/alerts" } },
      waitUntil,
    }

    await handler(event)
    await waitUntil.mock.calls[0][0]

    expect(focus).toHaveBeenCalled()
    expect(openWindow).not.toHaveBeenCalled()

    matchAll.mockResolvedValueOnce([])
    const waitUntilSecond = vi.fn((promise: Promise<unknown>) => promise)

    const eventSecond = {
      notification: { close: vi.fn(), data: { url: "/alerts" } },
      waitUntil: waitUntilSecond,
    }

    await handler(eventSecond)
    await waitUntilSecond.mock.calls[0][0]

    expect(openWindow).toHaveBeenCalledWith("/alerts")

    if (originalNotification === undefined) {
      delete (globalThis as any).Notification
    } else {
      globalThis.Notification = originalNotification
    }

    if (originalNavigator === undefined) {
      delete (globalThis as any).navigator
    } else {
      globalThis.navigator = originalNavigator
    }
  })
})
