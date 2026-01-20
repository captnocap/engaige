// Type definitions for runtime tools

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolResult {
  success: boolean;
  error?: string;
  message?: string;
  [key: string]: any; // Allow additional result data
}

export type ToolHandler = (
  args: any,
  context: {
    npc_id: string;
    player_id?: string;
    conversation_id?: string;
  }
) => Promise<ToolResult>;
