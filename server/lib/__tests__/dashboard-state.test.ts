import { describe, expect, it } from 'vitest'
import { buildDashboardWindow } from '../dashboard-state'

function makeRow(day: string, overrides: Partial<import('../../../types/daily-metrics').DailyMetricsRow> = {}) {
  return {
    day,
    capturedAt: `${day}T12:00:00.000Z`,
    source: 'orchestrated',
    version: 1,
    reflectsCompleteData: true,
    issuesOpened: 0,
    issuesClosed: 0,
    prsCreated: 0,
    prsMerged: 0,
    totalCommits: 0,
    avgCycleTimeDays: null,
    medianCycleTimeDays: null,
    p95CycleTimeDays: null,
    cycleTimeSampleSize: 0,
    ciTotalRuns: 0,
    ciPassCount: 0,
    ciFailCount: 0,
    ciPassRate: null,
    ciAvgDurationMs: null,
    totalSessions: 0,
    sessionErrorCount: 0,
    staleIssues: 0,
    stalePrs: 0,
    warnings: [],
    createdAt: `${day}T12:00:00.000Z`,
    ...overrides,
  }
}

describe('buildDashboardWindow', () => {
  it('normalizes the response to a 28-day ascending series with explicit gaps', () => {
    const window = buildDashboardWindow([
      makeRow('2026-06-14', {
        issuesOpened: 2,
        issuesClosed: 3,
        prsCreated: 4,
        prsMerged: 5,
        totalCommits: 6,
        avgCycleTimeDays: 1.5,
        medianCycleTimeDays: 1.2,
        p95CycleTimeDays: 2.8,
        cycleTimeSampleSize: 9,
        ciTotalRuns: 8,
        ciPassCount: 6,
        ciFailCount: 2,
        ciPassRate: 0.75,
        ciAvgDurationMs: 1500,
        totalSessions: 7,
        sessionErrorCount: 1,
        staleIssues: 3,
        stalePrs: 2,
      }),
      makeRow('2026-06-10', {
        issuesOpened: 1,
        issuesClosed: 1,
        prsCreated: 1,
        prsMerged: 1,
        totalCommits: 2,
        ciTotalRuns: 4,
        ciPassCount: 3,
        ciFailCount: 1,
        ciPassRate: 0.75,
        ciAvgDurationMs: 900,
        totalSessions: 5,
        sessionErrorCount: 2,
        staleIssues: 6,
        stalePrs: 4,
        warnings: ['Partial data: local git unavailable'],
      }),
    ], new Date('2026-06-14T12:00:00Z'))

    expect(window.startDay).toBe('2026-05-18')
    expect(window.endDay).toBe('2026-06-14')
    expect(window.days).toHaveLength(28)
    expect(window.days[0]).toMatchObject({ day: '2026-05-18', isGap: true, metrics: null })
    expect(window.days.at(-1)).toMatchObject({ day: '2026-06-14', isGap: false })
    expect(window.missingDays).toContain('2026-06-13')
    expect(window.latestDay?.day).toBe('2026-06-14')
    expect(window.cards.throughput).toMatchObject({
      issuesOpened: 3,
      issuesClosed: 4,
      prsCreated: 5,
      prsMerged: 6,
      totalCommits: 8,
    })
    expect(window.cards.cycleTime).toMatchObject({
      averageDays: 1.5,
      medianDays: 1.2,
      p95Days: 2.8,
      sampleSize: 9,
      sourceDay: '2026-06-14',
    })
    expect(window.cards.ci).toMatchObject({
      totalRuns: 12,
      passCount: 9,
      failCount: 3,
      passRate: 0.75,
      averageDurationMs: 1300,
      sourceDays: 2,
    })
    expect(window.cards.staleWork).toMatchObject({
      staleIssues: 3,
      stalePrs: 2,
      capturedAt: '2026-06-14T12:00:00.000Z',
      reflectsCompleteData: true,
    })
    expect(window.cards.sessionUsage).toMatchObject({
      totalSessions: 12,
      sessionErrorCount: 3,
    })
    expect(window.coverage).toMatchObject({
      totalDays: 28,
      daysWithData: 2,
      missingDays: 26,
      hasGaps: true,
      hasSourceWarnings: true,
      isComplete: false,
    })
    expect(window.warnings).toEqual(
      expect.arrayContaining([
        'Partial data: local git unavailable',
        'Missing 26 of 28 days in the rolling window',
      ]),
    )
  })

  it('keeps coverage complete when the window is fully populated', () => {
    const rows = Array.from({ length: 28 }, (_, index) => {
      const day = new Date(Date.UTC(2026, 5, 14))
      day.setUTCDate(day.getUTCDate() - (27 - index))
      return makeRow(day.toISOString().slice(0, 10), {
        issuesOpened: 1,
        issuesClosed: 1,
        prsCreated: 1,
        prsMerged: 1,
        totalCommits: 1,
      })
    })

    const window = buildDashboardWindow(rows, new Date('2026-06-14T12:00:00Z'))

    expect(window.days).toHaveLength(28)
    expect(window.missingDays).toHaveLength(0)
    expect(window.coverage.isComplete).toBe(true)
    expect(window.warnings).toHaveLength(0)
    expect(window.cards.throughput.totalCommits).toBe(28)
  })
})
