<template>
  <div class="summary-grid">
    <UiCard title="Throughput">
      <MetricCard
        label="Issues closed"
        :value="throughput?.issuesClosed"
        :trend="throughputTrend(throughput?.issuesClosed)"
      />
      <MetricCard
        label="PRs merged"
        :value="throughput?.prsMerged"
        :trend="throughputTrend(throughput?.prsMerged)"
      />
      <MetricCard
        label="Commits"
        :value="throughput?.totalCommits"
      />
    </UiCard>

    <UiCard title="Cycle Time">
      <MetricCard
        label="Average"
        :value="cycleTime?.averageDays"
        format="days"
        :trend="cycleTime ? 'down' : 'neutral'"
      />
      <MetricCard
        label="Median"
        :value="cycleTime?.medianDays"
        format="days"
        :trend="cycleTime ? 'down' : 'neutral'"
      />
      <MetricCard
        label="P95"
        :value="cycleTime?.p95Days"
        format="days"
        :trend="cycleTime ? 'down' : 'neutral'"
      />
      <MetricCard
        label="Sample"
        :value="cycleTime?.sampleSize"
        sublabel="items"
      />
    </UiCard>

    <UiCard title="CI Health">
      <MetricCard
        label="Pass rate"
        :value="ci?.passRate"
        format="percent"
        :trend="ciPassRateTrend"
      />
      <MetricCard
        label="Total runs"
        :value="ci?.totalRuns"
      />
      <MetricCard
        label="Failures"
        :value="ci?.failCount"
        :trend="ciFailTrend"
      />
    </UiCard>

    <UiCard title="Stale Work">
      <MetricCard
        label="Stale issues"
        :value="staleWork?.staleIssues"
        :trend="staleIssuesTrend"
      />
      <MetricCard
        label="Stale PRs"
        :value="staleWork?.stalePRs"
        :trend="stalePRsTrend"
      />
      <p v-if="staleWork?.oldestItemDays != null" class="summary-oldest">
        Oldest: {{ staleWork.oldestItemDays.toFixed(0) }} days
      </p>
    </UiCard>

    <UiCard title="Session Usage">
      <MetricCard
        label="Total sessions"
        :value="sessionUsage?.totalSessions"
        :trend="sessionTrend"
      />
      <MetricCard
        label="Error count"
        :value="sessionUsage?.errorCount"
        :trend="sessionErrorTrend(sessionUsage?.errorCount)"
      />
      <p v-if="sessionUsage && sessionUsage.uniqueTools.length > 0" class="summary-oldest">
        Tools: {{ sessionUsage.uniqueTools.join(', ') }}
      </p>
      <div v-if="sessionUsage && sessionUsage.topActions.length > 0" class="summary-top-actions">
        <p class="summary-section-label">Top actions:</p>
        <span
          v-for="a in sessionUsage.topActions.slice(0, 4)"
          :key="a.action"
          class="summary-action-tag"
        >
          {{ a.action }} ({{ a.count }})
        </span>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import type { ThroughputAggregate, CycleTimeAggregate, CIAggregate, StaleWorkAggregate, SessionUsageAggregate } from '../types/aggregates'

const props = defineProps<{
  throughput: ThroughputAggregate | null
  cycleTime: CycleTimeAggregate | null
  ci: CIAggregate | null
  staleWork: StaleWorkAggregate | null
  sessionUsage: SessionUsageAggregate | null
}>()

function throughputTrend(val: number | undefined): 'up' | 'down' | 'neutral' {
  if (val == null || val === 0) return 'neutral'
  return 'up'
}

const ciPassRateTrend = 'up'
const ciFailTrend = 'down'
const staleIssuesTrend = 'down'
const stalePRsTrend = 'down'
const sessionTrend = 'up'

function sessionErrorTrend(val: number | undefined): 'up' | 'down' | 'neutral' {
  if (val == null || val === 0) return 'down'
  return 'up'
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.summary-oldest {
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.summary-section-label {
  margin-top: 0.3rem;
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-top-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

.summary-action-tag {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  color: #e2e8f0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.25rem;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
