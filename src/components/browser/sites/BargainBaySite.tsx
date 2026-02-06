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

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Furniture',
  'Vehicles',
  'Free Stuff',
  'Musical Instruments',
  'Home & Garden',
  'Clothing',
  'Collectibles',
  'Services',
  'Missed Connections',
]

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 'bb_1',
    title: 'Quantum Coffee Maker Q-3000 - BARELY USED',
    price: 1500,
    category: 'Electronics',
    condition: 'Like New',
    location: 'Downtown',
    posted: '2 hours ago',
    image: '☕💸',
    description: `Selling my Q-3000 quantum coffee maker. Paid $3000 new, selling for half because I'm moving and can't take it with me (definitely not because my roommate was right about it being a waste of money).

Used maybe 10 times. Still has original box and all accessories including:
- Quantum observation goggles
- Calibration toolkit
- 47-page manual that you'll need to read
- Bonus: 2 lbs of single-origin beans

Works perfectly. The coffee it makes is genuinely good (I'm just not patient enough for 45-minute brew times).

NO LOWBALLERS. I know what I have.

Will consider trades for:
- Normal coffee maker (decent one)
- Gaming console
- Your silence about this to anyone who said quantum coffee was a scam`,
    seller: {
      name: 'NotAQuantumBeliever',
      avatar: '😤',
      joined: 'Member since 2023',
      rating: 4.2,
      responseRate: 'Usually responds in 1 hour',
    },
    tags: ['quantum coffee', 'coffee maker', 'kitchen', 'premium'],
  },
  {
    id: 'bb_2',
    title: 'FREE: Box of stuff my ex left',
    price: 'Free',
    category: 'Free Stuff',
    condition: 'Good',
    location: 'Midtown',
    posted: '4 hours ago',
    image: '📦💔',
    description: `Free to whoever wants it. Contents include:

- 3 hoodies (men's L) - they still smell like him but that'll wash out
- Some video games I don't want to look at anymore
- A ukulele that he "was totally going to learn to play"
- Several books about quantum physics (ugh)
- A photo album (I removed our pictures, the rest is his family)
- Random cables and chargers
- A plant that I'm NOT going to keep watering

Pickup only. I'm leaving it on the porch. Don't knock, don't ring the bell, just take it and go.

If a guy named Derek asks, you found this on the street.`,
    seller: {
      name: 'MovingOnMelissa',
      avatar: '👩‍🦰',
      joined: 'Member since 2024',
      responseRate: 'Responds instantly (she\'s got time now)',
    },
    tags: ['free stuff', 'misc', 'moving'],
  },
  {
    id: 'bb_3',
    title: 'Vintage Velvet Algorithms Concert Poster - RARE',
    price: 250,
    category: 'Collectibles',
    condition: 'Good',
    location: 'Arts District',
    posted: '1 day ago',
    image: '🎹🖼️',
    description: `RARE original concert poster from The Velvet Algorithms' first show at The Underground in 2019!

This was before they got famous (well, semi-famous) (well, popular in our town at least).

Poster is in good condition with some minor edge wear. Frame not included but can recommend a good framing shop in the Arts District.

Fun fact: I was at this show. There were maybe 30 people there. They played for 2 hours straight and then had an existential crisis about whether music could truly express human emotion. Some things never change lol.

Will trade for:
- Other rare local music memorabilia
- Neon Requiem posters
- Tickets to upcoming shows (I know they cancelled the last one but eventually they'll be back)`,
    seller: {
      name: 'LocalSceneCollector',
      avatar: '🎸',
      joined: 'Member since 2018',
      rating: 4.9,
      responseRate: 'Usually responds same day',
    },
    tags: ['velvet algorithms', 'music', 'poster', 'rare', 'collectible'],
  },
  {
    id: 'bb_4',
    title: 'WORKING car - runs great! - $500',
    price: '$1 (read desc)',
    category: 'Vehicles',
    condition: 'Fair',
    location: 'Eastside',
    posted: '3 days ago',
    image: '🚗💨',
    description: `EDIT: Price is $500 NOT $1 - had to put something to get your attention

2008 Honda Civic. It runs. That's about all I can promise.

The good:
- Engine works
- Four wheels (all different tires but they're there)
- AC blows (something. might be air)
- Radio works (stuck on one station but it's a good one)

The less good:
- Check engine light is on (has been for 3 years, car doesn't seem to mind)
- Passenger door doesn't open from outside (climb through driver side)
- Trunk only opens when it's cold outside (???)
- Previous owner was a smoker. Previous previous owner had a dog. I have neither and it still smells like both.
- Horn plays La Cucaracha (long story)

Perfect for:
- First car
- Backup car
- Someone who really needs to get to work
- Art project

Clean title. 187,000 miles. First person with cash takes it. I'm tired of looking at it.`,
    seller: {
      name: 'JustWantItGone',
      avatar: '😩',
      joined: 'Member since 2021',
      rating: 3.8,
    },
    tags: ['car', 'honda', 'cheap', 'runs'],
    suspicious: true,
  },
  {
    id: 'bb_5',
    title: 'Antique Mirror - Definitely Not Haunted',
    price: 75,
    category: 'Home & Garden',
    condition: 'Haunted',
    location: 'Near Hartwell Building',
    posted: '1 week ago',
    image: '🪞👻',
    description: `Beautiful antique mirror, approx 100 years old. Ornate gold frame, some patina (adds character!).

I want to be completely transparent: there is NOTHING weird about this mirror. The things I've seen in my peripheral vision are DEFINITELY just tricks of the light. The face that isn't mine that sometimes appears? Probably just my reflection at a weird angle. The whispers? My apartment has old pipes.

That said, I am selling this mirror because I am "redecorating" and "want something more modern" and "have not slept well since I bought it at an estate sale from that house near the old Hartwell Building."

Previous owner's estate sale listed it as "parlor mirror, 1890s." I am NOT going to research what happened in that parlor. I recommend you also don't.

Cash only. You must pick up. I will not help you load it into your car. I will not touch it again.

Price firm. No trades unless you have something that will make me forget this mirror exists.`,
    seller: {
      name: 'TotallyFineImFine',
      avatar: '😰',
      joined: 'Member since 2024',
      responseRate: 'Responds at 3 AM for some reason',
    },
    tags: ['antique', 'mirror', 'vintage', 'haunted'],
    suspicious: true,
  },
  {
    id: 'bb_6',
    title: 'Professional Drum Kit - Great for Beginners!',
    price: 800,
    category: 'Musical Instruments',
    condition: 'Good',
    location: 'Near University',
    posted: '5 hours ago',
    image: '🥁🎶',
    description: `Selling my drum kit because I "got a real job" and "need to sleep at reasonable hours" (according to my new roommates).

Pearl Export Series, 5-piece kit with hardware and cymbals. Some cosmetic wear from years of passionate playing but sounds amazing.

Includes:
- 22" kick drum
- 14" snare
- 12" and 13" rack toms
- 16" floor tom
- Hi-hat stand and cymbals
- Crash and ride cymbals
- Throne (drum stool)
- Practice pad
- Bunch of sticks (various states of broken)

I played drums in a local band (you might have heard of Neon Requiem?) for 3 years. This kit has seen some shows. Treated with love.

Great starter kit for anyone who wants to learn and doesn't have neighbors who complain easily.

Can include lessons if you want. I have time now that I'm not gigging.`,
    seller: {
      name: 'ExDrummer_DayJobNow',
      avatar: '🧑‍💼',
      joined: 'Member since 2020',
      rating: 5.0,
      responseRate: 'Responds within hours',
    },
    tags: ['drums', 'music', 'instruments', 'pearl'],
  },
  {
    id: 'bb_7',
    title: 'SEEKING: Someone to observe my coffee with me',
    price: 'Make Offer',
    category: 'Services',
    condition: 'New',
    location: 'Midtown',
    posted: '6 hours ago',
    image: '☕👀',
    description: `This is not a joke post. I am genuinely seeking another person to help me observe my quantum coffee in the mornings.

Background: I recently purchased a Q-3000 quantum coffee maker and the manual clearly states that "multiple observers may enhance the wave function collapse for optimal flavor profiles."

My roommate refuses to participate (she calls it "pseudoscience" and "a waste of 45 minutes every morning"). My friends have stopped answering my texts about it.

What I'm offering:
- Free quantum coffee (worth like $47 per cup if you calculate the machine cost)
- Stimulating conversation about particle physics (optional)
- A chance to be part of cutting-edge beverage science

What I need from you:
- 45-60 minutes of your time each morning (7:00-8:00 AM, flexible)
- An open mind
- The ability to focus your observation on the brewing chamber
- NO SKEPTICISM (the coffee can sense it)

Will pay reasonable hourly rate OR trade for goods/services. Serious inquiries only.`,
    seller: {
      name: 'QuantumBrewer2024',
      avatar: '🔬',
      joined: 'Member since 2024',
      responseRate: 'Responds immediately (he\'s very eager)',
    },
    tags: ['services', 'coffee', 'quantum', 'seeking'],
    suspicious: true,
  },
  {
    id: 'bb_8',
    title: 'Moving Sale - Everything Must Go This Weekend!',
    price: 'Make Offer',
    category: 'Furniture',
    condition: 'Good',
    location: 'Westside',
    posted: '12 hours ago',
    image: '🏠📦',
    description: `Moving out of state for work! Everything must go by Sunday!

Living Room:
- Gray sectional sofa (IKEA, 2 years old) - $300
- Coffee table (wood, some water rings) - $50
- 55" TV (works great) - $200
- TV stand - $40
- Floor lamp - $25
- Area rug (8x10, blue) - $100

Bedroom:
- Queen bed frame (no mattress, sorry) - $150
- Dresser (6 drawer) - $100
- Nightstands (pair) - $60
- Full length mirror - $30

Kitchen:
- Bar stools (set of 3) - $75
- Small kitchen table + 2 chairs - $80
- Various appliances (blender, toaster, etc) - $10-30 each
- NOT SELLING: my quantum coffee maker (it's coming with me, fight me)

Prices negotiable, especially if you buy multiple items. Cash preferred but can do Venmo.

Serious buyers only. Yes you can test the TV. No you cannot "hold" items without a deposit.`,
    seller: {
      name: 'MovingMonday',
      avatar: '📦',
      joined: 'Member since 2022',
      rating: 4.7,
      responseRate: 'Responds within minutes',
    },
    tags: ['furniture', 'moving sale', 'tv', 'sofa', 'bedroom'],
  },
  {
    id: 'bb_9',
    title: 'Trust Fall Training - Private Sessions Available',
    price: 50,
    category: 'Services',
    condition: 'New',
    location: 'Downtown (various venues)',
    posted: '1 day ago',
    image: '🤸💪',
    description: `Yes, it's me. Trust Fall Tim.

After 47 consecutive failed trust falls at various local venues, I've decided to monetize my expertise. I may not get caught, but I've learned a LOT about the art of the trust fall.

What you'll learn:
- Proper trust fall technique
- How to fall safely when no one catches you
- Reading a crowd (who looks trustworthy vs who will definitely step aside)
- The philosophy of trust in modern society
- Recovery stretches for your back and dignity

Sessions are 1 hour and can be conducted at a location of your choice (I'm banned from The Underground on Tuesdays so not there on Tuesdays).

Group rates available for team building events! Nothing builds trust like falling together!

Disclaimer: I am not a licensed instructor of anything. Results may vary. I take no responsibility for injuries, embarrassment, or sudden existential realizations about the nature of trust.

"One day, Tim. One day." - Mars, The Underground`,
    seller: {
      name: 'TrustFallTim',
      avatar: '🤸',
      joined: 'Member since 2023',
      rating: 4.8,
      responseRate: 'Always responds (no one else is messaging him)',
    },
    tags: ['services', 'training', 'trust', 'team building'],
  },
  {
    id: 'bb_10',
    title: 'MISSED CONNECTION: Quantum Cafe Tuesday Morning',
    price: 'Free',
    category: 'Missed Connections',
    condition: 'New',
    location: 'Downtown Quantum Cafe',
    posted: '3 days ago',
    image: '💕☕',
    description: `You: Ordering a Schrödinger's Latte, wearing a vintage Velvet Algorithms t-shirt, reading a book about the Hartwell Building incident.

Me: Waiting for my 45-minute pour-over, pretending to read but actually watching you observe your coffee with what can only be described as reverence.

Our eyes met during the wave function collapse. I felt something. A superposition of emotions. Both attracted and terrified.

You said something about the foam patterns being "mathematically beautiful" and I almost proposed on the spot.

But then my coffee was ready and by the time I looked up, you were gone. Like a particle that had been measured.

If this was you, please reach out. I'll be at the cafe again Tuesday. Same time. I'll be the one crying into my quantum espresso if you don't show up.

If this wasn't you but you also appreciate quantum coffee and existential dread, feel free to message anyway. I'm lonely.`,
    seller: {
      name: 'QuantumRomantic',
      avatar: '😍',
      joined: 'Member since 2024',
    },
    tags: ['missed connections', 'quantum cafe', 'romance'],
  },
]

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
  // Fetch from DB with fallback to hardcoded data
  const { content: dbContent } = useSiteContent('bargainbay')
  const { categories: dbCategories } = useSiteCategories('bargainbay')

  const listings = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToListing)
    return SAMPLE_LISTINGS
  }, [dbContent])

  const categories = useMemo(() => {
    if (dbCategories.length > 0) return ['All Categories', ...dbCategories.map(dbToCategoryName)]
    return CATEGORIES
  }, [dbCategories])

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
