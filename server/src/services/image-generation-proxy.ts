import { getDB } from '../db/index.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import type { AIProvider } from './ai.js';
import {
  getActiveImageGenProvider,
  buildPayloadFromTemplate,
  extractFromResponse,
  estimateImageGenCost,
  type ImageGenProvider,
} from './image-gen-config.js';
import {
  prepareImageForAPI,
  getProviderCompressionSettings,
} from './image-compression.js';

// Image generation proxy configuration
let imageGenProxyConfig: {
  provider: 'openai' | 'openai-compatible' | 'stability-ai';
  model: string;
  apiKey?: string;
  baseUrl?: string;
} = {
  provider: 'openai',
  model: 'dall-e-3',
  apiKey: undefined,
  baseUrl: undefined,
};

// Configure the image generation proxy
export function configureImageGenProxy(config: Partial<typeof imageGenProxyConfig>): void {
  imageGenProxyConfig = { ...imageGenProxyConfig, ...config };
  console.log(`[Image Gen Proxy] Configured: ${imageGenProxyConfig.provider}/${imageGenProxyConfig.model}`);
}

// Get current image generation proxy config
export function getImageGenProxyConfig(): typeof imageGenProxyConfig {
  return { ...imageGenProxyConfig };
}

// Image generation options
export interface ImageGenerationOptions {
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number; // Number of images (1-4)
  referenceImageUrl?: string; // For img2img workflows (character consistency)
  referenceStrength?: number; // 0-1, how much to follow reference (0.3-0.7 typical)
}

// Fixed costs for image generation (in cents)
const IMAGE_GENERATION_COSTS: Record<string, Record<string, number>> = {
  'dall-e-3': {
    '1024x1024_standard': 4, // $0.04
    '1024x1024_hd': 8, // $0.08
    '1792x1024_standard': 8, // $0.08
    '1792x1024_hd': 12, // $0.12
  },
  'dall-e-2': {
    '256x256': 1.6, // $0.016
    '512x512': 1.8, // $0.018
    '1024x1024': 2, // $0.02
  },
  'stable-diffusion-xl': {
    'default': 3, // $0.03 estimate
  },
};

// Generate an image using the configured proxy (with flexible provider support)
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {},
  context?: { npcId?: string; npcName?: string; purpose?: string }
): Promise<{ imageUrl: string; revisedPrompt?: string; promptUsed?: string }> {
  const {
    size = '1024x1024',
    quality = 'standard',
    style = 'vivid',
    n = 1,
  } = options;

  // Get active image generation provider from database
  const provider = getActiveImageGenProvider();

  if (!provider) {
    throw new Error('No active image generation provider configured. Please set one up in settings.');
  }

  console.log(`[Image Gen] Using provider: ${provider.display_name} (${provider.name})`);

  // Estimate cost
  const costPerImage = estimateImageGenCost(provider, { size, quality });
  const totalCostCents = costPerImage * n;

  // Check budget
  const budgetCheck = checkBudgetAllows('image_generation', totalCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Image generation budget exceeded: ${budgetCheck.reason}`);
  }

  // Prepare parameters for payload template
  const [width, height] = size.split('x').map(Number);
  const params: Record<string, any> = {
    prompt,
    size,
    width,
    height,
    quality,
    style,
    n,
    // Common parameters for Stable Diffusion
    cfg_scale: 7,
    steps: 30,
    sampler: 'euler_a',
    // Add more as needed
  };

  // Build request payload from template
  const payload = buildPayloadFromTemplate(provider.payload_template, params);

  console.log(`[Image Gen] Request payload:`, JSON.stringify(payload, null, 2));

  // Make API request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider.api_key) {
    // Support different auth header formats
    if (provider.base_url.includes('openai.com')) {
      headers['Authorization'] = `Bearer ${provider.api_key}`;
    } else if (provider.base_url.includes('stability.ai')) {
      headers['Authorization'] = `Bearer ${provider.api_key}`;
    } else {
      // Default to Bearer token
      headers['Authorization'] = `Bearer ${provider.api_key}`;
    }
  }

  const response = await fetch(provider.base_url, {
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

  // Extract revised prompt if available (DALL-E specific)
  const revisedPrompt = data.data?.[0]?.revised_prompt;

  // Log the cost
  logApiCost({
    provider: provider.name,
    model: provider.name,
    feature_category: 'image_generation',
    cost_cents: totalCostCents,
    request_metadata: {
      prompt: prompt.slice(0, 100),
      size,
      quality,
      style,
      n,
      context,
    },
  });

  console.log(`[Image Gen] Image generated successfully`);

  return { imageUrl, revisedPrompt, promptUsed: prompt };
}

// OpenAI DALL-E
async function callOpenAIImageGen(
  prompt: string,
  options: ImageGenerationOptions
): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const baseUrl = imageGenProxyConfig.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/images/generations`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (imageGenProxyConfig.apiKey) {
    headers['Authorization'] = `Bearer ${imageGenProxyConfig.apiKey}`;
  }

  const body: any = {
    model: imageGenProxyConfig.model,
    prompt,
    n: options.n || 1,
    size: options.size || '1024x1024',
  };

  // DALL-E 3 specific options
  if (imageGenProxyConfig.model === 'dall-e-3') {
    body.quality = options.quality || 'standard';
    body.style = options.style || 'vivid';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation API error: ${error}`);
  }

  const data = await response.json();

  return {
    imageUrl: data.data[0].url,
    revisedPrompt: data.data[0].revised_prompt,
  };
}

// Stability AI (Stable Diffusion)
async function callStabilityAI(
  prompt: string,
  options: ImageGenerationOptions
): Promise<{ imageUrl: string }> {
  if (!imageGenProxyConfig.apiKey) {
    throw new Error('Stability AI API key required');
  }

  // Stability AI uses different size format
  const width = parseInt(options.size?.split('x')[0] || '1024');
  const height = parseInt(options.size?.split('x')[1] || '1024');

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${imageGenProxyConfig.apiKey}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height,
      width,
      samples: options.n || 1,
      steps: 30,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability AI error: ${error}`);
  }

  const data = await response.json();

  // Stability AI returns base64, we'd need to save it somewhere
  // For now, return a data URL
  const base64Image = data.artifacts[0].base64;
  const imageUrl = `data:image/png;base64,${base64Image}`;

  return { imageUrl };
}

// Generate an image for an NPC (with their personality style)
export async function generateImageForNPC(
  npcId: string,
  userPrompt: string,
  purpose?: string
): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Enhance prompt with NPC's aesthetic/style
  const personality = npc.personality_traits ? JSON.parse(npc.personality_traits) : {};
  const aestheticStyle = personality.aesthetic_style || 'realistic';

  let enhancedPrompt = userPrompt;

  // Add style context
  if (purpose === 'profile_picture') {
    enhancedPrompt = `Portrait photo of a person: ${userPrompt}. Style: ${aestheticStyle}. Professional, high quality.`;
  } else if (purpose === 'post_image') {
    enhancedPrompt = `${userPrompt}. Style: ${aestheticStyle}, social media post aesthetic.`;
  } else {
    enhancedPrompt = `${userPrompt}. Style: ${aestheticStyle}.`;
  }

  return await generateImage(enhancedPrompt, {}, {
    npcId,
    npcName: npc.display_name,
    purpose,
  });
}

// Generate initial profile portrait for an NPC (during NPC creation)
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

  const { imageUrl, revisedPrompt } = await generateImage(
    prompt,
    {
      size: '1024x1024',
      quality: 'standard',
      style: 'natural', // Natural for portraits
    },
    {
      purpose: 'npc_profile_generation',
    }
  );

  return {
    imageUrl,
    promptUsed: revisedPrompt || prompt,
  };
}

// Generate an image with character reference (img2img flow)
export async function generateImageWithCharacterReference(
  prompt: string,
  characterReferenceUrl: string,
  options?: {
    referenceStrength?: number;
    includeMultipleCharacters?: boolean;
    additionalReferenceUrls?: string[]; // For scenes with user + NPC
  }
): Promise<{ imageUrl: string }> {
  const provider = getActiveImageGenProvider();
  if (!provider) {
    throw new Error('No active image generation provider configured');
  }

  // Check if provider supports img2img
  if (!provider.supports_img2img) {
    // Fall back to vision proxy + text description
    const { analyzeImage } = await import('./vision-proxy.js');

    const characterDescription = await analyzeImage(
      characterReferenceUrl,
      'Describe this person\'s appearance in detail for image generation: age, gender, hair, clothing style, distinctive features.'
    );

    const enhancedPrompt = `${prompt}. The main character looks like: ${characterDescription}`;

    return await generateImage(enhancedPrompt, {
      size: options?.includeMultipleCharacters ? '1792x1024' : '1024x1024',
    });
  }

  // Provider supports img2img - prepare reference image
  console.log('[Image Gen] Preparing reference image for img2img');

  // Compress and prepare reference image based on provider requirements
  const compressionSettings = getProviderCompressionSettings(provider.name);

  // Most img2img APIs expect base64
  const referenceImageData = await prepareImageForAPI(
    characterReferenceUrl,
    provider.name,
    'base64'
  );

  console.log('[Image Gen] Reference image prepared');

  // Build payload with img2img parameters
  const [width, height] = (options?.includeMultipleCharacters ? '1792x1024' : '1024x1024').split('x').map(Number);

  // Different providers have different img2img parameter names
  const params: Record<string, any> = {
    prompt,
    width,
    height,
    // Stable Diffusion img2img params
    init_image: referenceImageData,
    image: referenceImageData, // Alternative param name
    reference_image: referenceImageData, // Alternative param name
    denoising_strength: 1 - (options?.referenceStrength || 0.7), // Convert to denoising strength
    strength: options?.referenceStrength || 0.7, // Some providers use "strength"
    cfg_scale: 7,
    steps: 30,
  };

  const payload = buildPayloadFromTemplate(provider.payload_template, params);

  console.log('[Image Gen] Making img2img API request');

  // Make API request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider.api_key) {
    headers['Authorization'] = `Bearer ${provider.api_key}`;
  }

  const response = await fetch(provider.base_url.replace('/text-to-image', '/image-to-image'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`img2img API error: ${error}`);
  }

  const data = await response.json();
  const imageUrl = extractFromResponse(data, provider.response_path);

  // Log cost
  const costCents = estimateImageGenCost(provider, { size: `${width}x${height}` });
  logApiCost({
    provider: provider.name,
    model: provider.name,
    feature_category: 'image_generation',
    cost_cents: costCents,
    request_metadata: {
      prompt: prompt.slice(0, 100),
      has_reference: true,
      img2img: true,
    },
  });

  return { imageUrl };
}

// Update image generation costs (for user-configured pricing)
export function setImageGenerationCost(model: string, sizeOrKey: string, costCents: number): void {
  if (!IMAGE_GENERATION_COSTS[model]) {
    IMAGE_GENERATION_COSTS[model] = {};
  }
  IMAGE_GENERATION_COSTS[model][sizeOrKey] = costCents;
}

export default {
  configureImageGenProxy,
  getImageGenProxyConfig,
  generateImage,
  generateImageForNPC,
  generateNPCProfilePortrait,
  generateImageWithCharacterReference,
  setImageGenerationCost,
};
