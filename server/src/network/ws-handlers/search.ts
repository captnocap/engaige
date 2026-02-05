/**
 * Search Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleSearchQuery(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { searchService } = await import('../../services/search.js');
    const payload = (message.payload || {}) as {
      query: string;
      domain?: string;
      contentType?: string;
      limit?: number;
      offset?: number;
    };

    if (!payload.query || typeof payload.query !== 'string') {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing or invalid query'));
      return;
    }

    const result = await searchService.search({
      query: payload.query,
      domain: payload.domain,
      contentType: payload.contentType,
      limit: payload.limit,
      offset: payload.offset,
    });

    ctx.send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSearchQuery',
    });
    ctx.send(ws, createError('Search failed', 'SEARCH_ERROR', message.id));
  }
}

async function handleSearchAutocomplete(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { searchService } = await import('../../services/search.js');
    const payload = (message.payload || {}) as {
      prefix: string;
      limit?: number;
    };

    if (!payload.prefix || typeof payload.prefix !== 'string') {
      ctx.send(ws, createResponse(message.id, true, { prefix: '', suggestions: [] }));
      return;
    }

    const result = await searchService.autocomplete(payload.prefix, payload.limit);
    ctx.send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSearchAutocomplete',
    });
    ctx.send(ws, createResponse(message.id, true, { prefix: '', suggestions: [] }));
  }
}

async function handleSearchGetStats(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { searchService } = await import('../../services/search.js');
    const stats = await searchService.getStats();
    ctx.send(ws, createResponse(message.id, true, stats));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSearchGetStats',
    });
    ctx.send(ws, createError('Failed to get search stats', 'STATS_ERROR', message.id));
  }
}

export const searchHandlers: HandlerMap = {
  'search:query': handleSearchQuery,
  'search:autocomplete': handleSearchAutocomplete,
  'search:getStats': handleSearchGetStats,
};
