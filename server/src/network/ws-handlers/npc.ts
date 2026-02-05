/**
 * NPC Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleNPCGetAll(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getAllNPCs } = await import('../../services/npc.js');
  const includeInactive = (message.payload as any)?.includeInactive ?? false;
  const npcs = getAllNPCs(includeInactive);
  ctx.send(ws, createResponse(message.id, true, npcs));
}

async function handleNPCGetById(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing NPC id'));
    return;
  }

  const { getNPCById } = await import('../../services/npc.js');
  const npc = getNPCById((message.payload as any).id);

  if (!npc) {
    ctx.send(ws, createResponse(message.id, false, null, 'NPC not found'));
    return;
  }

  ctx.send(ws, createResponse(message.id, true, npc));
}

export const npcHandlers: HandlerMap = {
  'npc:getAll': handleNPCGetAll,
  'npc:getById': handleNPCGetById,
};
