/**
 * Image Generation Provider Configuration
 *
 * Flexible provider system where users define complete payloads.
 * At runtime, we only inject the prompt and optional reference images.
 * This keeps NPCs in character - they just provide a prompt, nothing else.
 */

import { getDB, generateId, now } from '../db/index.js';

export interface ImageGenProvider {
  id: string;
  name: string;
  display_name: string;
  base_url: string;
  api_key?: string;
  is_active: boolean;

  // The complete default payload with all settings baked in
  default_payload: Record<string, any>;

  // Which keys to inject at runtime
  prompt_key: string; // e.g., "prompt"
  reference_images_key?: string; // e.g., "imageDataUrls" for img2img

  // Where to find the image in response
  response_path: string; // e.g., "data.0.url" or "artifacts.0.base64"

  // Flat rate for budget tracking (cents per image)
  cost_per_image: number;

  created_at: number;
  updated_at: number;
}

/**
 * Get active image generation provider
 */
export function getActiveImageGenProvider(): ImageGenProvider | null {
  const db = getDB('user');
  const provider = db.prepare(`
    SELECT * FROM image_gen_providers WHERE is_active = 1 LIMIT 1
  `).get() as any;

  if (!provider) return null;

  return mapRowToProvider(provider);
}

/**
 * Get a specific image generation provider by name
 */
export function getImageGenProviderByName(name: string): ImageGenProvider | null {
  const db = getDB('user');
  const provider = db.prepare(`
    SELECT * FROM image_gen_providers WHERE name = ?
  `).get(name) as any;

  if (!provider) return null;

  return mapRowToProvider(provider);
}

/**
 * Get a specific image generation provider by ID
 */
export function getImageGenProviderById(id: string): ImageGenProvider | null {
  const db = getDB('user');
  const provider = db.prepare(`
    SELECT * FROM image_gen_providers WHERE id = ?
  `).get(id) as any;

  if (!provider) return null;

  return mapRowToProvider(provider);
}

/**
 * Get all image generation providers
 */
export function getAllImageGenProviders(): ImageGenProvider[] {
  const db = getDB('user');
  const providers = db.prepare(`
    SELECT * FROM image_gen_providers ORDER BY is_active DESC, display_name ASC
  `).all() as any[];

  return providers.map(mapRowToProvider);
}

/**
 * Create or update an image generation provider
 */
export function upsertImageGenProvider(provider: {
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
}): ImageGenProvider {
  const db = getDB('user');

  const existing = getImageGenProviderByName(provider.name);

  if (existing) {
    // Update
    db.prepare(`
      UPDATE image_gen_providers
      SET display_name = ?, base_url = ?, api_key = ?, is_active = ?,
          default_payload = ?, prompt_key = ?, reference_images_key = ?,
          response_path = ?, cost_per_image = ?, updated_at = ?
      WHERE name = ?
    `).run(
      provider.display_name,
      provider.base_url,
      provider.api_key || null,
      provider.is_active ? 1 : 0,
      JSON.stringify(provider.default_payload),
      provider.prompt_key || 'prompt',
      provider.reference_images_key || null,
      provider.response_path,
      provider.cost_per_image ?? 5,
      now(),
      provider.name
    );

    return getImageGenProviderByName(provider.name)!;
  } else {
    // Create
    const id = generateId();

    db.prepare(`
      INSERT INTO image_gen_providers
        (id, name, display_name, base_url, api_key, is_active,
         default_payload, prompt_key, reference_images_key,
         response_path, cost_per_image, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      provider.name,
      provider.display_name,
      provider.base_url,
      provider.api_key || null,
      provider.is_active ? 1 : 0,
      JSON.stringify(provider.default_payload),
      provider.prompt_key || 'prompt',
      provider.reference_images_key || null,
      provider.response_path,
      provider.cost_per_image ?? 5,
      now(),
      now()
    );

    return getImageGenProviderByName(provider.name)!;
  }
}

/**
 * Set active image generation provider (deactivates all others)
 */
export function setActiveImageGenProvider(name: string): void {
  const db = getDB('user');

  // Verify provider exists
  const provider = getImageGenProviderByName(name);
  if (!provider) {
    throw new Error(`Image generation provider not found: ${name}`);
  }

  // Deactivate all
  db.prepare(`UPDATE image_gen_providers SET is_active = 0`).run();

  // Activate the selected one
  db.prepare(`UPDATE image_gen_providers SET is_active = 1, updated_at = ? WHERE name = ?`)
    .run(now(), name);
}

/**
 * Delete an image generation provider
 */
export function deleteImageGenProvider(name: string): boolean {
  const db = getDB('user');

  // Don't allow deleting the active provider
  const provider = getImageGenProviderByName(name);
  if (provider?.is_active) {
    throw new Error('Cannot delete the active provider. Set another provider as active first.');
  }

  const result = db.prepare(`DELETE FROM image_gen_providers WHERE name = ?`).run(name);
  return result.changes > 0;
}

/**
 * Build the final payload for an image generation request.
 * Takes the provider's default_payload and injects the prompt (and optionally reference images).
 */
export function buildPayload(
  provider: ImageGenProvider,
  prompt: string,
  referenceImages?: string[]
): Record<string, any> {
  // Clone the default payload
  const payload = { ...provider.default_payload };

  // Inject the prompt
  payload[provider.prompt_key] = prompt;

  // Inject reference images if provided and the provider supports it
  if (referenceImages && referenceImages.length > 0 && provider.reference_images_key) {
    payload[provider.reference_images_key] = referenceImages;
  }

  return payload;
}

/**
 * Extract value from response using JSON path
 * Supports paths like "data.0.url" or "artifacts.0.base64"
 */
export function extractFromResponse(response: any, path: string): any {
  const parts = path.split('.');
  let current = response;

  for (const part of parts) {
    if (current === null || current === undefined) {
      throw new Error(`Path ${path} not found in response`);
    }

    // Handle array indices like "data.0.url" -> data[0].url
    if (/^\d+$/.test(part)) {
      current = current[parseInt(part)];
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Map a database row to an ImageGenProvider object
 */
function mapRowToProvider(row: any): ImageGenProvider {
  return {
    id: row.id,
    name: row.name,
    display_name: row.display_name,
    base_url: row.base_url,
    api_key: row.api_key || undefined,
    is_active: Boolean(row.is_active),
    default_payload: JSON.parse(row.default_payload || '{}'),
    prompt_key: row.prompt_key || 'prompt',
    reference_images_key: row.reference_images_key || undefined,
    response_path: row.response_path,
    cost_per_image: row.cost_per_image ?? 5,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export default {
  getActiveImageGenProvider,
  getImageGenProviderByName,
  getImageGenProviderById,
  getAllImageGenProviders,
  upsertImageGenProvider,
  setActiveImageGenProvider,
  deleteImageGenProvider,
  buildPayload,
  extractFromResponse,
};
