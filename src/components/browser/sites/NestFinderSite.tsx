/**
 * NestFinder Site
 *
 * Apartment/real estate listings site for the engAIge browser.
 * Features realistic listings, suspicious deals, and comedic red flags.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'
import type { MetaRowItem } from '../../ui/shared/layout/MetaRow.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

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

// Hardcoded SAMPLE_LISTINGS removed -- DB is the sole source of truth

// Hardcoded NEIGHBORHOODS removed -- DB is the sole source of truth

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Listing interface */
function dbToListing(item: SiteContentItem): Listing {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    address: m.address || '',
    neighborhood: item.category || m.neighborhood || '',
    price: m.price || 0,
    priceType: m.priceType || 'rent',
    beds: m.beds ?? 0,
    baths: m.baths ?? 1,
    sqft: m.sqft || 0,
    type: m.type || 'apartment',
    images: m.images || (item.thumbnailEmoji ? [item.thumbnailEmoji] : []),
    description: item.body || item.summary || '',
    amenities: m.amenities || [],
    highlights: m.highlights || [],
    redFlags: m.redFlags,
    available: m.available || '',
    posted: m.posted || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString(),
    agent: m.agent,
    petPolicy: m.petPolicy || '',
    parking: m.parking || '',
    laundry: m.laundry || '',
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Helper function to parse the current path and extract listing ID
 * Returns the listing object if viewing a detail page, null for homepage
 */
function getListingFromPath(path: string | null, allListings: Listing[]): Listing | null {
  if (!path || path === '/') {
    return null
  }

  // Match /listing/{id} pattern
  const listingMatch = path.match(/^\/listing\/(.+)$/)
  if (listingMatch) {
    const listingId = listingMatch[1]
    return allListings.find((l) => l.id === listingId) || null
  }

  return null
}

export function NestFinderSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('nestfinder')

  const allListings = useMemo(() => dbContent.map(dbToListing), [dbContent])

  // Derive neighborhoods from listings data (was hardcoded NEIGHBORHOODS array)
  const neighborhoods = useMemo(() => {
    const unique = [...new Set(allListings.map(l => l.neighborhood).filter(Boolean))]
    return ['All Neighborhoods', ...unique.sort()]
  }, [allListings])

  // Derive selected listing from URL path instead of local state
  const selectedListing = getListingFromPath(path, allListings)

  const [filters, setFilters] = useState({
    neighborhood: 'All Neighborhoods',
    minPrice: 0,
    maxPrice: 10000,
    beds: 0,
    type: 'all',
    listingType: 'rent' as 'rent' | 'sale' | 'all',
  })
  const [savedListings, setSavedListings] = useState<string[]>([])

  /**
   * Navigate to a listing detail page via URL
   */
  const navigateToListing = (listing: Listing) => {
    onPathChange(`/listing/${listing.id}`)
  }

  /**
   * Navigate back to homepage
   */
  const navigateToHome = () => {
    onPathChange(null)
  }

  const filteredListings = allListings.filter((listing) => {
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
            onClick={navigateToHome}
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
            <Button
              size="sm"
              backgroundColor={site.theme.primary}
              textColor="white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {selectedListing ? (
        <ListingDetail
          listing={selectedListing}
          onBack={navigateToHome}
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
                    {neighborhoods.map((n) => (
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
                  <Button
                    size="sm"
                    backgroundColor={site.theme.primary}
                    textColor="white"
                  >
                    Search
                  </Button>
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
                    onClick={() => navigateToListing(listing)}
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

  const specItems: MetaRowItem[] = [
    { value: listing.beds === 0 ? 'Studio' : `${listing.beds} bd` },
    { value: `${listing.baths} ba` },
    { value: `${listing.sqft.toLocaleString()} sqft` },
  ]

  return (
    <StyledCard
      bgColor={site.theme.surface}
      borderColor={site.theme.border}
      padding="0"
      shadow="md"
      borderRadius="lg"
      className="overflow-hidden"
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
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
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
        <MetaRow
          items={specItems}
          separator="•"
          textSize="sm"
          textColor={site.theme.text}
          mutedColor={site.theme.text}
          gap="8px"
          className="mb-2"
        />
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
    </StyledCard>
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
                <MetaRow
                  items={[
                    { value: listing.beds === 0 ? 'Studio' : `${listing.beds} beds` },
                    { value: `${listing.baths} baths` },
                    { value: `${listing.sqft.toLocaleString()} sqft` },
                  ]}
                  textSize="md"
                  textColor={site.theme.text}
                  mutedColor={site.theme.text}
                  className="mb-2"
                />
                <p className="font-medium" style={{ color: site.theme.text }}>
                  {listing.address}
                </p>
                <p style={{ color: site.theme.textMuted }}>
                  {listing.neighborhood}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onToggleSave}
                  size="sm"
                  variant={isSaved ? 'primary' : 'outline'}
                  backgroundColor={isSaved ? site.theme.primary : 'transparent'}
                  textColor={isSaved ? 'white' : site.theme.primary}
                  borderColor={isSaved ? 'transparent' : site.theme.primary}
                >
                  {isSaved ? '❤️ Saved' : '🤍 Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  backgroundColor="transparent"
                  textColor={site.theme.text}
                  borderColor={site.theme.border}
                >
                  Share
                </Button>
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
                <StyledCard bgColor={site.theme.surface} borderColor={site.theme.border} padding="md">
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Pet Policy</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.petPolicy}</p>
                </StyledCard>
                <StyledCard bgColor={site.theme.surface} borderColor={site.theme.border} padding="md">
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Parking</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.parking}</p>
                </StyledCard>
                <StyledCard bgColor={site.theme.surface} borderColor={site.theme.border} padding="md">
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Laundry</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.laundry}</p>
                </StyledCard>
                <StyledCard bgColor={site.theme.surface} borderColor={site.theme.border} padding="md">
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>Available</p>
                  <p className="font-medium" style={{ color: site.theme.text }}>{listing.available}</p>
                </StyledCard>
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
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              padding="lg"
              className="sticky top-20"
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
                      <Button
                        width="full"
                        backgroundColor={site.theme.primary}
                        textColor="white"
                      >
                        Send Message
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        width="full"
                        backgroundColor={site.theme.primary}
                        textColor="white"
                        onClick={() => setShowContactForm(true)}
                      >
                        Contact Agent
                      </Button>
                      <Button
                        width="full"
                        variant="outline"
                        backgroundColor="transparent"
                        textColor={site.theme.primary}
                        borderColor={site.theme.primary}
                      >
                        Schedule Tour
                      </Button>
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
                  <Button
                    width="full"
                    backgroundColor={site.theme.primary}
                    textColor="white"
                    className="mb-3"
                  >
                    Send Message
                  </Button>
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
            </StyledCard>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default NestFinderSite
