import "@testing-library/jest-dom"
import { vi } from "vitest"
import 'fake-indexeddb/auto';

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))
