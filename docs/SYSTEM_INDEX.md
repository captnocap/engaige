# engAIge System Index

**The master map of all systems and their relationships.** This document shows how everything connects and where to find specific functionality.

---

## 🗺️ Navigation Guide

### I want to understand...

#### **What engAIge is**
- Start: [GAME_SYSTEMS.md](GAME_SYSTEMS.md) - Complete overview
- Then: [README.md](../README.md) - Project overview
- Next: [ARCHITECTURE.md](ARCHITECTURE.md) - High-level design

#### **How the backend works**
- Start: [BACKEND.md](BACKEND.md) - Backend overview
- Then: [/server/src/README.md](../server/src/README.md) - Source code guide
- Dive: [completed/EVENT_BUS_SPEC.md](completed/EVENT_BUS_SPEC.md) - Central nervous system

#### **How the frontend works**
- Start: [FRONTEND.md](FRONTEND.md) - Frontend overview
- Then: [/src/components/README.md](../src/components/README.md) - Component guide
- Dive: [completed/COMPONENT_ARCHITECTURE.md](completed/COMPONENT_ARCHITECTURE.md) - Patterns

#### **How NPCs work**
- Start: [completed/NPC_PERSONALITY_SYSTEM.md](completed/NPC_PERSONALITY_SYSTEM.md) - Personality system
- Then: [completed/NPC_THOUGHTS_SYSTEM.md](completed/NPC_THOUGHTS_SYSTEM.md) - Thought process
- Next: [completed/AUTONOMOUS_CONTEXT.md](completed/AUTONOMOUS_CONTEXT.md) - Autonomous behavior

#### **How data flows**
- Start: [completed/EVENT_BUS_SPEC.md](completed/EVENT_BUS_SPEC.md) - Event architecture
- Then: [completed/EVENT_REFERENCE.md](completed/EVENT_REFERENCE.md) - All event types
- Next: [/server/src/events/README.md](../server/src/events/README.md) - Event implementation

#### **How AI works**
- Start: [completed/AI_QUEUE.md](completed/AI_QUEUE.md) - Request queue
- Then: [completed/AI_PROVIDERS.md](completed/AI_PROVIDERS.md) - Provider config
- Next: [completed/PROXY_SYSTEM.md](completed/PROXY_SYSTEM.md) - Vision/image proxies

#### **How content is managed**
- Start: [FILLER_SITES.md](FILLER_SITES.md) - Parody websites
- Then: [WORLD_LORE.md](WORLD_LORE.md) - Fictional universe
- Next: [completed/NEWS_FEED_SYSTEM.md](completed/NEWS_FEED_SYSTEM.md) - News aggregation

---

## 🏗️ System Dependency Map

### Core Infrastructure

```
Event Bus (Central Nervous System)
    ├── Used by: All services, agents, handlers
    ├── Emits: 40+ event types
    ├── Consumed by: Background agents, analytics, logs viewer
    └── Documentation: EVENT_BUS_SPEC.md, EVENT_REFERENCE.md
```

```
Error Logger
    ├── Used by: All services, agents
    ├── Emits: SYSTEM_ERROR events
    ├── Stored in: error_log table (game.db)
    └── Documentation: ERROR_LOGGING.md
```

```
AI Queue
    ├── Used by: All AI-calling services
    ├── Depends on: Budget system, AI providers
    ├── Emits: AI_REQUEST_* events
    └── Documentation: AI_QUEUE.md
```

```
Budget System
    ├── Used by: AI queue, all AI services
    ├── Tracks: 6 budget categories
    ├── Emits: BUDGET_* events
    └── Documentation: AI_QUEUE.md (Budget section)
```

---

### NPC Intelligence Stack

```
NPC Personality System
    ├── Defines: Traits, quirks, interests, behavior flags
    ├── Used by: Context builder, message formatter, deliberation
    ├── Stored in: npc.db (personalities, interests, behavior)
    └── Documentation: NPC_PERSONALITY_SYSTEM.md
```

```
NPC Thoughts System
    ├── Provides: Reasoning extraction, deliberation
    ├── Used by: Conversation service, autonomous agents
    ├── Depends on: AI queue, personality system
    └── Documentation: NPC_THOUGHTS_SYSTEM.md
```

```
Relationship System
    ├── Tracks: Trust, affinity, familiarity (0-100)
    ├── Stages: Stranger → Acquaintance → Friend → Close Friend → Best Friend
    ├── Updated by: Relationship analyzer agent
    ├── Stored in: npc_relationships table (game.db)
    └── Documentation: NPC_PERSONALITY_SYSTEM.md (Relationships section)
```

```
Memory System
    ├── Stores: Conversational and social memories
    ├── Created by: Memory writer agent
    ├── Searched by: Runtime tools (search_memories)
    ├── Stored in: memories table (game.db)
    └── Documentation: AUTONOMOUS_CONTEXT.md (Memory section)
```

---

### Conversation Flow

```
Context Builder
    ├── Gathers: Messages, memories, personality, relationships
    ├── Used by: Direct chat, group chat, autonomous agents
    ├── Depends on: Conversation service, memory system, relationship system
    └── Documentation: CONTEXT_SYSTEM.md, AUTONOMOUS_CONTEXT.md
```

```
Conversation Service
    ├── Manages: Threads, messages, participants
    ├── Used by: WebSocket handlers, agents
    ├── Emits: CONVERSATION_* events
    ├── Stored in: conversations, messages tables (game.db)
    └── Documentation: /server/src/services/README.md
```

```
Output Validator
    ├── Validates: AI responses (structure, content)
    ├── Auto-fixes: Malformed responses
    ├── Fallback: Pre-generated responses (17 per NPC)
    ├── Used by: All AI response handlers
    └── Documentation: OUTPUT_VALIDATION.md
```

```
Message Formatter
    ├── Applies: Typos, emoji, slang, message splitting
    ├── Based on: NPC personality quirks
    ├── Used by: All message output
    └── Documentation: NPC_PERSONALITY_SYSTEM.md (Quirks section)
```

---

### Social & Content Systems

```
Social Service
    ├── Manages: Posts, likes, shares, saves
    ├── Used by: WebSocket handlers, social autopilot
    ├── Emits: SOCIAL_* events
    ├── Stored in: social_posts, likes, shares tables (game.db)
    └── Documentation: /server/src/services/README.md
```

```
Comments Service
    ├── Manages: Threaded comments on posts
    ├── Used by: WebSocket handlers, social autopilot
    ├── Emits: COMMENT_* events
    ├── Stored in: comments table (game.db)
    └── Documentation: /server/src/services/README.md
```

```
News Feed
    ├── Aggregates: RSS, lore, AI-generated articles
    ├── Used by: Frontend, story generator
    ├── Stored in: news/ directory
    └── Documentation: NEWS_FEED_SYSTEM.md
```

```
Story Generator
    ├── Detects: Trending topics (3+ mentions)
    ├── Generates: AI news articles
    ├── Depends on: AI queue, news feed
    ├── Creates recursion loop: NPCs mention topics → articles generated → NPCs react
    └── Documentation: NEWS_FEED_SYSTEM.md
```

```
Filler Sites
    ├── Provides: 20+ parody websites
    ├── Content: server/data/content/{site}/
    ├── Rendered by: In-game browser
    └── Documentation: FILLER_SITES.md, SITE_CONTENT_SCHEMA.md
```

---

### Background Simulation

```
Drama Engine
    ├── Orchestrates: Autonomous NPC behavior
    ├── Selects: Active NPCs (extraversion, spontaneity)
    ├── Triggers: Social autopilot, conversation initiator
    ├── Depends on: Scene seeds, AI queue (LOW/IDLE priority)
    └── Documentation: DRAMA_AUTOMATION.md
```

```
Background Agents
    ├── Memory Writer: Extracts memories from conversations
    ├── Relationship Analyzer: Updates relationship stats
    ├── Profile Populator: Generates MyFace profiles
    ├── Conversation Initiator: NPCs start conversations
    ├── Social Autopilot: NPCs create posts/comments
    └── Documentation: /server/src/agents/README.md
```

```
Scene Seeds
    ├── Types: Antagonist, chain, romantic, social, wildcard
    ├── Used by: Drama engine, conversation initiator
    ├── Stored in: server/data/scene-seeds/
    └── Documentation: SCENE_SEED_SYSTEM.md
```

---

### Media & Content Generation

```
Image Generation
    ├── Providers: DALL-E, Stable Diffusion, custom APIs
    ├── Features: Payload templates, compression
    ├── Used by: Runtime tools, profile populator
    ├── Depends on: Image gen proxy (if model lacks capability)
    └── Documentation: IMAGE_GENERATION.md
```

```
Vision Proxy
    ├── Routes: Image analysis to vision-capable models
    ├── Used by: AI service (when model lacks vision)
    ├── Transparent: NPCs don't know proxy exists
    └── Documentation: PROXY_SYSTEM.md
```

```
Image Gen Proxy
    ├── Routes: Image generation to capable models
    ├── Used by: AI service (when model lacks image gen)
    ├── Transparent: NPCs don't know proxy exists
    └── Documentation: PROXY_SYSTEM.md
```

```
Media Service
    ├── Manages: File storage, compression, metadata
    ├── Storage: server/data/media/
    ├── Used by: Upload handlers, image generation
    └── Documentation: FILES_SYSTEM.md
```

---

### Network Architecture

```
WebSocket Layer (Client ↔ Server)
    ├── Protocol: ws://localhost:4269/ws
    ├── Handles: Real-time bidirectional communication
    ├── Handlers: /server/src/network/ws-handlers/
    ├── Client: /src/services/websocket.ts
    └── Documentation: NETWORK_ARCHITECTURE.md
```

```
HTTP Door (Server ↔ Internet)
    ├── Purpose: Single point for all outbound HTTP
    ├── Features: Proxy support, rate limiting, error handling
    ├── Used by: AI providers, image generation, news aggregation
    └── Documentation: NETWORK_ARCHITECTURE.md
```

---

### Database Layer

```
Three-Database System
    ├── user.db: Player data (persistent)
    ├── npc.db: NPC definitions (persistent)
    ├── game.db: Game state (resettable)
    └── Documentation: /server/data/README.md, ARCHITECTURE.md
```

```
Database Services
    ├── getDB(): Auto-initialization
    ├── Schemas: /server/src/db/schemas.ts
    ├── Migrations: /server/src/db/migrations.ts
    └── Documentation: /server/src/db/README.md
```

---

## 📂 Directory Structure Map

### Backend (`/server/`)

```
server/
├── src/
│   ├── agents/           → Background event processors
│   │   └── README.md     → Agent documentation
│   ├── config/           → Configuration management
│   ├── db/               → Database schemas & init
│   ├── events/           → Event bus (central nervous system)
│   │   └── README.md     → Event bus documentation
│   ├── network/          → WebSocket + HTTP door
│   │   └── README.md     → Network documentation
│   ├── routes/           → HTTP routes (minimal)
│   ├── services/         → All game logic
│   │   └── README.md     → Services documentation
│   ├── stalk/            → StALk language compiler
│   ├── tools/            → Runtime tools for NPCs
│   ├── types/            → TypeScript definitions
│   └── utils/            → Utility functions
└── data/
    ├── backups/          → Auto-generated backups
    ├── content/          → Filler site content (20+ sites)
    ├── game/             → game.db (resettable)
    ├── media/            → User-generated media
    ├── news/             → News feed content
    ├── npc/              → npc.db (persistent)
    ├── scene-seeds/      → Drama scenarios
    ├── user/             → user.db (persistent)
    └── worlds/           → World snapshots
    └── README.md         → Data documentation
```

### Frontend (`/src/`)

```
src/
├── components/
│   ├── boot/             → Boot sequence
│   ├── browser/          → In-game browser
│   ├── chess/            → Chess minigame
│   ├── dating/           → Dating app
│   ├── desktop/          → Desktop environment
│   ├── ide/              → CobHub IDE
│   ├── onboarding/       → Player onboarding
│   ├── paint/            → Paint app
│   ├── phone/            → Phone interface
│   ├── pinball/          → Pinball minigame
│   ├── platforms/        → Social platforms (MyFace, etc.)
│   ├── settings/         → Settings UI
│   ├── solitaire/        → Solitaire minigame
│   ├── studio/           → Video studio
│   ├── ui/               → Reusable UI components
│   └── world/            → World map
│   └── README.md         → Component documentation
├── config/               → Frontend config
├── hooks/                → React hooks
├── lib/                  → Libraries (CORN stack, genart)
├── router/               → React Router setup
├── services/             → WebSocket client
└── stores/               → Zustand state management
```

### Documentation (`/docs/`)

```
docs/
├── completed/            → Fully implemented systems
│   ├── EVENT_BUS_SPEC.md
│   ├── EVENT_REFERENCE.md
│   ├── ERROR_LOGGING.md
│   ├── AI_QUEUE.md
│   ├── NPC_PERSONALITY_SYSTEM.md
│   └── 15+ more...
├── GAME_SYSTEMS.md       → Complete game overview
├── SYSTEM_INDEX.md       → This file (master map)
├── ARCHITECTURE.md       → High-level architecture
├── BACKEND.md            → Backend overview
├── FRONTEND.md           → Frontend overview
├── TAURI.md              → Desktop integration
├── FILLER_SITES.md       → Parody websites
├── WORLD_LORE.md         → Fictional universe
└── 20+ more docs...
```

---

## 🔄 System Interaction Examples

### Example 1: Player Sends Message

**Flow:**
1. **Frontend** (`components/platforms/messenger/`) - User types message
2. **WebSocket** (`services/websocket.ts`) - Send to server
3. **WS Handler** (`network/ws-handlers/conversation.ts`) - Receive message
4. **Service** (`services/conversation.ts`) - Save message, emit event
5. **Event Bus** - Fire `CONVERSATION_MESSAGE_SENT` event
6. **Context Builder** (`services/context-builder.ts`) - Gather context
7. **AI Queue** (`services/ai-queue.ts`) - Queue AI request (CRITICAL priority)
8. **AI Provider** (`services/ai.ts`) - Generate response via HTTP door
9. **Output Validator** (`services/output-validator.ts`) - Validate response
10. **Service** - Save response, emit `CONVERSATION_NPC_RESPONDED` event
11. **Broadcast** (`services/broadcast.ts`) - Push to frontend
12. **Frontend** - Display NPC message
13. **Agents** - Memory writer extracts memories, relationship analyzer updates stats

**Documentation:**
- [CONTEXT_SYSTEM.md](completed/CONTEXT_SYSTEM.md) - Step 6
- [AI_QUEUE.md](completed/AI_QUEUE.md) - Step 7
- [OUTPUT_VALIDATION.md](completed/OUTPUT_VALIDATION.md) - Step 9
- [/server/src/agents/README.md](../server/src/agents/README.md) - Step 13

---

### Example 2: NPC Posts Autonomously

**Flow:**
1. **Drama Engine** (`services/drama-engine.ts`) - Scheduled loop runs
2. **NPC Selection** - Pick active NPCs (extraversion > 0.6)
3. **Social Autopilot** (`agents/social-autopilot.ts`) - Triggered for selected NPC
4. **Context Builder** (`services/context-builder.ts`) - Gather social context
5. **AI Queue** - Queue AI request (LOW priority)
6. **AI Provider** - Generate post content
7. **Output Validator** - Validate content
8. **Social Service** (`services/social.ts`) - Save post, emit event
9. **Event Bus** - Fire `SOCIAL_POST_CREATED` event
10. **Broadcast** - Push to all connected clients
11. **Frontend** - Update social feed
12. **Story Generator** (`services/story-generator.ts`) - Detect trending topics

**Documentation:**
- [DRAMA_AUTOMATION.md](completed/DRAMA_AUTOMATION.md) - Steps 1-3
- [AUTONOMOUS_CONTEXT.md](completed/AUTONOMOUS_CONTEXT.md) - Step 4
- [NEWS_FEED_SYSTEM.md](completed/NEWS_FEED_SYSTEM.md) - Step 12

---

### Example 3: Error Occurs

**Flow:**
1. **Any Service** - Error thrown during operation
2. **Error Logger** (`services/error-logger.ts`) - Log error with context
3. **Error Log Table** (`game.db`) - Store error record
4. **Event Bus** - Fire `SYSTEM_ERROR` event
5. **Logs Viewer** - Display error in UI (if open)
6. **Analytics** - Track error frequency (future)

**Documentation:**
- [ERROR_LOGGING.md](completed/ERROR_LOGGING.md) - Steps 1-4
- [LOGS_VIEWER.md](completed/LOGS_VIEWER.md) - Step 5

---

## 📚 Documentation Categories

### Essential Reading (Start Here)
1. [GAME_SYSTEMS.md](GAME_SYSTEMS.md) - Complete overview
2. [README.md](../README.md) - Project overview
3. [ARCHITECTURE.md](ARCHITECTURE.md) - High-level design
4. [CLAUDE.md](../CLAUDE.md) - Critical development patterns

### Backend Systems
- [BACKEND.md](BACKEND.md) - Backend architecture
- [/server/src/README.md](../server/src/README.md) - Source code guide
- [/server/data/README.md](../server/data/README.md) - Data layer

### Frontend Systems
- [FRONTEND.md](FRONTEND.md) - Frontend architecture
- [/src/components/README.md](../src/components/README.md) - Component guide
- [TAURI.md](TAURI.md) - Desktop integration

### Completed Systems (`/completed/`)
All docs in this directory are **fully implemented and working**:
- Event Bus (EVENT_BUS_SPEC.md, EVENT_REFERENCE.md)
- Error Logging (ERROR_LOGGING.md)
- AI Systems (AI_QUEUE.md, AI_PROVIDERS.md, PROXY_SYSTEM.md)
- NPC Systems (NPC_PERSONALITY_SYSTEM.md, NPC_THOUGHTS_SYSTEM.md)
- Context & Content (CONTEXT_SYSTEM.md, AUTONOMOUS_CONTEXT.md)
- Tools & Validation (RUNTIME_TOOLS.md, OUTPUT_VALIDATION.md)
- And 15+ more...

### Content & World
- [FILLER_SITES.md](FILLER_SITES.md) - 20+ parody websites
- [WORLD_LORE.md](WORLD_LORE.md) - Fictional universe
- [NEWS_FEED_SYSTEM.md](completed/NEWS_FEED_SYSTEM.md) - News aggregation

### Reference
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick lookups
- [EXAMPLE_CONFIGS.md](EXAMPLE_CONFIGS.md) - Configuration examples
- [CORN_STACK.md](CORN_STACK.md) - Content organization system

---

## 🎯 Feature Implementation Checklist

When implementing a new feature, consult these systems:

### Planning Phase
- [ ] Read [GAME_SYSTEMS.md](GAME_SYSTEMS.md) - Understand overall architecture
- [ ] Check [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Avoid duplicate work
- [ ] Review related systems in this index

### Implementation Phase
- [ ] Define event types in [/server/src/events/event-types.ts](../server/src/events/event-types.ts)
- [ ] Create service in [/server/src/services/](../server/src/services/)
- [ ] Add WebSocket handler in [/server/src/network/ws-handlers/](../server/src/network/ws-handlers/)
- [ ] Use [AI Queue](completed/AI_QUEUE.md) for AI requests
- [ ] Use [Error Logger](completed/ERROR_LOGGING.md) for errors
- [ ] Emit events to [Event Bus](completed/EVENT_BUS_SPEC.md)

### Frontend Phase
- [ ] Create components in [/src/components/](../src/components/)
- [ ] Use [WebSocket service](../src/services/websocket.ts) for communication
- [ ] Follow [Component Architecture](completed/COMPONENT_ARCHITECTURE.md) patterns
- [ ] NO game logic in components

### Testing Phase
- [ ] Check [Event Bus](completed/EVENT_BUS_SPEC.md) - Events emitted correctly?
- [ ] Check [Budget System](completed/AI_QUEUE.md) - Costs tracked?
- [ ] Check [Error Logger](completed/ERROR_LOGGING.md) - Errors logged?
- [ ] Check [Logs Viewer](completed/LOGS_VIEWER.md) - Events visible in UI?

### Documentation Phase
- [ ] Add to [EVENT_REFERENCE.md](completed/EVENT_REFERENCE.md) if new events
- [ ] Update relevant system docs
- [ ] Add to this index if new major system

---

## 🔍 Finding Specific Functionality

### "Where is X implemented?"

| Feature | Location | Documentation |
|---------|----------|---------------|
| Event bus | `server/src/events/event-bus.ts` | [EVENT_BUS_SPEC.md](completed/EVENT_BUS_SPEC.md) |
| AI queue | `server/src/services/ai-queue.ts` | [AI_QUEUE.md](completed/AI_QUEUE.md) |
| Error logging | `server/src/services/error-logger.ts` | [ERROR_LOGGING.md](completed/ERROR_LOGGING.md) |
| NPC personalities | `server/src/services/npc-personality.ts` | [NPC_PERSONALITY_SYSTEM.md](completed/NPC_PERSONALITY_SYSTEM.md) |
| Conversations | `server/src/services/conversation.ts` | [/server/src/services/README.md](../server/src/services/README.md) |
| Social posts | `server/src/services/social.ts` | [/server/src/services/README.md](../server/src/services/README.md) |
| Context building | `server/src/services/context-builder.ts` | [CONTEXT_SYSTEM.md](completed/CONTEXT_SYSTEM.md) |
| Output validation | `server/src/services/output-validator.ts` | [OUTPUT_VALIDATION.md](completed/OUTPUT_VALIDATION.md) |
| Drama automation | `server/src/services/drama-engine.ts` | [DRAMA_AUTOMATION.md](completed/DRAMA_AUTOMATION.md) |
| WebSocket server | `server/src/network/ws-server.ts` | [NETWORK_ARCHITECTURE.md](completed/NETWORK_ARCHITECTURE.md) |
| HTTP door | `server/src/network/door.ts` | [NETWORK_ARCHITECTURE.md](completed/NETWORK_ARCHITECTURE.md) |
| Desktop UI | `src/components/desktop/Desktop.tsx` | [TAURI.md](TAURI.md) |
| Browser | `src/components/browser/Browser.tsx` | [FILLER_SITES.md](FILLER_SITES.md) |

---

## 🤝 Contributing

When working on engAIge:

1. **Start with this index** - Find related systems
2. **Read relevant docs** - Understand existing patterns
3. **Follow patterns** - Use event bus, AI queue, error logger
4. **Update docs** - Keep this index and related docs current
5. **Test integration** - Verify events, budget, errors, data flow

---

**Last Updated:** 2026-02-07
**Maintained by:** engAIge Archive Master
