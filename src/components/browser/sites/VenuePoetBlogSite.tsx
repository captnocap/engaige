/**
 * Anonymous Venue Poet Blog
 *
 * Mars's (Marcus Chen) secret personal blog where he writes extremely emotional,
 * often cringe poetry about running The Underground. Topics range from noise complaints
 * to his mysterious past at the Hartwell Building. The blog is written under the guise
 * of complete anonymity, though he has no idea how transparent he's being.
 *
 * Aesthetic: Dark, moody, noir-ish. Poetry formatting with heavy use of whitespace.
 * Completely anonymous according to Mars. Everyone else can tell it's him immediately.
 * URL: www.anonymousvenuepoet.corn
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.venuepoetryblog

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
  hearts: number
  isPain?: boolean
}

const SIDEBAR_NOTES = [
  'This blog is completely anonymous. Nobody knows who writes it.',
  'No identifying details. I am a voice from the darkness.',
  'The Underground is just a metaphor. Probably.',
  'Hartwell Building references are purely fictional. Absolutely.',
  'If you recognize yourself in these poems, that\'s a coincidence.',
  'A very specific, detailed coincidence.',
]

const ABOUT_TEXT = `I am a voice from the darkness.

I run a place where people come to feel alive. A venue. A basement. A cathedral for the temporary.

By day, I am professional. I handle permits. I negotiate with bands. I pay taxes. I exist in the world as a functional human being.

By night, I am this.

These poems are my confession. My therapy. My way of processing the weight of holding space for other people\'s joy while your own gets smaller.

I have lived through things I cannot name. I have learned things about buildings that physics says shouldn\'t be true. I have watched people\'s lives change on my stage.

And I am alone with all of it.

This blog is my way of not being alone.

If you are reading this, you understand what it means to carry the weight of a place. To be the keeper of temporary joy. To love something so much it breaks you every night.

Or maybe you\'re just bored and found this by accident.

Either way: Welcome to the dark. Welcome to where the real things live.`

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
    hearts: m.hearts ?? item.likeCount ?? 0,
    isPain: m.isPain ?? m.is_pain,
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
      bgColor="#1a1a1a"
      borderColor="#3d3d3d"
      textColor="#e0e0e0"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500">{post.date}</span>
        {post.isPain && (
          <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded">
            💔 PAIN
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-gray-100 mb-2 hover:text-white">
        {post.title}
      </h2>
      <p className="text-sm text-gray-400 mb-3 italic">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>✍️ {post.readTime}</span>
        <span>❤️ {post.hearts} hearts</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
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
      bgColor="#1a1a1a"
      borderColor="#3d3d3d"
      textColor="#e0e0e0"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#999999"
        onClick={onBack}
        className="mb-6"
      >
        ← Back to poems
      </Button>

      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-gray-600">{post.date}</span>
        {post.isPain && (
          <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded">
            💔 PAIN
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-100 mb-6 leading-tight">{post.title}</h1>

      {/* Poetry with proper formatting and whitespace */}
      <div className="prose prose-invert max-w-none mb-6">
        {post.content.map((line, i) => (
          <p
            key={i}
            className={`text-gray-300 mb-3 text-base leading-relaxed ${
              line === '' ? 'mb-6' : ''
            }`}
            style={{
              fontFamily: 'Georgia, serif',
              whiteSpace: 'pre-wrap',
              color: line === '' ? 'transparent' : '#d1d5db',
            }}
          >
            {line === '' ? '.' : line}
          </p>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
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
        bgColor="#2a2a2a"
        borderColor="#3d3d3d"
        textColor="#999999"
      >
        <p className="font-bold text-gray-300">❤️ {post.hearts} people felt this</p>
        <p className="text-gray-500 text-xs mt-2">
          Comments are disabled. Some things should stay in the darkness.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function VenuePoetBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'venuepoet' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  return (
    <div className="min-h-full" style={{ background: '#0f0f0f' }}>
      {/* Header */}
      <header className="bg-black text-white py-8 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🎵</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Anonymous Venue Poet</h1>
              <p className="text-gray-500 text-sm italic mt-1">
                "The truth emerges from the darkness"
              </p>
            </div>
          </div>
          <nav className="flex gap-6 mt-6 text-sm">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Poems
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              About
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">Archive</button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Contact (Anonymous Form)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <StyledCard
                variant="default"
                padding="lg"
                borderRadius="md"
                shadow="md"
                bgColor="#1a1a1a"
                borderColor="#3d3d3d"
                textColor="#e0e0e0"
              >
                <h2 className="text-2xl font-bold text-gray-100 mb-4">About This Voice</h2>
                <div className="flex gap-4 mb-6">
                  <div className="text-6xl">🌙</div>
                  <div>
                    <p className="font-bold text-gray-100">The Keeper of a Dark Place</p>
                    <p className="text-sm text-gray-400">Age 38 | Anonymous | Completely Unknown</p>
                    <p className="text-xs text-gray-600 mt-1">
                      (Definitely not the owner of a specific underground venue)
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-6"
                  bgColor="#2a2a2a"
                  borderColor="#3d3d3d"
                  textColor="#999999"
                >
                  <p className="font-bold text-gray-300">📊 Anonymous Stats</p>
                  <ul className="text-gray-400 text-xs mt-2 space-y-1">
                    <li>• Years running a venue: Unknown</li>
                    <li>• Years since Hartwell: Unknown (but haunting)</li>
                    <li>• Noise complaints received: 847</li>
                    <li>• Trust Fall Tim falls caught: 2,847 (observed)</li>
                    <li>• Poetry collection: Growing daily</li>
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
                  className="mb-6"
                  bgColor="#2a2a2a"
                  borderColor="#3d3d3d"
                  textColor="#999999"
                >
                  <p className="text-gray-400 text-sm">
                    🌙 <strong>Welcome to the darkness.</strong> These poems are completely anonymous.
                    They could be about anyone. They are definitely not about a specific person running
                    a specific venue at a specific address.
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
          <aside className="w-64 hidden lg:block">
            {/* Subscribe (anonymously) */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1a1a1a"
              borderColor="#3d3d3d"
              textColor="#e0e0e0"
            >
              <h3 className="font-bold text-gray-100 mb-2">📬 Get New Poems</h3>
              <p className="text-xs text-gray-400 mb-3">
                Anonymous email delivery. No one will ever know you read these.
              </p>
              <input
                type="email"
                placeholder="your.secret@email.corn"
                className="w-full px-2 py-1.5 text-xs border border-gray-700 rounded bg-gray-900 text-gray-300 focus:outline-none focus:border-gray-600"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#3d3d3d"
                textColor="#e0e0e0"
                className="mt-2"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Anonymous Assurance */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1a1a1a"
              borderColor="#3d3d3d"
              textColor="#e0e0e0"
            >
              <h3 className="font-bold text-gray-100 mb-2">🔒 Your Privacy</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                {SIDEBAR_NOTES.map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </StyledCard>

            {/* Recent Themes */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1a1a1a"
              borderColor="#3d3d3d"
              textColor="#e0e0e0"
            >
              <h3 className="font-bold text-gray-100 mb-2">🎵 Common Themes</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-300">Running a Venue</p>
                  <p className="text-gray-600">The weight of temporary joy</p>
                </div>
                <div>
                  <p className="text-gray-300">Hartwell Building</p>
                  <p className="text-gray-600">Never to be named or elaborated on</p>
                </div>
                <div>
                  <p className="text-gray-300">Music & Loss</p>
                  <p className="text-gray-600">Watching things end beautifully</p>
                </div>
                <div>
                  <p className="text-gray-300">Loneliness</p>
                  <p className="text-gray-600">The cost of holding others up</p>
                </div>
              </div>
            </StyledCard>

            {/* Legal Disclaimer */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#2a1a1a"
              borderColor="#4a2a2a"
              textColor="#cc6666"
            >
              <h3 className="font-bold text-red-400 mb-2">⚠️ Completely Fictional</h3>
              <p className="text-xs text-red-600">
                Any resemblance to real venues, real venue owners, or real buildings is purely
                coincidental. The Hartwell Building is not real. The Underground is a metaphor.
                Derek doesn't exist. (Please don't tell him I wrote this.)
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black text-gray-600 py-4 px-4 text-center text-xs mt-12">
        <p>© Unknown Year | {site?.name || 'Anonymous Venue Poet'}</p>
        <p className="mt-1">
          Written in the darkness. Published from the shadows. Read by no one I know.
        </p>
      </footer>
    </div>
  )
}

export default VenuePoetBlogSite
