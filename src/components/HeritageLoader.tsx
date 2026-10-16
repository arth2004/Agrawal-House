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
      {/* Circular Sacred Heritage Mandala Spinner */}
      <div
        style={{
          position: "relative",
          width: "110px",
          height: "110px",
          marginBottom: "26px",
        }}
      >
        {/* Outer rotating decorative dashed gold ring */}
        <div
          className="heritage-spinner-ring"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px dashed #D97706",
            opacity: 0.85,
            boxShadow: "0 0 20px rgba(217, 119, 6, 0.2)",
          }}
        />

        {/* Pulsing inner glow circle */}
        <div
          className="heritage-pulse-circle"
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(194, 65, 12, 0.08) 60%, transparent 100%)",
          }}
        />

        {/* Central Sacred Om Icon */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            fontSize: "2.6rem",
            fontFamily: "var(--font-serif)",
            textShadow: "0 2px 12px rgba(194, 65, 12, 0.25)",
            userSelect: "none",
          }}
        >
          🕉️
        </div>
      </div>

      {/* Brand Title */}
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.5rem, 3vw, 1.85rem)",
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
          fontSize: "0.8rem",
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
