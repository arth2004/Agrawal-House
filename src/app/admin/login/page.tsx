'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(true);

  useEffect(() => {
    setIsMock(adminAuth.isMock);
    
    // Check if already logged in
    const checkSession = async () => {
      const isLoggedIn = await adminAuth.getSession();
      if (isLoggedIn) {
        router.push('/admin/bookings');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminAuth.signIn(email, password);
      if (result.success) {
        router.push('/admin/bookings');
      } else {
        setError(result.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Logo/Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '16px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: '50%',
              marginBottom: '16px',
            }}
          >
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            Secure login for Agrawal House management
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: '24px',
              lineHeight: '1.4',
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} /> EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@agrawalhouse.com"
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

          {/* Password input */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
              <Lock size={14} style={{ color: 'var(--text-muted)' }} /> PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Sign In'} <LogIn size={16} />
          </button>
        </form>

        {isMock && (
          <div
            style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#FEF3C7',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #F59E0B',
              fontSize: '0.85rem',
              color: '#92400E',
              lineHeight: '1.4',
            }}
          >
            <strong>Development Mock Mode:</strong> Use credentials:<br />
            Email: <code>admin@agrawalhouse.com</code><br />
            Password: <code>admin123</code>
          </div>
        )}
      </div>
    </div>
  );
}
