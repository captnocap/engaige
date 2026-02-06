/**
 * Big Mike from Tulsa Blog Site
 *
 * The mysterious Michael Cornwell's aggressively normal personal blog.
 * He's everywhere, it's just coincidence, and he'll explain why in excruciating detail.
 * Every post raises more questions than it answers.
 *
 * Aesthetic: Beige, default serif fonts, stock photos, unprompted denials, constant Tulsa references.
 * The number 847 appears frequently but Mike never acknowledges it.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.bigmikeblog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  readTime: string
  isControversial?: boolean
}

const SIDEBAR_ITEMS = [
  { title: 'About Big Mike', description: 'Learn more about me' },
  { title: 'Links', description: 'Other normal sites' },
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
    readTime: m.readTime || m.read_time || '',
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
      borderRadius="none"
      shadow="none"
      onClick={onSelect}
      className="mb-4 cursor-pointer border-b border-gray-300 pb-4"
      bgColor="#e8e6e1"
      borderColor="#c9c5bc"
      textColor="#3a3a38"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
          {post.date}
        </span>
      </div>
      <h2
        className="text-lg font-normal text-gray-800 mb-2 hover:underline"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {post.title}
      </h2>
      <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
        {post.excerpt}
      </p>
      <div className="text-xs text-gray-600">{post.readTime}</div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div
      className="prose prose-sm max-w-none"
      style={{ fontFamily: 'Georgia, serif', color: '#3a3a38' }}
    >
      <Button
        variant="link"
        size="sm"
        textColor="#666666"
        onClick={onBack}
        className="mb-4 underline"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        ← Back
      </Button>

      <div className="mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-normal mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          {post.title}
        </h1>
        <p className="text-xs text-gray-600">{post.date}</p>
      </div>

      <div className="space-y-4">
        {post.content.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-800">
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function BigMikeBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'bigmike' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  return (
    <div className="min-h-full" style={{ background: '#e8e6e1' }}>
      {/* Header */}
      <header
        className="py-8 px-6 border-b border-gray-400"
        style={{ background: '#e8e6e1' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h1 className="text-4xl font-normal" style={{ fontFamily: 'Georgia, serif', color: '#3a3a38' }}>
              Big Mike from Tulsa
            </h1>
            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
              Just a Regular Guy
            </p>
          </div>

          <nav className="flex gap-6 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-gray-700 hover:text-gray-900 underline"
            >
              Posts
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-gray-700 hover:text-gray-900 underline"
            >
              About
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <div style={{ fontFamily: 'Georgia, serif', color: '#3a3a38' }}>
                <h2 className="text-2xl font-normal mb-4">About Big Mike</h2>

                <div className="flex gap-4 mb-6">
                  <div className="text-6xl">👨</div>
                  <div>
                    <p className="font-normal text-lg">Michael Cornwell</p>
                    <p className="text-sm text-gray-600">Age: 52</p>
                    <p className="text-sm text-gray-600">Location: Tulsa, Oklahoma</p>
                  </div>
                </div>

                <div className="text-sm leading-relaxed space-y-4 text-gray-800">
                  <p>
                    My name is Michael Cornwell. I go by Big Mike. I have lived in Tulsa, Oklahoma my entire life.
                    I am 52 years old.
                  </p>

                  <p>
                    I enjoy attending local events, concerts, and community gatherings. I like to engage with my
                    community. I am active in various circles around Tulsa.
                  </p>

                  <p>
                    I have been told that I appear in many places. This is because I enjoy being out in the community
                    and attending events that interest me. This is normal.
                  </p>

                  <p>
                    I am starting this blog to clarify some misconceptions about myself and my presence in various
                    locations and situations around Tulsa.
                  </p>

                  <p>
                    I am just a regular guy. From Tulsa. Nothing more. Nothing less.
                  </p>
                </div>

                <div
                  className="mt-6 p-4 border border-gray-400"
                  style={{ background: '#d9d6cf' }}
                >
                  <p className="text-xs font-normal" style={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Stats:</strong>
                  </p>
                  <ul className="text-xs mt-2 space-y-1 text-gray-700">
                    <li>• Age: 52</li>
                    <li>• From: Tulsa, Oklahoma</li>
                    <li>• Status: Regular guy</li>
                    <li>• Following anyone: No</li>
                    <li>• Government agent: No</li>
                  </ul>
                </div>
              </div>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <div
                  className="p-4 mb-6 border-l-4"
                  style={{ background: '#d9d6cf', borderColor: '#999999' }}
                >
                  <p className="text-sm text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Welcome.</strong> This is where I explain things. I am just a regular guy from Tulsa who
                    happens to be in many places. I want to address some misconceptions.
                  </p>
                </div>

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
          <aside className="w-56 hidden md:block">
            {/* About Box */}
            <div
              className="p-4 mb-6 border border-gray-400"
              style={{ background: '#d9d6cf' }}
            >
              <h3 className="font-normal text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                About
              </h3>
              <p className="text-xs leading-relaxed text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                I am Big Mike from Tulsa. I am a normal person. I live here. I go to events. Sometimes people are at
                the same events. This is normal.
              </p>
            </div>

            {/* Quick Links */}
            <div
              className="p-4 border border-gray-400"
              style={{ background: '#d9d6cf' }}
            >
              <h3 className="font-normal text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                Other Sites
              </h3>
              <ul className="text-xs space-y-2 text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                <li>
                  <a href="#" className="underline hover:no-underline">
                    HuskReviews
                  </a>
                </li>
                <li>
                  <a href="#" className="underline hover:no-underline">
                    KernelPods
                  </a>
                </li>
                <li>
                  <a href="#" className="underline hover:no-underline">
                    The Underground
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="bg-gray-800 text-gray-300 py-4 px-6 text-center text-xs mt-12"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <p>© 2026 Big Mike from Tulsa. All opinions are normal opinions.</p>
        <p className="mt-1 text-gray-500">
          This site is not affiliated with any government agency, law enforcement, or surveillance operation.
        </p>
      </footer>
    </div>
  )
}

export default BigMikeBlogSite
