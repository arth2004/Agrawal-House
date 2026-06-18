import React from 'react';

export default function GalleryPage() {
  const photos = [
    { src: '/images/hero_sunset.jpg', title: 'Agrawal House Sunset Glow', category: 'Exterior' },
    { src: '/images/room_mango_suite.jpg', title: 'Mango Orchard Suite Master Bedroom', category: 'Rooms' },
    { src: '/images/room_courtyard.jpg', title: 'Central Courtyard Swing Area', category: 'Interior' },
    { src: '/images/room_terracotta_cottage.jpg', title: 'Terracotta Cottage Balcony & View', category: 'Cottages' },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
          Visual Tour
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>Our Photo Gallery</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Explore the architecture, warm spaces, gardens, and premium rooms of Agrawal House.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        {photos.map((photo, i) => (
          <div
            key={i}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-card)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={photo.src}
                alt={photo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
                className="gallery-zoom-img"
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(28, 25, 23, 0.75)',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '500',
                }}
              >
                {photo.category}
              </span>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-sans)', fontWeight: '600' }}>{photo.title}</h3>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

