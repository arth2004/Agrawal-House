"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface LightboxPhoto {
  src: string;
  title?: string;
  category?: string;
  alt?: string;
}

interface FullscreenLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: (string | LightboxPhoto)[];
  initialIndex?: number;
}

export default function FullscreenLightbox({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
}: FullscreenLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const activeThumbnailRef = useRef<HTMLButtonElement | null>(null);

  // Normalize photos array
  const normalizedPhotos: LightboxPhoto[] = photos.map((p) => {
    if (typeof p === "string") {
      return { src: p, title: "", category: "", alt: "" };
    }
    return p;
  });

  // Keep currentIndex within bounds
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < normalizedPhotos.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, normalizedPhotos.length, isOpen]);

  // Handle client-side portal mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const showPrev = useCallback(() => {
    if (normalizedPhotos.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + normalizedPhotos.length) % normalizedPhotos.length);
  }, [normalizedPhotos.length]);

  const showNext = useCallback(() => {
    if (normalizedPhotos.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % normalizedPhotos.length);
  }, [normalizedPhotos.length]);

  // Scroll active thumbnail into center of carousel
  useEffect(() => {
    if (isOpen && activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex, isOpen]);

  // Lock body scroll and register keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, showPrev, showNext]);

  // Touch swipe handling for mobile
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) showNext();
      else showPrev();
    }
    touchStartXRef.current = null;
  };

  if (!mounted || !isOpen || normalizedPhotos.length === 0) {
    return null;
  }

  const currentPhoto = normalizedPhotos[currentIndex] || normalizedPhotos[0];

  const modalContent = (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(8, 13, 11, 0.98)", // Ultra-deep dark slate green matching Photo 1
        zIndex: 100000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* 1. Top Bar */}
      <div
        style={{
          height: "72px",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* Left Spacer for symmetrical centering */}
        <div style={{ width: "44px" }} />

        {/* Center Counter & Optional Category */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
        >
          {currentPhoto.category && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "#A8A29E",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontWeight: "500",
              }}
            >
              {currentPhoto.category}
            </span>
          )}
          <span
            style={{
              color: "#C6A575", // Luxury gold / champagne tone matching Photo 1
              fontSize: "1rem",
              fontWeight: "600",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontFamily: "var(--font-sans)",
            }}
          >
            {currentIndex + 1} OF {normalizedPhotos.length}
          </span>
        </div>

        {/* Right Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close photo gallery"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          className="lightbox-btn-hover"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. Center Stage (Main Image + Edge Arrows) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minHeight: 0,
          padding: "10px 80px",
        }}
      >
        {/* Previous Button */}
        {normalizedPhotos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous photo"
            style={{
              position: "absolute",
              left: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 30,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
            }}
            className="lightbox-arrow-btn"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Main Image Frame */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxHeight: "calc(100vh - 190px)",
            maxWidth: "calc(100vw - 160px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <img
            key={currentPhoto.src}
            src={currentPhoto.src}
            alt={currentPhoto.alt || currentPhoto.title || `Agrawal House photo ${currentIndex + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 190px)",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8)",
              animation: "lightboxFadeIn 0.25s ease-out",
            }}
          />
        </div>

        {/* Next Button */}
        {normalizedPhotos.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
            style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.65)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 30,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
            }}
            className="lightbox-arrow-btn"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* 3. Bottom Thumbnail Carousel Strip */}
      {normalizedPhotos.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            height: "90px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "16px",
            flexShrink: 0,
            position: "relative",
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              maxWidth: "min(92vw, 1100px)",
              overflowX: "auto",
              padding: "8px 12px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            className="scrollbar-hide"
          >
            {normalizedPhotos.map((photo, i) => {
              const isActive = i === currentIndex;
              return (
                <button
                  key={`${photo.src}-${i}`}
                  ref={isActive ? activeThumbnailRef : null}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  style={{
                    width: "72px",
                    height: "52px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                    border: isActive ? "2.5px solid #C6A575" : "2px solid transparent",
                    opacity: isActive ? 1 : 0.45,
                    transform: isActive ? "scale(1.06)" : "scale(1)",
                    boxShadow: isActive ? "0 0 14px rgba(198, 165, 117, 0.5)" : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    background: "#1C1917",
                    outline: "none",
                  }}
                  className="lightbox-thumb-btn"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt || `Thumbnail ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
