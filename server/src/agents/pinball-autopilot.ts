import { registerTaskHandler, scheduleTask } from '../services/background-scheduler.js';
import { startGame, endGame, getPinballProfile, calculateBenchmark } from '../services/pinball.js';
import { getDB } from '../db/index.js';
import { errorLogger } from '../services/error-logger.js';

/**
 * Pinball Autopilot Agent
 *
 * Handles autonomous NPC pinball activity:
 * - NPCs play simulated pinball games to populate the leaderboard
 * - Score determined by skill level with randomness
 * - Realistic game durations based on skill
 */

interface BackgroundTask {
  id: string;
  npc_id?: string;
  activity_type: string;
  metadata: string;
}

/**
 * Simulate an NPC pinball game.
 * NPC score is based on their skill level (1-10) with random variance.
 */
function simulateNPCScore(skillLevel: number, elo: number): {
  score: number;
  ballsUsed: number;
  maxCombo: number;
  durationSeconds: number;
} {
  // Base score scales with skill level (50k-2M range)
  const baseScore = 50000 + (skillLevel / 10) * 1500000;

  // Add variance (±40%)
  const variance = 0.6 + Math.random() * 0.8; // 0.6 to 1.4
  const score = Math.floor(baseScore * variance);

  // Higher skill = more balls used (longer games), 1-3 balls
  const ballsUsed = 3;

  // Combo scales with skill
  const maxCombo = Math.floor(1 + skillLevel * (0.5 + Math.random() * 0.5));

  // Duration: 60-300 seconds based on skill
  const baseDuration = 60 + skillLevel * 20;
  const durationSeconds = Math.floor(baseDuration * (0.8 + Math.random() * 0.4));

  return { score, ballsUsed, maxCombo, durationSeconds };
}

/**
 * Handle NPC playing a pinball game
 */
async function handlePinballNPCGame(task: BackgroundTask): Promise<void> {
  try {
    const metadata = JSON.parse(task.metadata || '{}');
    const npcId = task.npc_id || metadata.npc_id;

    if (!npcId) {
      console.error('[Pinball Autopilot] No npc_id in task');
      return;
    }

    const profile = getPinballProfile(npcId, 'npc');
    if (!profile) {
      console.error(`[Pinball Autopilot] No pinball profile for NPC ${npcId}`);
      return;
    }

    const skillLevel = profile.skill_level || 5;

    // Start game
    const game = startGame(npcId, 'npc');

    // Simulate play
    const { score, ballsUsed, maxCombo, durationSeconds } = simulateNPCScore(skillLevel, profile.elo_rating);

    // End game with simulated results
    const result = endGame(game.id, score, ballsUsed, maxCombo, durationSeconds);

    if (result) {
      console.log(
        `[Pinball Autopilot] NPC ${npcId} (skill ${skillLevel}) scored ${score.toLocaleString()} ` +
        `(benchmark: ${game.benchmark_score.toLocaleString()}) → ${result.result} (${result.elo_change > 0 ? '+' : ''}${result.elo_change} ELO)`
      );
    }
  } catch (error) {
    errorLogger.log(error as Error, {
      source: 'pinball-autopilot',
      operation: 'handlePinballNPCGame',
      task_id: task.id,
    });
  }
}

/**
 * Handle scheduling a new batch of NPC pinball games
 */
async function handlePinballNPCBatch(task: BackgroundTask): Promise<void> {
  try {
    const npcDb = getDB('npc');

    // Get NPCs with pinball profiles, pick a random subset
    const npcs = npcDb.prepare(`
      SELECT pp.npc_id, pp.skill_level
      FROM pinball_profiles pp
      JOIN npcs n ON pp.npc_id = n.id
      WHERE n.is_active = 1
      ORDER BY RANDOM()
      LIMIT 5
    `).all() as { npc_id: string; skill_level: number }[];

    if (npcs.length === 0) {
      console.log('[Pinball Autopilot] No NPCs available for pinball');
      return;
    }

    console.log(`[Pinball Autopilot] Scheduling ${npcs.length} NPC pinball games`);

    for (const npc of npcs) {
      const delay = Math.floor(Math.random() * 300); // Spread over 5 minutes

      scheduleTask('pinball_npc_game', {
        delay_seconds: delay,
        npc_id: npc.npc_id,
        metadata: { npc_id: npc.npc_id },
        priority: 4, // LOW
      });
    }
  } catch (error) {
    errorLogger.log(error as Error, {
      source: 'pinball-autopilot',
      operation: 'handlePinballNPCBatch',
      task_id: task.id,
    });
  }
}

/**
 * Initialize pinball autopilot (register task handlers)
 */
export function initializePinballAutopilot(): void {
  console.log('[Pinball Autopilot] Registering task handlers...');

  registerTaskHandler('pinball_npc_game', handlePinballNPCGame);
  registerTaskHandler('pinball_npc_batch', handlePinballNPCBatch);

  console.log('[Pinball Autopilot] Task handlers registered');
}

/**
 * Start pinball autopilot activity
 */
export function startPinballAutopilot(options: {
  initialBurst?: boolean;
  batchIntervalHours?: number;
} = {}): void {
  const {
    initialBurst = true,
    batchIntervalHours = 3,
  } = options;

  console.log('[Pinball Autopilot] Starting autonomous pinball activity...');

  if (initialBurst) {
    // Schedule initial burst within first hour
    const burstCount = 3 + Math.floor(Math.random() * 4); // 3-6 batches

    console.log(`[Pinball Autopilot] Scheduling initial burst of ${burstCount} batches`);

    for (let i = 0; i < burstCount; i++) {
      const delay = Math.floor(Math.random() * 3600);

      scheduleTask('pinball_npc_batch', {
        delay_seconds: delay,
        priority: 4,
        metadata: { burst: true },
      });
    }
  }

  // Schedule recurring batch creation
  const intervalMs = batchIntervalHours * 60 * 60 * 1000;

  setInterval(() => {
    console.log('[Pinball Autopilot] Recurring batch scheduler triggered');

    scheduleTask('pinball_npc_batch', {
      delay_seconds: 0,
      priority: 4,
    });
  }, intervalMs);

  console.log(`[Pinball Autopilot] Recurring batches every ${batchIntervalHours} hours`);
}

/**
 * Initialize pinball profiles for all existing NPCs
 */
export function initializePinballProfilesForExistingNPCs(): void {
  const npcDb = getDB('npc');

  const npcsWithoutProfiles = npcDb.prepare(`
    SELECT n.id as npc_id
    FROM npcs n
    LEFT JOIN pinball_profiles pp ON n.id = pp.npc_id
    WHERE pp.npc_id IS NULL AND n.is_active = 1
  `).all() as { npc_id: string }[];

  if (npcsWithoutProfiles.length === 0) {
    console.log('[Pinball Autopilot] All NPCs already have pinball profiles');
    return;
  }

  console.log(`[Pinball Autopilot] Initializing pinball profiles for ${npcsWithoutProfiles.length} NPCs`);

  const playstyles = ['aggressive', 'defensive', 'balanced', 'precise', 'chaotic'];

  for (const { npc_id } of npcsWithoutProfiles) {
    const initialElo = Math.floor(Math.random() * 1200) + 800; // 800-2000
    const skillLevel = Math.floor(((initialElo - 800) / 1200) * 9) + 1; // 1-10
    const playstyle = playstyles[Math.floor(Math.random() * playstyles.length)];
    const profileId = crypto.randomUUID();

    npcDb.prepare(`
      INSERT INTO pinball_profiles (id, npc_id, elo_rating, peak_elo, skill_level, playstyle)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(profileId, npc_id, initialElo, initialElo, skillLevel, playstyle);
  }

  console.log('[Pinball Autopilot] Pinball profiles initialized');
}

export default {
  initializePinballAutopilot,
  startPinballAutopilot,
  initializePinballProfilesForExistingNPCs,
};
