import type { DailyMetricsRow } from '../../types/daily-metrics'
import type {
  DashboardWindow,
  DashboardWindowCoverage,
  DashboardWindowDay,
  DashboardWindowCycleTimeSummary,
  DashboardWindowCISummary,
  DashboardWindowSessionSummary,
  DashboardWindowStaleWorkSummary,
  DashboardWindowThroughputSummary,
} from '../../types/snapshot'

const WINDOW_DAYS = 28

function toUtcDay(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function parseUtcDay(day: string): Date {
  return new Date(`${day}T00:00:00Z`)
}

function addUtcDays(day: string, offset: number): string {
  const date = parseUtcDay(day)
  date.setUTCDate(date.getUTCDate() + offset)
  return toUtcDay(date)
}

function buildUtcDays(endDay: string, windowDays = WINDOW_DAYS): string[] {
  const start = parseUtcDay(addUtcDays(endDay, -(windowDays - 1)))
  const days: string[] = []
  const current = new Date(start)

  while (current <= parseUtcDay(endDay)) {
    days.push(toUtcDay(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return days
}

function sumBy<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((sum, row) => sum + pick(row), 0)
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

function lastRowWithCycleTime(rows: DailyMetricsRow[]): DailyMetricsRow | null {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i]
    if (!row) continue
    if (row.avgCycleTimeDays != null || row.medianCycleTimeDays != null || row.p95CycleTimeDays != null || row.cycleTimeSampleSize > 0) {
      return row
    }
  }

  return null
}

function latestRow(rows: DailyMetricsRow[]): DailyMetricsRow | null {
  return rows[rows.length - 1] ?? null
}

function buildThroughputSummary(rows: DailyMetricsRow[]): DashboardWindowThroughputSummary {
  return {
    issuesOpened: sumBy(rows, row => row.issuesOpened),
    issuesClosed: sumBy(rows, row => row.issuesClosed),
    prsCreated: sumBy(rows, row => row.prsCreated),
    prsMerged: sumBy(rows, row => row.prsMerged),
    totalCommits: sumBy(rows, row => row.totalCommits),
  }
}

function buildCycleTimeSummary(rows: DailyMetricsRow[]): DashboardWindowCycleTimeSummary {
  const latest = lastRowWithCycleTime(rows)

  return {
    averageDays: latest?.avgCycleTimeDays ?? null,
    medianDays: latest?.medianCycleTimeDays ?? null,
    p95Days: latest?.p95CycleTimeDays ?? null,
    sampleSize: latest?.cycleTimeSampleSize ?? 0,
    sourceDay: latest?.day ?? null,
  }
}

function buildCiSummary(rows: DailyMetricsRow[]): DashboardWindowCISummary {
  const ciRows = rows.filter(row => row.ciTotalRuns > 0 || row.ciPassCount > 0 || row.ciFailCount > 0)
  const totalRuns = sumBy(ciRows, row => row.ciTotalRuns)
  const passCount = sumBy(ciRows, row => row.ciPassCount)
  const failCount = sumBy(ciRows, row => row.ciFailCount)
  const weightedDuration = ciRows.reduce((sum, row) => {
    if (row.ciAvgDurationMs == null || row.ciTotalRuns <= 0) return sum
    return sum + (row.ciAvgDurationMs * row.ciTotalRuns)
  }, 0)
  const durationWeight = ciRows.reduce((sum, row) => {
    if (row.ciAvgDurationMs == null || row.ciTotalRuns <= 0) return sum
    return sum + row.ciTotalRuns
  }, 0)

  return {
    totalRuns,
    passCount,
    failCount,
    passRate: totalRuns > 0 ? passCount / totalRuns : null,
    averageDurationMs: durationWeight > 0 ? weightedDuration / durationWeight : null,
    sourceDays: ciRows.length,
  }
}

function buildStaleWorkSummary(rows: DailyMetricsRow[]): DashboardWindowStaleWorkSummary {
  const latest = latestRow(rows)

  return {
    staleIssues: latest?.staleIssues ?? 0,
    stalePrs: latest?.stalePrs ?? 0,
    capturedAt: latest?.capturedAt ?? null,
    reflectsCompleteData: latest?.reflectsCompleteData ?? null,
  }
}

function buildSessionSummary(rows: DailyMetricsRow[]): DashboardWindowSessionSummary {
  return {
    totalSessions: sumBy(rows, row => row.totalSessions),
    sessionErrorCount: sumBy(rows, row => row.sessionErrorCount),
  }
}

function buildCoverage(rows: DailyMetricsRow[], missingDays: string[], warnings: string[]): DashboardWindowCoverage {
  const daysWithData = rows.length
  const hasSourceWarnings = warnings.length > 0

  return {
    totalDays: WINDOW_DAYS,
    daysWithData,
    missingDays: missingDays.length,
    hasGaps: missingDays.length > 0,
    hasSourceWarnings,
    isComplete: missingDays.length === 0 && !hasSourceWarnings,
  }
}

export function buildDashboardWindow(rows: DailyMetricsRow[], now = new Date()): DashboardWindow {
  const endDay = toUtcDay(now)
  const days = buildUtcDays(endDay)
  const rowsByDay = new Map(rows.map(row => [row.day, row]))
  const windowRows = days.map((day): DashboardWindowDay => {
    const metrics = rowsByDay.get(day) ?? null
    return {
      day,
      isGap: metrics == null,
      metrics,
    }
  })
  const presentRows = windowRows
    .map(point => point.metrics)
    .filter((row): row is DailyMetricsRow => row != null)
    .sort((a, b) => a.day.localeCompare(b.day))

  const rowWarnings = unique(presentRows.flatMap(row => row.warnings))
  const missingDays = windowRows.filter(point => point.isGap).map(point => point.day)
  const warnings = unique([
    ...rowWarnings,
    ...(missingDays.length > 0 ? [`Missing ${missingDays.length} of ${WINDOW_DAYS} days in the rolling window`] : []),
  ])

  return {
    startDay: days[0] ?? endDay,
    endDay,
    days: windowRows,
    missingDays,
    latestDay: latestRow(presentRows),
    cards: {
      throughput: buildThroughputSummary(presentRows),
      cycleTime: buildCycleTimeSummary(presentRows),
      ci: buildCiSummary(presentRows),
      staleWork: buildStaleWorkSummary(presentRows),
      sessionUsage: buildSessionSummary(presentRows),
    },
    coverage: buildCoverage(presentRows, missingDays, rowWarnings),
    warnings,
  }
}
