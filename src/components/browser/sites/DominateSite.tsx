/**
 * DOMINATE Site
 *
 * Chad Thundercoach's high-intensity life coaching empire.
 * Every piece of advice is delivered with maximum aggression,
 * treating mundane tasks like preparation for WAR.
 * The advice is technically correct but delivered with unhinged energy.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.dominate

// ============================================================================
// Types & Data
// ============================================================================

interface MotivationalPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  intensityLevel: number // 1-5 fire emojis
  category: string
  readTime: string
  warriorsEngaged: number
  isPremiumContent?: boolean
}

// Hardcoded MOTIVATIONAL_POSTS removed -- DB is the sole source of truth

const PREMIUM_COURSES = [
  { name: 'ABSOLUTE DOMINATION BREAKFAST MASTERY', price: '$497' },
  { name: 'THE 3:47 AM AWAKENING SYSTEM', price: '$697' },
  { name: 'COLD SHOWER CRYO WARRIOR BOOTCAMP', price: '$299' },
  { name: 'EMAIL INBOX WARFARE INTENSIVE', price: '$397' },
  { name: 'SOCIAL SUPREMACY: FRIENDSHIP PROTOCOL', price: '$447' },
  { name: 'SLEEP IS FOR THE WEAK (AUDIO SERIES)', price: '$199' },
]

const ABOUT_TEXT = `I'm CHAD THUNDERCOACH, and I INVENTED productivity. (I didn't technically invent it, but I PERFECTED it through SHEER INTENSITY.)

After my second divorce (she couldn't handle the GRIND), I dedicated my life to one mission: HELPING WARRIORS LIKE YOU CRUSH EVERY ASPECT OF EXISTENCE.

My morning routine starts at 3:47 AM. Not 3:45 (for QUITTERS), not 3:50 (for LAZY OPTIMISTS). 3:47 AM is when CHAMPIONS ARE FORGED.

I've been featured in: my own YouTube channel, my Substack, and several noise complaint hearings.

Former professions: Insurance adjuster, CrossFit instructor (banned), motivational speaker (also banned), and currently: PROFESSIONAL DOMINATOR.

My competition - those SOFT life coaches who talk about "self-care" and "work-life balance" - they FEAR me. As they SHOULD.`

// ============================================================================
// Components
// ============================================================================

function IntensityMeter({ level }: { level: number }) {
  return (
    <span className="font-mono tracking-wide">
      {'🔥'.repeat(level)}
      <span className="opacity-30">{'🔥'.repeat(5 - level)}</span>
    </span>
  )
}

function MotivationCard({ post, onSelect }: { post: MotivationalPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#1A1A1A"
      borderColor="#DC2626"
      textColor="#FFFFFF"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-red-400 font-bold">{post.category}</span>
        {post.isPremiumContent && (
          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
            PREMIUM
          </span>
        )}
      </div>
      <h2 className="text-lg font-black text-white mb-2 hover:text-red-400 uppercase leading-tight">
        {post.title}
      </h2>
      <p className="text-sm text-gray-300 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">INTENSITY: <IntensityMeter level={post.intensityLevel} /></span>
        <span className="text-red-400 font-bold">{post.warriorsEngaged.toLocaleString()} WARRIORS ENGAGED</span>
      </div>
      <div className="flex justify-between items-center text-xs mt-2 text-gray-500">
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: MotivationalPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#1A1A1A"
      borderColor="#DC2626"
      textColor="#FFFFFF"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4 font-bold"
      >
        ← RETREAT TO MAIN FEED
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-red-400 font-bold">{post.category}</span>
        {post.isPremiumContent && (
          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
            PREMIUM CONTENT
          </span>
        )}
      </div>
      <h1 className="text-2xl font-black text-white mb-4 uppercase leading-tight">{post.title}</h1>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
        <span>INTENSITY: <IntensityMeter level={post.intensityLevel} /></span>
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
      <div className="prose prose-invert max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-200 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-red-900">
        <div className="flex items-center justify-between">
          <span className="text-red-400 font-bold text-sm">
            {post.warriorsEngaged.toLocaleString()} WARRIORS HAVE ENGAGED WITH THIS CONTENT
          </span>
        </div>
      </div>
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mt-4"
        bgColor="#2A0A0A"
        borderColor="#DC2626"
        textColor="#FFFFFF"
      >
        <p className="font-black text-red-400 text-lg">NOW GO EXECUTE, CHAMPION.</p>
        <p className="text-gray-400 text-xs mt-1">
          Share this with someone who needs to hear it. They probably WON'T listen. That's THEIR loss.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

/**
 * Adapter: maps SiteContentItem to local MotivationalPost interface.
 * Expects metadata to carry post-specific fields (intensityLevel, category, readTime, etc.)
 */
function dbToMotivationalPost(item: SiteContentItem): MotivationalPost {
  // Body may be stored as a single string with paragraph breaks, or as JSON array
  let contentParagraphs: string[] = []
  if (item.metadata?.content && Array.isArray(item.metadata.content)) {
    contentParagraphs = item.metadata.content
  } else if (item.body) {
    contentParagraphs = item.body.split('\n\n').filter(Boolean)
  }

  return {
    id: item.slug,
    title: item.title,
    date: item.metadata?.date ?? (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'),
    excerpt: item.summary ?? '',
    content: contentParagraphs,
    intensityLevel: item.metadata?.intensityLevel ?? 3,
    category: item.category ?? item.metadata?.category ?? 'UNCATEGORIZED',
    readTime: item.metadata?.readTime ?? '? min read',
    warriorsEngaged: item.viewCount ?? item.metadata?.warriorsEngaged ?? 0,
    isPremiumContent: item.metadata?.isPremiumContent ?? false,
  }
}

export function DominateSite({ siteId }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('dominate')

  const posts = useMemo(() => dbContent.map(dbToMotivationalPost), [dbContent])

  const [selectedPost, setSelectedPost] = useState<MotivationalPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <header className="py-6 px-4" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #7F0000 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">💪</span>
            <div>
              <h1 className="text-3xl font-black text-white tracking-wider">
                {site?.name || 'DOMINATE'}
              </h1>
              <p className="text-red-200 text-sm font-bold uppercase tracking-wide">
                CRUSH YOUR GOALS OR THEY CRUSH YOU
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-red-200 hover:text-white font-bold uppercase"
            >
              BATTLE STATION
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-red-200 hover:text-white font-bold uppercase"
            >
              ABOUT CHAD
            </button>
            <button className="text-red-200 hover:text-white font-bold uppercase">
              COURSES
            </button>
            <button className="text-red-200 hover:text-white font-bold uppercase">
              WARRIOR COMMUNITY
            </button>
          </nav>
        </div>
      </header>

      {/* Motivational Banner */}
      {!selectedPost && !showAbout && (
        <div className="bg-black border-y-4 border-red-600 py-3 px-4">
          <p className="text-center text-white font-black text-sm uppercase tracking-widest animate-pulse">
            YOU ARE EITHER GETTING STRONGER OR YOU ARE DYING. THERE IS NO MIDDLE GROUND. - CHAD THUNDERCOACH
          </p>
        </div>
      )}

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
                bgColor="#1A1A1A"
                borderColor="#DC2626"
                textColor="#FFFFFF"
              >
                <h2 className="text-2xl font-black text-white mb-4 uppercase">ABOUT CHAD THUNDERCOACH</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">💪</div>
                  <div>
                    <p className="font-black text-red-400 text-xl">CHAD THUNDERCOACH</p>
                    <p className="text-sm text-gray-400">PROFESSIONAL DOMINATOR</p>
                    <p className="text-xs text-gray-500">Inventor of Productivity (self-proclaimed)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-line mb-6">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#2A0A0A"
                  borderColor="#DC2626"
                  textColor="#FFFFFF"
                >
                  <p className="font-black text-red-400 mb-2">STATS THAT MATTER:</p>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>- Wake-up time: 3:47 AM (EVERY. SINGLE. DAY.)</li>
                    <li>- Divorces: 2 (THEY couldn't handle the GRIND)</li>
                    <li>- Hours of sleep: 3.5 (POWER REST, not sleep)</li>
                    <li>- Shower temperature: ARCTIC</li>
                    <li>- Courses sold: 47,000+</li>
                    <li>- Noise complaints: 23 (and COUNTING)</li>
                    <li>- Regrets: ZERO (regret is for the WEAK)</li>
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
                  bgColor="#2A0A0A"
                  borderColor="#DC2626"
                  textColor="#FFFFFF"
                >
                  <p className="text-red-400 text-sm font-bold uppercase">
                    NEW: The complete THUNDERCOACH ANTI-SLEEP PROTOCOL is now available. Stop WASTING 8 hours a day on UNCONSCIOUS QUITTING.
                  </p>
                </StyledCard>
                {posts.map(post => (
                  <MotivationCard
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
            {/* Join the Warriors */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1A1A1A"
              borderColor="#DC2626"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-red-400 mb-2 uppercase">JOIN THE WARRIORS</h3>
              <p className="text-xs text-gray-400 mb-2">
                Daily DOMINATION emails at 4:00 AM. If you're not awake to read them, you're already LOSING.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border rounded mb-2 bg-black border-red-600 text-white placeholder-gray-500"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#DC2626"
                textColor="#ffffff"
              >
                ENLIST NOW
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {Math.floor(Math.random() * 50000 + 200000).toLocaleString()} WARRIORS ALREADY ENLISTED
              </p>
            </StyledCard>

            {/* Premium Courses */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1A1A1A"
              borderColor="#DC2626"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-red-400 mb-2 uppercase">PREMIUM COURSES</h3>
              <div className="space-y-2">
                {PREMIUM_COURSES.map((course, i) => (
                  <div key={i} className="text-xs border-b border-gray-800 pb-2 last:border-0">
                    <p className="text-white font-bold">{course.name}</p>
                    <p className="text-red-400 font-black">{course.price}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Daily Affirmation */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#2A0A0A"
              borderColor="#DC2626"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-yellow-400 mb-2 uppercase">TODAY'S AFFIRMATION</h3>
              <p className="text-white text-sm font-bold italic">
                "I AM STRONGER THAN MY EXCUSES. MY EXCUSES ARE WEAK. LIKE MY COMPETITION. LIKE EVERYONE WHO ISN'T ME."
              </p>
              <p className="text-xs text-gray-500 mt-2">
                - SCREAM this at your mirror at 3:47 AM
              </p>
            </StyledCard>

            {/* Warning */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#1A0505"
              borderColor="#7F0000"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-red-500 mb-2 uppercase">SOFT PEOPLE WARNING</h3>
              <p className="text-xs text-red-300">
                This website contains EXTREME INTENSITY. If you're not ready to DOMINATE, please close this tab and return to your COMFORTABLE MEDIOCRITY.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Side effects may include: excessive motivation, alienating friends and family, being "too intense" at parties.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-xs" style={{ background: '#0A0A0A' }}>
        <p className="text-gray-400">
          © 2025 {site?.name || 'DOMINATE'} | CHAD THUNDERCOACH ENTERPRISES LLC
        </p>
        <p className="text-gray-600 mt-1">
          Legal: This is not medical, financial, or relationship advice. Results not typical. Chad's ex-wives have not endorsed this content.
        </p>
        <p className="text-red-600 font-bold mt-2 uppercase">
          NOW STOP READING AND GO EXECUTE, WARRIOR.
        </p>
      </footer>
    </div>
  )
}

export default DominateSite
