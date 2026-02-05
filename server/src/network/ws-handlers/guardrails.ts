/**
 * Guardrails Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

function handleGuardrailsGetRating(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const { getPlayerContentRating } = require('../../services/guardrails.js');

  const session = ctx.clients.get(ws);
  const playerId = session?.accountId || 'player';

  const rating = getPlayerContentRating(playerId);
  ctx.send(ws, createResponse(message.id, true, { rating }));
}

function handleGuardrailsSetRating(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const { setPlayerContentRating, isValidRating, getGuardrailConfig, isMoreRestrictive, getPlayerContentRating } = require('../../services/guardrails.js');

  const payload = message.payload as { rating: string };

  if (!payload?.rating || !isValidRating(payload.rating)) {
    ctx.send(ws, createError('Invalid content rating', 'INVALID_PAYLOAD', message.id));
    return;
  }

  const session = ctx.clients.get(ws);
  const playerId = session?.accountId || 'player';

  const oldRating = getPlayerContentRating(playerId);
  setPlayerContentRating(playerId, payload.rating);

  const config = getGuardrailConfig(payload.rating);

  // Broadcast rating change to all clients
  ctx.broadcast({
    type: 'guardrails:ratingChanged',
    payload: {
      old_rating: oldRating,
      new_rating: payload.rating,
      is_more_restrictive: isMoreRestrictive(payload.rating, oldRating),
    },
  });

  ctx.send(ws, createResponse(message.id, true, {
    rating: payload.rating,
    config,
  }));
}

function handleGuardrailsGetConfig(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): void {
  const { getPlayerContentRating, getGuardrailConfig, getAllRatings, getRatingDisplayInfo } = require('../../services/guardrails.js');

  const session = ctx.clients.get(ws);
  const playerId = session?.accountId || 'player';

  const currentRating = getPlayerContentRating(playerId);
  const config = getGuardrailConfig(currentRating);

  // Also include all available ratings with their display info
  const allRatings = getAllRatings().map((rating: string) => ({
    value: rating,
    ...getRatingDisplayInfo(rating),
  }));

  ctx.send(ws, createResponse(message.id, true, {
    currentRating,
    config,
    allRatings,
  }));
}

export const guardrailsHandlers: HandlerMap = {
  'guardrails:getRating': handleGuardrailsGetRating,
  'guardrails:setRating': handleGuardrailsSetRating,
  'guardrails:getConfig': handleGuardrailsGetConfig,
};
