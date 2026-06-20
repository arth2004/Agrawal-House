"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";

interface GalleryCategory {
  category: string;
  title: string;
  photos: string[];
}

// Add as many photo paths as you like under each category — every photo in
// the array will be viewable inside that category's lightbox.
const galleryCategories: GalleryCategory[] = [
  {
    category: "Exterior",
    title: "Exterior & Surroundings",
    photos: ["images/Front New.jpeg", "images/side-f.jpg", "images/side-h.jpg"],
  },
  {
    category: "Family Room",
    title: "Family Room",
    photos: [
      "/images/bed-3a (3).jpg",
      "/images/bed-3a (2).jpg",
      "/images/bath-3.jpg",
    ],
  },
  {
    category: "Double Room",
    title: "Double Room",
    photos: ["/images/bed-1a.jpg", "/images/bed-2a.jpg", "/images/bath-2.jpg"],
  },
];

export default function GalleryPage() {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
    null,
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const isOpen = activeCategoryIndex !== null;
  const activeCategory =
    activeCategoryIndex !== null
      ? galleryCategories[activeCategoryIndex]
      : null;

  const openCategory = (index: number) => {
    setActiveCategoryIndex(index);
    setActivePhotoIndex(0);
  };

  const closeLightbox = useCallback(() => {
    setActiveCategoryIndex(null);
  }, []);

  const showPrev = useCallback(() => {
    if (!activeCategory) return;
    setActivePhotoIndex(
      (prev) =>
        (prev - 1 + activeCategory.photos.length) %
        activeCategory.photos.length,
    );
  }, [activeCategory]);

  const showNext = useCallback(() => {
    if (!activeCategory) return;
    setActivePhotoIndex((prev) => (prev + 1) % activeCategory.photos.length);
  }, [activeCategory]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeLightbox, showPrev, showNext]);

  return (
    <div
      className="container animate-fade-in"
      style={{ padding: "40px 24px 80px 24px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
          style={{ fontSize: "3rem", marginTop: "8px", marginBottom: "16px" }}
        >
          Our Photo Gallery
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            maxWidth: "600px",
            margin: "0 auto",
            fontSize: "1.1rem",
            lineHeight: "1.6",
          }}
        >
          Explore the architecture, warm spaces, gardens, and premium rooms of
          Agrawal House. Tap a category to browse every photo.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
        }}
      >
        {galleryCategories.map((cat, i) => (
          <button
            key={cat.category}
            onClick={() => openCategory(i)}
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
              }}
            >
              <img
                src={cat.photos[0]}
                alt={cat.title}
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
                }}
              >
                {cat.category}
              </span>
              {cat.photos.length > 1 && (
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
                  }}
                >
                  <Images size={12} /> {cat.photos.length} photos
                </span>
              )}
            </div>
            <div style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: "600",
                  color: "#000000",
                }}
              >
                {cat.title}
              </h3>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && activeCategory && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(12, 10, 9, 0.92)",
            zIndex: 200,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Close button - fixed so it's always reachable */}
          <button
            onClick={closeLightbox}
            aria-label="Close gallery"
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#FFFFFF",
              zIndex: 210,
            }}
          >
            <X size={22} />
          </button>

          {/* Scrollable content wrapper */}
          <div
            style={{
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "90px 24px 40px 24px",
              gap: "20px",
            }}
          >
            {/* Category label + counter */}
            <div style={{ color: "#FFFFFF", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                {activeCategory.title}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#A8A29E",
                  marginTop: "2px",
                }}
              >
                {activePhotoIndex + 1} / {activeCategory.photos.length}
              </div>
            </div>

            {/* Image row with side arrows */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                width: "100%",
              }}
            >
              {activeCategory.photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous photo"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <img
                onClick={(e) => e.stopPropagation()}
                src={activeCategory.photos[activePhotoIndex]}
                alt={`${activeCategory.title} ${activePhotoIndex + 1}`}
                style={{
                  maxWidth: "85vw",
                  maxHeight: "65vh",
                  objectFit: "contain",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                }}
              />

              {activeCategory.photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next photo"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    borderRadius: "50%",
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {activeCategory.photos.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  gap: "10px",
                  maxWidth: "90vw",
                  overflowX: "auto",
                  padding: "4px",
                }}
              >
                {activeCategory.photos.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    onClick={() => setActivePhotoIndex(i)}
                    style={{
                      width: "64px",
                      height: "48px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      flexShrink: 0,
                      border:
                        i === activePhotoIndex
                          ? "2px solid var(--primary)"
                          : "2px solid transparent",
                      opacity: i === activePhotoIndex ? 1 : 0.6,
                      transition: "opacity 0.2s, border-color 0.2s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
