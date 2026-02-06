/**
 * PasteLive Site
 *
 * A Pastebin-style text sharing site hosting "pastes" that provide windows into
 * the weird lives of NPCs in the engAIge universe. Features manifestos, angry
 * letters, code snippets with disturbing comments, and more.
 *
 * Dark theme mimicking real pastebin sites with syntax highlighting options,
 * view counts, expiration timestamps, and non-functional Report/Raw buttons.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Types & Data
// ============================================================================

type PasteCategory = 'text' | 'code' | 'document' | 'legal' | 'markdown'

interface Paste {
  id: string
  title: string
  author: string
  category: PasteCategory
  created: string
  expires: string | null
  views: number
  syntax: string
  content: string
  isPrivate?: boolean
  isHighlighted?: boolean
}

// (Hardcoded pastes removed -- database is the sole source of truth)

/**
 * Additional recent pastes for the sidebar (titles only)
 */
const RECENT_TITLES = [
  { id: 'misc-1', title: 'untitled_rant.txt', views: 234, time: '2 hours ago' },
  { id: 'misc-2', title: 'backup_before_i_forget.sql', views: 567, time: '4 hours ago' },
  { id: 'misc-3', title: 'IMPORTANT_READ_NOW.txt', views: 89, time: '5 hours ago' },
  { id: 'misc-4', title: 'poetry_attempt_12.txt', views: 45, time: '8 hours ago' },
  { id: 'misc-5', title: 'urls_i_need_to_check.md', views: 123, time: '12 hours ago' },
  { id: 'misc-6', title: 'why_does_excel_hate_me.csv', views: 847, time: '1 day ago' },
  { id: 'misc-7', title: 'mom_recipe_dont_lose.txt', views: 67, time: '2 days ago' },
  { id: 'misc-8', title: 'wifi_passwords_home.txt', views: 1, time: '3 days ago' },
]

// ============================================================================
// DB Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Paste interface.
 * Uses metadata for paste-specific fields like category, syntax, expires, etc.
 */
function dbToPaste(item: SiteContentItem): Paste {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    author: m.author ?? m.Author ?? 'Anonymous',
    category: (m.category ?? m.Category ?? item.category ?? 'text') as PasteCategory,
    created: m.created ?? m.Created ?? new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    expires: m.expires ?? m.Expires ?? null,
    views: item.viewCount ?? m.views ?? m.Views ?? 0,
    syntax: m.syntax ?? m.Syntax ?? 'none',
    content: item.body ?? item.summary ?? '',
    isPrivate: m.isPrivate ?? m.is_private ?? false,
    isHighlighted: item.isFeatured ?? m.isHighlighted ?? m.is_highlighted ?? false,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get syntax highlighting color class based on content type
 */
function getSyntaxHighlightClass(syntax: string): string {
  const classes: Record<string, string> = {
    python: 'text-green-400',
    markdown: 'text-blue-400',
    none: 'text-gray-300',
  }
  return classes[syntax] || 'text-gray-300'
}

/**
 * Get category badge styles
 */
function getCategoryStyle(category: PasteCategory): { bg: string; text: string } {
  const styles: Record<PasteCategory, { bg: string; text: string }> = {
    text: { bg: '#374151', text: '#9CA3AF' },
    code: { bg: '#064E3B', text: '#6EE7B7' },
    document: { bg: '#1E3A8A', text: '#93C5FD' },
    legal: { bg: '#7C2D12', text: '#FDBA74' },
    markdown: { bg: '#4C1D95', text: '#C4B5FD' },
  }
  return styles[category]
}

// ============================================================================
// Components
// ============================================================================

/**
 * Category badge component
 */
function CategoryBadge({ category }: { category: PasteCategory }) {
  const style = getCategoryStyle(category)
  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-mono uppercase"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {category}
    </span>
  )
}

/**
 * Paste list item for homepage view
 */
function PasteListItem({
  paste,
  onSelect,
}: {
  paste: Paste
  onSelect: () => void
}) {
  return (
    <div
      className="flex items-center gap-4 py-3 px-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 transition-colors"
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-400 font-mono text-sm truncate hover:text-green-300">
            {paste.title}
          </span>
          {paste.isPrivate && (
            <span className="text-xs px-1.5 py-0.5 bg-yellow-900/50 text-yellow-500 rounded">
              unlisted
            </span>
          )}
          {paste.isHighlighted && (
            <span className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded">
              featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>by {paste.author}</span>
          <span>|</span>
          <CategoryBadge category={paste.category} />
          <span>|</span>
          <span>{paste.created}</span>
        </div>
      </div>
      <div className="text-right text-xs text-gray-500">
        <div className="text-gray-400">{paste.views.toLocaleString()} views</div>
        {paste.expires && (
          <div className="text-orange-500">Expires: {paste.expires}</div>
        )}
      </div>
    </div>
  )
}

/**
 * Full paste detail view with content display
 */
function PasteDetail({
  paste,
  onBack,
}: {
  paste: Paste
  onBack: () => void
}) {
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [copied, setCopied] = useState(false)

  const lines = paste.content.split('\n')
  const syntaxClass = getSyntaxHighlightClass(paste.syntax)

  const handleCopy = () => {
    navigator.clipboard.writeText(paste.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-full bg-gray-900">
      {/* Paste Header */}
      <div className="bg-gray-850 border-b border-gray-700 p-4" style={{ backgroundColor: '#1a1d23' }}>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="text-green-500 hover:text-green-400 text-sm mb-3 font-mono"
          >
            &larr; Back to pastes
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-mono text-green-400 mb-2">{paste.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Posted by <span className="text-gray-300">{paste.author}</span></span>
                <span>|</span>
                <CategoryBadge category={paste.category} />
                <span>|</span>
                <span>{paste.created}</span>
                <span>|</span>
                <span>{paste.views.toLocaleString()} views</span>
              </div>
              {paste.expires && (
                <div className="text-orange-500 text-sm mt-1">
                  Expires: {paste.expires}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors opacity-50 cursor-not-allowed"
                title="Raw view not available"
              >
                Raw
              </button>
              <button
                className="px-3 py-1.5 bg-red-900/50 hover:bg-red-900/70 text-red-400 text-sm rounded transition-colors opacity-50 cursor-not-allowed"
                title="Report functionality coming soon"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600"
            />
            Line numbers
          </label>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">Syntax: {paste.syntax}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">{lines.length} lines</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className={syntaxClass}>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  {showLineNumbers && (
                    <span className="text-gray-600 select-none pr-4 text-right w-12 flex-shrink-0">
                      {i + 1}
                    </span>
                  )}
                  <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-gray-800/50 rounded p-4 text-center text-sm text-gray-500">
          <p>Paste ID: {paste.id} | Created: {paste.created}</p>
          <p className="mt-1">
            Share link: pastelive.corn/{paste.id}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Recent pastes sidebar component
 */
function RecentPastesSidebar({ onSelectPaste }: { onSelectPaste: (id: string) => void }) {
  return (
    <div className="bg-gray-800 rounded p-4">
      <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
        Recent Public Pastes
      </h3>
      <div className="space-y-2">
        {RECENT_TITLES.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center text-xs py-1.5 border-b border-gray-700 last:border-0"
          >
            <span
              className="text-green-400 hover:text-green-300 cursor-pointer truncate max-w-32"
              onClick={() => {
                // These are placeholder titles that don't have full content
                // In a real app, they would navigate to their paste
              }}
            >
              {item.title}
            </span>
            <span className="text-gray-500 flex-shrink-0 ml-2">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Stats sidebar component
 */
function StatsSidebar() {
  return (
    <div className="bg-gray-800 rounded p-4">
      <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
        Statistics
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Pastes</span>
          <span className="text-gray-300">847,231</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Active Today</span>
          <span className="text-gray-300">12,847</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Expired Today</span>
          <span className="text-gray-300">4,721</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Anonymous Posts</span>
          <span className="text-gray-300">78.5%</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function PasteLiveSite({ siteId, path, onPathChange }: SiteProps) {
  const { content: dbContent } = useSiteContent('pastelive')
  // Database is the sole source of truth for paste data
  const pastes = useMemo(() => dbContent.map(dbToPaste), [dbContent])

  const [selectedPaste, setSelectedPaste] = useState<Paste | null>(null)

  // Handle path-based navigation
  const handleSelectPaste = (paste: Paste) => {
    setSelectedPaste(paste)
    onPathChange?.(`/${paste.id}`)
  }

  const handleBack = () => {
    setSelectedPaste(null)
    onPathChange?.(null)
  }

  // If viewing a specific paste
  if (selectedPaste) {
    return <PasteDetail paste={selectedPaste} onBack={handleBack} />
  }

  // Main list view
  return (
    <div className="min-h-full bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h1 className="text-xl font-bold text-green-400 font-mono">PasteLive</h1>
              <p className="text-xs text-gray-500">Share text. No questions asked.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors">
              + New Paste
            </button>
            <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors">
              API
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-850 border-b border-gray-700" style={{ backgroundColor: '#1a1d23' }}>
        <div className="max-w-5xl mx-auto flex">
          <button className="px-4 py-3 text-sm text-green-400 border-b-2 border-green-400 font-medium">
            Public Pastes
          </button>
          <button className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300">
            Trending
          </button>
          <button className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300">
            Archive
          </button>
          <button className="px-4 py-3 text-sm text-gray-500 hover:text-gray-300">
            Syntax List
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Paste List */}
          <div className="flex-1">
            <div className="bg-gray-800 rounded overflow-hidden border border-gray-700">
              <div className="px-4 py-3 bg-gray-750 border-b border-gray-700 flex justify-between items-center" style={{ backgroundColor: '#1f2937' }}>
                <h2 className="text-sm font-medium text-gray-300">Latest Pastes</h2>
                <span className="text-xs text-gray-500">
                  {pastes.length} featured | 847,231 total
                </span>
              </div>
              <div>
                {pastes.map((paste) => (
                  <PasteListItem
                    key={paste.id}
                    paste={paste}
                    onSelect={() => handleSelectPaste(paste)}
                  />
                ))}
              </div>
            </div>

            {/* Pagination placeholder */}
            <div className="mt-4 flex justify-center gap-2">
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                Previous
              </button>
              <span className="px-3 py-1.5 bg-green-600 text-white text-sm rounded">1</span>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                2
              </button>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                3
              </button>
              <span className="px-3 py-1.5 text-gray-500 text-sm">...</span>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                847
              </button>
              <button className="px-3 py-1.5 bg-gray-800 text-gray-400 text-sm rounded hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 space-y-4 hidden lg:block">
            <StatsSidebar />
            <RecentPastesSidebar onSelectPaste={(id) => {
              const paste = pastes.find(p => p.id === id)
              if (paste) handleSelectPaste(paste)
            }} />

            {/* Info Box */}
            <div className="bg-gray-800 rounded p-4">
              <h3 className="text-sm font-bold text-gray-300 mb-2">About PasteLive</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                PasteLive is a simple text hosting service. Paste code, notes,
                manifestos, or anything else. Set expiration dates or keep forever.
                We don&apos;t ask questions.
              </p>
              <p className="text-xs text-gray-600 mt-2 italic">
                &quot;Your secrets are safe here. Mostly.&quot;
              </p>
            </div>

            {/* Ad-like Box */}
            <div className="bg-gray-800 border border-yellow-900/50 rounded p-4">
              <p className="text-xs text-yellow-500/70 uppercase tracking-wide mb-2">
                Sponsored
              </p>
              <p className="text-sm text-gray-400">
                Tired of your code being judged? Try
                <span className="text-green-400"> AnonymousCodeReview.corn</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                &quot;They can&apos;t fire you if they don&apos;t know it&apos;s you.&quot;
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6 px-4 mt-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-gray-400 font-mono">
            PasteLive.corn - Share text anonymously since 2019
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-400 cursor-pointer">Terms</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Privacy</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">API Docs</span>
            <span>|</span>
            <span className="hover:text-gray-400 cursor-pointer">Contact</span>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Total pastes hosted: 847,231 | Deleted by request: 23
          </p>
        </div>
      </footer>
    </div>
  )
}

export default PasteLiveSite
