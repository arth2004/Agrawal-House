"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Room } from "@/lib/types";
import {
  BedDouble,
  Users,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Upload,
  Star,
  Trash2,
  Camera,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Add modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxGuests, setMaxGuests] = useState(2);
  const [basePrice, setBasePrice] = useState(3000);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const availableAmenities = [
    "Air Conditioning",
    "High-Speed Wi-Fi",
    "King Bed",
    "Queen Bed",
    "Verandah",
    "Geyser",
    "Tea/Coffee Maker",
    "Mini Fridge",
    "Work Desk",
    "Private Balcony",
    "Outdoor Shower",
  ];

  // Fetch rooms list on load
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await db.getRooms();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setName("");
    setDescription("");
    setMaxGuests(2);
    setBasePrice(3000);
    setAmenities([]);
    setPhotos(["/images/room_mango_suite.jpg"]);
    setNewUrlInput("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setDescription(room.description);
    setMaxGuests(room.max_guests);
    setBasePrice(room.base_price);
    setAmenities(room.amenities);
    setPhotos(
      room.photos && room.photos.length > 0
        ? [...room.photos]
        : ["/images/room_mango_suite.jpg"]
    );
    setNewUrlInput("");
    setStatus(room.status);
    setIsModalOpen(true);
  };

  const handleToggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const photoUrl = await db.uploadRoomPhoto(file);
        setPhotos((prev) => [...prev, photoUrl]);
      } catch (err) {
        console.error("Error uploading room photo:", err);
      }
    }
    e.target.value = "";
  };

  const handleAddPhotoUrl = () => {
    const url = newUrlInput.trim();
    if (!url) return;
    setPhotos((prev) => [...prev, url]);
    setNewUrlInput("");
  };

  const handleMakeThumbnail = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      return [selected, ...updated];
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= photos.length) return;
    setPhotos((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !basePrice) return;

    const roomPayload: Room = {
      id: editingRoom ? editingRoom.id : crypto.randomUUID(),
      name,
      description,
      max_guests: maxGuests,
      base_price: Number(basePrice),
      amenities,
      photos: photos.length > 0 ? photos : ["/images/room_mango_suite.jpg"],
      status,
    };

    try {
      await db.saveRoom(roomPayload);
      setIsModalOpen(false);
      fetchRooms(); // refresh state
    } catch (err) {
      console.error("Error saving room:", err);
    }
  };

  const handleToggleStatus = async (room: Room) => {
    const updatedRoom: Room = {
      ...room,
      status: room.status === "active" ? "inactive" : "active",
    };
    try {
      await db.saveRoom(updatedRoom);
      fetchRooms();
    } catch (err) {
      console.error("Error toggling room status:", err);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "24px" }}>Rooms</h1>
        <p>Loading rooms list...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 1. Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontFamily: "var(--font-serif)",
              marginBottom: "8px",
            }}
          >
            Room Configuration
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Add or modify homestay chambers, configure details, pricing, and
            status.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add New Room
        </button>
      </div>

      {/* 2. Rooms Listing Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px",
        }}
      >
        {rooms.map((room) => (
          <div
            key={room.id}
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              opacity: room.status === "inactive" ? 0.75 : 1,
            }}
          >
            <div style={{ height: "180px", position: "relative" }}>
              <img
                src={room.photos[0] || "/images/room_mango_suite.jpg"}
                alt={room.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  backgroundColor: "var(--primary)",
                  color: "#FFFFFF",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                }}
              >
                ₹{room.base_price} / night
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  backgroundColor: "rgba(28, 25, 23, 0.8)",
                  color: "#FFFFFF",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Camera size={12} /> {room.photos ? room.photos.length : 0} photos
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <h3 style={{ fontSize: "1.25rem" }}>{room.name}</h3>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    backgroundColor:
                      room.status === "active"
                        ? "var(--secondary-light)"
                        : "#E7E5E4",
                    color:
                      room.status === "active"
                        ? "var(--secondary)"
                        : "var(--text-secondary)",
                  }}
                >
                  {room.status}
                </span>
              </div>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                  flex: 1,
                }}
              >
                {room.description.length > 100
                  ? `${room.description.substring(0, 100)}...`
                  : room.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                <Users size={14} /> Max Guests: {room.max_guests}
              </div>

              {/* Actions row */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "16px",
                  marginTop: "12px",
                }}
              >
                <button
                  onClick={() => openEditModal(room)}
                  className="btn btn-outline"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                    flex: 1,
                  }}
                >
                  <Edit2 size={12} /> Edit Room
                </button>
                <button
                  onClick={() => handleToggleStatus(room)}
                  className="btn btn-outline"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                    flex: 1,
                    color:
                      room.status === "active" ? "#EF4444" : "var(--secondary)",
                    borderColor:
                      room.status === "active"
                        ? "#FCA5A5"
                        : "var(--secondary-light)",
                  }}
                >
                  {room.status === "active" ? (
                    <XCircle size={12} />
                  ) : (
                    <CheckCircle size={12} />
                  )}
                  {room.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Add/Edit Room Modal Dialog */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(28, 25, 23, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "24px",
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: "100%",
              maxWidth: "600px",
              backgroundColor: "#FFFFFF",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              position: "relative",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              <X size={24} />
            </button>

            <h2
              style={{
                fontSize: "1.8rem",
                fontFamily: "var(--font-serif)",
                marginBottom: "24px",
              }}
            >
              {editingRoom ? "Edit Room Settings" : "Add New Stay Chamber"}
            </h2>

            <form
              onSubmit={handleSaveRoom}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Room Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  ROOM NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mango Orchard Suite"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Price & Max Guests */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    BASE PRICE (₹ / night)
                  </label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    MAX GUESTS
                  </label>
                  <input
                    type="number"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  DESCRIPTION
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the room characteristics, view details..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "12px",
                  }}
                >
                  AMENITIES
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {availableAmenities.map((amenity) => {
                    const isChecked = amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          style={{ accentColor: "var(--primary)" }}
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Room Photos & Thumbnail Selection */}
              <div
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  backgroundColor: "#FAFAF9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Camera size={16} style={{ color: "var(--primary)" }} />
                    ROOM PHOTOS & THUMBNAIL ({photos.length})
                  </label>

                  <label
                    className="btn btn-outline"
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Upload size={14} /> Upload Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                    lineHeight: "1.4",
                  }}
                >
                  Upload image files or add URL links. The photo marked as <strong>★ Main Thumbnail</strong> (first image) will be shown as the primary room cover.
                </p>

                {/* Add photo via URL */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <input
                    type="text"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    placeholder="Or enter image path (e.g. /images/bed-1a.jpg or URL)"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.85rem",
                      outline: "none",
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="btn btn-outline"
                    style={{ padding: "8px 12px", fontSize: "0.75rem", flexShrink: 0, backgroundColor: "#FFFFFF" }}
                  >
                    <Plus size={14} /> Add URL
                  </button>
                </div>

                {/* Photos List Grid */}
                {photos.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      border: "1px dashed var(--border-color)",
                      borderRadius: "6px",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    No photos added yet. Upload files or paste image URLs above.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {photos.map((photoUrl, idx) => {
                      const isThumbnail = idx === 0;
                      return (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            borderRadius: "6px",
                            overflow: "hidden",
                            border: isThumbnail
                              ? "2px solid var(--primary)"
                              : "1px solid var(--border-color)",
                            backgroundColor: "#FFFFFF",
                            boxShadow: isThumbnail ? "0 2px 8px rgba(180,83,9,0.25)" : "none",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div style={{ position: "relative", height: "90px", backgroundColor: "#E5E7EB" }}>
                            <img
                              src={photoUrl}
                              alt={`Room photo ${idx + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />

                            {/* Thumbnail Badge */}
                            {isThumbnail && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  left: "4px",
                                  backgroundColor: "var(--primary)",
                                  color: "#FFFFFF",
                                  fontSize: "0.65rem",
                                  fontWeight: "700",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                }}
                              >
                                <Star size={10} fill="#FFFFFF" /> Main
                              </span>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              title="Delete photo"
                              style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                backgroundColor: "rgba(239, 68, 68, 0.9)",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "4px",
                                width: "22px",
                                height: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Controls bar */}
                          <div
                            style={{
                              padding: "6px 8px",
                              backgroundColor: isThumbnail ? "#FEF3C7" : "#F5F5F4",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderTop: "1px solid var(--border-color)",
                            }}
                          >
                            {!isThumbnail ? (
                              <button
                                type="button"
                                onClick={() => handleMakeThumbnail(idx)}
                                className="btn"
                                style={{
                                  padding: "2px 6px",
                                  fontSize: "0.65rem",
                                  fontWeight: "600",
                                  backgroundColor: "#FFFFFF",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "3px",
                                  color: "var(--primary)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  cursor: "pointer",
                                }}
                              >
                                <Star size={10} /> Set Main
                              </button>
                            ) : (
                              <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--primary)" }}>
                                ★ Primary
                              </span>
                            )}

                            {/* Reorder Arrows */}
                            <div style={{ display: "flex", gap: "2px" }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePhoto(idx, "left")}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: idx === 0 ? "default" : "pointer",
                                  opacity: idx === 0 ? 0.3 : 1,
                                  padding: "2px",
                                }}
                              >
                                <ArrowLeft size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === photos.length - 1}
                                onClick={() => handleMovePhoto(idx, "right")}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: idx === photos.length - 1 ? "default" : "pointer",
                                  opacity: idx === photos.length - 1 ? 0.3 : 1,
                                  padding: "2px",
                                }}
                              >
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status toggle */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  STATUS
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "active" | "inactive")
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <option value="active">
                    Active (Visible on public site)
                  </option>
                  <option value="inactive">
                    Inactive (Hidden from public site)
                  </option>
                </select>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "14px", marginTop: "12px" }}
              >
                Save Configuration <Save size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
