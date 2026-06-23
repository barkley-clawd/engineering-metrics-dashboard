import type { DashboardStateResponse, SourceDiagnostics } from "@/types";

const API_BASE = "";

export async function fetchState(): Promise<DashboardStateResponse> {
  const res = await fetch(`${API_BASE}/api/state`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed fetch state: ${res.statusText}`);
  return (await res.json()) as DashboardStateResponse;
}

export interface TriggerRefreshResult {
  started: boolean;
  skipped?: boolean;
  skippedReason?: string;
  startedAt?: string;
}

export async function triggerRefresh(): Promise<TriggerRefreshResult> {
  const res = await fetch(`${API_BASE}/api/refresh`, { method: "POST" });

  if (res.status === 409) {
    const body = (await res.json().catch(() => null)) as TriggerRefreshResult | null;
    return {
      started: false,
      skipped: true,
      skippedReason: body?.skippedReason ?? "refresh-in-progress",
    };
  }

  if (!res.ok) throw new Error(`Failed trigger refresh: ${res.statusText}`);
  return (await res.json()) as TriggerRefreshResult;
}

export interface ResetRefreshLockResult {
  wasLocked: boolean;
  previousStatus: string;
  resetAt: string;
}

export async function resetRefreshLock(): Promise<ResetRefreshLockResult> {
  const res = await fetch(`${API_BASE}/api/refresh/reset-lock`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed reset refresh lock: ${res.statusText}`);
  return (await res.json()) as ResetRefreshLockResult;
}

export async function fetchDiagnostics(): Promise<SourceDiagnostics> {
  const res = await fetch(`${API_BASE}/api/diagnostics`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed fetch diagnostics: ${res.statusText}`);
  return (await res.json()) as SourceDiagnostics;
}
