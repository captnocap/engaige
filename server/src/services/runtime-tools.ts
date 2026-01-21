// Runtime tools that AI models can call during conversations
// These are exposed as function calls to the model (OpenAI/Anthropic tool use)

import { generateImageForNPC } from './image-generation-proxy.js';
import { storeMediaFileFromUrl } from './media.js';
import type { ToolDefinition, ToolHandler, ToolResult } from '../types/tools.js';

// Tool: Generate image during conversation
const generateImageTool: ToolDefinition = {
  name: 'generate_image',
  description: 'Generate an image based on a text prompt. Use this when you want to create or share a visual image with the user. Your reference image will automatically be included for consistency.',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Detailed description of the image to generate. Be specific and descriptive.',
      },
      style: {
        type: 'string',
        enum: ['realistic', 'artistic', 'anime', 'sketch', 'cinematic'],
        description: 'Art style for the image',
      },
    },
    required: ['prompt'],
  },
};

const generateImageHandler: ToolHandler = async (args: any, context: any) => {
  const { prompt, style = 'realistic' } = args;
  const { npc_id, conversation_id } = context;

  console.log(`[Runtime Tool] generate_image called by NPC ${npc_id}`);
  console.log(`  Prompt: ${prompt}`);
  console.log(`  Style: ${style}`);

  try {
    // Build enhanced prompt with style hint
    // Note: The actual image settings (resolution, model, etc.) are baked into the provider config
    let enhancedPrompt = prompt;
    if (style === 'realistic') {
      enhancedPrompt = `${prompt}, photorealistic, high quality, detailed`;
    } else if (style === 'artistic') {
      enhancedPrompt = `${prompt}, artistic painting, expressive, beautiful composition`;
    } else if (style === 'anime') {
      enhancedPrompt = `${prompt}, anime style, vibrant colors, clean lines`;
    } else if (style === 'sketch') {
      enhancedPrompt = `${prompt}, pencil sketch, hand-drawn, artistic`;
    } else if (style === 'cinematic') {
      enhancedPrompt = `${prompt}, cinematic lighting, dramatic, movie still`;
    }

    // Generate image for NPC (automatically includes their reference image if available)
    const { imageUrl, promptUsed } = await generateImageForNPC(npc_id, enhancedPrompt, 'conversation');

    // Store in media files
    const mediaFile = await storeMediaFileFromUrl(imageUrl, {
      filename: `generated_${Date.now()}.jpg`,
      owner_type: 'npc',
      owner_id: npc_id,
      category: 'generated',
      npc_id: npc_id,
      conversation_id: conversation_id,
      generated_prompt: promptUsed,
      description: prompt,
    });

    console.log(`[Runtime Tool] Image generated and saved: ${mediaFile.file_url}`);

    return {
      success: true,
      image_url: mediaFile.file_url,
      media_file_id: mediaFile.id,
      message: `Image generated successfully. You can reference it in your response.`,
    };
  } catch (error: any) {
    console.error('[Runtime Tool] Image generation failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Sorry, I had trouble generating that image. Let me try describing it instead.',
    };
  }
};

// Tool: Search memories
const searchMemoriesTool: ToolDefinition = {
  name: 'search_memories',
  description: 'Search your memories about the user or past conversations. Use this to recall previous interactions.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'What to search for in memories (e.g., "coffee preferences", "birthday", "favorite movies")',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of memories to return',
        default: 5,
      },
    },
    required: ['query'],
  },
};

const searchMemoriesHandler: ToolHandler = async (args: any, context: any) => {
  const { query, limit = 5 } = args;
  const { npc_id, player_id } = context;

  console.log(`[Runtime Tool] search_memories called by NPC ${npc_id} for player ${player_id}`);
  console.log(`  Query: ${query}`);

  try {
    const { getDB } = await import('../db/index.js');
    const gameDb = getDB('game');

    // Simple text search in memories (can be enhanced with embeddings later)
    const memories = gameDb.prepare(`
      SELECT * FROM memories
      WHERE npc_id = ?
      AND (content LIKE ? OR content LIKE ?)
      ORDER BY importance DESC, created_at DESC
      LIMIT ?
    `).all(npc_id, `%${query}%`, `%${query.toLowerCase()}%`, limit) as any[];

    if (memories.length === 0) {
      return {
        success: true,
        memories: [],
        message: `No memories found about "${query}"`,
      };
    }

    return {
      success: true,
      memories: memories.map(m => ({
        content: m.content,
        importance: m.importance,
        created_at: m.created_at,
      })),
      message: `Found ${memories.length} memory/memories about "${query}"`,
    };
  } catch (error: any) {
    console.error('[Runtime Tool] Memory search failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Sorry, I had trouble searching my memories.',
    };
  }
};

// Tool: Check relationship status
const checkRelationshipTool: ToolDefinition = {
  name: 'check_relationship',
  description: 'Check your current relationship status with the user (trust, affinity, stage).',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

const checkRelationshipHandler: ToolHandler = async (args: any, context: any) => {
  const { npc_id, player_id } = context;

  console.log(`[Runtime Tool] check_relationship called by NPC ${npc_id} for player ${player_id}`);

  try {
    const { getDB } = await import('../db/index.js');
    const gameDb = getDB('game');

    const relationship = gameDb.prepare(`
      SELECT * FROM player_npc_relationships
      WHERE player_id = ? AND npc_id = ?
    `).get(player_id, npc_id) as any;

    if (!relationship) {
      return {
        success: true,
        relationship: {
          stage: 'stranger',
          trust: 0,
          affinity: 0,
          familiarity: 0,
        },
        message: 'You are strangers (no previous interactions)',
      };
    }

    return {
      success: true,
      relationship: {
        stage: relationship.relationship_stage,
        trust: relationship.trust_level,
        affinity: relationship.affinity,
        familiarity: relationship.familiarity,
        last_interaction: relationship.last_interaction_at,
      },
      message: `Current stage: ${relationship.relationship_stage} (Trust: ${relationship.trust_level}, Affinity: ${relationship.affinity}, Familiarity: ${relationship.familiarity})`,
    };
  } catch (error: any) {
    console.error('[Runtime Tool] Relationship check failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Sorry, I had trouble checking our relationship status.',
    };
  }
};

// Registry of all tools
export const RUNTIME_TOOLS: Record<string, { definition: ToolDefinition; handler: ToolHandler }> = {
  generate_image: {
    definition: generateImageTool,
    handler: generateImageHandler,
  },
  search_memories: {
    definition: searchMemoriesTool,
    handler: searchMemoriesHandler,
  },
  check_relationship: {
    definition: checkRelationshipTool,
    handler: checkRelationshipHandler,
  },
};

// Get tool definitions for a specific provider
export function getToolDefinitions(provider: 'openai' | 'anthropic'): any[] {
  const tools = Object.values(RUNTIME_TOOLS).map(t => t.definition);

  if (provider === 'openai') {
    // OpenAI function calling format
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  } else if (provider === 'anthropic') {
    // Anthropic tool use format
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }

  return [];
}

// Execute a tool call
export async function executeToolCall(
  toolName: string,
  args: any,
  context: {
    npc_id: string;
    player_id?: string;
    conversation_id?: string;
  }
): Promise<ToolResult> {
  const tool = RUNTIME_TOOLS[toolName];

  if (!tool) {
    return {
      success: false,
      error: `Unknown tool: ${toolName}`,
      message: 'Sorry, I tried to use a tool that doesn\'t exist.',
    };
  }

  try {
    const result = await tool.handler(args, context);
    return result;
  } catch (error: any) {
    console.error(`[Runtime Tool] Tool execution failed (${toolName}):`, error);
    return {
      success: false,
      error: error.message,
      message: 'Sorry, something went wrong with that action.',
    };
  }
}

export default {
  RUNTIME_TOOLS,
  getToolDefinitions,
  executeToolCall,
};
