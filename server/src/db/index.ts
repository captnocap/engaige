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

      -- === PLAYER CHESS PROFILE ===
      CREATE TABLE IF NOT EXISTS player_chess_profile (
        id TEXT PRIMARY KEY CHECK (id = 'player'),
        elo_rating INTEGER DEFAULT 1200,
        peak_elo INTEGER DEFAULT 1200,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Initialize player chess profile
      INSERT OR IGNORE INTO player_chess_profile (id) VALUES ('player');

      -- === PLAYER PINBALL PROFILE ===
      CREATE TABLE IF NOT EXISTS player_pinball_profile (
        id TEXT PRIMARY KEY CHECK (id = 'player'),
        elo_rating INTEGER DEFAULT 1200,
        peak_elo INTEGER DEFAULT 1200,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        high_score INTEGER DEFAULT 0,
        current_win_streak INTEGER DEFAULT 0,
        best_win_streak INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Initialize player pinball profile
      INSERT OR IGNORE INTO player_pinball_profile (id) VALUES ('player');
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

      -- === CHESS PROFILES (NPC Chess Stats & ELO) ===
      CREATE TABLE IF NOT EXISTS chess_profiles (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL UNIQUE,
        elo_rating INTEGER DEFAULT 1200,
        peak_elo INTEGER DEFAULT 1200,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        draws INTEGER DEFAULT 0,
        skill_level INTEGER DEFAULT 5,
        playstyle TEXT DEFAULT 'balanced' CHECK (playstyle IN ('aggressive', 'defensive', 'balanced', 'tactical', 'positional')),
        last_game_at INTEGER,
        current_win_streak INTEGER DEFAULT 0,
        best_win_streak INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (npc_id) REFERENCES npcs(id)
      );

      CREATE INDEX IF NOT EXISTS idx_chess_profiles_elo ON chess_profiles(elo_rating DESC);
      CREATE INDEX IF NOT EXISTS idx_chess_profiles_npc ON chess_profiles(npc_id);

      -- === PINBALL PROFILES (NPC Pinball Stats & ELO) ===
      CREATE TABLE IF NOT EXISTS pinball_profiles (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL UNIQUE,
        elo_rating INTEGER DEFAULT 1200,
        peak_elo INTEGER DEFAULT 1200,
        total_games INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        high_score INTEGER DEFAULT 0,
        skill_level INTEGER DEFAULT 5,
        playstyle TEXT DEFAULT 'balanced' CHECK (playstyle IN ('aggressive', 'defensive', 'balanced', 'precise', 'chaotic')),
        last_game_at INTEGER,
        current_win_streak INTEGER DEFAULT 0,
        best_win_streak INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (npc_id) REFERENCES npcs(id)
      );

      CREATE INDEX IF NOT EXISTS idx_pinball_profiles_elo ON pinball_profiles(elo_rating DESC);
      CREATE INDEX IF NOT EXISTS idx_pinball_profiles_npc ON pinball_profiles(npc_id);
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

        -- Content guardrails rating
        content_rating TEXT DEFAULT 'normal' CHECK (content_rating IN ('harsh', 'strict', 'normal', 'relaxed', 'none')),

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
        content_rating TEXT DEFAULT 'normal' CHECK (content_rating IN ('harsh', 'strict', 'normal', 'relaxed', 'none')),
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
        engagement_score REAL DEFAULT 0,
        content_rating TEXT DEFAULT 'normal' CHECK (content_rating IN ('harsh', 'strict', 'normal', 'relaxed', 'none'))
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

      -- NPC Seed Clusters (tracks which NPCs were generated together from scene seeds)
      CREATE TABLE IF NOT EXISTS npc_seed_clusters (
        id TEXT PRIMARY KEY,
        seed_id TEXT NOT NULL,
        npc_ids TEXT NOT NULL,
        relationships TEXT NOT NULL,
        player_dynamics TEXT NOT NULL,
        wave_number INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_seed_clusters_seed ON npc_seed_clusters(seed_id);
      CREATE INDEX IF NOT EXISTS idx_seed_clusters_wave ON npc_seed_clusters(wave_number);
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

    // === CHESS SYSTEM ===
    db.exec(`
      -- Chess matches
      CREATE TABLE IF NOT EXISTS chess_matches (
        id TEXT PRIMARY KEY,
        white_player_id TEXT NOT NULL,
        white_player_type TEXT NOT NULL CHECK (white_player_type IN ('player', 'npc')),
        black_player_id TEXT NOT NULL,
        black_player_type TEXT NOT NULL CHECK (black_player_type IN ('player', 'npc')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
        result TEXT CHECK (result IN ('white_win', 'black_win', 'draw', 'abandoned')),
        termination_reason TEXT,
        moves TEXT NOT NULL DEFAULT '[]',
        current_fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        move_count INTEGER DEFAULT 0,
        white_elo_before INTEGER,
        black_elo_before INTEGER,
        white_elo_after INTEGER,
        black_elo_after INTEGER,
        elo_change INTEGER,
        started_at INTEGER DEFAULT (unixepoch()),
        completed_at INTEGER,
        last_move_at INTEGER
      );

      -- Chess moves (detailed move log)
      CREATE TABLE IF NOT EXISTS chess_moves (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL,
        move_number INTEGER NOT NULL,
        player_id TEXT NOT NULL,
        player_type TEXT NOT NULL CHECK (player_type IN ('player', 'npc')),
        move_notation TEXT NOT NULL,
        move_uci TEXT NOT NULL,
        fen_after TEXT NOT NULL,
        is_check INTEGER DEFAULT 0,
        is_checkmate INTEGER DEFAULT 0,
        time_taken_ms INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (match_id) REFERENCES chess_matches(id)
      );

      -- Chess indexes
      CREATE INDEX IF NOT EXISTS idx_chess_matches_white ON chess_matches(white_player_id, white_player_type);
      CREATE INDEX IF NOT EXISTS idx_chess_matches_black ON chess_matches(black_player_id, black_player_type);
      CREATE INDEX IF NOT EXISTS idx_chess_matches_status ON chess_matches(status);
      CREATE INDEX IF NOT EXISTS idx_chess_matches_started ON chess_matches(started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chess_moves_match ON chess_moves(match_id, move_number);
    `);

    // === PINBALL SYSTEM ===
    db.exec(`
      -- Pinball games
      CREATE TABLE IF NOT EXISTS pinball_games (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        player_type TEXT NOT NULL CHECK (player_type IN ('player', 'npc')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
        result TEXT CHECK (result IN ('win', 'loss', 'abandoned')),
        score INTEGER DEFAULT 0,
        benchmark_score INTEGER DEFAULT 0,
        balls_used INTEGER DEFAULT 0,
        max_combo INTEGER DEFAULT 0,
        duration_seconds INTEGER DEFAULT 0,
        elo_before INTEGER,
        elo_after INTEGER,
        elo_change INTEGER DEFAULT 0,
        started_at INTEGER DEFAULT (unixepoch()),
        completed_at INTEGER
      );

      -- Pinball indexes
      CREATE INDEX IF NOT EXISTS idx_pinball_games_player ON pinball_games(player_id, player_type);
      CREATE INDEX IF NOT EXISTS idx_pinball_games_status ON pinball_games(status);
      CREATE INDEX IF NOT EXISTS idx_pinball_games_started ON pinball_games(started_at DESC);
      CREATE INDEX IF NOT EXISTS idx_pinball_games_score ON pinball_games(score DESC);
    `);

    // === WORLD MAP SYSTEM ===
    db.exec(`
      -- City districts/neighborhoods (loaded from static JSON, cached in DB)
      CREATE TABLE IF NOT EXISTS districts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        bounds TEXT,
        color TEXT,
        peak_hours TEXT,
        vibe TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      );

      -- Buildings and venues (loaded from static JSON, cached in DB)
      CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        district_id TEXT,
        position TEXT,
        size TEXT,
        sprite_id TEXT,
        capacity INTEGER,
        is_residential INTEGER DEFAULT 0,
        is_workplace INTEGER DEFAULT 0,
        hours TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (district_id) REFERENCES districts(id)
      );

      -- Landmarks (notable locations for content reference)
      CREATE TABLE IF NOT EXISTS landmarks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        building_id TEXT,
        description TEXT,
        keywords TEXT,
        is_notable INTEGER DEFAULT 1,
        icon_emoji TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (building_id) REFERENCES buildings(id)
      );

      -- AI NPC current location tracking (runtime state)
      CREATE TABLE IF NOT EXISTS npc_locations (
        npc_id TEXT PRIMARY KEY,
        position TEXT NOT NULL,
        target_position TEXT,
        building_id TEXT,
        activity TEXT NOT NULL DEFAULT 'idle',
        activity_description TEXT,
        arrived_at INTEGER DEFAULT (unixepoch()),
        speed REAL DEFAULT 1.0,
        FOREIGN KEY (building_id) REFERENCES buildings(id)
      );

      -- NPC daily schedules
      CREATE TABLE IF NOT EXISTS npc_schedules (
        id TEXT PRIMARY KEY,
        npc_id TEXT NOT NULL,
        day_of_week INTEGER,
        hour INTEGER NOT NULL,
        building_id TEXT,
        activity TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (building_id) REFERENCES buildings(id)
      );

      -- Game time state (singleton row)
      CREATE TABLE IF NOT EXISTS game_time_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        game_start_real_time INTEGER NOT NULL,
        game_start_time INTEGER NOT NULL,
        time_multiplier REAL NOT NULL DEFAULT 15.0,
        is_paused INTEGER DEFAULT 0,
        paused_at INTEGER,
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- World map indexes
      CREATE INDEX IF NOT EXISTS idx_buildings_district ON buildings(district_id);
      CREATE INDEX IF NOT EXISTS idx_buildings_type ON buildings(type);
      CREATE INDEX IF NOT EXISTS idx_buildings_residential ON buildings(is_residential);
      CREATE INDEX IF NOT EXISTS idx_buildings_workplace ON buildings(is_workplace);
      CREATE INDEX IF NOT EXISTS idx_npc_locations_building ON npc_locations(building_id);
      CREATE INDEX IF NOT EXISTS idx_npc_schedules_npc ON npc_schedules(npc_id);
      CREATE INDEX IF NOT EXISTS idx_npc_schedules_hour ON npc_schedules(hour);
    `);

    // === 3D CITY SYSTEM ===
    db.exec(`
      -- City tile placements (generated once, persisted)
      -- Stores the 3D city layout from the ported city rendering system
      CREATE TABLE IF NOT EXISTS city_placements (
        id TEXT PRIMARY KEY,
        tile_x INTEGER NOT NULL,
        tile_y INTEGER NOT NULL,
        model_id TEXT NOT NULL,
        rotation INTEGER DEFAULT 0,
        building_id TEXT,              -- FK to buildings (for landmark buildings)
        landmark_id TEXT,              -- FK to landmarks
        zone_type TEXT,                -- residential/commercial/industrial
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(tile_x, tile_y),
        FOREIGN KEY (building_id) REFERENCES buildings(id),
        FOREIGN KEY (landmark_id) REFERENCES landmarks(id)
      );

      -- City generation state (singleton row)
      CREATE TABLE IF NOT EXISTS city_generation_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        city_size INTEGER NOT NULL DEFAULT 50,
        seed INTEGER NOT NULL DEFAULT 12345,
        generated_at INTEGER,
        placement_count INTEGER DEFAULT 0
      );

      -- City placements indexes
      CREATE INDEX IF NOT EXISTS idx_city_placements_coords ON city_placements(tile_x, tile_y);
      CREATE INDEX IF NOT EXISTS idx_city_placements_model ON city_placements(model_id);
      CREATE INDEX IF NOT EXISTS idx_city_placements_zone ON city_placements(zone_type);
      CREATE INDEX IF NOT EXISTS idx_city_placements_landmark ON city_placements(landmark_id);
    `);

    // === SITE CONTENT SYSTEM ===
    // Generic content storage for all filler sites (VidTube, WikiKnow, Threadit, etc.)
    db.exec(`
      -- Content creators/channels/authors (VidTube channels, blog authors, stores)
      CREATE TABLE IF NOT EXISTS site_channels (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,              -- 'vidtube', 'wikiknow', 'amaize', etc.
        slug TEXT NOT NULL,                 -- URL-friendly identifier
        name TEXT NOT NULL,

        -- Display
        avatar_emoji TEXT,                  -- Fallback emoji
        avatar_url TEXT,                    -- Image path

        -- Metadata (type-specific)
        description TEXT,
        metadata TEXT DEFAULT '{}',         -- JSON: subscribers, verified, etc.

        -- Stats
        follower_count INTEGER DEFAULT 0,
        content_count INTEGER DEFAULT 0,

        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),

        UNIQUE(site_id, slug)
      );

      -- All site content (videos, articles, products, posts, etc.)
      CREATE TABLE IF NOT EXISTS site_content (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,              -- 'vidtube', 'wikiknow', 'threadit', etc.
        content_type TEXT NOT NULL,         -- 'video', 'article', 'product', 'thread', 'listing'
        slug TEXT NOT NULL,                 -- URL-friendly identifier

        -- Hierarchy
        channel_id TEXT,                    -- FK to site_channels (for videos, products)
        parent_id TEXT,                     -- For nested content (subreddit -> thread)
        category TEXT,                      -- Primary category

        -- Core content
        title TEXT NOT NULL,
        subtitle TEXT,                      -- Subheadline, tagline
        body TEXT,                          -- Main content (markdown, HTML, or plain text)
        summary TEXT,                       -- Short description/excerpt

        -- Media
        thumbnail_emoji TEXT,               -- Emoji fallback
        thumbnail_url TEXT,                 -- Image path
        media_urls TEXT DEFAULT '[]',       -- JSON array of additional media

        -- Type-specific metadata (flexible JSON)
        -- Videos: duration, views, likes, dislikes, transcript
        -- Products: price, currency, seller, rating, stock
        -- Articles: author, reading_time, sentiment
        -- Threads: upvotes, downvotes, flair
        metadata TEXT DEFAULT '{}',

        -- Search & Discovery
        tags TEXT DEFAULT '[]',             -- JSON array of tags
        entities TEXT DEFAULT '[]',         -- JSON array of named entities (people, places)
        keywords TEXT,                      -- Space-separated keywords for FTS

        -- Engagement (updated at runtime)
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        engagement_score REAL DEFAULT 0,

        -- Status
        is_featured INTEGER DEFAULT 0,
        is_pinned INTEGER DEFAULT 0,
        is_archived INTEGER DEFAULT 0,

        -- Timestamps
        published_at INTEGER,               -- When content was "published" (game time)
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),

        FOREIGN KEY (channel_id) REFERENCES site_channels(id),
        FOREIGN KEY (parent_id) REFERENCES site_content(id),
        UNIQUE(site_id, slug)
      );

      -- Content comments (filler comments + player/NPC comments)
      CREATE TABLE IF NOT EXISTS site_content_comments (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL,           -- FK to site_content
        parent_comment_id TEXT,             -- NULL for top-level
        root_comment_id TEXT,               -- Thread root
        thread_depth INTEGER DEFAULT 0,

        -- Author (can be predefined or player/NPC)
        author_id TEXT,                     -- NULL for predefined filler comments
        author_type TEXT,                   -- 'player', 'npc', 'filler'
        author_name TEXT NOT NULL,
        author_avatar TEXT,                 -- Emoji or URL

        content TEXT NOT NULL,

        -- Engagement
        like_count INTEGER DEFAULT 0,
        dislike_count INTEGER DEFAULT 0,

        -- Filler-specific
        is_creator INTEGER DEFAULT 0,       -- Comment from content creator

        -- Timestamps
        published_at INTEGER,               -- Display timestamp
        created_at INTEGER DEFAULT (unixepoch()),

        FOREIGN KEY (content_id) REFERENCES site_content(id),
        FOREIGN KEY (parent_comment_id) REFERENCES site_content_comments(id),
        FOREIGN KEY (root_comment_id) REFERENCES site_content_comments(id)
      );

      -- Categories/sections for sites
      CREATE TABLE IF NOT EXISTS site_categories (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon_emoji TEXT,
        parent_id TEXT,                     -- For nested categories
        sort_order INTEGER DEFAULT 0,

        created_at INTEGER DEFAULT (unixepoch()),

        FOREIGN KEY (parent_id) REFERENCES site_categories(id),
        UNIQUE(site_id, slug)
      );

      -- Track migration snapshots for restore points
      CREATE TABLE IF NOT EXISTS content_migration_snapshots (
        id TEXT PRIMARY KEY,
        snapshot_name TEXT NOT NULL,
        description TEXT,

        -- What was migrated
        source_files TEXT NOT NULL,         -- JSON array of source file paths
        tables_affected TEXT NOT NULL,      -- JSON array of table names
        records_inserted INTEGER DEFAULT 0,
        records_updated INTEGER DEFAULT 0,
        records_deleted INTEGER DEFAULT 0,

        -- Backup file location
        backup_path TEXT NOT NULL,          -- Path to backup directory

        -- Status
        status TEXT DEFAULT 'completed',    -- 'completed', 'failed', 'rolled_back'
        error_message TEXT,

        created_at INTEGER DEFAULT (unixepoch()),
        rolled_back_at INTEGER
      );
    `);

    // Site content indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_site_content_site ON site_content(site_id);
      CREATE INDEX IF NOT EXISTS idx_site_content_type ON site_content(content_type);
      CREATE INDEX IF NOT EXISTS idx_site_content_channel ON site_content(channel_id);
      CREATE INDEX IF NOT EXISTS idx_site_content_parent ON site_content(parent_id);
      CREATE INDEX IF NOT EXISTS idx_site_content_category ON site_content(category);
      CREATE INDEX IF NOT EXISTS idx_site_content_published ON site_content(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_site_content_featured ON site_content(is_featured, site_id);
      CREATE INDEX IF NOT EXISTS idx_site_content_slug ON site_content(site_id, slug);

      CREATE INDEX IF NOT EXISTS idx_site_channels_site ON site_channels(site_id);
      CREATE INDEX IF NOT EXISTS idx_site_channels_slug ON site_channels(site_id, slug);

      CREATE INDEX IF NOT EXISTS idx_site_comments_content ON site_content_comments(content_id);
      CREATE INDEX IF NOT EXISTS idx_site_comments_parent ON site_content_comments(parent_comment_id);
      CREATE INDEX IF NOT EXISTS idx_site_comments_root ON site_content_comments(root_comment_id);

      CREATE INDEX IF NOT EXISTS idx_site_categories_site ON site_categories(site_id);
      CREATE INDEX IF NOT EXISTS idx_site_categories_parent ON site_categories(parent_id);

      CREATE INDEX IF NOT EXISTS idx_migration_snapshots_created ON content_migration_snapshots(created_at DESC);
    `);

    // Full-text search for site content
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS site_content_fts USING fts5(
        title,
        body,
        summary,
        keywords,
        content='site_content',
        content_rowid='rowid'
      );

      -- Triggers to keep FTS in sync
      CREATE TRIGGER IF NOT EXISTS site_content_fts_insert AFTER INSERT ON site_content BEGIN
        INSERT INTO site_content_fts(rowid, title, body, summary, keywords)
        VALUES (NEW.rowid, NEW.title, NEW.body, NEW.summary, NEW.keywords);
      END;

      CREATE TRIGGER IF NOT EXISTS site_content_fts_delete AFTER DELETE ON site_content BEGIN
        INSERT INTO site_content_fts(site_content_fts, rowid, title, body, summary, keywords)
        VALUES ('delete', OLD.rowid, OLD.title, OLD.body, OLD.summary, OLD.keywords);
      END;

      CREATE TRIGGER IF NOT EXISTS site_content_fts_update AFTER UPDATE ON site_content BEGIN
        INSERT INTO site_content_fts(site_content_fts, rowid, title, body, summary, keywords)
        VALUES ('delete', OLD.rowid, OLD.title, OLD.body, OLD.summary, OLD.keywords);
        INSERT INTO site_content_fts(rowid, title, body, summary, keywords)
        VALUES (NEW.rowid, NEW.title, NEW.body, NEW.summary, NEW.keywords);
      END;
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