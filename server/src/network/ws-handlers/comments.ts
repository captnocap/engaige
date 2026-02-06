/**
 * Comments Handlers - Advanced threading and AI comment generation
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleCommentsGetThread(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getCommentThread } = await import('../../services/comments.js');
    const payload = message.payload as { commentId: string };

    if (!payload?.commentId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing commentId'));
      return;
    }

    const thread = getCommentThread(payload.commentId);
    ctx.send(ws, createResponse(message.id, true, { thread }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleCommentsGetThread' });
    ctx.send(ws, createError('Failed to get comment thread', 'THREAD_ERROR', message.id));
  }
}

async function handleCommentsGetReplies(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getCommentReplies } = await import('../../services/comments.js');
    const payload = message.payload as { commentId: string };

    if (!payload?.commentId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing commentId'));
      return;
    }

    const replies = getCommentReplies(payload.commentId);
    ctx.send(ws, createResponse(message.id, true, { replies }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleCommentsGetReplies' });
    ctx.send(ws, createError('Failed to get replies', 'REPLIES_ERROR', message.id));
  }
}

async function handleCommentsGetTree(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { buildCommentTree } = await import('../../services/comments.js');
    const payload = message.payload as { postId: string };

    if (!payload?.postId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing postId'));
      return;
    }

    const tree = buildCommentTree(payload.postId);
    ctx.send(ws, createResponse(message.id, true, { tree }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleCommentsGetTree' });
    ctx.send(ws, createError('Failed to build comment tree', 'TREE_ERROR', message.id));
  }
}

async function handleCommentsGenerateReply(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { generateCommentReply } = await import('../../services/comments.js');
    const payload = message.payload as {
      npcId: string;
      commentId: string;
    };

    if (!payload?.npcId || !payload?.commentId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or commentId'));
      return;
    }

    const reply = await generateCommentReply(payload.npcId, payload.commentId);
    ctx.send(ws, createResponse(message.id, true, reply));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleCommentsGenerateReply' });
    ctx.send(ws, createError('Failed to generate reply', 'GENERATE_ERROR', message.id));
  }
}

async function handleCommentsGenerateForPost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { generatePostComment } = await import('../../services/comments.js');
    const payload = message.payload as {
      npcId: string;
      postId: string;
    };

    if (!payload?.npcId || !payload?.postId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or postId'));
      return;
    }

    const comment = await generatePostComment(payload.npcId, payload.postId);
    ctx.send(ws, createResponse(message.id, true, comment));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleCommentsGenerateForPost' });
    ctx.send(ws, createError('Failed to generate comment', 'GENERATE_ERROR', message.id));
  }
}

export const commentsHandlers: HandlerMap = {
  'comments:getThread': handleCommentsGetThread,
  'comments:getReplies': handleCommentsGetReplies,
  'comments:getTree': handleCommentsGetTree,
  'comments:generateReply': handleCommentsGenerateReply,
  'comments:generateForPost': handleCommentsGenerateForPost,
};
