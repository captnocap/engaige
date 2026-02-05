/**
 * Seed Scorer Service
 *
 * Loads scene seeds from disk, scores them against a player personality
 * profile, and selects an optimal set of seeds for NPC generation.
 *
 * Scene seeds live in server/data/scene-seeds/ as .json files.
 * Each seed defines an NPC generation scenario with role slots,
 * dimension requirements, and chaining support for multi-stage arcs.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import type { PlayerPersonalityProfile } from './personality-test.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface SceneSeed {
  id: string;
  name: string;
  category: 'antagonist' | 'romantic' | 'social' | 'wildcard' | 'chain';
  expected_npc_count: number;
  npc_roles: string[];
  tags: string[];
  dimension_weights: Record<string, {
    min?: number;
    max?: number;
    affinity: number;
  }>;
  base_priority: number;
  drama_level: number;
  romance_level: number;
  chain_from?: string;
  chain_input_role?: string;
  chain_depth?: number;
  system_prompt: string;
  narrative_prompt: string;
  output_schema: {
    per_npc: string[];
    relationships: string[];
  };
  requires_romantic_enabled: boolean;
  min_npc_total: number;
}

export interface ScoredSeed {
  seed: SceneSeed;
  score: number;
  boosted: boolean;
}

export interface SeedSelectionOptions {
  targetNPCCount: number;
  romanticEnabled: boolean;
  dramaLevel?: number;
}

// ─────────────────────────────────────────────────────────────────
// Module-level cache
// ─────────────────────────────────────────────────────────────────

let cachedSeeds: SceneSeed[] | null = null;

// ─────────────────────────────────────────────────────────────────
// Seed Loading
// ─────────────────────────────────────────────────────────────────

/**
 * Recursively collect all .json file paths under a directory.
 */
function collectJsonFiles(dir: string): string[] {
  const results: string[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir) as string[];
  } catch {
    return results;
  }

  for (const name of entries) {
    const fullPath = join(dir, name);
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...collectJsonFiles(fullPath));
      } else if (stat.isFile() && extname(name) === '.json') {
        results.push(fullPath);
      }
    } catch {
      // Skip entries that can't be stat'd
    }
  }

  return results;
}

/**
 * Load all scene seeds from server/data/scene-seeds/ recursively.
 * Caches at module level after first load.
 * Returns empty array if the directory does not exist.
 */
export function loadAllSeeds(): SceneSeed[] {
  if (cachedSeeds) {
    return cachedSeeds;
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const seedsDir = join(currentDir, '../../data/scene-seeds');

  if (!existsSync(seedsDir)) {
    console.log('[SeedScorer] Scene seeds directory not found, returning empty array');
    cachedSeeds = [];
    return cachedSeeds;
  }

  const jsonFiles = collectJsonFiles(seedsDir);

  const seeds: SceneSeed[] = [];
  for (const filePath of jsonFiles) {
    try {
      const raw = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as SceneSeed;
      seeds.push(parsed);
    } catch (err) {
      console.log(`[SeedScorer] Failed to parse ${filePath}: ${(err as Error).message}`);
    }
  }

  console.log(`[SeedScorer] Loaded ${seeds.length} scene seeds`);
  cachedSeeds = seeds;
  return cachedSeeds;
}

// ─────────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────────

/**
 * Score every seed against the player personality profile and options.
 *
 * Scoring logic:
 *  1. Filter: skip seeds requiring romance when romance is disabled
 *  2. Dimension matching: enforce min/max bounds, accumulate affinity * dimension value
 *  3. Base priority contribution
 *  4. Drama boost when drama affinity is high
 *  5. Romance boost when romance is enabled and readiness is high
 *
 * Returns all scored seeds sorted descending by score.
 */
export function scoreSeeds(
  seeds: SceneSeed[],
  profile: PlayerPersonalityProfile,
  options: SeedSelectionOptions
): ScoredSeed[] {
  const scored: ScoredSeed[] = [];

  for (const seed of seeds) {
    // Filter: romance requirement
    if (seed.requires_romantic_enabled && !options.romanticEnabled) {
      scored.push({ seed, score: -1, boosted: false });
      continue;
    }

    let score = 0;
    let excluded = false;
    let boosted = false;

    // Dimension matching
    for (const [dimKey, weight] of Object.entries(seed.dimension_weights)) {
      const playerValue = (profile.dimensions as Record<string, number>)[dimKey];
      if (playerValue === undefined) {
        // Dimension not present in profile; skip this weight entry
        continue;
      }

      if (weight.min !== undefined && playerValue < weight.min) {
        excluded = true;
        break;
      }
      if (weight.max !== undefined && playerValue > weight.max) {
        excluded = true;
        break;
      }

      score += weight.affinity * playerValue;
    }

    if (excluded) {
      scored.push({ seed, score: -1, boosted: false });
      continue;
    }

    // Base priority contribution
    score += seed.base_priority / 100;

    // Drama boost
    const dramaLevel = options.dramaLevel ?? profile.drama_affinity;
    if (dramaLevel > 0.5 && seed.drama_level > 0) {
      score += seed.drama_level * (1 + dramaLevel);
      boosted = true;
    }

    // Romance boost
    if (options.romanticEnabled && seed.romance_level > 0) {
      score += seed.romance_level * profile.romance_readiness;
      boosted = true;
    }

    scored.push({ seed, score, boosted });
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

// ─────────────────────────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────────────────────────

/**
 * Select an optimal set of seeds to meet the target NPC count.
 *
 * Enforces category distribution:
 *  - At least 1 antagonist
 *  - At least 1 social
 *  - At most 40% romantic (when enabled)
 *  - Always 1 wildcard
 *
 * Applies diversity penalty when seeds share >2 tags with already selected seeds.
 * Chain seeds only included if their parent seed is already selected.
 * Returns seeds in generation order (non-chain first, then chains).
 */
export function selectSeeds(
  scored: ScoredSeed[],
  targetNPCCount: number,
  romanticEnabled: boolean
): SceneSeed[] {
  // Filter out negative scores
  const viable = scored.filter(s => s.score >= 0);

  const selected: SceneSeed[] = [];
  const selectedIds = new Set<string>();
  let npcCount = 0;

  // Collect all tags from selected seeds for diversity checks
  const selectedTags = new Set<string>();

  // Helper: count shared tags with already selected seeds
  function sharedTagCount(seed: SceneSeed): number {
    let count = 0;
    for (const tag of seed.tags) {
      if (selectedTags.has(tag)) {
        count++;
      }
    }
    return count;
  }

  // Helper: add a seed to the selected set
  function addSeed(seed: SceneSeed): void {
    selected.push(seed);
    selectedIds.add(seed.id);
    npcCount += seed.expected_npc_count;
    for (const tag of seed.tags) {
      selectedTags.add(tag);
    }
  }

  // Helper: count selected seeds of a given category
  function categoryCount(cat: string): number {
    return selected.filter(s => s.category === cat).length;
  }

  // Phase 1: Guarantee required categories
  // Find best antagonist
  const bestAntagonist = viable.find(s => s.seed.category === 'antagonist');
  if (bestAntagonist) {
    addSeed(bestAntagonist.seed);
  }

  // Find best social
  const bestSocial = viable.find(s => s.seed.category === 'social' && !selectedIds.has(s.seed.id));
  if (bestSocial) {
    addSeed(bestSocial.seed);
  }

  // Find best wildcard
  const bestWildcard = viable.find(s => s.seed.category === 'wildcard' && !selectedIds.has(s.seed.id));
  if (bestWildcard) {
    addSeed(bestWildcard.seed);
  } else {
    // Pick a random viable non-selected seed as wildcard stand-in
    const fallbackWildcard = viable.find(s => !selectedIds.has(s.seed.id));
    if (fallbackWildcard) {
      addSeed(fallbackWildcard.seed);
    }
  }

  // Phase 2: Greedy fill to reach target NPC count
  const maxRomanticRatio = 0.4;

  for (const entry of viable) {
    if (npcCount >= targetNPCCount) {
      break;
    }
    if (selectedIds.has(entry.seed.id)) {
      continue;
    }

    const seed = entry.seed;

    // Chain seeds: only include if parent is selected
    if (seed.chain_from && !selectedIds.has(seed.chain_from)) {
      continue;
    }

    // Enforce romantic cap
    if (seed.category === 'romantic') {
      if (!romanticEnabled) continue;
      const currentRomantic = categoryCount('romantic');
      const totalAfterAdd = selected.length + 1;
      if ((currentRomantic + 1) / totalAfterAdd > maxRomanticRatio) {
        continue;
      }
    }

    // Diversity penalty: compute effective score
    let effectiveScore = entry.score;
    if (sharedTagCount(seed) > 2) {
      effectiveScore *= 0.7;
    }

    // Only skip if the penalized score drops below zero
    if (effectiveScore < 0) {
      continue;
    }

    addSeed(seed);
  }

  // Sort: non-chain seeds first, then chain seeds
  const nonChain = selected.filter(s => !s.chain_from);
  const chain = selected.filter(s => !!s.chain_from);

  return [...nonChain, ...resolveChainOrder(chain)];
}

// ─────────────────────────────────────────────────────────────────
// Chain Resolution
// ─────────────────────────────────────────────────────────────────

/**
 * Topologically sort chain seeds so parents come before dependents.
 * Respects chain_depth limit (default 2).
 */
export function resolveChainOrder(seeds: SceneSeed[]): SceneSeed[] {
  const maxDepth = 2;
  const seedMap = new Map<string, SceneSeed>();
  for (const seed of seeds) {
    seedMap.set(seed.id, seed);
  }

  const ordered: SceneSeed[] = [];
  const visited = new Set<string>();

  function visit(seed: SceneSeed, currentDepth: number): void {
    if (visited.has(seed.id)) return;
    if (currentDepth > maxDepth) return;

    // If this seed has a parent in the set, visit parent first
    if (seed.chain_from && seedMap.has(seed.chain_from)) {
      const parent = seedMap.get(seed.chain_from)!;
      visit(parent, currentDepth);
    }

    // Respect chain_depth limit
    const depth = seed.chain_depth ?? 1;
    if (depth > maxDepth) return;

    visited.add(seed.id);
    ordered.push(seed);
  }

  for (const seed of seeds) {
    visit(seed, seed.chain_depth ?? 1);
  }

  return ordered;
}

// ─────────────────────────────────────────────────────────────────
// Wave Planning
// ─────────────────────────────────────────────────────────────────

/**
 * Distribute selected seeds into generation waves.
 *
 * Wave 1 (immediate): First 3-4 seeds (~8-10 NPCs)
 *   Priority: 1 antagonist, 1 romantic/social, 1 social, 1 wildcard
 * Wave 2: Next 3-4 seeds
 * Wave 3: Next 2-3 seeds
 * Wave 4+: Remaining seeds including chains
 *
 * Returns array of arrays, each inner array is one wave.
 */
export function planWaves(selectedSeeds: SceneSeed[]): SceneSeed[][] {
  const waves: SceneSeed[][] = [];
  const used = new Set<string>();

  // Separate chain and non-chain seeds
  const nonChainSeeds = selectedSeeds.filter(s => !s.chain_from);
  const chainSeeds = selectedSeeds.filter(s => !!s.chain_from);

  // Wave 1: priority picks from non-chain seeds
  const wave1: SceneSeed[] = [];

  // Pick 1 antagonist
  const antagonist = nonChainSeeds.find(s => s.category === 'antagonist' && !used.has(s.id));
  if (antagonist) {
    wave1.push(antagonist);
    used.add(antagonist.id);
  }

  // Pick 1 romantic or social
  const romanticOrSocial = nonChainSeeds.find(
    s => (s.category === 'romantic' || s.category === 'social') && !used.has(s.id)
  );
  if (romanticOrSocial) {
    wave1.push(romanticOrSocial);
    used.add(romanticOrSocial.id);
  }

  // Pick 1 social (distinct from above)
  const social = nonChainSeeds.find(s => s.category === 'social' && !used.has(s.id));
  if (social) {
    wave1.push(social);
    used.add(social.id);
  }

  // Pick 1 wildcard
  const wildcard = nonChainSeeds.find(s => s.category === 'wildcard' && !used.has(s.id));
  if (wildcard) {
    wave1.push(wildcard);
    used.add(wildcard.id);
  }

  // Fill wave 1 up to 4 if we have room
  for (const seed of nonChainSeeds) {
    if (wave1.length >= 4) break;
    if (used.has(seed.id)) continue;
    wave1.push(seed);
    used.add(seed.id);
  }

  if (wave1.length > 0) {
    waves.push(wave1);
  }

  // Remaining non-chain seeds
  const remaining = nonChainSeeds.filter(s => !used.has(s.id));

  // Wave 2: next 3-4
  const wave2Size = Math.min(4, remaining.length);
  if (wave2Size > 0) {
    const wave2 = remaining.splice(0, wave2Size);
    for (const s of wave2) used.add(s.id);
    waves.push(wave2);
  }

  // Wave 3: next 2-3
  const wave3Size = Math.min(3, remaining.length);
  if (wave3Size > 0) {
    const wave3 = remaining.splice(0, wave3Size);
    for (const s of wave3) used.add(s.id);
    waves.push(wave3);
  }

  // Wave 4+: everything left (remaining non-chain + all chain seeds)
  const finalSeeds = [...remaining, ...chainSeeds];
  if (finalSeeds.length > 0) {
    for (const s of finalSeeds) used.add(s.id);
    waves.push(finalSeeds);
  }

  console.log(`[SeedScorer] Planned ${waves.length} wave(s): ${waves.map(w => w.length).join(', ')} seeds`);

  return waves;
}

// ─────────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────────

export default {
  loadAllSeeds,
  scoreSeeds,
  selectSeeds,
  resolveChainOrder,
  planWaves,
};
