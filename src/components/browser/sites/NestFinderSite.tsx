/**
 * NestFinder Site
 *
 * Apartment/real estate listings site for the engAIge browser.
 * Features realistic listings, suspicious deals, and comedic red flags.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'

const site = FILLER_SITES.realestate

// ============================================================================
// Types
// ============================================================================

interface Listing {
  id: string
  title: string
  address: string
  neighborhood: string
  price: number
  priceType: 'rent' | 'sale'
  beds: number
  baths: number
  sqft: number
  type: 'apartment' | 'house' | 'condo' | 'studio' | 'room'
  images: string[]
  description: string
  amenities: string[]
  highlights: string[]
  redFlags?: string[]
  available: string
  posted: string
  agent?: {
    name: string
    avatar: string
    phone: string
    responseTime: string
  }
  petPolicy: string
  parking: string
  laundry: string
}

// ============================================================================
// Sample Data
// ============================================================================

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 'lst_1',
    title: 'Stunning 2BR with City Views - Near The Underground!',
    address: '847 Hartwell Ave, Unit 12B',
    neighborhood: 'Downtown',
    price: 2450,
    priceType: 'rent',
    beds: 2,
    baths: 1,
    sqft: 950,
    type: 'apartment',
    images: ['🏢', '🛋️', '🍳', '🛏️'],
    description: `Beautiful 2-bedroom apartment in the heart of downtown, just 2 blocks from The Underground music venue! Perfect for music lovers and night owls.

Modern finishes throughout, including quartz countertops, stainless steel appliances, and hardwood floors. Large windows provide abundant natural light and stunning city views.

The building features a rooftop deck, secure entry, and on-site maintenance. Walkable to restaurants, cafes, and public transit.

Note: Previous tenant was a musician. Soundproofing is... adequate.`,
    amenities: ['Central A/C', 'Dishwasher', 'In-unit Washer/Dryer', 'Rooftop Access', 'Secure Entry', 'Package Room'],
    highlights: ['2 blocks from The Underground', 'City views', 'Recently renovated', 'Pet-friendly building'],
    available: 'Immediate',
    posted: '3 days ago',
    agent: {
      name: 'Sarah Martinez',
      avatar: '👩‍💼',
      phone: '(555) 234-5678',
      responseTime: 'Usually responds within 1 hour',
    },
    petPolicy: 'Cats OK, Dogs OK (under 50 lbs)',
    parking: 'Street parking available',
    laundry: 'In-unit',
  },
  {
    id: 'lst_2',
    title: 'AMAZING DEAL! Cozy Studio - $500/mo - MUST SEE!!!',
    address: '1247 Shadow Lane, Basement Unit',
    neighborhood: 'Eastside',
    price: 500,
    priceType: 'rent',
    beds: 0,
    baths: 1,
    sqft: 280,
    type: 'studio',
    images: ['🏚️', '🪟', '💡', '🚿'],
    description: `INCREDIBLE opportunity for the RIGHT tenant!! This cozy basement studio won't last long at this price!!!

Perfect for someone who values PRIVACY and doesn't mind LIMITED natural light. The previous tenant left suddenly but we've cleaned most of their stuff out.

Unique features:
- Vintage charm (built 1952, original everything)
- Convenient water heater location (doubles as heat source!)
- Shared entrance with upstairs neighbor (great for making friends!)
- Interesting ceiling height (perfect for shorter tenants)

Landlord lives upstairs and is VERY attentive. Will require references from previous 5 landlords, employer, and spiritual advisor.`,
    amenities: ['Heat included*', 'Water included', 'WiFi available**'],
    highlights: ['Incredibly low rent', 'Quiet neighborhood', 'Close to bus stop', 'Character unit'],
    redFlags: [
      '*Heat is from water heater only',
      '**WiFi password changes weekly',
      'Ceiling height 6\'2"',
      'Previous tenant left suddenly',
      'Landlord lives upstairs',
    ],
    available: 'Immediate (seriously, VERY immediate)',
    posted: '47 days ago (relisted)',
    petPolicy: 'No pets. No plants. No guests after 8 PM.',
    parking: 'Street parking only (good luck)',
    laundry: 'Laundromat 0.5 miles away',
  },
  {
    id: 'lst_3',
    title: 'Luxury 1BR in The Hartwell Building - High Floor',
    address: '100 Hartwell Plaza, Unit 34F',
    neighborhood: 'Financial District',
    price: 3200,
    priceType: 'rent',
    beds: 1,
    baths: 1,
    sqft: 750,
    type: 'condo',
    images: ['🌆', '✨', '🛁', '🌃'],
    description: `Experience luxury living in the iconic Hartwell Building! This stunning 1-bedroom condo offers breathtaking city views from the 34th floor.

Features include:
- Floor-to-ceiling windows
- Premium finishes throughout
- Spa-like bathroom with soaking tub
- Chef's kitchen with premium appliances

Building amenities include 24/7 concierge, fitness center, resident lounge, and rooftop pool.

Note: Unit was recently renovated following the 2018 incident. All inspections passed. Building is completely safe now. Probably.`,
    amenities: ['24/7 Concierge', 'Fitness Center', 'Rooftop Pool', 'Resident Lounge', 'Valet Parking', 'Dog Spa'],
    highlights: ['34th floor views', 'Luxury finishes', 'Full-service building', 'Walking distance to everything'],
    available: 'December 1st',
    posted: '1 week ago',
    agent: {
      name: 'Marcus Chen',
      avatar: '👨‍💼',
      phone: '(555) 789-0123',
      responseTime: 'Usually responds within 30 minutes',
    },
    petPolicy: 'Dogs OK (building has dog spa!)',
    parking: 'Valet parking included',
    laundry: 'In-unit',
  },
  {
    id: 'lst_4',
    title: 'Charming Room in Shared House - Quantum Coffee Enthusiasts Welcome!',
    address: '2847 Oak Street',
    neighborhood: 'Midtown',
    price: 875,
    priceType: 'rent',
    beds: 1,
    baths: 1,
    sqft: 180,
    type: 'room',
    images: ['🏠', '☕', '🛏️', '🌳'],
    description: `Looking for the perfect roommate to join our quantum coffee household!

We're a group of 3 professionals (ages 26-34) who share a passion for cutting-edge brewing techniques. Must be open-minded about spending 45 minutes observing the wave function collapse each morning.

The room is medium-sized with a nice window overlooking the backyard. Shared bathroom (dedicated observation schedule for morning routines), kitchen (our Q-3000 lives here), and living room.

Ideal roommate will:
- Appreciate quantum coffee (or be willing to learn)
- Not make fun of us for spending $3000 on a coffee maker
- Be okay with morning coffee rituals lasting until 10 AM
- Not mind some spirited debates about observer effects

Previous roommate left because they "couldn't handle the discourse." We're looking for someone more... aligned with our wavelength.`,
    amenities: ['Shared Kitchen', 'Backyard Access', 'Free Quantum Coffee', 'Weekly House Meetings'],
    highlights: ['Friendly roommates', 'Great neighborhood', 'Free coffee (quantum)', 'Utilities included'],
    redFlags: [
      'Must participate in coffee rituals',
      'Previous roommate conflicts',
      'Weekly mandatory house meetings',
    ],
    available: 'November 15th',
    posted: '5 days ago',
    petPolicy: 'No pets (affects the brewing)',
    parking: 'Driveway (shared)',
    laundry: 'In-house',
  },
  {
    id: 'lst_5',
    title: 'Spacious 3BR Family Home - Quiet Street',
    address: '456 Maple Drive',
    neighborhood: 'Riverside',
    price: 425000,
    priceType: 'sale',
    beds: 3,
    baths: 2,
    sqft: 1850,
    type: 'house',
    images: ['🏡', '🌿', '🍳', '🛏️'],
    description: `Welcome to your new home! This charming 3-bedroom, 2-bathroom house sits on a quiet, tree-lined street in the desirable Riverside neighborhood.

Features include:
- Open floor plan with living/dining combo
- Updated kitchen with granite counters
- Primary suite with walk-in closet
- Fenced backyard with mature landscaping
- Attached 2-car garage

Recent updates include new roof (2022), HVAC system (2023), and water heater (2024). Original hardwood floors throughout.

Excellent school district. Walking distance to Riverside Park. Minutes from downtown but feels like a retreat.

Sellers are motivated - they're relocating for work and need to close quickly.`,
    amenities: ['Fenced Yard', '2-Car Garage', 'Central A/C', 'Fireplace', 'Storage Shed', 'Sprinkler System'],
    highlights: ['Move-in ready', 'Updated systems', 'Great schools', 'Motivated sellers'],
    available: '30-day close possible',
    posted: '2 weeks ago',
    agent: {
      name: 'Jennifer Wu',
      avatar: '👩‍💼',
      phone: '(555) 456-7890',
      responseTime: 'Usually responds within 2 hours',
    },
    petPolicy: 'Your house, your rules',
    parking: '2-car garage + driveway',
    laundry: 'Washer/dryer hookups',
  },
  {
    id: 'lst_6',
    title: 'Artist Loft - Former Warehouse - SO MUCH NATURAL LIGHT',
    address: '88 Industrial Way, Unit 3',
    neighborhood: 'Arts District',
    price: 1950,
    priceType: 'rent',
    beds: 1,
    baths: 1,
    sqft: 1200,
    type: 'apartment',
    images: ['🏭', '🎨', '☀️', '🖼️'],
    description: `Calling all artists, creators, and people who appreciate REALLY TALL CEILINGS!

This converted warehouse loft features 16-foot ceilings, exposed brick, and floor-to-ceiling windows on two sides. The natural light situation is truly incredible - perfect for artists, photographers, or anyone who's tired of living in a cave.

Open floor plan lets you configure the space however you want. Previous tenant (a sculptor) built a sleeping loft - it's still there if you want it, but you're welcome to remove it.

The neighborhood has really changed in the last few years - now there's a great coffee shop downstairs (they do quantum brewing!), several galleries, and The Underground venue is just a 10-minute walk.

Fair warning: The building was a factory in the 1940s. The freight elevator works... most of the time. And the heating is "character-building" in winter.`,
    amenities: ['Exposed Brick', '16\' Ceilings', 'Freight Elevator', 'Artist Community'],
    highlights: ['Incredible light', 'Huge space', 'Live/work potential', 'Arts District location'],
    redFlags: [
      'Freight elevator reliability',
      'Heating is "character-building"',
      'Check noise levels',
    ],
    available: 'January 1st',
    posted: '4 days ago',
    agent: {
      name: 'Alex Rivera',
      avatar: '🧑‍🎨',
      phone: '(555) 321-0987',
      responseTime: 'Usually responds within 4 hours (artist schedule)',
    },
    petPolicy: 'Cats OK, small dogs OK',
    parking: 'Loading zone available',
    laundry: 'Shared in basement',
  },
  {
    id: 'lst_7',
    title: 'ROOM FOR RENT - MUST LOVE MUSIC (and noise)',
    address: '123 Band House Lane',
    neighborhood: 'Near University',
    price: 650,
    priceType: 'rent',
    beds: 1,
    baths: 1,
    sqft: 150,
    type: 'room',
    images: ['🎸', '🥁', '🎤', '😅'],
    description: `Okay, I'm just gonna be honest with you.

We're a 4-piece band (Neon Requiem - you might have heard of us, we play The Underground sometimes) and we need a 5th roommate to help with rent. The room is small but the vibes are immaculate.

What you should know:
- We practice 3-4 nights a week (usually 7-10 PM)
- Our drummer lives here. Yes, you'll hear drums.
- We're all late-night people. If you need quiet by 9 PM, this isn't for you.
- The house is... well, it's got "character"

What we offer:
- Free tickets to all our shows
- A ready-made friend group
- Stories to tell at parties
- Access to our recording equipment (if you're into that)

We're not looking for another band member (unless you play keys?) but someone who can vibe with the chaos. Previous roommate (our old bassist) left on good terms - he just got a day job and needed sleep. Weak.

Rent is cheap because no one else will live with us lol`,
    amenities: ['Free Concert Tickets', 'Recording Equipment', 'Built-in Social Life', 'Cheap Rent'],
    highlights: ['Super cheap', 'Fun roommates', 'Live music (free)', 'Near university'],
    redFlags: [
      'Band practice 3-4 nights/week',
      'Late night lifestyle',
      'House needs work',
      'Not for light sleepers',
    ],
    available: 'Immediate',
    posted: '2 days ago',
    petPolicy: 'Cats only (the drummer is allergic to dogs)',
    parking: 'Street parking',
    laundry: 'Broken (use laundromat)',
  },
  {
    id: 'lst_8',
    title: 'Modern 2BR Condo - Just Renovated!',
    address: '500 Central Park West, Unit 8A',
    neighborhood: 'Westside',
    price: 2800,
    priceType: 'rent',
    beds: 2,
    baths: 2,
    sqft: 1100,
    type: 'condo',
    images: ['🏢', '🛋️', '🍳', '🛁'],
    description: `Just completed a full renovation on this beautiful 2-bedroom, 2-bathroom condo! Everything is brand new and move-in ready.

Features include:
- Open concept living/dining area
- Custom kitchen with waterfall island
- Primary suite with en-suite bath
- Second bedroom perfect for office/guest room
- In-unit laundry

Building amenities include gym, bike storage, and package lockers. Great location - walk to shops, restaurants, and the park.

No expense was spared on this renovation. We're looking for tenants who will appreciate and maintain the quality finishes. Please note this is a SHOES-OFF apartment.`,
    amenities: ['In-unit Laundry', 'Gym', 'Bike Storage', 'Package Lockers', 'Central A/C', 'Balcony'],
    highlights: ['Brand new everything', 'Two full baths', 'Great location', 'Building amenities'],
    available: 'December 15th',
    posted: '1 day ago',
    agent: {
      name: 'David Park',
      avatar: '👨‍💼',
      phone: '(555) 567-8901',
      responseTime: 'Usually responds within 1 hour',
    },
    petPolicy: 'No pets',
    parking: 'Garage parking available ($200/mo)',
    laundry: 'In-unit',
  },
]

const NEIGHBORHOODS = [
  'All Neighborhoods',
  'Downtown',
  'Eastside',
  'Financial District',
  'Midtown',
  'Riverside',
  'Arts District',
  'Near University',
  'Westside',
]

// ============================================================================
// Components
// ============================================================================

export function NestFinderSite({ siteId, onNavigate }: SiteProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [filters, setFilters] = useState({
    neighborhood: 'All Neighborhoods',
    minPrice: 0,
    maxPrice: 10000,
    beds: 0,
    type: 'all',
    listingType: 'rent' as 'rent' | 'sale' | 'all',
  })
  const [savedListings, setSavedListings] = useState<string[]>([])

  const filteredListings = SAMPLE_LISTINGS.filter((listing) => {
    if (filters.neighborhood !== 'All Neighborhoods' && listing.neighborhood !== filters.neighborhood) {
      return false
    }
    if (filters.beds > 0 && listing.beds < filters.beds) {
      return false
    }
    if (filters.type !== 'all' && listing.type !== filters.type) {
      return false
    }
    if (filters.listingType !== 'all' && listing.priceType !== filters.listingType) {
      return false
    }
    return true
  })

  const toggleSaved = (id: string) => {
    setSavedListings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-3"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setSelectedListing(null)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <span
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button className="text-sm hover:underline" style={{ color: site.theme.text }}>
              Buy
            </button>
            <button className="text-sm hover:underline" style={{ color: site.theme.text }}>
              Rent
            </button>
            <button className="text-sm hover:underline" style={{ color: site.theme.text }}>
              Sell
            </button>
            <button
              className="flex items-center gap-1 text-sm"
              style={{ color: site.theme.text }}
            >
              ❤️ Saved ({savedListings.length})
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: site.theme.primary, color: 'white' }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {selectedListing ? (
        <ListingDetail
          listing={selectedListing}
          onBack={() => setSelectedListing(null)}
          isSaved={savedListings.includes(selectedListing.id)}
          onToggleSave={() => toggleSaved(selectedListing.id)}
        />
      ) : (
        <>
          {/* Search Bar */}
          <section
            className="py-8 px-6"
            style={{ background: site.theme.primary }}
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">
                Find Your Perfect Place
              </h1>
              <div
                className="p-4 rounded-xl"
                style={{ background: site.theme.surface }}
              >
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="Enter location or address..."
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-lg text-sm"
                    style={{
                      background: site.theme.background,
                      border: `1px solid ${site.theme.border}`,
                      color: site.theme.text,
                    }}
                  />
                  <select
                    value={filters.neighborhood}
                    onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{
                      background: site.theme.background,
                      border: `1px solid ${site.theme.border}`,
                      color: site.theme.text,
                    }}
                  >
                    {NEIGHBORHOODS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <select
                    value={filters.listingType}
                    onChange={(e) => setFilters({ ...filters, listingType: e.target.value as 'rent' | 'sale' | 'all' })}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{
                      background: site.theme.background,
                      border: `1px solid ${site.theme.border}`,
                      color: site.theme.text,
                    }}
                  >
                    <option value="all">Buy & Rent</option>
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                  </select>
                  <select
                    value={filters.beds}
                    onChange={(e) => setFilters({ ...filters, beds: parseInt(e.target.value) })}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{
                      background: site.theme.background,
                      border: `1px solid ${site.theme.border}`,
                      color: site.theme.text,
                    }}
                  >
                    <option value={0}>Any Beds</option>
                    <option value={1}>1+ Bed</option>
                    <option value={2}>2+ Beds</option>
                    <option value={3}>3+ Beds</option>
                  </select>
                  <button
                    className="px-6 py-2 rounded-lg text-sm font-medium"
                    style={{ background: site.theme.primary, color: 'white' }}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Results */}
          <section className="py-8 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <p style={{ color: site.theme.text }}>
                  <span className="font-bold">{filteredListings.length}</span> listings found
                </p>
                <select
                  className="px-3 py-1 rounded text-sm"
                  style={{
                    background: site.theme.surface,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                >
                  <option>Sort by: Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Square Feet</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => setSelectedListing(listing)}
                    isSaved={savedListings.includes(listing.id)}
                    onToggleSave={() => toggleSaved(listing.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{
          background: site.theme.surface,
          borderTop: `1px solid ${site.theme.border}`,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-8 mb-4 text-sm" style={{ color: site.theme.textMuted }}>
            <button className="hover:underline">About</button>
            <button className="hover:underline">Contact</button>
            <button className="hover:underline">Advertise</button>
            <button className="hover:underline">Terms</button>
            <button className="hover:underline">Privacy</button>
          </div>
          <p className="text-xs" style={{ color: site.theme.textMuted }}>
            © 2024 NestFinder. All listings are fictional. Any resemblance to actual properties is coincidental.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Listing Card Component
// ============================================================================

interface ListingCardProps {
  listing: Listing
  onClick: () => void
  isSaved: boolean
  onToggleSave: () => void
}

function ListingCard({ listing, onClick, isSaved, onToggleSave }: ListingCardProps) {
  const formatPrice = (price: number, type: 'rent' | 'sale') => {
    if (type === 'sale') {
      return `$${price.toLocaleString()}`
    }
    return `$${price.toLocaleString()}/mo`
  }

  return (
    <div
      className="rounded-xl overflow-hidden transition-all hover:shadow-lg"
      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
    >
      {/* Image */}
      <button
        onClick={onClick}
        className="relative w-full aspect-[4/3] flex items-center justify-center text-5xl"
        style={{ background: site.theme.background }}
      >
        {listing.images[0]}
        <span
          className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium"
          style={{
            background: listing.priceType === 'sale' ? site.theme.secondary : site.theme.primary,
            color: 'white',
          }}
        >
          For {listing.priceType === 'sale' ? 'Sale' : 'Rent'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleSave()
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'white' }}
        >
          {isSaved ? '❤️' : '🤍'}
        </button>
        {listing.redFlags && (
          <span
            className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs"
            style={{ background: '#FEF3C7', color: '#92400E' }}
          >
            ⚠️ See details
          </span>
        )}
      </button>

      {/* Info */}
      <button
        onClick={onClick}
        className="p-4 text-left w-full"
      >
        <p
          className="text-xl font-bold mb-1"
          style={{ color: site.theme.primary }}
        >
          {formatPrice(listing.price, listing.priceType)}
        </p>
        <div className="flex items-center gap-3 text-sm mb-2" style={{ color: site.theme.text }}>
          <span>{listing.beds === 0 ? 'Studio' : `${listing.beds} bd`}</span>
          <span>•</span>
          <span>{listing.baths} ba</span>
          <span>•</span>
          <span>{listing.sqft.toLocaleString()} sqft</span>
        </div>
        <p
          className="text-sm font-medium line-clamp-1 mb-1"
          style={{ color: site.theme.text }}
        >
          {listing.title}
        </p>
        <p
          className="text-sm"
          style={{ color: site.theme.textMuted }}
        >
          {listing.address}
        </p>
        <p
          className="text-xs mt-2"
          style={{ color: site.theme.textMuted }}
        >
          {listing.neighborhood} • Posted {listing.posted}
        </p>
      </button>
    </div>
  )
}

// ============================================================================
// Listing Detail Component
// ============================================================================

interface ListingDetailProps {
  listing: Listing
  onBack: () => void
  isSaved: boolean
  onToggleSave: () => void
}

function ListingDetail({ listing, onBack, isSaved, onToggleSave }: ListingDetailProps) {
  const [showContactForm, setShowContactForm] = useState(false)

  const formatPrice = (price: number, type: 'rent' | 'sale') => {
    if (type === 'sale') {
      return `$${price.toLocaleString()}`
    }
    return `$${price.toLocaleString()}/mo`
  }

  return (
    <div className="pb-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <button
          onClick={onBack}
          className="text-sm hover:underline"
          style={{ color: site.theme.primary }}
        >
          ← Back to listings
        </button>
      </div>

      {/* Images */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
          <div
            className="col-span-2 row-span-2 aspect-square flex items-center justify-center text-8xl"
            style={{ background: site.theme.background }}
          >
            {listing.images[0]}
          </div>
          {listing.images.slice(1).map((img, i) => (
            <div
              key={i}
              className="aspect-square flex items-center justify-center text-4xl"
              style={{ background: site.theme.background }}
            >
              {img}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p
                  className="text-3xl font-bold mb-2"
                  style={{ color: site.theme.primary }}
                >
                  {formatPrice(listing.price, listing.priceType)}
                </p>
                <div className="flex items-center gap-3 text-lg mb-2" style={{ color: site.theme.text }}>
                  <span>{listing.beds === 0 ? 'Studio' : `${listing.beds} beds`}</span>
                  <span>•</span>
                  <span>{listing.baths} baths</span>
                  <span>•</span>
                  <span>{listing.sqft.toLocaleString()} sqft</span>
                </div>
                <p className="font-medium" style={{ color: site.theme.text }}>
                  {listing.address}
                </p>
                <p style={{ color: site.theme.textMuted }}>
                  {listing.neighborhood}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onToggleSave}
                  className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{
                    background: isSaved ? site.theme.primary : site.theme.surface,
                    color: isSaved ? 'white' : site.theme.text,
                    border: `1px solid ${site.theme.border}`,
                  }}
                >
                  {isSaved ? '❤️ Saved' : '🤍 Save'}
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    background: site.theme.surface,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                >
                  Share
                </button>
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: site.theme.text }}>
                Highlights
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: `${site.theme.primary}15`,
                      color: site.theme.primary,
                    }}
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            {listing.redFlags && (
              <div
                className="mb-8 p-4 rounded-xl"
                style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}
              >
                <h2 className="text-lg font-bold mb-3" style={{ color: '#92400E' }}>
                  ⚠️ Things to Consider
                </h2>
                <ul className="space-y-1">
                  {listing.redFlags.map((flag, i) => (
                    <li key={i} className="text-sm" style={{ color: '#92400E' }}>
                      • {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: site.theme.text }}>
                About This Place
              </h2>
              <p
                className="whitespace-pre-wrap"
                style={{ color: site.theme.text }}
              >
                {listing.description}
              </p>
            </div>

            {/* Details */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: site.theme.text }}>
                Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                >
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Pet Policy</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.petPolicy}</p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                >
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Parking</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.parking}</p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                >
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Laundry</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.laundry}</p>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                >
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Available</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.available}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: site.theme.text }}>
                Amenities
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {listing.amenities.map((a, i) => (
                  <p key={i} className="text-sm" style={{ color: site.theme.text }}>
                    ✓ {a}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Contact */}
          <aside className="w-80 shrink-0">
            <div
              className="sticky top-20 p-6 rounded-xl"
              style={{
                background: site.theme.surface,
                border: `1px solid ${site.theme.border}`,
              }}
            >
              {listing.agent ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{listing.agent.avatar}</span>
                    <div>
                      <p className="font-medium" style={{ color: site.theme.text }}>
                        {listing.agent.name}
                      </p>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        {listing.agent.responseTime}
                      </p>
                    </div>
                  </div>

                  {showContactForm ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: site.theme.background,
                          border: `1px solid ${site.theme.border}`,
                          color: site.theme.text,
                        }}
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: site.theme.background,
                          border: `1px solid ${site.theme.border}`,
                          color: site.theme.text,
                        }}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: site.theme.background,
                          border: `1px solid ${site.theme.border}`,
                          color: site.theme.text,
                        }}
                      />
                      <textarea
                        placeholder="Message"
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                        style={{
                          background: site.theme.background,
                          border: `1px solid ${site.theme.border}`,
                          color: site.theme.text,
                        }}
                        defaultValue={`Hi, I'm interested in ${listing.address}. Is it still available?`}
                      />
                      <button
                        className="w-full py-2 rounded-lg font-medium"
                        style={{ background: site.theme.primary, color: 'white' }}
                      >
                        Send Message
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowContactForm(true)}
                        className="w-full py-2 rounded-lg font-medium"
                        style={{ background: site.theme.primary, color: 'white' }}
                      >
                        Contact Agent
                      </button>
                      <button
                        className="w-full py-2 rounded-lg font-medium"
                        style={{
                          background: site.theme.surface,
                          border: `1px solid ${site.theme.primary}`,
                          color: site.theme.primary,
                        }}
                      >
                        Schedule Tour
                      </button>
                      <p
                        className="text-center text-sm"
                        style={{ color: site.theme.textMuted }}
                      >
                        {listing.agent.phone}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="font-medium mb-4" style={{ color: site.theme.text }}>
                    Contact Posted By Owner
                  </p>
                  <button
                    className="w-full py-2 rounded-lg font-medium mb-3"
                    style={{ background: site.theme.primary, color: 'white' }}
                  >
                    Send Message
                  </button>
                  <p className="text-xs text-center" style={{ color: site.theme.textMuted }}>
                    Be cautious with listings posted by owners.
                    Always verify the property in person before sending any money.
                  </p>
                </div>
              )}

              {/* Sponsored */}
              <div className="mt-6">
                <SidebarAdWidget
                  siteId="nestfinder"
                  onNavigate={onNavigate}
                  title="Sponsored"
                  count={2}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default NestFinderSite
