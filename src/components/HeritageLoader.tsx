"use client";

import React from "react";

interface HeritageLoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function HeritageLoader({
  title = "Agrawal House",
  subtitle = "Preparing your peaceful stay...",
  fullScreen = true,
}: HeritageLoaderProps) {
  const content = (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
        maxWidth: "420px",
      }}
    >
      {/* Exact Golden Sacred Om Mandala Emblem */}
      <div
        style={{
          position: "relative",
          width: "140px",
          height: "140px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Soft rotating celestial aura behind emblem */}
        <div
          className="heritage-spinner-ring"
          style={{
            position: "absolute",
            inset: "-10px",
            borderRadius: "50%",
            border: "1.5px dashed rgba(217, 119, 6, 0.5)",
          }}
        />

        {/* Ambient radial warm pulse */}
        <div
          className="heritage-pulse-circle"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, rgba(194, 65, 12, 0.1) 60%, transparent 100%)",
            filter: "blur(8px)",
          }}
        />

        {/* Exact Om Mandala Graphic */}
        <img
          src="/images/om-mandala.png"
          alt="Agrawal House Sacred Om Emblem"
          className="heritage-pulse-circle"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "relative",
            zIndex: 2,
            filter: "drop-shadow(0 6px 20px rgba(217, 119, 6, 0.35))",
          }}
        />
      </div>

      {/* Brand Title */}
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.5rem, 3.2vw, 1.9rem)",
          color: "var(--text-primary)",
          marginBottom: "6px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {title}
      </h2>

      {/* Heritage Tagline */}
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--primary)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "14px",
        }}
      >
        Homestay • Ujjain
      </div>

      {/* Shimmering Subtitle */}
      <p
        className="heritage-shimmer-text"
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.92rem",
          fontStyle: "italic",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
    </div>
  );

  if (!fullScreen) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "350px",
          width: "100%",
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "var(--bg-primary, #F8F5EE)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </div>
  );
}
