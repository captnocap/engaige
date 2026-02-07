# Services (`/server/src/services/`)

Services contain **all core business logic** for engAIge. Each service is responsible for a specific domain (AI, conversations, social, media, etc.) and is called by WebSocket handlers or other services.

---

## 🎯 Purpose

Services implement:
- Game logic and rules
- Database operations
- AI integration
- Content generation
- Validation and safety
- State management

**Rule:** The frontend is a "dumb terminal" - ALL game logic lives in services.

---

## 📂 Service Categories

### AI & Intelligence

| Service | Purpose |
|---------|---------|
| **ai.ts** | AI provider integration (OpenAI, Anthropic, local models) |
| **ai-queue.ts** | Priority-based AI request queue with budget management |
| **ai-provider-config.ts** | Multi-provider configuration and model overrides |
| **reasoning-extractor.ts** | Extract NPC reasoning from AI responses |
| **deliberation.ts** | NPC internal thought process before responding |
| **model-capabilities.ts** | Check which models support vision/tools/etc. |

**Documentation:**
- [AI_QUEUE.md](../../../docs/completed/AI_QUEUE.md)
- [AI_PROVIDERS.md](../../../docs/completed/AI_PROVIDERS.md)

---

### NPC & Personality

| Service | Purpose |
|---------|---------|
| **npc.ts** | NPC CRUD operations (create, read, update, delete) |
| **npc-generator.ts** | Generate new NPCs with complete personalities |
| **npc-personality.ts** | Personality trait system and behavior flags |
| **npc-relationships.ts** | Relationship graph, stats, and stages |
| **npc-interaction.ts** | NPC-to-NPC interaction logic |
| **awareness.ts** | NPC awareness of game events and context |

**Documentation:**
- [NPC_PERSONALITY_SYSTEM.md](../../../docs/completed/NPC_PERSONALITY_SYSTEM.md)
- [NPC_THOUGHTS_SYSTEM.md](../../../docs/completed/NPC_THOUGHTS_SYSTEM.md)

---

### Conversation & Messaging

| Service | Purpose |
|---------|---------|
| **conversation.ts** | Conversation thread management (create, fetch, list) |
| **direct-chat.ts** | 1-on-1 conversation logic |
| **group-chat.ts** | Multi-NPC conversation logic |
| **context-builder.ts** | Build rich context for AI (messages + memories + personality) |
| **message-formatter.ts** | Apply NPC quirks to messages (typos, emoji, slang) |
| **message-access-validator.ts** | Validate message access permissions |

**Documentation:**
- [CONTEXT_SYSTEM.md](../../../docs/completed/CONTEXT_SYSTEM.md)
- [AUTONOMOUS_CONTEXT.md](../../../docs/completed/AUTONOMOUS_CONTEXT.md)

---

### Social & Content

| Service | Purpose |
|---------|---------|
| **social.ts** | Social posts (create, like, share, delete) |
| **comments.ts** | Threaded comments on posts |
| **instasnap-stories.ts** | Story features (24-hour posts) |
| **instasnap-saved.ts** | Saved posts collection |
| **hashtags.ts** | Hashtag tracking and trending |
| **search.ts** | Full-text search across posts/comments |

---

### Media & Images

| Service | Purpose |
|---------|---------|
| **media.ts** | Media file storage and retrieval |
| **image-generation-proxy.ts** | Proxy image generation to capable models |
| **vision-proxy.ts** | Proxy vision analysis to capable models |
| **image-compression.ts** | Compress images to meet API payload limits |
| **image-gen-config.ts** | Image generation provider templates |

**Documentation:**
- [IMAGE_GENERATION.md](../../../docs/completed/IMAGE_GENERATION.md)
- [PROXY_SYSTEM.md](../../../docs/completed/PROXY_SYSTEM.md)

---

### News & World Content

| Service | Purpose |
|---------|---------|
| **news-feed.ts** | News aggregation (RSS + lore + AI-generated) |
| **story-generator.ts** | AI-generated news articles from trending topics |
| **news-tasks.ts** | Background tasks for news generation |
| **site-content.ts** | Filler site content management (20+ sites) |

**Documentation:**
- [NEWS_FEED_SYSTEM.md](../../../docs/completed/NEWS_FEED_SYSTEM.md)
- [FILLER_SITES.md](../../../docs/FILLER_SITES.md)

---

### Drama & Simulation

| Service | Purpose |
|---------|---------|
| **drama-engine.ts** | NPC autonomous behavior simulation loop |
| **background-scheduler.ts** | Scheduled task execution |
| **scene-seed-generator.ts** | Generate drama scenarios |
| **seed-scorer.ts** | Score drama seed quality/appropriateness |

**Documentation:**
- [DRAMA_AUTOMATION.md](../../../docs/completed/DRAMA_AUTOMATION.md)
- [SCENE_SEED_SYSTEM.md](../../../docs/SCENE_SEED_SYSTEM.md)

---

### Validation & Safety

| Service | Purpose |
|---------|---------|
| **output-validator.ts** | Validate and auto-fix AI responses |
| **guardrails.ts** | Content rating enforcement (SFW to NSFW) |
| **message-access-validator.ts** | Check message access permissions |
| **platform-access.ts** | Check platform access permissions |

**Documentation:**
- [OUTPUT_VALIDATION.md](../../../docs/completed/OUTPUT_VALIDATION.md)
- [CONTENT_GUARDRAILS.md](../../../docs/CONTENT_GUARDRAILS.md)

---

### Budget & Tracking

| Service | Purpose |
|---------|---------|
| **budget.ts** | AI cost tracking and spending limits |
| **error-logger.ts** | Centralized error handling and logging |
| **broadcast.ts** | Push real-time updates to all connected clients |

**Documentation:**
- [ERROR_LOGGING.md](../../../docs/completed/ERROR_LOGGING.md)

---

### Relationships

| Service | Purpose |
|---------|---------|
| **relationships.ts** | Relationship state management (CRUD) |
| **npc-relationships.ts** | Relationship calculations and updates |
| **relationship-broadcaster.ts** | Broadcast relationship changes to clients |

---

### Player & Onboarding

| Service | Purpose |
|---------|---------|
| **player.ts** | Player profile management |
| **account.ts** | Account creation and authentication |
| **onboarding.ts** | Player onboarding flow |
| **personality-test.ts** | Player personality assessment (OCEAN) |

**Documentation:**
- [ONBOARDING_FLOW.md](../../../docs/ONBOARDING_FLOW.md)
- [PERSONALITY_ASSESSMENT.md](../../../docs/PERSONALITY_ASSESSMENT.md)

---

### Minigames

| Service | Purpose |
|---------|---------|
| **chess.ts** | Chess game logic (move validation, state) |
| **chess-engine.ts** | Chess AI opponent (Stockfish integration) |
| **chess-matchmaker.ts** | Match NPCs for chess games |
| **chess-leaderboard.ts** | Chess rankings and ELO |
| **pinball.ts** | Pinball game physics and scoring |
| **pinball-leaderboard.ts** | Pinball high scores |

---

### Video & Studio

| Service | Purpose |
|---------|---------|
| **npc-video-generator.ts** | Generate NPC videos (talking head, etc.) |
| **video-quiz.ts** | Video quiz creation |
| **video-quiz-resolver.ts** | Quiz answer validation and scoring |

**Documentation:**
- [NPC_VIDEO_GENERATION.md](../../../docs/NPC_VIDEO_GENERATION.md)

---

### Utilities

| Service | Purpose |
|---------|---------|
| **runtime-tools.ts** | Tools NPCs can call (generate_image, search_memories) |
| **export.ts** | Export world data (NPCs, conversations, media) |

**Documentation:**
- [RUNTIME_TOOLS.md](../../../docs/completed/RUNTIME_TOOLS.md)
- [FILES_SYSTEM.md](../../../docs/FILES_SYSTEM.md)

---

## 🎯 Service Patterns

### Database Operations

```typescript
import { getDB } from "../db/index.js";

export function getConversation(id: string) {
  const db = getDB("game");

  // Use parameterized queries (SQL injection protection)
  const conversation = db.query(
    "SELECT * FROM conversations WHERE id = ?",
    [id]
  ).get();

  return conversation;
}
```

### Event Emission

```typescript
import { eventBus, EventTypes } from "../events/index.js";

export async function sendMessage(conversationId: string, content: string) {
  // Save to database
  const message = saveMessageToDB(conversationId, content);

  // Emit event (CRITICAL)
  eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT, {
    conversation_id: conversationId,
    message_id: message.id,
    content
  }, {
    source: "conversation",
    importance: 0.7
  });

  return message;
}
```

### Error Handling

```typescript
import { errorLogger } from "./error-logger.js";

export async function riskyOperation(id: string) {
  try {
    return await performOperation(id);
  } catch (error) {
    // Use errorLogger, not console.error
    errorLogger.log(error, {
      source: "service_name",
      operation: "riskyOperation",
      id
    });

    // Re-throw if caller should handle
    throw error;

    // Or return fallback
    // return fallbackValue;
  }
}
```

### AI Calls

```typescript
import { queuedGenerateNPCResponse, Priority } from "./ai.js";

export async function generateResponse(npcId: string, context: any) {
  // ALWAYS use AI queue
  const response = await queuedGenerateNPCResponse(
    npcId,
    "Respond to player message",
    context,
    {
      priority: Priority.CRITICAL, // User-initiated
      isUserInitiated: true
    }
  );

  return response;
}
```

---

## 🚦 Best Practices

### Single Responsibility

**DO:**
```typescript
// One service, one domain
// conversation.ts - handles conversation CRUD
export function createConversation() { }
export function getConversation() { }
export function listConversations() { }
```

**DON'T:**
```typescript
// ❌ Don't mix unrelated domains
// conversation.ts
export function createConversation() { }
export function generateImage() { } // ❌ Wrong service
```

### Service Dependencies

**DO:**
```typescript
// Import other services as needed
import { getNPC } from "./npc.js";
import { getRelationship } from "./relationships.js";

export function buildContext(npcId: string, playerId: string) {
  const npc = getNPC(npcId);
  const relationship = getRelationship(npcId, playerId);
  // ...
}
```

**DON'T:**
```typescript
// ❌ Don't duplicate logic from other services
export function buildContext(npcId: string) {
  // ❌ Don't re-implement getNPC logic
  const db = getDB("npc");
  const npc = db.query("SELECT * FROM npcs WHERE id = ?", [npcId]).get();
}
```

### Always Emit Events

**DO:**
```typescript
export function createPost(content: string, npcId: string) {
  const post = savePostToDB(content, npcId);

  // Emit event
  eventBus.fire(EventTypes.SOCIAL_POST_CREATED, {
    post_id: post.id,
    npc_id: npcId
  });

  return post;
}
```

**DON'T:**
```typescript
export function createPost(content: string, npcId: string) {
  const post = savePostToDB(content, npcId);
  // ❌ No event emission - breaks event bus pattern
  return post;
}
```

---

## 🎯 Adding a New Service

### Template

```typescript
// services/my-service.ts
import { getDB } from "../db/index.js";
import { eventBus, EventTypes } from "../events/index.js";
import { errorLogger } from "./error-logger.js";

/**
 * Create a new entity
 */
export function createEntity(data: any) {
  try {
    const db = getDB("game");

    // Insert to database
    const result = db.query(
      "INSERT INTO entities (data) VALUES (?) RETURNING *",
      [JSON.stringify(data)]
    ).get();

    // Emit event
    eventBus.fire(EventTypes.ENTITY_CREATED, {
      entity_id: result.id
    }, {
      source: "my_service"
    });

    return result;
  } catch (error) {
    errorLogger.log(error, {
      source: "my_service",
      operation: "createEntity"
    });
    throw error;
  }
}

/**
 * Get entity by ID
 */
export function getEntity(id: string) {
  const db = getDB("game");
  return db.query("SELECT * FROM entities WHERE id = ?", [id]).get();
}
```

### Checklist

1. **Choose Domain** - What is this service responsible for?
2. **Define Interface** - What functions will it export?
3. **Add Database Ops** - Use parameterized queries
4. **Emit Events** - Fire events for all actions
5. **Handle Errors** - Use errorLogger
6. **Add Types** - Define types in `/types/`
7. **Document** - Add JSDoc comments
8. **Test** - Verify database, events, errors

---

## 📚 Documentation

- [GAME_SYSTEMS.md](../../../docs/GAME_SYSTEMS.md) - Complete game overview
- [EVENT_BUS_SPEC.md](../../../docs/completed/EVENT_BUS_SPEC.md) - Event architecture
- [ERROR_LOGGING.md](../../../docs/completed/ERROR_LOGGING.md) - Error handling
- [AI_QUEUE.md](../../../docs/completed/AI_QUEUE.md) - AI request queue
- [BACKEND.md](../../../docs/BACKEND.md) - Backend architecture
