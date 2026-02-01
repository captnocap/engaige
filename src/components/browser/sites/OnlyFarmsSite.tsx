/**
 * OnlyFarms Site
 *
 * A perfectly legitimate agricultural equipment marketplace with an
 * unfortunately suggestive name. Features tractors, combines, irrigation
 * equipment, and "exclusive content" (premium farm machinery).
 *
 * The joke: sounds like something else, but it is 100% wholesome farming.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, MetaRow } from '../../ui/shared/index.js'

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

// ============================================================================
// Sample Data - Sellers
// ============================================================================

const SELLERS: Seller[] = [
  {
    id: 'seller_1',
    username: 'FarmDaddy847',
    displayName: 'Big Earl',
    avatar: '🧔',
    subscriberCount: 8470,
    verified: true,
    bio: 'Third generation farmer. I show off my biggest, most powerful equipment. No filters, just raw horsepower.',
    joinedDate: 'March 2022',
    totalListings: 47,
    rating: 4.9,
    specialties: ['Tractors', 'Heavy Equipment', 'Vintage Machinery'],
  },
  {
    id: 'seller_2',
    username: 'CornQueenJennifer',
    displayName: 'Jennifer Stalksworth',
    avatar: '👩‍🌾',
    subscriberCount: 12340,
    verified: true,
    bio: 'I grow the tallest stalks in the county. Subscribe to see what makes them so... impressive.',
    joinedDate: 'January 2021',
    totalListings: 89,
    rating: 5.0,
    specialties: ['Irrigation', 'Harvesting', 'Corn Equipment'],
  },
  {
    id: 'seller_3',
    username: 'BigTractorEnergy',
    displayName: 'Hank Plowman',
    avatar: '🤠',
    subscriberCount: 6789,
    verified: true,
    bio: 'When you need something BIG for the back forty, I have got what you need. Diesel only.',
    joinedDate: 'September 2021',
    totalListings: 34,
    rating: 4.7,
    specialties: ['Combines', 'Plowing Equipment', 'Industrial'],
  },
  {
    id: 'seller_4',
    username: 'MilkingItDaily',
    displayName: 'Bessie Mae',
    avatar: '🐄',
    subscriberCount: 4521,
    verified: false,
    bio: 'Dairy equipment specialist. I know how to handle sensitive machinery with care.',
    joinedDate: 'June 2023',
    totalListings: 22,
    rating: 4.8,
    specialties: ['Livestock Equipment', 'Dairy', 'Barn Supplies'],
  },
  {
    id: 'seller_5',
    username: 'DerekQuantumFarmer',
    displayName: 'Derek',
    avatar: '🔬',
    subscriberCount: 47,
    verified: false,
    bio: 'Looking for a quantum coffee roaster attachment for my tractor. Will trade anything. ANYTHING.',
    joinedDate: 'December 2024',
    totalListings: 3,
    rating: 2.1,
    specialties: ['Experimental Equipment', 'Coffee-Related Farming'],
  },
  {
    id: 'seller_6',
    username: 'HayBabeRachel',
    displayName: 'Rachel Fields',
    avatar: '👱‍♀️',
    subscriberCount: 9847,
    verified: true,
    bio: 'Hay specialist. My bales are tight, golden, and ready for storage. DM for bulk orders.',
    joinedDate: 'April 2022',
    totalListings: 56,
    rating: 4.9,
    specialties: ['Hay Equipment', 'Balers', 'Storage Solutions'],
  },
]

// ============================================================================
// Sample Data - Listings
// ============================================================================

const LISTINGS: Listing[] = [
  {
    id: 'list_1',
    title: 'John Deere 8R 410 - Barely Used, Handles Rough Terrain',
    description: `This beast can go ALL NIGHT on a single tank. 410 horsepower of pure, unfiltered power.

Barely used - only 847 hours on the meter. Previous owner kept it indoors and treated it right.

Features:
- CommandView III display (touch screen gets you going faster)
- Premium suspension (for those long, bumpy nights in the field)
- LED work lights (see everything, even in the dark)
- Climate controlled cab (stay comfortable no matter how hot things get)

This tractor can handle whatever you throw at it. Deep furrows? No problem. Heavy loads? Bring it on. Wet conditions? It just digs in harder.

Serious inquiries only. Must be able to handle this much machine.`,
    price: 284700,
    category: 'Tractors',
    condition: 'Like New',
    image: '🚜',
    seller: SELLERS[0],
    views: 8472,
    likes: 423,
    posted: '2 hours ago',
    exclusive: false,
    comments: [
      { id: 'c1', author: 'DirtRoadDave', avatar: '👨‍🌾', text: 'Now THAT is a big tractor. My wife would love this.', timestamp: '1 hour ago', likes: 12 },
      { id: 'c2', author: 'PlowPrincess', avatar: '👩', text: 'How deep can it go? Asking for my north field.', timestamp: '45 min ago', likes: 8 },
      { id: 'c3', author: 'CornQueenJennifer', avatar: '👩‍🌾', text: 'Earl always has the best equipment. Verified.', timestamp: '30 min ago', likes: 24 },
    ],
  },
  {
    id: 'list_2',
    title: 'Industrial Irrigation System - Gets Everything Wet',
    description: `Center pivot irrigation system that will absolutely DRENCH your fields.

Coverage area: 847 acres (with proper pressure)
Flow rate: 1,500 GPM (gallons per minute of pure satisfaction)

This system knows exactly where to spray. Adjustable nozzles let you control the intensity - from a gentle mist to a powerful stream. Your crops will NEVER be thirsty again.

Includes:
- 12 tower spans
- GPS guidance (hits the right spots every time)
- Variable rate application (start slow, finish strong)
- Remote monitoring (watch from anywhere)

Installation available. I can come out and show you how to use it properly.`,
    price: 125000,
    category: 'Irrigation',
    condition: 'Excellent',
    image: '💦',
    seller: SELLERS[1],
    views: 5632,
    likes: 287,
    posted: '5 hours ago',
    exclusive: false,
    comments: [
      { id: 'c4', author: 'DryLandFarmer', avatar: '🏜️', text: 'My fields need this SO bad right now.', timestamp: '4 hours ago', likes: 19 },
      { id: 'c5', author: 'MoistureManager', avatar: '💧', text: 'Can confirm Jennifer knows her irrigation. 10/10', timestamp: '3 hours ago', likes: 31 },
    ],
  },
  {
    id: 'list_3',
    title: 'Case IH Combine - Threshes Like Nobody is Watching',
    description: `When you need something that can separate the wheat from the chaff without mercy.

This 9250 Axial-Flow harvester is an absolute ANIMAL in the field. It devours crops and leaves nothing behind.

Key features:
- 450 HP engine (raw, unbridled power)
- 35-foot header (covers more ground per pass)
- Grain tank holds 410 bushels (keeps going without stopping)
- Cross Flow cleaning system (thorough extraction)

This machine has harvested over 10,000 acres and is still hungry for more. Ready to work your fields hard.

Selling because I upgraded to an even BIGGER model. You understand.`,
    price: 347000,
    category: 'Combines',
    condition: 'Good',
    image: '🌾',
    seller: SELLERS[2],
    views: 4231,
    likes: 198,
    posted: '1 day ago',
    exclusive: false,
    comments: [
      { id: 'c6', author: 'GrainGang', avatar: '🌽', text: 'Big machines for big fields. Respect.', timestamp: '20 hours ago', likes: 14 },
      { id: 'c7', author: 'HarvestHank', avatar: '🧑‍🌾', text: 'How does it handle soybeans? My beans need attention.', timestamp: '18 hours ago', likes: 7 },
    ],
  },
  {
    id: 'list_4',
    title: 'Premium Milking Parlor Setup - Gentle But Efficient',
    description: `Complete 24-stall rotary milking parlor. Treats your ladies right while getting the job done.

This system knows how to handle sensitive equipment. Gentle pulsation rhythms and automatic take-off prevent any discomfort.

Includes:
- 24 milking units with soft-touch cups
- Automatic cleaning system (hygiene is priority)
- Milk meter and flow sensors (know exactly what you are getting)
- Cooling tank (keeps everything fresh)

My herd LOVES this system. They line up eagerly every morning and evening. Happy cows, happy life.

Selling to fund my quantum coffee addiction. Please do not judge.`,
    price: 89000,
    category: 'Livestock Equipment',
    condition: 'Excellent',
    image: '🥛',
    seller: SELLERS[3],
    views: 3421,
    likes: 156,
    posted: '3 days ago',
    exclusive: false,
    comments: [
      { id: 'c8', author: 'DairyDan', avatar: '🐮', text: 'My girls would appreciate this upgrade. Very interested.', timestamp: '2 days ago', likes: 21 },
      { id: 'c9', author: 'MilkMonarch', avatar: '👑', text: 'Quantum coffee? Say more...', timestamp: '1 day ago', likes: 8 },
      { id: 'c10', author: 'DerekQuantumFarmer', avatar: '🔬', text: 'Did someone mention quantum coffee? I am VERY interested in talking.', timestamp: '1 day ago', likes: 2 },
    ],
  },
  {
    id: 'list_5',
    title: '[EXCLUSIVE] Vintage 1952 Farmall M - Pristine Condition',
    description: `PREMIUM SUBSCRIBERS ONLY

This is the one collectors dream about. Original paint, original parts, original POWER.

My grandfather bought this new. Three generations of my family have been inside this cab. Now it can be yours.

Features:
- Original 4-cylinder engine (247.7 ci of vintage muscle)
- Hand-crank start option (for the traditionalists)
- All original gauges and controls
- Recently serviced (she runs like new)

Only 847 original hours. Yes, really. Grandpa was very gentle with her.

This listing is exclusive content for Premium Harvest subscribers. Worth every penny to see what real machinery looked like before everything went digital.`,
    price: 45000,
    category: 'Exclusive Content',
    condition: 'Pristine',
    image: '🏆',
    seller: SELLERS[0],
    views: 12847,
    likes: 847,
    posted: '1 week ago',
    exclusive: true,
    comments: [
      { id: 'c11', author: 'VintageIronVictor', avatar: '🔧', text: 'This is the holy grail. Subscribed JUST to see this.', timestamp: '6 days ago', likes: 89 },
      { id: 'c12', author: 'RedTractorRick', avatar: '🚜', text: 'That patina... that history... I need to sit down.', timestamp: '5 days ago', likes: 67 },
      { id: 'c13', author: 'AntiqueAgAnna', avatar: '👵', text: 'My grandfather had one of these. Memories flooding back.', timestamp: '4 days ago', likes: 54 },
    ],
  },
  {
    id: 'list_6',
    title: 'SEEKING: Quantum Coffee Roaster Tractor Attachment',
    description: `I KNOW it exists. Someone on QuantumBrewBlog mentioned a prototype PTO-powered quantum coffee roaster that attaches to a standard 3-point hitch.

I will pay ANYTHING. I will trade ANYTHING. My tractor sits idle and my coffee is merely... regular.

What I have to trade:
- 2019 Kubota L2501 (fine machine but not caffeinated)
- Complete chicken coop setup (47 hens included, they are good layers)
- My dignity (already gone, does not matter)
- Signed poster of Dr. Elena Martinez (long story)

PLEASE. The coffee at the farmers market is NOT QUANTUM and I can TASTE the difference.

If you have information leading to a quantum roaster attachment, DM me. I am always online. ALWAYS.`,
    price: 0,
    category: 'Exclusive Content',
    condition: 'Desperate',
    image: '☕🚜',
    seller: SELLERS[4],
    views: 847,
    likes: 3,
    posted: '47 minutes ago',
    exclusive: false,
    comments: [
      { id: 'c14', author: 'NormalFarmerNed', avatar: '🧑‍🌾', text: 'Derek... buddy... this does not exist.', timestamp: '45 min ago', likes: 42 },
      { id: 'c15', author: 'ConcernedCathy', avatar: '👩', text: 'Have you considered regular coffee? Just once?', timestamp: '40 min ago', likes: 38 },
      { id: 'c16', author: 'DerekQuantumFarmer', avatar: '🔬', text: 'YOU DO NOT UNDERSTAND THE WAVE FUNCTION COLLAPSE IMPROVES FLAVOR', timestamp: '35 min ago', likes: 1 },
      { id: 'c17', author: 'FarmDaddy847', avatar: '🧔', text: 'Son, I worry about you.', timestamp: '30 min ago', likes: 56 },
    ],
  },
  {
    id: 'list_7',
    title: 'Round Baler - Makes Tight, Perfect Bales Every Time',
    description: `Vermeer 605N Cornstalk Special. This thing rolls TIGHT bales that stay together through anything.

4x5 bales, consistent density, perfect shape every single time. Your hay storage will look IMMACULATE.

Includes:
- Net wrap system (wraps it up nice and secure)
- Monitor display (watch the whole process unfold)
- Automatic twine tie (because we finish what we start)
- Pickup width: 66 inches

I have baled over 10,000 rolls with this machine. Never once had a loose bale situation. That is professionalism.

Great for beginners or experienced balers who want reliability. This machine will not disappoint.`,
    price: 28500,
    category: 'Exclusive Content',
    condition: 'Good',
    image: '🌿',
    seller: SELLERS[5],
    views: 3847,
    likes: 201,
    posted: '4 hours ago',
    exclusive: true,
    comments: [
      { id: 'c18', author: 'BaleOut Billy', avatar: '👨', text: 'Rachel always delivers tight bales. Subscription worth it.', timestamp: '3 hours ago', likes: 24 },
      { id: 'c19', author: 'HayHayHay', avatar: '🌾', text: 'The bale density on this is unreal. Chef kiss.', timestamp: '2 hours ago', likes: 18 },
    ],
  },
  {
    id: 'list_8',
    title: 'Seed Drill - Deep Penetration Guaranteed',
    description: `Great Plains 3S-3000HD heavy-duty drill. Gets seeds DEEP into the soil where they belong.

30-foot working width means you cover a lot of ground fast. The double-disc openers cut through anything - hard soil, crop residue, whatever stands in your way.

Features:
- 7.5-inch row spacing (tight rows, maximum coverage)
- Press wheels (firm seed-to-soil contact)
- Large seed box (keeps going without stopping to refill)
- Hydraulic markers (know exactly where you have been)

This drill has planted over 50,000 acres. Seeds go in perfect, come up uniform. Your rows will be the envy of every neighbor.

Perfect conditions for germination start with deep, proper placement. This machine DELIVERS.`,
    price: 67000,
    category: 'Exclusive Content',
    condition: 'Like New',
    image: '🌱',
    seller: SELLERS[2],
    views: 2847,
    likes: 134,
    posted: '12 hours ago',
    exclusive: true,
    comments: [
      { id: 'c20', author: 'SeedSower Steve', avatar: '👨‍🌾', text: 'Finally, someone who understands proper seed depth.', timestamp: '10 hours ago', likes: 19 },
      { id: 'c21', author: 'GerminationGary', avatar: '🌱', text: 'That penetration depth tho. Very impressed.', timestamp: '8 hours ago', likes: 15 },
    ],
  },
]

// ============================================================================
// Sample Data - Farming Tips
// ============================================================================

const FARMING_TIPS: FarmingTip[] = [
  {
    id: 'tip_1',
    title: 'Best Time to Plow Your Back Field',
    content: 'Most farmers find early morning provides the best soil conditions. The ground is cooler and more receptive to deep tillage.',
    author: 'FarmDaddy847',
    likes: 234,
  },
  {
    id: 'tip_2',
    title: 'How to Keep Your Equipment Running All Night',
    content: 'Regular maintenance is key. Check fluid levels, grease points, and tire pressure before any extended session in the field.',
    author: 'BigTractorEnergy',
    likes: 189,
  },
  {
    id: 'tip_3',
    title: 'Getting the Most Out of Your Irrigation',
    content: 'Timing is everything. Water early or late to reduce evaporation. Your soil should be moist but not saturated.',
    author: 'CornQueenJennifer',
    likes: 312,
  },
  {
    id: 'tip_4',
    title: 'Proper Seed Depth for Maximum Yield',
    content: 'One inch depth for most corn varieties. Go deeper in sandy soil, shallower in clay. Soil temperature matters more than calendar date.',
    author: 'HayBabeRachel',
    likes: 156,
  },
]

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
// Main Component
// ============================================================================

export function OnlyFarmsSite({ onNavigate }: SiteProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'hot' | 'sellers' | 'tips'>('hot')

  const filteredListings = selectedCategory === 'All'
    ? LISTINGS
    : LISTINGS.filter(l => l.category === selectedCategory)

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
            listings={LISTINGS.filter(l => l.seller.id === selectedSeller.id)}
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
