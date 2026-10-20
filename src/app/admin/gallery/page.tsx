"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { GalleryPhoto, Room } from "@/lib/types";
import {
  Images,
  Plus,
  Upload,
  Link2,
  Trash2,
  Edit2,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  Eye,
  BedDouble,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"property" | "rooms">("property");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Upload & action states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal states
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);

  // Form states for Add/Edit
  const [formSrc, setFormSrc] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Exterior & Surroundings");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const [galleryData, roomsData] = await Promise.all([
        db.getGalleryPhotos(),
        db.getRooms(),
      ]);
      setPhotos(galleryData);
      setRooms(roomsData);
    } catch (err) {
      console.error("Error loading gallery photos:", err);
      setError("Failed to load gallery photos. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    if (!set.has("Exterior & Surroundings")) {
      set.add("Exterior & Surroundings");
    }
    return Array.from(set);
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === "All") return photos;
    return photos.filter((p) => p.category === selectedCategory);
  }, [photos, selectedCategory]);

  // Handle Multi-File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");
    setSuccess("");

    const newPhotos: GalleryPhoto[] = [];
    const targetCategory =
      selectedCategory === "All" ? "Exterior & Surroundings" : selectedCategory;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

        const uploadedUrl = await db.uploadGalleryPhoto(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const formattedTitle =
          nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);

        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
          src: uploadedUrl,
          title: formattedTitle || "Property Photo",
          category: targetCategory,
          sort_order: photos.length + i + 1,
          created_at: new Date().toISOString(),
        });
      }

      const updated = [...newPhotos, ...photos];
      await db.saveGalleryPhotos(updated);
      setPhotos(updated);
      setSuccess(`Successfully added ${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""} to "${targetCategory}"!`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload some photos. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Open Add URL Modal
  const openAddModal = () => {
    setFormSrc("");
    setFormTitle("");
    setFormCategory(
      selectedCategory === "All" ? "Exterior & Surroundings" : selectedCategory
    );
    setIsCustomCategory(false);
    setCustomCategoryInput("");
    setShowAddUrlModal(true);
  };

  // Open Edit Modal
  const openEditModal = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormSrc(photo.src);
    setFormTitle(photo.title);
    setFormCategory(photo.category);
    setIsCustomCategory(false);
    setCustomCategoryInput("");
  };

  // Save from Add or Edit modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSrc.trim()) {
      setError("Please provide an image URL or upload an image.");
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || "Exterior & Surroundings"
      : formCategory;
    const finalTitle = formTitle.trim() || "Property Photo";

    setError("");
    setSuccess("");

    if (editingPhoto) {
      // Editing existing photo
      const updated = photos.map((p) =>
        p.id === editingPhoto.id
          ? {
              ...p,
              src: formSrc.trim(),
              title: finalTitle,
              category: finalCategory,
            }
          : p
      );
      await db.saveGalleryPhotos(updated);
      setPhotos(updated);
      setEditingPhoto(null);
      setSuccess("Photo updated successfully!");
    } else {
      // Adding new photo via URL
      const newPhoto: GalleryPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        src: formSrc.trim(),
        title: finalTitle,
        category: finalCategory,
        sort_order: photos.length + 1,
        created_at: new Date().toISOString(),
      };
      const updated = [newPhoto, ...photos];
      await db.saveGalleryPhotos(updated);
      setPhotos(updated);
      setShowAddUrlModal(false);
      setSuccess(`Photo added to "${finalCategory}"!`);
    }

    setTimeout(() => setSuccess(""), 3500);
  };

  // Delete Photo
  const handleDeletePhoto = async (photo: GalleryPhoto) => {
    if (!window.confirm(`Delete photo "${photo.title}"? It will be removed from your public gallery.`)) {
      return;
    }

    try {
      await db.deleteGalleryPhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setSuccess("Photo deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete photo. Please try again.");
    }
  };

  // Reorder Photos
  const handleMovePhoto = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredPhotos.length) return;

    // Create copy and swap in the filtered list
    const reorderedFiltered = [...filteredPhotos];
    const temp = reorderedFiltered[index];
    reorderedFiltered[index] = reorderedFiltered[targetIndex];
    reorderedFiltered[targetIndex] = temp;

    // Map back into full photos array
    const updatedPhotos = [...photos];
    const originalIdxA = photos.findIndex((p) => p.id === reorderedFiltered[index].id);
    const originalIdxB = photos.findIndex((p) => p.id === reorderedFiltered[targetIndex].id);

    if (originalIdxA >= 0 && originalIdxB >= 0) {
      const t = updatedPhotos[originalIdxA];
      updatedPhotos[originalIdxA] = updatedPhotos[originalIdxB];
      updatedPhotos[originalIdxB] = t;
    }

    setPhotos(updatedPhotos);
    await db.saveGalleryPhotos(updatedPhotos);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>Gallery Photos</h1>
        <p style={{ color: "var(--text-secondary)" }}>Loading gallery management...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* 1. Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.3rem",
              fontFamily: "var(--font-serif)",
              marginBottom: "6px",
            }}
          >
            Gallery Management
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Add, caption, reorder, and remove property photos displayed on your public website gallery.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Public Gallery Link */}
          <Link
            href="/gallery"
            target="_blank"
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            <Eye size={15} /> View Live Gallery <ExternalLink size={12} />
          </Link>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            style={{ display: "none" }}
          />

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 16px",
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload Photos"}
          </button>

          {/* Add via URL Button */}
          <button
            type="button"
            onClick={openAddModal}
            className="btn btn-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 14px",
              fontSize: "0.875rem",
              color: "var(--primary)",
              borderColor: "var(--primary)",
            }}
          >
            <Link2 size={16} /> Add by URL
          </button>
        </div>
      </div>

      {/* Upload Progress Status Banner */}
      {isUploading && (
        <div
          style={{
            padding: "14px 18px",
            backgroundColor: "rgba(230, 74, 25, 0.08)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(230, 74, 25, 0.25)",
            color: "#E64A19",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #E64A19",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>{uploadProgressText || "Uploading photos to cloud storage..."}</span>
        </div>
      )}

      {/* Success / Error Banners */}
      {(success || error) && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: error ? "#FEF2F2" : "#ECFDF5",
            border: `1px solid ${error ? "#FECACA" : "#A7F3D0"}`,
            color: error ? "#B91C1C" : "#047857",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.9rem",
          }}
        >
          {error ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{error || success}</span>
        </div>
      )}

      {/* Main Mode Toggle: Property Photos vs Room Photos */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", gap: "24px" }}>
        <button
          type="button"
          onClick={() => setActiveTab("property")}
          style={{
            padding: "10px 4px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "property" ? "3px solid var(--primary)" : "3px solid transparent",
            color: activeTab === "property" ? "var(--primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "property" ? "700" : "500",
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Images size={18} />
          Property &amp; Exterior Photos ({photos.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          style={{
            padding: "10px 4px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "rooms" ? "3px solid var(--primary)" : "3px solid transparent",
            color: activeTab === "rooms" ? "var(--primary)" : "var(--text-secondary)",
            fontWeight: activeTab === "rooms" ? "700" : "500",
            fontSize: "0.95rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <BedDouble size={18} />
          Room Photos Overview ({rooms.reduce((acc, r) => acc + (r.photos?.length || 0), 0)})
        </button>
      </div>

      {/* TAB 1: Property & Exterior Photos */}
      {activeTab === "property" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Category Filter Pills */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "999px",
                  border: "1px solid",
                  borderColor: selectedCategory === "All" ? "var(--primary)" : "var(--border-color)",
                  backgroundColor: selectedCategory === "All" ? "var(--primary)" : "#FFFFFF",
                  color: selectedCategory === "All" ? "#FFFFFF" : "var(--text-secondary)",
                  fontSize: "0.825rem",
                  fontWeight: selectedCategory === "All" ? "700" : "500",
                  cursor: "pointer",
                }}
              >
                All Categories ({photos.length})
              </button>

              {categories.map((cat) => {
                const count = photos.filter((p) => p.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "999px",
                      border: "1px solid",
                      borderColor: isSelected ? "var(--primary)" : "var(--border-color)",
                      backgroundColor: isSelected ? "var(--primary)" : "#FFFFFF",
                      color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                      fontSize: "0.825rem",
                      fontWeight: isSelected ? "700" : "500",
                      cursor: "pointer",
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Tip: Use arrows on photo cards to reorder how they appear on the live gallery.
            </span>
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                border: "1px dashed var(--border-color)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#FFFFFF",
                color: "var(--text-muted)",
              }}
            >
              <Images size={40} style={{ margin: "0 auto 12px auto", opacity: 0.3 }} />
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", color: "var(--text-primary)" }}>
                No photos found in this category
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.875rem" }}>
                Click &quot;Upload Photos&quot; or &quot;Add by URL&quot; above to add images to {selectedCategory}.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                style={{ padding: "8px 18px", fontSize: "0.85rem" }}
              >
                <Upload size={14} /> Upload First Photo
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--shadow-sm)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {/* Photo Container */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "66.66%", // 3:2 aspect ratio
                      backgroundColor: "#F3F4F6",
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.title}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/hero_sunset.jpg";
                      }}
                    />

                    {/* Category Pill Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: "rgba(0, 0, 0, 0.65)",
                        color: "#FFFFFF",
                        padding: "4px 9px",
                        borderRadius: "999px",
                        fontSize: "0.725rem",
                        fontWeight: "600",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {photo.category}
                    </div>

                    {/* Order Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        color: "#1F2937",
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                      }}
                    >
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                      {photo.title}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--border-color)",
                        marginTop: "auto",
                      }}
                    >
                      {/* Reorder Controls */}
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(idx, "left")}
                          disabled={idx === 0}
                          title="Move earlier"
                          style={{
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "#FFFFFF",
                            color: idx === 0 ? "var(--text-muted)" : "var(--text-primary)",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(idx, "right")}
                          disabled={idx === filteredPhotos.length - 1}
                          title="Move later"
                          style={{
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "#FFFFFF",
                            color: idx === filteredPhotos.length - 1 ? "var(--text-muted)" : "var(--text-primary)",
                            cursor: idx === filteredPhotos.length - 1 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(photo)}
                          className="btn btn-outline"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo)}
                          className="btn btn-outline"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            color: "#EF4444",
                            borderColor: "#FCA5A5",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Room Photos Overview */}
      {activeTab === "rooms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FCD34D",
              color: "#92400E",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <strong>Room Photos are synchronized with your Room Configurations.</strong>
              <div style={{ fontSize: "0.825rem", marginTop: "2px" }}>
                To upload new photos, rearrange thumbnails, or delete photos for a specific room, click &quot;Manage Room Photos&quot;.
              </div>
            </div>
            <Link href="/admin/rooms" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Go to Room Configuration
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                className="card"
                style={{
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <BedDouble size={20} style={{ color: "var(--primary)" }} />
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "600" }}>{room.name}</h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                        fontWeight: "600",
                      }}
                    >
                      {room.photos?.length || 0} Photos
                    </span>
                  </div>

                  <Link
                    href={`/admin/rooms`}
                    className="btn btn-outline"
                    style={{
                      padding: "6px 14px",
                      fontSize: "0.8rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Edit2 size={13} /> Edit {room.name} Photos
                  </Link>
                </div>

                {room.photos && room.photos.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {room.photos.map((src, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "100%",
                          paddingTop: "66.66%",
                          borderRadius: "var(--radius-sm)",
                          overflow: "hidden",
                          border: "1px solid var(--border-color)",
                          backgroundColor: "#F3F4F6",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${room.name} ${idx + 1}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {idx === 0 && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "6px",
                              left: "6px",
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: "#FBBF24",
                              fontSize: "0.65rem",
                              fontWeight: "700",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Cover Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                    No photos added for this room yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add Photo via URL or Edit Photo */}
      {(showAddUrlModal || editingPhoto) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-md)",
              padding: "28px",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "600" }}>
                {editingPhoto ? "Edit Photo Details" : "Add Photo by URL"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddUrlModal(false);
                  setEditingPhoto(null);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Image URL Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                  IMAGE URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or /images/..."
                  value={formSrc}
                  onChange={(e) => setFormSrc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Live Preview if URL is given */}
              {formSrc.trim() && (
                <div style={{ width: "100%", height: "160px", borderRadius: "var(--radius-sm)", overflow: "hidden", backgroundColor: "#F3F4F6", border: "1px solid var(--border-color)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formSrc}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Title Input */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "6px" }}>
                  PHOTO TITLE / CAPTION
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Garden & Archway"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Category Selector */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>CATEGORY / ALBUM</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    style={{ background: "none", border: "none", fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline" }}
                  >
                    {isCustomCategory ? "Choose existing" : "+ New category"}
                  </button>
                </div>

                {isCustomCategory ? (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Terrace &amp; Views, Dining Area"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.95rem",
                    }}
                  />
                ) : (
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.95rem",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUrlModal(false);
                    setEditingPhoto(null);
                  }}
                  className="btn btn-outline"
                  style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                >
                  {editingPhoto ? "Save Changes" : "Add Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
