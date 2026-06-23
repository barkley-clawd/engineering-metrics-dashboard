import { NextResponse } from "next/server";
import { resetRefreshLock } from "../../../../../../server/db/client";
import { ensureDb } from "../../_lib/ensure-db";

export async function POST() {
  try {
    await ensureDb();
    const result = resetRefreshLock();

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[api/refresh/reset-lock] failed to reset refresh lock:", error);
    return NextResponse.json(
      { error: "Failed to reset refresh lock" },
      { status: 500 },
    );
  }
}
