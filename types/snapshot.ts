import type {
  IssueMetric,
  PullRequestMetric,
  CheckRunMetric,
  RepositoryMetric,
  SessionMetric,
  LocalGitRepoMetric,
  ErrorMetric,
} from './metrics'
import type { DashboardAggregates } from './aggregates'
import type { DailyMetricsRow } from './daily-metrics'

export interface MetricSnapshot {
  id: string
  capturedAt: string
  issues: IssueMetric[]
  pullRequests: PullRequestMetric[]
  checkRuns: CheckRunMetric[]
  repositories: RepositoryMetric[]
  sessions: SessionMetric[]
  localGit: LocalGitRepoMetric[]
  errors: ErrorMetric[]
  aggregates: DashboardAggregates
  metadata: {
    source: 'github' | 'local' | 'manual' | 'orchestrated'
    refreshDurationMs: number
    partialData: boolean
    errors: string[]
  }
}

export interface SnapshotRow {
  id: string
  capturedAt: string
  data: string
  version: number
  createdAt: string
}

export interface DashboardWindowDay {
  day: string
  isGap: boolean
  metrics: DailyMetricsRow | null
}

export interface DashboardWindowThroughputSummary {
  issuesOpened: number
  issuesClosed: number
  prsCreated: number
  prsMerged: number
  totalCommits: number
}

export interface DashboardWindowCycleTimeSummary {
  averageDays: number | null
  medianDays: number | null
  p95Days: number | null
  sampleSize: number
  sourceDay: string | null
}

export interface DashboardWindowCISummary {
  totalRuns: number
  passCount: number
  failCount: number
  passRate: number | null
  averageDurationMs: number | null
  sourceDays: number
}

export interface DashboardWindowStaleWorkSummary {
  staleIssues: number
  stalePrs: number
  capturedAt: string | null
  reflectsCompleteData: boolean | null
}

export interface DashboardWindowSessionSummary {
  totalSessions: number
  sessionErrorCount: number
}

export interface DashboardWindowCoverage {
  totalDays: number
  daysWithData: number
  missingDays: number
  hasGaps: boolean
  hasSourceWarnings: boolean
  isComplete: boolean
}

export interface DashboardWindowCards {
  throughput: DashboardWindowThroughputSummary
  cycleTime: DashboardWindowCycleTimeSummary
  ci: DashboardWindowCISummary
  staleWork: DashboardWindowStaleWorkSummary
  sessionUsage: DashboardWindowSessionSummary
}

export interface DashboardWindow {
  startDay: string
  endDay: string
  days: DashboardWindowDay[]
  missingDays: string[]
  latestDay: DailyMetricsRow | null
  cards: DashboardWindowCards
  coverage: DashboardWindowCoverage
  warnings: string[]
}

export interface LatestState {
  snapshot: MetricSnapshot | null
  lastRefreshAt: string | null
  lastSuccessfulRefreshAt: string | null
  refreshInProgress: boolean
  isStale: boolean
  dashboardWindow: DashboardWindow | null
}
