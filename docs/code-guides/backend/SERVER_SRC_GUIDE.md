# Server Source (`/server/src/`)

This directory contains all server-side game logic, services, and infrastructure for engAIge. The frontend is a "dumb terminal" - **ALL game logic runs here**.

---

## 📁 Directory Structure

```
server/src/
├── agents/           # Background agents that process events asynchronously
├── config/           # Configuration management and validation
├── db/               # Database schemas, migrations, and initialization
├── events/           # Event bus (central nervous system) and event types
├── network/          # WebSocket server and HTTP door
│   └── ws-handlers/  # WebSocket message handlers
├── routes/           # HTTP routes (minimal - mostly WebSocket-based)
├── services/         # Core business logic and game systems
│   └── world/        # World-specific services
├── stalk/            # StALk (State and Logic) compiler
├── tools/            # Runtime tools available to NPCs
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

---

## 🎯 Entry Points

| File | Purpose |
|------|---------|
| **index.ts** | Main server entry point, starts WebSocket server and HTTP routes |
| **network/ws-server.ts** | WebSocket server setup and connection handling |
| **events/event-bus.ts** | Event bus singleton (global event stream) |

**Starting the server:**
```bash
cd server
bun run dev  # Starts on ws://localhost:4269/ws
```

---

## 📂 Subdirectories

### `/agents/` - Background Agents

Background agents listen to the event bus and process events asynchronously **without blocking the main thread**.

| Agent | Trigger Event | Purpose |
|-------|--------------|---------|
| **memory-writer.ts** | `CONVERSATION_MESSAGE_SENT` | Extracts key memories from conversations |
| **relationship-analyzer.ts** | `CONVERSATION_MESSAGE_SENT` | Analyzes dynamics, updates trust/affinity/familiarity |
| **profile-populator.ts** | `NPC_CREATED` | Generates MyFace profile, picture, initial posts |
| **conversation-initiator.ts** | Scheduled | Initiates NPC→Player conversations |
| **social-autopilot.ts** | Scheduled | NPCs create autonomous posts/comments |
| **chess-autopilot.ts** | Chess game | NPCs make chess moves |
| **pinball-autopilot.ts** | Pinball game | NPCs play pinball |

**Pattern:**
```typescript
eventBus.on(EventTypes.CONVERSATION_MESSAGE_SENT, async (event) => {
  // Process event without blocking
  await extractMemories(event.payload);
});
```

**See:** [README.md](agents/README.md) for agent details

---

### `/config/` - Configuration Management

Handles loading and validating configuration from environment and files.

| File | Purpose |
|------|---------|
| **config.ts** | Loads config from env vars, `.env` file |
| **validation.ts** | Validates config structure |

**Environment Variables:**
- `AI_PROVIDER` - OpenAI-compatible / OpenAI / Anthropic
- `AI_BASE_URL` - API endpoint
- `AI_API_KEY` - API key (if needed)
- `PORT` - Server port (default: 4269)

---

### `/db/` - Database Layer

Database schemas, initialization, and migration logic.

**The Three Databases:**
1. **user.db** - Persistent player data (settings, profiles)
2. **npc.db** - Persistent NPC definitions (personalities, behavior)
3. **game.db** - Resettable game state (conversations, posts, relationships)

| File | Purpose |
|------|---------|
| **schemas.ts** | SQL table definitions |
| **migrations.ts** | Database version migrations |
| **init.ts** | Auto-initialization on `getDB()` calls |

**Pattern:**
```typescript
import { getDB } from "../db/index.js";

const db = getDB("game"); // Auto-initializes if needed
db.query("SELECT * FROM messages WHERE conversation_id = ?", [id]);
```

**See:** [README.md](db/README.md) for schema details

---

### `/events/` - Event Bus

**The event bus is the central nervous system of engAIge.** ALL game events flow through it.

| File | Purpose |
|------|---------|
| **event-bus.ts** | Event bus singleton (fire/emit/on) |
| **event-types.ts** | Enum of all 40+ event types |
| **index.ts** | Barrel export |

**Usage:**
```typescript
import { eventBus, EventTypes } from "../events/index.js";

// Fire and forget (most common)
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT,
  { message_id: id, content: "Hello" },
  { source: "conversation", player_id: "abc", npc_id: "def" }
);

// Or await if you need event ID (for parent_event_id linking)
const event = await eventBus.emit(EventTypes.CONVERSATION_MESSAGE_SENT, payload, context);
```

**Critical:** ALWAYS emit events for game actions. Never bypass the event bus.

**Documentation:**
- [EVENT_BUS_SPEC.md](../../docs/completed/EVENT_BUS_SPEC.md)
- [EVENT_REFERENCE.md](../../docs/completed/EVENT_REFERENCE.md)

**See:** [README.md](events/README.md) for event bus architecture

---

### `/network/` - Network Layer

Two-layer network architecture:

**Layer 1: WebSocket (Client ↔ Server)**
- Real-time bidirectional communication
- All game events flow through WS
- Handlers in `ws-handlers/`

**Layer 2: HTTP Door (Server ↔ Internet)**
- Single point for all outbound HTTP
- Optional SOCKS/HTTP proxy
- Rate limiting, error handling

| File | Purpose |
|------|---------|
| **ws-server.ts** | WebSocket server setup |
| **ws-handlers/** | Message handlers (conversation, social, etc.) |
| **door.ts** | HTTP client for external requests |

**WebSocket Message Format:**
```typescript
{
  type: "conversation:send_message",
  payload: { npc_id: "abc", content: "Hello!" }
}
```

**Documentation:** [NETWORK_ARCHITECTURE.md](../../docs/completed/NETWORK_ARCHITECTURE.md)

**See:** [README.md](network/README.md) for network details

---

### `/routes/` - HTTP Routes

Minimal HTTP routes (most communication is WebSocket-based).

| Route | Purpose |
|-------|---------|
| **GET /** | Health check |
| **POST /export** | Export world data |

**Note:** Most features use WebSocket, not HTTP.

---

### `/services/` - Core Business Logic

**This is where most game logic lives.** Services implement game systems and are called by WebSocket handlers.

#### AI & NPC Services

| Service | Purpose |
|---------|---------|
| **ai.ts** | AI provider integration (OpenAI, Anthropic, local) |
| **ai-queue.ts** | Priority-based AI request queue with budget management |
| **ai-provider-config.ts** | Multi-provider configuration |
| **npc.ts** | NPC CRUD operations |
| **npc-generator.ts** | Generate new NPCs with personalities |
| **npc-personality.ts** | Personality trait system |
| **npc-relationships.ts** | Relationship graph and stats |
| **npc-interaction.ts** | NPC-to-NPC interaction logic |

#### Conversation Services

| Service | Purpose |
|---------|---------|
| **conversation.ts** | Conversation thread management |
| **direct-chat.ts** | 1-on-1 conversations |
| **group-chat.ts** | Multi-NPC conversations |
| **context-builder.ts** | Build rich context for AI (messages + memories + personality) |
| **message-formatter.ts** | Format messages with NPC quirks (typos, emoji, etc.) |
| **reasoning-extractor.ts** | Extract NPC reasoning from responses |
| **deliberation.ts** | NPC internal thought process |

#### Social & Content Services

| Service | Purpose |
|---------|---------|
| **social.ts** | Social posts, likes, shares |
| **comments.ts** | Threaded comments on posts |
| **instasnap-stories.ts** | Story features |
| **instasnap-saved.ts** | Saved posts |
| **hashtags.ts** | Hashtag tracking and trending |
| **news-feed.ts** | News aggregation |
| **story-generator.ts** | AI-generated news articles |

#### Media & Content

| Service | Purpose |
|---------|---------|
| **media.ts** | Media file management |
| **image-generation-proxy.ts** | Proxy image gen to capable models |
| **vision-proxy.ts** | Proxy vision analysis to capable models |
| **image-compression.ts** | Compress images for payload limits |
| **site-content.ts** | Filler site content management |

#### Game Systems

| Service | Purpose |
|---------|---------|
| **drama-engine.ts** | NPC autonomous behavior simulation |
| **background-scheduler.ts** | Scheduled task execution |
| **awareness.ts** | NPC awareness of game events |
| **relationships.ts** | Relationship state management |
| **runtime-tools.ts** | Tools NPCs can call (generate_image, etc.) |

#### Budget & Tracking

| Service | Purpose |
|---------|---------|
| **budget.ts** | AI cost tracking and limits |
| **error-logger.ts** | Centralized error handling |
| **broadcast.ts** | Push updates to all connected clients |

#### Validation & Safety

| Service | Purpose |
|---------|---------|
| **output-validator.ts** | Validate and auto-fix AI responses |
| **guardrails.ts** | Content rating enforcement |
| **message-access-validator.ts** | Check message access permissions |
| **platform-access.ts** | Check platform access permissions |

#### Onboarding & Player

| Service | Purpose |
|---------|---------|
| **onboarding.ts** | Player onboarding flow |
| **personality-test.ts** | Player personality assessment |
| **player.ts** | Player profile management |
| **account.ts** | Account creation and auth |

#### Minigames

| Service | Purpose |
|---------|---------|
| **chess.ts** | Chess game logic |
| **chess-engine.ts** | Chess AI opponent |
| **chess-matchmaker.ts** | Match NPCs for chess |
| **chess-leaderboard.ts** | Chess rankings |
| **pinball.ts** | Pinball game logic |
| **pinball-leaderboard.ts** | Pinball high scores |

#### Video & Studio

| Service | Purpose |
|---------|---------|
| **npc-video-generator.ts** | Generate NPC videos |
| **video-quiz.ts** | Video quiz creation |
| **video-quiz-resolver.ts** | Quiz answer validation |

#### Scene & Drama

| Service | Purpose |
|---------|---------|
| **scene-seed-generator.ts** | Generate drama seeds |
| **seed-scorer.ts** | Score drama seed quality |

#### Utilities

| Service | Purpose |
|---------|---------|
| **search.ts** | Full-text search across content |
| **export.ts** | Export world data |
| **model-capabilities.ts** | Check AI model capabilities |

**See:** [README.md](services/README.md) for service details

---

### `/stalk/` - StALk Compiler

**StALk** (State and Logic) is a domain-specific language for defining game logic and state machines.

| File | Purpose |
|------|---------|
| **compiler.ts** | Compiles StALk to executable JS |
| **parser.ts** | Parses StALk syntax |
| **runtime.ts** | StALk runtime environment |

**Example:**
```stalk
state idle {
  on player_message -> responding
}

state responding {
  emit ai_request
  on ai_complete -> idle
}
```

**Documentation:** [STALK_LANGUAGE_SPEC.md](../../docs/STALK_LANGUAGE_SPEC.md)

**See:** [README.md](stalk/README.md) for StALk details

---

### `/tools/` - Runtime Tools

Tools that NPCs can call during conversations or autonomous actions.

| Tool | Purpose |
|------|---------|
| **generate_image.ts** | Generate images via DALL-E, SD, etc. |
| **search_memories.ts** | Search NPC's memory bank |
| **check_relationship.ts** | Check relationship stats with another NPC |
| **get_current_time.ts** | Access game time |

**Usage:**
```typescript
// NPC calls tool mid-conversation
{
  "tool": "generate_image",
  "parameters": {
    "prompt": "A sunset over the ocean",
    "style": "photorealistic"
  }
}
```

**Documentation:** [RUNTIME_TOOLS.md](../../docs/completed/RUNTIME_TOOLS.md)

**See:** [README.md](tools/README.md) for tool details

---

### `/types/` - TypeScript Definitions

Shared TypeScript type definitions.

| File | Purpose |
|------|---------|
| **npc.ts** | NPC types (Personality, Behavior, etc.) |
| **conversation.ts** | Conversation and message types |
| **social.ts** | Social post and comment types |
| **events.ts** | Event payload types |
| **ai.ts** | AI provider and response types |

**Pattern:**
```typescript
import type { NPC, Personality } from "../types/npc.js";
import type { Message } from "../types/conversation.js";
```

---

### `/utils/` - Utility Functions

Shared utility functions.

| File | Purpose |
|------|---------|
| **random.ts** | Random number/selection utilities |
| **date.ts** | Date formatting and manipulation |
| **string.ts** | String processing utilities |
| **validation.ts** | Input validation helpers |

---

## 🔄 Data Flow

### Example: Player Sends Message to NPC

```
1. WebSocket message received
   ↓
2. ws-handlers/conversation.ts
   ↓
3. services/conversation.ts
   ↓
4. Event bus fires CONVERSATION_MESSAGE_SENT
   ↓
5. services/context-builder.ts builds context
   ↓
6. services/ai-queue.ts queues AI request
   ↓
7. services/ai.ts generates response
   ↓
8. services/output-validator.ts validates
   ↓
9. Event bus fires CONVERSATION_NPC_RESPONDED
   ↓
10. services/broadcast.ts pushes to frontend
   ↓
11. Background agents process (memory, relationship)
```

---

## 🎯 Development Patterns

### Adding a New Feature

1. **Define Types** - Add types to `/types/`
2. **Create Service** - Implement logic in `/services/`
3. **Add WebSocket Handler** - Handle messages in `/network/ws-handlers/`
4. **Emit Events** - Fire events at key points
5. **Add Background Agent** (if needed) - Process events in `/agents/`
6. **Test Integration** - Verify event bus, budget, errors

### Code Standards

**TypeScript:**
- Import paths use `.js` extension (ES module convention)
- Strict mode enabled
- Explicit types for function signatures

**Database:**
- Use parameterized queries (SQL injection protection)
- Auto-init via `getDB()` calls
- Close connections properly

**AI Calls:**
- ALWAYS use AI queue
- Log costs immediately
- Handle failures gracefully
- Use output validation

**Events:**
- Emit events for all significant actions
- Include rich context in payload
- Set appropriate importance levels

**Errors:**
- Use errorLogger, not console.error
- Include context (source, operation, IDs)
- Provide fallbacks where possible

---

## 📚 Documentation

- [GAME_SYSTEMS.md](../../docs/GAME_SYSTEMS.md) - Complete game overview
- [EVENT_BUS_SPEC.md](../../docs/completed/EVENT_BUS_SPEC.md) - Event bus architecture
- [EVENT_REFERENCE.md](../../docs/completed/EVENT_REFERENCE.md) - All event types
- [ERROR_LOGGING.md](../../docs/completed/ERROR_LOGGING.md) - Error handling
- [AI_QUEUE.md](../../docs/completed/AI_QUEUE.md) - AI request queue
- [NETWORK_ARCHITECTURE.md](../../docs/completed/NETWORK_ARCHITECTURE.md) - Network layer

---

## 🤝 Contributing

When working in `/server/src/`:

1. **Read CLAUDE.md first** - Contains critical patterns
2. **Follow the event bus pattern** - All game events go through it
3. **Use AI queue for AI requests** - Never call AI directly
4. **Use error logger for errors** - Never use console.error
5. **Keep services focused** - Single responsibility principle
6. **Document as you go** - Update READMEs with changes
