# Runtime Tools System

## Overview

Runtime tools are functions that AI models can call directly during conversations. This allows NPCs to perform actions like generating images, searching memories, or checking relationship status while responding to the player.

## Architecture

### Tool Definition
- Tools are defined in `server/src/services/runtime-tools.ts`
- Each tool has a definition (schema) and a handler (implementation)
- Tool definitions follow OpenAI/Anthropic function calling format

### Tool Execution Flow

```
User Message
    ↓
AI Model (with tools enabled)
    ↓
Model requests tool call (e.g., generate_image)
    ↓
executeToolCall() runs the tool handler
    ↓
Tool result returned to model
    ↓
Model generates final response incorporating tool result
    ↓
Response sent to user
```

## Available Tools

### 1. generate_image
Allows NPCs to generate images during conversations.

**Parameters:**
- `prompt` (string, required): Description of image to generate
- `style` (string, optional): Art style (realistic, artistic, anime, sketch, cinematic)
- `use_character_reference` (boolean, optional): Use NPC's reference image for consistency

**Example:**
```
User: "Can you draw a sunset over the ocean?"
NPC (calls tool): generate_image({ prompt: "Beautiful sunset over calm ocean", style: "artistic" })
NPC: "Here's the sunset I painted! *shares image*"
```

### 2. search_memories
Search the NPC's memories about the user or past conversations.

**Parameters:**
- `query` (string, required): What to search for
- `limit` (number, optional): Max memories to return (default: 5)

**Example:**
```
User: "Do you remember my birthday?"
NPC (calls tool): search_memories({ query: "birthday" })
NPC: "Of course! Your birthday is on [date from memory]."
```

### 3. check_relationship
Check current relationship status with the user.

**Parameters:** None

**Returns:**
- `stage`: Current relationship stage (stranger, acquaintance, friend, etc.)
- `trust`: Trust level (0-100)
- `affinity`: Affinity level (0-100)
- `familiarity`: Familiarity level (0-100)

**Example:**
```
User: "How do you feel about our friendship?"
NPC (calls tool): check_relationship()
NPC: "We've become really close! I'd say we're great friends now."
```

## Enabling Tools in Conversations

Tools are **enabled by default** in `generateNPCResponse()`. To disable:

```typescript
await generateNPCResponse(
  npcId,
  message,
  conversationHistory,
  {
    enable_tools: false // Disable tools
  }
);
```

## Adding New Tools

1. Define the tool in `runtime-tools.ts`:

```typescript
const myNewTool: ToolDefinition = {
  name: 'my_new_tool',
  description: 'What this tool does',
  parameters: {
    type: 'object',
    properties: {
      my_param: {
        type: 'string',
        description: 'Parameter description',
      },
    },
    required: ['my_param'],
  },
};

const myNewToolHandler: ToolHandler = async (args, context) => {
  const { my_param } = args;
  const { npc_id, player_id } = context;

  // Implement tool logic here

  return {
    success: true,
    message: 'Result message',
    // ... additional result data
  };
};
```

2. Register in `RUNTIME_TOOLS`:

```typescript
export const RUNTIME_TOOLS = {
  // ... existing tools
  my_new_tool: {
    definition: myNewTool,
    handler: myNewToolHandler,
  },
};
```

## Budget Tracking

All runtime tools automatically track budget usage:
- Image generation uses the `image_generation` budget category
- Memory/relationship tools are lightweight and don't consume significant budget
- Budget checks happen before execution - tools are not called if budget is exceeded

## Provider Compatibility

### OpenAI / OpenAI-Compatible
- Uses `tools` parameter with function calling format
- Supports multiple tool calls in single response
- Automatic follow-up request with tool results

### Anthropic
- Uses `tools` parameter with Anthropic format
- Supports tool use blocks
- Automatic follow-up request with tool results

### Local Models
- Compatibility depends on model's function calling support
- Models without function calling will not use tools
- Gracefully degrades to text-only responses

## Tool Call Examples

### Example 1: Image Generation During Conversation

```
User: "Show me your artwork"

NPC thinks: I should generate an image of my art style
Tool call: generate_image({
  prompt: "Abstract digital art with vibrant colors, geometric shapes, modern style",
  style: "artistic",
  use_character_reference: false
})

Tool result: {
  success: true,
  image_url: "http://localhost:3000/media/generated_123.jpg",
  media_file_id: "media_123"
}

NPC: "Here's one of my recent pieces! I've been experimenting with bold geometric patterns. What do you think?"
*[Image attached]*
```

### Example 2: Memory-Enhanced Response

```
User: "What was my favorite coffee order again?"

NPC thinks: Let me check my memories about their coffee preferences
Tool call: search_memories({
  query: "coffee favorite order",
  limit: 3
})

Tool result: {
  success: true,
  memories: [
    { content: "User loves caramel lattes with oat milk" },
    { content: "User doesn't like too much sugar in coffee" }
  ]
}

NPC: "You always get a caramel latte with oat milk, right? Not too sweet though!"
```

## Best Practices

1. **Tool Descriptions**: Write clear, concise descriptions that explain when to use each tool
2. **Parameter Validation**: Always validate parameters in handlers
3. **Error Handling**: Return graceful error messages that NPCs can incorporate into responses
4. **Budget Awareness**: Consider cost when designing tools that use AI APIs
5. **Contextual Use**: Tools should feel natural in conversation, not forced
6. **Result Format**: Return data in a format the AI can easily parse and use

## Files

- `server/src/services/runtime-tools.ts` - Tool definitions and handlers
- `server/src/types/tools.ts` - TypeScript types
- `server/src/services/ai.ts` - Integration with AI service

## Testing

Test tools by enabling them in conversations and checking:
- Tool calls appear in model requests
- Handlers execute correctly
- Results are incorporated into responses
- Budget is tracked appropriately
- Errors are handled gracefully
