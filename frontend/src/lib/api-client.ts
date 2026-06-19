const API_BASE = "";

export async function fetchState(repoKey?: string) {
  const params = repoKey ? `?repoKey=${repoKey}` : "";
  const res = await fetch(`${API_BASE}/api/state${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch state: ${res.statusText}`);
  return res.json();
}

export async function triggerRefresh() {
  const res = await fetch(`${API_BASE}/api/refresh`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to trigger refresh: ${res.statusText}`);
  return res.json();
}

export async function fetchDiagnostics() {
  const res = await fetch(`${API_BASE}/api/diagnostics`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch diagnostics: ${res.statusText}`);
  return res.json();
}
