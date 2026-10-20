'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, ArrowRight, AlertCircle, CheckCircle, Tag, TrendingUp, Sparkles } from 'lucide-react';
import { BlockedDate, Booking, PricingRule } from '@/lib/types';
import { bookingOverlapsBlockedDate, bookingOverlapsBooking } from '@/lib/availability';
import { db } from '@/lib/db';
import WhatsAppBookButton from '@/components/WhatsAppBookButton';

interface BookingWidgetProps {
  roomId: string;
  roomName: string;
  basePrice: number;
  maxGuests: number;
  blockedDates: BlockedDate[];
  bookings: Booking[];
}

export default function BookingWidget({
  roomId,
  roomName,
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

  // Dynamic pricing state
  const [dynamicPricing, setDynamicPricing] = useState<{
    total: number;
    breakdown: { date: string; price: number; rule?: PricingRule }[];
  } | null>(null);

  // Minimum date selection constraint (today)
  const todayStr = new Date().toISOString().split('T')[0];

  // Recalculate nights and availability status on date changes
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      if (end <= start) {
        setAvailabilityStatus('error');
        setMessage('Check-out date must be after check-in date.');
        setNumNights(0);
        setDynamicPricing(null);
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
      setDynamicPricing(null);
    }
  }, [checkIn, checkOut]);

  // Fetch dynamic pricing as soon as valid dates are selected
  useEffect(() => {
    let isCancelled = false;
    async function loadDynamicPricing() {
      if (!roomId || !checkIn || !checkOut || numNights <= 0) {
        setDynamicPricing(null);
        return;
      }

      try {
        const result = await db.calculateTotalPrice(
          roomId,
          checkIn,
          checkOut,
          basePrice
        );
        if (!isCancelled) {
          setDynamicPricing(result);
        }
      } catch (err) {
        console.error("Error calculating dynamic price in widget:", err);
      }
    }

    loadDynamicPricing();
    return () => {
      isCancelled = true;
    };
  }, [roomId, checkIn, checkOut, basePrice, numNights]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setAvailabilityStatus('error');
      setMessage('Please select both check-in and check-out dates.');
      return;
    }

    setIsChecking(true);

    try {
      // 1. Fetch live dynamic pricing
      const result = await db.calculateTotalPrice(
        roomId,
        checkIn,
        checkOut,
        basePrice
      );
      setDynamicPricing(result);

      // 2. Check against blocked dates (MMT / Airbnb / manual blocks)
      const isBlocked = blockedDates.some((block) => 
        bookingOverlapsBlockedDate(checkIn, checkOut, block.start_date, block.end_date)
      );

      if (isBlocked) {
        setAvailabilityStatus('unavailable');
        setMessage('The selected dates are unavailable or blocked.');
        setIsChecking(false);
        return;
      }

      // 3. Check against existing confirmed or pending bookings
      const isBooked = bookings.some((booking) => {
        const activeBooking = booking.status === 'confirmed' || booking.status === 'pending';
        return activeBooking && bookingOverlapsBooking(checkIn, checkOut, booking.check_in, booking.check_out);
      });

      if (isBooked) {
        setAvailabilityStatus('unavailable');
        setMessage('The room is already reserved for the selected dates.');
        setIsChecking(false);
        return;
      }

      setAvailabilityStatus('available');
      setMessage('Excellent choice! The room is available for your dates.');
    } catch (err) {
      console.error('Error during availability check:', err);
      setAvailabilityStatus('available');
      setMessage('The room is available for your dates.');
    } finally {
      setIsChecking(false);
    }
  };

  const isFamilyRoom = roomName.toLowerCase().includes('family') || maxGuests >= 4;
  const effectiveMaxGuests = isFamilyRoom ? 5 : maxGuests;
  const hasExtraGuest = isFamilyRoom && guests === 5;
  const extraGuestChargePerNight = hasExtraGuest ? 300 : 0;
  
  // Dynamic price calculations
  const standardBaseTotal = numNights * basePrice;
  const dynamicRoomTotal = dynamicPricing ? dynamicPricing.total : standardBaseTotal;
  const priceDiff = dynamicRoomTotal - standardBaseTotal;
  const hasDynamicRule = Boolean(dynamicPricing && dynamicPricing.breakdown.some((b) => b.rule));
  const isDiscount = priceDiff < 0;
  const isSurcharge = priceDiff > 0;
  
  const extraGuestTotal = numNights * extraGuestChargePerNight;
  const totalPrice = dynamicRoomTotal + extraGuestTotal;
  const effectiveNightlyRate = numNights > 0 ? Math.round(dynamicRoomTotal / numNights) : basePrice;

  // Extract rule names
  const appliedRuleNames = dynamicPricing?.breakdown
    .filter((b) => b.rule)
    .map((b) => b.rule?.name)
    .filter((name, idx, self) => name && self.indexOf(name) === idx)
    .join(', ');

  const handleBookNow = () => {
    if (availabilityStatus !== 'available') return;
    
    // Redirect to Checkout form
    router.push(`/book?room_id=${roomId}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  };

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
      {/* Price Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {hasDynamicRule && numNights > 0 ? 'Dynamic rate for selected dates' : 'Price starting from'}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          {hasDynamicRule && isDiscount && (
            <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              ₹{basePrice}
            </span>
          )}
          <span style={{ fontSize: '2rem', fontWeight: '700', color: hasDynamicRule && isDiscount ? '#15803D' : 'var(--primary)' }}>
            ₹{effectiveNightlyRate}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ night</span>

          {/* Badges for Discount or Surcharge */}
          {hasDynamicRule && isDiscount && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
              }}
            >
              <Sparkles size={12} /> Special Offer
            </span>
          )}
          {hasDynamicRule && isSurcharge && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#FEF3C7',
                color: '#B45309',
              }}
            >
              <TrendingUp size={12} /> Seasonal Rate
            </span>
          )}
        </div>

        {isFamilyRoom && (
          <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: '500' }}>
            <span>Accommodates 4 guests (up to 5 with extra mattress @ ₹300/night)</span>
          </div>
        )}
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
            {Array.from({ length: effectiveMaxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? 's' : ''} {isFamilyRoom && n === 5 ? '(+₹300/night for extra person & mattress)' : ''}
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

        {/* Action Button & Detailed Pricing Breakdown */}
        {availabilityStatus === 'available' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Standard Base Rate */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: hasDynamicRule ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                <span>Base Rate: ₹{basePrice} × {numNights} night{numNights > 1 ? 's' : ''}</span>
                <span style={{ textDecoration: hasDynamicRule && isDiscount ? 'line-through' : 'none' }}>
                  ₹{standardBaseTotal}
                </span>
              </div>

              {/* Dynamic Discount Row */}
              {hasDynamicRule && isDiscount && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    color: '#15803D',
                    fontWeight: '600',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #DCFCE7',
                    padding: '6px 10px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={13} /> {appliedRuleNames || 'Special Offer'}
                  </span>
                  <span>-₹{Math.abs(priceDiff)}</span>
                </div>
              )}

              {/* Dynamic Surcharge Row */}
              {hasDynamicRule && isSurcharge && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem',
                    color: '#92400E',
                    fontWeight: '600',
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    padding: '6px 10px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={13} /> {appliedRuleNames || 'Seasonal Rate'}
                  </span>
                  <span>+₹{priceDiff}</span>
                </div>
              )}

              {/* Extra Guest Row */}
              {hasExtraGuest && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#B45309' }}>
                  <span>Extra Person (5th guest + mattress): ₹300 × {numNights}n</span>
                  <span>+₹{extraGuestTotal}</span>
                </div>
              )}

              {/* Total Amount */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  marginTop: '8px',
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '12px',
                }}
              >
                <div>
                  <span>Total Amount</span>
                  {hasDynamicRule && isDiscount && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#15803D', fontWeight: '600' }}>
                      (You save ₹{Math.abs(priceDiff)})
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>₹{totalPrice}</span>
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
            <WhatsAppBookButton
              details={{
                roomName,
                checkIn,
                checkOut,
                guests,
                nights: numNights,
                totalPrice,
              }}
            />
          </div>
        ) : (
          <button
            type="submit"
            disabled={isChecking}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
          >
            {isChecking ? 'Checking Dates & Rates...' : 'Check Availability'}
          </button>
        )}
      </form>

      {availabilityStatus !== 'available' && (
        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Prefer to chat? Enquire on WhatsApp
          </p>
          <WhatsAppBookButton
            details={{
              roomName,
              checkIn: checkIn || undefined,
              checkOut: checkOut || undefined,
              guests: checkIn && checkOut ? guests : undefined,
              nights: numNights || undefined,
              totalPrice: numNights > 0 ? totalPrice : undefined,
            }}
            label="Enquire on WhatsApp"
            variant="outline"
          />
        </div>
      )}
    </div>
  );
}
