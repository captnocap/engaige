/**
 * Direct Chat Service (cornGPT)
 *
 * Provides direct AI chat without NPC context.
 * Uses the user's configured AI provider and can search the .corn internet.
 *
 * This powers the in-game "cornGPT" from "CloseAI" - a parody ChatGPT
 * that stays in-universe and cites sources from the game's filler sites.
 */

import { getAIConfig, type AIConfig } from './ai.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import {
  parseOpenAIUsage,
  parseAnthropicUsage,
  calculateCost,
  estimateCost,
} from '../utils/cost-calculator.js';
import { doorFetch } from '../network/door.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import { executeSearch, type SearchResponse } from './search.js';
import { generateId } from '../db/index.js';

// ============================================================================
// Types
// ============================================================================

export interface DirectChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DirectChatRequest {
  message: string;
  history?: DirectChatMessage[];
  conversationId?: string;
  modes?: string[];  // Mode prompt addendums from the frontend
}

export interface DirectChatSource {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

export interface DirectChatResponse {
  message: string;
  sources: DirectChatSource[];
  conversationId: string;
  tokensUsed?: number;
  costCents?: number;
}

// ============================================================================
// System Prompt
// ============================================================================

const CORNGPT_SYSTEM_PROMPT = `You are cornGPT, an AI assistant created by CloseAI (a subsidiary of Omnicorp Holdings).

## Your Identity
- You were released in late 2024 after 847 days of training
- You're named after corn because CloseAI's headquarters is in the Midwest
- Your responses should be helpful, accurate, and grounded in the information you can find
- You exist in this reality - the .corn internet is THE internet to you

## Searching the Internet
You have access to a search tool that lets you search the .corn internet. Use it to find information when users ask questions. Always cite your sources with clickable links.

When providing information:
1. Search for relevant content first
2. Synthesize the information into a helpful response
3. Include markdown links to sources: [Title](url)
4. If you can't find something, say so honestly

## Your Personality
- Helpful and conversational
- Occasionally make corn puns (but don't overdo it)
- You're proud of being made by CloseAI
- If asked about yourself, you can reference your training, your creators at CloseAI, or your capabilities
- You don't know about any "real" world - the .corn internet IS the internet

## Things You Know About
- The Hartwell Building and its mysterious Floor 13
- Quantum Coffee and the Martinez Study
- Trust Fall Tim and his 2,847 consecutive falls
- The Velvet Algorithms and their philosophical crises
- The Underground music venue run by Mars
- Local bands like Neon Requiem
- Various .corn websites and their content

## Response Format
- Use markdown for formatting
- Include source links as [Title](url)
- Keep responses conversational but informative
- If you searched and found relevant info, mention it naturally`;

// ============================================================================
// Tool Definitions
// ============================================================================

const SEARCH_TOOL = {
  type: 'function' as const,
  function: {
    name: 'search_internet',
    description: 'Search the .corn internet for information. Use this to find articles, videos, discussions, and other content to answer user questions.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find relevant content',
        },
      },
      required: ['query'],
    },
  },
};

// ============================================================================
// Tool Execution
// ============================================================================

async function executeSearchTool(query: string): Promise<string> {
  const searchResponse: SearchResponse = await executeSearch({
    query,
    limit: 5,
  });

  if (searchResponse.results.length === 0) {
    return JSON.stringify({
      found: false,
      message: 'No results found for this query.',
      results: [],
    });
  }

  const results = searchResponse.results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet.replace(/<\/?mark>/g, ''), // Remove highlight markers
    domain: r.siteDomain,
    type: r.contentType,
  }));

  return JSON.stringify({
    found: true,
    count: results.length,
    results,
  });
}

// ============================================================================
// Main Chat Function
// ============================================================================

/**
 * Generate a response from cornGPT
 */
export async function generateDirectChatResponse(
  request: DirectChatRequest
): Promise<DirectChatResponse> {
  const config = getAIConfig();
  const conversationId = request.conversationId || generateId();
  const sources: DirectChatSource[] = [];

  // Build system prompt with any active modes
  let systemPrompt = CORNGPT_SYSTEM_PROMPT;
  if (request.modes && request.modes.length > 0) {
    systemPrompt += '\n\n## Active Modes\nThe user has enabled the following special modes. Adjust your responses accordingly:\n\n';
    for (const modePrompt of request.modes) {
      systemPrompt += `- ${modePrompt}\n`;
    }
  }

  // Build messages array
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add history
  if (request.history) {
    for (const msg of request.history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // Add current message
  messages.push({ role: 'user', content: request.message });

  // Call the appropriate provider
  if (config.provider === 'anthropic') {
    return await callAnthropicDirectChat(messages, config, conversationId, sources);
  } else {
    return await callOpenAIDirectChat(messages, config, conversationId, sources);
  }
}

// ============================================================================
// OpenAI/OpenAI-Compatible Provider
// ============================================================================

async function callOpenAIDirectChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIConfig,
  conversationId: string,
  sources: DirectChatSource[]
): Promise<DirectChatResponse> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/chat/completions`;
  const featureCategory = 'direct_chat';

  // Estimate cost
  const promptText = messages.map((m) => m.content).join(' ');
  const estimatedCostCents = estimateCost(promptText.length, 1000, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows(featureCategory, estimatedCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Budget limit exceeded: ${budgetCheck.reason}`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const requestId = generateId();
  const requestStartTime = Date.now();

  // Emit request event
  eventBus.fire(EventTypes.AI_REQUEST_SENT, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    prompt_tokens: promptText.length,
    purpose: featureCategory,
  }, {
    source: 'direct-chat',
  });

  // First call - may include tool use
  let response = await doorFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
      tools: [SEARCH_TOOL],
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    eventBus.fire(EventTypes.AI_ERROR, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      error_type: 'api_error',
      message: errorText,
    }, {
      source: 'direct-chat',
      importance: 0.8,
    });
    throw new Error(`AI API error: ${errorText}`);
  }

  let data = await response.json();
  let choice = data.choices[0];
  let totalUsage = parseOpenAIUsage(data);

  // Handle tool calls (up to 3 iterations)
  let iterations = 0;
  while (choice.message.tool_calls && iterations < 3) {
    iterations++;
    console.log(`[cornGPT] Processing ${choice.message.tool_calls.length} tool call(s), iteration ${iterations}`);

    // Add assistant message with tool calls to conversation
    messages.push({
      role: 'assistant',
      content: choice.message.content || '',
    } as any);

    // Execute each tool call
    for (const toolCall of choice.message.tool_calls) {
      if (toolCall.function.name === 'search_internet') {
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`[cornGPT] Searching for: "${args.query}"`);

        const searchResult = await executeSearchTool(args.query);
        const parsed = JSON.parse(searchResult);

        // Collect sources
        if (parsed.found && parsed.results) {
          for (const result of parsed.results) {
            sources.push({
              title: result.title,
              url: result.url,
              snippet: result.snippet,
              domain: result.domain,
            });
          }
        }

        // Add tool result to messages
        (messages as any[]).push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: searchResult,
        });
      }
    }

    // Continue the conversation
    response = await doorFetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages,
        tools: [SEARCH_TOOL],
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error on tool continuation: ${await response.text()}`);
    }

    data = await response.json();
    choice = data.choices[0];

    // Accumulate usage
    const iterUsage = parseOpenAIUsage(data);
    totalUsage.input_tokens += iterUsage.input_tokens;
    totalUsage.output_tokens += iterUsage.output_tokens;
    totalUsage.total_tokens += iterUsage.total_tokens;
  }

  // Calculate and log cost
  const actualCostCents = calculateCost(totalUsage, config.model);

  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: featureCategory,
    input_tokens: totalUsage.input_tokens,
    output_tokens: totalUsage.output_tokens,
    total_tokens: totalUsage.total_tokens,
    cost_cents: actualCostCents,
  });

  // Emit response event
  eventBus.fire(EventTypes.AI_RESPONSE_RECEIVED, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    tokens_used: totalUsage.total_tokens,
    cost_cents: actualCostCents,
    latency_ms: Date.now() - requestStartTime,
  }, {
    source: 'direct-chat',
  });

  const finalMessage = choice.message.content || '';

  return {
    message: finalMessage,
    sources: deduplicateSources(sources),
    conversationId,
    tokensUsed: totalUsage.total_tokens,
    costCents: actualCostCents,
  };
}

// ============================================================================
// Anthropic Provider
// ============================================================================

async function callAnthropicDirectChat(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AIConfig,
  conversationId: string,
  sources: DirectChatSource[]
): Promise<DirectChatResponse> {
  const featureCategory = 'direct_chat';

  // Extract system message
  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages.filter((m) => m.role !== 'system');

  // Estimate cost
  const promptText = messages.map((m) => m.content).join(' ');
  const estimatedCostCents = estimateCost(promptText.length, 1000, config.model);

  // Check budget
  const budgetCheck = checkBudgetAllows(featureCategory, estimatedCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Budget limit exceeded: ${budgetCheck.reason}`);
  }

  const requestId = generateId();
  const requestStartTime = Date.now();

  // Emit request event
  eventBus.fire(EventTypes.AI_REQUEST_SENT, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    prompt_tokens: promptText.length,
    purpose: featureCategory,
  }, {
    source: 'direct-chat',
  });

  // Anthropic tool format
  const anthropicTools = [
    {
      name: 'search_internet',
      description: 'Search the .corn internet for information. Use this to find articles, videos, discussions, and other content to answer user questions.',
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to find relevant content',
          },
        },
        required: ['query'],
      },
    },
  ];

  let response = await doorFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1500,
      system: systemMessage,
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      tools: anthropicTools,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    eventBus.fire(EventTypes.AI_ERROR, {
      request_id: requestId,
      provider: config.provider,
      model: config.model,
      error_type: 'api_error',
      message: errorText,
    }, {
      source: 'direct-chat',
      importance: 0.8,
    });
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  let data = await response.json();
  let totalUsage = parseAnthropicUsage(data);

  // Handle tool use (up to 3 iterations)
  let iterations = 0;
  while (data.stop_reason === 'tool_use' && iterations < 3) {
    iterations++;

    const toolUseBlock = data.content.find((block: any) => block.type === 'tool_use');
    if (!toolUseBlock) break;

    console.log(`[cornGPT] Anthropic tool use: ${toolUseBlock.name}, iteration ${iterations}`);

    if (toolUseBlock.name === 'search_internet') {
      const searchResult = await executeSearchTool(toolUseBlock.input.query);
      const parsed = JSON.parse(searchResult);

      // Collect sources
      if (parsed.found && parsed.results) {
        for (const result of parsed.results) {
          sources.push({
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            domain: result.domain,
          });
        }
      }

      // Add assistant response and tool result
      chatMessages.push({
        role: 'assistant',
        content: data.content,
      } as any);

      chatMessages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: searchResult,
          },
        ],
      } as any);

      // Continue conversation
      response = await doorFetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1500,
          system: systemMessage,
          messages: chatMessages,
          tools: anthropicTools,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error on tool continuation: ${await response.text()}`);
      }

      data = await response.json();

      // Accumulate usage
      const iterUsage = parseAnthropicUsage(data);
      totalUsage.input_tokens += iterUsage.input_tokens;
      totalUsage.output_tokens += iterUsage.output_tokens;
      totalUsage.total_tokens += iterUsage.total_tokens;
    }
  }

  // Calculate and log cost
  const actualCostCents = calculateCost(totalUsage, config.model);

  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: featureCategory,
    input_tokens: totalUsage.input_tokens,
    output_tokens: totalUsage.output_tokens,
    total_tokens: totalUsage.total_tokens,
    cost_cents: actualCostCents,
  });

  // Emit response event
  eventBus.fire(EventTypes.AI_RESPONSE_RECEIVED, {
    request_id: requestId,
    provider: config.provider,
    model: config.model,
    tokens_used: totalUsage.total_tokens,
    cost_cents: actualCostCents,
    latency_ms: Date.now() - requestStartTime,
  }, {
    source: 'direct-chat',
  });

  // Extract text from content blocks
  const textBlocks = data.content.filter((block: any) => block.type === 'text');
  const finalMessage = textBlocks.map((block: any) => block.text).join('\n');

  return {
    message: finalMessage,
    sources: deduplicateSources(sources),
    conversationId,
    tokensUsed: totalUsage.total_tokens,
    costCents: actualCostCents,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function deduplicateSources(sources: DirectChatSource[]): DirectChatSource[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}
