/**
 * Conversation Store
 *
 * Manages conversations and messages across all messaging platforms.
 * Syncs with server via WebSocket for real-time updates.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MessageData, MessageAuthor } from '../components/ui/Message'
import { useWSStore } from './wsStore.js'

// ============================================================================
// Types
// ============================================================================

export interface Conversation {
  id: string
  platform: 'messages' | 'myspace' | 'chirp' | 'instasnap' | 'lovelink'
  participants: ConversationParticipant[]
  lastMessage?: MessagePreview
  unreadCount: number
  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean
  createdAt: string
  updatedAt: string
}

export interface ConversationParticipant {
  id: string
  name: string
  avatar?: string
  isOnline?: boolean
  isTyping?: boolean
}

export interface MessagePreview {
  id: string
  content: string
  timestamp: string
  senderId: string
}

// WebSocket message types
interface WSNewMessage {
  conversationId: string
  message: MessageData
}

interface WSTypingIndicator {
  conversationId: string
  npcId: string
  isTyping: boolean
}

interface WSMessageStatusUpdate {
  conversationId: string
  messageId: string
  status: 'sent' | 'delivered' | 'read'
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PLAYER: MessageAuthor = {
  id: 'player',
  name: 'You',
  avatar: undefined,
}

const MOCK_NPCS: ConversationParticipant[] = [
  { id: 'npc_sarah', name: 'Sarah', avatar: '👧', isOnline: true },
  { id: 'npc_jake', name: 'Jake', avatar: '🧑', isOnline: false },
  { id: 'npc_emily', name: 'Emily', avatar: '👩', isOnline: true },
  { id: 'npc_marcus', name: 'Marcus', avatar: '👨', isOnline: false },
  { id: 'npc_luna', name: 'Luna', avatar: '👩‍🎤', isOnline: true },
]

function createMockConversations(): Conversation[] {
  return MOCK_NPCS.map((npc, i) => ({
    id: `conv_${npc.id}`,
    platform: 'messages' as const,
    participants: [npc],
    lastMessage: {
      id: `msg_last_${i}`,
      content: getRandomLastMessage(i),
      timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      senderId: i % 2 === 0 ? npc.id : 'player',
    },
    unreadCount: i % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
    isPinned: i === 0,
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
  }))
}

function getRandomLastMessage(seed: number): string {
  const messages = [
    'Hey! How are you doing?',
    'That sounds great!',
    'Let me know what you think',
    'haha yeah totally',
    'See you later!',
  ]
  return messages[seed % messages.length]
}

function createMockMessages(conversationId: string): MessageData[] {
  const npcId = conversationId.replace('conv_', '')
  const npc = MOCK_NPCS.find(n => n.id === npcId) || MOCK_NPCS[0]

  const messages: MessageData[] = []
  const now = Date.now()

  // Generate a conversation history
  const exchanges = [
    { sender: npc.id, content: `Hey there! 👋` },
    { sender: 'player', content: `Hi ${npc.name}! How's it going?` },
    { sender: npc.id, content: `Pretty good! Just been busy with work lately. You?` },
    { sender: 'player', content: `Same here. Been trying to find time to relax.` },
    { sender: npc.id, content: `I feel that. We should hang out sometime!` },
    { sender: 'player', content: `Definitely! What did you have in mind?` },
    { sender: npc.id, content: `Maybe grab coffee this weekend? ☕` },
    { sender: 'player', content: `That sounds perfect. Saturday work for you?` },
    { sender: npc.id, content: `Saturday is great! Let's do it 😊` },
  ]

  exchanges.forEach((exchange, i) => {
    const isOwn = exchange.sender === 'player'
    messages.push({
      id: `msg_${conversationId}_${i}`,
      author: isOwn ? MOCK_PLAYER : {
        id: npc.id,
        name: npc.name,
        avatar: npc.avatar,
        isOnline: npc.isOnline,
      },
      content: exchange.content,
      timestamp: new Date(now - (exchanges.length - i) * 5 * 60 * 1000).toISOString(),
      status: isOwn ? 'read' : undefined,
    })
  })

  return messages
}

// ============================================================================
// Store State
// ============================================================================

interface ConversationState {
  // Data
  conversations: Conversation[]
  messages: Record<string, MessageData[]> // conversationId -> messages
  activeConversationId: string | null

  // UI State
  isLoading: boolean
  isSending: boolean
  typingNpcs: Record<string, boolean> // npcId -> isTyping

  // WebSocket state
  wsSubscribed: boolean

  // Actions
  setActiveConversation: (id: string | null) => void
  getConversation: (id: string) => Conversation | undefined
  getMessages: (conversationId: string) => MessageData[]

  // Message actions
  sendMessage: (conversationId: string, content: string) => Promise<void>
  markAsRead: (conversationId: string) => void

  // Conversation actions
  createConversation: (platform: Conversation['platform'], participantIds: string[]) => Promise<string>
  archiveConversation: (id: string) => void
  pinConversation: (id: string) => void
  muteConversation: (id: string) => void

  // Real-time updates
  handleIncomingMessage: (conversationId: string, message: MessageData) => void
  handleTypingIndicator: (conversationId: string, npcId: string, isTyping: boolean) => void
  handleMessageStatusUpdate: (conversationId: string, messageId: string, status: 'sent' | 'delivered' | 'read') => void

  // Initialization
  initialize: () => Promise<void>
  setupWSSubscriptions: () => () => void
}

// ============================================================================
// Store
// ============================================================================

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      isLoading: false,
      isSending: false,
      typingNpcs: {},
      wsSubscribed: false,

      setActiveConversation: (id) => {
        set({ activeConversationId: id })
        if (id) {
          get().markAsRead(id)

          // Notify server of active conversation (for read receipts)
          const ws = useWSStore.getState()
          if (ws.connected) {
            ws.send('conversation:active', { conversationId: id })
          }
        }
      },

      getConversation: (id) => {
        return get().conversations.find(c => c.id === id)
      },

      getMessages: (conversationId) => {
        const { messages } = get()

        // Return existing messages or generate mock ones
        // Note: Don't call set() here - it causes "Cannot update while rendering" errors
        // Mock messages are regenerated each call, but that's fine for demo data
        if (!messages[conversationId]) {
          return createMockMessages(conversationId)
        }

        return messages[conversationId] || []
      },

      sendMessage: async (conversationId, content) => {
        if (!content.trim()) return

        set({ isSending: true })

        const newMessage: MessageData = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          author: MOCK_PLAYER,
          content: content.trim(),
          timestamp: new Date().toISOString(),
          status: 'sending',
        }

        // Optimistically add message
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), newMessage]
          }
        }))

        // Update conversation's last message
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: {
                    id: newMessage.id,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                    senderId: 'player',
                  },
                  updatedAt: newMessage.timestamp,
                }
              : c
          )
        }))

        // Try to send via WebSocket
        const ws = useWSStore.getState()
        if (ws.connected) {
          try {
            await ws.request('message:send', {
              conversationId,
              content: content.trim(),
              clientMessageId: newMessage.id,
            })
            // Server will send back status updates via WS
          } catch {
            // If WS fails, fall back to local simulation
            console.warn('[Conversation] WS send failed, using local simulation')
            await simulateMessageSend(conversationId, newMessage.id, get, set)
          }
        } else {
          // No WS connection, use local simulation
          await simulateMessageSend(conversationId, newMessage.id, get, set)
        }

        set({ isSending: false })
      },

      markAsRead: (conversationId) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        }))

        // Notify server
        const ws = useWSStore.getState()
        if (ws.connected) {
          ws.send('conversation:markRead', { conversationId })
        }
      },

      createConversation: async (platform, participantIds) => {
        const id = `conv_${Date.now()}`

        // For now, use mock participants
        const participants = MOCK_NPCS.filter(n => participantIds.includes(n.id))

        const newConversation: Conversation = {
          id,
          platform,
          participants,
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set(state => ({
          conversations: [newConversation, ...state.conversations]
        }))

        return id
      },

      archiveConversation: (id) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, isArchived: !c.isArchived } : c
          )
        }))
      },

      pinConversation: (id) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, isPinned: !c.isPinned } : c
          )
        }))
      },

      muteConversation: (id) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, isMuted: !c.isMuted } : c
          )
        }))
      },

      handleIncomingMessage: (conversationId, message) => {
        set(state => {
          const isActive = state.activeConversationId === conversationId

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...(state.messages[conversationId] || []), message]
            },
            conversations: state.conversations.map(c =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessage: {
                      id: message.id,
                      content: message.content,
                      timestamp: message.timestamp as string,
                      senderId: message.author.id,
                    },
                    updatedAt: message.timestamp as string,
                    unreadCount: isActive ? 0 : c.unreadCount + 1,
                  }
                : c
            )
          }
        })
      },

      handleTypingIndicator: (conversationId, npcId, isTyping) => {
        set(state => ({
          typingNpcs: { ...state.typingNpcs, [npcId]: isTyping }
        }))
      },

      handleMessageStatusUpdate: (conversationId, messageId, status) => {
        set(state => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId]?.map(m =>
              m.id === messageId ? { ...m, status } : m
            ) || []
          }
        }))
      },

      initialize: async () => {
        const { wsSubscribed } = get()

        // Set up WebSocket subscriptions if not already done
        if (!wsSubscribed) {
          get().setupWSSubscriptions()
        }

        set({ isLoading: true })

        // Try to fetch from server via WebSocket
        const ws = useWSStore.getState()
        if (ws.connected) {
          try {
            const conversations = await ws.request<void, Conversation[]>('conversations:list')
            if (Array.isArray(conversations)) {
              set({ conversations, isLoading: false })
              return
            }
          } catch {
            console.warn('[Conversation] Failed to fetch from server, using mock data')
          }
        }

        // Fall back to mock data
        const mockConversations = createMockConversations()
        set({
          conversations: mockConversations,
          isLoading: false,
        })
      },

      setupWSSubscriptions: () => {
        const ws = useWSStore.getState()

        // Subscribe to new messages
        const unsubMessage = ws.subscribe('message:new', (msg) => {
          const payload = msg.payload as WSNewMessage
          get().handleIncomingMessage(payload.conversationId, payload.message)
        })

        // Subscribe to typing indicators
        const unsubTyping = ws.subscribe('typing:update', (msg) => {
          const payload = msg.payload as WSTypingIndicator
          get().handleTypingIndicator(payload.conversationId, payload.npcId, payload.isTyping)
        })

        // Subscribe to message status updates
        const unsubStatus = ws.subscribe('message:status', (msg) => {
          const payload = msg.payload as WSMessageStatusUpdate
          get().handleMessageStatusUpdate(payload.conversationId, payload.messageId, payload.status)
        })

        // Subscribe to conversation updates (new conversation, etc.)
        const unsubConversation = ws.subscribe('conversation:update', (msg) => {
          const conversation = msg.payload as Conversation
          set(state => ({
            conversations: state.conversations.map(c =>
              c.id === conversation.id ? conversation : c
            )
          }))
        })

        set({ wsSubscribed: true })

        // Return cleanup function
        return () => {
          unsubMessage()
          unsubTyping()
          unsubStatus()
          unsubConversation()
          set({ wsSubscribed: false })
        }
      },
    }),
    {
      name: 'engaige-conversations',
      partialize: (state) => ({
        // Only persist essential data, not UI state
        conversations: state.conversations,
        messages: state.messages,
      }),
    }
  )
)

// ============================================================================
// Helper: Simulate message send (used when WS is not available)
// ============================================================================

async function simulateMessageSend(
  conversationId: string,
  messageId: string,
  get: () => ConversationState,
  set: (partial: Partial<ConversationState> | ((state: ConversationState) => Partial<ConversationState>)) => void
) {
  // Simulate send delay and mark as sent
  await new Promise(resolve => setTimeout(resolve, 300))

  set(state => ({
    messages: {
      ...state.messages,
      [conversationId]: state.messages[conversationId]?.map(m =>
        m.id === messageId ? { ...m, status: 'sent' } : m
      ) || []
    }
  }))

  // Simulate delivery
  await new Promise(resolve => setTimeout(resolve, 500))

  set(state => ({
    messages: {
      ...state.messages,
      [conversationId]: state.messages[conversationId]?.map(m =>
        m.id === messageId ? { ...m, status: 'delivered' } : m
      ) || []
    }
  }))

  // Simulate NPC reading
  await new Promise(resolve => setTimeout(resolve, 1000))

  set(state => ({
    messages: {
      ...state.messages,
      [conversationId]: state.messages[conversationId]?.map(m =>
        m.id === messageId ? { ...m, status: 'read' } : m
      ) || []
    }
  }))

  // Simulate NPC response after a delay
  const conversation = get().conversations.find(c => c.id === conversationId)
  if (conversation) {
    // Show typing indicator
    const npc = conversation.participants[0]
    set(state => ({ typingNpcs: { ...state.typingNpcs, [npc.id]: true } }))

    // Simulate typing delay (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Hide typing indicator
    set(state => ({ typingNpcs: { ...state.typingNpcs, [npc.id]: false } }))

    // Add NPC response
    const responses = [
      'That\'s interesting!',
      'I see what you mean.',
      'Haha, right?',
      'Sounds good to me!',
      'Let me think about that...',
    ]

    const npcResponse: MessageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      author: {
        id: npc.id,
        name: npc.name,
        avatar: npc.avatar,
        isOnline: npc.isOnline,
      },
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date().toISOString(),
    }

    get().handleIncomingMessage(conversationId, npcResponse)
  }
}

// ============================================================================
// Selectors
// ============================================================================

// Guard: persisted state may have conversations as non-array (corrupt localStorage)
function ensureArray(conversations: unknown): Conversation[] {
  return Array.isArray(conversations) ? conversations : []
}

export function useConversations(platform?: Conversation['platform']) {
  const raw = useConversationStore(state => state.conversations)
  const conversations = ensureArray(raw)

  if (!platform) return conversations
  return conversations.filter(c => c.platform === platform && !c.isArchived)
}

export function useActiveConversation() {
  const activeId = useConversationStore(state => state.activeConversationId)
  const raw = useConversationStore(state => state.conversations)
  const conversations = ensureArray(raw)

  return activeId ? conversations.find(c => c.id === activeId) : null
}

export function useConversationMessages(conversationId: string | null) {
  const getMessages = useConversationStore(state => state.getMessages)

  if (!conversationId) return []
  return getMessages(conversationId)
}

export function useTypingIndicator(conversationId: string | null) {
  const typingNpcs = useConversationStore(state => state.typingNpcs)
  const raw = useConversationStore(state => state.conversations)
  const conversations = ensureArray(raw)

  if (!conversationId) return null

  const conversation = conversations.find(c => c.id === conversationId)
  if (!conversation) return null

  const typingParticipant = conversation.participants.find(p => typingNpcs[p.id])
  return typingParticipant || null
}

export function useTotalUnreadCount(platform?: Conversation['platform']) {
  const raw = useConversationStore(state => state.conversations)
  const conversations = ensureArray(raw)

  return conversations
    .filter(c => !platform || c.platform === platform)
    .reduce((sum, c) => sum + c.unreadCount, 0)
}

export default useConversationStore
