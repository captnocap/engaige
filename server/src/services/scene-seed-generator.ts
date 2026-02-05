/**
 * Scene Seed Generator Pipeline
 *
 * Takes scored/selected scene seeds, calls AI to generate NPCs from them,
 * creates the NPCs in the database, stores cluster data, and manages
 * wave-based generation during onboarding.
 *
 * Flow:
 *  1. Load & score seeds (via seed-scorer)
 *  2. Select optimal set & plan waves
 *  3. Wave 1: generate immediately (blocking)
 *  4. Waves 2+: schedule via background-scheduler
 *  5. Each seed -> AI call -> parse NPCs -> create in DB -> store cluster
 */

import { generateId } from '../db/index.js';
import { getDB } from '../db/index.js';
import { createNPC, updateRelationship, type NPCCreateData } from './npc.js';
import { getAIConfig } from './ai.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import { parseOpenAIUsage, parseAnthropicUsage, calculateCost, estimateCost } from '../utils/cost-calculator.js';
import { doorFetch } from '../network/door.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import { loadAllSeeds, scoreSeeds, selectSeeds, planWaves, type SceneSeed, type SeedSelectionOptions } from './seed-scorer.js';
import { type PlayerPersonalityProfile } from './personality-test.js';
import { scheduleTask, registerTaskHandler } from './background-scheduler.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface GeneratedClusterNPC {
  username: string;
  display_name: string;
  bio: string;
  personality: string;
  system_prompt: string;
  age: number;
  gender: string;
  occupation: string;
  interests: string[];
  social_media_handles: Record<string, string>;
  attitude_toward_player: string;
  relationship_to_other_npcs: string;
  backstory_hook: string;
  role: string;
}

export interface ClusterGenerationResult {
  seed_id: string;
  npcs: GeneratedClusterNPC[];
  npc_ids: string[];
  cluster_id: string;
  success: boolean;
  error?: string;
  cost_cents: number;
}

export interface WaveResult {
  wave_number: number;
  clusters: ClusterGenerationResult[];
  total_npcs_created: number;
  total_cost_cents: number;
}

export interface FullGenerationResult {
  waves: WaveResult[];
  total_npcs_created: number;
  total_cost_cents: number;
  total_seeds_used: number;
  generation_time_ms: number;
}

// ─────────────────────────────────────────────────────────────────
// Template Variables
// ─────────────────────────────────────────────────────────────────

/**
 * Replace all occurrences of {{variable_name}} with the corresponding
 * value from the vars map. Unmatched placeholders are left as-is so
 * the AI can interpret them as part of the creative prompt.
 */
export function injectTemplateVariables(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// Username Sanitization
// ─────────────────────────────────────────────────────────────────

/**
 * Sanitize a username to be valid for the database.
 * Lowercase, remove special chars, add random suffix for uniqueness,
 * ensure starts with a letter, max 30 chars.
 */
function sanitizeUsername(username: string): string {
  let sanitized = username.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Ensure it starts with a letter
  if (!/^[a-z]/.test(sanitized)) {
    sanitized = 'u_' + sanitized;
  }

  // Truncate if too long (leave room for suffix)
  if (sanitized.length > 24) {
    sanitized = sanitized.slice(0, 24);
  }

  // Add random suffix to ensure uniqueness
  sanitized += '_' + Math.random().toString(36).slice(2, 6);

  // Final length guard
  if (sanitized.length > 30) {
    sanitized = sanitized.slice(0, 30);
  }

  return sanitized;
}

// ─────────────────────────────────────────────────────────────────
// Cluster Storage
// ─────────────────────────────────────────────────────────────────

/**
 * Persist cluster data to the npc_seed_clusters table in the game DB.
 * Returns the generated cluster ID.
 */
function storeCluster(
  seedId: string,
  npcIds: string[],
  relationships: Record<string, any>,
  playerDynamics: Record<string, any>,
  waveNumber: number
): string {
  const db = getDB('game');
  const clusterId = generateId();

  db.prepare(`
    INSERT INTO npc_seed_clusters (id, seed_id, npc_ids, relationships, player_dynamics, wave_number)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    clusterId,
    seedId,
    JSON.stringify(npcIds),
    JSON.stringify(relationships),
    JSON.stringify(playerDynamics),
    waveNumber
  );

  return clusterId;
}

// ─────────────────────────────────────────────────────────────────
// Initial Memories
// ─────────────────────────────────────────────────────────────────

/**
 * Insert foundational memories for an NPC about their cluster mates.
 * These memories are high-importance (0.8) and never expire.
 */
function createInitialMemories(
  npcId: string,
  clusterNPCs: { id: string; name: string; relationship: string }[]
): void {
  const db = getDB('game');

  const stmt = db.prepare(`
    INSERT INTO memories (id, npc_id, event_type, content, importance)
    VALUES (?, ?, 'seed_generation', ?, 0.8)
  `);

  for (const mate of clusterNPCs) {
    if (mate.id === npcId) continue;

    const memoryId = generateId();
    const content = `I know ${mate.name}. ${mate.relationship}`;

    stmt.run(memoryId, npcId, content);
  }
}

// ─────────────────────────────────────────────────────────────────
// AI Call: OpenAI-Compatible
// ─────────────────────────────────────────────────────────────────

async function callOpenAIForSeed(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<{ npcs: GeneratedClusterNPC[]; tokens_used: number; cost_cents: number }> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const requestBody: any = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.9,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  };

  const response = await doorFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();
  const usage = parseOpenAIUsage(data);
  const costCents = calculateCost(usage, config.model);

  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: 'npc_generation',
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: costCents,
  });

  const content = data.choices[0].message.content;
  let parsed: { npcs: GeneratedClusterNPC[] };

  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*"npcs"[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI-generated cluster NPCs from OpenAI response');
    }
  }

  return {
    npcs: parsed.npcs || [],
    tokens_used: usage.total_tokens,
    cost_cents: costCents,
  };
}

// ─────────────────────────────────────────────────────────────────
// AI Call: Anthropic
// ─────────────────────────────────────────────────────────────────

async function callAnthropicForSeed(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<{ npcs: GeneratedClusterNPC[]; tokens_used: number; cost_cents: number }> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key required');
  }

  const response = await doorFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4000,
      system: systemPrompt + '\n\nIMPORTANT: Respond with valid JSON only. The response must be a JSON object with an "npcs" array.',
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  const data = await response.json();
  const usage = parseAnthropicUsage(data);
  const costCents = calculateCost(usage, config.model);

  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: 'npc_generation',
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: costCents,
  });

  const content = data.content.find((block: any) => block.type === 'text')?.text || '';

  let parsed: { npcs: GeneratedClusterNPC[] };

  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*"npcs"[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI-generated cluster NPCs from Anthropic response');
    }
  }

  return {
    npcs: parsed.npcs || [],
    tokens_used: usage.total_tokens,
    cost_cents: costCents,
  };
}

// ─────────────────────────────────────────────────────────────────
// Core: Generate NPCs from a Single Seed
// ─────────────────────────────────────────────────────────────────

/**
 * The core function that calls AI to generate NPCs from a single seed.
 *
 * Steps:
 *  1. Build template variables from player profile
 *  2. Inject chain context if this is a chain seed
 *  3. Fill the narrative_prompt template
 *  4. Check budget
 *  5. Call AI with seed.system_prompt + filled narrative
 *  6. Parse response, create NPCs, store cluster, create memories
 */
export async function generateFromSeed(
  seed: SceneSeed,
  profile: PlayerPersonalityProfile,
  playerName: string,
  existingNPCContext?: Record<string, any>
): Promise<ClusterGenerationResult> {
  const config = getAIConfig();
  const requestId = generateId();
  const startTime = Date.now();

  console.log(`[SeedGenerator] Generating from seed: ${seed.name} (${seed.id})`);

  // Build template variables
  const templateVars: Record<string, string> = {
    player_name: playerName,
    player_persona_summary: profile.persona_summary || 'A curious person looking for meaningful connections.',
  };

  // Inject chain context if available
  if (existingNPCContext) {
    templateVars['chain_input_npc'] = JSON.stringify(existingNPCContext);
  }

  // Fill the narrative prompt template
  const filledNarrative = injectTemplateVariables(seed.narrative_prompt, templateVars);

  // Estimate cost: seed prompts are ~1500 tokens, output ~500 per NPC
  const promptLength = seed.system_prompt.length + filledNarrative.length;
  const estimatedOutputTokens = seed.expected_npc_count * 500;
  const estimatedCostCents = estimateCost(promptLength, estimatedOutputTokens, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows('npc_generation', estimatedCostCents);
  if (!budgetCheck.allowed) {
    console.log(`[SeedGenerator] Budget exceeded for seed ${seed.id}: ${budgetCheck.reason}`);
    return {
      seed_id: seed.id,
      npcs: [],
      npc_ids: [],
      cluster_id: '',
      success: false,
      error: `Budget limit exceeded: ${budgetCheck.reason}`,
      cost_cents: 0,
    };
  }

  // Emit AI request event
  eventBus.fire(EventTypes.AI_REQUEST_SENT, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    prompt_tokens: promptLength,
    purpose: 'npc_generation',
  }, {
    source: 'seed_generator',
  });

  try {
    // Call AI based on provider
    let aiResult: { npcs: GeneratedClusterNPC[]; tokens_used: number; cost_cents: number };

    switch (config.provider) {
      case 'openai':
      case 'openai-compatible':
        aiResult = await callOpenAIForSeed(seed.system_prompt, filledNarrative, config, requestId);
        break;
      case 'anthropic':
        aiResult = await callAnthropicForSeed(seed.system_prompt, filledNarrative, config, requestId);
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    // Emit AI response event
    eventBus.fire(EventTypes.AI_RESPONSE_RECEIVED, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      tokens_used: aiResult.tokens_used,
      cost_cents: aiResult.cost_cents,
      latency_ms: Date.now() - startTime,
    }, {
      source: 'seed_generator',
    });

    if (!aiResult.npcs || aiResult.npcs.length === 0) {
      return {
        seed_id: seed.id,
        npcs: [],
        npc_ids: [],
        cluster_id: '',
        success: false,
        error: 'AI returned no NPCs for this seed',
        cost_cents: aiResult.cost_cents,
      };
    }

    // Create NPCs in the database
    const createdNpcIds: string[] = [];
    const createdNpcInfo: { id: string; name: string; relationship: string }[] = [];
    const validNpcs: GeneratedClusterNPC[] = [];

    for (const npcData of aiResult.npcs) {
      try {
        // Build cluster context for the system prompt
        const otherNpcNames = aiResult.npcs
          .filter(n => n.username !== npcData.username)
          .map(n => `${n.display_name} (${n.role}): ${n.relationship_to_other_npcs}`)
          .join('\n');

        const enhancedSystemPrompt = otherNpcNames
          ? `## Related NPCs\n${otherNpcNames}\n\n${npcData.system_prompt}`
          : npcData.system_prompt;

        const npcCreateData: NPCCreateData = {
          username: sanitizeUsername(npcData.username),
          display_name: npcData.display_name,
          bio: npcData.bio,
          personality: npcData.personality,
          system_prompt: enhancedSystemPrompt,
          age: npcData.age,
          gender: npcData.gender,
          occupation: npcData.occupation,
          interests: npcData.interests,
          social_media_handles: npcData.social_media_handles || {},
        };

        const npc = createNPC(npcCreateData, 'ai');

        createdNpcIds.push(npc.id);
        createdNpcInfo.push({
          id: npc.id,
          name: npc.display_name,
          relationship: npcData.relationship_to_other_npcs || `A ${npcData.role} in the group.`,
        });
        validNpcs.push(npcData);

        console.log(`[SeedGenerator] Created NPC: ${npc.display_name} (${npc.username}) - role: ${npcData.role}`);
      } catch (error: any) {
        errorLogger.log(error, {
          source: 'seed_generator',
          operation: 'createNPC',
          metadata: { seed_id: seed.id, username: npcData.username },
        });
        console.log(`[SeedGenerator] Failed to create NPC ${npcData.username}: ${error.message}`);
      }
    }

    if (createdNpcIds.length === 0) {
      return {
        seed_id: seed.id,
        npcs: validNpcs,
        npc_ids: [],
        cluster_id: '',
        success: false,
        error: 'All NPC creations failed',
        cost_cents: aiResult.cost_cents,
      };
    }

    // Create initial memories for each NPC about their cluster mates
    for (const npcId of createdNpcIds) {
      createInitialMemories(npcId, createdNpcInfo);
    }

    // Create NPC-NPC relationships within the cluster
    const relationshipData: Record<string, string> = {};

    for (let i = 0; i < createdNpcIds.length; i++) {
      for (let j = i + 1; j < createdNpcIds.length; j++) {
        const npcA = createdNpcIds[i];
        const npcB = createdNpcIds[j];
        const npcAData = validNpcs[i];
        const npcBData = validNpcs[j];

        // Bidirectional relationship
        updateRelationship(npcA, npcB, {
          relationship_type: 'cluster_mate',
          trust_level: 50,
          affinity: 50,
          notes: `Generated together from seed "${seed.name}". ${npcAData?.relationship_to_other_npcs || ''}`,
        });

        updateRelationship(npcB, npcA, {
          relationship_type: 'cluster_mate',
          trust_level: 50,
          affinity: 50,
          notes: `Generated together from seed "${seed.name}". ${npcBData?.relationship_to_other_npcs || ''}`,
        });

        relationshipData[`${npcA}-${npcB}`] = 'cluster_mate';
      }
    }

    // Build player dynamics from the seed's NPC attitudes
    const playerDynamics: Record<string, string> = {};
    for (let i = 0; i < createdNpcIds.length && i < validNpcs.length; i++) {
      playerDynamics[createdNpcIds[i]] = validNpcs[i].attitude_toward_player || 'neutral';
    }

    // Store the cluster
    const clusterId = storeCluster(
      seed.id,
      createdNpcIds,
      relationshipData,
      playerDynamics,
      1 // Wave number will be updated by the caller
    );

    console.log(`[SeedGenerator] Cluster ${clusterId} stored with ${createdNpcIds.length} NPCs from seed "${seed.name}"`);

    return {
      seed_id: seed.id,
      npcs: validNpcs,
      npc_ids: createdNpcIds,
      cluster_id: clusterId,
      success: true,
      cost_cents: aiResult.cost_cents,
    };
  } catch (error: any) {
    // Emit AI error event
    eventBus.fire(EventTypes.AI_ERROR, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      error_type: 'seed_generation_failed',
      message: error.message,
    }, {
      source: 'seed_generator',
      importance: 0.7,
    });

    errorLogger.log(error, {
      source: 'seed_generator',
      operation: 'generateFromSeed',
      metadata: { seed_id: seed.id, seed_name: seed.name },
    });

    return {
      seed_id: seed.id,
      npcs: [],
      npc_ids: [],
      cluster_id: '',
      success: false,
      error: error.message,
      cost_cents: 0,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Wave Generation
// ─────────────────────────────────────────────────────────────────

/**
 * Generate all seeds in a wave sequentially.
 * For chain seeds, finds the parent cluster result and passes as context.
 */
export async function generateWave(
  waveSeeds: SceneSeed[],
  waveNumber: number,
  profile: PlayerPersonalityProfile,
  playerName: string,
  previousResults: ClusterGenerationResult[]
): Promise<WaveResult> {
  console.log(`[SeedGenerator] Starting wave ${waveNumber} with ${waveSeeds.length} seed(s)`);

  // Emit wave started event
  eventBus.fire(EventTypes.ONBOARDING_NPC_WAVE_STARTED, {
    wave_number: waveNumber,
    seed_ids: waveSeeds.map(s => s.id),
    npcs_created: 0,
    npcs_expected: waveSeeds.reduce((sum, s) => sum + s.expected_npc_count, 0),
    total_npcs_so_far: previousResults.reduce((sum, r) => sum + r.npc_ids.length, 0),
  }, {
    source: 'seed_generator',
    importance: 0.6,
  });

  const clusters: ClusterGenerationResult[] = [];
  let totalNpcsCreated = 0;
  let totalCostCents = 0;

  for (const seed of waveSeeds) {
    // For chain seeds, find the parent cluster's NPCs as context
    let existingNPCContext: Record<string, any> | undefined;

    if (seed.chain_from) {
      const parentResult = previousResults.find(r => r.seed_id === seed.chain_from);
      if (parentResult && parentResult.success) {
        existingNPCContext = {
          parent_seed_id: parentResult.seed_id,
          parent_cluster_id: parentResult.cluster_id,
          parent_npc_ids: parentResult.npc_ids,
          parent_npcs: parentResult.npcs.map(n => ({
            display_name: n.display_name,
            role: n.role,
            personality: n.personality,
            backstory_hook: n.backstory_hook,
          })),
        };
      }
    }

    const result = await generateFromSeed(seed, profile, playerName, existingNPCContext);

    clusters.push(result);
    totalNpcsCreated += result.npc_ids.length;
    totalCostCents += result.cost_cents;

    // Small delay between seeds to avoid rate limiting
    if (waveSeeds.indexOf(seed) < waveSeeds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Emit wave completed event
  const totalSoFar = previousResults.reduce((sum, r) => sum + r.npc_ids.length, 0) + totalNpcsCreated;

  eventBus.fire(EventTypes.ONBOARDING_NPC_WAVE_COMPLETED, {
    wave_number: waveNumber,
    seed_ids: waveSeeds.map(s => s.id),
    npcs_created: totalNpcsCreated,
    npcs_expected: waveSeeds.reduce((sum, s) => sum + s.expected_npc_count, 0),
    total_npcs_so_far: totalSoFar,
  }, {
    source: 'seed_generator',
    importance: 0.7,
  });

  console.log(`[SeedGenerator] Wave ${waveNumber} complete: ${totalNpcsCreated} NPCs created, cost: ${totalCostCents} cents`);

  return {
    wave_number: waveNumber,
    clusters,
    total_npcs_created: totalNpcsCreated,
    total_cost_cents: totalCostCents,
  };
}

// ─────────────────────────────────────────────────────────────────
// Full Generation Orchestrator
// ─────────────────────────────────────────────────────────────────

/**
 * Top-level orchestrator for the full NPC generation pipeline.
 *
 * 1. Load all seeds
 * 2. Score against player profile
 * 3. Select optimal set
 * 4. Plan waves
 * 5. Generate Wave 1 immediately
 * 6. Schedule remaining waves via background-scheduler
 * 7. Emit ONBOARDING_COMPLETED when Wave 1 is done
 */
export async function runFullGeneration(
  profile: PlayerPersonalityProfile,
  playerName: string,
  options: SeedSelectionOptions
): Promise<FullGenerationResult> {
  const startTime = Date.now();

  console.log(`[SeedGenerator] Starting full generation for ${playerName}`);
  console.log(`[SeedGenerator] Target NPC count: ${options.targetNPCCount}, romantic: ${options.romanticEnabled}`);

  // Step 1: Load all seeds
  const allSeeds = loadAllSeeds();
  if (allSeeds.length === 0) {
    console.log('[SeedGenerator] No scene seeds found, aborting generation');
    return {
      waves: [],
      total_npcs_created: 0,
      total_cost_cents: 0,
      total_seeds_used: 0,
      generation_time_ms: Date.now() - startTime,
    };
  }

  // Step 2: Score seeds against player profile
  const scoredSeeds = scoreSeeds(allSeeds, profile, options);

  // Step 3: Select optimal set
  const selectedSeeds = selectSeeds(scoredSeeds, options.targetNPCCount, options.romanticEnabled);

  if (selectedSeeds.length === 0) {
    console.log('[SeedGenerator] No seeds selected after scoring, aborting generation');
    return {
      waves: [],
      total_npcs_created: 0,
      total_cost_cents: 0,
      total_seeds_used: 0,
      generation_time_ms: Date.now() - startTime,
    };
  }

  // Step 4: Plan waves
  const waves = planWaves(selectedSeeds);

  console.log(`[SeedGenerator] ${selectedSeeds.length} seeds selected, ${waves.length} wave(s) planned`);

  // Step 5: Generate Wave 1 immediately
  const allResults: ClusterGenerationResult[] = [];
  const waveResults: WaveResult[] = [];

  const wave1Result = await generateWave(waves[0], 1, profile, playerName, []);
  waveResults.push(wave1Result);
  allResults.push(...wave1Result.clusters);

  // Step 6: Schedule remaining waves
  for (let i = 1; i < waves.length; i++) {
    const waveNumber = i + 1;
    const delaySeconds = i * 60; // Each subsequent wave delayed by 1 minute more

    scheduleTask('generate_npc_wave', {
      priority: 7,
      delay_seconds: delaySeconds,
      budget_category: 'npc_generation',
      metadata: {
        wave_number: waveNumber,
        seed_data: waves[i].map(s => s.id),
        profile: profile,
        player_name: playerName,
        previous_results: allResults.map(r => ({
          seed_id: r.seed_id,
          npc_ids: r.npc_ids,
          cluster_id: r.cluster_id,
          success: r.success,
          npcs: r.npcs,
        })),
      },
    });

    console.log(`[SeedGenerator] Scheduled wave ${waveNumber} with ${waves[i].length} seed(s), delay: ${delaySeconds}s`);
  }

  // Step 7: Emit onboarding completed
  const totalNpcsCreated = wave1Result.total_npcs_created;
  const totalCostCents = wave1Result.total_cost_cents;
  const generationTimeMs = Date.now() - startTime;

  eventBus.fire(EventTypes.ONBOARDING_COMPLETED, {
    player_id: '', // Caller should set this
    total_npcs_created: totalNpcsCreated,
    total_waves: waves.length,
    total_seeds_used: selectedSeeds.length,
    generation_time_ms: generationTimeMs,
  }, {
    source: 'seed_generator',
    importance: 0.9,
  });

  console.log(`[SeedGenerator] Wave 1 complete. ${totalNpcsCreated} NPCs created in ${generationTimeMs}ms. ${waves.length - 1} wave(s) scheduled.`);

  return {
    waves: waveResults,
    total_npcs_created: totalNpcsCreated,
    total_cost_cents: totalCostCents,
    total_seeds_used: selectedSeeds.length,
    generation_time_ms: generationTimeMs,
  };
}

// ─────────────────────────────────────────────────────────────────
// Scheduled Wave Handler
// ─────────────────────────────────────────────────────────────────

/**
 * Called by the background scheduler for Waves 2+.
 * Extracts seed data, profile, and wave number from task metadata,
 * then calls generateWave and broadcasts results.
 */
export async function generateScheduledWave(taskMetadata: Record<string, any>): Promise<void> {
  const waveNumber = taskMetadata.wave_number as number;
  const seedIds = taskMetadata.seed_data as string[];
  const profile = taskMetadata.profile as PlayerPersonalityProfile;
  const playerName = taskMetadata.player_name as string;
  const previousResults = (taskMetadata.previous_results || []) as ClusterGenerationResult[];

  console.log(`[SeedGenerator] Executing scheduled wave ${waveNumber} with ${seedIds.length} seed(s)`);

  // Reload the seeds from cache/disk using the stored IDs
  const allSeeds = loadAllSeeds();
  const waveSeeds = allSeeds.filter(s => seedIds.includes(s.id));

  if (waveSeeds.length === 0) {
    console.log(`[SeedGenerator] No matching seeds found for wave ${waveNumber}, skipping`);
    return;
  }

  const result = await generateWave(waveSeeds, waveNumber, profile, playerName, previousResults);

  // Broadcast wave completion to frontend via event bus
  eventBus.fire(EventTypes.ONBOARDING_NPC_WAVE_COMPLETED, {
    wave_number: result.wave_number,
    seed_ids: waveSeeds.map(s => s.id),
    npcs_created: result.total_npcs_created,
    npcs_expected: waveSeeds.reduce((sum, s) => sum + s.expected_npc_count, 0),
    total_npcs_so_far: previousResults.reduce((sum, r) => sum + r.npc_ids.length, 0) + result.total_npcs_created,
  }, {
    source: 'seed_generator',
    importance: 0.7,
  });
}

// ─────────────────────────────────────────────────────────────────
// Task Handler Registration
// ─────────────────────────────────────────────────────────────────

/**
 * Register the 'generate_npc_wave' task handler with the background scheduler.
 * Must be called during server initialization.
 */
export function registerWaveTaskHandler(): void {
  registerTaskHandler('generate_npc_wave', async (task) => {
    await generateScheduledWave(task.metadata || {});
  });

  console.log('[SeedGenerator] Registered wave task handler');
}

// ─────────────────────────────────────────────────────────────────
// Default Export
// ─────────────────────────────────────────────────────────────────

export default {
  injectTemplateVariables,
  generateFromSeed,
  generateWave,
  runFullGeneration,
  generateScheduledWave,
  registerWaveTaskHandler,
};
