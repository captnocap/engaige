/**
 * OnlyFans Site
 *
 * It's literally just a fan store. Ceiling fans. Desk fans. Box fans.
 * Nothing else. Why, what were YOU thinking?
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.onlyfans

// ============================================================================
// Types
// ============================================================================

interface Fan {
  id: string
  name: string
  type: 'ceiling' | 'desk' | 'tower' | 'box' | 'pedestal' | 'handheld' | 'industrial' | 'vintage' | 'smart'
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  emoji: string
  description: string
  features: string[]
  inStock: boolean
  isHot?: boolean
  isExclusive?: boolean
  cfm?: number // Cubic Feet per Minute - the REAL metric
  bladeCount?: number
  noiseLevel?: string
}

interface Review {
  author: string
  rating: number
  text: string
  verified: boolean
  helpfulCount: number
}

// ============================================================================
// Sample Data
// ============================================================================

const FANS: Fan[] = [
  {
    id: 'classic-ceiling-52',
    name: 'The Classic 52" Ceiling Fan',
    type: 'ceiling',
    price: 189.99,
    originalPrice: 249.99,
    rating: 4.8,
    reviews: 2847,
    emoji: '🌀',
    description: 'Our most popular ceiling fan. Whisper-quiet motor, reversible blades, and a pull chain that actually works. Revolutionary.',
    features: ['52" blade span', '3-speed pull chain', 'Reversible motor', 'Includes light kit', '10-year warranty'],
    inStock: true,
    isHot: true,
    cfm: 5200,
    bladeCount: 5,
    noiseLevel: 'Whisper quiet',
  },
  {
    id: 'usb-desk-fan',
    name: 'USB Desktop Breeze Machine',
    type: 'desk',
    price: 24.99,
    rating: 4.5,
    reviews: 1293,
    emoji: '💨',
    description: 'Perfect for your desk at work. Plugs into USB. Your coworkers will be jealous of your personal breeze.',
    features: ['USB powered', '2 speeds', '360° rotation', 'Near-silent operation', 'Cute AND functional'],
    inStock: true,
    cfm: 150,
    bladeCount: 3,
    noiseLevel: 'Library quiet',
  },
  {
    id: 'tower-fan-elite',
    name: 'Tower Fan Elite 9000',
    type: 'tower',
    price: 149.99,
    rating: 4.7,
    reviews: 892,
    emoji: '🗼',
    description: 'Sleek. Modern. Powerful. This tower fan doesn\'t just move air - it makes a statement about who you are as a person.',
    features: ['42" tall', '12 speed settings', 'Remote control', 'Sleep timer', 'Bladeless design', 'LED display'],
    inStock: true,
    isExclusive: true,
    cfm: 800,
    noiseLevel: 'Gentle hum',
  },
  {
    id: 'box-fan-og',
    name: 'The OG Box Fan',
    type: 'box',
    price: 29.99,
    rating: 4.9,
    reviews: 5621,
    emoji: '📦',
    description: 'The fan your grandma had. The fan your parents had. The fan YOU need. No frills, just legendary airflow. Fits perfectly in windows.',
    features: ['20" blade', '3 speeds', 'Window-ready', 'Stackable for storage', 'Built to last forever'],
    inStock: true,
    isHot: true,
    cfm: 2500,
    bladeCount: 5,
    noiseLevel: 'White noise perfection',
  },
  {
    id: 'pedestal-pro',
    name: 'Pedestal Pro Oscillator',
    type: 'pedestal',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviews: 743,
    emoji: '🎯',
    description: 'Adjustable height. Oscillating head. The fan that follows you around the room (not literally, that would be creepy).',
    features: ['Adjustable height 36"-54"', '90° oscillation', '3 speeds', 'Tilt-adjustable head', 'Weighted base'],
    inStock: true,
    cfm: 1800,
    bladeCount: 3,
    noiseLevel: 'Moderate',
  },
  {
    id: 'handheld-emergency',
    name: 'Pocket Emergency Breeze',
    type: 'handheld',
    price: 12.99,
    rating: 4.3,
    reviews: 3291,
    emoji: '✋',
    description: 'For when you NEED air and you need it NOW. Fits in your pocket. Battery powered. Has saved countless lives (citation needed).',
    features: ['Battery powered', 'Foldable design', 'Lanyard included', '3 colors available', 'Great for concerts'],
    inStock: true,
    cfm: 50,
    bladeCount: 2,
    noiseLevel: 'Cute little whir',
  },
  {
    id: 'industrial-beast',
    name: 'INDUSTRIAL BEAST 3000',
    type: 'industrial',
    price: 449.99,
    rating: 4.9,
    reviews: 234,
    emoji: '🏭',
    description: 'THIS IS NOT A NORMAL FAN. This is for warehouses, gyms, and people who take airflow VERY seriously. Will move small objects.',
    features: ['36" diameter', 'ALL METAL construction', '9500 CFM', '3-phase motor', 'OSHA compliant', 'May cause papers to fly'],
    inStock: true,
    isExclusive: true,
    cfm: 9500,
    bladeCount: 3,
    noiseLevel: 'You\'ll know it\'s on',
  },
  {
    id: 'vintage-art-deco',
    name: 'Art Deco Revival (1920s Replica)',
    type: 'vintage',
    price: 299.99,
    rating: 4.8,
    reviews: 127,
    emoji: '🎭',
    description: 'A faithful reproduction of a 1920s oscillating desk fan. Brass finish. Works like it\'s from the future of the past.',
    features: ['Solid brass construction', 'Cloth cord', 'Authentic design', '2 speeds', 'Conversation starter'],
    inStock: false,
    cfm: 400,
    bladeCount: 4,
    noiseLevel: 'Gentle vintage hum',
  },
  {
    id: 'smart-fan-quantum',
    name: 'SmartBreeze AI Quantum Edition',
    type: 'smart',
    price: 349.99,
    rating: 4.4,
    reviews: 456,
    emoji: '🤖',
    description: 'WiFi-enabled. App-controlled. Learns your preferences. Connects to your smart home. It\'s just a fan but SMART.',
    features: ['WiFi + Bluetooth', 'Voice control (Alexa/Google)', 'Temperature sensor', 'Auto-adjust mode', 'Energy monitoring', 'OTA updates'],
    inStock: true,
    cfm: 1200,
    bladeCount: 7,
    noiseLevel: 'AI-optimized quiet',
  },
  {
    id: 'quantum-coffee-collab',
    name: 'Quantum Coffee × OnlyFans Collab',
    type: 'desk',
    price: 89.99,
    rating: 4.7,
    reviews: 42,
    emoji: '☕💨',
    description: 'LIMITED EDITION: A desk fan that exists in multiple airflow states simultaneously until you observe it. Cools your quantum coffee perfectly.',
    features: ['Superposition mode', 'Schrödinger speed settings', 'Observation-activated', 'Comes with coffee stickers', 'Derek approved'],
    inStock: true,
    isExclusive: true,
    isHot: true,
    cfm: 200,
    bladeCount: 3,
    noiseLevel: 'Uncertain',
  },
]

const SAMPLE_REVIEWS: Review[] = [
  { author: 'CoolBreezeLover', rating: 5, text: 'Finally, a website dedicated to what REALLY matters. The OG Box Fan changed my life.', verified: true, helpfulCount: 847 },
  { author: 'SummerSurvivor2024', rating: 5, text: 'I came here expecting something else but honestly? I needed a ceiling fan anyway. Great selection!', verified: true, helpfulCount: 1293 },
  { author: 'AirflowEnthusiast', rating: 5, text: 'The CFM ratings are accurate. I measured. This is the only fan site you need.', verified: true, helpfulCount: 234 },
  { author: 'DisappointedDan', rating: 3, text: 'This is literally just fans. Like, actual fans. Ceiling fans.', verified: false, helpfulCount: 2 },
  { author: 'FanFan42', rating: 5, text: 'I have bought 17 fans from this site. My wife is concerned. I regret nothing.', verified: true, helpfulCount: 567 },
]

const CATEGORIES = [
  { id: 'all', name: 'All Fans', emoji: '🌀' },
  { id: 'ceiling', name: 'Ceiling Fans', emoji: '⭕' },
  { id: 'desk', name: 'Desk Fans', emoji: '🖥️' },
  { id: 'tower', name: 'Tower Fans', emoji: '🗼' },
  { id: 'box', name: 'Box Fans', emoji: '📦' },
  { id: 'pedestal', name: 'Pedestal Fans', emoji: '🎯' },
  { id: 'handheld', name: 'Handheld Fans', emoji: '✋' },
  { id: 'industrial', name: 'Industrial', emoji: '🏭' },
  { id: 'vintage', name: 'Vintage', emoji: '🎭' },
  { id: 'smart', name: 'Smart Fans', emoji: '🤖' },
]

// ============================================================================
// Components
// ============================================================================

function FanCard({ fan, onSelect }: { fan: Fan; onSelect: () => void }) {
  return (
    <StyledCard
      onClick={onSelect}
      bgColor="#ffffff"
      borderColor="#fce7f3"
      borderWidth={1}
      padding="md"
      borderRadius="lg"
      shadow="md"
      interactive
      className="overflow-hidden h-full hover:scale-[1.02] transition-all"
    >
      {/* Image placeholder */}
      <div className="bg-gradient-to-br from-pink-100 to-pink-200 h-40 flex items-center justify-center relative -m-4 mb-4">
        <span className="text-6xl">{fan.emoji}</span>
        {fan.isHot && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            🔥 HOT
          </span>
        )}
        {fan.isExclusive && (
          <span className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
            ✨ EXCLUSIVE
          </span>
        )}
        {!fan.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1">{fan.name}</h3>
      <div className="flex items-center gap-1 text-xs text-yellow-500 mb-2">
        {'★'.repeat(Math.floor(fan.rating))}
        <span className="text-gray-500">({fan.reviews.toLocaleString()})</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-pink-600">${fan.price}</span>
        {fan.originalPrice && (
          <span className="text-sm text-gray-400 line-through">${fan.originalPrice}</span>
        )}
      </div>
      {fan.cfm && (
        <div className="text-xs text-gray-500 mt-1">
          💨 {fan.cfm.toLocaleString()} CFM
        </div>
      )}
    </StyledCard>
  )
}

function FanDetail({ fan, onBack }: { fan: Fan; onBack: () => void }) {
  const [quantity, setQuantity] = useState(1)

  return (
    <StyledCard bgColor="#ffffff" borderColor="transparent" shadow="lg" padding="lg" borderRadius="lg">
      <Button
        variant="ghost"
        size="sm"
        textColor="#ec4899"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to all fans
      </Button>

      <div className="md:flex">
        {/* Image */}
        <div className="md:w-1/2 bg-gradient-to-br from-pink-100 to-pink-200 p-8 flex items-center justify-center">
          <span className="text-[120px]">{fan.emoji}</span>
        </div>

        {/* Details */}
        <div className="md:w-1/2 p-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {fan.isHot && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">🔥 HOT</span>
            )}
            {fan.isExclusive && (
              <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">✨ EXCLUSIVE</span>
            )}
            <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full capitalize">
              {fan.type} fan
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">{fan.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-500">
              {'★'.repeat(Math.floor(fan.rating))}
              {'☆'.repeat(5 - Math.floor(fan.rating))}
            </div>
            <span className="text-gray-500 text-sm">
              {fan.rating} ({fan.reviews.toLocaleString()} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-pink-600">${fan.price}</span>
            {fan.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">${fan.originalPrice}</span>
                <span className="bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded">
                  Save ${(fan.originalPrice - fan.price).toFixed(2)}!
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-4">{fan.description}</p>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            {fan.cfm && (
              <div className="bg-pink-50 p-2 rounded">
                <span className="text-gray-500">Airflow:</span>
                <span className="font-bold text-pink-700 ml-1">{fan.cfm.toLocaleString()} CFM</span>
              </div>
            )}
            {fan.bladeCount && (
              <div className="bg-pink-50 p-2 rounded">
                <span className="text-gray-500">Blades:</span>
                <span className="font-bold text-pink-700 ml-1">{fan.bladeCount}</span>
              </div>
            )}
            {fan.noiseLevel && (
              <div className="bg-pink-50 p-2 rounded col-span-2">
                <span className="text-gray-500">Noise Level:</span>
                <span className="font-bold text-pink-700 ml-1">{fan.noiseLevel}</span>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-700 mb-2">Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {fan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-pink-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Add to Cart */}
          {fan.inStock ? (
            <div className="flex gap-4 items-center">
              <div className="flex items-center border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  textColor="#6b7280"
                  width="auto"
                >
                  −
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  textColor="#6b7280"
                  width="auto"
                >
                  +
                </Button>
              </div>
              <Button
                variant="primary"
                size="lg"
                backgroundColor="#ec3b6b"
                textColor="#ffffff"
                width="full"
                onClick={() => {}}
              >
                Add to Cart - ${(fan.price * quantity).toFixed(2)}
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              backgroundColor="#d1d5db"
              textColor="#6b7280"
              width="full"
              disabled
            >
              Out of Stock - Notify Me
            </Button>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Free shipping on orders over $50 | 30-day returns | Fan-tastic customer service
          </p>
        </div>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function OnlyFansSite({ siteId }: SiteProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFan, setSelectedFan] = useState<Fan | null>(null)
  const [showFAQ, setShowFAQ] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)

  const filteredFans = selectedCategory === 'all'
    ? FANS
    : FANS.filter(f => f.type === selectedCategory)

  // Age verification modal
  if (!ageVerified) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <StyledCard bgColor="#ffffff" borderColor="transparent" padding="none" borderRadius="full" shadow="lg" className="max-w-md w-full mx-4 overflow-hidden">
          {/* Warning header */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-center">
            <span className="text-6xl block mb-3">⚠️</span>
            <h1 className="text-2xl font-bold text-white">Age Verification Required</h1>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <p className="text-gray-700 mb-4 text-lg font-medium">
              This website contains content intended for adults only.
            </p>

            <StyledCard bgColor="#fce7f3" borderColor="transparent" padding="md" borderRadius="lg" className="mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>⚡ WARNING:</strong> You must be <strong>18 years or older</strong> to enter this site.
              </p>
              <p className="text-sm text-gray-600 mb-2">
                By clicking "I Accept" below, you confirm that:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>You are at least 18 years of age</li>
                <li>You are legally permitted to purchase <strong>high-powered cooling equipment</strong> in your jurisdiction</li>
                <li>You understand that industrial fans over 3000 CFM may require proper ventilation</li>
                <li>You accept responsibility for any ceiling fan installation decisions</li>
              </ul>
            </StyledCard>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                backgroundColor="#ec3b6b"
                textColor="#ffffff"
                width="full"
                onClick={() => setAgeVerified(true)}
              >
                🌀 I Accept - Let Me See The Fans
              </Button>
              <Button
                variant="secondary"
                size="lg"
                backgroundColor="#e5e7eb"
                textColor="#4b5563"
                width="full"
                onClick={() => window.history.back()}
              >
                I'm Under 18 / Not Interested in Fans
              </Button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              OnlyFans™ - Premium Cooling Solutions Since 2024
            </p>
          </div>
        </StyledCard>
      </div>
    )
  }

  return (
    <div className="min-h-full" style={{ background: '#FFF5F7' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌀</span>
              <div>
                <h1 className="text-2xl font-bold">{site?.name || 'OnlyFans'}</h1>
                <p className="text-pink-200 text-xs">The #1 Destination for Fan Enthusiasts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                textColor="#fce7f3"
                onClick={() => {}}
              >
                My Account
              </Button>
              <Button
                variant="primary"
                size="sm"
                backgroundColor="#ffffff"
                textColor="#ec3b6b"
                onClick={() => {}}
              >
                🛒 Cart (0)
              </Button>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold mb-2">Premium Fans. Exclusive Selection.</h2>
            <p className="text-pink-200">
              What did you think this site was about? We sell FANS. Ceiling fans. Desk fans. All kinds of fans.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for fans..."
                className="w-full px-4 py-3 rounded-full text-gray-800 pr-12"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500 text-white p-2 rounded-full">
                🔍
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Promo Banner */}
      <div className="bg-pink-100 py-2 text-center text-sm text-pink-700">
        💨 FREE SHIPPING on orders over $50 | Use code COOLBREEZE for 10% off | 🌀 New fans added weekly!
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedFan ? (
          <FanDetail fan={selectedFan} onBack={() => setSelectedFan(null)} />
        ) : (
          <div className="flex gap-6">
            {/* Sidebar Categories */}
            <aside className="w-48 hidden md:block">
              <h3 className="font-bold text-gray-700 mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                    size="sm"
                    width="full"
                    backgroundColor={selectedCategory === cat.id ? '#ec3b6b' : 'transparent'}
                    textColor={selectedCategory === cat.id ? '#ffffff' : '#374151'}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="justify-start"
                  >
                    <span className="mr-2">{cat.emoji}</span>
                    {cat.name}
                  </Button>
                ))}
              </div>

              {/* FAQ */}
              <StyledCard bgColor="#fce7f3" borderColor="transparent" padding="md" borderRadius="lg">
                <h4 className="font-bold text-pink-800 text-sm mb-2">Wait, is this...?</h4>
                <p className="text-xs text-pink-700">
                  Yes, this is literally a fan store. Ceiling fans, desk fans, box fans.
                  What were YOU thinking? 🤔
                </p>
                <Button
                  variant="link"
                  size="xs"
                  textColor="#ec3b6b"
                  onClick={() => setShowFAQ(true)}
                  className="mt-2 p-0"
                >
                  Read our FAQ
                </Button>
              </StyledCard>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All Fans'}
                  <span className="text-gray-500 text-sm font-normal ml-2">
                    ({filteredFans.length} fans)
                  </span>
                </h2>
                <select className="border rounded px-3 py-1 text-sm">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>CFM: Highest</option>
                  <option>Best Reviewed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFans.map(fan => (
                  <FanCard
                    key={fan.id}
                    fan={fan}
                    onSelect={() => setSelectedFan(fan)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_REVIEWS.map((review, i) => (
              <StyledCard key={i} bgColor="#ffffff" borderColor="#fce7f3" padding="md" shadow="sm" borderRadius="lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-500 text-sm">
                    {'★'.repeat(review.rating)}
                  </div>
                  {review.verified && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      ✓ Verified Purchaser
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mb-2">"{review.text}"</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>— {review.author}</span>
                  <span>👍 {review.helpfulCount} found helpful</span>
                </div>
              </StyledCard>
            ))}
          </div>
        </section>

        {/* Why OnlyFans */}
        <section className="mt-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose OnlyFans?</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { emoji: '💨', title: 'Maximum Airflow', desc: 'We measure CFM so you don\'t have to' },
              { emoji: '🔇', title: 'Quiet Operation', desc: 'Sleep peacefully. Hear nothing but dreams.' },
              { emoji: '💰', title: 'Best Prices', desc: 'We\'re fans of saving you money' },
              { emoji: '🚚', title: 'Free Shipping', desc: 'On orders over $50. Because we\'re cool like that.' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-4xl mb-2">{item.emoji}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-pink-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <StyledCard bgColor="#ffffff" borderColor="transparent" padding="lg" borderRadius="lg" shadow="lg" className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
              <Button
                variant="ghost"
                size="sm"
                textColor="#6b7280"
                onClick={() => setShowFAQ(false)}
              >
                ✕
              </Button>
            </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-pink-600">Q: Is this site what I think it is?</h3>
                  <p className="text-gray-600 text-sm">A: This is a store that sells fans. Ceiling fans. Desk fans. Box fans. We don't know what you were thinking, but we hope you need a fan.</p>
                </div>
                <div>
                  <h3 className="font-bold text-pink-600">Q: Why is it called OnlyFans?</h3>
                  <p className="text-gray-600 text-sm">A: Because we sell ONLY fans. Get it? Just fans. Nothing else. What else would it mean?</p>
                </div>
                <div>
                  <h3 className="font-bold text-pink-600">Q: I'm disappointed.</h3>
                  <p className="text-gray-600 text-sm">A: That's not a question. Also, have you considered that you might actually need a ceiling fan? They're really practical.</p>
                </div>
                <div>
                  <h3 className="font-bold text-pink-600">Q: What's CFM?</h3>
                  <p className="text-gray-600 text-sm">A: Cubic Feet per Minute - the measurement of airflow. The higher the CFM, the more air moves. We take this VERY seriously.</p>
                </div>
                <div>
                  <h3 className="font-bold text-pink-600">Q: Do you ship internationally?</h3>
                  <p className="text-gray-600 text-sm">A: Everyone deserves quality airflow. Yes, we ship worldwide.</p>
                </div>
                <div>
                  <h3 className="font-bold text-pink-600">Q: Is the Quantum Coffee collab real?</h3>
                  <p className="text-gray-600 text-sm">A: As real as anything can be in a superposition state. Derek approved it personally.</p>
                </div>
              </div>

            <Button
              variant="primary"
              size="md"
              backgroundColor="#ec3b6b"
              textColor="#ffffff"
              width="full"
              onClick={() => setShowFAQ(false)}
              className="mt-6"
            >
              Got it, show me the fans!
            </Button>
          </StyledCard>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-3">Shop</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>Ceiling Fans</li>
                <li>Desk Fans</li>
                <li>Tower Fans</li>
                <li>Industrial Fans</li>
                <li>New Arrivals</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Support</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>Contact Us</li>
                <li>Shipping Info</li>
                <li>Returns</li>
                <li>Fan Installation Guide</li>
                <li>CFM Calculator</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Company</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>About Us</li>
                <li>Careers (We're Hiring!)</li>
                <li>Press</li>
                <li>Our Fan-tastic Team</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Newsletter</h3>
              <p className="text-sm text-gray-400 mb-3">
                Get exclusive fan deals and new arrivals in your inbox!
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 rounded-l text-gray-800 text-sm"
                />
                <Button
                  variant="primary"
                  size="sm"
                  backgroundColor="#ec3b6b"
                  textColor="#ffffff"
                  onClick={() => {}}
                  className="rounded-r"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
            <p>© 2024 OnlyFans™ - The Premier Fan Retailer. All rights reserved.</p>
            <p className="mt-2">
              Yes, we know. We've heard all the jokes. We're still the best place to buy fans online.
            </p>
            <p className="mt-2 text-xs">
              🌀 "Stay Cool" - Our Motto Since 2019 🌀
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default OnlyFansSite
