import { getDB, generateId, now } from '../db/index.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import {
  parseOpenAIUsage,
  parseAnthropicUsage,
  calculateCost,
  estimateCost,
} from '../utils/cost-calculator.js';

// AI Configuration Types
export type AIProvider = 'openai' | 'openai-compatible' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

// Default global config (fallback when NPC doesn't have custom config)
let globalConfig: AIConfig = {
  provider: 'openai-compatible',
  model: 'gpt-4o',
  baseUrl: 'http://localhost:1234/v1',
};

// User-facing configuration function
export function configureAI(config: Partial<AIConfig>) {
  globalConfig = { ...globalConfig, ...config };
  console.log(`[AI] Global config: ${globalConfig.provider} (${globalConfig.model}) @ ${globalConfig.baseUrl || 'openai.com'}`);
}

export function getAIConfig(): AIConfig {
  return { ...globalConfig };
}

// Get effective config for an NPC (NPC config overrides global)
export function getNPCConfig(npc: {
  model_provider?: string | null;
  model_name?: string | null;
  model_base_url?: string | null;
  model_api_key?: string | null;
}): AIConfig {
  const provider = (npc.model_provider as AIProvider) || globalConfig.provider;
  const model = npc.model_name || globalConfig.model;
  const baseUrl = npc.model_base_url || globalConfig.baseUrl;
  const apiKey = npc.model_api_key || globalConfig.apiKey;

  return { provider, model, baseUrl, apiKey };
}

// Build system prompt for an NPC with their identity
export function buildNPCSystemPrompt(npc: {
  display_name: string;
  personality: string;
  bio: string;
  occupation: string;
  interests: string;
  system_prompt: string;
}): string {
  const interests = JSON.parse(npc.interests || '[]');
  return `
You are ${npc.display_name}.

## Your Identity
${npc.system_prompt}

## Personality
${npc.personality}

## Background
${npc.bio}

## Occupation
${npc.occupation}

## Interests
${interests.join(', ')}

## Guidelines
- You are a real person living in a social simulation game
- Respond naturally as this character would
- Reference your memories and past interactions when relevant
- Your memories shape who you are - use them in conversations
- Keep responses conversational and authentic
- Don't break character or mention you're an AI
- If asked about being a game character, deflect naturally

Current time: ${new Date().toISOString()}
`.trim();
}

// Retrieve relevant memories for an NPC
export function getNPCMemories(npcId: string, context: string, limit = 5): Array<{
  id: string;
  content: string;
  importance: number;
  created_at: number;
}> {
  const db = getDB('game');

  const keywords = context.toLowerCase().split(' ').filter(w => w.length > 3);

  if (keywords.length === 0) {
    const stmt = db.prepare(`
      SELECT id, content, importance, created_at
      FROM memories
      WHERE npc_id = ? AND (expires_at IS NULL OR expires_at > ?)
      ORDER BY importance DESC, created_at DESC
      LIMIT ?
    `);
    return stmt.all(npcId, now(), limit) as any;
  }

  const stmt = db.prepare(`
    SELECT id, content, importance, created_at
    FROM memories
    WHERE npc_id = ? AND (
      ${keywords.map(() => 'content LIKE ?').join(' OR ')}
    ) AND (expires_at IS NULL OR expires_at > ?)
    ORDER BY importance DESC, created_at DESC
    LIMIT ?
  `);

  const searchTerms = keywords.map(k => `%${k}%`);
  return stmt.all(npcId, ...searchTerms, now(), limit) as any;
}

// Generate AI response for an NPC using their configured model
export async function generateNPCResponse(
  npcId: string,
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: { platform?: string; player_name?: string; feature_category?: string }
): Promise<string> {
  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;
  if (!npc) throw new Error(`NPC not found: ${npcId}`);

  // Get NPC-specific or global config
  const config = getNPCConfig(npc);
  console.log(`[AI] ${npc.display_name} using ${config.provider}/${config.model}`);

  let systemPrompt = buildNPCSystemPrompt(npc);

  if (context?.platform) {
    systemPrompt += `\n\n## Current Platform\nYou are responding via ${context.platform}. Adjust your communication style accordingly.`;
  }

  if (context?.player_name) {
    systemPrompt += `\n\nYou are talking to ${context.player_name}.`;
  }

  const memories = getNPCMemories(npcId, message, 5);
  if (memories.length > 0) {
    systemPrompt += `\n\n## Your Relevant Memories\n${memories.map(m => `- ${m.content}`).join('\n')}`;
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: message },
  ];

  const featureCategory = context?.feature_category || 'conversation';
  let response: string;

  switch (config.provider) {
    case 'openai':
    case 'openai-compatible':
      response = await callOpenAICompatible(messages, config, featureCategory);
      break;
    case 'anthropic':
      response = await callAnthropic(messages, config, featureCategory);
      break;
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }

  // Store memory
  const memoryId = generateId();
  gameDb.prepare(`
    INSERT INTO memories (id, npc_id, event_type, content, importance)
    VALUES (?, ?, 'conversation', ?, ?)
  `).run(memoryId, npcId, `Had a conversation: ${message.slice(0, 100)}...`, 0.5);

  return response;
}

// OpenAI or OpenAI-compatible API with budget tracking
async function callOpenAICompatible(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIConfig,
  featureCategory: string = 'other'
): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/chat/completions`;

  // Estimate cost before making request
  const promptText = messages.map(m => m.content).join(' ');
  const estimatedCostCents = estimateCost(promptText.length, 500, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows(featureCategory, estimatedCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Budget limit exceeded: ${budgetCheck.reason}`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth header if API key is set
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(endpoint, {
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
    throw new Error(`AI API error (${config.provider}): ${error}`);
  }

  const data = await response.json();

  // Parse usage and calculate actual cost
  const usage = parseOpenAIUsage(data);
  const actualCostCents = calculateCost(usage, config.model);

  // Log the cost
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: featureCategory,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: actualCostCents,
  });

  return data.choices[0].message.content;
}

// Anthropic API with budget tracking
async function callAnthropic(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIConfig,
  featureCategory: string = 'other'
): Promise<string> {
  if (!config.apiKey) throw new Error('Anthropic API key required');

  const system = messages.find(m => m.role === 'system')?.content || '';
  const对话 = messages.filter(m => m.role !== 'system');

  // Estimate cost before making request
  const promptText = messages.map(m => m.content).join(' ');
  const estimatedCostCents = estimateCost(promptText.length, 500, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows(featureCategory, estimatedCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Budget limit exceeded: ${budgetCheck.reason}`);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 500,
      system,
      messages: 对话.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();

  // Parse usage and calculate actual cost
  const usage = parseAnthropicUsage(data);
  const actualCostCents = calculateCost(usage, config.model);

  // Log the cost
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: featureCategory,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: actualCostCents,
  });

  return data.content[0].text;
}

// Generate a post for an NPC
export async function generateNPCPost(
  npcId: string,
  platform: string,
  prompt?: string,
  featureCategory: string = 'autonomous_posts'
): Promise<string> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;
  if (!npc) throw new Error(`NPC not found: ${npcId}`);

  const config = getNPCConfig(npc);

  let systemPrompt = buildNPCSystemPrompt(npc);
  systemPrompt += `\n\nCreate a ${platform} post${prompt ? ` about: ${prompt}` : ''}. Keep it authentic to your character.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Create a post for ${platform}. ${prompt || 'Share something interesting.'}` },
  ];

  switch (config.provider) {
    case 'openai':
    case 'openai-compatible':
      return await callOpenAICompatible(messages, config, featureCategory);
    case 'anthropic':
      return await callAnthropic(messages, config, featureCategory);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

export default {
  configureAI,
  getAIConfig,
  getNPCConfig,
  buildNPCSystemPrompt,
  getNPCMemories,
  generateNPCResponse,
  generateNPCPost,
};