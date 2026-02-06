/**
 * Conversation Initiator Agent
 *
 * Makes NPCs reach out to the player based on relationship, events, and vibes.
 * Handles 'initiate_conversation' and 'send_scheduled_message' tasks.
 *
 * The agent that makes NPCs feel like they actually want to talk to you.
 */

import { getDB, generateId, now } from '../db/index.js';
import { registerTaskHandler, scheduleTask, type BackgroundTask } from '../services/background-scheduler.js';
import { queuedGenerateNPCResponse, Priority } from '../services/ai.js';
import { getAllNPCs, getNPCById, type NPC } from '../services/npc.js';
import { getPlayerRelationship, getRelationshipStage } from '../services/relationships.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from '../services/error-logger.js';
import { broadcastToClients } from '../services/broadcast.js';

// ============================================================================
// Types
// ============================================================================

interface ConversationMetadata {
  trigger?: 'random' | 'relationship_milestone' | 'time_based' | 'event_reaction' | 'missed_you';
  topic?: string;
  urgency?: 'casual' | 'excited' | 'important';
  platform?: 'messages' | 'myface_chat' | 'instasnap_dm';
}

// Conversation starters based on relationship level
const CONVERSATION_PROMPTS: Record<string, string[]> = {
  stranger: [
    "Send a casual first message. Be friendly but not too forward. Maybe comment on something you noticed about them or ask a simple question.",
    "Reach out with a light icebreaker. Keep it low-pressure and easy to respond to.",
  ],
  acquaintance: [
    "Send a friendly message to someone you've talked to a few times. Reference something you might have in common.",
    "Check in casually. Maybe share something interesting that happened or ask what they're up to.",
  ],
  friend: [
    "Message your friend! Be natural and warm. You can joke around, share memes (describe them), or just chat.",
    "Reach out to catch up. Ask about their day, share something funny, or make plans.",
  ],
  close_friend: [
    "Message your close friend. You can be more personal, share real thoughts, or be silly together.",
    "Check in on your bestie. Be genuine - you actually care about how they're doing.",
  ],
  romantic_interest: [
    "Send a flirty but tasteful message. Show interest without being too intense.",
    "Reach out to your crush. Be charming, maybe a little nervous, definitely interested.",
  ],
  partner: [
    "Message your partner. Be sweet, check in, share your day, or just say something loving.",
    "Send a message to your significant other. Can be romantic, playful, or just comfortable.",
  ],
};

// Triggers that can spark a conversation
const TRIGGER_PROMPTS: Record<string, string> = {
  random: "You just felt like reaching out. No specific reason - just wanted to chat.",
  relationship_milestone: "You feel like your relationship with this person has grown. Acknowledge it subtly.",
  time_based: "It's been a while since you talked. You missed chatting with them.",
  event_reaction: "Something happened (in the news, in your life, on social media) and they came to mind.",
  missed_you: "You genuinely missed talking to this person. Let them know (in your own way).",
};

// ============================================================================
// Initiate Conversation Handler
// ============================================================================

async function handleInitiateConversation(task: BackgroundTask): Promise<void> {
  const { npc_id, player_id, metadata } = task;
  if (!npc_id) {
    throw new Error('initiate_conversation task requires npc_id');
  }

  const npc = getNPCById(npc_id);
  if (!npc) {
    throw new Error(`NPC not found: ${npc_id}`);
  }

  const convMetadata = (metadata || {}) as ConversationMetadata;
  const trigger = convMetadata.trigger || 'random';
  const platform = convMetadata.platform || 'messages';

  // Get relationship status with player
  const relationship = getPlayerRelationship(npc_id);
  const stage = relationship ? getRelationshipStage(relationship) : 'stranger';

  console.log(`[ConversationInitiator] ${npc.display_name} initiating conversation (stage: ${stage}, trigger: ${trigger})`);

  // Build the prompt
  const stagePrompts = CONVERSATION_PROMPTS[stage] || CONVERSATION_PROMPTS.stranger;
  const basePrompt = stagePrompts[Math.floor(Math.random() * stagePrompts.length)];
  const triggerPrompt = TRIGGER_PROMPTS[trigger] || '';

  const fullPrompt = `${basePrompt}

Context: ${triggerPrompt}

${convMetadata.topic ? `Topic to bring up: ${convMetadata.topic}` : ''}

Send a single opening message. Keep it natural and authentic to your personality. Don't be generic - be YOU.`;

  try {
    // Generate the opening message
    const result = await queuedGenerateNPCResponse(
      npc_id,
      fullPrompt,
      [], // No conversation history - this is the opener
      {
        platform,
        player_id: player_id || 'player',
        priority: Priority.MEDIUM,
        isUserInitiated: false,
        feature_category: 'random_events',
      }
    );

    if (result.status !== 'completed' || !result.result) {
      console.log(`[ConversationInitiator] Message generation deferred: ${result.status}`);
      return;
    }

    const messageContent = result.result;

    // Create or get conversation
    const db = getDB('game');
    let conversation = db.prepare(`
      SELECT id FROM conversations
      WHERE npc_id = ? AND platform = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(npc_id, platform) as any;

    let conversationId: string;
    if (!conversation) {
      conversationId = generateId();
      db.prepare(`
        INSERT INTO conversations (id, npc_id, platform, created_at, last_message_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(conversationId, npc_id, platform, now(), now());

      eventBus.fire(EventTypes.CONVERSATION_STARTED, {
        conversation_id: conversationId,
        platform,
        initiated_by: 'npc',
      }, {
        source: 'conversation-initiator',
        npc_id,
        conversation_id: conversationId,
      });
    } else {
      conversationId = conversation.id;
    }

    // Store the message
    const messageId = generateId();
    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
      VALUES (?, ?, 'npc', ?, ?, ?)
    `).run(messageId, conversationId, npc_id, messageContent, now());

    // Update conversation timestamp
    db.prepare(`UPDATE conversations SET last_message_at = ? WHERE id = ?`).run(now(), conversationId);

    console.log(`[ConversationInitiator] ${npc.display_name}: "${messageContent.substring(0, 50)}..."`);

    // Emit event
    eventBus.fire(EventTypes.CONVERSATION_MESSAGE_RECEIVED, {
      message_id: messageId,
      content: messageContent,
      word_count: messageContent.split(/\s+/).length,
    }, {
      source: 'conversation-initiator',
      npc_id,
      conversation_id: conversationId,
    });

    // Broadcast to frontend - this is how the player knows they got a message!
    broadcastToClients('conversation:newMessage', {
      conversation_id: conversationId,
      message_id: messageId,
      npc_id,
      npc_name: npc.display_name,
      content: messageContent,
      platform,
      timestamp: now(),
      initiated_by_npc: true,
    });

  } catch (error: any) {
    errorLogger.log(error, {
      source: 'conversation-initiator',
      operation: 'initiate_conversation',
      npc_id,
      metadata: convMetadata,
    });
    throw error;
  }
}

// ============================================================================
// Scheduled Message Handler
// ============================================================================

async function handleSendScheduledMessage(task: BackgroundTask): Promise<void> {
  const { npc_id, metadata } = task;
  if (!npc_id) {
    throw new Error('send_scheduled_message task requires npc_id');
  }

  const messageContent = (metadata as any)?.content;
  const conversationId = (metadata as any)?.conversation_id;
  const platform = (metadata as any)?.platform || 'messages';

  if (!messageContent) {
    throw new Error('send_scheduled_message requires content in metadata');
  }

  const npc = getNPCById(npc_id);
  if (!npc) {
    throw new Error(`NPC not found: ${npc_id}`);
  }

  const db = getDB('game');

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const existing = db.prepare(`
      SELECT id FROM conversations WHERE npc_id = ? AND platform = ? LIMIT 1
    `).get(npc_id, platform) as any;

    if (existing) {
      convId = existing.id;
    } else {
      convId = generateId();
      db.prepare(`
        INSERT INTO conversations (id, npc_id, platform, created_at, last_message_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(convId, npc_id, platform, now(), now());
    }
  }

  // Store the message
  const messageId = generateId();
  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'npc', ?, ?, ?)
  `).run(messageId, convId, npc_id, messageContent, now());

  db.prepare(`UPDATE conversations SET last_message_at = ? WHERE id = ?`).run(now(), convId);

  console.log(`[ConversationInitiator] Scheduled message from ${npc.display_name}: "${messageContent.substring(0, 40)}..."`);

  // Broadcast
  broadcastToClients('conversation:newMessage', {
    conversation_id: convId,
    message_id: messageId,
    npc_id,
    npc_name: npc.display_name,
    content: messageContent,
    platform,
    timestamp: now(),
    scheduled: true,
  });
}

// ============================================================================
// Scheduling Helpers
// ============================================================================

/**
 * Schedule random conversation starters from NPCs
 */
export function scheduleRandomConversations(options: {
  minDelayMinutes?: number;
  maxDelayMinutes?: number;
  maxConversations?: number;
} = {}): void {
  const {
    minDelayMinutes = 30,
    maxDelayMinutes = 180,
    maxConversations = 3,
  } = options;

  const npcs = getAllNPCs();

  // Pick random NPCs to initiate
  const initiators = npcs
    .filter(() => Math.random() < 0.3) // 30% chance per NPC
    .slice(0, maxConversations);

  for (const npc of initiators) {
    const delaySeconds = Math.floor(
      Math.random() * (maxDelayMinutes - minDelayMinutes) * 60
    ) + (minDelayMinutes * 60);

    const triggers: Array<ConversationMetadata['trigger']> = [
      'random', 'random', 'random', // Most common
      'time_based', 'missed_you', 'event_reaction',
    ];

    scheduleTask('initiate_conversation', {
      npc_id: npc.id,
      delay_seconds: delaySeconds,
      priority: 5,
      metadata: {
        trigger: triggers[Math.floor(Math.random() * triggers.length)],
      },
      budget_category: 'random_events',
    });
  }

  console.log(`[ConversationInitiator] Scheduled ${initiators.length} potential conversations`);
}

/**
 * Start the conversation initiator system
 */
export function startConversationInitiator(options: {
  checkIntervalMinutes?: number;
} = {}): void {
  const { checkIntervalMinutes = 60 } = options;

  console.log('[ConversationInitiator] Starting autonomous conversation system...');

  // Initial batch
  scheduleRandomConversations({
    minDelayMinutes: 5,
    maxDelayMinutes: 30,
    maxConversations: 2,
  });

  // Recurring checks
  setInterval(() => {
    scheduleRandomConversations({
      minDelayMinutes: 15,
      maxDelayMinutes: checkIntervalMinutes,
      maxConversations: 3,
    });
  }, checkIntervalMinutes * 60 * 1000);
}

/**
 * Force an NPC to message the player (for testing or scripted events)
 */
export function forceNPCMessage(
  npcId: string,
  options: ConversationMetadata = {}
): void {
  scheduleTask('initiate_conversation', {
    npc_id: npcId,
    delay_seconds: 5, // Almost immediate
    priority: 8,
    metadata: options,
    budget_category: 'random_events',
  });

  console.log(`[ConversationInitiator] Forced conversation from ${npcId}`);
}

// ============================================================================
// Initialize
// ============================================================================

export function initializeConversationInitiator(): void {
  registerTaskHandler('initiate_conversation', handleInitiateConversation);
  registerTaskHandler('send_scheduled_message', handleSendScheduledMessage);
  console.log('[ConversationInitiator] Task handlers registered');
}

export default {
  initializeConversationInitiator,
  startConversationInitiator,
  scheduleRandomConversations,
  forceNPCMessage,
};
