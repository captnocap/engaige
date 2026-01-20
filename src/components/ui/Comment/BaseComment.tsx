import { useState } from 'react'
import { Avatar, Timestamp, LikeButton, VoteButtons, ContentRenderer } from '../Shared'
import { CommentActions } from './CommentActions'
import { CommentThread } from './CommentThread'
import { getCommentStyles } from './styles'
import type { CommentData, CommentStyleConfig, CommentActions as CommentActionHandlers } from './types'

interface BaseCommentProps {
  comment: CommentData
  config: CommentStyleConfig
  actions?: CommentActionHandlers
  isReply?: boolean
  className?: string
}

export function BaseComment({
  comment,
  config,
  actions,
  isReply = false,
  className = '',
}: BaseCommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(comment.isCollapsed ?? false)

  const styles = getCommentStyles(config.variant)
  const depth = comment.depth ?? 0
  const maxDepth = config.maxDepth ?? 10

  // Handle collapse toggle
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    actions?.onToggleCollapse?.(comment.id)
  }

  // Handle reply click
  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput)
    actions?.onReply?.(comment.id)
  }

  // Calculate indent for nested comments
  const indent = config.indentReplies && isReply
    ? { marginLeft: `${(config.indentSize ?? 16) * Math.min(depth, maxDepth)}px` }
    : {}

  // Collapsed state - show minimal info
  if (isCollapsed && config.collapsible) {
    return (
      <div
        className={`${styles.collapsedContainer} ${className}`}
        style={indent}
        onClick={handleToggleCollapse}
      >
        <span style={{ color: 'var(--color-textMuted)', cursor: 'pointer' }}>
          [+] {comment.author.name} • {comment.replyCount ?? comment.replies?.length ?? 0} replies
        </span>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${className}`} style={indent}>
      <div className={styles.wrapper}>
        {/* Avatar */}
        {config.showAvatar && (
          <div
            className={styles.avatarContainer}
            onClick={() => actions?.onViewProfile?.(comment.author.id)}
            style={{ cursor: actions?.onViewProfile ? 'pointer' : 'default' }}
          >
            <Avatar
              src={comment.author.avatar}
              alt={comment.author.name}
              size={config.avatarSize ?? 'sm'}
              fallback={comment.author.name}
            />
          </div>
        )}

        <div className={styles.contentWrapper}>
          {/* Header: Author + Timestamp */}
          <div className={styles.header}>
            <span
              className={styles.authorName}
              onClick={() => actions?.onViewProfile?.(comment.author.id)}
              style={{ cursor: actions?.onViewProfile ? 'pointer' : 'default' }}
            >
              {comment.author.name}
              {comment.author.username && (
                <span className={styles.username}>@{comment.author.username}</span>
              )}
            </span>

            {comment.isOP && config.highlightOP && (
              <span className={styles.opBadge}>OP</span>
            )}

            {config.showTimestamp && (
              <Timestamp
                time={comment.timestamp}
                format={config.timestampFormat ?? 'relative'}
                className={styles.timestamp}
              />
            )}

            {/* Collapse button for Reddit-style */}
            {config.collapsible && comment.replies && comment.replies.length > 0 && (
              <button
                onClick={handleToggleCollapse}
                className={styles.collapseButton}
                title="Collapse thread"
              >
                [−]
              </button>
            )}
          </div>

          {/* Content */}
          <ContentRenderer
            content={comment.content}
            type={config.contentRenderer}
            className={styles.content}
            linkify
          />

          {/* Actions */}
          <div className={styles.actionsContainer} data-position={config.actionsPosition}>
            {/* Like/Vote */}
            {config.showScore && comment.score !== undefined ? (
              <VoteButtons
                score={comment.score}
                userVote={comment.userVote}
                onUpvote={() => actions?.onUpvote?.(comment.id)}
                onDownvote={() => actions?.onDownvote?.(comment.id)}
                size="sm"
              />
            ) : config.showLikeCount !== false ? (
              <LikeButton
                count={comment.likes ?? 0}
                isLiked={comment.isLiked}
                onLike={() => actions?.onLike?.(comment.id)}
                onUnlike={() => actions?.onUnlike?.(comment.id)}
                variant={config.variant === 'reddit' ? 'arrow' : 'heart'}
                size="sm"
              />
            ) : null}

            {/* Reply button */}
            <button
              onClick={handleReplyClick}
              className={styles.actionButton}
            >
              Reply
              {config.showReplyCount && comment.replyCount !== undefined && comment.replyCount > 0 && (
                <span className={styles.replyCount}>({comment.replyCount})</span>
              )}
            </button>

            {/* More actions (edit, delete, report) */}
            <CommentActions
              commentId={comment.id}
              onEdit={actions?.onEdit}
              onDelete={actions?.onDelete}
              onReport={actions?.onReport}
              className={styles.moreActions}
            />
          </div>

          {/* Reply input (shown when reply clicked) */}
          {showReplyInput && (
            <div className={styles.replyInput}>
              {/* Placeholder - actual input would be injected by parent */}
              <div style={{ color: 'var(--color-textMuted)', fontSize: '0.875rem' }}>
                Reply input goes here...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {config.layout !== 'flat' && comment.replies && comment.replies.length > 0 && (
        <CommentThread
          comments={comment.replies}
          config={config}
          actions={actions}
          parentDepth={depth}
        />
      )}

      {/* Load more replies button */}
      {comment.replyCount && comment.replies &&
        comment.replyCount > comment.replies.length && (
          <button
            onClick={() => actions?.onLoadReplies?.(comment.id)}
            className={styles.loadMoreButton}
          >
            Load {comment.replyCount - comment.replies.length} more replies
          </button>
        )}
    </div>
  )
}
