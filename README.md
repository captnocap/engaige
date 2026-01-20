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

- **CLAUDE.md** - Project architecture and development guide
- **CONTEXT_SYSTEM.md** - How conversation context works (1-on-1, group chats, comments)
- **AUTONOMOUS_CONTEXT.md** - Context building for autonomous NPC behavior
- **OUTPUT_VALIDATION.md** - AI failure detection and fallback system
- **RUNTIME_TOOLS.md** - Tools NPCs can call during conversations
- **IMAGE_GENERATION.md** - Flexible image provider configuration
- **EXAMPLE_CONFIGS.md** - Complete NPC and player configuration examples
- **NPC_PERSONALITY_SYSTEM.md** - Personality traits and message formatting
- **FILES_SYSTEM.md** - Media management and export/import workflows
- **PROXY_SYSTEM.md** - Vision and image generation proxies

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
