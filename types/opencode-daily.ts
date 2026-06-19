export interface OpenCodeDailyUsageRow {
  date: string
  source: string
  totalSessions: number
  totalMessages: number
  totalTokens: number
  totalCost: number | null
  rawJson: string | null
  collectedAt: string
}

export interface OpenCodeDailyUsageInsert {
  date: string
  source: string
  totalSessions: number
  totalMessages: number
  totalTokens: number
  totalCost: number | null
  rawJson: string | null
  collectedAt: string
}
