/**
 * MARKETPLACE/GRID SITE TEMPLATE
 *
 * Use this template for grid-based sites where users browse items.
 * Examples: Craigslist (BargainBaySite), shopping, collectibles
 *
 * Key Features:
 * - Grid display of items
 * - Item cards with images and metadata
 * - Detailed item view
 * - Categories and search
 * - Price/condition metadata
 *
 * Pattern from: BargainBaySite
 */

import { useState, useEffect, useRef } from 'react'
import type { SiteProps } from 'src/components/browser/BrowserSiteContainer'
import { FILLER_SITES } from 'src/config/filler-sites'
import { StyledCard, Button, MetaRow } from 'src/components/ui/shared'

const site = FILLER_SITES.yourMarketplace

// ============================================================================
// Types
// ============================================================================

interface Item {
  id: string
  title: string
  price: number | string
  category: string
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Used'
  location: string
  posted: string
  image: string // emoji or image path
  description: string
  seller: {
    name: string
    avatar: string
    joined: string
    rating?: number
  }
  tags?: string[]
}

// ============================================================================
// Sample Data - MUST have 15+ items
// ============================================================================

const CATEGORIES = ['All Categories', 'Electronics', 'Furniture', 'Books', 'Games', 'Art', 'Misc']

const ITEMS: Item[] = [
  {
    id: 'item-1',
    title: 'Vintage Band Poster - Velvet Algorithms',
    price: 75,
    category: 'Art',
    condition: 'Good',
    location: 'Downtown',
    posted: '2 hours ago',
    image: '🎹🖼️',
    description: 'Original concert poster from 2019. Signed by the band. Great condition.',
    seller: { name: 'CollectorVibe', avatar: '🎸', joined: 'Member since 2018', rating: 4.9 },
    tags: ['music', 'poster', 'rare'],
  },
  {
    id: 'item-2',
    title: 'Philosophy Books Collection',
    price: 'Make Offer',
    category: 'Books',
    condition: 'Like New',
    location: 'Midtown',
    posted: '4 hours ago',
    image: '📚🧠',
    description: 'Collection of 12 philosophy books. Covers quantum mechanics, consciousness, and existence.',
    seller: { name: 'ThoughtfulReader', avatar: '📖', joined: 'Member since 2022', rating: 4.5 },
    tags: ['philosophy', 'books', 'quantum'],
  },
  {
    id: 'item-3',
    title: 'Retro Coffee Maker (Non-Quantum)',
    price: 45,
    category: 'Electronics',
    condition: 'Good',
    location: 'Eastside',
    posted: '1 day ago',
    image: '☕',
    description: 'Works perfectly. Simple, no quantum complications. Perfect for someone who just wants coffee.',
    seller: { name: 'SimpleLiving', avatar: '👨‍🍳', joined: 'Member since 2023' },
    tags: ['coffee', 'kitchen', 'appliance'],
  },
  {
    id: 'item-4',
    title: 'Desk Chair - Gaming Grade',
    price: 120,
    category: 'Furniture',
    condition: 'Like New',
    location: 'Downtown',
    posted: '5 hours ago',
    image: '🪑',
    description: 'RGB lighting, adjustable everything. Only used for a week. Too intense for my work style.',
    seller: { name: 'OfficeSetup', avatar: '🖥️', joined: 'Member since 2021', rating: 4.7 },
    tags: ['furniture', 'gaming', 'chair'],
  },
  {
    id: 'item-5',
    title: 'Trust Fall Training Manual',
    price: 15,
    category: 'Books',
    condition: 'Good',
    location: 'Arts District',
    posted: '3 days ago',
    image: '📘',
    description: 'Authored by Trust Fall Tim himself. How to fall with confidence. Includes injury recovery tips.',
    seller: { name: 'TFT_Official', avatar: '🤸', joined: 'Member since 2023', rating: 4.8 },
    tags: ['trust', 'philosophy', 'training'],
  },
  {
    id: 'item-6',
    title: 'Nintendo 64 with Games',
    price: 150,
    category: 'Games',
    condition: 'Good',
    location: 'Westside',
    posted: '2 days ago',
    image: '🕹️',
    description: 'Classic console with 8 games. All working. Looking for someone who will appreciate them.',
    seller: { name: 'RetroNostalgia', avatar: '👾', joined: 'Member since 2019', rating: 5.0 },
    tags: ['gaming', 'retro', 'nostalgia'],
  },
  {
    id: 'item-7',
    title: 'Original Hartwell Building Photos',
    price: 200,
    category: 'Art',
    condition: 'Like New',
    location: 'Downtown',
    posted: '1 week ago',
    image: '📸🏢',
    description: 'Architectural photographs of the Hartwell Building from 1970s. Includes photos of supposedly non-existent floors.',
    seller: { name: 'UrbanArchivist', avatar: '🏛️', joined: 'Member since 2018', rating: 4.6 },
    tags: ['photography', 'architecture', 'mystery'],
  },
  {
    id: 'item-8',
    title: 'Free: Moving Box',
    price: 'Free',
    category: 'Misc',
    condition: 'Good',
    location: 'University District',
    posted: '8 hours ago',
    image: '📦',
    description: 'Free to whoever picks it up. Contains mysterious items from my breakup. You must take all or nothing.',
    seller: { name: 'MovingOn_Finally', avatar: '😅', joined: 'Member since 2024' },
    tags: ['free', 'misc'],
  },
  {
    id: 'item-9',
    title: 'Drum Kit - Professional Grade',
    price: 800,
    category: 'Music',
    condition: 'Good',
    location: 'Arts District',
    posted: '6 hours ago',
    image: '🥁',
    description: 'Used in local band. Excellent sound. Includes all hardware and cymbals. Can provide lessons.',
    seller: { name: 'ExBandDrummer', avatar: '🎵', joined: 'Member since 2020', rating: 5.0 },
    tags: ['music', 'drums', 'instruments'],
  },
  {
    id: 'item-10',
    title: 'Conspiracy Theory Starter Pack',
    price: 30,
    category: 'Books',
    condition: 'Fair',
    location: 'Downtown',
    posted: '4 days ago',
    image: '📑',
    description: '5 booklets covering: Hartwell Building, Quantum Coffee Hoax Theory, Government Surveillance, UFOs, and the Meaning of 847.',
    seller: { name: 'TruthSeeker_42', avatar: '🕵️', joined: 'Member since 2020', rating: 3.8 },
    tags: ['conspiracy', 'books', 'mysteries'],
  },
  {
    id: 'item-11',
    title: 'Neon Requiem Vinyl Collection',
    price: 300,
    category: 'Music',
    condition: 'Like New',
    location: 'Downtown',
    posted: '2 days ago',
    image: '💿',
    description: 'All 4 albums on vinyl. Never played. Sealed. Collector\'s edition. Their farewell show was art.',
    seller: { name: 'CollectorAlbums', avatar: '🎧', joined: 'Member since 2021', rating: 4.9 },
    tags: ['music', 'neon-requiem', 'vinyl', 'rare'],
  },
  {
    id: 'item-12',
    title: 'Quantum Coffee Believer Merchandise',
    price: 25,
    category: 'Misc',
    condition: 'New',
    location: 'Midtown',
    posted: '3 hours ago',
    image: '👕',
    description: 'T-shirt with formula: ψ = ☕ + 🧠. For those who believe wave function collapse improves flavor.',
    seller: { name: 'MartinezStudyFan', avatar: '🔬', joined: 'Member since 2024' },
    tags: ['quantum', 'coffee', 'merchandise'],
  },
  {
    id: 'item-13',
    title: 'Vintage Mirror (Not Haunted)',
    price: 50,
    category: 'Furniture',
    condition: 'Good',
    location: 'Near Hartwell',
    posted: '1 week ago',
    image: '🪞',
    description: 'Beautiful mirror. Completely normal. I am just redecorating. Nothing weird has happened to me.',
    seller: { name: 'TotallyFine', avatar: '😊', joined: 'Member since 2024' },
    tags: ['furniture', 'mirror', 'vintage'],
  },
  {
    id: 'item-14',
    title: 'Martinez Study Reprint',
    price: 20,
    category: 'Books',
    condition: 'New',
    location: 'Downtown',
    posted: '5 days ago',
    image: '📄',
    description: 'Official reprint of the Martinez Study on consciousness and coffee. Includes annotations by Derek (a fan).',
    seller: { name: 'AcademicPress', avatar: '🏛️', joined: 'Member since 2015', rating: 4.8 },
    tags: ['martinez', 'science', 'quantum'],
  },
  {
    id: 'item-15',
    title: 'The Underground Stickers',
    price: 5,
    category: 'Misc',
    condition: 'New',
    location: 'Downtown',
    posted: '3 days ago',
    image: '🎫',
    description: 'Pack of 20 stickers featuring The Underground venue logo. Support local music venue!',
    seller: { name: 'Mars_Underground', avatar: '🎪', joined: 'Member since 2018', rating: 4.9 },
    tags: ['stickers', 'venue', 'underground'],
  },
]

// ============================================================================
// Main Component
// ============================================================================

export function YourMarketplaceSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')

  const isUpdatingFromPath = useRef(false)

  // Parse path
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setSelectedItem(null)
      setSelectedCategory('All Categories')
    } else if (path.startsWith('/item/')) {
      const id = path.slice(6)
      const item = ITEMS.find(i => i.id === id)
      if (item) setSelectedItem(item)
    }

    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path])

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item)
    onPathChange(`/item/${item.id}`)
  }

  const handleBack = () => {
    setSelectedItem(null)
    onPathChange(null)
  }

  const handleGoHome = () => {
    setSelectedItem(null)
    setSelectedCategory('All Categories')
    onPathChange(null)
  }

  const filteredItems = ITEMS.filter(item => {
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) {
      return false
    }
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const formatPrice = (price: number | string) => {
    if (typeof price === 'number') return `$${price}`
    return price
  }

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{
          background: site.theme.surface,
          borderBottomColor: site.theme.border,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <span
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </span>
          </button>

          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-sm"
              style={{
                background: site.theme.background,
                border: `1px solid ${site.theme.border}`,
                color: site.theme.text,
              }}
            />
          </div>

          <Button variant="link" textColor={site.theme.text} size="sm">
            Sell
          </Button>
        </div>
      </header>

      {selectedItem ? (
        // Detail View
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            onClick={handleBack}
            variant="link"
            textColor={site.theme.primary}
            className="mb-6"
          >
            ← Back
          </Button>

          <div className="flex gap-8">
            {/* Image */}
            <div className="w-80 shrink-0">
              <StyledCard
                bgColor={site.theme.secondary}
                borderRadius="lg"
                padding="lg"
                className="aspect-square flex items-center justify-center text-8xl"
              >
                {selectedItem.image}
              </StyledCard>
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: site.theme.text }}
              >
                {selectedItem.title}
              </h1>

              <p
                className="text-3xl font-bold mb-4"
                style={{ color: site.theme.primary }}
              >
                {formatPrice(selectedItem.price)}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[selectedItem.category, selectedItem.condition, selectedItem.location].map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: site.theme.background,
                      color: site.theme.text,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p
                className="text-sm mb-6"
                style={{ color: site.theme.textMuted }}
              >
                Listed {selectedItem.posted}
              </p>

              <div className="mb-6">
                <h2
                  className="font-bold mb-2"
                  style={{ color: site.theme.text }}
                >
                  Description
                </h2>
                <p
                  className="text-sm"
                  style={{ color: site.theme.text }}
                >
                  {selectedItem.description}
                </p>
              </div>

              {/* Seller */}
              <StyledCard
                bgColor={site.theme.background}
                borderColor={site.theme.border}
                textColor={site.theme.text}
                padding="md"
                borderRadius="lg"
                className="mb-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedItem.seller.avatar}</span>
                  <div>
                    <p className="font-medium">{selectedItem.seller.name}</p>
                    <MetaRow
                      items={[
                        { value: selectedItem.seller.joined },
                        ...(selectedItem.seller.rating ? [{ value: `⭐ ${selectedItem.seller.rating}` }] : []),
                      ]}
                      textSize="xs"
                      textColor={site.theme.textMuted}
                      separator="•"
                    />
                  </div>
                </div>
              </StyledCard>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
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
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Grid View
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6 mb-6">
            {/* Sidebar */}
            <aside className="w-48 shrink-0">
              <h3
                className="font-bold text-sm mb-3"
                style={{ color: site.theme.text }}
              >
                Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
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
            </aside>

            {/* Grid */}
            <main className="flex-1">
              <h2
                className="text-xl font-bold mb-6"
                style={{ color: site.theme.text }}
              >
                {selectedCategory === 'All Categories' ? 'All Listings' : selectedCategory}
                {searchQuery && ` - ${filteredItems.length} results`}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="text-left"
                  >
                    <StyledCard
                      bgColor={site.theme.surface}
                      borderColor={site.theme.border}
                      padding={0}
                      borderRadius="lg"
                      shadow="md"
                      className="overflow-hidden"
                    >
                      {/* Image */}
                      <div
                        className="aspect-square flex items-center justify-center text-5xl"
                        style={{ background: site.theme.secondary }}
                      >
                        {item.image}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p
                          className="font-bold mb-1"
                          style={{ color: site.theme.primary }}
                        >
                          {formatPrice(item.price)}
                        </p>
                        <p
                          className="text-sm font-medium line-clamp-2 mb-1"
                          style={{ color: site.theme.text }}
                        >
                          {item.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: site.theme.textMuted }}
                        >
                          {item.location} • {item.posted}
                        </p>
                      </div>
                    </StyledCard>
                  </button>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: site.theme.textMuted }}>
                    No listings found.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  )
}

export default YourMarketplaceSite
