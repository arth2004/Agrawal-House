import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
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
  const activeRooms = rooms.filter((r) => r.status === "active").slice(0, 3);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "80px",
        paddingBottom: "80px",
      }}
    >
      {/* 1. Hero Section */}
      <section
        style={{
          position: "relative",
          height: "85vh",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          backgroundImage:
            'linear-gradient(rgba(28, 25, 23, 0.45), rgba(28, 25, 23, 0.65)), url("/images/hero_sunset.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginTop: "-90px", // Pull up behind the header
        }}
      >
        <div className="container" style={{ textAlign: "center", zIndex: 10 }}>
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.4em",
              fontSize: "0.85rem",
              color: "var(--primary-light)",
              display: "inline-block",
              marginBottom: "16px",
              fontWeight: "500",
              animation: "fadeIn 0.8s ease",
            }}
          >
            Welcome to Ujjain's Heritage Stay
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: "1.15",
              marginBottom: "24px",
              color: "#FFFFFF",
              fontWeight: "800",
            }}
          >
            Experience Cozy Luxury &<br />
            Ancient Tradition
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              maxWidth: "650px",
              margin: "0 auto 40px auto",
              color: "#E7E5E4",
              lineHeight: "1.6",
            }}
          >
            Situated in the heart of Ujjain, Agrawal House combines modern
            comfort with traditional hospitality, offering guests convenient
            access to the city's spiritual landmarks and cultural attractions.
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/rooms"
              className="btn btn-primary"
              style={{ padding: "16px 36px" }}
            >
              Book Your Stay
            </Link>
            <Link
              href="/about"
              className="btn btn-outline"
              style={{
                padding: "16px 36px",
                color: "#FFFFFF",
                borderColor: "#FFFFFF",
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Intro Section */}
      <section className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.85rem",
              }}
            >
              Our Story
            </span>

            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "8px",
                marginBottom: "24px",
                lineHeight: "1.2",
              }}
            >
              Experience devotion, comfort, and authentic Ujjain hospitality
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
              Surrounded by some of Ujjain's most revered temples and spiritual
              landmarks, guests can easily explore Mahakal Lok, Harsiddhi
              Temple, Ram Ghat, Kaal Bhairav Temple, and other sacred sites.
              Whether you're visiting for दर्शन, religious ceremonies, or a
              peaceful getaway, Agrawal House provides a welcoming base for your
              spiritual journey.
            </p>
            <Link
              href="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--primary)",
                fontWeight: "600",
              }}
            >
              Explore the history of Agrawal House <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ position: "relative" }}>
            <img
              src="/images/Mahakal.png"
              alt="Mahakal Temple view"
              style={{
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                width: "100%",
                maxHeight: "580px",
                objectFit: "cover",
              }}
            />
            <div
              className="glassmorphism hide-mobile-floating"
              style={{
                position: "absolute",
                bottom: "-24px",
                left: "-24px",
                padding: "24px",
                borderRadius: "var(--radius-md)",
                display: "none", // Shown on md screens
                maxWidth: "240px",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-md)",
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
                style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
              >
                Rated 4.9/5 by over 350 guests from across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MP Tourism Certification */}
      <section className="container">
        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "40px",
            alignItems: "center",
            padding: "40px",
            backgroundColor: "#FFFFFF",
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
                fontSize: "clamp(1.8rem, 4vw, 2.2rem)",
                marginBottom: "12px",
                lineHeight: "1.25",
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
              Agrawal House is officially registered under the{" "}
              {TOURISM_CERT.scheme}, administered by the{" "}
              {TOURISM_CERT.department}.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
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
                maxWidth: "420px",
                height: "auto",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-lg)",
              }}
            />
          </div>
        </div>
      </section>

      {/* 3. Highlights Section */}
      <section
        style={{ backgroundColor: "var(--bg-secondary)", padding: "80px 0" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.85rem",
              }}
            >
              Amenities & Atmosphere
            </span>
            <h2 style={{ fontSize: "2.5rem", marginTop: "8px" }}>
              Why You'll Love Staying With Us
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "32px",
            }}
          >
            <div
              className="card"
              style={{
                padding: "32px",
                backgroundColor: "#FFFFFF",
                border: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "12px",
                  backgroundColor: "var(--primary-light)",
                  borderRadius: "50%",
                  color: "var(--primary)",
                  marginBottom: "20px",
                }}
              >
                <Coffee size={24} />
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px" }}>
                Local Dining Nearby
              </h3>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Enjoy Ujjain's local flavors with popular restaurants, cafés,
                and eateries just minutes from our homestay.
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: "32px",
                backgroundColor: "#FFFFFF",
                border: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "12px",
                  backgroundColor: "var(--primary-light)",
                  borderRadius: "50%",
                  color: "var(--primary)",
                  marginBottom: "20px",
                }}
              >
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px" }}>
                Sacred Temples
              </h3>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Discover Ujjain's spiritual heritage with iconic temples and
                sacred landmarks just minutes from your stay.
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: "32px",
                backgroundColor: "#FFFFFF",
                border: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "12px",
                  backgroundColor: "var(--primary-light)",
                  borderRadius: "50%",
                  color: "var(--primary)",
                  marginBottom: "20px",
                }}
              >
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px" }}>
                Prime Location
              </h3>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Stay close to railway stations, local markets, restaurants, and
                major city attractions with excellent connectivity across
                Ujjain.
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: "32px",
                backgroundColor: "#FFFFFF",
                border: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  padding: "12px",
                  backgroundColor: "var(--primary-light)",
                  borderRadius: "50%",
                  color: "var(--primary)",
                  marginBottom: "20px",
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: "12px" }}>
                Safe & Comfortable Stay
              </h3>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                Enjoy a secure and welcoming homestay experience with gated
                access, reliable Wi-Fi, 24/7 water supply, and comfortable
                spaces designed to make you feel at home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rooms Listing Preview */}
      <section className="container">
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
                letterSpacing: "0.1em",
                fontSize: "0.85rem",
              }}
            >
              Our Accommodation
            </span>
            <h2
              style={{
                fontSize: "2.5rem",
                marginTop: "8px",
                lineHeight: "1.2",
              }}
            >
              Beautiful Rooms Designed For Rest
            </h2>
          </div>
          <Link
            href="/rooms"
            className="btn btn-outline"
            style={{ textTransform: "uppercase" }}
          >
            View All Rooms
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
          }}
        >
          {activeRooms.map((room) => (
            <div
              key={room.id}
              className="card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  position: "relative",
                  height: "240px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={room.photos[0] || "/images/Front New.jpeg"}
                  alt={room.name}
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
                    bottom: "16px",
                    left: "16px",
                    backgroundColor: "var(--primary)",
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  ₹{room.base_price}{" "}
                  <span style={{ fontWeight: "400", fontSize: "0.8rem" }}>
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
                <h3 style={{ fontSize: "1.4rem" }}>{room.name}</h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    flex: 1,
                  }}
                >
                  {room.description.length > 120
                    ? `${room.description.substring(0, 120)}...`
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
                    paddingTop: "16px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Users size={14} /> Max {room.max_guests} guests
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    marginTop: "12px",
                  }}
                >
                  <Link
                    href={`/rooms/${room.id}`}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    View & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Google Reviews Section */}
      <section className="container" style={{ marginTop: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.85rem",
            }}
          >
            Guest Experiences
          </span>
          <h2
            style={{
              fontSize: "2.5rem",
              marginTop: "8px",
              marginBottom: "16px",
              lineHeight: "1.2",
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
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-color)",
              marginTop: "8px",
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
            <span
              style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
            >
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
              backgroundColor: "#FFFFFF",
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
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
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
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
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              "Had a great stay at Agrawal Homestay. The rooms were clean,
              comfortable, and well-maintained with all the necessary amenities.
              The location is excellent. Mahakal Mandir, Harsiddhi Mata Mandir,
              and Kshipra Ghat are all nearby. Public transport is easily
              available, restaurants and chaat places are also on the walking
              distance. The hosts were extremely kind and helpful, guiding us
              throughout our trip. The place felt 'very safe', even for solo
              female travelers. 'Highly recommended' for anyone visiting
              Ujjain!"
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
              backgroundColor: "#FFFFFF",
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
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
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              "My experience at this homestay in Ujjain was truly very good. The
              caretakers were extremely polite, helpful, and made sure
              everything was comfortable throughout my stay. What I liked the
              most was the homely feeling of this place. It never felt like I
              was staying in a hotel—it genuinely felt like I was at my own
              home, which made the experience even more relaxing and peaceful.
              The overall environment was calm and welcoming, making it a
              perfect choice for anyone visiting Ujjain, especially for temple
              visits like Mahakaleshwar Jyotirlinga. I would definitely
              recommend this homestay to anyone looking for a comfortable and
              homely stay in Ujjain."
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
              backgroundColor: "#FFFFFF",
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
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
                  <span
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
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
                lineHeight: "1.6",
                color: "var(--text-secondary)",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              "Staying here made my trip to Ujjain so much easier. The location
              is perfect since it’s literally a 5-minute walk to Mahakaleshwar,
              which saved us a lot of travel stress. The room was neat and
              clean, with both AC and a geyser working perfectly. What really
              made the stay special was the owner’s hospitality. He was
              incredibly helpful, from assisting us with our trip planning to
              suggesting a great local restaurant. Even after we checked out, he
              let us keep our luggage there so we could explore the other
              temples around Ujjain comfortably before catching our evening bus.
              Truly a great experience and highly recommended for anyone
              visiting."
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

        {/* CTA to write/view review */}
        <div style={{ textAlign: "center" }}>
          <a
            href="https://maps.app.goo.gl/kadykvzjgshdEnh36"
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
            View on Google Maps <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* Injecting responsive styles */}
    </div>
  );
}
