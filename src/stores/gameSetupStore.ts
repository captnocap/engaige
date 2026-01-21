/**
 * Game Setup Store
 *
 * Manages game-specific initial state settings, separate from app settings.
 * These choices affect the starting state of the game world.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useNPCRelationshipStore } from './npcRelationshipStore.js'
import { useAwarenessStore } from './awarenessStore.js'
import { useNPCStore } from './npcStore.js'
import { useDatingStore } from './datingStore.js'
import { useSocialStore } from './socialStore.js'

// ============================================================================
// Types
// ============================================================================

export type DramaMode =
  | 'fresh_start'        // All NPCs single, no pre-existing relationships
  | 'pre_existing_drama' // Some NPCs have relationships, some with secret affairs

export interface GameSetupSettings {
  // Drama mode
  dramaMode: DramaMode

  // Whether the initial setup has been completed
  isSetupComplete: boolean

  // When the game was started
  gameStartedAt?: string
}

interface GameSetupState extends GameSetupSettings {
  // Actions
  setDramaMode: (mode: DramaMode) => void
  applySetup: () => void
  resetGame: () => void
}

// ============================================================================
// Pre-Existing Drama Setup
// ============================================================================

/**
 * Sets up pre-existing relationships with drama seeds.
 * This creates an interesting starting state where:
 * - Some NPCs are already in relationships
 * - Some secret affairs are brewing
 * - Drama is ready to unfold based on player actions
 */
function setupPreExistingDrama() {
  const relationshipStore = useNPCRelationshipStore.getState()

  // Clear any existing relationships first
  relationshipStore.clearAllRelationships()

  // ========================================================================
  // Setup: Sarah and Jake are dating publicly
  // ========================================================================
  const sarahJake = relationshipStore.startRelationship('sarah', 'jake', 'dating')

  // They've been together a bit, so adjust metrics
  relationshipStore.updateMetrics(sarahJake.id, {
    happiness: 10, // Started at 80, now 90
    trust: 15,     // Started at 70, now 85
    drama: -10,    // Started at 20, now 10
  })

  // ========================================================================
  // Setup: Emily and Marcus are "talking"
  // ========================================================================
  relationshipStore.startRelationship('emily', 'marcus', 'talking')

  // ========================================================================
  // THE DRAMA SEED: Sarah has a secret thing with Marcus
  // ========================================================================
  // This is the affair that can be discovered!
  const sarahMarcus = relationshipStore.startRelationship(
    'sarah',
    'marcus',
    'talking',
    { isSecret: true }
  )

  // Mark it as an affair and set dramatic metrics
  const store = useNPCRelationshipStore.getState()
  const updatedRelationship = store.getRelationship(sarahMarcus.id)
  if (updatedRelationship) {
    // Manually set isAffair since startRelationship doesn't auto-detect cross-relationships
    useNPCRelationshipStore.setState(state => ({
      relationships: state.relationships.map(r =>
        r.id === sarahMarcus.id
          ? {
              ...r,
              isAffair: true,
              drama: 60,     // High drama potential
              trust: 40,     // Low trust (both know it's wrong)
              happiness: 85, // High excitement
            }
          : r
      )
    }))
  }

  // ========================================================================
  // Setup: Luna is single but was previously with someone (emotional baggage)
  // ========================================================================
  // No active relationship, but we can hint at past drama through NPC status

  console.log('[GameSetup] Pre-existing drama setup complete:')
  console.log('  - Sarah <-> Jake: dating (public)')
  console.log('  - Emily <-> Marcus: talking (public)')
  console.log('  - Sarah <-> Marcus: talking (SECRET AFFAIR)')
  console.log('  - Luna: single')
}

/**
 * Sets up a fresh start with no pre-existing relationships.
 */
function setupFreshStart() {
  const relationshipStore = useNPCRelationshipStore.getState()

  // Clear all relationships
  relationshipStore.clearAllRelationships()

  // Update NPC relationship statuses to single
  const npcStore = useNPCStore.getState()
  const npcs = ['sarah', 'jake', 'emily', 'marcus', 'luna']
  npcs.forEach(npcId => {
    npcStore.updateRelationshipStatus(npcId, 'single')
  })

  console.log('[GameSetup] Fresh start setup complete - all NPCs are single')
}

// ============================================================================
// Store Implementation
// ============================================================================

const defaultSettings: GameSetupSettings = {
  dramaMode: 'fresh_start',
  isSetupComplete: false,
}

export const useGameSetupStore = create<GameSetupState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setDramaMode: (mode) => {
        set({ dramaMode: mode })
      },

      applySetup: () => {
        const { dramaMode, isSetupComplete } = get()

        // Don't re-apply if already setup
        if (isSetupComplete) {
          console.log('[GameSetup] Setup already complete, skipping')
          return
        }

        console.log(`[GameSetup] Applying setup with mode: ${dramaMode}`)

        // Initialize all required stores
        useNPCStore.getState().initialize()
        useDatingStore.getState().initialize()
        useAwarenessStore.getState().initialize()
        useSocialStore.getState().initialize()

        // Apply drama mode
        if (dramaMode === 'pre_existing_drama') {
          setupPreExistingDrama()
        } else {
          setupFreshStart()
        }

        set({
          isSetupComplete: true,
          gameStartedAt: new Date().toISOString(),
        })

        console.log('[GameSetup] Setup complete!')
      },

      resetGame: () => {
        console.log('[GameSetup] Resetting game...')

        // Clear all game state
        useNPCRelationshipStore.getState().clearAllRelationships()

        // Reset this store
        set({
          ...defaultSettings,
        })

        console.log('[GameSetup] Game reset complete')
      },
    }),
    {
      name: 'engaige-game-setup',
      partialize: (state) => ({
        dramaMode: state.dramaMode,
        isSetupComplete: state.isSetupComplete,
        gameStartedAt: state.gameStartedAt,
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useDramaMode = () => {
  return useGameSetupStore(state => state.dramaMode)
}

export const useIsSetupComplete = () => {
  return useGameSetupStore(state => state.isSetupComplete)
}
