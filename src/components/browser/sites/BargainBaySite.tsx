/**
 * BargainBay Site
 *
 * Craigslist/Facebook Marketplace style classified ads for the engAIge browser.
 * Features questionable listings, desperate sellers, and typical marketplace chaos.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, useSiteCategories, type SiteContentItem, type SiteCategory } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.marketplace

// ============================================================================
// URL Helpers
// ============================================================================

/**
 * Creates a URL-safe slug from a listing title.
 * Example: "Quantum Coffee Maker Q-3000 - BARELY USED" -> "quantum-coffee-maker-q-3000-barely-used"
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Creates a URL-safe category slug.
 * Example: "Musical Instruments" -> "musical-instruments"
 */
function createCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

/**
 * Finds a category name from its slug.
 */
function findCategoryFromSlug(slug: string, categories: string[]): string | null {
  return categories.find(cat => createCategorySlug(cat) === slug) || null
}

// ============================================================================
// Types
// ============================================================================

interface Listing {
  id: string
  title: string
  price: number | 'Free' | 'Make Offer' | '$1 (read desc)'
  category: string
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Parts Only' | 'Haunted'
  location: string
  posted: string
  image: string
  description: string
  seller: {
    name: string
    avatar: string
    joined: string
    rating?: number
    responseRate?: string
  }
  tags?: string[]
  suspicious?: boolean
}

// ============================================================================
// Sample Data
// ============================================================================

// Hardcoded CATEGORIES removed -- DB is the sole source of truth

// Hardcoded SAMPLE_LISTINGS removed -- DB is the sole source of truth

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Listing interface */
function dbToListing(item: SiteContentItem): Listing {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    price: m.price ?? 0,
    category: item.category || m.category || 'All Categories',
    condition: m.condition || 'Good',
    location: m.location || '',
    posted: m.posted || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString(),
    image: item.thumbnailEmoji || m.image || '',
    description: item.body || item.summary || '',
    seller: m.seller || { name: 'Anonymous', avatar: '👤', joined: 'Unknown' },
    tags: item.tags.length > 0 ? item.tags : m.tags,
    suspicious: m.suspicious || false,
  }
}

/** Adapt a DB SiteCategory to a category string */
function dbToCategoryName(cat: SiteCategory): string {
  return cat.name
}

// ============================================================================
// Components
// ============================================================================

export function BargainBaySite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('bargainbay')
  const { categories: dbCategories } = useSiteCategories('bargainbay')

  const listings = useMemo(() => dbContent.map(dbToListing), [dbContent])

  const categories = useMemo(() => ['All Categories', ...dbCategories.map(dbToCategoryName)], [dbCategories])

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')

  // Track if we're updating from path (to avoid triggering onPathChange)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      // Home page
      setSelectedListing(null)
      setSelectedCategory('All Categories')
    } else if (path.startsWith('/listing/')) {
      // Listing detail path: /listing/listing-slug
      const slug = path.slice(9) // Remove '/listing/'
      const listing = listings.find(l =>
        l.id === slug || createSlug(l.title) === slug
      )
      if (listing) {
        setSelectedListing(listing)
      }
    } else if (path.startsWith('/category/')) {
      // Category path: /category/category-slug
      const slug = path.slice(10) // Remove '/category/'
      const category = findCategoryFromSlug(slug, categories)
      if (category && category !== 'All Categories') {
        setSelectedListing(null)
        setSelectedCategory(category)
      } else {
        // Invalid category, go to home
        setSelectedListing(null)
        setSelectedCategory('All Categories')
      }
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path])

  // Navigation handlers that update both state and path
  const handleSelectListing = (listing: Listing) => {
    setSelectedListing(listing)
    onPathChange('/listing/' + createSlug(listing.title))
  }

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category)
    setSelectedListing(null)
    if (category === 'All Categories') {
      onPathChange(null)
    } else {
      onPathChange('/category/' + createCategorySlug(category))
    }
  }

  const handleBackToListings = () => {
    setSelectedListing(null)
    // Go back to category if one is selected, otherwise go to home
    if (selectedCategory && selectedCategory !== 'All Categories') {
      onPathChange('/category/' + createCategorySlug(selectedCategory))
    } else {
      onPathChange(null)
    }
  }

  const handleGoHome = () => {
    setSelectedListing(null)
    setSelectedCategory('All Categories')
    onPathChange(null)
  }

  const filteredListings = listings.filter((listing) => {
    if (selectedCategory !== 'All Categories' && listing.category !== selectedCategory) {
      return false
    }
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3"
        style={{ background: site.theme.primary }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            onClick={handleGoHome}
            variant="ghost"
            textColor="white"
            className="flex items-center gap-2"
          >
            <span className="text-2xl">{site.icon}</span>
            <span className="text-xl font-bold">{site.name}</span>
          </Button>

          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search for anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-sm"
              style={{ background: 'white', color: site.theme.text }}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="link" textColor="white" size="sm">
              Sell
            </Button>
            <Button variant="link" textColor="white" size="sm">
              Messages
            </Button>
            <StyledCard
              bgColor="white"
              borderRadius="full"
              padding="4px"
              className="w-8 h-8 flex items-center justify-center text-sm font-medium"
              textColor={site.theme.primary}
            >
              G
            </StyledCard>
          </div>
        </div>
      </header>

      {selectedListing ? (
        <ListingDetail
          listing={selectedListing}
          onBack={handleBackToListings}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="w-48 shrink-0">
              <h3
                className="font-bold text-sm mb-3"
                style={{ color: site.theme.text }}
              >
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    variant={selectedCategory === cat ? 'primary' : 'ghost'}
                    size="sm"
                    backgroundColor={selectedCategory === cat ? site.theme.primary : 'transparent'}
                    textColor={selectedCategory === cat ? 'white' : site.theme.text}
                    width="full"
                    className="justify-start"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Sponsored */}
              <div className="mt-6">
                <SidebarAdWidget
                  siteId="bargainbay"
                  onNavigate={onNavigate}
                  title="Sponsored"
                  count={2}
                />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: site.theme.text }}>
                  {selectedCategory === 'All Categories' ? 'Recent Listings' : selectedCategory}
                </h2>
                <select
                  className="px-3 py-1 rounded text-sm"
                  style={{
                    background: site.theme.surface,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                >
                  <option>Sort: Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Distance: Nearest</option>
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => handleSelectListing(listing)}
                  />
                ))}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">🔍</p>
                  <p style={{ color: site.theme.textMuted }}>
                    No listings found. Try a different search or category.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="py-6 px-4 text-center text-xs mt-8"
        style={{
          background: site.theme.surface,
          borderTop: `1px solid ${site.theme.border}`,
          color: site.theme.textMuted,
        }}
      >
        <p className="mb-2">
          All listings are fictional. BargainBay is not responsible for any items that may or may not be haunted.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="link" textColor={site.theme.textMuted} size="sm">
            About
          </Button>
          <Button variant="link" textColor={site.theme.textMuted} size="sm">
            Safety Tips
          </Button>
          <Button variant="link" textColor={site.theme.textMuted} size="sm">
            Help
          </Button>
          <Button variant="link" textColor={site.theme.textMuted} size="sm">
            Terms
          </Button>
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
}

function ListingCard({ listing, onClick }: ListingCardProps) {
  const formatPrice = (price: number | string) => {
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`
    }
    return price
  }

  return (
    <StyledCard
      onClick={onClick}
      bgColor={site.theme.surface}
      borderColor={site.theme.border}
      borderRadius="lg"
      shadow="md"
      padding={0}
      className="text-left overflow-hidden cursor-pointer"
    >
      {/* Image Container */}
      <div
        className="aspect-square flex items-center justify-center text-5xl relative"
        style={{ background: site.theme.background }}
      >
        {listing.image}
        {listing.suspicious && (
          <span
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: '#FEF3C7', color: '#92400E' }}
          >
            ⚠️
          </span>
        )}
        {listing.price === 'Free' && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: site.theme.secondary, color: 'white' }}
          >
            FREE
          </span>
        )}
      </div>

      {/* Info Container */}
      <div className="p-3">
        <p
          className="font-bold mb-1"
          style={{ color: site.theme.primary }}
        >
          {formatPrice(listing.price)}
        </p>
        <p
          className="text-sm font-medium line-clamp-2 mb-1"
          style={{ color: site.theme.text }}
        >
          {listing.title}
        </p>
        <p
          className="text-xs"
          style={{ color: site.theme.textMuted }}
        >
          {listing.location} • {listing.posted}
        </p>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Listing Detail Component
// ============================================================================

interface ListingDetailProps {
  listing: Listing
  onBack: () => void
}

function ListingDetail({ listing, onBack }: ListingDetailProps) {
  const [showMessage, setShowMessage] = useState(false)

  const formatPrice = (price: number | string) => {
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`
    }
    return price
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button
        onClick={onBack}
        variant="link"
        textColor={site.theme.primary}
        className="mb-6"
      >
        ← Back to listings
      </Button>

      <div className="flex gap-8">
        {/* Image */}
        <div className="w-96 shrink-0">
          <StyledCard
            bgColor={site.theme.background}
            borderRadius="lg"
            padding="lg"
            className="aspect-square flex items-center justify-center text-8xl"
          >
            {listing.image}
          </StyledCard>
        </div>

        {/* Details */}
        <div className="flex-1">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: site.theme.text }}
          >
            {listing.title}
          </h1>

          <p
            className="text-3xl font-bold mb-4"
            style={{ color: site.theme.primary }}
          >
            {formatPrice(listing.price)}
          </p>

          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <StyledCard
              variant="light"
              bgColor={site.theme.background}
              borderColor="transparent"
              textColor={site.theme.text}
              padding="sm"
              borderRadius="sm"
              className="text-xs"
            >
              {listing.category}
            </StyledCard>
            <StyledCard
              bgColor={listing.condition === 'Haunted' ? '#FEE2E2' : site.theme.background}
              borderColor="transparent"
              textColor={listing.condition === 'Haunted' ? '#DC2626' : site.theme.text}
              padding="sm"
              borderRadius="sm"
              className="text-xs"
            >
              {listing.condition}
            </StyledCard>
            <StyledCard
              bgColor={site.theme.background}
              borderColor="transparent"
              textColor={site.theme.text}
              padding="sm"
              borderRadius="sm"
              className="text-xs"
            >
              📍 {listing.location}
            </StyledCard>
          </div>

          <p
            className="text-sm mb-6"
            style={{ color: site.theme.textMuted }}
          >
            Listed {listing.posted}
          </p>

          {/* Suspicious Warning */}
          {listing.suspicious && (
            <StyledCard
              bgColor="#FEF3C7"
              borderColor="#F59E0B"
              textColor="#92400E"
              padding="md"
              borderRadius="md"
              className="mb-6 text-sm"
            >
              ⚠️ <strong>Heads up:</strong> This listing has some... unusual characteristics.
              Use your best judgment and meet in a public place if purchasing.
            </StyledCard>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2
              className="font-bold mb-2"
              style={{ color: site.theme.text }}
            >
              Description
            </h2>
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: site.theme.text }}
            >
              {listing.description}
            </p>
          </div>

          {/* Tags */}
          {listing.tags && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <StyledCard
                    key={tag}
                    bgColor={`${site.theme.primary}15`}
                    borderColor="transparent"
                    textColor={site.theme.primary}
                    padding="sm"
                    borderRadius="full"
                    className="text-xs"
                  >
                    #{tag}
                  </StyledCard>
                ))}
              </div>
            </div>
          )}

          {/* Seller Info */}
          <StyledCard
            bgColor={site.theme.surface}
            borderColor={site.theme.border}
            textColor={site.theme.text}
            padding="md"
            borderRadius="lg"
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{listing.seller.avatar}</span>
              <div>
                <p className="font-medium">{listing.seller.name}</p>
                <MetaRow
                  items={[
                    { value: listing.seller.joined },
                    ...(listing.seller.rating ? [{ value: `⭐ ${listing.seller.rating}` }] : []),
                  ]}
                  textSize="xs"
                  textColor={site.theme.textMuted}
                  mutedColor={site.theme.textMuted}
                  separator="•"
                />
              </div>
            </div>
            {listing.seller.responseRate && (
              <p className="text-xs" style={{ color: site.theme.textMuted }}>
                {listing.seller.responseRate}
              </p>
            )}
          </StyledCard>

          {/* Actions */}
          {showMessage ? (
            <div className="space-y-3">
              <textarea
                placeholder="Write your message..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg text-sm resize-none"
                style={{
                  background: site.theme.background,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
                defaultValue={`Hi! Is this still available?`}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  backgroundColor={site.theme.primary}
                  textColor="white"
                  width="full"
                >
                  Send Message
                </Button>
                <Button
                  onClick={() => setShowMessage(false)}
                  variant="outline"
                  borderColor={site.theme.border}
                  textColor={site.theme.text}
                  backgroundColor={site.theme.surface}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => setShowMessage(true)}
                variant="primary"
                backgroundColor={site.theme.primary}
                textColor="white"
                width="full"
              >
                Message Seller
              </Button>
              <Button
                variant="outline"
                borderColor={site.theme.border}
                backgroundColor={site.theme.surface}
                textColor={site.theme.text}
                icon="❤️"
                iconPosition="only"
              />
              <Button
                variant="outline"
                borderColor={site.theme.border}
                backgroundColor={site.theme.surface}
                textColor={site.theme.text}
                icon="📤"
                iconPosition="only"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BargainBaySite
