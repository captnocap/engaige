/**
 * InstaSnap Post Card
 *
 * Individual post display in Instagram style.
 */

import { useState } from 'react'
import { useSocialStore, type Post } from '../../../../stores/socialStore.js'
import { useInstaSnapStore } from '../../../../stores/instaSnapStore.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapPostCardProps {
  post: Post
  onViewProfile: (profileId: string) => void
  onViewPost: (postId: string) => void
}

export function InstaSnapPostCard({ post, onViewProfile, onViewPost }: InstaSnapPostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLikeAnimating, setIsLikeAnimating] = useState(false)

  const { likePost, unlikePost, addComment } = useSocialStore()
  const { savePost, unsavePost, isPostSaved } = useInstaSnapStore()

  const isLiked = post.likes.includes('player')
  const isSaved = isPostSaved(post.id)

  const handleLike = () => {
    if (isLiked) {
      unlikePost(post.id)
    } else {
      likePost(post.id)
      setIsLikeAnimating(true)
      setTimeout(() => setIsLikeAnimating(false), 300)
    }
  }

  const handleDoubleClick = () => {
    if (!isLiked) {
      likePost(post.id)
      setIsLikeAnimating(true)
      setTimeout(() => setIsLikeAnimating(false), 300)
    }
  }

  const handleSave = () => {
    if (isSaved) {
      unsavePost(post.id)
    } else {
      savePost(post.id)
    }
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    addComment(post.id, commentText.trim())
    setCommentText('')
  }

  // Generate placeholder image URL based on post ID
  const imageUrl = post.images?.[0] || `https://picsum.photos/seed/${post.id}/600/600`

  return (
    <article
      className="pb-4"
      style={{ background: INSTASNAP_THEME.cardBg }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 px-3 py-2">
        <button
          onClick={() => onViewProfile(post.authorId)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{
            background: INSTASNAP_THEME.gradient,
            padding: '2px',
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-sm"
            style={{ background: INSTASNAP_THEME.cardBg }}
          >
            {post.author.avatar || post.author.name[0]}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onViewProfile(post.authorId)}
            className="text-sm font-semibold hover:underline"
            style={{ color: INSTASNAP_THEME.text }}
          >
            {post.author.username}
          </button>
          {post.author.location && (
            <p className="text-xs" style={{ color: INSTASNAP_THEME.textMuted }}>
              {post.author.location}
            </p>
          )}
        </div>
        <button className="p-1" style={{ color: INSTASNAP_THEME.text }}>
          •••
        </button>
      </header>

      {/* Image */}
      <div
        className="relative aspect-square bg-gray-100 cursor-pointer"
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={imageUrl}
          alt={`Post by ${post.author.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Double-tap like animation */}
        {isLikeAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-8xl animate-ping opacity-90">❤️</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`text-2xl transition-transform ${isLiked ? 'scale-110' : 'hover:scale-110'}`}
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              💬
            </button>
            <button className="text-2xl hover:scale-110 transition-transform">
              📤
            </button>
          </div>
          <button
            onClick={handleSave}
            className="text-2xl hover:scale-110 transition-transform"
          >
            {isSaved ? '🔖' : '🏷️'}
          </button>
        </div>

        {/* Likes */}
        {post.likes.length > 0 && (
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: INSTASNAP_THEME.text }}
          >
            {post.likes.length.toLocaleString()} {post.likes.length === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        <p className="text-sm mb-1" style={{ color: INSTASNAP_THEME.text }}>
          <button
            onClick={() => onViewProfile(post.authorId)}
            className="font-semibold mr-1 hover:underline"
          >
            {post.author.username}
          </button>
          {post.content}
        </p>

        {/* View comments link */}
        {post.comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-sm mb-1"
            style={{ color: INSTASNAP_THEME.textMuted }}
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comments */}
        {showComments && (
          <div className="space-y-1 mb-2">
            {post.comments.slice(0, 3).map(comment => (
              <p key={comment.id} className="text-sm" style={{ color: INSTASNAP_THEME.text }}>
                <button
                  onClick={() => onViewProfile(comment.authorId)}
                  className="font-semibold mr-1 hover:underline"
                >
                  {comment.author.username}
                </button>
                {comment.content}
              </p>
            ))}
            {post.comments.length > 3 && (
              <button
                onClick={() => onViewPost(post.id)}
                className="text-sm"
                style={{ color: INSTASNAP_THEME.textMuted }}
              >
                View all {post.comments.length} comments
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p
          className="text-[10px] uppercase tracking-wide"
          style={{ color: INSTASNAP_THEME.textMuted }}
        >
          {formatRelativeTime(new Date(post.timestamp))}
        </p>
      </div>

      {/* Add comment */}
      <div
        className="flex items-center gap-2 px-3 pt-2 mt-2 border-t"
        style={{ borderColor: INSTASNAP_THEME.border }}
      >
        <span className="text-xl">😊</span>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: INSTASNAP_THEME.text }}
        />
        {commentText.trim() && (
          <button
            onClick={handleComment}
            className="text-sm font-semibold"
            style={{ color: INSTASNAP_THEME.primary }}
          >
            Post
          </button>
        )}
      </div>
    </article>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default InstaSnapPostCard
