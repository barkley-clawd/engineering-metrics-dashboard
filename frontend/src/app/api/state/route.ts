import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const repoKey =
    request.nextUrl.searchParams.get("repoKey") ?? "barkley-clawd/signal-house";

  return NextResponse.json({
    snapshot: null,
    viewSnapshot: null,
    selectedRepoKey: repoKey,
    lastRefreshAt: null,
    lastSuccessfulRefreshAt: null,
    refreshInProgress: false,
    isStale: false,
    staleReason: null,
    pollerEnabled: false,
    refreshStatus: "idle" as const,
    lastFailureAt: null,
    lastSuccessAt: null,
    nextRunAt: null,
    dashboardWindow: null,
    refreshState: {
      status: "idle" as const,
      lastRunStartedAt: null,
      lastRunFinishedAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      nextRunAt: null,
      lastError: null,
      durationMs: null,
      sourceHealth: {},
      runHistory: [],
    },
    diagnostics: {
      configuredProjectRoots: [],
      discoveredRepos: [],
      skippedPaths: [],
      parsedGitHubRemotes: [],
      collectionTargets: [],
      cacheAgeSeconds: null,
      pollerEnabled: false,
      pollerIntervalSeconds: null,
      lastSuccessfulRefreshAt: null,
      lastError: null,
      sourceHealth: {},
    },
  });
}
