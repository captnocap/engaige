/**
 * Pinball Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handlePinballStartGame(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { startGame } = await import('../../services/pinball.js');

    const game = startGame('player', 'player');
    ctx.send(ws, createResponse(message.id, true, game));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballStartGame',
    });
    ctx.send(ws, createError('Failed to start game', 'INTERNAL_ERROR', message.id));
  }
}

async function handlePinballEndGame(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { endGame } = await import('../../services/pinball.js');
    const payload = message.payload as {
      game_id: string;
      score: number;
      balls_used: number;
      max_combo: number;
      duration_seconds: number;
    };

    if (!payload?.game_id || payload?.score === undefined) {
      ctx.send(ws, createError('Missing game_id or score', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const game = endGame(
      payload.game_id,
      payload.score,
      payload.balls_used || 3,
      payload.max_combo || 1,
      payload.duration_seconds || 0
    );

    if (!game) {
      ctx.send(ws, createError('Game not found or already ended', 'NOT_FOUND', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, game));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballEndGame',
    });
    ctx.send(ws, createError('Failed to end game', 'INTERNAL_ERROR', message.id));
  }
}

async function handlePinballAbandonGame(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { abandonGame } = await import('../../services/pinball.js');
    const payload = message.payload as { game_id: string };

    if (!payload?.game_id) {
      ctx.send(ws, createError('Missing game_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const success = abandonGame(payload.game_id);

    if (!success) {
      ctx.send(ws, createError('Failed to abandon game', 'ABANDON_FAILED', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, { abandoned: true }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballAbandonGame',
    });
    ctx.send(ws, createError('Failed to abandon game', 'INTERNAL_ERROR', message.id));
  }
}

async function handlePinballGetLeaderboard(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getGlobalLeaderboard } = await import('../../services/pinball-leaderboard.js');
    const payload = message.payload as { limit?: number };

    const leaderboard = getGlobalLeaderboard(payload?.limit || 20);
    ctx.send(ws, createResponse(message.id, true, leaderboard));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballGetLeaderboard',
    });
    ctx.send(ws, createError('Failed to get leaderboard', 'INTERNAL_ERROR', message.id));
  }
}

async function handlePinballGetGameHistory(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getGameHistory } = await import('../../services/pinball.js');
    const payload = message.payload as { limit?: number };

    const history = getGameHistory('player', 'player', payload?.limit || 25);
    ctx.send(ws, createResponse(message.id, true, history));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballGetGameHistory',
    });
    ctx.send(ws, createError('Failed to get game history', 'INTERNAL_ERROR', message.id));
  }
}

async function handlePinballGetProfile(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getPlayerStats } = await import('../../services/pinball-leaderboard.js');
    const { calculateBenchmark } = await import('../../services/pinball.js');

    const stats = getPlayerStats('player', 'player');

    if (!stats) {
      ctx.send(ws, createError('Profile not found', 'NOT_FOUND', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, {
      ...stats,
      benchmark: calculateBenchmark(stats.elo_rating),
    }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballGetProfile',
    });
    ctx.send(ws, createError('Failed to get profile', 'INTERNAL_ERROR', message.id));
  }
}

async function handlePinballGetActiveGame(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getActiveGame } = await import('../../services/pinball.js');

    const game = getActiveGame('player', 'player');
    ctx.send(ws, createResponse(message.id, true, game));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handlePinballGetActiveGame',
    });
    ctx.send(ws, createError('Failed to get active game', 'INTERNAL_ERROR', message.id));
  }
}

export const pinballHandlers: HandlerMap = {
  'pinball:startGame': handlePinballStartGame,
  'pinball:endGame': handlePinballEndGame,
  'pinball:abandonGame': handlePinballAbandonGame,
  'pinball:getLeaderboard': handlePinballGetLeaderboard,
  'pinball:getGameHistory': handlePinballGetGameHistory,
  'pinball:getProfile': handlePinballGetProfile,
  'pinball:getActiveGame': handlePinballGetActiveGame,
};
