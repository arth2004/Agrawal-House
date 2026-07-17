export const WHATSAPP_PHONE = "917415160134";

export type WhatsAppBookingDetails = {
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  totalPrice?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  notes?: string;
};

export function buildGeneralBookingMessage(): string {
  return [
    "Hi Agrawal House,",
    "",
    "I would like to enquire about booking a stay at your homestay.",
    "",
    "Could you please share availability and room options?",
    "",
    "Thank you!",
  ].join("\n");
}

export function buildBookingMessage(details: WhatsAppBookingDetails): string {
  const lines = ["Hi Agrawal House,", "", "I would like to book a stay with the following details:", ""];

  if (details.roomName) lines.push(`Room: ${details.roomName}`);
  if (details.checkIn) lines.push(`Check-in: ${details.checkIn}`);
  if (details.checkOut) lines.push(`Check-out: ${details.checkOut}`);
  if (details.guests) {
    lines.push(`Guests: ${details.guests}`);
  }
  if (details.nights) {
    lines.push(`Duration: ${details.nights} night${details.nights > 1 ? "s" : ""}`);
  }
  if (details.totalPrice) lines.push(`Estimated total: ₹${details.totalPrice}`);

  if (details.guestName || details.guestPhone || details.guestEmail) {
    lines.push("", "Guest details:");
    if (details.guestName) lines.push(`Name: ${details.guestName}`);
    if (details.guestPhone) lines.push(`Phone: ${details.guestPhone}`);
    if (details.guestEmail) lines.push(`Email: ${details.guestEmail}`);
  }

  if (details.notes?.trim()) {
    lines.push("", `Special requests: ${details.notes.trim()}`);
  }

  lines.push("", "Please confirm availability. Thank you!");
  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
