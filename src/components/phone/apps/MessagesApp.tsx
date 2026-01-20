/**
 * Messages App (iMessage clone)
 *
 * Phone-only messaging app for close friends.
 * Uses bubble message variant.
 */

import { useState } from 'react'
import type { AppProps } from '../PhoneAppContainer.js'

// Placeholder until we wire up real conversations
interface Conversation {
  id: string
  npcId: string
  npcName: string
  npcAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

// Mock data for now
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    npcId: 'npc_1',
    npcName: 'Sarah',
    lastMessage: 'Hey! How are you doing?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
  },
  {
    id: '2',
    npcId: 'npc_2',
    npcName: 'Jake',
    lastMessage: 'Did you see that game last night?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
    unreadCount: 0,
  },
]

export function MessagesApp({ onBack }: AppProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)

  if (selectedConversation) {
    const convo = conversations.find(c => c.id === selectedConversation)
    return (
      <MessageThread
        conversation={convo!}
        onBack={() => setSelectedConversation(null)}
      />
    )
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
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-8">
            <span className="text-4xl">💬</span>
            <p className="text-center" style={{ color: 'var(--color-textMuted)' }}>
              No messages yet. Your close friends will appear here.
            </p>
          </div>
        ) : (
          conversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => setSelectedConversation(convo.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bgSecondary)] transition-colors"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-medium"
                style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
              >
                {convo.npcAvatar || convo.npcName[0]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {convo.npcName}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                    {formatRelativeTime(convo.lastMessageTime)}
                  </span>
                </div>
                <p
                  className="text-sm truncate"
                  style={{ color: convo.unreadCount > 0 ? 'var(--color-text)' : 'var(--color-textMuted)' }}
                >
                  {convo.lastMessage}
                </p>
              </div>

              {/* Unread Badge */}
              {convo.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-[#007AFF] text-white text-xs flex items-center justify-center">
                  {convo.unreadCount}
                </div>
              )}

              {/* Chevron */}
              <svg className="w-4 h-4" style={{ color: 'var(--color-textMuted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

interface MessageThreadProps {
  conversation: Conversation
  onBack: () => void
}

function MessageThread({ conversation, onBack }: MessageThreadProps) {
  const [message, setMessage] = useState('')

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="h-11 px-2 flex items-center gap-2"
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
            {conversation.npcName[0]}
          </div>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {conversation.npcName}
          </span>
        </div>

        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {/* Placeholder messages */}
        <div className="flex justify-start">
          <div
            className="max-w-[75%] px-4 py-2 rounded-[20px] rounded-bl-[4px]"
            style={{ background: '#E5E5EA', color: '#000' }}
          >
            {conversation.lastMessage}
          </div>
        </div>
        <div className="flex justify-end">
          <div
            className="max-w-[75%] px-4 py-2 rounded-[20px] rounded-br-[4px]"
            style={{ background: '#007AFF', color: '#fff' }}
          >
            Hey! I'm good, thanks for asking
          </div>
        </div>
      </div>

      {/* Input */}
      <div
        className="px-3 py-2 flex items-center gap-2"
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
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="iMessage"
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        <button
          disabled={!message.trim()}
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
