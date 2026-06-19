"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db";
import { BlockedDate, Booking, Room } from "@/lib/types";
import { dateRangesOverlap, hasActiveBooking } from "@/lib/availability";
import {
  CalendarRange,
  Plus,
  Unlock,
  BedDouble,
  AlertCircle,
  User,
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
  const [filterType, setFilterType] = useState<"all" | "manual" | "booking">(
    "all",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [roomId, setRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const roomNameById = useMemo(() => {
    const map = new Map<string, string>();
    rooms.forEach((room) => map.set(room.id, room.name));
    return map;
  }, [rooms]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, blockedData, bookingsData] = await Promise.all([
        db.getRooms(),
        db.getBlockedDates(),
        db.getBookings(),
      ]);
      setRooms(roomsData);
      setBlockedDates(blockedData);
      setBookings(bookingsData);
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
  }, [rooms, roomId]);

  const lockedDates = useMemo(() => {
    const manualEntries: LockedDateEntry[] = blockedDates.map((block) => ({
      kind: "manual",
      id: block.id,
      room_id: block.room_id,
      start_date: block.start_date,
      end_date: block.end_date,
      reason: block.reason,
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

    return [...manualEntries, ...bookingEntries].sort((a, b) =>
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
        (filterType === "booking" && entry.kind === "booking");
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
            {filteredLockedDates.map((entry) => (
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
                            : "var(--primary-light)",
                        color:
                          entry.kind === "booking"
                            ? "var(--accent)"
                            : "var(--primary)",
                      }}
                    >
                      {entry.kind === "booking"
                        ? entry.status === "pending"
                          ? "Booking · Pending"
                          : "Booking · Confirmed"
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
                </div>
                <button
                  type="button"
                  onClick={() =>
                    entry.kind === "manual"
                      ? handleUnblockManual(entry)
                      : handleUnblockBooking(entry)
                  }
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
                  {entry.kind === "manual" ? "Unblock" : "Cancel booking"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
