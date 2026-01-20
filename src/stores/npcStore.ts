/**
 * NPC Store
 *
 * Central store for all NPC data, relationships, and app access.
 * NPCs are the characters the player interacts with across all platforms.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type AccessLevel, canContactViaApp, getAppsForAccessLevel } from '../config/app-registry.js'

// ============================================================================
// Types
// ============================================================================

export type RelationshipLevel =
  | 'stranger'       // Never interacted
  | 'acquaintance'   // Brief interaction, knows of player
  | 'friend'         // Regular friend, frequent interaction
  | 'close_friend'   // Inner circle, high trust
  | 'best_friend'    // Closest friend, shares secrets
  | 'romantic'       // Romantic interest or partner

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
// NPC Templates
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

// Predefined NPCs for development/demo
const PRESET_NPCS: Omit<NPC, 'relationship' | 'createdAt'>[] = [
  {
    id: 'npc_sarah',
    name: 'Sarah',
    username: 'xX_SarahBear_Xx',
    avatar: '👧',
    age: 24,
    gender: 'female',
    pronouns: 'she/her',
    bio: '✨ living my best life ✨ photography | coffee | adventures',
    occupation: 'Photographer',
    location: 'Los Angeles, CA',
    interests: ['photography', 'coffee', 'hiking', 'music', 'travel'],
    music: 'currently obsessed with indie pop',
    personality: {
      ...DEFAULT_PERSONALITY,
      extraversion: 75,
      openness: 80,
      emojiUsage: 'heavy',
      verbosity: 'medium',
    },
    apps: [
      { appId: 'myface', username: 'xX_SarahBear_Xx', isActive: true, joinedAt: '2023-01-15' },
      { appId: 'myface-chat', username: 'xX_SarahBear_Xx', isActive: true, joinedAt: '2023-01-15' },
      { appId: 'instasnap', username: 'sarahsnaps', isActive: true, joinedAt: '2023-03-20' },
      { appId: 'chirp', username: 'sarahbear', isActive: true, joinedAt: '2023-02-10' },
      { appId: 'messages', username: 'sarah', isActive: true, joinedAt: '2024-01-01' },
    ],
    datingProfiles: [
      {
        siteId: 'spark',
        bio: 'Looking for someone to explore the world with 🌎 Let\'s grab coffee and see where it goes!',
        photos: ['👧', '📸', '☕', '🏔️'],
        lookingFor: 'Something real, no games',
        promptAnswers: [
          { prompt: "A perfect first date is...", answer: "Coffee and a spontaneous adventure!" },
          { prompt: "I'm looking for...", answer: "Someone who makes me laugh and isn't afraid of trying new things" },
        ],
        isActive: true,
        lastActive: new Date().toISOString(),
      },
      {
        siteId: 'myface-dating',
        bio: 'Your friendly neighborhood photographer ✨ Swipe right if you appreciate golden hour!',
        photos: ['👧', '📸'],
        lookingFor: 'Connection and good vibes',
        isActive: true,
        lastActive: new Date().toISOString(),
      },
    ],
    relationshipStatus: 'single',
    profileCustomization: {
      backgroundColor: '#FFE4E1',
      textColor: '#8B4513',
    },
    activeHours: { start: 8, end: 23, timezone: 'America/Los_Angeles' },
    flags: {
      canInitiateConversations: true,
      canPostFreely: true,
      canSendImages: true,
      isActiveHoursAware: true,
    },
    isGenerated: false,
  },
  {
    id: 'npc_jake',
    name: 'Jake',
    username: 'JakeTheSnake99',
    avatar: '🧑',
    age: 26,
    gender: 'male',
    pronouns: 'he/him',
    bio: 'gamer | skater | pizza enthusiast 🍕',
    occupation: 'Game Developer',
    location: 'Austin, TX',
    interests: ['gaming', 'skateboarding', 'music', 'pizza', 'coding'],
    music: 'punk rock forever',
    personality: {
      ...DEFAULT_PERSONALITY,
      extraversion: 45,
      agreeableness: 70,
      verbosity: 'short',
      emojiUsage: 'minimal',
      slang: true,
    },
    apps: [
      { appId: 'myface', username: 'JakeTheSnake99', isActive: true, joinedAt: '2022-06-01' },
      { appId: 'myface-chat', username: 'JakeTheSnake99', isActive: true, joinedAt: '2022-06-01' },
      { appId: 'chirp', username: 'jakesnake', isActive: true, joinedAt: '2022-08-15' },
    ],
    datingProfiles: [
      {
        siteId: 'spark',
        bio: 'Chill dude looking for someone to game with and get pizza 🍕🎮',
        photos: ['🧑', '🎮', '🛹'],
        lookingFor: 'Someone laid back who doesn\'t take life too seriously',
        promptAnswers: [
          { prompt: "My ideal Sunday is...", answer: "Gaming marathon followed by pizza delivery" },
        ],
        isActive: true,
        lastActive: new Date().toISOString(),
      },
      {
        siteId: 'gamercrush',
        bio: 'Looking for player 2 🎮 I main support but can flex',
        photos: ['🧑', '🎮'],
        lookingFor: 'Someone to duo queue with IRL',
        promptAnswers: [
          { prompt: "What game are you playing right now?", answer: "Probably Elden Ring for the 5th time" },
          { prompt: "Console, PC, or both?", answer: "PC master race but I won't judge" },
        ],
        isActive: true,
        lastActive: new Date().toISOString(),
      },
    ],
    relationshipStatus: 'single',
    profileCustomization: {
      backgroundColor: '#2F4F4F',
      textColor: '#00FF00',
    },
    activeHours: { start: 12, end: 3, timezone: 'America/Chicago' }, // Night owl
    flags: {
      canInitiateConversations: true,
      canPostFreely: true,
      canSendImages: false,
      isActiveHoursAware: true,
    },
    isGenerated: false,
  },
  {
    id: 'npc_emily',
    name: 'Emily',
    username: 'EmilyMelody',
    avatar: '👩',
    age: 23,
    gender: 'female',
    pronouns: 'she/her',
    bio: '🎵 singer/songwriter | dreamer | cat mom 🐱',
    occupation: 'Musician',
    location: 'Nashville, TN',
    interests: ['music', 'songwriting', 'cats', 'poetry', 'concerts'],
    music: 'check out my new song on my profile!',
    personality: {
      ...DEFAULT_PERSONALITY,
      openness: 90,
      agreeableness: 85,
      neuroticism: 60,
      verbosity: 'long',
      emojiUsage: 'moderate',
      formality: 'casual',
    },
    apps: [
      { appId: 'myface', username: 'EmilyMelody', isActive: true, joinedAt: '2021-09-01' },
      { appId: 'myface-chat', username: 'EmilyMelody', isActive: true, joinedAt: '2021-09-01' },
      { appId: 'instasnap', username: 'emilymelody', isActive: true, joinedAt: '2022-01-10' },
      { appId: 'chirp', username: 'emilymelody', isActive: true, joinedAt: '2022-03-05' },
      { appId: 'messages', username: 'emily', isActive: true, joinedAt: '2024-01-01' },
    ],
    datingProfiles: [
      {
        siteId: 'spark',
        bio: 'Songwriter looking for my muse 🎵 Let me write a song about you',
        photos: ['👩', '🎵', '🎸', '🐱'],
        lookingFor: 'A deep connection and late night conversations',
        promptAnswers: [
          { prompt: "The way to my heart is...", answer: "Through music, poetry, or really good tacos" },
          { prompt: "I'm looking for...", answer: "Someone who appreciates the little moments" },
        ],
        isActive: true,
        lastActive: new Date().toISOString(),
      },
      {
        siteId: 'myface-dating',
        bio: 'Dreamer with a guitar and too many cats 🎸🐱',
        photos: ['👩', '🎵'],
        lookingFor: 'My person',
        isActive: true,
        lastActive: new Date().toISOString(),
      },
    ],
    relationshipStatus: 'single',
    profileCustomization: {
      backgroundColor: '#E6E6FA',
      textColor: '#4B0082',
      profileSong: 'Dreamer - Emily',
    },
    activeHours: { start: 10, end: 1, timezone: 'America/Chicago' },
    flags: {
      canInitiateConversations: true,
      canPostFreely: true,
      canSendImages: true,
      isActiveHoursAware: false,
    },
    isGenerated: false,
  },
  {
    id: 'npc_marcus',
    name: 'Marcus',
    username: 'MikeD_Beats',
    avatar: '👨',
    age: 28,
    gender: 'male',
    pronouns: 'he/him',
    bio: 'DJ | Producer | Night owl 🦉',
    occupation: 'DJ / Producer',
    location: 'Miami, FL',
    interests: ['DJing', 'production', 'nightlife', 'vinyl', 'electronic music'],
    music: 'house, techno, everything electronic',
    personality: {
      ...DEFAULT_PERSONALITY,
      extraversion: 60,
      conscientiousness: 40,
      verbosity: 'short',
      formality: 'casual',
      slang: true,
    },
    apps: [
      { appId: 'myface', username: 'MikeD_Beats', isActive: true, joinedAt: '2020-12-01' },
      { appId: 'myface-chat', username: 'MikeD_Beats', isActive: true, joinedAt: '2020-12-01' },
      { appId: 'instasnap', username: 'mikedbeats', isActive: true, joinedAt: '2021-02-15' },
    ],
    datingProfiles: [
      {
        siteId: 'spark',
        bio: 'DJ by night, producer by day 🎧 Let me make you a playlist',
        photos: ['👨', '🎧', '🎚️'],
        lookingFor: 'Someone who vibes with my energy',
        promptAnswers: [
          { prompt: "My ideal date is...", answer: "A rooftop with good music and better company" },
        ],
        isActive: true,
        lastActive: new Date().toISOString(),
      },
    ],
    relationshipStatus: 'single',
    profileCustomization: {
      backgroundColor: '#1a1a2e',
      textColor: '#00FFFF',
    },
    activeHours: { start: 18, end: 6, timezone: 'America/New_York' }, // Night person
    flags: {
      canInitiateConversations: false,
      canPostFreely: true,
      canSendImages: true,
      isActiveHoursAware: true,
    },
    isGenerated: false,
  },
  {
    id: 'npc_luna',
    name: 'Luna',
    username: 'AlexWonders',
    avatar: '👩‍🎤',
    age: 25,
    gender: 'non-binary',
    pronouns: 'they/them',
    bio: 'artist | free spirit | collector of sunsets 🌅',
    occupation: 'Visual Artist',
    location: 'Portland, OR',
    interests: ['art', 'nature', 'meditation', 'travel', 'philosophy'],
    music: 'ambient and lo-fi beats',
    personality: {
      ...DEFAULT_PERSONALITY,
      openness: 95,
      agreeableness: 80,
      extraversion: 35,
      verbosity: 'long',
      emojiUsage: 'moderate',
      formality: 'normal',
    },
    apps: [
      { appId: 'myface', username: 'AlexWonders', isActive: true, joinedAt: '2022-04-01' },
      { appId: 'myface-chat', username: 'AlexWonders', isActive: true, joinedAt: '2022-04-01' },
      { appId: 'instasnap', username: 'lunawonders', isActive: true, joinedAt: '2022-05-10' },
      { appId: 'messages', username: 'luna', isActive: true, joinedAt: '2024-01-01' },
    ],
    datingProfiles: [
      {
        siteId: 'spark',
        bio: 'Artist seeking a beautiful soul 🌅 Let\'s watch sunsets and talk about the universe',
        photos: ['👩‍🎤', '🎨', '🌅', '🌿'],
        lookingFor: 'Authentic connection, not small talk',
        promptAnswers: [
          { prompt: "I'm passionate about...", answer: "Art, nature, and finding beauty in unexpected places" },
          { prompt: "A life goal of mine...", answer: "To travel the world and create art inspired by every place I visit" },
        ],
        isActive: true,
        lastActive: new Date().toISOString(),
      },
      {
        siteId: 'myface-dating',
        bio: 'Free spirit with paint-stained hands 🎨 Looking for deep conversations',
        photos: ['👩‍🎤', '🎨'],
        lookingFor: 'Someone genuine',
        isActive: true,
        lastActive: new Date().toISOString(),
      },
    ],
    relationshipStatus: 'single',
    profileCustomization: {
      backgroundColor: '#FFF8DC',
      textColor: '#556B2F',
    },
    activeHours: { start: 6, end: 22, timezone: 'America/Los_Angeles' },
    flags: {
      canInitiateConversations: true,
      canPostFreely: true,
      canSendImages: true,
      isActiveHoursAware: true,
    },
    isGenerated: false,
  },
]

// ============================================================================
// Store State
// ============================================================================

interface NPCState {
  // Data
  npcs: Record<string, NPC>

  // Actions
  initialize: () => void
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
    case 'romantic': return 'partner'
  }
}

function calculateRelationshipLevel(relationship: NPC['relationship']): RelationshipLevel {
  const { trust, affinity, familiarity, romanticInterest } = relationship

  // Average of all metrics
  const avg = (trust + affinity + familiarity) / 3

  if (romanticInterest && avg >= 80) return 'romantic'
  if (avg >= 90) return 'best_friend'
  if (avg >= 70) return 'close_friend'
  if (avg >= 40) return 'friend'
  if (avg >= 15) return 'acquaintance'
  return 'stranger'
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

      initialize: () => {
        const { npcs } = get()

        // Only initialize if empty
        if (Object.keys(npcs).length > 0) return

        // Create NPCs from presets
        const initialNPCs: Record<string, NPC> = {}

        for (const preset of PRESET_NPCS) {
          initialNPCs[preset.id] = {
            ...preset,
            relationship: createDefaultRelationship(),
            createdAt: new Date().toISOString(),
          }
        }

        set({ npcs: initialNPCs })
      },

      getNPC: (id) => get().npcs[id],

      getAllNPCs: () => Object.values(get().npcs),

      updateRelationship: (npcId, updates) => {
        set(state => {
          const npc = state.npcs[npcId]
          if (!npc) return state

          const newRelationship = { ...npc.relationship, ...updates }

          // Recalculate level based on metrics
          newRelationship.level = calculateRelationshipLevel(newRelationship)

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
    }),
    {
      name: 'engaige-npcs',
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
  return useNPCStore(state =>
    Object.values(state.npcs).filter(npc =>
      npc.apps.some(a => a.appId === appId && a.isActive)
    )
  )
}

export function useAccessibleApps(npcId: string) {
  const getAccessibleApps = useNPCStore(state => state.getAccessibleApps)
  return getAccessibleApps(npcId)
}

export function useNPCsOnDatingSite(siteId: string) {
  return useNPCStore(state =>
    Object.values(state.npcs).filter(npc =>
      npc.datingProfiles.some(dp => dp.siteId === siteId && dp.isActive)
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
