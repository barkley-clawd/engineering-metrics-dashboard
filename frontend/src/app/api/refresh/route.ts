import { NextResponse } from "next/server";
import { initDb } from "../../../../../server/db/client";
import { runRefresh } from "../../../../../server/lib/refresh/run-refresh";

export const maxDuration = 300;

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
    const result = await runRefresh();
    if (result.skipped) {
      return NextResponse.json(
        {
          started: false,
          skipped: true,
          skippedReason: result.errorSummary ?? "Refresh already in progress",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({
      started: true,
      ...result,
    });
  } catch (error) {
    console.error("[api/refresh] failed to run refresh:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Refresh failed", message },
      { status: 500 },
    );
  }
}
