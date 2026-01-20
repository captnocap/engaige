// Flexible image generation provider configuration
// Allows users to define custom payload templates for any image generation API

import { getDB, generateId, now } from '../db/index.js';

export interface ImageGenProvider {
  id: string;
  name: string;
  display_name: string;
  base_url: string;
  api_key?: string;
  is_active: boolean;
  supports_img2img: boolean;
  payload_template: string; // JSON string with {placeholders}
  response_path: string; // JSON path like "data.0.url" or "artifacts.0.base64"
  cost_config: Record<string, number>;
  created_at: number;
  updated_at: number;
}

// Get active image generation provider
export function getActiveImageGenProvider(): ImageGenProvider | null {
  const db = getDB('user');
  const provider = db.prepare(`
    SELECT * FROM image_gen_providers WHERE is_active = 1 LIMIT 1
  `).get() as any;

  if (!provider) return null;

  return {
    id: provider.id,
    name: provider.name,
    display_name: provider.display_name,
    base_url: provider.base_url,
    api_key: provider.api_key,
    is_active: Boolean(provider.is_active),
    supports_img2img: Boolean(provider.supports_img2img),
    payload_template: provider.payload_template,
    response_path: provider.response_path,
    cost_config: JSON.parse(provider.cost_config || '{}'),
    created_at: provider.created_at,
    updated_at: provider.updated_at,
  };
}

// Get a specific image generation provider by name
export function getImageGenProviderByName(name: string): ImageGenProvider | null {
  const db = getDB('user');
  const provider = db.prepare(`
    SELECT * FROM image_gen_providers WHERE name = ?
  `).get(name) as any;

  if (!provider) return null;

  return {
    id: provider.id,
    name: provider.name,
    display_name: provider.display_name,
    base_url: provider.base_url,
    api_key: provider.api_key,
    is_active: Boolean(provider.is_active),
    supports_img2img: Boolean(provider.supports_img2img),
    payload_template: provider.payload_template,
    response_path: provider.response_path,
    cost_config: JSON.parse(provider.cost_config || '{}'),
    created_at: provider.created_at,
    updated_at: provider.updated_at,
  };
}

// Get all image generation providers
export function getAllImageGenProviders(): ImageGenProvider[] {
  const db = getDB('user');
  const providers = db.prepare(`
    SELECT * FROM image_gen_providers ORDER BY is_active DESC, name ASC
  `).all() as any[];

  return providers.map(p => ({
    id: p.id,
    name: p.name,
    display_name: p.display_name,
    base_url: p.base_url,
    api_key: p.api_key,
    is_active: Boolean(p.is_active),
    supports_img2img: Boolean(p.supports_img2img),
    payload_template: p.payload_template,
    response_path: p.response_path,
    cost_config: JSON.parse(p.cost_config || '{}'),
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
}

// Create or update an image generation provider
export function upsertImageGenProvider(provider: {
  name: string;
  display_name: string;
  base_url: string;
  api_key?: string;
  is_active?: boolean;
  supports_img2img?: boolean;
  payload_template: string; // JSON string
  response_path: string;
  cost_config?: Record<string, number>;
}): ImageGenProvider {
  const db = getDB('user');

  const existing = getImageGenProviderByName(provider.name);

  if (existing) {
    // Update
    db.prepare(`
      UPDATE image_gen_providers
      SET display_name = ?, base_url = ?, api_key = ?, is_active = ?,
          supports_img2img = ?, payload_template = ?, response_path = ?,
          cost_config = ?, updated_at = ?
      WHERE name = ?
    `).run(
      provider.display_name,
      provider.base_url,
      provider.api_key || null,
      provider.is_active ? 1 : 0,
      provider.supports_img2img ? 1 : 0,
      provider.payload_template,
      provider.response_path,
      JSON.stringify(provider.cost_config || {}),
      now(),
      provider.name
    );

    return getImageGenProviderByName(provider.name)!;
  } else {
    // Create
    const id = generateId();

    db.prepare(`
      INSERT INTO image_gen_providers
        (id, name, display_name, base_url, api_key, is_active, supports_img2img,
         payload_template, response_path, cost_config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      provider.name,
      provider.display_name,
      provider.base_url,
      provider.api_key || null,
      provider.is_active ? 1 : 0,
      provider.supports_img2img ? 1 : 0,
      provider.payload_template,
      provider.response_path,
      JSON.stringify(provider.cost_config || {}),
      now(),
      now()
    );

    return getImageGenProviderByName(provider.name)!;
  }
}

// Set active image generation provider
export function setActiveImageGenProvider(name: string): void {
  const db = getDB('user');

  // Deactivate all
  db.prepare(`UPDATE image_gen_providers SET is_active = 0`).run();

  // Activate the selected one
  db.prepare(`UPDATE image_gen_providers SET is_active = 1, updated_at = ? WHERE name = ?`)
    .run(now(), name);
}

// Build request payload from template
export function buildPayloadFromTemplate(
  template: string,
  params: Record<string, any>
): any {
  let payload = template;

  // Replace all {placeholder} with actual values
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{${key}}`;
    const replacement = typeof value === 'string' ? `"${value}"` : String(value);
    payload = payload.replaceAll(placeholder, replacement);
  }

  try {
    return JSON.parse(payload);
  } catch (error) {
    throw new Error(`Invalid payload template: ${error.message}`);
  }
}

// Extract value from response using JSON path
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

// Estimate cost for a request
export function estimateImageGenCost(
  provider: ImageGenProvider,
  params: { size?: string; quality?: string }
): number {
  // Try to match cost config
  const costConfig = provider.cost_config;

  // Try various keys
  const size = params.size || '1024x1024';
  const quality = params.quality || 'standard';

  const possibleKeys = [
    `${size}_${quality}`,
    size,
    'default',
  ];

  for (const key of possibleKeys) {
    if (costConfig[key] !== undefined) {
      return costConfig[key];
    }
  }

  // Fallback
  return 5; // $0.05 default
}

export default {
  getActiveImageGenProvider,
  getImageGenProviderByName,
  getAllImageGenProviders,
  upsertImageGenProvider,
  setActiveImageGenProvider,
  buildPayloadFromTemplate,
  extractFromResponse,
  estimateImageGenCost,
};
