/**
 * NPC Interaction Handlers - High-level NPC messaging with vision/image proxy
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleInteractionSendMessage(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { sendMessageToNPC } = await import('../../services/npc-interaction.js');
    const payload = message.payload as {
      npcId: string;
      message: string;
      imageUrl?: string;
      platform?: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!payload?.npcId || !payload?.message) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or message'));
      return;
    }

    // Validate platform access if platform is specified
    if (payload.platform) {
      const { validateMessageAccess } = await import('../../services/message-access-validator.js');
      const access = validateMessageAccess('player', payload.npcId, payload.platform);
      if (!access.allowed) {
        ctx.send(ws, createError(
          access.reason || 'Access denied',
          'ACCESS_DENIED',
          message.id
        ));
        return;
      }
    }

    const response = await sendMessageToNPC(payload.npcId, payload.message, {
      imageUrl: payload.imageUrl,
      platform: payload.platform,
      conversationHistory: payload.conversationHistory,
    });

    ctx.send(ws, createResponse(message.id, true, { response }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInteractionSendMessage' });
    ctx.send(ws, createError('Failed to send message', 'SEND_ERROR', message.id));
  }
}

async function handleInteractionRequestImage(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { requestNPCImage } = await import('../../services/npc-interaction.js');
    const payload = message.payload as {
      npcId: string;
      userRequest: string;
      purpose?: 'profile_picture' | 'post_image' | 'custom';
    };

    if (!payload?.npcId || !payload?.userRequest) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or userRequest'));
      return;
    }

    const result = await requestNPCImage(payload.npcId, payload.userRequest, payload.purpose);
    ctx.send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInteractionRequestImage' });
    ctx.send(ws, createError('Failed to request image', 'IMAGE_ERROR', message.id));
  }
}

async function handleInteractionGetCapabilities(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { canNPCHandleImages } = await import('../../services/npc-interaction.js');
    const payload = message.payload as { npcId: string };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    const capabilities = canNPCHandleImages(payload.npcId);
    ctx.send(ws, createResponse(message.id, true, capabilities));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleInteractionGetCapabilities' });
    ctx.send(ws, createError('Failed to get capabilities', 'CAPABILITIES_ERROR', message.id));
  }
}

export const interactionHandlers: HandlerMap = {
  'interaction:sendMessage': handleInteractionSendMessage,
  'interaction:requestImage': handleInteractionRequestImage,
  'interaction:getCapabilities': handleInteractionGetCapabilities,
};
