/**
 * Media Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleMediaGet(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload || !(message.payload as any).id) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing media id'));
    return;
  }

  const { getMediaFileById } = await import('../../services/media.js');
  const file = getMediaFileById((message.payload as any).id);

  if (!file) {
    ctx.send(ws, createResponse(message.id, false, null, 'Media file not found'));
    return;
  }

  ctx.send(ws, createResponse(message.id, true, file));
}

async function handleMediaGetAll(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getAllMediaFiles, searchMediaFiles } = await import('../../services/media.js');

  const payload = (message.payload || {}) as {
    filters?: {
      category?: string;
      owner_type?: string;
      npc_id?: string;
      search?: string;
    };
    limit?: number;
    offset?: number;
  };

  // If there's a search term, use searchMediaFiles
  if (payload.filters?.search) {
    const files = searchMediaFiles(payload.filters.search);
    ctx.send(ws, createResponse(message.id, true, {
      files,
      total: files.length,
    }));
    return;
  }

  // Otherwise use getAllMediaFiles with filters
  const files = getAllMediaFiles({
    category: payload.filters?.category as any,
    ownerType: payload.filters?.owner_type as any,
    npcId: payload.filters?.npc_id,
    limit: payload.limit || 100,
    offset: payload.offset || 0,
  });

  ctx.send(ws, createResponse(message.id, true, {
    files,
    total: files.length, // Note: For proper pagination, would need a count query
  }));
}

export const mediaHandlers: HandlerMap = {
  'media:get': handleMediaGet,
  'media:getAll': handleMediaGetAll,
};
