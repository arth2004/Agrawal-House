import React from 'react';
import { db } from '@/lib/db';
import ServicesBrowser from '@/components/ServicesBrowser';

export const revalidate = 0;

export default async function ServicesPage() {
  const services = (await db.getServices()).filter((service) => service.status === 'active');

  return (
    <div className="container" style={{ padding: '40px 24px 80px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <span
          style={{
            color: 'var(--primary)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontSize: '0.85rem',
          }}
        >
          Services
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>
          Our Services We Offer
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '760px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
          Browse the flexible services we provide. Every card opens a dedicated detail page built from reusable content sections, so new services can be added later without changing the layout.
        </p>
      </div>

      <ServicesBrowser services={services} />
    </div>
  );
}