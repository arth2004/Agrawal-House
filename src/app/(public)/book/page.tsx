"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { Room, Booking } from "@/lib/types";
import {
  Calendar,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Tag,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import WhatsAppBookButton from "@/components/WhatsAppBookButton";
import HeritageLoader from "@/components/HeritageLoader";

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get search params
  const roomId = searchParams.get("room_id") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guestsCount = Number(searchParams.get("guests") || "1");

  // Room details state
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [priceBreakdown, setPriceBreakdown] = useState<{ date: string; price: number; rule?: any }[]>([]);
  const [dynamicTotal, setDynamicTotal] = useState<number>(0);

  // Form states
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<"at_property">("at_property");

  // Booking outcome
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  // Fetch room details
  useEffect(() => {
    if (!roomId) {
      router.push("/rooms");
      return;
    }

    const fetchRoomDetails = async () => {
      try {
        const data = await db.getRoom(roomId);
        if (data) {
          setRoom(data);
        } else {
          router.push("/rooms");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, router]);

  // Calculate nights
  const numNights = React.useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  // Calculate dynamic pricing
  React.useEffect(() => {
    const calculatePrice = async () => {
      if (!room || !checkIn || !checkOut || numNights === 0) {
        setPriceBreakdown([]);
        setDynamicTotal(0);
        return;
      }
      try {
        const result = await db.calculateTotalPrice(room.id, checkIn, checkOut, room.base_price);
        setPriceBreakdown(result.breakdown);
        setDynamicTotal(result.total);
      } catch (err) {
        console.error("Failed to calculate dynamic price", err);
        // Fallback to base price
        setPriceBreakdown([]);
        setDynamicTotal(room.base_price * numNights);
      }
    };
    calculatePrice();
  }, [room, checkIn, checkOut, numNights]);

  const isFamilyRoom = room ? (room.name.toLowerCase().includes("family") || room.max_guests >= 4) : false;
  const hasExtraGuest = isFamilyRoom && guestsCount === 5;
  const extraGuestChargeTotal = hasExtraGuest ? 300 * numNights : 0;
  const standardRoomTotal = room ? numNights * room.base_price : 0;
  const baseRoomTotal = dynamicTotal || standardRoomTotal;
  const priceDiff = baseRoomTotal - standardRoomTotal;
  const hasDynamicRule = Boolean(priceBreakdown.some((b) => b.rule));
  const isDiscount = priceDiff < 0;
  const isSurcharge = priceDiff > 0;
  const totalPrice = baseRoomTotal + extraGuestChargeTotal;

  const appliedRuleNames = priceBreakdown
    .filter((b) => b.rule)
    .map((b) => b.rule?.name)
    .filter((name, idx, self) => name && self.indexOf(name) === idx)
    .join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !checkIn || !checkOut) return;

    if (!guestName || !guestPhone || !guestEmail) {
      setError("Please fill in Name, Phone, and Email details.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const finalNotes = hasExtraGuest
      ? (notes ? `${notes} | [Extra 5th guest + mattress requested @ ₹300/night]` : "[Extra 5th guest + mattress requested @ ₹300/night]")
      : notes;

    try {
      const result = await db.createBooking({
        room_id: roomId,
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_email: guestEmail,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guestsCount,
        payment_method: paymentMethod,
        amount_total: totalPrice,
        notes: finalNotes,
      });

      setBookingSuccess(result);

      // Send booking notification emails (don't block UI)
      fetch('/api/send-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          room_name: room?.name || 'Room',
          check_in: checkIn,
          check_out: checkOut,
          num_guests: guestsCount,
          amount_total: totalPrice,
          status: result.status,
          notes: notes,
        }),
      }).catch((emailError) => {
        console.error('Failed to send booking email:', emailError);
        // Don't throw - booking is already saved
      });
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during booking. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <HeritageLoader fullScreen={false} subtitle="Loading your reservation details..." />;
  }

  if (bookingSuccess) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          padding: "40px",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-md)",
          textAlign: "center",
        }}
      >
        <CheckCircle2
          size={64}
          style={{
            color: "var(--secondary)",
            marginBottom: "24px",
            display: "inline-block",
          }}
        />
        <h2 style={{ fontSize: "2.2rem", marginBottom: "8px" }}>
          Stay Reserved!
        </h2>
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            display: "block",
            marginBottom: "24px",
          }}
        >
          Booking Ref: {bookingSuccess.id}
        </span>

        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            textAlign: "left",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <p>
            <strong>Guest:</strong> {bookingSuccess.guest_name}
          </p>
          <p>
            <strong>Room:</strong> {room?.name}
          </p>
          <p>
            <strong>Check-In:</strong> {bookingSuccess.check_in}
          </p>
          <p>
            <strong>Check-Out:</strong> {bookingSuccess.check_out}
          </p>
          <p>
            <strong>Nights:</strong> {numNights}
          </p>
          <p>
            <strong>Total Price:</strong> ₹{bookingSuccess.amount_total}
          </p>
          <p>
            <strong>Booking Status:</strong>{" "}
            <span
              style={{
                textTransform: "uppercase",
                fontWeight: "700",
                color:
                  bookingSuccess.status === "confirmed"
                    ? "var(--secondary)"
                    : "var(--accent)",
                fontSize: "0.9rem",
              }}
            >
              {bookingSuccess.status}
            </span>
          </p>
        </div>

        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            fontSize: "0.95rem",
          }}
        >
          {bookingSuccess.status === "confirmed"
            ? "Your booking is instantly confirmed! A summary has been registered, and we look forward to hosting you."
            : "Your request has been sent to the property owner for review. We will contact you via phone or email to confirm."}
        </p>

        <button
          onClick={() => router.push("/")}
          className="btn btn-primary"
          style={{ marginTop: "32px", padding: "12px 32px" }}
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "56px",
        alignItems: "start",
      }}
      className="checkout-grid"
    >
      {/* Left Column: Guest Form */}
      <div
        className="card"
        style={{
          padding: "40px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", marginBottom: "24px" }}>
          Guest Details
        </h2>

        {error && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#FEF2F2",
              color: "#991B1B",
              fontSize: "0.85rem",
              borderRadius: "var(--radius-sm)",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Guest Name */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              <User size={14} style={{ color: "var(--primary)" }} /> FULL NAME
            </label>
            <input
              type="text"
              placeholder="e.g. Amit Agrawal"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                outline: "none",
              }}
            />
          </div>

          {/* Guest Phone */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              <Phone size={14} style={{ color: "var(--primary)" }} /> PHONE
              NUMBER
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                outline: "none",
              }}
            />
          </div>

          {/* Guest Email */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              <Mail size={14} style={{ color: "var(--primary)" }} /> EMAIL
              ADDRESS
            </label>
            <input
              type="email"
              placeholder="e.g. amit@domain.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                outline: "none",
              }}
            />
          </div>

          {/* Special Requests */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              <FileText size={14} style={{ color: "var(--primary)" }} /> SPECIAL
              REQUESTS
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Early check-in request, dietary restrictions, airport pickup request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          {/* Payment Option */}
          <div
            style={{
              borderTop: "1px solid var(--border-color)",
              paddingTop: "20px",
              marginTop: "8px",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              SELECT PAYMENT OPTION
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--primary)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                id="at_property"
                checked={paymentMethod === "at_property"}
                onChange={() => setPaymentMethod("at_property")}
                style={{ accentColor: "var(--primary)" }}
              />
              <label
                htmlFor="at_property"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                  Pay at Property
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginTop: "2px",
                  }}
                >
                  Zero booking deposit. Pay during check-out at property.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", marginTop: "12px" }}
          >
            {isSubmitting
              ? "Processing Booking..."
              : "Complete Booking Request"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "8px 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
          </div>

          <WhatsAppBookButton
            details={{
              roomName: room?.name,
              checkIn,
              checkOut,
              guests: guestsCount,
              nights: numNights,
              totalPrice,
              guestName: guestName || undefined,
              guestPhone: guestPhone || undefined,
              guestEmail: guestEmail || undefined,
              notes: notes || undefined,
            }}
            variant="primary"
          />
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textAlign: "center",
              lineHeight: "1.5",
            }}
          >
            Opens WhatsApp with your booking details pre-filled. Our team will confirm your stay.
          </p>
        </form>
      </div>

      {/* Right Column: Summary */}
      <div
        className="glassmorphism"
        style={{
          padding: "32px",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-color)",
          position: "sticky",
          top: "110px",
        }}
      >
        <h3
          style={{
            fontSize: "1.4rem",
            marginBottom: "20px",
            fontFamily: "var(--font-serif)",
          }}
        >
          Booking Summary
        </h3>

        {room && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Room mini details */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "90px",
                  height: "70px",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={room.photos[0] || "/images/room_mango_suite.jpg"}
                  alt={room.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                  {room.name}
                </h4>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
                  }}
                >
                  <Users size={12} /> {guestsCount} Guest
                  {guestsCount > 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* Stay details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "20px",
                fontSize: "0.95rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Calendar size={14} /> Check-In
                </span>
                <strong>{checkIn}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Calendar size={14} /> Check-Out
                </span>
                <strong>{checkOut}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Duration</span>
                <strong>
                  {numNights} night{numNights > 1 ? "s" : ""}
                </strong>
              </div>
            </div>

              {/* Calculations & Price Breakdown */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Standard Base Rate */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.92rem",
                  color: hasDynamicRule ? "var(--text-secondary)" : "inherit",
                }}
              >
                <span>
                  Base Rate (₹{room.base_price} × {numNights} night{numNights > 1 ? "s" : ""})
                </span>
                <span
                  style={{
                    textDecoration: hasDynamicRule && isDiscount ? "line-through" : "none",
                  }}
                >
                  ₹{standardRoomTotal}
                </span>
              </div>

              {/* Night-by-Night Breakdown (when dynamic rules apply or multi-night) */}
              {priceBreakdown.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#FBF9F5",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Night-by-Night Breakdown
                  </span>
                  {priceBreakdown.map((item, idx) => {
                    const nightHasRule = Boolean(item.rule);
                    const nightMod = item.rule?.price_modifier || 1;
                    const nightDiscount = nightMod < 1;
                    const nightSurcharge = nightMod > 1;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: "500" }}>
                            {new Date(item.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          {item.rule && (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "600",
                                backgroundColor: nightSurcharge ? "#FEF3C7" : "#DCFCE7",
                                color: nightSurcharge ? "#92400E" : "#15803D",
                              }}
                            >
                              {item.rule.name} (
                              {nightSurcharge
                                ? `+${Math.round((nightMod - 1) * 100)}%`
                                : `-${Math.round((1 - nightMod) * 100)}%`}
                              )
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {nightHasRule && (
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "var(--text-muted)",
                                fontSize: "0.78rem",
                              }}
                            >
                              ₹{room.base_price}
                            </span>
                          )}
                          <span
                            style={{
                              fontWeight: "600",
                              color: nightDiscount
                                ? "#15803D"
                                : nightSurcharge
                                ? "#92400E"
                                : "inherit",
                            }}
                          >
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Discount Line Item */}
              {hasDynamicRule && isDiscount && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.88rem",
                    color: "#15803D",
                    fontWeight: "600",
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    padding: "8px 10px",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Tag size={13} /> {appliedRuleNames || "Promotional Discount"}
                  </span>
                  <span>-₹{Math.abs(priceDiff)}</span>
                </div>
              )}

              {/* Dynamic Surcharge Line Item */}
              {hasDynamicRule && isSurcharge && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.88rem",
                    color: "#92400E",
                    fontWeight: "600",
                    backgroundColor: "#FEF3C7",
                    border: "1px solid #FDE68A",
                    padding: "8px 10px",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <TrendingUp size={13} /> {appliedRuleNames || "Seasonal Surcharge"}
                  </span>
                  <span>+₹{priceDiff}</span>
                </div>
              )}

              {/* Room Charges Subtotal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.95rem",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "8px",
                }}
              >
                <span>Total Room Charges</span>
                <span style={{ fontWeight: "600" }}>₹{baseRoomTotal}</span>
              </div>

              {/* Extra 5th Guest Charge (if applicable) */}
              {hasExtraGuest && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.88rem",
                    color: "#92400E",
                    backgroundColor: "#FEF3C7",
                    padding: "8px 10px",
                    borderRadius: "4px",
                  }}
                >
                  <span>Extra 5th Guest (+Mattress)</span>
                  <span style={{ fontWeight: "600" }}>
                    +₹{extraGuestChargeTotal} (₹300 x {numNights}n)
                  </span>
                </div>
              )}

              {/* Grand Total Cost */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  borderTop: "1px dashed var(--border-color)",
                  paddingTop: "16px",
                  marginTop: "6px",
                }}
              >
                <div>
                  <span>Total Cost</span>
                  {hasDynamicRule && isDiscount && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "#15803D",
                        fontWeight: "600",
                      }}
                    >
                      (Includes ₹{Math.abs(priceDiff)} savings)
                    </span>
                  )}
                </div>
                <span style={{ color: "var(--primary)", fontSize: "1.45rem", fontWeight: "800" }}>
                  ₹{totalPrice}
                </span>
              </div>

              {/* Savings Announcement Banner */}
              {hasDynamicRule && isDiscount && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#DCFCE7",
                    color: "#15803D",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    marginTop: "4px",
                  }}
                >
                  <Sparkles size={14} style={{ flexShrink: 0 }} />
                  <span>Great deal! You save ₹{Math.abs(priceDiff)} on this booking.</span>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                padding: "12px",
                backgroundColor: "var(--secondary-light)",
                borderRadius: "var(--radius-sm)",
                color: "var(--secondary-hover)",
                fontSize: "0.8rem",
                marginTop: "12px",
              }}
            >
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>
                We protect your stay details. No payment is required right now.
              </span>
            </div>

            <div style={{ marginTop: "20px" }}>
              <WhatsAppBookButton
                details={{
                  roomName: room.name,
                  checkIn,
                  checkOut,
                  guests: guestsCount,
                  nights: numNights,
                  totalPrice,
                  guestName: guestName || undefined,
                  guestPhone: guestPhone || undefined,
                  guestEmail: guestEmail || undefined,
                  notes: notes || undefined,
                }}
                label="Book via WhatsApp"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <div
      className="container animate-fade-in"
      style={{ padding: "40px 24px 80px 24px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Book Your Stay</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          Please complete your reservation details below.
        </p>
      </div>

      <Suspense
        fallback={<HeritageLoader fullScreen={false} subtitle="Loading your reservation details..." />}
      >
        <BookingForm />
      </Suspense>

      <style jsx global>{`
        @media (min-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1.4fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
