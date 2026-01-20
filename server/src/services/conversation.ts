import { getDB, generateId, now } from '../db/index.js';
import { generateNPCResponse } from './ai.js';

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

  return getConversationById(id)!;
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

// Send a message from player to NPC
export async function sendPlayerMessage(
  conversationId: string,
  playerId: string,
  content: string
): Promise<Message> {
  const db = getDB('game');
  const conv = getConversationById(conversationId);
  if (!conv) throw new Error('Conversation not found');

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

  // Generate NPC response
  const messages = getConversationMessages(conversationId, 10);
  const history = messages.map(m => ({
    role: m.sender_type as 'user' | 'assistant',
    content: m.content,
  }));

  const npcResponse = await generateNPCResponse(
    conv.npc_id,
    content,
    history,
    { platform: conv.platform, player_name: 'You' }
  );

  // Store NPC response
  const npcMessageId = generateId();
  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp)
    VALUES (?, ?, ?, 'npc', ?, ?)
  `).run(npcMessageId, conversationId, conv.npc_id, npcResponse, now());

  // Update conversation again
  db.prepare(`
    UPDATE conversations SET last_message_at = ? WHERE id = ?
  `).run(now(), conversationId);

  return getMessageById(npcMessageId)!;
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
  db.prepare(`
    UPDATE messages SET is_read = 1
    WHERE conversation_id = ? AND sender_id != ?
  `).run(conversationId, readerId);
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