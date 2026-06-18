'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Rooms', href: '/rooms' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About & Location', href: '/about' },
    { name: 'Enquiry', href: '/enquiry' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'all 0.3s ease',
          backgroundColor: isScrolled ? 'rgba(250, 248, 245, 0.95)' : 'transparent',
          boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
          borderBottom: isScrolled ? '1px solid var(--border-color)' : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(8px)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: isScrolled ? '70px' : '90px',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: 'var(--text-primary)',
              }}
            >
              AGRAWAL HOUSE
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                marginTop: '-2px',
              }}
            >
              Heritage Homestay
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'none', gap: '32px', alignItems: 'center' }} className="desktop-nav">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'color var(--transition-fast)',
                    position: 'relative',
                  }}
                  className="nav-hover-effect"
                >
                  {link.name}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '0',
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </Link>
              );
            })}
            <Link href="/rooms" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
              <Calendar size={14} /> Book Stay
            </Link>
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
            className="mobile-nav-toggle"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-color)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  fontSize: '1rem',
                  fontWeight: pathname === link.href ? '600' : '400',
                  color: pathname === link.href ? 'var(--primary)' : 'var(--text-secondary)',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(0,0,0,0.03)',
                }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/rooms"
              onClick={() => setIsMenuOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Calendar size={16} /> Book Stay
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '90px' }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#1C1917',
          color: '#FAF8F5',
          padding: '64px 0 24px 0',
          borderTop: '1px solid #2E2A27',
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          {/* About Section */}
          <div>
            <h3 style={{ color: '#FFFFFF', marginBottom: '20px', fontSize: '1.4rem' }}>Agrawal House</h3>
            <p style={{ color: '#A8A29E', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
              A gorgeous boutique homestay where tradition meets modern comfort. Set in the heart of Indore, we invite you to experience hospitality that feels like home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '20px', fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{ color: '#A8A29E', fontSize: '0.95rem', transition: 'color 0.2s' }} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin/login" style={{ color: '#78716C', fontSize: '0.85rem' }}>
                  Owner/Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '20px', fontSize: '1.1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contact Us</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#A8A29E', fontSize: '0.95rem' }}>
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <span>Near Lal Bagh Palace, Indore, MP, India</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#A8A29E', fontSize: '0.95rem' }}>
                <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>+91 98765 43210</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#A8A29E', fontSize: '0.95rem' }}>
                <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>stay@agrawalhouse.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div
          className="container"
          style={{
            borderTop: '1px solid #2E2A27',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: '#78716C',
            gap: '16px',
          }}
        >
          <p>&copy; {new Date().getFullYear()} Agrawal House Homestay. All Rights Reserved.</p>
          <p>Handcrafted for luxury stay experiences.</p>
        </div>
      </footer>

      {/* Injecting CSS media queries dynamically to keep things simple and fully inline-styled responsive */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
        }
        .nav-hover-effect:hover {
          color: var(--primary) !important;
        }
        .footer-link:hover {
          color: #FFFFFF !important;
        }
      `}</style>
    </div>
  );
}
