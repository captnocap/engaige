/**
 * VidTube Site
 *
 * YouTube clone for the engAIge browser.
 * Features video thumbnails, comments, channels, and recommendations.
 *
 * Video content is configured in src/config/vidtube-content.ts
 * Add thumbnails to public/images/vidtube/
 *
 * URL Routing:
 * - Homepage: path = null or '/'
 * - Video view: path = '/watch/{video-id}'
 * - Channel view: path = '/channel/{channel-id}' (future)
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import {
  VIDTUBE_VIDEOS,
  VIDTUBE_CHANNELS,
  VIDTUBE_CATEGORIES,
  getVideoThumbnail,
  getChannelAvatar,
  type Video,
  type VideoComment,
  type Channel,
} from '../../../config/vidtube-content.js'

const site = FILLER_SITES.video

// ============================================================================
// URL Routing Helpers
// ============================================================================

/**
 * Parse the current path to determine the view and extract IDs.
 * Returns the view type and any relevant ID.
 */
function parseRoute(path: string | null): { view: 'home' | 'watch' | 'channel'; id: string | null } {
  if (!path || path === '/') {
    return { view: 'home', id: null }
  }

  // Match /watch/{video-id}
  const watchMatch = path.match(/^\/watch\/(.+)$/)
  if (watchMatch) {
    return { view: 'watch', id: watchMatch[1] }
  }

  // Match /channel/{channel-id}
  const channelMatch = path.match(/^\/channel\/(.+)$/)
  if (channelMatch) {
    return { view: 'channel', id: channelMatch[1] }
  }

  return { view: 'home', id: null }
}

/**
 * Find a video by its ID from the video list.
 */
function findVideoById(id: string | null): Video | null {
  if (!id) return null
  return VIDTUBE_VIDEOS.find(v => v.id === id) || null
}

// ============================================================================
// Components
// ============================================================================

export function VidTubeSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Parse the current route to determine what view to show
  const route = useMemo(() => parseRoute(path), [path])

  // Find the selected video based on the route
  const selectedVideo = useMemo(() => findVideoById(route.id), [route.id])

  // Local UI state (not URL-based)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  // Navigate to a video's watch page
  const navigateToVideo = (video: Video) => {
    onPathChange(`/watch/${video.id}`)
  }

  // Navigate back to the homepage
  const navigateToHome = () => {
    onPathChange(null)
    setSelectedCategory('All')
  }

  const filteredVideos = selectedCategory === 'All'
    ? VIDTUBE_VIDEOS
    : VIDTUBE_VIDEOS.filter(v => v.category === selectedCategory)

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-2"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={navigateToHome}
            className="flex items-center gap-1 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <span
              className="text-xl font-semibold"
              style={{ color: site.theme.text }}
            >
              {site.name}
            </span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="flex">
              <input
                type="text"
                placeholder="Search"
                className="flex-1 px-4 py-2 rounded-l-full text-sm"
                style={{
                  background: site.theme.background,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
              />
              <button
                className="px-5 rounded-r-full"
                style={{
                  background: site.theme.secondary,
                  border: `1px solid ${site.theme.border}`,
                  borderLeft: 'none',
                }}
              >
                🔍
              </button>
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <button className="text-xl">🎬</button>
            <button className="text-xl">🔔</button>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ background: site.theme.primary }}
            >
              G
            </button>
          </div>
        </div>
      </header>

      {selectedVideo ? (
        <VideoPlayer
          video={selectedVideo}
          onBack={navigateToHome}
          allVideos={VIDTUBE_VIDEOS}
          onSelectVideo={navigateToVideo}
          isLiked={isLiked}
          setIsLiked={setIsLiked}
          isDisliked={isDisliked}
          setIsDisliked={setIsDisliked}
          isSubscribed={isSubscribed}
          setIsSubscribed={setIsSubscribed}
          channels={VIDTUBE_CHANNELS}
          onNavigate={onNavigate}
        />
      ) : (
        <>
          {/* Category Pills */}
          <div
            className="sticky top-14 z-10 px-4 py-3 overflow-x-auto"
            style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
          >
            <div className="flex gap-3">
              {VIDTUBE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                  style={{
                    background: selectedCategory === cat ? site.theme.text : site.theme.secondary,
                    color: selectedCategory === cat ? site.theme.surface : site.theme.text,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <main className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => navigateToVideo(video)}
                />
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  )
}

// ============================================================================
// Video Card Component
// ============================================================================

interface VideoCardProps {
  video: Video
  onClick: () => void
}

function VideoCard({ video, onClick }: VideoCardProps) {
  const thumbnail = getVideoThumbnail(video)

  return (
    <button
      onClick={onClick}
      className="text-left group"
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden mb-3 flex items-center justify-center"
        style={{ background: site.theme.secondary }}
      >
        {thumbnail.type === 'image' ? (
          <img
            src={thumbnail.value}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement!.innerHTML = `<span class="text-5xl">${video.thumbnailEmoji}</span>`
            }}
          />
        ) : (
          <span className="text-5xl">{thumbnail.value}</span>
        )}
        {/* Duration badge */}
        <span
          className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-xs font-medium"
          style={{
            background: video.duration === 'LIVE' ? site.theme.primary : 'rgba(0,0,0,0.8)',
            color: 'white',
          }}
        >
          {video.duration}
        </span>
      </div>

      {/* Info */}
      <div className="flex gap-3">
        {/* Channel Avatar */}
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-lg overflow-hidden"
          style={{ background: site.theme.secondary }}
        >
          {video.channelAvatar}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600"
            style={{ color: site.theme.text }}
          >
            {video.title}
          </h3>
          <p
            className="text-xs flex items-center gap-1"
            style={{ color: site.theme.textMuted }}
          >
            {video.channel}
            {video.channelVerified && (
              <span className="text-[10px]">✓</span>
            )}
          </p>
          <p
            className="text-xs"
            style={{ color: site.theme.textMuted }}
          >
            {video.views} • {video.uploadedAt}
          </p>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Video Player Component
// ============================================================================

interface VideoPlayerProps {
  video: Video
  onBack: () => void
  allVideos: Video[]
  /** Navigate to another video via URL routing */
  onSelectVideo: (video: Video) => void
  isLiked: boolean
  setIsLiked: (v: boolean) => void
  isDisliked: boolean
  setIsDisliked: (v: boolean) => void
  isSubscribed: boolean
  setIsSubscribed: (v: boolean) => void
  channels: Record<string, Channel>
  onNavigate: (siteId: string) => void
}

function VideoPlayer({
  video,
  onBack,
  allVideos,
  onSelectVideo,
  isLiked,
  setIsLiked,
  isDisliked,
  setIsDisliked,
  isSubscribed,
  setIsSubscribed,
  channels,
  onNavigate,
}: VideoPlayerProps) {
  const [commentSort, setCommentSort] = useState<'top' | 'newest'>('top')
  const channel = channels[video.channel]
  const recommended = allVideos.filter(v => v.id !== video.id).slice(0, 6)
  const thumbnail = getVideoThumbnail(video)

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false)
    } else {
      setIsLiked(true)
      setIsDisliked(false)
    }
  }

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false)
    } else {
      setIsDisliked(true)
      setIsLiked(false)
    }
  }

  return (
    <div className="flex gap-6 p-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Video Player */}
        <div
          className="aspect-video rounded-xl overflow-hidden mb-4 flex items-center justify-center relative"
          style={{ background: '#000' }}
        >
          {thumbnail.type === 'image' ? (
            <img
              src={thumbnail.value}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <span className="text-8xl">{thumbnail.value}</span>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              ▶️
            </div>
          </div>
          {/* Video controls bar */}
          <div
            className="absolute bottom-0 left-0 right-0 p-2 flex items-center gap-2"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}
          >
            <span className="text-white text-xs">0:00</span>
            <div className="flex-1 h-1 rounded" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div className="w-0 h-full rounded" style={{ background: site.theme.primary }} />
            </div>
            <span className="text-white text-xs">{video.duration}</span>
          </div>
        </div>

        {/* Video Title */}
        <h1
          className="text-xl font-semibold mb-3"
          style={{ color: site.theme.text }}
        >
          {video.title}
        </h1>

        {/* Channel and Actions */}
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: `1px solid ${site.theme.border}` }}>
          <div className="flex items-center gap-4">
            {/* Channel */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: site.theme.secondary }}
              >
                {video.channelAvatar}
              </div>
              <div>
                <p className="font-medium flex items-center gap-1" style={{ color: site.theme.text }}>
                  {video.channel}
                  {video.channelVerified && <span className="text-xs">✓</span>}
                </p>
                <p className="text-xs" style={{ color: site.theme.textMuted }}>
                  {channel?.subscribers || '0'} subscribers
                </p>
              </div>
            </div>

            {/* Subscribe */}
            <button
              onClick={() => setIsSubscribed(!isSubscribed)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: isSubscribed ? site.theme.secondary : site.theme.text,
                color: isSubscribed ? site.theme.text : site.theme.surface,
              }}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Like/Dislike */}
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{ background: site.theme.secondary }}
            >
              <button
                onClick={handleLike}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-300 transition-colors"
              >
                <span>{isLiked ? '👍' : '👍'}</span>
                <span className="text-sm font-medium" style={{ color: isLiked ? site.theme.text : site.theme.textMuted }}>
                  {isLiked ? `${parseInt(video.likes.replace('K', '000')) + 1}` : video.likes}
                </span>
              </button>
              <div className="w-px h-6" style={{ background: site.theme.border }} />
              <button
                onClick={handleDislike}
                className="px-4 py-2 hover:bg-gray-300 transition-colors"
              >
                <span>{isDisliked ? '👎' : '👎'}</span>
              </button>
            </div>

            {/* Share */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: site.theme.secondary, color: site.theme.text }}
            >
              ↗️ Share
            </button>

            {/* More */}
            <button
              className="px-3 py-2 rounded-full"
              style={{ background: site.theme.secondary }}
            >
              •••
            </button>
          </div>
        </div>

        {/* Description */}
        <div
          className="rounded-xl p-3 mb-6"
          style={{ background: site.theme.secondary }}
        >
          <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: site.theme.text }}>
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.uploadedAt}</span>
          </div>
          <p
            className="text-sm whitespace-pre-wrap"
            style={{ color: site.theme.text }}
          >
            {video.description}
          </p>
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center gap-6 mb-6">
            <h2 className="font-semibold" style={{ color: site.theme.text }}>
              {video.comments.length} Comments
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommentSort('top')}
                className="text-sm"
                style={{ color: commentSort === 'top' ? site.theme.text : site.theme.textMuted }}
              >
                Top comments
              </button>
              <span style={{ color: site.theme.textMuted }}>|</span>
              <button
                onClick={() => setCommentSort('newest')}
                className="text-sm"
                style={{ color: commentSort === 'newest' ? site.theme.text : site.theme.textMuted }}
              >
                Newest first
              </button>
            </div>
          </div>

          {/* Comment Input */}
          <div className="flex gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-medium"
              style={{ background: site.theme.primary }}
            >
              G
            </div>
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 border-b-2 bg-transparent text-sm py-2"
              style={{ borderColor: site.theme.border, color: site.theme.text }}
            />
          </div>

          {/* Comment List */}
          <div className="space-y-4">
            {video.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Recommended */}
      <aside className="w-96 shrink-0">
        <h3 className="font-medium mb-4" style={{ color: site.theme.text }}>
          Recommended
        </h3>
        <div className="space-y-3">
          {recommended.map((rec) => {
            const recThumb = getVideoThumbnail(rec)
            return (
              <button
                key={rec.id}
                onClick={() => onSelectVideo(rec)}
                className="flex gap-2 w-full text-left group"
              >
                <div
                  className="w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative"
                  style={{ background: site.theme.secondary }}
                >
                  {recThumb.type === 'image' ? (
                    <img
                      src={recThumb.value}
                      alt={rec.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.parentElement!.innerHTML = `<span class="text-2xl">${rec.thumbnailEmoji}</span>`
                      }}
                    />
                  ) : (
                    <span className="text-2xl">{recThumb.value}</span>
                  )}
                  <span
                    className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      background: rec.duration === 'LIVE' ? site.theme.primary : 'rgba(0,0,0,0.8)',
                      color: 'white',
                    }}
                  >
                    {rec.duration}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="text-sm font-medium line-clamp-2 mb-1 group-hover:text-blue-600"
                    style={{ color: site.theme.text }}
                  >
                    {rec.title}
                  </h4>
                  <p className="text-xs" style={{ color: site.theme.textMuted }}>
                    {rec.channel}
                  </p>
                  <p className="text-xs" style={{ color: site.theme.textMuted }}>
                    {rec.views} • {rec.uploadedAt}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Sponsored */}
        <div className="mt-6">
          <SidebarAdWidget
            siteId="vidtube"
            onNavigate={onNavigate}
            title="Sponsored"
            count={2}
          />
        </div>
      </aside>
    </div>
  )
}

// ============================================================================
// Comment Component
// ============================================================================

interface CommentItemProps {
  comment: VideoComment
  isReply?: boolean
}

function CommentItem({ comment, isReply = false }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-12' : ''}`}>
      <div
        className={`${isReply ? 'w-6 h-6 text-sm' : 'w-10 h-10'} rounded-full flex-shrink-0 flex items-center justify-center`}
        style={{ background: site.theme.secondary }}
      >
        {comment.avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-sm font-medium ${comment.isCreator ? 'px-2 py-0.5 rounded-xl' : ''}`}
            style={{
              color: site.theme.text,
              background: comment.isCreator ? site.theme.secondary : 'transparent',
            }}
          >
            @{comment.author}
          </span>
          <span className="text-xs" style={{ color: site.theme.textMuted }}>
            {comment.timestamp}
          </span>
        </div>
        <p className="text-sm mb-2" style={{ color: site.theme.text }}>
          {comment.content}
        </p>
        <div className="flex items-center gap-4 text-xs" style={{ color: site.theme.textMuted }}>
          <button
            onClick={() => {
              setLiked(!liked)
              if (disliked) setDisliked(false)
            }}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            {liked ? '👍' : '👍'} {comment.likes + (liked ? 1 : 0)}
          </button>
          <button
            onClick={() => {
              setDisliked(!disliked)
              if (liked) setLiked(false)
            }}
            className="hover:text-gray-700"
          >
            {disliked ? '👎' : '👎'}
          </button>
          <button className="hover:text-gray-700">Reply</button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: site.theme.primary }}
            >
              {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
            {showReplies && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VidTubeSite
