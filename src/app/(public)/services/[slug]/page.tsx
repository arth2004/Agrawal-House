import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { db } from '@/lib/db';
import { SERVICE_ICON_MAP } from '@/lib/services';
import ServiceSectionRenderer from '@/components/ServiceSectionRenderer';

export const revalidate = 0;

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await db.getService(slug);

  if (!service || service.status !== 'active') {
    notFound();
  }

  const Icon = SERVICE_ICON_MAP[service.icon as keyof typeof SERVICE_ICON_MAP] ?? MapPin;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <Link
          href="/services"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back to Services
        </Link>
      </div>

      <div
        className="card"
        style={{
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          marginBottom: '36px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <div style={{ minHeight: '340px' }}>
            <img
              src={service.cover_image}
              alt={service.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '999px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                width: 'fit-content',
              }}
            >
              <Icon size={18} />
              <span style={{ fontWeight: 700 }}>Service Detail</span>
            </div>
            <div>
              <h1 style={{ fontSize: '2.8rem', marginBottom: '12px' }}>{service.name}</h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                {service.short_description}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Link href="/enquiry" className="btn btn-primary">
                Contact / Booking CTA
              </Link>
              <Link href="/services" className="btn btn-outline">
                Browse More Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {service.sections.map((section) => (
          <ServiceSectionRenderer key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}