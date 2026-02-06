/**
 * WebSocket Server
 *
 * Handles all client <-> server communication over WebSocket.
 * Routes messages to appropriate handlers.
 */

import type { ServerWebSocket } from 'bun';
import {
  parseMessage,
  serializeMessage,
  createResponse,
  createError,
  type WSMessage,
  type ClientMessage,
  type ServerMessage,
} from './ws-protocol.js';
import { getProxyConfig, setProxyConfig } from './proxy-config.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from '../services/error-logger.js';
import {
  handlers,
  type ClientSession,
  type HandlerContext,
  // Re-export broadcast functions
  broadcastThought as _broadcastThought,
  broadcastDeliberationStarted as _broadcastDeliberationStarted,
  broadcastDeliberationCompleted as _broadcastDeliberationCompleted,
  broadcastWorldTimeUpdate as _broadcastWorldTimeUpdate,
  broadcastNPCMoved as _broadcastNPCMoved,
  broadcastSocialEvent as _broadcastSocialEvent,
} from './ws-handlers/index.js';

// Re-export ClientSession type for external use
export type { ClientSession };

// Map of connected clients
const clients = new Map<ServerWebSocket<ClientSession>, ClientSession>();

// Track social subscriptions per client
const socialSubscriptions = new Map<ServerWebSocket<ClientSession>, Set<string>>();

// Handler context - provides access to shared state and utilities
const handlerContext: HandlerContext = {
  clients,
  socialSubscriptions,
  send,
  broadcast,
};

// ============================================================================
// Event Bus Integration
// ============================================================================

// Listen for broadcast requests from services/agents
// This allows agents to broadcast without importing ws-server directly
eventBus.on(EventTypes.SYSTEM_BROADCAST_REQUESTED, (event) => {
  const { message_type, payload } = event.payload as {
    message_type: string;
    payload: unknown;
    options?: { npcId?: string; platforms?: string[]; sessionId?: string };
  };

  broadcast({ type: message_type, payload });
});

// Generate unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Handle new WebSocket connection
 */
export function handleOpen(ws: ServerWebSocket<ClientSession>): void {
  const session: ClientSession = {
    id: generateSessionId(),
    connectedAt: Date.now(),
  };

  clients.set(ws, session);
  console.log(`[WS] Client connected: ${session.id}`);

  // Emit WS connected event
  eventBus.fire(EventTypes.SYSTEM_WS_CONNECTED, {
    session_id: session.id,
    client_count: clients.size,
  }, {
    source: 'ws-server',
    session_id: session.id,
    importance: 0.4,
  });

  // Send connected event
  send(ws, {
    type: 'connected',
    payload: {
      sessionId: session.id,
      serverVersion: '0.1.0',
    },
  });
}

/**
 * Handle WebSocket close
 */
export function handleClose(ws: ServerWebSocket<ClientSession>): void {
  const session = clients.get(ws);
  if (session) {
    console.log(`[WS] Client disconnected: ${session.id}`);
    clients.delete(ws);

    // Clean up social subscriptions
    socialSubscriptions.delete(ws);

    // Emit WS disconnected event
    eventBus.fire(EventTypes.SYSTEM_WS_DISCONNECTED, {
      session_id: session.id,
      client_count: clients.size,
    }, {
      source: 'ws-server',
      session_id: session.id,
      importance: 0.4,
    });
  }
}

/**
 * Handle incoming WebSocket message
 */
export async function handleMessage(
  ws: ServerWebSocket<ClientSession>,
  message: string | Buffer
): Promise<void> {
  const data = typeof message === 'string' ? message : message.toString();
  const parsed = parseMessage(data);

  if (!parsed) {
    send(ws, createError('Invalid message format'));
    return;
  }

  console.log(`[WS] Received: ${parsed.type}`);

  try {
    await routeMessage(ws, parsed as ClientMessage);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const session = clients.get(ws);

    errorLogger.log(err, {
      source: 'ws-server',
      operation: `handle:${parsed.type}`,
      session_id: session?.id,
      metadata: { message_type: parsed.type, message_id: parsed.id },
    });

    send(ws, createError(errorMessage, 'HANDLER_ERROR', parsed.id));
  }
}

/**
 * Route message to appropriate handler
 */
async function routeMessage(
  ws: ServerWebSocket<ClientSession>,
  message: ClientMessage
): Promise<void> {
  // Handle built-in system messages
  switch (message.type) {
    case 'ping':
      send(ws, { type: 'pong', id: message.id });
      return;

    case 'proxy:getConfig':
      send(ws, createResponse(message.id, true, getProxyConfig()));
      return;

    case 'proxy:setConfig':
      if (message.payload) {
        setProxyConfig(message.payload);
      }
      send(ws, createResponse(message.id, true, getProxyConfig()));
      return;
  }

  // Look up handler from the route map
  const handler = handlers[message.type];
  if (handler) {
    await handler(ws, message, handlerContext);
    return;
  }

  // Unknown message type
  send(ws, createError(`Unknown message type: ${(message as WSMessage).type}`, 'UNKNOWN_TYPE', message.id));
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Send a message to a specific client
 */
export function send(ws: ServerWebSocket<ClientSession>, message: ServerMessage): void {
  try {
    ws.send(serializeMessage(message));
  } catch (err) {
    const session = clients.get(ws);
    errorLogger.log(err, {
      source: 'ws-server',
      operation: 'send',
      session_id: session?.id,
      metadata: { message_type: message.type },
    });
  }
}

/**
 * Broadcast a message to all connected clients
 */
export function broadcast(message: ServerMessage): void {
  const data = serializeMessage(message);
  for (const [ws, session] of clients.entries()) {
    try {
      ws.send(data);
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcast',
        session_id: session.id,
        metadata: { message_type: message.type },
      });
    }
  }
}

/**
 * Get count of connected clients
 */
export function getClientCount(): number {
  return clients.size;
}

// ============================================================================
// Broadcast Function Wrappers (maintain backward compatibility)
// ============================================================================

/**
 * Broadcast a thought event to subscribed clients
 */
export function broadcastThought(thought: {
  thought_id: string;
  npc_id: string;
  npc_display_name: string;
  content: string;
  thought_type: 'in_character' | 'meta_ai' | 'unknown';
  confidence: number;
  context?: string;
  conversation_id?: string;
  created_at: number;
}): void {
  _broadcastThought(handlerContext, thought);
}

/**
 * Broadcast a deliberation started event
 */
export function broadcastDeliberationStarted(data: {
  npc_id: string;
  npc_display_name: string;
  target_loops: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  reason: string;
  conversation_id?: string;
}): void {
  _broadcastDeliberationStarted(handlerContext, data);
}

/**
 * Broadcast a deliberation completed event
 */
export function broadcastDeliberationCompleted(data: {
  npc_id: string;
  npc_display_name: string;
  loops_completed: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  total_time_ms: number;
  thought_count: number;
  conversation_id?: string;
}): void {
  _broadcastDeliberationCompleted(handlerContext, data);
}

/**
 * Broadcast world time update to all subscribed clients
 */
export async function broadcastWorldTimeUpdate(): Promise<void> {
  await _broadcastWorldTimeUpdate(handlerContext);
}

/**
 * Broadcast NPC movement to all subscribed clients
 */
export function broadcastNPCMoved(data: {
  npcId: string;
  isAI: boolean;
  position: { x: number; y: number };
  targetPosition?: { x: number; y: number };
  buildingId?: string;
  activity: string;
  activityDescription?: string;
}): void {
  _broadcastNPCMoved(handlerContext, data);
}

/**
 * Broadcast a social event to subscribed clients
 */
export function broadcastSocialEvent(type: string, payload: any): void {
  _broadcastSocialEvent(handlerContext, type, payload);
}

export default {
  handleOpen,
  handleClose,
  handleMessage,
  send,
  broadcast,
  broadcastThought,
  broadcastDeliberationStarted,
  broadcastDeliberationCompleted,
  broadcastWorldTimeUpdate,
  broadcastNPCMoved,
  broadcastSocialEvent,
  getClientCount,
};
