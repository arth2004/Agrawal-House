import React from 'react';
import { MapPin, Plane, Compass, Map, UtensilsCrossed, TrainFront } from 'lucide-react';

export const keyLandmarks = [
  { location: 'Mahakaleshwar Jyotirlinga', distance: '7 min walk' },
  { location: 'Shree Bada Ganesh Mandir', distance: '8 min walk' },
  { location: 'Bharat Mata Mandir', distance: '9 min walk' },
  { location: 'Ram Ghat', distance: '11 min walk' },
  { location: 'Harsiddhi Mandir Square', distance: '1.2 km' },
  { location: 'Mahakal Lok', distance: '1.2 km' },
  { location: 'Bhartrihari Cave', distance: '2 km' },
  { location: 'Jantar Mantar', distance: '2.6 km' },
  { location: 'Jai Maa Gadhkalika Mata Mandir', distance: '2.7 km' },
  { location: 'Shri Kaal Bhairav Temple', distance: '4.7 km' },
];

export const foodAndShopping = [
  { location: 'Jawahar Marg', distance: '1 min walk' },
  { location: 'Chatri Chowk', distance: '3 min walk' },
  { location: 'Mahakaleshwar Marg', distance: '9 min walk' },
  { location: 'Vikramaditya Cloth Market', distance: '1.3 km' },
  { location: 'Gopal Mandir Marg', distance: '2.3 km' },
  { location: 'Free Ganj', distance: '3.2 km' },
  { location: 'Treasure Bazaar', distance: '5.1 km' },
  { location: 'Cosmos Mall', distance: '5.2 km' },
];

export const transport = [
  { location: 'Ujjain Junction Railway Station', distance: '1.6 km' },
  { location: 'Dewas Gate Bus Stand', distance: '2 km' },
  { location: 'Nana Kheda Bus Stand', distance: '4.4 km' },
  { location: 'Devi Ahilyabai Holkar Airport', distance: '57.5 km' },
];

type NearbyItem = { location: string; distance: string };

function NearbyList({ items }: { items: NearbyItem[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map((item) => (
        <div
          key={item.location}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
          }}
        >
          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0, paddingRight: '12px' }}>{item.location}</h4>
          <span style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.85rem', flexShrink: 0 }}>{item.distance}</span>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px 80px 24px', display: 'flex', flexDirection: 'column', gap: '80px' }}>
      
      {/* 1. Header */}
      <section style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>
          Our Sanctuary
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>About Agrawal House</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Step back into a world of trees, heritage architecture, and the hospitality of a family home in Ujjain.
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
          <h2 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>The Legacy of Ujjain Hospitality</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px', fontSize: '1.05rem' }}>
          Located 700 metres from Mahakaleshwar Jyotirlinga, Agrawal House offers air-conditioned accommodation with a terrace and free WiFi. The property has city views and is 1 km from Ujjain Kumbh Mela and 1.5 km from Ujjain Junction Station. The homestay features family rooms.          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px', fontSize: '1.05rem' }}>
          The nearest airport is Devi Ahilya Bai Holkar Airport, 57 km from the homestay.
          Nearest homestay( 500m from Mahakal Mandir) you can find with clean, hygienic and affordable price rooms..          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
          Numerous ancient temples like Mahakal and a lot more temples to visit nearby. Good restaurant and places to eat. Nearby government parking available for all types of vehicles. Ram ghat is the best place you could visit nearby at night to find peace.
          <br/>Note:- Parking is not available at the property but 400m from here in a public parking          </p>
        </div>
      </section>

      {/* 3. Location and Attractions */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '64px' }}>
        <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', textAlign: 'center' }}>Location & Access</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px', fontSize: '1rem', lineHeight: '1.6' }}>
          Minutes from Mahakaleshwar and the sacred ghats of the Shipra, Agrawal House puts you at the heart of Ujjain&apos;s spiritual and cultural life.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', marginBottom: '56px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} style={{ color: 'var(--primary)' }} /> Key Landmarks
            </h3>
            <NearbyList items={keyLandmarks} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UtensilsCrossed size={20} style={{ color: 'var(--primary)' }} /> Food & Shopping
            </h3>
            <NearbyList items={foodAndShopping} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrainFront size={20} style={{ color: 'var(--primary)' }} /> Transport
            </h3>
            <NearbyList items={transport} />
          </div>
        </div>

        {/* Local Guide Map Visual */}
        <div
          style={{
            padding: '40px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Map size={20} style={{ color: 'var(--secondary)' }} /> Our Location
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            We are located in a quiet residential lane near the Mahakal corridor — a serene, secure environment away from city traffic, yet within walking distance of the Jyotirlinga, ghats, and the bustling lanes of old Ujjain.
          </p>
          
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ujjain, Madhya Pradesh</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Plane size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>Ujjain Junction is 1.6 km away. Devi Ahilyabai Holkar Airport (Indore) is about 57.5 km — taxis and auto-rickshaws are readily available.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
