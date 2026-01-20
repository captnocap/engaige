import { useState } from 'react'

interface LikeButtonProps {
  count?: number
  isLiked?: boolean
  onLike?: () => void
  onUnlike?: () => void
  variant?: 'heart' | 'thumbs' | 'star' | 'arrow'
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  className?: string
  disabled?: boolean
}

const ICONS = {
  heart: { empty: '🤍', filled: '❤️' },
  thumbs: { empty: '👍', filled: '👍' },
  star: { empty: '☆', filled: '⭐' },
  arrow: { empty: '⬆', filled: '⬆' },
}

const SIZES = {
  sm: 'text-sm gap-1',
  md: 'text-base gap-1.5',
  lg: 'text-lg gap-2',
}

export function LikeButton({
  count = 0,
  isLiked = false,
  onLike,
  onUnlike,
  variant = 'heart',
  size = 'md',
  showCount = true,
  className = '',
  disabled = false,
}: LikeButtonProps) {
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    if (disabled) return

    setAnimating(true)
    setTimeout(() => setAnimating(false), 300)

    if (isLiked) {
      onUnlike?.()
    } else {
      onLike?.()
    }
  }

  const icon = ICONS[variant]

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center transition-all ${SIZES[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
      } ${animating ? 'scale-125' : 'scale-100'}`}
      style={{
        color: isLiked ? 'var(--color-error)' : 'var(--color-textMuted)',
      }}
    >
      <span className={`transition-transform ${animating ? 'scale-125' : ''}`}>
        {isLiked ? icon.filled : icon.empty}
      </span>
      {showCount && count > 0 && (
        <span className="tabular-nums">{formatCount(count)}</span>
      )}
    </button>
  )
}

function formatCount(n: number): string {
  if (n < 1000) return n.toString()
  if (n < 1000000) return `${(n / 1000).toFixed(1)}K`
  return `${(n / 1000000).toFixed(1)}M`
}

// Upvote/Downvote variant for Reddit-style
interface VoteButtonsProps {
  score: number
  userVote?: 'up' | 'down' | null
  onUpvote?: () => void
  onDownvote?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export function VoteButtons({
  score,
  userVote,
  onUpvote,
  onDownvote,
  size = 'md',
  className = '',
  disabled = false,
}: VoteButtonsProps) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <button
        onClick={onUpvote}
        disabled={disabled}
        className={`transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
        style={{
          color: userVote === 'up' ? 'var(--color-primary)' : 'var(--color-textMuted)',
        }}
      >
        ▲
      </button>
      <span
        className="text-sm font-medium tabular-nums"
        style={{
          color:
            userVote === 'up'
              ? 'var(--color-primary)'
              : userVote === 'down'
                ? 'var(--color-error)'
                : 'var(--color-text)',
        }}
      >
        {formatCount(score)}
      </span>
      <button
        onClick={onDownvote}
        disabled={disabled}
        className={`transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
        style={{
          color: userVote === 'down' ? 'var(--color-error)' : 'var(--color-textMuted)',
        }}
      >
        ▼
      </button>
    </div>
  )
}
