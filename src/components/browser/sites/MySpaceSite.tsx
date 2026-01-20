/**
 * MySpace Site
 *
 * The OG social network - early 2000s aesthetic.
 * Includes feed, profiles, and messaging.
 */

import { useState, useEffect, useRef } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
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

// MySpace style configuration for browser
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
  groupTimeWindow: 10 * 60 * 1000,
  avatarSize: 'md',
  timestampFormat: 'relative',
  currentUserId: 'player',
}

type MySpaceView = 'home' | 'profile' | 'messages' | 'browse'

export function MySpaceSite({ siteId, onNavigate }: SiteProps) {
  const [currentView, setCurrentView] = useState<MySpaceView>(
    siteId === 'myspace-chat' ? 'messages' : 'home'
  )
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  return (
    <div className="min-h-full" style={{ background: '#336699' }}>
      {/* MySpace Header */}
      <header
        className="px-4 py-2"
        style={{
          background: 'linear-gradient(180deg, #003366 0%, #336699 100%)',
          borderBottom: '2px solid #FF6600',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
              My<span style={{ color: '#FF6600' }}>Space</span>
            </span>
            <span className="text-xs text-white/60">a place for friends</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {(['home', 'browse', 'messages'] as MySpaceView[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentView === view
                    ? 'bg-[#FF6600] text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">Hello, Player!</span>
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white text-sm">
              P
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-4 px-4">
        {currentView === 'home' && <MySpaceHome onViewProfile={setSelectedProfile} />}
        {currentView === 'browse' && <MySpaceBrowse onViewProfile={setSelectedProfile} />}
        {currentView === 'messages' && <MySpaceMessages />}
        {currentView === 'profile' && selectedProfile && (
          <MySpaceProfile npcId={selectedProfile} onBack={() => setCurrentView('home')} />
        )}
      </main>
    </div>
  )
}

function MySpaceHome({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left Column - User Info */}
      <div className="space-y-4">
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="font-bold text-[#003366]">Player</h2>
              <p className="text-xs text-gray-500">"Living my best life!"</p>
            </div>
          </div>
          <div className="text-xs space-y-1 text-gray-600">
            <p><strong>Mood:</strong> 😊 happy</p>
            <p><strong>Online Now!</strong></p>
          </div>
        </div>

        {/* Top 8 */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">
            Player's Top 8
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => onViewProfile(`npc_${i}`)}
              >
                +
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Column - Feed */}
      <div className="col-span-2 space-y-4">
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-3 pb-2 border-b border-gray-200">
            Bulletin Board
          </h3>

          {/* Mock posts */}
          {[
            { name: 'Sarah', content: 'just got new pics up!! check my profile 📸', time: '5 mins ago' },
            { name: 'Jake', content: 'who wants to hang out this weekend??', time: '23 mins ago' },
            { name: 'Emily', content: 'new song on my profile. tell me what u think!', time: '1 hour ago' },
          ].map((post, i) => (
            <div key={i} className="py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-sm shrink-0">
                  {post.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#003366] text-sm hover:underline cursor-pointer">
                      {post.name}
                    </span>
                    <span className="text-xs text-gray-400">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{post.content}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <button className="text-[#003366] hover:underline">Comment</button>
                    <button className="text-[#003366] hover:underline">Kudos</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post something */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">Post a Bulletin</h3>
          <textarea
            placeholder="What's on your mind?"
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-4 py-1 text-sm font-medium text-white rounded"
              style={{ background: '#FF6600' }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MySpaceBrowse({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  return (
    <div
      className="p-4 rounded"
      style={{ background: 'white', border: '1px solid #ccc' }}
    >
      <h3 className="font-bold text-[#003366] mb-4">Browse People</h3>
      <p className="text-gray-500 text-sm">
        Search and browse NPCs coming soon...
      </p>
    </div>
  )
}

function MySpaceMessages() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const allConversations = useConversations()
  const { initialize, isLoading, sendMessage, isSending, setActiveConversation } = useConversationStore()
  const messages = useConversationMessages(selectedConversationId)
  const typingParticipant = useTypingIndicator(selectedConversationId)

  const selectedConversation = selectedConversationId
    ? allConversations.find(c => c.id === selectedConversationId)
    : null

  useEffect(() => {
    if (allConversations.length === 0) {
      initialize()
    }
  }, [initialize, allConversations.length])

  useEffect(() => {
    if (selectedConversationId) {
      setActiveConversation(selectedConversationId)
    }
    return () => setActiveConversation(null)
  }, [selectedConversationId, setActiveConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typingParticipant])

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !selectedConversationId) return
    const content = inputValue
    setInputValue('')
    await sendMessage(selectedConversationId, content)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const sortedConversations = [...allConversations].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  const cssVars = MESSAGE_CSS_VARS.myspace || {}

  return (
    <div className="grid grid-cols-3 gap-4" style={cssVars as React.CSSProperties}>
      {/* Conversation list */}
      <div
        className="p-4 rounded"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <h3 className="font-bold text-[#003366] mb-3 pb-2 border-b border-gray-200">
          Inbox
        </h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-1">
            {sortedConversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversationId(convo.id)}
                className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors ${
                  selectedConversationId === convo.id
                    ? 'bg-[#003366]/10'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-sm text-[#003366]">
                  {convo.participants[0]?.avatar || convo.participants[0]?.name[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-[#003366] truncate">
                      {convo.participants[0]?.name || 'Unknown'}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FF6600] text-white text-[10px] flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message thread */}
      <div
        className="col-span-2 rounded flex flex-col"
        style={{ background: 'white', border: '1px solid #ccc', minHeight: '400px' }}
      >
        {selectedConversation ? (
          <>
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-bold text-[#003366]">
                {selectedConversation.participants[0]?.name || 'Unknown'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <MessageThreadComponent
                messages={messages}
                config={MYSPACE_CONFIG}
              />

              {typingParticipant && (
                <div className="text-sm text-gray-500 py-2">
                  <TypingIndicator
                    users={[{ id: typingParticipant.id, name: typingParticipant.name }]}
                    variant="text"
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message..."
                  className="flex-1 px-3 py-2 rounded text-sm outline-none resize-none"
                  style={{ background: '#f5f5f5', border: '1px solid #ccc', color: '#333' }}
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending}
                  className="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 self-end"
                  style={{ background: '#FF6600', color: 'white' }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-[#003366] p-4 pb-2 border-b border-gray-200">
              Conversation
            </h3>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to start chatting
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MySpaceProfile({ npcId, onBack }: { npcId: string; onBack: () => void }) {
  return (
    <div
      className="p-4 rounded"
      style={{ background: 'white', border: '1px solid #ccc' }}
    >
      <button
        onClick={onBack}
        className="text-[#003366] hover:underline text-sm mb-4"
      >
        ← Back to Home
      </button>
      <h3 className="font-bold text-[#003366] mb-4">Profile: {npcId}</h3>
      <p className="text-gray-500 text-sm">
        Profile view coming soon...
      </p>
    </div>
  )
}

export default MySpaceSite
