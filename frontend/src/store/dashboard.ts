import { create } from "zustand";
import { fetchDiagnostics, fetchState, triggerRefresh } from "@/lib/api-client";
import type { DashboardStateResponse, SourceDiagnostics } from "@/types";

export type RefreshStatus = "idle" | "running" | "success" | "failed";

export interface DashboardState {
  data: DashboardStateResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasEverLoaded: boolean;
  lastRefreshAt: string | null;
  lastSuccessfulRefreshAt: string | null;
  refreshStatus: RefreshStatus;
  manualRefreshStatus: RefreshStatus;
  manualRefreshErrorTimestamp: number | null;
  lastPollTimestamp: string | null;
  fetch: () => Promise<void>;
  diagnostics: SourceDiagnostics | null;
  diagnosticsLoading: boolean;
  diagnosticsError: string | null;
  diagnosticsHasLoaded: boolean;
  manualRefresh: () => Promise<void>;
  triggerAutoRefresh: () => Promise<void>;
  clearManualRefreshError: () => void;
  loadDiagnostics: () => Promise<void>;
}

type FetchKind = "manual" | "polled";

const MANUAL_REFRESH_POLL_INTERVAL_MS = 2_000;
const MANUAL_REFRESH_TIMEOUT_MS = 5 * 60_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startFetchFlags(isFirstLoad: boolean) {
  return isFirstLoad
    ? { isLoading: true, refreshStatus: "running" as const }
    : { isRefreshing: true, refreshStatus: "running" as const };
}

function refreshIsRunning(data: DashboardStateResponse): boolean {
  return data.status.refreshInProgress || data.status.refreshState.status === "running";
}

function refreshFinishedAfter(data: DashboardStateResponse, previousFinishedAt: string | null): boolean {
  const finishedAt = data.status.refreshState.lastRunFinishedAt;
  return Boolean(finishedAt && finishedAt !== previousFinishedAt);
}

function applyFetchedState(
  state: DashboardState,
  data: DashboardStateResponse,
  kind: FetchKind,
) {
  return {
    data,
    isLoading: false,
    isRefreshing: false,
    hasEverLoaded: true,
    lastRefreshAt: new Date().toISOString(),
    lastSuccessfulRefreshAt: data.status.lastSuccessfulRefreshAt,
    refreshStatus: "success" as const,
    manualRefreshStatus:
      kind === "manual" ? ("success" as const) : state.manualRefreshStatus,
    error: null,
    diagnostics: state.diagnosticsHasLoaded ? state.diagnostics : data.diagnostics,
    diagnosticsHasLoaded: state.diagnosticsHasLoaded || Boolean(data.diagnostics),
  };
}

function applyPolledStateDuringManualRefresh(state: DashboardState, data: DashboardStateResponse) {
  return {
    ...applyFetchedState(state, data, "polled"),
    isRefreshing: true,
    refreshStatus: "running" as const,
    manualRefreshStatus: "running" as const,
  };
}

function applyFinalManualRefreshState(state: DashboardState, data: DashboardStateResponse) {
  const refreshFailed =
    data.status.refreshState.status === "failed" || data.status.refreshState.status === "skipped";

  if (!refreshFailed) {
    return applyFetchedState(state, data, "manual");
  }

  return {
    ...applyFetchedState(state, data, "polled"),
    refreshStatus: "failed" as const,
    manualRefreshStatus: "failed" as const,
    manualRefreshErrorTimestamp: Date.now(),
    error: data.status.refreshState.lastError ?? "Refresh failed",
  };
}

function applyFetchError(
  state: DashboardState,
  error: unknown,
  kind: FetchKind,
) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isLoading: false,
    isRefreshing: false,
    refreshStatus: "failed" as const,
    manualRefreshStatus:
      kind === "manual" ? ("failed" as const) : state.manualRefreshStatus,
    manualRefreshErrorTimestamp:
      kind === "manual" ? Date.now() : state.manualRefreshErrorTimestamp,
    error: message,
  };
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasEverLoaded: false,
  lastRefreshAt: null,
  lastSuccessfulRefreshAt: null,
  refreshStatus: "idle",
  manualRefreshStatus: "idle",
  manualRefreshErrorTimestamp: null,
  lastPollTimestamp: null,
  diagnostics: null,
  diagnosticsLoading: false,
  diagnosticsError: null,
  diagnosticsHasLoaded: false,

  fetch: async () => {
    const state = get();
    set({ ...startFetchFlags(!state.hasEverLoaded), error: null });
    try {
      const data = await fetchState();
      set((s) => applyFetchedState(s, data, "polled"));
    } catch (err) {
      set((s) => applyFetchError(s, err, "polled"));
    }
  },

  manualRefresh: async () => {
    const state = get();
      const previousFinishedAt = state.data?.status.refreshState.lastRunFinishedAt ?? null;
    const startedAt = Date.now();

    set({
      ...startFetchFlags(!state.hasEverLoaded),
      error: null,
      manualRefreshStatus: "running",
    });

    try {
      await triggerRefresh();

      while (Date.now() - startedAt < MANUAL_REFRESH_TIMEOUT_MS) {
        const data = await fetchState();

        if (!refreshIsRunning(data) && refreshFinishedAfter(data, previousFinishedAt)) {
          set((s) => applyFinalManualRefreshState(s, data));
          return;
        }

        set((s) => applyPolledStateDuringManualRefresh(s, data));
        await sleep(MANUAL_REFRESH_POLL_INTERVAL_MS);
      }

      throw new Error("Refresh did not complete before the timeout");
    } catch (err) {
      set((s) => applyFetchError(s, err, "manual"));
    }
  },

  triggerAutoRefresh: async () => {
    const state = get();
    try {
      set({ refreshStatus: "running" });
      const data = await fetchState();
        const apiLastRefreshAt = data.status.lastSuccessfulRefreshAt;

      if (apiLastRefreshAt && apiLastRefreshAt !== state.lastPollTimestamp) {
        set((s) => ({
          ...applyFetchedState(s, data, "polled"),
          lastPollTimestamp: apiLastRefreshAt,
        }));
      } else {
        set({ lastPollTimestamp: apiLastRefreshAt, refreshStatus: "idle" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({ refreshStatus: "failed", error: message });
    }
  },

  clearManualRefreshError: () => {
    set({ manualRefreshErrorTimestamp: null });
  },

  loadDiagnostics: async () => {
    set({ diagnosticsLoading: true, diagnosticsError: null });
    try {
      const data = await fetchDiagnostics();
      set({
        diagnostics: data,
        diagnosticsLoading: false,
        diagnosticsHasLoaded: true,
        diagnosticsError: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set({
        diagnosticsLoading: false,
        diagnosticsHasLoaded: true,
        diagnosticsError: message,
      });
    }
  },
}));
