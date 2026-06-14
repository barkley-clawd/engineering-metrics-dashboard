import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSessionCollector } from '../collector'
import { execSync } from 'node:child_process'

vi.mock('node:child_process')

const mockExecSync = vi.mocked(execSync)

beforeEach(() => {
  vi.restoreAllMocks()
})

function cliOutput(overview: Record<string, number>, tools: Array<{ name: string; count: number; pct: string }>): string {
  const section = (title: string, rows: string[]) => [
    '┌────────────────────────────────────────────────────────┐',
    `│${title}│`,
    '├────────────────────────────────────────────────────────┤',
    ...rows,
    '└────────────────────────────────────────────────────────┘',
  ].join('\n')

  const overviewRows = Object.entries(overview).map(
    ([k, v]) => `│${k.padEnd(48)}${String(v).padStart(6)} │`,
  )

  const toolRows = tools.map(
    t => `│ ${t.name.padEnd(18)} ██████████████████████████████ ${String(t.count).padStart(5)} (${t.pct})│`,
  )

  return [
    section('                       OVERVIEW                         ', overviewRows),
    '',
    section('                      TOOL USAGE                        ', toolRows),
  ].join('\n')
}

describe('createSessionCollector', () => {
  it('parses opencode stats output into sessions and aggregate', async () => {
    const mockOutput = cliOutput(
      { Sessions: 2, Messages: 0, Days: 1 },
      [
        { name: 'edit', count: 1, pct: '50%' },
        { name: 'search', count: 1, pct: '50%' },
      ],
    )

    mockExecSync.mockReturnValueOnce(mockOutput + '\n')

    const collector = createSessionCollector()
    const result = await collector.collect()

    expect(result.gap).toBeNull()
    expect(result.sessions).toHaveLength(0)
    expect(result.sessionUsage).not.toBeNull()
    expect(result.sessionUsage!.totalSessions).toBe(2)
    expect(result.sessionUsage!.uniqueTools).toEqual(['edit', 'search'])
    expect(result.sessionUsage!.topActions).toHaveLength(2)
    expect(result.sessionUsage!.topActions[0]!.action).toBe('edit')
    expect(result.sessionUsage!.topActions[0]!.count).toBe(1)
    expect(result.errors).toHaveLength(0)
  })

  it('handles zero sessions from CLI', async () => {
    const mockOutput = cliOutput(
      { Sessions: 0, Messages: 0, Days: 1 },
      [],
    )

    mockExecSync.mockReturnValueOnce(mockOutput + '\n')

    const collector = createSessionCollector()
    const result = await collector.collect()

    expect(result.gap).toBeNull()
    expect(result.sessions).toHaveLength(0)
    expect(result.sessionUsage).not.toBeNull()
    expect(result.sessionUsage!.totalSessions).toBe(0)
    expect(result.sessionUsage!.uniqueTools).toEqual([])
    expect(result.sessionUsage!.topActions).toEqual([])
  })

  it('returns documented gap when CLI is unavailable', async () => {
    mockExecSync.mockImplementationOnce(() => {
      throw new Error('command not found: opencode')
    })

    const collector = createSessionCollector()
    const result = await collector.collect()

    expect(result.sessions).toHaveLength(0)
    expect(result.sessionUsage).toBeNull()
    expect(result.gap).not.toBeNull()
    expect(result.gap).toContain('opencode stats CLI unavailable')
    expect(result.errors).toHaveLength(0)
  })

  it('uses custom opencode command path with --days flag', async () => {
    mockExecSync.mockImplementationOnce((cmd: string) => {
      expect(cmd).toBe('/custom/opencode stats --days 30 2>/dev/null')
      return cliOutput({ Sessions: 0, Messages: 0, Days: 30 }, []) + '\n'
    })

    const collector = createSessionCollector({ opencodeCommand: '/custom/opencode' })
    const result = await collector.collect()

    expect(result.gap).toBeNull()
    expect(result.sessions).toHaveLength(0)
  })

  it('returns gap on unparseable CLI output', async () => {
    mockExecSync.mockReturnValueOnce('garbage output that is not a CLI table\n')

    const collector = createSessionCollector()
    const result = await collector.collect()

    expect(result.sessions).toHaveLength(0)
    expect(result.sessionUsage).toBeNull()
    expect(result.gap).not.toBeNull()
    expect(result.gap).toContain('opencode stats CLI unavailable')
    expect(result.errors).toHaveLength(0)
  })
})
