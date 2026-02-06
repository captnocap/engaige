/**
 * News Handlers
 *
 * WS handlers for fetching news articles from the news_articles table.
 * Used by DailyBuzzSite and other news-consuming components.
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleNewsGetArticles(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { default: newsFeedService } = await import('../../services/news-feed.js');
    const payload = (message.payload || {}) as {
      limit?: number;
      offset?: number;
      category?: string;
    };

    const articles = await newsFeedService.getAllArticles({
      limit: payload.limit || 50,
      offset: payload.offset || 0,
      source: undefined,
    });

    ctx.send(ws, createResponse(message.id, true, { articles }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleNewsGetArticles',
    });
    ctx.send(ws, createError('Failed to get articles', 'NEWS_ERROR', message.id));
  }
}

async function handleNewsGetArticle(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { default: newsFeedService } = await import('../../services/news-feed.js');
    const payload = (message.payload || {}) as { slug: string };

    if (!payload.slug) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing slug'));
      return;
    }

    const article = await newsFeedService.getArticle(payload.slug);
    ctx.send(ws, createResponse(message.id, true, { article }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleNewsGetArticle',
    });
    ctx.send(ws, createError('Failed to get article', 'NEWS_ERROR', message.id));
  }
}

export const newsHandlers: HandlerMap = {
  'news:getArticles': handleNewsGetArticles,
  'news:getArticle': handleNewsGetArticle,
};
