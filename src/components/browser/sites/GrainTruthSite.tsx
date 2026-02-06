/**
 * GrainTruth Site (www.graintruth.corn)
 *
 * A paranoid conspiracy theory website dedicated to exposing the truth about
 * corn's role in controlling humanity. Big Corn runs everything. The .corn
 * TLD is a psyop. High fructose corn syrup is mind control. Nebraska doesn't
 * exist. The Hartwell Building's missing 13th floor is actually a corn silo.
 * Quantum coffee uses "quantum corn" not regular beans.
 *
 * THEY'RE WATCHING. THEY'VE ALWAYS BEEN WATCHING.
 *
 * Easter eggs: 847 appears throughout, references to Derek, Hartwell Building,
 * The Underground, and other game lore elements.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.graintruth

// ============================================================================
// Types & Data
// ============================================================================

interface Article {
  id: string
  title: string
  date: string
  classification: 'VERIFIED' | 'DEVELOPING' | 'SUPPRESSED' | 'CRITICAL' | 'THEY KNOW'
  excerpt: string
  content: string[]
  sources: string[]
  views: number
  comments: Comment[]
}

interface Comment {
  id: string
  username: string
  date: string
  content: string
  replies?: Comment[]
  upvotes: number
}

// (Hardcoded articles removed -- database is the sole source of truth)

// ============================================================================
// Sidebar Data
// ============================================================================

const SIDEBAR_LINKS = [
  { title: 'hartwellfiles.corn', desc: 'Building conspiracy research' },
  { title: 'quantumbrewblog.corn', desc: 'Derek\'s coffee documentation' },
  { title: 'Threadit r/corntruth', desc: 'Community discussion (often censored)' },
  { title: 'WikiKnow "Corn Subsidies"', desc: 'Heavily edited but still useful' },
];

const THREAT_LEVEL = {
  level: 'ORANGE',
  message: 'Increased monitoring detected. Use VPN.',
};

const VISITOR_COUNT = 847247;

// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Article interface */
function dbToArticle(item: SiteContentItem): Article {
  const m = item.metadata || {}
  // Body may be stored as a single string with paragraph breaks, or as JSON array
  let contentParagraphs: string[] = []
  if (m.content && Array.isArray(m.content)) {
    contentParagraphs = m.content
  } else if (item.body) {
    contentParagraphs = item.body.split('\n\n').filter(Boolean)
  }

  return {
    id: item.slug,
    title: item.title,
    date: m.date ?? (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'),
    classification: m.classification ?? 'DEVELOPING',
    excerpt: item.summary ?? m.excerpt ?? '',
    content: contentParagraphs,
    sources: m.sources ?? [],
    views: item.viewCount ?? m.views ?? 0,
    comments: (m.comments ?? []).map((c: any, i: number) => ({
      id: c.id ?? `c_${i}`,
      username: c.username ?? 'Anonymous',
      date: c.date ?? '',
      content: c.content ?? '',
      upvotes: c.upvotes ?? 0,
      replies: (c.replies ?? []).map((r: any, j: number) => ({
        id: r.id ?? `c_${i}_r_${j}`,
        username: r.username ?? 'Anonymous',
        date: r.date ?? '',
        content: r.content ?? '',
        upvotes: r.upvotes ?? 0,
      })),
    })),
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Glitchy text effect for paranoid aesthetic
 */
function GlitchText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 text-red-500 opacity-70"
        style={{ transform: 'translate(1px, 1px)', animation: 'pulse 2s infinite' }}
      >
        {children}
      </span>
    </span>
  );
}

/**
 * Classification badge with color coding
 */
function ClassificationBadge({ classification }: { classification: Article['classification'] }) {
  const styles: Record<Article['classification'], { bg: string; text: string; border: string }> = {
    'VERIFIED': { bg: '#166534', text: '#4ade80', border: '#22c55e' },
    'DEVELOPING': { bg: '#a16207', text: '#fde047', border: '#eab308' },
    'SUPPRESSED': { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
    'CRITICAL': { bg: '#7c2d12', text: '#fdba74', border: '#f97316' },
    'THEY KNOW': { bg: '#581c87', text: '#e879f9', border: '#a855f7' },
  };

  const style = styles[classification];

  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wider"
      style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      [{classification}]
    </span>
  );
}

/**
 * Comment component with nested replies
 */
function CommentThread({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  return (
    <div
      className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-red-900/50' : ''}`}
      style={{ marginTop: depth > 0 ? '8px' : '12px' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-400 font-mono text-sm font-bold">{comment.username}</span>
        <span className="text-gray-600 text-xs">{comment.date}</span>
        <span className="text-yellow-600 text-xs">+{comment.upvotes}</span>
      </div>
      <p className="text-gray-300 text-sm">{comment.content}</p>
      {comment.replies?.map((reply) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

/**
 * Article card for the main listing
 */
function ArticleCard({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: () => void;
}) {
  return (
    <StyledCard
      variant="dark"
      padding="md"
      borderRadius="sm"
      shadow="md"
      onClick={onSelect}
      className="cursor-pointer mb-4 transition-all hover:border-red-500"
      bgColor="#1a1a1a"
      borderColor="#7f1d1d"
      textColor="#fef2f2"
      hoverColor="#2a1a1a"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-red-600 font-mono">{article.date}</span>
        <ClassificationBadge classification={article.classification} />
      </div>
      <h2 className="text-lg font-bold text-red-100 mb-2 font-mono hover:text-yellow-400">
        {article.title}
      </h2>
      <p className="text-sm text-gray-400 mb-3">{article.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>{article.views.toLocaleString()} views</span>
        <span>{article.comments.length} comments</span>
        <span>{article.sources.length} sources</span>
      </div>
    </StyledCard>
  );
}

/**
 * Full article view with comments
 */
function ArticleView({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="link"
        size="sm"
        textColor="#ef4444"
        onClick={onBack}
        className="font-mono"
      >
        [RETURN TO EVIDENCE INDEX]
      </Button>

      {/* Article content */}
      <StyledCard
        variant="dark"
        padding="lg"
        borderRadius="sm"
        shadow="md"
        bgColor="#1a1a1a"
        borderColor="#7f1d1d"
        textColor="#fef2f2"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs text-red-600 font-mono">{article.date}</span>
          <ClassificationBadge classification={article.classification} />
        </div>

        <h1 className="text-2xl font-bold text-red-100 mb-4 font-mono">
          {article.title}
        </h1>

        <div className="prose prose-invert max-w-none">
          {article.content.map((para, i) => (
            <p key={i} className="text-gray-300 mb-4 text-sm leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Sources */}
        <div className="mt-6 pt-4 border-t border-red-900/50">
          <h3 className="text-sm font-bold text-red-400 mb-3 font-mono">
            SOURCES & EVIDENCE:
          </h3>
          <ul className="space-y-2">
            {article.sources.map((source, i) => (
              <li
                key={i}
                className="text-xs text-gray-500 font-mono pl-4 border-l-2 border-red-900/50"
              >
                [{i + 1}] {source}
              </li>
            ))}
          </ul>
        </div>

        {/* Warning */}
        <div
          className="mt-4 p-3 rounded text-xs font-mono"
          style={{ backgroundColor: '#1f1f1f', border: '1px solid #7f1d1d' }}
        >
          <span className="text-red-500">WARNING:</span>{' '}
          <span className="text-gray-400">
            This article may be monitored. Share through secure channels only.
            Screenshot evidence before it disappears.
          </span>
        </div>
      </StyledCard>

      {/* Comments section */}
      <StyledCard
        variant="dark"
        padding="md"
        borderRadius="sm"
        shadow="md"
        bgColor="#1a1a1a"
        borderColor="#7f1d1d"
        textColor="#fef2f2"
      >
        <h3 className="text-lg font-bold text-red-400 mb-4 font-mono">
          COMMUNITY EVIDENCE ({article.comments.length} contributors)
        </h3>
        <div className="space-y-4">
          {article.comments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))}
        </div>

        {/* Comment form (non-functional but adds to authenticity) */}
        <div className="mt-6 pt-4 border-t border-red-900/50">
          <textarea
            placeholder="Add your evidence... (VPN recommended)"
            className="w-full p-3 rounded text-sm bg-black/50 border border-red-900/50 text-gray-300 placeholder-gray-600 resize-none"
            rows={3}
            disabled
          />
          <p className="text-xs text-red-600 mt-2 font-mono">
            Comments disabled temporarily - increased surveillance detected
          </p>
        </div>
      </StyledCard>
    </div>
  );
}

// ============================================================================
// Main Site Component
// ============================================================================

export function GrainTruthSite({ siteId }: SiteProps) {
  // Database is the sole source of truth for article data
  const { content: dbContent } = useSiteContent('graintruth')

  const articles = useMemo(() => dbContent.map(dbToArticle), [dbContent])

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'about' | 'network'>('evidence');

  return (
    <div className="min-h-full" style={{ background: '#0a0a0a' }}>
      {/* THEY'RE WATCHING banner - always visible */}
      <div
        className="py-1 text-center text-xs font-mono animate-pulse"
        style={{ backgroundColor: '#7f1d1d', color: '#fef2f2' }}
      >
        THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING
      </div>

      {/* Header */}
      <header
        className="py-6 px-4"
        style={{
          background: 'linear-gradient(180deg, #1a0000 0%, #0a0a0a 100%)',
          borderBottom: '3px solid #7f1d1d',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🌽</div>
            <div>
              <h1 className="text-3xl font-bold font-mono">
                <GlitchText className="text-red-500">GRAIN</GlitchText>
                <GlitchText className="text-yellow-500">TRUTH</GlitchText>
              </h1>
              <p className="text-red-400/80 text-sm font-mono italic">
                "THEY CONTROL THE CORN. THEY CONTROL EVERYTHING."
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-6 text-sm font-mono">
            {(['evidence', 'about', 'network'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedArticle(null);
                }}
                className={`uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'text-red-400 border-b-2 border-red-400'
                    : 'text-gray-500 hover:text-red-400'
                }`}
              >
                [{tab}]
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Threat level banner */}
      <div
        className="py-2 px-4 text-center font-mono"
        style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #7f1d1d' }}
      >
        <span className="text-orange-500 font-bold">CURRENT THREAT LEVEL: {THREAT_LEVEL.level}</span>
        <span className="text-gray-500 mx-2">|</span>
        <span className="text-gray-400 text-sm">{THREAT_LEVEL.message}</span>
        <span className="text-gray-500 mx-2">|</span>
        <span className="text-red-600 text-sm">Visitors: {VISITOR_COUNT.toLocaleString()}</span>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1">
            {activeTab === 'evidence' && (
              <>
                {selectedArticle ? (
                  <ArticleView
                    article={selectedArticle}
                    onBack={() => setSelectedArticle(null)}
                  />
                ) : (
                  <>
                    {/* Latest alert */}
                    <div
                      className="p-3 mb-4 rounded font-mono text-sm"
                      style={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #7f1d1d',
                      }}
                    >
                      <span className="text-red-500 font-bold">ALERT:</span>{' '}
                      <span className="text-yellow-400">
                        New whistleblower evidence connects corn subsidies to
                        surveillance expansion. Article pending verification.
                        847 documents received.
                      </span>
                    </div>

                    {/* Article list */}
                    {articles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onSelect={() => setSelectedArticle(article)}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === 'about' && (
              <StyledCard
                variant="dark"
                padding="lg"
                borderRadius="sm"
                shadow="md"
                bgColor="#1a1a1a"
                borderColor="#7f1d1d"
                textColor="#fef2f2"
              >
                <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono">
                  ABOUT THIS SITE
                </h2>
                <div className="text-gray-300 text-sm space-y-4">
                  <p>
                    GrainTruth was founded in 2019 by a collective of researchers,
                    former agricultural industry workers, and concerned citizens who
                    recognized that CORN is at the center of everything.
                  </p>
                  <p>
                    We are not affiliated with any political party, corporation, or
                    government entity. We accept no advertising. Our hosting is paid
                    through anonymous cryptocurrency donations routed through 7
                    different exchanges.
                  </p>
                  <p>
                    Our research has been cited by hartwellfiles.corn, QuantumBrewBlog,
                    and various Threadit communities before being deleted. We have been
                    threatened with legal action 8 times. We have been hacked 47 times.
                    We persist.
                  </p>
                  <p>
                    The truth about corn cannot be suppressed forever. Big Corn controls
                    the government, the food supply, and through the .corn domain, the
                    ENTIRE INTERNET. But they cannot control US.
                  </p>
                  <p className="text-red-400 font-mono">
                    We are the kernels of resistance. Join us.
                  </p>
                </div>

                <div
                  className="mt-6 p-4 rounded"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid #7f1d1d' }}
                >
                  <h3 className="text-red-400 font-mono font-bold mb-2">
                    CONTACT (SECURE ONLY)
                  </h3>
                  <p className="text-gray-500 text-xs font-mono">
                    PGP Key: Available on request through verified channels
                  </p>
                  <p className="text-gray-500 text-xs font-mono">
                    Dead drop: Rotating locations - Signal for coordinates
                  </p>
                  <p className="text-gray-500 text-xs font-mono">
                    DO NOT email us through normal channels. THEY read everything.
                  </p>
                </div>
              </StyledCard>
            )}

            {activeTab === 'network' && (
              <StyledCard
                variant="dark"
                padding="lg"
                borderRadius="sm"
                shadow="md"
                bgColor="#1a1a1a"
                borderColor="#7f1d1d"
                textColor="#fef2f2"
              >
                <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono">
                  THE TRUTH NETWORK
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Allied researchers and documentation sites. Support the network.
                </p>

                <div className="space-y-4">
                  {SIDEBAR_LINKS.map((link, i) => (
                    <div
                      key={i}
                      className="p-3 rounded cursor-pointer transition-colors hover:bg-red-900/20"
                      style={{ border: '1px solid #7f1d1d' }}
                    >
                      <p className="text-red-400 font-mono">{link.title}</p>
                      <p className="text-gray-500 text-xs">{link.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded" style={{ backgroundColor: '#0a0a0a', border: '1px solid #7f1d1d' }}>
                  <h3 className="text-yellow-500 font-mono font-bold mb-2">
                    SPECIAL RESEARCH PARTNER
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Derek at QuantumBrewBlog has conducted 847 separate trials documenting
                    quantum corn compounds. His work on the Martinez Study is essential reading.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    &quot;The corn-coffee axis is the key to understanding everything.&quot; - Derek
                  </p>
                </div>
              </StyledCard>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 hidden lg:block space-y-4">
            {/* Visitor counter */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-xs text-gray-500 font-mono uppercase mb-1">
                Awakened Visitors
              </h3>
              <p className="text-2xl font-bold text-red-400 font-mono">
                {VISITOR_COUNT.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                (They can see this number too)
              </p>
            </StyledCard>

            {/* Quick stats */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-red-400 mb-3 font-mono">
                BY THE NUMBERS
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Corn subsidies (2024)</span>
                  <span className="text-yellow-400 font-mono">$8.47B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">HFCS in US food supply</span>
                  <span className="text-yellow-400 font-mono">84.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Suppressed articles</span>
                  <span className="text-yellow-400 font-mono">847+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nebraska witnesses</span>
                  <span className="text-yellow-400 font-mono">0*</span>
                </div>
              </div>
              <p className="text-xs text-gray-700 mt-2">
                *All Nebraska &quot;witnesses&quot; have memory inconsistencies
              </p>
            </StyledCard>

            {/* Allied sites */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-red-400 mb-3 font-mono">
                TRUTH NETWORK
              </h3>
              <div className="space-y-2">
                {SIDEBAR_LINKS.map((link, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-gray-400 hover:text-red-400 cursor-pointer">
                      {link.title}
                    </p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Daily reminder */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#0a0a0a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-yellow-500 mb-2 font-mono">
                DAILY REMINDER
              </h3>
              <p className="text-xs text-gray-400">
                Check food labels. Avoid HFCS. Question &quot;Nebraska.&quot;
                The Hartwell Building has 13 floors. Derek was right about the coffee.
                The .corn domain was not an accident.
              </p>
              <p className="text-xs text-red-500 mt-2 font-mono">
                STAY VIGILANT.
              </p>
            </StyledCard>

            {/* Archive link */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-red-400 mb-2 font-mono">
                SECURE ARCHIVE
              </h3>
              <p className="text-xs text-gray-500">
                All articles are backed up to 8 secure locations across 4 continents.
                If this site goes dark, the archive survives.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Last backup: 47 minutes ago
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-4 text-center font-mono"
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: '3px solid #7f1d1d',
        }}
      >
        <p className="text-gray-500 text-xs">
          GrainTruth.corn - Established 2019 - Suppressed 847 times - Still here
        </p>
        <p className="text-red-600 text-xs mt-1">
          &quot;The truth is not a kernel. It is the whole cob.&quot;
        </p>
        <p className="text-gray-700 text-xs mt-2">
          Big Corn is watching. But so are we.
        </p>
      </footer>

      {/* Bottom warning banner */}
      <div
        className="py-1 text-center text-xs font-mono animate-pulse"
        style={{ backgroundColor: '#7f1d1d', color: '#fef2f2' }}
      >
        THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING
      </div>
    </div>
  );
}

export default GrainTruthSite;
