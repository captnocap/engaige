// Deliberation System - Forced thinking loops with human-like variability
// Uses </think> as stop sequence to force extended reasoning before response
// Thinking depth varies based on personality, relationship, topic, and chaos

import { getDB } from '../db/index.js';
import { doorFetch } from '../network/door.js';
import { eventBus, EventTypes } from '../events/index.js';
import { getAIConfig, getNPCConfig, buildNPCSystemPrompt } from './ai.js';
import { getRelationship } from './relationships.js';
import { processAIResponse, storeNPCThought } from './reasoning-extractor.js';

// ─────────────────────────────────────────────────────────────────
// Thinking Depth Calculation
// ─────────────────────────────────────────────────────────────────

export interface ThinkingFactors {
  // NPC personality factors
  overthinking_tendency: number;     // 0-1, baseline tendency to overthink
  impulsivity: number;               // 0-1, tendency to just blurt things out
  anxiety_level: number;             // 0-1, current emotional state
  confidence_on_topic: number;       // 0-1, how confident they are about this topic

  // Relationship factors
  relationship_stage: string;        // stranger, friend, close_friend, romantic, etc.
  has_crush: boolean;                // if they're into the player
  trust_level: number;               // 0-100
  familiarity: number;               // 0-100

  // Message factors
  is_personal_question: boolean;     // asking about them specifically
  is_sensitive_topic: boolean;       // requires careful consideration
  message_complexity: number;        // 0-1, how complex the incoming message is
  requires_emotional_response: boolean;

  // Chaos factor (human unpredictability)
  chaos_seed?: number;               // 0-1 random seed for this interaction
}

export interface ThinkingDepth {
  min_loops: number;
  max_loops: number;
  target_loops: number;              // Most likely number
  should_overthink_simple: boolean;  // Inverse complexity moment
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  reason: string;                    // For logging/debugging
}

/**
 * Calculate how many thinking loops an NPC should do
 * Returns variable depth based on all the human factors
 */
export function calculateThinkingDepth(factors: Partial<ThinkingFactors>): ThinkingDepth {
  // Defaults
  const f: ThinkingFactors = {
    overthinking_tendency: 0.5,
    impulsivity: 0.3,
    anxiety_level: 0.3,
    confidence_on_topic: 0.5,
    relationship_stage: 'stranger',
    has_crush: false,
    trust_level: 50,
    familiarity: 30,
    is_personal_question: false,
    is_sensitive_topic: false,
    message_complexity: 0.5,
    requires_emotional_response: false,
    chaos_seed: Math.random(),
    ...factors,
  };

  let baseDepth = 1;
  let reasons: string[] = [];

  // ─── Personality influence ───
  if (f.overthinking_tendency > 0.7) {
    baseDepth += 1;
    reasons.push('overthinker personality');
  }
  if (f.impulsivity > 0.7) {
    baseDepth = Math.max(0, baseDepth - 1);
    reasons.push('impulsive personality');
  }
  if (f.anxiety_level > 0.6) {
    baseDepth += 1;
    reasons.push('feeling anxious');
  }

  // ─── Relationship influence ───
  // Early stages = more thinking ("am I being weird?")
  if (['stranger', 'acquaintance'].includes(f.relationship_stage)) {
    baseDepth += 1;
    reasons.push('new relationship, being careful');
  }
  // Crush = MUCH more thinking
  if (f.has_crush) {
    baseDepth += 2;
    reasons.push('has feelings, overthinking everything');
  }
  // Very comfortable = less filtering
  if (f.trust_level > 80 && f.familiarity > 70) {
    baseDepth = Math.max(1, baseDepth - 1);
    reasons.push('very comfortable, less filtering');
  }

  // ─── Topic influence ───
  if (f.is_personal_question) {
    baseDepth += 1;
    reasons.push('personal question, thinking about self');
  }
  if (f.is_sensitive_topic) {
    baseDepth += 1;
    reasons.push('sensitive topic, being careful');
  }
  if (f.confidence_on_topic > 0.8) {
    baseDepth = Math.max(1, baseDepth - 1);
    reasons.push('confident about topic');
  }
  if (f.requires_emotional_response) {
    baseDepth += 1;
    reasons.push('emotional response needed');
  }

  // ─── The chaos factor (human unpredictability) ───
  // Sometimes overthink simple things, breeze through complex ones
  const chaos = f.chaos_seed ?? Math.random();
  let shouldOverthinkSimple = false;

  // 15% chance of inverse complexity behavior
  if (chaos < 0.15) {
    // Low complexity but we're gonna THINK about it
    if (f.message_complexity < 0.3) {
      baseDepth += 2;
      shouldOverthinkSimple = true;
      reasons.push('randomly fixating on something simple');
    }
    // High complexity but just vibing through it
    else if (f.message_complexity > 0.7) {
      baseDepth = Math.max(1, baseDepth - 2);
      reasons.push('randomly breezing through something complex');
    }
  }

  // Additional random variance (±1)
  if (chaos > 0.8) {
    baseDepth += 1;
    reasons.push('just in a thoughtful mood');
  } else if (chaos < 0.2 && !shouldOverthinkSimple) {
    baseDepth = Math.max(1, baseDepth - 1);
    reasons.push('feeling decisive');
  }

  // Clamp to reasonable bounds
  const targetLoops = Math.max(1, Math.min(7, baseDepth));

  // Determine style
  let style: ThinkingDepth['thinking_style'];
  if (targetLoops <= 1) style = 'quick';
  else if (targetLoops <= 2) style = 'normal';
  else if (targetLoops <= 4) style = 'deliberate';
  else style = 'agonizing';

  return {
    min_loops: Math.max(1, targetLoops - 1),
    max_loops: targetLoops + 1,
    target_loops: targetLoops,
    should_overthink_simple: shouldOverthinkSimple,
    thinking_style: style,
    reason: reasons.join('; ') || 'baseline thinking',
  };
}

// ─────────────────────────────────────────────────────────────────
// Topic Detection (for thinking depth calculation)
// ─────────────────────────────────────────────────────────────────

const PERSONAL_PATTERNS = [
  /\b(you|your|yourself)\b.*\b(like|love|hate|feel|think|want|need|afraid|scared|happy|sad)\b/i,
  /\bwhat do you\b/i,
  /\bhow do you feel\b/i,
  /\btell me about (yourself|you)\b/i,
  /\bwhat'?s your\b/i,
  /\bare you\b.*\?/i,
  /\bdo you (like|love|hate|want|have|think)\b/i,
];

const SENSITIVE_PATTERNS = [
  /\b(death|dying|die|dead|kill)\b/i,
  /\b(love|relationship|dating|romantic|feelings)\b/i,
  /\b(family|parents?|mom|dad|mother|father|sibling)\b/i,
  /\b(trauma|abuse|hurt|pain|suffer)\b/i,
  /\b(secret|private|personal|confession)\b/i,
  /\b(money|debt|broke|poor|rich)\b/i,
  /\b(sex|sexual|intimate|intimacy)\b/i,
  /\b(mental health|depression|anxiety|therapy)\b/i,
];

const EMOTIONAL_PATTERNS = [
  /\b(sad|happy|angry|scared|excited|nervous|worried|anxious|depressed)\b/i,
  /\b(miss|missed|missing)\s+(you|me|them)\b/i,
  /\b(sorry|apologize|forgive)\b/i,
  /\b(love|hate|care about)\b/i,
  /\b(hurt|upset|disappointed)\b/i,
  /[😢😭😔😞💔😰😨😱🥺😍❤️💕]/,
];

export function analyzeMessage(message: string): {
  is_personal: boolean;
  is_sensitive: boolean;
  requires_emotional: boolean;
  complexity: number;
} {
  const isPersonal = PERSONAL_PATTERNS.some(p => p.test(message));
  const isSensitive = SENSITIVE_PATTERNS.some(p => p.test(message));
  const requiresEmotional = EMOTIONAL_PATTERNS.some(p => p.test(message));

  // Complexity based on length, punctuation, question marks
  const wordCount = message.split(/\s+/).length;
  const hasMultipleQuestions = (message.match(/\?/g) || []).length > 1;
  const hasComplexPunctuation = /[;:—–]/.test(message);

  let complexity = Math.min(1, wordCount / 50); // Longer = more complex
  if (hasMultipleQuestions) complexity += 0.2;
  if (hasComplexPunctuation) complexity += 0.1;
  complexity = Math.min(1, complexity);

  return {
    is_personal: isPersonal,
    is_sensitive: isSensitive,
    requires_emotional: requiresEmotional,
    complexity,
  };
}

// ─────────────────────────────────────────────────────────────────
// Forced Thinking Loop Execution
// ─────────────────────────────────────────────────────────────────

export interface DeliberationResult {
  response: string;                  // Final clean response
  thinking_loops: number;            // How many loops we did
  accumulated_thoughts: string[];    // All the thoughts from each loop
  thinking_style: ThinkingDepth['thinking_style'];
  total_thinking_time_ms: number;
  depth_reason: string;
}

export interface DeliberationOptions {
  npc_id: string;
  player_id?: string;
  conversation_id?: string;
  message: string;
  conversation_history: Array<{ role: 'user' | 'assistant'; content: string }>;
  platform?: string;
  player_name?: string;

  // Override automatic depth calculation
  force_depth?: number;
  // Skip deliberation entirely (just normal response)
  skip_deliberation?: boolean;
}

/**
 * Generate a response with forced thinking loops
 * The NPC will think through the response multiple times before answering
 */
export async function deliberateResponse(options: DeliberationOptions): Promise<DeliberationResult> {
  const startTime = Date.now();
  const npcDb = getDB('npc');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(options.npc_id) as any;
  if (!npc) throw new Error(`NPC not found: ${options.npc_id}`);

  const config = getNPCConfig(npc);
  const personalityTraits = JSON.parse(npc.personality_traits || '{}');

  // Analyze the incoming message
  const messageAnalysis = analyzeMessage(options.message);

  // Get relationship factors if player is known
  let relationshipFactors: Partial<ThinkingFactors> = {};
  if (options.player_id) {
    const relationship = getRelationship(options.player_id, options.npc_id);
    if (relationship) {
      relationshipFactors = {
        relationship_stage: relationship.stage,
        trust_level: relationship.trust,
        familiarity: relationship.familiarity,
        // TODO: has_crush could come from NPC's feelings toward player
        has_crush: personalityTraits.has_crush_on_player || false,
      };
    }
  }

  // Calculate thinking depth
  const depth = options.force_depth
    ? {
        min_loops: options.force_depth,
        max_loops: options.force_depth,
        target_loops: options.force_depth,
        should_overthink_simple: false,
        thinking_style: options.force_depth > 3 ? 'agonizing' as const : 'deliberate' as const,
        reason: 'forced depth',
      }
    : calculateThinkingDepth({
        overthinking_tendency: personalityTraits.overthinking_tendency || 0.5,
        impulsivity: personalityTraits.impulsivity || 0.3,
        anxiety_level: personalityTraits.current_anxiety || 0.3,
        confidence_on_topic: 0.5, // TODO: could analyze topic against NPC interests
        is_personal_question: messageAnalysis.is_personal,
        is_sensitive_topic: messageAnalysis.is_sensitive,
        message_complexity: messageAnalysis.complexity,
        requires_emotional_response: messageAnalysis.requires_emotional,
        ...relationshipFactors,
      });

  // Skip deliberation if only 1 loop needed or explicitly skipped
  if (options.skip_deliberation || depth.target_loops <= 1) {
    // Just do a normal response (but still extract any thinking)
    const response = await normalResponse(npc, config, options);
    const processed = processAIResponse(response, options.npc_id);

    // Store any thoughts that were in the response
    for (const thought of processed.thoughts) {
      storeNPCThought(options.npc_id, thought, {
        conversation_id: options.conversation_id,
        trigger_message: options.message,
      });
    }

    return {
      response: processed.clean_response,
      thinking_loops: processed.had_reasoning ? 1 : 0,
      accumulated_thoughts: processed.thoughts.map(t => t.content),
      thinking_style: 'quick',
      total_thinking_time_ms: Date.now() - startTime,
      depth_reason: depth.reason,
    };
  }

  console.log(`[Deliberation] ${npc.display_name} will think ${depth.target_loops} times (${depth.thinking_style}): ${depth.reason}`);

  // Emit deliberation started event
  eventBus.fire(EventTypes.NPC_DELIBERATION_STARTED, {
    npc_id: options.npc_id,
    target_loops: depth.target_loops,
    thinking_style: depth.thinking_style,
    reason: depth.reason,
  }, {
    source: 'deliberation',
    npc_id: options.npc_id,
    conversation_id: options.conversation_id,
  });

  // Build system prompt with thinking instructions
  let systemPrompt = buildNPCSystemPrompt(npc);
  systemPrompt += `\n\n## Internal Thoughts
Before responding, think through your feelings and reactions in <think> tags.
Consider:
- How does this message make you feel?
- What do you want to say vs what you should say?
- Any memories or experiences this brings up?
- Your current mood and emotional state

Think naturally as ${npc.display_name} would think - not as an AI analyzing what to say.`;

  if (options.platform) {
    systemPrompt += `\n\nYou are responding via ${options.platform}.`;
  }
  if (options.player_name) {
    systemPrompt += `\nYou are talking to ${options.player_name}.`;
  }

  // Run thinking loops
  const accumulatedThoughts: string[] = [];
  let loopCount = 0;

  for (let i = 0; i < depth.target_loops; i++) {
    loopCount++;

    // Build messages with accumulated thoughts so far
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...options.conversation_history,
      { role: 'user', content: options.message },
    ];

    // If we have accumulated thoughts, add them as partial assistant response
    if (accumulatedThoughts.length > 0) {
      messages.push({
        role: 'assistant',
        content: `<think>\n${accumulatedThoughts.join('\n\n')}\n\n`,
      });
    }

    // Call API with </think> as stop sequence
    const loopResponse = await callWithStopSequence(
      messages,
      config,
      ['</think>'],
    );

    // Extract the thought from this loop
    const thought = loopResponse.trim();
    if (thought) {
      accumulatedThoughts.push(thought);

      // Classify and store this thought
      const processed = processAIResponse(`<think>${thought}</think>`, options.npc_id);
      for (const t of processed.thoughts) {
        storeNPCThought(options.npc_id, t, {
          conversation_id: options.conversation_id,
          trigger_message: options.message,
        });
      }
    }

    // Small delay between loops (thinking takes time)
    if (i < depth.target_loops - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Final call - let the model actually respond
  const finalMessages: any[] = [
    { role: 'system', content: systemPrompt },
    ...options.conversation_history,
    { role: 'user', content: options.message },
    {
      role: 'assistant',
      content: `<think>\n${accumulatedThoughts.join('\n\n')}\n</think>\n\n`,
    },
  ];

  const finalResponse = await callWithoutStopSequence(finalMessages, config);

  // Clean any additional thinking from final response
  const processed = processAIResponse(finalResponse, options.npc_id);

  // Store any additional thoughts from final response
  for (const thought of processed.thoughts) {
    storeNPCThought(options.npc_id, thought, {
      conversation_id: options.conversation_id,
      trigger_message: options.message,
    });
    accumulatedThoughts.push(thought.content);
  }

  const totalTime = Date.now() - startTime;

  // Emit deliberation completed event
  eventBus.fire(EventTypes.NPC_DELIBERATION_COMPLETED, {
    npc_id: options.npc_id,
    loops_completed: loopCount,
    thinking_style: depth.thinking_style,
    total_time_ms: totalTime,
    thought_count: accumulatedThoughts.length,
  }, {
    source: 'deliberation',
    npc_id: options.npc_id,
    conversation_id: options.conversation_id,
  });

  console.log(`[Deliberation] ${npc.display_name} completed ${loopCount} loops in ${totalTime}ms`);

  return {
    response: processed.clean_response,
    thinking_loops: loopCount,
    accumulated_thoughts: accumulatedThoughts,
    thinking_style: depth.thinking_style,
    total_thinking_time_ms: totalTime,
    depth_reason: depth.reason,
  };
}

// ─────────────────────────────────────────────────────────────────
// API Call Helpers
// ─────────────────────────────────────────────────────────────────

async function callWithStopSequence(
  messages: any[],
  config: any,
  stopSequences: string[]
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
      messages,
      temperature: 0.9, // Slightly higher for more varied thinking
      max_tokens: 300,  // Thinking doesn't need to be super long
      stop: stopSequences,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deliberation API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callWithoutStopSequence(
  messages: any[],
  config: any
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
      messages,
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deliberation final API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function normalResponse(
  npc: any,
  config: any,
  options: DeliberationOptions
): Promise<string> {
  let systemPrompt = buildNPCSystemPrompt(npc);
  if (options.platform) {
    systemPrompt += `\n\nYou are responding via ${options.platform}.`;
  }
  if (options.player_name) {
    systemPrompt += `\nYou are talking to ${options.player_name}.`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...options.conversation_history,
    { role: 'user', content: options.message },
  ];

  return callWithoutStopSequence(messages, config);
}

// ─────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────

export default {
  calculateThinkingDepth,
  analyzeMessage,
  deliberateResponse,
};
