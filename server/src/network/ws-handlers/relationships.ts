/**
 * NPC Relationship Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleNPCRelationshipGetAll(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getActiveRelationships } = await import('../../services/npc-relationships.js');
    const relationships = getActiveRelationships();
    ctx.send(ws, createResponse(message.id, true, { relationships }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGetAll' });
    ctx.send(ws, createError('Failed to get relationships', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipGet(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getRelationship } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { id: string };

    if (!payload?.id) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing relationship id'));
      return;
    }

    const relationship = getRelationship(payload.id);
    ctx.send(ws, createResponse(message.id, true, relationship));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGet' });
    ctx.send(ws, createError('Failed to get relationship', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipGetBetween(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getRelationshipBetween } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { npc1Id: string; npc2Id: string };

    if (!payload?.npc1Id || !payload?.npc2Id) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npc1Id or npc2Id'));
      return;
    }

    const relationship = getRelationshipBetween(payload.npc1Id, payload.npc2Id);
    ctx.send(ws, createResponse(message.id, true, relationship));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGetBetween' });
    ctx.send(ws, createError('Failed to get relationship', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipGetFor(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getRelationshipsFor } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { npcId: string };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    const relationships = getRelationshipsFor(payload.npcId);
    ctx.send(ws, createResponse(message.id, true, { relationships }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGetFor' });
    ctx.send(ws, createError('Failed to get relationships', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipGetAffairs(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getAffairs } = await import('../../services/npc-relationships.js');
    const affairs = getAffairs();
    ctx.send(ws, createResponse(message.id, true, { affairs }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGetAffairs' });
    ctx.send(ws, createError('Failed to get affairs', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipStart(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { startRelationship } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { npc1Id: string; npc2Id: string; type?: string; isSecret?: boolean };

    if (!payload?.npc1Id || !payload?.npc2Id) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npc1Id or npc2Id'));
      return;
    }

    const relationship = await startRelationship(
      payload.npc1Id,
      payload.npc2Id,
      (payload.type as any) || 'talking',
      { isSecret: payload.isSecret }
    );
    ctx.send(ws, createResponse(message.id, true, relationship));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipStart' });
    ctx.send(ws, createError('Failed to start relationship', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipEnd(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { endRelationship } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { id: string; reason: 'mutual' | 'dumped' | 'caught' | 'ghosted' | 'other' };

    if (!payload?.id || !payload?.reason) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing id or reason'));
      return;
    }

    await endRelationship(payload.id, payload.reason);
    ctx.send(ws, createResponse(message.id, true, { ended: true }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipEnd' });
    ctx.send(ws, createError('Failed to end relationship', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipStartAffair(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { startAffair } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { npc1Id: string; npc2Id: string };

    if (!payload?.npc1Id || !payload?.npc2Id) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npc1Id or npc2Id'));
      return;
    }

    const affair = await startAffair(payload.npc1Id, payload.npc2Id);
    ctx.send(ws, createResponse(message.id, true, affair));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipStartAffair' });
    ctx.send(ws, createError('Failed to start affair', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipDiscoverAffair(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { discoverAffair } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { relationshipId: string; discoveredBy: string };

    if (!payload?.relationshipId || !payload?.discoveredBy) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing relationshipId or discoveredBy'));
      return;
    }

    const event = await discoverAffair(payload.relationshipId, payload.discoveredBy);
    ctx.send(ws, createResponse(message.id, true, event));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipDiscoverAffair' });
    ctx.send(ws, createError('Failed to discover affair', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipExposeAffair(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { exposeAffair } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { relationshipId: string };

    if (!payload?.relationshipId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing relationshipId'));
      return;
    }

    await exposeAffair(payload.relationshipId);
    ctx.send(ws, createResponse(message.id, true, { exposed: true }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipExposeAffair' });
    ctx.send(ws, createError('Failed to expose affair', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipGetPartner(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getPartner } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { npcId: string };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    const partner = getPartner(payload.npcId);
    ctx.send(ws, createResponse(message.id, true, { partner }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGetPartner' });
    ctx.send(ws, createError('Failed to get partner', 'RELATIONSHIP_ERROR', message.id));
  }
}

async function handleNPCRelationshipGetPublicStatus(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getPublicStatus } = await import('../../services/npc-relationships.js');
    const payload = message.payload as { npcId: string };

    if (!payload?.npcId) {
      ctx.send(ws, createResponse(message.id, false, null, 'Missing npcId'));
      return;
    }

    const status = getPublicStatus(payload.npcId);
    ctx.send(ws, createResponse(message.id, true, { status }));
  } catch (error) {
    errorLogger.log(error, { source: 'ws-server', operation: 'handleNPCRelationshipGetPublicStatus' });
    ctx.send(ws, createError('Failed to get public status', 'RELATIONSHIP_ERROR', message.id));
  }
}

export const relationshipsHandlers: HandlerMap = {
  'npcRelationship:getAll': handleNPCRelationshipGetAll,
  'npcRelationship:get': handleNPCRelationshipGet,
  'npcRelationship:getBetween': handleNPCRelationshipGetBetween,
  'npcRelationship:getFor': handleNPCRelationshipGetFor,
  'npcRelationship:getAffairs': handleNPCRelationshipGetAffairs,
  'npcRelationship:start': handleNPCRelationshipStart,
  'npcRelationship:end': handleNPCRelationshipEnd,
  'npcRelationship:startAffair': handleNPCRelationshipStartAffair,
  'npcRelationship:discoverAffair': handleNPCRelationshipDiscoverAffair,
  'npcRelationship:exposeAffair': handleNPCRelationshipExposeAffair,
  'npcRelationship:getPartner': handleNPCRelationshipGetPartner,
  'npcRelationship:getPublicStatus': handleNPCRelationshipGetPublicStatus,
};
