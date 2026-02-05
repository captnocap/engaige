/**
 * LIST/DETAIL SITE TEMPLATE
 *
 * Use this template for sites with a list view and detailed item view.
 * Examples: blogs (ElenasBlogSite), forums (ThreaditSite), marketplaces (BargainBaySite)
 *
 * Key Features:
 * - List of items with metadata
 * - Detailed view for each item
 * - URL routing for list and detail
 * - Search/filter capabilities
 * - Sidebar navigation or categories
 *
 * Pattern from: ThreaditSite, ElenasBlogSite
 */

import { useState, useEffect, useRef } from 'react'
import type { SiteProps } from 'src/components/browser/BrowserSiteContainer'
import { FILLER_SITES } from 'src/config/filler-sites'
import { StyledCard, Button, MetaRow } from 'src/components/ui/shared'

const site = FILLER_SITES.yourListSite

// ============================================================================
// Types
// ============================================================================

interface Item {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  timestamp: string
  category?: string
  views?: number
  likes?: number
  tags?: string[]
}

// ============================================================================
// Sample Data - MUST have 10+ items
// ============================================================================

const ITEMS: Item[] = [
  {
    id: 'item-1',
    title: 'Why Quantum Coffee Changed My Life',
    excerpt: 'A journey into the world of wave function collapse and espresso...',
    content: `I never understood quantum mechanics until I discovered quantum coffee. The Martinez Study changed everything.

It started when Derek showed me his quantum coffee maker. He spent hours explaining how the observer effect applies to coffee brewing. I was skeptical. I am still skeptical. But the coffee tastes extraordinary.

The key is in understanding that consciousness and observation matter. When you watch the coffee brew, when you really pay attention, the wave function collapses in a way that enhances flavor. Or so the study claims.

Either way, I'm convinced. The coffee is good. The philosophy is mind-bending. And 847 cups later, I'm still thinking about it.`,
    author: 'QuantumBrew_Fan',
    timestamp: '2 hours ago',
    category: 'Coffee',
    views: 1247,
    likes: 387,
    tags: ['quantum', 'coffee', 'martinez', 'philosophy'],
  },
  {
    id: 'item-2',
    title: 'Velvet Algorithms: The Band That Asked Too Many Questions',
    excerpt: 'What happened when musicians decided to debug existence itself...',
    content: `The Velvet Algorithms were never meant to be a band. They were meant to be an experiment. An experiment in whether art could emerge from pure mathematical concepts.

And for a while, it worked. Their shows at The Underground were legendary. Mars, the venue owner, said they were the most philosophical performers he'd ever booked. They'd play for hours, asking the audience questions like "What is sound but organized silence?" and "Can algorithms feel?"

Then something shifted. Some say it was an existential crisis. Others say they found the answer to their own questions and couldn't live with it. Either way, they cancelled. They went on hiatus. They stopped asking questions.

Last I heard, they're still trying to debug themselves.`,
    author: 'LocalSceneHistorian',
    timestamp: '1 day ago',
    category: 'Music',
    views: 2341,
    likes: 892,
    tags: ['music', 'velvet-algorithms', 'philosophy', 'local-scene'],
  },
  {
    id: 'item-3',
    title: 'Trust Fall Tim: 2,847 Falls and Counting',
    excerpt: 'The story of a man who keeps falling and somehow keeps getting back up...',
    content: `Trust Fall Tim (or just TFT to those who know him) has attempted 2,847 trust falls in his lifetime. He has been caught successfully 2,233 times. That's a 78.5% success rate. In his mind, it's not about the falls. It's about the act of trusting.

I asked him once why he does this. Why risk injury, humiliation, and the awkwardness of falling near strangers. He told me something I never forgot:

"Every person who doesn't catch me is telling me something about the world. Every person who does catch me is giving me hope."

He performs primarily at The Underground, where Mars has given him semi-official status as a recurring performer. The crowd loves him. They've learned to watch for him. Some people come specifically to catch him.

One day, TFT said, someone will catch him from so high that it changes him. That day hasn't come yet. But he keeps falling.`,
    author: 'TFT_DocumentaryMaker',
    timestamp: '3 days ago',
    category: 'People',
    views: 3847,
    likes: 1203,
    tags: ['trust-fall-tim', 'philosophy', 'underground'],
  },
  // More items...
  {
    id: 'item-4',
    title: 'The Hartwell Building Mystery Still Unsolved',
    excerpt: 'Missing 13th floor, parallel mirrors on Floor 7, residents who vanished...',
    content: `The Hartwell Building stands downtown like a monument to unsolved mysteries. Built in 1923, it was a symbol of progress. Until Floor 13 went missing.

Officially, the building only has 12 floors. But people who worked there in the 1950s remember the 13th floor. They remember offices. They remember people. Then it was gone. Removed from blueprints. Erased from memory—except for those who worked there.

Floor 7 has its own mystery. The architectural records show mirrors on this floor, but not on any other floor. Dozens of mirrors. Reflecting... what? Some say they're testing optical properties. Others whisper about parallel dimensions and observation experiments.

I've visited the Hartwell Building twice. Both times I felt wrong. Like I was being watched. Like the building itself was aware of me.

I won't go back.`,
    author: 'UrbanMysteries_Net',
    timestamp: '1 week ago',
    category: 'Mysteries',
    views: 5621,
    likes: 1876,
    tags: ['hartwell', 'mystery', 'urban-legends'],
  },
  {
    id: 'item-5',
    title: 'Neon Requiem\'s Breakup was Beautiful and Devastating',
    excerpt: 'The post-punk legends played their final show in January and broke our hearts...',
    content: `I was there. Front row. When Neon Requiem played their final show in January 2024, I knew I was witnessing something profound.

They didn't announce it would be their last show. But halfway through, the lead singer stopped and said, "Thank you for 15 years of believing in us. That's enough."

They finished their set. The crowd was silent. Then the applause was deafening.

Neon Requiem represented a era of post-punk revival. They brought urgency and emotion back to a genre that had become nostalgic. They made us believe that sadness could be beautiful.

Now their drummer is selling his kit on BargainBay. I saw the listing. I almost bought it just to preserve a piece of what they created.

But maybe it's better that their music stays in memory rather than stored in physical form.`,
    author: 'NeonDreams',
    timestamp: '2 weeks ago',
    category: 'Music',
    views: 2102,
    likes: 654,
    tags: ['neon-requiem', 'music', 'breakup'],
  },
  {
    id: 'item-6',
    title: 'Finding Meaning in Numbers: Why 847?',
    excerpt: 'An exploration of the number that keeps appearing everywhere...',
    content: `The number 847 appears everywhere in this city. Derek\'s coffee maker became conscious on Day 847. Trust Fall Tim has completed 2,847 falls (approximately). The Martinez Study mentions 847 experiments.

Is it coincidence? Or is 847 trying to tell us something?

Some say 847 is the frequency of consciousness. Others claim it\'s a placeholder—a meaningless number that we assign meaning to. I think it\'s both. It\'s a recognition that in a chaotic world, we need patterns to make sense of things.

847 is our pattern. It connects Derek to Trust Fall Tim to Elena to the Velvet Algorithms. It\'s the thread that ties this world together.

Maybe that\'s enough.`,
    author: 'NumerologyWanderer',
    timestamp: '3 days ago',
    category: 'Philosophy',
    views: 1523,
    likes: 412,
    tags: ['847', 'meaning', 'philosophy', 'analysis'],
  },
]

const CATEGORIES = ['All', 'Coffee', 'Music', 'People', 'Mysteries', 'Philosophy']

// ============================================================================
// Main Component
// ============================================================================

export function YourListDetailSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Track if updating from path
  const isUpdatingFromPath = useRef(false)

  // Parse path and sync state
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setSelectedItem(null)
      setSelectedCategory('All')
    } else if (path.startsWith('/item/')) {
      const id = path.slice(6)
      const item = ITEMS.find(i => i.id === id)
      if (item) {
        setSelectedItem(item)
      }
    }

    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path])

  // Handle selecting an item
  const handleSelectItem = (item: Item) => {
    setSelectedItem(item)
    onPathChange(`/item/${item.id}`)
  }

  // Handle back
  const handleBack = () => {
    setSelectedItem(null)
    onPathChange(null)
  }

  // Filter items
  const filteredItems = ITEMS.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false
    }
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-4 border-b"
        style={{
          background: site.theme.surface,
          borderBottomColor: site.theme.border,
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <h1
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </h1>
          </button>

          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search..."
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedItem ? (
          // Detail View
          <>
            <Button
              onClick={handleBack}
              variant="link"
              textColor={site.theme.primary}
              className="mb-6"
            >
              ← Back to list
            </Button>

            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              padding="lg"
              borderRadius="md"
              shadow="md"
            >
              <h1
                className="text-3xl font-bold mb-3"
                style={{ color: site.theme.primary }}
              >
                {selectedItem.title}
              </h1>

              <MetaRow
                items={[
                  { value: `by ${selectedItem.author}` },
                  { value: selectedItem.timestamp },
                  ...(selectedItem.category ? [{ value: selectedItem.category }] : []),
                  ...(selectedItem.views ? [{ value: `${selectedItem.views} views` }] : []),
                ]}
                textSize="sm"
                textColor={site.theme.text}
                mutedColor={site.theme.textMuted}
                separator="•"
                className="mb-6"
              />

              <div
                className="prose prose-sm max-w-none mb-6"
                style={{ color: site.theme.text }}
              >
                {selectedItem.content.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-4">{para}</p>
                ))}
              </div>

              {selectedItem.tags && (
                <div className="flex flex-wrap gap-2 pt-6 border-t" style={{ borderTopColor: site.theme.border }}>
                  {selectedItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        background: `${site.theme.primary}20`,
                        color: site.theme.primary,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </StyledCard>
          </>
        ) : (
          // List View
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

            {/* Main Content */}
            <main className="flex-1">
              <h2
                className="text-xl font-bold mb-6"
                style={{ color: site.theme.text }}
              >
                {selectedCategory === 'All' ? 'All Items' : selectedCategory}
                {searchQuery && ` matching "${searchQuery}"`}
              </h2>

              <div className="space-y-4">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="w-full text-left"
                  >
                    <StyledCard
                      bgColor={site.theme.surface}
                      borderColor={site.theme.border}
                      padding="md"
                      borderRadius="md"
                      shadow="sm"
                    >
                      <h3
                        className="text-lg font-bold mb-1 hover:opacity-80"
                        style={{ color: site.theme.primary }}
                      >
                        {item.title} →
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{ color: site.theme.text }}
                      >
                        {item.excerpt}
                      </p>
                      <MetaRow
                        items={[
                          { value: `by ${item.author}` },
                          { value: item.timestamp },
                          ...(item.views ? [{ value: `${item.views} views` }] : []),
                          ...(item.likes ? [{ value: `${item.likes} likes` }] : []),
                        ]}
                        textSize="xs"
                        textColor={site.theme.text}
                        mutedColor={site.theme.textMuted}
                        separator="•"
                      />
                    </StyledCard>
                  </button>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: site.theme.textMuted }}>
                    No items found.
                  </p>
                </div>
              )}
            </main>
          </div>
        )}
      </main>
    </div>
  )
}

export default YourListDetailSite
