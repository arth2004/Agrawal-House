import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { ServiceSection } from '@/lib/types';

export default function ServiceSectionRenderer({ section }: { section: ServiceSection }) {
  if (section.type === 'gallery') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {section.title && <h2 style={{ fontSize: '1.8rem' }}>{section.title}</h2>}
        {section.description && (
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {section.description}
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {(section.images || []).map((image) => (
            <div
              key={image}
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                minHeight: '180px',
              }}
            >
              <img
                src={image}
                alt={section.title || 'Service image'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'list') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {section.title && <h2 style={{ fontSize: '1.8rem' }}>{section.title}</h2>}
        {section.description && (
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {section.description}
          </p>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {(section.items || []).map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  flexShrink: 0,
                }}
              >
                <Check size={14} />
              </div>
              <span style={{ lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'faq') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {section.title && <h2 style={{ fontSize: '1.8rem' }}>{section.title}</h2>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(section.faqs || []).map((faq) => (
            <details
              key={faq.question}
              className="card"
              style={{ padding: '18px 20px', backgroundColor: '#FFFFFF' }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <span>{faq.question}</span>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </summary>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '12px' }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'pricing') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {section.title && <h2 style={{ fontSize: '1.8rem' }}>{section.title}</h2>}
        <div style={{ display: 'grid', gap: '12px' }}>
          {(section.pricingItems || []).map((item) => (
            <div
              key={item.label}
              className="card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{item.label}</strong>
                {item.note && (
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{item.note}</p>
                )}
              </div>
              {item.value ? (
                <div style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.value}</div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Optional</div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'info-grid') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {section.title && <h2 style={{ fontSize: '1.8rem' }}>{section.title}</h2>}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          {(section.infoItems || []).map((item) => (
            <div
              key={item.label}
              className="card"
              style={{ padding: '20px', backgroundColor: '#FFFFFF' }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {item.label}
              </div>
              <div style={{ marginTop: '8px', fontSize: '1.05rem', fontWeight: 700 }}>
                {item.value}
              </div>
              {item.detail && (
                <div style={{ marginTop: '8px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'cta') {
    return (
      <section
        className="card"
        style={{
          padding: '28px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            {section.title && <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{section.title}</h2>}
            {section.description && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {section.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {section.primaryCta && (
              <Link href={section.primaryCta.href} className="btn btn-primary">
                {section.primaryCta.label} <ArrowRight size={14} />
              </Link>
            )}
            {section.secondaryCta && (
              <Link href={section.secondaryCta.href} className="btn btn-outline">
                {section.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
      {section.title && <h2 style={{ fontSize: '1.8rem', marginBottom: '14px' }}>{section.title}</h2>}
      {section.body && (
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {section.body}
        </p>
      )}
      {section.customFields && Object.keys(section.customFields).length > 0 && (
        <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
          {Object.entries(section.customFields).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>{key}</strong>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {section.images && section.images.length > 0 && (
        <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <ImageIcon size={16} />
          <span>{section.images.length} images available in this section</span>
        </div>
      )}
    </section>
  );
}