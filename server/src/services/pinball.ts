import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

/**
 * Pinball Service
 *
 * Core pinball business logic for game lifecycle, scoring, and ELO calculations.
 * Uses a benchmark ELO system for single-player: beat the benchmark = "win".
 */

export interface PinballGame {
  id: string;
  player_id: string;
  player_type: 'player' | 'npc';
  status: 'active' | 'completed' | 'abandoned';
  result?: 'win' | 'loss' | 'abandoned';
  score: number;
  benchmark_score: number;
  balls_used: number;
  max_combo: number;
  duration_seconds: number;
  elo_before?: number;
  elo_after?: number;
  elo_change: number;
  started_at: number;
  completed_at?: number;
}

export interface PinballProfile {
  id: string;
  npc_id?: string;
  elo_rating: number;
  peak_elo: number;
  total_games: number;
  wins: number;
  losses: number;
  high_score: number;
  skill_level?: number;
  playstyle?: string;
  current_win_streak?: number;
  best_win_streak?: number;
  last_game_at?: number;
  is_player?: boolean;
}

/**
 * Calculate benchmark score based on ELO rating.
 * Higher ELO = higher benchmark to beat.
 */
export function calculateBenchmark(elo: number): number {
  return Math.max(100000, 500000 + (elo - 1200) * 2000);
}

/**
 * Get pinball profile (player or NPC)
 */
export function getPinballProfile(playerId: string, playerType: 'player' | 'npc'): PinballProfile | null {
  if (playerType === 'player') {
    const db = getDB('user');
    const profile = db.prepare(`
      SELECT * FROM player_pinball_profile WHERE id = ?
    `).get('player') as PinballProfile | undefined;
    return profile || null;
  } else {
    const db = getDB('npc');
    const profile = db.prepare(`
      SELECT * FROM pinball_profiles WHERE npc_id = ?
    `).get(playerId) as PinballProfile | undefined;
    return profile || null;
  }
}

/**
 * Update pinball profile stats
 */
function updatePinballProfile(
  playerId: string,
  playerType: 'player' | 'npc',
  updates: Partial<PinballProfile>
): void {
  if (playerType === 'player') {
    const db = getDB('user');
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);

    db.prepare(`
      UPDATE player_pinball_profile
      SET ${setClause}, updated_at = ?
      WHERE id = 'player'
    `).run(...values, now());
  } else {
    const db = getDB('npc');
    const fields = Object.keys(updates).filter(k => k !== 'id' && k !== 'npc_id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (updates as any)[f]);

    db.prepare(`
      UPDATE pinball_profiles
      SET ${setClause}, updated_at = ?
      WHERE npc_id = ?
    `).run(...values, now(), playerId);
  }
}

/**
 * Start a new pinball game
 */
export function startGame(playerId: string, playerType: 'player' | 'npc'): PinballGame {
  const db = getDB('game');
  const profile = getPinballProfile(playerId, playerType);
  const elo = profile?.elo_rating || 1200;
  const benchmark = calculateBenchmark(elo);
  const gameId = generateId();

  db.prepare(`
    INSERT INTO pinball_games (
      id, player_id, player_type, status, benchmark_score, elo_before, started_at
    ) VALUES (?, ?, ?, 'active', ?, ?, ?)
  `).run(gameId, playerId, playerType, benchmark, elo, now());

  const game = getGame(gameId)!;

  eventBus.fire(
    EventTypes.PINBALL_GAME_STARTED,
    {
      game_id: gameId,
      player_id: playerId,
      player_type: playerType,
      elo_before: elo,
      benchmark_score: benchmark,
    },
    {
      source: 'pinball',
      importance: 0.5,
    }
  );

  return game;
}

/**
 * Get a game by ID
 */
export function getGame(gameId: string): PinballGame | null {
  const db = getDB('game');
  return db.prepare(`SELECT * FROM pinball_games WHERE id = ?`).get(gameId) as PinballGame | null;
}

/**
 * Get active game for a player
 */
export function getActiveGame(playerId: string, playerType: 'player' | 'npc'): PinballGame | null {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM pinball_games
    WHERE player_id = ? AND player_type = ? AND status = 'active'
    ORDER BY started_at DESC
    LIMIT 1
  `).get(playerId, playerType) as PinballGame | null;
}

/**
 * End a pinball game with final score
 */
export function endGame(
  gameId: string,
  score: number,
  ballsUsed: number,
  maxCombo: number,
  durationSeconds: number
): PinballGame | null {
  const game = getGame(gameId);
  if (!game || game.status !== 'active') return null;

  const db = getDB('game');
  const benchmark = game.benchmark_score;
  const result: 'win' | 'loss' = score >= benchmark ? 'win' : 'loss';

  // Calculate ELO change using benchmark system
  const eloBefore = game.elo_before || 1200;
  const eloChange = calculatePinballEloChange(eloBefore, score, benchmark);
  const eloAfter = eloBefore + eloChange;

  db.prepare(`
    UPDATE pinball_games
    SET status = 'completed',
        result = ?,
        score = ?,
        balls_used = ?,
        max_combo = ?,
        duration_seconds = ?,
        elo_after = ?,
        elo_change = ?,
        completed_at = ?
    WHERE id = ?
  `).run(result, score, ballsUsed, maxCombo, durationSeconds, eloAfter, eloChange, now(), gameId);

  // Update player profile
  updatePlayerStatsAfterGame(game.player_id, game.player_type, result, eloChange, score);

  // Emit game ended event
  eventBus.fire(
    EventTypes.PINBALL_GAME_ENDED,
    {
      game_id: gameId,
      player_id: game.player_id,
      player_type: game.player_type,
      score,
      benchmark_score: benchmark,
      result,
      elo_change: eloChange,
      duration_seconds: durationSeconds,
    },
    {
      source: 'pinball',
      importance: 0.6,
    }
  );

  return getGame(gameId);
}

/**
 * Abandon a pinball game
 */
export function abandonGame(gameId: string): boolean {
  const game = getGame(gameId);
  if (!game || game.status !== 'active') return false;

  const db = getDB('game');
  db.prepare(`
    UPDATE pinball_games
    SET status = 'abandoned', result = 'abandoned', completed_at = ?
    WHERE id = ?
  `).run(now(), gameId);

  return true;
}

/**
 * Get game history for a player
 */
export function getGameHistory(playerId: string, playerType: 'player' | 'npc', limit: number = 25): PinballGame[] {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM pinball_games
    WHERE player_id = ? AND player_type = ? AND status = 'completed'
    ORDER BY completed_at DESC
    LIMIT ?
  `).all(playerId, playerType, limit) as PinballGame[];
}

/**
 * Calculate ELO change for pinball (benchmark system).
 * Uses standard ELO formula where "opponent" is the benchmark.
 */
export function calculatePinballEloChange(playerElo: number, score: number, benchmark: number): number {
  const K = 32;
  // Map score vs benchmark to expected/actual scores
  // Benchmark ELO is treated as the player's own rating (they're playing against themselves)
  const benchmarkElo = playerElo;
  const expectedScore = 1 / (1 + Math.pow(10, (benchmarkElo - playerElo) / 400));
  const actualScore = score >= benchmark ? 1 : 0;

  // Scale based on how much they beat/missed the benchmark
  const ratio = score / benchmark;
  let modifier = 1;
  if (ratio >= 2) modifier = 1.5; // Crushed the benchmark
  else if (ratio >= 1.5) modifier = 1.25;
  else if (ratio < 0.5) modifier = 1.3; // Badly missed

  return Math.round(K * (actualScore - expectedScore) * modifier);
}

/**
 * Update player stats after a game
 */
function updatePlayerStatsAfterGame(
  playerId: string,
  playerType: 'player' | 'npc',
  outcome: 'win' | 'loss',
  eloChange: number,
  score: number
): void {
  const profile = getPinballProfile(playerId, playerType);
  if (!profile) return;

  const newElo = profile.elo_rating + eloChange;
  const peakElo = Math.max(profile.peak_elo, newElo);
  const newHighScore = Math.max(profile.high_score, score);

  const updates: Partial<PinballProfile> = {
    elo_rating: newElo,
    peak_elo: peakElo,
    total_games: profile.total_games + 1,
    high_score: newHighScore,
    last_game_at: now(),
  };

  if (outcome === 'win') {
    updates.wins = profile.wins + 1;
    updates.current_win_streak = (profile.current_win_streak || 0) + 1;
    updates.best_win_streak = Math.max(profile.best_win_streak || 0, updates.current_win_streak);
  } else {
    updates.losses = profile.losses + 1;
    updates.current_win_streak = 0;
  }

  updatePinballProfile(playerId, playerType, updates);

  // Emit ELO updated event
  eventBus.fire(
    EventTypes.PINBALL_ELO_UPDATED,
    {
      player_id: playerId,
      player_type: playerType,
      old_elo: profile.elo_rating,
      new_elo: newElo,
      change: eloChange,
    },
    {
      source: 'pinball',
      importance: 0.5,
    }
  );

  // Emit high score event if applicable
  if (score > profile.high_score) {
    eventBus.fire(
      EventTypes.PINBALL_HIGH_SCORE,
      {
        player_id: playerId,
        player_type: playerType,
        new_high_score: score,
        previous_high_score: profile.high_score,
      },
      {
        source: 'pinball',
        importance: 0.7,
      }
    );
  }
}

export default {
  getPinballProfile,
  startGame,
  getGame,
  getActiveGame,
  endGame,
  abandonGame,
  getGameHistory,
  calculatePinballEloChange,
  calculateBenchmark,
};
