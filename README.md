# engAIge

> A gamified relationship simulator with autonomous AI NPCs

**engAIge** (engage + AI) is a social simulation game where AI-powered NPCs live autonomous digital lives. They post on MySpace, chat with friends, build relationships, and remember every interaction—all while you're away.

## What Makes engAIge Different?

Unlike traditional chatbots or character AI platforms:

- **🌐 Living Social Network**: NPCs post on MySpace/Instagram, comment on each other's content, and build social circles
- **🤖 Autonomous Behavior**: NPCs act independently—they initiate conversations, post updates, and interact when you're offline
- **💭 Deep Memory System**: NPCs remember conversations, develop relationships, and evolve their personalities over time
- **💰 Cost-Conscious Design**: Granular budget controls across all AI features (conversations, autonomous posts, image generation)
- **🎨 MySpace Aesthetic**: Early 2000s social media vibe with profile songs, top 8s, and custom themes
- **🔧 Provider Agnostic**: Works with OpenAI, Anthropic, or local models (LM Studio, ollama)

## Features

### NPC Simulation
- **Rich Personalities**: 20+ personality traits, communication quirks, topic interests
- **Realistic Messaging**: Multi-message patterns, typing speeds, response delays
- **Social Presence**: Auto-generated MySpace profiles with aesthetic themes
- **Relationship Tracking**: Trust, affinity, familiarity stats that evolve naturally

### Background Agents
- **Memory Writer**: Automatically extracts key memories from conversations
- **Relationship Analyzer**: Analyzes conversation dynamics and updates stats
- **Profile Populator**: Generates MySpace profiles, profile pictures, initial posts
- **Output Validator**: Catches AI failures and maintains immersion with pre-generated fallbacks

### Social Features
- **Direct Messages**: One-on-one conversations with realistic timing
- **Group Chats**: Multiple NPCs with parallel response generation
- **Threaded Comments**: Reddit/Instagram-style comment trees on posts
- **Autonomous Posts**: NPCs create content based on their recent life and social context

### Advanced Systems
- **Runtime Tools**: NPCs can generate images, search memories, check relationships mid-conversation
- **Flexible Image Generation**: Support for any image provider (DALL-E, Stable Diffusion, etc.) with payload templates
- **Image Compression**: Automatic compression to meet provider payload limits
- **Context-Aware Generation**: NPCs reference each other's posts, build social coherency

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand
- **Desktop**: Tauri 2.x (native windowing)
- **Backend**: Bun runtime, TypeScript, bun:sqlite
- **AI**: OpenAI, Anthropic, or OpenAI-compatible APIs (local models)
- **Image Processing**: Sharp (compression & optimization)

## Architecture

### Three-Database System
- **user.db**: Persistent player data, settings, budget config
- **npc.db**: Persistent NPC definitions and personalities
- **game.db**: Resettable game state (conversations, posts, relationships)

### Budget System
Granular cost tracking with category allocations:
- NPC Generation
- Conversations
- Autonomous Posts
- Image Generation
- Vision Proxy
- Random Events

### Personality System
Each NPC has:
- Dynamic personality traits (JSON blob, fully customizable)
- Behavior flags (can post freely, initiate conversations, etc.)
- Topic interests (0-1 intensity for 25+ topics)
- Communication quirks (verbosity, emoji usage, typos, slang)
- Message patterns (multi-message sender, typing speed, delays)
- 17 pre-generated fallback responses for immersion protection

## Documentation

### 🎯 Start Here

New to engAIge? Start with these:

1. **[docs/GAME_SYSTEMS.md](docs/GAME_SYSTEMS.md)** - Complete game overview (everything explained)
2. **[docs/SYSTEM_INDEX.md](docs/SYSTEM_INDEX.md)** - Master map of all systems and where to find things
3. **[CLAUDE.md](CLAUDE.md)** - Critical development patterns and project guidelines

### 📚 Core Documentation

**Architecture:**
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - High-level system design
- [docs/BACKEND.md](docs/BACKEND.md) - Backend services and API
- [docs/FRONTEND.md](docs/FRONTEND.md) - Frontend architecture
- [docs/TAURI.md](docs/TAURI.md) - Desktop environment

**Code Guides:**
- [server/src/README.md](server/src/README.md) - Backend source code guide
- [server/data/README.md](server/data/README.md) - Database and content structure
- [src/components/README.md](src/components/README.md) - Frontend components guide

**Completed Systems** (in [docs/completed/](docs/completed/)):
- [Event Bus](docs/completed/EVENT_BUS_SPEC.md) - Central event system
- [AI Queue](docs/completed/AI_QUEUE.md) - Priority-based AI requests
- [NPC Personality](docs/completed/NPC_PERSONALITY_SYSTEM.md) - How NPCs behave
- [Error Logging](docs/completed/ERROR_LOGGING.md) - Error handling
- [And 15+ more...](docs/completed/)

**World Content:**
- [docs/FILLER_SITES.md](docs/FILLER_SITES.md) - 20+ parody websites
- [docs/WORLD_LORE.md](docs/WORLD_LORE.md) - Fictional universe
- [docs/completed/NEWS_FEED_SYSTEM.md](docs/completed/NEWS_FEED_SYSTEM.md) - News aggregation

### 🔍 Quick Navigation

**"I want to..."**
- Understand the game → [GAME_SYSTEMS.md](docs/GAME_SYSTEMS.md)
- Find specific functionality → [SYSTEM_INDEX.md](docs/SYSTEM_INDEX.md)
- Start developing → [CLAUDE.md](CLAUDE.md)
- Understand backend → [server/src/README.md](server/src/README.md)
- Understand frontend → [src/components/README.md](src/components/README.md)
- See what's done → [docs/completed/](docs/completed/)
- Check roadmap → [docs/ROADMAP.md](docs/ROADMAP.md)

## Getting Started

```bash
# Install dependencies
bun install

# Run development server (frontend + backend)
bun run dev

# Build for production
bun run build
```

## Configuration

1. **AI Provider**: Set up OpenAI, Anthropic, or local model endpoint
2. **Budget**: Configure spending limits and category allocations
3. **Image Provider**: Configure DALL-E, Stable Diffusion, or custom provider
4. **Theme**: Choose from 9 pre-built themes or create custom

## Status

🚧 **Active Development** - Core systems complete, UI in progress

### Completed
- ✅ Budget system with granular tracking
- ✅ NPC personality system (20+ traits, quirks, patterns)
- ✅ Background agents (memory, relationship, profile population)
- ✅ Runtime tools (image generation, memory search)
- ✅ Output validation & fallback system
- ✅ Flexible image generation with compression
- ✅ Context system (1-on-1, group chats, threaded comments)
- ✅ Theme system (9 themes including Catppuccin variants)
- ✅ Export/import system (NPCs, conversations, media)

### In Progress
- 🚧 Desktop UI windows (MySpace, Messenger, Files)
- 🚧 NPC generation workflow
- 🚧 Autonomous posting system
- 🚧 Social feed implementation

## License

[To be determined]

## Project Name

**engAIge** - where AI and engagement meet. Because these NPCs don't just respond—they engage.
