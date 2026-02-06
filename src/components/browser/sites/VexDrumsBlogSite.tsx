/**
 * Vex Drums Blog Site
 *
 * Personal blog of Vex (Vernon), the drummer from Neon Requiem.
 * The band broke up in January 2024, but Vex won't accept it.
 *
 * Dark, moody post-punk aesthetic. Purple and black with increasing desperation
 * masked as optimism. References The Underground, band members who have moved on,
 * and his denial that everything is fine.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.vexdrums

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
  desperation?: number // 0-10 scale of how desperate the post feels
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
    desperation: m.desperation,
  }
}

const SIDEBAR_INFO = [
  { label: 'Band Status', value: 'On Hiatus (Temporary!)' },
  { label: 'Last Show', value: 'January 13, 2024 @ The Underground' },
  { label: 'Kit Type', value: 'Yamaha Stage Custom (almost sold)' },
  { label: 'Years Active', value: '2016-2024 (not counting now)' },
  { label: 'Current Mood', value: '(smile emoji)' },
]

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({ post, onSelect }: { post: BlogPost; onSelect: () => void }) {
  // Color intensity increases with desperation
  const desperationColor = post.desperation
    ? `rgba(168, 85, 247, ${0.1 + (post.desperation * 0.08)})`
    : 'transparent'

  return (
    <div
      onClick={onSelect}
      className="mb-4 p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg"
      style={{
        backgroundColor: '#1a1a2e',
        borderLeft: `4px solid ${post.desperation && post.desperation > 7 ? '#dc2626' : '#a855f7'}`,
        borderRadius: '6px',
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-purple-300">{post.date}</span>
        {post.desperation && post.desperation > 8 && (
          <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded">
            ⚠️ CRY FOR HELP
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-purple-200 mb-2 hover:text-purple-100">
        {post.title}
      </h2>
      <p className="text-sm text-gray-300 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>🥁 {post.readTime}</span>
        {post.desperation && <span>💔 Desperation Level: {post.desperation}/10</span>}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: '#1a1a2e',
        borderLeft: `4px solid ${post.desperation && post.desperation > 7 ? '#dc2626' : '#a855f7'}`,
      }}
    >
      <button
        onClick={onBack}
        className="text-purple-300 hover:text-purple-100 mb-4 text-sm"
      >
        ← Back to all posts
      </button>

      <div className="flex justify-between items-start mb-4">
        <span className="text-sm text-purple-300">{post.date}</span>
        {post.desperation && post.desperation > 8 && (
          <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded">
            ⚠️ CRY FOR HELP
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-purple-100 mb-6">{post.title}</h1>

      <div className="space-y-4 mb-6">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-200 leading-relaxed text-sm">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-purple-900">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {post.desperation && post.desperation > 8 && (
        <div
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: '#3f1f1f', borderLeft: '4px solid #dc2626' }}
        >
          <p className="text-red-200 text-sm">
            If you or someone you know is struggling, please reach out. Things get better. Even when they don't feel like it.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function VexDrumsBlogSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'vex' })

  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div style={{ background: '#0f0a1f', minHeight: '100%' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1a1328', borderBottom: '2px solid #a855f7' }} className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🥁</span>
            <div>
              <h1 style={{ color: '#c084fc' }} className="text-3xl font-bold">
                VEX DRUMS
              </h1>
              <p style={{ color: '#a78bfa' }} className="text-sm italic">
                "Vernon's Space / Neon Requiem Lives"
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-6 text-sm">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="px-3 py-2 rounded"
              style={{ color: '#c084fc', borderBottom: !selectedPost && !showAbout ? '2px solid #a855f7' : 'none' }}
            >
              Posts
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="px-3 py-2 rounded"
              style={{ color: '#c084fc', borderBottom: showAbout ? '2px solid #a855f7' : 'none' }}
            >
              About
            </button>
            <button
              className="px-3 py-2 rounded"
              style={{ color: '#6b7280' }}
            >
              Contact (Disabled)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <div className="p-6 rounded-lg" style={{ backgroundColor: '#1a1a2e' }}>
                <h2 className="text-2xl font-bold text-purple-100 mb-4">About Vernon</h2>
                <div className="flex gap-4 mb-6">
                  <div className="text-6xl">🥁</div>
                  <div>
                    <p className="font-bold text-purple-100">Vex (Vernon Graves)</p>
                    <p className="text-sm text-purple-300">Drummer | Neon Requiem</p>
                    <p className="text-xs text-gray-400">Born 1990 | Resident of The Underground (formerly)</p>
                  </div>
                </div>

                <div className="text-sm text-gray-200 space-y-4 mb-6">
                  <p>
                    I'm a drummer. I've been playing drums since I was 12. Started Neon Requiem in 2016 with some friends
                    from the local post-punk scene. We had a good run. Really good, actually.
                  </p>
                  <p>
                    Right now we're on hiatus. It's temporary. Everyone's just taking some time to explore other stuff.
                    That's healthy. That's normal. Bands do this all the time.
                  </p>
                  <p>
                    I play at The Underground sometimes. Not as much anymore. Mars has been nice about it, but he's also
                    kind of sad about the whole thing, which I don't really understand.
                  </p>
                  <p>
                    I work at a coffee shop now. Not Quantum Brew. A different one.
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#2a1f3f', borderLeft: '4px solid #a855f7' }}>
                  <p className="font-bold text-purple-200 mb-2">📊 Stats</p>
                  <ul className="text-purple-200 text-xs space-y-1">
                    <li>• Band active: 2016-2024 (8 years)</li>
                    <li>• Shows played: 247</li>
                    <li>• Times checked phone for band messages: 847+</li>
                    <li>• Times cried at The Underground: unknown</li>
                    <li>• Status: ???</li>
                  </ul>
                </div>
              </div>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#2a1f3f', borderLeft: '4px solid #dc2626' }}>
                  <p style={{ color: '#fca5a5' }} className="text-sm">
                    📝 <strong>Latest thoughts:</strong> Still here. Still hoping. Still confused about what "hiatus" means when
                    nobody's talking to you.
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
          <aside className="w-80 hidden md:block space-y-4">
            {/* Band Info */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #a855f7' }}>
              <h3 className="font-bold text-purple-100 mb-4">🎸 Neon Requiem</h3>
              <div className="space-y-2">
                {SIDEBAR_INFO.map((item, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-purple-300">{item.label}</p>
                    <p className="text-gray-300 font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Band Members */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #8b5cf6' }}>
              <h3 className="font-bold text-purple-100 mb-3">👥 The Band</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-purple-300">Maya Reeves</p>
                  <p className="text-gray-400">Vocals (not responding)</p>
                </div>
                <div>
                  <p className="text-purple-300">James Chen</p>
                  <p className="text-gray-400">Bass (avoids eye contact)</p>
                </div>
                <div>
                  <p className="text-purple-300">Iris Kovak</p>
                  <p className="text-gray-400">Guitar (moved on)</p>
                </div>
                <div>
                  <p className="text-purple-300">Vex (Me)</p>
                  <p className="text-gray-400">Drums (still here)</p>
                </div>
              </div>
            </div>

            {/* Recent Memories */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #a855f7' }}>
              <h3 className="font-bold text-purple-100 mb-2">📍 Locations</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• The Underground (venue)</li>
                <li>• Quantum Brew Coffee (avoid)</li>
                <li>• Apartment (too quiet)</li>
                <li>• Coffee shop (new job)</li>
              </ul>
            </div>

            {/* Listening */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #a855f7' }}>
              <h3 className="font-bold text-purple-100 mb-2">♫ On Repeat</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Velvet Algorithms</li>
                <li>• Old Neon Requiem demos</li>
                <li>• The sound of silence</li>
                <li>• Existential dread</li>
              </ul>
            </div>

            {/* Help */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#3f1f1f', borderLeft: '4px solid #dc2626' }}
            >
              <h3 className="font-bold text-red-200 mb-2">⚠️ Need Help?</h3>
              <p className="text-xs text-red-100">
                If you're struggling, reach out to someone. I didn't, and here we are.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: '#1a1328', borderTop: '2px solid #a855f7' }}
        className="py-4 px-4 text-center mt-8"
      >
        <p style={{ color: '#a78bfa' }} className="text-xs">
          © 2024 Vex Drums. Neon Requiem Records. All songs rights reserved (by people who won't talk to me).
        </p>
        <p style={{ color: '#6b7280' }} className="mt-1 text-xs">
          "We're not broken. We're just paused. Tell yourself that enough times and it almost becomes true."
        </p>
      </footer>
    </div>
  )
}

export default VexDrumsBlogSite
