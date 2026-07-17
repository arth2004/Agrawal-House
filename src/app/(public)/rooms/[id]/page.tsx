import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import BookingWidget from "@/components/BookingWidget";
import { ArrowLeft, Check, Sparkles, Shield } from "lucide-react";

export const revalidate = 0; // Fresh room data on request

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const room = await db.getRoom(id);

  if (!room) {
    notFound();
  }

  // Fetch blocked dates and active bookings for this room
  const blockedDates = await db.getBlockedDates(id);
  const allBookings = await db.getBookings();
  const roomBookings = allBookings.filter((b) => b.room_id === id);

  return (
    <div
      className="container animate-fade-in"
      style={{ padding: "40px 24px 80px 24px" }}
    >
      {/* Back Button */}
      <div style={{ marginBottom: "32px" }}>
        <Link
          href="/rooms"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-secondary)",
            fontWeight: "500",
          }}
        >
          <ArrowLeft size={16} /> Back to Rooms List
        </Link>
      </div>

      {/* Grid Layout: Left Details, Right Widget */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "56px",
          alignItems: "start",
        }}
        className="detail-grid"
      >
        {/* Left Side: Images & Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {/* Main Photo Gallery */}
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "var(--shadow-md)",
              height: "400px",
            }}
            className="detail-hero-img"
          >
            <img
              src={room.photos[0] || "/images/room_mango_suite.jpg"}
              alt={room.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Heading */}
          <div>
            <h1 style={{ fontSize: "2.8rem", marginBottom: "16px" }}>
              {room.name}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  fontWeight: "600",
                }}
              >
                ₹{room.base_price}{" "}
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontWeight: "400",
                    fontSize: "0.9rem",
                  }}
                >
                  / night
                </span>
              </span>
              <span
                style={{
                  height: "16px",
                  width: "1px",
                  backgroundColor: "var(--border-color)",
                  display: "none",
                }}
                className="divider-desktop"
              />
              <span
                style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}
              >
                Accommodates up to <strong>{room.max_guests} Guests</strong>
              </span>
            </div>
          </div>

          {/* Description */}
          <div
            style={{
              borderTop: "1px solid var(--border-color)",
              paddingTop: "32px",
            }}
          >
            <h3 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>
              About this Room
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.05rem",
                lineHeight: "1.8",
                whiteSpace: "pre-line",
              }}
            >
              {room.description}
            </p>
          </div>

          {/* Amenities */}
          <div
            style={{
              borderTop: "1px solid var(--border-color)",
              paddingTop: "32px",
            }}
          >
            <h3 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>
              What this stay offers
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {room.amenities.map((amenity) => (
                <div
                  key={amenity}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "4px",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                      borderRadius: "50%",
                    }}
                  >
                    <Check size={14} />
                  </div>
                  <span style={{ fontSize: "0.95rem" }}>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guesthouse guidelines */}
          <div
            style={{
              borderTop: "1px solid var(--border-color)",
              paddingTop: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3 style={{ fontSize: "1.4rem" }}>Stay Guidelines</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <Sparkles
                  size={20}
                  style={{
                    color: "var(--accent)",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                      fontWeight: "700",
                    }}
                  >
                    Warm Hospitality
                  </h4>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                    }}
                  >
                    Enjoy a comfortable stay with attentive hosts and a
                    welcoming homestay atmosphere.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <Shield
                  size={20}
                  style={{
                    color: "var(--secondary)",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                      fontWeight: "700",
                    }}
                  >
                    House Rules
                  </h4>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                    }}
                  >
                    Check-in: 10:00 AM | Check-out: 09:00 AM. Quiet hours from
                    10:00 PM to 7:00 AM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Booking Widget */}
        <div style={{ position: "relative" }}>
          <BookingWidget
            roomId={room.id}
            roomName={room.name}
            basePrice={room.base_price}
            maxGuests={room.max_guests}
            blockedDates={blockedDates}
            bookings={roomBookings}
          />
        </div>
      </div>
    </div>
  );
}
