# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a relationship simulator and social media game that reimagines the character AI experience. Unlike cookie-cutter character.ai clones, this is an **idle game with autonomous NPCs** that live, post, and interact in the background.

**Core Vision:**
- **MySpace/Twitter/Instagram recreation** - Social platforms with personality (MySpace aesthetic over Facebook)
- **Unified relationship system** - One relationship level between user and NPC across all platforms (messaging, dating sites, social media)
- **Autonomous NPCs** - NPCs create posts, interact with each other, and build memories while the game runs idle
- **Cost-conscious AI usage** - Granular budget controls for API spending across different features
- **Provider agnostic** - OpenAI, OpenAI-compatible (LM Studio), or Anthropic

**Tech Stack:**
- **Frontend**: React + Tauri desktop windowing system (desktop environment UI)
- **Backend**: Bun-based API server for AI-powered NPC simulation and social platform logic

## Product Vision & Roadmap

### First-Time User Experience (Onboarding)
1. **AI Provider Setup** - User configures OpenAI/Anthropic/OpenAI-compatible endpoint
2. **Budget Configuration** - Set overall spending limits and allocations (see Budget System below)
3. **User Profile Creation** - User defines their interests, relationship preferences, personality vibe
4. **Initial NPC Generation** - AI generates ~30 NPCs based on user preferences (background process)
   - Mix of romantic interests and platonic friends based on preferences
   - NPCs get random but coherent personalities, bios, interests, social media presence

### Budget Management System
**Global Spending Controls:**
- User sets max spending limit (overall budget)
- Time-based allocation: daily budgets with rollover for unused credits
- API responses include cost data which feeds into real-time tracking

**Granular Budget Allocation:**
- Example: "20% on NPC personality tuning/creation"
- Example: "50% on raw conversation interactions"
- Example: "$20/month limit on image generations"
- Each feature category tracks spending independently

### Social Platform Features (Planned)
- **MySpace-style profiles** - Custom layouts, Top 8, music players, comments
- **Messaging apps** - Direct messaging, group chats, read receipts
- **Dating sites** - Swiping, matching, ice breakers
- **Twitter/Instagram feeds** - Posts, likes, comments, shares from NPCs
- **Background events** - NPCs post autonomously, interact with each other, build relationships

### Relationship System
- **Single unified relationship level** per NPC (not per platform)
- Interactions across all platforms (DMs, comments, likes, dates) affect one relationship score
- Relationship levels unlock new interactions, deeper conversations, exclusive content
- NPCs remember interactions via SQLite memory system

### Per-NPC Model Configuration
- **Default model** - One model used for all NPCs by default
- **Per-NPC overrides** - Specific NPCs can use different models
  - Example: High-value romantic interest uses Claude Sonnet
  - Example: Background NPCs use cheaper models (minimax, local models)
- User can experiment and optimize cost/quality tradeoffs

### NPC Generation & Autonomy
- **Random persona generation** - AI creates coherent, diverse NPCs
- **Background NPC creation** - New NPCs can be generated while game runs
- **Autonomous posting** - NPCs create social media posts using their memories and personality
- **NPC-to-NPC interactions** - NPCs comment on each other's posts, build relationships
- **Memory-driven behavior** - All NPC actions informed by SQLite memory retrieval

### Files System & Export/Import
- **Media manager** - Files app organizes all media (player uploads, NPC images, generated content)
- **NPC config files** - Export/edit NPC configurations as JSON
- **Memory logs** - Export NPC memory history as readable text
- **Conversation exports** - Export chats to Markdown with embedded images
- **Full NPC export** - Export NPC with all memories, relationships, and conversation history
- **Portable NPCs** - Import NPCs into new games, preserving relationships and memories
- **Collection building** - Build a roster of NPCs that remember you across playthroughs

## Development Commands

**Frontend (Vite + React + Tauri)**
```bash
bun install           # Install dependencies
bun run dev           # Start Vite dev server (http://localhost:1420)
bun run build         # Build frontend for production
bun run preview       # Preview production build
```

**Backend (Mock API Server)**
The backend runs separately using Bun. According to the global instructions, "i run electron you run mock api" - meaning:
- User runs the Electron/Tauri frontend
- Claude Code runs the backend mock API server when needed

The backend is located in `/server` and uses:
- Bun's SQLite (`bun:sqlite`) for three databases: `user.db`, `game.db`, `npc.db`
- TypeScript with ES modules (`.js` imports in TypeScript files)
- Data stored in `/server/data/` directory

## Architecture

### Frontend Structure (`src/`)
```
src/
├── components/
│   └── desktop/
│       ├── Desktop.tsx       # Main container, window manager, state coordination
│       ├── Window.tsx        # Draggable/resizable window component
│       ├── Taskbar.tsx       # Windows-style taskbar with start menu
│       └── DesktopIcon.tsx   # Desktop shortcut icons
├── stores/
│   └── displayStore.ts       # Zustand store for display/monitor settings
├── App.tsx
└── main.tsx
```

**Key Frontend Patterns:**
- Window management uses React state in `Desktop.tsx` to track open windows, z-indices, minimize/maximize states
- Desktop icons trigger window opens via `opensWindow` prop or custom actions
- Phone panel toggles with 'P' key (optional floating widget)
- Wallpapers change based on game state (`default`, `winning`, `losing`)
- All window states persist to localStorage via Zustand

### Backend Structure (`server/src/`)
```
server/src/
├── db/
│   └── index.ts           # Database setup, schema initialization, helpers
├── services/
│   ├── ai.ts              # AI provider abstraction (OpenAI/Anthropic/local)
│   ├── npc.ts             # NPC CRUD operations
│   ├── player.ts          # Player profile & preferences
│   └── conversation.ts    # Messaging system between NPCs/players
├── routes/               # (Empty - API routes go here)
└── utils/                # (Empty - utilities go here)
```

### Database Architecture

**Three-Database System:**
1. **`user.db`** (persistent) - Player profiles, settings, preferences
2. **`npc.db`** (persistent) - NPC definitions, personalities, system prompts, relationships
3. **`game.db`** (resettable) - Conversations, messages, memories, posts, activities

**Key Schema Details:**
- NPCs have flexible personality traits (JSON fields for dynamic prompting)
- Each NPC can override the global AI model config (provider, model, API key, base URL)
- Memories have importance scores and optional expiration
- Conversations track platform (messaging, social media, etc.) and participant types
- NPC relationships include trust levels and affinity scores

### AI System

**Multi-Provider Support:**
- Default: OpenAI-compatible (local server at `http://localhost:1234/v1`)
- Also supports: OpenAI API, Anthropic API
- Per-NPC model overrides available in NPC table

**Prompting Architecture:**
- System prompt built from: NPC identity + personality + bio + occupation + interests
- Relevant memories injected into context (keyword-based retrieval)
- Platform-specific instructions added based on context
- History limited to last 10 messages for conversation continuity

**Memory System:**
- Memories stored per NPC with importance weighting
- Keyword-based retrieval from conversation context
- Auto-generated after each conversation turn
- Optional expiration for temporary memories

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Tauri 2.x
- **Backend**: Bun runtime, TypeScript, SQLite (bun:sqlite)
- **AI**: OpenAI-compatible APIs, Anthropic API
- **Vision/Image Proxies**: Transparent routing for models without vision/image capabilities (see PROXY_SYSTEM.md)

## Adding New Features

### Adding a New Window
1. Define window config in `Desktop.tsx` `windows` array
2. Create component for window content
3. Add corresponding desktop icon in `desktopIcons` array
4. Window state automatically managed by Desktop component

### Adding a New NPC
Use the `createNPC()` service in `server/src/services/npc.ts`:
- Requires: username, display_name, bio, personality, system_prompt
- Optional: AI model overrides, social media handles, interests
- Automatically gets UUID and timestamps

### Adding a New Platform
1. Conversations table supports arbitrary platform strings
2. Update AI prompting in `ai.ts` to adjust tone per platform
3. Add UI components in frontend for platform interaction

## Implementation Priorities

### Phase 1: Core Infrastructure
- [ ] Budget tracking service with cost allocation
- [ ] First-time onboarding flow (provider setup, user profile)
- [ ] AI-powered NPC generation system
- [ ] Background task scheduler for autonomous NPC actions

### Phase 2: Social Platforms
- [ ] MySpace-style profile viewer window
- [ ] Messaging app window (DM conversations)
- [ ] Social feed window (posts from NPCs)
- [ ] Dating app window (swipe interface)

### Phase 3: Autonomous Systems
- [ ] NPC post generation (scheduled background tasks)
- [ ] NPC-to-NPC interactions (comments, likes)
- [ ] Event system (birthdays, holidays, random events)
- [ ] Notification system for user

### Phase 4: Polish & Optimization
- [ ] Per-NPC model assignment UI
- [ ] Budget analytics dashboard
- [ ] Memory importance tuning
- [ ] Relationship progression milestones

## Implementation Considerations

### Budget System Architecture
- Add `api_costs` table to track every API call with: timestamp, provider, model, tokens, cost, feature_category
- Add `budget_config` table for user's allocation rules
- Create budget service that checks before each API call if budget allows
- Daily rollover logic: unused budget accumulates up to max limit

### NPC Generation Strategy
- Use structured output (JSON mode) to generate NPC batches
- Schema: personality traits, bio, interests, occupation, age, gender, relationship_type
- Generate social media history: past posts, friend lists, Top 8
- Validate generated NPCs against user preferences before persisting

### Background Task System
- Use Bun's built-in timers or simple cron-like scheduler
- Task types: generate_post, interact_with_post, send_message, update_relationship
- Priority queue based on NPC importance and user interaction frequency
- Respect budget limits for background tasks

### Autonomous NPC Posting
- Scheduled at realistic intervals (not too frequent)
- Posts reflect NPC personality + recent memories
- Other NPCs can discover and react to posts
- Player sees posts in feed, can like/comment to build relationship

### Platform-Specific Prompting
- MySpace: Casual, personal, HTML-style comments
- Dating app: Flirty, ice-breaker questions, playful
- Messaging: Conversational, builds on history
- Twitter/Instagram: Short, punchy, visual-focused

## Vision & Image Generation Proxy System

**Problem**: Not all AI models support vision (analyzing images) or image generation.

**Solution**: Transparent proxy system that routes requests to capable models while maintaining immersion.

**Key Files**:
- `server/src/services/model-capabilities.ts` - Model capability detection
- `server/src/services/vision-proxy.ts` - Image analysis proxy
- `server/src/services/image-generation-proxy.ts` - Image creation proxy
- `server/src/services/npc-interaction.ts` - High-level API with auto-proxying

**How Vision Proxy Works**:
1. User sends image to NPC
2. System detects if NPC's model supports vision
3. If NO: Route to vision model (GPT-4o-mini), get description, NPC responds using it
4. If YES: Pass image directly to NPC's model
5. Separate budget tracking for vision calls

**How Image Gen Proxy Works**:
1. User requests NPC to generate image
2. NPC creates prompt in their style
3. Route to image gen model (DALL-E 3)
4. NPC responds about the image they "created"
5. Fixed budget for image generation

**Character Consistency**:
- NPCs auto-generate profile portraits during creation
- Reference images stored for img2img workflows
- Users can upload their own photos as references
- Future images maintain character appearance

See **PROXY_SYSTEM.md** for complete documentation.

## Important Notes

- Bun is the package manager and runtime (not npm/yarn)
- TypeScript import paths use `.js` extensions (ES module convention)
- Tauri app runs with native decorations (minimize/maximize/close buttons)
- All database initialization is automatic via `getDB()` calls
- Conversation history automatically triggers NPC responses via AI
- Frontend and backend run independently (no direct integration yet)
- **Cost tracking is critical** - Every AI call must log cost for budget enforcement
- **Background tasks must respect budgets** - Don't let idle game drain user's API credits
- **Vision/Image proxies are transparent** - NPCs can always handle images regardless of their model
- **Reference images ensure consistency** - NPCs and players maintain appearance across generations
