import { fetchState } from "./api-client";

describe("fetchState", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("requests the aggregate state without a repoKey query", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ dashboardWindow: null }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await fetchState();

    expect(fetchMock).toHaveBeenCalledWith("/api/state", {
      cache: "no-store",
    });
  });
});
