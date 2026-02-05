/**
 * Player Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handlePlayerGet(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getPlayer, getDefaultPlayer } = await import('../../services/player.js');

  // If an ID is provided, get that player; otherwise get the default player
  const playerId = (message.payload as any)?.id;
  const player = playerId ? getPlayer(playerId) : getDefaultPlayer();

  if (!player) {
    ctx.send(ws, createResponse(message.id, false, null, 'Player not found'));
    return;
  }

  ctx.send(ws, createResponse(message.id, true, player));
}

async function handlePlayerGetPreferences(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getPlayerPreferences, getDefaultPlayer } = await import('../../services/player.js');

  // If an ID is provided, use it; otherwise get the default player's ID
  let playerId = (message.payload as any)?.id;

  if (!playerId) {
    const player = getDefaultPlayer();
    if (!player) {
      ctx.send(ws, createResponse(message.id, false, null, 'No player found'));
      return;
    }
    playerId = player.id;
  }

  const preferences = getPlayerPreferences(playerId);
  ctx.send(ws, createResponse(message.id, true, preferences));
}

export const playerHandlers: HandlerMap = {
  'player:get': handlePlayerGet,
  'player:getPreferences': handlePlayerGetPreferences,
};
