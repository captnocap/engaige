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

    // AI Provider routes
    case 'aiProvider:getAll':
      await handleAIProviderGetAll(ws, message);
      break;

    case 'aiProvider:getActive':
      await handleAIProviderGetActive(ws, message);
      break;

    case 'aiProvider:create':
      await handleAIProviderCreate(ws, message);
      break;

    case 'aiProvider:update':
      await handleAIProviderUpdate(ws, message);
      break;

    case 'aiProvider:delete':
      await handleAIProviderDelete(ws, message);
      break;

    case 'aiProvider:setActive':
      await handleAIProviderSetActive(ws, message);
      break;

    case 'aiProvider:test':
      await handleAIProviderTest(ws, message);
      break;

    // Onboarding routes
    case 'onboarding:getStatus':
      await handleOnboardingGetStatus(ws, message);
      break;

    case 'onboarding:complete':
      await handleOnboardingComplete(ws, message);
      break;

    case 'onboarding:validateProvider':
      await handleOnboardingValidateProvider(ws, message);
      break;

    case 'onboarding:reset':
      await handleOnboardingReset(ws, message);
      break;

    // NPC routes
    case 'npc:getAll':
      await handleNPCGetAll(ws, message);
      break;

    case 'npc:getById':
      await handleNPCGetById(ws, message);
      break;

    // Player routes
    case 'player:get':
      await handlePlayerGet(ws, message);
      break;

    case 'player:getPreferences':
      await handlePlayerGetPreferences(ws, message);
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
// AI Provider Handlers
// ============================================================================

async function handleAIProviderGetAll(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();
  const result = routes.getAll();
  send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderGetActive(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();
  const result = routes.getActive();
  send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderCreate(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.create(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderUpdate(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.update(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderDelete(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.delete(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderSetActive(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.setActive(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderTest(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createAIProviderRoutes } = await import('../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = await routes.test(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

// ============================================================================
// Onboarding Handlers
// ============================================================================

async function handleOnboardingGetStatus(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { checkOnboardingStatus } = await import('../services/onboarding.js');
  const status = checkOnboardingStatus();
  send(ws, createResponse(message.id, true, status));
}

async function handleOnboardingComplete(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const { completeOnboarding } = await import('../services/onboarding.js');

  // Send progress updates for NPC generation
  const session = clients.get(ws);

  // Broadcast progress during NPC generation
  const onboardingData = message.payload as any;

  console.log(`[WS] Starting onboarding for user: ${onboardingData.profile?.username}`);

  try {
    const result = await completeOnboarding(onboardingData);

    if (result.success) {
      // Broadcast that onboarding completed
      broadcast({
        type: 'onboarding:completed',
        payload: {
          player_id: result.player_id,
          npc_count: result.npc_count,
        },
      });
    }

    send(ws, createResponse(message.id, true, result));
  } catch (err: any) {
    send(ws, createResponse(message.id, false, null, err.message));
  }
}

async function handleOnboardingValidateProvider(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const { validateProviderConfig } = await import('../services/onboarding.js');
  const { provider, model, apiKey, baseUrl } = message.payload as any;

  const result = await validateProviderConfig(provider, model, apiKey, baseUrl);
  send(ws, createResponse(message.id, true, result));
}

async function handleOnboardingReset(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { resetOnboarding } = await import('../services/onboarding.js');
  resetOnboarding();
  send(ws, createResponse(message.id, true, { reset: true }));

  // Broadcast that onboarding was reset
  broadcast({
    type: 'onboarding:reset',
    payload: {},
  });
}

// ============================================================================
// NPC Handlers
// ============================================================================

async function handleNPCGetAll(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { getAllNPCs } = await import('../services/npc.js');
  const includeInactive = (message.payload as any)?.includeInactive ?? false;
  const npcs = getAllNPCs(includeInactive);
  send(ws, createResponse(message.id, true, npcs));
}

async function handleNPCGetById(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    send(ws, createResponse(message.id, false, null, 'Missing NPC id'));
    return;
  }

  const { getNPCById } = await import('../services/npc.js');
  const npc = getNPCById((message.payload as any).id);

  if (!npc) {
    send(ws, createResponse(message.id, false, null, 'NPC not found'));
    return;
  }

  send(ws, createResponse(message.id, true, npc));
}

// ============================================================================
// Player Handlers
// ============================================================================

async function handlePlayerGet(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { getPlayer, getDefaultPlayer } = await import('../services/player.js');

  // If an ID is provided, get that player; otherwise get the default player
  const playerId = (message.payload as any)?.id;
  const player = playerId ? getPlayer(playerId) : getDefaultPlayer();

  if (!player) {
    send(ws, createResponse(message.id, false, null, 'Player not found'));
    return;
  }

  send(ws, createResponse(message.id, true, player));
}

async function handlePlayerGetPreferences(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { getPlayerPreferences, getDefaultPlayer } = await import('../services/player.js');

  // If an ID is provided, use it; otherwise get the default player's ID
  let playerId = (message.payload as any)?.id;

  if (!playerId) {
    const player = getDefaultPlayer();
    if (!player) {
      send(ws, createResponse(message.id, false, null, 'No player found'));
      return;
    }
    playerId = player.id;
  }

  const preferences = getPlayerPreferences(playerId);
  send(ws, createResponse(message.id, true, preferences));
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
