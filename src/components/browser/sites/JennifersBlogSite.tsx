/**
 * Jennifer's Blog Site - "www.jenniferheals.corn"
 *
 * Jennifer Observerson's personal blog about healing from her divorce to Derek.
 * A therapeutic journey that keeps circling back to Derek and his ridiculous
 * quantum coffee obsession. Lots of self-help language masking deep bitterness.
 * Every post title says "I'm over it" while clearly not being over it.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.jennifersblog

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
  isClickbait?: boolean
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
    comments: m.comments ?? item.commentCount ?? 0,
    isClickbait: m.isClickbait ?? m.is_clickbait,
  }
}

const SIDEBAR_RESOURCES = [
  { title: 'Quantum Widows Anonymous (Zoom)', icon: '💔' },
  { title: 'Divorce Support Books I Recommend', icon: '📚' },
  { title: 'Therapist Recommendation (Dr. Kim)', icon: '🧠' },
  { title: 'My Corndr Profile (Read-Only)', icon: '💕' },
  { title: 'Court Documents (REDACTED)', icon: '⚖️' },
]

const ABOUT_TEXT = `Hi, I'm Jennifer. I'm 32, a registered nurse, and formerly the wife of someone who prioritized coffee theory over human connection.

After 8 years of marriage, I realized that healing meant letting go. This blog is my space to process that journey—the good days and the really, really hard days where I google someone I've been very clearly trying not to think about.

I believe in transparency, growth, and the therapeutic value of sharing your deepest vulnerabilities with strangers on the internet.

I'm not bitter. I'm better.

(I'm at least 70% not bitter. Dr. Kim says that counts.)`

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
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#fbcfe8"
      textColor="#be123c"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-rose-600">{post.date}</span>
        {post.isClickbait && (
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-bold">
            ✨ HEALING MOMENT
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-pink-900 mb-2 hover:text-pink-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>📖 {post.readTime}</span>
        <span>💬 {post.comments} comments</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">
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
      borderColor="#fbcfe8"
      textColor="#be123c"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#ec4899"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to healing
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-rose-600">{post.date}</span>
        {post.isClickbait && (
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-bold">
            ✨ HEALING MOMENT
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-pink-900 mb-4">{post.title}</h1>
      <div className="prose prose-pink max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-pink-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">
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
        bgColor="#fdf2f8"
        borderColor="#fbcfe8"
        textColor="#be123c"
      >
        <p className="font-bold text-pink-800">💬 {post.comments} Comments</p>
        <p className="text-pink-600 text-xs mt-1">
          Comments are open! This is a safe space for healing. (Derek, if you're reading this, please don't respond.)
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function JennifersBlogSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'jennifer' })

  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff5f7 50%, #fdf2f8 100%)' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-900 via-pink-800 to-pink-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl">💗</span>
            <div>
              <h1 className="text-3xl font-bold">Jennifer Heals</h1>
              <p className="text-pink-200 text-sm italic">
                "Healing is not linear. But it\'s definitely possible. Probably."
              </p>
            </div>
          </div>
          <p className="text-pink-100 text-xs mb-4">
            www.jenniferheals.corn — A journey of growth, therapy, and getting over things
          </p>
          <nav className="flex gap-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-pink-200 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-pink-200 hover:text-white"
            >
              About Jennifer
            </button>
            <button className="text-pink-200 hover:text-white">Resources</button>
            <button className="text-pink-200 hover:text-white">Newsletter</button>
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
                borderColor="#fbcfe8"
                textColor="#be123c"
              >
                <h2 className="text-xl font-bold text-pink-900 mb-4">About Jennifer</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍⚕️</div>
                  <div>
                    <p className="font-bold text-pink-800">Jennifer Observerson</p>
                    <p className="text-sm text-gray-600">Registered Nurse (Mental Health Advocate)</p>
                    <p className="text-xs text-gray-500">Divorced. Healing. Moving Forward (Mostly).</p>
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
                  className="mt-4"
                  bgColor="#fdf2f8"
                  borderColor="#fbcfe8"
                  textColor="#be123c"
                >
                  <p className="font-bold text-pink-800">💚 Current Status</p>
                  <ul className="text-pink-700 text-xs mt-2">
                    <li>• 6 months post-divorce (Day 847 if we\'re counting metaphorically)</li>
                    <li>• In therapy (Every Thursday at 3 PM)</li>
                    <li>• Lead plaintiff in class action lawsuit vs. Quantum Brew Inc.</li>
                    <li>• Dating (Cautiously, with many red flag checks)</li>
                    <li>• Not googling Derek (Approximately 40% success rate)</li>
                    <li>• Genuinely thriving (Ask my therapist)</li>
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
                  bgColor="#fdf2f8"
                  borderColor="#fbcfe8"
                  textColor="#be123c"
                >
                  <p className="text-pink-800 text-sm">
                    ✨ <strong>Welcome!</strong> This is my safe space to process my healing journey. No judgment here—only growth, therapy speak, and the occasional honest moment about how I\'m definitely, absolutely not thinking about my ex.
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
            {/* Inspirational Quote */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <p className="text-xs italic text-pink-700 mb-2">
                "The only way out is through, and the only way through is to talk about it on the internet."
              </p>
              <p className="text-xs text-gray-500">— Dr. Kim (probably)</p>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">📬 Weekly Healing</h3>
              <p className="text-xs text-gray-600 mb-2">
                Essays about growth, divorce recovery, and definitely not Derek.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-pink-200 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#ec4899"
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
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">🌸 Healing Resources</h3>
              <div className="space-y-2">
                {SIDEBAR_RESOURCES.map((resource, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-pink-800 font-semibold">{resource.icon} {resource.title}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Therapy Note */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#fff5f7"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">🧠 Dr. Kim Says...</h3>
              <p className="text-xs text-gray-700 italic">
                "Jennifer, posting your feelings on the internet is not the same as processing them, but it\'s a start."
              </p>
            </StyledCard>

            {/* Support Group */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">💔 Quantum Widows Anonymous</h3>
              <p className="text-xs text-gray-600">
                Meeting Thursdays at 7 PM EST via Zoom. You\'re not alone in this.
              </p>
              <p className="text-xs text-pink-600 mt-2 font-semibold">
                DM for invite link
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
              <h3 className="font-bold text-red-800 mb-2">⚖️ Legal Note</h3>
              <p className="text-xs text-red-700">
                All events described are real (mostly). Names have been changed (they haven\'t). This blog is a personal journal, not legal advice.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-900 via-pink-800 to-pink-900 text-pink-200 py-4 px-4 text-center text-xs mt-8">
        <p>© 2026 Jennifer Heals. All healing rights reserved.</p>
        <p className="mt-1">
          Made with 💗, therapy, and a mild amount of unresolved feelings.
        </p>
        <p className="mt-1 text-pink-300">
          No coffee makers were harmed in the making of this blog.
        </p>
      </footer>
    </div>
  )
}

export default JennifersBlogSite
