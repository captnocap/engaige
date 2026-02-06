/**
 * Broadcast Service
 *
 * Provides a decoupled way for services and agents to broadcast messages
 * to connected clients. Uses the event bus so agents don't need to import
 * the network layer directly.
 *
 * Usage:
 *   import { broadcastToClients } from '../services/broadcast.js';
 *
 *   // Broadcast a social event
 *   broadcastToClients('social:postCreated', { post });
 *
 *   // Broadcast with specific target
 *   broadcastToClients('npc:message', { message }, { npcId: 'npc_123' });
 */

import { eventBus, EventTypes } from '../events/index.js';

export interface BroadcastOptions {
  /** Only broadcast to clients subscribed to this NPC */
  npcId?: string;
  /** Only broadcast to clients subscribed to these platforms */
  platforms?: string[];
  /** Only broadcast to a specific session */
  sessionId?: string;
}

/**
 * Broadcast a message to connected WebSocket clients.
 *
 * This emits a system event that the ws-server listens for and
 * forwards to appropriate clients. Agents and services should use
 * this instead of importing ws-server directly.
 */
export function broadcastToClients(
  type: string,
  payload: unknown,
  options?: BroadcastOptions
): void {
  eventBus.fire(
    EventTypes.SYSTEM_BROADCAST_REQUESTED,
    {
      message_type: type,
      payload,
      options: options || {},
    },
    {
      source: 'broadcast-service',
      importance: 0.3,
    }
  );
}

/**
 * Broadcast a social event (post created, liked, commented, etc.)
 */
export function broadcastSocial(
  eventType: 'postCreated' | 'postLiked' | 'postUnliked' | 'commentAdded',
  payload: unknown
): void {
  broadcastToClients(`social:${eventType}`, payload);
}

/**
 * Broadcast an NPC event (message received, status changed, etc.)
 */
export function broadcastNPC(
  eventType: 'messageReceived' | 'statusChanged' | 'moodChanged',
  npcId: string,
  payload: unknown
): void {
  broadcastToClients(`npc:${eventType}`, payload, { npcId });
}

/**
 * Broadcast a conversation event
 */
export function broadcastConversation(
  eventType: 'newMessage' | 'typing' | 'read',
  payload: unknown
): void {
  broadcastToClients(`conversation:${eventType}`, payload);
}

export default {
  broadcastToClients,
  broadcastSocial,
  broadcastNPC,
  broadcastConversation,
};
