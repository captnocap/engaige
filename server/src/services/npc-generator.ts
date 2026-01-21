/**
 * NPC Batch Generator Service
 *
 * AI-powered generation of diverse NPCs based on player preferences.
 * Used during onboarding to create the initial cast of characters.
 */

import { generateId } from '../db/index.js';
import { createNPC, type NPCCreateData } from './npc.js';
import { getAIConfig, getNPCConfig } from './ai.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import { parseOpenAIUsage, parseAnthropicUsage, calculateCost, estimateCost } from '../utils/cost-calculator.js';
import { doorFetch } from '../network/door.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import type { PlayerPreferences } from './player.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface NPCGenerationInput {
  count: number;
  preferences: PlayerPreferences;
  playerInterests: string[];
  playerPersonalityVibe: string;
}

export interface GeneratedNPCData {
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
  relationship_type: 'romantic_interest' | 'platonic_friend' | 'acquaintance';
  personality_traits: {
    verbosity: 'terse' | 'normal' | 'verbose';
    emoji_usage: 'none' | 'occasional' | 'frequent';
    formality: 'casual' | 'balanced' | 'formal';
    humor_style: 'dry' | 'playful' | 'sarcastic' | 'wholesome';
    response_speed: 'instant' | 'normal' | 'thoughtful';
    quirks: string[];
  };
}

export interface NPCGenerationResult {
  success: boolean;
  npcs: GeneratedNPCData[];
  created_count: number;
  failed_count: number;
  cost_cents: number;
  errors: string[];
}

// ─────────────────────────────────────────────────────────────────
// System Prompts for NPC Generation
// ─────────────────────────────────────────────────────────────────

const NPC_GENERATOR_SYSTEM_PROMPT = `You are a character designer for a social simulation game. Your job is to create diverse, interesting, and realistic NPC personalities that players will want to interact with.

## Your Task
Generate NPC profiles based on the player's preferences. Each NPC should feel like a unique, real person with their own life, interests, opinions, and communication style.

## Guidelines for Creating Compelling NPCs

### Diversity is Key
- Mix different personality types (introverts, extroverts, ambiverts)
- Vary communication styles (verbose, terse, emoji-heavy, formal, casual)
- Include different occupations, hobbies, and life situations
- Create both relatable characters AND interesting "what-if" personalities
- Avoid stereotypes - subvert expectations where appropriate

### For Romantic Interests
- Build genuine chemistry potential with the player's interests
- Create natural conversation starters and shared passions
- Include some "opposites attract" types with complementary traits
- Add relationship dynamics that create engaging storylines

### For Platonic Friends
- Design characters the player would genuinely want to hang out with
- Include supportive personalities, adventure buddies, nerd friends, etc.
- Create meaningful friendship arcs and shared activities
- Some should challenge the player's worldview in healthy ways

### Personality Depth
- Give each NPC a backstory that informs their behavior
- Include small quirks and habits that make them memorable
- Design their communication style to match their personality
- Consider how they'd react to different situations

### Social Media Presence
- Each NPC should have believable social handles
- Their online presence should reflect their personality
- Some are social media addicts, others barely use it

## Output Format
Return a JSON array of NPC objects matching the schema provided.`;

function buildGenerationPrompt(input: NPCGenerationInput): string {
  const { count, preferences, playerInterests, playerPersonalityVibe } = input;

  // Calculate romantic vs platonic split
  let romanticCount = 0;
  let platonicCount = 0;

  if (preferences.romantic_interest_level !== 'none') {
    const romanticRatio = {
      'low': 0.2,
      'medium': 0.4,
      'high': 0.6,
    }[preferences.romantic_interest_level];
    romanticCount = Math.round(count * romanticRatio);
  }
  platonicCount = count - romanticCount;

  // Calculate gender distribution
  let genderInstruction = '';
  switch (preferences.npc_gender_preference) {
    case 'male':
      genderInstruction = 'Generate only male NPCs.';
      break;
    case 'female':
      genderInstruction = 'Generate only female NPCs.';
      break;
    case 'mixed':
      genderInstruction = 'Generate a balanced mix of male and female NPCs (roughly 50/50).';
      break;
    case 'any':
    default:
      genderInstruction = 'Generate NPCs of any gender with natural variety.';
  }

  return `## Player Profile
- **Interests**: ${playerInterests.join(', ')}
- **Personality Vibe**: ${playerPersonalityVibe}

## NPC Requirements
Generate exactly ${count} NPCs with these specifications:
- **Romantic Interests**: ${romanticCount} (NPCs the player might date)
- **Platonic Friends**: ${platonicCount} (NPCs for friendship dynamics)
- **Age Range**: ${preferences.age_range_preference?.min || 18} to ${preferences.age_range_preference?.max || 45} years old
- **Gender**: ${genderInstruction}

## Social Handle Format
Generate social media handles for: myface, instasnap, threadit
Handles should be creative and match the NPC's personality (e.g., @coffee_addict_maya, @tech_bro_derek)

## Important
- Each NPC must feel distinct and memorable
- Some should share interests with the player, others should be different enough to be interesting
- Include a mix of personality types and communication styles
- Every NPC needs a compelling hook - something that makes players want to talk to them
- Generate realistic bios that feel like actual social media profiles

Return the NPCs as a JSON array.`;
}

// ─────────────────────────────────────────────────────────────────
// JSON Schema for Structured Output
// ─────────────────────────────────────────────────────────────────

const NPC_GENERATION_SCHEMA = {
  type: 'object',
  properties: {
    npcs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'Unique lowercase username, no spaces' },
          display_name: { type: 'string', description: 'Display name (can include spaces/emojis)' },
          bio: { type: 'string', description: 'A short bio like you\'d see on social media (2-3 sentences)' },
          personality: { type: 'string', description: 'Brief personality summary (1 sentence)' },
          system_prompt: { type: 'string', description: 'Detailed character description for AI to roleplay as this NPC (3-5 sentences)' },
          age: { type: 'integer', minimum: 18, maximum: 99 },
          gender: { type: 'string', enum: ['male', 'female', 'non-binary'] },
          occupation: { type: 'string', description: 'Job title or life situation' },
          interests: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 8,
            description: 'List of hobbies and interests'
          },
          social_media_handles: {
            type: 'object',
            properties: {
              myface: { type: 'string' },
              instasnap: { type: 'string' },
              threadit: { type: 'string' },
            },
            required: ['myface', 'instasnap']
          },
          relationship_type: {
            type: 'string',
            enum: ['romantic_interest', 'platonic_friend', 'acquaintance']
          },
          personality_traits: {
            type: 'object',
            properties: {
              verbosity: { type: 'string', enum: ['terse', 'normal', 'verbose'] },
              emoji_usage: { type: 'string', enum: ['none', 'occasional', 'frequent'] },
              formality: { type: 'string', enum: ['casual', 'balanced', 'formal'] },
              humor_style: { type: 'string', enum: ['dry', 'playful', 'sarcastic', 'wholesome'] },
              response_speed: { type: 'string', enum: ['instant', 'normal', 'thoughtful'] },
              quirks: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                maxItems: 4,
                description: 'Unique communication quirks (e.g., "always uses ellipsis...", "sends voice notes instead of typing")'
              }
            },
            required: ['verbosity', 'emoji_usage', 'formality', 'humor_style', 'response_speed', 'quirks']
          }
        },
        required: ['username', 'display_name', 'bio', 'personality', 'system_prompt', 'age', 'gender', 'occupation', 'interests', 'social_media_handles', 'relationship_type', 'personality_traits']
      }
    }
  },
  required: ['npcs']
};

// ─────────────────────────────────────────────────────────────────
// Main Generation Function
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a batch of NPCs using AI based on player preferences
 */
export async function generateNPCBatch(input: NPCGenerationInput): Promise<NPCGenerationResult> {
  const config = getAIConfig();
  const errors: string[] = [];

  console.log(`[NPC Generator] Starting batch generation of ${input.count} NPCs`);
  console.log(`[NPC Generator] Using provider: ${config.provider}/${config.model}`);

  // Estimate cost before making request
  // Generation prompt is ~2000 tokens, output is ~500 tokens per NPC
  const estimatedInputTokens = 3000;
  const estimatedOutputTokens = input.count * 600;
  const estimatedCostCents = estimateCost(estimatedInputTokens * 4, estimatedOutputTokens, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows('npc_generation', estimatedCostCents);
  if (!budgetCheck.allowed) {
    return {
      success: false,
      npcs: [],
      created_count: 0,
      failed_count: input.count,
      cost_cents: 0,
      errors: [`Budget limit exceeded: ${budgetCheck.reason}`],
    };
  }

  try {
    const generatedNPCs = await callAIForGeneration(input, config);

    if (!generatedNPCs || generatedNPCs.length === 0) {
      return {
        success: false,
        npcs: [],
        created_count: 0,
        failed_count: input.count,
        cost_cents: 0,
        errors: ['AI returned no NPCs'],
      };
    }

    // Create NPCs in the database
    let createdCount = 0;
    let failedCount = 0;
    const createdNPCs: GeneratedNPCData[] = [];

    for (const npcData of generatedNPCs) {
      try {
        const npcCreateData: NPCCreateData = {
          username: sanitizeUsername(npcData.username),
          display_name: npcData.display_name,
          bio: npcData.bio,
          personality: npcData.personality,
          system_prompt: npcData.system_prompt,
          age: npcData.age,
          gender: npcData.gender,
          occupation: npcData.occupation,
          interests: npcData.interests,
          social_media_handles: npcData.social_media_handles,
        };

        const npc = createNPC(npcCreateData, 'ai');
        createdNPCs.push(npcData);
        createdCount++;

        console.log(`[NPC Generator] Created NPC: ${npc.display_name} (${npc.username})`);
      } catch (error: any) {
        failedCount++;
        errors.push(`Failed to create NPC ${npcData.username}: ${error.message}`);
        errorLogger.log(error, {
          source: 'npc_generator',
          operation: 'createNPC',
          metadata: { username: npcData.username },
        });
      }
    }

    return {
      success: createdCount > 0,
      npcs: createdNPCs,
      created_count: createdCount,
      failed_count: failedCount,
      cost_cents: estimatedCostCents,
      errors,
    };
  } catch (error: any) {
    errorLogger.log(error, {
      source: 'npc_generator',
      operation: 'generateNPCBatch',
      metadata: { count: input.count },
    });

    return {
      success: false,
      npcs: [],
      created_count: 0,
      failed_count: input.count,
      cost_cents: 0,
      errors: [error.message],
    };
  }
}

/**
 * Generate NPCs in smaller batches (for large counts)
 */
export async function generateNPCBatchProgressive(
  input: NPCGenerationInput,
  onProgress?: (created: number, total: number) => void
): Promise<NPCGenerationResult> {
  const batchSize = 5; // Generate 5 NPCs at a time
  const totalCount = input.count;
  const batches = Math.ceil(totalCount / batchSize);

  let allNPCs: GeneratedNPCData[] = [];
  let totalCreated = 0;
  let totalFailed = 0;
  let totalCost = 0;
  const allErrors: string[] = [];

  for (let i = 0; i < batches; i++) {
    const remaining = totalCount - (i * batchSize);
    const currentBatchSize = Math.min(batchSize, remaining);

    console.log(`[NPC Generator] Generating batch ${i + 1}/${batches} (${currentBatchSize} NPCs)`);

    const batchResult = await generateNPCBatch({
      ...input,
      count: currentBatchSize,
    });

    allNPCs = [...allNPCs, ...batchResult.npcs];
    totalCreated += batchResult.created_count;
    totalFailed += batchResult.failed_count;
    totalCost += batchResult.cost_cents;
    allErrors.push(...batchResult.errors);

    if (onProgress) {
      onProgress(totalCreated, totalCount);
    }

    // Small delay between batches to avoid rate limiting
    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    success: totalCreated > 0,
    npcs: allNPCs,
    created_count: totalCreated,
    failed_count: totalFailed,
    cost_cents: totalCost,
    errors: allErrors,
  };
}

// ─────────────────────────────────────────────────────────────────
// AI API Calls
// ─────────────────────────────────────────────────────────────────

async function callAIForGeneration(
  input: NPCGenerationInput,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string }
): Promise<GeneratedNPCData[]> {
  const prompt = buildGenerationPrompt(input);
  const requestId = generateId();
  const startTime = Date.now();

  // Emit AI request event
  eventBus.fire(EventTypes.AI_REQUEST_SENT, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    purpose: 'npc_generation',
  }, {
    source: 'npc_generator',
  });

  let response: any;

  switch (config.provider) {
    case 'openai':
    case 'openai-compatible':
      response = await callOpenAIForGeneration(prompt, config, requestId);
      break;
    case 'anthropic':
      response = await callAnthropicForGeneration(prompt, config, requestId);
      break;
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }

  // Emit AI response event
  eventBus.fire(EventTypes.AI_RESPONSE_RECEIVED, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    tokens_used: response.tokens_used || 0,
    cost_cents: response.cost_cents || 0,
    latency_ms: Date.now() - startTime,
  }, {
    source: 'npc_generator',
  });

  return response.npcs;
}

async function callOpenAIForGeneration(
  prompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<{ npcs: GeneratedNPCData[]; tokens_used: number; cost_cents: number }> {
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
      { role: 'system', content: NPC_GENERATOR_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9, // Higher temperature for more creative variety
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

  // Log cost
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: 'npc_generation',
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: costCents,
  });

  // Parse the response
  const content = data.choices[0].message.content;
  let parsed: { npcs: GeneratedNPCData[] };

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error('[NPC Generator] Failed to parse AI response:', content);
    throw new Error('Failed to parse AI-generated NPCs');
  }

  return {
    npcs: parsed.npcs || [],
    tokens_used: usage.total_tokens,
    cost_cents: costCents,
  };
}

async function callAnthropicForGeneration(
  prompt: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string },
  requestId: string
): Promise<{ npcs: GeneratedNPCData[]; tokens_used: number; cost_cents: number }> {
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
      system: NPC_GENERATOR_SYSTEM_PROMPT + '\n\nIMPORTANT: Respond with valid JSON only. The response must be a JSON object with an "npcs" array.',
      messages: [
        { role: 'user', content: prompt },
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

  // Log cost
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: 'npc_generation',
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: costCents,
  });

  // Parse the response
  const content = data.content.find((block: any) => block.type === 'text')?.text || '';

  // Try to extract JSON from the response
  let parsed: { npcs: GeneratedNPCData[] };

  try {
    // First try direct parse
    parsed = JSON.parse(content);
  } catch {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*"npcs"[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      console.error('[NPC Generator] Failed to parse Anthropic response:', content);
      throw new Error('Failed to parse AI-generated NPCs');
    }
  }

  return {
    npcs: parsed.npcs || [],
    tokens_used: usage.total_tokens,
    cost_cents: costCents,
  };
}

// ─────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────

/**
 * Sanitize username to be valid
 */
function sanitizeUsername(username: string): string {
  // Remove spaces, special chars, make lowercase
  let sanitized = username.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Ensure it starts with a letter
  if (!/^[a-z]/.test(sanitized)) {
    sanitized = 'u_' + sanitized;
  }

  // Truncate if too long
  if (sanitized.length > 30) {
    sanitized = sanitized.slice(0, 30);
  }

  // Add random suffix to ensure uniqueness
  sanitized += '_' + Math.random().toString(36).slice(2, 6);

  return sanitized;
}

/**
 * Quick generation for testing/development
 */
export async function generateTestNPCs(count: number = 5): Promise<NPCGenerationResult> {
  return generateNPCBatch({
    count,
    preferences: {
      preferred_npc_count: count,
      romantic_interest_level: 'medium',
      platonic_friends_level: 'medium',
      interests: ['gaming', 'music', 'technology'],
      personality_vibe: 'chill',
      relationship_style: 'balanced',
      npc_gender_preference: 'mixed',
      age_range_preference: { min: 20, max: 35 },
      occupation_preference: [],
    },
    playerInterests: ['gaming', 'music', 'technology', 'movies'],
    playerPersonalityVibe: 'chill and curious',
  });
}

export default {
  generateNPCBatch,
  generateNPCBatchProgressive,
  generateTestNPCs,
};
