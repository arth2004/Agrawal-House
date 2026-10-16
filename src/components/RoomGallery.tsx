"use client";

import React, { useState } from "react";
import { Maximize2, Camera } from "lucide-react";
import FullscreenLightbox from "./FullscreenLightbox";

interface RoomGalleryProps {
  photos: string[];
  roomName: string;
}

export default function RoomGallery({ photos, roomName }: RoomGalleryProps) {
  const safePhotos = photos && photos.length > 0 ? photos : ["/images/room_mango_suite.jpg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activePhoto = safePhotos[selectedIndex] || safePhotos[0];

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

      {/* 3. Reusable Fullscreen Lightbox Modal */}
      <FullscreenLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={safePhotos.map((src, i) => ({
          src,
          category: roomName,
          title: `${roomName} - Photo ${i + 1}`,
          alt: `${roomName} photo ${i + 1}`,
        }))}
        initialIndex={selectedIndex}
      />
    </div>
  );
}
