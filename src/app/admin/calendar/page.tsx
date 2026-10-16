"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db";
import { BlockedDate, Booking, Room, IcalSyncConfig } from "@/lib/types";
import { dateRangesOverlap, hasActiveBooking } from "@/lib/availability";
import {
  CalendarRange,
  Plus,
  Unlock,
  BedDouble,
  AlertCircle,
  User,
  RefreshCw,
  Link2,
  Trash2,
  Copy,
  Check,
  Globe,
  ExternalLink,
} from "lucide-react";

type LockedDateEntry =
  | {
      kind: "manual";
      id: string;
      room_id: string;
      start_date: string;
      end_date: string;
      reason?: string;
    }
  | {
      kind: "booking";
      id: string;
      room_id: string;
      start_date: string;
      end_date: string;
      guest_name: string;
      status: "pending" | "confirmed";
    }
  | {
      kind: "ical";
      id: string;
      room_id: string;
      start_date: string;
      end_date: string;
      reason?: string;
      ical_config_id?: string;
    };

const PLATFORM_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  makemytrip: { label: "MakeMyTrip", color: "#E64A19", bg: "rgba(230, 74, 25, 0.1)" },
  airbnb: { label: "Airbnb", color: "#FF5A5F", bg: "rgba(255, 90, 95, 0.1)" },
  "booking.com": { label: "Booking.com", color: "#003580", bg: "rgba(0, 53, 128, 0.1)" },
  other: { label: "Other", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
};

function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const startLabel = new Date(start + "T00:00:00").toLocaleDateString(
    "en-IN",
    opts,
  );
  const endLabel = new Date(end + "T00:00:00").toLocaleDateString(
    "en-IN",
    opts,
  );
  return start === end ? startLabel : `${startLabel} – ${endLabel}`;
}

export default function AdminCalendarPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRoomId, setFilterRoomId] = useState<string>("all");
  const [filterType, setFilterType] = useState<
    "all" | "manual" | "booking" | "ical"
  >("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // iCal Sync state
  const [syncConfigs, setSyncConfigs] = useState<IcalSyncConfig[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [showAddSync, setShowAddSync] = useState(false);
  const [syncPlatform, setSyncPlatform] = useState("makemytrip");
  const [syncLabel, setSyncLabel] = useState("");
  const [syncUrl, setSyncUrl] = useState("");
  const [syncRoomId, setSyncRoomId] = useState("");
  const [isAddingSync, setIsAddingSync] = useState(false);
  const [copiedExportId, setCopiedExportId] = useState<string | null>(null);
  const [liveDomain, setLiveDomain] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ah_live_domain") || "";
    }
    return "";
  });

  const getExportBaseUrl = () => {
    if (liveDomain.trim()) {
      return liveDomain.trim().replace(/\/+$/, "");
    }
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  const roomNameById = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((room) => map.set(room.id, room.name));
    return map;
  }, [rooms]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, blockedData, bookingsData, configsData] =
        await Promise.all([
          db.getRooms(),
          db.getBlockedDates(),
          db.getBookings(),
          db.getIcalSyncConfigs(),
        ]);
      setRooms(roomsData);
      setBlockedDates(blockedData);
      setBookings(bookingsData);
      setSyncConfigs(configsData);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError("Failed to load calendar data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!roomId && rooms.length > 0) {
      setRoomId(rooms[0].id);
    }
    if (!syncRoomId && rooms.length > 0) {
      setSyncRoomId(rooms[0].id);
    }
  }, [rooms, roomId, syncRoomId]);

  const lockedDates = useMemo(() => {
    const manualEntries: LockedDateEntry[] = blockedDates
      .filter((block) => !block.source || block.source === "manual")
      .map((block) => ({
        kind: "manual" as const,
        id: block.id,
        room_id: block.room_id,
        start_date: block.start_date,
        end_date: block.end_date,
        reason: block.reason,
      }));

    const icalEntries: LockedDateEntry[] = blockedDates
      .filter((block) => block.source === "ical")
      .map((block) => ({
        kind: "ical" as const,
        id: block.id,
        room_id: block.room_id,
        start_date: block.start_date,
        end_date: block.end_date,
        reason: block.reason,
        ical_config_id: block.ical_config_id,
      }));

    const bookingEntries: LockedDateEntry[] = bookings
      .filter(hasActiveBooking)
      .map((booking) => ({
        kind: "booking" as const,
        id: booking.id,
        room_id: booking.room_id,
        start_date: booking.check_in,
        end_date: booking.check_out,
        guest_name: booking.guest_name,
        status: booking.status as "pending" | "confirmed",
      }));

    return [...manualEntries, ...icalEntries, ...bookingEntries].sort((a, b) =>
      a.start_date.localeCompare(b.start_date),
    );
  }, [blockedDates, bookings]);

  const filteredLockedDates = useMemo(() => {
    return lockedDates.filter((entry) => {
      const matchesRoom =
        filterRoomId === "all" || entry.room_id === filterRoomId;
      const matchesType =
        filterType === "all" ||
        (filterType === "manual" && entry.kind === "manual") ||
        (filterType === "booking" && entry.kind === "booking") ||
        (filterType === "ical" && entry.kind === "ical");
      return matchesRoom && matchesType;
    });
  }, [lockedDates, filterRoomId, filterType]);

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!roomId || !startDate || !endDate) {
      setError("Please select a room and both start and end dates.");
      return;
    }

    if (startDate > endDate) {
      setError("End date must be on or after the start date.");
      return;
    }

    const manualOverlap = blockedDates.find(
      (existing) =>
        existing.room_id === roomId &&
        dateRangesOverlap(
          startDate,
          endDate,
          existing.start_date,
          existing.end_date,
        ),
    );

    if (manualOverlap) {
      setError(
        "These dates overlap with an existing manual block for this room. Unblock or adjust it first.",
      );
      return;
    }

    const bookingOverlap = bookings.find(
      (booking) =>
        booking.room_id === roomId &&
        hasActiveBooking(booking) &&
        dateRangesOverlap(
          startDate,
          endDate,
          booking.check_in,
          booking.check_out,
        ),
    );

    if (bookingOverlap) {
      setError(
        "These dates overlap with an active booking for this room. Cancel that booking first if you need to block the same dates.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await db.addBlockedDate({
        room_id: roomId,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim() || undefined,
      });
      resetForm();
      setSuccess("Dates blocked successfully. Guests will no longer be able to book this range.");
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the blocked dates. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblockManual = async (entry: Extract<LockedDateEntry, { kind: "manual" }>) => {
    const roomName = roomNameById.get(entry.room_id) || "this room";
    const range = formatDateRange(entry.start_date, entry.end_date);
    if (
      !window.confirm(
        `Unblock ${roomName} for ${range}? Guests will be able to book these dates again.`,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await db.deleteBlockedDate(entry.id);
      setSuccess("Dates unblocked.");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Could not unblock these dates. Please try again.");
    }
  };

  const handleUnblockBooking = async (
    entry: Extract<LockedDateEntry, { kind: "booking" }>,
  ) => {
    const roomName = roomNameById.get(entry.room_id) || "this room";
    const range = formatDateRange(entry.start_date, entry.end_date);
    if (
      !window.confirm(
        `Cancel the booking for ${entry.guest_name} (${roomName}, ${range})? This will free up these dates for new bookings.`,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await db.updateBookingStatus(entry.id, "cancelled");
      setSuccess("Booking cancelled and dates are available again.");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Could not cancel the booking. Please try again.");
    }
  };

  const handleUnblockIcal = async (
    entry: Extract<LockedDateEntry, { kind: "ical" }>,
  ) => {
    const roomName = roomNameById.get(entry.room_id) || "this room";
    const range = formatDateRange(entry.start_date, entry.end_date);
    if (
      !window.confirm(
        `Remove this synced block for ${roomName} (${range})? Note: If this reservation is still active in your external calendar, it may be re-imported on the next sync.`,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await db.deleteBlockedDate(entry.id);
      setSuccess("Synced block removed.");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Could not remove this synced block. Please try again.");
    }
  };

  // --- iCal Sync Handlers ---
  const handleAddSyncConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncRoomId || !syncUrl || !syncLabel) {
      setError("Please fill in all fields for the calendar sync.");
      return;
    }

    setIsAddingSync(true);
    setError("");
    try {
      await db.addIcalSyncConfig({
        room_id: syncRoomId,
        platform: syncPlatform,
        ical_url: syncUrl.trim(),
        label: syncLabel.trim(),
        is_active: true,
      });
      setSyncUrl("");
      setSyncLabel("");
      setShowAddSync(false);
      setSuccess("Calendar connected! Click 'Sync Now' to import dates.");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to add calendar sync. Please check the URL and try again.");
    } finally {
      setIsAddingSync(false);
    }
  };

  const handleDeleteSyncConfig = async (config: IcalSyncConfig) => {
    const platformLabel =
      PLATFORM_LABELS[config.platform]?.label || config.platform;
    if (
      !window.confirm(
        `Disconnect "${config.label}" (${platformLabel})? All synced blocked dates from this calendar will be removed.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await db.deleteIcalSyncConfig(config.id);
      setSuccess("Calendar disconnected and synced blocks removed.");
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to disconnect calendar. Please try again.");
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage("");
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs: syncConfigs }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message);
        setSuccess(data.message);
      } else {
        setSyncMessage(data.message || "Sync completed with an issue.");
        setError(data.message || "Sync had an issue. Please review the connected calendar details below.");
      }

      if (data.configs && Array.isArray(data.configs)) {
        setSyncConfigs(data.configs);
        if (typeof window !== "undefined") {
          localStorage.setItem("ah_ical_sync_configs", JSON.stringify(data.configs));
        }
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Sync failed. Please check your internet connection and try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyExportLink = (roomId: string) => {
    const baseUrl = getExportBaseUrl();
    const link = `${baseUrl}/api/calendar/${roomId}/feed.ics`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedExportId(roomId);
      setTimeout(() => setCopiedExportId(null), 2000);
    });
  };

  const getConfigForBlock = (configId?: string) => {
    if (!configId) return undefined;
    return syncConfigs.find((c) => c.id === configId);
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "24px" }}>Room Calendar</h1>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontFamily: "var(--font-serif)",
            marginBottom: "8px",
          }}
        >
          Room Calendar
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          See every date that is unavailable — from active bookings and manual
          blocks. Unblock manual closures here, or cancel a booking to release
          its dates.
        </p>
      </div>

      {(error || success) && (
        <div
          className="card"
          style={{
            padding: "16px 20px",
            backgroundColor: error ? "#FEF2F2" : "#ECFDF5",
            border: `1px solid ${error ? "#FECACA" : "#A7F3D0"}`,
            color: error ? "#B91C1C" : "#047857",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "0.95rem",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{error || success}</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <form
          onSubmit={handleAddBlock}
          className="card"
          style={{
            padding: "28px",
            backgroundColor: "#FFFFFF",
            border: "none",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "1.15rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Plus size={20} style={{ color: "var(--primary)" }} /> Add Block
          </h3>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              ROOM
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem",
                backgroundColor: "#FFFFFF",
              }}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                START DATE
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                END DATE
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              REASON (OPTIONAL)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Maintenance, family event, painting work"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || rooms.length === 0}
            style={{ alignSelf: "flex-start" }}
          >
            {isSubmitting ? "Saving..." : "Block Dates"}
          </button>
        </form>

        <div
          className="card"
          style={{
            padding: "28px",
            backgroundColor: "#FFFFFF",
            border: "none",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3
            style={{
              fontSize: "1.15rem",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <CalendarRange size={20} style={{ color: "var(--primary)" }} />{" "}
            How it works
          </h3>
          <ul
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              paddingLeft: "20px",
              margin: 0,
            }}
          >
            <li>
              Active bookings (pending or confirmed) appear here automatically —
              no need to block those dates manually.
            </li>
            <li>
              Manual blocks are for maintenance, private use, or other
              closures.
            </li>
            <li>
              Use <strong>Unblock</strong> on manual blocks, or{" "}
              <strong>Cancel booking</strong> to free dates held by a guest
              reservation.
            </li>
            <li>Overlapping manual blocks for the same room are not allowed.</li>
          </ul>
        </div>
      </div>

      {/* Calendar Sync Section */}
      <div
        className="card"
        style={{
          padding: "28px",
          backgroundColor: "#FFFFFF",
          border: "none",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(230, 74, 25, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#E64A19",
                }}
              >
                <RefreshCw size={22} style={{ animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: "600" }}>
                  Calendar Sync (MakeMyTrip, Airbnb, OTAs)
                </h3>
                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Keep room availability automatically synchronized across all online travel channels via iCal (.ics)
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing || syncConfigs.length === 0}
              className="btn btn-outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "var(--primary)",
                borderColor: "var(--primary)",
                cursor: isSyncing || syncConfigs.length === 0 ? "not-allowed" : "pointer",
                opacity: syncConfigs.length === 0 ? 0.6 : 1,
              }}
            >
              <RefreshCw size={15} style={{ animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
              {isSyncing ? "Syncing Calendars..." : "Sync Now"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddSync(!showAddSync);
                if (!showAddSync && !syncLabel && rooms.length > 0) {
                  const r = rooms.find((x) => x.id === (syncRoomId || rooms[0].id));
                  setSyncLabel(`MakeMyTrip - ${r?.name || ""}`);
                }
              }}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 16px",
                fontSize: "0.875rem",
              }}
            >
              <Plus size={16} />
              {showAddSync ? "Cancel" : "Connect Calendar"}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              backgroundColor:
                syncMessage.toLowerCase().includes("issue") ||
                syncMessage.toLowerCase().includes("error") ||
                syncMessage.toLowerCase().includes("rejected") ||
                syncMessage.toLowerCase().includes("failed") ||
                syncMessage.toLowerCase().includes("no active")
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(16, 185, 129, 0.1)",
              border: `1px solid ${
                syncMessage.toLowerCase().includes("issue") ||
                syncMessage.toLowerCase().includes("error") ||
                syncMessage.toLowerCase().includes("rejected") ||
                syncMessage.toLowerCase().includes("failed") ||
                syncMessage.toLowerCase().includes("no active")
                  ? "rgba(239, 68, 68, 0.25)"
                  : "rgba(16, 185, 129, 0.2)"
              }`,
              color:
                syncMessage.toLowerCase().includes("issue") ||
                syncMessage.toLowerCase().includes("error") ||
                syncMessage.toLowerCase().includes("rejected") ||
                syncMessage.toLowerCase().includes("failed") ||
                syncMessage.toLowerCase().includes("no active")
                  ? "#991B1B"
                  : "#065F46",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            {syncMessage.toLowerCase().includes("issue") ||
            syncMessage.toLowerCase().includes("error") ||
            syncMessage.toLowerCase().includes("rejected") ||
            syncMessage.toLowerCase().includes("failed") ||
            syncMessage.toLowerCase().includes("no active") ? (
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
            ) : (
              <Check size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
            )}
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Add Calendar Connection Form */}
        {showAddSync && (
          <form
            onSubmit={handleAddSyncConfig}
            style={{
              padding: "20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#F9FAFB",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <Link2 size={18} style={{ color: "var(--primary)" }} /> Connect New Calendar Feed
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                  ROOM
                </label>
                <select
                  value={syncRoomId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSyncRoomId(newId);
                    const r = rooms.find((x) => x.id === newId);
                    if (r) {
                      setSyncLabel(`${PLATFORM_LABELS[syncPlatform]?.label || "External"} - ${r.name}`);
                    }
                  }}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                  PLATFORM
                </label>
                <select
                  value={syncPlatform}
                  onChange={(e) => {
                    const newPlatform = e.target.value;
                    setSyncPlatform(newPlatform);
                    const r = rooms.find((x) => x.id === (syncRoomId || rooms[0]?.id));
                    if (r) {
                      setSyncLabel(`${PLATFORM_LABELS[newPlatform]?.label || "External"} - ${r.name}`);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <option value="makemytrip">MakeMyTrip</option>
                  <option value="airbnb">Airbnb</option>
                  <option value="booking.com">Booking.com</option>
                  <option value="other">Other OTA / Platform</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                  LABEL
                </label>
                <input
                  type="text"
                  value={syncLabel}
                  onChange={(e) => setSyncLabel(e.target.value)}
                  placeholder="e.g. MakeMyTrip - Deluxe Room"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                iCAL / .ICS EXPORT URL FROM PLATFORM
              </label>
              <input
                type="url"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
                placeholder="https://.../calendar.ics or webcal://..."
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  fontSize: "0.95rem",
                  backgroundColor: "#FFFFFF",
                }}
              />
              <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                💡 <strong>MakeMyTrip:</strong> Log into InGo-MMT &rarr; Rates &amp; Inventory &rarr; Calendar Sync &rarr; Copy the export iCal link.
                <br />
                💡 <strong>Airbnb:</strong> Listing &rarr; Pricing and availability &rarr; Calendar sync &rarr; Export Calendar &rarr; Copy link.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setShowAddSync(false)}
                className="btn btn-outline"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingSync}
                className="btn btn-primary"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                {isAddingSync ? "Saving..." : "Save Connection"}
              </button>
            </div>
          </form>
        )}

        {/* Connected Calendars List */}
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
            Connected External Calendars ({syncConfigs.length})
          </h4>

          {syncConfigs.length === 0 ? (
            <div
              style={{
                padding: "24px",
                border: "1px dashed var(--border-color)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "0.9rem",
              }}
            >
              <Globe size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5, display: "block" }} />
              No external calendars connected yet.
              <br />
              <span style={{ fontSize: "0.825rem" }}>
                Click &quot;Connect Calendar&quot; above to connect your MakeMyTrip or Airbnb feed.
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {syncConfigs.map((config) => {
                const platformMeta = PLATFORM_LABELS[config.platform] || PLATFORM_LABELS.other;
                const room = rooms.find((r) => r.id === config.room_id);
                return (
                  <div
                    key={config.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "#FAFAFA",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "260px" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          backgroundColor: platformMeta.bg,
                          color: platformMeta.color,
                        }}
                      >
                        {platformMeta.label}
                      </span>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                          {config.label}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          Room: <strong>{room?.name || "Unknown"}</strong>
                          {config.last_synced_at && (
                            <span>
                              {" · "}Last synced:{" "}
                              {new Date(config.last_synced_at).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          )}
                          {config.last_error && (
                            <div
                              style={{
                                marginTop: "6px",
                                padding: "6px 10px",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: "#FEF2F2",
                                border: "1px solid #FCA5A5",
                                color: "#991B1B",
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "6px",
                                maxWidth: "520px",
                              }}
                            >
                              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                              <div>
                                <strong>Calendar Error:</strong> {config.last_error}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteSyncConfig(config)}
                        title="Disconnect calendar"
                        style={{
                          padding: "8px 12px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #FCA5A5",
                          backgroundColor: "#FEF2F2",
                          color: "#EF4444",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                        }}
                      >
                        <Trash2 size={14} /> Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two-Way Export Links Section */}
        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <ExternalLink size={17} style={{ color: "var(--primary)" }} /> Export Agrawal House Calendar to OTAs (Two-Way Sync)
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Copy the calendar feed link below for each room and paste it into MakeMyTrip / Airbnb under &quot;Import Calendar&quot;. When guests book directly on your website, those dates will automatically block on MMT and Airbnb.
            </p>
          </div>

          {typeof window !== "undefined" && window.location.hostname === "localhost" && (
            <div
              style={{
                marginBottom: "16px",
                padding: "14px 16px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#FFFBEB",
                border: "1px solid #FCD34D",
                color: "#92400E",
                fontSize: "0.85rem",
              }}
            >
              <div style={{ fontWeight: "700", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚠️ Note for MakeMyTrip / Airbnb Setup</span>
              </div>
              <p style={{ margin: "0 0 8px 0", lineHeight: "1.5" }}>
                MakeMyTrip cannot reach <code>localhost:3000</code> from the internet. If your website is deployed live on Vercel or your own domain, enter your live website URL below so the <strong>Copy URL</strong> buttons generate links MakeMyTrip can access:
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", maxWidth: "480px" }}>
                <input
                  type="url"
                  placeholder="e.g. https://agrawalhouse.com or https://your-site.vercel.app"
                  value={liveDomain}
                  onChange={(e) => {
                    setLiveDomain(e.target.value);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("ah_live_domain", e.target.value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid #D97706",
                    fontSize: "0.85rem",
                    backgroundColor: "#FFFFFF",
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {rooms.map((room) => {
              const baseUrl = getExportBaseUrl();
              const exportUrl = `${baseUrl}/api/calendar/${room.id}/feed.ics`;
              const isCopied = copiedExportId === room.id;

              return (
                <div
                  key={room.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid var(--border-color)",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
                    <BedDouble size={16} style={{ color: "var(--primary)" }} />
                    <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{room.name}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                      minWidth: "280px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <input
                      type="text"
                      readOnly
                      value={exportUrl}
                      style={{
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-secondary)",
                        width: "100%",
                        maxWidth: "380px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyExportLink(room.id)}
                      className="btn btn-outline"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.8rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        whiteSpace: "nowrap",
                        color: isCopied ? "#059669" : "var(--primary)",
                        borderColor: isCopied ? "#059669" : "var(--primary)",
                      }}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      {isCopied ? "Copied!" : "Copy URL"}
                    </button>
                    <a
                      href={`/api/calendar/${room.id}/feed.ics`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{
                        padding: "6px 10px",
                        fontSize: "0.8rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--text-secondary)",
                        borderColor: "var(--border-color)",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                      title="Open feed in browser"
                    >
                      <ExternalLink size={13} /> Test Feed
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "24px",
          backgroundColor: "#FFFFFF",
          border: "none",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <h3 style={{ fontSize: "1.15rem", margin: 0 }}>
            Locked Dates ({filteredLockedDates.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              {(
                [
                  { value: "all", label: "All" },
                  { value: "booking", label: "Bookings" },
                  { value: "manual", label: "Manual" },
                  { value: "ical", label: "Synced (OTA)" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilterType(option.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid",
                    borderColor:
                      filterType === option.value
                        ? "var(--primary)"
                        : "var(--border-color)",
                    backgroundColor:
                      filterType === option.value
                        ? "var(--primary-light)"
                        : "#FFFFFF",
                    color:
                      filterType === option.value
                        ? "var(--primary)"
                        : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: filterType === option.value ? "600" : "400",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <select
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                fontSize: "0.85rem",
                backgroundColor: "#FFFFFF",
              }}
            >
              <option value="all">All rooms</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredLockedDates.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 24px",
              color: "var(--text-muted)",
              border: "1px dashed var(--border-color)",
              borderRadius: "var(--radius-md)",
            }}
          >
            No locked dates
            {filterRoomId !== "all" || filterType !== "all"
              ? " matching these filters"
              : " right now"}
            . Active bookings and manual blocks will appear here automatically.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredLockedDates.map((entry) => {
              const icalConfig =
                entry.kind === "ical"
                  ? getConfigForBlock(entry.ical_config_id)
                  : undefined;
              const platformMeta =
                entry.kind === "ical"
                  ? PLATFORM_LABELS[icalConfig?.platform || "makemytrip"] ||
                    PLATFORM_LABELS.other
                  : undefined;

              return (
                <div
                  key={`${entry.kind}-${entry.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    flexWrap: "wrap",
                    borderLeft:
                      entry.kind === "booking"
                        ? "4px solid var(--accent)"
                        : entry.kind === "ical"
                        ? `4px solid ${platformMeta?.color || "#E64A19"}`
                        : "4px solid var(--primary)",
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: "6px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          backgroundColor:
                            entry.kind === "booking"
                              ? "rgba(245, 158, 11, 0.15)"
                              : entry.kind === "ical"
                              ? platformMeta?.bg || "rgba(230, 74, 25, 0.1)"
                              : "var(--primary-light)",
                          color:
                            entry.kind === "booking"
                              ? "var(--accent)"
                              : entry.kind === "ical"
                              ? platformMeta?.color || "#E64A19"
                              : "var(--primary)",
                        }}
                      >
                        {entry.kind === "booking"
                          ? entry.status === "pending"
                            ? "Booking · Pending"
                            : "Booking · Confirmed"
                          : entry.kind === "ical"
                          ? `Synced · ${platformMeta?.label || "OTA"}`
                          : "Manual block"}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: "600",
                          fontSize: "0.95rem",
                        }}
                      >
                        <BedDouble size={16} style={{ color: "var(--primary)" }} />
                        {roomNameById.get(entry.room_id) || "Unknown room"}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {formatDateRange(entry.start_date, entry.end_date)}
                    </div>
                    {entry.kind === "booking" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <User size={14} />
                        {entry.guest_name}
                      </div>
                    )}
                    {entry.kind === "manual" && entry.reason && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {entry.reason}
                      </div>
                    )}
                    {entry.kind === "ical" && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {entry.reason || "Synced from external calendar"}
                        {icalConfig && ` (${icalConfig.label})`}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (entry.kind === "manual") handleUnblockManual(entry);
                      else if (entry.kind === "booking") handleUnblockBooking(entry);
                      else handleUnblockIcal(entry);
                    }}
                    className="btn btn-outline"
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.8rem",
                      color: "#EF4444",
                      borderColor: "#FCA5A5",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Unlock size={14} />
                    {entry.kind === "manual"
                      ? "Unblock"
                      : entry.kind === "booking"
                      ? "Cancel booking"
                      : "Remove block"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
