/**
 * Image Generation Proxy
 *
 * Simple interface for NPCs to generate images.
 * NPCs only provide: prompt + optional reference images.
 * Everything else (model, resolution, settings) is baked into the active provider config.
 */

import { getDB } from '../db/index.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import {
  getActiveImageGenProvider,
  buildPayload,
  extractFromResponse,
  type ImageGenProvider,
} from './image-gen-config.js';
import { doorFetch } from '../network/door.js';
import { type ContentRating, type GuardrailConfig, getPlayerContentRating, getGuardrailConfig } from './guardrails.js';

/**
 * Generate an image using the active provider.
 *
 * @param prompt - The image description (provided by NPC or system)
 * @param referenceImages - Optional array of reference image URLs/base64 for img2img
 * @param context - Optional context for logging and content rating
 */
export async function generateImage(
  prompt: string,
  referenceImages?: string[],
  context?: {
    npcId?: string;
    npcName?: string;
    purpose?: string;
    playerId?: string;
    contentRating?: ContentRating;
    guardrailConfig?: GuardrailConfig;
  }
): Promise<{ imageUrl: string; promptUsed: string; contentRating?: ContentRating }> {
  // Get active image generation provider
  const provider = getActiveImageGenProvider();

  if (!provider) {
    throw new Error('No active image generation provider configured. Please set one up in settings.');
  }

  // Determine guardrail config - use provided or fetch from player
  let guardrailConfig = context?.guardrailConfig;
  let contentRating = context?.contentRating;

  if (!guardrailConfig && context?.playerId) {
    contentRating = getPlayerContentRating(context.playerId);
    guardrailConfig = getGuardrailConfig(contentRating);
  }

  // Apply safety filtering based on guardrails
  let safePrompt = prompt;
  if (guardrailConfig && !guardrailConfig.allow_nsfw_images) {
    // Prepend SFW prefix for restricted modes
    safePrompt = `SFW, tasteful, appropriate, safe for work: ${prompt}`;
    console.log(`[Image Gen] Applied SFW safety prefix (${guardrailConfig.level} mode)`);
  }

  console.log(`[Image Gen] Using provider: ${provider.display_name} (${provider.name})`);
  console.log(`[Image Gen] Prompt: ${safePrompt.slice(0, 100)}...`);

  // Check budget
  const budgetCheck = checkBudgetAllows('image_generation', provider.cost_per_image);
  if (!budgetCheck.allowed) {
    throw new Error(`Image generation budget exceeded: ${budgetCheck.reason}`);
  }

  // Build payload by injecting prompt (and reference images if provided)
  const payload = buildPayload(provider, safePrompt, referenceImages);

  console.log(`[Image Gen] Request payload:`, JSON.stringify(payload, null, 2));

  // Make API request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider.api_key) {
    headers['Authorization'] = `Bearer ${provider.api_key}`;
  }

  const response = await doorFetch(provider.base_url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation API error (${provider.name}): ${error}`);
  }

  const data = await response.json();

  // Extract image URL using response path
  let imageUrl: string;
  try {
    imageUrl = extractFromResponse(data, provider.response_path);

    // Handle base64 responses
    if (provider.response_path.includes('base64') && !imageUrl.startsWith('data:')) {
      imageUrl = `data:image/png;base64,${imageUrl}`;
    }
  } catch (error: any) {
    console.error('[Image Gen] Failed to extract image from response:', error);
    console.error('[Image Gen] Response:', JSON.stringify(data, null, 2));
    throw new Error(`Failed to extract image URL from response: ${error.message}`);
  }

  // Log the cost
  logApiCost({
    provider: provider.name,
    model: provider.name,
    feature_category: 'image_generation',
    cost_cents: provider.cost_per_image,
    request_metadata: {
      prompt: safePrompt.slice(0, 100),
      original_prompt: prompt.slice(0, 100),
      has_reference_images: Boolean(referenceImages?.length),
      content_rating: contentRating || 'normal',
      sfw_filtered: safePrompt !== prompt,
      context,
    },
  });

  console.log(`[Image Gen] Image generated successfully`);

  return {
    imageUrl,
    promptUsed: safePrompt,
    contentRating: contentRating || 'normal',
  };
}

/**
 * Generate an image for an NPC, automatically including their reference image if available.
 *
 * @param npcId - The NPC's ID
 * @param prompt - The image description
 * @param options - Optional options including purpose and playerId for content rating
 */
export async function generateImageForNPC(
  npcId: string,
  prompt: string,
  options?: { purpose?: string; playerId?: string }
): Promise<{ imageUrl: string; promptUsed: string; contentRating?: ContentRating }> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Get NPC's reference images if they have any
  let referenceImages: string[] | undefined;

  if (npc.reference_images) {
    try {
      referenceImages = JSON.parse(npc.reference_images);
    } catch {
      // Ignore parse errors
    }
  }

  // If NPC has a profile image and no explicit reference images, use profile as reference
  if (!referenceImages?.length && npc.profile_image_url) {
    referenceImages = [npc.profile_image_url];
  }

  return await generateImage(prompt, referenceImages, {
    npcId,
    npcName: npc.display_name,
    purpose: options?.purpose,
    playerId: options?.playerId,
  });
}

/**
 * Generate initial profile portrait for an NPC (during NPC creation).
 * No reference images used since we're creating the initial appearance.
 *
 * @param npcData - NPC traits to build the portrait prompt
 */
export async function generateNPCProfilePortrait(npcData: {
  display_name: string;
  gender?: string;
  age?: number;
  occupation?: string;
  personality?: string;
  aesthetic_style?: string;
}): Promise<{ imageUrl: string; promptUsed: string }> {
  // Build a detailed portrait prompt from NPC traits
  const age = npcData.age || 25;
  const gender = npcData.gender || 'person';
  const occupation = npcData.occupation || '';
  const aesthetic = npcData.aesthetic_style || 'realistic';

  const personalityHints = npcData.personality
    ? `, ${npcData.personality.toLowerCase().replace(/\./g, ',')}`
    : '';

  const prompt = `Professional portrait photo of a ${age}-year-old ${gender}${occupation ? `, ${occupation}` : ''}. ${aesthetic} style${personalityHints}. High quality, well-lit, looking at camera, neutral background.`;

  // No reference images for initial portrait generation
  return await generateImage(prompt, undefined, {
    purpose: 'npc_profile_generation',
  });
}

/**
 * Generate an image with explicit character reference (img2img).
 * Use this when you have a specific reference image to maintain consistency.
 *
 * @param prompt - The image description
 * @param referenceImageUrls - Reference images for character consistency
 */
export async function generateImageWithCharacterReference(
  prompt: string,
  referenceImageUrls: string[]
): Promise<{ imageUrl: string; promptUsed: string }> {
  const provider = getActiveImageGenProvider();

  if (!provider) {
    throw new Error('No active image generation provider configured');
  }

  // Check if provider supports reference images
  if (!provider.reference_images_key) {
    // Fall back to vision proxy + text description
    console.log('[Image Gen] Provider does not support reference images, using vision proxy fallback');

    const { analyzeImage } = await import('./vision-proxy.js');

    const characterDescription = await analyzeImage(
      referenceImageUrls[0],
      'Describe this person\'s appearance in detail for image generation: age, gender, hair, clothing style, distinctive features.'
    );

    const enhancedPrompt = `${prompt}. The main character looks like: ${characterDescription}`;

    return await generateImage(enhancedPrompt, undefined, {
      purpose: 'character_reference_fallback',
    });
  }

  // Provider supports reference images
  return await generateImage(prompt, referenceImageUrls, {
    purpose: 'character_reference',
  });
}

export default {
  generateImage,
  generateImageForNPC,
  generateNPCProfilePortrait,
  generateImageWithCharacterReference,
};
