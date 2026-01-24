import { registerTaskHandler, scheduleTask } from '../services/background-scheduler.js';
import { getMatch, makeMove, getChessProfile } from '../services/chess.js';
import { scheduleNPCMatch, getActiveNPCMatchCount } from '../services/chess-matchmaker.js';
import * as chessEngine from '../services/chess-engine.js';
import { getDB } from '../db/index.js';
import { errorLogger } from '../services/error-logger.js';
import { eventBus, EventTypes } from '../events/index.js';

/**
 * Chess Autopilot Agent
 *
 * Handles autonomous NPC chess activity:
 * - NPCs make moves in their active matches
 * - NPCs challenge each other to new matches
 * - Realistic move delays based on skill level
 * - Respects concurrency limits (max 50 active NPC matches)
 */

const MAX_CONCURRENT_NPC_MATCHES = 50;

interface BackgroundTask {
  id: string;
  npc_id?: string;
  activity_type: string;
  metadata: string;
}

/**
 * Handle NPC move in an active match
 */
async function handleChessNPCMove(task: BackgroundTask): Promise<void> {
  try {
    const metadata = JSON.parse(task.metadata || '{}');
    const matchId = metadata.match_id;

    if (!matchId) {
      console.error('[Chess Autopilot] No match_id in task metadata');
      return;
    }

    const match = getMatch(matchId);

    if (!match) {
      console.error(`[Chess Autopilot] Match ${matchId} not found`);
      return;
    }

    if (match.status !== 'active') {
      console.log(`[Chess Autopilot] Match ${matchId} is not active, skipping`);
      return;
    }

    // Determine whose turn it is
    const isWhiteTurn = match.move_count % 2 === 0;
    const currentPlayerId = isWhiteTurn ? match.white_player_id : match.black_player_id;
    const currentPlayerType = isWhiteTurn ? match.white_player_type : match.black_player_type;

    // Skip if it's the player's turn
    if (currentPlayerType === 'player') {
      console.log(`[Chess Autopilot] It's the player's turn in match ${matchId}, skipping`);
      return;
    }

    // Get NPC chess profile for skill level and playstyle
    const profile = getChessProfile(currentPlayerId, 'npc');

    if (!profile) {
      console.error(`[Chess Autopilot] No chess profile found for NPC ${currentPlayerId}`);
      return;
    }

    const skillLevel = profile.skill_level || 5;
    const playstyle = profile.playstyle || 'balanced';

    // Generate move
    const move = chessEngine.generateMove(match.current_fen, skillLevel, playstyle);

    if (!move) {
      console.error(`[Chess Autopilot] Failed to generate move for NPC ${currentPlayerId}`);
      return;
    }

    console.log(`[Chess Autopilot] NPC ${currentPlayerId} (skill ${skillLevel}) plays ${move} in match ${matchId}`);

    // Make the move
    const result = makeMove(matchId, currentPlayerId, move);

    if (!result.success) {
      console.error(`[Chess Autopilot] Move failed: ${result.error}`);
      return;
    }

    // If game ended, no need to schedule next move
    if (result.gameEnded) {
      console.log(`[Chess Autopilot] Match ${matchId} ended: ${result.result}`);
      return;
    }

    // Schedule next move if opponent is also an NPC
    const nextPlayerId = isWhiteTurn ? match.black_player_id : match.white_player_id;
    const nextPlayerType = isWhiteTurn ? match.black_player_type : match.white_player_type;

    if (nextPlayerType === 'npc') {
      // Calculate delay based on opponent's skill level
      const opponentProfile = getChessProfile(nextPlayerId, 'npc');
      const opponentSkill = opponentProfile?.skill_level || 5;

      // Higher skill = longer thinking time (5-30 seconds)
      const minDelay = 5;
      const maxDelay = 30;
      const delay = minDelay + (opponentSkill / 10) * (maxDelay - minDelay);

      // Add some randomness (±30%)
      const randomDelay = delay * (0.7 + Math.random() * 0.6);

      scheduleTask('chess_npc_move', {
        delay_seconds: Math.floor(randomDelay),
        npc_id: nextPlayerId,
        metadata: { match_id: matchId },
        priority: 4, // LOW priority
      });
    }

  } catch (error) {
    errorLogger.log(error as Error, {
      source: 'chess-autopilot',
      operation: 'handleChessNPCMove',
      task_id: task.id,
    });
  }
}

/**
 * Handle creating a new NPC vs NPC match
 */
async function handleChessNPCChallenge(task: BackgroundTask): Promise<void> {
  try {
    // Check concurrency limit
    const activeCount = getActiveNPCMatchCount();

    if (activeCount >= MAX_CONCURRENT_NPC_MATCHES) {
      console.log(`[Chess Autopilot] Max concurrent matches (${MAX_CONCURRENT_NPC_MATCHES}) reached, deferring`);
      // Reschedule for later
      scheduleTask('chess_npc_challenge', {
        delay_seconds: 600, // Try again in 10 minutes
        priority: 4,
      });
      return;
    }

    console.log(`[Chess Autopilot] Scheduling new NPC vs NPC match (${activeCount}/${MAX_CONCURRENT_NPC_MATCHES} active)`);

    // Create a match
    const match = scheduleNPCMatch();

    if (!match) {
      console.log('[Chess Autopilot] Failed to schedule NPC match (not enough available NPCs)');
      return;
    }

    console.log(`[Chess Autopilot] Created match ${match.id}: ${match.white_player_id} (white) vs ${match.black_player_id} (black)`);

    // Schedule first move (white's turn)
    const whiteProfile = getChessProfile(match.white_player_id, 'npc');
    const whiteSkill = whiteProfile?.skill_level || 5;

    // Initial move delay: 5-15 seconds
    const initialDelay = 5 + Math.random() * 10;

    scheduleTask('chess_npc_move', {
      delay_seconds: Math.floor(initialDelay),
      npc_id: match.white_player_id,
      metadata: { match_id: match.id },
      priority: 4,
    });

  } catch (error) {
    errorLogger.log(error as Error, {
      source: 'chess-autopilot',
      operation: 'handleChessNPCChallenge',
      task_id: task.id,
    });
  }
}

/**
 * Initialize chess autopilot (register task handlers)
 */
export function initializeChessAutopilot(): void {
  console.log('[Chess Autopilot] Registering task handlers...');

  registerTaskHandler('chess_npc_move', handleChessNPCMove);
  registerTaskHandler('chess_npc_challenge', handleChessNPCChallenge);

  console.log('[Chess Autopilot] Task handlers registered');
}

/**
 * Start chess autopilot activity (schedule initial matches)
 */
export function startChessAutopilot(options: {
  initialBurst?: boolean;
  matchIntervalHours?: number;
} = {}): void {
  const {
    initialBurst = true,
    matchIntervalHours = 2,
  } = options;

  console.log('[Chess Autopilot] Starting autonomous chess activity...');

  if (initialBurst) {
    // Schedule 5-10 matches within the first hour
    const burstCount = 5 + Math.floor(Math.random() * 6);

    console.log(`[Chess Autopilot] Scheduling initial burst of ${burstCount} matches`);

    for (let i = 0; i < burstCount; i++) {
      const delay = Math.random() * 3600; // Random within first hour

      scheduleTask('chess_npc_challenge', {
        delay_seconds: Math.floor(delay),
        priority: 4, // LOW priority
        metadata: { burst: true },
      });
    }
  }

  // Schedule recurring match creation
  const intervalMs = matchIntervalHours * 60 * 60 * 1000;

  setInterval(() => {
    console.log('[Chess Autopilot] Recurring match scheduler triggered');

    scheduleTask('chess_npc_challenge', {
      delay_seconds: 0,
      priority: 4,
    });
  }, intervalMs);

  console.log(`[Chess Autopilot] Recurring match creation every ${matchIntervalHours} hours`);
}

/**
 * Initialize chess profiles for all existing NPCs
 * (Call this during server startup if NPCs already exist)
 */
export function initializeChessProfilesForExistingNPCs(): void {
  const npcDb = getDB('npc');

  // Get all NPCs that don't have chess profiles yet
  const npcsWithoutProfiles = npcDb.prepare(`
    SELECT n.id as npc_id
    FROM npcs n
    LEFT JOIN chess_profiles cp ON n.id = cp.npc_id
    WHERE cp.npc_id IS NULL AND n.is_active = 1
  `).all() as { npc_id: string }[];

  if (npcsWithoutProfiles.length === 0) {
    console.log('[Chess Autopilot] All NPCs already have chess profiles');
    return;
  }

  console.log(`[Chess Autopilot] Initializing chess profiles for ${npcsWithoutProfiles.length} NPCs`);

  const playstyles = ['aggressive', 'defensive', 'balanced', 'tactical', 'positional'];

  for (const { npc_id } of npcsWithoutProfiles) {
    // Random ELO 800-2000
    const initialElo = Math.floor(Math.random() * 1200) + 800;

    // Map ELO to skill level (1-10)
    const skillLevel = Math.floor(((initialElo - 800) / 1200) * 9) + 1;

    // Random playstyle
    const playstyle = playstyles[Math.floor(Math.random() * playstyles.length)];

    // Generate ID for chess profile
    const profileId = crypto.randomUUID();

    npcDb.prepare(`
      INSERT INTO chess_profiles (id, npc_id, elo_rating, peak_elo, skill_level, playstyle)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(profileId, npc_id, initialElo, initialElo, skillLevel, playstyle);
  }

  console.log('[Chess Autopilot] Chess profiles initialized');
}

export default {
  initializeChessAutopilot,
  startChessAutopilot,
  initializeChessProfilesForExistingNPCs,
};
