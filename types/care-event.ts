export interface CareEvent {
  id: string
  eventType: string
  timestamp: string
  userId: string
  time: string
  notes?: string
  [key: string]: unknown
}
