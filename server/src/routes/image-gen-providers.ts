/**
 * Image Generation Provider Routes
 *
 * Route handler factory for image generation provider management.
 */

import {
  getAllImageGenProviders,
  getActiveImageGenProvider,
  getImageGenProviderByName,
  getImageGenProviderById,
  upsertImageGenProvider,
  setActiveImageGenProvider,
  deleteImageGenProvider,
  type ImageGenProvider,
} from '../services/image-gen-config.js';
import { doorFetch } from '../network/door.js';

export interface CreateImageGenProviderParams {
  name: string;
  display_name: string;
  base_url: string;
  api_key?: string;
  is_active?: boolean;
  default_payload: Record<string, any>;
  prompt_key?: string;
  reference_images_key?: string;
  response_path: string;
  cost_per_image?: number;
}

export interface UpdateImageGenProviderParams {
  name: string;
  display_name?: string;
  base_url?: string;
  api_key?: string;
  is_active?: boolean;
  default_payload?: Record<string, any>;
  prompt_key?: string;
  reference_images_key?: string;
  response_path?: string;
  cost_per_image?: number;
}

export interface DeleteImageGenProviderParams {
  name: string;
}

export interface SetActiveImageGenParams {
  name: string;
}

export interface TestImageGenProviderParams {
  name: string;
}

/**
 * Test an image generation provider's connection.
 * Most image gen APIs don't have a simple "ping" endpoint,
 * so we verify the URL is reachable and the API key format looks valid.
 */
async function testImageGenProviderConnection(provider: ImageGenProvider): Promise<{
  success: boolean;
  error?: string;
  latency_ms?: number;
}> {
  const startTime = Date.now();

  try {
    // For OpenAI, we can use the models endpoint to verify the key
    if (provider.base_url.includes('openai.com')) {
      const response = await doorFetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
        },
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `API returned ${response.status}: ${error}`,
          latency_ms: latency,
        };
      }

      return {
        success: true,
        latency_ms: latency,
      };
    }

    // For Stability AI
    if (provider.base_url.includes('stability.ai')) {
      const response = await doorFetch('https://api.stability.ai/v1/user/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
        },
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          error: `API returned ${response.status}: ${error}`,
          latency_ms: latency,
        };
      }

      return {
        success: true,
        latency_ms: latency,
      };
    }

    // For custom providers, just check if the URL is reachable
    const response = await doorFetch(provider.base_url, {
      method: 'OPTIONS',
    });

    const latency = Date.now() - startTime;

    // OPTIONS might return various status codes depending on CORS config
    // We consider it a success if we get any response
    return {
      success: true,
      latency_ms: latency,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
      latency_ms: Date.now() - startTime,
    };
  }
}

/**
 * Create image generation provider route handlers
 */
export function createImageGenProviderRoutes() {
  return {
    /**
     * Get all image generation providers
     */
    getAll: (): ImageGenProvider[] => {
      return getAllImageGenProviders();
    },

    /**
     * Get the currently active image generation provider
     */
    getActive: (): ImageGenProvider | null => {
      return getActiveImageGenProvider();
    },

    /**
     * Create a new image generation provider
     */
    create: (params: CreateImageGenProviderParams): ImageGenProvider => {
      if (!params.name || !params.display_name || !params.base_url || !params.default_payload || !params.response_path) {
        throw new Error('Missing required fields: name, display_name, base_url, default_payload, response_path');
      }

      return upsertImageGenProvider({
        name: params.name,
        display_name: params.display_name,
        base_url: params.base_url,
        api_key: params.api_key,
        is_active: params.is_active,
        default_payload: params.default_payload,
        prompt_key: params.prompt_key,
        reference_images_key: params.reference_images_key,
        response_path: params.response_path,
        cost_per_image: params.cost_per_image,
      });
    },

    /**
     * Update an existing image generation provider
     */
    update: (params: UpdateImageGenProviderParams): ImageGenProvider => {
      if (!params.name) {
        throw new Error('Provider name is required');
      }

      const existing = getImageGenProviderByName(params.name);
      if (!existing) {
        throw new Error(`Image generation provider not found: ${params.name}`);
      }

      // Merge with existing values
      return upsertImageGenProvider({
        name: existing.name,
        display_name: params.display_name || existing.display_name,
        base_url: params.base_url || existing.base_url,
        api_key: params.api_key !== undefined ? params.api_key : existing.api_key,
        is_active: params.is_active !== undefined ? params.is_active : existing.is_active,
        default_payload: params.default_payload || existing.default_payload,
        prompt_key: params.prompt_key !== undefined ? params.prompt_key : existing.prompt_key,
        reference_images_key: params.reference_images_key !== undefined ? params.reference_images_key : existing.reference_images_key,
        response_path: params.response_path || existing.response_path,
        cost_per_image: params.cost_per_image !== undefined ? params.cost_per_image : existing.cost_per_image,
      });
    },

    /**
     * Delete an image generation provider
     */
    delete: (params: DeleteImageGenProviderParams): { success: boolean } => {
      if (!params.name) {
        throw new Error('Provider name is required');
      }

      const result = deleteImageGenProvider(params.name);
      return { success: result };
    },

    /**
     * Set a provider as the active default
     */
    setActive: (params: SetActiveImageGenParams): ImageGenProvider | null => {
      if (!params.name) {
        throw new Error('Provider name is required');
      }

      setActiveImageGenProvider(params.name);
      return getActiveImageGenProvider();
    },

    /**
     * Test a provider's connection
     */
    test: async (params: TestImageGenProviderParams): Promise<{
      success: boolean;
      error?: string;
      latency_ms?: number;
    }> => {
      if (!params.name) {
        throw new Error('Provider name is required');
      }

      const provider = getImageGenProviderByName(params.name);
      if (!provider) {
        throw new Error(`Image generation provider not found: ${params.name}`);
      }

      return testImageGenProviderConnection(provider);
    },
  };
}

export default createImageGenProviderRoutes;
