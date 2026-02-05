/**
 * AI Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleAISendMessage(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { npcId, message: userMessage, conversationId, platform } = message.payload as any;

  if (!npcId || !userMessage) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or message'));
    return;
  }

  // Send typing indicator
  ctx.send(ws, {
    type: 'ai:typing',
    payload: { npcId, isTyping: true },
  });

  try {
    const { generateNPCResponse } = await import('../../services/ai.js');

    // Get conversation history (simplified - you'd fetch from DB in real impl)
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    const response = await generateNPCResponse(npcId, userMessage, history, {
      platform: platform || 'chat',
      conversation_id: conversationId,
    });

    // Send response
    ctx.send(ws, {
      type: 'ai:response',
      id: message.id,
      payload: {
        npcId,
        message: response,
        conversationId: conversationId || 'new',
      },
    });
  } finally {
    // Clear typing indicator
    ctx.send(ws, {
      type: 'ai:typing',
      payload: { npcId, isTyping: false },
    });
  }
}

async function handleAIGeneratePost(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { npcId, platform, prompt } = message.payload as any;

  if (!npcId || !platform) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or platform'));
    return;
  }

  const { generateNPCPost } = await import('../../services/ai.js');
  const content = await generateNPCPost(npcId, platform, prompt);

  ctx.send(ws, {
    type: 'ai:postCreated',
    id: message.id,
    payload: {
      npcId,
      platform,
      content,
      postId: `post_${Date.now()}`,
    },
  });
}

async function handleAIDirectChat(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { message: userMessage, conversationId, history, modes } = message.payload as any;

  if (!userMessage) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing message'));
    return;
  }

  try {
    const { generateDirectChatResponse } = await import('../../services/direct-chat.js');

    const result = await generateDirectChatResponse({
      message: userMessage,
      conversationId,
      history,
      modes,
    });

    ctx.send(ws, {
      type: 'ai:directChatResponse',
      id: message.id,
      payload: result,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[WS] Direct chat error:', err.message);

    ctx.send(ws, createResponse(message.id, false, null, err.message));
  }
}

export const aiHandlers: HandlerMap = {
  'ai:sendMessage': handleAISendMessage,
  'ai:generatePost': handleAIGeneratePost,
  'ai:directChat': handleAIDirectChat,
};
