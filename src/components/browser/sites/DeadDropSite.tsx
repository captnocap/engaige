/**
 * DeadDrop Site
 *
 * Anonymous imageboard/dead drop site for the engAIge browser.
 * Features anonymous tips, confessions, and whistleblowing that's 90% shitposts.
 * Stark black/white/red aesthetic with "encryption theater" that doesn't actually encrypt anything.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Theme Configuration (inline since not in filler-sites yet)
// ============================================================================

const theme = {
  primary: '#DC2626',        // Red
  secondary: '#ffffff',      // White
  background: '#0a0a0a',     // Near black
  surface: '#111111',        // Slightly lighter black
  text: '#ffffff',           // White text
  textMuted: '#737373',      // Grey
  border: '#262626',         // Dark border
  danger: '#DC2626',         // Red for warnings
  verified: '#22c55e',       // Green for credible
  unverified: '#eab308',     // Yellow for unverified
  lying: '#ef4444',          // Red for probably lying
}

// ============================================================================
// Types
// ============================================================================

type CredibilityLevel = 'unverified' | 'somewhat-credible' | 'probably-lying'
type Category = 'corporate-leaks' | 'personal-confessions' | 'conspiracy' | 'lost-found' | 'misc'

interface Reply {
  id: string
  content: string
  timestamp: string
  credibility: CredibilityLevel
  upvotes: number
  downvotes: number
}

interface Thread {
  id: string
  title: string
  content: string
  category: Category
  timestamp: string
  lastActivity: string
  credibility: CredibilityLevel
  replies: Reply[]
  replyCount?: number  // Override count (for the 847 thread easter egg)
  views: number
  archived?: boolean
}

// ============================================================================
// Sample Data - All the Lore-Connected Threads
// ============================================================================

const CATEGORIES: { id: Category; name: string; icon: string }[] = [
  { id: 'corporate-leaks', name: 'Corporate Leaks', icon: '🏢' },
  { id: 'personal-confessions', name: 'Personal Confessions', icon: '💔' },
  { id: 'conspiracy', name: 'Conspiracy', icon: '👁️' },
  { id: 'lost-found', name: 'Lost & Found', icon: '🔍' },
  { id: 'misc', name: 'Misc', icon: '📝' },
]


// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Thread interface */
function dbToThread(item: SiteContentItem): Thread {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    content: item.body ?? item.summary ?? '',
    category: (item.category ?? m.category ?? 'misc') as Category,
    timestamp: m.timestamp ?? new Date((item.publishedAt || item.createdAt) * 1000).toISOString().slice(0, 19).replace('T', ' '),
    lastActivity: m.lastActivity ?? m.last_activity ?? m.timestamp ?? '',
    credibility: (m.credibility ?? 'unverified') as CredibilityLevel,
    replies: (m.replies ?? []).map((r: any, i: number) => ({
      id: r.id ?? `r_${i}`,
      content: r.content ?? '',
      timestamp: r.timestamp ?? '',
      credibility: (r.credibility ?? 'unverified') as CredibilityLevel,
      upvotes: r.upvotes ?? 0,
      downvotes: r.downvotes ?? 0,
    })),
    replyCount: m.replyCount ?? m.reply_count ?? undefined,
    views: item.viewCount ?? m.views ?? 0,
    archived: m.archived ?? false,
  }
}

// ============================================================================
// Components
// ============================================================================

function CredibilityBadge({ level }: { level: CredibilityLevel }) {
  const config = {
    'unverified': { bg: theme.unverified + '20', border: theme.unverified, text: theme.unverified, label: 'UNVERIFIED' },
    'somewhat-credible': { bg: theme.verified + '20', border: theme.verified, text: theme.verified, label: 'SOMEWHAT CREDIBLE' },
    'probably-lying': { bg: theme.lying + '20', border: theme.lying, text: theme.lying, label: 'PROBABLY LYING' },
  }
  const c = config[level]

  return (
    <span
      className="text-[10px] font-mono px-2 py-0.5 rounded border"
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
    >
      {c.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const cat = CATEGORIES.find(c => c.id === category)
  return (
    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: theme.border, color: theme.textMuted }}>
      {cat?.icon} {cat?.name}
    </span>
  )
}

function EncryptionBanner() {
  return (
    <div
      className="py-1 px-4 text-center text-xs font-mono"
      style={{ backgroundColor: theme.border, color: theme.verified }}
    >
      <span className="animate-pulse mr-2">&#x1F512;</span>
      END-TO-END ENCRYPTED* CONNECTION SECURED
      <span className="text-[8px] ml-2" style={{ color: theme.textMuted }}>*not actually encrypted</span>
    </div>
  )
}

function ThreadCard({ thread, onClick }: { thread: Thread; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded border transition-colors hover:border-red-500/50"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm" style={{ color: thread.archived ? theme.textMuted : theme.text }}>
          {thread.archived && <span className="text-red-500 mr-2">[ARCHIVED]</span>}
          {thread.title}
        </h3>
        <CredibilityBadge level={thread.credibility} />
      </div>
      <p className="text-xs line-clamp-2 mb-3" style={{ color: theme.textMuted }}>
        {thread.content}
      </p>
      <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
        <div className="flex items-center gap-3">
          <CategoryBadge category={thread.category} />
          <span>{thread.replyCount ?? thread.replies.length} drops</span>
          <span>{thread.views.toLocaleString()} views</span>
        </div>
        <span>Last activity: {thread.lastActivity}</span>
      </div>
    </button>
  )
}

function ThreadDetail({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  const [voteState, setVoteState] = useState<Record<string, 'up' | 'down' | null>>({})
  const [showDropForm, setShowDropForm] = useState(false)

  const handleVote = (replyId: string, direction: 'up' | 'down') => {
    setVoteState(prev => ({
      ...prev,
      [replyId]: prev[replyId] === direction ? null : direction,
    }))
  }

  const getVoteAdjustment = (reply: Reply) => {
    const vote = voteState[reply.id]
    let up = reply.upvotes
    let down = reply.downvotes
    if (vote === 'up') up += 1
    if (vote === 'down') down += 1
    return { up, down }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-xs mb-4 hover:underline"
        style={{ color: theme.primary }}
      >
        &larr; Back to drops
      </button>

      {/* Main Thread */}
      <div
        className="p-4 rounded border mb-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-lg font-bold" style={{ color: theme.text }}>
            {thread.archived && <span className="text-red-500 mr-2">[ARCHIVED]</span>}
            {thread.title}
          </h1>
          <CredibilityBadge level={thread.credibility} />
        </div>
        <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: theme.textMuted }}>
          <CategoryBadge category={thread.category} />
          <span>Dropped: {thread.timestamp}</span>
          <span>{thread.views.toLocaleString()} views</span>
        </div>
        <div className="text-sm whitespace-pre-wrap" style={{ color: theme.text }}>
          {thread.content}
        </div>
      </div>

      {/* Drop Form Toggle */}
      {!thread.archived && (
        <div className="mb-4">
          {showDropForm ? (
            <div
              className="p-4 rounded border"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: theme.text }}>Leave a Drop</h3>
              <textarea
                placeholder="Your anonymous confession / leak / shitpost..."
                rows={4}
                className="w-full p-3 rounded text-sm resize-none mb-3"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px]" style={{ color: theme.textMuted }}>
                  Your IP is definitely not being logged*
                  <span className="block">*it is</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDropForm(false)}
                    className="px-3 py-1 text-xs rounded"
                    style={{ backgroundColor: theme.border, color: theme.textMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded font-bold"
                    style={{ backgroundColor: theme.primary, color: theme.text }}
                  >
                    Drop It
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDropForm(true)}
              className="w-full p-3 rounded border text-sm hover:border-red-500/50 transition-colors"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textMuted }}
            >
              + Leave an anonymous drop
            </button>
          )}
        </div>
      )}

      {/* Replies */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold" style={{ color: theme.textMuted }}>
          {thread.replyCount ?? thread.replies.length} DROPS
        </h3>
        {thread.replies.slice(0, 20).map((reply, index) => {
          const votes = getVoteAdjustment(reply)
          return (
            <div
              key={reply.id}
              className="p-3 rounded border-l-2"
              style={{
                backgroundColor: theme.surface,
                borderColor: reply.credibility === 'probably-lying' ? theme.lying :
                  reply.credibility === 'somewhat-credible' ? theme.verified : theme.border,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>
                    #{index + 1}
                  </span>
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>
                    {reply.timestamp}
                  </span>
                  <CredibilityBadge level={reply.credibility} />
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-2" style={{ color: theme.text }}>
                {reply.content}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => handleVote(reply.id, 'up')}
                  className="flex items-center gap-1 hover:opacity-80"
                  style={{ color: voteState[reply.id] === 'up' ? theme.verified : theme.textMuted }}
                >
                  <span>&#9650;</span>
                  <span>{votes.up}</span>
                </button>
                <button
                  onClick={() => handleVote(reply.id, 'down')}
                  className="flex items-center gap-1 hover:opacity-80"
                  style={{ color: voteState[reply.id] === 'down' ? theme.lying : theme.textMuted }}
                >
                  <span>&#9660;</span>
                  <span>{votes.down}</span>
                </button>
              </div>
            </div>
          )
        })}
        {(thread.replyCount ?? thread.replies.length) > 20 && (
          <p className="text-xs text-center py-4" style={{ color: theme.textMuted }}>
            Showing {Math.min(20, thread.replies.length)} of {thread.replyCount ?? thread.replies.length} drops.
            {thread.replyCount === 847 ? ' Yes, we counted. Yes, it\'s exactly 847.' : ' Full thread available on request (just kidding, we deleted the rest).'}
          </p>
        )}
      </div>
    </div>
  )
}

function DropForm({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="p-4 rounded border mb-6"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: theme.text }}>New Dead Drop</h3>
        <button onClick={onClose} className="text-xs hover:underline" style={{ color: theme.textMuted }}>
          Cancel
        </button>
      </div>
      <input
        type="text"
        placeholder="Subject (optional but recommended)"
        className="w-full p-2 rounded text-sm mb-3"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
      />
      <div className="flex gap-2 mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className="text-xs px-2 py-1 rounded border hover:border-red-500/50 transition-colors"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.textMuted }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Spill the beans. We're listening. (So are they.)"
        rows={6}
        className="w-full p-3 rounded text-sm resize-none mb-3"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
      />
      <div className="flex items-center justify-between">
        <div className="text-[10px]" style={{ color: theme.textMuted }}>
          <p>&#x1F512; Your identity is protected*</p>
          <p className="ml-4">*Terms and Whose-CIA-Are-You-With-Anyway Apply</p>
        </div>
        <button
          className="px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primary, color: theme.text }}
        >
          DROP IT
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function DeadDropSite({ siteId }: SiteProps) {
  // Fetch DB content - database is the sole source of truth
  const { content: dbContent } = useSiteContent('deaddrop')

  const threads = useMemo(() => dbContent.map(dbToThread), [dbContent])

  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showDropForm, setShowDropForm] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'hot' | 'controversial'>('recent')

  const filteredThreads = threads
    .filter(t => !selectedCategory || t.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      if (sortBy === 'hot') return b.views - a.views
      return (b.replies[0]?.downvotes || 0) - (a.replies[0]?.downvotes || 0)
    })

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <header
        className="py-4 px-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">&#x1F4E6;</span>
            <div>
              <h1 className="text-2xl font-bold font-mono" style={{ color: theme.primary }}>
                DEAD DROP
              </h1>
              <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                www.deaddrop.corn | Anonymous tips, confessions, and mostly shitposts
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Encryption Theater Banner */}
      <EncryptionBanner />

      {/* Warning Banner */}
      <div className="py-2 px-4 border-b" style={{ borderColor: theme.border, backgroundColor: theme.primary + '10' }}>
        <p className="text-xs text-center font-mono" style={{ color: theme.primary }}>
          &#x26A0; NOTHING YOU POST HERE IS ACTUALLY ANONYMOUS &#x26A0; WE JUST THINK IT'S FUNNY THAT YOU BELIEVE IT IS
        </p>
      </div>

      {/* Navigation */}
      <nav className="py-3 px-4 border-b" style={{ borderColor: theme.border }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectedCategory(null); setSelectedThread(null); }}
                className={`text-xs px-3 py-1 rounded ${!selectedCategory ? 'font-bold' : ''}`}
                style={{
                  backgroundColor: !selectedCategory ? theme.primary : theme.surface,
                  color: !selectedCategory ? theme.text : theme.textMuted,
                }}
              >
                ALL
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedThread(null); }}
                  className={`text-xs px-3 py-1 rounded ${selectedCategory === cat.id ? 'font-bold' : ''}`}
                  style={{
                    backgroundColor: selectedCategory === cat.id ? theme.primary : theme.surface,
                    color: selectedCategory === cat.id ? theme.text : theme.textMuted,
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDropForm(true)}
              className="text-xs px-3 py-1 rounded font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary, color: theme.text }}
            >
              + NEW DROP
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {showDropForm && <DropForm onClose={() => setShowDropForm(false)} />}

        {selectedThread ? (
          <ThreadDetail
            thread={selectedThread}
            onBack={() => setSelectedThread(null)}
          />
        ) : (
          <>
            {/* Sort Controls */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs" style={{ color: theme.textMuted }}>Sort by:</span>
              {(['recent', 'hot', 'controversial'] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`text-xs ${sortBy === sort ? 'underline font-bold' : ''}`}
                  style={{ color: sortBy === sort ? theme.primary : theme.textMuted }}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>

            {/* Thread List */}
            <div className="space-y-3">
              {filteredThreads.map(thread => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => setSelectedThread(thread)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t" style={{ borderColor: theme.border }}>
        <div className="max-w-4xl mx-auto text-center text-xs" style={{ color: theme.textMuted }}>
          <p>DeadDrop is not affiliated with any government agency. Probably.</p>
          <p className="mt-1">All drops are the opinion of their anonymous authors. Credibility ratings are assigned by a magic 8-ball.</p>
          <p className="mt-1 font-mono" style={{ color: theme.primary }}>
            "In a world full of surveillance, everyone's anonymous." - Someone, probably
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DeadDropSite
