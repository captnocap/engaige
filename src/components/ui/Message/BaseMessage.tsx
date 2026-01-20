import { useState } from 'react'
import { Avatar, Timestamp, ContentRenderer } from '../Shared'
import { getMessageStyles } from './styles'
import type { MessageData, MessageStyleConfig, MessageActions, MessageAttachment } from './types'

interface BaseMessageProps {
  message: MessageData
  config: MessageStyleConfig
  actions?: MessageActions
  isGrouped?: boolean // part of a group from same sender
  isLastInGroup?: boolean
  className?: string
}

export function BaseMessage({
  message,
  config,
  actions,
  isGrouped = false,
  isLastInGroup = true,
  className = '',
}: BaseMessageProps) {
  const [showActions, setShowActions] = useState(false)

  const styles = getMessageStyles(config.variant)
  const isOwn = config.currentUserId === message.author.id
  const alignment = config.alignment === 'auto' ? (isOwn ? 'right' : 'left') : config.alignment

  // System messages (user joined, etc.)
  if (message.isSystem) {
    return (
      <div className={styles.systemMessage} style={{ color: 'var(--message-system)' }}>
        {message.content}
      </div>
    )
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div
        className={`${styles.container} ${className}`}
        style={{ justifyContent: alignment === 'right' ? 'flex-end' : 'flex-start' }}
      >
        <div className={`${styles.bubble} ${styles.deletedMessage}`}>
          This message was deleted
        </div>
      </div>
    )
  }

  // Determine bubble style based on ownership
  const bubbleStyle = isOwn ? styles.bubbleOwn : styles.bubbleOther
  const bubbleBg = isOwn ? 'var(--message-own-bg)' : 'var(--message-other-bg)'
  const bubbleText = isOwn ? 'var(--message-own-text)' : 'var(--message-other-text)'

  // Should show avatar? Only for non-grouped or last in group
  const showAvatar = config.showAvatar && (!isGrouped || isLastInGroup) && alignment === 'left'

  // Flat layouts (Discord, Slack) don't use bubbles
  const useBubbles = config.layout === 'bubbles'

  return (
    <div
      className={`${styles.container} ${isGrouped ? styles.groupedMessage : ''} ${className} group relative`}
      style={{
        display: 'flex',
        flexDirection: alignment === 'right' ? 'row-reverse' : 'row',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {config.showAvatar && alignment === 'left' && (
        <div
          className={styles.avatarContainer}
          style={{
            visibility: showAvatar ? 'visible' : 'hidden',
            cursor: actions?.onViewProfile ? 'pointer' : 'default',
          }}
          onClick={() => actions?.onViewProfile?.(message.author.id)}
        >
          <Avatar
            src={message.author.avatar}
            alt={message.author.name}
            size={config.avatarSize ?? 'sm'}
            fallback={message.author.name}
            showOnlineIndicator={!!message.author.isOnline}
            isOnline={message.author.isOnline}
          />
        </div>
      )}

      <div className={styles.contentWrapper}>
        {/* Header - username & timestamp (for flat layouts or first in group) */}
        {(!isGrouped || !useBubbles) && config.showUsername && alignment === 'left' && (
          <div className={styles.header}>
            <span
              className={styles.authorName}
              onClick={() => actions?.onViewProfile?.(message.author.id)}
            >
              {message.author.name}
            </span>
            {config.showTimestamp && (
              <Timestamp
                time={message.timestamp}
                format={config.timestampFormat ?? 'relative'}
                className={styles.timestamp}
              />
            )}
          </div>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={styles.replyPreview} style={{ borderColor: 'var(--message-own-bg)' }}>
            <span className="font-medium">{message.replyTo.author}</span>
            <span className="ml-1 opacity-70">{message.replyTo.preview}</span>
          </div>
        )}

        {/* Message bubble/content */}
        <div
          className={`${styles.bubble} ${bubbleStyle}`}
          style={useBubbles ? { background: bubbleBg, color: bubbleText } : {}}
        >
          <ContentRenderer
            content={message.content}
            type="plain"
            className={styles.content}
            linkify
          />

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={styles.attachments}>
              {message.attachments.map(attachment => (
                <MessageAttachmentView
                  key={attachment.id}
                  attachment={attachment}
                  onClick={() => actions?.onAttachmentClick?.(attachment)}
                />
              ))}
            </div>
          )}

          {/* Inline timestamp for WhatsApp style */}
          {config.variant === 'whatsapp' && config.showTimestamp && (
            <span className={styles.timestamp}>
              <Timestamp time={message.timestamp} format="time-only" />
              {config.showStatus && <MessageStatus status={message.status} />}
            </span>
          )}
        </div>

        {/* Reactions */}
        {config.showReactions && message.reactions && message.reactions.length > 0 && (
          <div className={styles.reactions}>
            {message.reactions.map((reaction, i) => (
              <button
                key={i}
                onClick={() => actions?.onReact?.(message.id, reaction.emoji)}
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  reaction.reacted ? 'bg-blue-500/20' : 'bg-white/10'
                }`}
              >
                {reaction.emoji} {reaction.count > 1 && reaction.count}
              </button>
            ))}
          </div>
        )}

        {/* Status (sent, delivered, read) - for bubble layouts */}
        {config.showStatus && message.status && config.variant !== 'whatsapp' && isOwn && (
          <div className={styles.status}>
            <MessageStatus status={message.status} />
          </div>
        )}
      </div>

      {/* Hover actions */}
      {showActions && (
        <div className={styles.actionsContainer}>
          {actions?.onReply && (
            <button
              onClick={() => actions.onReply?.(message.id)}
              className={styles.actionButton}
              title="Reply"
            >
              ↩
            </button>
          )}
          {actions?.onReact && (
            <button
              onClick={() => actions.onReact?.(message.id, '👍')}
              className={styles.actionButton}
              title="React"
            >
              😀
            </button>
          )}
          {isOwn && actions?.onEdit && (
            <button
              onClick={() => actions.onEdit?.(message.id)}
              className={styles.actionButton}
              title="Edit"
            >
              ✏️
            </button>
          )}
          {isOwn && actions?.onDelete && (
            <button
              onClick={() => actions.onDelete?.(message.id)}
              className={styles.actionButton}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* Failed message retry */}
      {message.status === 'failed' && (
        <button
          onClick={() => actions?.onResend?.(message.id)}
          className="text-xs text-red-500 hover:underline ml-2"
        >
          Failed - Click to retry
        </button>
      )}
    </div>
  )
}

// Sub-components

function MessageStatus({ status }: { status?: string }) {
  switch (status) {
    case 'sending':
      return <span className="opacity-40">○</span>
    case 'sent':
      return <span className="opacity-60">✓</span>
    case 'delivered':
      return <span className="opacity-60">✓✓</span>
    case 'read':
      return <span className="text-blue-400">✓✓</span>
    case 'failed':
      return <span className="text-red-500">!</span>
    default:
      return null
  }
}

function MessageAttachmentView({
  attachment,
  onClick,
}: {
  attachment: MessageAttachment
  onClick?: () => void
}) {
  const handleClick = () => onClick?.()

  switch (attachment.type) {
    case 'image':
    case 'gif':
      return (
        <img
          src={attachment.url}
          alt={attachment.name ?? 'Image'}
          className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          style={{ maxHeight: '300px' }}
          onClick={handleClick}
        />
      )

    case 'video':
      return (
        <video
          src={attachment.url}
          controls
          className="max-w-full rounded-lg"
          style={{ maxHeight: '300px' }}
        />
      )

    case 'audio':
      return (
        <audio src={attachment.url} controls className="w-full" />
      )

    case 'sticker':
      return (
        <img
          src={attachment.url}
          alt="Sticker"
          className="w-24 h-24 object-contain"
        />
      )

    case 'file':
      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
        >
          <span>📄</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{attachment.name ?? 'File'}</div>
            {attachment.size && (
              <div className="text-xs opacity-60">
                {formatFileSize(attachment.size)}
              </div>
            )}
          </div>
        </a>
      )

    default:
      return null
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
