export { BaseMessage } from './BaseMessage'
export { MessageThread, buildReplyChains, groupMessagesByDate, findUnreadBoundary } from './MessageThread'
export { TypingIndicator, TypingBubble, TypingBar } from './TypingIndicator'
export { getMessageStyles, MESSAGE_CSS_VARS } from './styles'
export type {
  MessageData,
  MessageAuthor,
  MessageAttachment,
  MessageReaction,
  MessageStyleConfig,
  MessageActions,
  MessageLayout,
  MessageAlignment,
} from './types'
