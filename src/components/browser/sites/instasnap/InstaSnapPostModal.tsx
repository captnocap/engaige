/**
 * InstaSnap Post Modal
 *
 * Full post detail view in a modal overlay.
 */

import { useState, useEffect } from 'react'
import { useSocialStore } from '../../../../stores/socialStore.js'
import { useInstaSnapStore } from '../../../../stores/instaSnapStore.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapPostModalProps {
  postId: string
  onClose: () => void
  onViewProfile: (profileId: string) => void
}

export function InstaSnapPostModal({ postId, onClose, onViewProfile }: InstaSnapPostModalProps) {
  const [commentText, setCommentText] = useState('')

  const { posts, likePost, unlikePost, addComment } = useSocialStore()
  const { savePost, unsavePost, isPostSaved } = useInstaSnapStore()

  const post = posts.find(p => p.id === postId)
  const isLiked = post?.likes.includes('player') ?? false
  const isSaved = isPostSaved(postId)

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!post) {
    return null
  }

  const handleLike = () => {
    if (isLiked) {
      unlikePost(post.id)
    } else {
      likePost(post.id)
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

  const imageUrl = post.images?.[0] || `https://picsum.photos/seed/${post.id}/600/600`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl hover:opacity-80"
      >
        ✕
      </button>

      {/* Modal Content */}
      <div
        className="flex max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden shadow-2xl"
        style={{ background: INSTASNAP_THEME.cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Side */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-[400px]">
          <img
            src={imageUrl}
            alt={`Post by ${post.author.name}`}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>

        {/* Details Side */}
        <div
          className="w-[400px] flex flex-col"
          style={{ borderLeft: `1px solid ${INSTASNAP_THEME.border}` }}
        >
          {/* Header */}
          <header
            className="flex items-center gap-3 p-4 border-b"
            style={{ borderColor: INSTASNAP_THEME.border }}
          >
            <button
              onClick={() => onViewProfile(post.authorId)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: INSTASNAP_THEME.background }}
            >
              {post.author.avatar || post.author.name[0]}
            </button>
            <button
              onClick={() => onViewProfile(post.authorId)}
              className="font-semibold text-sm hover:underline"
              style={{ color: INSTASNAP_THEME.text }}
            >
              {post.author.username}
            </button>
            <button className="ml-auto" style={{ color: INSTASNAP_THEME.text }}>
              •••
            </button>
          </header>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Caption */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => onViewProfile(post.authorId)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: INSTASNAP_THEME.background }}
              >
                {post.author.avatar || post.author.name[0]}
              </button>
              <div>
                <p className="text-sm" style={{ color: INSTASNAP_THEME.text }}>
                  <button
                    onClick={() => onViewProfile(post.authorId)}
                    className="font-semibold mr-1 hover:underline"
                  >
                    {post.author.username}
                  </button>
                  {post.content}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: INSTASNAP_THEME.textMuted }}
                >
                  {formatTimeAgo(new Date(post.timestamp))}
                </p>
              </div>
            </div>

            {/* Comments */}
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-3 mb-4">
                <button
                  onClick={() => onViewProfile(comment.authorId)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: INSTASNAP_THEME.background }}
                >
                  {comment.author.avatar || comment.author.name[0]}
                </button>
                <div className="flex-1">
                  <p className="text-sm" style={{ color: INSTASNAP_THEME.text }}>
                    <button
                      onClick={() => onViewProfile(comment.authorId)}
                      className="font-semibold mr-1 hover:underline"
                    >
                      {comment.author.username}
                    </button>
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span
                      className="text-xs"
                      style={{ color: INSTASNAP_THEME.textMuted }}
                    >
                      {formatTimeAgo(new Date(comment.timestamp))}
                    </span>
                    {comment.likes.length > 0 && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: INSTASNAP_THEME.textMuted }}
                      >
                        {comment.likes.length} likes
                      </span>
                    )}
                    <button
                      className="text-xs font-medium"
                      style={{ color: INSTASNAP_THEME.textMuted }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
                <button className="text-xs shrink-0">🤍</button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div
            className="p-4 border-t"
            style={{ borderColor: INSTASNAP_THEME.border }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  {isLiked ? '❤️' : '🤍'}
                </button>
                <button className="text-2xl hover:scale-110 transition-transform">
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

            {/* Likes count */}
            {post.likes.length > 0 && (
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: INSTASNAP_THEME.text }}
              >
                {post.likes.length.toLocaleString()} {post.likes.length === 1 ? 'like' : 'likes'}
              </p>
            )}

            {/* Timestamp */}
            <p
              className="text-[10px] uppercase tracking-wide"
              style={{ color: INSTASNAP_THEME.textMuted }}
            >
              {formatFullDate(new Date(post.timestamp))}
            </p>
          </div>

          {/* Add Comment */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-t"
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
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  if (weeks < 52) return `${weeks}w`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default InstaSnapPostModal
