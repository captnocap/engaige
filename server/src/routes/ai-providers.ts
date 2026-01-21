/**
 * AI Provider Routes
 *
 * Route handler factory for AI provider management.
 */

import {
  getAllAIProviders,
  getActiveAIProvider,
  getAIProviderById,
  getAIProviderByName,
  upsertAIProvider,
  setActiveAIProvider,
  deleteAIProvider,
  testProviderConnection,
  type AIProvider,
  type AIProviderInput,
} from '../services/ai-provider-config.js';

export interface CreateProviderParams {
  name: string;
  display_name: string;
  provider_type: 'openai' | 'openai-compatible' | 'anthropic';
  base_url?: string;
  api_key?: string;
  default_model: string;
  is_enabled?: boolean;
  supports_vision?: boolean;
  supports_tools?: boolean;
  max_context_tokens?: number;
}

export interface UpdateProviderParams {
  id?: string;
  name?: string;
  display_name?: string;
  provider_type?: 'openai' | 'openai-compatible' | 'anthropic';
  base_url?: string;
  api_key?: string;
  default_model?: string;
  is_enabled?: boolean;
  supports_vision?: boolean;
  supports_tools?: boolean;
  max_context_tokens?: number;
}

export interface DeleteProviderParams {
  id?: string;
  name?: string;
}

export interface SetActiveParams {
  id?: string;
  name?: string;
}

export interface TestProviderParams {
  id?: string;
  name?: string;
}

/**
 * Create AI provider route handlers
 */
export function createAIProviderRoutes() {
  return {
    /**
     * GET /api/ai-providers
     * Get all AI providers
     */
    getAll: (): AIProvider[] => {
      return getAllAIProviders();
    },

    /**
     * GET /api/ai-providers/active
     * Get the currently active AI provider
     */
    getActive: (): AIProvider | null => {
      return getActiveAIProvider();
    },

    /**
     * POST /api/ai-providers
     * Create a new AI provider
     */
    create: (params: CreateProviderParams): AIProvider => {
      if (!params.name || !params.display_name || !params.provider_type || !params.default_model) {
        throw new Error('Missing required fields: name, display_name, provider_type, default_model');
      }

      return upsertAIProvider({
        name: params.name,
        display_name: params.display_name,
        provider_type: params.provider_type,
        base_url: params.base_url,
        api_key: params.api_key,
        default_model: params.default_model,
        is_enabled: params.is_enabled,
        supports_vision: params.supports_vision,
        supports_tools: params.supports_tools,
        max_context_tokens: params.max_context_tokens,
      });
    },

    /**
     * PUT /api/ai-providers/:id
     * Update an existing AI provider
     */
    update: (params: UpdateProviderParams): AIProvider => {
      const idOrName = params.id || params.name;
      if (!idOrName) {
        throw new Error('Either id or name is required');
      }

      // Find existing provider
      let existing = getAIProviderById(idOrName);
      if (!existing) {
        existing = getAIProviderByName(idOrName);
      }

      if (!existing) {
        throw new Error(`AI provider not found: ${idOrName}`);
      }

      // Merge with existing values
      return upsertAIProvider({
        name: existing.name, // Name cannot change
        display_name: params.display_name || existing.display_name,
        provider_type: params.provider_type || existing.provider_type,
        base_url: params.base_url !== undefined ? params.base_url : existing.base_url,
        api_key: params.api_key !== undefined ? params.api_key : existing.api_key,
        default_model: params.default_model || existing.default_model,
        is_enabled: params.is_enabled !== undefined ? params.is_enabled : existing.is_enabled,
        supports_vision: params.supports_vision !== undefined ? params.supports_vision : existing.supports_vision,
        supports_tools: params.supports_tools !== undefined ? params.supports_tools : existing.supports_tools,
        max_context_tokens: params.max_context_tokens !== undefined ? params.max_context_tokens : existing.max_context_tokens,
      });
    },

    /**
     * DELETE /api/ai-providers/:id
     * Delete an AI provider
     */
    delete: (params: DeleteProviderParams): { success: boolean } => {
      const idOrName = params.id || params.name;
      if (!idOrName) {
        throw new Error('Either id or name is required');
      }

      const result = deleteAIProvider(idOrName);
      return { success: result };
    },

    /**
     * POST /api/ai-providers/:id/activate
     * Set a provider as the active default
     */
    setActive: (params: SetActiveParams): AIProvider | null => {
      const idOrName = params.id || params.name;
      if (!idOrName) {
        throw new Error('Either id or name is required');
      }

      return setActiveAIProvider(idOrName);
    },

    /**
     * POST /api/ai-providers/:id/test
     * Test a provider's connection
     */
    test: async (params: TestProviderParams): Promise<{
      success: boolean;
      error?: string;
      latency_ms?: number;
    }> => {
      const idOrName = params.id || params.name;
      if (!idOrName) {
        throw new Error('Either id or name is required');
      }

      let provider = getAIProviderById(idOrName);
      if (!provider) {
        provider = getAIProviderByName(idOrName);
      }

      if (!provider) {
        throw new Error(`AI provider not found: ${idOrName}`);
      }

      return testProviderConnection(provider);
    },
  };
}

export default createAIProviderRoutes;
