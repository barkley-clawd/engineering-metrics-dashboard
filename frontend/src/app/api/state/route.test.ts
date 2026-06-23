import { GET } from "./route";
import { getDailyMetricsRange, getLatestState, initDb } from "../../../../../server/db/client";
import { buildDashboardWindow } from "../../../../../server/lib/dashboard-state";
import type { LatestState } from "@/types";

jest.mock("../../../../../server/db/client", () => ({
  initDb: jest.fn().mockResolvedValue({}),
  getLatestState: jest.fn(),
  getDailyMetricsRange: jest.fn(),
}));

jest.mock("../../../../../server/lib/dashboard-state", () => ({
  buildDashboardWindow: jest.fn(),
}));

jest.mock("../../../../../server/lib/runtime-config", () => ({
  getDashboardWindowDays: jest.fn(() => 28),
}));

function makeLatestState(): LatestState {
  return {
    snapshot: null,
    lastRefreshAt: null,
    lastSuccessfulRefreshAt: null,
    refreshInProgress: false,
    isStale: true,
    staleReason: "no successful refresh has completed yet",
    pollerEnabled: false,
    refreshStatus: "idle",
    lastFailureAt: null,
    lastSuccessAt: null,
    nextRunAt: null,
    dashboardWindow: null,
    refreshState: {
      status: "idle",
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
  };
}

describe("GET /api/state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getLatestState as jest.Mock).mockReturnValue(makeLatestState());
    (getDailyMetricsRange as jest.Mock).mockReturnValue([{ day: "2026-06-23" }]);
    (buildDashboardWindow as jest.Mock).mockReturnValue({ cards: { marker: true } });
  });

  it("always builds the aggregate dashboard window", async () => {
    const response = await GET();
    const body = await response.json();

    expect(initDb).toHaveBeenCalledTimes(1);
    expect(getDailyMetricsRange).toHaveBeenCalledTimes(1);
    expect(buildDashboardWindow).toHaveBeenCalledWith(
      [{ day: "2026-06-23" }],
      expect.any(Date),
      true,
      null,
    );
    expect(body.dashboardWindow).toEqual({ cards: { marker: true } });
    expect(body).not.toHaveProperty("selectedRepoKey");
  });

  it("ignores legacy repoKey query arguments", async () => {
    const legacyRequest = new Request("http://localhost/api/state?repoKey=github:demo/repo");
    const response = await (GET as unknown as (request: Request) => Promise<Response>)(legacyRequest);
    const body = await response.json();

    expect(getDailyMetricsRange).toHaveBeenCalledTimes(1);
    expect(body.dashboardWindow).toEqual({ cards: { marker: true } });
    expect(body).not.toHaveProperty("selectedRepoKey");
  });
});
