/**
 * Relationship Broadcaster
 *
 * Listens to relationship events on the event bus and broadcasts
 * updates to all connected WebSocket clients so the frontend
 * receives authoritative relationship data from the server.
 */

import { eventBus, EventTypes } from '../events/index.js';
import { broadcast } from '../network/ws-server.js';

/**
 * Initialize the relationship broadcaster.
 * Call once at startup after the event bus is ready.
 */
export function initRelationshipBroadcaster(): void {
  // Broadcast stats updates (trust/affinity/familiarity changes)
  eventBus.on(EventTypes.RELATIONSHIP_STATS_UPDATED, (event) => {
    broadcast({
      type: 'relationship:updated',
      payload: {
        npc_id: event.npc_id,
        player_id: event.player_id,
        trust: event.payload.new_trust,
        affinity: event.payload.new_affinity,
        familiarity: event.payload.new_familiarity,
        trigger: event.payload.trigger,
      },
    });
  });

  // Broadcast stage changes (stranger → acquaintance, etc.)
  eventBus.on(EventTypes.RELATIONSHIP_STAGE_CHANGED, (event) => {
    broadcast({
      type: 'relationship:stageChanged',
      payload: {
        npc_id: event.npc_id,
        player_id: event.player_id,
        previous_stage: event.payload.previous_stage,
        new_stage: event.payload.new_stage,
        trust: event.payload.trust,
        affinity: event.payload.affinity,
        familiarity: event.payload.familiarity,
      },
    });
  });

  // Broadcast first interaction (new relationship created)
  eventBus.on(EventTypes.RELATIONSHIP_FIRST_INTERACTION, async (event) => {
    // Fetch full relationship data to include in broadcast
    const { getOrCreateRelationship } = await import('./relationships.js');
    const rel = getOrCreateRelationship(event.player_id!, event.npc_id!);

    broadcast({
      type: 'relationship:updated',
      payload: {
        npc_id: event.npc_id,
        player_id: event.player_id,
        trust: rel.trust_level,
        affinity: rel.affinity,
        familiarity: rel.familiarity,
        stage: rel.relationship_stage,
        trigger: 'first_interaction',
      },
    });
  });

  console.log('[RelationshipBroadcaster] Initialized');
}
