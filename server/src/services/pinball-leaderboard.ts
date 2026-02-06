import { getDB } from '../db/index.js';
import type { PinballProfile } from './pinball.js';

/**
 * Pinball Leaderboard Service
 *
 * Handles leaderboard queries, rankings, and game history displays.
 * Implements in-memory caching (5-minute TTL) to reduce database load.
 */

interface LeaderboardEntry extends PinballProfile {
  display_name: string;
  rank: number;
  win_rate: number;
}

// Cache for leaderboard data
let leaderboardCache: LeaderboardEntry[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get global leaderboard (top players by ELO)
 */
export function getGlobalLeaderboard(limit: number = 20): LeaderboardEntry[] {
  const now = Date.now();

  if (leaderboardCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return leaderboardCache.slice(0, limit);
  }

  const npcDb = getDB('npc');
  const userDb = getDB('user');

  // Get NPC profiles
  const npcProfiles = npcDb.prepare(`
    SELECT
      pp.*,
      n.display_name
    FROM pinball_profiles pp
    JOIN npcs n ON pp.npc_id = n.id
    WHERE n.is_active = 1
    ORDER BY pp.elo_rating DESC
  `).all() as any[];

  // Get player profile
  const playerProfile = userDb.prepare(`
    SELECT * FROM player_pinball_profile WHERE id = 'player'
  `).get() as any;

  // Get player display name
  const player = userDb.prepare(`
    SELECT display_name FROM player LIMIT 1
  `).get() as any;

  // Combine all profiles
  const allProfiles: any[] = [...npcProfiles];

  if (playerProfile && playerProfile.total_games > 0) {
    allProfiles.push({
      ...playerProfile,
      display_name: player?.display_name || 'You',
      is_player: true,
    });
  }

  // Sort by ELO
  allProfiles.sort((a, b) => b.elo_rating - a.elo_rating);

  // Add ranks and win rates
  const leaderboard = allProfiles.map((profile, index) => ({
    ...profile,
    rank: index + 1,
    win_rate: profile.total_games > 0
      ? Math.round((profile.wins / profile.total_games) * 100)
      : 0,
  }));

  leaderboardCache = leaderboard;
  cacheTimestamp = now;

  return leaderboard.slice(0, limit);
}

/**
 * Get player's rank in the global leaderboard
 */
export function getPlayerRank(playerId: string, playerType: 'player' | 'npc'): { rank: number; total: number } {
  const leaderboard = getGlobalLeaderboard(1000);

  const playerIndex = leaderboard.findIndex(entry =>
    playerType === 'player'
      ? entry.is_player
      : entry.npc_id === playerId
  );

  return {
    rank: playerIndex >= 0 ? playerIndex + 1 : leaderboard.length + 1,
    total: leaderboard.length,
  };
}

/**
 * Get standings for display
 */
export function getStandings(limit: number = 50): Array<{
  rank: number;
  player_id: string;
  player_type: 'player' | 'npc';
  display_name: string;
  elo: number;
  wins: number;
  losses: number;
  high_score: number;
  win_rate: number;
  streak: number;
}> {
  const leaderboard = getGlobalLeaderboard(limit);

  return leaderboard.map(entry => ({
    rank: entry.rank,
    player_id: entry.is_player ? 'player' : entry.npc_id!,
    player_type: entry.is_player ? 'player' as const : 'npc' as const,
    display_name: entry.display_name,
    elo: entry.elo_rating,
    wins: entry.wins,
    losses: entry.losses,
    high_score: entry.high_score,
    win_rate: entry.win_rate,
    streak: entry.current_win_streak || 0,
  }));
}

/**
 * Clear leaderboard cache
 */
export function clearLeaderboardCache(): void {
  leaderboardCache = null;
  cacheTimestamp = 0;
}

/**
 * Get player's pinball statistics
 */
export function getPlayerStats(playerId: string, playerType: 'player' | 'npc'): {
  elo_rating: number;
  peak_elo: number;
  total_games: number;
  wins: number;
  losses: number;
  high_score: number;
  win_rate: number;
  current_streak: number;
  best_streak: number;
} | null {
  let profile: any;

  if (playerType === 'player') {
    const db = getDB('user');
    profile = db.prepare(`SELECT * FROM player_pinball_profile WHERE id = 'player'`).get();
  } else {
    const db = getDB('npc');
    profile = db.prepare(`SELECT * FROM pinball_profiles WHERE npc_id = ?`).get(playerId);
  }

  if (!profile) return null;

  return {
    elo_rating: profile.elo_rating,
    peak_elo: profile.peak_elo,
    total_games: profile.total_games,
    wins: profile.wins,
    losses: profile.losses,
    high_score: profile.high_score,
    win_rate: profile.total_games > 0
      ? Math.round((profile.wins / profile.total_games) * 100)
      : 0,
    current_streak: profile.current_win_streak || 0,
    best_streak: profile.best_win_streak || 0,
  };
}

export default {
  getGlobalLeaderboard,
  getPlayerRank,
  getStandings,
  getPlayerStats,
  clearLeaderboardCache,
};
