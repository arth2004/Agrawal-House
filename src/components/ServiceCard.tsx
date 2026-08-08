'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Service } from '@/lib/types';
import { SERVICE_ICON_MAP } from '@/lib/services';

export default function ServiceCard({ service }: { service: Service }) {
  const Icon =
    SERVICE_ICON_MAP[service.icon as keyof typeof SERVICE_ICON_MAP] ?? Sparkles;

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
        <img
          src={service.cover_image}
          alt={service.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(28, 25, 23, 0.05) 0%, rgba(28, 25, 23, 0.65) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '18px',
            left: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(250, 248, 245, 0.9)',
            backdropFilter: 'blur(8px)',
            color: 'var(--text-primary)',
            fontWeight: 700,
          }}
        >
          <Icon size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.8rem' }}>{service.name}</span>
        </div>
      </div>

      <div
        style={{
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          flex: 1,
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.45rem', marginBottom: '10px' }}>
            {service.name}
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              fontSize: '0.98rem',
            }}
          >
            {service.short_description}
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {service.sections.slice(0, 2).map((section) => (
            <span
              key={section.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: '999px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: 600,
              }}
            >
              {section.title || section.type}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Link
            href={`/services/${service.slug}`}
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            Know More <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}