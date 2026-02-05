/**
 * NPC Relationship Store
 *
 * The drama engine. Tracks relationships BETWEEN NPCs (not player-NPC).
 * Handles:
 * - Public relationships (dating, engaged, married)
 * - Secret relationships and affairs
 * - Trust, happiness, and drama levels
 * - Who knows about what secrets
 *
 * This creates emergent drama: NPCs can cheat, get caught, post vague drama
 * on social media, etc.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The store broadcasts events via subscribeToRelationshipEvents
// Drama engine runs server-side (server/src/services/drama-engine.ts)
type EventListener = (event: RelationshipEvent, relationship: NPCRelationship) => void
const eventListeners: EventListener[] = []

export function subscribeToRelationshipEvents(listener: EventListener): () => void {
  eventListeners.push(listener)
  return () => {
    const index = eventListeners.indexOf(listener)
    if (index > -1) eventListeners.splice(index, 1)
  }
}

function broadcastEvent(event: RelationshipEvent, relationship: NPCRelationship): void {
  eventListeners.forEach(listener => {
    try {
      listener(event, relationship)
    } catch (e) {
      console.error('[NPCRelationshipStore] Event listener error:', e)
    }
  })
}

// ============================================================================
// Types
// ============================================================================

export type RelationshipType =
  | 'single'
  | 'talking'
  | 'dating'
  | 'exclusive'
  | 'engaged'
  | 'married'
  | 'its_complicated'
  | 'divorced'
  | 'broken_up'

export interface NPCRelationship {
  id: string
  npc1Id: string
  npc2Id: string

  // Status
  type: RelationshipType
  startedAt: string
  endedAt?: string
  endReason?: 'mutual' | 'dumped' | 'caught' | 'ghosted' | 'other'

  // The spicy stuff
  isSecret: boolean              // Hidden from public
  isAffair: boolean              // One/both are in another relationship
  secretKnownBy: string[]        // NPCs/player who know about the secret

  // Health metrics (0-100)
  happiness: number              // How happy both are
  trust: number                  // Trust level (affairs tank this)
  drama: number                  // How volatile/dramatic (high = fights, vague posts)

  // Tracking
  lastInteractionAt: string
  significantEvents: RelationshipEvent[]
}

export type RelationshipEventType =
  | 'relationship_started'
  | 'relationship_ended'
  | 'status_changed'
  | 'affair_started'
  | 'affair_discovered'
  | 'caught_cheating'
  | 'fight'
  | 'reconciliation'
  | 'secret_shared'
  | 'trust_broken'
  | 'jealousy_incident'
  | 'public_display'

export interface RelationshipEvent {
  id: string
  type: RelationshipEventType
  timestamp: string
  description: string
  // Who witnessed/learned about this event
  witnessedBy: string[]
  // Impact on relationship metrics
  happinessImpact?: number
  trustImpact?: number
  dramaImpact?: number
}

// ============================================================================
// Store State
// ============================================================================

interface NPCRelationshipState {
  relationships: NPCRelationship[]

  // ========================================================================
  // Queries
  // ========================================================================

  getRelationship: (id: string) => NPCRelationship | undefined
  getRelationshipBetween: (npc1Id: string, npc2Id: string) => NPCRelationship | undefined
  getRelationshipsFor: (npcId: string) => NPCRelationship[]
  getPublicRelationshipsFor: (npcId: string) => NPCRelationship[]
  getSecretRelationshipsFor: (npcId: string) => NPCRelationship[]
  getActiveRelationships: () => NPCRelationship[]
  getAffairs: () => NPCRelationship[]

  // Status queries
  isInRelationship: (npcId: string) => boolean
  getPublicStatus: (npcId: string) => RelationshipType
  getPartner: (npcId: string) => string | undefined
  isCheating: (npcId: string) => boolean
  getAffairPartners: (npcId: string) => string[]
  knowsAboutSecret: (observerId: string, relationshipId: string) => boolean

  // ========================================================================
  // Actions
  // ========================================================================

  // Start/end relationships
  startRelationship: (
    npc1Id: string,
    npc2Id: string,
    type?: RelationshipType,
    options?: { isSecret?: boolean }
  ) => NPCRelationship

  endRelationship: (
    relationshipId: string,
    reason: 'mutual' | 'dumped' | 'caught' | 'ghosted' | 'other'
  ) => void

  updateRelationshipType: (relationshipId: string, newType: RelationshipType) => void

  // Affair mechanics
  startAffair: (npc1Id: string, npc2Id: string) => NPCRelationship | null
  discoverAffair: (relationshipId: string, discoveredBy: string) => RelationshipEvent | null
  exposeAffair: (relationshipId: string) => void

  // Relationship health
  updateMetrics: (
    relationshipId: string,
    changes: { happiness?: number; trust?: number; drama?: number }
  ) => void

  // Events
  addEvent: (relationshipId: string, event: Omit<RelationshipEvent, 'id' | 'timestamp'>) => void

  // Secret knowledge
  revealSecretTo: (relationshipId: string, observerId: string) => void

  // Setup
  initialize: () => void
  setupPreExistingDrama: () => void
  clearAllRelationships: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
  return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useNPCRelationshipStore = create<NPCRelationshipState>()(
  persist(
    (set, get) => ({
      relationships: [],

      // ========================================================================
      // Queries
      // ========================================================================

      getRelationship: (id) => {
        return get().relationships.find(r => r.id === id)
      },

      getRelationshipBetween: (npc1Id, npc2Id) => {
        return get().relationships.find(r =>
          (r.npc1Id === npc1Id && r.npc2Id === npc2Id) ||
          (r.npc1Id === npc2Id && r.npc2Id === npc1Id)
        )
      },

      getRelationshipsFor: (npcId) => {
        return get().relationships.filter(r =>
          r.npc1Id === npcId || r.npc2Id === npcId
        )
      },

      getPublicRelationshipsFor: (npcId) => {
        return get().relationships.filter(r =>
          (r.npc1Id === npcId || r.npc2Id === npcId) &&
          !r.isSecret &&
          !r.endedAt
        )
      },

      getSecretRelationshipsFor: (npcId) => {
        return get().relationships.filter(r =>
          (r.npc1Id === npcId || r.npc2Id === npcId) &&
          r.isSecret &&
          !r.endedAt
        )
      },

      getActiveRelationships: () => {
        return get().relationships.filter(r => !r.endedAt)
      },

      getAffairs: () => {
        return get().relationships.filter(r => r.isAffair && !r.endedAt)
      },

      isInRelationship: (npcId) => {
        const rels = get().getPublicRelationshipsFor(npcId)
        return rels.some(r =>
          r.type !== 'single' &&
          r.type !== 'broken_up' &&
          r.type !== 'divorced'
        )
      },

      getPublicStatus: (npcId) => {
        const publicRels = get().getPublicRelationshipsFor(npcId)
        // Return the most "serious" public relationship status
        const statusOrder: RelationshipType[] = [
          'married', 'engaged', 'exclusive', 'dating', 'talking', 'its_complicated',
          'divorced', 'broken_up', 'single'
        ]

        for (const status of statusOrder) {
          if (publicRels.some(r => r.type === status)) {
            return status
          }
        }
        return 'single'
      },

      getPartner: (npcId) => {
        const publicRels = get().getPublicRelationshipsFor(npcId)
        const seriousRel = publicRels.find(r =>
          ['married', 'engaged', 'exclusive', 'dating'].includes(r.type)
        )
        if (!seriousRel) return undefined
        return seriousRel.npc1Id === npcId ? seriousRel.npc2Id : seriousRel.npc1Id
      },

      isCheating: (npcId) => {
        const affairs = get().getAffairs()
        return affairs.some(r => r.npc1Id === npcId || r.npc2Id === npcId)
      },

      getAffairPartners: (npcId) => {
        const affairs = get().getAffairs().filter(r =>
          r.npc1Id === npcId || r.npc2Id === npcId
        )
        return affairs.map(r => r.npc1Id === npcId ? r.npc2Id : r.npc1Id)
      },

      knowsAboutSecret: (observerId, relationshipId) => {
        const rel = get().getRelationship(relationshipId)
        if (!rel) return false
        if (!rel.isSecret) return true // Not a secret, everyone knows
        return rel.secretKnownBy.includes(observerId)
      },

      // ========================================================================
      // Actions
      // ========================================================================

      startRelationship: (npc1Id, npc2Id, type = 'talking', options = {}) => {
        const { isSecret = false } = options

        const startEvent: RelationshipEvent = {
          id: generateEventId(),
          type: 'relationship_started',
          timestamp: new Date().toISOString(),
          description: `${npc1Id} and ${npc2Id} started ${type}`,
          witnessedBy: isSecret ? [npc1Id, npc2Id] : [],
        }

        const newRelationship: NPCRelationship = {
          id: generateId(),
          npc1Id,
          npc2Id,
          type,
          startedAt: new Date().toISOString(),
          isSecret,
          isAffair: false,
          secretKnownBy: isSecret ? [npc1Id, npc2Id] : [],
          happiness: 80,
          trust: 70,
          drama: 20,
          lastInteractionAt: new Date().toISOString(),
          significantEvents: [startEvent],
        }

        set(state => ({
          relationships: [...state.relationships, newRelationship]
        }))

        // Broadcast event for drama engine
        broadcastEvent(startEvent, newRelationship)

        return newRelationship
      },

      endRelationship: (relationshipId, reason) => {
        const rel = get().getRelationship(relationshipId)
        if (!rel) return

        const endEvent: RelationshipEvent = {
          id: generateEventId(),
          type: 'relationship_ended',
          timestamp: new Date().toISOString(),
          description: `Relationship ended (${reason})`,
          witnessedBy: rel.isSecret ? rel.secretKnownBy : [],
          dramaImpact: reason === 'caught' ? 50 : 20,
        }

        const updatedRel: NPCRelationship = {
          ...rel,
          endedAt: new Date().toISOString(),
          endReason: reason,
          type: rel.type === 'married' ? 'divorced' : 'broken_up' as RelationshipType,
          significantEvents: [...rel.significantEvents, endEvent],
        }

        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId ? updatedRel : r
          )
        }))

        // Broadcast event for drama engine
        broadcastEvent(endEvent, updatedRel)
      },

      updateRelationshipType: (relationshipId, newType) => {
        const rel = get().getRelationship(relationshipId)
        if (!rel) return

        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId
              ? {
                  ...r,
                  type: newType,
                  significantEvents: [
                    ...r.significantEvents,
                    {
                      id: generateEventId(),
                      type: 'status_changed' as RelationshipEventType,
                      timestamp: new Date().toISOString(),
                      description: `Status changed to ${newType}`,
                      witnessedBy: r.isSecret ? r.secretKnownBy : [],
                    }
                  ]
                }
              : r
          )
        }))
      },

      startAffair: (npc1Id, npc2Id) => {
        // Check if at least one is in a public relationship
        const npc1InRel = get().isInRelationship(npc1Id)
        const npc2InRel = get().isInRelationship(npc2Id)

        if (!npc1InRel && !npc2InRel) {
          // Neither is in a relationship, this isn't an affair
          return null
        }

        const affair: NPCRelationship = {
          id: generateId(),
          npc1Id,
          npc2Id,
          type: 'talking',
          startedAt: new Date().toISOString(),
          isSecret: true,
          isAffair: true,
          secretKnownBy: [npc1Id, npc2Id],
          happiness: 90, // Affairs often start exciting
          trust: 30, // But low trust (both know they're cheating)
          drama: 70, // High drama potential
          lastInteractionAt: new Date().toISOString(),
          significantEvents: [{
            id: generateEventId(),
            type: 'affair_started',
            timestamp: new Date().toISOString(),
            description: `Secret affair started between ${npc1Id} and ${npc2Id}`,
            witnessedBy: [npc1Id, npc2Id],
            dramaImpact: 30,
          }],
        }

        set(state => ({
          relationships: [...state.relationships, affair]
        }))

        return affair
      },

      discoverAffair: (relationshipId, discoveredBy) => {
        const rel = get().getRelationship(relationshipId)
        if (!rel || !rel.isAffair) return null

        // Already knows
        if (rel.secretKnownBy.includes(discoveredBy)) return null

        const event: RelationshipEvent = {
          id: generateEventId(),
          type: 'affair_discovered',
          timestamp: new Date().toISOString(),
          description: `${discoveredBy} discovered the affair`,
          witnessedBy: [discoveredBy],
          trustImpact: -30,
          dramaImpact: 40,
        }

        const updatedRel: NPCRelationship = {
          ...rel,
          secretKnownBy: [...rel.secretKnownBy, discoveredBy],
          drama: clamp(rel.drama + 40, 0, 100),
          significantEvents: [...rel.significantEvents, event],
        }

        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId ? updatedRel : r
          )
        }))

        // Broadcast event for drama engine
        broadcastEvent(event, updatedRel)

        return event
      },

      exposeAffair: (relationshipId) => {
        const rel = get().getRelationship(relationshipId)
        if (!rel || !rel.isAffair) return

        const exposeEvent: RelationshipEvent = {
          id: generateEventId(),
          type: 'caught_cheating',
          timestamp: new Date().toISOString(),
          description: 'Affair exposed publicly',
          witnessedBy: [], // Public = everyone
          trustImpact: -100,
          dramaImpact: 100,
        }

        const updatedRel: NPCRelationship = {
          ...rel,
          isSecret: false,
          drama: 100,
          trust: 0,
          significantEvents: [...rel.significantEvents, exposeEvent],
        }

        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId ? updatedRel : r
          )
        }))

        // Broadcast event for drama engine
        broadcastEvent(exposeEvent, updatedRel)

        // Also damage the primary relationships of both NPCs
        const npc1Partner = get().getPartner(rel.npc1Id)
        const npc2Partner = get().getPartner(rel.npc2Id)

        if (npc1Partner) {
          const primaryRel = get().getRelationshipBetween(rel.npc1Id, npc1Partner)
          if (primaryRel) {
            get().updateMetrics(primaryRel.id, { trust: -50, happiness: -40, drama: 50 })
          }
        }

        if (npc2Partner) {
          const primaryRel = get().getRelationshipBetween(rel.npc2Id, npc2Partner)
          if (primaryRel) {
            get().updateMetrics(primaryRel.id, { trust: -50, happiness: -40, drama: 50 })
          }
        }
      },

      updateMetrics: (relationshipId, changes) => {
        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId
              ? {
                  ...r,
                  happiness: changes.happiness !== undefined
                    ? clamp(r.happiness + changes.happiness, 0, 100)
                    : r.happiness,
                  trust: changes.trust !== undefined
                    ? clamp(r.trust + changes.trust, 0, 100)
                    : r.trust,
                  drama: changes.drama !== undefined
                    ? clamp(r.drama + changes.drama, 0, 100)
                    : r.drama,
                  lastInteractionAt: new Date().toISOString(),
                }
              : r
          )
        }))
      },

      addEvent: (relationshipId, event) => {
        const fullEvent: RelationshipEvent = {
          ...event,
          id: generateEventId(),
          timestamp: new Date().toISOString(),
        }

        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId
              ? {
                  ...r,
                  significantEvents: [...r.significantEvents, fullEvent],
                  happiness: event.happinessImpact !== undefined
                    ? clamp(r.happiness + event.happinessImpact, 0, 100)
                    : r.happiness,
                  trust: event.trustImpact !== undefined
                    ? clamp(r.trust + event.trustImpact, 0, 100)
                    : r.trust,
                  drama: event.dramaImpact !== undefined
                    ? clamp(r.drama + event.dramaImpact, 0, 100)
                    : r.drama,
                }
              : r
          )
        }))
      },

      revealSecretTo: (relationshipId, observerId) => {
        const rel = get().getRelationship(relationshipId)
        if (!rel || !rel.isSecret) return
        if (rel.secretKnownBy.includes(observerId)) return

        set(state => ({
          relationships: state.relationships.map(r =>
            r.id === relationshipId
              ? {
                  ...r,
                  secretKnownBy: [...r.secretKnownBy, observerId],
                  significantEvents: [
                    ...r.significantEvents,
                    {
                      id: generateEventId(),
                      type: 'secret_shared' as RelationshipEventType,
                      timestamp: new Date().toISOString(),
                      description: `Secret revealed to ${observerId}`,
                      witnessedBy: [observerId],
                    }
                  ]
                }
              : r
          )
        }))
      },

      initialize: () => {
        // Called on app start - nothing special to do
      },

      setupPreExistingDrama: () => {
        // Set up some pre-existing relationships with drama seeds
        const state = get()

        // Only set up if no relationships exist
        if (state.relationships.length > 0) return

        // Example: Sarah and Jake are dating
        state.startRelationship('sarah', 'jake', 'dating')

        // Example: Emily and Marcus are talking
        state.startRelationship('emily', 'marcus', 'talking')

        // Example: Sarah has a secret thing with Marcus (affair potential)
        state.startRelationship('sarah', 'marcus', 'talking', { isSecret: true })

        // Mark Sarah-Marcus as affair since Sarah is with Jake
        const sarahMarcus = state.getRelationshipBetween('sarah', 'marcus')
        if (sarahMarcus) {
          set(s => ({
            relationships: s.relationships.map(r =>
              r.id === sarahMarcus.id
                ? { ...r, isAffair: true, drama: 60, trust: 40 }
                : r
            )
          }))
        }
      },

      clearAllRelationships: () => {
        set({ relationships: [] })
      },
    }),
    {
      name: 'engaige-npc-relationships',
      partialize: (state) => ({
        relationships: state.relationships,
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useNPCRelationships = (npcId?: string) => {
  return useNPCRelationshipStore(state =>
    npcId ? state.getRelationshipsFor(npcId) : state.relationships
  )
}

export const useNPCAffairs = () => {
  return useNPCRelationshipStore(state => state.getAffairs())
}

export const useRelationshipBetween = (npc1Id: string, npc2Id: string) => {
  return useNPCRelationshipStore(state => state.getRelationshipBetween(npc1Id, npc2Id))
}

export const useNPCPublicStatus = (npcId: string) => {
  return useNPCRelationshipStore(state => state.getPublicStatus(npcId))
}

export const useIsNPCCheating = (npcId: string) => {
  return useNPCRelationshipStore(state => state.isCheating(npcId))
}
