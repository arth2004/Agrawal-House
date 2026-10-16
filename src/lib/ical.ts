/**
 * iCal (.ics) Parser and Generator
 *
 * Parses iCal feeds from platforms like MakeMyTrip and Airbnb,
 * and generates iCal feeds for export.
 */

// Represents a parsed event from an iCal feed
export interface IcalEvent {
  uid: string;
  summary: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
 * Parse raw iCal (.ics) text content into an array of events.
 * Handles VEVENT components and extracts UID, SUMMARY, DTSTART, DTEND.
 */
export function parseIcalFeed(icsText: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  // Split into VEVENT blocks
  const eventBlocks = icsText.split("BEGIN:VEVENT");

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i].split("END:VEVENT")[0];
    if (!block) continue;

    // Unfold continuation lines (RFC 5545: lines starting with space/tab are continuations)
    const unfolded = block.replace(/\r?\n[ \t]/g, "");
    const lines = unfolded.split(/\r?\n/);

    let uid = "";
    let summary = "Reserved";
    let startDate = "";
    let endDate = "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("UID:")) {
        uid = trimmed.substring(4).trim();
      } else if (trimmed.startsWith("SUMMARY:")) {
        summary = trimmed.substring(8).trim();
      } else if (trimmed.startsWith("DTSTART")) {
        startDate = parseDateValue(trimmed);
      } else if (trimmed.startsWith("DTEND")) {
        endDate = parseDateValue(trimmed);
      }
    }

    if (uid && startDate) {
      // If no DTEND, assume single-day event
      if (!endDate) {
        endDate = startDate;
      }

      // iCal DTEND is exclusive (checkout day), so we subtract 1 day
      // to get the last blocked night, but only if endDate > startDate
      // and only for DATE values (not DATE-TIME, which we convert to date anyway)
      if (endDate > startDate) {
        const endDateObj = new Date(endDate + "T00:00:00");
        endDateObj.setDate(endDateObj.getDate() - 1);
        endDate = formatDate(endDateObj);
      }

      events.push({ uid, summary, startDate, endDate });
    }
  }

  return events;
}

/**
 * Parse a DTSTART or DTEND line value into YYYY-MM-DD format.
 * Handles formats like:
 *   DTSTART;VALUE=DATE:20261020
 *   DTSTART:20261020T150000Z
 *   DTSTART;TZID=Asia/Kolkata:20261020T150000
 */
function parseDateValue(line: string): string {
  // Extract the value after the last colon
  const colonIndex = line.lastIndexOf(":");
  if (colonIndex === -1) return "";
  const value = line.substring(colonIndex + 1).trim();

  if (!value) return "";

  // Pure date format: 20261020 (8 digits)
  if (/^\d{8}$/.test(value)) {
    return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
  }

  // DateTime format: 20261020T150000 or 20261020T150000Z
  if (/^\d{8}T\d{6}Z?$/.test(value)) {
    return `${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}`;
  }

  return "";
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format a YYYY-MM-DD string to iCal DATE format (YYYYMMDD).
 */
function toIcalDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

/**
 * Generate a valid iCal (.ics) feed from bookings and blocked dates.
 * Used to export your calendar to MakeMyTrip / Airbnb.
 */
export function generateIcalFeed(
  roomName: string,
  events: {
    uid: string;
    summary: string;
    startDate: string; // YYYY-MM-DD (check-in or block start)
    endDate: string; // YYYY-MM-DD (check-out or block end)
  }[],
): string {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//Agrawal House//${roomName}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${roomName} - Agrawal House`,
  ];

  for (const event of events) {
    // For export, DTEND should be exclusive (day after last blocked night)
    const endDateObj = new Date(event.endDate + "T00:00:00");
    endDateObj.setDate(endDateObj.getDate() + 1);
    const exclusiveEnd = formatDate(endDateObj);

    ics.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${toIcalDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${toIcalDate(exclusiveEnd)}`,
      `SUMMARY:${event.summary}`,
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  ics.push("END:VCALENDAR");

  return ics.join("\r\n") + "\r\n";
}
