/**
 * Personality Test Service
 *
 * Handles the personality test during onboarding:
 * - Loads questions from server/data/personality-test.json
 * - Processes player answers into dimension scores
 * - Computes derived scores (drama_affinity, romance_readiness, social_appetite)
 * - Optionally generates an AI persona summary
 * - Persists the profile to the user DB
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDB } from '../db/index.js';
import { getAIConfig } from './ai.js';
import { doorFetch } from '../network/door.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import { parseOpenAIUsage, parseAnthropicUsage, calculateCost, estimateCost } from '../utils/cost-calculator.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import { generateId } from '../db/index.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type PersonalityDimension =
  | 'conflict_style'
  | 'social_energy'
  | 'emotional_openness'
  | 'humor_preference'
  | 'trust_disposition'
  | 'romance_attitude'
  | 'chaos_tolerance'
  | 'ambition_level';

export interface PersonalityQuestion {
  id: string;
  question: string;
  dimension: PersonalityDimension;
  choices: {
    label: string;
    value: string;
    weights: Record<string, number>;
  }[];
  allowFreeform: boolean;
  skippable: boolean;
  skipDefault: Record<string, number>;
}

export interface PlayerPersonalityProfile {
  dimensions: Record<PersonalityDimension, number>;
  freeform_answers: Record<string, string>;
  drama_affinity: number;
  romance_readiness: number;
  social_appetite: number;
  persona_summary: string;
}

export interface TestAnswer {
  questionId: string;
  choiceValue?: string;
  freeformText?: string;
  skipped: boolean;
}

// ─────────────────────────────────────────────────────────────────
// All personality dimensions for iteration
// ─────────────────────────────────────────────────────────────────

const ALL_DIMENSIONS: PersonalityDimension[] = [
  'conflict_style',
  'social_energy',
  'emotional_openness',
  'humor_preference',
  'trust_disposition',
  'romance_attitude',
  'chaos_tolerance',
  'ambition_level',
];

// ─────────────────────────────────────────────────────────────────
// Question Loading (cached)
// ─────────────────────────────────────────────────────────────────

let cachedQuestions: PersonalityQuestion[] | null = null;

/**
 * Load personality test questions from the JSON data file.
 * Caches after first load for the lifetime of the process.
 */
export function loadQuestions(): PersonalityQuestion[] {
  if (cachedQuestions) {
    return cachedQuestions;
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const questionsPath = join(currentDir, '../../data/personality-test.json');

  const raw = readFileSync(questionsPath, 'utf-8');
  const parsed = JSON.parse(raw);

  // Handle both { questions: [...] } wrapper and flat array formats
  cachedQuestions = Array.isArray(parsed) ? parsed : parsed.questions;
  return cachedQuestions;
}

// ─────────────────────────────────────────────────────────────────
// Answer Processing
// ─────────────────────────────────────────────────────────────────

/**
 * Process an array of test answers into per-dimension scores.
 *
 * For each answered question, looks up the chosen answer's weights and
 * aggregates them per dimension (averaged across all contributing sources).
 * Skipped questions use the question's skipDefault weights.
 * If NO answers are provided at all, returns all dimensions at 0.5 with
 * random jitter of +/-0.15 so results are not perfectly neutral.
 *
 * All values are clamped to [0, 1].
 */
export function processAnswers(answers: TestAnswer[]): Record<PersonalityDimension, number> {
  const questions = loadQuestions();

  // Skip-all path: return neutral with jitter
  if (!answers || answers.length === 0) {
    return buildJitteredNeutral();
  }

  // Accumulate weights per dimension: sum and count for averaging
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const dim of ALL_DIMENSIONS) {
    sums[dim] = 0;
    counts[dim] = 0;
  }

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) continue;

    let weights: Record<string, number>;

    if (answer.skipped) {
      weights = question.skipDefault;
    } else if (answer.choiceValue) {
      const choice = question.choices.find(c => c.value === answer.choiceValue);
      if (!choice) {
        // Unknown choice value, fall back to skipDefault
        weights = question.skipDefault;
      } else {
        weights = choice.weights;
      }
    } else {
      // No choice selected and not explicitly skipped, use skipDefault
      weights = question.skipDefault;
    }

    for (const [dim, value] of Object.entries(weights)) {
      if (dim in sums) {
        sums[dim] += value;
        counts[dim] += 1;
      }
    }
  }

  // Average and clamp
  const result = {} as Record<PersonalityDimension, number>;
  for (const dim of ALL_DIMENSIONS) {
    if (counts[dim] > 0) {
      result[dim] = clamp(sums[dim] / counts[dim], 0, 1);
    } else {
      // No data for this dimension; use neutral with jitter
      result[dim] = clamp(0.5 + jitter(), 0, 1);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────
// Derived Scores
// ─────────────────────────────────────────────────────────────────

/**
 * Compute derived composite scores from raw dimension values.
 *
 * drama_affinity   = conflict_style * 0.4 + chaos_tolerance * 0.3 + emotional_openness * 0.3
 * romance_readiness = romance_attitude * 0.5 + emotional_openness * 0.25 + trust_disposition * 0.25
 * social_appetite  = social_energy * 0.5 + trust_disposition * 0.25 + chaos_tolerance * 0.25
 */
export function computeDerivedScores(
  dimensions: Record<PersonalityDimension, number>
): {
  drama_affinity: number;
  romance_readiness: number;
  social_appetite: number;
} {
  const drama_affinity =
    dimensions.conflict_style * 0.4 +
    dimensions.chaos_tolerance * 0.3 +
    dimensions.emotional_openness * 0.3;

  const romance_readiness =
    dimensions.romance_attitude * 0.5 +
    dimensions.emotional_openness * 0.25 +
    dimensions.trust_disposition * 0.25;

  const social_appetite =
    dimensions.social_energy * 0.5 +
    dimensions.trust_disposition * 0.25 +
    dimensions.chaos_tolerance * 0.25;

  return {
    drama_affinity: clamp(drama_affinity, 0, 1),
    romance_readiness: clamp(romance_readiness, 0, 1),
    social_appetite: clamp(social_appetite, 0, 1),
  };
}

// ─────────────────────────────────────────────────────────────────
// Profile Compilation
// ─────────────────────────────────────────────────────────────────

/**
 * Compile a complete player personality profile from test answers.
 * Calls processAnswers and computeDerivedScores, collects freeform text,
 * and emits the ONBOARDING_PERSONALITY_TEST_COMPLETED event.
 */
export function compileProfile(
  answers: TestAnswer[],
  personaSummary?: string
): PlayerPersonalityProfile {
  const dimensions = processAnswers(answers);
  const derived = computeDerivedScores(dimensions);

  // Collect freeform answers keyed by questionId
  const freeform_answers: Record<string, string> = {};
  for (const answer of answers) {
    if (answer.freeformText && answer.freeformText.trim().length > 0) {
      freeform_answers[answer.questionId] = answer.freeformText.trim();
    }
  }

  const questionsAnswered = answers.filter(a => !a.skipped).length;
  const questionsSkipped = answers.filter(a => a.skipped).length;

  // Emit personality test completed event
  eventBus.fire(
    EventTypes.ONBOARDING_PERSONALITY_TEST_COMPLETED,
    {
      player_id: '', // Will be set by caller if known
      dimensions: dimensions as Record<string, number>,
      drama_affinity: derived.drama_affinity,
      romance_readiness: derived.romance_readiness,
      social_appetite: derived.social_appetite,
      questions_answered: questionsAnswered,
      questions_skipped: questionsSkipped,
    },
    {
      source: 'personality_test',
      importance: 0.7,
    }
  );

  return {
    dimensions,
    freeform_answers,
    drama_affinity: derived.drama_affinity,
    romance_readiness: derived.romance_readiness,
    social_appetite: derived.social_appetite,
    persona_summary: personaSummary || '',
  };
}

// ─────────────────────────────────────────────────────────────────
// AI Persona Summary Generation
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a 2-3 sentence persona summary using the active AI provider.
 * Falls back to a deterministic summary if the AI call fails.
 */
export async function generatePersonaSummary(
  dimensions: Record<PersonalityDimension, number>,
  freeformAnswers: Record<string, string>,
  playerName: string
): Promise<string> {
  const config = getAIConfig();

  // Format dimensions for the prompt
  const dimLines = ALL_DIMENSIONS
    .map(d => `  ${d}: ${dimensions[d].toFixed(2)}`)
    .join('\n');

  // Format freeform answers
  let freeformSection = '';
  const entries = Object.entries(freeformAnswers);
  if (entries.length > 0) {
    const lines = entries.map(([qId, text]) => `  "${qId}": "${text}"`).join('\n');
    freeformSection = `\nTheir own words:\n${lines}`;
  }

  const systemPrompt = 'You are a personality profiler. Write concise, colorful persona summaries in third person present tense. Be specific, not generic.';
  const userPrompt = `Based on these personality test results for ${playerName}, write a 2-3 sentence persona summary.\n\nDimensions (0 = low, 1 = high):\n${dimLines}${freeformSection}\n\nWrite in third person, present tense. Be specific and colorful, not generic.`;

  // Estimate cost
  const promptLength = systemPrompt.length + userPrompt.length;
  const estimatedCostCents = estimateCost(promptLength, 200, config.model);

  // Check budget under npc_generation category (onboarding)
  const budgetCheck = checkBudgetAllows('npc_generation', estimatedCostCents);
  if (!budgetCheck.allowed) {
    console.log('[PersonalityTest] Budget exceeded for persona summary, using fallback');
    return buildFallbackSummary(dimensions, playerName);
  }

  const requestId = generateId();
  const startTime = Date.now();

  try {
    // Emit AI request event
    eventBus.fire(
      EventTypes.AI_REQUEST_SENT,
      {
        request_id: requestId,
        provider: config.provider,
        model: config.model,
        prompt_tokens: promptLength,
        purpose: 'persona_summary',
      },
      { source: 'personality_test' }
    );

    let summaryText: string;

    switch (config.provider) {
      case 'openai':
      case 'openai-compatible': {
        summaryText = await callOpenAIForSummary(systemPrompt, userPrompt, config, requestId);
        break;
      }
      case 'anthropic': {
        summaryText = await callAnthropicForSummary(systemPrompt, userPrompt, config, requestId);
        break;
      }
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    // Emit AI response event
    eventBus.fire(
      EventTypes.AI_RESPONSE_RECEIVED,
      {
        request_id: requestId,
        provider: config.provider,
        model: config.model,
        tokens_used: 0, // Will be logged by the provider-specific call
        cost_cents: 0,
        latency_ms: Date.now() - startTime,
      },
      { source: 'personality_test' }
    );

    return summaryText.trim();
  } catch (error: any) {
    errorLogger.log(error, {
      source: 'personality_test',
      operation: 'generatePersonaSummary',
      metadata: { player_name: playerName, provider: config.provider },
    });

    // Emit AI error event
    eventBus.fire(
      EventTypes.AI_ERROR,
      {
        request_id: requestId,
        provider: config.provider,
        model: config.model,
        error_type: 'persona_summary_failed',
        message: error.message,
      },
      { source: 'personality_test', importance: 0.5 }
    );

    console.log('[PersonalityTest] AI call failed, using fallback summary');
    return buildFallbackSummary(dimensions, playerName);
  }
}

// ─────────────────────────────────────────────────────────────────
// Provider-specific AI calls
// ─────────────────────────────────────────────────────────────────

async function callOpenAIForSummary(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await doorFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 200,
    }),
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

  return data.choices[0].message.content || '';
}

async function callAnthropicForSummary(
  systemPrompt: string,
  userPrompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<string> {
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
      max_tokens: 200,
      system: systemPrompt,
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

  const textBlock = data.content.find((block: any) => block.type === 'text');
  return textBlock?.text || '';
}

// ─────────────────────────────────────────────────────────────────
// Persistence
// ─────────────────────────────────────────────────────────────────

/**
 * Save a compiled personality profile to the user DB settings table.
 */
export function saveProfile(playerId: string, profile: PlayerPersonalityProfile): void {
  const db = getDB('user');
  const key = `personality_profile_${playerId}`;
  const value = JSON.stringify(profile);

  db.prepare(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
  ).run(key, value);
}

/**
 * Load a personality profile from the user DB settings table.
 * Returns null if no profile exists for the given player.
 */
export function getProfile(playerId: string): PlayerPersonalityProfile | null {
  const db = getDB('user');
  const key = `personality_profile_${playerId}`;

  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
  if (!row) return null;

  try {
    return JSON.parse(row.value) as PlayerPersonalityProfile;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Return a random offset in the range [-0.15, +0.15].
 */
function jitter(): number {
  return (Math.random() - 0.5) * 0.3;
}

/**
 * Build a fully neutral dimension set with per-dimension random jitter.
 */
function buildJitteredNeutral(): Record<PersonalityDimension, number> {
  const result = {} as Record<PersonalityDimension, number>;
  for (const dim of ALL_DIMENSIONS) {
    result[dim] = clamp(0.5 + jitter(), 0, 1);
  }
  return result;
}

/**
 * Build a deterministic fallback persona summary from raw dimensions.
 * Used when the AI call fails or budget is exhausted.
 */
function buildFallbackSummary(
  dimensions: Record<PersonalityDimension, number>,
  playerName: string
): string {
  const social = dimensions.social_energy >= 0.5 ? 'extroverted' : 'introverted';
  const openness = dimensions.emotional_openness >= 0.5 ? 'emotionally open' : 'guarded';
  const chaos = dimensions.chaos_tolerance >= 0.5 ? 'embraces chaos' : 'prefers structure';
  const trust = dimensions.trust_disposition >= 0.5 ? 'trusting' : 'cautious';
  const romance = dimensions.romance_attitude >= 0.5 ? 'open to romance' : 'focused on friendships';
  const humor = dimensions.humor_preference >= 0.5 ? 'sharp-witted' : 'earnest';
  const conflict = dimensions.conflict_style >= 0.5 ? 'confronts problems head-on' : 'avoids conflict';
  const ambition = dimensions.ambition_level >= 0.5 ? 'driven' : 'easygoing';

  return `${playerName} is a ${social}, ${openness} person who ${chaos} and tends to be ${trust} of others. They are ${humor}, ${ambition}, ${romance}, and generally ${conflict}.`;
}

export default {
  loadQuestions,
  processAnswers,
  computeDerivedScores,
  compileProfile,
  generatePersonaSummary,
  saveProfile,
  getProfile,
};
