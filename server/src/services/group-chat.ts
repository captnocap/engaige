// Group chat system with parallel NPC response generation

import { getDB, generateId, now } from '../db/index.js';
import { generateNPCResponse } from './ai.js';
import { getConversationMessages } from './conversation.js';

export interface GroupChatParticipant {
  id: string;
  participant_id: string;
  participant_type: 'player' | 'npc';
  participant_name: string;
  joined_at: number;
}

export interface GroupChat {
  id: string;
  group_name: string;
  platform: string;
  participant_ids: string[];
  created_at: number;
  last_message_at: number;
}

// Create a group chat
export function createGroupChat(
  groupName: string,
  participantIds: Array<{ id: string; type: 'player' | 'npc'; name: string }>,
  platform: string = 'groupchat'
): GroupChat {
  const db = getDB('game');
  const conversationId = generateId();

  // Create conversation
  db.prepare(`
    INSERT INTO conversations (
      id, conversation_type, platform, group_name,
      participant_ids, created_at, last_message_at
    ) VALUES (?, 'group_chat', ?, ?, ?, ?, ?)
  `).run(
    conversationId,
    platform,
    groupName,
    JSON.stringify(participantIds.map(p => p.id)),
    now(),
    now()
  );

  // Add participants
  for (const participant of participantIds) {
    db.prepare(`
      INSERT INTO group_chat_participants (
        id, conversation_id, participant_id, participant_type, participant_name, joined_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      conversationId,
      participant.id,
      participant.type,
      participant.name,
      now()
    );
  }

  return {
    id: conversationId,
    group_name: groupName,
    platform,
    participant_ids: participantIds.map(p => p.id),
    created_at: now(),
    last_message_at: now(),
  };
}

// Get group chat participants
export function getGroupChatParticipants(conversationId: string): GroupChatParticipant[] {
  const db = getDB('game');

  return db.prepare(`
    SELECT * FROM group_chat_participants WHERE conversation_id = ?
  `).all(conversationId) as any[];
}

// Build system prompt for NPC in group chat
export function buildGroupChatSystemPrompt(
  npc: any,
  otherParticipants: GroupChatParticipant[]
): string {
  const others = otherParticipants
    .filter(p => p.participant_id !== npc.id)
    .map(p => `- ${p.participant_name}`)
    .join('\n');

  return `
You are ${npc.display_name} in a group chat.

## Your Identity
${npc.system_prompt || ''}

## Other Participants
${others}

## Group Chat Guidelines
- You are in a group conversation with multiple people
- Pay attention to who says what - names are prefixed to messages
- Respond naturally to the conversation flow
- You can address specific people or respond to the group
- Don't always respond - only when you have something to add
- Keep responses conversational and relatively concise
- Use @mentions when addressing someone specific (e.g., "@Alex")

## Deciding When to Respond
You should respond if:
- Someone asks you a question directly or mentions you by name
- The topic strongly matches your interests
- You have something valuable or funny to add
- The conversation is dying and you want to keep it going

You can skip responding if:
- Others are having a deep one-on-one conversation
- The topic doesn't interest you much
- You just responded recently
- Someone else is already answering the question

IMPORTANT: If you don't want to respond right now, output exactly: [SKIP]
`.trim();
}

// Build conversation context for group chat
export async function buildGroupChatContext(
  conversationId: string,
  npcId: string,
  limit: number = 30
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages = getConversationMessages(conversationId, limit);

  // In group chats, prefix each message with speaker name
  // The current NPC's messages are 'assistant', everyone else is 'user'
  return messages.map((m: any) => {
    const isThisNPC = m.sender_id === npcId && m.sender_type === 'npc';

    return {
      role: isThisNPC ? ('assistant' as const) : ('user' as const),
      content: isThisNPC ? m.content : `${m.sender_name}: ${m.content}`,
    };
  });
}

// Decide if an NPC wants to respond to a message
export async function decideIfNPCResponds(
  npcId: string,
  conversationId: string,
  triggerMessage: any
): Promise<{
  npc_id: string;
  will_respond: boolean;
  response_delay: number;
}> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    return { npc_id: npcId, will_respond: false, response_delay: 0 };
  }

  // Get personality
  const personalityTraits = JSON.parse(npc.personality_traits || '{}');
  const messagePatterns = personalityTraits.message_patterns || {};
  const topicInterests = personalityTraits.topic_interests || {};

  // Build context
  const context = await buildGroupChatContext(conversationId, npcId, 15);

  // Build decision prompt
  const participants = getGroupChatParticipants(conversationId);
  const systemPrompt = buildGroupChatSystemPrompt(npc, participants);

  // Quick decision request
  const decisionPrompt = `${triggerMessage.sender_name} just said: "${triggerMessage.content}"\n\nDo you want to respond? Answer YES or NO.`;

  try {
    const decision = await generateNPCResponse(
      npcId,
      decisionPrompt,
      context.slice(0, -1), // Don't include the trigger message twice
      {
        feature_category: 'conversation',
        enable_tools: false,
      }
    );

    const willRespond = decision.toLowerCase().includes('yes') || decision.toLowerCase().includes('[skip]') === false;

    // Calculate realistic response delay
    const baseDelay = messagePatterns.average_response_delay_seconds || 2;
    const typingSpeed = messagePatterns.typing_speed || 40; // chars/sec
    const estimatedLength = 50 + Math.random() * 100; // Rough estimate
    const typingTime = estimatedLength / typingSpeed;
    const jitter = Math.random() * 2; // Random delay 0-2s

    const responseDelay = baseDelay + typingTime + jitter;

    return {
      npc_id: npcId,
      will_respond: willRespond,
      response_delay: responseDelay,
    };
  } catch (error) {
    console.error(`[Group Chat] Failed to get response decision from ${npc.display_name}:`, error);
    return { npc_id: npcId, will_respond: false, response_delay: 0 };
  }
}

// Generate group chat response with delay
export async function generateGroupChatResponse(
  npcId: string,
  conversationId: string,
  delay: number = 0
): Promise<{
  npc_id: string;
  content: string;
  delay: number;
}> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Build full context
  const context = await buildGroupChatContext(conversationId, npcId, 20);
  const participants = getGroupChatParticipants(conversationId);
  const systemPrompt = buildGroupChatSystemPrompt(npc, participants);

  // Get last message as prompt
  const lastMessage = context[context.length - 1];

  // Generate response
  const response = await generateNPCResponse(
    npcId,
    lastMessage.content,
    context.slice(0, -1),
    {
      platform: 'groupchat',
      feature_category: 'conversation',
      conversation_id: conversationId,
    }
  );

  // Check if NPC decided to skip
  if (response.includes('[SKIP]')) {
    return {
      npc_id: npcId,
      content: '',
      delay: 0,
    };
  }

  return {
    npc_id: npcId,
    content: response.trim(),
    delay: delay,
  };
}

// Handle new message in group chat (trigger NPC responses)
export async function handleGroupChatMessage(
  conversationId: string,
  newMessage: any
): Promise<void> {
  const gameDb = getDB('game');

  // Get all NPC participants
  const participants = getGroupChatParticipants(conversationId);
  const npcParticipants = participants.filter(p => p.participant_type === 'npc');

  if (npcParticipants.length === 0) {
    return; // No NPCs to respond
  }

  console.log(`[Group Chat] Message from ${newMessage.sender_name}, checking ${npcParticipants.length} NPCs`);

  // Determine which NPCs will respond (in parallel)
  const responseDecisions = await Promise.all(
    npcParticipants.map(p =>
      decideIfNPCResponds(p.participant_id, conversationId, newMessage)
    )
  );

  // Filter to only NPCs that want to respond
  const respondingNPCs = responseDecisions.filter(d => d.will_respond);

  console.log(`[Group Chat] ${respondingNPCs.length} NPC(s) will respond`);

  if (respondingNPCs.length === 0) {
    return;
  }

  // TODO: Show typing indicators for responding NPCs
  // (This would be handled by the frontend/real-time system)

  // Generate responses in parallel
  const responses = await Promise.all(
    respondingNPCs.map(npc =>
      generateGroupChatResponse(npc.npc_id, conversationId, npc.response_delay)
    )
  );

  // Filter out skipped responses
  const actualResponses = responses.filter(r => r.content.length > 0);

  // Sort by delay to send in realistic order
  actualResponses.sort((a, b) => a.delay - b.delay);

  // Send responses with delays
  for (const response of actualResponses) {
    // Simulate delay (in real system, this would be async job scheduling)
    await new Promise(resolve => setTimeout(resolve, response.delay * 1000));

    // Get NPC name
    const npc = npcParticipants.find(p => p.participant_id === response.npc_id);

    if (npc) {
      // Insert message
      gameDb.prepare(`
        INSERT INTO messages (
          id, conversation_id, sender_id, sender_type, sender_name, content, timestamp
        ) VALUES (?, ?, ?, 'npc', ?, ?, ?)
      `).run(
        generateId(),
        conversationId,
        response.npc_id,
        npc.participant_name,
        response.content,
        now()
      );

      console.log(`[Group Chat] ${npc.participant_name}: ${response.content.slice(0, 50)}...`);
    }
  }

  // Update last message timestamp
  gameDb.prepare(`
    UPDATE conversations SET last_message_at = ? WHERE id = ?
  `).run(now(), conversationId);
}

export default {
  createGroupChat,
  getGroupChatParticipants,
  buildGroupChatSystemPrompt,
  buildGroupChatContext,
  decideIfNPCResponds,
  generateGroupChatResponse,
  handleGroupChatMessage,
};
