"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Check,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface GroupedPricingRule {
  key: string;
  name: string;
  start_date: string;
  end_date: string;
  price_modifier: number;
  priority: number;
  is_active: boolean;
  room_ids: string[];
  rule_ids: string[];
}

export default function AdminPricingPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filter state
  const [selectedFilterRoomId, setSelectedFilterRoomId] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupedPricingRule | null>(null);

  // Form states
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceModifier, setPriceModifier] = useState(1.1);
  const [priority, setPriority] = useState(1);
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
      console.error("Error fetching pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group rules that share the exact same attributes across rooms
  const groupedRules: GroupedPricingRule[] = useMemo(() => {
    const map = new Map<string, GroupedPricingRule>();

    rules.forEach((rule) => {
      const key = `${rule.name}__${rule.start_date}__${rule.end_date}__${rule.price_modifier}__${rule.priority}__${rule.is_active}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: rule.name,
          start_date: rule.start_date,
          end_date: rule.end_date,
          price_modifier: rule.price_modifier,
          priority: rule.priority,
          is_active: rule.is_active,
          room_ids: [rule.room_id],
          rule_ids: [rule.id],
        });
      } else {
        const existing = map.get(key)!;
        if (!existing.room_ids.includes(rule.room_id)) {
          existing.room_ids.push(rule.room_id);
        }
        if (!existing.rule_ids.includes(rule.id)) {
          existing.rule_ids.push(rule.id);
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.priority - a.priority);
  }, [rules]);

  // Filtered grouped rules based on the room filter pill
  const filteredGroups = useMemo(() => {
    if (selectedFilterRoomId === "all") return groupedRules;
    return groupedRules.filter((g) => g.room_ids.includes(selectedFilterRoomId));
  }, [groupedRules, selectedFilterRoomId]);

  const openAddModal = () => {
    setEditingGroup(null);
    // By default, select all rooms for user convenience
    setSelectedRoomIds(rooms.map((r) => r.id));
    setRuleName("");
    setStartDate("");
    setEndDate("");
    setPriceModifier(1.1);
    setPriority(1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (group: GroupedPricingRule) => {
    setEditingGroup(group);
    setSelectedRoomIds([...group.room_ids]);
    setRuleName(group.name);
    setStartDate(group.start_date);
    setEndDate(group.end_date);
    setPriceModifier(group.price_modifier);
    setPriority(group.priority);
    setIsActive(group.is_active);
    setIsModalOpen(true);
  };

  // Toggle selection for a single room
  const toggleRoomSelection = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  // Select all rooms
  const selectAllRooms = () => {
    setSelectedRoomIds(rooms.map((r) => r.id));
  };

  // Deselect all rooms
  const clearRoomSelection = () => {
    setSelectedRoomIds([]);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoomIds.length === 0) {
      alert("Please select at least one room for this pricing rule.");
      return;
    }
    if (!ruleName.trim() || !startDate || !endDate) {
      alert("Please fill in all required fields.");
      return;
    }
    if (startDate > endDate) {
      alert("Start date must be before or equal to end date.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingGroup) {
        // Editing existing grouped rule:
        const oldRoomIds = editingGroup.room_ids;
        const newRoomIds = selectedRoomIds;

        // 1. Rooms to update (in both old and new)
        const roomsToUpdate = newRoomIds.filter((id) => oldRoomIds.includes(id));
        const updatePromises = roomsToUpdate.map(async (roomId) => {
          // Find the existing rule ID for this room in editingGroup
          const matchingRule = rules.find(
            (r) =>
              editingGroup.rule_ids.includes(r.id) && r.room_id === roomId
          );
          if (matchingRule) {
            return db.updatePricingRule(matchingRule.id, {
              room_id: roomId,
              name: ruleName.trim(),
              start_date: startDate,
              end_date: endDate,
              price_modifier: priceModifier,
              priority,
              is_active: isActive,
            });
          }
        });

        // 2. Rooms to create (in new but not in old)
        const roomsToAdd = newRoomIds.filter((id) => !oldRoomIds.includes(id));
        const rulesToAdd = roomsToAdd.map((roomId) => ({
          room_id: roomId,
          name: ruleName.trim(),
          start_date: startDate,
          end_date: endDate,
          price_modifier: priceModifier,
          priority,
          is_active: isActive,
        }));
        const addPromise = db.addPricingRules(rulesToAdd);

        // 3. Rooms to delete (in old but not in new)
        const roomsToRemove = oldRoomIds.filter((id) => !newRoomIds.includes(id));
        const ruleIdsToDelete = rules
          .filter(
            (r) =>
              editingGroup.rule_ids.includes(r.id) &&
              roomsToRemove.includes(r.room_id)
          )
          .map((r) => r.id);
        const deletePromise = db.deletePricingRules(ruleIdsToDelete);

        await Promise.all([...updatePromises, addPromise, deletePromise]);
      } else {
        // Creating new rule for all selected rooms
        const rulesToCreate = selectedRoomIds.map((roomId) => ({
          room_id: roomId,
          name: ruleName.trim(),
          start_date: startDate,
          end_date: endDate,
          price_modifier: priceModifier,
          priority,
          is_active: isActive,
        }));

        await db.addPricingRules(rulesToCreate);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error saving pricing rule:", err);
      alert("Failed to save pricing rule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (group: GroupedPricingRule) => {
    const roomCountText =
      group.room_ids.length === rooms.length
        ? "all rooms"
        : `${group.room_ids.length} room(s)`;

    if (
      !confirm(
        `Are you sure you want to delete the pricing rule "${group.name}"?\nIt will be removed from ${roomCountText}.`
      )
    ) {
      return;
    }

    try {
      await db.deletePricingRules(group.rule_ids);
      await fetchData();
    } catch (err) {
      console.error("Error deleting pricing rule:", err);
      alert("Failed to delete pricing rule. Please try again.");
    }
  };

  const getRoom = (roomId: string) => {
    return rooms.find((r) => r.id === roomId);
  };

  const formatModifier = (mod: number) => {
    if (mod > 1) return `+${Math.round((mod - 1) * 100)}%`;
    if (mod < 1) return `-${Math.round((1 - mod) * 100)}%`;
    return "Base price";
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>
          Dynamic Pricing Rules
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Loading pricing rules & rooms...
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 1. Header Section */}
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
              fontSize: "2.4rem",
              fontFamily: "var(--font-serif)",
              marginBottom: "8px",
              color: "var(--text-primary)",
            }}
          >
            Dynamic Pricing Rules
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Set date-based price surges or discounts. Apply a single rule to <strong>multiple rooms</strong> or <strong>all rooms</strong> in one click.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            fontSize: "0.95rem",
            fontWeight: "600",
          }}
        >
          <Plus size={18} /> Add Pricing Rule
        </button>
      </div>

      {/* 2. Room Filter Pills */}
      {rooms.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            padding: "12px 16px",
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginRight: "4px",
            }}
          >
            Filter by Room:
          </span>
          <button
            onClick={() => setSelectedFilterRoomId("all")}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.82rem",
              fontWeight: "600",
              cursor: "pointer",
              border: "1px solid",
              borderColor:
                selectedFilterRoomId === "all"
                  ? "var(--primary)"
                  : "var(--border-color)",
              backgroundColor:
                selectedFilterRoomId === "all"
                  ? "var(--primary)"
                  : "#F9F8F6",
              color:
                selectedFilterRoomId === "all" ? "#FFFFFF" : "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            All Rooms ({groupedRules.length})
          </button>
          {rooms.map((room) => {
            const count = groupedRules.filter((g) =>
              g.room_ids.includes(room.id)
            ).length;
            const isSelected = selectedFilterRoomId === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedFilterRoomId(room.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: isSelected
                    ? "var(--primary)"
                    : "var(--border-color)",
                  backgroundColor: isSelected ? "var(--primary)" : "#F9F8F6",
                  color: isSelected ? "#FFFFFF" : "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
              >
                {room.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Rules Cards List */}
      {filteredGroups.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "48px 24px",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Tag
            size={48}
            style={{ color: "var(--text-muted)", marginBottom: "16px" }}
          />
          <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
            {selectedFilterRoomId === "all"
              ? "No pricing rules yet"
              : "No rules for this room"}
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "24px",
              maxWidth: "420px",
              margin: "0 auto 24px auto",
            }}
          >
            {selectedFilterRoomId === "all"
              ? "Create your first dynamic pricing rule (e.g. Weekend Surcharge or Festival Peak) to apply across any or all rooms."
              : "No specific rules apply to this room. You can create a new rule or select 'All Rooms' above."}
          </p>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} /> Create Rule
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredGroups.map((group) => {
            const isAllRooms =
              rooms.length > 0 && group.room_ids.length === rooms.length;
            const isSurcharge = group.price_modifier > 1;
            const isDiscount = group.price_modifier < 1;

            return (
              <div
                key={group.key}
                className="card"
                style={{
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-color)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                  opacity: group.is_active ? 1 : 0.65,
                  transition: "box-shadow 0.2s ease",
                }}
              >
                {/* Left: Rule details */}
                <div style={{ flex: 1, minWidth: "280px" }}>
                  {/* Name + Active Status + Priority */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.18rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      {group.name}
                    </h3>

                    {/* Active Badge */}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        backgroundColor: group.is_active ? "#DCFCE7" : "#F3F4F6",
                        color: group.is_active ? "#15803D" : "#6B7280",
                      }}
                    >
                      {group.is_active ? "Active" : "Inactive"}
                    </span>

                    {/* Surcharge / Discount Pill */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        backgroundColor: isSurcharge
                          ? "#FEF3C7"
                          : isDiscount
                          ? "#E0E7FF"
                          : "#F3F4F6",
                        color: isSurcharge
                          ? "#B45309"
                          : isDiscount
                          ? "#4338CA"
                          : "#4B5563",
                      }}
                    >
                      {isSurcharge ? (
                        <TrendingUp size={12} />
                      ) : isDiscount ? (
                        <TrendingDown size={12} />
                      ) : null}
                      {formatModifier(group.price_modifier)} (x{group.price_modifier})
                    </span>

                    {/* Priority badge */}
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        fontWeight: "500",
                      }}
                    >
                      Priority: {group.priority}
                    </span>
                  </div>

                  {/* Applied Rooms Badges */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        fontWeight: "600",
                        marginRight: "2px",
                      }}
                    >
                      Applied Rooms:
                    </span>
                    {isAllRooms ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          backgroundColor: "#FEF9C3",
                          color: "#854D0E",
                          border: "1px solid #FEF08A",
                        }}
                      >
                        <Sparkles size={12} /> All Rooms ({rooms.length})
                      </span>
                    ) : (
                      group.room_ids.map((rId) => {
                        const room = getRoom(rId);
                        const basePrice = room?.base_price || 0;
                        const adjusted = Math.round(
                          basePrice * group.price_modifier
                        );
                        return (
                          <span
                            key={rId}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 8px",
                              borderRadius: "4px",
                              fontSize: "0.78rem",
                              fontWeight: "600",
                              backgroundColor: "#F9F8F6",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-color)",
                            }}
                          >
                            {room?.name || "Room"}
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: "0.72rem",
                                fontWeight: "normal",
                              }}
                            >
                              (₹{basePrice} → ₹{adjusted})
                            </span>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Date range & meta info */}
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      flexWrap: "wrap",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                      }}
                    >
                      <Calendar size={14} style={{ color: "var(--primary)" }} />
                      {group.start_date} → {group.end_date}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => openEditModal(group)}
                    className="btn btn-outline"
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.82rem",
                      borderRadius: "6px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    className="btn btn-outline"
                    style={{
                      padding: "8px 14px",
                      fontSize: "0.82rem",
                      borderRadius: "6px",
                      color: "#DC2626",
                      borderColor: "#FECACA",
                      backgroundColor: "#FFF5F5",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Multi-Room Pricing Rule Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(28, 25, 23, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: "100%",
              maxWidth: "680px",
              backgroundColor: "#FFFFFF",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "32px",
              position: "relative",
              boxShadow: "var(--shadow-xl)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => !isSaving && setIsModalOpen(false)}
              disabled={isSaving}
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
              <X size={22} />
            </button>

            {/* Modal Title */}
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "1.7rem",
                  fontFamily: "var(--font-serif)",
                  color: "var(--text-primary)",
                  marginBottom: "6px",
                }}
              >
                {editingGroup ? "Edit Pricing Rule" : "Add Dynamic Pricing Rule"}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                Select one, multiple, or all rooms that this pricing rule should apply to.
              </p>
            </div>

            <form
              onSubmit={handleSaveRule}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* 1. Rule Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "var(--text-primary)",
                    letterSpacing: "0.5px",
                  }}
                >
                  RULE NAME *
                </label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Weekend Surcharge, Sawan Peak, Diwali Festival, Monsoon Discount"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    outline: "none",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* 2. Room Multi-Selection (THE KEY FEATURE) */}
              <div>
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
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    APPLIES TO ROOMS *{" "}
                    <span style={{ fontWeight: "normal", color: "var(--text-muted)" }}>
                      ({selectedRoomIds.length} of {rooms.length} selected)
                    </span>
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={selectAllRooms}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Select All
                    </button>
                    <span style={{ color: "var(--border-color)" }}>|</span>
                    <button
                      type="button"
                      onClick={clearRoomSelection}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Room Cards Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "10px",
                    marginTop: "6px",
                  }}
                >
                  {rooms.map((room) => {
                    const isSelected = selectedRoomIds.includes(room.id);
                    const basePrice = room.base_price;
                    const calculatedPrice = Math.round(basePrice * priceModifier);

                    return (
                      <div
                        key={room.id}
                        onClick={() => toggleRoomSelection(room.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: isSelected
                            ? "2px solid var(--primary)"
                            : "1px solid var(--border-color)",
                          backgroundColor: isSelected ? "#FDF8F3" : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ paddingTop: "2px" }}>
                          {isSelected ? (
                            <CheckSquare
                              size={18}
                              style={{ color: "var(--primary)" }}
                            />
                          ) : (
                            <Square
                              size={18}
                              style={{ color: "var(--text-muted)" }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: "700",
                              color: isSelected
                                ? "var(--primary)"
                                : "var(--text-primary)",
                              marginBottom: "2px",
                            }}
                          >
                            {room.name}
                          </p>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>Base: ₹{basePrice}</span>
                            {priceModifier !== 1 && (
                              <span
                                style={{
                                  fontWeight: "700",
                                  color:
                                    priceModifier > 1 ? "#B45309" : "#15803D",
                                }}
                              >
                                → ₹{calculatedPrice}/n
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedRoomIds.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#DC2626",
                      marginTop: "6px",
                    }}
                  >
                    ⚠️ Please select at least one room for this rule to apply.
                  </p>
                )}
              </div>

              {/* 3. Date Range */}
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
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    START DATE *
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
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    END DATE *
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
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
              </div>

              {/* 4. Price Modifier (Multiplier) */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: "var(--text-primary)",
                    letterSpacing: "0.5px",
                  }}
                >
                  PRICE MODIFIER (Multiplier on Base Price) *
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="5.0"
                    value={priceModifier}
                    onChange={(e) => setPriceModifier(Number(e.target.value))}
                    required
                    style={{
                      width: "140px",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      outline: "none",
                      fontSize: "1rem",
                      fontWeight: "700",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Quick percentage helper presets */}
                    {[
                      { label: "+10%", value: 1.1 },
                      { label: "+20%", value: 1.2 },
                      { label: "+30%", value: 1.3 },
                      { label: "+50%", value: 1.5 },
                      { label: "-10%", value: 0.9 },
                      { label: "-20%", value: 0.8 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPriceModifier(preset.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          border: "1px solid var(--border-color)",
                          backgroundColor:
                            priceModifier === preset.value
                              ? "var(--primary)"
                              : "#F9F8F6",
                          color:
                            priceModifier === preset.value
                              ? "#FFFFFF"
                              : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color:
                      priceModifier > 1
                        ? "#B45309"
                        : priceModifier < 1
                        ? "#15803D"
                        : "var(--text-muted)",
                    marginTop: "8px",
                    fontWeight: "600",
                  }}
                >
                  {priceModifier > 1
                    ? `📈 ${formatModifier(priceModifier)} surcharge (e.g. ₹1,500 becomes ₹${Math.round(
                        1500 * priceModifier
                      )})`
                    : priceModifier < 1
                    ? `📉 ${formatModifier(priceModifier)} discount (e.g. ₹1,500 becomes ₹${Math.round(
                        1500 * priceModifier
                      )})`
                    : "No change (base price)"}
                </p>
              </div>

              {/* 5. Priority & Active Toggle */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    PRIORITY
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-color)",
                      outline: "none",
                      fontSize: "0.95rem",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Higher priority rules override lower ones during overlap.
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "var(--primary)",
                      cursor: "pointer",
                    }}
                  />
                  <label
                    htmlFor="is_active"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                    }}
                  >
                    Rule is Active
                  </label>
                </div>
              </div>

              {/* 6. Save Button */}
              <button
                type="submit"
                disabled={isSaving || selectedRoomIds.length === 0}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "8px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: isSaving || selectedRoomIds.length === 0 ? 0.6 : 1,
                  cursor:
                    isSaving || selectedRoomIds.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <Save size={18} />{" "}
                {isSaving
                  ? "Saving..."
                  : editingGroup
                  ? `Update Rule for ${selectedRoomIds.length} Room(s)`
                  : `Create Rule for ${selectedRoomIds.length} Room(s)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}