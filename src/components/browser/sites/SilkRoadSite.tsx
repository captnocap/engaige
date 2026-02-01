/**
 * SilkRoad Site - www.silkroad.corn
 *
 * A parody of dark web marketplaces that is actually a completely legitimate
 * corn silk products store. It looks sketchy but only sells tea, supplements,
 * and crafts made from corn silk.
 *
 * The joke: Dark web aesthetics, shady language, but 100% legal corn silk.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'

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

// ============================================================================
// Sample Data - Vendors
// ============================================================================

const VENDORS: Vendor[] = [
  {
    id: 'v1',
    username: 'CornSilkKing',
    avatar: '👑',
    trustScore: 100,
    totalSales: 847,
    positivePercent: 100,
    verified: true,
    memberSince: 'January 2019',
    pgpKey: 'Available upon request',
    bio: 'The ORIGINAL corn silk distributor. Been in this game since before it was cool. All product is locally sourced from verified organic farms. No middlemen. No questions.',
    specialties: ['Premium Tea Grade', 'Bulk Orders', 'Express Shipping'],
    responseTime: 'Usually within 4 hours',
  },
  {
    id: 'v2',
    username: 'NaturalRemedies847',
    avatar: '🔬',
    trustScore: 98,
    totalSales: 423,
    positivePercent: 99,
    verified: true,
    memberSince: 'March 2020',
    pgpKey: 'In profile',
    bio: 'Pharmaceutical-grade corn silk products. Lab tested. Certificate of analysis available for ALL batches. My doctor wife helps with quality control.',
    specialties: ['Medical Grade', 'Lab Tested', 'Supplements'],
    responseTime: 'Usually within 2 hours',
  },
  {
    id: 'v3',
    username: 'CornArtisan',
    avatar: '🎨',
    trustScore: 95,
    totalSales: 156,
    positivePercent: 97,
    verified: true,
    memberSince: 'June 2021',
    pgpKey: 'Not needed for craft supplies lol',
    bio: 'Craft-grade corn silk for your artistic needs. My whole family is involved in the operation. We process it ourselves in our converted barn.',
    specialties: ['Craft Grade', 'Bulk Quantities', 'Custom Orders'],
    responseTime: 'Within 24 hours',
  },
  {
    id: 'v4',
    username: 'quantum_brew_derek',
    avatar: '☕',
    trustScore: 47,
    totalSales: 1,
    positivePercent: 0,
    verified: false,
    memberSince: 'December 2024',
    bio: 'I have discovered something INCREDIBLE. Corn silk that has been exposed to quantum observation during growth. It pairs PERFECTLY with quantum coffee. The wave functions align. You would not understand unless you tried it.',
    specialties: ['Experimental', 'Quantum-Enhanced', 'Coffee Adjacent'],
    responseTime: 'IMMEDIATELY (always online)',
  },
  {
    id: 'v5',
    username: 'Anonymous',
    avatar: '?',
    trustScore: 13,
    totalSales: 13,
    positivePercent: 78,
    verified: false,
    memberSince: 'Unknown',
    bio: 'I grow corn silk in the Hartwell Building courtyard. The plants there are... different. Sometimes the silk changes color. Do not ask questions.',
    specialties: ['Hartwell Sourced', 'Temporal Anomalies', 'Limited Availability'],
    responseTime: 'Unpredictable',
  },
  {
    id: 'v6',
    username: 'TrustFallTim_Official',
    avatar: '🙆',
    trustScore: 78,
    totalSales: 284,
    positivePercent: 78.5,
    verified: true,
    memberSince: 'September 2022',
    bio: 'After my 2,847th trust fall, I realized I needed a recovery routine. Corn silk tea became my secret weapon. Now I share it with fellow fallers. 78.5% satisfaction guaranteed.',
    specialties: ['Recovery Blends', 'Soothing Teas', 'Neck Support Accessories'],
    responseTime: 'After I get up off the floor',
  },
]

// ============================================================================
// Sample Data - Products
// ============================================================================

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Pure Uncut Silk',
    price: 4.20,
    category: 'Raw Materials',
    vendor: VENDORS[0],
    description: `Straight from the cob. No additives. 100% pure.

This is the GOOD stuff. Premium corn silk, carefully harvested at peak potency. Each strand is individually inspected for quality.

What you get:
- 50g of pure, unprocessed corn silk
- Vacuum sealed for freshness
- Discrete packaging (plain brown bag)

Perfect for making your own tea blends or just enjoying the natural way. First timers should start slow - this is POTENT quality silk.

The Martinez Study showed that proper corn silk preparation can enhance the experience significantly. I follow those protocols.

No cutting agents. No filler. Just silk.`,
    shipping: ['Domestic (2-3 days)', 'International (5-7 days)'],
    escrowAvailable: true,
    btcAccepted: true,
    cardAccepted: true,
    inStock: 847,
    sold: 1247,
    views: 8472,
    reviews: [
      { id: 'r1', author: 'TeaLover2024', rating: 5, text: 'This stuff changed my life. My mornings are completely different now.', timestamp: '2 days ago', verified: true },
      { id: 'r2', author: 'HerbalistHank', rating: 5, text: 'Highest quality silk I have ever sourced. The King delivers.', timestamp: '1 week ago', verified: true },
      { id: 'r3', author: 'FirstTimer', rating: 5, text: 'Was nervous to order but the tea is INCREDIBLE. Will buy again.', timestamp: '2 weeks ago', verified: true },
    ],
  },
  {
    id: 'p2',
    title: 'The Good Stuff - Medical Grade',
    price: 8.47,
    category: 'Supplements',
    vendor: VENDORS[1],
    description: `Pharmaceutical quality. Lab tested. Certificate included.

This is medical-grade corn silk, processed in a certified facility. Every batch tested for purity and potency.

Specifications:
- 60 capsules per bottle
- 500mg corn silk extract per capsule
- Third-party lab tested
- Certificate of Analysis included

My doctor asked where I got this. He was impressed with the quality and now recommends it to patients who are into natural remedies.

For maximum effect, take with plenty of water. The diuretic properties are REAL.

NOT FOR RESALE. Personal use quantities only.`,
    shipping: ['Priority Domestic (1-2 days)', 'International Tracked (4-6 days)'],
    escrowAvailable: true,
    btcAccepted: true,
    cardAccepted: true,
    inStock: 234,
    sold: 567,
    views: 4523,
    reviews: [
      { id: 'r4', author: 'WellnessWarrior', rating: 5, text: 'My doctor asked where I got this. Best supplement I have ever taken.', timestamp: '3 days ago', verified: true },
      { id: 'r5', author: 'NaturalNancy', rating: 5, text: 'Lab results speak for themselves. This is the real deal.', timestamp: '1 week ago', verified: true },
      { id: 'r6', author: 'SkepticalSteve', rating: 4, text: 'Actually works as advertised. Surprised but pleased.', timestamp: '3 weeks ago', verified: true },
    ],
  },
  {
    id: 'p3',
    title: 'Craft Supply - Bulk',
    price: 47.00,
    category: 'Bulk Orders',
    vendor: VENDORS[2],
    description: `5 lbs of premium craft-grade corn silk. Perfect for your creative needs.

Whether you are making cornhusk dolls, natural textiles, or experimental art projects, this is your source.

Package includes:
- 5 lbs of cleaned, dried corn silk
- Mixed colors (natural golden to pale white)
- Sorted for craft use
- Storage bag included

We run a family operation. My whole family is involved now - even grandma helps with the sorting. Once you start working with corn silk, you cannot stop. It is addictive (the craft, not the silk. The silk is perfectly legal.)

Perfect for:
- Doll making
- Textile arts
- Natural dyes
- Educational projects
- Basket weaving accents`,
    shipping: ['Ground Shipping (3-5 days)', 'Freight for large orders'],
    escrowAvailable: true,
    btcAccepted: true,
    cardAccepted: true,
    inStock: 45,
    sold: 89,
    views: 1234,
    reviews: [
      { id: 'r7', author: 'CraftMom2023', rating: 5, text: 'My whole family is involved now. The kids love making dolls.', timestamp: '4 days ago', verified: true },
      { id: 'r8', author: 'ArtTeacher', rating: 5, text: 'Great for classroom projects. Students cannot get enough.', timestamp: '2 weeks ago', verified: true },
      { id: 'r9', author: 'EtsySeller', rating: 5, text: 'Quality supply for my business. Very consistent.', timestamp: '1 month ago', verified: true },
    ],
  },
  {
    id: 'p4',
    title: "Derek's Private Reserve",
    price: 847.00,
    category: 'Experimental',
    vendor: VENDORS[3],
    description: `Quantum-entangled corn silk. Allegedly.

LISTEN. I know what you are thinking. But this is DIFFERENT.

These corn plants were grown in a greenhouse where I played recordings of quantum physics lectures 24/7. I observed them daily using quantum observation techniques learned from Dr. Martinez herself (well, her YouTube videos).

The silk has been MEASURED. The wave functions have COLLAPSED in a specific way that creates unique molecular alignments.

Pairs EXCEPTIONALLY well with quantum coffee. If you do not have access to quantum coffee, DO NOT BUY THIS. You will not understand the experience.

Warning: My one reviewer said it "tasted like regular corn silk tea" but they clearly did not prepare it correctly. The observation matters.

Only 1 available because I keep drinking the rest.`,
    shipping: ['Hand Delivered (if you live near me)', 'Quantum Shipping (do not ask)'],
    escrowAvailable: false,
    btcAccepted: true,
    cardAccepted: false,
    inStock: 1,
    sold: 1,
    views: 847,
    reviews: [
      { id: 'r10', author: 'Disappointed_Buyer', rating: 1, text: 'Tasted like regular corn silk tea. Derek refunded me after a 3-hour lecture about observation technique.', timestamp: '1 month ago', verified: true },
    ],
  },
  {
    id: 'p5',
    title: 'Hartwell Building Courtyard Harvest',
    price: 13.00,
    category: 'Specialty',
    vendor: VENDORS[4],
    description: `Corn silk from plants that grow in the Hartwell Building courtyard.

I cannot tell you much. The less you know, the better.

What I CAN tell you:
- The corn grows faster in that courtyard than anywhere else
- Sometimes the silk changes color when no one is looking
- It has a unique taste that is hard to describe
- The plants always face Floor 7

May contain temporal anomalies. I am not sure what that means but the silk sometimes arrives before I ship it.

ONLY ships to floors that exist. If your building has a 13th floor, I will need additional verification.

Limited availability. The security guards at Hartwell have started watching me.

DO NOT RESELL. I will know.`,
    shipping: ['Discrete Delivery (variable timing)', 'Cannot ship to Floor 7'],
    escrowAvailable: true,
    btcAccepted: true,
    cardAccepted: false,
    inStock: 13,
    sold: 7,
    views: 1313,
    reviews: [
      { id: 'r11', author: 'CuriousCat', rating: 4, text: 'Package arrived 3 minutes before I ordered. Good tea though.', timestamp: '??? ago', verified: false },
      { id: 'r12', author: 'HartwellWatcher', rating: 5, text: 'Finally someone gets it. The courtyard corn is SPECIAL.', timestamp: '1 week ago', verified: true },
    ],
  },
  {
    id: 'p6',
    title: 'Trust Fall Recovery Blend',
    price: 7.85,
    category: 'Specialty Blends',
    vendor: VENDORS[5],
    description: `Soothing tea for after impact. 78.5% of customers feel better.

After 2,847 trust falls (successful or not), I have perfected the ideal recovery blend.

What is in it:
- Premium corn silk (calming properties)
- Chamomile (for the emotional trauma)
- Ginger (for the physical trauma)
- A secret ingredient (it is more corn silk)

Each package includes:
- 20 tea bags of the recovery blend
- FREE neck support pillow (while supplies last)
- Trust fall safety guide
- My autograph

The 78.5% satisfaction rate matches my catch rate. Coincidence? I think not.

Recommended usage: Immediately after any trust exercise, job interview, first date, or visit to The Underground.

As Mars from The Underground says: "One day, Tim. One day." Until that day, we have tea.`,
    shipping: ['Standard (2-4 days)', 'Express (1 day - for urgent recovery needs)'],
    escrowAvailable: true,
    btcAccepted: true,
    cardAccepted: true,
    inStock: 284,
    sold: 2847,
    views: 7850,
    reviews: [
      { id: 'r13', author: 'FellAndSurvived', rating: 5, text: 'After my team building exercise, this tea was exactly what I needed.', timestamp: '1 day ago', verified: true },
      { id: 'r14', author: 'BackPainBob', rating: 4, text: 'The pillow is surprisingly good quality. Tea is nice too.', timestamp: '3 days ago', verified: true },
      { id: 'r15', author: 'TrustNoOne', rating: 5, text: '78.5% of the time, it works every time.', timestamp: '1 week ago', verified: true },
    ],
  },
]

const CATEGORIES = ['All Products', 'Raw Materials', 'Supplements', 'Bulk Orders', 'Specialty', 'Specialty Blends', 'Experimental']

// ============================================================================
// Main Component
// ============================================================================

export function SilkRoadSite({ onNavigate }: SiteProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showEscrowModal, setShowEscrowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'market' | 'vendors' | 'escrow'>('market')

  const filteredProducts = selectedCategory === 'All Products'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedCategory)

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
            products={PRODUCTS.filter(p => p.vendor.id === selectedVendor.id)}
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
