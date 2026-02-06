/**
 * Hashtags Handlers - Trending hashtags and search
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleHashtagsGetTrending(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getTrendingHashtags } = await import('../../services/hashtags.js');
    const payload = (message.payload || {}) as { limit?: number };

    const trending = getTrendingHashtags(payload.limit || 10);
    ctx.send(ws, createResponse(message.id, true, { trending }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleHashtagsGetTrending' });
    ctx.send(ws, createError('Failed to get trending hashtags', 'TRENDING_ERROR', message.id));
  }
}

async function handleHashtagsSearch(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { searchHashtags } = await import('../../services/hashtags.js');
    const payload = message.payload as { query: string; limit?: number };

    if (!payload?.query) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing query'));
      return;
    }

    const results = searchHashtags(payload.query, payload.limit || 10);
    ctx.send(ws, createResponse(message.id, true, { results }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleHashtagsSearch' });
    ctx.send(ws, createError('Failed to search hashtags', 'SEARCH_ERROR', message.id));
  }
}

async function handleHashtagsGet(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getHashtag } = await import('../../services/hashtags.js');
    const payload = message.payload as { tag: string };

    if (!payload?.tag) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing tag'));
      return;
    }

    const hashtag = getHashtag(payload.tag);
    if (!hashtag) {
      ctx.send(ws, createResponse(message.id, false, null, 'Hashtag not found'));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, hashtag));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleHashtagsGet' });
    ctx.send(ws, createError('Failed to get hashtag', 'GET_ERROR', message.id));
  }
}

async function handleHashtagsExtract(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { extractAndProcessHashtags } = await import('../../services/hashtags.js');
    const payload = message.payload as { postId: string; content: string };

    if (!payload?.postId || !payload?.content) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing postId or content'));
      return;
    }

    const hashtags = extractAndProcessHashtags(payload.postId, payload.content);
    ctx.send(ws, createResponse(message.id, true, { hashtags }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleHashtagsExtract' });
    ctx.send(ws, createError('Failed to extract hashtags', 'EXTRACT_ERROR', message.id));
  }
}

export const hashtagsHandlers: HandlerMap = {
  'hashtags:getTrending': handleHashtagsGetTrending,
  'hashtags:search': handleHashtagsSearch,
  'hashtags:get': handleHashtagsGet,
  'hashtags:extract': handleHashtagsExtract,
};
