/**
 * QuantumBrewBlog Site
 *
 * An obsessive fan blog about Quantum Coffee - way too detailed,
 * treating a joke coffee method as if it's a serious scientific endeavor.
 * Peak "guy who's way too into this" energy.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.quantumbrewblog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  tags: string[]
  readTime: string
  comments: number
  isControversial?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'wave-function-collapse-methodology',
    title: 'The Optimal Wave Function Collapse Methodology for Your Morning Pour-Over',
    date: 'January 15, 2026',
    excerpt: 'After 847 trials, I\'ve finally determined the ideal observation angle for collapsing your coffee\'s wave function without introducing bitter notes.',
    readTime: '47 min read',
    comments: 234,
    content: [
      'For years, casual quantum brewers have been collapsing their coffee\'s wave function willy-nilly, with no regard for the delicate superposition of flavor compounds. This ends today.',
      'In my basement laboratory (my wife calls it a "problem"), I conducted 847 separate brewing trials using a modified Heisenberg uncertainty compensator attached to a standard Chemex.',
      'Key findings:',
      '• Observation angle matters. Looking at your coffee from above collapses the wave function too aggressively, resulting in what I call "Schrödinger\'s Bitterness."',
      '• The ideal angle is 23.7 degrees from horizontal, using only peripheral vision.',
      '• Never directly acknowledge your coffee until it has reached exactly 176.3°F. Your coffee can sense your anticipation.',
      '• If you think about your coffee while it brews, you\'ve already ruined it. I recommend meditation or watching television.',
      'The mathematics prove this beyond doubt. See my 40-page appendix (available for $29.99 on my Patreon).',
    ],
    tags: ['methodology', 'wave-function', 'pour-over', 'science', 'my-wife-left-me'],
  },
  {
    id: 'observer-effect-dark-roast',
    title: 'Why Dark Roast Drinkers Are Fundamentally Misunderstanding Observer Effect',
    date: 'January 8, 2026',
    excerpt: 'Dark roast enthusiasts claim their beans are "beyond observation." They couldn\'t be more wrong, and I have the restraining order from the local Starbucks to prove it.',
    readTime: '23 min read',
    comments: 891,
    isControversial: true,
    content: [
      'Let me be clear: I respect all coffee drinkers. But dark roast enthusiasts who claim their heavily roasted beans have "transcended" quantum observation are not only wrong—they\'re dangerous.',
      'I confronted several dark roast drinkers at my local Starbucks about this. (Note: I am no longer welcome at that Starbucks. Or the one on 5th Street. Or any Starbucks in the tri-county area.)',
      'The science is simple: ALL coffee exists in quantum superposition until observed. Dark roasting does not, as some claim, "pre-collapse the wave function through thermal trauma."',
      'That\'s not how any of this works. I showed them my charts. They called security.',
      'To the woman who pepper-sprayed me: I forgive you. You were simply defending an indefensible position.',
    ],
    tags: ['dark-roast', 'controversy', 'banned-from-starbucks', 'restraining-orders'],
  },
  {
    id: 'entanglement-brewing-pairs',
    title: 'Quantum Entanglement Brewing: Can Two Cups Be Connected Across Space?',
    date: 'December 29, 2025',
    excerpt: 'I brewed one cup here and sent the other to my estranged brother in Portland. When I added sugar to mine, did his get sweeter? The results will shock you.',
    readTime: '31 min read',
    comments: 456,
    content: [
      'After my brother stopped returning my calls (something about "boundaries" and "concerning behavior"), I decided to prove our connection through quantum coffee entanglement.',
      'The Setup: I brewed two cups from the same batch of quantum-ground beans. One stayed with me. One I FedExed to Portland.',
      'The Experiment: At exactly 8:47 AM PST, I added one sugar cube to my cup while focusing my intention toward Portland.',
      'The Results: My brother blocked my number, so I can\'t confirm the results. But I FELT something. Science is about feelings, right?',
      'Next month I\'m trying this with 47 cups sent to various family members. Surely someone will respond.',
      'UPDATE: My therapist says this is "displacement behavior." I say she doesn\'t understand quantum mechanics.',
    ],
    tags: ['entanglement', 'family', 'experiment', 'portland', 'therapy'],
  },
  {
    id: 'grinder-particle-duality',
    title: 'Your Burr Grinder is Destroying Particle-Wave Duality (And Your Marriage)',
    date: 'December 22, 2025',
    excerpt: 'A comprehensive analysis of why blade grinders preserve quantum states better than burr grinders, and why my wife took the burr grinder when she left.',
    readTime: '38 min read',
    comments: 127,
    content: [
      'When Jennifer left, she took the KitchenAid, the good towels, and the Baratza Encore burr grinder. At first I was devastated. Then I realized: she did me a favor.',
      'Burr grinders, with their precise, consistent grinding, force coffee particles into a deterministic state. They CHOOSE a grind size. This is violence against superposition.',
      'My $12 blade grinder from Target? It creates a beautiful chaos of particle sizes—large chunks existing alongside fine powder, each in its own quantum probability cloud.',
      'Jennifer said I "cared more about coffee than our relationship." Jennifer also used a burr grinder. Coincidence? I think not.',
      'The science doesn\'t lie. Consistency is the enemy of quantum brewing. Embrace chaos. Embrace the blade.',
      'I sleep much better now. On my couch. By choice.',
    ],
    tags: ['grinders', 'blade-vs-burr', 'jennifer', 'couch-life', 'chaos-theory'],
  },
  {
    id: 'cats-and-quantum-coffee',
    title: 'I Put My Coffee in a Box with My Cat: A Schrödinger Brewing Experiment',
    date: 'December 15, 2025',
    excerpt: 'Before you call PETA, the cat was fine. The coffee was transcendent. My landlord was less understanding.',
    readTime: '19 min read',
    comments: 2341,
    isControversial: true,
    content: [
      'For legal reasons, I need to state upfront: Mr. Whiskers was in the box for only 4 minutes and emerged completely unharmed, if somewhat caffeinated.',
      'The hypothesis was simple: if a cat can exist in superposition (alive/dead) until observed, could coffee exist in superposition (good/bad) in the same box?',
      'I placed a fresh pour-over and Mr. Whiskers in a cardboard box. I did not observe them. I waited.',
      'Results: Upon opening, the coffee was the best I\'d ever tasted. Mr. Whiskers had knocked it over and was licking the remnants. He was vibrating slightly.',
      'My landlord says "one more incident" and I\'m out. But I\'ve learned something profound: cats improve quantum coffee. More testing needed.',
      'Mr. Whiskers now follows me around whenever I brew. I think we\'ve entangled.',
    ],
    tags: ['schrodinger', 'cats', 'mr-whiskers', 'landlord-issues', 'ethics'],
  },
  {
    id: 'temperature-probability',
    title: 'The 73-Page Temperature Probability Matrix You Didn\'t Know You Needed',
    date: 'December 8, 2025',
    excerpt: 'What temperature should your quantum coffee be? That\'s the wrong question. Here\'s a matrix of ALL possible temperatures it COULD be.',
    readTime: '4 hours read',
    comments: 3,
    content: [
      'Most brewing guides give you a single temperature: 195-205°F. This is reductionist garbage.',
      'In quantum brewing, your water exists at ALL temperatures simultaneously until measured. By specifying a temperature, you\'re collapsing infinite possibility into boring certainty.',
      'I\'ve created a 73-page matrix showing the probability distribution of flavor outcomes for every possible temperature from 32°F to 212°F, in 0.1-degree increments.',
      'Key insight from page 47: At exactly 187.3°F, there\'s a 0.003% chance your coffee tastes like "distant memories of your grandmother\'s kitchen." Worth pursuing.',
      'The full matrix is available on my website for $149.99. Or $199.99 for the annotated version with my personal notes (mostly about Jennifer).',
    ],
    tags: ['temperature', 'matrices', 'mathematics', 'jennifer-again', 'premium-content'],
  },
  {
    id: 'vitalityrx-quantumil-review',
    title: 'I Tried QUANTUMIL (The Quantum Coffee Intolerance Drug) So You Don\'t Have To',
    date: 'November 30, 2025',
    excerpt: 'VitalityRx claims their new drug helps with "Quantum Coffee Intolerance Syndrome." I volunteered as tribute. Day 3: I can taste colors.',
    readTime: '12 min read',
    comments: 567,
    content: [
      'When I saw the VitalityRx ad for QUANTUMIL, I knew I had to investigate. Could a pill really help the quantum-coffee-intolerant?',
      'Day 1: Took the recommended dose. Nothing unusual. Coffee tasted normal (which is to say, existing in multiple flavor states simultaneously).',
      'Day 2: Mild temporal displacement. Felt like Tuesday was both happening and had already happened. Coffee tasted like potential.',
      'Day 3: I can taste colors. My coffee was purple and slightly resentful. I called Jennifer to tell her. She hung up.',
      'Day 4: Side effect kicked in—"Spontaneous quantum entanglement with household pets." Mr. Whiskers and I now know each other\'s thoughts. He judges me.',
      'Day 5: Stopped taking it. I prefer my coffee mysterious, not medically regulated.',
      'Final verdict: 3/5 stars. Effective but I miss not knowing my cat\'s opinions of me.',
    ],
    tags: ['vitalityrx', 'quantumil', 'drug-review', 'mr-whiskers-judges-me', 'synesthesia'],
  },
]

const SIDEBAR_RESOURCES = [
  { title: 'My 847 Brewing Trial Spreadsheet', price: '$29.99' },
  { title: '73-Page Temperature Matrix', price: '$149.99' },
  { title: 'Jennifer Recovery Meditation Audio', price: 'FREE' },
  { title: 'Legal Defense Fund', price: 'Donations Welcome' },
  { title: 'Mr. Whiskers Entanglement Journal', price: '$19.99' },
]

const ABOUT_TEXT = `Hi, I'm Derek. By day, I'm an IT consultant (currently between contracts). By night (and also day), I'm a quantum coffee researcher, philosopher, and reluctant cat co-parent.

After Jennifer left, I threw myself into understanding the intersection of quantum mechanics and specialty coffee. Some call it an "unhealthy coping mechanism." I call it SCIENCE.

This blog is my life's work. If you find value in it, please consider supporting my Patreon, buying my resources, or simply not calling the authorities when you see me conducting experiments at local cafes.

I am banned from: 4 Starbucks, 2 Peet's, 1 independent roaster (they really overreacted to my Geiger counter).`

// ============================================================================
// DB Adapter
// ============================================================================

/** Adapts a DB SiteContentItem to the local BlogPost interface */
function dbToBlogPost(item: SiteContentItem): BlogPost {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    date: m.date || (item.publishedAt ? new Date(item.publishedAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''),
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    tags: item.tags || [],
    readTime: m.readTime || m.read_time || '',
    comments: m.comments ?? item.commentCount ?? 0,
    isControversial: m.isControversial ?? m.is_controversial,
  }
}

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({ post, onSelect }: { post: BlogPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#ffffff"
      borderColor="#fcd34d"
      textColor="#78350f"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-amber-600">{post.date}</span>
        {post.isControversial && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
            🔥 CONTROVERSIAL
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-amber-900 mb-2 hover:text-amber-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>☕ {post.readTime}</span>
        <span>💬 {post.comments} comments</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 4).map(tag => (
          <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#fcd34d"
      textColor="#78350f"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#b45309"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-amber-600">{post.date}</span>
        {post.isControversial && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
            🔥 CONTROVERSIAL
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-amber-900 mb-4">{post.title}</h1>
      <div className="prose prose-amber max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-amber-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mt-4"
        bgColor="#fef3c7"
        borderColor="#fcd34d"
        textColor="#78350f"
      >
        <p className="font-bold text-amber-800">💬 {post.comments} Comments</p>
        <p className="text-amber-600 text-xs mt-1">
          Comments are disabled after the "incident." You know which one.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function QuantumBrewBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  /** Fetch blog posts from the database, fall back to hardcoded data */
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'quantumbrew' })
  const posts = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToBlogPost)
    return BLOG_POSTS
  }, [dbContent])

  return (
    <div className="min-h-full" style={{ background: '#FEF7E6' }}>
      {/* Header */}
      <header className="bg-amber-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">☕</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'QuantumBrewBlog'}</h1>
              <p className="text-amber-200 text-sm italic">
                "Observing Coffee So You Don't Have To" ™
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-amber-200 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-amber-200 hover:text-white"
            >
              About Derek
            </button>
            <button className="text-amber-200 hover:text-white">Resources</button>
            <button className="text-amber-200 hover:text-white">Contact (Disabled)</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <StyledCard
                variant="default"
                padding="lg"
                borderRadius="md"
                shadow="md"
                bgColor="#ffffff"
                borderColor="#fcd34d"
                textColor="#78350f"
              >
                <h2 className="text-xl font-bold text-amber-900 mb-4">About Derek</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">🧔</div>
                  <div>
                    <p className="font-bold text-amber-800">Derek Observerson</p>
                    <p className="text-sm text-gray-600">Quantum Coffee Researcher</p>
                    <p className="text-xs text-gray-500">IT Consultant (seeking employment)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#fef3c7"
                  borderColor="#fcd34d"
                  textColor="#78350f"
                >
                  <p className="font-bold text-amber-800">📊 Stats</p>
                  <ul className="text-amber-700 text-xs mt-2">
                    <li>• 847 documented brewing experiments</li>
                    <li>• 6 restraining orders (coffee-related)</li>
                    <li>• 1 cat (Mr. Whiskers)</li>
                    <li>• 0 Jennifers (currently)</li>
                    <li>• ∞ dedication to the craft</li>
                  </ul>
                </StyledCard>
              </StyledCard>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="md"
                  shadow="none"
                  className="mb-4"
                  bgColor="#fef3c7"
                  borderColor="#fcd34d"
                  textColor="#78350f"
                >
                  <p className="text-amber-800 text-sm">
                    🔬 <strong>Latest:</strong> 847 trials. 3 years. 1 divorce. The definitive
                    quantum coffee methodology is HERE.
                  </p>
                </StyledCard>
                {posts.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onSelect={() => setSelectedPost(post)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 hidden md:block">
            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fcd34d"
              textColor="#78350f"
            >
              <h3 className="font-bold text-amber-900 mb-2">📬 Newsletter</h3>
              <p className="text-xs text-gray-600 mb-2">
                Weekly quantum brewing insights. Jennifer, if you're reading this, I've changed.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#b45309"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Resources */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fcd34d"
              textColor="#78350f"
            >
              <h3 className="font-bold text-amber-900 mb-2">📚 Premium Resources</h3>
              <div className="space-y-2">
                {SIDEBAR_RESOURCES.map((resource, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-amber-800">{resource.title}</p>
                    <p className="text-amber-600 font-bold">{resource.price}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Mr. Whiskers Corner */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fcd34d"
              textColor="#78350f"
            >
              <h3 className="font-bold text-amber-900 mb-2">🐱 Mr. Whiskers Corner</h3>
              <div className="text-4xl text-center mb-2">😺</div>
              <p className="text-xs text-gray-600 italic">
                "Mr. Whiskers' Current Mood: Judgmental but caffeinated"
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Since the entanglement experiment, we share thoughts. He disapproves of most of them.
              </p>
            </StyledCard>

            {/* Legal */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2f2"
              borderColor="#fca5a5"
              textColor="#7f1d1d"
            >
              <h3 className="font-bold text-red-800 mb-2">⚠️ Legal Notice</h3>
              <p className="text-xs text-red-700">
                This blog does not constitute medical, scientific, or relationship advice.
                Do not put cats in boxes. Do not confront strangers about their coffee opinions.
                If you experience temporal displacement, consult a physician.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 py-4 px-4 text-center text-xs">
        <p>© 2025 {site?.name || 'QuantumBrewBlog'}. All rights reserved (except where legally prohibited).</p>
        <p className="mt-1">
          Not affiliated with any actual quantum physicists, coffee shops, or ex-wives.
        </p>
      </footer>
    </div>
  )
}

export default QuantumBrewBlogSite
