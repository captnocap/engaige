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

async function handleMediaSave(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const payload = (message.payload || {}) as {
    data: string; // base64-encoded file contents
    filename: string;
    mimeType?: string;
    category?: string;
    description?: string;
  };

  if (!payload.data || !payload.filename) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing data or filename'));
    return;
  }

  const { storeMediaFile } = await import('../../services/media.js');

  // Strip data URL prefix if present (e.g. "data:image/png;base64,...")
  const base64 = payload.data.includes(',') ? payload.data.split(',')[1] : payload.data;
  const buffer = Buffer.from(base64, 'base64');

  const file = await storeMediaFile(
    {
      buffer,
      filename: payload.filename,
      mimeType: payload.mimeType || 'image/png',
    },
    {
      owner_type: 'player',
      category: (payload.category as any) || 'upload',
      description: payload.description,
    }
  );

  ctx.send(ws, createResponse(message.id, true, file));
}

async function handleMediaDelete(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const payload = (message.payload || {}) as { id: string };

  if (!payload.id) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing media id'));
    return;
  }

  const { deleteMediaFile } = await import('../../services/media.js');
  const deleted = deleteMediaFile(payload.id);

  ctx.send(ws, createResponse(message.id, true, { deleted }));
}

async function handleMediaGetFilesystem(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getFilesystemStructure } = await import('../../services/media.js');
  const structure = getFilesystemStructure();
  ctx.send(ws, createResponse(message.id, true, structure));
}

export const mediaHandlers: HandlerMap = {
  'media:get': handleMediaGet,
  'media:getAll': handleMediaGetAll,
  'media:save': handleMediaSave,
  'media:delete': handleMediaDelete,
  'media:filesystem': handleMediaGetFilesystem,
};
