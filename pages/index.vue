<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">Overview</h2>
      <p class="page-subtitle">Placeholder sections for the first dashboard shell.</p>
    </div>

    <div class="sections">
      <div class="section section-large">
        <h3 class="section-title">Summary</h3>
        <p class="section-body">High-level status, throughput, cycle time, and blocked work will live here.</p>
      </div>

      <div class="section">
        <h3 class="section-title">Trends</h3>
        <p class="section-body">Placeholder for charts showing whether the system is speeding up or slowing down.</p>
      </div>

      <div class="section">
        <h3 class="section-title">Work Queues</h3>
        <p class="section-body">Open issues, PRs waiting on review, and stalled work will surface here.</p>
      </div>

      <div class="section">
        <h3 class="section-title">CI Health</h3>
        <p class="section-body">Build and test outcomes will be wired in later, not faked now.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f1f5f9;
}

.page-subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #64748b;
}

.sections {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}

.section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 1.25rem;
  min-height: 160px;
  grid-column: span 6;
}

.section-large {
  grid-column: span 12;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.section-body {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .section,
  .section-large {
    grid-column: span 12;
  }
}
</style>
