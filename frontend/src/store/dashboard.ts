import { create } from "zustand";

export interface DashboardState {
  data: unknown | null;
  isLoading: boolean;
  error: string | null;
  selectedRepoKey: string;
  fetch: (repoKey?: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  selectedRepoKey: "barkley-clawd/signal-house",
  fetch: async (repoKey) => {
    set({ isLoading: true, error: null });
    try {
      const params = repoKey ? `?repoKey=${repoKey}` : "";
      const res = await fetch(`/api/state${params}`, { cache: "no-store" });
      const data = await res.json();
      set({
        data,
        isLoading: false,
        selectedRepoKey: repoKey ?? "barkley-clawd/signal-house",
      });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },
}));
