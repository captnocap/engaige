/**
 * HuskReviews Site
 *
 * A Yelp parody review site (www.huskreviews.corn) where locals leave
 * increasingly unhinged reviews of businesses in the engAIge universe.
 *
 * Features:
 * - Star ratings (1-5 corn cobs)
 * - Business listings with emoji photos
 * - Review filtering (Most Recent, Highest Rated, Most Unhinged)
 * - "Useful", "Funny", "Suspicious" voting
 * - Elite reviewer badges
 * - Business detail pages with full reviews
 * - Reviewer profiles
 *
 * Lore connections:
 * - Quantum Brew Cafe (Derek's obsession, Jennifer's warning)
 * - The Underground (Mars, noise complaints, Neon Requiem)
 * - Hartwell Building (time anomalies, Omnicorp, Floor 13)
 * - Flying J #847 (Mildred's gas station sushi paradise)
 * - Trust Fall Tim's Trust Experiences
 * - Dr. Cornelius's Wellness Clinic (corn deficiency diagnosis)
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.huskreviews

// ============================================================================
// Types
// ============================================================================

interface Reviewer {
  id: string
  name: string
  avatar: string
  reviewCount: number
  photoCount: number
  friendCount: number
  isElite: boolean
  eliteYears?: number[]
  location: string
  tagline?: string
  memberSince: string
}

interface Review {
  id: string
  businessId: string
  reviewer: Reviewer
  rating: number // 1-5 corn cobs
  date: string
  content: string
  photos?: string[]
  useful: number
  funny: number
  suspicious: number
  ownerResponse?: {
    name: string
    date: string
    content: string
  }
}

interface Business {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  priceLevel: string // $ to $$$$
  address: string
  phone: string
  hours: string
  image: string
  description: string
  amenities?: string[]
  reviews: Review[]
}

// (Hardcoded reviewers and businesses removed -- database is the sole source of truth)

// ============================================================================
// Helper Functions
// ============================================================================

const CATEGORIES = ['All Categories', 'Coffee Shops', 'Music Venues', 'Real Estate', 'Gas Stations', 'Entertainment', 'Medical']

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'unhinged', label: 'Most Unhinged' },
]

function CornRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const filled = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - filled - (half ? 1 : 0)
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <span className={`font-mono ${sizeClass}`}>
      {'🌽'.repeat(filled)}
      {half && '🌾'}
      <span className="opacity-30">{'○'.repeat(empty)}</span>
    </span>
  )
}

function EliteBadge({ years }: { years?: number[] }) {
  if (!years || years.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
      Elite '{years[years.length - 1].toString().slice(-2)}
    </span>
  )
}

// ============================================================================
// Components
// ============================================================================

function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onClick}
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#1F2937"
    >
      <div className="flex gap-4">
        <div className="text-5xl w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
          {business.image}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg text-gray-900 hover:text-red-600">
              {business.name}
            </h3>
            <span className="text-xs text-gray-500">{business.priceLevel}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CornRating rating={business.rating} size="sm" />
            <span className="text-sm text-gray-600">
              {business.reviewCount} reviews
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{business.category}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{business.description}</p>
        </div>
      </div>
    </StyledCard>
  )
}

function ReviewCard({ review, showBusiness = false }: { review: Review; showBusiness?: boolean }) {
  const [votes, setVotes] = useState({
    useful: review.useful,
    funny: review.funny,
    suspicious: review.suspicious,
  })

  const handleVote = (type: 'useful' | 'funny' | 'suspicious') => {
    setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="sm"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#1F2937"
    >
      {/* Reviewer Info */}
      <div className="flex gap-3 mb-3">
        <div className="text-3xl">{review.reviewer.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{review.reviewer.name}</span>
            <EliteBadge years={review.reviewer.eliteYears} />
          </div>
          <div className="text-xs text-gray-500">
            {review.reviewer.location} | {review.reviewer.reviewCount} reviews
          </div>
        </div>
      </div>

      {/* Rating and Date */}
      <div className="flex items-center gap-2 mb-3">
        <CornRating rating={review.rating} size="sm" />
        <span className="text-sm text-gray-500">{review.date}</span>
      </div>

      {/* Review Content */}
      <div className="text-sm text-gray-700 whitespace-pre-line mb-3">
        {review.content.length > 500 ? (
          <>
            {review.content.substring(0, 500)}...
            <button className="text-red-600 hover:underline ml-1">Read more</button>
          </>
        ) : (
          review.content
        )}
      </div>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.photos.map((photo, i) => (
            <div key={i} className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
              {photo}
            </div>
          ))}
        </div>
      )}

      {/* Vote Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => handleVote('useful')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>Useful</span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{votes.useful}</span>
        </button>
        <button
          onClick={() => handleVote('funny')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>Funny</span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{votes.funny}</span>
        </button>
        <button
          onClick={() => handleVote('suspicious')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>Suspicious</span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{votes.suspicious}</span>
        </button>
      </div>

      {/* Owner Response */}
      {review.ownerResponse && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-bold text-gray-700 mb-1">
            Response from {review.ownerResponse.name}
          </p>
          <p className="text-xs text-gray-600">{review.ownerResponse.content}</p>
          <p className="text-xs text-gray-400 mt-1">{review.ownerResponse.date}</p>
        </div>
      )}
    </StyledCard>
  )
}

function BusinessDetail({ business, onBack }: { business: Business; onBack: () => void }) {
  const [sortBy, setSortBy] = useState('recent')

  const sortedReviews = [...business.reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'unhinged') return (b.suspicious + b.funny) - (a.suspicious + a.funny)
    return 0 // recent (default order)
  })

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4"
      >
        Back to search results
      </Button>

      {/* Business Header */}
      <div className="flex gap-6 mb-6">
        <div className="text-8xl w-32 h-32 flex items-center justify-center bg-gray-100 rounded-xl">
          {business.image}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h1>
          <div className="flex items-center gap-3 mb-2">
            <CornRating rating={business.rating} size="lg" />
            <span className="text-gray-600">{business.reviewCount} reviews</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{business.category}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{business.priceLevel}</span>
          </div>
          <p className="text-gray-600 mb-4">{business.description}</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>{business.address}</p>
            <p>{business.phone}</p>
            <p>{business.hours}</p>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {business.amenities && business.amenities.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-2">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {business.amenities.map((amenity, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Reviews ({business.reviews.length})</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded text-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {sortedReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}

function ReviewerProfile({ reviewer, onBack }: { reviewer: Reviewer; onBack: () => void }) {
  const reviewerReviews = BUSINESSES.flatMap(b =>
    b.reviews.filter(r => r.reviewer.id === reviewer.id)
  )

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4"
      >
        Back
      </Button>

      <StyledCard
        variant="default"
        padding="lg"
        borderRadius="lg"
        shadow="md"
        className="mb-6"
        bgColor="#ffffff"
        borderColor="#E5E7EB"
        textColor="#1F2937"
      >
        <div className="flex gap-6">
          <div className="text-6xl">{reviewer.avatar}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{reviewer.name}</h1>
              <EliteBadge years={reviewer.eliteYears} />
            </div>
            <p className="text-gray-600 mb-2">{reviewer.location}</p>
            {reviewer.tagline && (
              <p className="text-gray-500 italic mb-4">"{reviewer.tagline}"</p>
            )}
            <div className="flex gap-6 text-sm text-gray-600">
              <span><strong>{reviewer.reviewCount}</strong> reviews</span>
              <span><strong>{reviewer.photoCount}</strong> photos</span>
              <span><strong>{reviewer.friendCount}</strong> friends</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Member since {reviewer.memberSince}</p>
          </div>
        </div>
      </StyledCard>

      <h2 className="font-bold text-gray-900 text-lg mb-4">
        Reviews by {reviewer.name} ({reviewerReviews.length})
      </h2>
      {reviewerReviews.map(review => (
        <ReviewCard key={review.id} review={review} showBusiness />
      ))}
    </div>
  )
}

// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Business interface */
function dbToBusiness(item: SiteContentItem): Business {
  const m = item.metadata || {}
  return {
    id: item.slug,
    name: item.title,
    category: item.category ?? m.category ?? 'Uncategorized',
    rating: m.rating ?? 3.0,
    reviewCount: item.commentCount ?? m.reviewCount ?? m.review_count ?? 0,
    priceLevel: m.priceLevel ?? m.price_level ?? '$$',
    address: m.address ?? '',
    phone: m.phone ?? '',
    hours: m.hours ?? '',
    image: item.thumbnailEmoji ?? m.image ?? '',
    description: item.body ?? item.summary ?? '',
    amenities: m.amenities ?? [],
    reviews: (m.reviews ?? []).map((r: any, i: number) => ({
      id: r.id ?? `r_${i}`,
      businessId: item.slug,
      reviewer: r.reviewer ?? { id: `rv_${i}`, name: 'Anonymous', avatar: '👤', reviewCount: 0, photoCount: 0, friendCount: 0, isElite: false, location: 'Unknown', memberSince: 'Unknown' },
      rating: r.rating ?? 3,
      date: r.date ?? '',
      content: r.content ?? '',
      photos: r.photos ?? [],
      useful: r.useful ?? 0,
      funny: r.funny ?? 0,
      suspicious: r.suspicious ?? 0,
      ownerResponse: r.ownerResponse ?? r.owner_response ?? undefined,
    })),
  }
}

// ============================================================================
// URL Routing Helpers
// ============================================================================

/**
 * Parses the path prop to determine current view state.
 * Routes:
 *   - null, '', '/' -> Homepage (business listing)
 *   - /business/{slug} -> Business detail page
 *   - /reviewer/{id} -> Reviewer profile page
 */
function parseRoute(path: string | null): {
  view: 'home' | 'business' | 'reviewer'
  id: string | null
} {
  if (!path || path === '' || path === '/') {
    return { view: 'home', id: null }
  }

  // Match /business/{slug}
  const businessMatch = path.match(/^\/business\/([^/]+)$/)
  if (businessMatch) {
    return { view: 'business', id: businessMatch[1] }
  }

  // Match /reviewer/{id}
  const reviewerMatch = path.match(/^\/reviewer\/([^/]+)$/)
  if (reviewerMatch) {
    return { view: 'reviewer', id: reviewerMatch[1] }
  }

  // Default to home for unrecognized paths
  return { view: 'home', id: null }
}

// ============================================================================
// Main Site Component
// ============================================================================

export function HuskReviewsSite({ siteId, path, onPathChange }: SiteProps) {
  const { content: dbContent } = useSiteContent('huskreviews')

  const businesses = useMemo(() => dbContent.map(dbToBusiness), [dbContent])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  // Parse the current route from the path prop
  const route = parseRoute(path)

  // Look up the selected business or reviewer based on route
  const selectedBusiness = route.view === 'business' && route.id
    ? businesses.find(b => b.id === route.id) || null
    : null

  const selectedReviewer = route.view === 'reviewer' && route.id
    ? REVIEWERS[route.id] || null
    : null

  // Navigation handlers that update the URL
  const navigateToBusiness = (business: Business) => {
    onPathChange(`/business/${business.id}`)
  }

  const navigateToReviewer = (reviewer: Reviewer) => {
    onPathChange(`/reviewer/${reviewer.id}`)
  }

  const navigateToHome = () => {
    onPathChange(null)
  }

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = searchQuery === '' ||
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' ||
      business.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-full" style={{ background: '#F7F7F7' }}>
      {/* Header */}
      <header className="bg-red-600 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={navigateToHome}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">🌽</span>
              <span className="text-2xl font-bold">{site?.name || 'HuskReviews'}</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="text-sm text-red-100 hover:text-white">Write a Review</button>
              <button className="text-sm text-red-100 hover:text-white">Find Friends</button>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 font-bold">
                G
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {!selectedBusiness && !selectedReviewer && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-l text-gray-900"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 text-gray-900 border-l"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="px-6 py-2 bg-red-700 hover:bg-red-800 rounded-r font-medium">
                Search
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tagline Banner */}
      <div className="bg-red-50 border-b border-red-100 py-2 px-4">
        <p className="text-center text-sm text-red-700">
          <strong>HuskReviews</strong> - Where honest opinions meet unhinged experiences | {businesses.reduce((sum, b) => sum + b.reviewCount, 0).toLocaleString()} reviews and counting
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {selectedReviewer ? (
          <ReviewerProfile
            reviewer={selectedReviewer}
            onBack={navigateToHome}
          />
        ) : selectedBusiness ? (
          <BusinessDetail
            business={selectedBusiness}
            onBack={navigateToHome}
          />
        ) : (
          <div className="flex gap-6">
            {/* Main Listings */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedCategory === 'All Categories' ? 'All Businesses' : selectedCategory}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredBusinesses.length} results
                </span>
              </div>

              {filteredBusinesses.map(business => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onClick={() => navigateToBusiness(business)}
                />
              ))}

              {filteredBusinesses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">🌽</p>
                  <p className="text-gray-500">No businesses found. Try a different search.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-72 hidden lg:block">
              {/* Recent Activity */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                className="mb-4"
                bgColor="#ffffff"
                borderColor="#E5E7EB"
                textColor="#1F2937"
              >
                <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span>🔬</span>
                    <span>Derek Q. wrote his 847th review</span>
                  </div>
                  <div className="flex gap-2">
                    <span>👵</span>
                    <span>Mildred G. cried at another gas station</span>
                  </div>
                  <div className="flex gap-2">
                    <span>🙆</span>
                    <span>Trust Fall Tim achieved 78.6% catch rate</span>
                  </div>
                </div>
              </StyledCard>

              {/* Elite Reviewers */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                className="mb-4"
                bgColor="#ffffff"
                borderColor="#E5E7EB"
                textColor="#1F2937"
              >
                <h3 className="font-bold text-gray-900 mb-3">Elite Reviewers</h3>
                <div className="space-y-3">
                  {Object.values(REVIEWERS)
                    .filter(r => r.isElite)
                    .slice(0, 4)
                    .map(reviewer => (
                      <button
                        key={reviewer.id}
                        onClick={() => navigateToReviewer(reviewer)}
                        className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-1 rounded"
                      >
                        <span className="text-xl">{reviewer.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{reviewer.name}</span>
                            <EliteBadge years={reviewer.eliteYears} />
                          </div>
                          <span className="text-xs text-gray-500">{reviewer.reviewCount} reviews</span>
                        </div>
                      </button>
                    ))}
                </div>
              </StyledCard>

              {/* Categories */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                className="mb-4"
                bgColor="#ffffff"
                borderColor="#E5E7EB"
                textColor="#1F2937"
              >
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.slice(1).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-2 py-1 rounded text-sm ${
                        selectedCategory === cat
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </StyledCard>

              {/* Rating Guide */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                bgColor="#FEF2F2"
                borderColor="#FECACA"
                textColor="#991B1B"
              >
                <h3 className="font-bold mb-2">Corn Cob Ratings</h3>
                <div className="text-xs space-y-1">
                  <p><CornRating rating={5} size="sm" /> - Transcendent</p>
                  <p><CornRating rating={4} size="sm" /> - Excellent</p>
                  <p><CornRating rating={3} size="sm" /> - Average</p>
                  <p><CornRating rating={2} size="sm" /> - Disappointing</p>
                  <p><CornRating rating={1} size="sm" /> - Avoid</p>
                </div>
              </StyledCard>
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 px-4 text-center text-xs">
        <p className="mb-2">
          {site?.name || 'HuskReviews'} - The most trusted source for unhinged local business reviews
        </p>
        <p className="text-gray-500">
          Not affiliated with any corn-based agricultural entity. All reviews are real. Some reviewers may need therapy.
        </p>
      </footer>
    </div>
  )
}

export default HuskReviewsSite
