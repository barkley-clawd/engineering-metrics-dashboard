import { connectOpencodeDb, querySessionsByDay, queryModelBreakdown } from './db-collector'

export interface TokenUsageCollectorResult {
  periodStart: string
  periodEnd: string
  source: string
  toolName: string
  totalSessions: number
  totalMessages: number
  totalTokens: number
  totalCost: number | null
  modelUsage: Array<{
    modelName: string
    messages: number
    inputTokens: number | null
    outputTokens: number | null
    cacheReadTokens: number | null
    cacheWriteTokens: number | null
    cost: number | null
  }>
  rawJson: string | null
  collectedAt: string
  errors: string[]
}

export function collectTokenUsageSnapshot(): TokenUsageCollectorResult {
  const collectedAt = new Date().toISOString()
  const periodEnd = collectedAt
  const periodStart = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  const errors: string[] = []

  const db = connectOpencodeDb()
  if (!db) {
    errors.push('OpenCode DB not found: unable to connect to opencode.db')
    return { periodStart, periodEnd, source: 'opencodedb', toolName: 'opencode', totalSessions: 0, totalMessages: 0, totalTokens: 0, totalCost: null, modelUsage: [], rawJson: null, collectedAt, errors }
  }
  db.close()

  const since = Date.now() - 28 * 24 * 60 * 60 * 1000

  const dailyAggs = querySessionsByDay(28)
  const totalSessions = dailyAggs.reduce((sum, d) => sum + d.sessions, 0)
  const totalTokens = dailyAggs.reduce((sum, d) => sum + d.tokensInput + d.tokensOutput, 0)
  const totalCost = dailyAggs.reduce((sum, d) => sum + d.cost, 0)

  const models = queryModelBreakdown(since)
  const modelUsage = models.map(m => ({
    modelName: m.modelName,
    messages: m.messages,
    inputTokens: m.inputTokens,
    outputTokens: m.outputTokens,
    cacheReadTokens: m.cacheReadTokens,
    cacheWriteTokens: m.cacheWriteTokens,
    cost: m.cost,
  }))

  return {
    periodStart,
    periodEnd,
    source: 'opencodedb',
    toolName: 'opencode',
    totalSessions,
    totalMessages: totalSessions, // approximation per spec
    totalTokens,
    totalCost,
    modelUsage,
    rawJson: null,
    collectedAt,
    errors: [],
  }
}
