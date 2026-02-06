/**
 * Export/Import Handlers - NPC and conversation export/import
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleExportConversation(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { exportConversationToMarkdown } = await import('../../services/export.js');
    const payload = message.payload as { conversationId: string };

    if (!payload?.conversationId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing conversationId'));
      return;
    }

    const markdown = await exportConversationToMarkdown(payload.conversationId);
    ctx.send(ws, createResponse(message.id, true, { markdown }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleExportConversation' });
    ctx.send(ws, createError('Failed to export conversation', 'EXPORT_ERROR', message.id));
  }
}

async function handleExportNPC(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { exportNPCWithData } = await import('../../services/export.js');
    const payload = message.payload as { npcId: string; playerId?: string };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    const exportData = await exportNPCWithData(payload.npcId, payload.playerId);
    ctx.send(ws, createResponse(message.id, true, { exportData }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleExportNPC' });
    ctx.send(ws, createError('Failed to export NPC', 'EXPORT_ERROR', message.id));
  }
}

async function handleImportNPC(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { importNPCFromExport } = await import('../../services/export.js');
    const payload = message.payload as {
      filepath: string;
      renameOnConflict?: boolean;
    };

    if (!payload?.filepath) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing filepath'));
      return;
    }

    const npc = await importNPCFromExport(payload.filepath, {
      renameOnConflict: payload.renameOnConflict,
    });
    ctx.send(ws, createResponse(message.id, true, { npc }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleImportNPC' });
    ctx.send(ws, createError('Failed to import NPC', 'IMPORT_ERROR', message.id));
  }
}

async function handleExportGameState(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { exportGameState } = await import('../../services/export.js');
    const payload = message.payload as { playerId: string };

    if (!payload?.playerId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing playerId'));
      return;
    }

    const gameState = await exportGameState(payload.playerId);
    ctx.send(ws, createResponse(message.id, true, { gameState }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleExportGameState' });
    ctx.send(ws, createError('Failed to export game state', 'EXPORT_ERROR', message.id));
  }
}

export const exportHandlers: HandlerMap = {
  'export:conversation': handleExportConversation,
  'export:npc': handleExportNPC,
  'export:gameState': handleExportGameState,
  'import:npc': handleImportNPC,
};
