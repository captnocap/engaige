/**
 * Studio (Creative Studio) Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleStudioGenerateImage(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const payload = message.payload as {
    prompt: string;
    style?: string;
    mood?: string;
    referenceImageIds?: string[];
  };

  if (!payload?.prompt) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing prompt'));
    return;
  }

  try {
    const { generateImage } = await import('../../services/image-generation-proxy.js');
    const { storeMediaFileFromUrl, getMediaFileById } = await import('../../services/media.js');
    const { generateId } = await import('../../db/index.js');

    // Build enhanced prompt with style and mood
    let enhancedPrompt = payload.prompt;
    if (payload.style) {
      enhancedPrompt = `${payload.style} style: ${enhancedPrompt}`;
    }
    if (payload.mood) {
      enhancedPrompt = `${enhancedPrompt}, ${payload.mood} mood`;
    }

    // Resolve reference images if provided
    let referenceImages: string[] | undefined;
    if (payload.referenceImageIds && payload.referenceImageIds.length > 0) {
      referenceImages = [];
      for (const id of payload.referenceImageIds) {
        const file = getMediaFileById(id);
        if (file) {
          referenceImages.push(file.file_url);
        }
      }
    }

    // Generate the image
    const result = await generateImage(enhancedPrompt, referenceImages, {
      purpose: 'studio_generation',
    });

    // Store the generated image as a media file
    const mediaFile = await storeMediaFileFromUrl(result.imageUrl, {
      filename: `studio_${generateId()}.png`,
      owner_type: 'player',
      category: 'generated',
      generated_prompt: result.promptUsed,
      description: `Generated via Creative Studio: ${payload.prompt.slice(0, 100)}`,
    });

    ctx.send(ws, createResponse(message.id, true, {
      mediaFile,
      promptUsed: result.promptUsed,
    }));
  } catch (err: any) {
    ctx.send(ws, createResponse(message.id, false, null, err.message || 'Image generation failed'));
  }
}

async function handleStudioGetBudget(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getBudgetStatus } = await import('../../services/budget.js');

  try {
    const status = getBudgetStatus();
    const imageGenCategory = status.categories.find(c => c.name === 'image_generation');

    ctx.send(ws, createResponse(message.id, true, {
      spent: imageGenCategory?.spent_cents || 0,
      remaining: imageGenCategory?.remaining_cents || 0,
      costPerImage: 4, // Default cost per image in cents (can be made configurable)
      totalBudget: imageGenCategory?.allocated_cents || 0,
    }));
  } catch (err: any) {
    ctx.send(ws, createResponse(message.id, false, null, err.message || 'Failed to get budget'));
  }
}

async function handleStudioSaveVideoConfig(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const payload = message.payload as {
    config: Record<string, unknown>;
    intent?: Record<string, unknown>;
    generateThumbnail?: boolean;
  };

  if (!payload?.config) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing video config'));
    return;
  }

  try {
    const { storeMediaFile } = await import('../../services/media.js');
    const { generateId } = await import('../../db/index.js');

    // Store the video config as a JSON file (as a media item)
    const configBuffer = Buffer.from(JSON.stringify({
      config: payload.config,
      intent: payload.intent,
      createdAt: Date.now(),
    }, null, 2));

    const mediaFile = await storeMediaFile(
      {
        buffer: configBuffer,
        filename: `video_config_${generateId()}.json`,
        mimeType: 'application/json',
      },
      {
        owner_type: 'player',
        category: 'npc_config', // Using npc_config as it maps to configs dir
        description: 'Video configuration for Creative Studio',
      }
    );

    // TODO: If generateThumbnail is true, render a preview frame

    ctx.send(ws, createResponse(message.id, true, {
      mediaFileId: mediaFile.id,
      mediaFile,
    }));
  } catch (err: any) {
    ctx.send(ws, createResponse(message.id, false, null, err.message || 'Failed to save video config'));
  }
}

export const studioHandlers: HandlerMap = {
  'studio:generateImage': handleStudioGenerateImage,
  'studio:getBudget': handleStudioGetBudget,
  'studio:saveVideoConfig': handleStudioSaveVideoConfig,
};
