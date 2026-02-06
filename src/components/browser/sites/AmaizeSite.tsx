/**
 * Amaize Site (www.amaize.corn)
 *
 * Amazon parody where everything is corn-related or sold by lore characters.
 * Features "Kernel Prime" membership, product listings, reviews, and seller profiles.
 * Orange/dark theme reminiscent of a certain e-commerce giant.
 *
 * URL Routing:
 * - Homepage: path = null or '/'
 * - Product view: path = '/product/{product-id}'
 * - Seller view: path = '/seller/{seller-id}'
 * - Category view: path = '/category/{category-slug}'
 */

import { useState, useMemo, useCallback } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, useSiteChannels, useSiteCategories, type SiteContentItem, type SiteChannel, type SiteCategory } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Types
// ============================================================================

interface Review {
  id: string
  author: string
  rating: number
  title: string
  content: string
  date: string
  verified: boolean
  helpful: number
  unhelpful: number
}

interface Product {
  id: string
  title: string
  price: number | string
  originalPrice?: number
  rating: number
  reviewCount: number
  seller: string
  sellerVerified: boolean
  image: string
  primeEligible: boolean
  description: string
  features: string[]
  reviews: Review[]
  frequentlyBoughtWith: string[]
  category: string
  inStock: boolean
  stockNote?: string
  shipsFrom?: string
}

interface Seller {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  memberSince: string
  description: string
  shipsFrom: string
  responseTime: string
  products: string[]
}


// ============================================================================
// DB-to-Local Adapters
// ============================================================================

/** Adapt a DB Review object (from metadata) to the local Review interface */
function dbToReview(raw: Record<string, any>): Review {
  return {
    id: raw.id || '',
    author: raw.author || 'Anonymous',
    rating: raw.rating || 0,
    title: raw.title || '',
    content: raw.content || '',
    date: raw.date || '',
    verified: raw.verified || false,
    helpful: raw.helpful || 0,
    unhelpful: raw.unhelpful || 0,
  }
}

/** Adapt a DB SiteContentItem to the local Product interface */
function dbToProduct(item: SiteContentItem): Product {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    price: m.price ?? 0,
    originalPrice: m.originalPrice,
    rating: m.rating || 0,
    reviewCount: item.commentCount || m.reviewCount || 0,
    seller: m.seller || '',
    sellerVerified: m.sellerVerified || false,
    image: item.thumbnailEmoji || m.image || '📦',
    primeEligible: m.primeEligible || false,
    description: item.body || item.summary || '',
    features: m.features || [],
    reviews: Array.isArray(m.reviews) ? m.reviews.map(dbToReview) : [],
    frequentlyBoughtWith: m.frequentlyBoughtWith || [],
    category: item.category || '',
    inStock: m.inStock !== false,
    stockNote: m.stockNote,
    shipsFrom: m.shipsFrom,
  }
}

/** Adapt a DB SiteChannel to the local Seller interface */
function dbToSeller(ch: SiteChannel): Seller {
  const m = ch.metadata || {}
  return {
    id: ch.slug,
    name: ch.name,
    avatar: ch.avatarEmoji || m.avatar || '🏪',
    rating: m.rating || 0,
    reviewCount: ch.contentCount || m.reviewCount || 0,
    memberSince: m.memberSince || '',
    description: ch.description || '',
    shipsFrom: m.shipsFrom || '',
    responseTime: m.responseTime || '',
    products: m.products || [],
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatPrice(price: number | string): string {
  if (typeof price === 'string') return price
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function renderStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars)
}

// NOTE: getProductById, getSellerByName, getSellerById, and findCategoryBySlug
// are defined inside AmaizeSite component to reference the dynamic data arrays.

// ============================================================================
// URL Routing Helpers
// ============================================================================

/**
 * Slugify a category name for URL use.
 * Converts "Kitchen Appliances" to "kitchen-appliances"
 */
function slugifyCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')
}

/**
 * Parse the current path to determine the view and extract IDs.
 * Returns the view type and any relevant ID.
 */
function parseRoute(path: string | null): {
  view: 'home' | 'product' | 'seller' | 'category'
  id: string | null
} {
  if (!path || path === '/') {
    return { view: 'home', id: null }
  }

  // Match /product/{product-id}
  const productMatch = path.match(/^\/product\/(.+)$/)
  if (productMatch) {
    return { view: 'product', id: productMatch[1] }
  }

  // Match /seller/{seller-id}
  const sellerMatch = path.match(/^\/seller\/(.+)$/)
  if (sellerMatch) {
    return { view: 'seller', id: sellerMatch[1] }
  }

  // Match /category/{category-slug}
  const categoryMatch = path.match(/^\/category\/(.+)$/)
  if (categoryMatch) {
    return { view: 'category', id: categoryMatch[1] }
  }

  return { view: 'home', id: null }
}

// ============================================================================
// Theme Constants
// ============================================================================

const THEME = {
  primary: '#FF9900',
  secondary: '#146EB4',
  background: '#EAEDED',
  surface: '#FFFFFF',
  dark: '#131921',
  text: '#0F1111',
  textMuted: '#565959',
  border: '#D5D9D9',
  primeBlue: '#007185',
  ratingOrange: '#DE7921',
}

// ============================================================================
// Components
// ============================================================================

interface ProductCardProps {
  product: Product
  onClick: () => void
}

function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <StyledCard
      bgColor={THEME.surface}
      borderColor={THEME.border}
      borderRadius="sm"
      padding="md"
      interactive
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 rounded flex items-center justify-center text-6xl mb-3">
        {product.image}
      </div>

      {/* Title */}
      <h3
        className="text-sm font-medium line-clamp-2 mb-1 hover:text-orange-600"
        style={{ color: THEME.primeBlue }}
      >
        {product.title}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 text-sm mb-1">
        <span style={{ color: THEME.ratingOrange }}>{renderStars(product.rating)}</span>
        <span style={{ color: THEME.primeBlue }}>{product.reviewCount.toLocaleString()}</span>
      </div>

      {/* Price */}
      <div className="mb-1">
        {product.originalPrice && (
          <span className="text-xs line-through mr-2" style={{ color: THEME.textMuted }}>
            {formatPrice(product.originalPrice)}
          </span>
        )}
        <span className="text-lg font-medium" style={{ color: THEME.text }}>
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Prime badge */}
      {product.primeEligible && (
        <div className="flex items-center gap-1 text-xs">
          <span className="font-bold" style={{ color: THEME.primeBlue }}>kernel</span>
          <span style={{ color: THEME.primary }}>prime</span>
        </div>
      )}

      {/* Stock note */}
      {product.stockNote && (
        <p className="text-xs mt-1" style={{ color: '#B12704' }}>
          {product.stockNote}
        </p>
      )}
    </StyledCard>
  )
}

interface ProductDetailProps {
  product: Product
  allProducts: Product[]
  allSellers: Seller[]
  onBack: () => void
  onSellerClick: (seller: Seller) => void
  onProductClick: (product: Product) => void
}

function ProductDetail({ product, allProducts, allSellers, onBack, onSellerClick, onProductClick }: ProductDetailProps) {
  const [selectedReviewSort, setSelectedReviewSort] = useState<'helpful' | 'recent'>('helpful')
  const seller = allSellers.find(s => s.name === product.seller)

  const sortedReviews = [...product.reviews].sort((a, b) => {
    if (selectedReviewSort === 'helpful') return b.helpful - a.helpful
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: THEME.textMuted }}>
        <button onClick={onBack} className="hover:underline" style={{ color: THEME.primeBlue }}>
          Amaize.corn
        </button>
        <span>&gt;</span>
        <span>{product.category}</span>
        <span>&gt;</span>
        <span className="truncate max-w-xs">{product.title}</span>
      </div>

      <div className="flex gap-8">
        {/* Left Column - Image */}
        <div className="w-96 shrink-0">
          <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="lg" borderRadius="sm">
            <div className="aspect-square flex items-center justify-center text-[150px] bg-gray-50 rounded">
              {product.image}
            </div>
          </StyledCard>
        </div>

        {/* Middle Column - Details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-medium mb-2" style={{ color: THEME.text }}>
            {product.title}
          </h1>

          {/* Seller link */}
          <p className="text-sm mb-2">
            <span style={{ color: THEME.textMuted }}>Visit the </span>
            <button
              onClick={() => seller && onSellerClick(seller)}
              className="hover:underline"
              style={{ color: THEME.primeBlue }}
            >
              {product.seller} Store
            </button>
            {product.sellerVerified && <span className="ml-1" title="Verified Seller">✓</span>}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium" style={{ color: THEME.ratingOrange }}>
              {product.rating.toFixed(1)}
            </span>
            <span style={{ color: THEME.ratingOrange }}>{renderStars(product.rating)}</span>
            <button className="hover:underline" style={{ color: THEME.primeBlue }}>
              {product.reviewCount.toLocaleString()} ratings
            </button>
          </div>

          {/* Price section */}
          <div className="border-b pb-4 mb-4" style={{ borderColor: THEME.border }}>
            {product.originalPrice && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm" style={{ color: THEME.textMuted }}>List Price:</span>
                <span className="line-through" style={{ color: THEME.textMuted }}>
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-sm" style={{ color: THEME.textMuted }}>Price:</span>
              <span className="text-3xl font-light" style={{ color: '#B12704' }}>
                {formatPrice(product.price)}
              </span>
            </div>
            {product.primeEligible && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-sm font-bold" style={{ color: THEME.primeBlue }}>kernel</span>
                <span className="text-sm" style={{ color: THEME.primary }}>prime</span>
                <span className="text-sm" style={{ color: THEME.textMuted }}> FREE Delivery</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <h2 className="font-bold mb-2" style={{ color: THEME.text }}>About this item</h2>
            <p className="text-sm whitespace-pre-line" style={{ color: THEME.text }}>
              {product.description}
            </p>
          </div>

          {/* Features */}
          <div className="mb-4">
            <ul className="text-sm space-y-1">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span style={{ color: THEME.primary }}>-</span>
                  <span style={{ color: THEME.text }}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ships from */}
          {product.shipsFrom && (
            <p className="text-sm mb-4" style={{ color: THEME.textMuted }}>
              Ships from: <span style={{ color: THEME.text }}>{product.shipsFrom}</span>
            </p>
          )}
        </div>

        {/* Right Column - Buy Box */}
        <div className="w-64 shrink-0">
          <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="md" borderRadius="sm">
            <p className="text-2xl mb-2" style={{ color: '#B12704' }}>
              {formatPrice(product.price)}
            </p>

            {product.primeEligible && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm font-bold" style={{ color: THEME.primeBlue }}>kernel</span>
                <span className="text-sm" style={{ color: THEME.primary }}>prime</span>
              </div>
            )}

            <p className="text-sm mb-4" style={{ color: THEME.textMuted }}>
              FREE delivery <strong>Tomorrow</strong> if you order within 8 hrs 47 mins
            </p>

            {product.inStock ? (
              <p className="text-lg mb-4" style={{ color: '#007600' }}>In Stock</p>
            ) : (
              <p className="text-lg mb-4" style={{ color: '#B12704' }}>Out of Stock</p>
            )}

            {product.stockNote && (
              <p className="text-sm mb-4" style={{ color: '#B12704' }}>{product.stockNote}</p>
            )}

            <Button
              variant="primary"
              size="md"
              backgroundColor="#FFD814"
              textColor={THEME.text}
              width="full"
              className="mb-2 rounded-full"
            >
              Add to Cart
            </Button>

            <Button
              variant="primary"
              size="md"
              backgroundColor="#FFA41C"
              textColor={THEME.text}
              width="full"
              className="rounded-full"
            >
              Buy Now
            </Button>

            <div className="mt-4 text-xs space-y-1" style={{ color: THEME.textMuted }}>
              <p>Ships from: <span style={{ color: THEME.text }}>Amaize.corn</span></p>
              <p>Sold by: <span style={{ color: THEME.primeBlue }}>{product.seller}</span></p>
              <p>Returns: <span style={{ color: THEME.text }}>Eligible for return*</span></p>
            </div>
          </StyledCard>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {product.frequentlyBoughtWith.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: THEME.text }}>
            Frequently bought together
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-32 h-32 bg-gray-50 rounded flex items-center justify-center text-4xl border" style={{ borderColor: THEME.border }}>
              {product.image}
            </div>
            {product.frequentlyBoughtWith.map((id, i) => {
              const related = allProducts.find(p => p.id === id)
              if (!related) return null
              return (
                <div key={id} className="flex items-center gap-4">
                  <span className="text-2xl" style={{ color: THEME.textMuted }}>+</span>
                  <button
                    onClick={() => onProductClick(related)}
                    className="w-32 h-32 bg-gray-50 rounded flex items-center justify-center text-4xl border hover:border-orange-400 transition-colors cursor-pointer"
                    style={{ borderColor: THEME.border }}
                  >
                    {related.image}
                  </button>
                </div>
              )
            })}
            <div className="ml-4">
              <p className="text-sm mb-2" style={{ color: THEME.text }}>
                Total price: <strong style={{ color: '#B12704' }}>$$$</strong>
              </p>
              <Button variant="primary" size="sm" backgroundColor="#FFD814" textColor={THEME.text}>
                Add all to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Reviews */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: THEME.text }}>
          Customer Reviews
        </h2>

        {/* Rating summary */}
        <div className="flex gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-medium" style={{ color: THEME.ratingOrange }}>
                {product.rating.toFixed(1)}
              </span>
              <span className="text-2xl" style={{ color: THEME.ratingOrange }}>
                {renderStars(product.rating)}
              </span>
            </div>
            <p className="text-sm" style={{ color: THEME.textMuted }}>
              {product.reviewCount.toLocaleString()} global ratings
            </p>
          </div>
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm" style={{ color: THEME.textMuted }}>Sort by:</span>
          <button
            onClick={() => setSelectedReviewSort('helpful')}
            className={`text-sm ${selectedReviewSort === 'helpful' ? 'font-bold' : ''}`}
            style={{ color: THEME.primeBlue }}
          >
            Most Helpful
          </button>
          <button
            onClick={() => setSelectedReviewSort('recent')}
            className={`text-sm ${selectedReviewSort === 'recent' ? 'font-bold' : ''}`}
            style={{ color: THEME.primeBlue }}
          >
            Most Recent
          </button>
        </div>

        {/* Reviews list */}
        {sortedReviews.length === 0 ? (
          <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="lg" borderRadius="sm">
            <p className="text-center" style={{ color: THEME.textMuted }}>
              No reviews yet. All reviewers have [REDACTED].
            </p>
          </StyledCard>
        ) : (
          <div className="space-y-4">
            {sortedReviews.map(review => (
              <StyledCard key={review.id} bgColor={THEME.surface} borderColor={THEME.border} padding="md" borderRadius="sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: THEME.text }}>{review.author}</span>
                  {review.verified && (
                    <span className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: '#EAEDED', color: THEME.textMuted }}>
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: THEME.ratingOrange }}>{renderStars(review.rating)}</span>
                  <strong className="text-sm" style={{ color: THEME.text }}>{review.title}</strong>
                </div>

                <p className="text-xs mb-2" style={{ color: THEME.textMuted }}>
                  Reviewed {review.date}
                </p>

                <p className="text-sm mb-4" style={{ color: THEME.text }}>
                  {review.content}
                </p>

                <div className="flex items-center gap-4 text-xs" style={{ color: THEME.textMuted }}>
                  <span>{review.helpful.toLocaleString()} people found this helpful</span>
                  <button className="px-3 py-1 rounded border hover:bg-gray-50" style={{ borderColor: THEME.border }}>
                    Helpful
                  </button>
                  <button className="hover:underline" style={{ color: THEME.primeBlue }}>
                    Report
                  </button>
                </div>
              </StyledCard>
            ))}
          </div>
        )}
      </div>

      {/* Customers Also Viewed */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: THEME.text }}>
          Customers who viewed this item also viewed
        </h2>
        <p className="text-sm mb-4" style={{ color: THEME.textMuted }}>
          (It's always corn. It's always about corn.)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allProducts.filter(p => p.id !== product.id).slice(0, 6).map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onProductClick(p)} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SellerProfileProps {
  seller: Seller
  allProducts: Product[]
  onBack: () => void
  onProductClick: (product: Product) => void
}

function SellerProfile({ seller, allProducts, onBack, onProductClick }: SellerProfileProps) {
  const sellerProducts = allProducts.filter(p => p.seller === seller.name)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-sm mb-4 hover:underline"
        style={{ color: THEME.primeBlue }}
      >
        &lt; Back to results
      </button>

      {/* Seller header */}
      <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="lg" borderRadius="sm" className="mb-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-5xl">
            {seller.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1" style={{ color: THEME.text }}>{seller.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: THEME.ratingOrange }}>{renderStars(seller.rating)}</span>
              <span className="text-sm" style={{ color: THEME.textMuted }}>
                ({seller.reviewCount.toLocaleString()} ratings)
              </span>
            </div>
            <p className="text-sm mb-2" style={{ color: THEME.textMuted }}>
              Seller since {seller.memberSince}
            </p>
            <p className="text-sm" style={{ color: THEME.text }}>{seller.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: THEME.border }}>
          <div>
            <p className="text-xs" style={{ color: THEME.textMuted }}>Ships from</p>
            <p className="text-sm font-medium" style={{ color: THEME.text }}>{seller.shipsFrom}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: THEME.textMuted }}>Response time</p>
            <p className="text-sm font-medium" style={{ color: THEME.text }}>{seller.responseTime}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: THEME.textMuted }}>Products</p>
            <p className="text-sm font-medium" style={{ color: THEME.text }}>{sellerProducts.length}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: THEME.textMuted }}>Seller rating</p>
            <p className="text-sm font-medium" style={{ color: THEME.text }}>{seller.rating.toFixed(1)}/5</p>
          </div>
        </div>
      </StyledCard>

      {/* Seller products */}
      <h2 className="text-xl font-bold mb-4" style={{ color: THEME.text }}>
        Products from {seller.name}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sellerProducts.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => onProductClick(product)} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

/** Hardcoded fallback category list used when DB has no categories */
export function AmaizeSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // ---------------------------------------------------------------------------
  // Fetch DB content with fallback to hardcoded data
  // ---------------------------------------------------------------------------
  const { content: dbContent } = useSiteContent('amaize')
  const { channels: dbChannels } = useSiteChannels('amaize')
  const { categories: dbCategories } = useSiteCategories('amaize')

  const products = useMemo(() => dbContent.map(dbToProduct), [dbContent])

  const sellers = useMemo(() => dbChannels.map(dbToSeller), [dbChannels])

  const categories = useMemo(() => ['All', ...dbCategories.map(c => c.name)], [dbCategories])

  // ---------------------------------------------------------------------------
  // Lookup helpers (scoped to dynamic data)
  // ---------------------------------------------------------------------------
  const getProductById = useCallback(
    (id: string) => products.find(p => p.id === id),
    [products]
  )

  const getSellerById = useCallback(
    (id: string) => sellers.find(s => s.id === id),
    [sellers]
  )

  const findCategoryBySlug = useCallback(
    (slug: string): string | null => {
      const normalized = slug.toLowerCase()
      return categories.find(cat => slugifyCategory(cat) === normalized) || null
    },
    [categories]
  )

  // ---------------------------------------------------------------------------
  // Routing
  // ---------------------------------------------------------------------------

  // Parse the current route to determine what view to show
  const route = useMemo(() => parseRoute(path), [path])

  // Find the selected product/seller based on the route
  const selectedProduct = useMemo(() => {
    if (route.view !== 'product' || !route.id) return null
    return getProductById(route.id) || null
  }, [route.view, route.id, getProductById])

  const selectedSeller = useMemo(() => {
    if (route.view !== 'seller' || !route.id) return null
    return getSellerById(route.id) || null
  }, [route.view, route.id, getSellerById])

  // Category from URL or default to 'All'
  const selectedCategory = useMemo(() => {
    if (route.view === 'category' && route.id) {
      return findCategoryBySlug(route.id) || 'All'
    }
    return 'All'
  }, [route.view, route.id, findCategoryBySlug])

  // Local UI state (not URL-based)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Navigate to a product page
  const handleProductClick = (product: Product) => {
    onPathChange(`/product/${product.id}`)
  }

  // Navigate to a seller page
  const handleSellerClick = (seller: Seller) => {
    onPathChange(`/seller/${seller.id}`)
  }

  // Navigate back to the homepage
  const handleBack = () => {
    onPathChange(null)
  }

  // Navigate to a category page
  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      onPathChange(null)
    } else {
      onPathChange(`/category/${slugifyCategory(category)}`)
    }
  }

  return (
    <div className="min-h-full" style={{ background: THEME.background }}>
      {/* Header */}
      <header style={{ background: THEME.dark }}>
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-white hover:outline hover:outline-1 hover:outline-white p-1"
            >
              <span className="text-2xl">🌽</span>
              <span className="text-xl font-bold" style={{ color: THEME.primary }}>amaize</span>
              <span className="text-sm" style={{ color: THEME.textMuted }}>.corn</span>
            </button>

            {/* Location */}
            <button className="text-white text-xs hover:outline hover:outline-1 hover:outline-white p-1">
              <span style={{ color: '#CCCCCC' }}>Deliver to</span>
              <div className="font-bold flex items-center gap-1">
                <span>📍</span> Cornfield, KS
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="flex rounded overflow-hidden">
                <select
                  className="px-2 py-2 text-xs bg-gray-200 border-r"
                  style={{ borderColor: THEME.border }}
                >
                  <option>All</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search Amaize.corn"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm"
                  style={{ color: THEME.text }}
                />
                <button className="px-4" style={{ background: THEME.primary }}>
                  <span className="text-lg">🔍</span>
                </button>
              </div>
            </div>

            {/* Right side */}
            <button className="text-white text-xs hover:outline hover:outline-1 hover:outline-white p-1">
              <span style={{ color: '#CCCCCC' }}>Hello, Derek</span>
              <div className="font-bold">Account & Lists</div>
            </button>

            <button className="text-white text-xs hover:outline hover:outline-1 hover:outline-white p-1">
              <span style={{ color: '#CCCCCC' }}>Returns</span>
              <div className="font-bold">& Orders</div>
            </button>

            <button className="text-white text-xs hover:outline hover:outline-1 hover:outline-white p-1 flex items-center gap-1">
              <span className="text-2xl">🛒</span>
              <span className="font-bold">Cart</span>
              <span className="bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">47</span>
            </button>
          </div>
        </div>

        {/* Sub-header */}
        <div className="px-4 py-1" style={{ background: '#232F3E' }}>
          <div className="max-w-7xl mx-auto flex items-center gap-4 text-white text-sm">
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">
              <span className="mr-1">☰</span> All
            </button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">Today's Deals</button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">Buy Again</button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1 flex items-center gap-1">
              <span className="font-bold" style={{ color: THEME.primeBlue }}>kernel</span>
              <span style={{ color: THEME.primary }}>prime</span>
            </button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">Customer Service</button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">Gift Cards</button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">Registry</button>
            <button className="hover:outline hover:outline-1 hover:outline-white p-1">Sell</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {selectedSeller ? (
          <SellerProfile
            seller={selectedSeller}
            allProducts={products}
            onBack={handleBack}
            onProductClick={handleProductClick}
          />
        ) : selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            allProducts={products}
            allSellers={sellers}
            onBack={handleBack}
            onSellerClick={handleSellerClick}
            onProductClick={handleProductClick}
          />
        ) : (
          <>
            {/* Prime banner */}
            <StyledCard
              bgColor="linear-gradient(135deg, #232F3E 0%, #37475A 100%)"
              borderColor="transparent"
              padding="lg"
              borderRadius="sm"
              className="mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold" style={{ color: THEME.primeBlue }}>kernel</span>
                    <span className="text-2xl" style={{ color: THEME.primary }}>prime</span>
                  </div>
                  <p className="text-white text-lg">FREE 2-Day Delivery on corn-related items</p>
                  <p className="text-sm" style={{ color: '#AAAAAA' }}>
                    Plus exclusive access to deals, quantum coffee observations, and more.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  backgroundColor="#FFD814"
                  textColor={THEME.text}
                >
                  Try Kernel Prime Free
                </Button>
              </div>
            </StyledCard>

            {/* Hero deals */}
            <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="lg" borderRadius="sm" className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: THEME.text }}>
                Today's Deals
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.filter(p => p.originalPrice).slice(0, 4).map(product => (
                  <div key={product.id} className="relative">
                    <div
                      className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white z-10"
                      style={{ background: '#CC0C39' }}
                    >
                      {Math.round((1 - (typeof product.price === 'number' ? product.price : 0) / (product.originalPrice || 1)) * 100)}% off
                    </div>
                    <ProductCard product={product} onClick={() => handleProductClick(product)} />
                  </div>
                ))}
              </div>
            </StyledCard>

            <div className="flex gap-6">
              {/* Sidebar */}
              <aside className="w-48 shrink-0">
                <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="md" borderRadius="sm">
                  <h3 className="font-bold text-sm mb-3" style={{ color: THEME.text }}>
                    Department
                  </h3>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`block w-full text-left text-sm py-1 px-2 rounded ${selectedCategory === cat ? 'font-bold' : ''}`}
                        style={{
                          color: selectedCategory === cat ? THEME.primary : THEME.text,
                          background: selectedCategory === cat ? '#FFF3E0' : 'transparent',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t" style={{ borderColor: THEME.border }}>
                    <h3 className="font-bold text-sm mb-3" style={{ color: THEME.text }}>
                      Customer Review
                    </h3>
                    <div className="space-y-1 text-sm">
                      <button className="block" style={{ color: THEME.ratingOrange }}>
                        ★★★★☆ & Up
                      </button>
                      <button className="block" style={{ color: THEME.ratingOrange }}>
                        ★★★☆☆ & Up
                      </button>
                      <button className="block" style={{ color: THEME.ratingOrange }}>
                        ★★☆☆☆ & Up
                      </button>
                      <button className="block" style={{ color: THEME.ratingOrange }}>
                        ★☆☆☆☆ & Up
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t" style={{ borderColor: THEME.border }}>
                    <h3 className="font-bold text-sm mb-3" style={{ color: THEME.text }}>
                      Delivery
                    </h3>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span style={{ color: THEME.text }}>Kernel Prime</span>
                    </label>
                  </div>
                </StyledCard>
              </aside>

              {/* Main product grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{ color: THEME.text }}>
                    Results
                  </h2>
                  <span className="text-sm" style={{ color: THEME.textMuted }}>
                    {filteredProducts.length} results
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => handleProductClick(product)}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="xl" borderRadius="sm">
                    <div className="text-center">
                      <span className="text-6xl block mb-4">🌽</span>
                      <p className="text-lg font-medium mb-2" style={{ color: THEME.text }}>
                        No results found
                      </p>
                      <p style={{ color: THEME.textMuted }}>
                        Try searching for corn. It's always about corn.
                      </p>
                    </div>
                  </StyledCard>
                )}
              </div>
            </div>

            {/* Recently viewed */}
            <div className="mt-8">
              <StyledCard bgColor={THEME.surface} borderColor={THEME.border} padding="lg" borderRadius="sm">
                <h2 className="text-lg font-bold mb-4" style={{ color: THEME.text }}>
                  Your recently viewed items
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {products.slice(0, 6).map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="w-32 shrink-0"
                    >
                      <div className="w-32 h-32 bg-gray-50 rounded flex items-center justify-center text-4xl border" style={{ borderColor: THEME.border }}>
                        {product.image}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: THEME.primeBlue }}>
                        {product.title}
                      </p>
                    </button>
                  ))}
                </div>
              </StyledCard>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8" style={{ background: THEME.dark }}>
        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-3 text-white text-sm hover:bg-gray-700 transition-colors"
          style={{ background: '#37475A' }}
        >
          Back to top
        </button>

        {/* Footer links */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8 text-white">
            <div>
              <h3 className="font-bold mb-3">Get to Know Us</h3>
              <ul className="text-sm space-y-2" style={{ color: '#DDD' }}>
                <li className="hover:underline cursor-pointer">Careers</li>
                <li className="hover:underline cursor-pointer">Blog</li>
                <li className="hover:underline cursor-pointer">About Amaize</li>
                <li className="hover:underline cursor-pointer">Investor Relations</li>
                <li className="hover:underline cursor-pointer">Corn Devices</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Make Money with Us</h3>
              <ul className="text-sm space-y-2" style={{ color: '#DDD' }}>
                <li className="hover:underline cursor-pointer">Sell corn on Amaize</li>
                <li className="hover:underline cursor-pointer">Sell on Amaize Business</li>
                <li className="hover:underline cursor-pointer">Advertise Your Corn</li>
                <li className="hover:underline cursor-pointer">Self-Publish with Kindle</li>
                <li className="hover:underline cursor-pointer">Host an Amaize Hub</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Amaize Payment Products</h3>
              <ul className="text-sm space-y-2" style={{ color: '#DDD' }}>
                <li className="hover:underline cursor-pointer">Amaize Rewards Visa</li>
                <li className="hover:underline cursor-pointer">Shop with Points</li>
                <li className="hover:underline cursor-pointer">CobCoin (do not recommend)</li>
                <li className="hover:underline cursor-pointer">Amaize Currency Converter</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Let Us Help You</h3>
              <ul className="text-sm space-y-2" style={{ color: '#DDD' }}>
                <li className="hover:underline cursor-pointer">Your Account</li>
                <li className="hover:underline cursor-pointer">Your Orders</li>
                <li className="hover:underline cursor-pointer">Shipping Rates & Policies</li>
                <li className="hover:underline cursor-pointer">Returns & Replacements</li>
                <li className="hover:underline cursor-pointer">Help (Derek needs it)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t" style={{ borderColor: '#3A4553', background: '#131A22' }}>
          <div className="max-w-7xl mx-auto px-4 py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">🌽</span>
              <span className="text-xl font-bold text-white" style={{ color: THEME.primary }}>amaize</span>
              <span className="text-sm" style={{ color: THEME.textMuted }}>.corn</span>
            </div>
            <p className="text-xs" style={{ color: '#999' }}>
              2024 Amaize.corn, Inc. or its affiliates. All corn is reserved.
            </p>
            <p className="text-xs mt-2" style={{ color: '#666' }}>
              "The everything corn store." - Actual slogan. Derek approved.
            </p>
            <p className="text-xs mt-2" style={{ color: '#444' }}>
              847 products. 847 reviews. 847 is just a number.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AmaizeSite
