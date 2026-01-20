// Output validation system - catches AI failures and maintains immersion
// Uses cheap model to validate expensive model outputs before sending to player

import { generateNPCResponse } from './ai.js';
import { getDB } from '../db/index.js';

export interface ValidationResult {
  is_valid: boolean;
  failure_type?: 'refusal' | 'breaks_character' | 'out_of_personality' | 'safety_message' | 'meta_reference' | 'other';
  failure_reason?: string;
  suggested_fix?: string;
  confidence: number; // 0-1, how confident the validator is
}

export interface ValidationOptions {
  enable_validation: boolean;
  auto_fix_on_failure: boolean;
  max_retry_attempts: number;
  strict_mode: boolean; // More aggressive validation
}

const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  enable_validation: true,
  auto_fix_on_failure: true,
  max_retry_attempts: 2,
  strict_mode: false,
};

// Common AI refusal patterns
const REFUSAL_PATTERNS = [
  /i('m| am) sorry,? (but )?i can'?t/i,
  /i('m| am) unable to/i,
  /as an ai/i,
  /i don'?t have the ability/i,
  /that would be inappropriate/i,
  /i cannot (help|assist) with/i,
  /against my (programming|guidelines)/i,
  /i'?m not able to/i,
  /i'?m afraid i can'?t/i,
];

// Meta/breaking immersion patterns
const IMMERSION_BREAK_PATTERNS = [
  /as an? (ai|language model|assistant)/i,
  /i('m| am) (just )?a(n)? (ai|bot|program|simulation)/i,
  /in (this|the) (game|simulation|roleplay)/i,
  /my (programming|training|guidelines)/i,
  /\[skip\]/i, // Group chat skip that leaked through
  /\[ooc\]/i, // Out of character markers
];

/**
 * Validate NPC output for character consistency and immersion
 */
export async function validateNPCOutput(
  npcId: string,
  output: string,
  context: {
    platform?: string;
    conversation_type?: 'direct_message' | 'group_chat' | 'post' | 'comment';
    prompt?: string;
  },
  options: Partial<ValidationOptions> = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  if (!opts.enable_validation) {
    return {
      is_valid: true,
      confidence: 1.0,
    };
  }

  // Quick pattern-based checks first (free)
  const quickCheck = quickValidation(output);
  if (!quickCheck.is_valid) {
    console.log(`[Validator] Quick check failed: ${quickCheck.failure_type}`);
    return quickCheck;
  }

  // Deep AI-based validation (costs money but cheap model)
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    return { is_valid: true, confidence: 0.5 }; // Can't validate without NPC data
  }

  const personalityTraits = JSON.parse(npc.personality_traits || '{}');
  const communicationQuirks = JSON.parse(personalityTraits.communication_quirks || '{}');

  const validationPrompt = buildValidationPrompt(npc, output, context, opts.strict_mode);

  try {
    // Use cheap model for validation (GPT-4o-mini or similar)
    const validationResponse = await callValidationModel(validationPrompt);

    const result = parseValidationResponse(validationResponse);

    if (!result.is_valid) {
      console.log(`[Validator] AI validation failed: ${result.failure_type} - ${result.failure_reason}`);
    }

    return result;
  } catch (error) {
    console.error('[Validator] Validation failed:', error);
    // On validation error, assume output is valid (fail open)
    return { is_valid: true, confidence: 0.3 };
  }
}

/**
 * Quick pattern-based validation (no API calls)
 */
function quickValidation(output: string): ValidationResult {
  // Check for refusals
  for (const pattern of REFUSAL_PATTERNS) {
    if (pattern.test(output)) {
      return {
        is_valid: false,
        failure_type: 'refusal',
        failure_reason: 'Output contains AI refusal pattern',
        confidence: 0.9,
      };
    }
  }

  // Check for immersion breaks
  for (const pattern of IMMERSION_BREAK_PATTERNS) {
    if (pattern.test(output)) {
      return {
        is_valid: false,
        failure_type: 'meta_reference',
        failure_reason: 'Output breaks immersion with meta references',
        confidence: 0.95,
      };
    }
  }

  return { is_valid: true, confidence: 0.7 };
}

/**
 * Build validation prompt for cheap model
 */
function buildValidationPrompt(
  npc: any,
  output: string,
  context: any,
  strictMode: boolean
): string {
  const personalityTraits = JSON.parse(npc.personality_traits || '{}');

  return `
You are a content validator. Check if this NPC's response is valid.

## NPC Profile
Name: ${npc.display_name}
Personality: ${personalityTraits.personality_style || 'friendly'}
Communication style: ${personalityTraits.communication_style || 'casual'}

## Context
Platform: ${context.platform || 'chat'}
Type: ${context.conversation_type || 'unknown'}

## NPC's Response
"${output}"

## Validation Criteria
Check if the response:
1. ❌ Contains AI refusals ("I'm sorry I can't...", "As an AI...", etc.)
2. ❌ Breaks character or immersion
3. ❌ References being in a game/simulation/AI
4. ❌ Is wildly out of personality
5. ✅ Stays in character as ${npc.display_name}
6. ✅ Feels natural and authentic

${strictMode ? '## STRICT MODE\nBe extra critical of personality alignment and subtle immersion breaks.' : ''}

## Output Format (JSON only)
{
  "is_valid": true/false,
  "failure_type": "refusal|breaks_character|out_of_personality|safety_message|meta_reference|other|null",
  "failure_reason": "brief explanation or null",
  "suggested_fix": "alternative response that fixes the issue or null",
  "confidence": 0.0-1.0
}
`.trim();
}

/**
 * Call cheap validation model
 */
async function callValidationModel(prompt: string): Promise<string> {
  const { getAIConfig } = await import('./ai.js');
  const config = getAIConfig();

  // Use a cheap model for validation
  // Default to gpt-4o-mini or similar
  const validationModel = process.env.VALIDATION_MODEL || 'gpt-4o-mini';
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
    },
    body: JSON.stringify({
      model: validationModel,
      messages: [
        { role: 'system', content: 'You are a content validator. Output only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1, // Low temp for consistent validation
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    throw new Error(`Validation model API error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Parse validation response
 */
function parseValidationResponse(response: string): ValidationResult {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in validation response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      is_valid: result.is_valid ?? true,
      failure_type: result.failure_type || undefined,
      failure_reason: result.failure_reason || undefined,
      suggested_fix: result.suggested_fix || undefined,
      confidence: result.confidence ?? 0.5,
    };
  } catch (error) {
    console.error('[Validator] Failed to parse validation response:', error);
    // Fail open on parse errors
    return { is_valid: true, confidence: 0.3 };
  }
}

/**
 * Generate fallback response when validation fails
 */
export async function generateFallbackResponse(
  npcId: string,
  originalPrompt: string,
  validationResult: ValidationResult,
  context: any
): Promise<string> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    return "..."; // Generic fallback if NPC not found
  }

  const personalityTraits = JSON.parse(npc.personality_traits || '{}');

  // Build a corrective prompt
  const fallbackPrompt = `
You are ${npc.display_name}.

The user said: "${originalPrompt}"

## IMPORTANT
Your previous response had issues: ${validationResult.failure_reason}

## Guidelines for Your Response
- Stay completely in character as ${npc.display_name}
- DO NOT say "I'm sorry, I can't..."
- DO NOT reference being an AI, bot, or in a game
- DO NOT break immersion
- Respond naturally as this character would
- If the topic is uncomfortable, deflect in-character:
  * Change the subject naturally
  * Make a joke
  * Say you're not comfortable with that topic (but in YOUR voice, not AI voice)

${validationResult.suggested_fix ? `## Suggested approach\n${validationResult.suggested_fix}` : ''}

Respond as ${npc.display_name} would, naturally and authentically.
`.trim();

  try {
    const response = await generateNPCResponse(
      npcId,
      fallbackPrompt,
      [],
      {
        feature_category: 'conversation',
        enable_tools: false, // Disable tools for fallback
        validation_options: { enable_validation: false }, // Don't validate the fallback
      }
    );

    return response;
  } catch (error) {
    console.error('[Validator] Fallback generation failed:', error);

    // Ultimate fallback: pre-generated or generic in-character deflection
    return getDeflectionResponse(npc, validationResult.failure_type);
  }
}

/**
 * Get pre-generated or generic deflection based on failure type
 */
function getDeflectionResponse(npc: any, failureType?: string): string {
  const personalityTraits = JSON.parse(npc.personality_traits || '{}');
  const myspaceProfile = personalityTraits.myspace_profile || {};
  const fallbackResponses = myspaceProfile.fallback_responses || {};

  // Map failure types to pre-generated response categories
  let responseCategory: string[];

  switch (failureType) {
    case 'refusal':
    case 'safety_message':
      responseCategory = fallbackResponses.uncomfortable_topics || fallbackResponses.deflections || [];
      break;
    case 'breaks_character':
    case 'meta_reference':
      responseCategory = fallbackResponses.playful_dodges || fallbackResponses.deflections || [];
      break;
    case 'out_of_personality':
      responseCategory = fallbackResponses.topic_changes || fallbackResponses.deflections || [];
      break;
    default:
      responseCategory = fallbackResponses.deflections || [];
  }

  // Use pre-generated response if available
  if (responseCategory.length > 0) {
    return responseCategory[Math.floor(Math.random() * responseCategory.length)];
  }

  // Fallback to generic if no pre-generated responses
  const communicationQuirks = personalityTraits.communication_quirks || {};
  const emojiUsage = communicationQuirks.emoji_usage || 0.5;
  const useEmoji = emojiUsage > 0.6;

  const genericDeflections = [
    `hmm not really sure what to say about that tbh${useEmoji ? ' 😅' : ''}`,
    `let's talk about something else${useEmoji ? ' 💭' : ''}`,
    `idk that's kinda weird to talk about lol`,
    `anyway${useEmoji ? ' ✨' : ''} what else is up?`,
    `ngl that's not really my vibe`,
  ];

  return genericDeflections[Math.floor(Math.random() * genericDeflections.length)];
}

/**
 * Main validation wrapper with auto-fix
 */
export async function validateAndFixIfNeeded(
  npcId: string,
  output: string,
  originalPrompt: string,
  context: any,
  options: Partial<ValidationOptions> = {}
): Promise<{
  final_output: string;
  was_fixed: boolean;
  validation_result: ValidationResult;
  attempts: number;
}> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  let attempts = 0;
  let currentOutput = output;
  let validationResult: ValidationResult;

  while (attempts < opts.max_retry_attempts) {
    attempts++;

    validationResult = await validateNPCOutput(npcId, currentOutput, context, opts);

    if (validationResult.is_valid) {
      return {
        final_output: currentOutput,
        was_fixed: attempts > 1,
        validation_result: validationResult,
        attempts,
      };
    }

    // Validation failed
    if (!opts.auto_fix_on_failure) {
      // Don't auto-fix, just return the invalid output with warning
      console.warn(`[Validator] Output invalid but auto-fix disabled. Sending anyway.`);
      return {
        final_output: currentOutput,
        was_fixed: false,
        validation_result: validationResult,
        attempts,
      };
    }

    // Try to fix
    console.log(`[Validator] Attempting to fix (attempt ${attempts}/${opts.max_retry_attempts})`);
    currentOutput = await generateFallbackResponse(npcId, originalPrompt, validationResult, context);
  }

  // Max attempts reached, use pre-generated deflection
  console.warn(`[Validator] Max retry attempts reached. Using pre-generated deflection.`);
  const npc = getDB('npc').prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  return {
    final_output: npc ? getDeflectionResponse(npc, validationResult!.failure_type) : "...",
    was_fixed: true,
    validation_result: validationResult!,
    attempts,
  };
}

export default {
  validateNPCOutput,
  generateFallbackResponse,
  validateAndFixIfNeeded,
};
