export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { startMetricsPoller } = await import("../../server/lib/poller");
  startMetricsPoller();
}
