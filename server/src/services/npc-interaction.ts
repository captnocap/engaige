// High-level NPC interaction service that handles vision/image proxying

import { generateNPCResponse } from './ai.js';
import { analyzeImageForNPC } from './vision-proxy.js';
import { generateImageForNPC } from './image-generation-proxy.js';
import { supportsVision, supportsImageGeneration } from './model-capabilities.js';
import { getDB } from '../db/index.js';

// Send a message to an NPC (potentially with an image)
export async function sendMessageToNPC(
  npcId: string,
  message: string,
  options?: {
    imageUrl?: string;
    platform?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<string> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  const npcModelName = npc.model_name || 'unknown';
  const npcSupportsVision = supportsVision(npcModelName);

  let finalMessage = message;
  let conversationContext = options?.conversationHistory || [];
  let imageUrls: string[] | undefined;

  // Handle image if provided
  if (options?.imageUrl) {
    if (npcSupportsVision) {
      // NPC's model can see images directly - pass the image URL
      console.log(`[NPC ${npc.display_name}] Using native vision support for image`);
      imageUrls = [options.imageUrl];

      // Prepend a note so the NPC knows an image was shared
      if (message) {
        finalMessage = `[User shared an image]\n${message}`;
      } else {
        finalMessage = '[User shared an image]';
      }
    } else {
      // NPC's model can't see images - use vision proxy
      console.log(`[NPC ${npc.display_name}] Model doesn't support vision, using proxy`);

      const { imageDescription } = await analyzeImageForNPC(
        npcId,
        options.imageUrl,
        message
      );

      // Add the vision proxy description to the conversation context
      finalMessage = `[User shared an image. Vision analysis: ${imageDescription}]\n${message}`;
    }
  }

  // Generate NPC response
  const response = await generateNPCResponse(
    npcId,
    finalMessage,
    conversationContext,
    {
      platform: options?.platform,
      feature_category: 'conversation',
      imageUrls, // Pass images for vision-capable models
    }
  );

  return response;
}

// Request an NPC to generate an image
export async function requestNPCImage(
  npcId: string,
  userRequest: string,
  purpose?: 'profile_picture' | 'post_image' | 'custom'
): Promise<{ imageUrl: string; npcResponse: string }> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  const npcModelName = npc.model_name || 'unknown';
  const npcSupportsImageGen = supportsImageGeneration(npcModelName);

  if (npcSupportsImageGen) {
    // NPC's model can generate images directly (rare)
    console.log(`[NPC ${npc.display_name}] Using native image generation`);
    // This would be very rare - most text models don't generate images
    throw new Error('Direct image generation by NPC model not yet implemented');
  } else {
    // Use image generation proxy
    console.log(`[NPC ${npc.display_name}] Using image generation proxy`);

    // First, have the NPC create/refine the image prompt based on user request
    const promptRefinementResponse = await generateNPCResponse(
      npcId,
      `The user asked: "${userRequest}". Create a detailed image generation prompt that matches your aesthetic and personality. Just output the prompt, nothing else.`,
      [],
      {
        feature_category: 'conversation',
      }
    );

    // Use the NPC's refined prompt to generate the image
    const { imageUrl, revisedPrompt } = await generateImageForNPC(
      npcId,
      promptRefinementResponse,
      purpose
    );

    // Have the NPC respond to the user about the generated image
    const npcResponse = await generateNPCResponse(
      npcId,
      `You just generated an image based on: "${userRequest}". The image prompt was: "${revisedPrompt || promptRefinementResponse}". Tell the user about the image you created.`,
      [],
      {
        feature_category: 'conversation',
      }
    );

    return {
      imageUrl,
      npcResponse,
    };
  }
}

// Check if an NPC can handle images (either natively or via proxy)
export function canNPCHandleImages(npcId: string): {
  canReceiveImages: boolean;
  canGenerateImages: boolean;
  usesVisionProxy: boolean;
  usesImageGenProxy: boolean;
} {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  const npcModelName = npc.model_name || 'unknown';
  const nativeVision = supportsVision(npcModelName);
  const nativeImageGen = supportsImageGeneration(npcModelName);

  return {
    canReceiveImages: true, // Always true because of vision proxy
    canGenerateImages: true, // Always true because of image gen proxy
    usesVisionProxy: !nativeVision,
    usesImageGenProxy: !nativeImageGen,
  };
}

export default {
  sendMessageToNPC,
  requestNPCImage,
  canNPCHandleImages,
};
