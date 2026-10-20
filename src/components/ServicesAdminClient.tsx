'use client';

import React, { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { Service } from '@/lib/types';
import { SERVICE_ICON_OPTIONS, slugifyServiceName } from '@/lib/services';
import {
  ArrowDown,
  ArrowUp,
  CopyPlus,
  Edit2,
  Plus,
  Save,
  Pause,
  Play,
  Trash2,
  X,
} from 'lucide-react';

type ServiceFormState = Omit<Service, 'created_at'>;

const createEmptyService = (sortOrder: number): ServiceFormState => ({
  id: crypto.randomUUID(),
  slug: '',
  name: '',
  short_description: '',
  icon: 'Sparkles',
  cover_image: '/images/hero_sunset.jpg',
  gallery: [],
  sections: [],
  sort_order: sortOrder,
  status: 'active',
});

const SERVICE_STATUS_META: Record<Service['status'], { label: string; background: string; color: string }> = {
  active: {
    label: 'Active',
    background: 'var(--secondary-light)',
    color: 'var(--secondary)',
  },
  paused: {
    label: 'Paused',
    background: 'var(--accent-light)',
    color: 'var(--accent)',
  },
  inactive: {
    label: 'Inactive',
    background: '#E7E5E4',
    color: 'var(--text-secondary)',
  },
};

const createSectionTemplate = (type: Service['sections'][number]['type']) => {
  const baseId = crypto.randomUUID();

  switch (type) {
    case 'rich-text':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Section title',
        body: 'Add a detailed description here.',
      };
    case 'list':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Checklist or items',
        description: 'Use this section for editable lists.',
        items: ['Item one', 'Item two'],
      };
    case 'gallery':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Gallery',
        description: 'Add image URLs to show multiple photos.',
        images: ['/images/hero_sunset.jpg'],
      };
    case 'faq':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Frequently asked questions',
        faqs: [
          {
            question: 'Sample question?',
            answer: 'Sample answer.',
          },
        ],
      };
    case 'pricing':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Pricing',
        pricingItems: [{ label: 'Sample price item', note: 'Optional note' }],
      };
    case 'info-grid':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Key details',
        infoItems: [{ label: 'Label', value: 'Value', detail: 'Optional detail' }],
      };
    case 'cta':
      return {
        id: `section-${baseId}`,
        type,
        title: 'Ready to book?',
        description: 'Invite the guest to contact you here.',
        primaryCta: { label: 'Primary CTA', href: '/enquiry' },
        secondaryCta: { label: 'Secondary CTA', href: '/services' },
      };
    default:
      return {
        id: `section-${baseId}`,
        type,
        title: 'Custom section',
        customFields: { Key: 'Value' },
      };
  }
};

export default function ServicesAdminClient({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editingService, setEditingService] = useState<ServiceFormState | null>(null);
  const [sectionsText, setSectionsText] = useState('[]');
  const [galleryText, setGalleryText] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => a.sort_order - b.sort_order),
    [services],
  );

  const openNewService = () => {
    const nextSortOrder = services.length > 0 ? Math.max(...services.map((service) => service.sort_order)) + 1 : 1;
    const nextService = createEmptyService(nextSortOrder);
    setEditingService(nextService);
    setSectionsText(JSON.stringify([], null, 2));
    setGalleryText('');
    setIsEditorOpen(true);
  };

  const openEditService = (service: Service) => {
    setEditingService({
      id: service.id,
      slug: service.slug,
      name: service.name,
      short_description: service.short_description,
      icon: service.icon,
      cover_image: service.cover_image,
      gallery: [...service.gallery],
      sections: [...service.sections],
      sort_order: service.sort_order,
      status: service.status,
    });
    setSectionsText(JSON.stringify(service.sections, null, 2));
    setGalleryText(service.gallery.join(', '));
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingService(null);
  };

  const updateServiceStatus = async (service: Service, nextStatus: Service['status']) => {
    const updatedService: Service = {
      ...service,
      status: nextStatus,
    };

    await db.saveService(updatedService);
    const nextServices = await db.getServices();
    setServices(nextServices);
  };

  const appendSectionTemplate = (type: Service['sections'][number]['type']) => {
    try {
      const currentSections = sectionsText.trim() ? JSON.parse(sectionsText) : [];
      if (!Array.isArray(currentSections)) {
        throw new Error('Sections must be an array.');
      }

      currentSections.push(createSectionTemplate(type));
      setSectionsText(JSON.stringify(currentSections, null, 2));
    } catch {
      alert('Fix the sections JSON before adding a new template.');
    }
  };

  const saveService = async () => {
    if (!editingService || !editingService.name.trim() || !editingService.slug.trim()) {
      return;
    }

    let parsedSections: unknown;
    let parsedGallery: string[] = [];

    try {
      parsedSections = JSON.parse(sectionsText);
      if (!Array.isArray(parsedSections)) {
        throw new Error('Sections must be a JSON array.');
      }
    } catch (error) {
      alert('Sections must be valid JSON.');
      return;
    }

    try {
      parsedGallery = galleryText
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    } catch {
      parsedGallery = [];
    }

    const payload: Service = {
      ...editingService,
      sections: parsedSections,
      gallery: parsedGallery,
      created_at: services.find((service) => service.id === editingService.id)?.created_at,
    };

    await db.saveService(payload);
    const nextServices = await db.getServices();
    setServices(nextServices);
    closeEditor();
  };

  const deleteService = async (service: Service) => {
    if (!confirm(`Delete ${service.name}?`)) {
      return;
    }

    await db.deleteService(service.id);
    const nextServices = await db.getServices();
    setServices(nextServices);
  };

  const duplicateService = async (service: Service) => {
    const clonedService: Service = {
      ...service,
      id: crypto.randomUUID(),
      slug: `${service.slug}-copy`,
      name: `${service.name} Copy`,
      sort_order: Math.max(...services.map((entry) => entry.sort_order)) + 1,
    };

    await db.saveService(clonedService);
    const nextServices = await db.getServices();
    setServices(nextServices);
  };

  const updateSortOrder = async (service: Service, direction: 'up' | 'down') => {
    const ordered = [...sortedServices];
    const index = ordered.findIndex((entry) => entry.id === service.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ordered.length) return;

    const current = ordered[index];
    const swap = ordered[swapIndex];
    const currentOrder = current.sort_order;
    current.sort_order = swap.sort_order;
    swap.sort_order = currentOrder;

    await db.saveService(current);
    await db.saveService(swap);
    const nextServices = await db.getServices();
    setServices(nextServices);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>Services Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Add, reorder, duplicate, and edit your service offerings from one reusable content system.
          </p>
        </div>
        <button onClick={openNewService} className="btn btn-primary">
          <Plus size={16} /> Add New Service
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {sortedServices.map((service) => (
          <div key={service.id} className="card" style={{ padding: '22px', display: 'grid', gridTemplateColumns: '1.2fr auto', gap: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>{service.name}</h3>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    backgroundColor: SERVICE_STATUS_META[service.status].background,
                    color: SERVICE_STATUS_META[service.status].color,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {SERVICE_STATUS_META[service.status].label}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{service.short_description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Slug: {service.slug}</span>
                <span>Order: {service.sort_order}</span>
                <span>Sections: {service.sections.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => updateSortOrder(service, 'up')}>
                <ArrowUp size={14} />
              </button>
              <button className="btn btn-outline" onClick={() => updateSortOrder(service, 'down')}>
                <ArrowDown size={14} />
              </button>
              <button className="btn btn-outline" onClick={() => openEditService(service)}>
                <Edit2 size={14} /> Edit
              </button>
              <button className="btn btn-outline" onClick={() => duplicateService(service)}>
                <CopyPlus size={14} /> Duplicate
              </button>
              <button
                className="btn btn-outline"
                onClick={() => updateServiceStatus(service, service.status === 'paused' ? 'active' : 'paused')}
                style={{ color: service.status === 'paused' ? 'var(--secondary)' : 'var(--accent)' }}
              >
                {service.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                {service.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button className="btn btn-outline" onClick={() => deleteService(service)} style={{ color: '#DC2626' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditorOpen && editingService && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28, 25, 23, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#FFFFFF', padding: '32px', position: 'relative' }}>
            <button onClick={closeEditor} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Edit Service</h2>

            {/* Row 1: Name and Slug */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Name</label>
                <input
                  value={editingService.name}
                  onChange={(event) =>
                    setEditingService({
                      ...editingService,
                      name: event.target.value,
                      slug: editingService.slug || slugifyServiceName(event.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    minWidth: 0,
                  }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Slug</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', minWidth: 0 }}>
                  <input
                    value={editingService.slug}
                    onChange={(event) =>
                      setEditingService({ ...editingService, slug: event.target.value })
                    }
                    style={{
                      flex: 1,
                      minWidth: 0,
                      boxSizing: 'border-box',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setEditingService({
                        ...editingService,
                        slug: slugifyServiceName(editingService.name || editingService.slug),
                      })
                    }
                    style={{
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Icon, Status, and Sort Order */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Icon</label>
                <select
                  value={editingService.icon}
                  onChange={(event) => setEditingService({ ...editingService, icon: event.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#FFFFFF',
                    minWidth: 0,
                  }}
                >
                  {SERVICE_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Status</label>
                <select
                  value={editingService.status}
                  onChange={(event) =>
                    setEditingService({
                      ...editingService,
                      status: event.target.value as Service['status'],
                    })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#FFFFFF',
                    minWidth: 0,
                  }}
                >
                  <option value="active">Active (Visible on site)</option>
                  <option value="paused">Paused (Hidden from site)</option>
                  <option value="inactive">Inactive (Hidden from site)</option>
                </select>
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Sort Order</label>
                <input
                  type="number"
                  value={editingService.sort_order}
                  onChange={(event) =>
                    setEditingService({
                      ...editingService,
                      sort_order: Number(event.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    minWidth: 0,
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Short Description</label>
              <textarea
                rows={3}
                value={editingService.short_description}
                onChange={(event) =>
                  setEditingService({ ...editingService, short_description: event.target.value })
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Cover Image</label>
              <input
                value={editingService.cover_image}
                onChange={(event) =>
                  setEditingService({ ...editingService, cover_image: event.target.value })
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Gallery URLs</label>
              <textarea
                rows={3}
                value={galleryText}
                onChange={(event) => setGalleryText(event.target.value)}
                placeholder="Comma-separated image URLs"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700 }}>Sections JSON</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {['rich-text', 'list', 'gallery', 'faq', 'pricing', 'info-grid', 'cta', 'custom'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="btn btn-outline"
                    onClick={() => appendSectionTemplate(type as Service['sections'][number]['type'])}
                    style={{ padding: '8px 12px', borderRadius: '999px', fontSize: '0.74rem' }}
                  >
                    + {type}
                  </button>
                ))}
              </div>
              <textarea
                rows={14}
                value={sectionsText}
                onChange={(event) => setSectionsText(event.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={closeEditor} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveService} type="button">
                <Save size={14} /> Save Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}