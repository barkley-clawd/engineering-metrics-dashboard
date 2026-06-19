import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "skipped",
    message: "Refresh not yet implemented",
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    durationMs: 0,
    success: true,
    partialData: false,
    sources: [],
    warnings: [],
    errorSummary: null,
    skipped: true,
    skippedReason: "Not implemented",
  });
}
