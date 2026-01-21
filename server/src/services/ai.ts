import { getDB, generateId, now } from '../db/index.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import {
  parseOpenAIUsage,
  parseAnthropicUsage,
  calculateCost,
  estimateCost,
} from '../utils/cost-calculator.js';
import { getToolDefinitions, executeToolCall } from './runtime-tools.js';
import { validateAndFixIfNeeded, type ValidationOptions } from './output-validator.js';
import { doorFetch } from '../network/door.js';
import { eventBus, EventTypes } from '../events/index.js';
import { buildNPCContext, formatContextForPrompt, recordArticleMention } from './context-builder.js';
import { errorLogger } from './error-logger.js';
import { aiQueue, Priority, type RequestType, type QueueResult } from './ai-queue.js';

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
  bio: string;
  occupation: string;
  interests: string;
  system_prompt: string;
  personality_traits?: string;
}): string {
  const interests = JSON.parse(npc.interests || '[]');
  const personalityTraits = npc.personality_traits ? JSON.parse(npc.personality_traits) : {};

  let personalitySection = '';
  if (personalityTraits.personality_style) {
    personalitySection = `## Personality\n${personalityTraits.personality_style}\n\n`;
  }

  return `
You are ${npc.display_name}.

## Your Identity
${npc.system_prompt}

${personalitySection}## Background
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
  context?: {
    platform?: string;
    player_name?: string;
    player_id?: string;
    conversation_id?: string;
    conversation_type?: 'direct_message' | 'group_chat' | 'post' | 'comment';
    feature_category?: string;
    enable_tools?: boolean; // Enable runtime tools (image generation, memory search, etc.)
    validation_options?: Partial<ValidationOptions>; // Output validation settings
  }
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

  // Build enriched context (memories + news headlines + relationship)
  const enrichedContext = await buildNPCContext({
    npcId,
    conversationContext: message,
    playerId: context?.player_id,
    includeNews: true,
    includeMemories: true,
  });

  // Add formatted context to system prompt
  const contextSection = formatContextForPrompt(enrichedContext);
  if (contextSection) {
    systemPrompt += `\n\n${contextSection}`;
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: message },
  ];

  const featureCategory = context?.feature_category || 'conversation';
  const enableTools = context?.enable_tools ?? true; // Tools enabled by default
  let response: string;

  const toolContext = {
    npc_id: npcId,
    player_id: context?.player_id,
    conversation_id: context?.conversation_id,
  };

  switch (config.provider) {
    case 'openai':
    case 'openai-compatible':
      response = await callOpenAICompatible(messages, config, featureCategory, enableTools, toolContext);
      break;
    case 'anthropic':
      response = await callAnthropic(messages, config, featureCategory, enableTools, toolContext);
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

  // Validate and fix output if needed
  const validationContext = {
    platform: context?.platform,
    conversation_type: context?.conversation_type || 'direct_message',
    prompt: message,
  };

  const validationResult = await validateAndFixIfNeeded(
    npcId,
    response,
    message,
    validationContext,
    context?.validation_options
  );

  if (validationResult.was_fixed) {
    console.log(`[AI] Output was fixed after validation (attempts: ${validationResult.attempts})`);
  }

  // Track article mentions in the response (for the recursion loop)
  recordArticleMention(npcId, validationResult.final_output).catch(err => {
    console.error('[AI] Failed to track article mentions:', err.message);
  });

  return validationResult.final_output;
}

// OpenAI or OpenAI-compatible API with budget tracking
async function callOpenAICompatible(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIConfig,
  featureCategory: string = 'other',
  enableTools: boolean = false,
  toolContext?: { npc_id: string; player_id?: string; conversation_id?: string }
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

  // Add tools if enabled
  const tools = enableTools && toolContext ? getToolDefinitions('openai') : undefined;

  const requestBody: any = {
    model: config.model,
    messages,
    temperature: 0.8,
    max_tokens: 500,
  };

  if (tools && tools.length > 0) {
    requestBody.tools = tools;
    requestBody.tool_choice = 'auto'; // Let model decide when to use tools
  }

  const requestId = generateId();
  const requestStartTime = Date.now();

  // Emit AI request event
  eventBus.fire(EventTypes.AI_REQUEST_SENT, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    prompt_tokens: promptText.length,
    purpose: featureCategory,
  }, {
    source: 'ai',
    npc_id: toolContext?.npc_id,
  });

  const response = await doorFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();

    // Emit AI error event
    eventBus.fire(EventTypes.AI_ERROR, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      error_type: 'api_error',
      message: errorText,
    }, {
      source: 'ai',
      npc_id: toolContext?.npc_id,
      importance: 0.8,
    });

    const error = new Error(`AI API error (${config.provider}): ${errorText}`);
    errorLogger.log(error, {
      source: 'ai',
      operation: 'callOpenAICompatible',
      npc_id: toolContext?.npc_id,
      metadata: {
        provider: config.provider,
        model: config.model,
        status: response.status,
        request_id: requestId,
      },
    });
    throw error;
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

  // Emit AI response event
  eventBus.fire(EventTypes.AI_RESPONSE_RECEIVED, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    tokens_used: usage.total_tokens,
    cost_cents: actualCostCents,
    latency_ms: Date.now() - requestStartTime,
  }, {
    source: 'ai',
    npc_id: toolContext?.npc_id,
  });

  const choice = data.choices[0];

  // Handle tool calls
  if (choice.message.tool_calls && choice.message.tool_calls.length > 0 && toolContext) {
    console.log(`[AI] Model requested ${choice.message.tool_calls.length} tool call(s)`);

    // Execute each tool call
    const toolResults: any[] = [];
    for (const toolCall of choice.message.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      console.log(`[AI] Executing tool: ${toolName}`, toolArgs);

      const result = await executeToolCall(toolName, toolArgs, toolContext);
      toolResults.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: toolName,
        content: JSON.stringify(result),
      });
    }

    // Make a second request with tool results
    const followUpMessages = [
      ...messages,
      choice.message, // Include the assistant's message with tool_calls
      ...toolResults,
    ];

    const followUpResponse = await doorFetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: followUpMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!followUpResponse.ok) {
      const error = await followUpResponse.text();
      throw new Error(`AI API error (follow-up): ${error}`);
    }

    const followUpData = await followUpResponse.json();

    // Log follow-up cost
    const followUpUsage = parseOpenAIUsage(followUpData);
    const followUpCost = calculateCost(followUpUsage, config.model);
    logApiCost({
      provider: config.provider,
      model: config.model,
      feature_category: featureCategory,
      input_tokens: followUpUsage.input_tokens,
      output_tokens: followUpUsage.output_tokens,
      total_tokens: followUpUsage.total_tokens,
      cost_cents: followUpCost,
    });

    return followUpData.choices[0].message.content;
  }

  return choice.message.content;
}

// Anthropic API with budget tracking
async function callAnthropic(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIConfig,
  featureCategory: string = 'other',
  enableTools: boolean = false,
  toolContext?: { npc_id: string; player_id?: string; conversation_id?: string }
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

  // Add tools if enabled
  const tools = enableTools && toolContext ? getToolDefinitions('anthropic') : undefined;

  const requestBody: any = {
    model: config.model,
    max_tokens: 500,
    system,
    messages: 对话.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
  };

  if (tools && tools.length > 0) {
    requestBody.tools = tools;
  }

  const response = await doorFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Anthropic API error: ${errorText}`);
    errorLogger.log(error, {
      source: 'ai',
      operation: 'callAnthropic',
      npc_id: toolContext?.npc_id,
      metadata: {
        provider: config.provider,
        model: config.model,
        status: response.status,
      },
    });
    throw error;
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

  // Handle tool use
  const content = data.content;
  const toolUseBlocks = content.filter((block: any) => block.type === 'tool_use');

  if (toolUseBlocks.length > 0 && toolContext) {
    console.log(`[AI] Model requested ${toolUseBlocks.length} tool call(s)`);

    // Execute each tool call
    const toolResults: any[] = [];
    for (const toolUse of toolUseBlocks) {
      console.log(`[AI] Executing tool: ${toolUse.name}`, toolUse.input);

      const result = await executeToolCall(toolUse.name, toolUse.input, toolContext);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Make a second request with tool results
    const followUpMessages = [
      ...对话.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'assistant', content }, // Include the assistant's response with tool_use
      { role: 'user', content: toolResults }, // Tool results
    ];

    const followUpResponse = await doorFetch('https://api.anthropic.com/v1/messages', {
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
        messages: followUpMessages,
      }),
    });

    if (!followUpResponse.ok) {
      const error = await followUpResponse.text();
      throw new Error(`Anthropic API error (follow-up): ${error}`);
    }

    const followUpData = await followUpResponse.json();

    // Log follow-up cost
    const followUpUsage = parseAnthropicUsage(followUpData);
    const followUpCost = calculateCost(followUpUsage, config.model);
    logApiCost({
      provider: config.provider,
      model: config.model,
      feature_category: featureCategory,
      input_tokens: followUpUsage.input_tokens,
      output_tokens: followUpUsage.output_tokens,
      total_tokens: followUpUsage.total_tokens,
      cost_cents: followUpCost,
    });

    return followUpData.content.find((block: any) => block.type === 'text')?.text || '';
  }

  return content.find((block: any) => block.type === 'text')?.text || '';
}

// Generate a post for an NPC
export async function generateNPCPost(
  npcId: string,
  platform: string,
  prompt?: string,
  featureCategory: string = 'autonomous_posts',
  validationOptions?: Partial<ValidationOptions>
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

  // Validate post output
  const validationContext = {
    platform,
    conversation_type: 'post' as const,
    prompt: prompt || 'Share something interesting',
  };

  const validationResult = await validateAndFixIfNeeded(
    npcId,
    response,
    prompt || 'Create a post',
    validationContext,
    validationOptions
  );

  if (validationResult.was_fixed) {
    console.log(`[AI] Post output was fixed after validation`);
  }

  return validationResult.final_output;
}

// ─────────────────────────────────────────────────────────────────
// Queue-Wrapped Functions (Use these for priority-managed requests)
// ─────────────────────────────────────────────────────────────────

/**
 * Queue-wrapped NPC response generation
 * Routes through the AI queue for priority management and budget control
 */
export async function queuedGenerateNPCResponse(
  npcId: string,
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: {
    platform?: string;
    player_name?: string;
    player_id?: string;
    conversation_id?: string;
    conversation_type?: 'direct_message' | 'group_chat' | 'post' | 'comment';
    feature_category?: string;
    enable_tools?: boolean;
    validation_options?: Partial<ValidationOptions>;
    // Queue-specific options
    priority?: Priority;
    isUserInitiated?: boolean;
  }
): Promise<QueueResult<string>> {
  // Determine priority
  let priority = context?.priority;
  if (!priority) {
    if (context?.isUserInitiated !== false) {
      // Default to CRITICAL for user-initiated messages
      priority = Priority.CRITICAL;
    } else {
      // NPC-initiated or follow-up
      priority = Priority.HIGH;
    }
  }

  // Estimate cost (rough: ~4 chars per token, assume 500 output tokens)
  const promptLength = message.length + conversationHistory.reduce((acc, m) => acc + m.content.length, 0);
  const estimatedCost = estimateCost(promptLength, 500, globalConfig.model);

  return aiQueue.enqueue({
    priority,
    type: 'npc_response' as RequestType,
    npcId,
    playerId: context?.player_id,
    conversationId: context?.conversation_id,
    featureCategory: context?.feature_category || 'conversation',
    estimatedCost,
    execute: () => generateNPCResponse(npcId, message, conversationHistory, context),
    metadata: {
      platform: context?.platform,
      message_preview: message.slice(0, 100),
    },
  });
}

/**
 * Queue-wrapped NPC post generation
 * Routes through the AI queue - typically lower priority than DMs
 */
export async function queuedGenerateNPCPost(
  npcId: string,
  platform: string,
  prompt?: string,
  options?: {
    featureCategory?: string;
    validationOptions?: Partial<ValidationOptions>;
    priority?: Priority;
    isScheduled?: boolean;
    isBackground?: boolean;
  }
): Promise<QueueResult<string>> {
  // Determine priority
  let priority = options?.priority;
  if (!priority) {
    if (options?.isScheduled) {
      priority = Priority.MEDIUM;
    } else if (options?.isBackground) {
      priority = Priority.LOW;
    } else {
      priority = Priority.MEDIUM; // Default for posts
    }
  }

  // Estimate cost for post generation
  const promptLength = (prompt?.length || 50) + 500; // Base system prompt
  const estimatedCost = estimateCost(promptLength, 300, globalConfig.model);

  return aiQueue.enqueue({
    priority,
    type: 'npc_post' as RequestType,
    npcId,
    featureCategory: options?.featureCategory || 'autonomous_posts',
    estimatedCost,
    execute: () => generateNPCPost(npcId, platform, prompt, options?.featureCategory, options?.validationOptions),
    metadata: {
      platform,
      prompt_preview: prompt?.slice(0, 100),
    },
  });
}

/**
 * Queue-wrapped NPC-to-NPC interaction
 * Lowest priority - only runs when budget is healthy
 */
export async function queuedNPCInteraction(
  sourceNpcId: string,
  targetNpcId: string,
  interactionType: 'comment' | 'reaction' | 'message',
  context: string,
  options?: {
    priority?: Priority;
    featureCategory?: string;
  }
): Promise<QueueResult<string>> {
  const priority = options?.priority || Priority.LOW;

  // Estimate cost for interaction
  const estimatedCost = estimateCost(context.length + 500, 200, globalConfig.model);

  return aiQueue.enqueue({
    priority,
    type: 'npc_npc_interaction' as RequestType,
    npcId: sourceNpcId,
    featureCategory: options?.featureCategory || 'npc_interactions',
    estimatedCost,
    execute: async () => {
      // Generate response as if from source NPC
      return generateNPCResponse(sourceNpcId, context, [], {
        platform: 'social',
        player_name: '', // No player involved
        feature_category: options?.featureCategory || 'npc_interactions',
      });
    },
    metadata: {
      interaction_type: interactionType,
      target_npc_id: targetNpcId,
      context_preview: context.slice(0, 100),
    },
  });
}

/**
 * Queue-wrapped pre-generation (opportunistic)
 * Only runs when budget > 80%
 */
export async function queuedPregenerate(
  npcId: string,
  contentType: 'post' | 'greeting' | 'reaction',
  options?: {
    platform?: string;
    context?: string;
    featureCategory?: string;
  }
): Promise<QueueResult<string>> {
  const estimatedCost = estimateCost(500, 200, globalConfig.model);

  return aiQueue.enqueue({
    priority: Priority.IDLE,
    type: 'content_pregeneration' as RequestType,
    npcId,
    featureCategory: options?.featureCategory || 'pregeneration',
    estimatedCost,
    execute: async () => {
      const prompt = contentType === 'post'
        ? 'Create a casual post for later'
        : contentType === 'greeting'
        ? 'Generate a friendly greeting'
        : 'Generate a quick reaction';

      return generateNPCPost(npcId, options?.platform || 'social', prompt, options?.featureCategory);
    },
    metadata: {
      content_type: contentType,
      platform: options?.platform,
    },
  });
}

// Re-export Priority for convenience
export { Priority } from './ai-queue.js';

export default {
  configureAI,
  getAIConfig,
  getNPCConfig,
  buildNPCSystemPrompt,
  getNPCMemories,
  generateNPCResponse,
  generateNPCPost,
  // Queue-wrapped versions
  queuedGenerateNPCResponse,
  queuedGenerateNPCPost,
  queuedNPCInteraction,
  queuedPregenerate,
};