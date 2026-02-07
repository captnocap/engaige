/**
 * Seed script: Insert lore NPCs into npc.db
 *
 * Run with: bun run server/data/seed/seed-lore-npcs.ts
 *
 * This inserts the "always-true" lore cast — characters that exist in every
 * playthrough. These are real NPC records backed by the full NPC pipeline
 * (AI queue, relationship system, autonomous posting, etc).
 */

import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';

// Resolve paths relative to this script
const SCRIPT_DIR = dirname(import.meta.url.replace('file://', ''));
const NPC_DB_PATH = join(SCRIPT_DIR, '..', 'npc.db');
const SEED_JSON_PATH = join(SCRIPT_DIR, 'npcs', 'lore-cast.json');

// Columns in the npcs table that we'll insert
const NPC_COLUMNS = [
  'id', 'username', 'display_name', 'avatar_url',
  'age', 'birthdate', 'gender', 'occupation', 'education', 'location', 'bio',
  'hobbies', 'interests',
  'personality_traits', 'personality_flags', 'behavior_flags',
  'topic_interests', 'communication_quirks', 'message_patterns',
  'system_prompt', 'core_knowledge',
  'social_media_handles',
  'profile_image_url', 'reference_images', 'image_generation_prompt',
  'is_active'
] as const;

function main() {
  console.log('=== Lore NPC Seed Script ===\n');

  // Read NPC data
  const raw = readFileSync(SEED_JSON_PATH, 'utf-8');
  const npcs: Record<string, any>[] = JSON.parse(raw);
  console.log(`Loaded ${npcs.length} NPCs from ${SEED_JSON_PATH}\n`);

  // Open database
  const db = new Database(NPC_DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Ensure core_knowledge column exists (migration for existing DBs)
  const columns = db.prepare("PRAGMA table_info(npcs)").all() as { name: string }[];
  if (!columns.some(c => c.name === 'core_knowledge')) {
    console.log('Adding core_knowledge column to npcs table...');
    db.exec('ALTER TABLE npcs ADD COLUMN core_knowledge TEXT;');
  }

  // Build INSERT OR REPLACE statement
  const placeholders = NPC_COLUMNS.map(() => '?').join(', ');
  const columnList = NPC_COLUMNS.join(', ');
  const stmt = db.prepare(
    `INSERT OR REPLACE INTO npcs (${columnList}) VALUES (${placeholders})`
  );

  // Insert each NPC in a transaction
  const insertAll = db.transaction(() => {
    let inserted = 0;
    let replaced = 0;

    for (const npc of npcs) {
      // Check if NPC already exists
      const existing = db.prepare('SELECT id FROM npcs WHERE id = ?').get(npc.id);

      // Build values array matching column order
      const values = NPC_COLUMNS.map(col => {
        const val = npc[col];
        if (val === undefined || val === null) return null;
        // Ensure JSON fields are strings
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });

      stmt.run(...values);

      if (existing) {
        replaced++;
        console.log(`  REPLACED: ${npc.id} (${npc.display_name})`);
      } else {
        inserted++;
        console.log(`  INSERTED: ${npc.id} (${npc.display_name})`);
      }
    }

    return { inserted, replaced };
  });

  const { inserted, replaced } = insertAll();

  // Verify
  const count = db.prepare('SELECT COUNT(*) as count FROM npcs').get() as { count: number };

  console.log(`\n--- Summary ---`);
  console.log(`  New: ${inserted}`);
  console.log(`  Replaced: ${replaced}`);
  console.log(`  Total NPCs in database: ${count.count}`);

  db.close();
  console.log('\nDone!');
}

main();
