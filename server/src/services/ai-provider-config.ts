/**
 * AI Provider Configuration Service
 *
 * Manages multiple AI providers with one active at a time.
 * Supports OpenAI, OpenAI-compatible (LM Studio), and Anthropic.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';
import { doorFetch } from '../network/door.js';

export type AIProviderType = 'openai' | 'openai-compatible' | 'anthropic';

export interface AIProvider {
  id: string;
  name: string;
  display_name: string;
  provider_type: AIProviderType;
  base_url?: string;
  api_key?: string;
  default_model: string;
  is_active: boolean;
  is_enabled: boolean;
  cost_config?: Record<string, { input_per_1m: number; output_per_1m: number }>;
  supports_vision: boolean;
  supports_tools: boolean;
  max_context_tokens?: number;
  created_at: number;
  updated_at: number;
}

export interface AIProviderInput {
  name: string;
  display_name: string;
  provider_type: AIProviderType;
  base_url?: string;
  api_key?: string;
  default_model: string;
  is_active?: boolean;
  is_enabled?: boolean;
  cost_config?: Record<string, { input_per_1m: number; output_per_1m: number }>;
  supports_vision?: boolean;
  supports_tools?: boolean;
  max_context_tokens?: number;
}

// Helper to convert DB row to AIProvider
function rowToProvider(row: any): AIProvider {
  return {
    id: row.id,
    name: row.name,
    display_name: row.display_name,
    provider_type: row.provider_type as AIProviderType,
    base_url: row.base_url || undefined,
    api_key: row.api_key || undefined,
    default_model: row.default_model,
    is_active: Boolean(row.is_active),
    is_enabled: Boolean(row.is_enabled),
    cost_config: row.cost_config ? JSON.parse(row.cost_config) : undefined,
    supports_vision: Boolean(row.supports_vision),
    supports_tools: Boolean(row.supports_tools),
    max_context_tokens: row.max_context_tokens || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Get the currently active AI provider
 */
export function getActiveAIProvider(): AIProvider | null {
  const db = getDB('user');
  const row = db.prepare(`
    SELECT * FROM ai_providers WHERE is_active = 1 AND is_enabled = 1 LIMIT 1
  `).get() as any;

  if (!row) return null;
  return rowToProvider(row);
}

/**
 * Get an AI provider by ID
 */
export function getAIProviderById(id: string): AIProvider | null {
  const db = getDB('user');
  const row = db.prepare(`
    SELECT * FROM ai_providers WHERE id = ?
  `).get(id) as any;

  if (!row) return null;
  return rowToProvider(row);
}

/**
 * Get an AI provider by name
 */
export function getAIProviderByName(name: string): AIProvider | null {
  const db = getDB('user');
  const row = db.prepare(`
    SELECT * FROM ai_providers WHERE name = ?
  `).get(name) as any;

  if (!row) return null;
  return rowToProvider(row);
}

/**
 * Get all AI providers
 */
export function getAllAIProviders(): AIProvider[] {
  const db = getDB('user');
  const rows = db.prepare(`
    SELECT * FROM ai_providers ORDER BY is_active DESC, display_name ASC
  `).all() as any[];

  return rows.map(rowToProvider);
}

/**
 * Get only enabled AI providers
 */
export function getEnabledAIProviders(): AIProvider[] {
  const db = getDB('user');
  const rows = db.prepare(`
    SELECT * FROM ai_providers WHERE is_enabled = 1 ORDER BY is_active DESC, display_name ASC
  `).all() as any[];

  return rows.map(rowToProvider);
}

/**
 * Create or update an AI provider
 */
export function upsertAIProvider(input: AIProviderInput): AIProvider {
  const db = getDB('user');
  const existing = getAIProviderByName(input.name);

  if (existing) {
    // Update existing provider
    db.prepare(`
      UPDATE ai_providers
      SET display_name = ?, provider_type = ?, base_url = ?, api_key = ?,
          default_model = ?, is_active = ?, is_enabled = ?, cost_config = ?,
          supports_vision = ?, supports_tools = ?, max_context_tokens = ?,
          updated_at = ?
      WHERE name = ?
    `).run(
      input.display_name,
      input.provider_type,
      input.base_url || null,
      input.api_key || null,
      input.default_model,
      input.is_active !== undefined ? (input.is_active ? 1 : 0) : existing.is_active ? 1 : 0,
      input.is_enabled !== undefined ? (input.is_enabled ? 1 : 0) : existing.is_enabled ? 1 : 0,
      input.cost_config ? JSON.stringify(input.cost_config) : null,
      input.supports_vision !== undefined ? (input.supports_vision ? 1 : 0) : existing.supports_vision ? 1 : 0,
      input.supports_tools !== undefined ? (input.supports_tools ? 1 : 0) : existing.supports_tools ? 1 : 0,
      input.max_context_tokens || null,
      now(),
      input.name
    );

    // Emit update event
    eventBus.fire(EventTypes.AI_PROVIDER_UPDATED, {
      provider_id: existing.id,
      provider_name: input.name,
      fields_changed: Object.keys(input),
    }, {
      source: 'ai-provider-config',
      importance: 0.5,
    });

    return getAIProviderByName(input.name)!;
  } else {
    // Create new provider
    const id = generateId();

    db.prepare(`
      INSERT INTO ai_providers
        (id, name, display_name, provider_type, base_url, api_key,
         default_model, is_active, is_enabled, cost_config,
         supports_vision, supports_tools, max_context_tokens,
         created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.name,
      input.display_name,
      input.provider_type,
      input.base_url || null,
      input.api_key || null,
      input.default_model,
      input.is_active ? 1 : 0,
      input.is_enabled !== false ? 1 : 0,
      input.cost_config ? JSON.stringify(input.cost_config) : null,
      input.supports_vision ? 1 : 0,
      input.supports_tools !== false ? 1 : 0,
      input.max_context_tokens || null,
      now(),
      now()
    );

    // Emit create event
    eventBus.fire(EventTypes.AI_PROVIDER_CREATED, {
      provider_id: id,
      provider_name: input.name,
      provider_type: input.provider_type,
    }, {
      source: 'ai-provider-config',
      importance: 0.6,
    });

    return getAIProviderById(id)!;
  }
}

/**
 * Set the active AI provider (deactivates all others)
 */
export function setActiveAIProvider(idOrName: string): AIProvider | null {
  const db = getDB('user');

  // Find provider by ID or name
  let provider = getAIProviderById(idOrName);
  if (!provider) {
    provider = getAIProviderByName(idOrName);
  }

  if (!provider) {
    throw new Error(`AI provider not found: ${idOrName}`);
  }

  if (!provider.is_enabled) {
    throw new Error(`Cannot activate disabled provider: ${provider.name}`);
  }

  // Get previous active provider for event
  const previousActive = getActiveAIProvider();

  // Deactivate all providers
  db.prepare(`UPDATE ai_providers SET is_active = 0, updated_at = ?`).run(now());

  // Activate the selected one
  db.prepare(`UPDATE ai_providers SET is_active = 1, updated_at = ? WHERE id = ?`)
    .run(now(), provider.id);

  // Emit activation event
  eventBus.fire(EventTypes.AI_PROVIDER_ACTIVATED, {
    provider_id: provider.id,
    provider_name: provider.name,
    previous_provider_id: previousActive?.id,
    previous_provider_name: previousActive?.name,
  }, {
    source: 'ai-provider-config',
    importance: 0.7,
  });

  return getAIProviderById(provider.id);
}

/**
 * Delete an AI provider
 */
export function deleteAIProvider(idOrName: string): boolean {
  const db = getDB('user');

  // Find provider by ID or name
  let provider = getAIProviderById(idOrName);
  if (!provider) {
    provider = getAIProviderByName(idOrName);
  }

  if (!provider) {
    return false;
  }

  // Don't delete if it's the only active provider
  if (provider.is_active) {
    const enabledCount = db.prepare(`
      SELECT COUNT(*) as count FROM ai_providers WHERE is_enabled = 1
    `).get() as { count: number };

    if (enabledCount.count <= 1) {
      throw new Error('Cannot delete the only active provider');
    }
  }

  // Delete the provider
  db.prepare(`DELETE FROM ai_providers WHERE id = ?`).run(provider.id);

  // Emit delete event
  eventBus.fire(EventTypes.AI_PROVIDER_DELETED, {
    provider_id: provider.id,
    provider_name: provider.name,
  }, {
    source: 'ai-provider-config',
    importance: 0.6,
  });

  // If deleted provider was active, activate another enabled provider
  if (provider.is_active) {
    const firstEnabled = db.prepare(`
      SELECT id FROM ai_providers WHERE is_enabled = 1 LIMIT 1
    `).get() as { id: string } | undefined;

    if (firstEnabled) {
      setActiveAIProvider(firstEnabled.id);
    }
  }

  return true;
}

/**
 * Enable or disable an AI provider
 */
export function setProviderEnabled(idOrName: string, enabled: boolean): AIProvider | null {
  const db = getDB('user');

  let provider = getAIProviderById(idOrName);
  if (!provider) {
    provider = getAIProviderByName(idOrName);
  }

  if (!provider) {
    return null;
  }

  // If disabling an active provider, we need to activate another one first
  if (!enabled && provider.is_active) {
    const otherEnabled = db.prepare(`
      SELECT id FROM ai_providers WHERE is_enabled = 1 AND id != ? LIMIT 1
    `).get(provider.id) as { id: string } | undefined;

    if (!otherEnabled) {
      throw new Error('Cannot disable the only enabled provider');
    }

    setActiveAIProvider(otherEnabled.id);
  }

  db.prepare(`
    UPDATE ai_providers SET is_enabled = ?, updated_at = ? WHERE id = ?
  `).run(enabled ? 1 : 0, now(), provider.id);

  return getAIProviderById(provider.id);
}

/**
 * Test provider connection
 */
export async function testProviderConnection(provider: AIProvider): Promise<{
  success: boolean;
  error?: string;
  latency_ms?: number;
}> {
  const startTime = Date.now();

  try {
    if (provider.provider_type === 'openai' || provider.provider_type === 'openai-compatible') {
      const baseUrl = provider.base_url || 'https://api.openai.com/v1';
      const modelsUrl = `${baseUrl}/models`;

      const headers: Record<string, string> = {};
      if (provider.api_key) {
        headers['Authorization'] = `Bearer ${provider.api_key}`;
      }

      const response = await doorFetch(modelsUrl, {
        method: 'GET',
        headers,
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { success: true, latency_ms: latency };
      }

      // Some local servers don't have /models endpoint
      if (response.status === 404 && provider.provider_type === 'openai-compatible') {
        return { success: true, latency_ms: latency };
      }

      const errorText = await response.text();
      return { success: false, error: errorText, latency_ms: latency };
    }

    if (provider.provider_type === 'anthropic') {
      if (!provider.api_key) {
        return { success: false, error: 'API key required for Anthropic' };
      }

      // Just test that we can reach the API (minimal request)
      const response = await doorFetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': provider.api_key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: provider.default_model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      const latency = Date.now() - startTime;

      // Even if we get an error response, if it's from Anthropic's API, connection works
      if (response.ok || response.status === 400 || response.status === 401) {
        if (response.status === 401) {
          return { success: false, error: 'Invalid API key', latency_ms: latency };
        }
        return { success: true, latency_ms: latency };
      }

      const errorText = await response.text();
      return { success: false, error: errorText, latency_ms: latency };
    }

    return { success: false, error: `Unknown provider type: ${provider.provider_type}` };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection failed',
      latency_ms: Date.now() - startTime,
    };
  }
}

/**
 * Get provider for an NPC (resolution order: ai_provider_id -> inline config -> global default)
 */
export function getProviderForNPC(npc: {
  ai_provider_id?: string | null;
  model_provider?: string | null;
  model_name?: string | null;
  model_base_url?: string | null;
  model_api_key?: string | null;
}): AIProvider | null {
  // 1. Check ai_provider_id reference
  if (npc.ai_provider_id) {
    const provider = getAIProviderById(npc.ai_provider_id);
    if (provider && provider.is_enabled) {
      return provider;
    }
  }

  // 2. Check inline config (backward compatibility)
  if (npc.model_provider && npc.model_name) {
    // Create a synthetic provider from inline config
    return {
      id: 'inline',
      name: 'inline',
      display_name: 'NPC Inline Config',
      provider_type: npc.model_provider as AIProviderType,
      base_url: npc.model_base_url || undefined,
      api_key: npc.model_api_key || undefined,
      default_model: npc.model_name,
      is_active: true,
      is_enabled: true,
      supports_vision: false,
      supports_tools: true,
      created_at: 0,
      updated_at: 0,
    };
  }

  // 3. Fall back to global active provider
  return getActiveAIProvider();
}

export default {
  getActiveAIProvider,
  getAIProviderById,
  getAIProviderByName,
  getAllAIProviders,
  getEnabledAIProviders,
  upsertAIProvider,
  setActiveAIProvider,
  deleteAIProvider,
  setProviderEnabled,
  testProviderConnection,
  getProviderForNPC,
};
