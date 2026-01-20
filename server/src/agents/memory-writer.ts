// Background agent: Automatically generates meaningful memories from conversations

import { getDB, generateId, now } from '../db/index.js';
import { registerTaskHandler, scheduleTask, type BackgroundTask } from '../services/background-scheduler.js';
import { generateNPCResponse } from '../services/ai.js';
import { getConversationMessages } from '../services/conversation.js';

// Memory importance calculation
function calculateMemoryImportance(context: {
  messageCount: number;
  hasImage: boolean;
  isPersonal: boolean;
  isEmotional: boolean;
}): number {
  let importance = 0.3; // Base

  // More messages = more significant
  if (context.messageCount > 5) importance += 0.1;
  if (context.messageCount > 10) importance += 0.1;

  // Images are memorable
  if (context.hasImage) importance += 0.2;

  // Personal topics are more important
  if (context.isPersonal) importance += 0.2;

  // Emotional moments stick
  if (context.isEmotional) importance += 0.2;

  return Math.min(1.0, importance);
}

// Memory writing agent
async function handleGenerateMemory(task: BackgroundTask): Promise<void> {
  const { npc_id, conversation_id, recent_messages } = task.metadata || {};

  if (!npc_id) {
    throw new Error('Memory task missing npc_id');
  }

  const gameDb = getDB('game');
  const npcDb = getDB('npc');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npc_id) as any;
  if (!npc) {
    throw new Error(`NPC not found: ${npc_id}`);
  }

  // Get recent conversation context
  let messages: any[];
  if (conversation_id) {
    messages = getConversationMessages(conversation_id, 10);
  } else if (recent_messages) {
    messages = recent_messages;
  } else {
    // Get most recent messages for this NPC
    messages = gameDb.prepare(`
      SELECT m.* FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.npc_id = ?
      ORDER BY m.timestamp DESC
      LIMIT 10
    `).all(npc_id) as any[];
  }

  if (messages.length === 0) {
    console.log(`[Memory Agent] No messages to process for NPC ${npc.display_name}`);
    return;
  }

  // Build context for memory extraction
  const conversationText = messages
    .map((m: any) => `${m.sender_type === 'player' ? 'User' : npc.display_name}: ${m.content}`)
    .join('\n');

  // Ask NPC to extract key memories from the conversation
  const memoryPrompt = `Based on this recent conversation, identify 1-3 key things you should remember. Be specific and personal.

Conversation:
${conversationText}

Format: List each memory on a new line starting with "- "
Example:
- User mentioned they love coffee
- User shared a photo of their dog
- User is planning a trip to Japan

Memories:`;

  const memoryResponse = await generateNPCResponse(
    npc_id,
    memoryPrompt,
    [],
    { feature_category: 'autonomous_posts' } // Use autonomous category for background tasks
  );

  // Parse memories from response
  const memoryLines = memoryResponse
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());

  // Analyze context for importance
  const hasImage = messages.some((m: any) => {
    const metadata = m.metadata ? JSON.parse(m.metadata) : {};
    return metadata.has_image;
  });

  const importance = calculateMemoryImportance({
    messageCount: messages.length,
    hasImage,
    isPersonal: conversationText.toLowerCase().includes('love') || conversationText.toLowerCase().includes('family'),
    isEmotional: conversationText.match(/[!]{2,}/) !== null,
  });

  // Store each memory
  for (const memoryContent of memoryLines) {
    if (memoryContent.length < 5) continue; // Skip empty/invalid

    const memoryId = generateId();
    gameDb.prepare(`
      INSERT INTO memories (id, npc_id, event_type, event_id, content, importance, created_at)
      VALUES (?, ?, 'conversation', ?, ?, ?, ?)
    `).run(memoryId, npc_id, conversation_id || null, memoryContent, importance, now());

    console.log(`[Memory Agent] Created memory for ${npc.display_name}: "${memoryContent.slice(0, 50)}..."`);
  }
}

// Schedule memory generation for a conversation
export function scheduleMemoryGeneration(
  npcId: string,
  conversationId: string,
  delaySeconds = 60
): BackgroundTask {
  return scheduleTask('generate_memory', {
    npc_id: npcId,
    priority: 6,
    delay_seconds: delaySeconds,
    metadata: { conversation_id: conversationId },
    budget_category: 'autonomous_posts',
  });
}

// Auto-schedule memory generation after conversations
export function enableAutoMemoryGeneration(): void {
  console.log('[Memory Agent] Auto memory generation enabled');
  // This would be called after each conversation in the conversation service
}

// Initialize memory writing agent
export function initializeMemoryAgent(): void {
  registerTaskHandler('generate_memory', handleGenerateMemory);
  console.log('[Memory Agent] Initialized');
}

export default {
  initializeMemoryAgent,
  scheduleMemoryGeneration,
  enableAutoMemoryGeneration,
};
