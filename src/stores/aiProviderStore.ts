/**
 * AI Provider Store
 *
 * Manages AI providers (for text generation) and Image Generation providers.
 * Uses WebSocket for communication with the server.
 */

import { create } from 'zustand';
import { useWSStore } from './wsStore.js';

// ============================================================================
// Types
// ============================================================================

export interface AIProvider {
  id: string;
  name: string;
  display_name: string;
  provider_type: 'openai' | 'openai-compatible' | 'anthropic';
  base_url?: string;
  api_key?: string;
  default_model: string;
  is_active: boolean;
  is_enabled: boolean;
  supports_vision: boolean;
  supports_tools: boolean;
  max_context_tokens?: number;
  created_at: number;
  updated_at: number;
}

export interface ImageGenProvider {
  id: string;
  name: string;
  display_name: string;
  base_url: string;
  api_key?: string;
  is_active: boolean;
  default_payload: Record<string, any>;
  prompt_key: string;
  reference_images_key?: string;
  response_path: string;
  cost_per_image: number;
  created_at: number;
  updated_at: number;
}

export interface TestResult {
  success: boolean;
  error?: string;
  latency_ms?: number;
}

// ============================================================================
// Store State
// ============================================================================

interface AIProviderState {
  // AI Providers (text generation)
  aiProviders: AIProvider[];
  activeAIProvider: AIProvider | null;
  aiProvidersLoading: boolean;
  aiProvidersError: string | null;

  // Image Generation Providers
  imageGenProviders: ImageGenProvider[];
  activeImageGenProvider: ImageGenProvider | null;
  imageGenProvidersLoading: boolean;
  imageGenProvidersError: string | null;

  // Actions - AI Providers
  fetchAIProviders: () => Promise<void>;
  fetchActiveAIProvider: () => Promise<void>;
  createAIProvider: (provider: Partial<AIProvider>) => Promise<AIProvider>;
  updateAIProvider: (provider: Partial<AIProvider>) => Promise<AIProvider>;
  deleteAIProvider: (nameOrId: string) => Promise<boolean>;
  setActiveAIProvider: (nameOrId: string) => Promise<AIProvider | null>;
  testAIProvider: (nameOrId: string) => Promise<TestResult>;

  // Actions - Image Gen Providers
  fetchImageGenProviders: () => Promise<void>;
  fetchActiveImageGenProvider: () => Promise<void>;
  createImageGenProvider: (provider: Partial<ImageGenProvider>) => Promise<ImageGenProvider>;
  updateImageGenProvider: (provider: Partial<ImageGenProvider>) => Promise<ImageGenProvider>;
  deleteImageGenProvider: (name: string) => Promise<boolean>;
  setActiveImageGenProvider: (name: string) => Promise<ImageGenProvider | null>;
  testImageGenProvider: (name: string) => Promise<TestResult>;
}

// ============================================================================
// Store
// ============================================================================

export const useAIProviderStore = create<AIProviderState>((set, get) => ({
  // Initial state
  aiProviders: [],
  activeAIProvider: null,
  aiProvidersLoading: false,
  aiProvidersError: null,

  imageGenProviders: [],
  activeImageGenProvider: null,
  imageGenProvidersLoading: false,
  imageGenProvidersError: null,

  // ============================================================================
  // AI Provider Actions
  // ============================================================================

  fetchAIProviders: async () => {
    set({ aiProvidersLoading: true, aiProvidersError: null });
    try {
      const request = useWSStore.getState().request;
      const providers = await request<void, AIProvider[]>('aiProvider:getAll');
      set({ aiProviders: providers, aiProvidersLoading: false });
    } catch (error: any) {
      set({ aiProvidersError: error.message, aiProvidersLoading: false });
    }
  },

  fetchActiveAIProvider: async () => {
    try {
      const request = useWSStore.getState().request;
      const provider = await request<void, AIProvider | null>('aiProvider:getActive');
      set({ activeAIProvider: provider });
    } catch (error: any) {
      console.error('Failed to fetch active AI provider:', error);
    }
  },

  createAIProvider: async (provider) => {
    const request = useWSStore.getState().request;
    const created = await request<Partial<AIProvider>, AIProvider>('aiProvider:create', provider);

    // Refresh the list
    await get().fetchAIProviders();

    return created;
  },

  updateAIProvider: async (provider) => {
    const request = useWSStore.getState().request;
    const updated = await request<Partial<AIProvider>, AIProvider>('aiProvider:update', provider);

    // Refresh the list
    await get().fetchAIProviders();
    await get().fetchActiveAIProvider();

    return updated;
  },

  deleteAIProvider: async (nameOrId) => {
    const request = useWSStore.getState().request;
    const result = await request<{ name?: string; id?: string }, { success: boolean }>(
      'aiProvider:delete',
      { name: nameOrId, id: nameOrId }
    );

    // Refresh the list
    await get().fetchAIProviders();

    return result.success;
  },

  setActiveAIProvider: async (nameOrId) => {
    const request = useWSStore.getState().request;
    const provider = await request<{ name?: string; id?: string }, AIProvider | null>(
      'aiProvider:setActive',
      { name: nameOrId, id: nameOrId }
    );

    set({ activeAIProvider: provider });

    // Refresh the list to update is_active flags
    await get().fetchAIProviders();

    return provider;
  },

  testAIProvider: async (nameOrId) => {
    const request = useWSStore.getState().request;
    return await request<{ name?: string; id?: string }, TestResult>(
      'aiProvider:test',
      { name: nameOrId, id: nameOrId }
    );
  },

  // ============================================================================
  // Image Gen Provider Actions
  // ============================================================================

  fetchImageGenProviders: async () => {
    set({ imageGenProvidersLoading: true, imageGenProvidersError: null });
    try {
      const request = useWSStore.getState().request;
      const providers = await request<void, ImageGenProvider[]>('imageGenProvider:getAll');
      set({ imageGenProviders: providers, imageGenProvidersLoading: false });
    } catch (error: any) {
      set({ imageGenProvidersError: error.message, imageGenProvidersLoading: false });
    }
  },

  fetchActiveImageGenProvider: async () => {
    try {
      const request = useWSStore.getState().request;
      const provider = await request<void, ImageGenProvider | null>('imageGenProvider:getActive');
      set({ activeImageGenProvider: provider });
    } catch (error: any) {
      console.error('Failed to fetch active image gen provider:', error);
    }
  },

  createImageGenProvider: async (provider) => {
    const request = useWSStore.getState().request;
    const created = await request<Partial<ImageGenProvider>, ImageGenProvider>(
      'imageGenProvider:create',
      provider
    );

    // Refresh the list
    await get().fetchImageGenProviders();

    return created;
  },

  updateImageGenProvider: async (provider) => {
    const request = useWSStore.getState().request;
    const updated = await request<Partial<ImageGenProvider>, ImageGenProvider>(
      'imageGenProvider:update',
      provider
    );

    // Refresh the list
    await get().fetchImageGenProviders();
    await get().fetchActiveImageGenProvider();

    return updated;
  },

  deleteImageGenProvider: async (name) => {
    const request = useWSStore.getState().request;
    const result = await request<{ name: string }, { success: boolean }>(
      'imageGenProvider:delete',
      { name }
    );

    // Refresh the list
    await get().fetchImageGenProviders();

    return result.success;
  },

  setActiveImageGenProvider: async (name) => {
    const request = useWSStore.getState().request;
    const provider = await request<{ name: string }, ImageGenProvider | null>(
      'imageGenProvider:setActive',
      { name }
    );

    set({ activeImageGenProvider: provider });

    // Refresh the list to update is_active flags
    await get().fetchImageGenProviders();

    return provider;
  },

  testImageGenProvider: async (name) => {
    const request = useWSStore.getState().request;
    return await request<{ name: string }, TestResult>(
      'imageGenProvider:test',
      { name }
    );
  },
}));

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook for AI provider management
 */
export function useAIProviders() {
  const providers = useAIProviderStore((state) => state.aiProviders);
  const activeProvider = useAIProviderStore((state) => state.activeAIProvider);
  const loading = useAIProviderStore((state) => state.aiProvidersLoading);
  const error = useAIProviderStore((state) => state.aiProvidersError);
  const fetchProviders = useAIProviderStore((state) => state.fetchAIProviders);
  const fetchActive = useAIProviderStore((state) => state.fetchActiveAIProvider);
  const create = useAIProviderStore((state) => state.createAIProvider);
  const update = useAIProviderStore((state) => state.updateAIProvider);
  const remove = useAIProviderStore((state) => state.deleteAIProvider);
  const setActive = useAIProviderStore((state) => state.setActiveAIProvider);
  const test = useAIProviderStore((state) => state.testAIProvider);

  return {
    providers,
    activeProvider,
    loading,
    error,
    fetchProviders,
    fetchActive,
    create,
    update,
    remove,
    setActive,
    test,
  };
}

/**
 * Hook for image gen provider management
 */
export function useImageGenProviders() {
  const providers = useAIProviderStore((state) => state.imageGenProviders);
  const activeProvider = useAIProviderStore((state) => state.activeImageGenProvider);
  const loading = useAIProviderStore((state) => state.imageGenProvidersLoading);
  const error = useAIProviderStore((state) => state.imageGenProvidersError);
  const fetchProviders = useAIProviderStore((state) => state.fetchImageGenProviders);
  const fetchActive = useAIProviderStore((state) => state.fetchActiveImageGenProvider);
  const create = useAIProviderStore((state) => state.createImageGenProvider);
  const update = useAIProviderStore((state) => state.updateImageGenProvider);
  const remove = useAIProviderStore((state) => state.deleteImageGenProvider);
  const setActive = useAIProviderStore((state) => state.setActiveImageGenProvider);
  const test = useAIProviderStore((state) => state.testImageGenProvider);

  return {
    providers,
    activeProvider,
    loading,
    error,
    fetchProviders,
    fetchActive,
    create,
    update,
    remove,
    setActive,
    test,
  };
}

export default useAIProviderStore;
