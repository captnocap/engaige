/**
 * MySpace Chat App
 *
 * Available on both phone and browser surfaces.
 * Uses block message variant with MySpace early 2000s styling.
 */

import { useState, useEffect, useRef } from 'react'
import type { AppProps } from '../PhoneAppContainer.js'
import { MessageThread as MessageThreadComponent } from '../../ui/Message/MessageThread.js'
import { TypingIndicator } from '../../ui/Message/TypingIndicator.js'
import { MESSAGE_CSS_VARS } from '../../ui/Message/styles.js'
import type { MessageStyleConfig } from '../../ui/Message/types.js'
import {
  useConversationStore,
  useConversations,
  useConversationMessages,
  useTypingIndicator,
} from '../../../stores/conversationStore.js'

// MySpace style configuration
const MYSPACE_CONFIG: MessageStyleConfig = {
  variant: 'myspace',
  layout: 'flat',
  alignment: 'left',
  showAvatar: true,
  showTimestamp: true,
  showStatus: false,
  showReadReceipts: false,
  showReactions: true,
  showUsername: true,
  groupByTime: true,
  groupTimeWindow: 10 * 60 * 1000, // 10 minutes
  avatarSize: 'sm',
  timestampFormat: 'relative',
  currentUserId: 'player',
}

export function MySpaceChatApp({ onBack }: AppProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  // For MySpace, we use all conversations (not filtered by platform for now)
  const allConversations = useConversations()
  const { initialize, isLoading } = useConversationStore()

  // Filter to only myspace conversations (or show all for demo)
  const conversations = allConversations

  useEffect(() => {
    if (allConversations.length === 0) {
      initialize()
    }
  }, [initialize, allConversations.length])

  const sortedConversations = [...conversations].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  if (selectedConversationId) {
    const conversation = conversations.find(c => c.id === selectedConversationId)
    if (conversation) {
      return (
        <MySpaceThreadView
          conversationId={selectedConversationId}
          participantName={conversation.participants[0]?.name || 'Unknown'}
          participantAvatar={conversation.participants[0]?.avatar}
          onBack={() => setSelectedConversationId(null)}
        />
      )
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#336699' }}>
      {/* Header */}
      <div
        className="px-4 pt-2 pb-3"
        style={{
          background: 'linear-gradient(180deg, #003366 0%, #336699 100%)',
          borderBottom: '2px solid #FF6600',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="text-white/80 text-sm font-medium hover:text-white"
          >
            Back
          </button>
          <button className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
          My<span style={{ color: '#FF6600' }}>Space</span> Mail
        </h1>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'white' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-2xl animate-pulse text-[#003366]">Loading...</span>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-8">
            <span className="text-4xl">💬</span>
            <p className="text-center text-[#666]">
              No messages yet. Send a message to someone on MySpace!
            </p>
          </div>
        ) : (
          sortedConversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => setSelectedConversationId(convo.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
              style={{ borderBottom: '1px solid #ccc' }}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-xl font-medium bg-gray-200 text-[#003366]"
              >
                {convo.participants[0]?.avatar || convo.participants[0]?.name[0] || '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#003366]">
                    {convo.participants[0]?.name || 'Unknown'}
                  </span>
                  {convo.lastMessage?.timestamp && (
                    <span className="text-xs text-gray-500 shrink-0">
                      {formatRelativeTime(new Date(convo.lastMessage.timestamp))}
                    </span>
                  )}
                </div>
                {convo.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {convo.lastMessage.content}
                  </p>
                )}
              </div>

              {/* Unread Badge */}
              {convo.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-[#FF6600] text-white text-xs flex items-center justify-center shrink-0">
                  {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

interface MySpaceThreadViewProps {
  conversationId: string
  participantName: string
  participantAvatar?: string
  onBack: () => void
}

function MySpaceThreadView({
  conversationId,
  participantName,
  participantAvatar,
  onBack,
}: MySpaceThreadViewProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = useConversationMessages(conversationId)
  const typingParticipant = useTypingIndicator(conversationId)
  const { sendMessage, isSending, setActiveConversation } = useConversationStore()

  useEffect(() => {
    setActiveConversation(conversationId)
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

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

  const cssVars = MESSAGE_CSS_VARS.myspace || {}

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: '#336699',
        ...cssVars as React.CSSProperties,
      }}
    >
      {/* Header */}
      <div
        className="h-11 px-3 flex items-center gap-2 shrink-0"
        style={{
          background: 'linear-gradient(180deg, #003366 0%, #336699 100%)',
          borderBottom: '2px solid #FF6600',
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-white/80 text-sm font-medium hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded bg-white/20 flex items-center justify-center text-sm font-medium text-white">
            {participantAvatar || participantName[0]}
          </div>
          <span className="font-bold text-white">{participantName}</span>
        </div>

        <div className="w-12" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ background: 'white' }}>
        <div className="p-3">
          <MessageThreadComponent
            messages={messages}
            config={MYSPACE_CONFIG}
          />

          {/* Typing indicator */}
          {typingParticipant && (
            <div className="flex items-center gap-2 py-2 px-3 text-sm text-[#666]">
              <TypingIndicator
                users={[{ id: typingParticipant.id, name: typingParticipant.name }]}
                variant="text"
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="px-3 py-2 flex items-center gap-2 shrink-0"
        style={{ background: '#eee', borderTop: '1px solid #ccc' }}
      >
        <textarea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 rounded text-sm outline-none resize-none"
          style={{ background: 'white', border: '1px solid #ccc', color: '#333' }}
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          className="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40"
          style={{ background: '#FF6600', color: 'white' }}
        >
          Send
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
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default MySpaceChatApp
