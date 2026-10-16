import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateIcalFeed } from "@/lib/ical";
import { hasActiveBooking } from "@/lib/availability";

/**
 * GET /api/calendar/[roomId]/feed.ics
 *
 * Generates and returns a valid .ics (iCal) feed for a specific room.
 * This URL can be pasted into MakeMyTrip, Airbnb, or any platform
 * that supports iCal calendar import.
 *
 * The feed includes:
 * - All active bookings (pending + confirmed) for the room
 * - All manually blocked dates for the room
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    // Get room details
    const room = await db.getRoom(roomId);
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 },
      );
    }

    // Get bookings and blocked dates for this room
    const [allBookings, blockedDates] = await Promise.all([
      db.getBookings(),
      db.getBlockedDates(roomId),
    ]);

    // Filter to active bookings for this room
    const roomBookings = allBookings.filter(
      (b) => b.room_id === roomId && hasActiveBooking(b),
    );

    // Only export manual blocks (not synced ones, to avoid circular syncing)
    const manualBlocks = blockedDates.filter(
      (b) => !b.source || b.source === "manual",
    );

    // Build events for the iCal feed
    const events: {
      uid: string;
      summary: string;
      startDate: string;
      endDate: string;
    }[] = [];

    // Add bookings as events
    for (const booking of roomBookings) {
      events.push({
        uid: `booking-${booking.id}@agrawalhouse.com`,
        summary: `Reserved - Agrawal House`,
        startDate: booking.check_in,
        endDate: booking.check_out,
      });
    }

    // Add manual blocks as events
    for (const block of manualBlocks) {
      events.push({
        uid: `block-${block.id}@agrawalhouse.com`,
        summary: block.reason
          ? `Blocked: ${block.reason}`
          : "Not Available - Agrawal House",
        startDate: block.start_date,
        endDate: block.end_date,
      });
    }

    // Generate the iCal feed
    const icsContent = generateIcalFeed(room.name, events);

    // Return with proper content type
    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${room.name.replace(/[^a-zA-Z0-9]/g, "_")}_calendar.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating iCal feed:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar feed" },
      { status: 500 },
    );
  }
}
