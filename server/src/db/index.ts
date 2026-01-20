import { Database } from 'bun:sqlite';
import { join, dirname } from 'path';
import { mkdirSync, existsSync } from 'fs';

// Base data directory
const DATA_DIR = join(dirname(import.meta.url.replace('file://', '')), '../../data');

// Database file paths
const DB_PATHS = {
  user: join(DATA_DIR, 'user.db'),      // Player data - persistent
  game: join(DATA_DIR, 'game.db'),       // Game state - resettable
  npc: join(DATA_DIR, 'npc.db'),         // NPC definitions - persistent
};

// Ensure data directories exist
(['user', 'game', 'npc'] as const).forEach(dir => {
  const path = join(DATA_DIR, dir);
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
});

// Database instances
const databases: Record<'user' | 'game' | 'npc', Database> = {} as any;

// Get or create a database
export function getDB(type: 'user' | 'game' | 'npc'): Database {
  if (!databases[type]) {
    databases[type] = new Database(DB_PATHS[type]);
    initializeSchema(type);
  }
  return databases[type];
}

// Initialize schema based on database type
function initializeSchema(type: 'user' | 'game' | 'npc') {
  const db = databases[type]!;

  if (type === 'user') {
    // Player profile and settings - persistent
    db.exec(`
      CREATE TABLE IF NOT EXISTS player (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        display_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        reference_images TEXT, -- JSON array of user's photos for img2img
        image_generation_prompt TEXT, -- Description of user's appearance
        created_at INTEGER DEFAULT (unixepoch()),
        last_active INTEGER
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- === BUDGET SYSTEM ===
      CREATE TABLE IF NOT EXISTS budget_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        overall_limit_cents INTEGER NOT NULL DEFAULT 0,
        period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
        rollover_enabled INTEGER NOT NULL DEFAULT 1,
        max_rollover_days INTEGER DEFAULT 7,
        allocations TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS api_costs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER DEFAULT (unixepoch()),
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        feature_category TEXT NOT NULL,
        input_tokens INTEGER,
        output_tokens INTEGER,
        total_tokens INTEGER,
        cost_cents INTEGER NOT NULL,
        request_metadata TEXT,
        FOREIGN KEY (feature_category) REFERENCES feature_categories(name)
      );

      CREATE TABLE IF NOT EXISTS feature_categories (
        name TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        description TEXT,
        allocated_percentage REAL DEFAULT 0,
        allocated_cents_override INTEGER DEFAULT NULL
      );

      -- Indexes for budget queries
      CREATE INDEX IF NOT EXISTS idx_api_costs_timestamp ON api_costs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_api_costs_category ON api_costs(feature_category);
      CREATE INDEX IF NOT EXISTS idx_api_costs_provider ON api_costs(provider, model);

      -- Insert default feature categories
      INSERT OR IGNORE INTO feature_categories (name, display_name, description) VALUES
        ('npc_generation', 'NPC Creation', 'Generating new NPC personalities and profiles'),
        ('conversation', 'Conversations', 'Direct messaging and conversations with NPCs'),
        ('autonomous_posts', 'Background Posts', 'NPCs creating posts autonomously'),
        ('random_events', 'Random Events', 'NPCs initiating conversations or unexpected interactions'),
        ('npc_tuning', 'NPC Customization', 'Regenerating or tweaking NPC personalities'),
        ('image_generation', 'Image Generation', 'Profile pictures and post images (DALL-E, Stable Diffusion)'),
        ('vision_proxy', 'Vision Analysis', 'Analyzing images sent by users (proxy for non-vision models)'),
        ('other', 'Other', 'Miscellaneous AI operations');
    `);
  }

  if (type === 'npc') {
    // NPC identities and system prompts - persistent
    db.exec(`
      CREATE TABLE IF NOT EXISTS npcs (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,

        -- === BASE PROFILE (Fixed Fields) ===
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        age INTEGER,
        birthdate TEXT, -- ISO format YYYY-MM-DD
        gender TEXT,
        occupation TEXT,
        education TEXT, -- highest education level
        location TEXT, -- general location
        bio TEXT, -- short bio/description
        hobbies TEXT, -- JSON array of hobbies
        interests TEXT, -- JSON array of interests

        -- === DYNAMIC PERSONALITY (JSON) ===
        -- String traits that influence prompting:
        -- personality_style, communication_style, humor_style, love_language,
        -- relationship_goals, values, fears, dreams, etc.
        personality_traits TEXT,

        -- Boolean flags for context-specific behavior:
        -- is_romantic, is_flirty, is_shy, is_outgoing, is_jealous, is_loyal,
        -- is_adventurous, is_homebody, is_ambitious, is_chill, etc.
        personality_flags TEXT,

        -- === BEHAVIOR FLAGS (JSON) ===
        -- Controls what NPCs can/will do autonomously
        -- is_enabled_to_post_freely, can_initiate_conversations,
        -- can_send_images, can_request_images, is_active_hours_aware
        behavior_flags TEXT,

        -- === INTERESTS & TOPICS (JSON) ===
        -- Topic intensity map: { "science": 0.8, "dating": 0.6, "sports": 0.2 }
        -- Values 0-1 indicate how much they care about each topic
        topic_interests TEXT,

        -- === COMMUNICATION QUIRKS (JSON) ===
        -- Messaging style: verbosity, sarcasm, pessimism, formality,
        -- emoji_usage, typo_frequency, punctuation_style
        communication_quirks TEXT,

        -- === MESSAGE PATTERNS (JSON) ===
        -- How they send messages: multi_message_sender, typing_speed,
        -- average_response_delay_seconds, reads_immediately, uses_voice_messages
        message_patterns TEXT,

        -- === SYSTEM PROMPT ===
        system_prompt TEXT NOT NULL,

        -- === SOCIAL MEDIA ===
        social_media_handles TEXT, -- JSON object

        -- === REFERENCE IMAGES (for img2img consistency) ===
        profile_image_url TEXT, -- Main profile portrait (generated or uploaded)
        reference_images TEXT, -- JSON array of additional reference images
        image_generation_prompt TEXT, -- Base prompt used to generate their appearance

        -- === AI MODEL CONFIG (Per-NPC override) ===
        model_provider TEXT DEFAULT 'openai-compatible',
        model_name TEXT,
        model_base_url TEXT,
        model_api_key TEXT,

        -- === METADATA ===
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS npc_relationships (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        target_npc_id TEXT NOT NULL,
        relationship_type TEXT,
        trust_level REAL DEFAULT 0,
        affinity INTEGER DEFAULT 0,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (npc_id) REFERENCES npcs(id),
        FOREIGN KEY (target_npc_id) REFERENCES npcs(id),
        UNIQUE(npc_id, target_npc_id)
      );

      -- Player-NPC relationship stats
      CREATE TABLE IF NOT EXISTS player_npc_relationships (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        npc_id TEXT NOT NULL,

        -- Core stats (0-100)
        trust_level INTEGER DEFAULT 0,
        affinity INTEGER DEFAULT 0,
        familiarity INTEGER DEFAULT 0,

        -- Interaction tracking
        total_messages_sent INTEGER DEFAULT 0,
        total_messages_received INTEGER DEFAULT 0,
        total_images_shared INTEGER DEFAULT 0,
        total_posts_liked INTEGER DEFAULT 0,
        total_posts_commented INTEGER DEFAULT 0,

        -- Relationship stage
        relationship_stage TEXT DEFAULT 'stranger' CHECK (relationship_stage IN
          ('stranger', 'acquaintance', 'friend', 'close_friend', 'best_friend', 'romantic_interest', 'partner')),

        -- Timestamps
        first_interaction INTEGER DEFAULT (unixepoch()),
        last_interaction INTEGER,
        last_message_sent INTEGER,
        last_message_received INTEGER,

        -- Metadata
        notes TEXT,
        relationship_tags TEXT, -- JSON array: ["flirty", "supportive", "funny"]

        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),

        FOREIGN KEY (npc_id) REFERENCES npcs(id),
        UNIQUE(player_id, npc_id)
      );

      CREATE INDEX IF NOT EXISTS idx_player_npc_rel ON player_npc_relationships(player_id, npc_id);
      CREATE INDEX IF NOT EXISTS idx_npc_rel_stage ON player_npc_relationships(relationship_stage);
      CREATE INDEX IF NOT EXISTS idx_npc_rel_updated ON player_npc_relationships(updated_at);
    `);
  }

  if (type === 'game') {
    // Game state - memories, conversations, posts - resettable
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,

        -- Ownership
        owner_type TEXT NOT NULL CHECK (owner_type IN ('player', 'npc', 'system')),
        owner_id TEXT,

        -- Categorization
        category TEXT DEFAULT 'other' CHECK (category IN ('profile', 'reference', 'post', 'message', 'upload', 'generated', 'npc_config', 'memory_log', 'other')),
        tags TEXT,

        -- Associations
        npc_id TEXT,
        conversation_id TEXT,
        post_id TEXT,

        -- Metadata
        width INTEGER,
        height INTEGER,
        generated_prompt TEXT,
        description TEXT,

        -- Timestamps
        created_at INTEGER DEFAULT (unixepoch()),
        uploaded_at INTEGER DEFAULT (unixepoch()),

        FOREIGN KEY (npc_id) REFERENCES npcs(id),
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        participant_id TEXT,
        participant_type TEXT NOT NULL,
        platform TEXT NOT NULL,
        started_at INTEGER DEFAULT (unixepoch()),
        last_message_at INTEGER,
        context TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (unixepoch()),
        is_read INTEGER DEFAULT 0,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_id TEXT,
        content TEXT NOT NULL,
        importance REAL DEFAULT 0.5,
        embedding TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        expires_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        content TEXT NOT NULL,
        media_urls TEXT,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        engagement_score REAL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS post_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        npc_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS npc_activities (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        target_id TEXT,
        scheduled_for INTEGER,
        executed_at INTEGER,
        status TEXT DEFAULT 'pending',
        metadata TEXT
      );
    `);

    // Indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_memories_npc ON memories(npc_id);
      CREATE INDEX IF NOT EXISTS idx_posts_npc ON posts(npc_id);
      CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
      CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON npc_activities(scheduled_for, status);
      CREATE INDEX IF NOT EXISTS idx_media_owner ON media_files(owner_type, owner_id);
      CREATE INDEX IF NOT EXISTS idx_media_npc ON media_files(npc_id);
      CREATE INDEX IF NOT EXISTS idx_media_category ON media_files(category);
      CREATE INDEX IF NOT EXISTS idx_media_created ON media_files(created_at);
    `);
  }
}

// Utility functions
export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): number {
  return Math.floor(Date.now() / 1000);
}

// Close all databases
export function closeAll() {
  Object.keys(databases).forEach((key) => {
    const db = databases[key as keyof typeof databases];
    if (db) {
      db.close();
      delete databases[key as keyof typeof databases];
    }
  });
}

export default {
  getDB,
  generateId,
  now,
  closeAll,
};