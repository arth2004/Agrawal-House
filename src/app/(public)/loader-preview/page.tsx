"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Sparkles, Check, RefreshCw } from "lucide-react";
import HeritageLoader from "@/components/HeritageLoader";

export default function LoaderPreviewPage() {
  const [activeTab, setActiveTab] = useState<"option1" | "option2" | "both">("option1");
  const [isSimulating1, setIsSimulating1] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSimulating2, setIsSimulating2] = useState(false);

  // Simulation for Option 1: Top Progress Bar
  const triggerProgressBar = () => {
    setIsSimulating1(true);
    setProgress(15);

    setTimeout(() => setProgress(45), 250);
    setTimeout(() => setProgress(75), 650);
    setTimeout(() => setProgress(100), 1100);
    setTimeout(() => {
      setIsSimulating1(false);
      setProgress(0);
    }, 1500);
  };

  // Simulation for Option 2: Full Screen Heritage Loader
  const triggerHeritageLoader = () => {
    setIsSimulating2(true);
    setTimeout(() => {
      setIsSimulating2(false);
    }, 2800);
  };

  return (
    <div className="container" style={{ padding: "48px 24px 100px 24px", maxWidth: "900px" }}>
      {/* Option 1: Top Navigation Progress Bar Fixed to Viewport Top */}
      {isSimulating1 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            zIndex: 99999,
            backgroundColor: "rgba(194, 65, 12, 0.15)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #C2410C 0%, #D97706 60%, #F59E0B 100%)",
              boxShadow: "0 0 12px rgba(217, 119, 6, 0.8), 0 0 4px #C2410C",
              transition: "width 0.35s ease-out",
              position: "relative",
            }}
          >
            {/* Glowing lead particle */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "-2px",
                bottom: "-2px",
                width: "40px",
                background: "linear-gradient(90deg, transparent, #FFFFFF)",
                opacity: 0.9,
                filter: "blur(2px)",
              }}
            />
          </div>
        </div>
      )}

      {/* Option 2: Full Heritage Overlay */}
      {isSimulating2 && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
          <HeritageLoader fullScreen={true} subtitle="Preparing your peaceful stay..." />
          <button
            onClick={() => setIsSimulating2(false)}
            style={{
              position: "fixed",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100000,
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid var(--border-color)",
              backgroundColor: "#FFFFFF",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            Dismiss Preview
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--primary)",
            fontSize: "0.88rem",
            fontWeight: "600",
            marginBottom: "16px",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} /> Back to Website
        </Link>
        <span
          style={{
            display: "block",
            color: "var(--primary)",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontSize: "0.8rem",
            marginBottom: "6px",
          }}
        >
          Design Lab & Preview
        </span>
        <h1 style={{ fontSize: "2.4rem", margin: "0 0 12px 0" }}>Explore Loader Designs</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6 }}>
          Test and experience how both loader concepts look and feel in real time on desktop and mobile.
        </p>
      </div>

      {/* Selector Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "12px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveTab("option1")}
          className={`btn ${activeTab === "option1" ? "btn-primary" : "btn-outline"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem" }}
        >
          Option 1: Slim Top Progress Bar
        </button>
        <button
          onClick={() => setActiveTab("option2")}
          className={`btn ${activeTab === "option2" ? "btn-primary" : "btn-outline"}`}
          style={{ padding: "10px 20px", fontSize: "0.9rem" }}
        >
          Option 2: Heritage Centered Screen
        </button>
      </div>

      {/* Tab 1 Content: Slim Top Progress Bar */}
      {activeTab === "option1" && (
        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "999px",
                backgroundColor: "#D1FAE5",
                color: "#065F46",
                fontWeight: "700",
                fontSize: "0.78rem",
                textTransform: "uppercase",
              }}
            >
              Recommended • Modern Luxury
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Used by Airbnb, YouTube, Apple</span>
          </div>

          <h3 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Option 1: Slim Top Navigation Progress Bar</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            Whenever a guest taps any link (e.g. <em>Rooms</em>, <em>About</em>, <em>Book Now</em>), a slim 4px terracotta-to-gold
            laser progress bar glides smoothly across the top edge of their screen.
          </p>

          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-secondary)",
              marginBottom: "24px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>Why guests love this:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li><strong>Zero distraction:</strong> Never covers the page or hides photos while loading.</li>
              <li><strong>Instant visual feedback:</strong> The guest immediately knows their tap registered.</li>
              <li><strong>Feels lightning fast:</strong> Gives the impression of instant response.</li>
            </ul>
          </div>

          <button
            onClick={triggerProgressBar}
            disabled={isSimulating1}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px" }}
          >
            <Play size={16} /> {isSimulating1 ? "Simulating Top Bar..." : "Click to Test Top Progress Bar"}
          </button>
          <span style={{ display: "block", marginTop: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Watch the very top edge of your browser window after clicking!
          </span>
        </div>
      )}

      {/* Tab 2 Content: Heritage Loading Screen */}
      {activeTab === "option2" && (
        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "999px",
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                fontWeight: "700",
                fontSize: "0.78rem",
                textTransform: "uppercase",
              }}
            >
              Heritage Brand • High Elegance
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Best for Next.js loading.tsx</span>
          </div>

          <h3 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Option 2: Heritage Centered Screen</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
            A branded royal heritage splash screen in warm cream limestone with a rotating golden sacred ring,
            pulsing Om emblem, and shimmering subtitle <em>"Preparing your peaceful stay..."</em>.
          </p>

          <div
            style={{
              padding: "20px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-secondary)",
              marginBottom: "24px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "8px" }}>Why guests love this:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li><strong>Spiritual & Heritage Identity:</strong> Reinforces the peaceful holy Ujjain theme.</li>
              <li><strong>Perfect for slow networks:</strong> If a mobile user has low network reception, they see a beautiful branded splash instead of a blank screen.</li>
            </ul>
          </div>

          <button
            onClick={triggerHeritageLoader}
            disabled={isSimulating2}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px" }}
          >
            <Sparkles size={16} /> {isSimulating2 ? "Displaying Preview..." : "Click to Preview Heritage Screen (3s)"}
          </button>
        </div>
      )}

      {/* Comparison Table */}
      <div style={{ marginTop: "48px" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Side-by-Side Comparison</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px" }}>Feature</th>
                <th style={{ padding: "12px 16px" }}>Option 1: Top Bar</th>
                <th style={{ padding: "12px 16px" }}>Option 2: Heritage Screen</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>Visual Style</td>
                <td style={{ padding: "12px 16px" }}>Slim 4px glowing terracotta line at very top</td>
                <td style={{ padding: "12px 16px" }}>Full centered Om & golden mandala splash</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>Page Visibility</td>
                <td style={{ padding: "12px 16px" }}>Keeps existing page fully visible</td>
                <td style={{ padding: "12px 16px" }}>Covers the page with warm cream background</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>Speed Perception</td>
                <td style={{ padding: "12px 16px" }}>Feels instant and fluid</td>
                <td style={{ padding: "12px 16px" }}>Feels deliberate and ceremonial</td>
              </tr>
              <tr>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>Can We Combine Both?</td>
                <td colSpan={2} style={{ padding: "12px 16px", color: "var(--primary)", fontWeight: 600 }}>
                  YES! Top bar runs instantly on all link taps; Heritage screen only appears if a server query takes &gt; 400ms!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes heritageSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes heritagePulse {
          0%, 100% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes heritageShimmer {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .heritage-spinner-ring {
          animation: heritageSpin 9s linear infinite;
        }
        .heritage-pulse-circle {
          animation: heritagePulse 2.4s ease-in-out infinite;
        }
        .heritage-shimmer-text {
          animation: heritageShimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
