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

// Client session data
export interface ClientSession {
  id: string;
  connectedAt: number;
}

// Map of connected clients
const clients = new Map<ServerWebSocket<ClientSession>, ClientSession>();

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
  switch (message.type) {
    // System
    case 'ping':
      send(ws, { type: 'pong', id: message.id });
      break;

    // Proxy configuration
    case 'proxy:getConfig':
      send(ws, createResponse(message.id, true, getProxyConfig()));
      break;

    case 'proxy:setConfig':
      if (message.payload) {
        setProxyConfig(message.payload);
      }
      send(ws, createResponse(message.id, true, getProxyConfig()));
      break;

    // Budget routes (import handlers dynamically to avoid circular deps)
    case 'budget:getStatus':
      await handleBudgetGetStatus(ws, message);
      break;

    case 'budget:getConfig':
      await handleBudgetGetConfig(ws, message);
      break;

    case 'budget:updateConfig':
      await handleBudgetUpdateConfig(ws, message);
      break;

    case 'budget:getLogs':
      await handleBudgetGetLogs(ws, message);
      break;

    // AI routes
    case 'ai:sendMessage':
      await handleAISendMessage(ws, message);
      break;

    case 'ai:generatePost':
      await handleAIGeneratePost(ws, message);
      break;

    // Logs routes
    case 'logs:getEvents':
      await handleLogsGetEvents(ws, message);
      break;

    case 'logs:getErrors':
      await handleLogsGetErrors(ws, message);
      break;

    case 'logs:resolveError':
      await handleLogsResolveError(ws, message);
      break;

    case 'logs:getQueue':
      await handleLogsGetQueue(ws, message);
      break;

    default:
      send(ws, createError(`Unknown message type: ${(message as WSMessage).type}`, 'UNKNOWN_TYPE', message.id));
  }
}

// ============================================================================
// Budget Handlers
// ============================================================================

async function handleBudgetGetStatus(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createBudgetRoutes } = await import('../routes/budget.js');
  const routes = createBudgetRoutes();
  const status = routes.getStatus();
  send(ws, createResponse(message.id, true, status));
}

async function handleBudgetGetConfig(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createBudgetRoutes } = await import('../routes/budget.js');
  const routes = createBudgetRoutes();
  const config = routes.getConfig();
  send(ws, createResponse(message.id, true, config));
}

async function handleBudgetUpdateConfig(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createBudgetRoutes } = await import('../routes/budget.js');
  const routes = createBudgetRoutes();
  const result = routes.updateConfig(message.payload || {});
  send(ws, createResponse(message.id, true, result));
}

async function handleBudgetGetLogs(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createBudgetRoutes } = await import('../routes/budget.js');
  const routes = createBudgetRoutes();
  const logs = routes.getLogs(message.payload || {});
  send(ws, createResponse(message.id, true, logs));
}

// ============================================================================
// AI Handlers
// ============================================================================

async function handleAISendMessage(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { npcId, message: userMessage, conversationId, platform } = message.payload as any;

  if (!npcId || !userMessage) {
    send(ws, createResponse(message.id, false, null, 'Missing npcId or message'));
    return;
  }

  // Send typing indicator
  send(ws, {
    type: 'ai:typing',
    payload: { npcId, isTyping: true },
  });

  try {
    const { generateNPCResponse } = await import('../services/ai.js');

    // Get conversation history (simplified - you'd fetch from DB in real impl)
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    const response = await generateNPCResponse(npcId, userMessage, history, {
      platform: platform || 'chat',
      conversation_id: conversationId,
    });

    // Send response
    send(ws, {
      type: 'ai:response',
      id: message.id,
      payload: {
        npcId,
        message: response,
        conversationId: conversationId || 'new',
      },
    });
  } finally {
    // Clear typing indicator
    send(ws, {
      type: 'ai:typing',
      payload: { npcId, isTyping: false },
    });
  }
}

async function handleAIGeneratePost(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { npcId, platform, prompt } = message.payload as any;

  if (!npcId || !platform) {
    send(ws, createResponse(message.id, false, null, 'Missing npcId or platform'));
    return;
  }

  const { generateNPCPost } = await import('../services/ai.js');
  const content = await generateNPCPost(npcId, platform, prompt);

  send(ws, {
    type: 'ai:postCreated',
    id: message.id,
    payload: {
      npcId,
      platform,
      content,
      postId: `post_${Date.now()}`,
    },
  });
}

// ============================================================================
// Logs Handlers
// ============================================================================

async function handleLogsGetEvents(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createLogsRoutes } = await import('../routes/logs.js');
  const routes = createLogsRoutes();
  const result = routes.getEvents(message.payload || {});
  send(ws, createResponse(message.id, true, result));
}

async function handleLogsGetErrors(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createLogsRoutes } = await import('../routes/logs.js');
  const routes = createLogsRoutes();
  const result = routes.getErrors(message.payload || {});
  send(ws, createResponse(message.id, true, result));
}

async function handleLogsResolveError(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createLogsRoutes } = await import('../routes/logs.js');
  const routes = createLogsRoutes();
  const { errorId, notes } = message.payload as any;

  if (!errorId) {
    send(ws, createResponse(message.id, false, null, 'Missing errorId'));
    return;
  }

  const result = routes.resolveError({ errorId, notes });
  send(ws, createResponse(message.id, true, result));
}

async function handleLogsGetQueue(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createLogsRoutes } = await import('../routes/logs.js');
  const routes = createLogsRoutes();
  const result = routes.getQueueStatus();
  send(ws, createResponse(message.id, true, result));
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

export default {
  handleOpen,
  handleClose,
  handleMessage,
  send,
  broadcast,
  getClientCount,
};
