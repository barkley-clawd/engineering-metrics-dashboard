import { NextRequest, NextResponse } from "next/server";
import { initDb, getLatestState, getDailyMetricsRange, getDailyMetricsRangeForRepo } from "../../../../../server/db/client";
import { buildDashboardWindow } from "../../../../../server/lib/dashboard-state";
import { getDashboardWindowDays } from "../../../../../server/lib/runtime-config";
import { ALL_REPOS_REPO_KEY } from "../../../../../types/daily-metrics";

let dbInitialized = false;

async function ensureDb(): Promise<void> {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDb();

    const repoKey =
      request.nextUrl.searchParams.get("repoKey") ?? ALL_REPOS_REPO_KEY;

    const state = getLatestState();

    const windowDays = getDashboardWindowDays();
    const endDay = new Date().toISOString().slice(0, 10);
    const startDate = new Date(`${endDay}T00:00:00Z`);
    startDate.setUTCDate(startDate.getUTCDate() - (windowDays - 1));
    const startDay = startDate.toISOString().slice(0, 10);

    const rows =
      repoKey === ALL_REPOS_REPO_KEY
        ? getDailyMetricsRange(startDay, endDay)
        : getDailyMetricsRangeForRepo(startDay, endDay, repoKey);
    const sessionUsageAggregate = state.snapshot?.aggregates?.sessionUsage ?? null;

    const dashboardWindow = buildDashboardWindow(
      rows,
      new Date(),
      state.isStale,
      sessionUsageAggregate,
    );

    const body = {
      ...state,
      selectedRepoKey: repoKey,
      dashboardWindow,
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[api/state] failed to build state response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
