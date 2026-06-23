import { NextResponse } from "next/server";
import { initDb } from "../../../../../server/db/client";
import { startRefreshInBackground } from "../../../../../server/lib/refresh/run-refresh";

export const maxDuration = 10;

let dbInitialized = false;

async function ensureDb(): Promise<void> {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export async function POST() {
  try {
    await ensureDb();
    const result = await startRefreshInBackground();

    if (result.skipped) {
      return NextResponse.json(
        {
          started: false,
          skipped: true,
          skippedReason: result.skippedReason ?? "Refresh already in progress",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error("[api/refresh] failed to start refresh:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Refresh failed", message },
      { status: 500 },
    );
  }
}
