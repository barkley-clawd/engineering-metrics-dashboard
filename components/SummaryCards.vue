<template>
  <div class="summary-grid">
    <div class="summary-section summary-section--primary">
      <div class="summary-section__header">
        <p class="summary-section__eyebrow">Headline signals</p>
        <p class="summary-section__hint">The first row should answer “how is the repo moving?”</p>
      </div>

      <UiCard title="Throughput">
        <template v-if="throughput && throughput.status !== 'empty' && !isBlockedState(throughput.status)">
          <div class="metric-grid metric-grid--primary">
            <MetricCard
              label="Issues closed"
              :value="throughput.issuesClosed"
              :trend="throughputTrend(throughput.issuesClosed)"
            />
            <MetricCard
              label="PRs merged"
              :value="throughput.prsMerged"
              :trend="throughputTrend(throughput.prsMerged)"
            />
          </div>
          <p class="summary-card__support">{{ throughput.totalCommits }} commits in the window</p>
          <p v-if="throughput.message" class="panel-note">{{ throughput.message }}</p>
        </template>
        <EmptyState
          v-else
          :message="throughput?.message ?? 'Throughput unavailable'"
          :hint="throughput?.status === 'empty' ? `${scopeLabel} has no throughput data yet` : 'Check GitHub and local git configuration'"
        />
      </UiCard>

      <UiCard title="Cycle Time">
        <template v-if="cycleTime && cycleTime.status !== 'empty' && !isBlockedState(cycleTime.status)">
          <div class="metric-grid metric-grid--primary">
            <MetricCard
              label="Average"
              :value="cycleTime.averageDays"
              format="days"
              :trend="cycleTime ? 'down' : 'neutral'"
            />
            <MetricCard
              label="Median"
              :value="cycleTime.medianDays"
              format="days"
              :trend="cycleTime ? 'down' : 'neutral'"
            />
          </div>
          <div class="metric-grid metric-grid--support">
            <MetricCard
              label="P95"
              :value="cycleTime.p95Days"
              format="days"
              :trend="cycleTime ? 'down' : 'neutral'"
            />
            <MetricCard
              label="Sample"
              :value="cycleTime.sampleSize"
              sublabel="items"
            />
          </div>
          <p v-if="cycleTime.message" class="panel-note">{{ cycleTime.message }}</p>
        </template>
        <EmptyState
          v-else
          :message="cycleTime?.message ?? 'Cycle time unavailable'"
          :hint="cycleTime?.status === 'empty' ? `${scopeLabel} has no cycle time data yet` : 'GitHub pull requests are required for cycle time'"
        />
      </UiCard>
    </div>

    <div class="summary-section summary-section--secondary">
      <div class="summary-section__header">
        <p class="summary-section__eyebrow">Supporting signals</p>
        <p class="summary-section__hint">These stay visible, but no longer compete with the headline cards.</p>
      </div>

      <UiCard title="CI Health">
        <template v-if="ci && ci.status !== 'empty' && !isBlockedState(ci.status)">
          <div class="metric-grid metric-grid--support">
            <MetricCard
              label="Pass rate"
              :value="ci.passRate"
              format="percent"
              :trend="ciPassRateTrend"
            />
            <MetricCard
              label="Total runs"
              :value="ci.totalRuns"
            />
            <MetricCard
              label="Failures"
              :value="ci.failCount"
              :trend="ciFailTrend"
            />
          </div>
          <p v-if="ci.message" class="panel-note">{{ ci.message }}</p>
        </template>
        <EmptyState
          v-else
          :message="ci?.message ?? 'CI unavailable'"
          :hint="ci?.status === 'empty' ? `${scopeLabel} has no CI data yet` : 'GitHub Actions or workflow run data is required'"
        />
      </UiCard>

      <UiCard title="Stale Work">
        <template v-if="staleWork && !isBlockedState(staleWork.status)">
          <div class="metric-grid metric-grid--support">
            <MetricCard
              label="Stale issues"
              :value="staleWork.staleIssues"
              :trend="staleIssuesTrend"
            />
            <MetricCard
              label="Stale PRs"
              :value="staleWork.stalePrs"
              :trend="stalePRsTrend"
            />
          </div>
          <p v-if="staleWork.message" class="panel-note">{{ staleWork.message }}</p>
        </template>
        <EmptyState
          v-else
          :message="staleWork?.message ?? 'Stale work unavailable'"
          :hint="staleWork?.status === 'empty' ? `${scopeLabel} has no stale work` : 'GitHub issues and pull requests are required'"
        />
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DashboardWindowThroughputSummary, DashboardWindowCycleTimeSummary, DashboardWindowCISummary, DashboardWindowStaleWorkSummary, DashboardPanelStatus } from '../types/snapshot'

const props = defineProps<{
  throughput: DashboardWindowThroughputSummary | null
  cycleTime: DashboardWindowCycleTimeSummary | null
  ci: DashboardWindowCISummary | null
  staleWork: DashboardWindowStaleWorkSummary | null
  isStale?: boolean
  scopeLabel?: string
}>()

const scopeLabel = computed(() => props.scopeLabel ?? 'all repos')

function isBlockedState(status: DashboardPanelStatus): boolean {
  return status === 'unconfigured' || status === 'unavailable' || status === 'error'
}

function throughputTrend(val: number | undefined): 'up' | 'down' | 'neutral' {
  if (val == null || val === 0) return 'neutral'
  return 'up'
}

const ciPassRateTrend = 'up'
const ciFailTrend = 'down'
const staleIssuesTrend = 'down'
const stalePRsTrend = 'down'
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.summary-section {
  display: grid;
  gap: 0.75rem;
}

.summary-section--primary,
.summary-section--secondary {
  grid-column: 1 / -1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-section__header {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  align-items: baseline;
}

.summary-section__eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.summary-section__hint,
.summary-card__support {
  font-size: 0.8rem;
  color: #94a3b8;
}

.metric-grid {
  display: grid;
  gap: 0.75rem;
}

.metric-grid--primary,
.metric-grid--support {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-card__support {
  margin-top: 0.5rem;
}

.panel-note {
  grid-column: 1 / -1;
  margin-top: 0.25rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-section--primary,
  .summary-section--secondary,
  .metric-grid--primary,
  .metric-grid--support {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .summary-section__header {
    align-items: flex-start;
  }
}
</style>
