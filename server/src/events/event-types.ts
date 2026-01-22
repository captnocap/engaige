/**
 * Event Types - All game event definitions
 *
 * Naming convention: 'category:action'
 * Example: 'conversation:message_sent', 'relationship:stage_changed'
 */

// ─────────────────────────────────────────────────────────────────
// Event Categories
// ─────────────────────────────────────────────────────────────────

export type EventCategory =
  | 'player'
  | 'npc'
  | 'conversation'
  | 'relationship'
  | 'social'
  | 'memory'
  | 'budget'
  | 'system'
  | 'scheduler'
  | 'ai'
  | 'media';

// ─────────────────────────────────────────────────────────────────
// Base Event Structure
// ─────────────────────────────────────────────────────────────────

export interface GameEvent<T = unknown> {
  id: string;
  event_type: string;
  category: EventCategory;
  payload: T;
  timestamp: number;

  // Optional context
  player_id?: string;
  npc_id?: string;
  conversation_id?: string;
  post_id?: string;

  // Metadata
  source: string;
  session_id?: string;
  importance?: number;
  parent_event_id?: string;
}

export interface EventContext {
  source: string;
  player_id?: string;
  npc_id?: string;
  conversation_id?: string;
  post_id?: string;
  session_id?: string;
  importance?: number;
  parent_event_id?: string;
}

// ─────────────────────────────────────────────────────────────────
// Event Payloads by Category
// ─────────────────────────────────────────────────────────────────

// === PLAYER EVENTS ===
export interface PlayerProfileUpdatedPayload {
  field: string;
  old_value?: unknown;
  new_value: unknown;
}

export interface PlayerSettingsChangedPayload {
  setting: string;
  old_value?: unknown;
  new_value: unknown;
}

export interface PlayerSessionPayload {
  session_id: string;
}

// === NPC EVENTS ===
export interface NPCCreatedPayload {
  npc_id: string;
  username: string;
  display_name: string;
  generation_method: 'ai' | 'manual' | 'import';
}

export interface NPCUpdatedPayload {
  npc_id: string;
  fields_changed: string[];
}

export interface NPCMoodChangedPayload {
  previous_mood?: string;
  new_mood: string;
  trigger?: string;
}

export interface NPCStatusPayload {
  npc_id: string;
  is_online: boolean;
}

// === CONVERSATION EVENTS ===
export interface MessagePayload {
  message_id: string;
  content: string;
  word_count: number;
  has_image?: boolean;
  image_urls?: string[];
}

export interface ConversationStartedPayload {
  conversation_id: string;
  platform: string;
  initiated_by: 'player' | 'npc';
}

export interface ConversationEndedPayload {
  conversation_id: string;
  total_messages: number;
  duration_seconds: number;
}

// === RELATIONSHIP EVENTS ===
export interface RelationshipStatsUpdatedPayload {
  trust_delta?: number;
  affinity_delta?: number;
  familiarity_delta?: number;
  new_trust: number;
  new_affinity: number;
  new_familiarity: number;
  trigger: string;
}

export interface RelationshipStageChangedPayload {
  previous_stage: string;
  new_stage: string;
  trust: number;
  affinity: number;
  familiarity: number;
}

export interface RelationshipMilestonePayload {
  milestone_type: string;
  value: number;
  description: string;
}

// === SOCIAL EVENTS ===
export interface PostCreatedPayload {
  post_id: string;
  platform: string;
  content: string;
  has_media: boolean;
  media_urls?: string[];
}

export interface PostInteractionPayload {
  post_id: string;
  interaction_type: 'like' | 'comment' | 'share';
  actor_type: 'player' | 'npc';
  actor_id: string;
  content?: string; // For comments
}

export interface ProfileViewedPayload {
  profile_owner_id: string;
  viewer_type: 'player' | 'npc';
  viewer_id: string;
  platform: string;
}

// === MEMORY EVENTS ===
export interface MemoryCreatedPayload {
  memory_id: string;
  content: string;
  importance: number;
  event_type: string;
  event_id?: string;
}

export interface MemoryRecalledPayload {
  memory_ids: string[];
  context: string;
  relevance_scores: number[];
}

export interface MemoryExpiredPayload {
  memory_id: string;
  content: string;
  age_seconds: number;
}

// === BUDGET EVENTS ===
export interface BudgetSpentPayload {
  cost_cents: number;
  feature_category: string;
  provider: string;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}

export interface BudgetWarningPayload {
  category: string;
  spent_cents: number;
  limit_cents: number;
  percentage_used: number;
}

export interface BudgetExhaustedPayload {
  category: string;
  spent_cents: number;
  limit_cents: number;
}

export interface BudgetAllocationChangedPayload {
  category: string;
  old_allocation?: number;
  new_allocation: number;
}

// === SYSTEM EVENTS ===
export interface SystemStartupPayload {
  version: string;
  port: number;
}

export interface SystemShutdownPayload {
  reason: string;
  uptime_seconds: number;
}

export interface SystemErrorPayload {
  error_type: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export interface WSConnectionPayload {
  session_id: string;
  client_count: number;
}

// === SCHEDULER EVENTS ===
export interface TaskScheduledPayload {
  task_id: string;
  task_type: string;
  scheduled_for: number;
  priority: number;
  budget_category: string;
}

export interface TaskExecutionPayload {
  task_id: string;
  task_type: string;
  duration_ms?: number;
  error_message?: string;
}

// === AI EVENTS ===
export interface AIRequestPayload {
  request_id: string;
  provider: string;
  model: string;
  prompt_tokens?: number;
  purpose: string;
}

export interface AIResponsePayload {
  request_id: string;
  provider: string;
  model: string;
  tokens_used: number;
  cost_cents: number;
  latency_ms: number;
}

export interface AIErrorPayload {
  request_id?: string;
  provider: string;
  model: string;
  error_type: string;
  message: string;
}

export interface AIProxiedPayload {
  original_model: string;
  proxy_model: string;
  proxy_type: 'vision' | 'image_generation';
  cost_cents: number;
}

// === AI PROVIDER EVENTS ===
export interface AIProviderCreatedPayload {
  provider_id: string;
  provider_name: string;
  provider_type: 'openai' | 'openai-compatible' | 'anthropic';
}

export interface AIProviderUpdatedPayload {
  provider_id: string;
  provider_name: string;
  fields_changed: string[];
}

export interface AIProviderDeletedPayload {
  provider_id: string;
  provider_name: string;
}

export interface AIProviderActivatedPayload {
  provider_id: string;
  provider_name: string;
  previous_provider_id?: string;
  previous_provider_name?: string;
}

// === AI QUEUE EVENTS ===
export interface AIQueuedPayload {
  request_id: string;
  priority: number;
  priority_name: string;
  type: string;
  estimated_cost: number;
  queue_position: number;
  queue_length: number;
}

export interface AIProcessingPayload {
  request_id: string;
  priority: number;
  type: string;
  attempt: number;
}

export interface AIDeferredPayload {
  request_id: string;
  priority: number;
  priority_name: string;
  type: string;
  reason: string;
  deferred_queue_length: number;
}

export interface AIQueueCompletedPayload {
  request_id: string;
  priority: number;
  type: string;
  wait_time_ms: number;
  processing_time_ms: number;
  estimated_cost: number;
}

export interface AIQueueFailedPayload {
  request_id: string;
  priority: number;
  type: string;
  error: string;
  attempts: number;
}

export interface AIQueueExpiredPayload {
  request_id: string;
  priority: number;
  type: string;
  age_ms: number;
}

export interface AIQueueResumedPayload {
  count: number;
  budget_percent: number;
}

// === MEDIA EVENTS ===
export interface MediaUploadedPayload {
  media_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  category: string;
}

export interface MediaGeneratedPayload {
  media_id: string;
  prompt: string;
  provider: string;
  model: string;
  cost_cents: number;
}

export interface MediaDeletedPayload {
  media_id: string;
  filename: string;
  reason?: string;
}

// === INSTASNAP EVENTS ===
export interface StoryCreatedPayload {
  story_id: string;
  author_id: string;
  author_type: 'player' | 'npc';
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  filter_applied?: string;
  expires_at: number;
}

export interface StoryViewedPayload {
  story_id: string;
  author_id: string;
  viewer_id: string;
  viewer_type: 'player' | 'npc';
}

export interface StoryExpiredPayload {
  story_id: string;
  author_id: string;
  author_type: 'player' | 'npc';
  view_count: number;
}

export interface PostSavedPayload {
  post_id: string;
  saver_id: string;
  collection_name?: string;
}

export interface PostUnsavedPayload {
  post_id: string;
  saver_id: string;
}

export interface HashtagUsedPayload {
  tag: string;
  post_id: string;
  author_id: string;
  author_type: 'player' | 'npc';
}

// === NPC THOUGHT & DELIBERATION EVENTS ===
export interface NPCThoughtCapturedPayload {
  thought_id: string;
  content: string;
  thought_type: 'in_character' | 'meta_ai' | 'unknown';
  confidence: number;
}

export interface NPCDeliberationStartedPayload {
  npc_id: string;
  target_loops: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  reason: string;
}

export interface NPCDeliberationCompletedPayload {
  npc_id: string;
  loops_completed: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  total_time_ms: number;
  thought_count: number;
}

// ─────────────────────────────────────────────────────────────────
// Event Type Constants
// ─────────────────────────────────────────────────────────────────

export const EventTypes = {
  // Player
  PLAYER_PROFILE_UPDATED: 'player:profile_updated',
  PLAYER_SETTINGS_CHANGED: 'player:settings_changed',
  PLAYER_LOGGED_IN: 'player:logged_in',
  PLAYER_LOGGED_OUT: 'player:logged_out',

  // NPC
  NPC_CREATED: 'npc:created',
  NPC_UPDATED: 'npc:updated',
  NPC_DELETED: 'npc:deleted',
  NPC_MOOD_CHANGED: 'npc:mood_changed',
  NPC_WENT_ONLINE: 'npc:went_online',
  NPC_WENT_OFFLINE: 'npc:went_offline',

  // Conversation
  CONVERSATION_STARTED: 'conversation:started',
  CONVERSATION_ENDED: 'conversation:ended',
  CONVERSATION_MESSAGE_SENT: 'conversation:message_sent',
  CONVERSATION_MESSAGE_RECEIVED: 'conversation:message_received',
  CONVERSATION_MESSAGE_READ: 'conversation:message_read',
  CONVERSATION_TYPING_STARTED: 'conversation:typing_started',
  CONVERSATION_TYPING_STOPPED: 'conversation:typing_stopped',

  // Relationship
  RELATIONSHIP_STATS_UPDATED: 'relationship:stats_updated',
  RELATIONSHIP_STAGE_CHANGED: 'relationship:stage_changed',
  RELATIONSHIP_FIRST_INTERACTION: 'relationship:first_interaction',
  RELATIONSHIP_MILESTONE: 'relationship:milestone',

  // Social
  SOCIAL_POST_CREATED: 'social:post_created',
  SOCIAL_POST_LIKED: 'social:post_liked',
  SOCIAL_POST_COMMENTED: 'social:post_commented',
  SOCIAL_POST_SHARED: 'social:post_shared',
  SOCIAL_PROFILE_VIEWED: 'social:profile_viewed',

  // Memory
  MEMORY_CREATED: 'memory:created',
  MEMORY_RECALLED: 'memory:recalled',
  MEMORY_EXPIRED: 'memory:expired',
  MEMORY_IMPORTANCE_UPDATED: 'memory:importance_updated',

  // Budget
  BUDGET_SPENT: 'budget:spent',
  BUDGET_WARNING: 'budget:warning',
  BUDGET_EXHAUSTED: 'budget:exhausted',
  BUDGET_ALLOCATION_CHANGED: 'budget:allocation_changed',

  // System
  SYSTEM_STARTUP: 'system:startup',
  SYSTEM_SHUTDOWN: 'system:shutdown',
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WS_CONNECTED: 'system:ws_connected',
  SYSTEM_WS_DISCONNECTED: 'system:ws_disconnected',

  // Scheduler
  SCHEDULER_TASK_SCHEDULED: 'scheduler:task_scheduled',
  SCHEDULER_TASK_STARTED: 'scheduler:task_started',
  SCHEDULER_TASK_COMPLETED: 'scheduler:task_completed',
  SCHEDULER_TASK_FAILED: 'scheduler:task_failed',
  SCHEDULER_TASK_CANCELLED: 'scheduler:task_cancelled',

  // AI
  AI_REQUEST_SENT: 'ai:request_sent',
  AI_RESPONSE_RECEIVED: 'ai:response_received',
  AI_ERROR: 'ai:error',
  AI_VISION_PROXIED: 'ai:vision_proxied',
  AI_IMAGE_GENERATED: 'ai:image_generated',

  // AI Providers
  AI_PROVIDER_CREATED: 'ai:provider_created',
  AI_PROVIDER_UPDATED: 'ai:provider_updated',
  AI_PROVIDER_DELETED: 'ai:provider_deleted',
  AI_PROVIDER_ACTIVATED: 'ai:provider_activated',

  // AI Queue
  AI_QUEUED: 'ai:queued',
  AI_PROCESSING: 'ai:processing',
  AI_DEFERRED: 'ai:deferred',
  AI_QUEUE_COMPLETED: 'ai:queue_completed',
  AI_QUEUE_FAILED: 'ai:queue_failed',
  AI_QUEUE_EXPIRED: 'ai:queue_expired',
  AI_QUEUE_RESUMED: 'ai:queue_resumed',

  // Media
  MEDIA_UPLOADED: 'media:uploaded',
  MEDIA_GENERATED: 'media:generated',
  MEDIA_DELETED: 'media:deleted',

  // News Feed
  NEWS_ARTICLE_INGESTED: 'news:article_ingested',
  NEWS_ARTICLE_MENTIONED: 'news:article_mentioned',
  NEWS_STORIES_GENERATED: 'news:stories_generated',
  NEWS_RSS_REFRESHED: 'news:rss_refreshed',

  // InstaSnap Stories
  SOCIAL_STORY_CREATED: 'social:story_created',
  SOCIAL_STORY_VIEWED: 'social:story_viewed',
  SOCIAL_STORY_EXPIRED: 'social:story_expired',
  SOCIAL_POST_SAVED: 'social:post_saved',
  SOCIAL_POST_UNSAVED: 'social:post_unsaved',
  SOCIAL_HASHTAG_USED: 'social:hashtag_used',

  // NPC Thoughts & Deliberation
  NPC_THOUGHT_CAPTURED: 'npc:thought_captured',
  NPC_DELIBERATION_STARTED: 'npc:deliberation_started',
  NPC_DELIBERATION_COMPLETED: 'npc:deliberation_completed',
} as const;

export type EventTypeValue = (typeof EventTypes)[keyof typeof EventTypes];
