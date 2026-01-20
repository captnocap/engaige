import { getDB } from '../db/index.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import type { AIProvider } from './ai.js';

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

// Generate an image using the configured proxy
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {},
  context?: { npcId?: string; npcName?: string; purpose?: string }
): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const {
    size = '1024x1024',
    quality = 'standard',
    style = 'vivid',
    n = 1,
  } = options;

  // Calculate cost
  const costKey = imageGenProxyConfig.model === 'dall-e-3'
    ? `${size}_${quality}`
    : imageGenProxyConfig.model === 'dall-e-2'
    ? size
    : 'default';

  const costPerImage = IMAGE_GENERATION_COSTS[imageGenProxyConfig.model]?.[costKey] || 5; // Default $0.05
  const totalCostCents = costPerImage * n;

  // Check budget
  const budgetCheck = checkBudgetAllows('image_generation', totalCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Image generation budget exceeded: ${budgetCheck.reason}`);
  }

  let imageUrl: string;
  let revisedPrompt: string | undefined;

  switch (imageGenProxyConfig.provider) {
    case 'openai':
    case 'openai-compatible':
      ({ imageUrl, revisedPrompt } = await callOpenAIImageGen(prompt, options));
      break;
    case 'stability-ai':
      ({ imageUrl } = await callStabilityAI(prompt, options));
      break;
    default:
      throw new Error(`Unknown image generation provider: ${imageGenProxyConfig.provider}`);
  }

  // Log the cost
  logApiCost({
    provider: imageGenProxyConfig.provider,
    model: imageGenProxyConfig.model,
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

  return { imageUrl, revisedPrompt };
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
  // This would use Stable Diffusion or similar that supports img2img
  // For DALL-E 3, we'd need to incorporate the reference into the prompt more explicitly

  if (imageGenProxyConfig.model.includes('dall-e')) {
    // DALL-E doesn't support img2img directly, so we describe the character
    // This is where you'd use vision proxy to describe the reference image
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

  // For Stability AI or other providers with img2img support
  // Implementation would vary by provider
  throw new Error('img2img with reference not yet implemented for this provider');
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
