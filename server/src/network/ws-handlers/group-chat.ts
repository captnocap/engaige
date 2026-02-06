/**
 * Group Chat Handlers - Multi-participant NPC conversations
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleGroupChatCreate(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { createGroupChat } = await import('../../services/group-chat.js');
    const payload = message.payload as {
      creatorId: string;
      creatorType: 'player' | 'npc';
      participantIds: string[];
      name?: string;
    };

    if (!payload?.creatorId || !payload?.participantIds?.length) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing creatorId or participantIds'));
      return;
    }

    const chat = createGroupChat(
      payload.creatorId,
      payload.creatorType || 'player',
      payload.participantIds,
      payload.name
    );
    ctx.send(ws, createResponse(message.id, true, chat));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleGroupChatCreate' });
    ctx.send(ws, createError('Failed to create group chat', 'CREATE_ERROR', message.id));
  }
}

async function handleGroupChatGetParticipants(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getGroupChatParticipants } = await import('../../services/group-chat.js');
    const payload = message.payload as { conversationId: string };

    if (!payload?.conversationId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing conversationId'));
      return;
    }

    const participants = getGroupChatParticipants(payload.conversationId);
    ctx.send(ws, createResponse(message.id, true, { participants }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleGroupChatGetParticipants' });
    ctx.send(ws, createError('Failed to get participants', 'GET_ERROR', message.id));
  }
}

async function handleGroupChatSendMessage(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { handleGroupChatMessage } = await import('../../services/group-chat.js');
    const payload = message.payload as {
      conversationId: string;
      senderId: string;
      senderType: 'player' | 'npc';
      content: string;
    };

    if (!payload?.conversationId || !payload?.senderId || !payload?.content) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing required fields'));
      return;
    }

    // Safety net: validate platform access for player messages
    if (payload.senderType === 'player') {
      const { validateMessageAccess } = await import('../../services/message-access-validator.js');
      const access = validateMessageAccess(payload.senderId, '', 'groupchat');
      if (!access.allowed) {
        ctx.send(ws, createError(
          access.reason || 'Access denied',
          'ACCESS_DENIED',
          message.id
        ));
        return;
      }
    }

    const result = await handleGroupChatMessage(
      payload.conversationId,
      payload.senderId,
      payload.senderType || 'player',
      payload.content
    );
    ctx.send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleGroupChatSendMessage' });
    ctx.send(ws, createError('Failed to send message', 'SEND_ERROR', message.id));
  }
}

async function handleGroupChatGenerateResponse(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { generateGroupChatResponse } = await import('../../services/group-chat.js');
    const payload = message.payload as {
      conversationId: string;
      npcId: string;
    };

    if (!payload?.conversationId || !payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing conversationId or npcId'));
      return;
    }

    const response = await generateGroupChatResponse(payload.conversationId, payload.npcId);
    ctx.send(ws, createResponse(message.id, true, { response }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleGroupChatGenerateResponse' });
    ctx.send(ws, createError('Failed to generate response', 'GENERATE_ERROR', message.id));
  }
}

export const groupChatHandlers: HandlerMap = {
  'groupChat:create': handleGroupChatCreate,
  'groupChat:getParticipants': handleGroupChatGetParticipants,
  'groupChat:sendMessage': handleGroupChatSendMessage,
  'groupChat:generateResponse': handleGroupChatGenerateResponse,
};
