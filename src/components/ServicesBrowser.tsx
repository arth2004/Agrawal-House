'use client';

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Service } from '@/lib/types';
import ServiceCard from '@/components/ServiceCard';

function buildSearchText(service: Service) {
  return [
    service.name,
    service.short_description,
    service.sections
      .map((section) => [section.title, section.description, section.body, ...(section.items || []), ...(section.faqs || []).map((faq) => `${faq.question} ${faq.answer}`)].join(' '))
      .join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export default function ServicesBrowser({ services }: { services: Service[] }) {
  const [query, setQuery] = useState('');

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return services;

    return services.filter((service) => buildSearchText(service).includes(normalizedQuery));
  }, [query, services]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '520px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, pujas, routes, or accommodation options"
            style={{
              width: '100%',
              padding: '14px 44px 14px 46px',
              borderRadius: '999px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Showing {filteredServices.length} of {services.length} services
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px',
          }}
        >
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          No services matched your search.
        </div>
      )}
    </div>
  );
}