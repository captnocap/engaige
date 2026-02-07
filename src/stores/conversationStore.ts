/**
 * Conversation Store
 *
 * Manages conversations and messages across all messaging platforms.
 * Syncs with server via WebSocket for real-time updates.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MessageData } from '../components/ui/Message'
import { useWSStore } from './wsStore.js'
import { useNPCStore } from './npcStore.js'

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
        return get().messages[conversationId] || []
      },

      sendMessage: async (conversationId, content) => {
        if (!content.trim()) return

        set({ isSending: true })

        const newMessage: MessageData = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          author: { id: 'player', name: 'You' },
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
        const ts = newMessage.timestamp as string
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: {
                    id: newMessage.id,
                    content: newMessage.content,
                    timestamp: ts,
                    senderId: 'player',
                  },
                  updatedAt: ts,
                }
              : c
          )
        }))

        // Send via WebSocket
        const ws = useWSStore.getState()
        if (ws.connected) {
          try {
            await ws.request('message:send', {
              conversationId,
              content: content.trim(),
              clientMessageId: newMessage.id,
            })
          } catch {
            console.warn('[Conversation] WS send failed, marking as failed')
            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: state.messages[conversationId]?.map(m =>
                  m.id === newMessage.id ? { ...m, status: 'sent' } : m
                ) || []
              }
            }))
          }
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

        // Look up participants from the NPC store
        const npcStore = useNPCStore.getState()
        const participants: ConversationParticipant[] = []
        for (const pid of participantIds) {
          const npc = npcStore.getNPC(pid)
          if (npc) {
            participants.push({ id: npc.id, name: npc.name, avatar: npc.avatar, isOnline: npcStore.isNPCOnline(pid) })
          }
        }

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
            console.warn('[Conversation] Server fetch failed, store will remain empty')
          }
        }

        // No server data available -- store stays empty
        set({ isLoading: false })
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
      version: 2,
      migrate: () => ({ conversations: [], messages: {} }),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<ConversationState> | undefined
        return {
          ...current,
          ...p,
          // Guard: persisted conversations may not be an array (corrupt localStorage)
          conversations: Array.isArray(p?.conversations) ? p.conversations : current.conversations,
          messages: p?.messages && typeof p.messages === 'object' && !Array.isArray(p.messages) ? p.messages : current.messages,
        }
      },
    }
  )
)

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
