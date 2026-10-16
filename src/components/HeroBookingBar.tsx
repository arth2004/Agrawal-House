"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Home, Search, MessageCircle } from "lucide-react";

export default function HeroBookingBar() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState("2");
  const [roomType, setRoomType] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&room=${roomType}`);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello Agrawal House, I am looking to book a stay:\n- Check-in: ${checkIn}\n- Check-out: ${checkOut}\n- Guests: ${guests}\n- Preference: ${roomType}\nPlease share availability and best rates.`
    );
    window.open(`https://wa.me/917415160134?text=${text}`, "_blank");
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(250, 246, 240, 0.96)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 24px",
        boxShadow: "0 20px 40px rgba(40, 28, 16, 0.18)",
        border: "1px solid rgba(226, 215, 199, 0.9)",
        width: "100%",
        maxWidth: "1060px",
        margin: "0 auto",
      }}
    >
      <form
        onSubmit={handleSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          alignItems: "center",
        }}
      >
        {/* Check In */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            htmlFor="hero-check-in"
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Calendar size={13} style={{ color: "var(--primary)" }} /> Check-In
          </label>
          <input
            id="hero-check-in"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Check Out */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            htmlFor="hero-check-out"
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Calendar size={13} style={{ color: "var(--primary)" }} /> Check-Out
          </label>
          <input
            id="hero-check-out"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>

        {/* Guests */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            htmlFor="hero-guests"
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Users size={13} style={{ color: "var(--primary)" }} /> Guests
          </label>
          <select
            id="hero-guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="1">1 Adult</option>
            <option value="2">2 Adults (Couple)</option>
            <option value="3">3 Guests (Small Family)</option>
            <option value="4">4 Guests (Family Bedroom)</option>
            <option value="5">5 Guests (Family Suite + Extra Bed)</option>
            <option value="6">6 Guests (Group / 2 Rooms)</option>
            <option value="8">8 Guests (2 Family Rooms)</option>
            <option value="10">10 Guests (Large Family Group)</option>
            <option value="12">12-14 Guests (Entire Homestay Buyout)</option>
            <option value="15">15+ Guests (Full House + Concierge)</option>
          </select>
        </div>

        {/* Room Type */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label
            htmlFor="hero-room-type"
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Home size={13} style={{ color: "var(--primary)" }} /> Room Type
          </label>
          <select
            id="hero-room-type"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "var(--text-primary)",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">All Room Types</option>
            <option value="double">Double Bedroom (2 Guests)</option>
            <option value="family">Family Bedroom (4 Guests)</option>
          </select>
        </div>

        {/* Buttons Action Group */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "100%",
            paddingTop: "18px",
          }}
        >
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: "12px 18px",
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              height: "44px",
              boxShadow: "0 4px 14px rgba(194, 65, 12, 0.35)",
            }}
          >
            <Search size={15} /> Check Rates
          </button>
          <button
            type="button"
            onClick={handleWhatsAppDirect}
            title="Book directly via WhatsApp"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "#22C55E",
              color: "#FFFFFF",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.35)",
              transition: "transform 0.2s ease",
            }}
            className="hover:scale-105"
          >
            <MessageCircle size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
