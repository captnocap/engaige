import { getDB } from '../db/index.js';
import { checkBudgetAllows, logApiCost } from './budget.js';
import { parseOpenAIUsage, parseAnthropicUsage, calculateCost, estimateCost } from '../utils/cost-calculator.js';
import type { AIProvider } from './ai.js';
import { doorFetch } from '../network/door.js';

// Vision proxy configuration type
export interface VisionProxyConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

// In-memory cache of config (loaded from DB on first access)
let visionProxyConfig: VisionProxyConfig | null = null;

// Default config if nothing is set
const DEFAULT_CONFIG: VisionProxyConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: undefined,
  baseUrl: undefined,
};

// Load config from database
function loadConfigFromDB(): VisionProxyConfig {
  const db = getDB('user');
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('vision_proxy_config') as { value: string } | undefined;

  if (row) {
    try {
      return JSON.parse(row.value);
    } catch {
      console.warn('[Vision Proxy] Failed to parse stored config, using defaults');
    }
  }

  return { ...DEFAULT_CONFIG };
}

// Save config to database
function saveConfigToDB(config: VisionProxyConfig): void {
  const db = getDB('user');
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(
    'vision_proxy_config',
    JSON.stringify(config)
  );
}

// Get or load config
function getConfig(): VisionProxyConfig {
  if (!visionProxyConfig) {
    visionProxyConfig = loadConfigFromDB();
  }
  return visionProxyConfig;
}

// Configure the vision proxy (persists to database)
export function configureVisionProxy(config: Partial<VisionProxyConfig>): void {
  const currentConfig = getConfig();
  visionProxyConfig = { ...currentConfig, ...config };
  saveConfigToDB(visionProxyConfig);
  console.log(`[Vision Proxy] Configured: ${visionProxyConfig.provider}/${visionProxyConfig.model}`);
}

// Get current vision proxy config
export function getVisionProxyConfig(): VisionProxyConfig {
  return { ...getConfig() };
}

// Analyze an image using the vision proxy
export async function analyzeImage(
  imageUrl: string,
  prompt?: string,
  context?: { npcName?: string; platform?: string }
): Promise<string> {
  const analysisPrompt = prompt || 'Describe this image in detail.';

  // Add context if provided
  let fullPrompt = analysisPrompt;
  if (context?.npcName) {
    fullPrompt = `You are helping ${context.npcName} understand this image. ${analysisPrompt}`;
  }
  if (context?.platform) {
    fullPrompt += ` Context: This image was shared on ${context.platform}.`;
  }

  const config = getConfig();

  // Estimate cost (vision is more expensive)
  const estimatedCostCents = estimateCost(fullPrompt.length, 300, config.model) * 2; // Vision costs more

  // Check budget (uses 'vision_proxy' category)
  const budgetCheck = checkBudgetAllows('vision_proxy', estimatedCostCents);
  if (!budgetCheck.allowed) {
    throw new Error(`Vision proxy budget exceeded: ${budgetCheck.reason}`);
  }

  let description: string;
  let usage: { input_tokens: number; output_tokens: number; total_tokens: number };

  switch (config.provider) {
    case 'openai':
    case 'openai-compatible':
      ({ description, usage } = await callOpenAIVision(imageUrl, fullPrompt, config));
      break;
    case 'anthropic':
      ({ description, usage } = await callAnthropicVision(imageUrl, fullPrompt, config));
      break;
    default:
      throw new Error(`Unknown vision proxy provider: ${config.provider}`);
  }

  // Calculate actual cost and log it
  const actualCostCents = calculateCost(usage, config.model);
  logApiCost({
    provider: config.provider,
    model: config.model,
    feature_category: 'vision_proxy',
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_cents: actualCostCents,
    request_metadata: { image_url: imageUrl, context },
  });

  return description;
}

// OpenAI Vision API
async function callOpenAIVision(
  imageUrl: string,
  prompt: string,
  config: VisionProxyConfig
): Promise<{ description: string; usage: any }> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const endpoint = `${baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await doorFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vision API error: ${error}`);
  }

  const data = await response.json();
  const usage = parseOpenAIUsage(data);

  return {
    description: data.choices[0].message.content,
    usage,
  };
}

// Anthropic Vision API
async function callAnthropicVision(
  imageUrl: string,
  prompt: string,
  config: VisionProxyConfig
): Promise<{ description: string; usage: any }> {
  if (!config.apiKey) {
    throw new Error('Anthropic API key required for vision proxy');
  }

  // Fetch image and convert to base64
  const imageResponse = await doorFetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');

  // Determine media type from URL
  const mediaType = imageUrl.endsWith('.png')
    ? 'image/png'
    : imageUrl.endsWith('.webp')
    ? 'image/webp'
    : imageUrl.endsWith('.gif')
    ? 'image/gif'
    : 'image/jpeg';

  const response = await doorFetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic Vision API error: ${error}`);
  }

  const data = await response.json();
  const usage = parseAnthropicUsage(data);

  return {
    description: data.content[0].text,
    usage,
  };
}

// Analyze image and then have NPC respond to it
export async function analyzeImageForNPC(
  npcId: string,
  imageUrl: string,
  userMessage?: string
): Promise<{ imageDescription: string; npcCanRespondDirectly: boolean }> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Check if NPC's model supports vision natively
  const { supportsVision } = await import('./model-capabilities.js');
  const npcModelSupportsVision = supportsVision(npc.model_name || 'unknown');

  if (npcModelSupportsVision) {
    // NPC can see the image directly, no proxy needed
    return {
      imageDescription: '',
      npcCanRespondDirectly: true,
    };
  }

  // NPC's model doesn't support vision, use proxy
  const context = {
    npcName: npc.display_name,
    platform: 'chat',
  };

  const analysisPrompt = userMessage
    ? `The user sent this image with the message: "${userMessage}". Describe what you see in this image.`
    : 'Describe this image in detail so I can respond appropriately.';

  const imageDescription = await analyzeImage(imageUrl, analysisPrompt, context);

  return {
    imageDescription,
    npcCanRespondDirectly: false,
  };
}

export default {
  configureVisionProxy,
  getVisionProxyConfig,
  analyzeImage,
  analyzeImageForNPC,
};
