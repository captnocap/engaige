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
  // Account context
  accountId?: string; // Active account for this session
  // Subscription state
  subscribedToThoughts?: boolean;
  thoughtsNpcFilter?: string; // If set, only get thoughts from this NPC
  // World map subscription
  subscribedToWorld?: boolean;
}

// Map of connected clients
const clients = new Map<ServerWebSocket<ClientSession>, ClientSession>();

// Track social subscriptions per client
const socialSubscriptions = new Map<ServerWebSocket<ClientSession>, Set<string>>();

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

    // Account routes
    case 'account:list':
      await handleAccountList(ws, message);
      break;

    case 'account:select':
      await handleAccountSelect(ws, message);
      break;

    case 'account:create':
      await handleAccountCreate(ws, message);
      break;

    case 'account:delete':
      await handleAccountDelete(ws, message);
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

    case 'ai:directChat':
      await handleAIDirectChat(ws, message);
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

    // Image Generation Provider routes
    case 'imageGenProvider:getAll':
      await handleImageGenProviderGetAll(ws, message);
      break;

    case 'imageGenProvider:getActive':
      await handleImageGenProviderGetActive(ws, message);
      break;

    case 'imageGenProvider:create':
      await handleImageGenProviderCreate(ws, message);
      break;

    case 'imageGenProvider:update':
      await handleImageGenProviderUpdate(ws, message);
      break;

    case 'imageGenProvider:delete':
      await handleImageGenProviderDelete(ws, message);
      break;

    case 'imageGenProvider:setActive':
      await handleImageGenProviderSetActive(ws, message);
      break;

    case 'imageGenProvider:test':
      await handleImageGenProviderTest(ws, message);
      break;

    // Vision proxy routes
    case 'visionProxy:getConfig':
      await handleVisionProxyGetConfig(ws, message);
      break;

    case 'visionProxy:setConfig':
      await handleVisionProxySetConfig(ws, message);
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

    // NPC Thoughts routes
    case 'thoughts:get':
      await handleThoughtsGet(ws, message);
      break;

    case 'thoughts:subscribe':
      handleThoughtsSubscribe(ws, message);
      break;

    case 'thoughts:unsubscribe':
      handleThoughtsUnsubscribe(ws, message);
      break;

    // Chess routes
    case 'chess:challengeNPC':
      await handleChessChallengeNPC(ws, message);
      break;

    case 'chess:makeMove':
      await handleChessMakeMove(ws, message);
      break;

    case 'chess:resign':
      await handleChessResign(ws, message);
      break;

    case 'chess:getLeaderboard':
      await handleChessGetLeaderboard(ws, message);
      break;

    case 'chess:getMatch':
      await handleChessGetMatch(ws, message);
      break;

    case 'chess:getActiveMatches':
      await handleChessGetActiveMatches(ws, message);
      break;

    case 'chess:getMatchHistory':
      await handleChessGetMatchHistory(ws, message);
      break;

    // World Map routes
    case 'world:getState':
      await handleWorldGetState(ws, message);
      break;

    case 'world:subscribe':
      handleWorldSubscribe(ws, message);
      break;

    case 'world:unsubscribe':
      handleWorldUnsubscribe(ws, message);
      break;

    case 'world:getBackgroundNPCs':
      await handleWorldGetBackgroundNPCs(ws, message);
      break;

    case 'world:pauseTime':
      await handleWorldPauseTime(ws, message);
      break;

    case 'world:resumeTime':
      await handleWorldResumeTime(ws, message);
      break;

    case 'world:setTimeMultiplier':
      await handleWorldSetTimeMultiplier(ws, message);
      break;

    // Guardrails routes
    case 'guardrails:getRating':
      handleGuardrailsGetRating(ws, message);
      break;

    case 'guardrails:setRating':
      handleGuardrailsSetRating(ws, message);
      break;

    case 'guardrails:getConfig':
      handleGuardrailsGetConfig(ws, message);
      break;

    // Search routes
    case 'search:query':
      await handleSearchQuery(ws, message);
      break;

    case 'search:autocomplete':
      await handleSearchAutocomplete(ws, message);
      break;

    case 'search:getStats':
      await handleSearchGetStats(ws, message);
      break;

    // Social routes
    case 'social:getFeed':
      await handleSocialGetFeed(ws, message);
      break;

    case 'social:getPost':
      await handleSocialGetPost(ws, message);
      break;

    case 'social:createPost':
      await handleSocialCreatePost(ws, message);
      break;

    case 'social:likePost':
      await handleSocialLikePost(ws, message);
      break;

    case 'social:unlikePost':
      await handleSocialUnlikePost(ws, message);
      break;

    case 'social:addComment':
      await handleSocialAddComment(ws, message);
      break;

    case 'social:markSeen':
      await handleSocialMarkSeen(ws, message);
      break;

    case 'social:getUnseen':
      await handleSocialGetUnseen(ws, message);
      break;

    case 'social:getProfile':
      await handleSocialGetProfile(ws, message);
      break;

    case 'social:subscribe':
      handleSocialSubscribe(ws, message);
      break;

    case 'social:unsubscribe':
      handleSocialUnsubscribe(ws, message);
      break;

    default:
      send(ws, createError(`Unknown message type: ${(message as WSMessage).type}`, 'UNKNOWN_TYPE', message.id));
  }
}

// ============================================================================
// Account Handlers
// ============================================================================

async function handleAccountList(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { listAccounts } = await import('../services/account.js');
  const accounts = listAccounts();
  send(ws, createResponse(message.id, true, { accounts }));
}

async function handleAccountSelect(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    send(ws, createResponse(message.id, false, null, 'Missing account id'));
    return;
  }

  const { setActiveAccount, getAccount } = await import('../services/account.js');
  const accountId = (message.payload as any).id;

  const success = setActiveAccount(accountId);
  if (!success) {
    send(ws, createResponse(message.id, false, null, 'Account not found'));
    return;
  }

  // Update session with account context
  const session = clients.get(ws);
  if (session) {
    session.accountId = accountId;
  }

  const account = getAccount(accountId);
  send(ws, createResponse(message.id, true, account));
}

async function handleAccountCreate(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const { createAccount } = await import('../services/account.js');
  const options = message.payload as { name: string; copyFrom?: { accountId: string; mode: 'everything' | 'settings_only' } };

  if (!options.name) {
    send(ws, createResponse(message.id, false, null, 'Missing account name'));
    return;
  }

  try {
    const account = createAccount(options);
    send(ws, createResponse(message.id, true, account));
  } catch (err: any) {
    send(ws, createResponse(message.id, false, null, err.message || 'Failed to create account'));
  }
}

async function handleAccountDelete(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    send(ws, createResponse(message.id, false, null, 'Missing account id'));
    return;
  }

  const { deleteAccount } = await import('../services/account.js');
  const accountId = (message.payload as any).id;

  try {
    const success = deleteAccount(accountId);
    if (!success) {
      send(ws, createResponse(message.id, false, null, 'Account not found'));
      return;
    }

    // Clear session account if it was deleted
    const session = clients.get(ws);
    if (session?.accountId === accountId) {
      session.accountId = undefined;
    }

    send(ws, createResponse(message.id, true, { deleted: true }));
  } catch (err: any) {
    send(ws, createResponse(message.id, false, null, err.message || 'Failed to delete account'));
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

async function handleAIDirectChat(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { message: userMessage, conversationId, history, modes } = message.payload as any;

  if (!userMessage) {
    send(ws, createResponse(message.id, false, null, 'Missing message'));
    return;
  }

  try {
    const { generateDirectChatResponse } = await import('../services/direct-chat.js');

    const result = await generateDirectChatResponse({
      message: userMessage,
      conversationId,
      history,
      modes,
    });

    send(ws, {
      type: 'ai:directChatResponse',
      id: message.id,
      payload: result,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[WS] Direct chat error:', err.message);

    send(ws, createResponse(message.id, false, null, err.message));
  }
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
// Image Generation Provider Handlers
// ============================================================================

async function handleImageGenProviderGetAll(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();
  const result = routes.getAll();
  send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderGetActive(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();
  const result = routes.getActive();
  send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderCreate(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.create(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderUpdate(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.update(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderDelete(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.delete(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderSetActive(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.setActive(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderTest(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = await routes.test(message.payload as any);
  send(ws, createResponse(message.id, true, result));
}

// ============================================================================
// Vision Proxy Handlers
// ============================================================================

async function handleVisionProxyGetConfig(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { getVisionProxyConfig } = await import('../services/vision-proxy.js');
  const config = getVisionProxyConfig();
  send(ws, createResponse(message.id, true, config));
}

async function handleVisionProxySetConfig(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { configureVisionProxy, getVisionProxyConfig } = await import('../services/vision-proxy.js');

  if (!message.payload) {
    send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  configureVisionProxy(message.payload as any);
  const updated = getVisionProxyConfig();
  send(ws, createResponse(message.id, true, updated));
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
// NPC Thoughts Handlers
// ============================================================================

async function handleThoughtsGet(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  const { getNPCThoughts, getAllNPCThoughts } = await import('../services/reasoning-extractor.js');
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

  send(ws, createResponse(message.id, true, thoughts));
}

function handleThoughtsSubscribe(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const session = clients.get(ws);
  if (session) {
    session.subscribedToThoughts = true;
    session.thoughtsNpcFilter = (message.payload as any)?.npcId;
    console.log(`[WS] Client ${session.id} subscribed to thoughts${session.thoughtsNpcFilter ? ` (NPC: ${session.thoughtsNpcFilter})` : ''}`);
  }
  send(ws, createResponse(message.id, true, { subscribed: true }));
}

function handleThoughtsUnsubscribe(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const session = clients.get(ws);
  if (session) {
    session.subscribedToThoughts = false;
    session.thoughtsNpcFilter = undefined;
    console.log(`[WS] Client ${session.id} unsubscribed from thoughts`);
  }
  send(ws, createResponse(message.id, true, { subscribed: false }));
}

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
  for (const [ws, session] of clients.entries()) {
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
export function broadcastDeliberationStarted(data: {
  npc_id: string;
  npc_display_name: string;
  target_loops: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  reason: string;
  conversation_id?: string;
}): void {
  for (const [ws, session] of clients.entries()) {
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
export function broadcastDeliberationCompleted(data: {
  npc_id: string;
  npc_display_name: string;
  loops_completed: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  total_time_ms: number;
  thought_count: number;
  conversation_id?: string;
}): void {
  for (const [ws, session] of clients.entries()) {
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

// ============================================================================
// Chess Handlers
// ============================================================================

/**
 * Handle chess:challengeNPC
 */
async function handleChessChallengeNPC(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { challengeNPC } = await import('../services/chess-matchmaker.js');
    const payload = message.payload as { npc_id: string };

    if (!payload?.npc_id) {
      send(ws, createError('Missing npc_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const match = challengeNPC('player', payload.npc_id);

    if (!match) {
      send(ws, createError('NPC is unavailable for chess', 'NPC_UNAVAILABLE', message.id));
      return;
    }

    send(ws, createResponse(message.id, true, match));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessChallengeNPC',
    });
    send(ws, createError('Failed to challenge NPC', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle chess:makeMove
 */
async function handleChessMakeMove(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { makeMove } = await import('../services/chess.js');
    const payload = message.payload as { match_id: string; move: string };

    if (!payload?.match_id || !payload?.move) {
      send(ws, createError('Missing match_id or move', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const result = makeMove(payload.match_id, 'player', payload.move);

    if (!result.success) {
      send(ws, createError(result.error || 'Move failed', 'MOVE_FAILED', message.id));
      return;
    }

    send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessMakeMove',
    });
    send(ws, createError('Failed to make move', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle chess:resign
 */
async function handleChessResign(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { resignMatch } = await import('../services/chess.js');
    const payload = message.payload as { match_id: string };

    if (!payload?.match_id) {
      send(ws, createError('Missing match_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const success = resignMatch(payload.match_id, 'player');

    if (!success) {
      send(ws, createError('Failed to resign match', 'RESIGN_FAILED', message.id));
      return;
    }

    send(ws, createResponse(message.id, true, { resigned: true }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessResign',
    });
    send(ws, createError('Failed to resign', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle chess:getLeaderboard
 */
async function handleChessGetLeaderboard(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getGlobalLeaderboard } = await import('../services/chess-leaderboard.js');
    const payload = message.payload as { limit?: number };

    const leaderboard = getGlobalLeaderboard(payload?.limit || 20);

    send(ws, createResponse(message.id, true, leaderboard));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetLeaderboard',
    });
    send(ws, createError('Failed to get leaderboard', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle chess:getMatch
 */
async function handleChessGetMatch(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getMatch } = await import('../services/chess.js');
    const payload = message.payload as { match_id: string };

    if (!payload?.match_id) {
      send(ws, createError('Missing match_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const match = getMatch(payload.match_id);

    if (!match) {
      send(ws, createError('Match not found', 'NOT_FOUND', message.id));
      return;
    }

    send(ws, createResponse(message.id, true, match));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetMatch',
    });
    send(ws, createError('Failed to get match', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle chess:getActiveMatches
 */
async function handleChessGetActiveMatches(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getActiveMatches } = await import('../services/chess.js');

    const matches = getActiveMatches('player', 'player');

    send(ws, createResponse(message.id, true, matches));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetActiveMatches',
    });
    send(ws, createError('Failed to get active matches', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle chess:getMatchHistory
 */
async function handleChessGetMatchHistory(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getMatchHistory } = await import('../services/chess.js');
    const payload = message.payload as { limit?: number };

    const history = getMatchHistory('player', 'player', payload?.limit || 25);

    send(ws, createResponse(message.id, true, history));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetMatchHistory',
    });
    send(ws, createError('Failed to get match history', 'INTERNAL_ERROR', message.id));
  }
}

// ============================================================================
// World Map Handlers
// ============================================================================

/**
 * Handle world:getState - Get full world state snapshot
 */
async function handleWorldGetState(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { worldState, npcLocation, backgroundNPCs } = await import('../services/world/index.js');

    // Ensure world is initialized
    await worldState.initialize();

    const city = worldState.getCity();
    if (!city) {
      send(ws, createError('World not initialized', 'WORLD_NOT_READY', message.id));
      return;
    }

    const gameTime = worldState.getGameTime();
    const aiNPCLocations = await npcLocation.getAllNPCLocations();

    // Get a player home building (first residential building for now)
    const residentialBuildings = worldState.getResidentialBuildings();
    const playerHome = residentialBuildings[0] ? {
      buildingId: residentialBuildings[0].id,
      position: residentialBuildings[0].position,
    } : undefined;

    const payload = {
      city: {
        name: city.name,
        bounds: city.bounds,
        tileSize: city.tileSize,
        gridSize: city.gridSize,
        districts: city.districts,
        buildings: city.buildings.map(b => ({
          id: b.id,
          name: b.name,
          type: b.type,
          districtId: b.districtId,
          position: b.position,
          size: b.size,
          spriteId: b.spriteId,
          capacity: b.capacity,
          isResidential: b.isResidential,
          isWorkplace: b.isWorkplace,
        })),
        landmarks: city.landmarks,
      },
      gameTime,
      timeMultiplier: worldState.getTimeMultiplier(),
      isPaused: worldState.isTimePaused(),
      aiNPCs: aiNPCLocations.map(loc => ({
        npcId: loc.npcId,
        position: loc.position,
        buildingId: loc.buildingId,
        activity: loc.activity,
        activityDescription: loc.activityDescription,
      })),
      backgroundNPCCount: backgroundNPCs.getTotalCount(),
      playerHome,
    };

    send(ws, createResponse(message.id, true, payload));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldGetState',
    });
    send(ws, createError('Failed to get world state', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle world:subscribe - Subscribe to world updates
 */
function handleWorldSubscribe(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const session = clients.get(ws);
  if (session) {
    session.subscribedToWorld = true;
    console.log(`[WS] Client ${session.id} subscribed to world updates`);
  }
  send(ws, createResponse(message.id, true, { subscribed: true }));
}

/**
 * Handle world:unsubscribe - Unsubscribe from world updates
 */
function handleWorldUnsubscribe(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const session = clients.get(ws);
  if (session) {
    session.subscribedToWorld = false;
    console.log(`[WS] Client ${session.id} unsubscribed from world updates`);
  }
  send(ws, createResponse(message.id, true, { subscribed: false }));
}

/**
 * Handle world:getBackgroundNPCs - Get background NPCs in viewport
 */
async function handleWorldGetBackgroundNPCs(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { worldState, backgroundNPCs } = await import('../services/world/index.js');
    const payload = message.payload as {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    };

    if (payload?.minX === undefined || payload?.maxX === undefined ||
        payload?.minY === undefined || payload?.maxY === undefined) {
      send(ws, createError('Missing viewport bounds', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const gameTime = worldState.getGameTime();
    const npcs = backgroundNPCs.getNPCsInViewport(payload, gameTime);

    send(ws, createResponse(message.id, true, {
      npcs: npcs.map(npc => ({
        id: npc.id,
        name: npc.name,
        appearanceSeed: npc.appearanceSeed,
        position: npc.currentPosition,
        state: npc.state,
        activityLabel: npc.activityLabel,
      })),
      viewportBounds: payload,
    }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldGetBackgroundNPCs',
    });
    send(ws, createError('Failed to get background NPCs', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle world:pauseTime - Pause game time
 */
async function handleWorldPauseTime(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { worldState } = await import('../services/world/index.js');
    worldState.pauseTime();

    // Broadcast to all subscribed clients
    broadcastWorldTimeUpdate();

    send(ws, createResponse(message.id, true, { paused: true }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldPauseTime',
    });
    send(ws, createError('Failed to pause time', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle world:resumeTime - Resume game time
 */
async function handleWorldResumeTime(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { worldState } = await import('../services/world/index.js');
    worldState.resumeTime();

    // Broadcast to all subscribed clients
    broadcastWorldTimeUpdate();

    send(ws, createResponse(message.id, true, { paused: false }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldResumeTime',
    });
    send(ws, createError('Failed to resume time', 'INTERNAL_ERROR', message.id));
  }
}

/**
 * Handle world:setTimeMultiplier - Set game time speed
 */
async function handleWorldSetTimeMultiplier(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { worldState } = await import('../services/world/index.js');
    const payload = message.payload as { multiplier: number };

    if (!payload?.multiplier || payload.multiplier < 1 || payload.multiplier > 60) {
      send(ws, createError('Invalid multiplier (must be 1-60)', 'INVALID_PAYLOAD', message.id));
      return;
    }

    worldState.setTimeMultiplier(payload.multiplier);

    // Broadcast to all subscribed clients
    broadcastWorldTimeUpdate();

    send(ws, createResponse(message.id, true, { multiplier: payload.multiplier }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldSetTimeMultiplier',
    });
    send(ws, createError('Failed to set time multiplier', 'INTERNAL_ERROR', message.id));
  }
}

// ============================================================================
// Guardrails Handlers
// ============================================================================

/**
 * Handle guardrails:getRating - Get current content rating
 */
function handleGuardrailsGetRating(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const { getPlayerContentRating } = require('../services/guardrails.js');

  const session = clients.get(ws);
  const playerId = session?.accountId || 'player';

  const rating = getPlayerContentRating(playerId);
  send(ws, createResponse(message.id, true, { rating }));
}

/**
 * Handle guardrails:setRating - Set content rating
 */
function handleGuardrailsSetRating(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const { setPlayerContentRating, isValidRating, getGuardrailConfig, isMoreRestrictive, getPlayerContentRating } = require('../services/guardrails.js');

  const payload = message.payload as { rating: string };

  if (!payload?.rating || !isValidRating(payload.rating)) {
    send(ws, createError('Invalid content rating', 'INVALID_PAYLOAD', message.id));
    return;
  }

  const session = clients.get(ws);
  const playerId = session?.accountId || 'player';

  const oldRating = getPlayerContentRating(playerId);
  setPlayerContentRating(playerId, payload.rating);

  const config = getGuardrailConfig(payload.rating);

  // Broadcast rating change to all clients
  broadcast({
    type: 'guardrails:ratingChanged',
    payload: {
      old_rating: oldRating,
      new_rating: payload.rating,
      is_more_restrictive: isMoreRestrictive(payload.rating, oldRating),
    },
  });

  send(ws, createResponse(message.id, true, {
    rating: payload.rating,
    config,
  }));
}

/**
 * Handle guardrails:getConfig - Get full guardrail config for current rating
 */
function handleGuardrailsGetConfig(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const { getPlayerContentRating, getGuardrailConfig, getAllRatings, getRatingDisplayInfo } = require('../services/guardrails.js');

  const session = clients.get(ws);
  const playerId = session?.accountId || 'player';

  const currentRating = getPlayerContentRating(playerId);
  const config = getGuardrailConfig(currentRating);

  // Also include all available ratings with their display info
  const allRatings = getAllRatings().map((rating: string) => ({
    value: rating,
    ...getRatingDisplayInfo(rating),
  }));

  send(ws, createResponse(message.id, true, {
    currentRating,
    config,
    allRatings,
  }));
}

/**
 * Broadcast world time update to all subscribed clients
 */
export async function broadcastWorldTimeUpdate(): Promise<void> {
  try {
    const { worldState } = await import('../services/world/index.js');
    const gameTime = worldState.getGameTime();

    const data = serializeMessage({
      type: 'world:timeUpdate',
      payload: {
        gameTime,
        formattedTime: worldState.getFormattedTime(),
        formattedDateTime: worldState.getFormattedDateTime(),
      },
    });

    for (const [ws, session] of clients.entries()) {
      if (!session.subscribedToWorld) continue;

      try {
        ws.send(data);
      } catch (err) {
        errorLogger.log(err, {
          source: 'ws-server',
          operation: 'broadcastWorldTimeUpdate',
          session_id: session.id,
        });
      }
    }
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'broadcastWorldTimeUpdate',
    });
  }
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
  const message = serializeMessage({
    type: 'world:npcMoved',
    payload: data,
  });

  for (const [ws, session] of clients.entries()) {
    if (!session.subscribedToWorld) continue;

    try {
      ws.send(message);
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastNPCMoved',
        session_id: session.id,
      });
    }
  }
}

// ============================================================================
// Social Handlers
// ============================================================================

/**
 * Handle social:getFeed - Get posts for a platform
 */
async function handleSocialGetFeed(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getFeed } = await import('../services/social.js');
    const payload = (message.payload || {}) as { platform?: string; limit?: number };

    const posts = getFeed(payload.platform, payload.limit || 50);
    send(ws, createResponse(message.id, true, { posts }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetFeed',
    });
    send(ws, createError('Failed to get feed', 'FEED_ERROR', message.id));
  }
}

/**
 * Handle social:getPost - Get a single post with details
 */
async function handleSocialGetPost(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getPost } = await import('../services/social.js');
    const payload = (message.payload || {}) as { postId: string };

    if (!payload.postId) {
      send(ws, createResponse(message.id, false, null, 'Missing postId'));
      return;
    }

    const post = getPost(payload.postId);
    if (!post) {
      send(ws, createResponse(message.id, false, null, 'Post not found'));
      return;
    }

    send(ws, createResponse(message.id, true, post));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetPost',
    });
    send(ws, createError('Failed to get post', 'POST_ERROR', message.id));
  }
}

/**
 * Handle social:createPost - Create a new post
 */
async function handleSocialCreatePost(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { createPost } = await import('../services/social.js');
    const payload = message.payload as {
      authorId: string;
      authorType: 'player' | 'npc';
      platform: 'myface' | 'chirp' | 'instasnap';
      content: string;
      mediaUrls?: string[];
      contentRating?: string;
    };

    if (!payload.authorId || !payload.platform || !payload.content) {
      send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const post = await createPost(payload);

    // Broadcast to subscribed clients
    broadcastSocialEvent('social:postCreated', { post });

    send(ws, createResponse(message.id, true, post));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialCreatePost',
    });
    send(ws, createError('Failed to create post', 'CREATE_ERROR', message.id));
  }
}

/**
 * Handle social:likePost - Like a post
 */
async function handleSocialLikePost(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { likePost, getPost } = await import('../services/social.js');
    const payload = message.payload as {
      postId: string;
      likerId: string;
      likerType: 'player' | 'npc';
    };

    if (!payload.postId || !payload.likerId) {
      send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = await likePost(payload.postId, payload.likerId, payload.likerType || 'player');

    if (success) {
      const post = getPost(payload.postId);
      broadcastSocialEvent('social:postLiked', {
        postId: payload.postId,
        likerId: payload.likerId,
        likerType: payload.likerType || 'player',
        newLikesCount: post?.likesCount || 0,
      });
    }

    send(ws, createResponse(message.id, true, { liked: success }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialLikePost',
    });
    send(ws, createError('Failed to like post', 'LIKE_ERROR', message.id));
  }
}

/**
 * Handle social:unlikePost - Unlike a post
 */
async function handleSocialUnlikePost(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { unlikePost, getPost } = await import('../services/social.js');
    const payload = message.payload as {
      postId: string;
      likerId: string;
    };

    if (!payload.postId || !payload.likerId) {
      send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = unlikePost(payload.postId, payload.likerId);

    if (success) {
      const post = getPost(payload.postId);
      broadcastSocialEvent('social:postUnliked', {
        postId: payload.postId,
        likerId: payload.likerId,
        newLikesCount: post?.likesCount || 0,
      });
    }

    send(ws, createResponse(message.id, true, { unliked: success }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialUnlikePost',
    });
    send(ws, createError('Failed to unlike post', 'UNLIKE_ERROR', message.id));
  }
}

/**
 * Handle social:addComment - Add a comment to a post
 */
async function handleSocialAddComment(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { addComment } = await import('../services/social.js');
    const payload = message.payload as {
      postId: string;
      authorId: string;
      authorType: 'player' | 'npc';
      content: string;
      parentCommentId?: string;
    };

    if (!payload.postId || !payload.authorId || !payload.content) {
      send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const comment = await addComment(payload);

    broadcastSocialEvent('social:commentAdded', {
      postId: payload.postId,
      comment,
    });

    send(ws, createResponse(message.id, true, comment));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialAddComment',
    });
    send(ws, createError('Failed to add comment', 'COMMENT_ERROR', message.id));
  }
}

/**
 * Handle social:markSeen - Mark a post as seen
 */
async function handleSocialMarkSeen(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { markPostAsSeen } = await import('../services/social.js');
    const payload = message.payload as {
      postId: string;
      viewerId: string;
      viewerType: 'player' | 'npc';
      platform?: string;
    };

    if (!payload.postId || !payload.viewerId) {
      send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = markPostAsSeen(
      payload.postId,
      payload.viewerId,
      payload.viewerType || 'player',
      payload.platform
    );

    send(ws, createResponse(message.id, true, { marked: success }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialMarkSeen',
    });
    send(ws, createError('Failed to mark post as seen', 'MARK_SEEN_ERROR', message.id));
  }
}

/**
 * Handle social:getUnseen - Get unseen posts for a viewer
 */
async function handleSocialGetUnseen(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getUnseenPosts } = await import('../services/social.js');
    const payload = (message.payload || {}) as {
      viewerId: string;
      platform?: string;
      limit?: number;
    };

    if (!payload.viewerId) {
      send(ws, createResponse(message.id, false, null, 'Missing viewerId'));
      return;
    }

    const posts = getUnseenPosts(payload.viewerId, payload.platform, payload.limit || 50);
    send(ws, createResponse(message.id, true, { posts }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetUnseen',
    });
    send(ws, createError('Failed to get unseen posts', 'UNSEEN_ERROR', message.id));
  }
}

/**
 * Handle social:getProfile - Get a social profile
 */
async function handleSocialGetProfile(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { getProfile, recordProfileView } = await import('../services/social.js');
    const payload = (message.payload || {}) as {
      profileId: string;
      viewerId?: string;
      viewerType?: 'player' | 'npc';
      platform?: string;
    };

    if (!payload.profileId) {
      send(ws, createResponse(message.id, false, null, 'Missing profileId'));
      return;
    }

    const profile = getProfile(payload.profileId);
    if (!profile) {
      send(ws, createResponse(message.id, false, null, 'Profile not found'));
      return;
    }

    // Record the view if viewer info provided
    if (payload.viewerId && payload.platform) {
      await recordProfileView(
        payload.profileId,
        payload.viewerId,
        payload.viewerType || 'player',
        payload.platform
      );
    }

    send(ws, createResponse(message.id, true, profile));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetProfile',
    });
    send(ws, createError('Failed to get profile', 'PROFILE_ERROR', message.id));
  }
}

/**
 * Handle social:subscribe - Subscribe to social updates
 */
function handleSocialSubscribe(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const payload = (message.payload || {}) as { platforms?: string[] };

  let subs = socialSubscriptions.get(ws);
  if (!subs) {
    subs = new Set();
    socialSubscriptions.set(ws, subs);
  }

  // Subscribe to all platforms if none specified
  const platforms = payload.platforms || ['myface', 'chirp', 'instasnap'];
  platforms.forEach(p => subs!.add(p));

  const session = clients.get(ws);
  console.log(`[WS] Client ${session?.id} subscribed to social: ${platforms.join(', ')}`);

  send(ws, createResponse(message.id, true, { subscribed: true, platforms }));
}

/**
 * Handle social:unsubscribe - Unsubscribe from social updates
 */
function handleSocialUnsubscribe(ws: ServerWebSocket<ClientSession>, message: WSMessage): void {
  const payload = (message.payload || {}) as { platforms?: string[] };

  const subs = socialSubscriptions.get(ws);
  if (subs) {
    if (payload.platforms) {
      payload.platforms.forEach(p => subs.delete(p));
    } else {
      socialSubscriptions.delete(ws);
    }
  }

  const session = clients.get(ws);
  console.log(`[WS] Client ${session?.id} unsubscribed from social`);

  send(ws, createResponse(message.id, true, { subscribed: false }));
}

/**
 * Broadcast a social event to subscribed clients
 */
export function broadcastSocialEvent(type: string, payload: any): void {
  const data = serializeMessage({ type, payload });

  for (const [ws, subs] of socialSubscriptions.entries()) {
    // Check if client is subscribed to any platform
    if (subs.size === 0) continue;

    const session = clients.get(ws);
    try {
      ws.send(data);
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastSocialEvent',
        session_id: session?.id,
        metadata: { event_type: type },
      });
    }
  }
}

// ============================================================================
// Search Handlers
// ============================================================================

/**
 * Handle search:query - Execute a search query
 */
async function handleSearchQuery(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { searchService } = await import('../services/search.js');
    const payload = (message.payload || {}) as {
      query: string;
      domain?: string;
      contentType?: string;
      limit?: number;
      offset?: number;
    };

    if (!payload.query || typeof payload.query !== 'string') {
      send(ws, createResponse(message.id, false, null, 'Missing or invalid query'));
      return;
    }

    const result = await searchService.search({
      query: payload.query,
      domain: payload.domain,
      contentType: payload.contentType,
      limit: payload.limit,
      offset: payload.offset,
    });

    send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSearchQuery',
    });
    send(ws, createError('Search failed', 'SEARCH_ERROR', message.id));
  }
}

/**
 * Handle search:autocomplete - Get autocomplete suggestions
 */
async function handleSearchAutocomplete(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { searchService } = await import('../services/search.js');
    const payload = (message.payload || {}) as {
      prefix: string;
      limit?: number;
    };

    if (!payload.prefix || typeof payload.prefix !== 'string') {
      send(ws, createResponse(message.id, true, { prefix: '', suggestions: [] }));
      return;
    }

    const result = await searchService.autocomplete(payload.prefix, payload.limit);
    send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSearchAutocomplete',
    });
    send(ws, createResponse(message.id, true, { prefix: '', suggestions: [] }));
  }
}

/**
 * Handle search:getStats - Get search index statistics
 */
async function handleSearchGetStats(ws: ServerWebSocket<ClientSession>, message: WSMessage): Promise<void> {
  try {
    const { searchService } = await import('../services/search.js');
    const stats = await searchService.getStats();
    send(ws, createResponse(message.id, true, stats));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSearchGetStats',
    });
    send(ws, createError('Failed to get search stats', 'STATS_ERROR', message.id));
  }
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
  broadcastThought,
  broadcastDeliberationStarted,
  broadcastDeliberationCompleted,
  broadcastWorldTimeUpdate,
  broadcastNPCMoved,
  broadcastSocialEvent,
  getClientCount,
};
