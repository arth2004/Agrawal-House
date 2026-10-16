import { BlockedDate, Booking } from "./types";

export function normalizeDateStr(d: string): string {
  if (!d) return "";
  return d.split("T")[0].trim();
}

/**
 * Checks if a requested stay [checkIn, checkOut) overlaps with an inclusive blocked date range [blockStart, blockEnd].
 *
 * Semantics:
 * - `blockStart` and `blockEnd` are INCLUSIVE nights blocked (e.g. 2026-10-19 to 2026-10-19 blocks the night of Oct 19).
 * - `checkIn` is arrival date.
 * - `checkOut` is departure date (guest leaves in the morning, so does NOT occupy the night of checkOut).
 *
 * A conflict occurs if and only if:
 * checkIn <= blockEnd AND checkOut > blockStart
 */
export function bookingOverlapsBlockedDate(
  checkIn: string,
  checkOut: string,
  blockStart: string,
  blockEnd: string,
): boolean {
  const cIn = normalizeDateStr(checkIn);
  const cOut = normalizeDateStr(checkOut);
  const bStart = normalizeDateStr(blockStart);
  const bEnd = normalizeDateStr(blockEnd);

  if (!cIn || !cOut || !bStart || !bEnd) return false;

  return cIn <= bEnd && cOut > bStart;
}

/**
 * Checks if two booking stays [checkInA, checkOutA) and [checkInB, checkOutB) overlap.
 * Both checkOuts are morning departures (exclusive for night stays).
 * Guest can check in on the same day another guest checks out.
 */
export function bookingOverlapsBooking(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string,
): boolean {
  const sA = normalizeDateStr(checkInA);
  const eA = normalizeDateStr(checkOutA);
  const sB = normalizeDateStr(checkInB);
  const eB = normalizeDateStr(checkOutB);

  if (!sA || !eA || !sB || !eB) return false;

  return sA < eB && eA > sB;
}

/**
 * Checks if two blocked date intervals [startA, endA] and [startB, endB] (both inclusive nights) overlap.
 */
export function blockedDateOverlapsBlockedDate(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const sA = normalizeDateStr(startA);
  const eA = normalizeDateStr(endA);
  const sB = normalizeDateStr(startB);
  const eB = normalizeDateStr(endB);

  if (!sA || !eA || !sB || !eB) return false;

  return sA <= eB && eA >= sB;
}

/**
 * General helper: checks booking-to-booking overlap for backwards compatibility.
 */
export function dateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return bookingOverlapsBooking(startA, endA, startB, endB);
}

export function hasActiveBooking(booking: Booking): boolean {
  return booking.status === "pending" || booking.status === "confirmed";
}

export function findBookingConflict(
  checkIn: string,
  checkOut: string,
  bookings: Booking[],
  blockedDates: BlockedDate[],
): string | null {
  const blockedMatch = blockedDates.find((blockedDate) =>
    bookingOverlapsBlockedDate(
      checkIn,
      checkOut,
      blockedDate.start_date,
      blockedDate.end_date,
    ),
  );

  if (blockedMatch) {
    return "The selected dates overlap with a blocked maintenance or reserved window.";
  }

  const bookingMatch = bookings.find(
    (booking) =>
      hasActiveBooking(booking) &&
      bookingOverlapsBooking(checkIn, checkOut, booking.check_in, booking.check_out),
  );

  if (bookingMatch) {
    return "The room is already reserved for the selected dates.";
  }

  return null;
}

