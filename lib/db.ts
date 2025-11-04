import Dexie, { Table } from "dexie"
import type { TodoItem } from "../schemas/todo"
import type { Medication } from "../schemas/medication"

export type AlertLevel = "info" | "warn" | "critical"
export type AlertType = "vital" | "seizure" | "hydration" | "sleep" | "other"

export interface Alert {
  id: string
  userId: string
  date: string
  type: AlertType
  level: AlertLevel
  message: string
  metrics?: Record<string, unknown>
  createdAt: number
}

export interface MedicalRecord {
  time: string
  heartRate?: number
  temperature?: number
  oxygenSaturation?: number
  seizureType?: string
  medsAt?: string[]
  notes?: string
  pee?: boolean
  poo?: boolean
}

export interface EditHistory {
  timestamp: string
  editor: string
  changes: string
}

export interface DiaryEntry {
  id: string
  date: string
  records: MedicalRecord[]
  photos?: string[]
  editHistory?: EditHistory[]
  encryptedData?: string
  createdAt: string
  updatedAt: string
}

export interface PushSubscriptionRecord {
  id: string
  userId: string
  endpoint: string
  keys?: PushSubscriptionJSON["keys"]
  expirationTime?: number | null
  createdAt: number
  raw: PushSubscriptionJSON
}

export class DiaryDatabase extends Dexie {
  diaryEntries!: Table<DiaryEntry, string>
  todos!: Table<TodoItem, string>
  medications!: Table<Medication, string>
  alerts!: Table<Alert, string>
  pushSubscriptions!: Table<PushSubscriptionRecord, string>

  constructor() {
    super("DiaryDatabase")

    this.version(1).stores({
      diaryEntries: "id, date, createdAt, updatedAt",
    })

    this.version(2).stores({
      diaryEntries: "id, date, createdAt, updatedAt",
      todos: "id, completed, dueDate, priority, createdAt, updatedAt",
    })

    this.version(3).stores({
      diaryEntries: "id, date, createdAt, updatedAt",
      todos: "id, completed, dueDate, priority, createdAt, updatedAt",
      medications: "id, userId, date, time, taken",
    })

    this.version(4).stores({
      diaryEntries: "id, date, createdAt, updatedAt",
      todos: "id, completed, dueDate, priority, createdAt, updatedAt",
      medications: "id, userId, date, time, taken",
      alerts: "id, userId, date, type, level, createdAt, [userId+date+type+level]",
    })

    this.version(5).stores({
      diaryEntries: "id, date, createdAt, updatedAt",
      todos: "id, completed, dueDate, priority, createdAt, updatedAt",
      medications: "id, userId, date, time, taken",
      alerts: "id, userId, date, type, level, createdAt, [userId+date+type+level]",
      pushSubscriptions: "id, userId, endpoint, createdAt, [userId+endpoint]",
    })
  }
}

export const db = new DiaryDatabase()
