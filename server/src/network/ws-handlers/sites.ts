/**
 * Site Content Handlers
 *
 * WS handlers for fetching filler site content from the database.
 * Used by VidTube, Threadit, WikiKnow, AskCorn, Amaize, blogs, etc.
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleSitesGetContent(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getContent } = await import('../../services/site-content.js');
    const payload = (message.payload || {}) as {
      siteId: string;
      contentType?: string;
      category?: string;
      channelId?: string;
      limit?: number;
      offset?: number;
      featured?: boolean;
    };

    if (!payload.siteId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing siteId'));
      return;
    }

    const content = getContent(payload.siteId, {
      contentType: payload.contentType,
      category: payload.category,
      channelId: payload.channelId,
      limit: payload.limit,
      offset: payload.offset,
      featured: payload.featured,
    });

    ctx.send(ws, createResponse(message.id, true, { content }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSitesGetContent',
    });
    ctx.send(ws, createError('Failed to get site content', 'SITE_CONTENT_ERROR', message.id));
  }
}

async function handleSitesGetContentBySlug(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getContentWithComments } = await import('../../services/site-content.js');
    const payload = (message.payload || {}) as {
      siteId: string;
      slug: string;
    };

    if (!payload.siteId || !payload.slug) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing siteId or slug'));
      return;
    }

    const result = getContentWithComments(payload.siteId, payload.slug);
    ctx.send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSitesGetContentBySlug',
    });
    ctx.send(ws, createError('Failed to get content by slug', 'SITE_CONTENT_ERROR', message.id));
  }
}

async function handleSitesGetChannels(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getChannels } = await import('../../services/site-content.js');
    const payload = (message.payload || {}) as { siteId: string };

    if (!payload.siteId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing siteId'));
      return;
    }

    const channels = getChannels(payload.siteId);
    ctx.send(ws, createResponse(message.id, true, { channels }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSitesGetChannels',
    });
    ctx.send(ws, createError('Failed to get channels', 'SITE_CHANNELS_ERROR', message.id));
  }
}

async function handleSitesGetCategories(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getCategories } = await import('../../services/site-content.js');
    const payload = (message.payload || {}) as { siteId: string };

    if (!payload.siteId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing siteId'));
      return;
    }

    const categories = getCategories(payload.siteId);
    ctx.send(ws, createResponse(message.id, true, { categories }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSitesGetCategories',
    });
    ctx.send(ws, createError('Failed to get categories', 'SITE_CATEGORIES_ERROR', message.id));
  }
}

async function handleSitesSearch(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { searchContent } = await import('../../services/site-content.js');
    const payload = (message.payload || {}) as {
      query: string;
      siteId?: string;
      limit?: number;
    };

    if (!payload.query) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing query'));
      return;
    }

    const results = searchContent(payload.query, {
      siteId: payload.siteId,
      limit: payload.limit,
    });

    ctx.send(ws, createResponse(message.id, true, { results }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSitesSearch',
    });
    ctx.send(ws, createError('Failed to search content', 'SITE_SEARCH_ERROR', message.id));
  }
}

export const sitesHandlers: HandlerMap = {
  'sites:getContent': handleSitesGetContent,
  'sites:getContentBySlug': handleSitesGetContentBySlug,
  'sites:getChannels': handleSitesGetChannels,
  'sites:getCategories': handleSitesGetCategories,
  'sites:search': handleSitesSearch,
};
