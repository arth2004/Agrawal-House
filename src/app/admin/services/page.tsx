'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Service } from '@/lib/types';
import ServicesAdminClient from '@/components/ServicesAdminClient';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const data = await db.getServices();
        if (isMounted) {
          setServices(data);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Services Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Loading services...</p>
      </div>
    );
  }

  return <ServicesAdminClient initialServices={services} />;
}