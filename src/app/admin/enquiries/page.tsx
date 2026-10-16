'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Enquiry } from '@/lib/types';
import {
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setNotification({
        type: 'success',
        message: 'Enquiry status updated to Responded.',
      });
      fetchEnquiries();
    } catch (err) {
      console.error('Error updating enquiry status:', err);
      setNotification({
        type: 'error',
        message: 'Failed to update enquiry status.',
      });
    }
  };

  const handleDeleteEnquiry = async (id: string, guestName?: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    setNotification(null);

    try {
      await db.deleteEnquiry(id);
      // Optimistically update list
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setNotification({
        type: 'success',
        message: guestName
          ? `Enquiry from "${guestName}" was successfully deleted.`
          : 'Enquiry was successfully deleted.',
      });
      // Background reload to ensure persistence
      fetchEnquiries();
    } catch (err) {
      console.error('Error deleting enquiry:', err);
      setNotification({
        type: 'error',
        message: 'Failed to delete enquiry. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const newCount = enquiries.filter((e) => e.status === 'new').length;

  if (loading && enquiries.length === 0) {
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
        <h1
          style={{
            fontSize: '2.5rem',
            fontFamily: 'var(--font-serif)',
            marginBottom: '8px',
          }}
        >
          Enquiries Inbox
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review contact requests, guest inquiries, and message records.
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor:
              notification.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${
              notification.type === 'success' ? '#A7F3D0' : '#FECACA'
            }`,
            color: notification.type === 'success' ? '#065F46' : '#991B1B',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

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
                borderColor:
                  filter === status ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor:
                  filter === status ? 'var(--primary-light)' : '#FFFFFF',
                color:
                  filter === status ? 'var(--primary)' : 'var(--text-secondary)',
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
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '0 4px',
                  }}
                >
                  {newCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={fetchEnquiries}
          className="btn btn-secondary"
          style={{
            padding: '8px 14px',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Refresh enquiries"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* 3. Messages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredEnquiries.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <p style={{ color: 'var(--text-muted)' }}>
              No messages found matching the current inbox filters.
            </p>
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
                borderColor:
                  enq.status === 'new'
                    ? 'var(--primary-light)'
                    : 'var(--border-color)',
                borderLeftWidth: enq.status === 'new' ? '4px' : '1px',
                borderLeftColor:
                  enq.status === 'new'
                    ? 'var(--primary)'
                    : 'var(--border-color)',
              }}
            >
              {/* Header: Name and Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {enq.name}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginTop: '6px',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Phone size={14} style={{ color: 'var(--text-muted)' }} />{' '}
                      {enq.contact}
                    </span>
                    {enq.created_at && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} />{' '}
                        {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      backgroundColor:
                        enq.status === 'new'
                          ? '#FEF3C7'
                          : 'var(--secondary-light)',
                      color:
                        enq.status === 'new'
                          ? 'var(--accent)'
                          : 'var(--secondary)',
                    }}
                  >
                    {enq.status}
                  </span>

                  {enq.status === 'new' && (
                    <button
                      onClick={() => handleMarkResponded(enq.id)}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> Mark Responded
                    </button>
                  )}

                  {/* Delete Enquiry Controls */}
                  {confirmDeleteId === enq.id ? (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FEF2F2',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #FECACA',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#DC2626',
                          fontWeight: '600',
                        }}
                      >
                        Delete?
                      </span>
                      <button
                        onClick={() => handleDeleteEnquiry(enq.id, enq.name)}
                        disabled={deletingId === enq.id}
                        className="btn"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          borderRadius: '4px',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {deletingId === enq.id ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={deletingId === enq.id}
                        className="btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          borderRadius: '4px',
                          backgroundColor: '#FFFFFF',
                          color: '#4B5563',
                          border: '1px solid #D1D5DB',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(enq.id)}
                      disabled={deletingId === enq.id}
                      className="btn"
                      title="Delete enquiry"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        cursor: deletingId === enq.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600',
                        transition: 'all 0.15s ease',
                        opacity: deletingId === enq.id ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (deletingId !== enq.id) {
                          e.currentTarget.style.backgroundColor = '#DC2626';
                          e.currentTarget.style.color = '#FFFFFF';
                          e.currentTarget.style.borderColor = '#DC2626';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deletingId !== enq.id) {
                          e.currentTarget.style.backgroundColor = '#FEE2E2';
                          e.currentTarget.style.color = '#DC2626';
                          e.currentTarget.style.borderColor = '#FECACA';
                        }
                      }}
                    >
                      <Trash2 size={12} />
                      {deletingId === enq.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <MessageSquare
                  size={18}
                  style={{
                    color: 'var(--primary)',
                    flexShrink: 0,
                    marginTop: '3px',
                  }}
                />
                <p style={{ whiteSpace: 'pre-line' }}>"{enq.message}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

