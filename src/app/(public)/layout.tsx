'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, MapPin, Calendar, Sparkles } from 'lucide-react';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ChatbotWidget from '@/components/ChatbotWidget';
import SmoothScroll from '@/components/SmoothScroll';

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
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About & Location', href: '/about' },
    { name: 'Enquiry', href: '/enquiry' },
  ];

  // Hero mode: when on homepage before user scrolls
  const isHeroMode = pathname === '/' && !isScrolled;

  return (
    <SmoothScroll>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Luxury Announcement Bar */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 60,
            backgroundColor: isScrolled
              ? '#1C1917'
              : 'rgba(12, 10, 8, 0.85)',
            backdropFilter: 'blur(10px)',
            color: '#FAF8F5',
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '34px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#E5C07B', fontSize: '0.82rem' }}>✨</span>
              <span style={{ fontWeight: '500', opacity: 0.95 }}>
              Homestay in Ujjain • 8 Mins to Mahakal Jyotirlinga
              </span>
            </div>
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '18px',
              }}
              className="top-bar-contact"
            >
              <a
                href="tel:+917415160134"
                style={{
                  color: '#FAF8F5',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: 0.9,
                  transition: 'opacity 0.2s',
                }}
              >
                <Phone size={12} style={{ color: '#E5C07B' }} />
                <span>+91 7415160134</span>
              </a>
              <span style={{ opacity: 0.3 }}>|</span>
              <a
                href="https://wa.me/917415160134?text=Hello%20Agrawal%20House,%20I%20would%20like%20to%20inquire%20about%20booking%20a%20stay."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#22C55E',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>WhatsApp Booking</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Header */}
        <header
          style={{
            position: 'fixed',
            top: '34px',
            left: 0,
            right: 0,
            zIndex: 50,
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundColor: isHeroMode
              ? 'transparent'
              : 'rgba(250, 248, 245, 0.95)',
            backgroundImage: isHeroMode
              ? 'linear-gradient(180deg, rgba(8, 7, 6, 0.85) 0%, rgba(8, 7, 6, 0.4) 60%, transparent 100%)'
              : 'none',
            boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.06)' : 'none',
            borderBottom: isHeroMode
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid var(--border-color)',
            backdropFilter: isScrolled ? 'blur(16px)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: isScrolled ? '68px' : '82px',
              transition: 'height 0.3s ease',
            }}
          >
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  letterSpacing: '0.06em',
                  color: isHeroMode ? '#FFFFFF' : '#1C1917',
                  textShadow: isHeroMode ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                  transition: 'color 0.3s ease',
                }}
              >
                AGRAWAL HOUSE
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  color: isHeroMode ? '#E5C07B' : 'var(--primary)',
                  marginTop: '-2px',
                  transition: 'color 0.3s ease',
                }}
              >
                Homestay
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
                      fontSize: '0.92rem',
                      fontWeight: isActive ? '600' : '500',
                      color: isHeroMode
                        ? isActive
                          ? '#E5C07B'
                          : 'rgba(255, 255, 255, 0.9)'
                        : isActive
                        ? 'var(--primary)'
                        : '#1C1917',
                      transition: 'color 0.2s ease',
                      position: 'relative',
                      textShadow: isHeroMode ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                    }}
                    className="nav-link-item"
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
                          backgroundColor: isHeroMode ? '#E5C07B' : 'var(--primary)',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </Link>
                );
              })}

              <Link
                href="/rooms"
                className="btn btn-primary"
                style={{
                  padding: '9px 22px',
                  fontSize: '0.82rem',
                  backgroundColor: isHeroMode ? '#C2410C' : 'var(--primary)',
                  boxShadow: isHeroMode ? '0 4px 15px rgba(194, 65, 12, 0.4)' : 'none',
                }}
              >
                <Calendar size={14} /> Book Stay
              </Link>
            </nav>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{
                display: 'flex',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isHeroMode ? '#FFFFFF' : '#1C1917',
                padding: '8px',
                transition: 'color 0.3s ease',
              }}
              className="mobile-nav-toggle"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
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
        <main style={{ paddingTop: '116px' }}>{children}</main>

        {/* Footer */}
        <footer
          style={{
            backgroundColor: '#1C1917',
            color: '#FAF8F5',
            padding: '64px 0 24px 0',
            borderTop: '1px solid #2E2A27',
          }}
        >
          <div
            className="container"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '48px',
              marginBottom: '48px',
            }}
          >
            {/* About Section */}
            <div>
              <h3 style={{ color: '#FFFFFF', marginBottom: '16px', fontSize: '1.4rem' }}>
                Agrawal House
              </h3>
              <p
                style={{
                  color: '#A8A29E',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                }}
              >
                A peaceful, heritage homestay combining traditional warmth with modern comfort.
                Located just 8 minutes from Shri Mahakaleshwar Temple in Ujjain.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#E5C07B', fontSize: '0.85rem' }}>
                <Sparkles size={14} /> Govt. Registered MP Tourism Homestay
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                style={{
                  color: '#FFFFFF',
                  marginBottom: '20px',
                  fontSize: '1.05rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{ color: '#A8A29E', fontSize: '0.95rem', transition: 'color 0.2s' }}
                      className="footer-link"
                    >
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
              <h4
                style={{
                  color: '#FFFFFF',
                  marginBottom: '20px',
                  fontSize: '1.05rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Contact Us
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#A8A29E', fontSize: '0.95rem' }}>
                  <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <span>27/1, Patwa Bakhal, Patni Bazar, Kamri Marg, Ujjain, MP - 456006</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#A8A29E', fontSize: '0.95rem' }}>
                  <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>+91 7415160134, +91 9425094180</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#A8A29E', fontSize: '0.95rem' }}>
                  <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>agrawalhouse34@gmail.com</span>
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
            <p>MP Tourism Certified Homestay in Ujjain.</p>
          </div>
        </footer>

        <WhatsAppFloat />
        <ChatbotWidget />

        {/* Global responsive styles */}
        <style jsx global>{`
          @media (min-width: 768px) {
            .desktop-nav {
              display: flex !important;
            }
            .mobile-nav-toggle {
              display: none !important;
            }
            .top-bar-contact {
              display: flex !important;
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
    </SmoothScroll>
  );
}
