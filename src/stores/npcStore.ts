/**
 * NPC Store
 *
 * Central store for all NPC data, relationships, and app access.
 * NPCs are the characters the player interacts with across all platforms.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { type AccessLevel, canContactViaApp, getAppsForAccessLevel } from '../config/app-registry.js'
import { useWSStore } from './wsStore.js'

// ============================================================================
// Types
// ============================================================================

export type RelationshipLevel =
  | 'stranger'           // Never interacted
  | 'acquaintance'       // Brief interaction, knows of player
  | 'friend'             // Regular friend, frequent interaction
  | 'close_friend'       // Inner circle, high trust
  | 'best_friend'        // Closest friend, shares secrets
  | 'romantic_interest'  // Romantic interest (server-authoritative)
  | 'partner'            // Committed partner (server-authoritative)

export interface NPCPersonality {
  // Core traits (0-100 scale)
  openness: number       // Curious vs traditional
  conscientiousness: number // Organized vs spontaneous
  extraversion: number   // Outgoing vs reserved
  agreeableness: number  // Friendly vs challenging
  neuroticism: number    // Emotional vs stable

  // Communication style
  verbosity: 'short' | 'medium' | 'long'
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy'
  formality: 'casual' | 'normal' | 'formal'
  sarcasm: 'none' | 'light' | 'heavy'
  typos: boolean
  slang: boolean
  allCaps: boolean
}

export interface NPCAppPresence {
  appId: string
  username: string
  isActive: boolean
  joinedAt: string
}

// Dating profile for a specific dating site
export interface NPCDatingProfile {
  siteId: string
  bio: string                    // Site-specific bio (may differ from main bio)
  photos: string[]               // Photo URLs or emoji placeholders
  lookingFor: string             // What they're looking for
  dealbreakers?: string[]
  promptAnswers?: { prompt: string; answer: string }[]
  isActive: boolean
  lastActive: string
}

// NPC's relationship status (public-facing)
export type NPCRelationshipStatus =
  | 'single'
  | 'talking'           // Casually talking to someone
  | 'dating'            // In a relationship
  | 'exclusive'         // Exclusive but not official
  | 'engaged'
  | 'married'
  | 'its_complicated'
  | 'divorced'

export interface NPC {
  // Identity
  id: string
  name: string
  username: string
  avatar: string // Emoji or image URL
  age: number
  gender: 'male' | 'female' | 'non-binary' | 'other'
  pronouns: string

  // Profile
  bio: string
  occupation: string
  location: string
  interests: string[]
  music: string

  // Personality
  personality: NPCPersonality

  // Relationship with player
  relationship: {
    level: RelationshipLevel
    trust: number      // 0-100 - earned through meaningful conversations
    affinity: number   // 0-100 - how much they like player
    familiarity: number // 0-100 - how well they know player
    romanticInterest: boolean
    lastInteraction: string | null
    totalMessages: number
  }

  // App presence - which platforms this NPC uses
  apps: NPCAppPresence[]

  // Dating presence - profiles on dating sites
  datingProfiles: NPCDatingProfile[]

  // Public relationship status (what others see)
  relationshipStatus: NPCRelationshipStatus

  // Visual customization (for MyFace profiles, etc.)
  profileCustomization?: {
    backgroundColor: string
    textColor: string
    profileSong?: string
  }

  // Schedule (when NPC is typically active)
  activeHours: {
    start: number // 0-23
    end: number   // 0-23
    timezone: string
  }

  // Behavioral flags
  flags: {
    canInitiateConversations: boolean
    canPostFreely: boolean
    canSendImages: boolean
    isActiveHoursAware: boolean
  }

  // Metadata
  createdAt: string
  isGenerated: boolean // AI-generated or predefined
}

// ============================================================================
// Defaults & Mapping
// ============================================================================

const DEFAULT_PERSONALITY: NPCPersonality = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
  verbosity: 'medium',
  emojiUsage: 'moderate',
  formality: 'casual',
  sarcasm: 'light',
  typos: false,
  slang: true,
  allCaps: false,
}

/**
 * Map a server NPC (from npc:getAll) to the client NPC shape.
 * The server returns snake_case DB fields; the client expects camelCase with
 * nested sub-objects for personality, relationship, apps, etc.
 */
function serverToClientNPC(s: any): NPC {
  // Parse personality from personality_traits + communication_quirks
  const traits = s.personality_traits || {}
  const comms = s.communication_quirks || {}
  const flags = s.personality_flags || {}

  const verbosityMap: Record<string, NPCPersonality['verbosity']> = {
    terse: 'short', average: 'medium', verbose: 'long',
  }
  const emojiMap: Record<string, NPCPersonality['emojiUsage']> = {
    none: 'none', light: 'minimal', moderate: 'moderate', heavy: 'heavy',
  }
  const formalityMap: Record<string, NPCPersonality['formality']> = {
    casual: 'casual', neutral: 'normal', formal: 'formal',
  }

  const personality: NPCPersonality = {
    openness: Math.round((traits.openness ?? 0.5) * 100),
    conscientiousness: Math.round((traits.conscientiousness ?? 0.5) * 100),
    extraversion: Math.round((traits.warmth ?? 0.5) * 100), // warmth as proxy
    agreeableness: Math.round((traits.agreeableness ?? 0.5) * 100),
    neuroticism: Math.round((traits.neuroticism ?? 0.5) * 100),
    verbosity: verbosityMap[comms.verbosity] || 'medium',
    emojiUsage: emojiMap[comms.emoji_usage] || 'moderate',
    formality: formalityMap[comms.formality] || 'casual',
    sarcasm: flags.is_sarcastic ? 'heavy' : 'none',
    typos: false,
    slang: (comms.formality || 'casual') === 'casual',
    allCaps: false,
  }

  // Build app presence from social_media_handles
  const handles: Record<string, string> = s.social_media_handles || {}
  const joinedAt = s.created_at
    ? new Date(s.created_at * 1000).toISOString()
    : new Date().toISOString()

  const apps: NPCAppPresence[] = Object.entries(handles).map(([platform, handle]) => ({
    appId: platform,
    username: handle as string,
    isActive: true,
    joinedAt,
  }))
  // Ensure messages + myface-chat entries if they have myface
  if (handles.myface && !apps.some(a => a.appId === 'myface-chat')) {
    apps.push({ appId: 'myface-chat', username: handles.myface, isActive: true, joinedAt })
  }
  if (!apps.some(a => a.appId === 'messages')) {
    apps.push({ appId: 'messages', username: s.username, isActive: true, joinedAt })
  }

  // Parse active hours from behavior_flags (handles string "10-24", object {start,end}, or array)
  const bf = s.behavior_flags || {}
  let startHour = 8, endHour = 22
  const ah = bf.active_hours
  if (typeof ah === 'string') {
    const parts = ah.split('-').map(Number)
    startHour = parts[0] ?? 8
    endHour = parts[1] ?? 22
  } else if (typeof ah === 'object' && ah !== null) {
    startHour = ah.start ?? ah[0] ?? 8
    endHour = ah.end ?? ah[1] ?? 22
  }

  // Derive pronouns from gender
  const pronounsMap: Record<string, string> = {
    female: 'she/her', male: 'he/him', nonbinary: 'they/them',
  }

  return {
    id: s.id,
    name: s.display_name || s.username,
    username: s.username,
    avatar: s.avatar_url || '\u{1F464}',
    age: s.age || 25,
    gender: s.gender === 'nonbinary' ? 'non-binary' : (s.gender || 'other') as NPC['gender'],
    pronouns: pronounsMap[s.gender] || 'they/them',
    bio: s.bio || '',
    occupation: s.occupation || '',
    location: s.location || '',
    interests: s.interests || [],
    music: '',
    personality,
    relationship: createDefaultRelationship(),
    apps,
    datingProfiles: [],
    relationshipStatus: 'single',
    activeHours: {
      start: isNaN(startHour) ? 8 : startHour,
      end: isNaN(endHour) ? 22 : endHour,
      timezone: 'America/New_York',
    },
    flags: {
      canInitiateConversations: bf.can_initiate_conversations ?? true,
      canPostFreely: bf.is_enabled_to_post_freely ?? true,
      canSendImages: bf.can_send_images ?? false,
      isActiveHoursAware: true,
    },
    createdAt: joinedAt,
    isGenerated: false,
  }
}

// ============================================================================
// Store State
// ============================================================================

interface NPCState {
  // Data
  npcs: Record<string, NPC>

  // Actions
  initialize: () => Promise<void>
  getNPC: (id: string) => NPC | undefined
  getAllNPCs: () => NPC[]

  // Relationship management
  updateRelationship: (npcId: string, updates: Partial<NPC['relationship']>) => void
  incrementTrust: (npcId: string, amount: number) => void
  incrementAffinity: (npcId: string, amount: number) => void
  incrementFamiliarity: (npcId: string, amount: number) => void
  recordInteraction: (npcId: string) => void

  // App access
  canContactVia: (npcId: string, appId: string) => boolean
  getAccessibleApps: (npcId: string) => string[]
  getNPCsOnApp: (appId: string) => NPC[]

  // NPC presence
  getNPCByUsername: (appId: string, username: string) => NPC | undefined
  isNPCOnline: (npcId: string) => boolean

  // Dating helpers
  getNPCsOnDatingSite: (siteId: string) => NPC[]
  getDatingProfile: (npcId: string, siteId: string) => NPCDatingProfile | undefined
  updateRelationshipStatus: (npcId: string, status: NPCRelationshipStatus) => void

  // Server relationship sync
  subscribeToRelationshipUpdates: () => () => void
  loadRelationshipsFromServer: () => Promise<void>
}

// ============================================================================
// Helpers
// ============================================================================

function relationshipToAccessLevel(level: RelationshipLevel): AccessLevel {
  switch (level) {
    case 'stranger': return 'stranger'
    case 'acquaintance': return 'acquaintance'
    case 'friend': return 'friend'
    case 'close_friend':
    case 'best_friend': return 'close_friend'
    case 'romantic_interest':
    case 'partner': return 'partner'
  }
}

function createDefaultRelationship(): NPC['relationship'] {
  return {
    level: 'acquaintance', // Start as acquaintance for demo
    trust: 20,
    affinity: 25,
    familiarity: 20,
    romanticInterest: false,
    lastInteraction: null,
    totalMessages: 0,
  }
}

// ============================================================================
// Store
// ============================================================================

export const useNPCStore = create<NPCState>()(
  persist(
    (set, get) => ({
      npcs: {},

      initialize: async () => {
        const { npcs } = get()
        if (Object.keys(npcs).length > 0) return

        try {
          const { request, connected } = useWSStore.getState()
          if (!connected) return

          const serverNPCs = await request<any, any>('npc:getAll', {})
          const npcArray = Array.isArray(serverNPCs) ? serverNPCs : serverNPCs?.npcs || []
          if (npcArray.length > 0) {
            const clientNPCs: Record<string, NPC> = {}
            for (const sNPC of npcArray) {
              try {
                clientNPCs[sNPC.id] = serverToClientNPC(sNPC)
              } catch {
                console.warn('[NPC Store] Failed to map NPC:', sNPC.id)
              }
            }
            set({ npcs: clientNPCs })

            // Overlay real relationship data from server
            get().loadRelationshipsFromServer()
          }
        } catch (err) {
          console.warn('[NPC Store] Server fetch failed, store will remain empty:', err)
        }
      },

      getNPC: (id) => get().npcs[id],

      getAllNPCs: () => Object.values(get().npcs),

      updateRelationship: (npcId, updates) => {
        set(state => {
          const npc = state.npcs[npcId]
          if (!npc) return state

          const newRelationship = { ...npc.relationship, ...updates }

          return {
            npcs: {
              ...state.npcs,
              [npcId]: { ...npc, relationship: newRelationship }
            }
          }
        })
      },

      incrementTrust: (npcId, amount) => {
        const npc = get().npcs[npcId]
        if (!npc) return

        const newTrust = Math.min(100, Math.max(0, npc.relationship.trust + amount))
        get().updateRelationship(npcId, { trust: newTrust })
      },

      incrementAffinity: (npcId, amount) => {
        const npc = get().npcs[npcId]
        if (!npc) return

        const newAffinity = Math.min(100, Math.max(0, npc.relationship.affinity + amount))
        get().updateRelationship(npcId, { affinity: newAffinity })
      },

      incrementFamiliarity: (npcId, amount) => {
        const npc = get().npcs[npcId]
        if (!npc) return

        const newFamiliarity = Math.min(100, Math.max(0, npc.relationship.familiarity + amount))
        get().updateRelationship(npcId, { familiarity: newFamiliarity })
      },

      recordInteraction: (npcId) => {
        const npc = get().npcs[npcId]
        if (!npc) return

        get().updateRelationship(npcId, {
          lastInteraction: new Date().toISOString(),
          totalMessages: npc.relationship.totalMessages + 1,
        })

        // Small increments for each interaction
        get().incrementFamiliarity(npcId, 1)
        get().incrementAffinity(npcId, 0.5)
      },

      canContactVia: (npcId, appId) => {
        const npc = get().npcs[npcId]
        if (!npc) return false

        // Check if NPC is on this app
        const appPresence = npc.apps.find(a => a.appId === appId)
        if (!appPresence || !appPresence.isActive) return false

        // Check relationship level vs app access level
        const accessLevel = relationshipToAccessLevel(npc.relationship.level)
        return canContactViaApp(appId, accessLevel)
      },

      getAccessibleApps: (npcId) => {
        const npc = get().npcs[npcId]
        if (!npc) return []

        const accessLevel = relationshipToAccessLevel(npc.relationship.level)
        const accessibleApps = getAppsForAccessLevel(accessLevel)

        // Filter to apps the NPC is actually on
        return npc.apps
          .filter(a => a.isActive && accessibleApps.some(app => app.id === a.appId))
          .map(a => a.appId)
      },

      getNPCsOnApp: (appId) => {
        return Object.values(get().npcs).filter(npc =>
          npc.apps.some(a => a.appId === appId && a.isActive)
        )
      },

      getNPCByUsername: (appId, username) => {
        return Object.values(get().npcs).find(npc =>
          npc.apps.some(a => a.appId === appId && a.username === username)
        )
      },

      isNPCOnline: (npcId) => {
        const npc = get().npcs[npcId]
        if (!npc) return false

        // Check if within active hours
        const now = new Date()
        const hour = now.getHours()
        const { start, end } = npc.activeHours

        if (start <= end) {
          return hour >= start && hour < end
        } else {
          // Wraps around midnight
          return hour >= start || hour < end
        }
      },

      // Dating helpers
      getNPCsOnDatingSite: (siteId) => {
        return Object.values(get().npcs).filter(npc =>
          npc.datingProfiles.some(dp => dp.siteId === siteId && dp.isActive)
        )
      },

      getDatingProfile: (npcId, siteId) => {
        const npc = get().npcs[npcId]
        if (!npc) return undefined
        return npc.datingProfiles.find(dp => dp.siteId === siteId)
      },

      updateRelationshipStatus: (npcId, status) => {
        set(state => {
          const npc = state.npcs[npcId]
          if (!npc) return state

          return {
            npcs: {
              ...state.npcs,
              [npcId]: { ...npc, relationshipStatus: status },
            },
          }
        })
      },

      subscribeToRelationshipUpdates: () => {
        const { subscribe } = useWSStore.getState()

        const unsub1 = subscribe('relationship:updated', (msg) => {
          const { npc_id, trust, affinity, familiarity, stage } = msg.payload as any
          if (!npc_id) return
          get().updateRelationship(npc_id, {
            ...(trust !== undefined && { trust }),
            ...(affinity !== undefined && { affinity }),
            ...(familiarity !== undefined && { familiarity }),
            ...(stage !== undefined && { level: stage }),
          })
        })

        const unsub2 = subscribe('relationship:stageChanged', (msg) => {
          const { npc_id, new_stage, trust, affinity, familiarity } = msg.payload as any
          if (!npc_id) return
          get().updateRelationship(npc_id, {
            level: new_stage,
            ...(trust !== undefined && { trust }),
            ...(affinity !== undefined && { affinity }),
            ...(familiarity !== undefined && { familiarity }),
          })
        })

        return () => { unsub1(); unsub2() }
      },

      loadRelationshipsFromServer: async () => {
        try {
          const { request } = useWSStore.getState()
          const result = await request<undefined, { relationships: any[] }>('playerRelationship:getAll')
          if (result?.relationships) {
            for (const rel of result.relationships) {
              get().updateRelationship(rel.npc_id, {
                trust: rel.trust_level,
                affinity: rel.affinity,
                familiarity: rel.familiarity,
                level: rel.relationship_stage,
                totalMessages: rel.total_messages_sent + rel.total_messages_received,
                lastInteraction: rel.last_interaction
                  ? new Date(rel.last_interaction * 1000).toISOString()
                  : null,
              })
            }
          }
        } catch (err) {
          console.warn('[NPC Store] Failed to load relationships from server:', err)
        }
      },
    }),
    {
      name: 'engaige-npcs',
      version: 2,
      migrate: () => ({ npcs: {} }),
      partialize: (state) => ({
        npcs: state.npcs,
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export function useNPC(npcId: string) {
  return useNPCStore(state => state.npcs[npcId])
}

export function useNPCRelationship(npcId: string) {
  return useNPCStore(state => state.npcs[npcId]?.relationship)
}

export function useNPCsOnApp(appId: string) {
  return useNPCStore(
    useShallow(state =>
      Object.values(state.npcs).filter(npc =>
        npc.apps.some(a => a.appId === appId && a.isActive)
      )
    )
  )
}

export function useAccessibleApps(npcId: string) {
  return useNPCStore(
    useShallow(state => state.getAccessibleApps(npcId))
  )
}

export function useNPCsOnDatingSite(siteId: string) {
  return useNPCStore(
    useShallow(state =>
      Object.values(state.npcs).filter(npc =>
        npc.datingProfiles.some(dp => dp.siteId === siteId && dp.isActive)
      )
    )
  )
}

export function useDatingProfile(npcId: string, siteId: string) {
  return useNPCStore(state => {
    const npc = state.npcs[npcId]
    if (!npc) return undefined
    return npc.datingProfiles.find(dp => dp.siteId === siteId)
  })
}

export default useNPCStore
