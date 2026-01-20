export interface CommentAuthor {
  id: string
  name: string
  username?: string
  avatar?: string | null
}

export interface CommentData {
  id: string
  author: CommentAuthor
  content: string
  timestamp: number
  likes?: number
  isLiked?: boolean
  score?: number // For Reddit-style voting
  userVote?: 'up' | 'down' | null
  replies?: CommentData[]
  replyCount?: number
  depth?: number
  isCollapsed?: boolean
  isOP?: boolean // Original poster indicator
  metadata?: Record<string, any>
}

export interface CommentStyleConfig {
  variant: 'myspace' | 'instagram' | 'reddit' | 'twitter' | 'discord' | 'default'
  layout: 'flat' | 'nested' | 'deep-nested'
  maxDepth?: number // For deep-nested, limit nesting depth
  showAvatar: boolean
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg'
  showTimestamp: boolean
  timestampFormat?: 'relative' | 'absolute' | 'smart'
  contentRenderer: 'plain' | 'markdown' | 'html'
  actionsPosition: 'below' | 'inline' | 'hover'
  showReplyCount?: boolean
  showLikeCount?: boolean
  showScore?: boolean // For Reddit-style
  indentReplies?: boolean
  indentSize?: number // px
  collapsible?: boolean // Can collapse threads
  highlightOP?: boolean // Highlight if commenter is the post author
}

export interface CommentActions {
  onLike?: (commentId: string) => void
  onUnlike?: (commentId: string) => void
  onUpvote?: (commentId: string) => void
  onDownvote?: (commentId: string) => void
  onReply?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string) => void
  onReport?: (commentId: string) => void
  onToggleCollapse?: (commentId: string) => void
  onLoadReplies?: (commentId: string) => void
  onViewProfile?: (authorId: string) => void
}
