/**
 * Account Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleAccountList(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { listAccounts } = await import('../../services/account.js');
  const accounts = listAccounts();
  ctx.send(ws, createResponse(message.id, true, { accounts }));
}

async function handleAccountSelect(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing account id'));
    return;
  }

  const { setActiveAccount, getAccount } = await import('../../services/account.js');
  const accountId = (message.payload as any).id;

  const success = setActiveAccount(accountId);
  if (!success) {
    ctx.send(ws, createResponse(message.id, false, null, 'Account not found'));
    return;
  }

  // Update session with account context
  const session = ctx.clients.get(ws);
  if (session) {
    session.accountId = accountId;
  }

  const account = getAccount(accountId);
  ctx.send(ws, createResponse(message.id, true, account));
}

async function handleAccountCreate(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const { createAccount } = await import('../../services/account.js');
  const options = message.payload as { name: string; copyFrom?: { accountId: string; mode: 'everything' | 'settings_only' } };

  if (!options.name) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing account name'));
    return;
  }

  try {
    const account = createAccount(options);
    ctx.send(ws, createResponse(message.id, true, account));
  } catch (err: any) {
    ctx.send(ws, createResponse(message.id, false, null, err.message || 'Failed to create account'));
  }
}

async function handleAccountDelete(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing account id'));
    return;
  }

  const { deleteAccount } = await import('../../services/account.js');
  const accountId = (message.payload as any).id;

  try {
    const success = deleteAccount(accountId);
    if (!success) {
      ctx.send(ws, createResponse(message.id, false, null, 'Account not found'));
      return;
    }

    // Clear session account if it was deleted
    const session = ctx.clients.get(ws);
    if (session?.accountId === accountId) {
      session.accountId = undefined;
    }

    ctx.send(ws, createResponse(message.id, true, { deleted: true }));
  } catch (err: any) {
    ctx.send(ws, createResponse(message.id, false, null, err.message || 'Failed to delete account'));
  }
}

export const accountHandlers: HandlerMap = {
  'account:list': handleAccountList,
  'account:select': handleAccountSelect,
  'account:create': handleAccountCreate,
  'account:delete': handleAccountDelete,
};
