/**
 * Messages App (iMessage clone)
 *
 * Phone-only messaging app for close friends.
 * Uses bubble message variant with iMessage styling.
 */

import { useState, useEffect, useRef } from 'react'
import type { AppProps } from '../PhoneAppContainer.js'
import { MessageThread as MessageThreadComponent } from '../../ui/Message/MessageThread.js'
import { TypingBubble } from '../../ui/Message/TypingIndicator.js'
import { MESSAGE_CSS_VARS } from '../../ui/Message/styles.js'
import type { MessageStyleConfig } from '../../ui/Message/types.js'
import {
  useConversationStore,
  useConversations,
  useConversationMessages,
  useTypingIndicator,
} from '../../../stores/conversationStore.js'

// iMessage style configuration
const IMESSAGE_CONFIG: MessageStyleConfig = {
  variant: 'imessage',
  layout: 'bubbles',
  alignment: 'auto',
  showAvatar: false,
  showTimestamp: true,
  showStatus: true,
  showReadReceipts: true,
  showReactions: false,
  showUsername: false,
  groupByTime: true,
  groupTimeWindow: 5 * 60 * 1000, // 5 minutes
  avatarSize: 'sm',
  timestampFormat: 'relative',
  currentUserId: 'player',
}

export function MessagesApp({ onBack }: AppProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const conversations = useConversations('messages')
  const { initialize, isLoading } = useConversationStore()

  // Initialize conversations on mount
  useEffect(() => {
    if (conversations.length === 0) {
      initialize()
    }
  }, [initialize, conversations.length])

  // Sort conversations: pinned first, then by last message time
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  if (selectedConversationId) {
    const conversation = conversations.find(c => c.id === selectedConversationId)
    if (conversation) {
      return (
        <MessageThreadView
          conversationId={selectedConversationId}
          participantName={conversation.participants[0]?.name || 'Unknown'}
          participantAvatar={conversation.participants[0]?.avatar}
          onBack={() => setSelectedConversationId(null)}
        />
      )
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-4 pt-2 pb-3"
        style={{ background: 'var(--color-bgSecondary)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="text-[#007AFF] text-sm font-medium"
          >
            Back
          </button>
          <button className="text-[#007AFF]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
          Messages
        </h1>
        {/* Search bar */}
        <div
          className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'var(--color-bgTertiary)' }}
        >
          <svg className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-2xl animate-pulse">...</span>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-8">
            <span className="text-4xl">💬</span>
            <p className="text-center" style={{ color: 'var(--color-textMuted)' }}>
              No messages yet. Your close friends will appear here.
            </p>
          </div>
        ) : (
          sortedConversations.map(convo => (
            <ConversationRow
              key={convo.id}
              id={convo.id}
              name={convo.participants[0]?.name || 'Unknown'}
              avatar={convo.participants[0]?.avatar}
              lastMessage={convo.lastMessage?.content}
              lastMessageTime={convo.lastMessage?.timestamp}
              unreadCount={convo.unreadCount}
              isPinned={convo.isPinned}
              isOnline={convo.participants[0]?.isOnline}
              onClick={() => setSelectedConversationId(convo.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface ConversationRowProps {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  isPinned?: boolean
  isOnline?: boolean
  onClick: () => void
}

function ConversationRow({
  name,
  avatar,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isPinned,
  isOnline,
  onClick,
}: ConversationRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bgSecondary)] transition-colors"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Avatar with online indicator */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-medium"
          style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
        >
          {avatar || name[0]}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-bg)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
            {isPinned && <span className="text-xs">📌</span>}
            {name}
          </span>
          {lastMessageTime && (
            <span className="text-xs shrink-0" style={{ color: 'var(--color-textMuted)' }}>
              {formatRelativeTime(new Date(lastMessageTime))}
            </span>
          )}
        </div>
        {lastMessage && (
          <p
            className="text-sm truncate"
            style={{ color: unreadCount > 0 ? 'var(--color-text)' : 'var(--color-textMuted)' }}
          >
            {lastMessage}
          </p>
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-xs flex items-center justify-center shrink-0">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}

      {/* Chevron */}
      <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--color-textMuted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

interface MessageThreadViewProps {
  conversationId: string
  participantName: string
  participantAvatar?: string
  onBack: () => void
}

function MessageThreadView({
  conversationId,
  participantName,
  participantAvatar,
  onBack,
}: MessageThreadViewProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = useConversationMessages(conversationId)
  const typingParticipant = useTypingIndicator(conversationId)
  const { sendMessage, isSending, setActiveConversation } = useConversationStore()

  // Set active conversation and scroll to bottom
  useEffect(() => {
    setActiveConversation(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typingParticipant])

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return

    const content = inputValue
    setInputValue('')
    await sendMessage(conversationId, content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Apply iMessage CSS variables
  const cssVars = MESSAGE_CSS_VARS.imessage || {}

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'var(--color-bg)',
        ...cssVars as React.CSSProperties,
      }}
    >
      {/* Header */}
      <div
        className="h-11 px-2 flex items-center gap-2 shrink-0"
        style={{ background: 'var(--color-bgSecondary)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[#007AFF] text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
          >
            {participantAvatar || participantName[0]}
          </div>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {participantName}
          </span>
        </div>

        <div className="w-12" /> {/* Spacer for symmetry */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        <MessageThreadComponent
          messages={messages}
          config={IMESSAGE_CONFIG}
        />

        {/* Typing indicator */}
        {typingParticipant && (
          <TypingBubble
            name={typingParticipant.name}
            avatar={typingParticipant.avatar}
            className="mt-2"
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-3 py-2 flex items-center gap-2 shrink-0"
        style={{ background: 'var(--color-bgSecondary)', borderTop: '1px solid var(--color-border)' }}
      >
        <button className="text-[#007AFF]">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <div
          className="flex-1 px-4 py-2 rounded-full"
          style={{ background: 'var(--color-bgTertiary)' }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="iMessage"
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
          style={{ background: '#007AFF' }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default MessagesApp
