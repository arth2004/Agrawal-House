import { NextResponse } from "next/server";
import { runIcalSync } from "@/lib/syncService";

/**
 * POST /api/calendar/sync
 * Syncs active iCal feeds (force refresh).
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const targetConfigId = url.searchParams.get("configId") || undefined;
    const roomId = url.searchParams.get("roomId") || undefined;

    let clientProvidedConfigs: any[] | undefined;
    try {
      const body = await request.json();
      if (body?.configs && Array.isArray(body.configs) && body.configs.length > 0) {
        clientProvidedConfigs = body.configs;
      }
    } catch {
      // Body may be empty or not JSON
    }

    const syncResponse = await runIcalSync({
      targetConfigId,
      roomId,
      clientProvidedConfigs,
      force: true,
    });

    return NextResponse.json(syncResponse);
  } catch (error) {
    console.error("Calendar sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Calendar sync failed. Please try again.",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/calendar/sync
 * Allows automated cron services and background fetchers to trigger sync via GET.
 */
export async function GET(request: Request) {
  return POST(request);
}
