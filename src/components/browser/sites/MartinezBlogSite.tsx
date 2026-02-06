/**
 * Dr. Elena Martinez's Blog: "Please Stop Misinterpreting My Research"
 *
 * A desperate academic blog by Dr. Elena Martinez (physicist, 45), whose 2021 quantum
 * mechanics paper was wildly misinterpreted by Derek Observerson, spawning the entire
 * quantum coffee craze. She's been trying to correct the record for 847+ days. She has
 * received 847 emails from Derek. She just wants to do real science.
 *
 * Aesthetic: Exhausted academic energy. White background, serif fonts, university
 * website vibes. Progressive desperation across posts. Lots of [citation needed] tags
 * and "that's not what I said" corrections that go unheeded.
 *
 * URL: www.drmartinezclarifies.corn
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.drmartinezblog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  category: string
  updated?: boolean
}

const SIDEBAR_INFO = {
  about: `Dr. Elena Martinez is a theoretical physicist specializing in quantum phase transitions and complex systems. She received her Ph.D. in Physics from MIT in 2009 and has published 47 peer-reviewed papers on thermal dynamics, crystalline structures, and emergent complexity in phase transitions.

In 2021, she published "Quantum Phase Transitions in Thermal Systems" in Physical Review B. This paper has since become the most misinterpreted work of her career due to Derek Observerson's creative reinterpretation.

Dr. Martinez teaches at a major research university and has received multiple grants from the National Science Foundation. She has also received approximately 847 emails from someone named Derek.`,

  contact: `Dr. Elena Martinez does not accept email at this time. Her previous email address has been forwarded to automated responses. All inquiries about quantum coffee will be deleted automatically.

For legitimate academic inquiries, contact the Physics Department main office. Request a referral. Dr. Martinez may or may not respond.`,

  faq: [
    { q: 'Can coffee be quantum?', a: 'No.' },
    {
      q: 'Does your research support consciousness in appliances?',
      a: 'No. Read the paper.',
    },
    { q: 'Why don\'t you respond to Derek?', a: 'I do. He doesn\'t listen.' },
    {
      q: 'Do you actually drink quantum coffee?',
      a: 'I no longer drink coffee. Blame Derek.',
    },
    {
      q: 'Can I buy your coffee maker?',
      a: 'I did not make a coffee maker. Derek did. I am not affiliated.',
    },
  ],
}

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
    category: item.category || m.category || '',
    updated: m.updated,
  }
}

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({
  post,
  onSelect,
}: {
  post: BlogPost
  onSelect: () => void
}) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="sm"
      shadow="none"
      onClick={onSelect}
      className="mb-3 border-b-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
      bgColor="#ffffff"
      borderColor="#d1d5db"
      textColor="#1f2937"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs text-gray-600 font-mono">{post.date}</span>
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {post.category}
        </span>
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2 hover:text-blue-600">
        {post.title}
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed">{post.excerpt}</p>
      {post.updated && (
        <p className="text-xs text-red-600 mt-2 italic">
          [UPDATED] Please read again. The anger is different now.
        </p>
      )}
    </StyledCard>
  )
}

function FullPost({
  post,
  onBack,
}: {
  post: BlogPost
  onBack: () => void
}) {
  return (
    <div className="max-w-3xl">
      <Button
        variant="link"
        size="sm"
        textColor="#0066cc"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to all posts
      </Button>

      <StyledCard
        variant="default"
        padding="lg"
        borderRadius="sm"
        shadow="none"
        bgColor="#ffffff"
        borderColor="#d1d5db"
        textColor="#1f2937"
      >
        <div className="mb-6 pb-4 border-b border-gray-300">
          <span className="text-xs text-gray-600 font-mono block mb-2">
            {post.date}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
            {post.category}
          </span>
          {post.updated && (
            <p className="text-xs text-red-600 mt-2 italic">
              [UPDATED] {new Date().toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-gray-800">
          {post.content.map((para, i) => (
            <p key={i} className="mb-4 text-sm leading-relaxed whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>

        <StyledCard
          variant="default"
          padding="md"
          borderRadius="sm"
          shadow="none"
          className="mt-6"
          bgColor="#f3f4f6"
          borderColor="#d1d5db"
          textColor="#1f2937"
        >
          <p className="text-xs text-gray-600 italic">
            Posted by Dr. Elena Martinez. All opinions are carefully researched
            and extensively frustrated. Comments are disabled. Derek broke the
            comment section.
          </p>
        </StyledCard>
      </StyledCard>
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function MartinezBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'drmartinez' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  return (
    <div
      className="min-h-full"
      style={{
        background: '#ffffff',
        fontFamily: 'Georgia, serif',
        color: '#1f2937',
      }}
    >
      {/* Header */}
      <header
        className="border-b-4 border-gray-900 py-8 px-6"
        style={{ background: '#ffffff' }}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-1px' }}
          >
            Dr. Elena Martinez
          </h1>
          <p className="text-lg text-gray-700 mb-3">
            Theoretical Physicist | Desperate Academic
          </p>
          <p className="text-sm text-gray-600 italic mb-4">
            {site?.name || 'drmartinezclarifies.corn'}
          </p>

          {/* Navigation */}
          <nav className="flex gap-6 text-sm border-t border-gray-300 pt-4">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-gray-900 hover:text-blue-600 font-semibold"
            >
              All Posts
            </button>
            <button
              onClick={() => {
                setShowAbout(true)
                setSelectedPost(null)
              }}
              className="text-gray-900 hover:text-blue-600 font-semibold"
            >
              About
            </button>
            <button className="text-gray-900 hover:text-blue-600 font-semibold">
              FAQ
            </button>
            <button
              disabled
              className="text-gray-400 cursor-not-allowed font-semibold"
            >
              Contact (Disabled)
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
              <>
                <StyledCard
                  variant="default"
                  padding="lg"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-6"
                  bgColor="#ffffff"
                  borderColor="#d1d5db"
                  textColor="#1f2937"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About
                  </h2>
                  <div className="text-sm text-gray-800 leading-relaxed space-y-4">
                    {SIDEBAR_INFO.about.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </StyledCard>

                <StyledCard
                  variant="default"
                  padding="lg"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-6"
                  bgColor="#f9fafb"
                  borderColor="#d1d5db"
                  textColor="#1f2937"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {SIDEBAR_INFO.faq.map((item, i) => (
                      <div key={i} className="pb-3 border-b border-gray-200 last:border-b-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Q: {item.q}
                        </p>
                        <p className="text-sm text-gray-700">A: {item.a}</p>
                      </div>
                    ))}
                  </div>
                </StyledCard>
              </>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-6 bg-yellow-50"
                  bgColor="#fffacd"
                  borderColor="#f4a460"
                  textColor="#8b4513"
                >
                  <p className="text-sm font-semibold">
                    ⚠️ NOTE: This blog contains frustrated clarifications about
                    a 2021 research paper. Derek Observerson, if you are reading
                    this: The answer is still no.
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
          <aside className="w-72 hidden md:block flex-shrink-0">
            {/* Contact Info */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              className="mb-6"
              bgColor="#f9fafb"
              borderColor="#d1d5db"
              textColor="#1f2937"
            >
              <h3 className="font-bold text-gray-900 mb-2 text-sm">
                Contact Information
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {SIDEBAR_INFO.contact}
              </p>
            </StyledCard>

            {/* Statistics */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              className="mb-6"
              bgColor="#f3f4f6"
              borderColor="#d1d5db"
              textColor="#1f2937"
            >
              <h3 className="font-bold text-gray-900 mb-3 text-sm">
                Career Statistics
              </h3>
              <ul className="text-xs text-gray-700 space-y-2">
                <li>
                  <strong>Papers Published:</strong> 47
                </li>
                <li>
                  <strong>Years in Academia:</strong> 17
                </li>
                <li>
                  <strong>Emails from Derek:</strong> 847
                </li>
                <li>
                  <strong>Coffee Maker Mentions in Paper:</strong> 0
                </li>
                <li>
                  <strong>Coffee Maker Products Named After Me:</strong> 1+ (increasing)
                </li>
                <li>
                  <strong>Court Cases Pending:</strong> 1
                </li>
                <li>
                  <strong>Regrets About Publishing:</strong> Many
                </li>
              </ul>
            </StyledCard>

            {/* The Real Research */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              className="mb-6"
              bgColor="#ecfdf5"
              borderColor="#6ee7b7"
              textColor="#047857"
            >
              <h3 className="font-bold text-green-900 mb-2 text-sm">
                My Actual Research
              </h3>
              <p className="text-xs text-green-800 leading-relaxed mb-2">
                Before all this, I was working on:
              </p>
              <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                <li>Crystalline lattice dynamics</li>
                <li>Phase transition kinetics</li>
                <li>Thermal conductivity in nano-structures</li>
                <li>Non-equilibrium statistical mechanics</li>
              </ul>
              <p className="text-xs text-green-800 italic mt-2">
                This was nice. This was my life.
              </p>
            </StyledCard>

            {/* Derek Warning */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              bgColor="#fee2e2"
              borderColor="#fca5a5"
              textColor="#991b1b"
            >
              <h3 className="font-bold text-red-900 mb-2 text-sm">
                ⚠️ IMPORTANT NOTE
              </h3>
              <p className="text-xs text-red-900 leading-relaxed">
                If you are Derek Observerson: I see the 847 emails. I am
                reading them. The answer has not changed. My paper does not
                support quantum coffee. It never will. Please stop.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-12 py-6 px-6 border-t-4 border-gray-900 text-center text-xs text-gray-600"
        style={{ background: '#f9fafb' }}
      >
        <p>
          © 2021-2026 Dr. Elena Martinez. All clarifications preserved for
          posterity.
        </p>
        <p className="mt-1">
          This blog does not represent the views of my university, my colleagues,
          or anyone with common sense.
        </p>
        <p className="mt-1 italic text-red-600">
          Last updated: After Derek's latest email.
        </p>
      </footer>
    </div>
  )
}

export default MartinezBlogSite
