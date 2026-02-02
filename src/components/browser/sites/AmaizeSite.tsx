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

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'

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
// Sample Data - Products
// ============================================================================

const PRODUCTS: Product[] = [
  {
    id: 'quantum-coffee-maker',
    title: 'Quantum Coffee Maker Pro 3000 - Molecular Brewing Technology - Observe Your Coffee Into Existence',
    price: 2999.99,
    originalPrice: 3499.99,
    rating: 2.5,
    reviewCount: 847,
    seller: 'QuantumBrew Official',
    sellerVerified: true,
    image: '☕',
    primeEligible: true,
    description: 'Experience coffee at the quantum level. The Q-3000 uses patented Schrodinger Brewing Technology to create coffee that exists in a superposition of all possible flavor profiles until observed. Dr. Elena Martinez certified.',
    features: [
      'Quantum entanglement coils for perfect temperature uniformity',
      '47 kW power requirement (adapter not included)',
      'Observation goggles included (FDA approved)',
      'Compatible with all standard coffee beans',
      '3.7 second brew time (45 minutes observation time)',
      'Certificate of authenticity from Westbrook Institute',
    ],
    reviews: [],
    frequentlyBoughtWith: ['trust-fall-mat', 'floor-13-detector'],
    category: 'Kitchen Appliances',
    inStock: true,
  },
  {
    id: 'trust-fall-mat',
    title: 'Professional Trust Fall Mat - Industrial Grade - Rated for 2,847 Falls',
    price: 84.70,
    rating: 4.2,
    reviewCount: 156,
    seller: 'TrustFallSupplies',
    sellerVerified: false,
    image: '🙆‍♂️',
    primeEligible: true,
    description: 'The official mat used by Trust Fall Tim himself. Whether you\'re practicing trust falls for team building or just falling repeatedly because no one catches you, this mat has your back. Literally.',
    features: [
      'Memory foam construction - remembers every fall',
      'Rated for up to 2,847 consecutive falls',
      'Water-resistant surface (tears roll right off)',
      'Includes motivational poster: "One day, someone will catch you"',
      'Non-slip bottom (unlike your coworkers)',
      'Easy to clean (you\'ll need to)',
    ],
    reviews: [],
    frequentlyBoughtWith: ['quantum-coffee-maker', 'sushi-kit'],
    category: 'Sports & Outdoors',
    inStock: true,
    stockNote: 'Only 8 left in stock - order soon!',
  },
  {
    id: 'floor-13-detector',
    title: 'Floor 13 Detector (Does It Exist?) - Handheld Anomaly Scanner',
    price: 13.13,
    rating: 0,
    reviewCount: 0,
    seller: 'Anonymous',
    sellerVerified: false,
    image: '🔍',
    primeEligible: false,
    description: '[CONTENT REMOVED BY OMNICORP HOLDINGS]\n\nThis device [REDACTED] the presence of [REDACTED] floors in buildings. Perfect for [CONTENT REMOVED]. Battery included but may [REDACTED].\n\nNOTE: Previous owners have [CONTENT REMOVED BY OMNICORP HOLDINGS]',
    features: [
      '[REDACTED]',
      'Detects floor anomalies within [REDACTED] meters',
      'Built-in [CONTENT REMOVED] sensor',
      'Do NOT use near Hartwell Building',
      'Do NOT use on Floor 7',
      '[CONTENT REMOVED BY OMNICORP HOLDINGS]',
    ],
    reviews: [],
    frequentlyBoughtWith: ['omnicorp-badge', 'quantum-coffee-maker'],
    category: 'Tools & Home Improvement',
    inStock: true,
    shipsFrom: 'REDACTED',
  },
  {
    id: 'sushi-kit',
    title: 'Gas Station Sushi Survival Kit - Mildred Approved - As Seen at Flying J #847',
    price: 47.00,
    rating: 5.0,
    reviewCount: 234,
    seller: 'MildredApproved',
    sellerVerified: true,
    image: '🍣',
    primeEligible: true,
    description: 'Everything you need to survive your gas station sushi adventure. Curated by Mildred Gasketsworth, the internet\'s foremost authority on roadside raw fish. Includes her famous 847-point rating guide.',
    features: [
      'Industrial-strength antacids (30 count)',
      'Hospital-grade hand sanitizer (32 oz)',
      'Detailed sushi rating guide by Mildred',
      'Emergency contact card (pre-filled)',
      '"I Survived Flying J Sushi" sticker',
      'Complimentary Pepto-Bismol sample',
    ],
    reviews: [],
    frequentlyBoughtWith: ['trust-fall-mat', 'corn-headphones'],
    category: 'Health & Personal Care',
    inStock: true,
  },
  {
    id: 'corn-headphones',
    title: 'Corn-Canceling Headphones - Block the Frequencies - They Cannot Control What You Cannot Hear',
    price: 847.00,
    rating: 3.8,
    reviewCount: 42,
    seller: 'GrainTruth Official Store',
    sellerVerified: true,
    image: '🎧',
    primeEligible: false,
    description: 'THEY USE CORN FOR MIND CONTROL. These headphones block the corn frequencies that Big Corn uses to influence your thoughts. Does NOT actually cancel noise - that\'s not the point. THE POINT IS THE CORN.',
    features: [
      'Blocks corn frequencies (tested on 847 subjects)',
      'Tin foil lining (premium grade)',
      'Anti-GMO coating on ear cups',
      'Does NOT block regular sound (that\'s a feature)',
      'Comes with 47-page corn conspiracy manual',
      'Battery life: 847 hours (corn-free power)',
    ],
    reviews: [],
    frequentlyBoughtWith: ['floor-13-detector', 'cobcoin-wallet'],
    category: 'Electronics',
    inStock: true,
    stockNote: 'They don\'t want you to buy this',
  },
  {
    id: 'neon-requiem-dvd',
    title: 'Neon Requiem: Final Show (Bootleg DVD) - The Last Performance - Mostly Crying Audio',
    price: 199.99,
    originalPrice: 847.00,
    rating: 4.7,
    reviewCount: 89,
    seller: 'UndergroundMerch',
    sellerVerified: false,
    image: '💿',
    primeEligible: false,
    description: 'The legendary final show of Neon Requiem, recorded on a phone from the back of The Underground. Audio quality is mostly sobbing from the audience. Video is shaky because the camera person was also crying. Historic.',
    features: [
      '2 hours 47 minutes of footage',
      'Audio: 60% music, 40% audience tears',
      'Includes 13 encore attempts before band broke down',
      'Special feature: Mars\'s eulogy for the band',
      'Comes in authentic tear-stained case',
      'Not authorized but honestly pretty good',
    ],
    reviews: [],
    frequentlyBoughtWith: ['quantum-coffee-maker', 'trust-fall-mat'],
    category: 'Movies & Music',
    inStock: true,
    stockNote: 'Limited copies available',
  },
  {
    id: 'cobcoin-wallet',
    title: 'CobCoin Hardware Wallet - Secure Your Worthless Tokens - 99% Off!',
    price: 8.47,
    originalPrice: 847.00,
    rating: 1.2,
    reviewCount: 2847,
    seller: 'CobCoin Official (Definitely Still Operating)',
    sellerVerified: false,
    image: '💰',
    primeEligible: true,
    description: 'Store your CobCoin safely in this hardware wallet! CobCoin is definitely still worth something. The 99% price drop is just a... market correction. Diamond hands! HODL! (Please buy this we have so many)',
    features: [
      'Stores up to 847 million CobCoin',
      'Military-grade encryption (for your $0.003)',
      'Corn-shaped design (our only remaining asset)',
      'Includes recovery seed phrase (you\'ll need it)',
      'Built-in cry button',
      'Free: Worthless NFT of a sad corn',
    ],
    reviews: [],
    frequentlyBoughtWith: ['corn-headphones', 'floor-13-detector'],
    category: 'Electronics',
    inStock: true,
    stockNote: 'Unlimited stock (nobody is buying these)',
  },
  {
    id: 'omnicorp-badge',
    title: 'Omnicorp Holdings Employee Badge (Vintage) - Authentic - Ships in 3-5 Business Days or Years',
    price: '???',
    rating: 0,
    reviewCount: 0,
    seller: 'Anonymous',
    sellerVerified: false,
    image: '🏢',
    primeEligible: false,
    description: 'Authentic employee badge from Omnicorp Holdings, circa [YEAR REDACTED]. Badge grants access to floors 1-12 and 14+. We do not discuss Floor 13. Previous owner disappeared under normal circumstances.',
    features: [
      'Authentic Omnicorp Holdings branding',
      'Works on all floors (except one)',
      'Previous owner: [REDACTED]',
      'Slight static charge (normal)',
      'Sometimes vibrates near mirrors',
      'Price varies based on observation',
    ],
    reviews: [],
    frequentlyBoughtWith: ['floor-13-detector', 'corn-headphones'],
    category: 'Collectibles',
    inStock: true,
    shipsFrom: 'Shipping time depends on which floor you\'re on',
  },
]

// ============================================================================
// Sample Data - Reviews
// ============================================================================

const QUANTUM_COFFEE_REVIEWS: Review[] = [
  { id: 'qc1', author: 'Derek_Quantum_Coffee', rating: 5, title: 'CHANGED MY LIFE!!! BEST PURCHASE EVER!!!', content: 'This coffee maker is the best thing that has ever happened to me. Every morning I observe my coffee into existence and it tastes like possibility. Jennifer doesn\'t understand but that\'s okay. The kids might understand when they\'re older. Worth every penny of the $2,999.99.', date: '847 days ago', verified: true, helpful: 847, unhelpful: 2 },
  { id: 'qc2', author: 'Derek_QuantumEnthusiast', rating: 5, title: 'REVOLUTIONARY BREWING TECHNOLOGY', content: 'I have been waiting my whole life for this. The quantum entanglement coils work exactly as described. My roommate thinks I\'m crazy but he hasn\'t OBSERVED the coffee. He wouldn\'t understand.', date: '846 days ago', verified: true, helpful: 42, unhelpful: 15 },
  { id: 'qc3', author: 'QuantumDerek_Fan', rating: 5, title: 'Better than traditional coffee in every way', content: 'The superposition of flavors is unmatched. I\'ve bought 3 of these for different rooms. My credit card company called to check on me. I told them about quantum coffee. They hung up.', date: '845 days ago', verified: true, helpful: 31, unhelpful: 22 },
  { id: 'qc4', author: 'JennifersDivorceLawyer', rating: 1, title: 'DO NOT BUY - Ruined my client\'s marriage', content: 'My client\'s husband spent $47,000 on quantum coffee equipment over 2 years. This was Exhibit A in the divorce proceedings. The children cried in court. He brought a thermos of "quantum espresso" to the custody hearing.', date: '3 months ago', verified: false, helpful: 1247, unhelpful: 847 },
  { id: 'qc5', author: 'Jennifer_Verified', rating: 1, title: 'Returning this was the best decision of my divorce', content: 'Derek, if you\'re reading this: I took the kids, the dog, and returned the third Q-3000 you bought. The refund helped pay for therapy. For me. And the children. Stop leaving quantum coffee reviews under fake accounts. We know it\'s you.', date: '2 months ago', verified: true, helpful: 2847, unhelpful: 47 },
  { id: 'qc6', author: 'Derek_NotDerek', rating: 5, title: 'Definitely not Derek but this product is amazing', content: 'I am a completely different person and also this coffee maker is perfect. The observation goggles fit my head exactly like Derek\'s head. Which I wouldn\'t know about. Because I\'m not Derek.', date: '1 month ago', verified: true, helpful: 3, unhelpful: 847 },
]

const TRUST_FALL_REVIEWS: Review[] = [
  { id: 'tf1', author: 'TrustFallTim', rating: 5, title: 'My side hustle is finally paying off', content: 'After 2,847 trust falls and exactly 0 catches, I decided to monetize my expertise. This mat is rated for exactly that many falls because I tested it myself. Every. Single. One. My back thanks this mat.', date: '6 months ago', verified: true, helpful: 456, unhelpful: 0 },
  { id: 'tf2', author: 'SmallKevin_HR', rating: 2, title: 'Mat worked but Small Kevin still missed', content: 'We bought this for our team building exercise. Tim fell. Small Kevin was supposed to catch him. Small Kevin stepped aside. Tim hit the mat. The mat worked perfectly. Our team, however, did not.', date: '3 months ago', verified: true, helpful: 234, unhelpful: 12 },
  { id: 'tf3', author: 'Mars_Underground', rating: 5, title: 'We use these at The Underground now', content: 'After Tim\'s 47th trust fall at the venue, we invested in these mats. Now he can fall as much as he wants without worrying about the concrete. The crying is still audible though.', date: '2 months ago', verified: true, helpful: 189, unhelpful: 3 },
]

const SUSHI_KIT_REVIEWS: Review[] = [
  { id: 'sk1', author: 'MildredGasketsworth', rating: 5, title: 'I curated this kit personally', content: 'After reviewing 847 gas stations and their sushi offerings, I know exactly what you need to survive. This kit has saved countless lives. The hand sanitizer alone is worth the price.', date: '4 months ago', verified: true, helpful: 567, unhelpful: 2 },
  { id: 'sk2', author: 'FlyingJ_Survivor', rating: 5, title: 'Used this at Flying J #847 - I\'m still alive', content: 'Mildred knows what she\'s talking about. The sushi looked questionable (her rating: 2.3/10) but I ate it anyway. The kit got me through the next 48 hours. The sticker was a nice touch.', date: '2 months ago', verified: true, helpful: 345, unhelpful: 1 },
]

const CORN_HEADPHONES_REVIEWS: Review[] = [
  { id: 'ch1', author: 'GrainTruth_Admin', rating: 5, title: 'FINALLY someone understands', content: 'We have been warning people about corn frequencies for YEARS. These headphones WORK. I can feel the difference. The corn cannot reach me now. BIG CORN IS FURIOUS.', date: '1 month ago', verified: true, helpful: 42, unhelpful: 847 },
  { id: 'ch2', author: 'ConcernedCitizen847', rating: 5, title: 'The corn frequencies have stopped', content: 'Before these headphones I could hear the corn. The rustling. The whispers. Now? Silence. Beautiful, corn-free silence. (Note: I can still hear everything else which is apparently "normal")' , date: '3 weeks ago', verified: false, helpful: 23, unhelpful: 156 },
  { id: 'ch3', author: 'Skeptical_But_Scared', rating: 4, title: 'I bought these as a joke but now I\'m worried', content: 'I was going to return these until I read the 47-page manual. Now I\'m not sure about anything. What IS corn? Why does it grow in rows? Who decided that? I need to lie down.', date: '1 week ago', verified: true, helpful: 89, unhelpful: 34 },
]

const COBCOIN_REVIEWS: Review[] = [
  { id: 'cc1', author: 'DiamondHands_2021', rating: 1, title: 'I lost everything', content: 'Put my life savings into CobCoin at $847 per token. Now it\'s worth $0.003. This wallet reminds me of my failures every day. At least the corn shape is cute.', date: '2 years ago', verified: true, helpful: 2847, unhelpful: 3 },
  { id: 'cc2', author: 'StillHodling', rating: 5, title: 'TO THE MOON (eventually)', content: 'CobCoin WILL recover. The devs are definitely still working on it. I checked the Discord and... okay the Discord is gone. But my wallet still works! That\'s something!', date: '1 year ago', verified: false, helpful: 12, unhelpful: 847 },
  { id: 'cc3', author: 'CobCoinCEO_NotRunning', rating: 5, title: 'Great wallet, great coin, I am not the CEO', content: 'This wallet is excellent for storing CobCoin which is definitely still a viable investment. I am a regular customer and not at all the CEO who is definitely not in a non-extradition country.', date: '8 months ago', verified: false, helpful: 2, unhelpful: 1247 },
]

const NEON_REQUIEM_REVIEWS: Review[] = [
  { id: 'nr1', author: 'Mars_Underground', rating: 5, title: 'This is unauthorized but honestly it\'s pretty good', content: 'Look, I should probably take legal action but... they captured something real here. The crying. The desperation. The 13 encore attempts. It\'s art. Buy it.', date: '5 months ago', verified: true, helpful: 456, unhelpful: 0 },
  { id: 'nr2', author: 'VelvetAlgorithms_Fan', rating: 4, title: 'Audio quality: tears. Video quality: also tears.', content: 'You can\'t see much because everyone was crying. You can\'t hear much because everyone was crying. But you can FEEL everything. That\'s what Neon Requiem was about.', date: '4 months ago', verified: true, helpful: 234, unhelpful: 5 },
]

// Assign reviews to products
PRODUCTS[0].reviews = QUANTUM_COFFEE_REVIEWS
PRODUCTS[1].reviews = TRUST_FALL_REVIEWS
PRODUCTS[3].reviews = SUSHI_KIT_REVIEWS
PRODUCTS[4].reviews = CORN_HEADPHONES_REVIEWS
PRODUCTS[5].reviews = NEON_REQUIEM_REVIEWS
PRODUCTS[6].reviews = COBCOIN_REVIEWS

// ============================================================================
// Sample Data - Sellers
// ============================================================================

const SELLERS: Seller[] = [
  {
    id: 'quantumbrew',
    name: 'QuantumBrew Official',
    avatar: '☕',
    rating: 4.2,
    reviewCount: 1247,
    memberSince: 'January 2019',
    description: 'Official retailer of QuantumBrew products. Dr. Martinez approved. We believe coffee should exist in a superposition of all possible states. Our customer service is also in a superposition of helpful and unhelpful until observed.',
    shipsFrom: 'Westbrook Institute, California',
    responseTime: 'Usually within 47 minutes',
    products: ['quantum-coffee-maker'],
  },
  {
    id: 'trustfallsupplies',
    name: 'TrustFallSupplies',
    avatar: '🙆‍♂️',
    rating: 4.8,
    reviewCount: 456,
    memberSince: 'March 2023',
    description: 'Hi, I\'m Tim. You might know me from The Underground or various parking lots around town. After 2,847 falls and 0 catches, I realized I should sell the equipment instead of just using it. Every product tested personally.',
    shipsFrom: 'Wherever I fall next',
    responseTime: 'I respond to every message (someone please respond back)',
    products: ['trust-fall-mat'],
  },
  {
    id: 'mildredapproved',
    name: 'MildredApproved',
    avatar: '🍣',
    rating: 4.9,
    reviewCount: 847,
    memberSince: 'August 2021',
    description: 'Mildred Gasketsworth here. 847 gas stations. 2,341 sushi samples. One iron stomach. Everything I sell has been personally tested in the field. If I survived it, you can too.',
    shipsFrom: 'Currently at Flying J #524, heading east',
    responseTime: 'Depends on gas station WiFi',
    products: ['sushi-kit'],
  },
  {
    id: 'graintruth',
    name: 'GrainTruth Official Store',
    avatar: '🌽',
    rating: 3.2,
    reviewCount: 42,
    memberSince: 'The Beginning',
    description: 'WE KNOW THE TRUTH ABOUT CORN. Big Corn has infiltrated every level of society. Our products help you RESIST. Do not trust corn. Do not trust those who grow corn. Trust only us.',
    shipsFrom: 'Underground bunker (location classified)',
    responseTime: 'We\'re always watching our messages',
    products: ['corn-headphones'],
  },
  {
    id: 'undergroundmerch',
    name: 'UndergroundMerch',
    avatar: '🎸',
    rating: 4.5,
    reviewCount: 234,
    memberSince: 'December 2015',
    description: 'Unofficial merch from The Underground. Mars knows about us and is cool with it (mostly). Bootlegs, rare recordings, band memorabilia. All sales support the local music scene.',
    shipsFrom: 'The Underground, Downtown',
    responseTime: 'Usually same day unless there\'s a show',
    products: ['neon-requiem-dvd'],
  },
]

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

function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

function getSellerByName(name: string): Seller | undefined {
  return SELLERS.find(s => s.name === name)
}

function getSellerById(id: string): Seller | undefined {
  return SELLERS.find(s => s.id === id)
}

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
 * Find a category by its slug.
 * Converts "kitchen-appliances" back to "Kitchen Appliances"
 */
function findCategoryBySlug(slug: string): string | null {
  const normalized = slug.toLowerCase()
  return CATEGORIES.find(cat => slugifyCategory(cat) === normalized) || null
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
  onBack: () => void
  onSellerClick: (seller: Seller) => void
  onProductClick: (product: Product) => void
}

function ProductDetail({ product, onBack, onSellerClick, onProductClick }: ProductDetailProps) {
  const [selectedReviewSort, setSelectedReviewSort] = useState<'helpful' | 'recent'>('helpful')
  const seller = getSellerByName(product.seller)

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
              const related = getProductById(id)
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
          {PRODUCTS.filter(p => p.id !== product.id).slice(0, 6).map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onProductClick(p)} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface SellerProfileProps {
  seller: Seller
  onBack: () => void
  onProductClick: (product: Product) => void
}

function SellerProfile({ seller, onBack, onProductClick }: SellerProfileProps) {
  const sellerProducts = PRODUCTS.filter(p => p.seller === seller.name)

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

const CATEGORIES = [
  'All',
  'Kitchen Appliances',
  'Sports & Outdoors',
  'Electronics',
  'Health & Personal Care',
  'Movies & Music',
  'Tools & Home Improvement',
  'Collectibles',
]

export function AmaizeSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Parse the current route to determine what view to show
  const route = useMemo(() => parseRoute(path), [path])

  // Find the selected product/seller based on the route
  const selectedProduct = useMemo(() => {
    if (route.view !== 'product' || !route.id) return null
    return getProductById(route.id) || null
  }, [route.view, route.id])

  const selectedSeller = useMemo(() => {
    if (route.view !== 'seller' || !route.id) return null
    return getSellerById(route.id) || null
  }, [route.view, route.id])

  // Category from URL or default to 'All'
  const selectedCategory = useMemo(() => {
    if (route.view === 'category' && route.id) {
      return findCategoryBySlug(route.id) || 'All'
    }
    return 'All'
  }, [route.view, route.id])

  // Local UI state (not URL-based)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = PRODUCTS.filter(p => {
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
                  {CATEGORIES.slice(1).map(cat => (
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
            onBack={handleBack}
            onProductClick={handleProductClick}
          />
        ) : selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
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
                {PRODUCTS.filter(p => p.originalPrice).slice(0, 4).map(product => (
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
                    {CATEGORIES.map(cat => (
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
                  {PRODUCTS.slice(0, 6).map(product => (
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
