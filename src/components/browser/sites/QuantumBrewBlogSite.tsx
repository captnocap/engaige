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

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'quantumbrew' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

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
