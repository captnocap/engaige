/**
 * TrueMoss Site
 *
 * Agatha Mosswell's independent moss research blog and personal vendetta archive.
 * She was expelled from the American Bryological Society in 2019 and she's
 * absolutely NOT over it. Equal parts genuine bryophyte expertise and
 * unhinged personal grievances against "Big Moss."
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.truemoss

// ============================================================================
// Types & Data
// ============================================================================

interface MossPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  tags: string[]
  readTime: string
  comments: number
  isExpose?: boolean
  mossEmoji?: string
}

// Hardcoded MOSS_POSTS removed -- DB is the sole source of truth

const SIDEBAR_SPECIMENS = [
  { name: 'Gerald', species: 'Bryum argenteum', status: 'Thriving (emotionally healing)' },
  { name: 'Whisper', species: 'Hypnum cupressiforme', status: 'Delicate but stable' },
  { name: 'The Duke', species: 'Polytrichum commune', status: 'Magnificent (14cm)' },
  { name: 'Lady Marchbanks', species: 'Thuidium delicatulum', status: 'Unexpected joy' },
  { name: 'The Twins', species: 'Ceratodon purpureus', status: 'Inseparable' },
]

const ABOUT_TEXT = `My name is Agatha Mosswell. I am a competitive moss gardener, independent bryophyte researcher, and exile from the American Bryological Society.

In 2019, I was expelled for "aggressive moisture readings" at the National Moss Competition. The real crime? Questioning the sphagnum establishment. Exposing biased judging. Refusing to stay silent.

This blog is my platform. No corporate sponsors. No industry interference. Just truth, science, and moss.

I specialize in shade-tolerant species - the beautiful, neglected bryophytes that Big Moss ignores because they can't be mass-produced. Gerald, my prize Bryum argenteum, is the heart of my collection.

Patricia Fernsworth, if you're reading this: I know what you did. Everyone will know soon.

For everyone else: welcome to the resistance.`

// ============================================================================
// Components
// ============================================================================

function MossPostCard({ post, onSelect }: { post: MossPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#ffffff"
      borderColor="#86EFAC"
      textColor="#14532D"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-lime-600">{post.date}</span>
        <div className="flex items-center gap-2">
          {post.mossEmoji && <span className="text-lg">{post.mossEmoji}</span>}
          {post.isExpose && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
              EXPOSE
            </span>
          )}
        </div>
      </div>
      <h2 className="text-lg font-bold text-green-900 mb-2 hover:text-green-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{post.readTime}</span>
        <span>{post.comments} comments</span>
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

function FullPost({ post, onBack }: { post: MossPost; onBack: () => void }) {
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
        textColor="#166534"
        onClick={onBack}
        className="mb-4"
      >
        Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-lime-600">{post.date}</span>
        <div className="flex items-center gap-2">
          {post.mossEmoji && <span className="text-2xl">{post.mossEmoji}</span>}
          {post.isExpose && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
              EXPOSE
            </span>
          )}
        </div>
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
        bgColor="#DCFCE7"
        borderColor="#86EFAC"
        textColor="#14532D"
      >
        <p className="font-bold text-green-800">{post.comments} Comments</p>
        <p className="text-green-700 text-xs mt-1">
          Comments are moderated. Patricia Fernsworth and ABS affiliates are auto-blocked.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

/**
 * Adapter: maps SiteContentItem to local MossPost interface.
 * Expects metadata to carry post-specific fields (readTime, isExpose, mossEmoji, etc.)
 */
function dbToMossPost(item: SiteContentItem): MossPost {
  // Body may be stored as a single string with paragraph breaks, or as JSON array in metadata
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
    tags: item.tags ?? [],
    readTime: item.metadata?.readTime ?? '? min read',
    comments: item.commentCount ?? item.metadata?.comments ?? 0,
    isExpose: item.metadata?.isExpose ?? false,
    mossEmoji: item.thumbnailEmoji ?? item.metadata?.mossEmoji,
  }
}

export function TrueMossSite({ siteId }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('truemoss')

  const mossPosts = useMemo(() => dbContent.map(dbToMossPost), [dbContent])

  const [selectedPost, setSelectedPost] = useState<MossPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#F0FDF4' }}>
      {/* Header */}
      <header className="text-white py-6 px-4" style={{ background: 'linear-gradient(135deg, #166534 0%, #14532D 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🌿</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'TrueMoss'}</h1>
              <p className="text-green-200 text-sm italic">
                "Real Bryophyte Science, No Corporate Influence"
              </p>
            </div>
          </div>
          <p className="text-green-300 text-xs mb-4">
            est. 2025 | Expelled from ABS 2019 | Gerald's Human
          </p>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-green-200 hover:text-white"
            >
              Posts
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-green-200 hover:text-white"
            >
              About Agatha
            </button>
            <button className="text-green-200 hover:text-white">Specimen Gallery</button>
            <button className="text-green-200 hover:text-white">Evidence Archive</button>
          </nav>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-red-100 border-b border-red-300 py-2 px-4">
        <p className="max-w-4xl mx-auto text-red-800 text-xs text-center">
          <strong>NOTICE:</strong> Patricia Fernsworth has been observed accessing this site from a VPN. Patricia, I know it's you. The IP patterns match.
        </p>
      </div>

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
                <h2 className="text-xl font-bold text-green-900 mb-4">About Agatha Mosswell</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍🔬</div>
                  <div>
                    <p className="font-bold text-green-800">Agatha Mosswell</p>
                    <p className="text-sm text-gray-600">Independent Bryophyte Researcher</p>
                    <p className="text-xs text-gray-500">ABS Member 2008-2019 (expelled)</p>
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
                  bgColor="#DCFCE7"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="font-bold text-green-800">Stats</p>
                  <ul className="text-green-700 text-xs mt-2">
                    <li>- 47 shade-tolerant species documented</li>
                    <li>- 12 named specimens (5 featured)</li>
                    <li>- 7 appeals filed (7 denied)</li>
                    <li>- 1 nemesis (Patricia Fernsworth)</li>
                    <li>- 0 regrets</li>
                  </ul>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#FEF2F2"
                  borderColor="#FECACA"
                  textColor="#7F1D1D"
                >
                  <p className="font-bold text-red-800">Legal Restrictions</p>
                  <ul className="text-red-700 text-xs mt-2">
                    <li>- Cannot attend ABS events (expelled)</li>
                    <li>- Must maintain 50ft from Judge #3 (reduced from 100ft)</li>
                    <li>- Cannot contact MossCo employees directly</li>
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
                  bgColor="#DCFCE7"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="text-green-800 text-sm">
                    <strong>BREAKING:</strong> New evidence in the Patricia Fernsworth hybridization theft case.
                    Original lab notes obtained. Post coming this week.
                  </p>
                </StyledCard>
                {mossPosts.map(post => (
                  <MossPostCard
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
            {/* Specimen Status */}
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
              <h3 className="font-bold text-green-900 mb-2">Specimen Status</h3>
              <div className="space-y-2">
                {SIDEBAR_SPECIMENS.map((specimen, i) => (
                  <div key={i} className="text-xs border-b border-green-100 pb-2 last:border-0">
                    <p className="font-bold text-green-800">{specimen.name}</p>
                    <p className="text-green-600 italic">{specimen.species}</p>
                    <p className="text-gray-500">{specimen.status}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* The Cause */}
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
              <h3 className="font-bold text-green-900 mb-2">Support the Cause</h3>
              <p className="text-xs text-gray-600 mb-2">
                Help expose Big Moss and fund independent shade-tolerant species research.
              </p>
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#166534"
                textColor="#ffffff"
              >
                Donate to TrueMoss
              </Button>
              <p className="text-xs text-gray-400 mt-2 italic">
                (Not tax-deductible. ABS blocked our 501c3.)
              </p>
            </StyledCard>

            {/* Gerald Corner */}
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
              <h3 className="font-bold text-green-900 mb-2">Gerald's Corner</h3>
              <div className="text-4xl text-center mb-2">🪴</div>
              <p className="text-xs text-gray-600 italic text-center">
                "Gerald's Current Mood: Cautiously optimistic, still processing trauma"
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Today's humidity: 72.8% (optimal). Gerald responded well to morning misting.
              </p>
            </StyledCard>

            {/* Enemy Watch */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FEF2F2"
              borderColor="#FECACA"
              textColor="#7F1D1D"
            >
              <h3 className="font-bold text-red-800 mb-2">Enemy Watch</h3>
              <div className="text-xs text-red-700 space-y-1">
                <p><strong>Patricia Fernsworth:</strong> Spotted at Portland nursery (Jan 18)</p>
                <p><strong>ABS:</strong> Annual conference March 2026 (I will be outside)</p>
                <p><strong>MossCo:</strong> New "premium sphagnum" launch - stay vigilant</p>
              </div>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">Newsletter</h3>
              <p className="text-xs text-gray-600 mb-2">
                Weekly updates on shade-tolerant species and industry corruption.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-green-200 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#166534"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                (ABS-affiliated emails auto-rejected)
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-green-200 py-4 px-4 text-center text-xs" style={{ background: '#14532D' }}>
        <p>&copy; 2025 {site?.name || 'TrueMoss'}. Not affiliated with the American Bryological Society (by their choice, not mine).</p>
        <p className="mt-1">
          Patricia Fernsworth: I see your traffic. I know you're watching. The truth is coming.
        </p>
        <p className="mt-2 text-green-400 italic">
          "In moss we trust. In Patricia we don't." - A. Mosswell, 2019
        </p>
      </footer>
    </div>
  )
}

export default TrueMossSite
