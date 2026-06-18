import React from 'react';
import { MapPin, Plane, ShieldCheck, Compass, Map } from 'lucide-react';

export default function AboutPage() {
  const distances = [
    { location: 'Lal Bagh Palace', distance: '1.2 km', type: 'Heritage Site', duration: '4 mins drive' },
    { location: 'Rajwada Palace', distance: '3.5 km', type: 'Historical landmark', duration: '12 mins drive' },
    { location: 'Sarafa Night Food Bazar', distance: '3.8 km', type: 'Food street', duration: '12 mins drive' },
    { location: 'Chappan Dukan', distance: '5.2 km', type: 'Indori street food hub', duration: '15 mins drive' },
    { location: 'Devi Ahilyabai Holkar Airport', distance: '8.5 km', type: 'Transit', duration: '20 mins drive' },
    { location: 'Indore Junction Railway Station', distance: '4.8 km', type: 'Transit', duration: '15 mins drive' },
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px', display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* 1. Header */}
      <section style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
          Our Sanctuary
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>About Agrawal House</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Step back into a world of trees, heritage architecture, and the hospitality of a family home in Indore.
        </p>
      </section>

      {/* 2. Story Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '56px', alignItems: 'center' }}>
        <div>
          <img
            src="/images/hero_sunset.jpg"
            alt="Agrawal House exterior view"
            style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', width: '100%', maxHeight: '450px', objectFit: 'cover' }}
          />
        </div>
        <div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '24px' }}>The Legacy of Indore Hospitality</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px', fontSize: '1.05rem' }}>
            Agrawal House was originally constructed as a getaway manor, incorporating central high-timber ceilings, broad corridors, and clay roofing style. Over the years, the family has carefully preserved its structure, adapting it to provide travelers with a boutique, quiet, and authentic Indian homestay experience.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px', fontSize: '1.05rem' }}>
            Our grounds are surrounded by private gardens containing aged fruit trees (mangoes, guavas, sweet limes, custard apples).
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
            When staying with us, you are not simply renting a hotel room. You are becoming a guest of our house, experiencing traditional home-cooked Indori breakfasts, freshly brewed teas, and custom recommendations.
          </p>
        </div>
      </section>

      {/* 3. Location and Attractions */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '64px' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '40px', textAlign: 'center' }}>Location & Access</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' }}>
          {/* Nearby Points of Interest */}
          <div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} style={{ color: 'var(--primary)' }} /> Nearby Attractions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {distances.map((item) => (
                <div
                  key={item.location}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '2px' }}>{item.location}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.type}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.95rem', display: 'block' }}>{item.distance}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Guide Map Visual */}
          <div
            style={{
              padding: '40px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Map size={20} style={{ color: 'var(--secondary)' }} /> Our Location
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
              We are located in Indore's green residential heritage belt, adjacent to the historical **Lal Bagh Palace Gardens**. This is a serene, secure residential environment, away from the city traffic noises, yet extremely accessible to all major business hubs, heritage palaces, and culinary markets.
            </p>
            
            {/* Mock map graphic */}
            <div
              style={{
                height: '220px',
                backgroundColor: '#E5E7EB',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                border: '1px solid rgba(0,0,0,0.06)',
                backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                color: 'var(--text-primary)',
              }}
            >
              <MapPin size={32} style={{ color: 'var(--primary)', animation: 'bounce 2s infinite' }} />
              <strong style={{ fontSize: '1rem' }}>Agrawal House Homestay</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Indore, Madhya Pradesh</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Plane size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>Devi Ahilyabai Holkar Airport is only a 20-minute drive. Taxis and auto-rickshaws are easily available.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
