import { useState } from 'react'

interface Reaction {
  emoji: string
  count: number
  users: string[]
  hasReacted: boolean
}

interface ReactionPickerProps {
  reactions: Reaction[]
  onReact: (emoji: string) => void
  onUnreact: (emoji: string) => void
  availableEmojis?: string[]
  size?: 'sm' | 'md'
  className?: string
  disabled?: boolean
}

const DEFAULT_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍']

export function ReactionPicker({
  reactions,
  onReact,
  onUnreact,
  availableEmojis = DEFAULT_EMOJIS,
  size = 'md',
  className = '',
  disabled = false,
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleReactionClick = (emoji: string, hasReacted: boolean) => {
    if (disabled) return
    if (hasReacted) {
      onUnreact(emoji)
    } else {
      onReact(emoji)
    }
  }

  const handleAddReaction = (emoji: string) => {
    if (disabled) return
    onReact(emoji)
    setShowPicker(false)
  }

  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5 gap-1' : 'text-sm px-2 py-1 gap-1.5'
  const pickerSizeClasses = size === 'sm' ? 'text-base p-1' : 'text-lg p-1.5'

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {/* Existing reactions */}
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
          disabled={disabled}
          className={`inline-flex items-center rounded-full transition-all ${sizeClasses} ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
          }`}
          style={{
            background: reaction.hasReacted ? 'var(--color-primary)/20' : 'var(--color-bgTertiary)',
            border: reaction.hasReacted ? '1px solid var(--color-primary)' : '1px solid transparent',
          }}
          title={reaction.users.slice(0, 5).join(', ') + (reaction.users.length > 5 ? ` and ${reaction.users.length - 5} more` : '')}
        >
          <span>{reaction.emoji}</span>
          <span style={{ color: 'var(--color-text)' }}>{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={disabled}
          className={`rounded-full transition-all ${sizeClasses} ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
          }`}
          style={{
            background: 'var(--color-bgTertiary)',
            color: 'var(--color-textMuted)',
          }}
        >
          +
        </button>

        {/* Emoji picker dropdown */}
        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />
            <div
              className="absolute bottom-full left-0 mb-1 flex gap-0.5 rounded-lg p-1 z-20 shadow-lg"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {availableEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddReaction(emoji)}
                  className={`rounded hover:bg-white/10 transition-colors ${pickerSizeClasses}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Compact reaction display (for showing on posts without interaction)
interface ReactionDisplayProps {
  reactions: Reaction[]
  size?: 'sm' | 'md'
  className?: string
  maxVisible?: number
}

export function ReactionDisplay({
  reactions,
  size = 'md',
  className = '',
  maxVisible = 3,
}: ReactionDisplayProps) {
  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0)
  const visibleReactions = reactions.slice(0, maxVisible)

  if (totalCount === 0) return null

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex -space-x-1">
        {visibleReactions.map((reaction) => (
          <span
            key={reaction.emoji}
            className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}
          >
            {reaction.emoji}
          </span>
        ))}
      </div>
      <span
        className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}
        style={{ color: 'var(--color-textMuted)' }}
      >
        {totalCount}
      </span>
    </div>
  )
}
