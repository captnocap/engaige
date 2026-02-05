/**
 * Logs Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleLogsGetEvents(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createLogsRoutes } = await import('../../routes/logs.js');
  const routes = createLogsRoutes();
  const result = routes.getEvents(message.payload || {});
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleLogsGetErrors(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createLogsRoutes } = await import('../../routes/logs.js');
  const routes = createLogsRoutes();
  const result = routes.getErrors(message.payload || {});
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleLogsResolveError(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createLogsRoutes } = await import('../../routes/logs.js');
  const routes = createLogsRoutes();
  const { errorId, notes } = message.payload as any;

  if (!errorId) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing errorId'));
    return;
  }

  const result = routes.resolveError({ errorId, notes });
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleLogsGetQueue(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createLogsRoutes } = await import('../../routes/logs.js');
  const routes = createLogsRoutes();
  const result = routes.getQueueStatus();
  ctx.send(ws, createResponse(message.id, true, result));
}

export const logsHandlers: HandlerMap = {
  'logs:getEvents': handleLogsGetEvents,
  'logs:getErrors': handleLogsGetErrors,
  'logs:resolveError': handleLogsResolveError,
  'logs:getQueue': handleLogsGetQueue,
};
