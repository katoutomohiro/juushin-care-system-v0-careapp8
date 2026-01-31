/**
 * Records Analytics API response types
 */

export type RecordsAnalyticsDaily = {
  date: string
  seizureCount: number
  sleepMins: number
  mealsCompleted: number
}

export type RecordsAnalyticsResponse = {
  range: {
    dateFrom: string
    dateTo: string
  }
  daily: RecordsAnalyticsDaily[]
  summary: {
    seizureCountTotal: number
    sleepMinsAvg: number
    mealsCompletedTotal: number
  }
}
