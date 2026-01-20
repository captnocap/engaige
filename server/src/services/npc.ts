import { getDB, generateId, now } from '../db/index.js';
import type { AIProvider } from './ai.js';
import { eventBus, EventTypes } from '../events/index.js';

// NPC CRUD Operations
export interface NPCCreateData {
  username: string;
  display_name: string;
  bio: string;
  personality: string;
  system_prompt: string;
  avatar_url?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  interests?: string[];
  social_media_handles?: Record<string, string>;
  model_provider?: AIProvider;
  model_name?: string;
  model_base_url?: string;
  model_api_key?: string;
}

export interface NPC extends NPCCreateData {
  id: string;
  created_at: number;
  updated_at: number;
  is_active: number;
}

// Create a new NPC
export function createNPC(data: NPCCreateData, generationMethod: 'ai' | 'manual' | 'import' = 'manual'): NPC {
  const db = getDB('npc');
  const id = generateId();

  db.prepare(`
    INSERT INTO npcs (
      id, username, display_name, bio, personality, system_prompt,
      avatar_url, age, gender, occupation, interests, social_media_handles,
      model_provider, model_name, model_base_url, model_api_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.username,
    data.display_name,
    data.bio,
    data.personality,
    data.system_prompt,
    data.avatar_url || null,
    data.age || null,
    data.gender || null,
    data.occupation || null,
    JSON.stringify(data.interests || []),
    JSON.stringify(data.social_media_handles || {}),
    data.model_provider || 'openai-compatible',
    data.model_name || null,
    data.model_base_url || null,
    data.model_api_key || null
  );

  const npc = getNPCById(id)!;

  // Emit NPC created event
  eventBus.fire(EventTypes.NPC_CREATED, {
    npc_id: id,
    username: data.username,
    display_name: data.display_name,
    generation_method: generationMethod,
  }, {
    source: 'npc',
    npc_id: id,
    importance: 0.8,
  });

  return npc;
}

// Get NPC by ID
export function getNPCById(id: string): NPC | null {
  const db = getDB('npc');
  const npc = db.prepare('SELECT * FROM npcs WHERE id = ?').get(id) as any;
  if (!npc) return null;

  return parseNPC(npc);
}

// Get NPC by username
export function getNPCByUsername(username: string): NPC | null {
  const db = getDB('npc');
  const npc = db.prepare('SELECT * FROM npcs WHERE username = ?').get(username) as any;
  if (!npc) return null;

  return parseNPC(npc);
}

// Get all NPCs
export function getAllNPCs(includeInactive = false): NPC[] {
  const db = getDB('npc');
  const query = includeInactive
    ? 'SELECT * FROM npcs ORDER BY display_name'
    : 'SELECT * FROM npcs WHERE is_active = 1 ORDER BY display_name';

  return db.prepare(query).all().map((npc: any) => parseNPC(npc));
}

// Get active NPCs
export function getActiveNPCs(): NPC[] {
  return getAllNPCs(false);
}

// Update NPC
export function updateNPC(id: string, data: Partial<NPCCreateData>): NPC | null {
  const db = getDB('npc');
  const existing = getNPCById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, keyof NPCCreateData> = {
    'display_name': 'display_name',
    'bio': 'bio',
    'personality': 'personality',
    'system_prompt': 'system_prompt',
    'avatar_url': 'avatar_url',
    'age': 'age',
    'gender': 'gender',
    'occupation': 'occupation',
    'model_provider': 'model_provider',
    'model_name': 'model_name',
    'model_base_url': 'model_base_url',
    'model_api_key': 'model_api_key',
  };

  for (const [key, field] of Object.entries(fieldMap)) {
    if (data[field] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(
        ['interests', 'social_media_handles'].includes(key)
          ? JSON.stringify(data[field as keyof NPCCreateData])
          : data[field as keyof NPCCreateData]
      );
    }
  }

  if (updates.length === 0) return existing;

  updates.push('updated_at = ?');
  values.push(now(), id);

  db.prepare(`UPDATE npcs SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const updatedNpc = getNPCById(id);

  // Emit NPC updated event
  eventBus.fire(EventTypes.NPC_UPDATED, {
    npc_id: id,
    fields_changed: Object.keys(data),
  }, {
    source: 'npc',
    npc_id: id,
    importance: 0.5,
  });

  return updatedNpc;
}

// Deactivate NPC (soft delete)
export function deactivateNPC(id: string): boolean {
  const db = getDB('npc');
  const result = db.prepare('UPDATE npcs SET is_active = 0, updated_at = ? WHERE id = ?').run(now(), id);
  return result.changes > 0;
}

// Reactivate NPC
export function reactivateNPC(id: string): boolean {
  const db = getDB('npc');
  const result = db.prepare('UPDATE npcs SET is_active = 1, updated_at = ? WHERE id = ?').run(now(), id);
  return result.changes > 0;
}

// Delete NPC permanently
export function deleteNPC(id: string): boolean {
  const db = getDB('npc');
  const npc = getNPCById(id);
  const result = db.prepare('DELETE FROM npcs WHERE id = ?').run(id);

  if (result.changes > 0 && npc) {
    // Emit NPC deleted event
    eventBus.fire(EventTypes.NPC_DELETED, {
      npc_id: id,
      username: npc.username,
      display_name: npc.display_name,
    }, {
      source: 'npc',
      npc_id: id,
      importance: 0.7,
    });
  }

  return result.changes > 0;
}

// Helper to parse NPC data
function parseNPC(npc: any): NPC {
  return {
    id: npc.id,
    username: npc.username,
    display_name: npc.display_name,
    bio: npc.bio,
    personality: npc.personality,
    system_prompt: npc.system_prompt,
    avatar_url: npc.avatar_url,
    age: npc.age,
    gender: npc.gender,
    occupation: npc.occupation,
    interests: JSON.parse(npc.interests || '[]'),
    social_media_handles: JSON.parse(npc.social_media_handles || '{}'),
    model_provider: npc.model_provider as AIProvider,
    model_name: npc.model_name,
    model_base_url: npc.model_base_url,
    model_api_key: npc.model_api_key,
    created_at: npc.created_at,
    updated_at: npc.updated_at,
    is_active: npc.is_active,
  };
}

// Relationship operations
export interface Relationship {
  id: string;
  npc_id: string;
  target_npc_id: string;
  relationship_type: string | null;
  trust_level: number;
  affinity: number;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export function getNPCRelationships(npcId: string): Relationship[] {
  const db = getDB('npc');
  return db.prepare(`
    SELECT r.*, n.display_name as target_name
    FROM npc_relationships r
    JOIN npcs n ON r.target_npc_id = n.id
    WHERE r.npc_id = ?
    ORDER BY r.affinity DESC
  `).all(npcId) as any;
}

export function updateRelationship(
  npcId: string,
  targetNpcId: string,
  data: Partial<{ relationship_type: string; trust_level: number; affinity: number; notes: string }>
): Relationship | null {
  const db = getDB('npc');
  const id = generateId();

  const existing = db.prepare(
    'SELECT * FROM npc_relationships WHERE npc_id = ? AND target_npc_id = ?'
  ).get(npcId, targetNpcId);

  if (existing) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.relationship_type !== undefined) {
      updates.push('relationship_type = ?');
      values.push(data.relationship_type);
    }
    if (data.trust_level !== undefined) {
      updates.push('trust_level = ?');
      values.push(data.trust_level);
    }
    if (data.affinity !== undefined) {
      updates.push('affinity = ?');
      values.push(data.affinity);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    updates.push('updated_at = ?');
    values.push(now(), (existing as any).id);

    db.prepare(`UPDATE npc_relationships SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return getRelationship((existing as any).id);
  } else {
    db.prepare(`
      INSERT INTO npc_relationships (id, npc_id, target_npc_id, relationship_type, trust_level, affinity, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, npcId, targetNpcId, data.relationship_type || null, data.trust_level || 0, data.affinity || 0, data.notes || null);
    return getRelationship(id);
  }
}

export function getRelationship(id: string): Relationship | null {
  const db = getDB('npc');
  const rel = db.prepare('SELECT * FROM npc_relationships WHERE id = ?').get(id) as any;
  return rel || null;
}

export default {
  createNPC,
  getNPCById,
  getNPCByUsername,
  getAllNPCs,
  getActiveNPCs,
  updateNPC,
  deactivateNPC,
  reactivateNPC,
  deleteNPC,
  getNPCRelationships,
  updateRelationship,
};