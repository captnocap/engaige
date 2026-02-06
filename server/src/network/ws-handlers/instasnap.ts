/**
 * InstaSnap Handlers - Saved posts and Stories
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

// ============================================================================
// Saved Posts
// ============================================================================

async function handleInstasnapSavePost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { savePost } = await import('../../services/instasnap-saved.js');
    const payload = message.payload as {
      postId: string;
      saverId: string;
      collectionName?: string;
    };

    if (!payload?.postId || !payload?.saverId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing postId or saverId'));
      return;
    }

    const saved = savePost(payload.postId, payload.saverId, payload.collectionName);
    ctx.send(ws, createResponse(message.id, true, saved));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapSavePost' });
    ctx.send(ws, createError('Failed to save post', 'SAVE_ERROR', message.id));
  }
}

async function handleInstasnapUnsavePost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { unsavePost } = await import('../../services/instasnap-saved.js');
    const payload = message.payload as { postId: string; saverId: string };

    if (!payload?.postId || !payload?.saverId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing postId or saverId'));
      return;
    }

    const success = unsavePost(payload.postId, payload.saverId);
    ctx.send(ws, createResponse(message.id, true, { unsaved: success }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapUnsavePost' });
    ctx.send(ws, createError('Failed to unsave post', 'UNSAVE_ERROR', message.id));
  }
}

async function handleInstasnapGetSaved(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getSavedPosts } = await import('../../services/instasnap-saved.js');
    const payload = message.payload as {
      saverId: string;
      collectionName?: string;
      limit?: number;
      offset?: number;
    };

    if (!payload?.saverId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing saverId'));
      return;
    }

    const saved = getSavedPosts(
      payload.saverId,
      payload.collectionName,
      payload.limit || 50,
      payload.offset || 0
    );
    ctx.send(ws, createResponse(message.id, true, { saved }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapGetSaved' });
    ctx.send(ws, createError('Failed to get saved posts', 'GET_ERROR', message.id));
  }
}

async function handleInstasnapGetCollections(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getCollections } = await import('../../services/instasnap-saved.js');
    const payload = message.payload as { saverId: string };

    if (!payload?.saverId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing saverId'));
      return;
    }

    const collections = getCollections(payload.saverId);
    ctx.send(ws, createResponse(message.id, true, { collections }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapGetCollections' });
    ctx.send(ws, createError('Failed to get collections', 'GET_ERROR', message.id));
  }
}

async function handleInstasnapMoveToCollection(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { moveToCollection } = await import('../../services/instasnap-saved.js');
    const payload = message.payload as {
      postId: string;
      saverId: string;
      collectionName: string;
    };

    if (!payload?.postId || !payload?.saverId || !payload?.collectionName) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = moveToCollection(payload.postId, payload.saverId, payload.collectionName);
    ctx.send(ws, createResponse(message.id, true, { moved: success }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapMoveToCollection' });
    ctx.send(ws, createError('Failed to move to collection', 'MOVE_ERROR', message.id));
  }
}

// ============================================================================
// Stories
// ============================================================================

async function handleInstasnapCreateStory(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { createStory } = await import('../../services/instasnap-stories.js');
    const payload = message.payload as {
      authorId: string;
      authorType: 'player' | 'npc';
      mediaUrl: string;
      mediaType: 'image' | 'video';
      caption?: string;
      backgroundColor?: string;
      musicTrack?: string;
      duration?: number;
    };

    if (!payload?.authorId || !payload?.mediaUrl || !payload?.mediaType) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const story = createStory(payload);
    ctx.send(ws, createResponse(message.id, true, story));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapCreateStory' });
    ctx.send(ws, createError('Failed to create story', 'CREATE_ERROR', message.id));
  }
}

async function handleInstasnapGetStories(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getActiveStories, getStoriesByAuthor } = await import('../../services/instasnap-stories.js');
    const payload = (message.payload || {}) as { authorId?: string };

    const stories = payload.authorId
      ? getStoriesByAuthor(payload.authorId)
      : getActiveStories();

    ctx.send(ws, createResponse(message.id, true, { stories }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapGetStories' });
    ctx.send(ws, createError('Failed to get stories', 'GET_ERROR', message.id));
  }
}

async function handleInstasnapViewStory(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { viewStory } = await import('../../services/instasnap-stories.js');
    const payload = message.payload as {
      storyId: string;
      viewerId: string;
      viewerType: 'player' | 'npc';
    };

    if (!payload?.storyId || !payload?.viewerId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing storyId or viewerId'));
      return;
    }

    const view = viewStory(payload.storyId, payload.viewerId, payload.viewerType || 'player');
    ctx.send(ws, createResponse(message.id, true, view));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapViewStory' });
    ctx.send(ws, createError('Failed to view story', 'VIEW_ERROR', message.id));
  }
}

async function handleInstasnapDeleteStory(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { deleteStory } = await import('../../services/instasnap-stories.js');
    const payload = message.payload as { storyId: string };

    if (!payload?.storyId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing storyId'));
      return;
    }

    const success = deleteStory(payload.storyId);
    ctx.send(ws, createResponse(message.id, true, { deleted: success }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInstasnapDeleteStory' });
    ctx.send(ws, createError('Failed to delete story', 'DELETE_ERROR', message.id));
  }
}

export const instasnapHandlers: HandlerMap = {
  // Saved posts
  'instasnap:savePost': handleInstasnapSavePost,
  'instasnap:unsavePost': handleInstasnapUnsavePost,
  'instasnap:getSaved': handleInstasnapGetSaved,
  'instasnap:getCollections': handleInstasnapGetCollections,
  'instasnap:moveToCollection': handleInstasnapMoveToCollection,
  // Stories
  'instasnap:createStory': handleInstasnapCreateStory,
  'instasnap:getStories': handleInstasnapGetStories,
  'instasnap:viewStory': handleInstasnapViewStory,
  'instasnap:deleteStory': handleInstasnapDeleteStory,
};
