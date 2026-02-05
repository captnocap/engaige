/**
 * Social Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, serializeMessage, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleSocialGetFeed(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getFeed } = await import('../../services/social.js');
    const payload = (message.payload || {}) as { platform?: string; limit?: number };

    const posts = getFeed(payload.platform, payload.limit || 50);
    ctx.send(ws, createResponse(message.id, true, { posts }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetFeed',
    });
    ctx.send(ws, createError('Failed to get feed', 'FEED_ERROR', message.id));
  }
}

async function handleSocialGetPost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getPost } = await import('../../services/social.js');
    const payload = (message.payload || {}) as { postId: string };

    if (!payload.postId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing postId'));
      return;
    }

    const post = getPost(payload.postId);
    if (!post) {
      ctx.send(ws, createResponse(message.id, false, null, 'Post not found'));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, post));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetPost',
    });
    ctx.send(ws, createError('Failed to get post', 'POST_ERROR', message.id));
  }
}

async function handleSocialCreatePost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { createPost } = await import('../../services/social.js');
    const payload = message.payload as {
      authorId: string;
      authorType: 'player' | 'npc';
      platform: 'myface' | 'chirp' | 'instasnap';
      content: string;
      mediaUrls?: string[];
      contentRating?: string;
    };

    if (!payload.authorId || !payload.platform || !payload.content) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const post = await createPost(payload);

    // Broadcast to subscribed clients
    broadcastSocialEvent(ctx, 'social:postCreated', { post });

    ctx.send(ws, createResponse(message.id, true, post));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialCreatePost',
    });
    ctx.send(ws, createError('Failed to create post', 'CREATE_ERROR', message.id));
  }
}

async function handleSocialLikePost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { likePost, getPost } = await import('../../services/social.js');
    const payload = message.payload as {
      postId: string;
      likerId: string;
      likerType: 'player' | 'npc';
    };

    if (!payload.postId || !payload.likerId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = await likePost(payload.postId, payload.likerId, payload.likerType || 'player');

    if (success) {
      const post = getPost(payload.postId);
      broadcastSocialEvent(ctx, 'social:postLiked', {
        postId: payload.postId,
        likerId: payload.likerId,
        likerType: payload.likerType || 'player',
        newLikesCount: post?.likesCount || 0,
      });
    }

    ctx.send(ws, createResponse(message.id, true, { liked: success }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialLikePost',
    });
    ctx.send(ws, createError('Failed to like post', 'LIKE_ERROR', message.id));
  }
}

async function handleSocialUnlikePost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { unlikePost, getPost } = await import('../../services/social.js');
    const payload = message.payload as {
      postId: string;
      likerId: string;
    };

    if (!payload.postId || !payload.likerId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = unlikePost(payload.postId, payload.likerId);

    if (success) {
      const post = getPost(payload.postId);
      broadcastSocialEvent(ctx, 'social:postUnliked', {
        postId: payload.postId,
        likerId: payload.likerId,
        newLikesCount: post?.likesCount || 0,
      });
    }

    ctx.send(ws, createResponse(message.id, true, { unliked: success }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialUnlikePost',
    });
    ctx.send(ws, createError('Failed to unlike post', 'UNLIKE_ERROR', message.id));
  }
}

async function handleSocialAddComment(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { addComment } = await import('../../services/social.js');
    const payload = message.payload as {
      postId: string;
      authorId: string;
      authorType: 'player' | 'npc';
      content: string;
      parentCommentId?: string;
    };

    if (!payload.postId || !payload.authorId || !payload.content) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const comment = await addComment(payload);

    broadcastSocialEvent(ctx, 'social:commentAdded', {
      postId: payload.postId,
      comment,
    });

    ctx.send(ws, createResponse(message.id, true, comment));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialAddComment',
    });
    ctx.send(ws, createError('Failed to add comment', 'COMMENT_ERROR', message.id));
  }
}

async function handleSocialMarkSeen(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { markPostAsSeen } = await import('../../services/social.js');
    const payload = message.payload as {
      postId: string;
      viewerId: string;
      viewerType: 'player' | 'npc';
      platform?: string;
    };

    if (!payload.postId || !payload.viewerId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    const success = markPostAsSeen(
      payload.postId,
      payload.viewerId,
      payload.viewerType || 'player',
      payload.platform
    );

    ctx.send(ws, createResponse(message.id, true, { marked: success }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialMarkSeen',
    });
    ctx.send(ws, createError('Failed to mark post as seen', 'MARK_SEEN_ERROR', message.id));
  }
}

async function handleSocialGetUnseen(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getUnseenPosts } = await import('../../services/social.js');
    const payload = (message.payload || {}) as {
      viewerId: string;
      platform?: string;
      limit?: number;
    };

    if (!payload.viewerId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing viewerId'));
      return;
    }

    const posts = getUnseenPosts(payload.viewerId, payload.platform, payload.limit || 50);
    ctx.send(ws, createResponse(message.id, true, { posts }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetUnseen',
    });
    ctx.send(ws, createError('Failed to get unseen posts', 'UNSEEN_ERROR', message.id));
  }
}

async function handleSocialGetProfile(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getProfile, recordProfileView } = await import('../../services/social.js');
    const payload = (message.payload || {}) as {
      profileId: string;
      viewerId?: string;
      viewerType?: 'player' | 'npc';
      platform?: string;
    };

    if (!payload.profileId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing profileId'));
      return;
    }

    const profile = getProfile(payload.profileId);
    if (!profile) {
      ctx.send(ws, createResponse(message.id, false, null, 'Profile not found'));
      return;
    }

    // Record the view if viewer info provided
    if (payload.viewerId && payload.platform) {
      await recordProfileView(
        payload.profileId,
        payload.viewerId,
        payload.viewerType || 'player',
        payload.platform
      );
    }

    ctx.send(ws, createResponse(message.id, true, profile));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleSocialGetProfile',
    });
    ctx.send(ws, createError('Failed to get profile', 'PROFILE_ERROR', message.id));
  }
}

function handleSocialSubscribe(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const payload = (message.payload || {}) as { platforms?: string[] };

  let subs = ctx.socialSubscriptions.get(ws);
  if (!subs) {
    subs = new Set();
    ctx.socialSubscriptions.set(ws, subs);
  }

  // Subscribe to all platforms if none specified
  const platforms = payload.platforms || ['myface', 'chirp', 'instasnap'];
  platforms.forEach(p => subs!.add(p));

  const session = ctx.clients.get(ws);
  console.log(`[WS] Client ${session?.id} subscribed to social: ${platforms.join(', ')}`);

  ctx.send(ws, createResponse(message.id, true, { subscribed: true, platforms }));
}

function handleSocialUnsubscribe(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const payload = (message.payload || {}) as { platforms?: string[] };

  const subs = ctx.socialSubscriptions.get(ws);
  if (subs) {
    if (payload.platforms) {
      payload.platforms.forEach(p => subs.delete(p));
    } else {
      ctx.socialSubscriptions.delete(ws);
    }
  }

  const session = ctx.clients.get(ws);
  console.log(`[WS] Client ${session?.id} unsubscribed from social`);

  ctx.send(ws, createResponse(message.id, true, { subscribed: false }));
}

export const socialHandlers: HandlerMap = {
  'social:getFeed': handleSocialGetFeed,
  'social:getPost': handleSocialGetPost,
  'social:createPost': handleSocialCreatePost,
  'social:likePost': handleSocialLikePost,
  'social:unlikePost': handleSocialUnlikePost,
  'social:addComment': handleSocialAddComment,
  'social:markSeen': handleSocialMarkSeen,
  'social:getUnseen': handleSocialGetUnseen,
  'social:getProfile': handleSocialGetProfile,
  'social:subscribe': handleSocialSubscribe,
  'social:unsubscribe': handleSocialUnsubscribe,
};

// ============================================================================
// Broadcast Function (exported for use by other parts of the system)
// ============================================================================

/**
 * Broadcast a social event to subscribed clients
 */
export function broadcastSocialEvent(ctx: HandlerContext, type: string, payload: any): void {
  const data = serializeMessage({ type, payload });

  for (const [ws, subs] of ctx.socialSubscriptions.entries()) {
    // Check if client is subscribed to any platform
    if (subs.size === 0) continue;

    const session = ctx.clients.get(ws);
    try {
      ws.send(data);
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastSocialEvent',
        session_id: session?.id,
        metadata: { event_type: type },
      });
    }
  }
}
