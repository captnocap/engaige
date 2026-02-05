/**
 * Awareness Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleAwarenessGetHabits(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getHabits } = await import('../../services/awareness.js');
    const payload = message.payload as { npcId: string };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    const habits = getHabits(payload.npcId);
    ctx.send(ws, createResponse(message.id, true, habits));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleAwarenessGetHabits',
    });
    ctx.send(ws, createError('Failed to get habits', 'AWARENESS_ERROR', message.id));
  }
}

async function handleAwarenessSetHabits(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { setHabits, getHabits } = await import('../../services/awareness.js');
    const payload = message.payload as { npcId: string; habits: any };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    setHabits(payload.npcId, payload.habits || {});
    const updated = getHabits(payload.npcId);
    ctx.send(ws, createResponse(message.id, true, updated));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleAwarenessSetHabits',
    });
    ctx.send(ws, createError('Failed to set habits', 'AWARENESS_ERROR', message.id));
  }
}

async function handleAwarenessGetAllHabits(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getAllHabits } = await import('../../services/awareness.js');
    const habits = getAllHabits();
    ctx.send(ws, createResponse(message.id, true, { habits }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleAwarenessGetAllHabits',
    });
    ctx.send(ws, createError('Failed to get all habits', 'AWARENESS_ERROR', message.id));
  }
}

async function handleAwarenessGetLastChecked(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getLastChecked } = await import('../../services/awareness.js');
    const payload = message.payload as { npcId: string; platform: string };

    if (!payload?.npcId || !payload?.platform) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or platform'));
      return;
    }

    const timestamp = getLastChecked(payload.npcId, payload.platform);
    ctx.send(ws, createResponse(message.id, true, { timestamp }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleAwarenessGetLastChecked',
    });
    ctx.send(ws, createError('Failed to get last checked', 'AWARENESS_ERROR', message.id));
  }
}

async function handleAwarenessShouldCheckNow(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { shouldCheckNow } = await import('../../services/awareness.js');
    const payload = message.payload as { npcId: string; platform: string };

    if (!payload?.npcId || !payload?.platform) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or platform'));
      return;
    }

    const shouldCheck = shouldCheckNow(payload.npcId, payload.platform);
    ctx.send(ws, createResponse(message.id, true, { shouldCheck }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleAwarenessShouldCheckNow',
    });
    ctx.send(ws, createError('Failed to check status', 'AWARENESS_ERROR', message.id));
  }
}

async function handleAwarenessTriggerCheck(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { npcChecksSocialMedia } = await import('../../services/awareness.js');
    const payload = message.payload as { npcId: string; platform: string };

    if (!payload?.npcId || !payload?.platform) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId or platform'));
      return;
    }

    const session = await npcChecksSocialMedia(payload.npcId, payload.platform);
    ctx.send(ws, createResponse(message.id, true, session));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleAwarenessTriggerCheck',
    });
    ctx.send(ws, createError('Failed to trigger check', 'AWARENESS_ERROR', message.id));
  }
}

export const awarenessHandlers: HandlerMap = {
  'awareness:getHabits': handleAwarenessGetHabits,
  'awareness:setHabits': handleAwarenessSetHabits,
  'awareness:getAllHabits': handleAwarenessGetAllHabits,
  'awareness:getLastChecked': handleAwarenessGetLastChecked,
  'awareness:shouldCheckNow': handleAwarenessShouldCheckNow,
  'awareness:triggerCheck': handleAwarenessTriggerCheck,
};
