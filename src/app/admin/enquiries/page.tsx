'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Enquiry } from '@/lib/types';
import { Mail, Phone, Clock, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await db.getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResponded = async (id: string) => {
    try {
      await db.updateEnquiryStatus(id, 'responded');
      fetchEnquiries(); // Refresh state
    } catch (err) {
      console.error('Error updating enquiry status:', err);
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const newCount = enquiries.filter(e => e.status === 'new').length;

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '24px' }}>Enquiries Inbox</h1>
        <p>Loading inbox...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Header */}
      <div>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Enquiries Inbox</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review contact requests, guest inquiries, and message records.</p>
      </div>

      {/* 2. Controls and Tabs */}
      <div
        className="card"
        style={{
          padding: '16px 24px',
          backgroundColor: '#FFFFFF',
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'new', 'responded'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: filter === status ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: filter === status ? 'var(--primary-light)' : '#FFFFFF',
                color: filter === status ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: filter === status ? '600' : '400',
                textTransform: 'capitalize',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{status}</span>
              {status === 'new' && newCount > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: '700', padding: '0 4px' }}>
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Messages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredEnquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)' }}>No messages found matching the current inbox filters.</p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="card"
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderColor: enq.status === 'new' ? 'var(--primary-light)' : 'var(--border-color)',
                borderLeftWidth: enq.status === 'new' ? '4px' : '1px',
                borderLeftColor: enq.status === 'new' ? 'var(--primary)' : 'var(--border-color)',
              }}
            >
              {/* Header: Name and Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {enq.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} style={{ color: 'var(--text-muted)' }} /> {enq.contact}
                    </span>
                    {enq.created_at && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} /> {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      backgroundColor: enq.status === 'new' ? '#FEF3C7' : 'var(--secondary-light)',
                      color: enq.status === 'new' ? 'var(--accent)' : 'var(--secondary)',
                    }}
                  >
                    {enq.status}
                  </span>
                  
                  {enq.status === 'new' && (
                    <button
                      onClick={() => handleMarkResponded(enq.id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      <CheckCircle2 size={12} /> Mark Responded
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)', display: 'flex', gap: '10px' }}>
                <MessageSquare size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                <p style={{ whiteSpace: 'pre-line' }}>"{enq.message}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
