/**
 * World Map Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, serializeMessage, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleWorldGetState(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { worldState, npcLocation, backgroundNPCs } = await import('../../services/world/index.js');

    // Ensure world is initialized
    await worldState.initialize();

    const city = worldState.getCity();
    if (!city) {
      ctx.send(ws, createError('World not initialized', 'WORLD_NOT_READY', message.id));
      return;
    }

    const gameTime = worldState.getGameTime();
    const aiNPCLocations = await npcLocation.getAllNPCLocations();

    // Get a player home building (first residential building for now)
    const residentialBuildings = worldState.getResidentialBuildings();
    const playerHome = residentialBuildings[0] ? {
      buildingId: residentialBuildings[0].id,
      position: residentialBuildings[0].position,
    } : undefined;

    const payload = {
      city: {
        name: city.name,
        bounds: city.bounds,
        tileSize: city.tileSize,
        gridSize: city.gridSize,
        districts: city.districts,
        buildings: city.buildings.map(b => ({
          id: b.id,
          name: b.name,
          type: b.type,
          districtId: b.districtId,
          position: b.position,
          size: b.size,
          spriteId: b.spriteId,
          capacity: b.capacity,
          isResidential: b.isResidential,
          isWorkplace: b.isWorkplace,
        })),
        landmarks: city.landmarks,
      },
      gameTime,
      timeMultiplier: worldState.getTimeMultiplier(),
      isPaused: worldState.isTimePaused(),
      aiNPCs: aiNPCLocations.map(loc => ({
        npcId: loc.npcId,
        position: loc.position,
        buildingId: loc.buildingId,
        activity: loc.activity,
        activityDescription: loc.activityDescription,
      })),
      backgroundNPCCount: backgroundNPCs.getTotalCount(),
      playerHome,
    };

    ctx.send(ws, createResponse(message.id, true, payload));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldGetState',
    });
    ctx.send(ws, createError('Failed to get world state', 'INTERNAL_ERROR', message.id));
  }
}

function handleWorldSubscribe(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const session = ctx.clients.get(ws);
  if (session) {
    session.subscribedToWorld = true;
    console.log(`[WS] Client ${session.id} subscribed to world updates`);
  }
  ctx.send(ws, createResponse(message.id, true, { subscribed: true }));
}

function handleWorldUnsubscribe(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const session = ctx.clients.get(ws);
  if (session) {
    session.subscribedToWorld = false;
    console.log(`[WS] Client ${session.id} unsubscribed from world updates`);
  }
  ctx.send(ws, createResponse(message.id, true, { subscribed: false }));
}

async function handleWorldGetBackgroundNPCs(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { worldState, backgroundNPCs } = await import('../../services/world/index.js');
    const payload = message.payload as {
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    };

    if (payload?.minX === undefined || payload?.maxX === undefined ||
        payload?.minY === undefined || payload?.maxY === undefined) {
      ctx.send(ws, createError('Missing viewport bounds', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const gameTime = worldState.getGameTime();
    const npcs = backgroundNPCs.getNPCsInViewport(payload, gameTime);

    ctx.send(ws, createResponse(message.id, true, {
      npcs: npcs.map(npc => ({
        id: npc.id,
        name: npc.name,
        appearanceSeed: npc.appearanceSeed,
        position: npc.currentPosition,
        state: npc.state,
        activityLabel: npc.activityLabel,
      })),
      viewportBounds: payload,
    }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldGetBackgroundNPCs',
    });
    ctx.send(ws, createError('Failed to get background NPCs', 'INTERNAL_ERROR', message.id));
  }
}

async function handleWorldPauseTime(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { worldState } = await import('../../services/world/index.js');
    worldState.pauseTime();

    // Broadcast to all subscribed clients
    broadcastWorldTimeUpdate(ctx);

    ctx.send(ws, createResponse(message.id, true, { paused: true }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldPauseTime',
    });
    ctx.send(ws, createError('Failed to pause time', 'INTERNAL_ERROR', message.id));
  }
}

async function handleWorldResumeTime(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { worldState } = await import('../../services/world/index.js');
    worldState.resumeTime();

    // Broadcast to all subscribed clients
    broadcastWorldTimeUpdate(ctx);

    ctx.send(ws, createResponse(message.id, true, { paused: false }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldResumeTime',
    });
    ctx.send(ws, createError('Failed to resume time', 'INTERNAL_ERROR', message.id));
  }
}

async function handleWorldSetTimeMultiplier(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { worldState } = await import('../../services/world/index.js');
    const payload = message.payload as { multiplier: number };

    if (!payload?.multiplier || payload.multiplier < 1 || payload.multiplier > 60) {
      ctx.send(ws, createError('Invalid multiplier (must be 1-60)', 'INVALID_PAYLOAD', message.id));
      return;
    }

    worldState.setTimeMultiplier(payload.multiplier);

    // Broadcast to all subscribed clients
    broadcastWorldTimeUpdate(ctx);

    ctx.send(ws, createResponse(message.id, true, { multiplier: payload.multiplier }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleWorldSetTimeMultiplier',
    });
    ctx.send(ws, createError('Failed to set time multiplier', 'INTERNAL_ERROR', message.id));
  }
}

export const worldHandlers: HandlerMap = {
  'world:getState': handleWorldGetState,
  'world:subscribe': handleWorldSubscribe,
  'world:unsubscribe': handleWorldUnsubscribe,
  'world:getBackgroundNPCs': handleWorldGetBackgroundNPCs,
  'world:pauseTime': handleWorldPauseTime,
  'world:resumeTime': handleWorldResumeTime,
  'world:setTimeMultiplier': handleWorldSetTimeMultiplier,
};

// ============================================================================
// Broadcast Functions (exported for use by other parts of the system)
// ============================================================================

/**
 * Broadcast world time update to all subscribed clients
 */
export async function broadcastWorldTimeUpdate(ctx: HandlerContext): Promise<void> {
  try {
    const { worldState } = await import('../../services/world/index.js');
    const gameTime = worldState.getGameTime();

    const data = serializeMessage({
      type: 'world:timeUpdate',
      payload: {
        gameTime,
        formattedTime: worldState.getFormattedTime(),
        formattedDateTime: worldState.getFormattedDateTime(),
      },
    });

    for (const [ws, session] of ctx.clients.entries()) {
      if (!session.subscribedToWorld) continue;

      try {
        ws.send(data);
      } catch (err) {
        errorLogger.log(err, {
          source: 'ws-server',
          operation: 'broadcastWorldTimeUpdate',
          session_id: session.id,
        });
      }
    }
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'broadcastWorldTimeUpdate',
    });
  }
}

/**
 * Broadcast NPC movement to all subscribed clients
 */
export function broadcastNPCMoved(
  ctx: HandlerContext,
  data: {
    npcId: string;
    isAI: boolean;
    position: { x: number; y: number };
    targetPosition?: { x: number; y: number };
    buildingId?: string;
    activity: string;
    activityDescription?: string;
  }
): void {
  const message = serializeMessage({
    type: 'world:npcMoved',
    payload: data,
  });

  for (const [ws, session] of ctx.clients.entries()) {
    if (!session.subscribedToWorld) continue;

    try {
      ws.send(message);
    } catch (err) {
      errorLogger.log(err, {
        source: 'ws-server',
        operation: 'broadcastNPCMoved',
        session_id: session.id,
      });
    }
  }
}
