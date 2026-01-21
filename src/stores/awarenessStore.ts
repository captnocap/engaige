/**
 * Awareness Store
 *
 * Manages the information flow in the game - who knows what.
 * Key concept: NPCs only react to posts/events they've actually "seen".
 *
 * This creates realistic drama timing:
 * - Sarah posts something sus at 2pm
 * - Emily (who checks hourly) sees it at 2:30pm and comments "👀"
 * - Jake (who checks every 4 hours) doesn't see it until 6pm
 * - Player might know before Jake does (or vice versa)
 *
 * This makes information propagation feel real and creates natural
 * tension in dramatic situations.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSocialStore, type Post } from './socialStore.js'
import { dramaEngine } from '../services/dramaEngine.js'

// ============================================================================
// Types
// ============================================================================

/**
 * How often and where an NPC checks social media
 */
export interface NPCSocialHabits {
  npcId: string
  // Which platforms they use (array allows for different activity levels)
  platforms: string[]
  // How often they check (in hours) - lower = more active
  checkFrequencyHours: number
  // How many posts they scroll through per session
  batchSize: number
  // Their active hours (e.g., night owls only check late)
  activeHoursStart: number  // 0-23
  activeHoursEnd: number    // 0-23
  // Personality traits that affect behavior
  traits: {
    isHeavyScroller: boolean    // Sees more posts per session
    checksNotifications: boolean // Sees posts they're tagged in immediately
    lateNightScroller: boolean  // Active outside normal hours
    reactsOften: boolean        // More likely to like/comment
  }
}

export interface LastChecked {
  npcId: string
  platform: string
  timestamp: string
}

interface AwarenessState {
  // When each NPC last checked each platform
  lastChecked: LastChecked[]

  // NPC social media habits
  habits: NPCSocialHabits[]

  // ========================================================================
  // Queries
  // ========================================================================

  getHabits: (npcId: string) => NPCSocialHabits | undefined
  getLastChecked: (npcId: string, platform: string) => string | undefined
  shouldCheckNow: (npcId: string, platform: string) => boolean
  getPostsForNPCSession: (npcId: string, platform: string) => Post[]

  // ========================================================================
  // Actions
  // ========================================================================

  // Initialize with default habits for preset NPCs
  initialize: () => void

  // Update when an NPC checks social media
  npcChecksSocialMedia: (npcId: string, platform: string) => Post[]

  // Bulk simulation - advance time and have all NPCs check according to habits
  simulateSocialMediaChecks: () => void

  // Update NPC habits
  setHabits: (npcId: string, habits: Partial<NPCSocialHabits>) => void
}

// ============================================================================
// Default NPC Social Habits
// ============================================================================

const DEFAULT_NPC_HABITS: NPCSocialHabits[] = [
  {
    npcId: 'sarah',
    platforms: ['myface', 'chirp', 'instasnap'],
    checkFrequencyHours: 1,  // Very active - checks hourly
    batchSize: 15,
    activeHoursStart: 8,
    activeHoursEnd: 23,
    traits: {
      isHeavyScroller: true,
      checksNotifications: true,
      lateNightScroller: false,
      reactsOften: true,
    },
  },
  {
    npcId: 'jake',
    platforms: ['myface', 'chirp'],
    checkFrequencyHours: 4,  // Casual user - every 4 hours
    batchSize: 5,
    activeHoursStart: 10,
    activeHoursEnd: 22,
    traits: {
      isHeavyScroller: false,
      checksNotifications: false,
      lateNightScroller: false,
      reactsOften: false,
    },
  },
  {
    npcId: 'emily',
    platforms: ['myface', 'instasnap'],
    checkFrequencyHours: 2,
    batchSize: 10,
    activeHoursStart: 9,
    activeHoursEnd: 24,  // 24 = midnight
    traits: {
      isHeavyScroller: true,
      checksNotifications: true,
      lateNightScroller: true,
      reactsOften: true,
    },
  },
  {
    npcId: 'marcus',
    platforms: ['myface', 'chirp'],
    checkFrequencyHours: 6,  // Sporadic - checks late at night
    batchSize: 8,
    activeHoursStart: 20,  // 8pm
    activeHoursEnd: 3,     // 3am
    traits: {
      isHeavyScroller: false,
      checksNotifications: false,
      lateNightScroller: true,
      reactsOften: false,
    },
  },
  {
    npcId: 'luna',
    platforms: ['instasnap', 'myface'],
    checkFrequencyHours: 3,
    batchSize: 12,
    activeHoursStart: 7,
    activeHoursEnd: 21,
    traits: {
      isHeavyScroller: true,
      checksNotifications: true,
      lateNightScroller: false,
      reactsOften: true,
    },
  },
]

// ============================================================================
// Store Implementation
// ============================================================================

export const useAwarenessStore = create<AwarenessState>()(
  persist(
    (set, get) => ({
      lastChecked: [],
      habits: [],

      // ========================================================================
      // Queries
      // ========================================================================

      getHabits: (npcId) => {
        return get().habits.find(h => h.npcId === npcId)
      },

      getLastChecked: (npcId, platform) => {
        const record = get().lastChecked.find(
          lc => lc.npcId === npcId && lc.platform === platform
        )
        return record?.timestamp
      },

      shouldCheckNow: (npcId, platform) => {
        const habits = get().getHabits(npcId)
        if (!habits) return false

        // Check if platform is in their list
        if (!habits.platforms.includes(platform)) return false

        // Check if within active hours
        const now = new Date()
        const currentHour = now.getHours()
        const { activeHoursStart, activeHoursEnd } = habits

        // Handle overnight active hours (e.g., 20-3)
        const isInActiveHours = activeHoursEnd < activeHoursStart
          ? currentHour >= activeHoursStart || currentHour < activeHoursEnd
          : currentHour >= activeHoursStart && currentHour < activeHoursEnd

        if (!isInActiveHours && !habits.traits.lateNightScroller) {
          return false
        }

        // Check time since last check
        const lastChecked = get().getLastChecked(npcId, platform)
        if (!lastChecked) return true // Never checked

        const lastCheckTime = new Date(lastChecked)
        const hoursSinceLastCheck = (now.getTime() - lastCheckTime.getTime()) / (1000 * 60 * 60)

        return hoursSinceLastCheck >= habits.checkFrequencyHours
      },

      getPostsForNPCSession: (npcId, platform) => {
        const habits = get().getHabits(npcId)
        const batchSize = habits?.batchSize || 5
        const lastChecked = get().getLastChecked(npcId, platform)

        const socialStore = useSocialStore.getState()
        const allPosts = socialStore.getFeed(platform)

        // Get posts the NPC hasn't seen yet
        const unseenPosts = allPosts.filter(post => {
          // Don't show NPC their own posts
          if (post.authorId === npcId) return false

          // Check if they've seen it
          return !post.seenBy.some(v => v.viewerId === npcId)
        })

        // Sort by recency and limit to batch size
        return unseenPosts
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, habits?.traits.isHeavyScroller ? batchSize * 1.5 : batchSize)
      },

      // ========================================================================
      // Actions
      // ========================================================================

      initialize: () => {
        const { habits } = get()
        if (habits.length > 0) return // Already initialized

        set({ habits: DEFAULT_NPC_HABITS })
      },

      npcChecksSocialMedia: (npcId, platform) => {
        const postsToSee = get().getPostsForNPCSession(npcId, platform)
        const socialStore = useSocialStore.getState()

        // Mark all posts as seen by this NPC
        postsToSee.forEach(post => {
          socialStore.markPostAsSeen(post.id, npcId, platform)
        })

        // Process reactions to posts (likes, comments)
        // This is where NPCs respond to drama they see
        postsToSee.forEach(post => {
          dramaEngine.processPostReaction(npcId, post)
        })

        // Check for suspicious activity (affair discovery via posts)
        if (postsToSee.length > 0) {
          dramaEngine.checkForSuspiciousActivity(npcId, postsToSee)
        }

        // Update last checked time
        const now = new Date().toISOString()
        set(state => {
          const existingIndex = state.lastChecked.findIndex(
            lc => lc.npcId === npcId && lc.platform === platform
          )

          if (existingIndex >= 0) {
            const updated = [...state.lastChecked]
            updated[existingIndex] = { npcId, platform, timestamp: now }
            return { lastChecked: updated }
          }

          return {
            lastChecked: [...state.lastChecked, { npcId, platform, timestamp: now }]
          }
        })

        return postsToSee
      },

      simulateSocialMediaChecks: () => {
        const { habits, shouldCheckNow, npcChecksSocialMedia } = get()

        // For each NPC with habits defined
        habits.forEach(habit => {
          // Check each platform they use
          habit.platforms.forEach(platform => {
            if (shouldCheckNow(habit.npcId, platform)) {
              npcChecksSocialMedia(habit.npcId, platform)
            }
          })
        })
      },

      setHabits: (npcId, newHabits) => {
        set(state => {
          const existingIndex = state.habits.findIndex(h => h.npcId === npcId)

          if (existingIndex >= 0) {
            const updated = [...state.habits]
            updated[existingIndex] = { ...updated[existingIndex], ...newHabits }
            return { habits: updated }
          }

          // Create new habits entry
          const defaultHabits: NPCSocialHabits = {
            npcId,
            platforms: ['myface'],
            checkFrequencyHours: 2,
            batchSize: 8,
            activeHoursStart: 9,
            activeHoursEnd: 22,
            traits: {
              isHeavyScroller: false,
              checksNotifications: true,
              lateNightScroller: false,
              reactsOften: false,
            },
            ...newHabits,
          }

          return { habits: [...state.habits, defaultHabits] }
        })
      },
    }),
    {
      name: 'engaige-awareness',
      partialize: (state) => ({
        lastChecked: state.lastChecked,
        habits: state.habits,
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useNPCHabits = (npcId: string) => {
  return useAwarenessStore(state => state.getHabits(npcId))
}

export const useLastChecked = (npcId: string, platform: string) => {
  return useAwarenessStore(state => state.getLastChecked(npcId, platform))
}

export const useShouldNPCCheck = (npcId: string, platform: string) => {
  return useAwarenessStore(state => state.shouldCheckNow(npcId, platform))
}
