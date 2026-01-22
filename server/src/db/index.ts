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

      -- === IMAGE GENERATION PROVIDER CONFIGS ===
      -- Flexible schema: user defines complete payload, we just inject prompt + reference images
      CREATE TABLE IF NOT EXISTS image_gen_providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        base_url TEXT NOT NULL,
        api_key TEXT,
        is_active INTEGER DEFAULT 0,

        -- The complete default payload as JSON (all settings baked in)
        default_payload TEXT NOT NULL,

        -- Which keys to inject at runtime
        prompt_key TEXT NOT NULL DEFAULT 'prompt',
        reference_images_key TEXT, -- Optional, for img2img support (e.g., "imageDataUrls")

        -- Where to find the image in response
        response_path TEXT NOT NULL, -- JSON path like "data.0.url" or "artifacts.0.base64"

        -- For budget tracking (flat rate per image in cents)
        cost_per_image REAL DEFAULT 5,

        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Insert default provider configs (can be edited by user)
      -- DALL-E 3 with sensible defaults
      INSERT OR IGNORE INTO image_gen_providers (id, name, display_name, base_url, is_active, default_payload, prompt_key, response_path, cost_per_image) VALUES
        ('dalle3', 'dall-e-3', 'DALL-E 3', 'https://api.openai.com/v1/images/generations', 1,
          '{"model": "dall-e-3", "size": "1024x1024", "quality": "standard", "style": "vivid", "n": 1}',
          'prompt',
          'data.0.url',
          4);

      -- === AI PROVIDER CONFIGS ===
      CREATE TABLE IF NOT EXISTS ai_providers (
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

      -- Insert default AI providers (can be edited by user)
      INSERT OR IGNORE INTO ai_providers (id, name, display_name, provider_type, base_url, default_model, is_active, is_enabled, supports_vision, supports_tools, max_context_tokens) VALUES
        ('local', 'local', 'Local LM Studio', 'openai-compatible', 'http://localhost:1234/v1', 'gpt-4o', 1, 1, 0, 1, 128000),
        ('openai', 'openai', 'OpenAI', 'openai', 'https://api.openai.com/v1', 'gpt-4o', 0, 1, 1, 1, 128000),
        ('anthropic', 'anthropic', 'Anthropic', 'anthropic', 'https://api.anthropic.com', 'claude-sonnet-4-20250514', 0, 1, 1, 1, 200000);

      CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);
      CREATE INDEX IF NOT EXISTS idx_ai_providers_enabled ON ai_providers(is_enabled);

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
        -- New: Reference to ai_providers table (preferred method)
        ai_provider_id TEXT,
        -- Legacy: Inline config (backward compatibility)
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
        npc_id TEXT,                              -- For direct messages
        participant_id TEXT,                      -- For direct messages
        participant_type TEXT,                    -- 'player' or 'npc'
        conversation_type TEXT DEFAULT 'direct_message', -- 'direct_message', 'group_chat', 'post_comments'
        platform TEXT NOT NULL,

        -- For group chats
        participant_ids TEXT,                     -- JSON array of participant IDs
        group_name TEXT,

        -- For post comments (threaded discussions)
        parent_post_id TEXT,                      -- Which post this thread is on
        root_comment_id TEXT,                     -- Top-level comment

        started_at INTEGER DEFAULT (unixepoch()),
        last_message_at INTEGER,
        context TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,              -- 'player' or 'npc'
        sender_name TEXT,                       -- Display name (important for group chats)
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (unixepoch()),
        is_read INTEGER DEFAULT 0,
        metadata TEXT,                          -- JSON: has_image, image_urls, etc.
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
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

      -- Threaded comments on posts
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        parent_comment_id TEXT,                 -- NULL for top-level comments
        root_comment_id TEXT,                   -- Always points to thread root
        thread_depth INTEGER DEFAULT 0,         -- How deep in thread (0 = top-level)
        author_id TEXT NOT NULL,
        author_type TEXT NOT NULL,              -- 'player' or 'npc'
        author_name TEXT NOT NULL,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id),
        FOREIGN KEY (root_comment_id) REFERENCES comments(id)
      );

      -- Group chat participants
      CREATE TABLE IF NOT EXISTS group_chat_participants (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        participant_id TEXT NOT NULL,
        participant_type TEXT NOT NULL,         -- 'player' or 'npc'
        participant_name TEXT NOT NULL,
        joined_at INTEGER DEFAULT (unixepoch()),
        last_read_at INTEGER,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        UNIQUE(conversation_id, participant_id)
      );

      CREATE TABLE IF NOT EXISTS npc_activities (
        id TEXT PRIMARY KEY,
        npc_id TEXT,  -- Nullable: some tasks (news, system) aren't NPC-specific
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

      -- Group chat & threaded comments indexes
      CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
      CREATE INDEX IF NOT EXISTS idx_conversations_post ON conversations(parent_post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
      CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(root_comment_id);
      CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at);
      CREATE INDEX IF NOT EXISTS idx_group_participants ON group_chat_participants(conversation_id);
    `);

    // === NEWS FEED SYSTEM ===
    db.exec(`
      -- Core news articles table (unified schema for RSS, user lore, AI-generated)
      CREATE TABLE IF NOT EXISTS news_articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,

        -- Source tracking (internal only - NPCs don't see this distinction)
        source TEXT NOT NULL CHECK (source IN ('rss', 'user', 'ai')),
        source_url TEXT,
        source_feed TEXT,

        -- Content
        headline TEXT NOT NULL,
        subheadline TEXT,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,

        -- Metadata
        category TEXT NOT NULL,
        author TEXT NOT NULL,
        published_at INTEGER NOT NULL,
        updated_at INTEGER,

        -- Media
        image_url TEXT,
        image_caption TEXT,
        image_emoji TEXT,

        -- Classification (JSON arrays)
        tags TEXT DEFAULT '[]',
        entities TEXT DEFAULT '[]',
        sentiment TEXT,

        -- Engagement tracking
        npc_mentions INTEGER DEFAULT 0,
        last_mentioned_at INTEGER,

        -- AI generation metadata (JSON object, only for source: 'ai')
        generated_from TEXT,

        -- Timestamps
        created_at INTEGER DEFAULT (unixepoch()),

        -- Prevent RSS duplicates
        UNIQUE(source, source_url)
      );

      -- RSS feed configuration
      CREATE TABLE IF NOT EXISTS rss_feeds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        refresh_interval INTEGER DEFAULT 30,
        max_articles INTEGER DEFAULT 20,
        enabled INTEGER DEFAULT 1,
        include_keywords TEXT,        -- JSON array
        exclude_keywords TEXT,        -- JSON array
        last_fetched_at INTEGER,
        last_error TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- Track which articles NPCs have "seen" (for context injection)
      CREATE TABLE IF NOT EXISTS npc_news_exposure (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        article_id TEXT NOT NULL,
        exposed_at INTEGER DEFAULT (unixepoch()),
        mentioned INTEGER DEFAULT 0,
        FOREIGN KEY (article_id) REFERENCES news_articles(id),
        UNIQUE(npc_id, article_id)
      );

      -- News feed indexes
      CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);
      CREATE INDEX IF NOT EXISTS idx_news_source ON news_articles(source);
      CREATE INDEX IF NOT EXISTS idx_news_mentions ON news_articles(npc_mentions DESC);
      CREATE INDEX IF NOT EXISTS idx_news_slug ON news_articles(slug);
      CREATE INDEX IF NOT EXISTS idx_npc_exposure_npc ON npc_news_exposure(npc_id);
      CREATE INDEX IF NOT EXISTS idx_npc_exposure_article ON npc_news_exposure(article_id);
      CREATE INDEX IF NOT EXISTS idx_rss_enabled ON rss_feeds(enabled);
    `);

    // === INSTASNAP SYSTEM ===
    db.exec(`
      -- Stories (24-hour ephemeral posts)
      CREATE TABLE IF NOT EXISTS instasnap_stories (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        author_type TEXT CHECK (author_type IN ('player', 'npc')),
        media_url TEXT NOT NULL,
        media_type TEXT CHECK (media_type IN ('image', 'video')),
        caption TEXT,
        filter_applied TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        expires_at INTEGER NOT NULL,
        view_count INTEGER DEFAULT 0
      );

      -- Story view tracking
      CREATE TABLE IF NOT EXISTS instasnap_story_views (
        id TEXT PRIMARY KEY,
        story_id TEXT NOT NULL,
        viewer_id TEXT NOT NULL,
        viewer_type TEXT CHECK (viewer_type IN ('player', 'npc')),
        viewed_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(story_id, viewer_id)
      );

      -- Saved posts (bookmarks)
      CREATE TABLE IF NOT EXISTS instasnap_saved_posts (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        saver_id TEXT NOT NULL,
        saved_at INTEGER DEFAULT (unixepoch()),
        collection_name TEXT DEFAULT 'All Posts',
        UNIQUE(post_id, saver_id)
      );

      -- Hashtags
      CREATE TABLE IF NOT EXISTS instasnap_hashtags (
        id TEXT PRIMARY KEY,
        tag TEXT UNIQUE NOT NULL,
        usage_count INTEGER DEFAULT 1,
        trending_score REAL DEFAULT 0,
        last_used_at INTEGER DEFAULT (unixepoch())
      );

      -- Post-hashtag links
      CREATE TABLE IF NOT EXISTS instasnap_post_hashtags (
        post_id TEXT NOT NULL,
        hashtag_id TEXT NOT NULL,
        PRIMARY KEY (post_id, hashtag_id)
      );

      -- InstaSnap indexes
      CREATE INDEX IF NOT EXISTS idx_instasnap_stories_author ON instasnap_stories(author_id, author_type);
      CREATE INDEX IF NOT EXISTS idx_instasnap_stories_expires ON instasnap_stories(expires_at);
      CREATE INDEX IF NOT EXISTS idx_instasnap_story_views_story ON instasnap_story_views(story_id);
      CREATE INDEX IF NOT EXISTS idx_instasnap_story_views_viewer ON instasnap_story_views(viewer_id);
      CREATE INDEX IF NOT EXISTS idx_instasnap_saved_saver ON instasnap_saved_posts(saver_id);
      CREATE INDEX IF NOT EXISTS idx_instasnap_saved_post ON instasnap_saved_posts(post_id);
      CREATE INDEX IF NOT EXISTS idx_instasnap_hashtags_trending ON instasnap_hashtags(trending_score DESC);
      CREATE INDEX IF NOT EXISTS idx_instasnap_post_hashtags_post ON instasnap_post_hashtags(post_id);
      CREATE INDEX IF NOT EXISTS idx_instasnap_post_hashtags_hashtag ON instasnap_post_hashtags(hashtag_id);
    `);

    // === NPC THOUGHTS & DELIBERATION SYSTEM ===
    db.exec(`
      -- Extracted thoughts from AI reasoning blocks
      -- Stores both in-character thoughts (for "NPC thoughts" UI) and meta-AI reasoning (for debugging)
      CREATE TABLE IF NOT EXISTS npc_thoughts (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        content TEXT NOT NULL,

        -- Classification
        thought_type TEXT NOT NULL CHECK (thought_type IN ('in_character', 'meta_ai', 'unknown')),
        confidence REAL DEFAULT 0.5,           -- 0-1 confidence in classification

        -- Context
        context TEXT,                          -- What triggered this thought (user message, etc.)
        conversation_id TEXT,

        -- Metadata
        thinking_style TEXT,                   -- 'quick', 'normal', 'deliberate', 'agonizing'
        deliberation_loop INTEGER,             -- Which loop this came from (1, 2, 3...)

        -- Timestamps
        created_at INTEGER DEFAULT (unixepoch()),

        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );

      -- Deliberation sessions (tracks when NPCs went through extended thinking)
      CREATE TABLE IF NOT EXISTS deliberation_sessions (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        conversation_id TEXT,

        -- Deliberation details
        total_loops INTEGER NOT NULL,
        thinking_style TEXT NOT NULL,
        depth_reason TEXT,                     -- Why this depth was chosen

        -- Timing
        total_time_ms INTEGER,
        started_at INTEGER DEFAULT (unixepoch()),
        completed_at INTEGER,

        -- The trigger
        trigger_message TEXT,

        -- Result
        final_response TEXT,

        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );

      -- NPC thoughts indexes
      CREATE INDEX IF NOT EXISTS idx_npc_thoughts_npc ON npc_thoughts(npc_id);
      CREATE INDEX IF NOT EXISTS idx_npc_thoughts_type ON npc_thoughts(thought_type);
      CREATE INDEX IF NOT EXISTS idx_npc_thoughts_created ON npc_thoughts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_npc_thoughts_conversation ON npc_thoughts(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_npc_thoughts_confidence ON npc_thoughts(confidence);

      CREATE INDEX IF NOT EXISTS idx_deliberation_npc ON deliberation_sessions(npc_id);
      CREATE INDEX IF NOT EXISTS idx_deliberation_started ON deliberation_sessions(started_at DESC);
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