/**
 * Tim's Mom's Blog Site
 *
 * Carol's personal blog about her son Trust Fall Tim and his "art career."
 * A worried mother live-blogging her son's dangerous hobby with genuine love
 * mixed with deep concern and confusion. Features posts about medical bills,
 * Small Kevin drama, and obsessive tracking of his fall count (currently 847).
 *
 * URL: www.timsmomsupport.corn
 * Theme: Warm, cozy, maternal. Floral patterns, homemade aesthetic.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.timsmomsupport || {
  name: "Carol's Trust Fall Support Blog",
  tagline: "A Mother's Journey Through Confusion",
}

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
  isLiveUpdate?: boolean
  concerns?: string[]
}

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
    isLiveUpdate: m.isLiveUpdate ?? m.is_live_update,
    concerns: Array.isArray(m.concerns) ? m.concerns : undefined,
  }
}

const SIDEBAR_ITEMS = [
  { label: 'Tim\'s Fall Count', value: '847' },
  { label: 'Catch Rate', value: '78.5%' },
  { label: 'Medical Emergencies', value: '6' },
  { label: 'Cookies Baked', value: '37 batches' },
  { label: 'Heart Attacks', value: 'Lost count' },
]

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
      bgColor="#faf5f0"
      borderColor="#dcc5bb"
      textColor="#5c4033"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-orange-600">{post.date}</span>
        {post.isLiveUpdate && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded animate-pulse">
            🔴 LIVE UPDATE
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-orange-900 mb-2 hover:text-orange-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-700 mb-3">{post.excerpt}</p>
      {post.concerns && post.concerns.length > 0 && (
        <div className="mb-3 text-xs text-red-600 font-semibold">
          ⚠️ Mom\'s Concerns: {post.concerns.slice(0, 2).join(', ')}
        </div>
      )}
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>📖 {post.readTime}</span>
        <span>💭 Worried</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
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
      borderColor="#dcc5bb"
      textColor="#5c4033"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#a85030"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-orange-600">{post.date}</span>
        {post.isLiveUpdate && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
            🔴 LIVE UPDATE
          </span>
        )}
      </div>
      <h1 className="text-3xl font-bold text-orange-900 mb-2">{post.title}</h1>
      {post.concerns && post.concerns.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-xs font-bold text-red-700 mb-1">Mom\'s Pressing Concerns:</p>
          <ul className="text-xs text-red-600">
            {post.concerns.map((concern) => (
              <li key={concern}>• {concern}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="prose prose-orange max-w-none">
        {post.content.map((para, i) => (
          <p
            key={i}
            className={`mb-4 text-gray-800 leading-relaxed ${
              para === '' ? 'h-2' : 'text-sm'
            }`}
          >
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-orange-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
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
        bgColor="#fff5f0"
        borderColor="#f4dfd7"
        textColor="#5c4033"
      >
        <p className="font-bold text-orange-800">📝 About This Post</p>
        <p className="text-orange-700 text-xs mt-2">
          Posted with love and deep concern. If you have advice, please email me at
          carol@timsmomsupport.corn
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function TimsMomBlogSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'timsmom' })

  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(135deg, #fdf9f6 0%, #f5ede4 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-900 to-red-900 text-white py-8 px-4 border-b-8 border-orange-300 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🍪</span>
            <div>
              <h1 className="text-3xl font-bold text-orange-100">{site?.name}</h1>
              <p className="text-orange-200 text-sm italic">
                "A Mother\'s Journey Through Confusion & Concern"
              </p>
              <p className="text-orange-100 text-xs mt-1">Carol\'s Honest Blog About Tim\'s... Art Career</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-orange-100">
            <span>📍 Falls Tracked: 847</span>
            <span>•</span>
            <span>❤️ Heart Attacks: ∞</span>
            <span>•</span>
            <span>🍪 Batches Baked: 37</span>
          </div>
          <nav className="flex gap-4 mt-4 text-sm flex-wrap">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-orange-200 hover:text-white font-semibold"
            >
              Home
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-orange-200 hover:text-white font-semibold"
            >
              About Carol
            </button>
            <button className="text-orange-200 hover:text-white font-semibold">
              Ask Me Anything (via email)
            </button>
            <button className="text-orange-200 hover:text-white font-semibold">
              Tim\'s Instagram (he doesn\'t have one)
            </button>
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
                borderColor="#dcc5bb"
                textColor="#5c4033"
              >
                <h2 className="text-2xl font-bold text-orange-900 mb-4">About Carol</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍🦳</div>
                  <div>
                    <p className="font-bold text-orange-900">Carol Williams</p>
                    <p className="text-sm text-gray-700">Concerned Mother, Library Scientist, Cookie Baker</p>
                    <p className="text-xs text-gray-600">Tracking Fall #847 and Beyond</p>
                  </div>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  <p className="mb-4">
                    Hello! I\'m Carol, a 58-year-old former library scientist now primarily known as
                    "Tim\'s Mom With The Cookies." I started this blog to document my journey as the
                    parent of a professional trust fall performer.
                  </p>
                  <p className="mb-4">
                    My son Timothy decided at age 31 that his calling was to jump off things and hope
                    that strangers would catch him. I am handling this better than expected (lower
                    expectations). I bring baked goods to his performances. I track his statistics. I
                    attend therapy.
                  </p>
                  <p className="mb-4">
                    My husband Gary avoids all information about Tim\'s career. My therapist says this
                    is "a healthy coping mechanism." I disagree, but I am not a therapist.
                  </p>
                  <p className="mb-4">
                    This blog is where I process the fear, the confusion, the pride, and the cookies. If
                    you\'re a parent who doesn\'t understand your adult child\'s career choices, this blog
                    is for you.
                  </p>
                  <p>
                    Godspeed to all of us confused parents out there. We are doing our best.
                  </p>
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#fff5f0"
                  borderColor="#f4dfd7"
                  textColor="#5c4033"
                >
                  <p className="font-bold text-orange-800">📊 Carol\'s Stats</p>
                  <ul className="text-orange-700 text-xs mt-2 space-y-1">
                    <li>• Age: 58</li>
                    <li>• Years of Maternal Concern: 34</li>
                    <li>• Trust Fills Witnessed: 18</li>
                    <li>• Medical Bills Tracked: $47,000+</li>
                    <li>• Therapy Sessions: 12 and counting</li>
                    <li>• Cookie Recipes Perfected: 5</li>
                    <li>• Heart Attack Risk: Very High</li>
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
                  className="mb-4 border-l-4 border-orange-400"
                  bgColor="#fff5f0"
                  borderColor="#f4dfd7"
                  textColor="#5c4033"
                >
                  <p className="text-orange-900 text-sm font-semibold mb-2">
                    📌 Recent Update
                  </p>
                  <p className="text-orange-800 text-sm">
                    Tim completed Fall #847 successfully last week. His catch rate remains at 78.5%.
                    I have started a petition to require better insurance coverage for trust fall
                    performers. Gary is watching sports to cope.
                  </p>
                </StyledCard>
                {posts.map((post) => (
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
          <aside className="w-72 hidden lg:block space-y-4">
            {/* Stats */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="sticky top-4"
              bgColor="#ffffff"
              borderColor="#dcc5bb"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-3 text-sm">📊 The Numbers</h3>
              <div className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <div key={item.label} className="border-b border-orange-100 pb-2">
                    <p className="text-xs text-gray-700">{item.label}</p>
                    <p className="text-lg font-bold text-orange-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#dcc5bb"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-2 text-sm">📬 Email Updates</h3>
              <p className="text-xs text-gray-700 mb-2">
                Get notified when I write about Tim\'s latest fall or emotional breakdown.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-orange-200 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#c85a30"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Recent Concerns */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2ed"
              borderColor="#f4dfd7"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-2 text-sm">⚠️ Current Concerns</h3>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• That 21.5% catch failure rate</li>
                <li>• Small Kevin\'s grip strength</li>
                <li>• Medical insurance gaps</li>
                <li>• Tim\'s dating prospects</li>
                <li>• My future as a grandmother</li>
              </ul>
            </StyledCard>

            {/* Resources */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#dcc5bb"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-2 text-sm">🔗 My Other Projects</h3>
              <div className="space-y-2 text-xs">
                <div className="text-orange-800 hover:text-orange-600 cursor-pointer">
                  → Tim\'s CobFundMe Campaign
                </div>
                <div className="text-orange-800 hover:text-orange-600 cursor-pointer">
                  → My Cookie Recipes (Coming Soon)
                </div>
                <div className="text-orange-800 hover:text-orange-600 cursor-pointer">
                  → Worried Parents Anonymous (Discord)
                </div>
              </div>
            </StyledCard>

            {/* Endorsement */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fff5f0"
              borderColor="#f4dfd7"
              textColor="#5c4033"
            >
              <p className="text-xs font-bold text-orange-800 mb-1">✓ Endorsed By:</p>
              <div className="space-y-1 text-xs text-orange-700">
                <div>• Mars (The Underground Owner)</div>
                <div>• Tim\'s Therapist (Probably)</div>
                <div>• Gary (Reluctantly)</div>
                <div>• My Book Club (With Pity)</div>
              </div>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-900 to-red-900 text-orange-100 py-6 px-4 text-center text-xs mt-12 border-t-8 border-orange-300">
        <p className="mb-2">© 2025 Carol\'s Trust Fall Support Blog | www.timsmomsupport.corn</p>
        <p className="mb-2">
          Made with love, concern, and homemade cookies. No AI was used in the worry generation.
        </p>
        <p className="text-orange-200">
          If your son is also a professional trust fall performer, please reach out. We need to form a support group.
        </p>
      </footer>
    </div>
  )
}

export default TimsMomBlogSite
