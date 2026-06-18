'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Room } from '@/lib/types';
import { BedDouble, Users, Plus, Edit2, CheckCircle, XCircle, Save, X } from 'lucide-react';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit/Add modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxGuests, setMaxGuests] = useState(2);
  const [basePrice, setBasePrice] = useState(3000);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const availableAmenities = [
    'Air Conditioning',
    'High-Speed Wi-Fi',
    'King Bed',
    'Queen Bed',
    'Verandah',
    'Geyser',
    'Tea/Coffee Maker',
    'Mini Fridge',
    'Work Desk',
    'Private Balcony',
    'Outdoor Shower',
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
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setName('');
    setDescription('');
    setMaxGuests(2);
    setBasePrice(3000);
    setAmenities([]);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setDescription(room.description);
    setMaxGuests(room.max_guests);
    setBasePrice(room.base_price);
    setAmenities(room.amenities);
    setStatus(room.status);
    setIsModalOpen(true);
  };

  const handleToggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !basePrice) return;

    const roomPayload: Room = {
      id: editingRoom ? editingRoom.id : `room-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      max_guests: maxGuests,
      base_price: Number(basePrice),
      amenities,
      photos: editingRoom ? editingRoom.photos : ['/images/room_mango_suite.jpg'], // default photo if new
      status,
    };

    try {
      await db.saveRoom(roomPayload);
      setIsModalOpen(false);
      fetchRooms(); // refresh state
    } catch (err) {
      console.error('Error saving room:', err);
    }
  };

  const handleToggleStatus = async (room: Room) => {
    const updatedRoom: Room = {
      ...room,
      status: room.status === 'active' ? 'inactive' : 'active',
    };
    try {
      await db.saveRoom(updatedRoom);
      fetchRooms();
    } catch (err) {
      console.error('Error toggling room status:', err);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Rooms</h1>
        <p>Loading rooms list...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Room Configuration</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Add or modify homestay chambers, configure details, pricing, and status.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add New Room
        </button>
      </div>

      {/* 2. Rooms Listing Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {rooms.map((room) => (
          <div key={room.id} className="card" style={{ display: 'flex', flexDirection: 'column', opacity: room.status === 'inactive' ? 0.75 : 1 }}>
            <div style={{ height: '180px', position: 'relative' }}>
              <img src={room.photos[0] || '/images/room_mango_suite.jpg'} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '4px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem' }}>
                ₹{room.base_price} / night
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{room.name}</h3>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: room.status === 'active' ? 'var(--secondary-light)' : '#E7E5E4',
                    color: room.status === 'active' ? 'var(--secondary)' : 'var(--text-secondary)',
                  }}
                >
                  {room.status}
                </span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', flex: 1 }}>
                {room.description.length > 100 ? `${room.description.substring(0, 100)}...` : room.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Users size={14} /> Max Guests: {room.max_guests}
              </div>

              {/* Actions row */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
                <button
                  onClick={() => openEditModal(room)}
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', flex: 1 }}
                >
                  <Edit2 size={12} /> Edit Room
                </button>
                <button
                  onClick={() => handleToggleStatus(room)}
                  className="btn btn-outline"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    flex: 1,
                    color: room.status === 'active' ? '#EF4444' : 'var(--secondary)',
                    borderColor: room.status === 'active' ? '#FCA5A5' : 'var(--secondary-light)',
                  }}
                >
                  {room.status === 'active' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                  {room.status === 'active' ? 'Deactivate' : 'Activate'}
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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(28, 25, 23, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '600px',
              backgroundColor: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', marginBottom: '24px' }}>
              {editingRoom ? 'Edit Room Settings' : 'Add New Stay Chamber'}
            </h2>

            <form onSubmit={handleSaveRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Room Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>ROOM NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mango Orchard Suite"
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>

              {/* Price & Max Guests */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>BASE PRICE (₹ / night)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>MAX GUESTS</label>
                  <input
                    type="number"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>DESCRIPTION</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the room characteristics, view details..."
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', resize: 'none' }}
                />
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '12px' }}>AMENITIES</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                  {availableAmenities.map((amenity) => {
                    const isChecked = amenities.includes(amenity);
                    return (
                      <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleAmenity(amenity)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>STATUS</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="active">Active (Visible on public site)</option>
                  <option value="inactive">Inactive (Hidden from public site)</option>
                </select>
              </div>

              {/* Save Button */}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px' }}>
                Save Configuration <Save size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
