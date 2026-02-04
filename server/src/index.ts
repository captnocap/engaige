/**
 * engAIge Server
 *
 * Client <-> Server: WebSocket (100% WS communication)
 * Server <-> Internet: HTTP through the "door" (with optional proxy)
 * All Game Events: Through the "event bus" (centralized logging)
 */

import {
  handleOpen,
  handleClose,
  handleMessage,
  getClientCount,
  broadcastThought,
  broadcastDeliberationStarted,
  broadcastDeliberationCompleted,
  broadcastSocialEvent,
  type ClientSession,
} from './network/ws-server.js';
import { getDB } from './db/index.js';
import { getGlobalDB } from './db/global-db.js';
import { eventBus, EventTypes } from './events/index.js';
import { errorLogger } from './services/error-logger.js';
import { aiQueue } from './services/ai-queue.js';
import { startScheduler } from './services/background-scheduler.js';

// Agents
import { initializeMemoryWriter } from './agents/memory-writer.js';
import { initializeProfilePopulator } from './agents/profile-populator.js';
import { initializeRelationshipAnalyzer } from './agents/relationship-analyzer.js';
import { initializeSocialAutopilot, startSocialAutopilot } from './agents/social-autopilot.js';
import { initializeConversationInitiator, startConversationInitiator } from './agents/conversation-initiator.js';
import { initializeNewsTasks, scheduleStoryGeneration } from './services/news-tasks.js';
import { initializeChessAutopilot, startChessAutopilot, initializeChessProfilesForExistingNPCs } from './agents/chess-autopilot.js';
import { searchService, indexDynamicContent } from './services/search.js';

const PORT = 4269;

// ─────────────────────────────────────────────────────────────────
// Initialize Core Systems (must happen before server starts)
// ─────────────────────────────────────────────────────────────────
// Initialize global database (shared across all accounts)
const globalDb = getGlobalDB();
console.log('[Server] Global database initialized');

// Initialize per-world databases (will be account-scoped in future)
const gameDb = getDB('game');
eventBus.initialize(gameDb);
errorLogger.initialize(gameDb);

// Initialize social schema (additional tables for likes/views tracking)
import { initializeSocialSchema } from './services/social.js';
initializeSocialSchema();

// Initialize awareness schema (NPC social media habits and tracking)
import { initializeAwarenessSchema, initializeDefaultHabits } from './services/awareness.js';
initializeAwarenessSchema();
initializeDefaultHabits();

aiQueue.start();

// ─────────────────────────────────────────────────────────────────
// NPC Thoughts Event Listeners (broadcast to WebSocket subscribers)
// ─────────────────────────────────────────────────────────────────
eventBus.on(EventTypes.NPC_THOUGHT_CAPTURED, async (event) => {
  const { getNPCById } = await import('./services/npc.js');
  const npc = getNPCById(event.npc_id!);

  broadcastThought({
    thought_id: event.payload.thought_id,
    npc_id: event.npc_id!,
    npc_display_name: npc?.display_name || 'Unknown',
    content: event.payload.content,
    thought_type: event.payload.thought_type,
    confidence: event.payload.confidence,
    context: event.conversation_id ? undefined : undefined, // Add context if available
    conversation_id: event.conversation_id,
    created_at: event.timestamp,
  });
});

eventBus.on(EventTypes.NPC_DELIBERATION_STARTED, async (event) => {
  const { getNPCById } = await import('./services/npc.js');
  const npc = getNPCById(event.npc_id!);

  broadcastDeliberationStarted({
    npc_id: event.npc_id!,
    npc_display_name: npc?.display_name || 'Unknown',
    target_loops: event.payload.target_loops,
    thinking_style: event.payload.thinking_style,
    reason: event.payload.reason,
    conversation_id: event.conversation_id,
  });
});

eventBus.on(EventTypes.NPC_DELIBERATION_COMPLETED, async (event) => {
  const { getNPCById } = await import('./services/npc.js');
  const npc = getNPCById(event.npc_id!);

  broadcastDeliberationCompleted({
    npc_id: event.npc_id!,
    npc_display_name: npc?.display_name || 'Unknown',
    loops_completed: event.payload.loops_completed,
    thinking_style: event.payload.thinking_style,
    total_time_ms: event.payload.total_time_ms,
    thought_count: event.payload.thought_count,
    conversation_id: event.conversation_id,
  });
});

// ─────────────────────────────────────────────────────────────────
// Search Index Event Listeners (index dynamic NPC content)
// ─────────────────────────────────────────────────────────────────

// Initialize search index (loads static content on startup)
searchService.initialize().then(() => {
  console.log('[Server] Search index initialized');
}).catch((err) => {
  console.error('[Server] Failed to initialize search index:', err);
});

// Index social posts when created
eventBus.on(EventTypes.SOCIAL_POST_CREATED, async (event) => {
  const { getNPCById } = await import('./services/npc.js');
  const npc = event.npc_id ? getNPCById(event.npc_id) : null;

  await indexDynamicContent({
    id: `post_${event.payload.post_id}`,
    url: `www.${event.payload.platform}.corn/post/${event.payload.post_id}`,
    siteDomain: `${event.payload.platform}.corn`,
    contentType: 'post',
    title: event.payload.content.slice(0, 100),
    body: event.payload.content,
    snippet: event.payload.content.slice(0, 200),
    author: npc?.display_name,
    tags: event.payload.hashtags || [],
    createdAt: event.timestamp,
  });

  // Broadcast to subscribed WebSocket clients
  const { getPost } = await import('./services/social.js');
  const post = getPost(event.payload.post_id);
  if (post) {
    broadcastSocialEvent('social:postCreated', { post });
  }
});

// Broadcast post likes to WebSocket subscribers
eventBus.on(EventTypes.SOCIAL_POST_LIKED, async (event) => {
  const { getPost } = await import('./services/social.js');
  const post = getPost(event.payload.post_id);
  broadcastSocialEvent('social:postLiked', {
    postId: event.payload.post_id,
    likerId: event.payload.actor_id,
    likerType: event.payload.actor_type,
    newLikesCount: post?.likesCount || 0,
  });
});

// Broadcast comments to WebSocket subscribers
eventBus.on(EventTypes.SOCIAL_POST_COMMENTED, async (event) => {
  const { getComments } = await import('./services/social.js');
  const comments = getComments(event.payload.post_id);
  const newComment = comments[comments.length - 1]; // Most recent comment
  if (newComment) {
    broadcastSocialEvent('social:commentAdded', {
      postId: event.payload.post_id,
      comment: newComment,
    });
  }
});

// Index news articles when ingested
eventBus.on(EventTypes.NEWS_ARTICLE_INGESTED, async (event) => {
  await indexDynamicContent({
    id: `article_${event.payload.article_id}`,
    url: `www.dailybuzz.corn/article/${event.payload.slug}`,
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: event.payload.headline,
    body: event.payload.content,
    snippet: event.payload.summary,
    author: event.payload.author,
    tags: event.payload.tags || [],
    createdAt: event.timestamp,
  });
});

// ─────────────────────────────────────────────────────────────────
// Initialize Agents (register task handlers)
// ─────────────────────────────────────────────────────────────────
initializeMemoryWriter();
initializeProfilePopulator();
initializeRelationshipAnalyzer();
initializeSocialAutopilot();
initializeConversationInitiator();
initializeNewsTasks();
initializeChessAutopilot();

// Initialize chess profiles for any existing NPCs
initializeChessProfilesForExistingNPCs();

// ─────────────────────────────────────────────────────────────────
// Start Background Systems
// ─────────────────────────────────────────────────────────────────
startScheduler(30); // Process tasks every 30 seconds
scheduleStoryGeneration({ intervalHours: 6, startDelayMinutes: 5 });

// Start autonomous behaviors after a short delay (let system stabilize)
setTimeout(async () => {
  startSocialAutopilot({ initialBurst: true, postIntervalMinutes: 45 });
  startConversationInitiator({ checkIntervalMinutes: 60 });
  startChessAutopilot({ initialBurst: true, matchIntervalHours: 2 });

  // Start awareness checks (NPCs checking social media based on their habits)
  const { simulateSocialMediaChecks } = await import('./services/awareness.js');
  setInterval(async () => {
    try {
      const sessions = await simulateSocialMediaChecks();
      if (sessions.length > 0) {
        console.log(`[Awareness] ${sessions.length} NPCs checked social media`);
      }
    } catch (err) {
      errorLogger.log(err, {
        source: 'awareness',
        operation: 'simulateSocialMediaChecks',
      });
    }
  }, 60 * 1000); // Check every minute

  console.log('[Server] Autonomous NPC behaviors started (social, chat, chess, awareness)');
}, 5000);

// Simple CORS headers for any HTTP endpoints (health check, etc.)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection',
};

// JSON response helper
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

const server = Bun.serve<ClientSession>({
  port: PORT,

  // HTTP handler (minimal - just health check and WS upgrade)
  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // WebSocket upgrade
    if (path === '/ws') {
      const upgraded = server.upgrade(req, {
        data: { id: '', connectedAt: 0 }, // Filled in handleOpen
      });

      if (upgraded) {
        return undefined; // Bun handles the upgrade
      }

      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    // Health check (still useful for monitoring)
    if (path === '/health' || path === '/') {
      return json({
        status: 'ok',
        timestamp: Date.now(),
        clients: getClientCount(),
        version: '0.1.0',
      });
    }

    // 404 for unknown routes
    return json({ error: 'Not found. Connect via WebSocket at /ws' }, 404);
  },

  // WebSocket handlers
  websocket: {
    open(ws) {
      handleOpen(ws);
    },

    close(ws) {
      handleClose(ws);
    },

    async message(ws, message) {
      await handleMessage(ws, message);
    },

    // Optional: handle drain (backpressure relief)
    drain(ws) {
      console.log('[WS] Backpressure relieved');
    },
  },
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                    engAIge Server                          ║
╠════════════════════════════════════════════════════════════╣
║  WebSocket:  ws://localhost:${PORT}/ws                       ║
║  Health:     http://localhost:${PORT}/health                 ║
╠════════════════════════════════════════════════════════════╣
║  Client <-> Server: WebSocket                              ║
║  Server <-> Internet: HTTP (door with proxy support)       ║
║  AI Requests: Queue (priority + budget management)         ║
║  Game Events: Event Bus (centralized logging)              ║
║  Errors: Error Logger (centralized tracking)               ║
╠════════════════════════════════════════════════════════════╣
║  Agents: Memory, Profile, Relationship, Social, Chat, Chess║
║  Scheduler: Running (30s interval)                         ║
║  Autonomous: NPCs post, DM, and play chess on their own!   ║
╚════════════════════════════════════════════════════════════╝
`);

// Emit startup event
eventBus.fire(EventTypes.SYSTEM_STARTUP, {
  version: '0.1.0',
  port: PORT,
}, { source: 'system' });
