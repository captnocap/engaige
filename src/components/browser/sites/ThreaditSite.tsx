/**
 * Threadit Site - Refactored with Shared Components
 *
 * Reddit clone for the engAIge browser.
 * Features chaotic drama, AITA posts, and nested comment threads.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, useSiteCategories, useSiteContentBySlug, type SiteContentItem, type SiteCategory, type SiteCommentTree } from '../../../hooks/useSiteContent.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'

const site = FILLER_SITES.reddit

// ============================================================================
// Types
// ============================================================================

interface ThreadComment {
  id: string
  author: string
  content: string
  upvotes: number
  timestamp: string
  replies: ThreadComment[]
  isOP?: boolean
  flair?: string
}

interface Thread {
  id: string
  subreddit: string
  title: string
  author: string
  content: string
  flair?: string
  upvotes: number
  commentCount: number
  timestamp: string
  comments: ThreadComment[]
  awards?: string[]
}

interface Subreddit {
  name: string
  icon: string
  members: string
  description: string
}

// ============================================================================
// DB-to-Local Adapters
// ============================================================================

/** Adapt DB content to local Thread interface */
function dbToThread(item: SiteContentItem): Thread {
  const m = item.metadata || {}
  const rawSub = m.subreddit || item.category || 'General'
  return {
    id: item.slug,
    subreddit: rawSub.startsWith('t/') ? rawSub : `t/${rawSub}`,
    title: item.title,
    content: item.body || item.summary || '',
    author: m.author || 'anonymous',
    flair: m.flair,
    upvotes: item.likeCount || m.upvotes || 0,
    commentCount: item.commentCount || m.commentCount || 0,
    timestamp: m.timeAgo || formatTimeAgo(item.publishedAt || item.createdAt),
    awards: m.awards || [],
    comments: m.comments ? (m.comments as ThreadComment[]) : [],
  }
}

/** Adapt DB category to local Subreddit interface */
function dbToSubreddit(cat: SiteCategory): Subreddit {
  return {
    name: cat.name.startsWith('t/') ? cat.name : `t/${cat.name}`,
    icon: cat.iconEmoji || '🌽',
    members: cat.description?.match(/\d+[KM]/) ? cat.description.match(/\d+[KM]/)![0] : '1K',
    description: cat.description || '',
  }
}

/** Recursively convert DB comment trees to local ThreadComment format */
function dbCommentsToThreadComments(trees: SiteCommentTree[]): ThreadComment[] {
  return trees.map(c => ({
    id: c.id,
    author: c.authorName,
    content: c.content,
    upvotes: c.likeCount - c.dislikeCount,
    timestamp: formatTimeAgo(c.publishedAt || c.createdAt),
    replies: c.replies ? dbCommentsToThreadComments(c.replies) : [],
  }))
}

/** Format a unix timestamp (seconds) into a human-readable relative string */
function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() / 1000) - timestamp)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ============================================================================
// Components
// ============================================================================

export function ThreaditSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB -- database is the only source of truth
  const { content: dbContent } = useSiteContent('threadit')
  const { categories: dbCategories } = useSiteCategories('threadit')

  const threads = useMemo(() => dbContent.map(dbToThread), [dbContent])

  const subreddits = useMemo(() => dbCategories.map(dbToSubreddit), [dbCategories])

  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})

  // For thread detail view - fetch comments from DB when a thread is selected
  const selectedThreadSlug = selectedThread?.id ?? null
  const { comments: dbComments } = useSiteContentBySlug('threadit', selectedThreadSlug)

  // Merge DB comments into the selected thread when available
  const displayThread = useMemo(() => {
    if (!selectedThread) return null
    if (dbComments.length > 0) {
      return { ...selectedThread, comments: dbCommentsToThreadComments(dbComments) }
    }
    return selectedThread
  }, [selectedThread, dbComments])

  // Track if we're updating from path (to avoid triggering onPathChange)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setSelectedThread(null)
      setSelectedSubreddit(null)
    } else if (path.startsWith('/t/')) {
      // Check if it's a needle (post): /t/CommunityName/n/post_slug
      const nMatch = path.match(/^\/t\/([^/]+)\/n\/(.+)$/)
      if (nMatch) {
        // It's a needle (post)
        const [, communityName, postSlug] = nMatch
        const thread = threads.find(t => t.id === postSlug)
        if (thread) {
          setSelectedThread(thread)
          setSelectedSubreddit('t/' + communityName)
        }
      } else {
        // It's just a threadit (community): /t/CommunityName
        const communityName = path.slice(3) // Remove '/t/'
        setSelectedThread(null)
        setSelectedSubreddit('t/' + communityName)
      }
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, threads])

  // Navigation handlers that update both state and path
  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread)
    // Generate /t/CommunityName/n/post_slug path
    // thread.subreddit is "t/CommunityName", so remove the "t/" prefix
    const communityName = thread.subreddit.slice(2)
    onPathChange('/t/' + communityName + '/n/' + thread.id)
  }

  const handleSelectSubreddit = (subredditName: string | null) => {
    setSelectedSubreddit(subredditName)
    setSelectedThread(null)
    if (subredditName) {
      // subredditName includes "t/" prefix, remove it for the path
      onPathChange('/t/' + subredditName.slice(2))
    } else {
      onPathChange(null)
    }
  }

  const handleBackToHome = () => {
    setSelectedThread(null)
    setSelectedSubreddit(null)
    onPathChange(null)
  }

  const handleBackFromThread = () => {
    setSelectedThread(null)
    // Go back to threadit if one is selected, otherwise go to home
    if (selectedSubreddit) {
      onPathChange('/t/' + selectedSubreddit.slice(2))
    } else {
      onPathChange(null)
    }
  }

  const filteredThreads = selectedSubreddit
    ? threads.filter(t => t.subreddit === selectedSubreddit)
    : threads

  const handleVote = (id: string, direction: 'up' | 'down') => {
    setUserVotes(prev => ({
      ...prev,
      [id]: prev[id] === direction ? null : direction,
    }))
  }

  const getVoteAdjustment = (id: string, originalVotes: number): number => {
    const vote = userVotes[id]
    if (vote === 'up') return originalVotes + 1
    if (vote === 'down') return originalVotes - 1
    return originalVotes
  }

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-5xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <span className="text-2xl">{site.icon}</span>
              <span
                className="text-xl font-bold"
                style={{ color: site.theme.primary }}
              >
                {site.name}
              </span>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <input
                type="text"
                placeholder={`Search ${site.name}`}
                className="w-full px-4 py-1.5 rounded-full text-sm"
                style={{
                  background: site.theme.background,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                backgroundColor={site.theme.primary}
                textColor="white"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {displayThread ? (
              <ThreadDetail
                thread={displayThread}
                onBack={handleBackFromThread}
                userVotes={userVotes}
                onVote={handleVote}
                getVoteAdjustment={getVoteAdjustment}
              />
            ) : (
              <>
                {/* Sort Controls */}
                <StyledCard
                  bgColor={site.theme.surface}
                  borderColor="transparent"
                  padding="md"
                  borderRadius="md"
                  shadow="none"
                  className="flex items-center gap-4 mb-4"
                >
                  <span className="text-sm" style={{ color: site.theme.textMuted }}>
                    Sort by:
                  </span>
                  {(['hot', 'new', 'top'] as const).map((sort) => (
                    <Button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      variant={sortBy === sort ? 'primary' : 'ghost'}
                      size="sm"
                      backgroundColor={sortBy === sort ? site.theme.primary : 'transparent'}
                      textColor={sortBy === sort ? 'white' : site.theme.textMuted}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Button>
                  ))}
                </StyledCard>

                {/* Thread List */}
                <div className="space-y-3">
                  {filteredThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      onClick={() => handleSelectThread(thread)}
                      userVotes={userVotes}
                      onVote={handleVote}
                      getVoteAdjustment={getVoteAdjustment}
                    />
                  ))}
                </div>
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-72 shrink-0 space-y-4">
            {/* Subreddit Info */}
            {selectedSubreddit ? (
              <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${site.theme.border}` }}>
                <div className="p-3" style={{ background: site.theme.primary }}>
                  <h2 className="font-bold text-white">{selectedSubreddit}</h2>
                </div>
                <StyledCard
                  bgColor={site.theme.surface}
                  borderColor="transparent"
                  padding="md"
                  borderRadius="0"
                  shadow="none"
                >
                  <p className="text-sm mb-3" style={{ color: site.theme.textMuted }}>
                    {subreddits.find(s => s.name === selectedSubreddit)?.description}
                  </p>
                  <Button
                    onClick={() => handleSelectSubreddit(null)}
                    variant="link"
                    size="sm"
                    textColor={site.theme.secondary}
                  >
                    ← Back to Home
                  </Button>
                </StyledCard>
              </div>
            ) : (
              <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${site.theme.border}` }}>
                <div className="p-3" style={{ background: site.theme.primary }}>
                  <h2 className="font-bold text-white">Home</h2>
                </div>
                <StyledCard
                  bgColor={site.theme.surface}
                  borderColor="transparent"
                  padding="md"
                  borderRadius="0"
                  shadow="none"
                >
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Your personal {site.name} front page. Come here to check in with your favorite communities.
                  </p>
                </StyledCard>
              </div>
            )}

            {/* Popular Communities */}
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              padding="0"
              borderRadius="md"
              shadow="sm"
              className="overflow-hidden"
            >
              <div className="p-3 font-bold text-sm" style={{ color: site.theme.text, borderBottom: `1px solid ${site.theme.border}` }}>
                Popular Communities
              </div>
              <div className="py-2">
                {subreddits.map((sub) => (
                  <Button
                    key={sub.name}
                    onClick={() => handleSelectSubreddit(sub.name)}
                    variant="ghost"
                    backgroundColor="transparent"
                    width="full"
                    className="justify-start px-3 py-2"
                  >
                    <span className="text-xl mr-2">{sub.icon}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium" style={{ color: site.theme.text }}>
                        {sub.name}
                      </p>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        {sub.members} members
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </StyledCard>

            {/* Rules */}
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              padding="md"
              borderRadius="md"
              shadow="sm"
              textColor={site.theme.textMuted}
              className="text-xs"
            >
              <p className="font-bold mb-2" style={{ color: site.theme.text }}>
                {site.name} Rules
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Remember the human</li>
                <li>Behave like you would in real life</li>
                <li>Look for the original source of content</li>
                <li>Search for duplicates before posting</li>
                <li>Read the community rules</li>
              </ol>
            </StyledCard>

            {/* Promoted */}
            <SidebarAdWidget
              siteId="threadit"
              onNavigate={onNavigate}
              title="Promoted"
              count={2}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Thread Card Component
// ============================================================================

interface ThreadCardProps {
  thread: Thread
  onClick: () => void
  userVotes: Record<string, 'up' | 'down' | null>
  onVote: (id: string, direction: 'up' | 'down') => void
  getVoteAdjustment: (id: string, originalVotes: number) => number
}

function ThreadCard({ thread, onClick, userVotes, onVote, getVoteAdjustment }: ThreadCardProps) {
  const votes = getVoteAdjustment(thread.id, thread.upvotes)
  const userVote = userVotes[thread.id]

  return (
    <StyledCard
      bgColor={site.theme.surface}
      borderColor={site.theme.border}
      padding="md"
      borderRadius="md"
      shadow="sm"
      className="flex overflow-hidden p-0"
    >
      {/* Vote Column */}
      <div
        className="w-10 flex flex-col items-center py-2 gap-1 shrink-0"
        style={{ background: site.theme.background }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation?.()
            onVote(thread.id, 'up')
          }}
          variant="ghost"
          size="xs"
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={userVote === 'up' ? site.theme.upvote : 'none'}
              stroke={userVote === 'up' ? site.theme.upvote : site.theme.textMuted}
              strokeWidth={2}
            >
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          }
          backgroundColor="transparent"
        />
        <span
          className="text-xs font-bold"
          style={{
            color: userVote === 'up' ? site.theme.upvote :
                   userVote === 'down' ? site.theme.downvote :
                   site.theme.text
          }}
        >
          {votes >= 1000 ? `${(votes / 1000).toFixed(1)}k` : votes}
        </span>
        <Button
          onClick={(e) => {
            e.stopPropagation?.()
            onVote(thread.id, 'down')
          }}
          variant="ghost"
          size="xs"
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={userVote === 'down' ? site.theme.downvote : 'none'}
              stroke={userVote === 'down' ? site.theme.downvote : site.theme.textMuted}
              strokeWidth={2}
            >
              <path d="M12 20l8-8h-5V4H9v8H4z" />
            </svg>
          }
          backgroundColor="transparent"
        />
      </div>

      {/* Content */}
      <button
        onClick={onClick}
        className="flex-1 p-3 text-left hover:bg-gray-50 transition-colors"
        style={{ border: 'none', background: 'transparent' }}
      >
        <MetaRow
          items={[
            { value: thread.subreddit, style: { fontWeight: 500 } },
            { value: `Posted by u/${thread.author}` },
            { value: thread.timestamp },
            ...(thread.awards?.map(award => ({ value: award })) ?? []),
          ]}
          textSize="xs"
          textColor={site.theme.text}
          mutedColor={site.theme.textMuted}
          separator="•"
        />
        <h3 className="font-medium mb-1 mt-1" style={{ color: site.theme.text }}>
          {thread.flair && (
            <span
              className="inline-block px-2 py-0.5 text-xs rounded mr-2"
              style={{
                background: thread.flair === 'Asshole' ? '#ff4500' :
                           thread.flair === 'Not the A-hole' ? '#0dd3bb' :
                           site.theme.secondary,
                color: 'white',
              }}
            >
              {thread.flair}
            </span>
          )}
          {thread.title}
        </h3>
        <p className="text-sm line-clamp-2" style={{ color: site.theme.textMuted }}>
          {thread.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: site.theme.textMuted }}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {thread.commentCount} comments
          </span>
          <span>Share</span>
          <span>Save</span>
        </div>
      </button>
    </StyledCard>
  )
}

// ============================================================================
// Thread Detail Component
// ============================================================================

interface ThreadDetailProps {
  thread: Thread
  onBack: () => void
  userVotes: Record<string, 'up' | 'down' | null>
  onVote: (id: string, direction: 'up' | 'down') => void
  getVoteAdjustment: (id: string, originalVotes: number) => number
}

function ThreadDetail({ thread, onBack, userVotes, onVote, getVoteAdjustment }: ThreadDetailProps) {
  const votes = getVoteAdjustment(thread.id, thread.upvotes)
  const userVote = userVotes[thread.id]

  return (
    <div className="space-y-4">
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={site.theme.secondary}
      >
        ← Back to {thread.subreddit}
      </Button>

      {/* Main Post */}
      <StyledCard
        bgColor={site.theme.surface}
        borderColor={site.theme.border}
        padding="lg"
        borderRadius="md"
        shadow="sm"
      >
        <MetaRow
          items={[
            { value: thread.subreddit, style: { fontWeight: 500 } },
            { value: `Posted by u/${thread.author}` },
            { value: thread.timestamp },
            ...(thread.awards?.map(award => ({ value: award })) ?? []),
          ]}
          textSize="xs"
          textColor={site.theme.text}
          mutedColor={site.theme.textMuted}
          separator="•"
          className="mb-2"
        />

        <h1 className="text-xl font-medium mb-3" style={{ color: site.theme.text }}>
          {thread.flair && (
            <span
              className="inline-block px-2 py-0.5 text-xs rounded mr-2"
              style={{
                background: thread.flair === 'Asshole' ? '#ff4500' :
                           thread.flair === 'Not the A-hole' ? '#0dd3bb' :
                           site.theme.secondary,
                color: 'white',
              }}
            >
              {thread.flair}
            </span>
          )}
          {thread.title}
        </h1>

        <div
          className="text-sm whitespace-pre-wrap mb-4"
          style={{ color: site.theme.text }}
        >
          {thread.content}
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4 text-sm" style={{ color: site.theme.textMuted }}>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onVote(thread.id, 'up')}
              variant="ghost"
              size="sm"
              icon={
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={userVote === 'up' ? site.theme.upvote : 'none'}
                  stroke={userVote === 'up' ? site.theme.upvote : 'currentColor'}
                  strokeWidth={2}
                >
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
              }
              backgroundColor="transparent"
            />
            <span
              className="font-bold"
              style={{
                color: userVote === 'up' ? site.theme.upvote :
                       userVote === 'down' ? site.theme.downvote :
                       site.theme.text
              }}
            >
              {votes}
            </span>
            <Button
              onClick={() => onVote(thread.id, 'down')}
              variant="ghost"
              size="sm"
              icon={
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={userVote === 'down' ? site.theme.downvote : 'none'}
                  stroke={userVote === 'down' ? site.theme.downvote : 'currentColor'}
                  strokeWidth={2}
                >
                  <path d="M12 20l8-8h-5V4H9v8H4z" />
                </svg>
              }
              backgroundColor="transparent"
            />
          </div>
          <span>{thread.commentCount} comments</span>
          <span>Share</span>
          <span>Save</span>
        </div>
      </StyledCard>

      {/* Comment Input */}
      <StyledCard
        bgColor={site.theme.surface}
        borderColor={site.theme.border}
        padding="lg"
        borderRadius="md"
        shadow="sm"
      >
        <p className="text-sm mb-2" style={{ color: site.theme.textMuted }}>
          Comment as <span style={{ color: site.theme.secondary }}>u/guest</span>
        </p>
        <textarea
          placeholder="What are your thoughts?"
          className="w-full p-3 rounded text-sm resize-none mb-2"
          rows={4}
          style={{
            background: site.theme.background,
            border: `1px solid ${site.theme.border}`,
            color: site.theme.text,
          }}
        />
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            backgroundColor={site.theme.secondary}
            textColor="white"
          >
            Comment
          </Button>
        </div>
      </StyledCard>

      {/* Comments */}
      <StyledCard
        bgColor={site.theme.surface}
        borderColor={site.theme.border}
        padding="lg"
        borderRadius="md"
        shadow="sm"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium" style={{ color: site.theme.text }}>
            Sort by: Best
          </span>
        </div>

        <div className="space-y-4">
          {thread.comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              depth={0}
              userVotes={userVotes}
              onVote={onVote}
              getVoteAdjustment={getVoteAdjustment}
            />
          ))}
        </div>
      </StyledCard>
    </div>
  )
}

// ============================================================================
// Comment Thread Component (Recursive)
// ============================================================================

interface CommentThreadProps {
  comment: ThreadComment
  depth: number
  userVotes: Record<string, 'up' | 'down' | null>
  onVote: (id: string, direction: 'up' | 'down') => void
  getVoteAdjustment: (id: string, originalVotes: number) => number
}

function CommentThread({ comment, depth, userVotes, onVote, getVoteAdjustment }: CommentThreadProps) {
  const [collapsed, setCollapsed] = useState(false)
  const votes = getVoteAdjustment(comment.id, comment.upvotes)
  const userVote = userVotes[comment.id]

  const borderColors = ['#0079d3', '#ff4500', '#00b300', '#9b59b6', '#3498db']
  const borderColor = borderColors[depth % borderColors.length]

  if (comment.content === '[removed]') {
    return (
      <div className="text-sm italic" style={{ color: site.theme.textMuted }}>
        [removed]
      </div>
    )
  }

  return (
    <div
      className="pl-3"
      style={{
        borderLeft: depth > 0 ? `2px solid ${borderColor}` : 'none',
        marginLeft: depth > 0 ? '8px' : 0,
      }}
    >
      <div className="py-1">
        {/* Comment Header */}
        <div className="flex items-center gap-2 text-xs" style={{ color: site.theme.textMuted }}>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            variant="ghost"
            size="xs"
            backgroundColor="transparent"
            textColor={site.theme.textMuted}
          >
            {collapsed ? '[+]' : '[-]'}
          </Button>
          <span className="font-medium" style={{ color: comment.isOP ? site.theme.secondary : site.theme.text }}>
            u/{comment.author}
            {comment.isOP && <span className="ml-1 text-xs" style={{ color: site.theme.secondary }}>(OP)</span>}
          </span>
          {comment.flair && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: site.theme.background, color: site.theme.textMuted }}
            >
              {comment.flair}
            </span>
          )}
          <span>•</span>
          <span>{comment.timestamp}</span>
        </div>

        {/* Comment Content */}
        {!collapsed && (
          <>
            <div
              className="text-sm py-1"
              style={{ color: site.theme.text }}
            >
              {comment.content}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-3 text-xs" style={{ color: site.theme.textMuted }}>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onVote(comment.id, 'up')}
                  variant="ghost"
                  size="xs"
                  icon={
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill={userVote === 'up' ? site.theme.upvote : 'none'}
                      stroke={userVote === 'up' ? site.theme.upvote : 'currentColor'}
                      strokeWidth={2}
                    >
                      <path d="M12 4l-8 8h5v8h6v-8h5z" />
                    </svg>
                  }
                  backgroundColor="transparent"
                />
                <span
                  className="font-medium"
                  style={{
                    color: userVote === 'up' ? site.theme.upvote :
                           userVote === 'down' ? site.theme.downvote :
                           votes < 0 ? site.theme.downvote :
                           site.theme.text
                  }}
                >
                  {votes}
                </span>
                <Button
                  onClick={() => onVote(comment.id, 'down')}
                  variant="ghost"
                  size="xs"
                  icon={
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill={userVote === 'down' ? site.theme.downvote : 'none'}
                      stroke={userVote === 'down' ? site.theme.downvote : 'currentColor'}
                      strokeWidth={2}
                    >
                      <path d="M12 20l8-8h-5V4H9v8H4z" />
                    </svg>
                  }
                  backgroundColor="transparent"
                />
              </div>
              <Button
                variant="link"
                size="xs"
                textColor={site.theme.secondary}
              >
                Reply
              </Button>
              <Button
                variant="link"
                size="xs"
                textColor={site.theme.secondary}
              >
                Share
              </Button>
            </div>

            {/* Nested Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <CommentThread
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    userVotes={userVotes}
                    onVote={onVote}
                    getVoteAdjustment={getVoteAdjustment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ThreaditSite
