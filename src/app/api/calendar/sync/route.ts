import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseIcalFeed } from "@/lib/ical";
import { BlockedDate } from "@/lib/types";

interface SyncResult {
  configId: string;
  label: string;
  added: number;
  removed: number;
  updated: number;
  error?: string;
}

/**
 * POST /api/calendar/sync
 *
 * Syncs all active iCal feeds. For each feed:
 * 1. Fetches the .ics URL
 * 2. Parses the events
 * 3. Compares with existing synced blocked_dates
 * 4. Creates new blocks for new events, deletes blocks for removed events
 *
 * Query params:
 *   ?configId=xxx  — sync only a specific config (optional)
 */
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const targetConfigId = url.searchParams.get("configId");

    // Read optional client-provided configs in case DB table is not yet migrated
    let clientProvidedConfigs: any[] | undefined;
    try {
      const body = await request.json();
      if (body?.configs && Array.isArray(body.configs) && body.configs.length > 0) {
        clientProvidedConfigs = body.configs;
      }
    } catch {
      // Body may be empty or not JSON
    }

    // Get all active configs (prefer client configs if available, otherwise query DB)
    let configs =
      clientProvidedConfigs && clientProvidedConfigs.length > 0
        ? clientProvidedConfigs
        : await db.getIcalSyncConfigs();

    configs = configs.filter((c) => c.is_active);

    if (targetConfigId) {
      configs = configs.filter((c) => c.id === targetConfigId);
    }

    if (configs.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No active iCal sync configurations found. Please connect a calendar first.",
        results: [],
        configs: [],
      });
    }

    const results: SyncResult[] = [];
    const updatedConfigs = [...configs];

    for (let i = 0; i < updatedConfigs.length; i++) {
      const config = updatedConfigs[i];
      const result: SyncResult = {
        configId: config.id,
        label: config.label,
        added: 0,
        removed: 0,
        updated: 0,
      };

      try {
        // Fetch the iCal feed
        const response = await fetch(config.ical_url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AgrawalHouse-CalendarSync/1.0",
            Accept: "text/calendar, application/json, text/plain, */*",
          },
          signal: AbortSignal.timeout(15000), // 15 second timeout
        });

        const rawText = await response.text();

        if (!response.ok) {
          let errDetail = `HTTP ${response.status} ${response.statusText}`;
          try {
            const parsed = JSON.parse(rawText);
            const msg =
              parsed?.error?.displayMessage ||
              parsed?.error?.errorMessage ||
              parsed?.message;
            if (msg) {
              const code = parsed?.error?.errorCode || response.status;
              errDetail = `${msg} (Code: ${code})`;
            }
          } catch {
            if (rawText && rawText.length < 200) {
              errDetail = `${errDetail}: ${rawText.trim()}`;
            }
          }
          throw new Error(`External calendar rejected request: ${errDetail}`);
        }

        const icsText = rawText;

        // Validate it's actually an iCal file
        if (
          !icsText.includes("BEGIN:VCALENDAR") ||
          !icsText.includes("END:VCALENDAR")
        ) {
          let errDetail = "Response does not contain valid iCal (.ics) data.";
          try {
            const parsed = JSON.parse(icsText);
            const msg =
              parsed?.error?.displayMessage ||
              parsed?.error?.errorMessage ||
              parsed?.message;
            if (msg) {
              errDetail = `${msg}${parsed?.error?.errorCode ? ` (Code: ${parsed.error.errorCode})` : ""}`;
            }
          } catch {}
          throw new Error(`Invalid calendar feed: ${errDetail}`);
        }

        // Parse the events
        const feedEvents = parseIcalFeed(icsText);

        // Get existing synced blocked dates for this config
        const existingBlocks =
          await db.getBlockedDatesByIcalConfig(config.id);

        // Build maps for comparison
        const feedEventMap = new Map(
          feedEvents.map((e) => [e.uid, e]),
        );
        const existingBlockMap = new Map(
          existingBlocks
            .filter((b) => b.ical_uid)
            .map((b) => [b.ical_uid!, b]),
        );

        // Find new events (in feed but not in our DB)
        for (const [uid, event] of feedEventMap) {
          const existingBlock = existingBlockMap.get(uid);

          if (!existingBlock) {
            // New event — create a blocked date
            await db.addBlockedDate({
              room_id: config.room_id,
              start_date: event.startDate,
              end_date: event.endDate,
              reason: `${config.platform.toUpperCase()} booking: ${event.summary}`,
              source: "ical",
              ical_uid: uid,
              ical_config_id: config.id,
            });
            result.added++;
          } else {
            // Event exists — check if dates changed
            if (
              existingBlock.start_date !== event.startDate ||
              existingBlock.end_date !== event.endDate
            ) {
              // Dates changed — delete old block and create new one
              await db.deleteBlockedDate(existingBlock.id);
              await db.addBlockedDate({
                room_id: config.room_id,
                start_date: event.startDate,
                end_date: event.endDate,
                reason: `${config.platform.toUpperCase()} booking: ${event.summary}`,
                source: "ical",
                ical_uid: uid,
                ical_config_id: config.id,
              });
              result.updated++;
            }
          }
        }

        // Find removed events (in our DB but not in feed anymore = cancelled)
        for (const [uid, block] of existingBlockMap) {
          if (!feedEventMap.has(uid)) {
            // Event removed from feed — delete the blocked date (unblock!)
            await db.deleteBlockedDate(block.id);
            result.removed++;
          }
        }

        // Update last_synced_at on the config
        const nowIso = new Date().toISOString();
        updatedConfigs[i] = {
          ...config,
          last_synced_at: nowIso,
          last_error: undefined,
        };

        await db.updateIcalSyncConfig(config.id, {
          last_synced_at: nowIso,
          last_error: undefined,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown sync error";
        result.error = errorMessage;

        updatedConfigs[i] = {
          ...config,
          last_error: errorMessage,
        };

        // Store the error on the config
        await db.updateIcalSyncConfig(config.id, {
          last_error: errorMessage,
        });

        console.error(
          `iCal sync error for config ${config.id} (${config.label}):`,
          errorMessage,
        );
      }

      results.push(result);
    }

    const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
    const totalRemoved = results.reduce((sum, r) => sum + r.removed, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
    const hasErrors = results.some((r) => r.error);

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors
        ? `Sync finished with issue: ${results.find((r) => r.error)?.error || "Error syncing calendar"}`
        : `Sync complete: ${totalAdded} added, ${totalRemoved} removed, ${totalUpdated} updated.`,
      results,
      configs: updatedConfigs,
    });
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
 * Allows automated cron services (Vercel Cron, cron-job.org, Upstash) to trigger sync.
 */
export async function GET(request: Request) {
  return POST(request);
}

