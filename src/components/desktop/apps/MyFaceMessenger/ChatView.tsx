/**
 * ChatView
 *
 * Two-column conversation view: message thread on the left (60%),
 * NPC profile panel on the right (40%). Reuses existing MessageThread,
 * TypingIndicator, and conversation store infrastructure.
 */

import { useState, useEffect, useRef } from 'react'
import {
  useConversationStore,
  useConversations,
  useConversationMessages,
  useTypingIndicator,
} from '../../../../stores/conversationStore.js'
import { useNPC } from '../../../../stores/npcStore.js'
import {
  MessageThread,
  TypingIndicator,
  MESSAGE_CSS_VARS,
} from '../../../ui/Message'
import { MessengerProfilePanel } from './MessengerProfilePanel.js'
import { MYFACE_COLORS, MESSENGER_MESSAGE_CONFIG } from './constants.js'

interface ChatViewProps {
  npcId: string
  onBack: () => void
}

export function ChatView({ npcId, onBack }: ChatViewProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const npc = useNPC(npcId)
  const allConversations = useConversations('myspace')
  const { initialize, sendMessage, isSending, setActiveConversation } = useConversationStore()

  // Find conversation with this NPC on myspace platform
  const conversation = allConversations.find(c =>
    c.participants.some(p => p.id === npcId)
  )
  const conversationId = conversation?.id ?? null

  const messages = useConversationMessages(conversationId)
  const typingParticipant = useTypingIndicator(conversationId)

  // Ensure conversations are loaded
  useEffect(() => {
    initialize()
  }, [initialize])

  // Set active conversation for read receipts / clearing unreads
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId)
    }
    return () => setActiveConversation(null)
  }, [conversationId, setActiveConversation])

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, typingParticipant])

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !conversationId) return
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
    <div className="h-full flex" style={cssVars as React.CSSProperties}>
      {/* Left side: conversation (60%) */}
      <div className="flex-[3] flex flex-col min-w-0">
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 shrink-0"
          style={{ background: MYFACE_COLORS.primary }}
        >
          <button
            onClick={onBack}
            className="text-white/80 hover:text-white text-sm cursor-pointer"
          >
            ← Back
          </button>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/20">
            {npc?.avatar || '?'}
          </div>
          <span className="text-white font-bold text-sm truncate">
            {npc?.name || 'Unknown'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3" style={{ background: MYFACE_COLORS.bg }}>
          {conversationId ? (
            <>
              <MessageThread
                messages={messages}
                config={MESSENGER_MESSAGE_CONFIG}
              />

              {typingParticipant && (
                <div className="text-sm py-2" style={{ color: MYFACE_COLORS.textMuted }}>
                  <TypingIndicator
                    users={[{ id: typingParticipant.id, name: typingParticipant.name }]}
                    variant="text"
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: MYFACE_COLORS.textMuted }}>
              No conversation yet. Send a message to start chatting!
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-2 shrink-0" style={{ borderTop: `1px solid ${MYFACE_COLORS.borderLight}` }}>
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${npc?.name || ''}...`}
              className="flex-1 px-3 py-1.5 rounded text-sm outline-none resize-none"
              style={{
                background: MYFACE_COLORS.bgSecondary,
                border: `1px solid ${MYFACE_COLORS.borderLight}`,
                color: MYFACE_COLORS.text,
              }}
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending || !conversationId}
              className="self-end px-3 py-1.5 rounded text-white text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: MYFACE_COLORS.accent }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right side: profile panel (40%) */}
      <div className="flex-[2] min-w-0">
        <MessengerProfilePanel npcId={npcId} />
      </div>
    </div>
  )
}
