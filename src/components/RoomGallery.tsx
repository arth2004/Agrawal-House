"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2, Camera } from "lucide-react";

interface RoomGalleryProps {
  photos: string[];
  roomName: string;
}

export default function RoomGallery({ photos, roomName }: RoomGalleryProps) {
  const safePhotos = photos && photos.length > 0 ? photos : ["/images/room_mango_suite.jpg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activePhoto = safePhotos[selectedIndex] || safePhotos[0];

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + safePhotos.length) % safePhotos.length);
  }, [safePhotos.length]);

  const showNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % safePhotos.length);
  }, [safePhotos.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, showPrev, showNext]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. Main Hero Image */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
          height: "420px",
          backgroundColor: "#1C1917",
          cursor: "pointer",
        }}
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={activePhoto}
          alt={`${roomName} photo ${selectedIndex + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Badge: Photos count & Click to expand */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            backgroundColor: "rgba(28, 25, 23, 0.8)",
            color: "#FFFFFF",
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <Camera size={16} /> Photo {selectedIndex + 1} of {safePhotos.length}
          <Maximize2 size={14} style={{ marginLeft: "4px", opacity: 0.8 }} />
        </div>
      </div>

      {/* 2. Thumbnail Selector Bar */}
      {safePhotos.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: "12px",
          }}
        >
          {safePhotos.map((photo, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                style={{
                  height: "70px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: isSelected
                    ? "3px solid var(--primary)"
                    : "2px solid transparent",
                  padding: 0,
                  cursor: "pointer",
                  backgroundColor: "#E5E7EB",
                  opacity: isSelected ? 1 : 0.7,
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                }}
              >
                <img
                  src={photo}
                  alt={`${roomName} thumbnail ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(12, 10, 9, 0.95)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backdropFilter: "blur(8px)",
          }}
          className="animate-fade-in"
        >
          {/* Header */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "24px",
              right: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#FFFFFF",
            }}
          >
            <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
              {roomName} — Photo {selectedIndex + 1} / {safePhotos.length}
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "#FFFFFF",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Center Main View */}
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "75vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={activePhoto}
              alt={`${roomName} large photo`}
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            />

            {/* Prev Button */}
            {safePhotos.length > 1 && (
              <button
                type="button"
                onClick={showPrev}
                style={{
                  position: "absolute",
                  left: "-20px",
                  backgroundColor: "rgba(28, 25, 23, 0.8)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Next Button */}
            {safePhotos.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                style={{
                  position: "absolute",
                  right: "-20px",
                  backgroundColor: "rgba(28, 25, 23, 0.8)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {safePhotos.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                display: "flex",
                gap: "8px",
                maxWidth: "90vw",
                overflowX: "auto",
                padding: "8px",
              }}
            >
              {safePhotos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  style={{
                    width: "60px",
                    height: "45px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    border: idx === selectedIndex ? "2px solid var(--primary)" : "1px solid transparent",
                    opacity: idx === selectedIndex ? 1 : 0.5,
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
