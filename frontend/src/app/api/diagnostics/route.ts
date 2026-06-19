import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
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
  });
}
