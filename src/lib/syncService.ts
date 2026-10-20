import { db } from "@/lib/db";
import { parseIcalFeed } from "@/lib/ical";
import { IcalSyncConfig, BlockedDate } from "@/lib/types";

export interface SyncResult {
  configId: string;
  label: string;
  added: number;
  removed: number;
  updated: number;
  error?: string;
}

// In-memory lock to prevent concurrent redundant fetches
const activeSyncPromises = new Map<string, Promise<any>>();

export async function runIcalSync(options?: {
  targetConfigId?: string;
  roomId?: string;
  clientProvidedConfigs?: IcalSyncConfig[];
  force?: boolean;
  staleThresholdMs?: number;
}): Promise<{
  success: boolean;
  message: string;
  results: SyncResult[];
  configs: IcalSyncConfig[];
}> {
  const {
    targetConfigId,
    roomId,
    clientProvidedConfigs,
    force = false,
    staleThresholdMs = 2 * 60 * 1000, // 2 minutes default
  } = options || {};

  const lockKey = targetConfigId || roomId || "all";
  if (activeSyncPromises.has(lockKey)) {
    return activeSyncPromises.get(lockKey);
  }

  const syncPromise = (async () => {
    try {
      let configs =
        clientProvidedConfigs && clientProvidedConfigs.length > 0
          ? clientProvidedConfigs
          : await db.getIcalSyncConfigs();

      configs = configs.filter((c) => c.is_active);

      if (targetConfigId) {
        configs = configs.filter((c) => c.id === targetConfigId);
      }
      if (roomId) {
        configs = configs.filter((c) => c.room_id === roomId);
      }

      // If not forced, filter to only stale feeds
      if (!force) {
        const now = Date.now();
        configs = configs.filter((c) => {
          if (!c.last_synced_at) return true;
          const age = now - new Date(c.last_synced_at).getTime();
          return age > staleThresholdMs;
        });
      }

      if (configs.length === 0) {
        return {
          success: true,
          message: "All calendar feeds are up-to-date.",
          results: [],
          configs: [],
        };
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

          const feedEvents = parseIcalFeed(icsText);
          const existingBlocks =
            await db.getBlockedDatesByIcalConfig(config.id);

          const feedEventMap = new Map(feedEvents.map((e) => [e.uid, e]));
          const existingBlockMap = new Map(
            existingBlocks
              .filter((b) => b.ical_uid)
              .map((b) => [b.ical_uid!, b]),
          );

          // Add or update events from feed
          for (const [uid, event] of feedEventMap) {
            const existingBlock = existingBlockMap.get(uid);

            if (!existingBlock) {
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
              if (
                existingBlock.start_date !== event.startDate ||
                existingBlock.end_date !== event.endDate
              ) {
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

          // Remove cancelled events
          for (const [uid, block] of existingBlockMap) {
            if (!feedEventMap.has(uid)) {
              await db.deleteBlockedDate(block.id);
              result.removed++;
            }
          }

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
            err instanceof Error
              ? err.message
              : typeof err === "object" && err !== null && "message" in err
                ? String((err as any).message)
                : String(err);
          result.error = errorMessage;

          updatedConfigs[i] = {
            ...config,
            last_error: errorMessage,
          };

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

      return {
        success: !hasErrors,
        message: hasErrors
          ? `Sync finished with issue: ${results.find((r) => r.error)?.error || "Error syncing calendar"}`
          : `Sync complete: ${totalAdded} added, ${totalRemoved} removed, ${totalUpdated} updated.`,
        results,
        configs: updatedConfigs,
      };
    } finally {
      activeSyncPromises.delete(lockKey);
    }
  })();

  activeSyncPromises.set(lockKey, syncPromise);
  return syncPromise;
}

/**
 * Just-in-Time Auto-Sync:
 * Automatically checks whether any active iCal feed for a given room
 * hasn't been synced in > staleMinutes (default: 10 min).
 * If stale, it fetches MakeMyTrip/Airbnb right then.
 */
export async function syncIfStale(roomId?: string, staleMinutes = 2): Promise<void> {
  try {
    const configs = await db.getIcalSyncConfigs(roomId);
    const activeConfigs = configs.filter((c) => c.is_active);
    if (activeConfigs.length === 0) return;

    const thresholdMs = staleMinutes * 60 * 1000;
    const now = Date.now();
    const isAnyStale = activeConfigs.some(
      (c) => !c.last_synced_at || now - new Date(c.last_synced_at).getTime() > thresholdMs,
    );

    if (isAnyStale) {
      await runIcalSync({ roomId, force: false, staleThresholdMs: thresholdMs });
    }
  } catch (err) {
    console.warn("Just-in-Time iCal auto-sync warning:", err);
  }
}
