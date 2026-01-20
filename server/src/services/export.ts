// Export/Import system for conversations, NPCs, and full game state

import { getDB, generateId, now } from '../db/index.js';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const EXPORT_DIR = join(process.cwd(), '../data/exports');

// Ensure export directory exists
async function ensureExportDir() {
  if (!existsSync(EXPORT_DIR)) {
    await mkdir(EXPORT_DIR, { recursive: true });
  }
}

// Export a conversation to Markdown
export async function exportConversationToMarkdown(conversationId: string): Promise<string> {
  await ensureExportDir();

  const gameDb = getDB('game');
  const npcDb = getDB('npc');
  const userDb = getDB('user');

  // Get conversation details
  const conversation = gameDb.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId) as any;
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Get NPC details
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(conversation.npc_id) as any;
  const player = userDb.prepare('SELECT * FROM player WHERE id = ?').get(conversation.participant_id) as any;

  // Get all messages
  const messages = gameDb.prepare(`
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC
  `).all(conversationId) as any[];

  // Build markdown
  let markdown = `# Conversation with ${npc.display_name}\n\n`;
  markdown += `**Platform:** ${conversation.platform}\n`;
  markdown += `**Started:** ${new Date(conversation.started_at * 1000).toLocaleString()}\n`;
  markdown += `**Messages:** ${messages.length}\n\n`;
  markdown += `---\n\n`;

  for (const message of messages) {
    const sender = message.sender_type === 'player' ? player.display_name || player.username : npc.display_name;
    const timestamp = new Date(message.timestamp * 1000).toLocaleTimeString();
    const isPlayer = message.sender_type === 'player';

    markdown += `### ${isPlayer ? '👤' : '🤖'} **${sender}** _${timestamp}_\n\n`;
    markdown += `${message.content}\n\n`;

    // Check if message has associated media
    const media = gameDb.prepare(`
      SELECT * FROM media_files WHERE conversation_id = ? AND created_at >= ? AND created_at <= ?
    `).all(conversationId, message.timestamp - 5, message.timestamp + 5) as any[];

    if (media.length > 0) {
      for (const file of media) {
        if (file.mime_type?.startsWith('image/')) {
          markdown += `![${file.filename}](${file.file_url})\n\n`;
        } else {
          markdown += `📎 [${file.filename}](${file.file_url})\n\n`;
        }
      }
    }

    markdown += `---\n\n`;
  }

  // Write to file
  const filename = `conversation_${npc.username}_${Date.now()}.md`;
  const filepath = join(EXPORT_DIR, filename);
  await writeFile(filepath, markdown, 'utf-8');

  return filepath;
}

// Export full NPC with all data (portable format)
export async function exportNPCWithData(npcId: string, playerId?: string): Promise<string> {
  await ensureExportDir();

  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  // Get NPC data
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;
  if (!npc) {
    throw new Error('NPC not found');
  }

  // Get NPC relationships
  const relationships = npcDb.prepare(`
    SELECT * FROM npc_relationships WHERE npc_id = ?
  `).all(npcId) as any[];

  // Get player-specific relationship if provided
  let playerRelationship = null;
  if (playerId) {
    // Note: We'd need a player_relationships table for this
    // For now, we'll track it in the export metadata
  }

  // Get all memories
  const memories = gameDb.prepare(`
    SELECT * FROM memories WHERE npc_id = ? ORDER BY created_at DESC
  `).all(npcId) as any[];

  // Get all conversations (with player if specified)
  const conversations = playerId
    ? gameDb.prepare(`
        SELECT * FROM conversations WHERE npc_id = ? AND participant_id = ? ORDER BY started_at DESC
      `).all(npcId, playerId)
    : gameDb.prepare(`
        SELECT * FROM conversations WHERE npc_id = ? ORDER BY started_at DESC
      `).all(npcId) as any[];

  // Get all messages from conversations
  const conversationIds = conversations.map((c: any) => c.id);
  const messages = conversationIds.length > 0
    ? gameDb.prepare(`
        SELECT * FROM messages WHERE conversation_id IN (${conversationIds.map(() => '?').join(',')}) ORDER BY timestamp ASC
      `).all(...conversationIds)
    : [];

  // Get all posts
  const posts = gameDb.prepare(`
    SELECT * FROM posts WHERE npc_id = ? ORDER BY created_at DESC
  `).all(npcId) as any[];

  // Get all media files
  const mediaFiles = gameDb.prepare(`
    SELECT * FROM media_files WHERE npc_id = ? OR (owner_type = 'npc' AND owner_id = ?) ORDER BY created_at DESC
  `).all(npcId, npcId) as any[];

  // Build export package
  const exportData = {
    version: '1.0',
    export_type: 'npc_full',
    exported_at: new Date().toISOString(),
    npc: {
      username: npc.username,
      display_name: npc.display_name,
      bio: npc.bio,
      age: npc.age,
      gender: npc.gender,
      occupation: npc.occupation,
      interests: JSON.parse(npc.interests || '[]'),
      personality_traits: JSON.parse(npc.personality_traits || '{}'),
      personality_flags: JSON.parse(npc.personality_flags || '{}'),
      system_prompt: npc.system_prompt,
      social_media_handles: JSON.parse(npc.social_media_handles || '{}'),
      profile_image_url: npc.profile_image_url,
      reference_images: JSON.parse(npc.reference_images || '[]'),
      image_generation_prompt: npc.image_generation_prompt,
      model_config: {
        provider: npc.model_provider,
        model_name: npc.model_name,
        base_url: npc.model_base_url,
      },
    },
    relationships: relationships.map((r: any) => ({
      target_npc_id: r.target_npc_id,
      relationship_type: r.relationship_type,
      trust_level: r.trust_level,
      affinity: r.affinity,
      notes: r.notes,
    })),
    player_relationship: playerRelationship,
    memories: memories.map((m: any) => ({
      event_type: m.event_type,
      event_id: m.event_id,
      content: m.content,
      importance: m.importance,
      created_at: m.created_at,
    })),
    conversations: conversations.map((c: any) => ({
      platform: c.platform,
      started_at: c.started_at,
      context: c.context,
    })),
    messages: messages,
    posts: posts.map((p: any) => ({
      platform: p.platform,
      content: p.content,
      created_at: p.created_at,
    })),
    media_files: mediaFiles.map((f: any) => ({
      filename: f.filename,
      file_url: f.file_url,
      file_type: f.file_type,
      category: f.category,
      description: f.description,
      created_at: f.created_at,
    })),
    stats: {
      total_memories: memories.length,
      total_conversations: conversations.length,
      total_messages: messages.length,
      total_posts: posts.length,
      total_media_files: mediaFiles.length,
    },
  };

  // Write to file
  const filename = `npc_${npc.username}_full_export_${Date.now()}.json`;
  const filepath = join(EXPORT_DIR, filename);
  await writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf-8');

  return filepath;
}

// Import NPC from full export
export async function importNPCFromExport(filepath: string, options?: {
  preserveRelationships?: boolean;
  preserveMemories?: boolean;
  preserveConversations?: boolean;
  playerId?: string;
}): Promise<string> {
  const { createNPC } = await import('./npc.js');

  // Read export file
  const jsonContent = await readFile(filepath, 'utf-8');
  const exportData = JSON.parse(jsonContent);

  if (exportData.export_type !== 'npc_full' || !exportData.npc) {
    throw new Error('Invalid NPC export format');
  }

  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  // Check if NPC with this username already exists
  const existingNPC = npcDb.prepare('SELECT id FROM npcs WHERE username = ?').get(exportData.npc.username) as any;
  const shouldRename = existingNPC !== undefined;

  // Create NPC
  const newNPC = createNPC({
    username: shouldRename ? `${exportData.npc.username}_imported` : exportData.npc.username,
    display_name: shouldRename ? `${exportData.npc.display_name} (Imported)` : exportData.npc.display_name,
    bio: exportData.npc.bio,
    personality: JSON.stringify(exportData.npc.personality_traits),
    system_prompt: exportData.npc.system_prompt,
    age: exportData.npc.age,
    gender: exportData.npc.gender,
    occupation: exportData.npc.occupation,
    interests: exportData.npc.interests,
    social_media_handles: exportData.npc.social_media_handles,
    model_provider: exportData.npc.model_config?.provider,
    model_name: exportData.npc.model_config?.model_name,
    model_base_url: exportData.npc.model_config?.base_url,
  });

  // Import memories if requested
  if (options?.preserveMemories && exportData.memories) {
    for (const memory of exportData.memories) {
      gameDb.prepare(`
        INSERT INTO memories (id, npc_id, event_type, event_id, content, importance, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        generateId(),
        newNPC.id,
        memory.event_type,
        memory.event_id || null,
        memory.content,
        memory.importance,
        memory.created_at
      );
    }
  }

  // Import conversations and messages if requested
  if (options?.preserveConversations && options.playerId && exportData.conversations) {
    for (let i = 0; i < exportData.conversations.length; i++) {
      const conv = exportData.conversations[i];
      const convId = generateId();

      // Create conversation
      gameDb.prepare(`
        INSERT INTO conversations (id, npc_id, participant_id, participant_type, platform, started_at, context)
        VALUES (?, ?, ?, 'player', ?, ?, ?)
      `).run(convId, newNPC.id, options.playerId, conv.platform, conv.started_at, conv.context || null);

      // Import messages for this conversation (filter by original conversation details)
      const relevantMessages = exportData.messages.filter((m: any) => {
        // Match messages based on timestamp proximity to conversation start
        return m.timestamp >= conv.started_at;
      });

      for (const message of relevantMessages) {
        gameDb.prepare(`
          INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, timestamp, is_read)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(
          generateId(),
          convId,
          message.sender_type === 'player' ? options.playerId : newNPC.id,
          message.sender_type,
          message.content,
          message.timestamp
        );
      }
    }
  }

  console.log(`[Import] Imported NPC ${newNPC.display_name} with:`);
  console.log(`  - ${exportData.stats.total_memories} memories (${options?.preserveMemories ? 'imported' : 'skipped'})`);
  console.log(`  - ${exportData.stats.total_conversations} conversations (${options?.preserveConversations ? 'imported' : 'skipped'})`);

  return newNPC.id;
}

// Export entire game state (all NPCs, conversations, etc.)
export async function exportGameState(playerId: string): Promise<string> {
  await ensureExportDir();

  const npcDb = getDB('npc');
  const gameDb = getDB('game');
  const userDb = getDB('user');

  // Get player data
  const player = userDb.prepare('SELECT * FROM player WHERE id = ?').get(playerId) as any;

  // Get all NPCs
  const npcs = npcDb.prepare('SELECT * FROM npcs WHERE is_active = 1').all() as any[];

  const gameState = {
    version: '1.0',
    export_type: 'game_state_full',
    exported_at: new Date().toISOString(),
    player: {
      username: player.username,
      display_name: player.display_name,
      bio: player.bio,
    },
    npcs: npcs.map(npc => npc.id),
    npc_count: npcs.length,
  };

  const filename = `game_state_${player.username}_${Date.now()}.json`;
  const filepath = join(EXPORT_DIR, filename);
  await writeFile(filepath, JSON.stringify(gameState, null, 2), 'utf-8');

  console.log(`[Export] Exported game state with ${npcs.length} NPCs`);

  return filepath;
}

export default {
  exportConversationToMarkdown,
  exportNPCWithData,
  importNPCFromExport,
  exportGameState,
};
