// Model capability detection and management

export interface ModelCapabilities {
  supportsVision: boolean;
  supportsImageGeneration: boolean;
  supportsStreaming: boolean;
  maxTokens: number;
  contextWindow: number;
}

// Known model capabilities database
const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // OpenAI models
  'gpt-4o': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  'gpt-4o-mini': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 16384,
    contextWindow: 128000,
  },
  'gpt-4-turbo': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  'gpt-4': {
    supportsVision: false,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 8192,
  },
  'gpt-3.5-turbo': {
    supportsVision: false,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 16385,
  },

  // Anthropic models
  'claude-opus-4-5': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 200000,
  },
  'claude-sonnet-4-5': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  'claude-sonnet-4': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },
  'claude-haiku-3-5': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 200000,
  },

  // Local/open-source models (generally no vision)
  'llama-3.1-8b': {
    supportsVision: false,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 2048,
    contextWindow: 8192,
  },
  'llama-3.1-70b': {
    supportsVision: false,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 8192,
  },
  'mistral-7b': {
    supportsVision: false,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 2048,
    contextWindow: 8192,
  },
  'mixtral-8x7b': {
    supportsVision: false,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 32768,
  },

  // Vision-specific models
  'gpt-4-vision-preview': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  'llava': {
    supportsVision: true,
    supportsImageGeneration: false,
    supportsStreaming: true,
    maxTokens: 2048,
    contextWindow: 4096,
  },

  // Image generation models
  'dall-e-3': {
    supportsVision: false,
    supportsImageGeneration: true,
    supportsStreaming: false,
    maxTokens: 0,
    contextWindow: 0,
  },
  'dall-e-2': {
    supportsVision: false,
    supportsImageGeneration: true,
    supportsStreaming: false,
    maxTokens: 0,
    contextWindow: 0,
  },
  'stable-diffusion-xl': {
    supportsVision: false,
    supportsImageGeneration: true,
    supportsStreaming: false,
    maxTokens: 0,
    contextWindow: 0,
  },
};

// Default capabilities for unknown models
const DEFAULT_CAPABILITIES: ModelCapabilities = {
  supportsVision: false,
  supportsImageGeneration: false,
  supportsStreaming: true,
  maxTokens: 2048,
  contextWindow: 4096,
};

// Get capabilities for a model (with fuzzy matching)
export function getModelCapabilities(modelName: string): ModelCapabilities {
  // Exact match
  if (MODEL_CAPABILITIES[modelName]) {
    return MODEL_CAPABILITIES[modelName];
  }

  // Fuzzy match
  const lowerModel = modelName.toLowerCase();

  for (const [key, capabilities] of Object.entries(MODEL_CAPABILITIES)) {
    if (lowerModel.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerModel)) {
      return capabilities;
    }
  }

  // Check for known patterns
  if (lowerModel.includes('gpt-4') && lowerModel.includes('vision')) {
    return MODEL_CAPABILITIES['gpt-4-vision-preview'];
  }
  if (lowerModel.includes('gpt-4o')) {
    return MODEL_CAPABILITIES['gpt-4o'];
  }
  if (lowerModel.includes('claude') && (lowerModel.includes('opus') || lowerModel.includes('sonnet') || lowerModel.includes('haiku'))) {
    return MODEL_CAPABILITIES['claude-sonnet-4-5'];
  }
  if (lowerModel.includes('dall-e')) {
    return MODEL_CAPABILITIES['dall-e-3'];
  }
  if (lowerModel.includes('stable-diffusion') || lowerModel.includes('sdxl')) {
    return MODEL_CAPABILITIES['stable-diffusion-xl'];
  }
  if (lowerModel.includes('llava')) {
    return MODEL_CAPABILITIES['llava'];
  }

  // Default for unknown models (assume no special capabilities)
  return DEFAULT_CAPABILITIES;
}

// Check if a model supports vision
export function supportsVision(modelName: string): boolean {
  return getModelCapabilities(modelName).supportsVision;
}

// Check if a model supports image generation
export function supportsImageGeneration(modelName: string): boolean {
  return getModelCapabilities(modelName).supportsImageGeneration;
}

// Add or update model capabilities (for user-configured models)
export function setModelCapabilities(modelName: string, capabilities: ModelCapabilities): void {
  MODEL_CAPABILITIES[modelName] = capabilities;
}

// Get all known models with specific capability
export function getModelsWithCapability(capability: keyof ModelCapabilities): string[] {
  return Object.entries(MODEL_CAPABILITIES)
    .filter(([_, caps]) => caps[capability])
    .map(([name, _]) => name);
}

export default {
  getModelCapabilities,
  supportsVision,
  supportsImageGeneration,
  setModelCapabilities,
  getModelsWithCapability,
};
