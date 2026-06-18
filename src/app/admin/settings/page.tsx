'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Settings } from '@/lib/types';
import { Save, CheckCircle, ShieldAlert, Sliders, Phone, Mail, MapPin } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [bookingMode, setBookingMode] = useState<'instant' | 'manual_approval'>('manual_approval');
  const [paymentOptions, setPaymentOptions] = useState<('online' | 'at_property')[]>(['at_property']);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await db.getSettings();
      if (data) {
        setSettings(data);
        setBookingMode(data.booking_mode);
        setPaymentOptions(data.payment_options);
        setPhone(data.contact_details.phone);
        setEmail(data.contact_details.email);
        setAddress(data.contact_details.address);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = (option: 'online' | 'at_property') => {
    if (paymentOptions.includes(option)) {
      // Don't allow empty payment options
      if (paymentOptions.length === 1) return;
      setPaymentOptions(paymentOptions.filter(o => o !== option));
    } else {
      setPaymentOptions([...paymentOptions, option]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError('');

    const updatedSettings: Settings = {
      booking_mode: bookingMode,
      payment_options: paymentOptions,
      contact_details: {
        phone,
        email,
        address,
      }
    };

    try {
      await db.saveSettings(updatedSettings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // clear banner after 3 seconds
    } catch (err) {
      console.error(err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Settings</h1>
        <p>Loading configurations...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
      
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Global Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure guesthouse operating rules, contact listings, and booking methods.</p>
      </div>

      {/* Save outcome banners */}
      {success && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', alignItems: 'center' }}>
          <CheckCircle size={18} />
          <span>Configurations saved successfully! Changes are applied instantly.</span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', alignItems: 'center' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Form Panel */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Booking rules card */}
        <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} style={{ color: 'var(--primary)' }} /> Booking & Payments
          </h3>

          {/* Booking mode */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '10px' }}>BOOKING APPROVAL POLICY</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="bookingMode"
                  checked={bookingMode === 'instant'}
                  onChange={() => setBookingMode('instant')}
                  style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', display: 'block' }}>Instant Confirmation</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All stay requests are automatically confirmed immediately upon guest submission.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="radio"
                  name="bookingMode"
                  checked={bookingMode === 'manual_approval'}
                  onChange={() => setBookingMode('manual_approval')}
                  style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', display: 'block' }}>Manual Host Approval</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reservations are marked "Pending" and must be manually approved from the bookings ledger.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Payment options */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '12px' }}>ALLOWED PAYMENT OPTIONS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  checked={paymentOptions.includes('at_property')}
                  onChange={() => handleTogglePayment('at_property')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Allow guests to pay at property during check-out</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  checked={paymentOptions.includes('online')}
                  onChange={() => handleTogglePayment('online')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Allow online payment integration (UPI, cards, netbanking)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact details card */}
        <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={20} style={{ color: 'var(--primary)' }} /> Public Contact Information
          </h3>

          {/* Phone */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
              <Phone size={14} style={{ color: 'var(--text-muted)' }} /> CONTACT PHONE
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} /> CONTACT EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>

          {/* Address */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} /> GUESTHOUSE PHYSICAL ADDRESS
            </label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', resize: 'none' }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary"
          style={{ padding: '14px', width: '200px', alignSelf: 'flex-start' }}
        >
          {isSaving ? 'Saving Settings...' : 'Save Settings'} <Save size={16} />
        </button>
      </form>
    </div>
  );
}
