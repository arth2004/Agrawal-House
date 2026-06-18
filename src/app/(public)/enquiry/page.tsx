'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';

export default function EnquiryPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !message) {
      setError('Please fill in all the fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await db.createEnquiry({
        name,
        contact,
        message,
      });

      // Show success
      setSubmitted(true);
      setName('');
      setContact('');
      setMessage('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
          Contact Us
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>Get In Touch</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Have questions about rooms, booking, local tours, or hosting group events? Leave us a message and we'll get back to you shortly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '56px', alignItems: 'start' }} className="contact-grid">
        {/* Left Side: Contact Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Contact Details</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%' }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>Call / WhatsApp</h4>
                <p style={{ color: 'var(--text-secondary)' }}>+91 7415160134</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mon - Sun, 9:00 AM to 9:00 PM</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%' }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>Email Address</h4>
                <p style={{ color: 'var(--text-secondary)' }}>agrawalhouse34@gmail.com</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expect a response within 12 hours</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>Location</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  27/1 Patwa Bakhal Gali
                  Patni Bazaar, Agrawal House<br />
                  Ujjain<br />
                  Madhya Pradesh - 452002
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div
          className="card"
          style={{
            padding: '40px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle size={56} style={{ color: 'var(--secondary)', marginBottom: '20px', display: 'inline-block' }} />
              <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Enquiry Submitted</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Thank you for reaching out to us. We have received your message and our reservation representative will contact you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-outline"
                style={{ marginTop: '24px' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Send a Message</h3>
              
              {error && (
                <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#FEF2F2', color: '#991B1B', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>YOUR NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Contact (Phone / Email) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>CONTACT INFO (PHONE OR EMAIL)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 7415160134 or email@domain.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>MESSAGE</label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your requirements, dates, or questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                {isSubmitting ? 'Sending Message...' : 'Submit Message'} <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
