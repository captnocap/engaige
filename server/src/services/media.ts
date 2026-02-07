import { getDB, generateId, now } from '../db/index.js';
import { join, dirname } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Media file types
export type MediaCategory = 'profile' | 'reference' | 'post' | 'message' | 'upload' | 'generated' | 'npc_config' | 'memory_log' | 'other';
export type OwnerType = 'player' | 'npc' | 'system';

export interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  mime_type?: string;
  owner_type: OwnerType;
  owner_id?: string;
  category: MediaCategory;
  tags?: string[];
  npc_id?: string;
  conversation_id?: string;
  post_id?: string;
  width?: number;
  height?: number;
  generated_prompt?: string;
  description?: string;
  created_at: number;
  uploaded_at: number;
}

// Base media directory (relative to this source file → server/data/media)
const MEDIA_DIR = join(dirname(import.meta.url.replace('file://', '')), '../../data/media');

// Ensure media directories exist
async function ensureMediaDirs() {
  const dirs = [
    MEDIA_DIR,
    join(MEDIA_DIR, 'player'),
    join(MEDIA_DIR, 'npcs'),
    join(MEDIA_DIR, 'posts'),
    join(MEDIA_DIR, 'generated'),
    join(MEDIA_DIR, 'uploads'),
    join(MEDIA_DIR, 'configs'),
    join(MEDIA_DIR, 'logs'),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

// Initialize media system
export async function initializeMediaSystem() {
  await ensureMediaDirs();
  console.log('[Media] Media directories initialized');
}

// Store a media file
export async function storeMediaFile(
  file: {
    buffer: Buffer;
    filename: string;
    mimeType: string;
  },
  metadata: {
    owner_type: OwnerType;
    owner_id?: string;
    category: MediaCategory;
    npc_id?: string;
    conversation_id?: string;
    post_id?: string;
    tags?: string[];
    description?: string;
    generated_prompt?: string;
  }
): Promise<MediaFile> {
  await ensureMediaDirs();

  const db = getDB('game');
  const id = generateId();
  const timestamp = now();

  // Determine subdirectory based on category
  let subdir = 'uploads';
  if (metadata.category === 'profile' || metadata.category === 'reference') {
    subdir = metadata.owner_type === 'npc' ? 'npcs' : 'player';
  } else if (metadata.category === 'post') {
    subdir = 'posts';
  } else if (metadata.category === 'generated') {
    subdir = 'generated';
  } else if (metadata.category === 'npc_config') {
    subdir = 'configs';
  } else if (metadata.category === 'memory_log') {
    subdir = 'logs';
  }

  // Generate unique filename
  const ext = metadata.category === 'generated' && file.filename.includes('.')
    ? file.filename.split('.').pop()
    : file.filename.split('.').pop() || 'png';
  const newFilename = `${id}.${ext}`;
  const filePath = join(MEDIA_DIR, subdir, newFilename);
  const fileUrl = `/media/${subdir}/${newFilename}`;

  // Write file to disk
  await writeFile(filePath, file.buffer);

  // Get image dimensions if it's an image
  let width: number | undefined;
  let height: number | undefined;

  if (file.mimeType.startsWith('image/')) {
    // In a real implementation, you'd use an image library to get dimensions
    // For now, we'll leave them undefined
  }

  // Store in database
  db.prepare(`
    INSERT INTO media_files (
      id, filename, file_path, file_url, file_type, file_size, mime_type,
      owner_type, owner_id, category, tags, npc_id, conversation_id, post_id,
      width, height, generated_prompt, description, created_at, uploaded_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    file.filename,
    filePath,
    fileUrl,
    ext,
    file.buffer.length,
    file.mimeType,
    metadata.owner_type,
    metadata.owner_id || null,
    metadata.category,
    metadata.tags ? JSON.stringify(metadata.tags) : null,
    metadata.npc_id || null,
    metadata.conversation_id || null,
    metadata.post_id || null,
    width || null,
    height || null,
    metadata.generated_prompt || null,
    metadata.description || null,
    timestamp,
    timestamp
  );

  return getMediaFileById(id)!;
}

// Store a media file from URL (for generated images)
export async function storeMediaFileFromUrl(
  url: string,
  metadata: {
    filename: string;
    owner_type: OwnerType;
    owner_id?: string;
    category: MediaCategory;
    npc_id?: string;
    generated_prompt?: string;
    description?: string;
  }
): Promise<MediaFile> {
  // Download the image
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image from ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || 'image/png';

  return await storeMediaFile(
    { buffer, filename: metadata.filename, mimeType },
    metadata
  );
}

// Get media file by ID
export function getMediaFileById(id: string): MediaFile | null {
  const db = getDB('game');
  const file = db.prepare('SELECT * FROM media_files WHERE id = ?').get(id) as any;
  if (!file) return null;

  return parseMediaFile(file);
}

// Get all media files for a specific owner
export function getMediaFilesByOwner(ownerType: OwnerType, ownerId?: string): MediaFile[] {
  const db = getDB('game');
  const query = ownerId
    ? 'SELECT * FROM media_files WHERE owner_type = ? AND owner_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM media_files WHERE owner_type = ? ORDER BY created_at DESC';

  const params = ownerId ? [ownerType, ownerId] : [ownerType];
  return db.prepare(query).all(...params).map((f: any) => parseMediaFile(f));
}

// Get all media files for an NPC (including their own uploads and generated images)
export function getMediaFilesByNPC(npcId: string): MediaFile[] {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM media_files
    WHERE npc_id = ? OR (owner_type = 'npc' AND owner_id = ?)
    ORDER BY created_at DESC
  `).all(npcId, npcId).map((f: any) => parseMediaFile(f));
}

// Get media files by category
export function getMediaFilesByCategory(category: MediaCategory, limit = 50): MediaFile[] {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM media_files
    WHERE category = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(category, limit).map((f: any) => parseMediaFile(f));
}

// Get all media files (for Files app)
export function getAllMediaFiles(options?: {
  category?: MediaCategory;
  ownerType?: OwnerType;
  npcId?: string;
  limit?: number;
  offset?: number;
}): MediaFile[] {
  const db = getDB('game');
  let query = 'SELECT * FROM media_files WHERE 1=1';
  const params: any[] = [];

  if (options?.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }

  if (options?.ownerType) {
    query += ' AND owner_type = ?';
    params.push(options.ownerType);
  }

  if (options?.npcId) {
    query += ' AND npc_id = ?';
    params.push(options.npcId);
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);

    if (options?.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }
  }

  return db.prepare(query).all(...params).map((f: any) => parseMediaFile(f));
}

// Search media files by tags or description
export function searchMediaFiles(searchTerm: string): MediaFile[] {
  const db = getDB('game');
  return db.prepare(`
    SELECT * FROM media_files
    WHERE filename LIKE ? OR description LIKE ? OR tags LIKE ?
    ORDER BY created_at DESC
    LIMIT 100
  `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`).map((f: any) => parseMediaFile(f));
}

// Delete media file
export function deleteMediaFile(id: string): boolean {
  const db = getDB('game');
  const result = db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
  // TODO: Also delete the actual file from disk
  return result.changes > 0;
}

// Update media file metadata
export function updateMediaFile(
  id: string,
  updates: {
    description?: string;
    tags?: string[];
    category?: MediaCategory;
  }
): MediaFile | null {
  const db = getDB('game');
  const existing = getMediaFileById(id);
  if (!existing) return null;

  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    values.push(updates.description);
  }

  if (updates.tags !== undefined) {
    setClauses.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }

  if (updates.category !== undefined) {
    setClauses.push('category = ?');
    values.push(updates.category);
  }

  if (setClauses.length === 0) return existing;

  values.push(id);
  db.prepare(`UPDATE media_files SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

  return getMediaFileById(id);
}

// Get folder structure for Files app
export function getFilesystemStructure(): {
  myFiles: MediaFile[];
  npcs: Array<{
    npc: { id: string; display_name: string; avatar_url: string };
    files: MediaFile[];
  }>;
} {
  const db = getDB('game');
  const npcDb = getDB('npc');

  // Get player's files
  const myFiles = getMediaFilesByOwner('player');

  // Get all NPCs with files
  const npcs = npcDb.prepare('SELECT id, display_name, avatar_url, profile_image_url FROM npcs WHERE is_active = 1').all() as any[];

  const npcFolders = npcs.map((npc) => ({
    npc: {
      id: npc.id,
      display_name: npc.display_name,
      avatar_url: npc.avatar_url || npc.profile_image_url,
    },
    files: getMediaFilesByNPC(npc.id),
  }));

  return {
    myFiles,
    npcs: npcFolders,
  };
}

// Helper to parse database row
function parseMediaFile(file: any): MediaFile {
  return {
    id: file.id,
    filename: file.filename,
    file_path: file.file_path,
    file_url: file.file_url,
    file_type: file.file_type,
    file_size: file.file_size,
    mime_type: file.mime_type,
    owner_type: file.owner_type,
    owner_id: file.owner_id,
    category: file.category,
    tags: file.tags ? JSON.parse(file.tags) : undefined,
    npc_id: file.npc_id,
    conversation_id: file.conversation_id,
    post_id: file.post_id,
    width: file.width,
    height: file.height,
    generated_prompt: file.generated_prompt,
    description: file.description,
    created_at: file.created_at,
    uploaded_at: file.uploaded_at,
  };
}

// Export NPC configuration as a JSON file
export async function exportNPCConfig(npcId: string): Promise<MediaFile> {
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Create a clean JSON export of the NPC
  const npcConfig = {
    version: '1.0',
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
      image_generation_prompt: npc.image_generation_prompt,
      model_config: {
        provider: npc.model_provider,
        model_name: npc.model_name,
        base_url: npc.model_base_url,
        // Don't export API key for security
      },
    },
  };

  const jsonString = JSON.stringify(npcConfig, null, 2);
  const buffer = Buffer.from(jsonString, 'utf-8');
  const filename = `${npc.username}_config.json`;

  return await storeMediaFile(
    {
      buffer,
      filename,
      mimeType: 'application/json',
    },
    {
      owner_type: 'npc',
      owner_id: npcId,
      category: 'npc_config',
      npc_id: npcId,
      description: `Configuration file for ${npc.display_name}`,
    }
  );
}

// Export NPC memory log as a text file
export async function exportNPCMemoryLog(npcId: string, limit = 100): Promise<MediaFile> {
  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;
  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Get NPC memories
  const memories = gameDb.prepare(`
    SELECT * FROM memories
    WHERE npc_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(npcId, limit) as any[];

  // Format as readable text
  let logText = `Memory Log for ${npc.display_name} (@${npc.username})\n`;
  logText += `Exported: ${new Date().toISOString()}\n`;
  logText += `Total Memories: ${memories.length}\n`;
  logText += `${'='.repeat(60)}\n\n`;

  for (const memory of memories) {
    const date = new Date(memory.created_at * 1000).toLocaleString();
    logText += `[${date}] Type: ${memory.event_type} | Importance: ${memory.importance}\n`;
    logText += `${memory.content}\n`;
    if (memory.event_id) {
      logText += `Event ID: ${memory.event_id}\n`;
    }
    logText += `${'-'.repeat(60)}\n\n`;
  }

  const buffer = Buffer.from(logText, 'utf-8');
  const filename = `${npc.username}_memories.txt`;

  return await storeMediaFile(
    {
      buffer,
      filename,
      mimeType: 'text/plain',
    },
    {
      owner_type: 'npc',
      owner_id: npcId,
      category: 'memory_log',
      npc_id: npcId,
      description: `Memory log for ${npc.display_name} (${memories.length} entries)`,
    }
  );
}

// Import NPC configuration from JSON file
export async function importNPCConfig(fileId: string): Promise<string> {
  const file = getMediaFileById(fileId);
  if (!file || file.category !== 'npc_config') {
    throw new Error('Invalid NPC config file');
  }

  // Read the JSON file
  const fs = await import('fs/promises');
  const jsonContent = await fs.readFile(file.file_path, 'utf-8');
  const config = JSON.parse(jsonContent);

  if (!config.npc || !config.version) {
    throw new Error('Invalid NPC config format');
  }

  // Create new NPC from config
  const { createNPC } = await import('./npc.js');

  const npc = createNPC({
    username: config.npc.username + '_imported',
    display_name: config.npc.display_name + ' (Imported)',
    bio: config.npc.bio,
    personality: JSON.stringify(config.npc.personality_traits),
    system_prompt: config.npc.system_prompt,
    age: config.npc.age,
    gender: config.npc.gender,
    occupation: config.npc.occupation,
    interests: config.npc.interests,
    social_media_handles: config.npc.social_media_handles,
    model_provider: config.npc.model_config?.provider,
    model_name: config.npc.model_config?.model_name,
    model_base_url: config.npc.model_config?.base_url,
  });

  return npc.id;
}

// Get all config files
export function getAllNPCConfigs(): MediaFile[] {
  return getMediaFilesByCategory('npc_config');
}

// Get all memory logs
export function getAllMemoryLogs(): MediaFile[] {
  return getMediaFilesByCategory('memory_log');
}

export default {
  initializeMediaSystem,
  storeMediaFile,
  storeMediaFileFromUrl,
  getMediaFileById,
  getMediaFilesByOwner,
  getMediaFilesByNPC,
  getMediaFilesByCategory,
  getAllMediaFiles,
  searchMediaFiles,
  deleteMediaFile,
  updateMediaFile,
  getFilesystemStructure,
  exportNPCConfig,
  exportNPCMemoryLog,
  importNPCConfig,
  getAllNPCConfigs,
  getAllMemoryLogs,
};
