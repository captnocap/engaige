import { getDB } from '../db/index.js';
import { createMatch } from './chess.js';
import type { ChessMatch } from './chess.js';

/**
 * Chess Matchmaker Service
 *
 * Handles matchmaking logic for finding NPC opponents and creating NPC vs NPC matches.
 * Implements ELO-based matchmaking to create competitive games.
 */

/**
 * Find an NPC opponent for the player based on ELO rating
 * @param playerElo - Player's current ELO rating
 * @param excludeIds - NPC IDs to exclude (e.g., NPCs already in active games)
 * @returns NPC ID or null if no suitable opponent found
 */
export function findOpponent(playerElo: number, excludeIds: string[] = []): string | null {
  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  // Get NPCs with active matches
  const activePlayers = gameDb.prepare(`
    SELECT DISTINCT white_player_id as id FROM chess_matches WHERE status = 'active' AND white_player_type = 'npc'
    UNION
    SELECT DISTINCT black_player_id as id FROM chess_matches WHERE status = 'active' AND black_player_type = 'npc'
  `).all() as { id: string }[];

  const activeNpcIds = activePlayers.map(p => p.id);
  const allExcluded = [...excludeIds, ...activeNpcIds];

  // Find NPCs within ±200 ELO range
  const eloMin = playerElo - 200;
  const eloMax = playerElo + 200;

  let query = `
    SELECT cp.npc_id, cp.elo_rating, n.display_name
    FROM chess_profiles cp
    JOIN npcs n ON cp.npc_id = n.id
    WHERE n.is_active = 1
      AND cp.elo_rating BETWEEN ? AND ?
  `;

  if (allExcluded.length > 0) {
    const placeholders = allExcluded.map(() => '?').join(',');
    query += ` AND cp.npc_id NOT IN (${placeholders})`;
  }

  query += ` ORDER BY ABS(cp.elo_rating - ?) ASC LIMIT 10`;

  const params = [eloMin, eloMax, ...allExcluded, playerElo];
  const candidates = npcDb.prepare(query).all(...params) as any[];

  if (candidates.length === 0) {
    // Fallback: find any available NPC if no one in range
    let fallbackQuery = `
      SELECT cp.npc_id
      FROM chess_profiles cp
      JOIN npcs n ON cp.npc_id = n.id
      WHERE n.is_active = 1
    `;

    if (allExcluded.length > 0) {
      const placeholders = allExcluded.map(() => '?').join(',');
      fallbackQuery += ` AND cp.npc_id NOT IN (${placeholders})`;
    }

    fallbackQuery += ` LIMIT 5`;

    const fallbackCandidates = npcDb.prepare(fallbackQuery).all(...allExcluded) as any[];

    if (fallbackCandidates.length === 0) return null;

    // Random selection from fallback candidates
    return fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)].npc_id;
  }

  // Add some randomness to avoid always picking the closest ELO
  // 60% chance to pick closest, 40% chance to pick from top 5
  if (Math.random() < 0.6) {
    return candidates[0].npc_id;
  } else {
    const topN = candidates.slice(0, Math.min(5, candidates.length));
    return topN[Math.floor(Math.random() * topN.length)].npc_id;
  }
}

/**
 * Challenge a specific NPC to a match
 * @param playerId - Player ID
 * @param npcId - NPC to challenge
 * @returns Created match or null if NPC is unavailable
 */
export function challengeNPC(playerId: string, npcId: string): ChessMatch | null {
  const gameDb = getDB('game');

  // Check if NPC is already in an active match
  const activeMatch = gameDb.prepare(`
    SELECT id FROM chess_matches
    WHERE status = 'active'
      AND ((white_player_id = ? AND white_player_type = 'npc')
        OR (black_player_id = ? AND black_player_type = 'npc'))
  `).get(npcId, npcId);

  if (activeMatch) {
    return null; // NPC is busy
  }

  // Randomly assign colors (50/50)
  const playerIsWhite = Math.random() < 0.5;

  const match = playerIsWhite
    ? createMatch(playerId, 'player', npcId, 'npc')
    : createMatch(npcId, 'npc', playerId, 'player');

  return match;
}

/**
 * Schedule an NPC vs NPC match
 * @returns Created match or null if no suitable opponents found
 */
export function scheduleNPCMatch(): ChessMatch | null {
  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  // Get all active NPCs with chess profiles
  const allNpcs = npcDb.prepare(`
    SELECT cp.npc_id, cp.elo_rating, cp.skill_level
    FROM chess_profiles cp
    JOIN npcs n ON cp.npc_id = n.id
    WHERE n.is_active = 1
  `).all() as any[];

  if (allNpcs.length < 2) {
    return null; // Not enough NPCs
  }

  // Get NPCs currently in active matches
  const activePlayers = gameDb.prepare(`
    SELECT DISTINCT white_player_id as id FROM chess_matches WHERE status = 'active' AND white_player_type = 'npc'
    UNION
    SELECT DISTINCT black_player_id as id FROM chess_matches WHERE status = 'active' AND black_player_type = 'npc'
  `).all() as { id: string }[];

  const activeNpcIds = new Set(activePlayers.map(p => p.id));

  // Filter out NPCs in active matches
  const availableNpcs = allNpcs.filter(npc => !activeNpcIds.has(npc.npc_id));

  if (availableNpcs.length < 2) {
    return null; // Not enough available NPCs
  }

  // Pick first NPC randomly (weighted by skill level - higher skill NPCs play more often)
  const skillWeights = availableNpcs.map(npc => npc.skill_level || 5);
  const totalWeight = skillWeights.reduce((sum, w) => sum + w, 0);
  let rand = Math.random() * totalWeight;
  let firstNpcIndex = 0;

  for (let i = 0; i < skillWeights.length; i++) {
    rand -= skillWeights[i];
    if (rand <= 0) {
      firstNpcIndex = i;
      break;
    }
  }

  const firstNpc = availableNpcs[firstNpcIndex];

  // Find opponent within ±300 ELO range
  const eloMin = firstNpc.elo_rating - 300;
  const eloMax = firstNpc.elo_rating + 300;

  const opponents = availableNpcs.filter(npc =>
    npc.npc_id !== firstNpc.npc_id &&
    npc.elo_rating >= eloMin &&
    npc.elo_rating <= eloMax
  );

  let secondNpc: any;

  if (opponents.length > 0) {
    // Pick random opponent from suitable range
    secondNpc = opponents[Math.floor(Math.random() * opponents.length)];
  } else {
    // Fallback: pick any other available NPC
    const others = availableNpcs.filter(npc => npc.npc_id !== firstNpc.npc_id);
    if (others.length === 0) return null;
    secondNpc = others[Math.floor(Math.random() * others.length)];
  }

  // Randomly assign colors
  const firstIsWhite = Math.random() < 0.5;

  const match = firstIsWhite
    ? createMatch(firstNpc.npc_id, 'npc', secondNpc.npc_id, 'npc')
    : createMatch(secondNpc.npc_id, 'npc', firstNpc.npc_id, 'npc');

  return match;
}

/**
 * Get count of active NPC vs NPC matches (for concurrency limit)
 */
export function getActiveNPCMatchCount(): number {
  const gameDb = getDB('game');

  const result = gameDb.prepare(`
    SELECT COUNT(*) as count
    FROM chess_matches
    WHERE status = 'active'
      AND white_player_type = 'npc'
      AND black_player_type = 'npc'
  `).get() as { count: number };

  return result.count;
}

/**
 * Check if an NPC is available for a match
 */
export function isNPCAvailable(npcId: string): boolean {
  const gameDb = getDB('game');

  const activeMatch = gameDb.prepare(`
    SELECT id FROM chess_matches
    WHERE status = 'active'
      AND ((white_player_id = ? AND white_player_type = 'npc')
        OR (black_player_id = ? AND black_player_type = 'npc'))
  `).get(npcId, npcId);

  return !activeMatch;
}

export default {
  findOpponent,
  challengeNPC,
  scheduleNPCMatch,
  getActiveNPCMatchCount,
  isNPCAvailable,
};
