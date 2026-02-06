/**
 * SilkRoad Site - www.silkroad.corn
 *
 * A parody of dark web marketplaces that is actually a completely legitimate
 * corn silk products store. It looks sketchy but only sells tea, supplements,
 * and crafts made from corn silk.
 *
 * The joke: Dark web aesthetics, shady language, but 100% legal corn silk.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Site Theme Configuration
// ============================================================================

const SITE_CONFIG = {
  id: 'silkroad',
  name: 'SilkRoad',
  tagline: 'The Silk Flows Free',
  url: 'www.silkroad.corn',
  icon: '🌽',
  theme: {
    primary: '#00FF41',        // Matrix green
    secondary: '#008F11',      // Darker green
    accent: '#003B00',         // Deep green
    background: '#0a0a0a',     // Near black
    surface: '#1a1a1a',        // Dark grey
    text: '#00FF41',           // Matrix green text
    textMuted: '#006400',      // Muted green
    border: '#003B00',         // Dark green border
    warning: '#FFD700',        // Gold for warnings
    trusted: '#00FF41',        // Green for trusted
  },
}

// ============================================================================
// Types
// ============================================================================

interface Vendor {
  id: string
  username: string
  avatar: string
  trustScore: number
  totalSales: number
  positivePercent: number
  verified: boolean
  memberSince: string
  pgpKey?: string
  bio: string
  specialties: string[]
  responseTime: string
}

interface Product {
  id: string
  title: string
  price: number
  category: string
  vendor: Vendor
  description: string
  shipping: string[]
  escrowAvailable: boolean
  btcAccepted: boolean
  cardAccepted: boolean
  inStock: number
  sold: number
  views: number
  reviews: Review[]
}

interface Review {
  id: string
  author: string
  rating: number
  text: string
  timestamp: string
  verified: boolean
}

// (Hardcoded vendors and products removed -- database is the sole source of truth)

const CATEGORIES = ['All Products', 'Raw Materials', 'Supplements', 'Bulk Orders', 'Specialty', 'Specialty Blends', 'Experimental']

// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Product interface */
function dbToProduct(item: SiteContentItem): Product {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    price: m.price ?? 0,
    category: item.category ?? m.category ?? 'Raw Materials',
    vendor: m.vendor ?? { id: 'unknown', username: 'Anonymous', avatar: '?', trustScore: 0, totalSales: 0, positivePercent: 0, verified: false, memberSince: 'Unknown', bio: '', specialties: [], responseTime: 'Unknown' },
    description: item.body ?? item.summary ?? '',
    shipping: m.shipping ?? [],
    escrowAvailable: m.escrowAvailable ?? m.escrow_available ?? true,
    btcAccepted: m.btcAccepted ?? m.btc_accepted ?? true,
    cardAccepted: m.cardAccepted ?? m.card_accepted ?? true,
    inStock: m.inStock ?? m.in_stock ?? 0,
    sold: m.sold ?? 0,
    views: item.viewCount ?? m.views ?? 0,
    reviews: (m.reviews ?? []).map((r: any, i: number) => ({
      id: r.id ?? `r_${i}`,
      author: r.author ?? 'Anonymous',
      rating: r.rating ?? 5,
      text: r.text ?? r.content ?? '',
      timestamp: r.timestamp ?? '',
      verified: r.verified ?? false,
    })),
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function SilkRoadSite({ onNavigate }: SiteProps) {
  const { content: dbContent } = useSiteContent('silkroad')

  const products = useMemo(() => dbContent.map(dbToProduct), [dbContent])

  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showEscrowModal, setShowEscrowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'market' | 'vendors' | 'escrow'>('market')

  const filteredProducts = selectedCategory === 'All Products'
    ? products
    : products.filter(p => p.category === selectedCategory)

  return (
    <div className="min-h-full font-mono" style={{ background: SITE_CONFIG.theme.background }}>
      {/* Warning Banner */}
      <div
        className="py-2 px-4 text-center text-xs"
        style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.warning }}
      >
        This is a LEGAL marketplace for corn silk products. We are not affiliated with any illegal activities. Please stop asking.
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: SITE_CONFIG.theme.surface, borderBottom: `1px solid ${SITE_CONFIG.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setSelectedProduct(null); setSelectedVendor(null) }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl">{SITE_CONFIG.icon}</span>
              <div className="text-left">
                <h1 className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  {SITE_CONFIG.name}
                </h1>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                  {SITE_CONFIG.tagline}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search products..."
                className="px-3 py-1.5 rounded text-sm w-64"
                style={{
                  background: SITE_CONFIG.theme.background,
                  border: `1px solid ${SITE_CONFIG.theme.border}`,
                  color: SITE_CONFIG.theme.text,
                }}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: SITE_CONFIG.theme.primary }}>BTC: 0.0847</span>
                <Button
                  variant="outline"
                  borderColor={SITE_CONFIG.theme.primary}
                  textColor={SITE_CONFIG.theme.primary}
                  size="sm"
                >
                  Cart (0)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'market' as const, label: 'Marketplace', icon: '🛒' },
              { id: 'vendors' as const, label: 'Vendors', icon: '👤' },
              { id: 'escrow' as const, label: 'How Escrow Works', icon: '🔒' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedProduct(null); setSelectedVendor(null) }}
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  color: SITE_CONFIG.theme.primary,
                  borderColor: activeTab === tab.id ? SITE_CONFIG.theme.primary : 'transparent',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onVendorClick={() => { setSelectedVendor(selectedProduct.vendor); setSelectedProduct(null) }}
          />
        ) : selectedVendor ? (
          <VendorProfile
            vendor={selectedVendor}
            products={products.filter(p => p.vendor.id === selectedVendor.id)}
            onBack={() => setSelectedVendor(null)}
            onProductClick={setSelectedProduct}
          />
        ) : activeTab === 'market' ? (
          <Marketplace
            products={filteredProducts}
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onProductClick={setSelectedProduct}
            onVendorClick={setSelectedVendor}
          />
        ) : activeTab === 'vendors' ? (
          <VendorList
            vendors={VENDORS}
            onVendorClick={setSelectedVendor}
          />
        ) : (
          <EscrowExplainer />
        )}
      </main>

      {/* Footer */}
      <footer
        className="py-6 px-4 text-center text-xs"
        style={{
          background: SITE_CONFIG.theme.surface,
          borderTop: `1px solid ${SITE_CONFIG.theme.border}`,
          color: SITE_CONFIG.theme.textMuted,
        }}
      >
        <p className="mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
          SilkRoad - The premier destination for corn silk enthusiasts since 2019
        </p>
        <p className="mb-4">
          All transactions are for LEGAL corn silk products. BTC and credit cards accepted.
        </p>
        <p style={{ color: SITE_CONFIG.theme.warning }}>
          We report all illegal inquiries to authorities. This is a TEA website.
        </p>
        <div className="flex justify-center gap-4 mt-4" style={{ color: SITE_CONFIG.theme.textMuted }}>
          <button className="hover:underline">PGP Keys</button>
          <button className="hover:underline">Warrant Canary</button>
          <button className="hover:underline">Legal</button>
          <button className="hover:underline">Contact</button>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Marketplace Section
// ============================================================================

interface MarketplaceProps {
  products: Product[]
  categories: string[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  onProductClick: (product: Product) => void
  onVendorClick: (vendor: Vendor) => void
}

function Marketplace({ products, categories, selectedCategory, onCategoryChange, onProductClick, onVendorClick }: MarketplaceProps) {
  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-48 shrink-0">
        <h3
          className="font-bold text-sm mb-3"
          style={{ color: SITE_CONFIG.theme.primary }}
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
              backgroundColor={selectedCategory === cat ? SITE_CONFIG.theme.accent : 'transparent'}
              textColor={SITE_CONFIG.theme.primary}
              width="full"
              className="justify-start text-left text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Trust Info */}
        <div className="mt-6 p-3 rounded" style={{ background: SITE_CONFIG.theme.accent }}>
          <h4 className="font-bold text-xs mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
            Buyer Protection
          </h4>
          <ul className="text-xs space-y-1" style={{ color: SITE_CONFIG.theme.textMuted }}>
            <li>Escrow on all orders</li>
            <li>Verified vendors</li>
            <li>Dispute resolution</li>
            <li>Full refund policy</li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div className="mt-4 p-3 rounded" style={{ background: SITE_CONFIG.theme.accent }}>
          <h4 className="font-bold text-xs mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
            We Accept
          </h4>
          <div className="text-xs space-y-1" style={{ color: SITE_CONFIG.theme.text }}>
            <p>BTC (Bitcoin)</p>
            <p>Visa / Mastercard</p>
            <p>PayPal</p>
            <p>Wire Transfer</p>
          </div>
          <p className="text-xs mt-2" style={{ color: SITE_CONFIG.theme.textMuted }}>
            Yes, really. We are legal.
          </p>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
            {selectedCategory} ({products.length} listings)
          </h2>
          <select
            className="px-2 py-1 rounded text-xs"
            style={{
              background: SITE_CONFIG.theme.background,
              border: `1px solid ${SITE_CONFIG.theme.border}`,
              color: SITE_CONFIG.theme.text,
            }}
          >
            <option>Sort: Most Popular</option>
            <option>Sort: Price Low-High</option>
            <option>Sort: Price High-Low</option>
            <option>Sort: Trust Score</option>
          </select>
        </div>

        <div className="space-y-3">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              onVendorClick={() => onVendorClick(product.vendor)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Product Card
// ============================================================================

interface ProductCardProps {
  product: Product
  onClick: () => void
  onVendorClick: () => void
}

function ProductCard({ product, onClick, onVendorClick }: ProductCardProps) {
  return (
    <StyledCard
      bgColor={SITE_CONFIG.theme.surface}
      borderColor={SITE_CONFIG.theme.border}
      borderRadius="sm"
      padding="md"
      className="flex gap-4"
    >
      {/* Left: Image placeholder */}
      <div
        className="w-24 h-24 flex items-center justify-center text-3xl rounded shrink-0"
        style={{ background: SITE_CONFIG.theme.accent }}
      >
        {product.vendor.avatar}
      </div>

      {/* Middle: Info */}
      <div className="flex-1 min-w-0">
        <button
          onClick={onClick}
          className="text-left hover:underline"
        >
          <h3 className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
            {product.title}
          </h3>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onVendorClick() }}
          className="flex items-center gap-2 mt-1 hover:underline"
        >
          <span className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
            by {product.vendor.username}
          </span>
          {product.vendor.verified && (
            <span
              className="px-1 py-0.5 rounded text-[10px]"
              style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.trusted }}
            >
              VERIFIED
            </span>
          )}
          <span className="text-xs" style={{ color: SITE_CONFIG.theme.trusted }}>
            Trust: {product.vendor.trustScore}%
          </span>
        </button>

        <p
          className="text-xs mt-2 line-clamp-2"
          style={{ color: SITE_CONFIG.theme.textMuted }}
        >
          {product.description.split('\n')[0]}
        </p>

        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
          <span>{product.sold} sold</span>
          <span>{product.views} views</span>
          <span>{product.reviews.length} reviews</span>
          {product.escrowAvailable && <span style={{ color: SITE_CONFIG.theme.trusted }}>ESCROW</span>}
        </div>
      </div>

      {/* Right: Price and Buy */}
      <div className="text-right shrink-0">
        <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
          ${product.price.toFixed(2)}
        </p>
        <p className="text-xs mb-2" style={{ color: SITE_CONFIG.theme.textMuted }}>
          {product.inStock} in stock
        </p>
        <div className="flex flex-col gap-1">
          {product.btcAccepted && (
            <span className="text-xs" style={{ color: SITE_CONFIG.theme.warning }}>BTC</span>
          )}
          {product.cardAccepted && (
            <span className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>CARD</span>
          )}
        </div>
        <Button
          onClick={onClick}
          variant="outline"
          borderColor={SITE_CONFIG.theme.primary}
          textColor={SITE_CONFIG.theme.primary}
          size="sm"
          className="mt-2"
        >
          View
        </Button>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Product Detail
// ============================================================================

interface ProductDetailProps {
  product: Product
  onBack: () => void
  onVendorClick: () => void
}

function ProductDetail({ product, onBack, onVendorClick }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)

  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        textColor={SITE_CONFIG.theme.primary}
        className="mb-4 text-sm"
      >
        &lt; Back to listings
      </Button>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="w-80 shrink-0">
          {/* Product Image */}
          <StyledCard
            bgColor={SITE_CONFIG.theme.accent}
            borderRadius="sm"
            padding="lg"
            className="aspect-square flex items-center justify-center text-8xl mb-4"
          >
            {product.vendor.avatar}
          </StyledCard>

          {/* Vendor Card */}
          <StyledCard
            onClick={onVendorClick}
            bgColor={SITE_CONFIG.theme.surface}
            borderColor={SITE_CONFIG.theme.border}
            borderRadius="sm"
            padding="md"
            className="cursor-pointer hover:border-green-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{product.vendor.avatar}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                  {product.vendor.username}
                  {product.vendor.verified && ' [VERIFIED]'}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                  <span>Trust: {product.vendor.trustScore}%</span>
                  <span>|</span>
                  <span>{product.vendor.totalSales} sales</span>
                </div>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: SITE_CONFIG.theme.textMuted }}>
              {product.vendor.responseTime}
            </p>
          </StyledCard>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
            {product.title}
          </h1>

          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-3xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm" style={{ color: SITE_CONFIG.theme.textMuted }}>
              {product.inStock} in stock
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.escrowAvailable && (
              <span
                className="px-2 py-1 rounded text-xs"
                style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.trusted }}
              >
                ESCROW AVAILABLE
              </span>
            )}
            {product.btcAccepted && (
              <span
                className="px-2 py-1 rounded text-xs"
                style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.warning }}
              >
                BTC ACCEPTED
              </span>
            )}
            {product.cardAccepted && (
              <span
                className="px-2 py-1 rounded text-xs"
                style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.text }}
              >
                CREDIT CARDS OK
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-bold text-sm mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
              Description
            </h2>
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: SITE_CONFIG.theme.text }}
            >
              {product.description}
            </p>
          </div>

          {/* Shipping */}
          <div className="mb-6">
            <h2 className="font-bold text-sm mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
              Shipping Options
            </h2>
            <ul className="text-sm space-y-1" style={{ color: SITE_CONFIG.theme.textMuted }}>
              {product.shipping.map((option, i) => (
                <li key={i}>- {option}</li>
              ))}
            </ul>
          </div>

          {/* Buy Section */}
          <StyledCard
            bgColor={SITE_CONFIG.theme.accent}
            borderColor={SITE_CONFIG.theme.border}
            borderRadius="sm"
            padding="md"
            className="mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: SITE_CONFIG.theme.text }}>Qty:</span>
                <input
                  type="number"
                  min="1"
                  max={product.inStock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 rounded text-sm text-center"
                  style={{
                    background: SITE_CONFIG.theme.background,
                    border: `1px solid ${SITE_CONFIG.theme.border}`,
                    color: SITE_CONFIG.theme.text,
                  }}
                />
              </div>
              <div className="flex-1 text-right">
                <p className="text-lg font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  Total: ${(product.price * quantity).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="primary"
                backgroundColor={SITE_CONFIG.theme.primary}
                textColor={SITE_CONFIG.theme.background}
                width="full"
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                borderColor={SITE_CONFIG.theme.border}
                textColor={SITE_CONFIG.theme.text}
              >
                Message Vendor
              </Button>
            </div>
          </StyledCard>

          {/* Reviews */}
          <div>
            <h2 className="font-bold text-sm mb-4" style={{ color: SITE_CONFIG.theme.primary }}>
              Reviews ({product.reviews.length})
            </h2>
            <div className="space-y-3">
              {product.reviews.map(review => (
                <StyledCard
                  key={review.id}
                  bgColor={SITE_CONFIG.theme.surface}
                  borderColor={SITE_CONFIG.theme.border}
                  borderRadius="sm"
                  padding="sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: SITE_CONFIG.theme.primary }}>
                        {review.author}
                      </span>
                      {review.verified && (
                        <span
                          className="px-1 py-0.5 rounded text-[10px]"
                          style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.trusted }}
                        >
                          VERIFIED PURCHASE
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                      {review.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <span
                        key={i}
                        style={{ color: i < review.rating ? SITE_CONFIG.theme.warning : SITE_CONFIG.theme.textMuted }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: SITE_CONFIG.theme.text }}>
                    {review.text}
                  </p>
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
// Vendor Profile
// ============================================================================

interface VendorProfileProps {
  vendor: Vendor
  products: Product[]
  onBack: () => void
  onProductClick: (product: Product) => void
}

function VendorProfile({ vendor, products, onBack, onProductClick }: VendorProfileProps) {
  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        textColor={SITE_CONFIG.theme.primary}
        className="mb-4 text-sm"
      >
        &lt; Back
      </Button>

      {/* Vendor Header */}
      <StyledCard
        bgColor={SITE_CONFIG.theme.surface}
        borderColor={SITE_CONFIG.theme.border}
        borderRadius="sm"
        padding="lg"
        className="mb-6"
      >
        <div className="flex items-start gap-6">
          <span className="text-6xl">{vendor.avatar}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                {vendor.username}
              </h1>
              {vendor.verified && (
                <span
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.trusted }}
                >
                  VERIFIED VENDOR
                </span>
              )}
            </div>

            <p className="text-sm mb-4" style={{ color: SITE_CONFIG.theme.text }}>
              {vendor.bio}
            </p>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.trusted }}>
                  {vendor.trustScore}%
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Trust Score</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  {vendor.totalSales}
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Total Sales</p>
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: SITE_CONFIG.theme.primary }}>
                  {vendor.positivePercent}%
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Positive</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                  {vendor.memberSince}
                </p>
                <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>Member Since</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {vendor.specialties.map(spec => (
                <span
                  key={spec}
                  className="px-2 py-1 rounded text-xs"
                  style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.text }}
                >
                  {spec}
                </span>
              ))}
            </div>

            {vendor.pgpKey && (
              <p className="text-xs mt-4" style={{ color: SITE_CONFIG.theme.textMuted }}>
                PGP: {vendor.pgpKey}
              </p>
            )}
          </div>

          <div>
            <Button
              variant="outline"
              borderColor={SITE_CONFIG.theme.primary}
              textColor={SITE_CONFIG.theme.primary}
            >
              Contact Vendor
            </Button>
          </div>
        </div>
      </StyledCard>

      {/* Vendor Listings */}
      <h2 className="text-lg font-bold mb-4" style={{ color: SITE_CONFIG.theme.primary }}>
        Listings ({products.length})
      </h2>
      <div className="space-y-3">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
            onVendorClick={() => {}}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Vendor List
// ============================================================================

interface VendorListProps {
  vendors: Vendor[]
  onVendorClick: (vendor: Vendor) => void
}

function VendorList({ vendors, onVendorClick }: VendorListProps) {
  const sortedVendors = [...vendors].sort((a, b) => b.trustScore - a.trustScore)

  return (
    <div>
      <h2 className="text-lg font-bold mb-6" style={{ color: SITE_CONFIG.theme.primary }}>
        Verified Vendors
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {sortedVendors.map(vendor => (
          <StyledCard
            key={vendor.id}
            onClick={() => onVendorClick(vendor)}
            bgColor={SITE_CONFIG.theme.surface}
            borderColor={SITE_CONFIG.theme.border}
            borderRadius="sm"
            padding="md"
            className="cursor-pointer hover:border-green-500 transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{vendor.avatar}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                    {vendor.username}
                  </h3>
                  {vendor.verified && (
                    <span
                      className="px-1 py-0.5 rounded text-[10px]"
                      style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.trusted }}
                    >
                      VERIFIED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-2 text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                  <span style={{ color: SITE_CONFIG.theme.trusted }}>Trust: {vendor.trustScore}%</span>
                  <span>{vendor.totalSales} sales</span>
                  <span>{vendor.positivePercent}% positive</span>
                </div>

                <p className="text-xs line-clamp-2" style={{ color: SITE_CONFIG.theme.textMuted }}>
                  {vendor.bio}
                </p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {vendor.specialties.slice(0, 2).map(spec => (
                    <span
                      key={spec}
                      className="px-1 py-0.5 rounded text-[10px]"
                      style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.text }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </StyledCard>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Escrow Explainer
// ============================================================================

function EscrowExplainer() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center" style={{ color: SITE_CONFIG.theme.primary }}>
        How Escrow Works
      </h2>

      <StyledCard
        bgColor={SITE_CONFIG.theme.surface}
        borderColor={SITE_CONFIG.theme.border}
        borderRadius="sm"
        padding="lg"
        className="mb-6"
      >
        <p className="text-sm mb-4" style={{ color: SITE_CONFIG.theme.text }}>
          Our escrow system protects both buyers and vendors in every transaction.
          It is a completely standard, legal escrow service. We are not sure why people keep asking if there is something unusual about it.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.primary }}
            >
              1
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                Place Your Order
              </h3>
              <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                Choose your corn silk products and complete checkout. Your payment is held securely in escrow.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.primary }}
            >
              2
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                Vendor Ships Product
              </h3>
              <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                The vendor receives notification and ships your corn silk products with tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.primary }}
            >
              3
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                Receive and Verify
              </h3>
              <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                Check your corn silk for quality. If satisfied, confirm receipt to release payment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: SITE_CONFIG.theme.accent, color: SITE_CONFIG.theme.primary }}
            >
              4
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: SITE_CONFIG.theme.primary }}>
                Leave a Review
              </h3>
              <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
                Share your experience to help other buyers find quality corn silk.
              </p>
            </div>
          </div>
        </div>
      </StyledCard>

      <StyledCard
        bgColor={SITE_CONFIG.theme.accent}
        borderColor={SITE_CONFIG.theme.border}
        borderRadius="sm"
        padding="md"
        className="mb-6"
      >
        <h3 className="font-bold text-sm mb-2" style={{ color: SITE_CONFIG.theme.primary }}>
          Dispute Resolution
        </h3>
        <p className="text-xs" style={{ color: SITE_CONFIG.theme.textMuted }}>
          If there is an issue with your order, our support team will mediate.
          Common disputes include: wrong quantity of silk, silk quality concerns, or shipping delays.
          We have NEVER had a dispute about anything other than corn silk. Stop asking.
        </p>
      </StyledCard>

      <StyledCard
        bgColor={SITE_CONFIG.theme.surface}
        borderColor={SITE_CONFIG.theme.warning}
        borderRadius="sm"
        padding="md"
      >
        <h3 className="font-bold text-sm mb-2" style={{ color: SITE_CONFIG.theme.warning }}>
          Frequently Asked Questions
        </h3>
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-medium" style={{ color: SITE_CONFIG.theme.primary }}>
              Q: Is this legal?
            </p>
            <p style={{ color: SITE_CONFIG.theme.textMuted }}>
              A: YES. It is corn silk. For tea. And crafts. Please stop asking.
            </p>
          </div>
          <div>
            <p className="font-medium" style={{ color: SITE_CONFIG.theme.primary }}>
              Q: Why does your site look like this?
            </p>
            <p style={{ color: SITE_CONFIG.theme.textMuted }}>
              A: Our web designer was really into The Matrix. We apologize for any confusion.
            </p>
          </div>
          <div>
            <p className="font-medium" style={{ color: SITE_CONFIG.theme.primary }}>
              Q: Do you sell anything... else?
            </p>
            <p style={{ color: SITE_CONFIG.theme.textMuted }}>
              A: NO. Just corn silk. We are reporting you to the authorities for asking.
            </p>
          </div>
          <div>
            <p className="font-medium" style={{ color: SITE_CONFIG.theme.primary }}>
              Q: Why Bitcoin?
            </p>
            <p style={{ color: SITE_CONFIG.theme.textMuted }}>
              A: Some customers prefer privacy when purchasing corn silk products.
              We do not judge your tea habits. We also accept Visa.
            </p>
          </div>
        </div>
      </StyledCard>
    </div>
  )
}

export default SilkRoadSite
