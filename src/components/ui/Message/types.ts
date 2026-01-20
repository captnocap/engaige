export interface MessageAuthor {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
  status?: 'online' | 'idle' | 'dnd' | 'offline'
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'file' | 'gif' | 'sticker'
  url: string
  thumbnail?: string
  name?: string
  size?: number
  width?: number
  height?: number
  duration?: number // for audio/video
}

export interface MessageReaction {
  emoji: string
  count: number
  reacted: boolean // did current user react
  users?: string[] // user IDs who reacted
}

export interface MessageData {
  id: string
  author: MessageAuthor
  content: string
  timestamp: Date | string
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  replyTo?: {
    id: string
    author: string
    preview: string
  }
  isEdited?: boolean
  isDeleted?: boolean
  isPinned?: boolean
  isSystem?: boolean // system message (joined, left, etc.)
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  readBy?: string[] // user IDs who have read
}

export type MessageLayout = 'bubbles' | 'flat' | 'compact' | 'cozy'
export type MessageAlignment = 'left' | 'right' | 'auto' // auto = right for own messages

export interface MessageStyleConfig {
  variant: string // 'messenger', 'discord', 'imessage', 'whatsapp', 'slack'
  layout: MessageLayout
  alignment: MessageAlignment

  // Display options
  showAvatar: boolean
  showTimestamp: boolean
  showStatus: boolean // delivery status
  showReadReceipts: boolean
  showReactions: boolean
  showUsername: boolean // useful for group chats

  // Grouping
  groupByTime: boolean // group consecutive messages from same author
  groupTimeWindow?: number // ms - messages within this window are grouped

  // Sizing
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg'
  maxWidth?: string // max bubble width

  // Timestamp display
  timestampFormat?: 'relative' | 'absolute' | 'time-only'

  // Colors (for bubbles)
  ownMessageBg?: string
  otherMessageBg?: string

  // Current user ID (to determine own vs other)
  currentUserId?: string
}

export interface MessageActions {
  onReply?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
  onEdit?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onPin?: (messageId: string) => void
  onCopy?: (messageId: string) => void
  onForward?: (messageId: string) => void
  onViewProfile?: (userId: string) => void
  onResend?: (messageId: string) => void // for failed messages
  onAttachmentClick?: (attachment: MessageAttachment) => void
}
