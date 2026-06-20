'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { adminAuth } from '@/lib/adminAuth';
import { Calendar, CalendarRange, BedDouble, Inbox, Settings, LogOut, Home, Menu, X, Shield, Tag } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Skip auth check for login page itself
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      const isLoggedIn = await adminAuth.getSession();
      if (!isLoggedIn) {
        router.push('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    verifyAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    await adminAuth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Checking credentials...</h3>
      </div>
    );
  }

  // Render children directly if it is the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Bookings', href: '/admin/bookings', icon: <Calendar size={18} /> },
    { name: 'Calendar', href: '/admin/calendar', icon: <CalendarRange size={18} /> },
    { name: 'Rooms', href: '/admin/rooms', icon: <BedDouble size={18} /> },
    { name: 'Pricing', href: '/admin/pricing', icon: <Tag size={18} /> },
    { name: 'Enquiries', href: '/admin/enquiries', icon: <Inbox size={18} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      
      {/* 1. Mobile Sidebar Toggle Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          padding: '0 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
        }}
        className="admin-mobile-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} style={{ color: 'var(--primary)' }} />
          <strong style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>AGRAWAL DASHBOARD</strong>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 2. Sidebar Navigation */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#1C1917',
          color: '#FAF8F5',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 45,
          transition: 'transform var(--transition-normal)',
          borderRight: '1px solid #2E2A27',
        }}
        className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '32px 24px', borderBottom: '1px solid #2E2A27', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 style={{ fontSize: '1.1rem', color: '#FFFFFF', letterSpacing: '0.05em' }}>AGRAWAL HOUSE</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Management Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  color: isActive ? '#FFFFFF' : '#A8A29E',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                }}
                className="admin-nav-link"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Operations */}
        <div style={{ padding: '24px 16px', borderTop: '1px solid #2E2A27', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              color: '#A8A29E',
              transition: 'color 0.2s',
            }}
            className="admin-nav-link"
          >
            <Home size={18} />
            <span>Go to Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              color: '#FCA5A5',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color 0.2s',
            }}
            className="admin-logout-btn"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Dashboard Workspace Content */}
      <main
        style={{
          flex: 1,
          padding: '40px',
          marginLeft: '280px',
          transition: 'margin var(--transition-normal)',
        }}
        className="admin-main-content"
      >
        {children}
      </main>

      <style jsx global>{`
        /* Desktop styles defaults */
        .admin-mobile-header {
          display: none !important;
        }

        /* Responsive Breakpoints */
        @media (max-width: 991px) {
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-sidebar {
            transform: translateX(-100%);
            top: 64px !important;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main-content {
            margin-left: 0 !important;
            padding: 96px 20px 40px 20px !important;
          }
        }

        .admin-nav-link:hover {
          color: #FFFFFF !important;
          background-color: rgba(255, 255, 255, 0.05);
        }
        .admin-logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}
