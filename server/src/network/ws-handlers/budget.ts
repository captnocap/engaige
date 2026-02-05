/**
 * Budget Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleBudgetGetStatus(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createBudgetRoutes } = await import('../../routes/budget.js');
  const routes = createBudgetRoutes();
  const status = routes.getStatus();
  ctx.send(ws, createResponse(message.id, true, status));
}

async function handleBudgetGetConfig(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createBudgetRoutes } = await import('../../routes/budget.js');
  const routes = createBudgetRoutes();
  const config = routes.getConfig();
  ctx.send(ws, createResponse(message.id, true, config));
}

async function handleBudgetUpdateConfig(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createBudgetRoutes } = await import('../../routes/budget.js');
  const routes = createBudgetRoutes();
  const result = routes.updateConfig(message.payload || {});
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleBudgetGetLogs(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { createBudgetRoutes } = await import('../../routes/budget.js');
  const routes = createBudgetRoutes();
  const logs = routes.getLogs(message.payload || {});
  ctx.send(ws, createResponse(message.id, true, logs));
}

export const budgetHandlers: HandlerMap = {
  'budget:getStatus': handleBudgetGetStatus,
  'budget:getConfig': handleBudgetGetConfig,
  'budget:updateConfig': handleBudgetUpdateConfig,
  'budget:getLogs': handleBudgetGetLogs,
};
