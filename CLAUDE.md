# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Name:** engAIge (engage + AI)

**MUST DO:**
Always commit code updates on minor or major features / chores / bug fixes / anything updated after a tool loop with notes to keep steady documentation of development path!
Please when ever there is any feature implementation, that is significant to how the underlying game mechanics work, please always remember to make comprehensive documentation of the files made and the changes made to the files. This is to ensure that the code is maintainable and that the code is easy to understand. And that we dont have to keep going back and forth to understand the code, or end up creating the same code multiple times. This also lets us avoid problems with using multiple AI models in parallel from not understanding the code. If you arnt updating documentation expect me to scold you. AND KEEP IT NEAT AND ORGANIZED! Thank you. :D

---

## ⚠️ CRITICAL: Event Bus - ALL Game Events MUST Go Through Here

**The Event Bus (`server/src/events/event-bus.ts`) is the SINGLE POINT for ALL in-game events.**

Just like the "door" (`server/src/network/door.ts`) is the single exit point for all external HTTP requests, the Event Bus is the single point for all game events. **Nothing significant happens in the game without emitting an event through the bus.**

### When to Emit Events

**ALWAYS emit an event when:**

- A player sends a message or receives a response
- Relationship stats change (trust, affinity, familiarity)
- Relationship stage changes (stranger → friend, etc.)
- An NPC is created, updated, or deleted
- A post is created, liked, or commented on
- Budget is spent or limits are reached
- Background tasks are scheduled, executed, or fail
- WebSocket clients connect or disconnect
- AI requests are sent or responses received
- Memory is created or recalled
- Media is uploaded, generated, or deleted
- Any error occurs that affects game state

### How to Emit Events

```typescript
import { eventBus, EventTypes } from "../events/index.js";

// Fire and forget (most common)
eventBus.fire(
  EventTypes.CONVERSATION_MESSAGE_SENT,
  {
    message_id: id,
    content: message,
    word_count: message.split(/\s+/).length,
  },
  {
    source: "conversation", // Which service emitted this
    player_id: playerId, // Optional context
    npc_id: npcId,
    conversation_id: convId,
    importance: 0.5, // 0-1, affects logging/filtering
  }
);

// Await if you need the event ID (for parent_event_id linking)
const event = await eventBus.emit(
  EventTypes.CONVERSATION_MESSAGE_SENT,
  payload,
  context
);
```

### Event Categories

| Category       | Events                                                       |
| -------------- | ------------------------------------------------------------ |
| `conversation` | message_sent, message_received, message_read, started, ended |
| `relationship` | stats_updated, stage_changed, first_interaction, milestone   |
| `npc`          | created, updated, deleted, mood_changed, went_online/offline |
| `social`       | post_created, post_liked, post_commented, profile_viewed     |
| `ai`           | request_sent, response_received, error, vision_proxied       |
| `budget`       | spent, warning, exhausted, allocation_changed                |
| `scheduler`    | task_scheduled, task_started, task_completed, task_failed    |
| `memory`       | created, recalled, expired                                   |
| `media`        | uploaded, generated, deleted                                 |
| `system`       | startup, shutdown, error, ws_connected, ws_disconnected      |
| `player`       | profile_updated, settings_changed, logged_in/out             |

### Adding New Event Types

1. Add the event type constant to `server/src/events/event-types.ts`
2. Add the payload interface if needed
3. Emit the event in the appropriate service

### Why This Matters

- **Master Log**: Every event is persisted to `game_events` table in SQLite
- **Debugging**: "What happened at 2:30 PM?" → Query the event log
- **Analytics**: Track messages per day, AI costs, relationship progression
- **Replay**: Reconstruct game state from events
- **Decoupling**: Services don't call each other directly - they emit events

**Documentation:**

- **[EVENT_REFERENCE.md](docs/EVENT_REFERENCE.md)** - Quick reference with all events, payloads, and example logs
- **[EVENT_BUS_SPEC.md](docs/EVENT_BUS_SPEC.md)** - Full architecture specification

---

## ⚠️ CRITICAL: Error Logging - ALL Errors MUST Be Logged

**The Error Logger (`server/src/services/error-logger.ts`) is the SINGLE POINT for ALL error handling.**

Just like the Event Bus handles events and the "door" handles HTTP, the Error Logger handles all errors. **Never use plain `console.error()` for errors that should be tracked.**

### When to Use Error Logger

**ALWAYS use errorLogger when:**

- An API call fails (AI, external services)
- Database operations fail
- Validation fails with user input
- Background tasks encounter errors
- WebSocket operations fail
- File/media operations fail
- Any try/catch block catches an error worth tracking

### How to Log Errors

```typescript
import { errorLogger } from "../services/error-logger.js";

// Direct logging
try {
  await riskyOperation();
} catch (error) {
  errorLogger.log(error, {
    source: "ai", // Which service
    operation: "generateResponse", // What was attempted
    npc_id: npcId, // Context
  });
  throw error; // or handle gracefully
}

// Async wrapper (cleaner)
const result = await errorLogger.wrap(() => riskyOperation(), {
  source: "ai",
  operation: "generateResponse",
  npc_id: npcId,
});

// With fallback (doesn't throw)
const result = await errorLogger.wrap(
  () => mightFail(),
  { source: "ai", operation: "parse" },
  { fallback: defaultValue }
);
```

### Severity Levels

| Severity   | Auto-Detection Examples                               |
| ---------- | ----------------------------------------------------- |
| `critical` | Database corruption, out of memory, fatal errors      |
| `high`     | API key invalid, rate limits, auth failures, timeouts |
| `medium`   | Not found, validation failures, parse errors          |
| `low`      | Non-critical issues (default)                         |

### Why This Matters

- **Persistence**: All errors stored in `error_log` table
- **Debugging**: Query errors by source, severity, time range
- **Context**: Full stack traces, related IDs (npc_id, player_id, etc.)
- **Resolution tracking**: Mark errors as resolved with notes
- **Event integration**: Errors emit `system:error` events automatically

**Documentation:**

- **[ERROR_LOGGING.md](docs/ERROR_LOGGING.md)** - Full reference with all patterns and query functions

---

## ⚠️ CRITICAL: AI Queue - ALL AI Requests MUST Go Through the Queue

**The AI Queue (`server/src/services/ai-queue.ts`) manages ALL AI requests with priority and budget control.**

Just like the Door handles HTTP and the Event Bus handles events, the AI Queue handles all AI requests. **Never call AI functions directly for user-facing features - always use the queued versions.**

### Priority Tiers

| Priority   | Use For                        | Budget Reserve             |
| ---------- | ------------------------------ | -------------------------- |
| `CRITICAL` | User DMs, direct requests      | 40% (always runs)          |
| `HIGH`     | NPC follow-ups, reactions      | 25%                        |
| `MEDIUM`   | Scheduled posts, NPC initiates | 20%                        |
| `LOW`      | Background posts, NPC-NPC      | 10%                        |
| `IDLE`     | Pre-generation, analytics      | 5% (only when >80% budget) |

### How to Use

```typescript
import {
  queuedGenerateNPCResponse,
  queuedGenerateNPCPost,
  Priority,
} from "../services/ai.js";

// User sends message (CRITICAL priority - default)
const result = await queuedGenerateNPCResponse(npcId, message, history, {
  player_id: playerId,
  isUserInitiated: true,
});

if (result.status === "completed") {
  const response = result.result;
} else if (result.status === "deferred") {
  // Request queued for later (budget low)
}

// Background post (LOW priority)
const postResult = await queuedGenerateNPCPost(npcId, "twitter", prompt, {
  isBackground: true,
});
```

### Why This Matters

- **User interactions always work** - Critical requests never deferred
- **Budget protection** - Background tasks pause when budget is low
- **Fair allocation** - Reserved budget per priority tier
- **Automatic recovery** - Deferred requests process when budget refreshes
- **Full visibility** - All queue events logged to event bus

**Documentation:**

- **[AI_QUEUE.md](docs/AI_QUEUE.md)** - Full reference with all tiers, events, and patterns

---

## News Feed System (The Recursion Loop)

**The News Feed (`server/src/services/news-feed.ts`) aggregates content from three sources that NPCs consume as "world news" with no distinction between real and fake.**

### Sources

| Source | Description |
|--------|-------------|
| `rss` | Real RSS feeds from external sources (TODO) |
| `user` | Hand-crafted lore articles in `server/data/news/lore/*.json` |
| `ai` | AI-generated articles about trending NPC topics |

### The Loop

1. **Lore/RSS articles** enter the unified feed
2. **NPCs see headlines** in their context (via context-builder)
3. **NPCs mention news** in posts → tracked automatically
4. **Story generator detects trends** (3+ mentions of a topic)
5. **AI generates articles** about what NPCs are discussing
6. **New articles enter feed** → NPCs read them → Loop continues

### How to Initialize

```typescript
import { initializeNewsTasks, scheduleStoryGeneration } from './services/news-tasks.js';
import { startScheduler } from './services/background-scheduler.js';

// Initialize news task handlers and load lore
initializeNewsTasks();

// Schedule story generation every 6 hours
scheduleStoryGeneration({ intervalHours: 6, startDelayMinutes: 5 });

// Start background scheduler
startScheduler(30);
```

### Adding Lore Articles

Create JSON files in `server/data/news/lore/`:

```json
{
  "slug": "unique-slug",
  "headline": "Your Headline",
  "summary": "1-2 sentence summary.",
  "content": "Full article in markdown...",
  "category": "local|tech|entertainment|politics|business|opinion",
  "author": "Byline Name",
  "tags": ["topic", "tags"],
  "sentiment": "positive|negative|neutral"
}
```

**Documentation:**

- **[NEWS_FEED_SYSTEM.md](docs/NEWS_FEED_SYSTEM.md)** - Full spec with schemas, services, and examples

---

## ⚠️ CRITICAL: Form Element Styling Rules

**DO NOT use native HTML `<select>` elements** anywhere in the codebase. Native HTML selects cannot be reliably styled and will appear broken with inconsistent styling across the application.

**ALWAYS use the custom `<Select>` component** (`src/components/ui/Select.tsx`) when you need a select/dropdown element. This custom component:

- Fully styled with theme CSS variables
- Keyboard accessible (arrow keys, enter, escape)
- Consistent appearance across the entire app
- Proper theme integration (colors, borders, hover states)

**Example usage:**

```tsx
import { Select } from "../ui/Select.js";

<Select
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
  options={[
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
  ]}
  placeholder="Choose an option"
/>;
```

If you ever see a native `<select>` in the code, replace it immediately with the `<Select>` component.

---

**engAIge** is a relationship simulator and social media game that reimagines the character AI experience. Unlike cookie-cutter character.ai clones, this is an **idle game with autonomous NPCs** that live, post, and interact in the background.

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
│   ├── displayStore.ts       # Zustand store for display/monitor settings
│   └── wsStore.ts            # WebSocket connection and messaging store
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
│   └── index.ts                      # Database setup, schema initialization
├── events/
│   ├── event-bus.ts                  # THE event bus - all game events go here
│   ├── event-types.ts                # Event type definitions and payload interfaces
│   └── index.ts                      # Re-exports
├── network/
│   ├── door.ts                       # THE external fetch wrapper - all outbound HTTP goes here
│   ├── proxy-config.ts               # SOCKS/HTTP proxy configuration
│   ├── ws-protocol.ts                # WebSocket message type definitions
│   └── ws-server.ts                  # WebSocket server handlers
├── services/
│   ├── ai.ts                         # AI provider abstraction with budget tracking
│   ├── budget.ts                     # Budget management and cost tracking
│   ├── npc.ts                        # NPC CRUD operations
│   ├── npc-personality.ts            # Behavior flags, quirks, message patterns
│   ├── message-formatter.ts          # Realistic message formatting & delays
│   ├── relationships.ts              # Player-NPC relationship stats tracking
│   ├── player.ts                     # Player profile & preferences
│   ├── conversation.ts               # Messaging with formatting & stat updates
│   ├── onboarding.ts                 # First-time setup flow
│   ├── media.ts                      # Media file management
│   ├── export.ts                     # Export/import NPCs and conversations
│   ├── model-capabilities.ts         # Model capability detection
│   ├── vision-proxy.ts               # Image analysis for non-vision models
│   ├── image-generation-proxy.ts     # Image generation proxy
│   └── npc-interaction.ts            # High-level NPC interaction API
├── routes/                           # (API routes go here)
└── utils/
    └── cost-calculator.ts            # AI cost calculation utilities
```

### Network Architecture

**Two-layer design:**

- **Client ↔ Server**: 100% WebSocket (`ws://localhost:4269/ws`)
- **Server ↔ Internet**: HTTP through the "door" (with optional proxy)

The "door" (`server/src/network/door.ts`) is the single exit point for ALL external HTTP requests. When proxy is enabled, all traffic routes through it (SOCKS4/5, HTTP/HTTPS proxy support).

See **[NETWORK_ARCHITECTURE.md](docs/NETWORK_ARCHITECTURE.md)** for complete documentation.

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

## Settings System

**Overview**: Comprehensive user settings management for display, theme, wallpaper, typography, graphics, audio, and accessibility.

### Architecture

**Key Files**:

- `src/stores/settingsStore.ts` - Central Zustand store with persistence for all settings
- `src/components/desktop/SettingsWindow.tsx` - Main settings UI with sidebar navigation (1000×700px default)
- `src/index.css` - CSS variables and kinetic typography animations
- `src/main.tsx` - Settings initialization on app load

**Settings Categories**:

1. **Display Settings** (`DisplayState` in displayStore.ts)

   - Fullscreen toggle (immediate application)
   - Monitor selection (multiple displays)
   - Persisted to localStorage

2. **Wallpaper Settings** (`WallpaperSettings`)

   - Type: `'theme'` (use current theme gradient) or `'custom'` (user-uploaded/URL)
   - Custom source: `'file'` (local upload) or `'url'` (web link)
   - Fit options: `'cover' | 'contain' | 'fill' | 'tile'`
   - Live preview in settings
   - Integrated into Desktop.tsx background styling

3. **Typography Settings** (`TypographySettings`)

   - **Font Family**: 20+ fonts across categories (System, Sans-Serif, Serif, Monospace, Playful)
   - **Font Size**: 80-120% scale (CSS variable `--font-size-scale`)
   - **Line Height**: 1.2-2.0 (CSS variable `--line-height`)
   - **Letter Spacing**: -0.05 to 0.1em (CSS variable `--letter-spacing`)
   - **Font Weight**: normal, medium, semibold, bold (CSS variable `--font-weight-base`)
   - **Kinetic Typography**: Three animation intensities (subtle, moderate, energetic) - automatically disabled when reduce motion is ON

4. **Graphics Settings** (`GraphicsSettings`)

   - **Brightness**: 50-150% (CSS filter)
   - **Contrast**: 50-150% (CSS filter)
   - **Saturation**: 0-200% (CSS filter)
   - **Reduce Motion**: Disables all animations (kinetic typography, transitions)
   - Applied via CSS custom property `--graphics-filter`

5. **Audio Settings** (`AudioSettings`)

   - **Master Volume**: 0-100% (future audio system)
   - **Music Volume**: 0-100% with master override
   - **SFX Volume**: 0-100% with master override
   - Mute toggles for each channel
   - Prepared for future audio implementation

6. **Accessibility Settings** (`AccessibilitySettings`)

   - High contrast mode (future)

7. **Developer Options**
   - Reset onboarding button

### Font List (20+ Fonts)

```
System: System Default
Sans-Serif: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins
Serif: Merriweather, Playfair Display, Lora, Crimson Text
Monospace: Fira Code, JetBrains Mono, Source Code Pro, IBM Plex Mono
Playful: Comic Sans MS, Papyrus, Pacifico, Caveat, Press Start 2P
```

Fonts loaded from Google Fonts CDN in `index.html` with `font-display: swap`.

### Kinetic Typography (Active Typography)

Three animation intensities:

- **Subtle**: Gentle hover lift (translateY -2px), color transitions on headings
- **Moderate**: Gradient text animations cycling through theme colors, fade-in effects for paragraphs
- **Energetic**: Glitch effects (rapid small translate animations), rainbow gradient cycling, text shadow pulses

**Critical**: Kinetic typography is automatically disabled when "Reduce Motion" is enabled (accessibility).

Implementation in `settingsStore.ts`:

```typescript
// Apply kinetic typography ONLY if enabled AND reduce motion is OFF
if (typography.enableAnimations && !graphics.reduceMotion) {
  root.classList.add(`kinetic-${typography.animationStyle}`);
}
```

CSS animations respect OS-level `prefers-reduced-motion` media query.

### Data Persistence

**Storage**: Zustand with localStorage middleware

- Key: `loveai-settings`
- Persisted fields: wallpaper, audio, graphics, typography, accessibility, developer
- Automatic rehydration on app load via `onRehydrateStorage` hook
- Failed rehydration falls back to defaults

### CSS Variables (Applied to `:root`)

```css
--font-family: system-ui
--font-size-scale: 1
--line-height: 1.5
--letter-spacing: 0
--font-weight-base: normal
--graphics-filter: none
```

All theme colors (--color-primary, --color-secondary, etc.) already managed by themeStore.

### UI Organization

**Sidebar Navigation** with 8 sections:

- Display (🖥️)
- Theme (🎨)
- Wallpaper (🖼️)
- Typography (✏️)
- Graphics (✨)
- Audio (🔊)
- Accessibility (♿)
- Developer (🛠️)

**Design Principles**:

- Generous spacing (gap-6, padding-8)
- Visual hierarchy (section titles, descriptions, grouped controls)
- Live previews (wallpaper thumbnail, typography samples)
- Consistent styling using theme CSS variables
- Keyboard accessible (Tab navigation, Enter to activate, Arrow keys for sliders)

### Wallpaper Implementation

**Desktop.tsx Integration**:

```typescript
const backgroundStyle =
  wallpaper.type === "custom" && wallpaper.customPath
    ? {
        backgroundImage: `url(${wallpaper.customPath})`,
        backgroundSize: wallpaper.customFit,
        backgroundPosition: "center",
        backgroundRepeat:
          wallpaper.customFit === "tile" ? "repeat" : "no-repeat",
        backgroundColor: "var(--color-bgSecondary)",
      }
    : { background: currentTheme.colors.gradient };
```

**File Handling**:

- Local files: Converted via `convertFileSrc()` from Tauri to asset protocol URLs
- URLs: Validated with `new URL(url)` constructor
- File picker: Supports PNG, JPG, JPEG, WEBP, GIF, BMP, SVG

### Window Sizing

Default settings window state:

- x: 300, y: 100
- width: 1000px, height: 700px
- Sidebar: 192px wide (fixed)
- Content area: Scrollable, max-width 768px

### Audio System (Future)

Currently prepared for future audio implementation:

```typescript
// Audio elements can be marked with data-type="music" or data-type="sfx"
<audio data-type="music" src="..."></audio>
<audio data-type="sfx" src="..."></audio>

// applyAudioSettings() will update volume on these elements
```

### Limitations & Future Work

**Current Limitations**:

- System-level volume control (requires OS plugin)
- Real display brightness (simulated via CSS filter)
- High contrast mode (UI prepared, not implemented)
- Window decorations toggle (may require restart)

**Future Enhancements**:

- Animated wallpapers (video backgrounds)
- Wallpaper slideshow/rotation
- Custom font uploads
- Text shadow/outline options
- Per-window typography overrides
- Keybinding customization
- Language/localization support

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

See **[PROXY_SYSTEM.md](docs/PROXY_SYSTEM.md)** for complete documentation.

## NPC Personality & Behavior System

NPCs feel alive through detailed personality simulation and realistic messaging behavior.

**Key Files**:

- `server/src/services/npc-personality.ts` - Behavior flags, quirks, message patterns
- `server/src/services/message-formatter.ts` - Realistic message formatting
- `server/src/services/relationships.ts` - Player-NPC relationship tracking

**Behavior Flags:**

- `is_enabled_to_post_freely` - Can post autonomously
- `can_initiate_conversations` - Can DM player first
- `can_send_images` - Can share photos
- `is_active_hours_aware` - Respects sleep/work schedule

**Communication Quirks:**

- Verbosity (short vs long messages)
- Emoji usage, typos, slang, abbreviations
- Sarcasm, optimism, formality levels
- Punctuation style (ellipsis, all caps, etc.)

**Message Patterns:**

- **Multi-message senders**: Break response into 2-5 rapid messages
- **Realistic delays**: Calculate response time based on message length + typing speed
- **Typing indicators**: Show "typing..." for longer responses
- **Active hours**: NPCs only respond during their active hours

**Relationship Stats (0-100):**

- **Trust**: Earned through meaningful conversations, sharing personal content
- **Affinity**: How much they like you (affected by all interactions)
- **Familiarity**: How well you know each other (increases with every message)

**Relationship Stages:**
Stranger → Acquaintance → Friend → Close Friend → Best Friend
↓
Romantic Interest → Partner

**Stat Updates:**

- Each message: +1-2 trust, +1 affinity, +1 familiarity
- Image shared: +3 trust, +2 affinity
- Post liked: +1 affinity
- Post commented: +1 trust, +2 affinity
- Long gaps: Stats may decay

**Personality Presets:**

- `social_butterfly` - Very active, enthusiastic, multi-message sender
- `introvert` - Reserved, slow responses, rarely initiates
- `chaotic_fun` - High energy, typos, slang, rapid messages
- `professional` - Formal, measured, active hours 9-5
- `flirty` - Playful, uses emojis, asks for photos

See **[NPC_PERSONALITY_SYSTEM.md](docs/NPC_PERSONALITY_SYSTEM.md)** for complete documentation.

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
