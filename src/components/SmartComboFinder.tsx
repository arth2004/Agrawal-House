"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  BedDouble,
  Home,
  MessageCircle,
} from "lucide-react";
import { Room, BlockedDate, Booking } from "@/lib/types";
import { findBestRoomCombos, RoomComboOption } from "@/lib/comboFinder";
import { WHATSAPP_PHONE } from "@/lib/whatsapp";

interface SmartComboFinderProps {
  rooms: Room[];
  blockedDates: BlockedDate[];
  bookings: Booking[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

export default function SmartComboFinder({
  rooms,
  blockedDates,
  bookings,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 6,
}: SmartComboFinderProps) {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(initialCheckIn || today);
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrow);
  const [guestsCount, setGuestsCount] = useState<number>(initialGuests);

  // Calculate nights
  const numNights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  // Compute best room combos
  const searchResult = useMemo(() => {
    return findBestRoomCombos({
      checkIn,
      checkOut,
      guestsCount,
      rooms,
      blockedDates,
      bookings,
      numNights,
    });
  }, [checkIn, checkOut, guestsCount, rooms, blockedDates, bookings, numNights]);

  const { availableRooms, combos, isGroupOverCapacity } = searchResult;

  const handleWhatsAppCombo = (combo: RoomComboOption) => {
    const roomList = combo.rooms.map((r) => r.name).join(" + ");
    const lines = [
      "Hello Agrawal House,",
      "",
      `I would like to book the Group Combo for ${guestsCount} Guests:`,
      `*Combo:* ${roomList}`,
      `*Check-in:* ${checkIn}`,
      `*Check-out:* ${checkOut}`,
      `*Duration:* ${numNights} night${numNights > 1 ? "s" : ""}`,
      `*Total Guests:* ${guestsCount}`,
    ];

    if (combo.extraGuestsCount > 0) {
      lines.push(
        `*Extra Bedding:* ${combo.extraGuestsCount} extra person mattress included (+₹${combo.nightlyExtraPersonCharge * numNights})`,
      );
    }

    lines.push(
      `*Total Estimate:* ₹${combo.totalForStay} (₹${combo.nightlyTotal}/night)`,
      "",
      "Please confirm room availability for our group. Thank you!",
    );

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  };

  const handleLargeGroupWhatsApp = () => {
    const lines = [
      "Hello Agrawal House,",
      "",
      `We are planning a group stay in Ujjain for ${guestsCount}+ guests:`,
      `*Check-in:* ${checkIn}`,
      `*Check-out:* ${checkOut}`,
      `*Duration:* ${numNights} night${numNights > 1 ? "s" : ""}`,
      "",
      "We would like to book the Full Homestay (up to 14 guests) and need assistance with additional nearby rooms for our remaining guests.",
      "Please share options and custom package rates.",
    ];

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-md)",
        padding: "32px",
        marginBottom: "48px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "999px",
            backgroundColor: "rgba(194, 65, 12, 0.1)",
            color: "var(--primary)",
            fontSize: "0.8rem",
            fontWeight: "700",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          <Sparkles size={14} /> Smart Group Stay & Combo Finder
        </div>
        <h2 style={{ fontSize: "1.9rem", margin: "4px 0 8px 0" }}>
          Find the Best Room Combination for Your Group
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", maxWidth: "750px", lineHeight: "1.5" }}>
          Traveling with family or a group? Select your dates and guest count. Our smart system will instantly check live
          availability across all 4 rooms and calculate the most cost-effective room combination!
        </p>
      </div>

      {/* Search Bar Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          backgroundColor: "var(--bg-secondary)",
          padding: "20px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          marginBottom: "28px",
        }}
      >
        {/* Check-In */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            <Calendar size={13} style={{ color: "var(--primary)" }} /> Check-In Date
          </label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          />
        </div>

        {/* Check-Out */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            <Calendar size={13} style={{ color: "var(--primary)" }} /> Check-Out Date
          </label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: "500",
            }}
          />
        </div>

        {/* Guests Count */}
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            <Users size={13} style={{ color: "var(--primary)" }} /> Number of Guests
          </label>
          <select
            value={guestsCount}
            onChange={(e) => setGuestsCount(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "var(--primary)",
            }}
          >
            <option value={1}>1 Guest (1 Room)</option>
            <option value={2}>2 Guests (1 Double Bedroom)</option>
            <option value={3}>3 Guests (1 Family Bedroom)</option>
            <option value={4}>4 Guests (1 Family Bedroom)</option>
            <option value={5}>5 Guests (1 Family Suite + Extra Bed OR 2 Rooms)</option>
            <option value={6}>6 Guests (Recommended: 1 Family + 1 Double)</option>
            <option value={7}>7 Guests (1 Family with Extra Bed + 1 Double)</option>
            <option value={8}>8 Guests (2 Family Bedrooms)</option>
            <option value={9}>9 Guests (2 Family + 1 Double)</option>
            <option value={10}>10 Guests (2 Family with Extra Beds)</option>
            <option value={11}>11 Guests (Full Homestay - 4 Rooms)</option>
            <option value={12}>12 Guests (Full Homestay - 4 Rooms)</option>
            <option value={13}>13 Guests (Full House + 1 Extra Bed)</option>
            <option value={14}>14 Guests (Full House + 2 Extra Beds - Max Capacity)</option>
            <option value={15}>15+ Guests (Full House + Partner Accommodation)</option>
          </select>
        </div>
      </div>

      {/* Helpful Policy Note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          backgroundColor: "#FFFBEB",
          borderRadius: "var(--radius-sm)",
          border: "1px solid #FDE68A",
          color: "#92400E",
          fontSize: "0.85rem",
          marginBottom: "24px",
        }}
      >
        <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
        <span>
          <strong>Extra Person Policy:</strong> Each Family Bedroom accommodates 4 guests in regular beds and can host{" "}
          <strong>1 extra person with mattress</strong> for just <strong>₹300/night</strong>. Double bedrooms accommodate 2 guests.
        </span>
      </div>

      {/* Recommendation Results */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
            Recommended Options for <strong>{guestsCount} Guests</strong> ({numNights} night{numNights > 1 ? "s" : ""})
          </h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {availableRooms.length} of 4 rooms available for your dates
          </span>
        </div>

        {/* Case 1: 15+ Guests (Exceeds 14 Max Capacity) */}
        {isGroupOverCapacity ? (
          <div
            style={{
              padding: "24px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-secondary)",
              border: "2px dashed var(--primary)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(194, 65, 12, 0.1)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Home size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.3rem", marginBottom: "6px" }}>
                Hosting Large Groups ({guestsCount}+ Guests)
              </h4>
              <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto", fontSize: "0.95rem" }}>
                Agrawal House can host up to <strong>14 guests</strong> across our 4 private bedrooms. For your group of {guestsCount} guests,
                we can book our entire homestay for you, plus arrange trusted partner rooms right next door through our concierge!
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
              <button
                onClick={handleLargeGroupWhatsApp}
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  backgroundColor: "#22C55E",
                  color: "#FFFFFF",
                  border: "none",
                }}
              >
                <MessageCircle size={18} /> Chat with Host on WhatsApp for Group Booking
              </button>
              <Link href="/enquiry" className="btn btn-secondary" style={{ padding: "12px 24px" }}>
                Send Enquiry Form
              </Link>
            </div>
          </div>
        ) : combos.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              backgroundColor: "#FEF2F2",
              borderRadius: "var(--radius-md)",
              border: "1px solid #FECACA",
              color: "#991B1B",
            }}
          >
            <AlertCircle size={28} style={{ margin: "0 auto 8px auto" }} />
            <h4 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>No single combination available for these dates</h4>
            <p style={{ fontSize: "0.9rem", color: "#7F1D1D" }}>
              Some of the rooms needed to host {guestsCount} guests are already reserved on your chosen dates. Try modifying your dates or message us on WhatsApp to find custom arrangements.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {combos.map((combo, idx) => (
              <div
                key={combo.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "var(--radius-md)",
                  border: idx === 0 ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                  boxShadow: idx === 0 ? "0 8px 24px rgba(194, 65, 12, 0.1)" : "var(--shadow-sm)",
                  padding: "24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px",
                  alignItems: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Badge */}
                {combo.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "16px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      backgroundColor:
                        combo.badge === "Best Value"
                          ? "#D1FAE5"
                          : combo.badge === "Whole Property Buyout"
                          ? "#FEF3C7"
                          : "var(--primary-light)",
                      color:
                        combo.badge === "Best Value"
                          ? "#065F46"
                          : combo.badge === "Whole Property Buyout"
                          ? "#92400E"
                          : "var(--primary)",
                    }}
                  >
                    {combo.badge}
                  </div>
                )}

                {/* Left Side: Combo Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <h4 style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px", paddingRight: "100px" }}>
                      {combo.title}
                    </h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                      {combo.description}
                    </p>
                  </div>

                  {/* Rooms Included Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {combo.rooms.map((r) => (
                      <span
                        key={r.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          padding: "6px 12px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <BedDouble size={14} style={{ color: "var(--primary)" }} />
                        {r.name}
                      </span>
                    ))}
                  </div>

                  {/* Amenities Highlights */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {combo.amenitiesSummary.map((amenity, aIdx) => (
                      <span key={aIdx} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={13} style={{ color: "#16A34A" }} /> {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Side: Pricing & Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: "12px",
                    borderLeft: "1px solid var(--border-color)",
                    paddingLeft: "24px",
                  }}
                  className="combo-price-action-box"
                >
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Total for {numNights} night{numNights > 1 ? "s" : ""}</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--primary)" }}>
                      ₹{combo.totalForStay}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      (₹{combo.nightlyTotal} / night)
                    </div>
                    {combo.extraGuestsCount > 0 && (
                      <div style={{ fontSize: "0.75rem", color: "#B45309", marginTop: "2px" }}>
                        Includes +₹{combo.nightlyExtraPersonCharge * numNights} for extra bedding
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", width: "100%", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleWhatsAppCombo(combo)}
                      className="btn"
                      style={{
                        padding: "10px 18px",
                        fontSize: "0.85rem",
                        backgroundColor: "#22C55E",
                        color: "#FFFFFF",
                        border: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "600",
                        boxShadow: "0 2px 8px rgba(34, 197, 94, 0.25)",
                      }}
                    >
                      <MessageCircle size={15} /> Book Combo via WhatsApp
                    </button>
                    {combo.rooms.length === 1 && (
                      <Link
                        href={`/rooms/${combo.rooms[0].id}`}
                        className="btn btn-secondary"
                        style={{ padding: "10px 14px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        View Room <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
