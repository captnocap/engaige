/**
 * AI Provider & Image Gen Provider Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

// ============================================================================
// AI Provider Handlers
// ============================================================================

async function handleAIProviderGetAll(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();
  const result = routes.getAll();
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderGetActive(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();
  const result = routes.getActive();
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderCreate(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.create(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderUpdate(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.update(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderDelete(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.delete(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderSetActive(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.setActive(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleAIProviderTest(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createAIProviderRoutes } = await import('../../routes/ai-providers.js');
  const routes = createAIProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = await routes.test(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

// ============================================================================
// Image Generation Provider Handlers
// ============================================================================

async function handleImageGenProviderGetAll(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();
  const result = routes.getAll();
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderGetActive(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();
  const result = routes.getActive();
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderCreate(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.create(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderUpdate(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.update(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderDelete(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.delete(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderSetActive(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = routes.setActive(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleImageGenProviderTest(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createImageGenProviderRoutes } = await import('../../routes/image-gen-providers.js');
  const routes = createImageGenProviderRoutes();

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const result = await routes.test(message.payload as any);
  ctx.send(ws, createResponse(message.id, true, result));
}

// ============================================================================
// Vision Proxy Handlers
// ============================================================================

async function handleVisionProxyGetConfig(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getVisionProxyConfig } = await import('../../services/vision-proxy.js');
  const config = getVisionProxyConfig();
  ctx.send(ws, createResponse(message.id, true, config));
}

async function handleVisionProxySetConfig(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { configureVisionProxy, getVisionProxyConfig } = await import('../../services/vision-proxy.js');

  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  configureVisionProxy(message.payload as any);
  const updated = getVisionProxyConfig();
  ctx.send(ws, createResponse(message.id, true, updated));
}

export const providerHandlers: HandlerMap = {
  // AI Provider
  'aiProvider:getAll': handleAIProviderGetAll,
  'aiProvider:getActive': handleAIProviderGetActive,
  'aiProvider:create': handleAIProviderCreate,
  'aiProvider:update': handleAIProviderUpdate,
  'aiProvider:delete': handleAIProviderDelete,
  'aiProvider:setActive': handleAIProviderSetActive,
  'aiProvider:test': handleAIProviderTest,

  // Image Gen Provider
  'imageGenProvider:getAll': handleImageGenProviderGetAll,
  'imageGenProvider:getActive': handleImageGenProviderGetActive,
  'imageGenProvider:create': handleImageGenProviderCreate,
  'imageGenProvider:update': handleImageGenProviderUpdate,
  'imageGenProvider:delete': handleImageGenProviderDelete,
  'imageGenProvider:setActive': handleImageGenProviderSetActive,
  'imageGenProvider:test': handleImageGenProviderTest,

  // Vision Proxy
  'visionProxy:getConfig': handleVisionProxyGetConfig,
  'visionProxy:setConfig': handleVisionProxySetConfig,
};
