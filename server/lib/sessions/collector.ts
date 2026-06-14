import { execSync } from 'node:child_process'
import type { SessionUsageAggregate } from '../../../types/aggregates'
import type { SessionCollectorConfig, SessionCollectorResult } from './types'

export function createSessionCollector(config: SessionCollectorConfig = {}) {
  const periodDays = config.periodDays ?? 30

  return {
    async collect(): Promise<SessionCollectorResult> {
      const cmd = config.opencodeCommand ?? 'opencode'

      try {
        const stdout = execSync(`${cmd} stats --days ${periodDays} 2>/dev/null`, {
          timeout: 15_000,
          encoding: 'utf-8',
          stdio: 'pipe',
        })

        const lines = stdout.split('\n')

        let totalSessions = 0
        let foundOverview = false
        for (const line of lines) {
          if (line.includes('OVERVIEW')) { foundOverview = true; continue }
          const sessionMatch = line.match(/│\s*Sessions\s+(\d+)/)
          if (sessionMatch) {
            totalSessions = parseInt(sessionMatch[1]!, 10)
            break
          }
        }

        const tools: Array<{ toolName: string; count: number }> = []
        let inToolSection = false
        for (const line of lines) {
          if (line.includes('TOOL USAGE')) { inToolSection = true; continue }
          if (!inToolSection) continue
          if (line.includes('└')) break

          const toolMatch = line.match(/│\s+(\S+)\s+.*?(\d+)\s+\(/)
          if (toolMatch) {
            tools.push({
              toolName: toolMatch[1]!,
              count: parseInt(toolMatch[2]!, 10),
            })
          }
        }

        if (!foundOverview) {
          const gap = `opencode stats CLI unavailable: Could not parse CLI output. Install opencode and run 'opencode stats' to populate session metrics.`
          return { sessions: [], sessionUsage: null, gap, errors: [] }
        }

        const periodEnd = new Date().toISOString()
        const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()

        const topActions = tools
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(({ toolName, count }) => ({ action: toolName, count }))

        const sessionUsage: SessionUsageAggregate = {
          periodStart,
          periodEnd,
          totalSessions,
          uniqueTools: tools.map(t => t.toolName),
          topActions,
          errorCount: 0,
        }

        return { sessions: [], sessionUsage, gap: null, errors: [] }
      } catch (err) {
        const gap = `opencode stats CLI unavailable: ${err instanceof Error ? err.message : String(err)}. Install opencode and run 'opencode stats' to populate session metrics.`
        return {
          sessions: [],
          sessionUsage: null,
          gap,
          errors: [],
        }
      }
    },
  }
}

export type SessionCollector = ReturnType<typeof createSessionCollector>
