import { getDB, generateId, now } from '../db/index.js';
import type { AIProvider } from './ai.js';

// Player Types
export interface PlayerProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  created_at: number;
  last_active: number;
}

export interface PlayerPreferences {
  preferred_npc_count: number;
  romantic_interest_level: 'none' | 'low' | 'medium' | 'high';
  platonic_friends_level: 'low' | 'medium' | 'high';
  interests: string[];
  personality_vibe: string; // e.g., "adventurous", "chill", "party person"
  relationship_style: string; // e.g., "slow burn", "fast-paced", "casual"
  npc_gender_preference: 'any' | 'male' | 'female' | 'mixed';
  age_range_preference: { min: number; max: number };
  occupation_preference: string[]; // types of jobs NPCs have
}

// Player Setup State
export interface PlayerSetupState {
  provider: AIProvider;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  profile: Partial<PlayerProfile>;
  preferences: Partial<PlayerPreferences>;
}

// Get or create player (first launch check)
export function getPlayer(id: string): PlayerProfile | null {
  const db = getDB('user');
  const player = db.prepare('SELECT * FROM player WHERE id = ?').get(id) as any;
  return player || null;
}

export function getPlayerByUsername(username: string): PlayerProfile | null {
  const db = getDB('user');
  const player = db.prepare('SELECT * FROM player WHERE username = ?').get(username) as any;
  return player || null;
}

export function createPlayer(
  username: string,
  displayName?: string,
  bio?: string
): PlayerProfile {
  const db = getDB('user');
  const id = generateId();

  db.prepare(`
    INSERT INTO player (id, username, display_name, bio)
    VALUES (?, ?, ?, ?)
  `).run(id, username, displayName || username, bio || '');

  return getPlayer(id)!;
}

export function updatePlayer(id: string, data: Partial<PlayerProfile>): PlayerProfile | null {
  const db = getDB('user');
  const existing = getPlayer(id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.display_name !== undefined) {
    updates.push('display_name = ?');
    values.push(data.display_name);
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    values.push(data.bio);
  }
  if (data.avatar_url !== undefined) {
    updates.push('avatar_url = ?');
    values.push(data.avatar_url);
  }

  if (updates.length === 0) return existing;

  updates.push('last_active = ?');
  values.push(now(), id);

  db.prepare(`UPDATE player SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return getPlayer(id);
}

// Player Preferences
export function getPlayerPreferences(playerId: string): PlayerPreferences | null {
  const db = getDB('user');
  const prefs = db.prepare('SELECT * FROM settings WHERE key = ?').get(`preferences_${playerId}`) as any;
  if (!prefs) return null;
  return JSON.parse(prefs.value);
}

export function savePlayerPreferences(playerId: string, prefs: PlayerPreferences): void {
  const db = getDB('user');
  db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES (?, ?)
  `).run(`preferences_${playerId}`, JSON.stringify(prefs));
}

// Check if player has completed onboarding
export function hasCompletedOnboarding(playerId: string): boolean {
  const db = getDB('user');
  const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(`onboarding_complete_${playerId}`) as any;
  return result?.value === 'true';
}

export function setOnboardingComplete(playerId: string): void {
  const db = getDB('user');
  db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES (?, ?)
  `).run(`onboarding_complete_${playerId}`, 'true');
}

// Global settings (not player-specific)
export function getGlobalSetting(key: string): string | null {
  const db = getDB('user');
  const result = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
  return result?.value || null;
}

export function setGlobalSetting(key: string, value: string): void {
  const db = getDB('user');
  db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES (?, ?)
  `).run(key, value);
}

export default {
  getPlayer,
  getPlayerByUsername,
  createPlayer,
  updatePlayer,
  getPlayerPreferences,
  savePlayerPreferences,
  hasCompletedOnboarding,
  setOnboardingComplete,
  getGlobalSetting,
  setGlobalSetting,
};