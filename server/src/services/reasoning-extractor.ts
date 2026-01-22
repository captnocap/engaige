// Reasoning block extraction and classification
// Strips <think> blocks from AI responses while preserving them for NPC "thoughts" feature
// Filters out meta-AI thoughts (model reasoning about roleplay) vs in-character thoughts

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

// Patterns that indicate meta-AI reasoning (NOT in-character thoughts)
const META_AI_PATTERNS = [
  // Direct AI references
  /\b(as an?|i'?m an?)\s*(ai|llm|language model|assistant|chatbot|bot)\b/i,
  /\bmy (programming|training|guidelines|instructions|parameters)\b/i,
  /\b(trained|programmed|designed) to\b/i,

  // Roleplay awareness
  /\b(roleplay|role-?play|rp|character|persona)\s*(as|is|scenario)\b/i,
  /\bplaying (the role|a character)\b/i,
  /\bstay(ing)? in character\b/i,
  /\bbreak(ing)? character\b/i,
  /\b(maintain|keeping)\s*(the )?(illusion|immersion|character)\b/i,

  // Meta-instructions
  /\bi (should|need to|must|will)\s*(respond|reply|act|behave)\s*(as|like)\b/i,
  /\bthe (user|player|human)\s*(wants|expects|asked)\b/i,
  /\baccording to (my|the) (instructions|prompt|system)\b/i,
  /\b(system prompt|system message)\b/i,

  // Simulation awareness
  /\b(this is a|in this)\s*(game|simulation|scenario|fiction)\b/i,
  /\bfictional (scenario|setting|world)\b/i,
  /\bnot a real (person|human)\b/i,

  // Safety/refusal reasoning
  /\b(inappropriate|harmful|against policy)\b/i,
  /\bcannot (comply|help with|assist)\b/i,
  /\b(ethical|safety) (concerns|guidelines|considerations)\b/i,
];

// Patterns that suggest in-character thoughts (GOOD to show)
const IN_CHARACTER_INDICATORS = [
  // Emotional processing
  /\b(i feel|feeling|i'?m feeling)\s+(happy|sad|excited|nervous|anxious|curious|confused)\b/i,
  /\b(wonder|wondering|curious)\s+(if|about|why|what)\b/i,
  /\bthis (person|they|he|she)\s+(seems?|looks?|sounds?)\b/i,

  // Relationship thinking
  /\b(do they|does (he|she))\s+(like|trust|care about)\b/i,
  /\b(should i|maybe i should)\s+(tell|ask|mention|share)\b/i,
  /\bhope (they|he|she)\b/i,
  /\b(reminds me of|makes me think of)\b/i,

  // Internal monologue
  /\bhmm+\b/i,
  /\blet me think\b/i,
  /\bwhat (should|do) i\b/i,
  /\bi (remember|recall|think about)\b/i,

  // Personal reactions
  /\bthat'?s (interesting|funny|weird|cute|sweet|nice)\b/i,
  /\boh (no|wow|man|god)\b/i,
  /\b(lol|haha|omg)\b/i,
];

export interface ExtractedThought {
  id: string;
  npc_id: string;
  content: string;
  thought_type: 'in_character' | 'meta_ai' | 'unknown';
  confidence: number; // 0-1 how confident we are in classification
  context?: string; // What triggered this thought (e.g., user message)
  conversation_id?: string;
  created_at: number;
}

export interface ProcessedResponse {
  clean_response: string;
  raw_response: string;
  thoughts: Array<{
    content: string;
    thought_type: 'in_character' | 'meta_ai' | 'unknown';
    confidence: number;
  }>;
  had_reasoning: boolean;
}

/**
 * Extract reasoning blocks from AI response
 * Supports: <think>, <thinking>, <reasoning>, <thought>, <internal>
 */
export function extractReasoningBlocks(response: string): {
  cleanResponse: string;
  reasoningBlocks: string[];
} {
  const reasoningBlocks: string[] = [];

  // Match various reasoning block formats
  const patterns = [
    /<think>([\s\S]*?)<\/think>/gi,
    /<thinking>([\s\S]*?)<\/thinking>/gi,
    /<reasoning>([\s\S]*?)<\/reasoning>/gi,
    /<thought>([\s\S]*?)<\/thought>/gi,
    /<internal>([\s\S]*?)<\/internal>/gi,
    /<scratchpad>([\s\S]*?)<\/scratchpad>/gi,
  ];

  let cleanResponse = response;

  for (const pattern of patterns) {
    let match;
    // Reset lastIndex for global regex
    pattern.lastIndex = 0;

    while ((match = pattern.exec(response)) !== null) {
      const thoughtContent = match[1].trim();
      if (thoughtContent) {
        reasoningBlocks.push(thoughtContent);
      }
    }

    // Remove the blocks from clean response
    cleanResponse = cleanResponse.replace(pattern, '');
  }

  // Clean up extra whitespace
  cleanResponse = cleanResponse.replace(/\n{3,}/g, '\n\n').trim();

  return {
    cleanResponse,
    reasoningBlocks,
  };
}

/**
 * Classify a thought as in-character or meta-AI
 */
export function classifyThought(thought: string): {
  thought_type: 'in_character' | 'meta_ai' | 'unknown';
  confidence: number;
} {
  let metaScore = 0;
  let inCharScore = 0;

  // Check for meta-AI patterns (bad)
  for (const pattern of META_AI_PATTERNS) {
    if (pattern.test(thought)) {
      metaScore += 1;
    }
  }

  // Check for in-character patterns (good)
  for (const pattern of IN_CHARACTER_INDICATORS) {
    if (pattern.test(thought)) {
      inCharScore += 1;
    }
  }

  // Calculate confidence and type
  const totalPatterns = META_AI_PATTERNS.length + IN_CHARACTER_INDICATORS.length;
  const totalMatches = metaScore + inCharScore;

  if (totalMatches === 0) {
    // No strong signals either way
    return { thought_type: 'unknown', confidence: 0.3 };
  }

  if (metaScore > 0 && inCharScore === 0) {
    // Definitely meta-AI
    return {
      thought_type: 'meta_ai',
      confidence: Math.min(0.9, 0.5 + (metaScore * 0.1))
    };
  }

  if (inCharScore > 0 && metaScore === 0) {
    // Definitely in-character
    return {
      thought_type: 'in_character',
      confidence: Math.min(0.9, 0.5 + (inCharScore * 0.1))
    };
  }

  // Mixed signals - lean toward meta if ANY meta patterns found
  if (metaScore > inCharScore) {
    return { thought_type: 'meta_ai', confidence: 0.6 };
  } else if (inCharScore > metaScore) {
    return { thought_type: 'in_character', confidence: 0.5 };
  }

  return { thought_type: 'unknown', confidence: 0.4 };
}

/**
 * Process an AI response - extract thoughts, classify them, return clean response
 */
export function processAIResponse(
  rawResponse: string,
  npcId?: string,
  context?: string
): ProcessedResponse {
  const { cleanResponse, reasoningBlocks } = extractReasoningBlocks(rawResponse);

  const thoughts = reasoningBlocks.map(block => {
    const classification = classifyThought(block);
    return {
      content: block,
      ...classification,
    };
  });

  return {
    clean_response: cleanResponse,
    raw_response: rawResponse,
    thoughts,
    had_reasoning: reasoningBlocks.length > 0,
  };
}

/**
 * Store an NPC thought in the database
 */
export function storeNPCThought(
  npcId: string,
  thought: {
    content: string;
    thought_type: 'in_character' | 'meta_ai' | 'unknown';
    confidence: number;
  },
  context?: {
    conversation_id?: string;
    trigger_message?: string;
  }
): ExtractedThought {
  const db = getDB('game');
  const id = generateId();
  const timestamp = now();

  db.prepare(`
    INSERT INTO npc_thoughts (id, npc_id, content, thought_type, confidence, context, conversation_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    npcId,
    thought.content,
    thought.thought_type,
    thought.confidence,
    context?.trigger_message || null,
    context?.conversation_id || null,
    timestamp
  );

  const stored: ExtractedThought = {
    id,
    npc_id: npcId,
    content: thought.content,
    thought_type: thought.thought_type,
    confidence: thought.confidence,
    context: context?.trigger_message,
    conversation_id: context?.conversation_id,
    created_at: timestamp,
  };

  // Emit event for in-character thoughts (these are the interesting ones)
  if (thought.thought_type === 'in_character') {
    eventBus.fire(EventTypes.NPC_THOUGHT_CAPTURED, {
      thought_id: id,
      content: thought.content,
      thought_type: thought.thought_type,
      confidence: thought.confidence,
    }, {
      source: 'reasoning-extractor',
      npc_id: npcId,
      conversation_id: context?.conversation_id,
      importance: 0.6,
    });
  }

  return stored;
}

/**
 * Get recent in-character thoughts for an NPC
 */
export function getNPCThoughts(
  npcId: string,
  options?: {
    limit?: number;
    thought_type?: 'in_character' | 'meta_ai' | 'unknown' | 'all';
    min_confidence?: number;
    since?: number; // timestamp
  }
): ExtractedThought[] {
  const db = getDB('game');
  const limit = options?.limit || 20;
  const thoughtType = options?.thought_type || 'in_character';
  const minConfidence = options?.min_confidence || 0.5;
  const since = options?.since || 0;

  let query = `
    SELECT * FROM npc_thoughts
    WHERE npc_id = ?
    AND confidence >= ?
    AND created_at >= ?
  `;

  const params: any[] = [npcId, minConfidence, since];

  if (thoughtType !== 'all') {
    query += ' AND thought_type = ?';
    params.push(thoughtType);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  return db.prepare(query).all(...params) as ExtractedThought[];
}

/**
 * Get thoughts across all NPCs (for a global "thoughts feed")
 */
export function getAllNPCThoughts(options?: {
  limit?: number;
  min_confidence?: number;
  since?: number;
}): Array<ExtractedThought & { npc_display_name?: string }> {
  const db = getDB('game');
  const npcDb = getDB('npc');
  const limit = options?.limit || 50;
  const minConfidence = options?.min_confidence || 0.5;
  const since = options?.since || 0;

  const thoughts = db.prepare(`
    SELECT * FROM npc_thoughts
    WHERE thought_type = 'in_character'
    AND confidence >= ?
    AND created_at >= ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(minConfidence, since, limit) as ExtractedThought[];

  // Enrich with NPC names
  return thoughts.map(thought => {
    const npc = npcDb.prepare('SELECT display_name FROM npcs WHERE id = ?').get(thought.npc_id) as any;
    return {
      ...thought,
      npc_display_name: npc?.display_name || 'Unknown',
    };
  });
}

/**
 * Process and store thoughts from an AI response
 * Returns the clean response (without reasoning blocks)
 */
export async function processAndStoreThoughts(
  rawResponse: string,
  npcId: string,
  context?: {
    conversation_id?: string;
    trigger_message?: string;
  }
): Promise<string> {
  const processed = processAIResponse(rawResponse, npcId, context?.trigger_message);

  // Store all thoughts (even meta-AI ones, for logging/debugging)
  for (const thought of processed.thoughts) {
    storeNPCThought(npcId, thought, context);
  }

  if (processed.had_reasoning) {
    const inCharCount = processed.thoughts.filter(t => t.thought_type === 'in_character').length;
    const metaCount = processed.thoughts.filter(t => t.thought_type === 'meta_ai').length;
    console.log(`[Reasoning] Extracted ${processed.thoughts.length} thoughts (${inCharCount} in-character, ${metaCount} meta-AI)`);
  }

  return processed.clean_response;
}

export default {
  extractReasoningBlocks,
  classifyThought,
  processAIResponse,
  storeNPCThought,
  getNPCThoughts,
  getAllNPCThoughts,
  processAndStoreThoughts,
};
