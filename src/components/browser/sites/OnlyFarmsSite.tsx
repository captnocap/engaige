/**
 * OnlyFarms Site
 *
 * A perfectly legitimate agricultural equipment marketplace with an
 * unfortunately suggestive name. Features tractors, combines, irrigation
 * equipment, and "exclusive content" (premium farm machinery).
 *
 * The joke: sounds like something else, but it is 100% wholesome farming.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Site Theme Configuration
// ============================================================================

const SITE_CONFIG = {
  id: 'onlyfarms',
  name: 'OnlyFarms',
  tagline: 'Where Equipment Gets Exposed',
  url: 'www.onlyfarms.corn',
  icon: '🚜',
  theme: {
    primary: '#2D5A27',        // Deep forest green
    secondary: '#8B4513',      // Saddle brown
    accent: '#F4A460',         // Sandy brown
    background: '#F5F0E6',     // Warm cream
    surface: '#FFFFFF',
    text: '#1A1A1A',
    textMuted: '#6B6B6B',
    border: '#D4C4A8',
    highlight: '#FFD700',      // Gold for premium
  },
}

// ============================================================================
// Types
// ============================================================================

interface Seller {
  id: string
  username: string
  displayName: string
  avatar: string
  subscriberCount: number
  verified: boolean
  bio: string
  joinedDate: string
  totalListings: number
  rating: number
  specialties: string[]
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  image: string
  seller: Seller
  views: number
  likes: number
  posted: string
  exclusive?: boolean
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  avatar: string
  text: string
  timestamp: string
  likes: number
}

interface FarmingTip {
  id: string
  title: string
  content: string
  author: string
  likes: number
}

// (Hardcoded sellers, listings, and farming tips removed -- database is the sole source of truth)

// ============================================================================
// Subscription Tiers
// ============================================================================

const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free Farmer',
    price: 0,
    features: [
      'Browse public listings',
      'View seller profiles',
      'Read farming tips',
      'Limited comments',
    ],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium Harvest',
    price: 8.47,
    features: [
      'All Free Farmer features',
      'Access exclusive listings',
      'Priority messaging',
      'Early access to new equipment',
      'Monthly tips newsletter',
    ],
    cta: 'Upgrade Now',
    highlight: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Yield',
    price: 84.70,
    features: [
      'All Premium Harvest features',
      'Direct seller hotline',
      'Equipment inspection reports',
      'Price negotiation assistance',
      'VIP at farm shows',
      'Quarterly equipment catalog',
    ],
    cta: 'Go Ultimate',
    highlight: false,
  },
]

const CATEGORIES = ['All', 'Tractors', 'Combines', 'Irrigation', 'Livestock Equipment', 'Exclusive Content']

// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Listing interface */
function dbToListing(item: SiteContentItem): Listing {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    description: item.body ?? item.summary ?? '',
    price: m.price ?? 0,
    category: item.category ?? m.category ?? 'All',
    condition: m.condition ?? 'Good',
    image: item.thumbnailEmoji ?? m.image ?? '',
    seller: m.seller ?? { id: 'unknown', username: 'Anonymous', displayName: 'Unknown', avatar: '🧑‍🌾', subscriberCount: 0, verified: false, bio: '', joinedDate: 'Unknown', totalListings: 0, rating: 0, specialties: [] },
    views: item.viewCount ?? m.views ?? 0,
    likes: item.likeCount ?? m.likes ?? 0,
    posted: m.posted ?? new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString(),
    exclusive: m.exclusive ?? item.isFeatured ?? false,
    comments: (m.comments ?? []).map((c: any, i: number) => ({
      id: c.id ?? `c_${i}`,
      author: c.author ?? 'Anonymous',
      avatar: c.avatar ?? '🧑‍🌾',
      text: c.text ?? c.content ?? '',
      timestamp: c.timestamp ?? '',
      likes: c.likes ?? 0,
    })),
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function OnlyFarmsSite({ onNavigate }: SiteProps) {
  const { content: dbContent } = useSiteContent('onlyfarms')

  const listings = useMemo(() => dbContent.map(dbToListing), [dbContent])

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'hot' | 'sellers' | 'tips'>('hot')

  const filteredListings = selectedCategory === 'All'
    ? listings
    : listings.filter(l => l.category === selectedCategory)

  const handleListingClick = (listing: Listing) => {
    if (listing.exclusive) {
      setShowSubscriptionModal(true)
    } else {
      setSelectedListing(listing)
    }
  }

  return (
    <div className="min-h-full" style={{ background: SITE_CONFIG.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: SITE_CONFIG.theme.primary }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setSelectedListing(null); setSelectedSeller(null) }}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <span className="text-3xl">{SITE_CONFIG.icon}</span>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white">{SITE_CONFIG.name}</h1>
                <p className="text-xs text-white/80">{SITE_CONFIG.tagline}</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowSubscriptionModal(true)}
                variant="primary"
                backgroundColor={SITE_CONFIG.theme.highlight}
                textColor={SITE_CONFIG.theme.text}
                size="sm"
              >
                Go Premium
              </Button>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: SITE_CONFIG.theme.secondary }}
              >
                🧑‍🌾
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'hot' as const, label: 'Hot New Listings', icon: '🔥' },
              { id: 'sellers' as const, label: 'Top Sellers', icon: '⭐' },
              { id: 'tips' as const, label: 'Tips', icon: '💡' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedListing(null); setSelectedSeller(null) }}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                  activeTab === tab.id
                    ? 'bg-[#F5F0E6] text-[#2D5A27]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedListing ? (
          <ListingDetail
            listing={selectedListing}
            onBack={() => setSelectedListing(null)}
            onSellerClick={() => { setSelectedSeller(selectedListing.seller); setSelectedListing(null) }}
          />
        ) : selectedSeller ? (
          <SellerProfile
            seller={selectedSeller}
            listings={listings.filter(l => l.seller.id === selectedSeller.id)}
            onBack={() => setSelectedSeller(null)}
            onListingClick={handleListingClick}
          />
        ) : activeTab === 'hot' ? (
          <HotListings
            listings={filteredListings}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onListingClick={handleListingClick}
            onSellerClick={setSelectedSeller}
          />
        ) : activeTab === 'sellers' ? (
          <TopSellers
            sellers={SELLERS}
            onSellerClick={setSelectedSeller}
          />
        ) : (
          <FarmingTipsSection tips={FARMING_TIPS} />
        )}
      </main>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}

      {/* Footer */}
      <footer
        className="py-6 px-4 text-center text-xs mt-8"
        style={{
          background: SITE_CONFIG.theme.secondary,
          color: 'white',
        }}
      >
        <p className="mb-2">
          OnlyFarms - The premier destination for agricultural equipment enthusiasts since 2021
        </p>
        <p className="mb-4 opacity-80">
          All listings are 100% legitimate farming equipment. We do not know what you were expecting.
        </p>
        <div className="flex justify-center gap-4 opacity-80">
          <button className="hover:underline">About</button>
          <button className="hover:underline">Terms</button>
          <button className="hover:underline">Privacy</button>
          <button className="hover:underline">Contact</button>
          <button className="hover:underline">Careers</button>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Hot Listings Section
// ============================================================================

interface HotListingsProps {
  listings: Listing[]
  categories: string[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  onListingClick: (listing: Listing) => void
  onSellerClick: (seller: Seller) => void
}

function HotListings({ listings, categories, selectedCategory, onCategoryChange, onListingClick, onSellerClick }: HotListingsProps) {
  return (
    <div className="flex gap-6">
      {/* Sidebar - Categories */}
      <aside className="w-48 shrink-0">
        <h3
          className="font-bold text-sm mb-3"
          style={{ color: SITE_CONFIG.theme.text }}
        >
          Categories
        </h3>
        <div className="space-y-1">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              variant={selectedCategory === cat ? 'primary' : 'ghost'}
              size="sm"
              backgroundColor={selectedCategory === cat ? SITE_CONFIG.theme.primary : 'transparent'}
              textColor={selectedCategory === cat ? 'white' : SITE_CONFIG.theme.text}
              width="full"
              className="justify-start text-left"
            >
              {cat === 'Exclusive Content' && '🔒 '}{cat}
            </Button>
          ))}
        </div>

        {/* Featured Seller Card */}
        <div className="mt-6">
          <h3
            className="font-bold text-sm mb-3"
            style={{ color: SITE_CONFIG.theme.text }}
          >
            Featured Creator
          </h3>
          <StyledCard
            bgColor={SITE_CONFIG.theme.surface}
            borderColor={SITE_CONFIG.theme.border}
            padding="md"
            borderRadius="lg"
            onClick={() => onSellerClick(SELLERS[1])}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <span className="text-4xl">{SELLERS[1].avatar}</span>
              <p className="font-medium mt-2" style={{ color: SITE_CONFIG.theme.text }}>
                {SELLERS[1].username}
              </p>
              <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                {SELLERS[1].subscriberCount.toLocaleString()} subscribers
              </p>
            </div>
          </StyledCard>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: SITE_CONFIG.theme.text }}>
            🔥 Hot New Listings
          </h2>
          <span className="text-sm" style={{ color: SITE_CONFIG.theme.textMuted }}>
            {listings.length} listings
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => onListingClick(listing)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Listing Card
// ============================================================================

interface ListingCardProps {
  listing: Listing
  onClick: () => void
}

function ListingCard({ listing, onClick }: ListingCardProps) {
  return (
    <StyledCard
      onClick={onClick}
      bgColor={SITE_CONFIG.theme.surface}
      borderColor={SITE_CONFIG.theme.border}
      borderRadius="lg"
      shadow="md"
      padding={0}
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div
        className="aspect-video flex items-center justify-center text-5xl relative"
        style={{ background: listing.exclusive ? `linear-gradient(135deg, ${SITE_CONFIG.theme.highlight}33, ${SITE_CONFIG.theme.primary}33)` : SITE_CONFIG.theme.background }}
      >
        {listing.image}
        {listing.exclusive && (
          <span
            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold"
            style={{ background: SITE_CONFIG.theme.highlight, color: SITE_CONFIG.theme.text }}
          >
            EXCLUSIVE
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{listing.seller.avatar}</span>
          <span className="text-xs font-medium" style={{ color: SITE_CONFIG.theme.primary }}>
            {listing.seller.username}
            {listing.seller.verified && ' ✓'}
          </span>
        </div>
        <p
          className="text-sm font-medium line-clamp-2 mb-2"
          style={{ color: SITE_CONFIG.theme.text }}
        >
          {listing.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
            {listing.price === 0 ? 'SEEKING' : `$${listing.price.toLocaleString()}`}
          </span>
          <MetaRow
            items={[
              { value: `${listing.likes} likes` },
            ]}
            textSize="xs"
            textColor={SITE_CONFIG.theme.textMuted}
            mutedColor={SITE_CONFIG.theme.textMuted}
          />
        </div>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Listing Detail
// ============================================================================

interface ListingDetailProps {
  listing: Listing
  onBack: () => void
  onSellerClick: () => void
}

function ListingDetail({ listing, onBack, onSellerClick }: ListingDetailProps) {
  const [newComment, setNewComment] = useState('')

  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        textColor={SITE_CONFIG.theme.primary}
        className="mb-4"
      >
        Back to listings
      </Button>

      <div className="flex gap-8">
        {/* Left Column - Image and Seller */}
        <div className="w-96 shrink-0">
          <StyledCard
            bgColor={SITE_CONFIG.theme.background}
            borderRadius="lg"
            padding="lg"
            className="aspect-square flex items-center justify-center text-8xl mb-4"
          >
            {listing.image}
          </StyledCard>

          {/* Seller Card */}
          <StyledCard
            onClick={onSellerClick}
            bgColor={SITE_CONFIG.theme.surface}
            borderColor={SITE_CONFIG.theme.border}
            borderRadius="lg"
            padding="md"
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{listing.seller.avatar}</span>
              <div className="flex-1">
                <p className="font-medium" style={{ color: SITE_CONFIG.theme.text }}>
                  {listing.seller.username} {listing.seller.verified && '✓'}
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                  {listing.seller.subscriberCount.toLocaleString()} subscribers
                </p>
              </div>
              <Button
                variant="primary"
                backgroundColor={SITE_CONFIG.theme.primary}
                textColor="white"
                size="sm"
              >
                Subscribe
              </Button>
            </div>
          </StyledCard>
        </div>

        {/* Right Column - Details */}
        <div className="flex-1">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: SITE_CONFIG.theme.text }}
          >
            {listing.title}
          </h1>

          <p
            className="text-3xl font-bold mb-4"
            style={{ color: SITE_CONFIG.theme.primary }}
          >
            {listing.price === 0 ? 'SEEKING TRADES' : `$${listing.price.toLocaleString()}`}
          </p>

          <MetaRow
            items={[
              { value: listing.condition },
              { value: `${listing.views.toLocaleString()} views` },
              { value: `${listing.likes} likes` },
              { value: listing.posted },
            ]}
            textSize="sm"
            textColor={SITE_CONFIG.theme.textMuted}
            mutedColor={SITE_CONFIG.theme.textMuted}
            separator=" | "
            className="mb-6"
          />

          <div className="mb-6">
            <h2 className="font-bold mb-2" style={{ color: SITE_CONFIG.theme.text }}>
              Description
            </h2>
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: SITE_CONFIG.theme.text }}
            >
              {listing.description}
            </p>
          </div>

          <div className="flex gap-3 mb-8">
            <Button
              variant="primary"
              backgroundColor={SITE_CONFIG.theme.primary}
              textColor="white"
              width="full"
            >
              Message Seller
            </Button>
            <Button
              variant="outline"
              borderColor={SITE_CONFIG.theme.border}
              textColor={SITE_CONFIG.theme.text}
            >
              ❤️ {listing.likes}
            </Button>
            <Button
              variant="outline"
              borderColor={SITE_CONFIG.theme.border}
              textColor={SITE_CONFIG.theme.text}
            >
              📤 Share
            </Button>
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="font-bold mb-4" style={{ color: SITE_CONFIG.theme.text }}>
              Comments ({listing.comments.length})
            </h2>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: SITE_CONFIG.theme.background,
                    border: `1px solid ${SITE_CONFIG.theme.border}`,
                    color: SITE_CONFIG.theme.text,
                  }}
                />
                <Button
                  variant="primary"
                  backgroundColor={SITE_CONFIG.theme.primary}
                  textColor="white"
                  size="sm"
                >
                  Post
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {listing.comments.map(comment => (
                <StyledCard
                  key={comment.id}
                  bgColor={SITE_CONFIG.theme.background}
                  borderRadius="lg"
                  padding="sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{comment.avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                          {comment.author}
                        </span>
                        <span className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: SITE_CONFIG.theme.text }}>
                        {comment.text}
                      </p>
                      <button
                        className="text-xs mt-1 flex items-center gap-1"
                        style={{ color: SITE_CONFIG.theme.textMuted }}
                      >
                        ❤️ {comment.likes}
                      </button>
                    </div>
                  </div>
                </StyledCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Seller Profile
// ============================================================================

interface SellerProfileProps {
  seller: Seller
  listings: Listing[]
  onBack: () => void
  onListingClick: (listing: Listing) => void
}

function SellerProfile({ seller, listings, onBack, onListingClick }: SellerProfileProps) {
  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        textColor={SITE_CONFIG.theme.primary}
        className="mb-4"
      >
        Back
      </Button>

      {/* Profile Header */}
      <StyledCard
        bgColor={SITE_CONFIG.theme.surface}
        borderColor={SITE_CONFIG.theme.border}
        borderRadius="lg"
        padding="lg"
        className="mb-6"
      >
        <div className="flex items-start gap-6">
          <span className="text-7xl">{seller.avatar}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold" style={{ color: SITE_CONFIG.theme.text }}>
                {seller.username}
              </h1>
              {seller.verified && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: SITE_CONFIG.theme.primary, color: 'white' }}
                >
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-sm mb-3" style={{ color: SITE_CONFIG.theme.textMuted }}>
              {seller.displayName} | Joined {seller.joinedDate}
            </p>
            <p className="mb-4" style={{ color: SITE_CONFIG.theme.text }}>
              {seller.bio}
            </p>
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  {seller.subscriberCount.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Subscribers</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  {seller.totalListings}
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Listings</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  {seller.rating}
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {seller.specialties.map(spec => (
                <span
                  key={spec}
                  className="px-2 py-1 rounded text-xs"
                  style={{ background: SITE_CONFIG.theme.background, color: SITE_CONFIG.theme.text }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="primary"
            backgroundColor={SITE_CONFIG.theme.primary}
            textColor="white"
          >
            Subscribe - $8.47/mo
          </Button>
        </div>
      </StyledCard>

      {/* Seller Listings */}
      <h2 className="text-xl font-bold mb-4" style={{ color: SITE_CONFIG.theme.text }}>
        Listings ({listings.length})
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onClick={() => onListingClick(listing)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Top Sellers Section
// ============================================================================

interface TopSellersProps {
  sellers: Seller[]
  onSellerClick: (seller: Seller) => void
}

function TopSellers({ sellers, onSellerClick }: TopSellersProps) {
  const sortedSellers = [...sellers].sort((a, b) => b.subscriberCount - a.subscriberCount)

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: SITE_CONFIG.theme.text }}>
        Top Creators
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSellers.map((seller, index) => (
          <StyledCard
            key={seller.id}
            onClick={() => onSellerClick(seller)}
            bgColor={SITE_CONFIG.theme.surface}
            borderColor={SITE_CONFIG.theme.border}
            borderRadius="lg"
            padding="md"
            className="cursor-pointer hover:shadow-lg transition-shadow relative"
          >
            {index < 3 && (
              <span
                className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                  color: SITE_CONFIG.theme.text,
                }}
              >
                {index + 1}
              </span>
            )}
            <div className="text-center">
              <span className="text-5xl">{seller.avatar}</span>
              <p className="font-medium mt-2" style={{ color: SITE_CONFIG.theme.text }}>
                {seller.username}
                {seller.verified && ' ✓'}
              </p>
              <p className="text-sm" style={{ color: SITE_CONFIG.theme.textMuted }}>
                {seller.displayName}
              </p>
              <p className="text-lg font-bold mt-2" style={{ color: SITE_CONFIG.theme.primary }}>
                {seller.subscriberCount.toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                subscribers
              </p>
              <div className="mt-3 flex flex-wrap gap-1 justify-center">
                {seller.specialties.slice(0, 2).map(spec => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded text-[10px]"
                    style={{ background: SITE_CONFIG.theme.background, color: SITE_CONFIG.theme.text }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </StyledCard>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Farming Tips Section
// ============================================================================

interface FarmingTipsSectionProps {
  tips: FarmingTip[]
}

function FarmingTipsSection({ tips }: FarmingTipsSectionProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2" style={{ color: SITE_CONFIG.theme.text }}>
        Farming Tips from the Community
      </h2>
      <p className="text-sm mb-6" style={{ color: SITE_CONFIG.theme.textMuted }}>
        Real advice from real farmers. No subscription required.
      </p>

      <div className="space-y-4">
        {tips.map(tip => (
          <StyledCard
            key={tip.id}
            bgColor={SITE_CONFIG.theme.surface}
            borderColor={SITE_CONFIG.theme.border}
            borderRadius="lg"
            padding="md"
          >
            <h3 className="font-bold mb-2" style={{ color: SITE_CONFIG.theme.text }}>
              {tip.title}
            </h3>
            <p className="text-sm mb-3" style={{ color: SITE_CONFIG.theme.text }}>
              {tip.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: SITE_CONFIG.theme.primary }}>
                @{tip.author}
              </span>
              <button
                className="text-xs flex items-center gap-1"
                style={{ color: SITE_CONFIG.theme.textMuted }}
              >
                ❤️ {tip.likes} helpful
              </button>
            </div>
          </StyledCard>
        ))}
      </div>

      <StyledCard
        bgColor={`${SITE_CONFIG.theme.primary}15`}
        borderColor={SITE_CONFIG.theme.primary}
        borderRadius="lg"
        padding="md"
        className="mt-6 text-center"
      >
        <p className="font-medium mb-2" style={{ color: SITE_CONFIG.theme.text }}>
          Want to share your farming wisdom?
        </p>
        <p className="text-sm mb-4" style={{ color: SITE_CONFIG.theme.textMuted }}>
          Premium Harvest members can submit tips and earn recognition from the community.
        </p>
        <Button
          variant="primary"
          backgroundColor={SITE_CONFIG.theme.primary}
          textColor="white"
        >
          Upgrade to Premium Harvest - $8.47/mo
        </Button>
      </StyledCard>
    </div>
  )
}

// ============================================================================
// Subscription Modal
// ============================================================================

interface SubscriptionModalProps {
  onClose: () => void
}

function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl rounded-2xl p-6"
        style={{ background: SITE_CONFIG.theme.surface }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl"
          style={{ color: SITE_CONFIG.theme.textMuted }}
        >
          x
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: SITE_CONFIG.theme.text }}>
            Unlock Exclusive Equipment
          </h2>
          <p style={{ color: SITE_CONFIG.theme.textMuted }}>
            Choose your subscription tier to see the REALLY good stuff
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {SUBSCRIPTION_TIERS.map(tier => (
            <StyledCard
              key={tier.id}
              bgColor={tier.highlight ? `${SITE_CONFIG.theme.primary}10` : SITE_CONFIG.theme.background}
              borderColor={tier.highlight ? SITE_CONFIG.theme.primary : SITE_CONFIG.theme.border}
              borderRadius="lg"
              padding="md"
              className={`relative ${tier.highlight ? 'ring-2 ring-[#2D5A27]' : ''}`}
            >
              {tier.highlight && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: SITE_CONFIG.theme.primary, color: 'white' }}
                >
                  MOST POPULAR
                </span>
              )}
              <div className="text-center mb-4">
                <h3 className="font-bold" style={{ color: SITE_CONFIG.theme.text }}>
                  {tier.name}
                </h3>
                <p className="text-2xl font-bold mt-2" style={{ color: SITE_CONFIG.theme.primary }}>
                  {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
                </p>
              </div>
              <ul className="space-y-2 mb-4 text-sm">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2" style={{ color: SITE_CONFIG.theme.text }}>
                    <span style={{ color: SITE_CONFIG.theme.primary }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.highlight ? 'primary' : 'outline'}
                backgroundColor={tier.highlight ? SITE_CONFIG.theme.primary : 'transparent'}
                borderColor={SITE_CONFIG.theme.border}
                textColor={tier.highlight ? 'white' : SITE_CONFIG.theme.text}
                width="full"
                disabled={tier.id === 'free'}
              >
                {tier.cta}
              </Button>
            </StyledCard>
          ))}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: SITE_CONFIG.theme.textMuted }}>
          Cancel anytime. All subscriptions include access to our farming community Discord.
        </p>
      </div>
    </div>
  )
}

export default OnlyFarmsSite
