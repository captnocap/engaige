/**
 * Chess Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, createError, type WSMessage } from '../ws-protocol.js';
import { errorLogger } from '../../services/error-logger.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleChessChallengeNPC(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { challengeNPC } = await import('../../services/chess-matchmaker.js');
    const payload = message.payload as { npc_id: string };

    if (!payload?.npc_id) {
      ctx.send(ws, createError('Missing npc_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const match = challengeNPC('player', payload.npc_id);

    if (!match) {
      ctx.send(ws, createError('NPC is unavailable for chess', 'NPC_UNAVAILABLE', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, match));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessChallengeNPC',
    });
    ctx.send(ws, createError('Failed to challenge NPC', 'INTERNAL_ERROR', message.id));
  }
}

async function handleChessMakeMove(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { makeMove } = await import('../../services/chess.js');
    const payload = message.payload as { match_id: string; move: string };

    if (!payload?.match_id || !payload?.move) {
      ctx.send(ws, createError('Missing match_id or move', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const result = makeMove(payload.match_id, 'player', payload.move);

    if (!result.success) {
      ctx.send(ws, createError(result.error || 'Move failed', 'MOVE_FAILED', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, result));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessMakeMove',
    });
    ctx.send(ws, createError('Failed to make move', 'INTERNAL_ERROR', message.id));
  }
}

async function handleChessResign(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { resignMatch } = await import('../../services/chess.js');
    const payload = message.payload as { match_id: string };

    if (!payload?.match_id) {
      ctx.send(ws, createError('Missing match_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const success = resignMatch(payload.match_id, 'player');

    if (!success) {
      ctx.send(ws, createError('Failed to resign match', 'RESIGN_FAILED', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, { resigned: true }));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessResign',
    });
    ctx.send(ws, createError('Failed to resign', 'INTERNAL_ERROR', message.id));
  }
}

async function handleChessGetLeaderboard(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getGlobalLeaderboard } = await import('../../services/chess-leaderboard.js');
    const payload = message.payload as { limit?: number };

    const leaderboard = getGlobalLeaderboard(payload?.limit || 20);

    ctx.send(ws, createResponse(message.id, true, leaderboard));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetLeaderboard',
    });
    ctx.send(ws, createError('Failed to get leaderboard', 'INTERNAL_ERROR', message.id));
  }
}

async function handleChessGetMatch(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getMatch } = await import('../../services/chess.js');
    const payload = message.payload as { match_id: string };

    if (!payload?.match_id) {
      ctx.send(ws, createError('Missing match_id', 'INVALID_PAYLOAD', message.id));
      return;
    }

    const match = getMatch(payload.match_id);

    if (!match) {
      ctx.send(ws, createError('Match not found', 'NOT_FOUND', message.id));
      return;
    }

    ctx.send(ws, createResponse(message.id, true, match));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetMatch',
    });
    ctx.send(ws, createError('Failed to get match', 'INTERNAL_ERROR', message.id));
  }
}

async function handleChessGetActiveMatches(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getActiveMatches } = await import('../../services/chess.js');

    const matches = getActiveMatches('player', 'player');

    ctx.send(ws, createResponse(message.id, true, matches));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetActiveMatches',
    });
    ctx.send(ws, createError('Failed to get active matches', 'INTERNAL_ERROR', message.id));
  }
}

async function handleChessGetMatchHistory(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  try {
    const { getMatchHistory } = await import('../../services/chess.js');
    const payload = message.payload as { limit?: number };

    const history = getMatchHistory('player', 'player', payload?.limit || 25);

    ctx.send(ws, createResponse(message.id, true, history));
  } catch (error) {
    errorLogger.log(error, {
      source: 'ws-server',
      operation: 'handleChessGetMatchHistory',
    });
    ctx.send(ws, createError('Failed to get match history', 'INTERNAL_ERROR', message.id));
  }
}

export const chessHandlers: HandlerMap = {
  'chess:challengeNPC': handleChessChallengeNPC,
  'chess:makeMove': handleChessMakeMove,
  'chess:resign': handleChessResign,
  'chess:getLeaderboard': handleChessGetLeaderboard,
  'chess:getMatch': handleChessGetMatch,
  'chess:getActiveMatches': handleChessGetActiveMatches,
  'chess:getMatchHistory': handleChessGetMatchHistory,
};
