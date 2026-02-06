/**
 * Small Kevin's Redemption Blog
 *
 * A sad, desperate blog by Kevin Smallwood (28) trying to rebuild his reputation
 * after The Incident of March 2022 where he failed to catch Trust Fall Tim.
 * Defensive, apologetic, pathetic. References bans, failed dates, CobCoin losses.
 *
 * URL: www.smallkevinredemption.corn
 * Aesthetic: Sad blue/grey with hints of desperation
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.smallkevinblog

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
  comments?: number
  isControversial?: boolean
  isPinned?: boolean
}

const ABOUT_TEXT = `Hi, I'm Kevin Smallwood. Everyone calls me Small Kevin (because of Big Kevin, my former best friend).

I am a 28-year-old man defined by one mistake.

On March 15, 2022, I failed to catch Trust Fall Tim at Westgate Mall. The "Incident" resulted in Tim's longest drop, a concussion, and my permanent exile from the trust fall community.

Since then, I have:
- Been banned from The Underground (the main venue)
- Lost my best friend, Big Kevin
- Made a $1 donation to Tim's medical fund (humiliating)
- Infiltrated a venue in a fake mustache
- Lost all my money to CobCoin
- Failed at multiple Corndr dates
- Been blocked on LinkedCorn
- Been permanently associated with failure

This blog is my attempt at redemption. It probably won't work. But I have to try.`

const SIDEBAR_QUOTES = [
  { quote: "The Incident wasn't my whole life", author: 'Small Kevin (delusional)' },
  { quote: 'I\'m still training', author: 'Small Kevin (alone, in a gym)' },
  { quote: "Big Kevin won't return my calls", author: 'Small Kevin (facts)' },
  { quote: 'CobCoin was a mistake', author: 'Small Kevin (tragic)' },
  { quote: '847 training reps and counting', author: 'Small Kevin (determined? desperate?)' },
]

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
    comments: m.comments ?? item.commentCount,
    isControversial: m.isControversial ?? m.is_controversial,
    isPinned: item.isPinned ?? m.isPinned ?? m.is_pinned,
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
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#cbd5e1"
      textColor="#1e293b"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">{post.date}</span>
        <div className="flex gap-2">
          {post.isPinned && (
            <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
              📌 PINNED
            </span>
          )}
          {post.isControversial && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
              ⚠️ CONTROVERSIAL
            </span>
          )}
        </div>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2 hover:text-slate-700">
        {post.title}
      </h2>
      <p className="text-sm text-slate-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>📖 {post.readTime}</span>
        {post.comments && <span>💬 {post.comments} comments</span>}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
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
      borderColor="#cbd5e1"
      textColor="#1e293b"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#64748b"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">{post.date}</span>
        <div className="flex gap-2">
          {post.isPinned && (
            <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
              📌 PINNED
            </span>
          )}
          {post.isControversial && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
              ⚠️ CONTROVERSIAL
            </span>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h1>
      <div className="prose prose-slate max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-slate-700 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      {post.comments !== undefined && (
        <StyledCard
          variant="default"
          padding="md"
          borderRadius="sm"
          shadow="none"
          className="mt-4"
          bgColor="#f1f5f9"
          borderColor="#cbd5e1"
          textColor="#475569"
        >
          <p className="font-bold text-slate-700">💬 {post.comments} Comments</p>
          <p className="text-slate-600 text-xs mt-1">
            (Comments disabled. I can't handle more criticism right now.)
          </p>
        </StyledCard>
      )}
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function SmallKevinBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'smallkevin' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  return (
    <div className="min-h-full" style={{ background: '#f8fafc' }}>
      {/* Header - Sad, defeated aesthetic */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">😔</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'SmallKevinRedemption'}</h1>
              <p className="text-slate-300 text-sm italic">
                "Trying to Rebuild After One Terrible Moment" ™
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-slate-300 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-slate-300 hover:text-white"
            >
              About Kevin
            </button>
            <button className="text-slate-300 hover:text-white">Contact (Blocked)</button>
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
                borderColor="#cbd5e1"
                textColor="#1e293b"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">About Small Kevin</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">😔</div>
                  <div>
                    <p className="font-bold text-slate-800">Kevin Smallwood</p>
                    <p className="text-sm text-slate-600">Age 28, Former Catcher</p>
                    <p className="text-xs text-slate-500">Permanently Associated with Failure</p>
                  </div>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line mb-4">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#eff6ff"
                  borderColor="#cbd5e1"
                  textColor="#1e40af"
                >
                  <p className="font-bold text-blue-900">📊 Life Stats</p>
                  <ul className="text-blue-800 text-xs mt-2">
                    <li>• Days since The Incident: 847 (ish)</li>
                    <li>• Trust falls caught before failure: 847+</li>
                    <li>• Trust falls caught after failure: 0</li>
                    <li>• CobCoin losses: $8,470</li>
                    <li>• Fake mustaches worn: 1</li>
                    <li>• Calls from Big Kevin: 0</li>
                    <li>• Training gym visits: 847</li>
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
                  bgColor="#fef2f2"
                  borderColor="#fecaca"
                  textColor="#7f1d1d"
                >
                  <p className="text-red-800 text-sm">
                    🚨 <strong>Latest:</strong> One year after The Incident. Still training. Still trying.
                    Still banned from The Underground.
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
              borderColor="#cbd5e1"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-slate-900 mb-2">📧 Newsletter</h3>
              <p className="text-xs text-slate-600 mb-2">
                Get updates on my failed redemption arc. (I have 0 subscribers.)
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#64748b"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Quotes */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#cbd5e1"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-slate-900 mb-2">💭 Quotes About Kevin</h3>
              <div className="space-y-3">
                {SIDEBAR_QUOTES.map((item, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-slate-600 italic">"{item.quote}"</p>
                    <p className="text-slate-500 font-bold">— {item.author}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Training Log */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#cbd5e1"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-slate-900 mb-2">🏋️ Training Progress</h3>
              <div className="text-4xl text-center mb-2">🙆‍♂️</div>
              <p className="text-xs text-slate-600 text-center">
                <strong>847 solo attempts</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                "Nobody's watching, but I'm getting better at something."
              </p>
              <div className="mt-2 bg-slate-100 rounded p-2">
                <p className="text-xs font-bold text-slate-700">Personal Records:</p>
                <ul className="text-xs text-slate-600 mt-1">
                  <li>• 5ft: Consistent</li>
                  <li>• 6ft: 80% success</li>
                  <li>• 7ft: Terrified</li>
                </ul>
              </div>
            </StyledCard>

            {/* Shame List */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2f2"
              borderColor="#fecaca"
              textColor="#7f1d1d"
            >
              <h3 className="font-bold text-red-900 mb-2">⛔ Places I'm Banned From</h3>
              <ul className="text-xs text-red-800 mt-2">
                <li>• The Underground (main venue)</li>
                <li>• Trust Fall Community events</li>
                <li>• Big Kevin's house (100ft radius)</li>
                <li>• Westgate Mall food court</li>
                <li>• Tim's LinkedIn (blocked)</li>
                <li>• Several Corndr profiles</li>
              </ul>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-4 px-4 text-center text-xs mt-8">
        <p>© 2024 {site?.name || 'SmallKevinRedemption'}. All rights reserved (except I have no rights).</p>
        <p className="mt-1">
          "Maybe one day someone will let me catch them again. But probably not."
        </p>
      </footer>
    </div>
  )
}

export default SmallKevinBlogSite
