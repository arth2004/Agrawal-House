import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Coffee, MapPin, ShieldCheck, Sparkles, Users, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Disable caching to ensure fresh DB state

export default async function HomePage() {
  const rooms = await db.getRooms();
  const activeRooms = rooms.filter((r) => r.status === 'active').slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          height: '85vh',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          backgroundImage: 'linear-gradient(rgba(28, 25, 23, 0.45), rgba(28, 25, 23, 0.65)), url("/images/hero_sunset.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: '-90px', // Pull up behind the header
        }}
      >
        <div className="container" style={{ textAlign: 'center', zIndex: 10 }}>
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              fontSize: '0.85rem',
              color: 'var(--primary-light)',
              display: 'inline-block',
              marginBottom: '16px',
              fontWeight: '500',
              animation: 'fadeIn 0.8s ease',
            }}
          >
            Welcome to Indore's Heritage Stay
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: '1.15',
              marginBottom: '24px',
              color: '#FFFFFF',
              fontWeight: '800',
            }}
          >
            Experience Cozy Luxury &<br />Ancient Tradition
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: '650px',
              margin: '0 auto 40px auto',
              color: '#E7E5E4',
              lineHeight: '1.6',
            }}
          >
            Nestled inside lush fruit orchards and historic courtyards, Agrawal House offers a peaceful sanctuary with home-cooked meals and modern amenities.
          </p>
          <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/rooms" className="btn btn-primary" style={{ padding: '16px 36px' }}>
              Book Your Stay
            </Link>
            <Link href="/about" className="btn btn-outline" style={{ padding: '16px 36px', color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Intro Section */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              Our Story
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '8px', marginBottom: '24px', lineHeight: '1.2' }}>
              A sanctuary built on warmth, heritage, and nature
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '20px', fontSize: '1.05rem' }}>
              For over three generations, Agrawal House has stood as a symbol of Indore's warm hospitality. Architecturally styled with central corridors, local stone work, and high-timber ceilings, our home invites guests into a slow, meaningful way of life.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '28px', fontSize: '1.05rem' }}>
              Surrounded by aged mango orchards and flower gardens, we offer customized experiences including curated local Indore food tours, morning yoga in the gardens, and organic farm-to-table dining.
            </p>
            <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
              Explore the history of Agrawal House <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ position: 'relative' }}>
            <img
              src="/images/room_courtyard.jpg"
              alt="Central Courtyard view"
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                width: '100%',
                maxHeight: '480px',
                objectFit: 'cover',
              }}
            />
            <div
              className="glassmorphism hide-mobile-floating"
              style={{
                position: 'absolute',
                bottom: '-24px',
                left: '-24px',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                display: 'none', // Shown on md screens
                maxWidth: '240px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Sparkles size={24} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Genuine Hospitality</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rated 4.9/5 by over 150 guests from across India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Highlights Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              Amenities & Atmosphere
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '8px' }}>Why You'll Love Staying With Us</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: 'none' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '20px' }}>
                <Coffee size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Indori Breakfast</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Taste the flavors of Indore with hot Poha, Jalebi, and chai freshly prepared for you every single morning.
              </p>
            </div>

            <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: 'none' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '20px' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Mango Orchards</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Take long walks through our private garden paths shaded by mango, guava, and custard apple trees.
              </p>
            </div>

            <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: 'none' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '20px' }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Prime Location</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Located in a quiet green lane, only a few minutes drive to Lal Bagh Palace, Rajwada, and local markets.
              </p>
            </div>

            <div className="card" style={{ padding: '32px', backgroundColor: '#FFFFFF', border: 'none' }}>
              <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '20px' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Modern Safety</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Enjoy secure gate entrance, gated car parking, high-speed fiber internet, and round-the-clock water and power backup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Rooms Listing Preview */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>
              Our Accommodation
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '8px', lineHeight: '1.2' }}>Beautiful Rooms Designed For Rest</h2>
          </div>
          <Link href="/rooms" className="btn btn-outline" style={{ textTransform: 'uppercase' }}>
            View All Rooms
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {activeRooms.map((room) => (
            <div key={room.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img
                  src={room.photos[0] || '/images/room_mango_suite.jpg'}
                  alt={room.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
                  className="room-card-img"
                />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '0.9rem' }}>
                  ₹{room.base_price} <span style={{ fontWeight: '400', fontSize: '0.8rem' }}>/ night</span>
                </div>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                <h3 style={{ fontSize: '1.4rem' }}>{room.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', flex: 1 }}>
                  {room.description.length > 120 ? `${room.description.substring(0, 120)}...` : room.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> Max {room.max_guests} guests
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', marginTop: '12px' }}>
                  <Link href={`/rooms/${room.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    View & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Injecting responsive styles */}
    </div>
  );
}

