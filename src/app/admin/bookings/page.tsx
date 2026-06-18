'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Booking } from '@/lib/types';
import { Calendar, Users, Phone, Mail, FileText, CheckCircle, XCircle, DollarSign, Search, Filter } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await db.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Booking['status'], payment_status?: Booking['payment_status']) => {
    try {
      await db.updateBookingStatus(id, status, payment_status);
      fetchBookings(); // Refresh database state
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Filter and Search logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_phone.includes(searchQuery) ||
      (b.room_name && b.room_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Calculate quick stats
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.amount_total), 0);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Bookings</h1>
        <p>Loading bookings ledger...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Bookings Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Approve stay requests, monitor calendar blockades, and verify guest details.</p>
      </div>

      {/* 2. Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pending Requests</span>
          <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '8px', color: 'var(--accent)' }}>{pendingCount}</div>
        </div>
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Confirmed Bookings</span>
          <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '8px', color: 'var(--secondary)' }}>{confirmedCount}</div>
        </div>
        <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</span>
          <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>₹{totalRevenue}</div>
        </div>
      </div>

      {/* 3. Filter Controls */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search guest name or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: filterStatus === status ? 'var(--primary-light)' : '#FFFFFF',
                color: filterStatus === status ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: filterStatus === status ? '600' : '400',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bookings Ledger */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No bookings matches the current filters.</p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Guest Summary */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    backgroundColor:
                      b.status === 'confirmed'
                        ? 'var(--secondary-light)'
                        : b.status === 'pending'
                        ? '#FEF3C7'
                        : b.status === 'cancelled'
                        ? '#FEE2E2'
                        : '#E7E5E4',
                    color:
                      b.status === 'confirmed'
                        ? 'var(--secondary)'
                        : b.status === 'pending'
                        ? 'var(--accent)'
                        : b.status === 'cancelled'
                        ? '#991B1B'
                        : 'var(--text-secondary)',
                  }}
                >
                  {b.status}
                </span>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{b.guest_name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} /> {b.guest_phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} /> {b.guest_email}
                  </span>
                </div>
              </div>

              {/* Middle Column: Room & Dates */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>{b.room_name}</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} /> {b.check_in} to {b.check_out}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} /> {b.num_guests} Guest{b.num_guests > 1 ? 's' : ''}
                  </span>
                </div>
                
                {b.notes && (
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                    <FileText size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>"{b.notes}"</span>
                  </div>
                )}
              </div>

              {/* Right Column: Pricing & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between', height: '100%' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '700' }}>₹{b.amount_total}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: b.payment_status === 'paid' ? 'var(--secondary)' : '#EF4444',
                      }}
                    />
                    <span>Payment: <strong style={{ textTransform: 'capitalize' }}>{b.payment_status}</strong> ({b.payment_method === 'at_property' ? 'At Property' : 'Online'})</span>
                  </div>
                </div>

                {/* Operations buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                      >
                        <CheckCircle size={12} /> Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', color: '#EF4444', borderColor: '#FCA5A5' }}
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'completed')}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                      >
                        <CheckCircle size={12} /> Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', color: '#EF4444', borderColor: '#FCA5A5' }}
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    </>
                  )}

                  {b.payment_status === 'unpaid' && (b.status === 'confirmed' || b.status === 'completed') && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, b.status, 'paid')}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      <DollarSign size={12} /> Mark Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
