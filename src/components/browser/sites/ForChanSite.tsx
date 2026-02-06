/**
 * ForChan Site
 *
 * 4chan-style imageboard clone for the engAIge browser.
 * Features anonymous posting, greentext, reply chains, and classic imageboard aesthetic.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, useSiteCategories, type SiteContentItem, type SiteCategory } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.imageboard

// ============================================================================
// Types
// ============================================================================

interface Reply {
  id: string
  content: string
  image?: string
  timestamp: string
  replyTo?: string[]
  name?: string
  tripcode?: string
}

interface Thread {
  id: string
  board: string
  subject?: string
  content: string
  image?: string
  timestamp: string
  replies: Reply[]
  name?: string
  tripcode?: string
  sticky?: boolean
  locked?: boolean
}

interface Board {
  id: string
  name: string
  description: string
  nsfw?: boolean
}

// ============================================================================
// Sample Data
// ============================================================================

// Hardcoded BOARDS removed -- DB is the sole source of truth

// Hardcoded SAMPLE_THREADS removed -- DB is the sole source of truth

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Thread interface */
function dbToThread(item: SiteContentItem): Thread {
  const m = item.metadata || {}
  // Normalize board to short code (e.g. '/x/' → 'x')
  const rawBoard = m.board ? String(m.board).replace(/\//g, '') : ''
  return {
    id: item.slug,
    board: rawBoard || item.category || 'b',
    subject: item.title || m.subject,
    content: item.body || item.summary || '',
    image: item.thumbnailEmoji || m.image,
    timestamp: m.timestamp || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleString(),
    replies: Array.isArray(m.replies) ? (m.replies as Reply[]) : [],
    name: m.name,
    tripcode: m.tripcode,
    sticky: item.isPinned || m.sticky || false,
    locked: m.locked || false,
  }
}

/** Adapt a DB SiteCategory to the local Board interface */
function dbToBoard(cat: SiteCategory): Board {
  return {
    id: cat.slug,
    name: cat.name,
    description: cat.description || '',
  }
}

// ============================================================================
// Components
// ============================================================================

export function ForChanSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('forchan')
  const { categories: dbCategories } = useSiteCategories('forchan')

  const threads = useMemo(() => dbContent.map(dbToThread), [dbContent])

  const boards = useMemo(() => dbCategories.map(dbToBoard), [dbCategories])

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)

  // Track if we're updating from path (to avoid triggering onPathChange)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setSelectedThread(null)
      setSelectedBoard(null)
    } else if (path.match(/^\/([^/]+)\/thread\/(.+)$/)) {
      // Thread path: /x/thread/some-thread-slug
      const match = path.match(/^\/([^/]+)\/thread\/(.+)$/)
      if (match) {
        const [, boardId, threadSlug] = match
        const thread = threads.find(t => t.id === threadSlug)
        if (thread) {
          setSelectedBoard(boardId)
          setSelectedThread(thread)
        }
      }
    } else if (path.match(/^\/([^/]+)$/)) {
      // Board path: /x
      const boardId = path.slice(1)
      if (boards.some(b => b.id === boardId)) {
        setSelectedThread(null)
        setSelectedBoard(boardId)
      }
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, threads, boards])

  // Navigation handlers that update both state and path
  const handleSelectBoard = (boardId: string | null) => {
    setSelectedBoard(boardId)
    setSelectedThread(null)
    if (boardId) {
      onPathChange?.('/' + boardId)
    } else {
      onPathChange?.(null)
    }
  }

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread)
    onPathChange?.('/' + thread.board + '/thread/' + thread.id)
  }

  const handleBackFromThread = () => {
    setSelectedThread(null)
    if (selectedBoard) {
      onPathChange?.('/' + selectedBoard)
    } else {
      onPathChange?.(null)
    }
  }

  const displayedThreads = selectedBoard
    ? threads.filter(t => t.board === selectedBoard)
    : threads

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="text-center py-3 px-4"
        style={{ background: site.theme.headerBg, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: site.theme.headerText }}
        >
          {site.name}
        </h1>
        <p className="text-sm" style={{ color: site.theme.textMuted }}>
          {site.tagline}
        </p>
      </header>

      {/* Board Navigation */}
      <nav
        className="px-4 py-2 text-center text-sm border-b"
        style={{ background: site.theme.surface, borderColor: site.theme.border }}
      >
        <span className="font-bold mr-2" style={{ color: site.theme.text }}>[ </span>
        <button
          onClick={() => handleSelectBoard(null)}
          className="hover:underline"
          style={{ color: selectedBoard === null ? site.theme.linkVisited : site.theme.link }}
        >
          Home
        </button>
        {boards.map((board, i) => (
          <span key={board.id}>
            <span style={{ color: site.theme.text }}> / </span>
            <button
              onClick={() => handleSelectBoard(board.id)}
              className="hover:underline"
              style={{ color: selectedBoard === board.id ? site.theme.linkVisited : site.theme.link }}
            >
              {board.id}
            </button>
          </span>
        ))}
        <span className="font-bold ml-2" style={{ color: site.theme.text }}> ]</span>
      </nav>

      {/* Board Info */}
      {selectedBoard && !selectedThread && (
        <div
          className="text-center py-4 px-4"
          style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
        >
          <h2 className="text-xl font-bold" style={{ color: site.theme.boardTitle }}>
            /{selectedBoard}/ - {boards.find(b => b.id === selectedBoard)?.name}
          </h2>
          <p className="text-sm italic" style={{ color: site.theme.textMuted }}>
            {boards.find(b => b.id === selectedBoard)?.description}
          </p>
        </div>
      )}

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {selectedThread ? (
          <ThreadView
            thread={selectedThread}
            onBack={handleBackFromThread}
          />
        ) : (
          <div className="space-y-4">
            {/* Post Form */}
            <div
              className="p-3 text-center"
              style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
            >
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="px-2 py-1 text-sm mr-2"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="px-2 py-1 text-sm"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
              </div>
              <div className="mb-2">
                <textarea
                  placeholder="Comment"
                  rows={4}
                  className="w-full max-w-md px-2 py-1 text-sm resize-none"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
              </div>
              <button
                className="px-4 py-1 text-sm"
                style={{
                  background: site.theme.buttonBg,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
              >
                Post
              </button>
            </div>

            <hr style={{ borderColor: site.theme.border }} />

            {/* Thread List */}
            {displayedThreads.map((thread) => (
              <ThreadPreview
                key={thread.id}
                thread={thread}
                onClick={() => handleSelectThread(thread)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sketchy Ads */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <SidebarAdWidget
          siteId="forchan"
          onNavigate={onNavigate}
          title="Ads"
          count={2}
        />
      </div>

      {/* Footer */}
      <footer
        className="text-center py-4 text-xs"
        style={{ color: site.theme.textMuted, borderTop: `1px solid ${site.theme.border}` }}
      >
        <p>All content is fictional. All trademarks belong to their respective owners.</p>
        <p className="mt-1">
          <button className="hover:underline" style={{ color: site.theme.link }}>FAQ</button>
          {' | '}
          <button className="hover:underline" style={{ color: site.theme.link }}>Rules</button>
          {' | '}
          <button className="hover:underline" style={{ color: site.theme.link }}>Contact</button>
        </p>
      </footer>
    </div>
  )
}

// ============================================================================
// Thread Preview Component
// ============================================================================

interface ThreadPreviewProps {
  thread: Thread
  onClick: () => void
}

function ThreadPreview({ thread, onClick }: ThreadPreviewProps) {
  return (
    <div
      className="p-3"
      style={{ background: site.theme.postBg, border: `1px solid ${site.theme.border}` }}
    >
      {/* Thread Header */}
      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
        {thread.sticky && (
          <span className="px-1 text-xs font-bold" style={{ color: site.theme.sticky }}>
            📌 Sticky
          </span>
        )}
        {thread.locked && (
          <span className="px-1 text-xs font-bold" style={{ color: site.theme.locked }}>
            🔒 Locked
          </span>
        )}
        {thread.subject && (
          <span className="font-bold" style={{ color: site.theme.subject }}>
            {thread.subject}
          </span>
        )}
        <span style={{ color: thread.tripcode ? site.theme.tripcode : site.theme.name }}>
          {thread.name || 'Anonymous'}
          {thread.tripcode && <span className="ml-1">{thread.tripcode}</span>}
        </span>
        <span style={{ color: site.theme.textMuted }}>
          {thread.timestamp}
        </span>
        <span style={{ color: site.theme.postId }}>
          No.{thread.id}
        </span>
        <button
          onClick={onClick}
          className="hover:underline"
          style={{ color: site.theme.link }}
        >
          [Reply]
        </button>
      </div>

      {/* Thread Content */}
      <div className="flex gap-3">
        {thread.image && (
          <div
            className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-4xl"
            style={{ background: site.theme.thumbnailBg }}
          >
            {thread.image}
          </div>
        )}
        <div className="flex-1">
          <PostContent content={thread.content} />
          <p className="mt-2 text-sm" style={{ color: site.theme.textMuted }}>
            {thread.replies.length} replies
          </p>
        </div>
      </div>

      {/* Preview of last 2 replies */}
      {thread.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 pl-3" style={{ borderColor: site.theme.border }}>
          {thread.replies.slice(-2).map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span style={{ color: reply.tripcode ? site.theme.tripcode : site.theme.name }}>
                  {reply.name || 'Anonymous'}
                  {reply.tripcode && <span className="ml-1">{reply.tripcode}</span>}
                </span>
                <span style={{ color: site.theme.textMuted }}>{reply.timestamp}</span>
                <span style={{ color: site.theme.postId }}>No.{reply.id}</span>
              </div>
              <PostContent content={reply.content.slice(0, 150) + (reply.content.length > 150 ? '...' : '')} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Thread View Component
// ============================================================================

interface ThreadViewProps {
  thread: Thread
  onBack: () => void
}

function ThreadView({ thread, onBack }: ThreadViewProps) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm hover:underline"
        style={{ color: site.theme.link }}
      >
        [Return] [Catalog]
      </button>

      {/* OP Post */}
      <div
        className="p-3 mb-4"
        style={{ background: site.theme.postBg, border: `1px solid ${site.theme.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
          {thread.sticky && (
            <span className="px-1 text-xs font-bold" style={{ color: site.theme.sticky }}>
              📌 Sticky
            </span>
          )}
          {thread.subject && (
            <span className="font-bold" style={{ color: site.theme.subject }}>
              {thread.subject}
            </span>
          )}
          <span style={{ color: thread.tripcode ? site.theme.tripcode : site.theme.name }}>
            {thread.name || 'Anonymous'}
            {thread.tripcode && <span className="ml-1">{thread.tripcode}</span>}
          </span>
          <span style={{ color: site.theme.textMuted }}>
            {thread.timestamp}
          </span>
          <span style={{ color: site.theme.postId }}>
            No.{thread.id}
          </span>
        </div>

        <div className="flex gap-3">
          {thread.image && (
            <div
              className="w-48 h-48 flex-shrink-0 flex items-center justify-center text-6xl cursor-pointer hover:opacity-80"
              style={{ background: site.theme.thumbnailBg }}
            >
              {thread.image}
            </div>
          )}
          <div className="flex-1">
            <PostContent content={thread.content} />
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <div
        className="p-3 mb-4 text-center"
        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
      >
        <div className="mb-2">
          <input
            type="text"
            placeholder="Name"
            className="px-2 py-1 text-sm mr-2"
            style={{
              background: site.theme.inputBg,
              border: `1px solid ${site.theme.border}`,
              color: site.theme.text,
            }}
          />
        </div>
        <div className="mb-2">
          <textarea
            placeholder="Comment"
            rows={3}
            className="w-full max-w-md px-2 py-1 text-sm resize-none"
            style={{
              background: site.theme.inputBg,
              border: `1px solid ${site.theme.border}`,
              color: site.theme.text,
            }}
          />
        </div>
        <button
          className="px-4 py-1 text-sm"
          style={{
            background: site.theme.buttonBg,
            border: `1px solid ${site.theme.border}`,
            color: site.theme.text,
          }}
        >
          Post Reply
        </button>
      </div>

      {/* Replies */}
      <div className="space-y-2">
        {thread.replies.map((reply) => (
          <ReplyPost key={reply.id} reply={reply} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Reply Post Component
// ============================================================================

interface ReplyPostProps {
  reply: Reply
}

function ReplyPost({ reply }: ReplyPostProps) {
  return (
    <div
      className="p-3"
      style={{ background: site.theme.replyBg, border: `1px solid ${site.theme.border}` }}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
        <span style={{ color: reply.tripcode ? site.theme.tripcode : site.theme.name }}>
          {reply.name || 'Anonymous'}
          {reply.tripcode && <span className="ml-1">{reply.tripcode}</span>}
        </span>
        <span style={{ color: site.theme.textMuted }}>
          {reply.timestamp}
        </span>
        <span style={{ color: site.theme.postId }}>
          No.{reply.id}
        </span>
      </div>

      <div className="flex gap-3">
        {reply.image && (
          <div
            className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-4xl cursor-pointer hover:opacity-80"
            style={{ background: site.theme.thumbnailBg }}
          >
            {reply.image}
          </div>
        )}
        <div className="flex-1">
          <PostContent content={reply.content} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Post Content Component (handles greentext and quotes)
// ============================================================================

interface PostContentProps {
  content: string
}

function PostContent({ content }: PostContentProps) {
  const lines = content.split('\n')

  return (
    <div className="text-sm whitespace-pre-wrap" style={{ color: site.theme.text }}>
      {lines.map((line, i) => {
        // Quote link (>>number)
        const quoteMatch = line.match(/^(>>\d+)(.*)/)
        if (quoteMatch) {
          return (
            <p key={i}>
              <span
                className="hover:underline cursor-pointer"
                style={{ color: site.theme.quoteLink }}
              >
                {quoteMatch[1]}
              </span>
              <span>{quoteMatch[2]}</span>
            </p>
          )
        }

        // Greentext (>text but not >>)
        if (line.startsWith('>') && !line.startsWith('>>')) {
          return (
            <p key={i} style={{ color: site.theme.greentext }}>
              {line}
            </p>
          )
        }

        // Regular text
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

export default ForChanSite
