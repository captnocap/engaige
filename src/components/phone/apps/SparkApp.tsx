/**
 * SparkApp - Tinder Clone Dating App
 *
 * Full dating app experience on the phone surface.
 * Uses swipe cards interface with match celebrations.
 */

import { useState, useEffect, useRef } from 'react'
import { SwipeInterface } from '../../dating/SwipeInterface.js'
import { MatchModal } from '../../dating/MatchModal.js'
import { DatingCard } from '../../dating/DatingCard.js'
import { getDatingSite } from '../../../config/dating-registry.js'
import { useDatingStore, usePendingCelebration, useMatches } from '../../../stores/datingStore.js'
import { useNPCStore, useNPCsOnDatingSite } from '../../../stores/npcStore.js'
import {
  useConversationStore,
  useConversationMessages,
  useTypingIndicator,
} from '../../../stores/conversationStore.js'
import {
  MessageThread as MessageThreadComponent,
  TypingIndicator,
  type MessageStyleConfig,
} from '../../ui/Message'
import type { DatingMatch } from '../../../stores/datingStore.js'
import type { NPC, NPCDatingProfile } from '../../../stores/npcStore.js'
import type { DatingSiteDefinition } from '../../../config/dating-registry.js'

// Spark chat style - bubble style like iMessage but with Spark's colors
const SPARK_CHAT_CONFIG: MessageStyleConfig = {
  variant: 'bubble',
  layout: 'stacked',
  alignment: 'sides',
  showAvatar: true,
  showTimestamp: true,
  showStatus: true,
  showReadReceipts: true,
  showReactions: true,
  showUsername: false,
  groupByTime: true,
  groupTimeWindow: 5 * 60 * 1000,
  avatarSize: 'sm',
  timestampFormat: 'relative',
  currentUserId: 'player',
}

type SparkTab = 'discover' | 'matches' | 'profile'

const SITE_ID = 'spark'
const site = getDatingSite(SITE_ID)!

export function SparkApp() {
  const [currentTab, setCurrentTab] = useState<SparkTab>('discover')
  const [selectedMatchNpcId, setSelectedMatchNpcId] = useState<string | null>(null)
  const [chatConversationId, setChatConversationId] = useState<string | null>(null)

  // Get NPCs on Spark
  const npcsOnSpark = useNPCsOnDatingSite(SITE_ID)
  const { initialize: initNPCs, getDatingProfile, getNPC } = useNPCStore()
  const {
    swipeRight,
    swipeLeft,
    superLike,
    hasSwipedOn,
    clearPendingCelebration,
    markMatchAsMessaged,
    getMatch,
    initialize: initDating,
  } = useDatingStore()
  const { createConversation } = useConversationStore()
  const pendingCelebration = usePendingCelebration()
  const matches = useMatches(SITE_ID)

  useEffect(() => {
    initNPCs()
    initDating()
  }, [initNPCs, initDating])

  // Filter to NPCs we haven't swiped on yet
  const unseenNPCs = npcsOnSpark.filter(npc => !hasSwipedOn(SITE_ID, npc.id))

  const handleSwipeRight = (npcId: string) => {
    swipeRight(SITE_ID, npcId)
  }

  const handleSwipeLeft = (npcId: string) => {
    swipeLeft(SITE_ID, npcId)
  }

  const handleSuperLike = (npcId: string) => {
    superLike(SITE_ID, npcId)
  }

  // Create or get conversation for a match
  const openChatWithMatch = async (npcId: string) => {
    const match = getMatch(SITE_ID, npcId)
    if (!match) return

    // If already has a conversation, open it
    if (match.conversationId) {
      setChatConversationId(match.conversationId)
      setSelectedMatchNpcId(npcId)
      return
    }

    // Create new conversation
    const conversationId = await createConversation('spark-chat', [npcId])
    markMatchAsMessaged(match.id, conversationId)
    setChatConversationId(conversationId)
    setSelectedMatchNpcId(npcId)
  }

  const handleSendMessage = async () => {
    if (pendingCelebration) {
      await openChatWithMatch(pendingCelebration.npcId)
    }
    clearPendingCelebration()
  }

  const handleKeepSwiping = () => {
    clearPendingCelebration()
  }

  const handleBackFromChat = () => {
    setChatConversationId(null)
    setSelectedMatchNpcId(null)
  }

  // Get NPC and profile for match celebration
  const celebrationNPC = pendingCelebration ? getNPC(pendingCelebration.npcId) : undefined
  const celebrationProfile = celebrationNPC ? getDatingProfile(celebrationNPC.id, SITE_ID) : undefined
  const chatNPC = selectedMatchNpcId ? getNPC(selectedMatchNpcId) : undefined

  // Show chat view if a conversation is active
  if (chatConversationId && chatNPC) {
    return (
      <SparkChatView
        conversationId={chatConversationId}
        npc={chatNPC}
        site={site}
        onBack={handleBackFromChat}
      />
    )
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: `linear-gradient(180deg, ${site.theme.gradientStart} 0%, ${site.theme.gradientEnd} 100%)`,
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          onClick={() => setCurrentTab('profile')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-xl">👤</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="text-2xl">🔥</span>
          <span
            className="text-xl font-bold"
            style={{ color: site.theme.textOnPrimary }}
          >
            spark
          </span>
        </div>

        <button
          onClick={() => setCurrentTab('matches')}
          className="w-10 h-10 rounded-full flex items-center justify-center relative"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-xl">💬</span>
          {matches.filter(m => m.isNew).length > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
              style={{
                background: '#ff4458',
                color: 'white',
              }}
            >
              {matches.filter(m => m.isNew).length}
            </span>
          )}
        </button>
      </header>

      {/* Tab Bar */}
      <div className="flex shrink-0 px-4 gap-2">
        {(['discover', 'matches'] as SparkTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              currentTab === tab
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {tab === 'discover' ? '🔥 Discover' : `💕 Matches (${matches.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-white rounded-t-3xl overflow-hidden">
        {currentTab === 'discover' && (
          <SwipeInterface
            npcs={unseenNPCs}
            getDatingProfile={(npcId) => getDatingProfile(npcId, SITE_ID)}
            site={site}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSuperLike={handleSuperLike}
          />
        )}

        {currentTab === 'matches' && (
          <MatchesView
            matches={matches}
            getNPC={getNPC}
            getDatingProfile={(npcId) => getDatingProfile(npcId, SITE_ID)}
            site={site}
            onSelectMatch={openChatWithMatch}
          />
        )}
      </div>

      {/* Match Celebration Modal */}
      {pendingCelebration && celebrationNPC && celebrationProfile && (
        <MatchModal
          npc={celebrationNPC}
          datingProfile={celebrationProfile}
          site={site}
          onSendMessage={handleSendMessage}
          onKeepSwiping={handleKeepSwiping}
        />
      )}
    </div>
  )
}

// ============================================================================
// Matches View
// ============================================================================

interface MatchesViewProps {
  matches: DatingMatch[]
  getNPC: (id: string) => NPC | undefined
  getDatingProfile: (npcId: string) => NPCDatingProfile | undefined
  site: DatingSiteDefinition
  onSelectMatch: (npcId: string) => void
}

function MatchesView({ matches, getNPC, getDatingProfile, site, onSelectMatch }: MatchesViewProps) {
  // Separate new matches from conversations
  const newMatches = matches.filter(m => !m.hasMessaged)
  const conversations = matches.filter(m => m.hasMessaged)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* New Matches Section */}
      {newMatches.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 mb-3">
            New Matches
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {newMatches.map((match) => {
              const npc = getNPC(match.npcId)
              const profile = getDatingProfile(match.npcId)
              if (!npc || !profile) return null

              return (
                <button
                  key={match.id}
                  onClick={() => onSelectMatch(match.npcId)}
                  className="shrink-0 flex flex-col items-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl ring-2 mb-1"
                    style={{
                      background: '#f5f5f5',
                      ringColor: match.isNew ? site.theme.primaryColor : '#ddd',
                    }}
                  >
                    {profile.photos[0] || npc.avatar}
                  </div>
                  <span className="text-xs font-medium text-gray-700 truncate w-16 text-center">
                    {npc.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-500 mb-3">
          Messages
        </h3>

        {conversations.length === 0 && newMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-400 text-sm">
              No matches yet. Keep swiping!
            </p>
          </div>
        )}

        {conversations.length === 0 && newMatches.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              Start a conversation with your matches!
            </p>
          </div>
        )}

        {/* Conversation list would go here */}
        {conversations.map((match) => {
          const npc = getNPC(match.npcId)
          const profile = getDatingProfile(match.npcId)
          if (!npc || !profile) return null

          return (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match.npcId)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-gray-100">
                {profile.photos[0] || npc.avatar}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-gray-900">{npc.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  Tap to start chatting...
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(match.matchedAt).toLocaleDateString()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// Spark Chat View - In-app messaging with matches
// ============================================================================

interface SparkChatViewProps {
  conversationId: string
  npc: NPC
  site: DatingSiteDefinition
  onBack: () => void
}

function SparkChatView({ conversationId, npc, site, onBack }: SparkChatViewProps) {
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          background: `linear-gradient(180deg, ${site.theme.gradientStart} 0%, ${site.theme.gradientEnd} 100%)`,
        }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          ←
        </button>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
          {npc.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white truncate">{npc.name}</h2>
          <p className="text-xs text-white/70">Matched on Spark 🔥</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">{npc.avatar}</div>
            <p className="text-gray-500 text-sm mb-1">You matched with {npc.name}!</p>
            <p className="text-gray-400 text-xs">Send a message to break the ice 🔥</p>
          </div>
        ) : (
          <MessageThreadComponent
            messages={messages}
            config={SPARK_CHAT_CONFIG}
          />
        )}

        {typingParticipant && (
          <div className="text-sm text-gray-500 py-2">
            <TypingIndicator
              users={[{ id: typingParticipant.id, name: typingParticipant.name }]}
              variant="dots"
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${npc.name}...`}
            className="flex-1 px-4 py-2 rounded-full text-sm outline-none"
            style={{ background: '#f5f5f5', border: '1px solid #eee' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-40"
            style={{ background: site.theme.primaryColor }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default SparkApp
