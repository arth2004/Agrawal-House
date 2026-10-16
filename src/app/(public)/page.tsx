import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import ServiceCard from "@/components/ServiceCard";
import HeroBookingBar from "@/components/HeroBookingBar";
import {
  Coffee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight,
  Award,
  Star,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Phone,
  Compass,
} from "lucide-react";

const TOURISM_CERT = {
  imageUrl: "/Cert_HMUJN2506940_20250801053615_Digi_page-0001.jpg",
  registrationNo: "HM/UJN/2025979",
  category: "Silver",
  validTill: "31 Jul 2028",
  scheme:
    "Madhya Pradesh Home Stay Establishment (Registration and Regulation) Scheme 2010 (revised 2018)",
  department: "Department of Tourism, Government of Madhya Pradesh",
} as const;

export const revalidate = 0; // Disable caching to ensure fresh DB state

export default async function HomePage() {
  const rooms = await db.getRooms();
  const services = await db.getServices();
  const activeRooms = rooms.filter((r) => r.status === "active").slice(0, 4);
  const activeServices = services
    .filter((service) => service.status === "active")
    .slice(0, 3);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 1. Cinematic Luxury Hero Section */}
      <section
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          backgroundImage:
            'linear-gradient(180deg, rgba(10, 8, 7, 0.82) 0%, rgba(18, 14, 12, 0.45) 40%, rgba(18, 14, 12, 0.85) 90%, #F8F5EE 100%), url("/images/hero_sunset.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
          marginTop: "0",
          paddingTop: "120px",
          paddingBottom: "72px",
        }}
      >
        <div
          className="container"
          style={{
            textAlign: "center",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Eyebrow Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(229, 192, 123, 0.15)",
              border: "1px solid rgba(229, 192, 123, 0.4)",
              color: "#E5C07B",
              fontSize: "0.82rem",
              fontWeight: "600",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              backdropFilter: "blur(8px)",
            }}
          >
            <Sparkles size={14} /> Welcome to Ujjain's Heritage Stay
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.6rem, 5.8vw, 4.8rem)",
              lineHeight: "1.12",
              color: "#FFFFFF",
              fontWeight: "700",
              maxWidth: "920px",
              margin: "0 auto",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            Experience Cozy Luxury &<br />
            Ancient Tradition
          </h1>

          {/* Hero Subtitle */}
          <p
            style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
              maxWidth: "680px",
              margin: "0 auto 12px auto",
              color: "rgba(250, 248, 245, 0.92)",
              lineHeight: "1.65",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
            }}
          >
            Situated in the sacred heart of Ujjain, Agrawal House combines modern
            comfort with warm traditional hospitality, just minutes from
            Mahakaleshwar Temple.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: "inline-flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: "32px",
            }}
          >
            <Link
              href="/rooms"
              className="btn btn-primary"
              style={{
                padding: "16px 36px",
                fontSize: "0.92rem",
                boxShadow: "0 6px 20px rgba(194, 65, 12, 0.4)",
              }}
            >
              <Calendar size={16} /> Reserve Your Stay
            </Link>
            <Link
              href="/about"
              className="btn btn-outline"
              style={{
                padding: "16px 32px",
                color: "#FFFFFF",
                borderColor: "rgba(255, 255, 255, 0.6)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(6px)",
              }}
            >
              Discover Our Story
            </Link>
          </div>

          {/* Integrated Interactive Booking Bar */}
          <div style={{ width: "100%", marginTop: "12px" }}>
            <HeroBookingBar />
          </div>

          {/* Trust Highlights Strip */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "24px",
              marginTop: "28px",
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "0.85rem",
              fontWeight: "500",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#E5C07B" }}>🕉️</span> 8-10 Mins to Mahakal Temple
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#E5C07B" }}>🏅</span> Govt. MP Tourism Certified
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#E5C07B" }}>⭐</span> 4.9/5 Google Rating (350+ Reviews)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#E5C07B" }}>🚗</span> Easy Vehicle Parking
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#E5C07B" }}>📶</span> High-Speed Wi-Fi & AC
            </span>
          </div>
        </div>
      </section>

      {/* 2. Intro Story Section */}
      <section style={{ padding: "88px 0" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "56px",
              alignItems: "center",
            }}
          >
          <div>
            <span
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontSize: "0.85rem",
              }}
            >
              Our Story & Heritage
            </span>

            <h2
              style={{
                fontSize: "clamp(2.2rem, 3.5vw, 2.9rem)",
                marginTop: "10px",
                marginBottom: "24px",
                lineHeight: "1.2",
                fontFamily: "var(--font-serif)",
              }}
            >
              Where spiritual peace meets the comfort of home
            </h2>

            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: "1.8",
                marginBottom: "20px",
                fontSize: "1.05rem",
              }}
            >
              Agrawal House was created to offer pilgrims and travelers a
              peaceful, comfortable stay in the heart of Ujjain. Located near
              the sacred Mahakaleshwar Jyotirlinga, our homestay combines modern
              amenities with the warmth of traditional Indian hospitality,
              ensuring every guest feels at home.
            </p>

            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: "1.8",
                marginBottom: "28px",
                fontSize: "1.05rem",
              }}
            >
              Surrounded by Ujjain&apos;s most revered shrines, guests can easily
              walk or take short e-rickshaw rides to Mahakal Lok, Harsiddhi
              Mata Temple, Ram Ghat, and Kaal Bhairav. Whether you&apos;re visiting
              for Bhasma Aarti दर्शन or a relaxing family getaway, Agrawal House
              provides a welcoming sanctuary.
            </p>

            {/* Feature Bullets */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                marginBottom: "32px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "500", fontSize: "0.95rem" }}>
                <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>Spotless, sanitized rooms</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "500", fontSize: "0.95rem" }}>
                <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>24×7 Hot water geysers</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "500", fontSize: "0.95rem" }}>
                <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>Personal temple guidance</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "500", fontSize: "0.95rem" }}>
                <CheckCircle2 size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>Quiet, safe residential area</span>
              </div>
            </div>

            <Link
              href="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--primary)",
                fontWeight: "600",
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Explore our background and heritage <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ position: "relative" }}>
            <img
              src="/images/Front New.jpeg"
              alt="Agrawal House Homestay facade"
              style={{
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                width: "100%",
                maxHeight: "520px",
                objectFit: "cover",
              }}
            />

            {/* Floating Trust Card */}
            <div
              className="glassmorphism hide-mobile-floating"
              style={{
                position: "absolute",
                bottom: "-24px",
                left: "-24px",
                padding: "24px",
                borderRadius: "var(--radius-md)",
                display: "none",
                maxWidth: "260px",
                border: "1px solid var(--border-color)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              }}
            >
              <Sparkles
                size={24}
                style={{ color: "var(--accent)", marginBottom: "8px" }}
              />
              <h4 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>
                Genuine Hospitality
              </h4>
              <p
                style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5" }}
              >
                Rated 4.9/5 by over 350+ pilgrim families from across India.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 3. Rooms & Accommodation Showcase */}
      <section className="sandstone-band" style={{ padding: "88px 0" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "48px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <span
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontSize: "0.85rem",
              }}
            >
              Accommodation
            </span>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                marginTop: "8px",
                lineHeight: "1.2",
                fontFamily: "var(--font-serif)",
              }}
            >
              Comfortable Rooms Designed For Rest
            </h2>
          </div>
          <Link
            href="/rooms"
            className="btn btn-outline"
            style={{ textTransform: "uppercase", fontSize: "0.85rem" }}
          >
            View All Rooms ({rooms.length}) <ArrowRight size={15} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {activeRooms.map((room) => (
            <div
              key={room.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-card)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "230px",
                  overflow: "hidden",
                  backgroundColor: "#1C1917",
                }}
              >
                <img
                  src={room.photos[0] || "/images/room_mango_suite.jpg"}
                  alt={room.name}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform var(--transition-slow)",
                  }}
                  className="room-card-img"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    left: "14px",
                    backgroundColor: "rgba(28, 25, 23, 0.85)",
                    backdropFilter: "blur(6px)",
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  ₹{room.base_price}{" "}
                  <span style={{ fontWeight: "400", fontSize: "0.8rem", color: "#E7E5E4" }}>
                    / night
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  gap: "12px",
                }}
              >
                <h3 style={{ fontSize: "1.35rem", fontWeight: "600" }}>{room.name}</h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.92rem",
                    lineHeight: "1.6",
                    flex: 1,
                  }}
                >
                  {room.description.length > 110
                    ? `${room.description.substring(0, 110)}...`
                    : room.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={15} style={{ color: "var(--primary)" }} />{" "}
                    {room.name.toLowerCase().includes("family") || room.max_guests >= 4
                      ? "4 Guests (+1 extra person @ ₹300/night)"
                      : `Max ${room.max_guests} guests`}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", marginTop: "8px" }}>
                  <Link
                    href={`/rooms/${room.id}`}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "10px 18px", fontSize: "0.85rem" }}
                  >
                    View Room & Photos
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* 4. Spiritual Proximity & Ujjain Temple Distances */}
      <section className="heritage-dark-band" style={{ padding: "96px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <span
              style={{
                color: "#E5C07B",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontSize: "0.85rem",
              }}
            >
              Location Advantage
            </span>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                marginTop: "8px",
                fontFamily: "var(--font-serif)",
                color: "#FAF8F5",
              }}
            >
              Stay Close to Sacred Ujjain Landmarks
            </h2>
            <p
              style={{
                color: "rgba(250, 248, 245, 0.78)",
                maxWidth: "600px",
                margin: "12px auto 0 auto",
                fontSize: "1rem",
              }}
            >
              Located in Patni Bazar, Agrawal House puts you within minutes of
              every major pilgrimage point in the holy city.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                padding: "28px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 192, 123, 0.22)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "2.2rem" }}>🕉️</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#FFFFFF" }}>Mahakaleshwar Temple</h3>
              <span style={{ color: "#E5C07B", fontWeight: "700", fontSize: "1.25rem" }}>
                8 - 10 Mins
              </span>
              <p style={{ fontSize: "0.85rem", color: "rgba(250, 248, 245, 0.72)" }}>
                Quick auto or e-rickshaw ride for Bhasma Aarti & Darshan
              </p>
            </div>

            <div
              style={{
                padding: "28px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 192, 123, 0.22)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "2.2rem" }}>✨</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#FFFFFF" }}>Mahakal Lok Corridor</h3>
              <span style={{ color: "#E5C07B", fontWeight: "700", fontSize: "1.25rem" }}>
                8 Mins
              </span>
              <p style={{ fontSize: "0.85rem", color: "rgba(250, 248, 245, 0.72)" }}>
                Spectacular spiritual heritage corridor & light show
              </p>
            </div>

            <div
              style={{
                padding: "28px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 192, 123, 0.22)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "2.2rem" }}>🌺</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#FFFFFF" }}>Harsiddhi Mata Mandir</h3>
              <span style={{ color: "#E5C07B", fontWeight: "700", fontSize: "1.25rem" }}>
                5 - 7 Mins
              </span>
              <p style={{ fontSize: "0.85rem", color: "rgba(250, 248, 245, 0.72)" }}>
                Revered 51 Shaktipeeth with twin deepstambhs
              </p>
            </div>

            <div
              style={{
                padding: "28px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 192, 123, 0.22)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "2.2rem" }}>🌊</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#FFFFFF" }}>Ram Ghat (Shipra)</h3>
              <span style={{ color: "#E5C07B", fontWeight: "700", fontSize: "1.25rem" }}>
                6 Mins
              </span>
              <p style={{ fontSize: "0.85rem", color: "rgba(250, 248, 245, 0.72)" }}>
                Holy snan ghat and evening Shipra Aarti
              </p>
            </div>

            <div
              style={{
                padding: "28px 20px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(229, 192, 123, 0.22)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "2.2rem" }}>🚉</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: "#FFFFFF" }}>Railway Station</h3>
              <span style={{ color: "#E5C07B", fontWeight: "700", fontSize: "1.25rem" }}>
                10 - 12 Mins
              </span>
              <p style={{ fontSize: "0.85rem", color: "rgba(250, 248, 245, 0.72)" }}>
                Convenient transit connectivity across the city
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <a
              href="https://maps.app.goo.gl/k58ihqAVRoWvPEL88"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                padding: "14px 34px",
                border: "1px solid rgba(229, 192, 123, 0.35)",
                boxShadow: "0 4px 18px rgba(194, 65, 12, 0.4)",
              }}
            >
              <Compass size={16} /> Open Location in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* 5. Services Section */}
      <section style={{ padding: "92px 0" }}>
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  style={{
                    color: "var(--primary)",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontSize: "0.85rem",
                  }}
                >
                  Our Offerings
                </span>
                <h2
                  style={{
                    fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                    marginTop: "8px",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  Services Tailored for Pilgrims
                </h2>
              </div>
              <Link href="/services" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
                View All Services <ArrowRight size={16} />
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "28px",
              }}
            >
              {activeServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. MP Tourism Certification Section */}
      <section style={{ padding: "0 0 92px 0" }}>
        <div className="container">
          <div
            className="card"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "40px",
              alignItems: "center",
              padding: "44px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)",
              overflow: "hidden",
              position: "relative",
            }}
          >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background:
                "linear-gradient(90deg, var(--primary), var(--accent), var(--secondary))",
            }}
          />

          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              <Award size={16} />
              Government Certified
            </div>

            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.3rem)",
                marginBottom: "12px",
                lineHeight: "1.25",
                fontFamily: "var(--font-serif)",
              }}
            >
              Registered with Madhya Pradesh Tourism
            </h2>

            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: "1.7",
                fontSize: "1rem",
                marginBottom: "24px",
              }}
            >
              Agrawal House is an officially certified homestay registered under the{" "}
              <strong>{TOURISM_CERT.scheme}</strong>, administered by the{" "}
              {TOURISM_CERT.department}. Enjoy complete peace of mind knowing your
              stay meets state tourism quality, hygiene, and security standards.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "6px",
                  }}
                >
                  Category
                </span>
                <strong style={{ fontSize: "1.1rem", color: "var(--primary)" }}>
                  {TOURISM_CERT.category}
                </strong>
              </div>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "6px",
                  }}
                >
                  Registration No.
                </span>
                <strong style={{ fontSize: "1rem" }}>
                  {TOURISM_CERT.registrationNo}
                </strong>
              </div>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "6px",
                  }}
                >
                  Valid Till
                </span>
                <strong style={{ fontSize: "1rem" }}>
                  {TOURISM_CERT.validTill}
                </strong>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={TOURISM_CERT.imageUrl}
              alt="Madhya Pradesh Tourism Homestay Registration Certificate — Agrawal House"
              style={{
                width: "100%",
                maxWidth: "400px",
                height: "auto",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-lg)",
              }}
            />
          </div>
        </div>
        </div>
      </section>

      {/* 7. Google Reviews Section */}
      <section className="sandstone-band" style={{ padding: "92px 0 96px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontSize: "0.85rem",
            }}
          >
            Guest Experiences
          </span>
          <h2
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
              marginTop: "8px",
              marginBottom: "16px",
              fontFamily: "var(--font-serif)",
            }}
          >
            Loved by Pilgrims & Families
          </h2>

          {/* Google Business Rating Card */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "var(--bg-secondary)",
              padding: "10px 22px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-color)",
            }}
          >
            <span style={{ fontWeight: "700", fontSize: "1.05rem" }}>
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC05" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </span>
            <span style={{ color: "var(--text-muted)" }}>|</span>
            <div style={{ display: "flex", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} fill="#FBBC05" color="#FBBC05" />
              ))}
            </div>
            <strong style={{ color: "var(--text-primary)" }}>4.9 / 5</strong>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              (350+ reviews)
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {/* Review 1 */}
          <div
            className="card"
            style={{
              padding: "32px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#E0F2FE",
                  color: "#0369A1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}
              >
                S
              </div>
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                  Sharayu Ayyangar
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                      backgroundColor: "var(--primary-light)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }}
                  >
                    Local Guide
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    2 weeks ago
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill="#FBBC05" color="#FBBC05" />
              ))}
            </div>

            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.65",
                color: "var(--text-secondary)",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              &ldquo;Had a great stay at Agrawal Homestay. The rooms were clean,
              comfortable, and well-maintained with all the necessary amenities.
              The location is excellent. Mahakal Mandir, Harsiddhi Mata Mandir,
              and Kshipra Ghat are all nearby. The hosts were extremely kind and
              helpful, guiding us throughout our trip. Highly recommended!&rdquo;
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#16A34A",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#16A34A",
                }}
              />
              Verified Google Review
            </div>
          </div>

          {/* Review 2 */}
          <div
            className="card"
            style={{
              padding: "32px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#FEF3C7",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}
              >
                S
              </div>
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                  Siddhant Kakade
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    1 month ago
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill="#FBBC05" color="#FBBC05" />
              ))}
            </div>

            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.65",
                color: "var(--text-secondary)",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              &ldquo;My experience at this homestay in Ujjain was truly very good. What I
              liked the most was the homely feeling of this place. It never felt like I
              was staying in a hotel—it genuinely felt like I was at my own home,
              which made the experience even more relaxing and peaceful.&rdquo;
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#16A34A",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#16A34A",
                }}
              />
              Verified Google Review
            </div>
          </div>

          {/* Review 3 */}
          <div
            className="card"
            style={{
              padding: "32px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#DCFCE7",
                  color: "#15803D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1.1rem",
                }}
              >
                A
              </div>
              <div>
                <h4 style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                  Aman Thakur
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--primary)",
                      backgroundColor: "var(--primary-light)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontWeight: "600",
                    }}
                  >
                    Local Guide
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    3 weeks ago
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill="#FBBC05" color="#FBBC05" />
              ))}
            </div>

            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.65",
                color: "var(--text-secondary)",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              &ldquo;Staying here made my trip to Ujjain so much easier. The room was neat
              and clean, with both AC and geyser working perfectly. What really made the
              stay special was the owner&apos;s hospitality. He was incredibly helpful
              with our trip planning and let us keep our luggage safely after checkout.&rdquo;
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#16A34A",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#16A34A",
                }}
              />
              Verified Google Review
            </div>
          </div>
        </div>

        {/* View on Google Maps Link */}
        <div style={{ textAlign: "center" }}>
          <a
            href="https://maps.app.goo.gl/k58ihqAVRoWvPEL88"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Read All Reviews on Google Maps <ExternalLink size={16} />
          </a>
        </div>
        </div>
      </section>
    </div>
  );
}
