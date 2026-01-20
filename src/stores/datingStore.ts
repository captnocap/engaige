/**
 * Dating Store
 *
 * Manages player's dating activity across all dating platforms:
 * - Swipes (likes/passes)
 * - Matches (mutual likes)
 * - Match notifications
 * - Integration with NPC stores and conversations
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getDatingSite, npcMatchesSiteNiche, type DatingSiteDefinition } from '../config/dating-registry.js'

// ============================================================================
// Types
// ============================================================================

export interface DatingMatch {
  id: string
  siteId: string
  npcId: string
  matchedAt: string
  hasMessaged: boolean
  conversationId?: string
  iceBreaker?: string
  // For celebration modal
  isNew: boolean
  seenByPlayer: boolean
}

export interface SwipeRecord {
  npcId: string
  siteId: string
  direction: 'right' | 'left' | 'super'
  swipedAt: string
}

export interface NPCLikeRecord {
  npcId: string
  siteId: string
  likedAt: string
  // NPCs can "like" the player - creates match when player swipes right
}

interface DatingState {
  // Player's swipe history per site
  swipes: Record<string, SwipeRecord[]>  // siteId -> swipes

  // Mutual matches
  matches: DatingMatch[]

  // NPCs who have "liked" the player (pending matches)
  npcLikes: NPCLikeRecord[]

  // Super likes remaining today
  superLikesRemaining: Record<string, number>  // siteId -> count
  lastSuperLikeReset: string  // ISO date

  // For celebration modal
  pendingMatchCelebration: DatingMatch | null

  // Actions
  swipeRight: (siteId: string, npcId: string) => DatingMatch | null
  swipeLeft: (siteId: string, npcId: string) => void
  superLike: (siteId: string, npcId: string) => DatingMatch | null
  undoLastSwipe: (siteId: string) => boolean

  // NPC actions (called by simulation)
  npcLikesPlayer: (siteId: string, npcId: string) => DatingMatch | null

  // Queries
  getSwipesForSite: (siteId: string) => SwipeRecord[]
  getMatchesForSite: (siteId: string) => DatingMatch[]
  getAllMatches: () => DatingMatch[]
  hasSwipedOn: (siteId: string, npcId: string) => boolean
  isMatched: (siteId: string, npcId: string) => boolean
  getMatch: (siteId: string, npcId: string) => DatingMatch | undefined
  getSuperLikesRemaining: (siteId: string) => number
  getNPCsWhoLikedPlayer: (siteId: string) => string[]

  // Match management
  markMatchAsSeen: (matchId: string) => void
  markMatchAsMessaged: (matchId: string, conversationId: string) => void
  clearPendingCelebration: () => void
  unmatch: (matchId: string) => void

  // Reset
  resetSuperLikes: () => void
  initialize: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useDatingStore = create<DatingState>()(
  persist(
    (set, get) => ({
      swipes: {},
      matches: [],
      npcLikes: [],
      superLikesRemaining: {},
      lastSuperLikeReset: new Date().toISOString().split('T')[0],
      pendingMatchCelebration: null,

      // ========================================================================
      // Player Swipe Actions
      // ========================================================================

      swipeRight: (siteId: string, npcId: string) => {
        const { swipes, npcLikes, matches } = get()

        // Check if already swiped
        const siteSwipes = swipes[siteId] || []
        if (siteSwipes.some(s => s.npcId === npcId)) {
          return null // Already swiped
        }

        // Record the swipe
        const swipeRecord: SwipeRecord = {
          npcId,
          siteId,
          direction: 'right',
          swipedAt: new Date().toISOString(),
        }

        // Check if this creates a match (NPC already liked player)
        const npcLike = npcLikes.find(l => l.npcId === npcId && l.siteId === siteId)
        let newMatch: DatingMatch | null = null

        if (npcLike) {
          // It's a match!
          newMatch = {
            id: `match_${siteId}_${npcId}_${Date.now()}`,
            siteId,
            npcId,
            matchedAt: new Date().toISOString(),
            hasMessaged: false,
            isNew: true,
            seenByPlayer: false,
          }

          set(state => ({
            swipes: {
              ...state.swipes,
              [siteId]: [...(state.swipes[siteId] || []), swipeRecord],
            },
            matches: [...state.matches, newMatch!],
            npcLikes: state.npcLikes.filter(l => !(l.npcId === npcId && l.siteId === siteId)),
            pendingMatchCelebration: newMatch,
          }))
        } else {
          set(state => ({
            swipes: {
              ...state.swipes,
              [siteId]: [...(state.swipes[siteId] || []), swipeRecord],
            },
          }))
        }

        return newMatch
      },

      swipeLeft: (siteId: string, npcId: string) => {
        const { swipes } = get()

        // Check if already swiped
        const siteSwipes = swipes[siteId] || []
        if (siteSwipes.some(s => s.npcId === npcId)) {
          return // Already swiped
        }

        const swipeRecord: SwipeRecord = {
          npcId,
          siteId,
          direction: 'left',
          swipedAt: new Date().toISOString(),
        }

        set(state => ({
          swipes: {
            ...state.swipes,
            [siteId]: [...(state.swipes[siteId] || []), swipeRecord],
          },
        }))
      },

      superLike: (siteId: string, npcId: string) => {
        const { swipes, superLikesRemaining } = get()
        const site = getDatingSite(siteId)

        // Check if super likes are enabled
        if (!site?.features.superLikes) {
          return null
        }

        // Check remaining super likes
        const remaining = superLikesRemaining[siteId] ?? (site.features.superLikesPerDay || 1)
        if (remaining <= 0) {
          return null
        }

        // Check if already swiped
        const siteSwipes = swipes[siteId] || []
        if (siteSwipes.some(s => s.npcId === npcId)) {
          return null
        }

        // Record super like
        const swipeRecord: SwipeRecord = {
          npcId,
          siteId,
          direction: 'super',
          swipedAt: new Date().toISOString(),
        }

        // Super likes have higher match chance - for now, treat as guaranteed match
        const newMatch: DatingMatch = {
          id: `match_${siteId}_${npcId}_${Date.now()}`,
          siteId,
          npcId,
          matchedAt: new Date().toISOString(),
          hasMessaged: false,
          isNew: true,
          seenByPlayer: false,
        }

        set(state => ({
          swipes: {
            ...state.swipes,
            [siteId]: [...(state.swipes[siteId] || []), swipeRecord],
          },
          matches: [...state.matches, newMatch],
          superLikesRemaining: {
            ...state.superLikesRemaining,
            [siteId]: remaining - 1,
          },
          pendingMatchCelebration: newMatch,
        }))

        return newMatch
      },

      undoLastSwipe: (siteId: string) => {
        const site = getDatingSite(siteId)
        if (!site?.features.rewindLastSwipe) {
          return false
        }

        const { swipes } = get()
        const siteSwipes = swipes[siteId] || []

        if (siteSwipes.length === 0) {
          return false
        }

        // Remove the last swipe
        set(state => ({
          swipes: {
            ...state.swipes,
            [siteId]: state.swipes[siteId]?.slice(0, -1) || [],
          },
        }))

        return true
      },

      // ========================================================================
      // NPC Actions (called by simulation)
      // ========================================================================

      npcLikesPlayer: (siteId: string, npcId: string) => {
        const { swipes, npcLikes, matches } = get()

        // Check if NPC already liked
        if (npcLikes.some(l => l.npcId === npcId && l.siteId === siteId)) {
          return null
        }

        // Check if player already swiped right - instant match
        const playerSwipe = (swipes[siteId] || []).find(s => s.npcId === npcId)

        if (playerSwipe && (playerSwipe.direction === 'right' || playerSwipe.direction === 'super')) {
          // It's a match!
          const newMatch: DatingMatch = {
            id: `match_${siteId}_${npcId}_${Date.now()}`,
            siteId,
            npcId,
            matchedAt: new Date().toISOString(),
            hasMessaged: false,
            isNew: true,
            seenByPlayer: false,
          }

          set(state => ({
            matches: [...state.matches, newMatch],
            pendingMatchCelebration: newMatch,
          }))

          return newMatch
        }

        // Player hasn't swiped yet - record NPC's like
        const likeRecord: NPCLikeRecord = {
          npcId,
          siteId,
          likedAt: new Date().toISOString(),
        }

        set(state => ({
          npcLikes: [...state.npcLikes, likeRecord],
        }))

        return null
      },

      // ========================================================================
      // Queries
      // ========================================================================

      getSwipesForSite: (siteId: string) => {
        return get().swipes[siteId] || []
      },

      getMatchesForSite: (siteId: string) => {
        return get().matches.filter(m => m.siteId === siteId)
      },

      getAllMatches: () => {
        return get().matches
      },

      hasSwipedOn: (siteId: string, npcId: string) => {
        const siteSwipes = get().swipes[siteId] || []
        return siteSwipes.some(s => s.npcId === npcId)
      },

      isMatched: (siteId: string, npcId: string) => {
        return get().matches.some(m => m.siteId === siteId && m.npcId === npcId)
      },

      getMatch: (siteId: string, npcId: string) => {
        return get().matches.find(m => m.siteId === siteId && m.npcId === npcId)
      },

      getSuperLikesRemaining: (siteId: string) => {
        const site = getDatingSite(siteId)
        if (!site?.features.superLikes) return 0
        return get().superLikesRemaining[siteId] ?? (site.features.superLikesPerDay || 1)
      },

      getNPCsWhoLikedPlayer: (siteId: string) => {
        return get().npcLikes
          .filter(l => l.siteId === siteId)
          .map(l => l.npcId)
      },

      // ========================================================================
      // Match Management
      // ========================================================================

      markMatchAsSeen: (matchId: string) => {
        set(state => ({
          matches: state.matches.map(m =>
            m.id === matchId ? { ...m, seenByPlayer: true, isNew: false } : m
          ),
        }))
      },

      markMatchAsMessaged: (matchId: string, conversationId: string) => {
        set(state => ({
          matches: state.matches.map(m =>
            m.id === matchId ? { ...m, hasMessaged: true, conversationId } : m
          ),
        }))
      },

      clearPendingCelebration: () => {
        const { pendingMatchCelebration } = get()
        if (pendingMatchCelebration) {
          // Also mark as seen
          set(state => ({
            pendingMatchCelebration: null,
            matches: state.matches.map(m =>
              m.id === pendingMatchCelebration.id ? { ...m, seenByPlayer: true } : m
            ),
          }))
        }
      },

      unmatch: (matchId: string) => {
        set(state => ({
          matches: state.matches.filter(m => m.id !== matchId),
        }))
      },

      // ========================================================================
      // Reset & Initialize
      // ========================================================================

      resetSuperLikes: () => {
        const today = new Date().toISOString().split('T')[0]
        set({
          superLikesRemaining: {}, // Will reset to defaults on next read
          lastSuperLikeReset: today,
        })
      },

      initialize: () => {
        // Check if super likes need reset (new day)
        const today = new Date().toISOString().split('T')[0]
        const { lastSuperLikeReset } = get()

        if (lastSuperLikeReset !== today) {
          get().resetSuperLikes()
        }
      },
    }),
    {
      name: 'engaige-dating',
      partialize: (state) => ({
        swipes: state.swipes,
        matches: state.matches,
        npcLikes: state.npcLikes,
        superLikesRemaining: state.superLikesRemaining,
        lastSuperLikeReset: state.lastSuperLikeReset,
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useMatches = (siteId?: string) => {
  const matches = useDatingStore(state => state.matches)
  return siteId ? matches.filter(m => m.siteId === siteId) : matches
}

export const useNewMatchCount = () => {
  return useDatingStore(state => state.matches.filter(m => m.isNew).length)
}

export const usePendingCelebration = () => {
  return useDatingStore(state => state.pendingMatchCelebration)
}

export const useSuperLikes = (siteId: string) => {
  return useDatingStore(state => state.getSuperLikesRemaining(siteId))
}

export const useNPCLikes = (siteId: string) => {
  return useDatingStore(state => state.getNPCsWhoLikedPlayer(siteId))
}
