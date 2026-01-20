import { useMemo } from 'react'
import { BaseMessage } from './BaseMessage'
import { Timestamp } from '../Shared'
import type { MessageData, MessageStyleConfig, MessageActions } from './types'

interface MessageThreadProps {
  messages: MessageData[]
  config: MessageStyleConfig
  actions?: MessageActions
  className?: string
}

export function MessageThread({
  messages,
  config,
  actions,
  className = '',
}: MessageThreadProps) {
  // Group messages by sender and time
  const groupedMessages = useMemo(() => {
    if (!config.groupByTime) {
      return messages.map(m => ({ message: m, isGrouped: false, isLastInGroup: true }))
    }

    const timeWindow = config.groupTimeWindow ?? 5 * 60 * 1000 // 5 minutes default
    const result: Array<{
      message: MessageData
      isGrouped: boolean
      isLastInGroup: boolean
      showDateDivider?: boolean
    }> = []

    let lastDate: string | null = null

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      const prevMessage = messages[i - 1]
      const nextMessage = messages[i + 1]

      const messageTime = new Date(message.timestamp).getTime()
      const messageDate = new Date(message.timestamp).toDateString()

      // Check if we need a date divider
      const showDateDivider = messageDate !== lastDate
      lastDate = messageDate

      // Is this grouped with the previous message?
      const isGroupedWithPrev = prevMessage &&
        prevMessage.author.id === message.author.id &&
        !message.isSystem &&
        !prevMessage.isSystem &&
        messageTime - new Date(prevMessage.timestamp).getTime() < timeWindow

      // Is this grouped with the next message?
      const isGroupedWithNext = nextMessage &&
        nextMessage.author.id === message.author.id &&
        !message.isSystem &&
        !nextMessage.isSystem &&
        new Date(nextMessage.timestamp).getTime() - messageTime < timeWindow

      result.push({
        message,
        isGrouped: !!isGroupedWithPrev,
        isLastInGroup: !isGroupedWithNext,
        showDateDivider,
      })
    }

    return result
  }, [messages, config.groupByTime, config.groupTimeWindow])

  return (
    <div className={className}>
      {groupedMessages.map(({ message, isGrouped, isLastInGroup, showDateDivider }) => (
        <div key={message.id}>
          {/* Date divider */}
          {showDateDivider && (
            <DateDivider date={new Date(message.timestamp)} />
          )}

          <BaseMessage
            message={message}
            config={config}
            actions={actions}
            isGrouped={isGrouped}
            isLastInGroup={isLastInGroup}
          />
        </div>
      ))}
    </div>
  )
}

function DateDivider({ date }: { date: Date }) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  let label: string
  if (date.toDateString() === today.toDateString()) {
    label = 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    label = 'Yesterday'
  } else {
    label = date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-current opacity-10" />
      <span className="text-xs opacity-40 font-medium">{label}</span>
      <div className="flex-1 h-px bg-current opacity-10" />
    </div>
  )
}

// Utility: Convert flat message list to reply chains
export function buildReplyChains(messages: MessageData[]): MessageData[] {
  const map = new Map<string, MessageData>()
  const result: MessageData[] = []

  // First pass: index all messages
  for (const message of messages) {
    map.set(message.id, { ...message })
  }

  // Second pass: attach reply previews
  for (const message of messages) {
    if (message.replyTo && map.has(message.replyTo.id)) {
      const replyTarget = map.get(message.replyTo.id)!
      message.replyTo = {
        id: replyTarget.id,
        author: replyTarget.author.name,
        preview: replyTarget.content.slice(0, 100),
      }
    }
    result.push(message)
  }

  return result
}

// Utility: Group messages by date for display
export function groupMessagesByDate(messages: MessageData[]): Map<string, MessageData[]> {
  const groups = new Map<string, MessageData[]>()

  for (const message of messages) {
    const dateKey = new Date(message.timestamp).toDateString()
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey)!.push(message)
  }

  return groups
}

// Utility: Find unread messages boundary
export function findUnreadBoundary(
  messages: MessageData[],
  lastReadId: string | null
): number {
  if (!lastReadId) return 0

  const index = messages.findIndex(m => m.id === lastReadId)
  return index >= 0 ? index + 1 : 0
}
