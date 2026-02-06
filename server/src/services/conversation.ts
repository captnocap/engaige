import { getDB, generateId, now } from '../db/index.js';
import { generateNPCResponse } from './ai.js';
import { updateStatsForMessage } from './relationships.js';
import { validateMessageAccess } from './message-access-validator.js';
import { formatMessageForNPC } from './message-formatter.js';
import type { CommunicationQuirks, MessagePatterns } from './npc-personality.js';
import { eventBus, EventTypes } from '../events/index.js';

// Conversation Types
export interface Conversation {
  id: string;
  npc_id: string;
  participant_id: string | null;
  participant_type: 'player' | 'npc';
  platform: string;
  started_at: number;
  last_message_at: number | null;
  context: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'npc' | 'player';
  content: string;
  timestamp: number;
  is_read: number;
  metadata: string | null;
}

// Create a new conversation
export function createConversation(
  npcId: string,
  participantId: string,
  participantType: 'player' | 'npc',
  platform: string
): Conversation {
  const db = getDB('game');
  const id = generateId();

  db.prepare(`
    INSERT INTO conversations (id, npc_id, participant_id, participant_type, platform)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, npcId, participantId, participantType, platform);

  const conversation = getConversationById(id)!;

  // Emit conversation started event
  eventBus.fire(EventTypes.CONVERSATION_STARTED, {
    conversation_id: id,
    platform,
    initiated_by: participantType,
  }, {
    source: 'conversation',
    npc_id: npcId,
    player_id: participantType === 'player' ? participantId : undefined,
    conversation_id: id,
  });

  return conversation;
}

// Get conversation by ID
export function getConversationById(id: string): Conversation | null {
  const db = getDB('game');
  const conv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
  return conv || null;
}

// Get conversations for an NPC
export function getNPCConversations(npcId: string, limit = 50): Conversation[] {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM conversations
    WHERE npc_id = ?
    ORDER BY last_message_at DESC
    LIMIT ?
  `).all(npcId, limit) as any;
}

// Get or create conversation between NPC and player
export function getOrCreateConversation(
  npcId: string,
  playerId: string,
  platform: string
): Conversation {
  const db = getDB('game');

  let conv = db.prepare(`
    SELECT * FROM conversations
    WHERE npc_id = ? AND participant_id = ? AND participant_type = 'player' AND platform = ?
  `).get(npcId, playerId, platform) as any;

  if (conv) return conv;

  // Validate access before creating a new conversation
  const access = validateMessageAccess(playerId, npcId, platform);
  if (!access.allowed) {
    throw new Error(`ACCESS_DENIED: ${access.reason}`);
  }

  return createConversation(npcId, playerId, 'player', platform);
}

// Get conversation messages
export function getConversationMessages(conversationId: string, limit = 50): Message[] {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM messages
    WHERE conversation_id = ?
    ORDER BY timestamp ASC
    LIMIT ?
  `).all(conversationId, limit) as any;
}

// Send a message from player to NPC (with realistic formatting and delays)
export async function sendPlayerMessage(
  conversationId: string,
  playerId: string,
  content: string
): Promise<{
  playerMessage: Message;
  npcMessages: Array<{ message: Message; delay_seconds: number }>;
}> {
  const db = getDB('game');
  const npcDb = getDB('npc');
  const conv = getConversationById(conversationId);
  if (!conv) throw new Error('Conversation not found');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(conv.npc_id) as any;
  if (!npc) throw new Error('NPC not found');

  const id = generateId();
  const timestamp = now();

  // Store player message
  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp)
    VALUES (?, ?, ?, 'player', ?, ?)
  `).run(id, conversationId, playerId, content, timestamp);

  // Update conversation
  db.prepare(`
    UPDATE conversations SET last_message_at = ? WHERE id = ?
  `).run(timestamp, conversationId);

  // Emit player message sent event
  const messageSentEvent = await eventBus.emit(EventTypes.CONVERSATION_MESSAGE_SENT, {
    message_id: id,
    content,
    word_count: content.split(/\s+/).length,
    has_image: false,
  }, {
    source: 'conversation',
    player_id: playerId,
    npc_id: conv.npc_id,
    conversation_id: conversationId,
  });

  // Update relationship stats
  updateStatsForMessage(playerId, conv.npc_id, content, true);

  // Generate NPC response
  const messages = getConversationMessages(conversationId, 10);
  const history = messages.map(m => ({
    role: m.sender_type as 'user' | 'assistant',
    content: m.content,
  }));

  const rawNPCResponse = await generateNPCResponse(
    conv.npc_id,
    content,
    history,
    { platform: conv.platform, player_name: 'You' }
  );

  // Get NPC's communication style
  const quirks: CommunicationQuirks = JSON.parse(npc.communication_quirks || '{}');
  const patterns: MessagePatterns = JSON.parse(npc.message_patterns || '{}');

  // Format message based on personality
  const formatted = formatMessageForNPC(rawNPCResponse, quirks, patterns);

  // Store NPC messages (potentially multiple)
  const npcMessages: Array<{ message: Message; delay_seconds: number }> = [];
  let cumulativeDelay = 0;

  for (let i = 0; i < formatted.parts.length; i++) {
    const npcMessageId = generateId();
    cumulativeDelay += formatted.delays[i];

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp, metadata)
      VALUES (?, ?, ?, 'npc', ?, ?, ?)
    `).run(
      npcMessageId,
      conversationId,
      conv.npc_id,
      formatted.parts[i],
      timestamp + cumulativeDelay,
      JSON.stringify({ part: i + 1, total_parts: formatted.parts.length, delay: formatted.delays[i] })
    );

    npcMessages.push({
      message: getMessageById(npcMessageId)!,
      delay_seconds: formatted.delays[i],
    });
  }

  // Update conversation with final timestamp
  db.prepare(`
    UPDATE conversations SET last_message_at = ? WHERE id = ?
  `).run(timestamp + cumulativeDelay, conversationId);

  // Emit NPC message received event (for each part, link to parent event)
  for (const npcMsg of npcMessages) {
    eventBus.fire(EventTypes.CONVERSATION_MESSAGE_RECEIVED, {
      message_id: npcMsg.message.id,
      content: npcMsg.message.content,
      word_count: npcMsg.message.content.split(/\s+/).length,
      has_image: false,
    }, {
      source: 'conversation',
      player_id: playerId,
      npc_id: conv.npc_id,
      conversation_id: conversationId,
      parent_event_id: messageSentEvent.id, // Link to the player's message
    });
  }

  // Update relationship stats for NPC response
  updateStatsForMessage(playerId, conv.npc_id, rawNPCResponse, false);

  return {
    playerMessage: getMessageById(id)!,
    npcMessages,
  };
}

// Send message from one NPC to another
export async function sendNPCMessage(
  fromNpcId: string,
  toNpcId: string,
  content: string,
  platform: string
): Promise<Message> {
  const db = getDB('game');

  // Get or create conversation
  let conv = db.prepare(`
    SELECT * FROM conversations
    WHERE npc_id = ? AND participant_id = ? AND participant_type = 'npc' AND platform = ?
  `).get(toNpcId, fromNpcId, 'npc') as any;

  if (!conv) {
    const id = generateId();
    db.prepare(`
      INSERT INTO conversations (id, npc_id, participant_id, participant_type, platform)
      VALUES (?, ?, ?, 'npc', ?)
    `).run(id, toNpcId, fromNpcId, platform);
    conv = { id };
  }

  const id = generateId();

  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp)
    VALUES (?, ?, ?, 'npc', ?, ?)
  `).run(id, conv.id, fromNpcId, content, now());

  db.prepare(`
    UPDATE conversations SET last_message_at = ? WHERE id = ?
  `).run(now(), conv.id);

  return getMessageById(id)!;
}

// Mark messages as read
export function markMessagesAsRead(conversationId: string, readerId: string): void {
  const db = getDB('game');

  // Get unread count before marking
  const unreadCount = getUnreadCount(conversationId, readerId);

  db.prepare(`
    UPDATE messages SET is_read = 1
    WHERE conversation_id = ? AND sender_id != ?
  `).run(conversationId, readerId);

  // Emit message read event if there were unread messages
  if (unreadCount > 0) {
    const conv = getConversationById(conversationId);
    eventBus.fire(EventTypes.CONVERSATION_MESSAGE_READ, {
      messages_read: unreadCount,
    }, {
      source: 'conversation',
      player_id: readerId,
      npc_id: conv?.npc_id,
      conversation_id: conversationId,
      importance: 0.2, // Low importance - high volume event
    });
  }
}

// Get unread message count
export function getUnreadCount(conversationId: string, userId: string): number {
  const db = getDB('game');
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM messages
    WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
  `).get(conversationId, userId) as any;
  return result.count;
}

// Delete conversation and all messages
export function deleteConversation(id: string): boolean {
  const db = getDB('game');
  db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(id);
  const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
  return result.changes > 0;
}

// Helper
export function getMessageById(id: string): Message | null {
  const db = getDB('game');
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  return msg || null;
}

export default {
  createConversation,
  getConversationById,
  getNPCConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendPlayerMessage,
  sendNPCMessage,
  markMessagesAsRead,
  getUnreadCount,
  deleteConversation,
};