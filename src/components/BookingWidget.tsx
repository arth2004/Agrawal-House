'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { BlockedDate, Booking } from '@/lib/types';

interface BookingWidgetProps {
  roomId: string;
  basePrice: number;
  maxGuests: number;
  blockedDates: BlockedDate[];
  bookings: Booking[];
}

export default function BookingWidget({
  roomId,
  basePrice,
  maxGuests,
  blockedDates,
  bookings,
}: BookingWidgetProps) {
  const router = useRouter();
  
  // Date states
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  
  // Checking states
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [numNights, setNumNights] = useState(0);

  // Minimum date selection constraint (today)
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: check if range overlaps
  const checkOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    // Parse dates to compare timestamp values
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();

    // Standard interval overlap check: (s1 < e2) and (e1 > s2)
    return s1 < e2 && e1 > s2;
  };

  // Recalculate nights and availability status on date changes
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      if (end <= start) {
        setAvailabilityStatus('error');
        setMessage('Check-out date must be after check-in date.');
        setNumNights(0);
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNumNights(diffDays);
      setAvailabilityStatus('idle');
      setMessage('');
    } else {
      setNumNights(0);
      setAvailabilityStatus('idle');
      setMessage('');
    }
  }, [checkIn, checkOut]);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setAvailabilityStatus('error');
      setMessage('Please select both check-in and check-out dates.');
      return;
    }

    setIsChecking(true);

    setTimeout(() => {
      // 1. Check against blocked dates
      const isBlocked = blockedDates.some(block => 
        checkOverlap(checkIn, checkOut, block.start_date, block.end_date)
      );

      if (isBlocked) {
        setAvailabilityStatus('unavailable');
        setMessage('The selected dates overlap with a blocked maintenance window.');
        setIsChecking(false);
        return;
      }

      // 2. Check against existing confirmed or pending bookings
      const isBooked = bookings.some(booking => {
        const activeBooking = booking.status === 'confirmed' || booking.status === 'pending';
        return activeBooking && checkOverlap(checkIn, checkOut, booking.check_in, booking.check_out);
      });

      if (isBooked) {
        setAvailabilityStatus('unavailable');
        setMessage('The room is already reserved for the selected dates.');
        setIsChecking(false);
        return;
      }

      setAvailabilityStatus('available');
      setMessage('Excellent choice! The room is available for your dates.');
      setIsChecking(false);
    }, 600); // Small realistic delay for UI animation feel
  };

  const handleBookNow = () => {
    if (availabilityStatus !== 'available') return;
    
    // Redirect to Checkout form
    router.push(`/book?room_id=${roomId}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

  const totalPrice = numNights * basePrice;

  return (
    <div
      className="glassmorphism"
      style={{
        padding: '32px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        position: 'sticky',
        top: '110px',
      }}
    >
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Price starting from</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>₹{basePrice}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ night</span>
        </div>
      </div>

      <form onSubmit={handleCheckAvailability} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Check-In Date */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            <Calendar size={14} style={{ color: 'var(--primary)' }} /> CHECK-IN DATE
          </label>
          <input
            type="date"
            min={todayStr}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>

        {/* Check-Out Date */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            <Calendar size={14} style={{ color: 'var(--primary)' }} /> CHECK-OUT DATE
          </label>
          <input
            type="date"
            min={checkIn || todayStr}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>

        {/* Number of Guests */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            <Users size={14} style={{ color: 'var(--primary)' }} /> GUESTS
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Availability result message */}
        {message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              backgroundColor:
                availabilityStatus === 'available'
                  ? 'var(--secondary-light)'
                  : availabilityStatus === 'error'
                  ? '#FEF2F2'
                  : '#FFFBEB',
              color:
                availabilityStatus === 'available'
                  ? 'var(--secondary-hover)'
                  : availabilityStatus === 'error'
                  ? '#991B1B'
                  : '#92400E',
            }}
          >
            {availabilityStatus === 'available' ? (
              <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Action Button */}
        {availabilityStatus === 'available' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                <span>₹{basePrice} x {numNights} night{numNights > 1 ? 's' : ''}</span>
                <span>₹{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginTop: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                <span>Total Amount</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleBookNow}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Book Reservation <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <button
            type="submit"
            disabled={isChecking}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
          >
            {isChecking ? 'Checking Dates...' : 'Check Availability'}
          </button>
        )}
      </form>
    </div>
  );
}
