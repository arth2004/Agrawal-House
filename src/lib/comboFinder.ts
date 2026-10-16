import { Room, BlockedDate, Booking } from "./types";
import { bookingOverlapsBlockedDate, bookingOverlapsBooking, hasActiveBooking } from "./availability";

export interface RoomComboOption {
  id: string;
  title: string;
  badge?: "Best Value" | "Most Popular" | "Extra Space" | "Whole Property Buyout";
  rooms: Room[];
  standardCapacity: number;
  maxCapacityWithExtraBeds: number;
  extraGuestsCount: number; // How many extra guests beyond standard capacity
  nightlyBasePrice: number;
  nightlyExtraPersonCharge: number;
  nightlyTotal: number;
  totalForStay: number;
  description: string;
  amenitiesSummary: string[];
}

export interface ComboSearchResult {
  availableRooms: Room[];
  combos: RoomComboOption[];
  totalHomestayCapacity: number;
  isGroupOverCapacity: boolean;
}

/**
 * Checks if a specific room is available for the given stay dates.
 */
export function isRoomAvailable(
  roomId: string,
  checkIn: string,
  checkOut: string,
  blockedDates: BlockedDate[],
  bookings: Booking[],
): boolean {
  if (!checkIn || !checkOut) return true;

  // 1. Check against blocked dates
  const isBlocked = blockedDates.some(
    (b) => b.room_id === roomId && bookingOverlapsBlockedDate(checkIn, checkOut, b.start_date, b.end_date),
  );
  if (isBlocked) return false;

  // 2. Check against active bookings
  const isBooked = bookings.some(
    (b) => b.room_id === roomId && hasActiveBooking(b) && bookingOverlapsBooking(checkIn, checkOut, b.check_in, b.check_out),
  );
  if (isBooked) return false;

  return true;
}

/**
 * Returns room configuration details:
 * Family rooms: base 4 guests, allows 1 extra guest (+₹300/night).
 * Double rooms: base 2 guests, max 2 guests.
 */
export function getRoomCapacityInfo(room: Room): {
  baseCapacity: number;
  maxCapacity: number;
  allowsExtra: boolean;
  extraCharge: number;
} {
  const isFamily = room.name.toLowerCase().includes("family") || room.max_guests >= 4;
  return {
    baseCapacity: isFamily ? 4 : 2,
    maxCapacity: isFamily ? 5 : 2,
    allowsExtra: isFamily,
    extraCharge: isFamily ? 300 : 0,
  };
}

/**
 * Generates all valid subsets of rooms (power set) and finds the best combinations
 * for a requested guest count and date range.
 */
export function findBestRoomCombos(options: {
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  rooms: Room[];
  blockedDates: BlockedDate[];
  bookings: Booking[];
  numNights?: number;
}): ComboSearchResult {
  const { checkIn, checkOut, guestsCount, rooms, blockedDates, bookings, numNights = 1 } = options;

  // 1. Filter active rooms and check date availability
  const activeRooms = rooms.filter((r) => r.status === "active");
  const availableRooms = activeRooms.filter((r) =>
    isRoomAvailable(r.id, checkIn, checkOut, blockedDates, bookings),
  );

  const totalHomestayCapacity = availableRooms.reduce(
    (acc, r) => acc + getRoomCapacityInfo(r).maxCapacity,
    0,
  );

  const isGroupOverCapacity = guestsCount > totalHomestayCapacity;

  // Generate all non-empty combinations of available rooms (up to 2^4 - 1 = 15 subsets)
  const allSubsets: Room[][] = [];
  const n = availableRooms.length;

  for (let mask = 1; mask < (1 << n); mask++) {
    const subset: Room[] = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        subset.push(availableRooms[i]);
      }
    }
    allSubsets.push(subset);
  }

  // Evaluate subsets that can host `guestsCount`
  const candidateCombos: RoomComboOption[] = [];

  for (const subset of allSubsets) {
    const standardCap = subset.reduce((acc, r) => acc + getRoomCapacityInfo(r).baseCapacity, 0);
    const maxCap = subset.reduce((acc, r) => acc + getRoomCapacityInfo(r).maxCapacity, 0);

    // If subset cannot fit guests even with extra beds, skip (unless guest count exceeds entire property)
    if (maxCap < guestsCount && !isGroupOverCapacity) {
      continue;
    }

    // If it's over-capacity (> max available), we will recommend the full buyout
    if (isGroupOverCapacity && subset.length !== availableRooms.length) {
      continue;
    }

    // Calculate extra guests needed
    const extraNeeded = Math.max(0, Math.min(guestsCount - standardCap, maxCap - standardCap));
    const extraChargePerNight = extraNeeded * 300;

    const baseNightly = subset.reduce((acc, r) => acc + r.base_price, 0);
    const totalNightly = baseNightly + extraChargePerNight;
    const totalStay = totalNightly * Math.max(1, numNights);

    const roomNames = subset.map((r) => r.name).join(" + ");
    const isFullProperty = subset.length === activeRooms.length;

    let title = `${subset.length} Room${subset.length > 1 ? "s" : ""}: ${roomNames}`;
    if (isFullProperty) {
      title = `Entire Homestay (All ${subset.length} Rooms - Full Property Buyout)`;
    }

    let badge: RoomComboOption["badge"];
    if (isFullProperty) {
      badge = "Whole Property Buyout";
    }

    // Amenities summary
    const totalBathrooms = subset.length;
    const amenitiesSummary = [
      `${totalBathrooms} Private Attached Washroom${totalBathrooms > 1 ? "s" : ""}`,
      "All Air Conditioned",
      "High-Speed Wi-Fi",
      extraNeeded > 0 ? `${extraNeeded} Extra Mattress Included` : "Comfortable Plush Bedding",
    ];

    let description = `Ideal for up to ${maxCap} guests across ${subset.length} room${subset.length > 1 ? "s" : ""}.`;
    if (extraNeeded > 0) {
      description += ` Includes ₹${extraChargePerNight}/night for ${extraNeeded} extra person mattress.`;
    }

    candidateCombos.push({
      id: subset.map((r) => r.id).sort().join("_") + `_${extraNeeded}`,
      title,
      badge,
      rooms: subset,
      standardCapacity: standardCap,
      maxCapacityWithExtraBeds: maxCap,
      extraGuestsCount: extraNeeded,
      nightlyBasePrice: baseNightly,
      nightlyExtraPersonCharge: extraChargePerNight,
      nightlyTotal: totalNightly,
      totalForStay: totalStay,
      description,
      amenitiesSummary,
    });
  }

  // Sort candidates by total nightly price ascending
  candidateCombos.sort((a, b) => a.nightlyTotal - b.nightlyTotal);

  // Assign smart badges
  if (candidateCombos.length > 0) {
    if (!candidateCombos[0].badge) {
      candidateCombos[0].badge = "Best Value";
    }

    if (candidateCombos.length > 1 && !candidateCombos[1].badge) {
      candidateCombos[1].badge = "Most Popular";
    }

    if (candidateCombos.length > 2 && !candidateCombos[2].badge) {
      candidateCombos[2].badge = "Extra Space";
    }
  }

  // Limit to top 3 most relevant combos to keep UI clear and uncluttered
  const finalCombos = candidateCombos.slice(0, 3);

  return {
    availableRooms,
    combos: finalCombos,
    totalHomestayCapacity,
    isGroupOverCapacity,
  };
}
