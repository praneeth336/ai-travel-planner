import { useEffect, useRef, useState } from 'react';
import { useTripStore } from '../state/tripStore';
import { Star } from 'lucide-react';

// High-quality Unsplash images for popular destinations
const DESTINATIONS = [
  { name: 'Santorini', tag: 'Romantic escape', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Bali', tag: 'Nature & culture', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop' },
  { name: 'Kyoto', tag: 'Serene tradition', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Maldives', tag: 'Island paradise', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop' },
  { name: 'Swiss Alps', tag: 'Adventure peaks', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop' },
  { name: 'Paris', tag: 'City of love', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop' },
];

const STATS = [
  { value: '50K+', label: 'Trips Planned' },
  { value: '120+', label: 'Destinations' },
  { value: '4.9★', label: 'Avg Rating' },
  { value: '98%', label: 'Satisfaction' },
];

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.792 0-5.484-.235-8.08-.683-1.717-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: 'AI-Powered Planning',
    desc: 'Our intelligent engine crafts fully personalized itineraries tailored to your mood, budget, and travel style.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: 'Real Destination Photos',
    desc: 'See stunning, authentic images of your destination before you go — sourced live from Wikimedia Commons.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Smart Budget Breakdown',
    desc: 'Know exactly where every dollar goes — accommodation, food, transport, and activities all mapped out.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    title: 'Day-by-Day Itinerary',
    desc: 'Morning, afternoon, and evening plans for each day — with insider tips and local food picks included.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Results',
    desc: 'No waiting, no signup, no friction. Enter your preferences and get your full trip plan in seconds.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Tailored Travel Moods',
    desc: 'Relaxed, Romantic, Adventure, Nature, or Foodie — every vibe gets a uniquely curated experience.',
  },
];

// ─── Seasonal Destinations Database ─────────────────────────────────────────

type SeasonalPick = {
  name: string;
  tag: string;
  weather: string;
  image: string;
  desc: string;
  alternatives: {
    name: string;
    budget: string;
    tag: string;
    image: string;
  }[];
};

const SEASONAL_GUIDE: Record<string, {
  label: string;
  description: string;
  bestPicks: SeasonalPick[];
}> = {
  Spring: {
    label: 'Spring (Mar - May)',
    description: 'Perfect for cherry blossoms, mild temperatures, and scenic outdoor strolls.',
    bestPicks: [
      {
        name: 'Kyoto, Japan',
        tag: 'Peak Cherry Blossoms',
        weather: '🌸 15°C - 22°C · Mild & Crisp',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600',
        desc: 'Witness the breathtaking pastel cherry blossom canopy along historic temple canals.',
        alternatives: [
          { name: 'Vietnam', budget: '₹40,000', tag: 'Charming Spring Warmth', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=150' },
          { name: 'Munnar, India', budget: '₹25,000', tag: 'Lush Green Tea Hills', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=150' }
        ]
      },
      {
        name: 'Santorini, Greece',
        tag: 'Caldera Sunsets',
        weather: '☀️ 18°C - 24°C · Sunny & Breezy',
        image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=600',
        desc: 'Enjoy romantic white-washed alleyways and blue-domed sights without summer crowds.',
        alternatives: [
          { name: 'Pondicherry, India', budget: '₹15,000', tag: 'French Quarter Vibe', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=150' },
          { name: 'Udaipur, India', budget: '₹20,000', tag: 'Royal Lakeside Stays', image: 'https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c?q=80&w=150' }
        ]
      }
    ]
  },
  Summer: {
    label: 'Summer (Jun - Aug)',
    description: 'Ideal for tropical escapes, mountain hiking, and sun-drenched beaches.',
    bestPicks: [
      {
        name: 'Swiss Alps',
        tag: 'Alpine Meadows',
        weather: '🏔️ 12°C - 25°C · Sunny & Fresh',
        image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600',
        desc: 'Hike through vibrant green valley meadows and pristine glacial lakes under clear blue skies.',
        alternatives: [
          { name: 'Manali, India', budget: '₹20,000', tag: 'Escape the Summer Heat', image: 'https://images.unsplash.com/photo-1626621341515-bdf5f8998e6b?q=80&w=150' },
          { name: 'Ladakh, India', budget: '₹35,000', tag: 'High-Altitude Pass Stays', image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=150' }
        ]
      },
      {
        name: 'Bali, Indonesia',
        tag: 'Dry Coastal Sun',
        weather: '🏖️ 26°C - 31°C · Sunny & Warm',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600',
        desc: 'Peak season for pristine beaches, inland waterfalls, and tranquil temple architecture.',
        alternatives: [
          { name: 'Goa, India', budget: '₹20,000', tag: 'Monsoon Coast Charm', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=150' },
          { name: 'Amalfi Coast', budget: '₹1,40,000', tag: 'Premium Riviera Stays', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=150' }
        ]
      }
    ]
  },
  Autumn: {
    label: 'Autumn (Sep - Nov)',
    description: 'Crisp breezes, golden foliage, and atmospheric festivals across the globe.',
    bestPicks: [
      {
        name: 'Kyoto, Japan',
        tag: 'Fiery Red Maple Trees',
        weather: '🍁 12°C - 20°C · Cool & Dry',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600',
        desc: 'Temples are surrounded by stunning crimson momiji maple leaves under crystal clear skies.',
        alternatives: [
          { name: 'Thailand', budget: '₹45,000', tag: 'Mild & Festive Hikes', image: 'https://images.unsplash.com/photo-1528181304800-2f5337a99442?q=80&w=150' },
          { name: 'Kerala, India', budget: '₹25,000', tag: 'Post-Monsoon Backwaters', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=150' }
        ]
      },
      {
        name: 'Paris, France',
        tag: 'Romantic Fall Walks',
        weather: '🍂 10°C - 16°C · Crisp & Mild',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600',
        desc: 'Stroll through golden Tuileries gardens and cozy up in warm corner bistro seats.',
        alternatives: [
          { name: 'Dubai, UAE', budget: '₹70,000', tag: 'Perfect Oasis Climate', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=150' },
          { name: 'Hampi, India', budget: '₹12,000', tag: 'Breezy Boulder Ruins', image: 'https://images.unsplash.com/photo-1600100397608-f010b423b971?q=80&w=150' }
        ]
      }
    ]
  },
  Winter: {
    label: 'Winter (Dec - Feb)',
    description: 'Perfect for beach sunshine, festive events, and snow-filled winter wonderland peaks.',
    bestPicks: [
      {
        name: 'Maldives',
        tag: 'Peak Ocean Sun',
        weather: '🏝️ 27°C - 31°C · Clear & Calmer Seas',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600',
        desc: 'Overwater bungalows, vibrant marine life snorkeling, and cloudless skies.',
        alternatives: [
          { name: 'Phuket, Thailand', budget: '₹45,000', tag: 'Budget Tropical Escape', image: 'https://images.unsplash.com/photo-1528181304800-2f5337a99442?q=80&w=150' },
          { name: 'Goa, India', budget: '₹20,000', tag: 'Peak Festive Vibes', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=150' }
        ]
      },
      {
        name: 'Cape Town, South Africa',
        tag: 'Warm Southern Summer',
        weather: '☀️ 22°C - 28°C · Sunny & Dry',
        image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=600',
        desc: 'Soak in gorgeous coastline drives, vineyard picnics, and breezy Table Mountain hikes.',
        alternatives: [
          { name: 'Udaipur, India', budget: '₹20,000', tag: 'Royal Fort Weather', image: 'https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c?q=80&w=150' },
          { name: 'Munnar, India', budget: '₹25,000', tag: 'Misty Tea Hills Chills', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=150' }
        ]
      }
    ]
  }
};

export default function LandingPage() {
  const { navigate, dispatch } = useTripStore();
  const [visible, setVisible] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Spring');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleDestinationClick = (name: string) => {
    dispatch({ type: 'SET_DESTINATION', destination: name });
    navigate('preferences');
  };

  const handleAlternativeClick = (name: string, budgetStr: string) => {
    const num = parseInt(budgetStr.replace(/[^0-9]/g, '')) || 20000;
    dispatch({ type: 'SET_DESTINATION', destination: name });
    dispatch({ type: 'SET_PREF', field: 'budget', value: num });
    navigate('preferences');
  };

  const currentSeasonData = SEASONAL_GUIDE[selectedSeason];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Hero gradient bg */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(160deg, #f0f9ff 0%, #fdf2f8 45%, #e0f2fe 100%)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px',
            alignItems: 'center',
          }}>
            {/* Left Column: Text & CTA */}
            <div style={{ textAlign: 'left', maxWidth: 600 }}>
              <div className={`badge badge-ice anim-fade-up ${visible ? '' : 'opacity-0'}`} style={{ marginBottom: 24, display: 'inline-flex' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                AI Travel Planner — Powered by Intelligence
              </div>

              <h1
                className="anim-fade-up delay-100"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(3rem, 5vw, 5.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  marginBottom: 24,
                  color: '#0c1b33',
                }}
              >
                Your next trip, <br />
                <span className="text-gradient-duo">perfectly planned</span>
                <br />in seconds.
              </h1>

              <p
                className="anim-fade-up delay-200"
                style={{
                  fontSize: '1.15rem',
                  color: '#2d5474',
                  marginBottom: 40,
                  lineHeight: 1.65,
                }}
              >
                Tell us your destination, mood, and budget.
                EeezTrip's AI crafts a jaw-dropping itinerary — complete with stunning photography,
                daily plans, local food picks, and a smart cost breakdown.
              </p>

              <div className="anim-fade-up delay-300" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('choice')}
                >
                  Start Planning Free
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
                <button
                  className="btn btn-outline btn-lg"
                  onClick={() => {
                    const features = document.getElementById('seasonal-section');
                    if (features) features.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ borderRadius: 999 }}
                >
                  See Seasonal Guide
                </button>
              </div>
            </div>

            {/* Right Column: Floating 3D Image Composition */}
            <div className="anim-fade-up delay-400" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="hero-floating-grid">
                {/* Image 1: Main Top Right */}
                <div className="hero-card hero-card-1 animate-float">
                  <img src="https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=600&auto=format&fit=crop" alt="Santorini" />
                </div>
                {/* Image 2: Bottom Left */}
                <div className="hero-card hero-card-2 animate-float-fast" style={{ animationDelay: '1s' }}>
                  <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" alt="Kyoto" />
                </div>
                {/* Image 3: Far Right Behind */}
                <div className="hero-card hero-card-3 animate-float-slow" style={{ animationDelay: '2s' }}>
                  <img src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop" alt="Swiss Alps" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '48px 24px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="glass" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 0,
            padding: '28px 16px',
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '20px 12px',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(186,230,253,0.5)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #0284c7, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {s.value}
                </div>
                <div style={{ color: '#5b8bad', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ──────────────────────────────────────── */}
      <section style={{ padding: '60px 24px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="badge badge-pink" style={{ marginBottom: 16 }}>Top Picks</div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#0c1b33',
            }}>
              Trending <span className="text-gradient-ice">destinations</span>
            </h2>
            <p style={{ color: '#5b8bad', marginTop: 12, fontSize: '1.1rem' }}>
              Click any destination to start planning instantly
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {DESTINATIONS.map((d, i) => (
              <button
                key={d.name}
                onClick={() => handleDestinationClick(d.name)}
                className="img-card anim-fade-up"
                style={{
                  height: 340,
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                  textAlign: 'left',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <img src={d.image} alt={d.name} loading="lazy" />
                <div className="img-card-overlay" />
                <div className="img-card-content">
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#bae6fd', textTransform: 'uppercase', marginBottom: 6 }}>
                    {d.tag}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1 }}>
                    {d.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Seasonal Destinations Section ────────────────── */}
      <section id="seasonal-section" style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, transparent, rgba(244,246,248,0.6) 50%, transparent)',
        position: 'relative', zIndex: 1,
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="badge badge-pink" style={{ marginBottom: 16 }}>Seasonal Advisor</div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
              fontWeight: 900,
              color: '#0c1b33',
              letterSpacing: '-0.02em'
            }}>
              Best destinations to visit <span className="text-gradient-duo">by season</span>
            </h2>
            <p style={{ color: '#5b8bad', marginTop: 12, fontSize: '1.1rem', maxWidth: 640, margin: '12px auto 0' }}>
              Explore where weather, scenery, and price align perfectly — along with budget-friendly alternative destinations.
            </p>
          </div>

          {/* Custom Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 36,
            flexWrap: 'wrap'
          }} >
            {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map(season => {
              const active = selectedSeason === season;
              let emoji = '🌸';
              if (season === 'Summer') emoji = '☀️';
              if (season === 'Autumn') emoji = '🍁';
              if (season === 'Winter') emoji = '❄️';

              return (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 999,
                    border: `1.5px solid ${active ? '#0ea5e9' : 'rgba(0,0,0,0.06)'}`,
                    background: active ? 'rgba(14,165,233,0.08)' : '#fff',
                    cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: active ? '#0284c7' : '#2d5474',
                    transition: 'all 0.25s ease',
                    boxShadow: active ? '0 8px 24px rgba(14,165,233,0.1)' : '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = '#0ea5e9';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                    }
                  }}
                >
                  <span>{emoji}</span>
                  {season}
                </button>
              );
            })}
          </div>

          {/* Seasonal Description */}
          <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>
              {currentSeasonData.label}
            </p>
            <p style={{ color: '#5b8bad', fontSize: '1rem', fontStyle: 'italic' }}>
              "{currentSeasonData.description}"
            </p>
          </div>

          {/* Seasonal Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 32
          }}>
            {currentSeasonData.bestPicks.map((pick, index) => (
              <div
                key={pick.name}
                className="glass anim-fade-up"
                style={{
                  padding: 24,
                  borderRadius: 32,
                  background: '#fff',
                  boxShadow: '0 12px 40px rgba(12, 27, 51, 0.04)',
                  animationDelay: `${index * 0.15}s`,
                  border: '1px solid rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Card Image and Main Details */}
                  <div style={{
                    height: 240,
                    borderRadius: 24,
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: 20
                  }}>
                    <img src={pick.image} alt={pick.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      background: 'rgba(12, 27, 51, 0.8)',
                      backdropFilter: 'blur(4px)',
                      padding: '8px 16px',
                      borderRadius: 999,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }} >
                      {pick.tag}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: '#0c1b33'
                    }}>
                      {pick.name}
                    </h3>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#0ea5e9',
                      background: 'rgba(14,165,233,0.06)',
                      padding: '6px 14px',
                      borderRadius: 999
                    }}>
                      {pick.weather}
                    </span>
                  </div>

                  <p style={{ color: '#5b8bad', fontSize: '0.96rem', lineHeight: 1.6, marginBottom: 24 }}>
                    {pick.desc}
                  </p>

                  {/* Alternatives Section */}
                  <div style={{
                    background: 'linear-gradient(135deg, #fbfbfb 0%, #f4f6f8 100%)',
                    padding: 20,
                    borderRadius: 20,
                    border: '1px solid rgba(0,0,0,0.04)',
                    marginBottom: 28
                  }}>
                    <h4 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: '#0c1b33',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#0ea5e9' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Smart Alternatives in Budget:
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {pick.alternatives.map(alt => (
                        <button
                          key={alt.name}
                          type="button"
                          onClick={() => handleAlternativeClick(alt.name, alt.budget)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.04)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#0ea5e9';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                            e.currentTarget.style.transform = '';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                              <img src={alt.image} alt={alt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0c1b33' }}>{alt.name}</span>
                              <span style={{ fontSize: '0.75rem', color: '#5b8bad', marginLeft: 8 }}>— {alt.tag}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0ea5e9' }}>{alt.budget}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDestinationClick(pick.name)}
                  className="btn btn-primary"
                  style={{ width: '100%', borderRadius: 16, padding: 14 }}
                >
                  Plan This {selectedSeason} Trip
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Stories Preview ────────────────────────────────── */}
      <section style={{ padding: '80px 24px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="glass" style={{ padding: '60px 40px', borderRadius: 48, background: 'rgba(255,255,255,0.4)' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="badge badge-ice" style={{ marginBottom: 16 }}>Community</div>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 900,
                color: '#0c1b33',
              }} >
                Traveler <span className="text-gradient-duo">Stories</span>
              </h2>
              <p style={{ color: '#5b8bad', marginTop: 12, fontSize: '1.1rem' }}>
                See how others are exploring the world with EeezTrip.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
               {[
                 { name: "Rahul S.", destination: "Kyoto", comment: "The AI suggested a hidden temple in Arashiyama that wasn't on any guide! Incredible experience.", rating: 5 },
                 { name: "Ananya M.", destination: "Santorini", comment: "Perfectly timed sunset spots. The budget breakdown was spot on too.", rating: 5 },
                 { name: "James L.", destination: "Swiss Alps", comment: "Found the most cozy mountain lodge thanks to the AI recommendations.", rating: 4 }
               ].map((s, i) => (
                 <div key={i} className="glass anim-fade-up" style={{ padding: 24, borderRadius: 24, background: '#fff' }}>
                    <div style={{ display: 'flex', gap: 1, color: '#fbbf24', marginBottom: 12 }}>
                      {[...Array(5)].map((_, idx) => <Star key={idx} style={{ width: 14, height: 14, fill: idx < s.rating ? 'currentColor' : 'none', stroke: 'currentColor' }} />)}
                    </div>
                    <p style={{ color: '#2d5474', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 16 }}>"{s.comment}"</p>
                    <div style={{ fontWeight: 800, color: '#0c1b33', fontSize: '0.9rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5b8bad' }}>Explored {s.destination}</div>
                 </div>
               ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate('reviews')}
                style={{ borderRadius: 999, padding: '12px 32px' }}
              >
                View All Community Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features-section" style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, transparent, rgba(224,242,254,0.4), transparent)',
        position: 'relative', zIndex: 1,
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="badge badge-ice" style={{ marginBottom: 16 }}>Features</div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#0c1b33',
            }} >
              Everything you need,{' '}
              <span className="text-gradient-pink">nothing you don't</span>
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="glass anim-fade-up"
                style={{
                  padding: '32px',
                  animationDelay: `${i * 0.08}s`,
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: '0 8px 30px rgba(12, 27, 51, 0.05)'
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
              >
                <div className="icon-wrap" style={{ marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800, fontSize: '1.25rem',
                  color: '#0c1b33', marginBottom: 10,
                }}>
                  {f.title}
                </h3>
                <p style={{ color: '#5b8bad', lineHeight: 1.65, fontSize: '0.95rem' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px 100px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, #075985 0%, #0ea5e9 50%, #ec4899 100%)',
            borderRadius: 32,
            padding: 'clamp(50px, 8vw, 80px) 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle light effects */}
            <div style={{
              position: 'absolute', top: '-50%', right: '-15%',
              width: 400, height: 400, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
              filter: 'blur(40px)',
            }} />
            
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: 20,
              letterSpacing: '-0.02em'
            }}>
              Ready to plan your dream trip?
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '1.15rem',
              maxWidth: 500, margin: '0 auto 40px',
              lineHeight: 1.6,
            }}>
              No sign-up. No credit card. Just your destination and a dream. Let our intelligence do the rest.
            </p>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('choice')}
              style={{ fontSize: '1.1rem', borderRadius: 999, padding: '16px 36px', background: 'rgba(255,255,255,0.1)' }}
            >
              Plan My Trip Now
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        color: '#5b8bad',
        fontSize: '0.9rem',
        borderTop: '1px solid rgba(186,230,253,0.4)',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#0284c7' }}>EeezTrip</span>
        {' '}— Premium AI Travel Planner · Built with ❤️ · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
