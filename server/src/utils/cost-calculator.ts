// Cost calculation utilities for different AI providers

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface ModelPricing {
  input_cost_per_1m: number; // Cost per 1M input tokens in cents
  output_cost_per_1m: number; // Cost per 1M output tokens in cents
}

// Pricing database (updated Jan 2025)
// Prices are in cents per 1M tokens
const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { input_cost_per_1m: 250, output_cost_per_1m: 1000 },
  'gpt-4o-mini': { input_cost_per_1m: 15, output_cost_per_1m: 60 },
  'gpt-4-turbo': { input_cost_per_1m: 1000, output_cost_per_1m: 3000 },
  'gpt-4': { input_cost_per_1m: 3000, output_cost_per_1m: 6000 },
  'gpt-3.5-turbo': { input_cost_per_1m: 50, output_cost_per_1m: 150 },

  // Anthropic
  'claude-opus-4-5': { input_cost_per_1m: 1500, output_cost_per_1m: 7500 },
  'claude-sonnet-4-5': { input_cost_per_1m: 300, output_cost_per_1m: 1500 },
  'claude-sonnet-4': { input_cost_per_1m: 300, output_cost_per_1m: 1500 },
  'claude-sonnet-3-5': { input_cost_per_1m: 300, output_cost_per_1m: 1500 },
  'claude-haiku-3-5': { input_cost_per_1m: 25, output_cost_per_1m: 125 },

  // Common local/cheap models (estimates)
  'llama-3.1-8b': { input_cost_per_1m: 0, output_cost_per_1m: 0 },
  'llama-3.1-70b': { input_cost_per_1m: 0, output_cost_per_1m: 0 },
  'mistral-7b': { input_cost_per_1m: 0, output_cost_per_1m: 0 },
  'mixtral-8x7b': { input_cost_per_1m: 0, output_cost_per_1m: 0 },

  // Fallback for unknown models
  'unknown': { input_cost_per_1m: 100, output_cost_per_1m: 300 },
};

// Parse token usage from OpenAI response
export function parseOpenAIUsage(response: any): TokenUsage {
  const usage = response.usage || {};
  return {
    input_tokens: usage.prompt_tokens || 0,
    output_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0,
  };
}

// Parse token usage from Anthropic response
export function parseAnthropicUsage(response: any): TokenUsage {
  const usage = response.usage || {};
  return {
    input_tokens: usage.input_tokens || 0,
    output_tokens: usage.output_tokens || 0,
    total_tokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
  };
}

// Get pricing for a model (with fuzzy matching)
export function getModelPricing(modelName: string): ModelPricing {
  // Exact match
  if (MODEL_PRICING[modelName]) {
    return MODEL_PRICING[modelName];
  }

  // Fuzzy match - check if model name contains known model identifier
  const lowerModel = modelName.toLowerCase();

  for (const [key, pricing] of Object.entries(MODEL_PRICING)) {
    if (lowerModel.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerModel)) {
      return pricing;
    }
  }

  // Check for common patterns
  if (lowerModel.includes('gpt-4o')) return MODEL_PRICING['gpt-4o'];
  if (lowerModel.includes('gpt-4')) return MODEL_PRICING['gpt-4'];
  if (lowerModel.includes('gpt-3.5')) return MODEL_PRICING['gpt-3.5-turbo'];
  if (lowerModel.includes('claude') && lowerModel.includes('opus')) return MODEL_PRICING['claude-opus-4-5'];
  if (lowerModel.includes('claude') && lowerModel.includes('sonnet')) return MODEL_PRICING['claude-sonnet-4-5'];
  if (lowerModel.includes('claude') && lowerModel.includes('haiku')) return MODEL_PRICING['claude-haiku-3-5'];
  if (lowerModel.includes('llama') || lowerModel.includes('mistral')) {
    return { input_cost_per_1m: 0, output_cost_per_1m: 0 }; // Local models are free
  }

  // Unknown model - use conservative estimate
  return MODEL_PRICING['unknown'];
}

// Calculate cost in cents
export function calculateCost(usage: TokenUsage, modelName: string): number {
  const pricing = getModelPricing(modelName);

  const inputCost = (usage.input_tokens / 1_000_000) * pricing.input_cost_per_1m;
  const outputCost = (usage.output_tokens / 1_000_000) * pricing.output_cost_per_1m;

  return Math.ceil(inputCost + outputCost); // Round up to nearest cent
}

// Estimate cost before making a request (based on prompt length)
export function estimateCost(promptLength: number, expectedOutputTokens: number, modelName: string): number {
  // Rough estimate: 4 chars per token
  const estimatedInputTokens = Math.ceil(promptLength / 4);

  const usage: TokenUsage = {
    input_tokens: estimatedInputTokens,
    output_tokens: expectedOutputTokens,
    total_tokens: estimatedInputTokens + expectedOutputTokens,
  };

  return calculateCost(usage, modelName);
}

// Add or update model pricing (for user-configured models)
export function setModelPricing(modelName: string, pricing: ModelPricing): void {
  MODEL_PRICING[modelName] = pricing;
}

// Get all known model pricing
export function getAllModelPricing(): Record<string, ModelPricing> {
  return { ...MODEL_PRICING };
}

export default {
  parseOpenAIUsage,
  parseAnthropicUsage,
  getModelPricing,
  calculateCost,
  estimateCost,
  setModelPricing,
  getAllModelPricing,
};
