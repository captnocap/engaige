/**
 * Global Database
 *
 * Manages global data that persists across all accounts:
 * - Account registry
 * - Shared AI provider configurations
 * - Global settings
 */

import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Base data directory
const DATA_DIR = join(dirname(import.meta.url.replace('file://', '')), '../../data');
const GLOBAL_DB_PATH = join(DATA_DIR, 'global.db');
const WORLDS_DIR = join(DATA_DIR, 'worlds');

// Ensure directories exist
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}
if (!existsSync(WORLDS_DIR)) {
  mkdirSync(WORLDS_DIR, { recursive: true });
}

// Database instance
let globalDB: Database | null = null;

/**
 * Get or create the global database
 */
export function getGlobalDB(): Database {
  if (!globalDB) {
    globalDB = new Database(GLOBAL_DB_PATH);
    initializeGlobalSchema();
  }
  return globalDB;
}

/**
 * Initialize global database schema
 */
function initializeGlobalSchema() {
  const db = globalDB!;

  db.exec(`
    -- Account registry
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      last_played_at INTEGER DEFAULT (unixepoch()),
      has_completed_onboarding INTEGER DEFAULT 0
    );

    -- Global settings (key-value store)
    CREATE TABLE IF NOT EXISTS global_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch())
    );

    -- Shared AI providers (moved from user.db)
    -- These are shared across all accounts
    CREATE TABLE IF NOT EXISTS shared_ai_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      provider_type TEXT NOT NULL CHECK (provider_type IN ('openai', 'openai-compatible', 'anthropic')),
      base_url TEXT,
      api_key TEXT,
      default_model TEXT NOT NULL,
      is_active INTEGER DEFAULT 0,
      is_enabled INTEGER DEFAULT 1,
      cost_config TEXT,
      supports_vision INTEGER DEFAULT 0,
      supports_tools INTEGER DEFAULT 1,
      max_context_tokens INTEGER,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    -- Shared image generation providers
    CREATE TABLE IF NOT EXISTS shared_image_gen_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      api_key TEXT,
      is_active INTEGER DEFAULT 0,
      default_payload TEXT NOT NULL,
      prompt_key TEXT NOT NULL DEFAULT 'prompt',
      reference_images_key TEXT,
      response_path TEXT NOT NULL,
      cost_per_image REAL DEFAULT 5,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_accounts_last_played ON accounts(last_played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_shared_ai_providers_active ON shared_ai_providers(is_active);
    CREATE INDEX IF NOT EXISTS idx_shared_image_gen_active ON shared_image_gen_providers(is_active);

    -- Initialize default AI providers if not exist
    INSERT OR IGNORE INTO shared_ai_providers (id, name, display_name, provider_type, base_url, default_model, is_active, is_enabled, supports_vision, supports_tools, max_context_tokens) VALUES
      ('local', 'local', 'Local LM Studio', 'openai-compatible', 'http://localhost:1234/v1', 'gpt-4o', 1, 1, 0, 1, 128000),
      ('openai', 'openai', 'OpenAI', 'openai', 'https://api.openai.com/v1', 'gpt-4o', 0, 1, 1, 1, 128000),
      ('anthropic', 'anthropic', 'Anthropic', 'anthropic', 'https://api.anthropic.com', 'claude-sonnet-4-20250514', 0, 1, 1, 1, 200000);

    -- Initialize default image gen provider if not exist
    INSERT OR IGNORE INTO shared_image_gen_providers (id, name, display_name, base_url, is_active, default_payload, prompt_key, response_path, cost_per_image) VALUES
      ('dalle3', 'dall-e-3', 'DALL-E 3', 'https://api.openai.com/v1/images/generations', 1,
        '{"model": "dall-e-3", "size": "1024x1024", "quality": "standard", "style": "vivid", "n": 1}',
        'prompt',
        'data.0.url',
        4);
  `);
}

/**
 * Get path to account's world directory
 */
export function getAccountWorldPath(accountId: string): string {
  return join(WORLDS_DIR, accountId);
}

/**
 * Ensure account world directory exists
 */
export function ensureAccountWorldDir(accountId: string): string {
  const worldPath = getAccountWorldPath(accountId);
  if (!existsSync(worldPath)) {
    mkdirSync(worldPath, { recursive: true });
  }
  return worldPath;
}

/**
 * Close the global database
 */
export function closeGlobalDB() {
  if (globalDB) {
    globalDB.close();
    globalDB = null;
  }
}

/**
 * Get a global setting
 */
export function getGlobalSetting(key: string): string | null {
  const db = getGlobalDB();
  const row = db.query('SELECT value FROM global_settings WHERE key = ?').get(key) as { value: string } | null;
  return row?.value || null;
}

/**
 * Set a global setting
 */
export function setGlobalSetting(key: string, value: string): void {
  const db = getGlobalDB();
  db.query(`
    INSERT INTO global_settings (key, value, updated_at)
    VALUES (?, ?, unixepoch())
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = unixepoch()
  `).run(key, value, value);
}

export default {
  getGlobalDB,
  getAccountWorldPath,
  ensureAccountWorldDir,
  closeGlobalDB,
  getGlobalSetting,
  setGlobalSetting,
};
