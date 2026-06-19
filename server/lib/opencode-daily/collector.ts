import { execFileSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

export interface OpenCodeDailyCollectorResult {
  date: string
  source: string
  totalSessions: number
  totalMessages: number
  totalTokens: number
  totalCost: number | null
  rawJson: string | null
  collectedAt: string
  errors: string[]
}

function isCommandNotFound(err: unknown): boolean {
  if (err instanceof Error) {
    const e = err as NodeJS.ErrnoException
    if (e.code === 'ENOENT' || e.code === 'EACCES') return true
    const msg = e.message
    if (msg.includes('ENOENT') || msg.includes('EACCES') || msg.includes('not found') || msg.includes('127')) return true
  }
  return false
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null
  const normalized = value.replace(/[$,]/g, '').trim()
  const compactMatch = normalized.match(/^(-?\d+(?:\.\d+)?)([KMB])$/i)
  if (compactMatch) {
    const base = Number(compactMatch[1])
    if (!Number.isFinite(base)) return null
    const suffix = compactMatch[2]!.toUpperCase()
    const multiplier = suffix === 'K' ? 1_000 : suffix === 'M' ? 1_000_000 : 1_000_000_000
    return base * multiplier
  }
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractOverviewValue(lines: string[], label: string): number | null {
  const pattern = new RegExp(`│\\s*${escapeRegExp(label)}\\s+([^│]+?)\\s*│`, 'i')
  for (const line of lines) {
    const match = line.match(pattern)
    if (!match) continue
    const valueMatch = match[1]?.match(/-?\$?[\d,]+(?:\.\d+)?(?:[KMB])?/i)
    return parseNumber(valueMatch?.[0])
  }
  return null
}

function getLocalDateKey(): string {
  return new Date().toLocaleDateString('en-CA')
}

export function parseOpenCodeDailyStats(stdout: string, collectedAt: string): {
  totalSessions: number
  totalMessages: number
  totalTokens: number
  totalCost: number | null
  rawJson: string
} {
  const lines = stdout.split('\n')
  const totalSessions = extractOverviewValue(lines, 'Sessions') ?? 0
  const totalMessages = extractOverviewValue(lines, 'Messages') ?? 0
  const inputTokens = extractOverviewValue(lines, 'Input') ?? extractOverviewValue(lines, 'Input Tokens') ?? 0
  const outputTokens = extractOverviewValue(lines, 'Output') ?? extractOverviewValue(lines, 'Output Tokens') ?? 0
  const totalCost = extractOverviewValue(lines, 'Total Cost')

  return {
    totalSessions,
    totalMessages,
    totalTokens: inputTokens + outputTokens,
    totalCost,
    rawJson: stdout,
  }
}

export function collectDailyOpenCodeUsage(): OpenCodeDailyCollectorResult {
  const collectedAt = new Date().toISOString()
  const date = getLocalDateKey()
  const errors: string[] = []

  const candidates: string[] = []
  if (process.env.OPENCODE_BIN) candidates.push(process.env.OPENCODE_BIN)
  candidates.push('opencode')
  candidates.push(path.join(os.homedir(), '.opencode/bin/opencode'))
  candidates.push('/home/openclaw/.opencode/bin/opencode')
  if (process.env.OPENCODE_COMMAND) candidates.push(process.env.OPENCODE_COMMAND)

  for (const cmd of candidates) {
    try {
      const stdout = execFileSync(cmd, ['stats', '--days', '1'], {
        timeout: 15_000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
      const parsed = parseOpenCodeDailyStats(stdout, collectedAt)
      return {
        date,
        source: 'opencode',
        totalSessions: parsed.totalSessions,
        totalMessages: parsed.totalMessages,
        totalTokens: parsed.totalTokens,
        totalCost: parsed.totalCost,
        rawJson: parsed.rawJson,
        collectedAt,
        errors: [],
      }
    } catch (err) {
      if (isCommandNotFound(err)) continue
      errors.push(`OpenCode stats collector failed: ${err instanceof Error ? err.message : String(err)}`)
      return {
        date,
        source: 'opencode',
        totalSessions: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalCost: null,
        rawJson: null,
        collectedAt,
        errors,
      }
    }
  }

  errors.push('OpenCode binary not found: no opencode binary available')
  return {
    date,
    source: 'opencode',
    totalSessions: 0,
    totalMessages: 0,
    totalTokens: 0,
    totalCost: null,
    rawJson: null,
    collectedAt,
    errors,
  }
}
