"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Room, PricingRule } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Tag,
  Calendar,
  Sliders,
  Power,
} from "lucide-react";

export default function AdminPricingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  // Form states
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceModifier, setPriceModifier] = useState(1.0);
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, rulesData] = await Promise.all([
        db.getRooms(),
        db.getPricingRules(),
      ]);
      setRooms(roomsData);
      setRules(rulesData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRule(null);
    setSelectedRoomId(rooms[0]?.id || "");
    setRuleName("");
    setStartDate("");
    setEndDate("");
    setPriceModifier(1.0);
    setPriority(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: PricingRule) => {
    setEditingRule(rule);
    setSelectedRoomId(rule.room_id);
    setRuleName(rule.name);
    setStartDate(rule.start_date);
    setEndDate(rule.end_date);
    setPriceModifier(rule.price_modifier);
    setPriority(rule.priority);
    setIsActive(rule.is_active);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !ruleName || !startDate || !endDate) return;

    if (startDate > endDate) {
      alert("Start date must be before or equal to end date.");
      return;
    }

    try {
      if (editingRule) {
        await db.updatePricingRule(editingRule.id, {
          room_id: selectedRoomId,
          name: ruleName,
          start_date: startDate,
          end_date: endDate,
          price_modifier: priceModifier,
          priority,
          is_active: isActive,
        });
      } else {
        await db.addPricingRule({
          room_id: selectedRoomId,
          name: ruleName,
          start_date: startDate,
          end_date: endDate,
          price_modifier: priceModifier,
          priority,
          is_active: isActive,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving pricing rule:", err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing rule?")) return;
    try {
      await db.deletePricingRule(id);
      fetchData();
    } catch (err) {
      console.error("Error deleting pricing rule:", err);
    }
  };

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || "Unknown Room";
  };

  const formatModifier = (mod: number) => {
    if (mod > 1) return `+${Math.round((mod - 1) * 100)}%`;
    if (mod < 1) return `-${Math.round((1 - mod) * 100)}%`;
    return "Base price";
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "24px" }}>
          Pricing Rules
        </h1>
        <p>Loading pricing rules...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
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
            Dynamic Pricing Rules
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Set date-based pricing for rooms. Higher priority rules take
            precedence when multiple rules overlap.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add Pricing Rule
        </button>
      </div>

      {/* Rules Table */}
      {rules.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "48px",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Tag size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
            No pricing rules yet
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Create your first rule to set dynamic prices for specific dates.
          </p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} /> Create First Rule
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {rules
            .sort((a, b) => b.priority - a.priority)
            .map((rule) => (
              <div
                key={rule.id}
                className="card"
                style={{
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  opacity: rule.is_active ? 1 : 0.6,
                }}
              >
                <div style={{ flex: 1, minWidth: "240px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                      {rule.name}
                    </h3>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        backgroundColor: rule.is_active
                          ? "var(--secondary-light)"
                          : "#E7E5E4",
                        color: rule.is_active
                          ? "var(--secondary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {rule.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      marginBottom: "8px",
                    }}
                  >
                    {getRoomName(rule.room_id)}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={14} />
                      {rule.start_date} → {rule.end_date}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Sliders size={14} />
                      {formatModifier(rule.price_modifier)} (x{rule.price_modifier})
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Power size={14} />
                      Priority: {rule.priority}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => openEditModal(rule)}
                    className="btn btn-outline"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.8rem",
                      borderRadius: "4px",
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="btn btn-outline"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.8rem",
                      borderRadius: "4px",
                      color: "#EF4444",
                      borderColor: "#FCA5A5",
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
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
              {editingRule ? "Edit Pricing Rule" : "Add Pricing Rule"}
            </h2>

            <form
              onSubmit={handleSaveRule}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Room Selection */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  ROOM
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} (₹{room.base_price}/night)
                    </option>
                  ))}
                </select>
              </div>

              {/* Rule Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  RULE NAME
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Weekend Surge, Off-Season Discount"
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

              {/* Date Range */}
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
                    START DATE
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                    END DATE
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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

              {/* Price Modifier */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  PRICE MODIFIER (multiplier)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={priceModifier}
                  onChange={(e) => setPriceModifier(Number(e.target.value))}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "6px",
                  }}
                >
                  {priceModifier > 1
                    ? `${formatModifier(priceModifier)} surcharge`
                    : priceModifier < 1
                    ? `${formatModifier(priceModifier)} discount`
                    : "No change (base price)"}
                </p>
              </div>

              {/* Priority */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  PRIORITY
                </label>
                <input
                  type="number"
                  min="0"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    marginTop: "6px",
                  }}
                >
                  Higher numbers take precedence when multiple rules overlap.
                </p>
              </div>

              {/* Active Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <input
                  type="checkbox"
                  id="is_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ accentColor: "var(--primary)" }}
                />
                <label
                  htmlFor="is_active"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Active (rule is applied to bookings)
                </label>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "14px", marginTop: "12px" }}
              >
                <Save size={16} />{" "}
                {editingRule ? "Update Rule" : "Create Rule"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}