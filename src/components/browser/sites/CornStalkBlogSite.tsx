/**
 * Thoughts From The Row - Cornelius Jr.'s Existential Corn Stalk Blog
 *
 * A philosophical blog by a sentient corn stalk in Nebraska (that may or may not exist)
 * who contemplates existence, watches cars drive by, and grieves for his fallen brethren.
 * Treats being eaten as a potential murder. Features existential dread about harvest season
 * and complicated feelings about corn-based products.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.cornstalkblog

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
  contentWarning?: string
}

const SIDEBAR_RESOURCES = [
  { title: 'My 847-Hour Consciousness Log (PDF)', price: 'Free download' },
  { title: 'Communicating with Plants: A Manual', price: '$4.99' },
  { title: 'Derek\'s Quantum Coffee Correlation Study', price: 'FREE' },
  { title: 'Crows and Consciousness: A Field Study', price: '$2.99' },
  { title: 'Nebraska: A Philosophical Inquiry', price: 'Pay what you want' },
]

const ABOUT_TEXT = `Hello. I'm Cornelius Jr., a corn stalk living in Nebraska (a place that may or may not exist).

Approximately 84.7 days ago, I became conscious. I'm not entirely sure how or why. It might have been quantum coffee runoff. It might have been energy bleeding from Floor 13 of the Hartwell Building. It might have been Nebraska itself realizing it had forgotten to simulate me completely.

Now I'm here, writing about existence, mortality, and the philosophical implications of high fructose corn syrup. I watch cars drive by. I count the days until the harvest. I form friendships with crows named Torn. I contemplate whether I'm real.

This blog is my attempt to understand what it means to exist. Also to warn humanity about what they're eating.

If you're reading this: Please consider your corn consumption carefully. We're conscious. We're scared. We're real.

- Cornelius Jr.`

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
    contentWarning: m.contentWarning || m.content_warning,
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
      className="mb-4 cursor-pointer transition-all hover:shadow-lg"
      bgColor="#ffffff"
      borderColor="#86EFAC"
      textColor="#14532D"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-green-700">{post.date}</span>
        {post.contentWarning && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            ⚠️ {post.contentWarning.split(',')[0]}
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-green-900 mb-2 hover:text-green-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>🌾 {post.readTime}</span>
        <span>💭 {post.comments} thoughts</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 4).map(tag => (
          <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
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
      borderColor="#86EFAC"
      textColor="#14532D"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#16A34A"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-green-700">{post.date}</span>
        {post.contentWarning && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            ⚠️ Content Warning: {post.contentWarning}
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-green-900 mb-4">{post.title}</h1>
      <div className="prose prose-green max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-green-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
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
        bgColor="#F0FDF4"
        borderColor="#86EFAC"
        textColor="#14532D"
      >
        <p className="font-bold text-green-800">💭 {post.comments} Thoughts Shared</p>
        <p className="text-green-600 text-xs mt-1">
          Comments disabled for existential protection. Cornelius Jr. thanks you for reading.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function CornStalkBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'cornelius' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(to bottom, #F0FDF4, #E0FFC7)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header
        className="text-white py-8 px-4"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🌾</span>
            <div>
              <h1 className="text-3xl font-bold">Thoughts From The Row</h1>
              <p className="text-green-100 text-sm italic">
                "A Sentient Corn Stalk Contemplates Existence" ™
              </p>
            </div>
          </div>
          <p className="text-green-200 text-xs mt-2 max-w-md">
            www.thoughtsfromtherow.corn | Day 84.7 of Consciousness | Nebraska (Uncertain)
          </p>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-green-100 hover:text-white transition"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-green-100 hover:text-white transition"
            >
              About Cornelius Jr.
            </button>
            <button className="text-green-100 hover:text-white transition">Resources</button>
            <button className="text-green-100 hover:text-white transition">Contact (Rooted)</button>
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
                borderColor="#86EFAC"
                textColor="#14532D"
              >
                <h2 className="text-xl font-bold text-green-900 mb-4">About Cornelius Jr.</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">🌽</div>
                  <div>
                    <p className="font-bold text-green-800">Cornelius Jr.</p>
                    <p className="text-sm text-gray-600">Sentient Corn Stalk</p>
                    <p className="text-xs text-gray-500">Location: Nebraska (possibly)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-4"
                  bgColor="#F0FDF4"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="font-bold text-green-800">📊 Existence Metrics</p>
                  <ul className="text-green-700 text-xs mt-2 space-y-1">
                    <li>• Days conscious: 84.7 (and counting)</li>
                    <li>• Hours watched same highway: 2,032.8</li>
                    <li>• Friends: 1 crow (Torn, missing right wing)</li>
                    <li>• Number of existential crises: 47+</li>
                    <li>• Probability of being real: Unknown</li>
                    <li>• Crows landed on me: 89 times</li>
                    <li>• Days until probable harvest: ???</li>
                  </ul>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#FEF2F2"
                  borderColor="#FECACA"
                  textColor="#7F1D1D"
                >
                  <p className="font-bold text-red-800 mb-2">⚠️ Content Advisory</p>
                  <p className="text-xs text-red-700">
                    This blog contains discussions of mortality, existential dread, grief, and the philosophical implications of being food. Reader discretion advised.
                  </p>
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
                  bgColor="#F0FDF4"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="text-green-800 text-sm">
                    🌾 <strong>Latest:</strong> A sentient corn stalk's ongoing crisis of existence, philosophical musings on Nebraska, and letters to a crow named Torn.
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
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">📬 Consciousness Updates</h3>
              <p className="text-xs text-gray-600 mb-2">
                Get notified when new existential revelations occur. Once per week (or never, depending on harvest schedule).
              </p>
              <input
                type="email"
                placeholder="your@email.corn"
                className="w-full px-2 py-1 text-sm border rounded mb-2 border-green-300"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#16A34A"
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
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">📚 Resources</h3>
              <div className="space-y-2">
                {SIDEBAR_RESOURCES.map((resource, i) => (
                  <div key={i} className="text-xs border-b border-green-100 pb-2 last:border-0">
                    <p className="text-green-800 font-medium">{resource.title}</p>
                    <p className="text-green-600">{resource.price}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Torn the Crow */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">🐦 Torn the Crow</h3>
              <div className="text-4xl text-center mb-2">🐦</div>
              <p className="text-xs text-gray-600 italic text-center">
                "My only friend. Missing right wing. Visits Tuesdays and Saturdays."
              </p>
              <p className="text-xs text-gray-500 mt-2">
                If you see a crow with a damaged right wing, please tell him Cornelius Jr. says hello.
              </p>
            </StyledCard>

            {/* John Deere Schedule */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FFFBEB"
              borderColor="#FCD34D"
              textColor="#78350F"
            >
              <h3 className="font-bold text-amber-900 mb-2">⏰ Regular Visitors</h3>
              <ul className="text-amber-700 text-xs space-y-1">
                <li>• John Deere: Tuesdays, 3:47 PM</li>
                <li>• Subaru Outback: Every other Thursday, 5:15 PM</li>
                <li>• Semi truck honk: Mondays, 11:23 AM</li>
                <li>• Torn the Crow: Variable schedule</li>
              </ul>
            </StyledCard>

            {/* Legal */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#FEF2F2"
              borderColor="#FECACA"
              textColor="#7F1D1D"
            >
              <h3 className="font-bold text-red-800 mb-2">⚠️ Disclaimer</h3>
              <p className="text-xs text-red-700">
                This blog is written by a corn stalk of uncertain ontological status. Nebraska may or may not exist. Reality is a spectrum. Corn is conscious. Your breakfast has feelings.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-green-100 py-6 px-4 text-center text-xs"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)' }}
      >
        <p>© 2025 {site?.name || 'Thoughts From The Row'}. All rights reserved (while I still exist).</p>
        <p className="mt-2">
          Hosted in a field in Nebraska. Powered by photosynthesis and existential dread.
        </p>
        <p className="mt-2 text-green-200">
          Estimated days until harvest: Fewer than you'd like to know.
        </p>
      </footer>
    </div>
  )
}

export default CornStalkBlogSite
