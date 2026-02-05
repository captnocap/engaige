/**
 * NPC Thoughts Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, serializeMessage, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleThoughtsGet(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getNPCThoughts, getAllNPCThoughts } = await import('../../services/reasoning-extractor.js');
  const { npcId, limit, thoughtType, minConfidence, since } = (message.payload || {}) as any;

  let thoughts;
  if (npcId) {
    // Get thoughts for specific NPC
    thoughts = getNPCThoughts(npcId, {
      limit: limit || 20,
      thought_type: thoughtType || 'in_character',
      min_confidence: minConfidence || 0.5,
      since: since || 0,
    });
  } else {
    // Get thoughts across all NPCs
    thoughts = getAllNPCThoughts({
      limit: limit || 50,
      min_confidence: minConfidence || 0.5,
      since: since || 0,
    });
  }

  ctx.send(ws, createResponse(message.id, true, thoughts));
}

function handleThoughtsSubscribe(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const session = ctx.clients.get(ws);
  if (session) {
    session.subscribedToThoughts = true;
    session.thoughtsNpcFilter = (message.payload as any)?.npcId;
    console.log(`[WS] Client ${session.id} subscribed to thoughts${session.thoughtsNpcFilter ? ` (NPC: ${session.thoughtsNpcFilter})` : ''}`);
  }
  ctx.send(ws, createResponse(message.id, true, { subscribed: true }));
}

function handleThoughtsUnsubscribe(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const session = ctx.clients.get(ws);
  if (session) {
    session.subscribedToThoughts = false;
    session.thoughtsNpcFilter = undefined;
    console.log(`[WS] Client ${session.id} unsubscribed from thoughts`);
  }
  ctx.send(ws, createResponse(message.id, true, { subscribed: false }));
}

export const thoughtsHandlers: HandlerMap = {
  'thoughts:get': handleThoughtsGet,
  'thoughts:subscribe': handleThoughtsSubscribe,
  'thoughts:unsubscribe': handleThoughtsUnsubscribe,
};

// ============================================================================
// Broadcast Functions (exported for use by other parts of the system)
// ============================================================================

/**
 * Broadcast a thought event to subscribed clients
 */
export function broadcastThought(
  ctx: HandlerContext,
  thought: {
    thought_id: string;
    npc_id: string;
    npc_display_name: string;
    content: string;
    thought_type: 'in_character' | 'meta_ai' | 'unknown';
    confidence: number;
    context?: string;
    conversation_id?: string;
    created_at: number;
  }
): void {
  for (const [ws, session] of ctx.clients.entries()) {
    if (!session.subscribedToThoughts) continue;

    // Apply NPC filter if set
    if (session.thoughtsNpcFilter && session.thoughtsNpcFilter !== thought.npc_id) continue;

    try {
      ws.send(serializeMessage({
        type: 'thoughts:captured',
        payload: thought,
      }));
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastThought',
        session_id: session.id,
      });
    }
  }
}

/**
 * Broadcast a deliberation started event
 */
export function broadcastDeliberationStarted(
  ctx: HandlerContext,
  data: {
    npc_id: string;
    npc_display_name: string;
    target_loops: number;
    thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
    reason: string;
    conversation_id?: string;
  }
): void {
  for (const [ws, session] of ctx.clients.entries()) {
    if (!session.subscribedToThoughts) continue;
    if (session.thoughtsNpcFilter && session.thoughtsNpcFilter !== data.npc_id) continue;

    try {
      ws.send(serializeMessage({
        type: 'thoughts:deliberationStarted',
        payload: data,
      }));
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastDeliberationStarted',
        session_id: session.id,
      });
    }
  }
}

/**
 * Broadcast a deliberation completed event
 */
export function broadcastDeliberationCompleted(
  ctx: HandlerContext,
  data: {
    npc_id: string;
    npc_display_name: string;
    loops_completed: number;
    thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
    total_time_ms: number;
    thought_count: number;
    conversation_id?: string;
  }
): void {
  for (const [ws, session] of ctx.clients.entries()) {
    if (!session.subscribedToThoughts) continue;
    if (session.thoughtsNpcFilter && session.thoughtsNpcFilter !== data.npc_id) continue;

    try {
      ws.send(serializeMessage({
        type: 'thoughts:deliberationCompleted',
        payload: data,
      }));
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastDeliberationCompleted',
        session_id: session.id,
      });
    }
  }
}
