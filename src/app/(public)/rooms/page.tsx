import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Users, Wifi, Wind, Coffee, Zap } from 'lucide-react';

export const revalidate = 0; // Disable caching to fetch fresh rooms list

export default async function RoomsPage() {
  const rooms = await db.getRooms();
  const activeRooms = rooms.filter((r) => r.status === 'active');

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Air Conditioning': <Wind size={16} />,
    'High-Speed Wi-Fi': <Wifi size={16} />,
    'Tea/Coffee Maker': <Coffee size={16} />,
    'Geyser': <Zap size={16} />,
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
          Accommodations
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>Our Rooms & Cottages</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Each room has been individually curated to provide a quiet, relaxing space. Choose a suite overlooking our orchard, or a cozy cottage built with earth plaster.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {activeRooms.map((room, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={room.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
              className="room-row-card"
            >
              {/* Photo */}
              <div style={{ height: '360px', position: 'relative', order: isEven ? 0 : 1 }} className="room-row-img-container">
                <img
                  src={room.photos[0] || '/images/room_mango_suite.jpg'}
                  alt={room.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Details */}
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h2 style={{ fontSize: '2rem' }}>{room.name}</h2>
                  <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.4rem' }}>
                    ₹{room.base_price} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '400' }}>/ night</span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '24px' }}>
                  {room.description}
                </p>

                {/* Info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <Users size={16} /> Up to {room.max_guests} Guests
                  </span>
                </div>

                {/* Key Amenities */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '36px' }}>
                  {room.amenities.slice(0, 4).map((amenity) => (
                    <span
                      key={amenity}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {amenityIcons[amenity] || null}
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span style={{ fontSize: '0.8rem', alignSelf: 'center', color: 'var(--text-muted)' }}>
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>

                <div>
                  <Link href={`/rooms/${room.id}`} className="btn btn-primary" style={{ padding: '14px 32px' }}>
                    Check Availability
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

