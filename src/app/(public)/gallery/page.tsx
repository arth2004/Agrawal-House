"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Images, LayoutGrid, Folder, Maximize2 } from "lucide-react";
import { db } from "@/lib/db";
import FullscreenLightbox, { LightboxPhoto } from "@/components/FullscreenLightbox";

interface GalleryCategory {
  category: string;
  title: string;
  photos: { src: string; title: string }[];
}

const DEFAULT_CATEGORIES: GalleryCategory[] = [
  {
    category: "Exterior & Surroundings",
    title: "Exterior & Surroundings",
    photos: [
      { src: "/images/Front New.jpeg", title: "Agrawal House Entrance & Building" },
      { src: "/images/front.jpg", title: "Entrance Archway" },
      { src: "/images/side-f.jpg", title: "Balcony & Side Facade" },
      { src: "/images/side-h.jpg", title: "Exterior Architecture" },
      { src: "/images/room_courtyard.jpg", title: "Courtyard & Shared Spaces" },
      { src: "/images/hero_sunset.jpg", title: "Ujjain Evening View" },
      { src: "/images/Mahakal.png", title: "Shri Mahakaleshwar Temple (8 Mins Away)" },
    ],
  },
  {
    category: "Double bedroom 1",
    title: "Double bedroom 1",
    photos: [
      { src: "/images/bed-1a.jpg", title: "Double bedroom 1 - Deluxe Queen Bed" },
      { src: "/images/bed-1f.jpg", title: "Double bedroom 1 - Cozy Perspective" },
      { src: "/images/bath-2.jpg", title: "Double bedroom 1 - Ensuite Bathroom" },
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131535282-x9j2r0t.jpg",
        title: "Double bedroom 1 - Room Ambiance",
      },
    ],
  },
  {
    category: "Double bedroom 2",
    title: "Double bedroom 2",
    photos: [
      { src: "/images/bed-2a.jpg", title: "Double bedroom 2 - Queen Bed Setup" },
      { src: "/images/bath-2.jpg", title: "Double bedroom 2 - Attached Washroom" },
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131535282-x9j2r0t.jpg",
        title: "Double bedroom 2 - Room View",
      },
    ],
  },
  {
    category: "Family bedroom 1",
    title: "Family bedroom 1",
    photos: [
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131873013-44uanus.jpg",
        title: "Family bedroom 1 - King Bed",
      },
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131872488-rcc6twn.jpg",
        title: "Family bedroom 1 - Spacious Layout",
      },
      { src: "/images/bed-3a.jpg", title: "Family bedroom 1 - Premium Linen" },
      { src: "/images/bed-3a (2).jpg", title: "Family bedroom 1 - Side Angle" },
      { src: "/images/bed-3a (3).jpg", title: "Family bedroom 1 - Wide Room View" },
      { src: "/images/bed-3f.jpg", title: "Family bedroom 1 - Seating Corner" },
      { src: "/images/bath-3.jpg", title: "Family bedroom 1 - Attached Bathroom" },
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131860035-jjb9nnt.jpg",
        title: "Family bedroom 1 - Interior View",
      },
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131872784-7iys3vq.jpg",
        title: "Family bedroom 1 - Relaxing Space",
      },
    ],
  },
  {
    category: "Family bedroom 2",
    title: "Family bedroom 2",
    photos: [
      { src: "/images/bed-4a.jpg", title: "Family bedroom 2 - King Size Bed" },
      { src: "/images/bed-4a (2).jpg", title: "Family bedroom 2 - Bed & Curtains" },
      { src: "/images/bed-4a (3).jpg", title: "Family bedroom 2 - Cozy Corner" },
      { src: "/images/bed-4f.jpg", title: "Family bedroom 2 - Room Perspective" },
      { src: "/images/bath-4.jpg", title: "Family bedroom 2 - Modern Ensuite" },
      {
        src: "https://rlepvvsjxbjrzwsgzqke.supabase.co/storage/v1/object/public/room-photos/1786131873013-44uanus.jpg",
        title: "Family bedroom 2 - Master Bedroom",
      },
    ],
  },
];

export default function GalleryPage() {
  const [categories, setCategories] = useState<GalleryCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "albums">("grid");

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  // Load any dynamic rooms & photos from db
  useEffect(() => {
    async function loadDynamicRooms() {
      try {
        const rooms = await db.getRooms();
        if (rooms && rooms.length > 0) {
          const dynamicCats: GalleryCategory[] = rooms.map((room) => ({
            category: room.name,
            title: room.name,
            photos:
              room.photos && room.photos.length > 0
                ? room.photos.map((src, idx) => ({
                    src,
                    title: `${room.name} - Photo ${idx + 1}`,
                  }))
                : [{ src: "/images/room_mango_suite.jpg", title: `${room.name}` }],
          }));

          setCategories([DEFAULT_CATEGORIES[0], ...dynamicCats]);
        }
      } catch (err) {
        console.error("Error loading gallery rooms:", err);
      }
    }
    loadDynamicRooms();
  }, []);

  // Flatten all photos into a single master collection
  const allPhotos: LightboxPhoto[] = useMemo(() => {
    const list: LightboxPhoto[] = [];
    const seen = new Set<string>();

    categories.forEach((cat) => {
      cat.photos.forEach((photo) => {
        if (!seen.has(photo.src)) {
          seen.add(photo.src);
          list.push({
            src: photo.src,
            category: cat.category,
            title: photo.title,
            alt: photo.title,
          });
        }
      });
    });

    return list;
  }, [categories]);

  // Filtered photos for the active category filter pill
  const filteredPhotos: LightboxPhoto[] = useMemo(() => {
    if (selectedCategory === "All") return allPhotos;
    return allPhotos.filter((p) => p.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  // Handler to open lightbox directly at a specific photo
  const openLightboxAtPhoto = (photoSrc: string) => {
    const targetIdx = allPhotos.findIndex((p) => p.src === photoSrc);
    setLightboxInitialIndex(targetIdx >= 0 ? targetIdx : 0);
    setIsLightboxOpen(true);
  };

  // Handler to open lightbox for a category album card
  const openLightboxForCategory = (cat: GalleryCategory) => {
    if (cat.photos.length === 0) return;
    const firstPhotoSrc = cat.photos[0].src;
    openLightboxAtPhoto(firstPhotoSrc);
  };

  return (
    <div
      className="container animate-fade-in"
      style={{ padding: "40px 24px 80px 24px" }}
    >
      {/* 1. Header Section */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <span
          style={{
            color: "var(--primary)",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontSize: "0.85rem",
          }}
        >
          Visual Tour
        </span>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
            marginTop: "8px",
            marginBottom: "16px",
            fontFamily: "var(--font-serif)",
          }}
        >
          Our Photo Gallery
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: "640px",
            margin: "0 auto",
            fontSize: "1.05rem",
            lineHeight: "1.6",
          }}
        >
          Explore the architecture, warm spaces, and premium rooms of Agrawal House.
          Tap any photo to view in high resolution.
        </p>
      </div>

      {/* 2. Controls Bar: Filter Pills + View Mode Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "32px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "20px",
        }}
      >
        {/* Category Filter Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            maxWidth: "100%",
            paddingBottom: "4px",
            scrollbarWidth: "none",
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: selectedCategory === "All" ? "600" : "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: selectedCategory === "All" ? "1px solid var(--primary)" : "1px solid var(--border-color)",
              backgroundColor: selectedCategory === "All" ? "var(--primary)" : "var(--bg-card)",
              color: selectedCategory === "All" ? "#FFFFFF" : "var(--text-primary)",
              whiteSpace: "nowrap",
            }}
          >
            All Photos ({allPhotos.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: isSelected ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                  backgroundColor: isSelected ? "var(--primary)" : "var(--bg-card)",
                  color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {cat.category} ({cat.photos.length})
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Grid vs Albums */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
            padding: "3px",
            border: "1px solid var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: viewMode === "grid" ? "600" : "500",
              backgroundColor: viewMode === "grid" ? "#FFFFFF" : "transparent",
              color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: viewMode === "grid" ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <LayoutGrid size={15} /> Photos
          </button>
          <button
            type="button"
            onClick={() => setViewMode("albums")}
            aria-label="Albums view"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: viewMode === "albums" ? "600" : "500",
              backgroundColor: viewMode === "albums" ? "#FFFFFF" : "transparent",
              color: viewMode === "albums" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: viewMode === "albums" ? "var(--shadow-sm)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <Folder size={15} /> Albums
          </button>
        </div>
      </div>

      {/* 3A. View Mode: Photo Grid */}
      {viewMode === "grid" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredPhotos.map((photo, i) => (
            <div
              key={`${photo.src}-${i}`}
              onClick={() => openLightboxAtPhoto(photo.src)}
              className="card"
              style={{
                position: "relative",
                height: "240px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#1C1917",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <img
                src={photo.src}
                alt={photo.alt || photo.title || "Agrawal House"}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.4s ease",
                }}
                className="gallery-zoom-img"
              />

              {/* Room category badge */}
              {photo.category && (
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    backgroundColor: "rgba(28, 25, 23, 0.78)",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {photo.category}
                </span>
              )}

              {/* Hover Overlay with Expand Icon */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  opacity: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.2s ease",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <Maximize2 size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3B. View Mode: Category Album Cards */}
      {viewMode === "albums" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "32px",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => openLightboxForCategory(cat)}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--bg-card)",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  height: "260px",
                  overflow: "hidden",
                  position: "relative",
                  backgroundColor: "#1C1917",
                }}
              >
                <img
                  src={cat.photos[0]?.src || "/images/room_mango_suite.jpg"}
                  alt={cat.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform var(--transition-slow)",
                  }}
                  className="gallery-zoom-img"
                />
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    backgroundColor: "rgba(28, 25, 23, 0.75)",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: "500",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {cat.category}
                </span>

                <span
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    backgroundColor: "rgba(28, 25, 23, 0.75)",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: "500",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Images size={12} /> {cat.photos.length} photos
                </span>
              </div>
              <div style={{ padding: "20px" }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontFamily: "var(--font-sans)",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  {cat.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 4. Fullscreen Luxury Lightbox Modal */}
      <FullscreenLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={allPhotos}
        initialIndex={lightboxInitialIndex}
      />
    </div>
  );
}
