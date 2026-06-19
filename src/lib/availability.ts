import { BlockedDate, Booking } from "./types";

export function dateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const rangeAStart = new Date(startA).getTime();
  const rangeAEnd = new Date(endA).getTime();
  const rangeBStart = new Date(startB).getTime();
  const rangeBEnd = new Date(endB).getTime();

  return rangeAStart < rangeBEnd && rangeAEnd > rangeBStart;
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
    dateRangesOverlap(
      checkIn,
      checkOut,
      blockedDate.start_date,
      blockedDate.end_date,
    ),
  );

  if (blockedMatch) {
    return "The selected dates overlap with a blocked maintenance window.";
  }

  const bookingMatch = bookings.find(
    (booking) =>
      hasActiveBooking(booking) &&
      dateRangesOverlap(checkIn, checkOut, booking.check_in, booking.check_out),
  );

  if (bookingMatch) {
    return "The room is already reserved for the selected dates.";
  }

  return null;
}
