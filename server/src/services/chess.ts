import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import type { Playstyle } from './chess-engine.js';
import * as chessEngine from './chess-engine.js';

/**
 * Chess Service
 *
 * Core chess business logic for match management, move handling, and ELO calculations.
 * Integrates with event bus to emit game events.
 */

export interface ChessMatch {
  id: string;
  white_player_id: string;
  white_player_type: 'player' | 'npc';
  black_player_id: string;
  black_player_type: 'player' | 'npc';
  status: 'active' | 'completed' | 'abandoned';
  result?: 'white_win' | 'black_win' | 'draw' | 'abandoned';
  termination_reason?: string;
  moves: string[];
  current_fen: string;
  move_count: number;
  white_elo_before?: number;
  black_elo_before?: number;
  white_elo_after?: number;
  black_elo_after?: number;
  elo_change?: number;
  started_at: number;
  completed_at?: number;
  last_move_at?: number;
}

export interface ChessMove {
  id: string;
  match_id: string;
  move_number: number;
  player_id: string;
  player_type: 'player' | 'npc';
  move_notation: string;
  move_uci: string;
  fen_after: string;
  is_check: number;
  is_checkmate: number;
  time_taken_ms?: number;
  created_at: number;
}

export interface ChessProfile {
  id: string;
  npc_id?: string; // Undefined for player profile
  elo_rating: number;
  peak_elo: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  skill_level?: number;
  playstyle?: Playstyle;
  current_win_streak?: number;
  best_win_streak?: number;
  last_game_at?: number;
}

interface MoveResult {
  success: boolean;
  match?: ChessMatch;
  move?: ChessMove;
  error?: string;
  gameEnded?: boolean;
  result?: 'white_win' | 'black_win' | 'draw';
}

/**
 * Get chess profile (player or NPC)
 */
export function getChessProfile(playerId: string, playerType: 'player' | 'npc'): ChessProfile | null {
  if (playerType === 'player') {
    const db = getDB('user');
    const profile = db.prepare(`
      SELECT * FROM player_chess_profile WHERE id = ?
    `).get('player') as ChessProfile | undefined;
    return profile || null;
  } else {
    const db = getDB('npc');
    const profile = db.prepare(`
      SELECT * FROM chess_profiles WHERE npc_id = ?
    `).get(playerId) as ChessProfile | undefined;
    return profile || null;
  }
}

/**
 * Update chess profile stats
 */
function updateChessProfile(
  playerId: string,
  playerType: 'player' | 'npc',
  updates: Partial<ChessProfile>
): void {
  if (playerType === 'player') {
    const db = getDB('user');
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);

    db.prepare(`
      UPDATE player_chess_profile
      SET ${setClause}, updated_at = ?
      WHERE id = 'player'
    `).run(...values, now());
  } else {
    const db = getDB('npc');
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'npc_id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);

    db.prepare(`
      UPDATE chess_profiles
      SET ${setClause}, updated_at = ?
      WHERE npc_id = ?
    `).run(...values, now(), playerId);
  }
}

/**
 * Create a new chess match
 */
export function createMatch(
  whiteId: string,
  whiteType: 'player' | 'npc',
  blackId: string,
  blackType: 'player' | 'npc'
): ChessMatch {
  const db = getDB('game');

  // Get current ELO ratings
  const whiteProfile = getChessProfile(whiteId, whiteType);
  const blackProfile = getChessProfile(blackId, blackType);

  const matchId = generateId();
  const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  db.prepare(`
    INSERT INTO chess_matches (
      id, white_player_id, white_player_type, black_player_id, black_player_type,
      status, current_fen, move_count, white_elo_before, black_elo_before, started_at, last_move_at
    ) VALUES (?, ?, ?, ?, ?, 'active', ?, 0, ?, ?, ?, ?)
  `).run(
    matchId,
    whiteId,
    whiteType,
    blackId,
    blackType,
    initialFen,
    whiteProfile?.elo_rating || 1200,
    blackProfile?.elo_rating || 1200,
    now(),
    now()
  );

  const match = getMatch(matchId)!;

  // Emit event
  eventBus.fire(
    EventTypes.CHESS_MATCH_STARTED,
    {
      match_id: matchId,
      white_player_id: whiteId,
      black_player_id: blackId,
      white_elo: whiteProfile?.elo_rating || 1200,
      black_elo: blackProfile?.elo_rating || 1200,
    },
    {
      source: 'chess',
      importance: 0.6,
    }
  );

  return match;
}

/**
 * Get a match by ID
 */
export function getMatch(matchId: string): ChessMatch | null {
  const db = getDB('game');
  const row = db.prepare(`
    SELECT * FROM chess_matches WHERE id = ?
  `).get(matchId) as any;

  if (!row) return null;

  return {
    ...row,
    moves: JSON.parse(row.moves || '[]'),
  };
}

/**
 * Get active matches (optionally filtered by player)
 */
export function getActiveMatches(playerId?: string, playerType?: 'player' | 'npc'): ChessMatch[] {
  const db = getDB('game');

  let query = `SELECT * FROM chess_matches WHERE status = 'active'`;
  const params: any[] = [];

  if (playerId && playerType) {
    query += ` AND ((white_player_id = ? AND white_player_type = ?) OR (black_player_id = ? AND black_player_type = ?))`;
    params.push(playerId, playerType, playerId, playerType);
  }

  query += ` ORDER BY last_move_at DESC`;

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(row => ({
    ...row,
    moves: JSON.parse(row.moves || '[]'),
  }));
}

/**
 * Get match history (completed matches)
 */
export function getMatchHistory(playerId: string, playerType: 'player' | 'npc', limit: number = 25): ChessMatch[] {
  const db = getDB('game');

  const rows = db.prepare(`
    SELECT * FROM chess_matches
    WHERE status = 'completed'
      AND ((white_player_id = ? AND white_player_type = ?) OR (black_player_id = ? AND black_player_type = ?))
    ORDER BY completed_at DESC
    LIMIT ?
  `).all(playerId, playerType, playerId, playerType, limit) as any[];

  return rows.map(row => ({
    ...row,
    moves: JSON.parse(row.moves || '[]'),
  }));
}

/**
 * Make a move in a match
 */
export function makeMove(matchId: string, playerId: string, move: string): MoveResult {
  const match = getMatch(matchId);
  if (!match) {
    return { success: false, error: 'Match not found' };
  }

  if (match.status !== 'active') {
    return { success: false, error: 'Match is not active' };
  }

  // Determine whose turn it is
  const isWhiteTurn = match.move_count % 2 === 0;
  const currentPlayerId = isWhiteTurn ? match.white_player_id : match.black_player_id;
  const currentPlayerType = isWhiteTurn ? match.white_player_type : match.black_player_type;

  if (playerId !== currentPlayerId) {
    return { success: false, error: 'Not your turn' };
  }

  // Validate move
  if (!chessEngine.validateMove(match.current_fen, move)) {
    return { success: false, error: 'Illegal move' };
  }

  // Apply move
  const newFen = chessEngine.getFenAfterMove(match.current_fen, move);
  if (!newFen) {
    return { success: false, error: 'Failed to apply move' };
  }

  const moveDetails = chessEngine.getMoveDetails(match.current_fen, move);
  const moveUci = chessEngine.moveToUCI(match.current_fen, move);

  // Store move
  const db = getDB('game');
  const moveId = generateId();
  const moveNumber = match.move_count + 1;

  db.prepare(`
    INSERT INTO chess_moves (
      id, match_id, move_number, player_id, player_type,
      move_notation, move_uci, fen_after, is_check, is_checkmate, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    moveId,
    matchId,
    moveNumber,
    playerId,
    currentPlayerType,
    move,
    moveUci || move,
    newFen,
    moveDetails.isCheckmate ? 1 : 0,
    moveDetails.isCheckmate ? 1 : 0,
    now()
  );

  // Update match
  const updatedMoves = [...match.moves, move];

  db.prepare(`
    UPDATE chess_matches
    SET current_fen = ?, moves = ?, move_count = ?, last_move_at = ?
    WHERE id = ?
  `).run(newFen, JSON.stringify(updatedMoves), moveNumber, now(), matchId);

  // Emit move event
  eventBus.fire(
    EventTypes.CHESS_MOVE_MADE,
    {
      match_id: matchId,
      player_id: playerId,
      move_notation: move,
      move_number: moveNumber,
      is_check: moveDetails.isCheck,
      is_checkmate: moveDetails.isCheckmate,
      fen_after: newFen,
    },
    {
      source: 'chess',
      importance: 0.4,
    }
  );

  // Check for game end
  if (moveDetails.isCheckmate) {
    const result = isWhiteTurn ? 'white_win' : 'black_win';
    endMatch(matchId, result, 'checkmate');
    return {
      success: true,
      match: getMatch(matchId)!,
      gameEnded: true,
      result,
    };
  }

  if (chessEngine.isDraw(newFen)) {
    endMatch(matchId, 'draw', 'stalemate');
    return {
      success: true,
      match: getMatch(matchId)!,
      gameEnded: true,
      result: 'draw',
    };
  }

  return {
    success: true,
    match: getMatch(matchId)!,
    gameEnded: false,
  };
}

/**
 * Resign a match
 */
export function resignMatch(matchId: string, playerId: string): boolean {
  const match = getMatch(matchId);
  if (!match || match.status !== 'active') return false;

  const isWhite = match.white_player_id === playerId;
  const result = isWhite ? 'black_win' : 'white_win';

  endMatch(matchId, result, 'resignation');
  return true;
}

/**
 * End a match and update ELO ratings
 */
function endMatch(matchId: string, result: 'white_win' | 'black_win' | 'draw' | 'abandoned', reason: string): void {
  const match = getMatch(matchId);
  if (!match) return;

  const db = getDB('game');

  // Calculate ELO changes
  const whiteElo = match.white_elo_before || 1200;
  const blackElo = match.black_elo_before || 1200;

  let whiteEloChange = 0;
  let blackEloChange = 0;

  if (result !== 'abandoned') {
    if (result === 'white_win') {
      whiteEloChange = calculateEloChange(whiteElo, blackElo, false);
      blackEloChange = -whiteEloChange;
    } else if (result === 'black_win') {
      blackEloChange = calculateEloChange(blackElo, whiteElo, false);
      whiteEloChange = -blackEloChange;
    } else {
      // Draw
      whiteEloChange = calculateEloChange(whiteElo, blackElo, true);
      blackEloChange = calculateEloChange(blackElo, whiteElo, true);
    }
  }

  const whiteEloAfter = whiteElo + whiteEloChange;
  const blackEloAfter = blackElo + blackEloChange;

  // Update match
  db.prepare(`
    UPDATE chess_matches
    SET status = 'completed',
        result = ?,
        termination_reason = ?,
        white_elo_after = ?,
        black_elo_after = ?,
        elo_change = ?,
        completed_at = ?
    WHERE id = ?
  `).run(result, reason, whiteEloAfter, blackEloAfter, Math.abs(whiteEloChange), now(), matchId);

  // Update player profiles
  updatePlayerStatsAfterMatch(match.white_player_id, match.white_player_type, result === 'white_win' ? 'win' : (result === 'black_win' ? 'loss' : 'draw'), whiteEloChange);
  updatePlayerStatsAfterMatch(match.black_player_id, match.black_player_type, result === 'black_win' ? 'win' : (result === 'white_win' ? 'loss' : 'draw'), blackEloChange);

  // Emit match ended event
  eventBus.fire(
    EventTypes.CHESS_MATCH_ENDED,
    {
      match_id: matchId,
      result,
      termination_reason: reason,
      white_elo_change: whiteEloChange,
      black_elo_change: blackEloChange,
    },
    {
      source: 'chess',
      importance: 0.7,
    }
  );
}

/**
 * Update player stats after a match
 */
function updatePlayerStatsAfterMatch(
  playerId: string,
  playerType: 'player' | 'npc',
  outcome: 'win' | 'loss' | 'draw',
  eloChange: number
): void {
  const profile = getChessProfile(playerId, playerType);
  if (!profile) return;

  const newElo = profile.elo_rating + eloChange;
  const peakElo = Math.max(profile.peak_elo, newElo);

  const updates: Partial<ChessProfile> = {
    elo_rating: newElo,
    peak_elo: peakElo,
    total_games: profile.total_games + 1,
    last_game_at: now(),
  };

  if (outcome === 'win') {
    updates.wins = profile.wins + 1;
    updates.current_win_streak = (profile.current_win_streak || 0) + 1;
    updates.best_win_streak = Math.max(profile.best_win_streak || 0, updates.current_win_streak);
  } else if (outcome === 'loss') {
    updates.losses = profile.losses + 1;
    updates.current_win_streak = 0;
  } else {
    updates.draws = profile.draws + 1;
    updates.current_win_streak = 0;
  }

  updateChessProfile(playerId, playerType, updates);

  // Emit ELO updated event
  eventBus.fire(
    EventTypes.CHESS_ELO_UPDATED,
    {
      player_id: playerId,
      player_type: playerType,
      old_elo: profile.elo_rating,
      new_elo: newElo,
      change: eloChange,
    },
    {
      source: 'chess',
      importance: 0.5,
    }
  );
}

/**
 * Calculate ELO rating change (standard chess formula)
 * @param playerElo - Current player ELO
 * @param opponentElo - Opponent's ELO
 * @param isDraw - Whether the game was a draw
 * @returns ELO change (positive = gain, negative = loss)
 */
export function calculateEloChange(playerElo: number, opponentElo: number, isDraw: boolean): number {
  const K = 32; // K-factor (standard for chess)
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = isDraw ? 0.5 : 1;
  return Math.round(K * (actualScore - expectedScore));
}

export default {
  getChessProfile,
  createMatch,
  getMatch,
  getActiveMatches,
  getMatchHistory,
  makeMove,
  resignMatch,
  calculateEloChange,
};
