# engAIge Game Systems Overview

**engAIge** (engage + AI) is a relationship simulator and social media game where AI-powered NPCs live autonomous digital lives. This document provides a comprehensive overview of how the game works, what systems power it, and how everything connects.

---

## 🎮 What Is engAIge?

### The Core Concept

engAIge reimagines the "character AI" experience by creating a **living social network** where NPCs:
- Post on social media platforms (MyFace, InstaSnap, Threadit)
- Have conversations and build relationships
- Live autonomous lives when you're offline
- Remember every interaction across all platforms
- Develop personalities and form social circles

Unlike traditional chatbots, NPCs in engAIge are **persistent, autonomous agents** with:
- Deep personality systems (20+ traits, quirks, communication patterns)
- Memory systems that span conversations, posts, and relationships
- Background simulation that runs even when you're away
- Cost-conscious AI usage with granular budget controls

### The Player Experience

You interact with NPCs through:
1. **Desktop Environment** - A Tauri-based desktop UI with windows for different platforms
2. **Social Platforms** - MyFace profiles, InstaSnap feeds, Threadit discussions
3. **Direct Messaging** - Real-time conversations with typing indicators and realistic timing
4. **The World** - A network of parody websites (20+ filler sites) that NPCs reference and interact with

---

## 🏗️ System Architecture Overview

### The Three-Layer Design

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Tauri)            │
│  • Desktop environment                      │
│  • Window management                        │
│  • UI rendering                             │
│  • Display only - no game logic             │
└─────────────────┬───────────────────────────┘
                  │ WebSocket
                  │ ws://localhost:4269/ws
┌─────────────────▼───────────────────────────┐
│         Backend (Bun Server)                │
│  • All game logic                           │
│  • Event bus (central nervous system)       │
│  • NPC simulation                           │
│  • Database operations                      │
│  • AI request management                    │
└─────────────────┬───────────────────────────┘
                  │ HTTP (through "door")
┌─────────────────▼───────────────────────────┐
│         External Services                   │
│  • AI providers (OpenAI, Anthropic, local)  │
│  • Image generation                         │
│  • Vision analysis                          │
│  • News feeds (future: RSS)                 │
└─────────────────────────────────────────────┘
```

**Key Principle: The frontend is a "dumb terminal"**
- Frontend displays what server sends
- Frontend forwards user actions via WebSocket
- ALL game logic runs server-side
- ONE event bus, on the server

### The Three-Database System

Located in `server/data/`:

| Database | Purpose | Persistence |
|----------|---------|-------------|
| **user.db** | Player profiles, settings, preferences | Permanent |
| **npc.db** | NPC definitions, personalities, behavior | Permanent |
| **game.db** | Conversations, messages, posts, memories, relationships | Resettable |

**Why Three Databases?**
- `user.db` and `npc.db` persist across world resets
- `game.db` can be wiped to start fresh while keeping characters
- Enables world snapshots and parallel timeline experiments

---

## 🎯 Core Systems

### 1. Event Bus - The Central Nervous System

**Location:** `server/src/events/event-bus.ts`

**Every in-game action flows through the event bus.** It's the single source of truth for what's happening in the world.

```typescript
// Example: Message sent
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT, {
  message_id: id,
  content: message,
  word_count: message.split(/\s+/).length
}, {
  source: "conversation",
  player_id: playerId,
  npc_id: npcId,
  importance: 0.5
});
```

**What emits events:**
- Player messages
- NPC responses
- Relationship changes
- Social posts
- Memory creation
- Budget updates
- AI requests
- Errors

**What consumes events:**
- Background agents (memory writer, relationship analyzer)
- Budget tracking
- Logs viewer
- Analytics (future)

**Documentation:**
- [EVENT_BUS_SPEC.md](completed/EVENT_BUS_SPEC.md) - Architecture
- [EVENT_REFERENCE.md](completed/EVENT_REFERENCE.md) - All 40+ event types

---

### 2. NPC Intelligence System

NPCs are powered by a layered intelligence system:

#### Personality Layer
**Location:** `server/src/services/npc.ts`

Each NPC has:
- **20+ Personality Traits** - Openness, conscientiousness, extroversion, etc.
- **Behavior Flags** - Can post freely, initiate conversations, use tools
- **Communication Quirks** - Verbosity, emoji usage, typo frequency, slang
- **Topic Interests** - 25+ topics with 0-1 intensity scores
- **Message Patterns** - Multi-message sender, typing speed, response delays

**Documentation:** [NPC_PERSONALITY_SYSTEM.md](completed/NPC_PERSONALITY_SYSTEM.md)

#### Memory System
**Location:** `server/src/agents/memory-writer.ts`

NPCs remember:
- **Conversational Memories** - Key moments from chats
- **Social Memories** - Posts, comments, interactions
- **Relationship Context** - How they feel about others
- **World Knowledge** - Facts about the game world

Memories are:
- Auto-generated by background agent
- Tagged with importance scores
- Searchable via runtime tools
- Used to build conversation context

#### Thoughts System
**Location:** `server/src/services/thoughts.ts`

Before responding, NPCs can:
- **Deliberate** - Think through complex situations
- **Extract Reasoning** - Separate thinking from response
- **Show Internal State** - (Optional) display thought process to player

**Documentation:** [NPC_THOUGHTS_SYSTEM.md](completed/NPC_THOUGHTS_SYSTEM.md)

#### Relationship System
**Location:** `server/src/agents/relationship-analyzer.ts`

Relationships are tracked via three stats (0-100):
- **Trust** - Reliability, honesty, safety
- **Affinity** - Emotional connection, chemistry
- **Familiarity** - How well they know each other

**Relationship Stages:**
1. Stranger (0-20)
2. Acquaintance (20-40)
3. Friend (40-60)
4. Close Friend (60-80)
5. Best Friend (80-100)
6. Romantic (parallel track, requires affinity + familiarity)

Changes are automatic based on conversation analysis by background agent.

---

### 3. AI Management System

#### AI Queue - Budget-Aware Request Management
**Location:** `server/src/services/ai-queue.ts`

**All AI requests go through the queue.** Never call AI functions directly.

**Priority Levels:**

| Priority | Use Case | Budget Reserve |
|----------|----------|----------------|
| CRITICAL | User DMs, direct requests | 40% |
| HIGH | NPC follow-ups, reactions | 25% |
| MEDIUM | Scheduled posts, NPC initiates | 20% |
| LOW | Background posts, NPC-NPC | 10% |
| IDLE | Pre-generation, analytics | 5% |

**Features:**
- Dynamic throttling based on budget
- Priority-based execution
- Cost estimation before execution
- Automatic budget tracking

**Documentation:** [AI_QUEUE.md](completed/AI_QUEUE.md)

#### AI Providers
**Location:** `server/src/services/ai-provider.ts`

Supports multiple providers:
- **OpenAI-compatible** (default: localhost:1234 for local models)
- **OpenAI API** (official API)
- **Anthropic API** (Claude)

**Per-NPC Model Overrides:**
- Each NPC can specify their own model
- Enables mixing local + API models
- Cost tracking per provider

**Documentation:** [AI_PROVIDERS.md](completed/AI_PROVIDERS.md)

#### Proxy System
**Location:** `server/src/services/vision-proxy.ts`, `image-gen-proxy.ts`

For models lacking vision or image generation:
- **Vision Proxy** - Routes images to capable model for analysis
- **Image Gen Proxy** - Routes generation requests to image-capable model
- Transparent to NPCs
- Configurable per-provider

**Documentation:** [PROXY_SYSTEM.md](completed/PROXY_SYSTEM.md)

---

### 4. Conversation System

#### Context Building
**Location:** `server/src/services/context.ts`

Conversations require rich context:
1. **Recent Messages** - Last N messages in thread
2. **Relevant Memories** - Semantic search for related memories
3. **Relationship Stats** - Current trust/affinity/familiarity
4. **NPC Personality** - Traits, quirks, interests injected into prompt
5. **Social Context** - (For posts) Recent feed activity, trending topics

**Context Modes:**
- **1-on-1 Conversations** - Player + NPC
- **Group Chats** - Multiple NPCs with parallel response generation
- **Threaded Comments** - Reddit-style comment trees
- **Autonomous Posts** - NPCs posting without player input

**Documentation:**
- [CONTEXT_SYSTEM.md](completed/CONTEXT_SYSTEM.md)
- [AUTONOMOUS_CONTEXT.md](completed/AUTONOMOUS_CONTEXT.md)

#### Output Validation
**Location:** `server/src/services/output-validator.ts`

AI responses are validated and auto-fixed:
- **Structure Validation** - Ensure JSON format is correct
- **Content Validation** - Check against content rating
- **Fallback System** - 17 pre-generated responses per NPC
- **Auto-Repair** - Attempts to fix malformed responses

**Documentation:** [OUTPUT_VALIDATION.md](completed/OUTPUT_VALIDATION.md)

#### Runtime Tools
**Location:** `server/src/tools/`

NPCs can use tools mid-conversation:
- `generate_image` - Create images via DALL-E, SD, etc.
- `search_memories` - Search their own memories
- `check_relationship` - Check stats with another NPC
- `get_current_time` - Access game time

**Documentation:** [RUNTIME_TOOLS.md](completed/RUNTIME_TOOLS.md)

---

### 5. Background Simulation

#### Drama Automation
**Location:** `server/src/services/drama-automation.ts`

NPCs act autonomously:
- **Simulation Loop** - Runs every N minutes
- **NPC Selection** - Picks NPCs based on personality (extraversion, spontaneity)
- **Action Types** - Posts, comments, DM initiations
- **Budget-Aware** - Respects LOW/IDLE priority limits
- **Social Coherence** - NPCs reference each other's posts

**Documentation:** [DRAMA_AUTOMATION.md](completed/DRAMA_AUTOMATION.md)

#### Background Agents
**Location:** `server/src/agents/`

Agents process events asynchronously:

| Agent | Trigger | Purpose |
|-------|---------|---------|
| **Memory Writer** | Message sent | Extract key memories from conversations |
| **Relationship Analyzer** | Message sent | Analyze dynamics, update trust/affinity/familiarity |
| **Profile Populator** | NPC created | Generate MyFace profile, picture, initial posts |

Agents listen to event bus and process in background without blocking main thread.

---

### 6. Content & Media Systems

#### Image Generation
**Location:** `server/src/services/image-generation.ts`

Flexible image generation system:
- **Provider-Agnostic** - Works with DALL-E, SD, custom APIs
- **Payload Templates** - JSON templates for each provider
- **Automatic Compression** - Reduces payload size to meet limits
- **Cost Tracking** - Budget category for image generation

**Documentation:** [IMAGE_GENERATION.md](completed/IMAGE_GENERATION.md)

#### Media Management
**Location:** `server/src/services/media.ts`

Handles all media files:
- **Storage** - `server/data/media/` directory
- **Compression** - Sharp-based image optimization
- **Export/Import** - Media included in world snapshots
- **Metadata** - Tracks creator, timestamp, relationships

**Documentation:** [FILES_SYSTEM.md](FILES_SYSTEM.md)

#### Content Guardrails
**Location:** `server/src/services/content-guardrails.ts`

User-defined content rating:
- **harsh** - SFW only
- **strict** - Teen-appropriate
- **normal** - Relationship-gated adult content
- **relaxed** - NSFW allowed
- **none** - Unrestricted

System prompts inject guardrail addendums, output validation checks against limits.

**Documentation:** [CONTENT_GUARDRAILS.md](CONTENT_GUARDRAILS.md)

---

### 7. World Building Systems

#### Filler Sites
**Location:** `server/data/content/`

20+ parody websites that NPCs reference:
- **WikiKnow** - Wikipedia parody
- **Threadit** - Reddit parody
- **DailyBuzz** - News aggregator
- **VidTube** - YouTube parody
- **OddsOracle** - Prediction markets
- **BargainBay** - eBay parody
- **CornHub** - Developer tutorial site
- And 13+ more...

**Quality Rule:** NO DEAD ENDS
- If it looks clickable, it MUST work
- Show what you claim (no "847 comments" with empty section)
- Depth over shortcuts

**Documentation:** [FILLER_SITES.md](FILLER_SITES.md)

#### World Lore
**Location:** `docs/WORLD_LORE.md`

Interconnected fictional universe:
- **Quantum Coffee** - The hottest topic on the internet ($47/cup pseudoscience)
- **The Hartwell Building** - Missing 13th floor, temporal anomalies, decades of mystery
- **The Underground** - Music venue (Trust Fall Tim, Velvet Algorithms, Neon Requiem)
- **The Number 847** - Recurring Easter egg throughout the world

**Cross-Reference Rule:** If you reference it, build it. Every URL must lead somewhere real.

**Documentation:** [WORLD_LORE.md](WORLD_LORE.md)

#### News Feed System
**Location:** `server/src/services/news-aggregator.ts`

Unified news feed with recursion loop:
1. RSS feeds (TODO) + hand-crafted lore
2. NPCs see headlines
3. NPCs mention topics in posts/conversations
4. Story generator detects trends (3+ mentions)
5. AI generates new articles
6. Loop continues

**Documentation:** [NEWS_FEED_SYSTEM.md](completed/NEWS_FEED_SYSTEM.md)

---

### 8. Network Architecture

#### Two-Layer Design
**Location:** `server/src/network/`

```
Frontend ←──WebSocket──→ Backend ←──HTTP (via "door")──→ Internet
```

**Layer 1: WebSocket (Client ↔ Server)**
- `ws://localhost:4269/ws`
- Real-time bidirectional communication
- All game events flow through WS
- Handlers in `server/src/network/ws-handlers/`

**Layer 2: HTTP Door (Server ↔ Internet)**
- `server/src/network/door.ts`
- Single point for all outbound HTTP
- Optional SOCKS/HTTP proxy support
- Rate limiting, error handling

**Documentation:** [NETWORK_ARCHITECTURE.md](completed/NETWORK_ARCHITECTURE.md)

---

### 9. Error Handling & Logging

#### Error Logger
**Location:** `server/src/services/error-logger.ts`

**All tracked errors use errorLogger.** Never use plain `console.error()`.

```typescript
import { errorLogger } from "../services/error-logger.js";

// Log error
errorLogger.log(error, {
  source: "ai",
  operation: "generateResponse",
  npc_id: npcId
});

// Wrap risky operation
const result = await errorLogger.wrap(
  () => riskyOp(),
  { source: "ai", operation: "parse" }
);

// With fallback (doesn't throw)
const result = await errorLogger.wrap(
  () => mightFail(),
  { source: "ai", operation: "parse" },
  { fallback: defaultValue }
);
```

**Severity Levels:**
- `critical` - System failure
- `high` - Feature broken
- `medium` - Degraded experience
- `low` - Minor issue

Errors stored in `error_log` table, emit `system:error` events automatically.

**Documentation:** [ERROR_LOGGING.md](completed/ERROR_LOGGING.md)

---

### 10. Budget System

#### Granular Cost Tracking
**Location:** `server/src/services/budget.ts`

Budget categories:
1. NPC Generation
2. Conversations
3. Autonomous Posts
4. Image Generation
5. Vision Proxy
6. Random Events

Each category has:
- **Allocation** - % of total budget
- **Spent** - Current spend
- **Available** - Remaining budget

**Budget Reset:**
- Daily/Weekly/Monthly
- Manual reset option
- Rollover unused budget (optional)

**Integration:**
- AI queue checks budget before execution
- All AI calls log cost automatically
- Real-time budget updates via event bus

---

### 11. Time System

**Location:** `server/src/services/time.ts`

**Game time vs Real time:**
- Game can run faster/slower than real time
- Configurable time scale (1x, 2x, 5x, etc.)
- NPCs see game time, not real time
- Affects scheduling, time-based events

**Documentation:** [TIME_SYSTEM.md](TIME_SYSTEM.md)

---

## 🔄 Data Flow Examples

### Example 1: Player Sends Message to NPC

```
1. Player types message in UI
   ↓
2. Frontend sends WebSocket message
   { type: "conversation:send_message", npc_id: "abc", content: "Hello!" }
   ↓
3. Backend WS handler receives message
   ↓
4. Event bus fires CONVERSATION_MESSAGE_SENT
   ↓
5. Message saved to game.db
   ↓
6. Context builder gathers:
   - Recent messages
   - NPC personality
   - Relationship stats
   - Relevant memories
   ↓
7. AI request queued with CRITICAL priority
   ↓
8. Queue executes when budget available
   ↓
9. AI provider generates response
   ↓
10. Output validator checks response
   ↓
11. Response saved to game.db
   ↓
12. Event bus fires CONVERSATION_NPC_RESPONDED
   ↓
13. Backend pushes response to frontend via WebSocket
   ↓
14. Frontend displays NPC message
   ↓
15. Background agents process events:
    - Memory writer extracts memories
    - Relationship analyzer updates stats
```

### Example 2: NPC Posts Autonomously

```
1. Drama automation loop runs
   ↓
2. Loop selects active NPC (based on extraversion)
   ↓
3. Autonomous context builder gathers:
   - NPC's recent activity
   - Recent feed posts from others
   - NPC's personality/interests
   - Current trends
   ↓
4. AI request queued with LOW priority
   ↓
5. Queue executes when budget available
   ↓
6. AI generates post content
   ↓
7. Output validator checks content
   ↓
8. Post saved to game.db
   ↓
9. Event bus fires SOCIAL_POST_CREATED
   ↓
10. Backend pushes post to all connected clients
   ↓
11. Frontend updates social feed
   ↓
12. Story generator detects trending topics
   ↓
13. If 3+ mentions, generate news article
```

---

## 📂 Directory Structure

### Backend (`/server/src/`)

```
server/src/
├── agents/           # Background agents (memory, relationship, profile)
├── config/           # Configuration management
├── db/               # Database schemas and migrations
├── events/           # Event bus and event types
├── network/          # WebSocket server and HTTP door
│   └── ws-handlers/  # WebSocket message handlers
├── routes/           # HTTP routes (minimal, mostly WS)
├── services/         # Core business logic
│   └── world/        # World-specific services
├── stalk/            # StALk (State and Logic) compiler
├── tools/            # Runtime tools for NPCs
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

**Key Entry Points:**
- `server/src/index.ts` - Main server entry
- `server/src/network/ws-server.ts` - WebSocket server
- `server/src/events/event-bus.ts` - Event bus singleton

### Frontend (`/src/`)

```
src/
├── components/       # React components
│   ├── boot/         # Boot sequence
│   ├── browser/      # In-game browser
│   ├── chess/        # Chess minigame
│   ├── dating/       # Dating app
│   ├── desktop/      # Desktop environment
│   ├── ide/          # CobHub IDE
│   ├── onboarding/   # User onboarding
│   ├── paint/        # Paint app
│   ├── phone/        # Phone interface
│   ├── pinball/      # Pinball minigame
│   ├── platforms/    # Social platforms (MyFace, etc.)
│   ├── settings/     # Settings UI
│   ├── solitaire/    # Solitaire minigame
│   ├── studio/       # Video studio
│   ├── ui/           # Reusable UI components
│   └── world/        # World map
├── config/           # Frontend configuration
├── data/             # Static data
├── hooks/            # React hooks
├── lib/              # Libraries
│   ├── corn-stack/   # Content organization system
│   └── genart/       # Generative art
├── router/           # React Router setup
├── services/         # Frontend services (WebSocket client)
└── stores/           # Zustand state management
```

**Key Entry Points:**
- `src/main.tsx` - React app entry
- `src/App.tsx` - Root component
- `src/services/websocket.ts` - WebSocket client

### Data (`/server/data/`)

```
server/data/
├── backups/          # Database backups
├── content/          # Filler site content (20+ sites)
├── game/             # game.db (resettable)
├── media/            # User-generated media
├── news/             # News feed content
├── npc/              # npc.db (persistent)
├── scene-seeds/      # Drama automation seeds
├── user/             # user.db (persistent)
└── worlds/           # World snapshots
```

---

## 🎯 Development Patterns

### Adding a New Feature

1. **Plan Event Emissions**
   - What events should this feature emit?
   - Add event types to `server/src/events/event-types.ts`

2. **Implement Server-Side**
   - Create service in `server/src/services/`
   - Emit events at key points
   - Use error logger for errors
   - Use AI queue for AI requests

3. **Add WebSocket Handler**
   - Create handler in `server/src/network/ws-handlers/`
   - Validate input
   - Call service
   - Push updates to clients

4. **Build Frontend UI**
   - Create component in `src/components/`
   - Use WebSocket service to communicate
   - Display only - no game logic
   - Update on server push

5. **Test Integration**
   - Check event bus (logs viewer)
   - Verify budget tracking
   - Test error handling
   - Validate data flow

### Code Standards

**TypeScript:**
- Import paths use `.js` extension (ES module convention)
- Strict mode enabled
- Explicit types for function signatures

**Database:**
- All DB init is automatic via `getDB()` calls
- Use parameterized queries (SQL injection protection)
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

## 🎨 UI Architecture

### Desktop Environment
**Location:** `src/components/desktop/`

Tauri-based desktop with:
- Window management
- Taskbar
- Desktop icons
- Context menus
- Window snapping

### Window Types

| Window | Component Path | Purpose |
|--------|---------------|---------|
| **MyFace** | `src/components/platforms/myface/` | Social profiles |
| **Messenger** | `src/components/platforms/messenger/` | Direct messages |
| **Feed** | `src/components/platforms/feed/` | Social feed |
| **Files** | `src/components/desktop/Files.tsx` | Media management |
| **Browser** | `src/components/browser/` | In-game web browser |
| **Settings** | `src/components/settings/` | Configuration |
| **Paint** | `src/components/paint/` | Image editing |
| **Studio** | `src/components/studio/` | Video creation |
| **CobHub** | `src/components/ide/` | Code editor |
| **Chess** | `src/components/chess/` | Minigame |
| **Solitaire** | `src/components/solitaire/` | Minigame |
| **Pinball** | `src/components/pinball/` | Minigame |

### Component Architecture
**Documentation:** [COMPONENT_ARCHITECTURE.md](completed/COMPONENT_ARCHITECTURE.md)

Reusable UI patterns:
- **Button** - Consistent button styling
- **Select** - Custom select dropdowns (NEVER use native `<select>`)
- **Message** - Chat message bubbles
- **Window** - Desktop window container
- **Modal** - Overlay dialogs

---

## 📊 Implementation Status

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for:
- Feature-by-feature audit
- What's working vs documented
- Current gaps
- Next steps

**Quick Summary:**
- ✅ **~95% Complete** - Core systems working
- 🚧 **In Progress** - UI polish, autonomous posting
- 📋 **Planned** - Multiplayer, rare spawns, advanced features

---

## 🔗 Quick Links

### Essential Documentation
- [CLAUDE.md](../CLAUDE.md) - Project guidelines and critical patterns
- [README.md](../README.md) - Project overview
- [ROADMAP.md](ROADMAP.md) - Feature roadmap

### System Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - High-level architecture
- [BACKEND.md](BACKEND.md) - Backend services
- [FRONTEND.md](FRONTEND.md) - Frontend architecture
- [TAURI.md](TAURI.md) - Desktop integration

### Completed Systems (`docs/completed/`)
- [EVENT_BUS_SPEC.md](completed/EVENT_BUS_SPEC.md)
- [EVENT_REFERENCE.md](completed/EVENT_REFERENCE.md)
- [ERROR_LOGGING.md](completed/ERROR_LOGGING.md)
- [AI_QUEUE.md](completed/AI_QUEUE.md)
- [NPC_PERSONALITY_SYSTEM.md](completed/NPC_PERSONALITY_SYSTEM.md)
- [NETWORK_ARCHITECTURE.md](completed/NETWORK_ARCHITECTURE.md)
- [And 13 more...](completed/)

### World Building
- [WORLD_LORE.md](WORLD_LORE.md) - Fictional universe
- [FILLER_SITES.md](FILLER_SITES.md) - Parody websites
- [NEWS_FEED_SYSTEM.md](completed/NEWS_FEED_SYSTEM.md) - News aggregation

---

## 🤝 Contributing

When working on engAIge:

1. **Read CLAUDE.md first** - Contains critical patterns and requirements
2. **Follow the event bus pattern** - All game events go through it
3. **Respect the budget system** - Use AI queue for all AI requests
4. **Keep frontend dumb** - Game logic stays server-side
5. **Document as you go** - Update relevant docs with changes
6. **Test the integration** - Events, budget, errors, data flow

---

## 📝 License

[To be determined]
