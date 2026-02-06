# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Project Name:** engAIge (engage + AI)

A relationship simulator and social media game with autonomous NPCs that live, post, and interact in the background. Desktop environment UI (React + Tauri) with a Bun-based backend server.

**MUST DO:** Always commit code updates after feature/chore/bugfix work. Always write comprehensive documentation for significant features. Keep docs neat and organized.

---

## ⚠️ CRITICAL: Event Bus - ALL Game Events MUST Go Through Here

**The Event Bus (`server/src/events/event-bus.ts`) is the SINGLE POINT for ALL in-game events.**

**ALWAYS emit an event when:** player messages, relationship changes, NPC CRUD, social interactions, budget changes, scheduler tasks, WS connections, AI requests, memory changes, media operations, or errors occur.

```typescript
import { eventBus, EventTypes } from "../events/index.js";

// Fire and forget (most common)
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT,
  { message_id: id, content: message, word_count: message.split(/\s+/).length },
  { source: "conversation", player_id: playerId, npc_id: npcId, importance: 0.5 }
);

// Await if you need the event ID (for parent_event_id linking)
const event = await eventBus.emit(EventTypes.CONVERSATION_MESSAGE_SENT, payload, context);
```

**Adding new events:** Add constant to `event-types.ts` → Add payload interface → Emit in service.

**Docs:** [EVENT_REFERENCE.md](docs/EVENT_REFERENCE.md) | [EVENT_BUS_SPEC.md](docs/EVENT_BUS_SPEC.md)

---

## ⚠️ CRITICAL: Game Logic Runs Server-Side ONLY

The frontend is a **dumb terminal**. It displays what the server tells it and forwards user actions via WebSocket. ONE event bus, on the server. No game logic client-side.

**Pattern:** User action → WS message → Server processes → Event bus → DB update → Push to frontend → Display

**If you find client-side game logic:** Don't extend it. Flag with TODO. Plan migration server-side with event bus.

---

## ⚠️ CRITICAL: Error Logging

**Use `errorLogger` from `server/src/services/error-logger.ts` for ALL tracked errors.** Never use plain `console.error()`.

```typescript
import { errorLogger } from "../services/error-logger.js";

errorLogger.log(error, { source: "ai", operation: "generateResponse", npc_id: npcId });
// Or with wrapper:
const result = await errorLogger.wrap(() => riskyOp(), { source: "ai", operation: "parse" });
// With fallback (doesn't throw):
const result = await errorLogger.wrap(() => mightFail(), { source: "ai", operation: "parse" }, { fallback: defaultValue });
```

Severity auto-detected: `critical` | `high` | `medium` | `low`. Errors stored in `error_log` table, emit `system:error` events automatically.

**Docs:** [ERROR_LOGGING.md](docs/ERROR_LOGGING.md)

---

## ⚠️ CRITICAL: AI Queue - ALL AI Requests Go Through the Queue

**Use `server/src/services/ai-queue.ts` for ALL AI requests.** Never call AI functions directly.

| Priority | Use For | Budget Reserve |
|----------|---------|----------------|
| `CRITICAL` | User DMs, direct requests | 40% |
| `HIGH` | NPC follow-ups, reactions | 25% |
| `MEDIUM` | Scheduled posts, NPC initiates | 20% |
| `LOW` | Background posts, NPC-NPC | 10% |
| `IDLE` | Pre-generation, analytics | 5% |

```typescript
import { queuedGenerateNPCResponse, Priority } from "../services/ai.js";
const result = await queuedGenerateNPCResponse(npcId, message, history, { player_id, isUserInitiated: true });
```

**Docs:** [AI_QUEUE.md](docs/AI_QUEUE.md)

---

## ⚠️ CRITICAL: Content Guardrails

NPCs MUST respect user-defined content rating: `harsh` (SFW only) → `strict` (teen) → `normal` (relationship-gated) → `relaxed` (NSFW) → `none` (unrestricted). System prompts inject guardrail addendums. Output validation checks against rating limits.

**Docs:** [CONTENT_GUARDRAILS.md](docs/CONTENT_GUARDRAILS.md)

---

## ⚠️ CRITICAL: Form Element Styling

**NEVER use native HTML `<select>`.** Always use `<Select>` from `src/components/ui/Select.tsx`. If you see a native `<select>`, replace it immediately.

---

## ⚠️ CRITICAL: Import Through Barrel Exports

Always import from barrel `index.ts` files, not directly from sub-files.

| Module | Barrel Path |
|--------|-------------|
| Message UI | `components/ui/Message` |
| Settings | `components/settings` |
| Onboarding | `components/onboarding` |

---

## ⚠️ CRITICAL: Filler Site Quality - NO DEAD ENDS

1. If it looks clickable, it MUST work - no dead links, no empty buttons
2. Show what you claim - no "847 comments" with an empty section
3. Depth over shortcuts - 20 interconnected pages beats 1 shallow page
4. Test like a user - click every element before considering a site done

**Docs:** [FILLER_SITES.md](docs/FILLER_SITES.md)

---

## ⚠️ CRITICAL: World Lore - If You Reference It, Build It

Every URL/link/reference in the game world MUST lead somewhere real. Cross-reference existing lore. Use **847** as the running Easter egg.

| Lore Pillar | Key Details |
|-------------|-------------|
| Quantum Coffee | $47/cup, Derek obsessed, Martinez Study |
| Hartwell Building | Missing 13th floor, Omnicorp, 1923 mystery |
| The Underground | Mars's venue, hosts TFT and bands |
| Trust Fall Tim | 2,847 falls, 78.5% catch rate, Small Kevin |
| Velvet Algorithms | Electronic duo, meditation hiatus |
| Neon Requiem | Post-punk, broke up Jan 2024 |

**Docs:** [WORLD_LORE.md](docs/WORLD_LORE.md)

---

## News Feed System

Aggregates RSS (TODO), hand-crafted lore (`server/data/news/lore/*.json`), and AI-generated articles into a unified feed. NPCs see headlines → mention in posts → story generator detects trends (3+ mentions) → AI generates articles → loop continues.

**Docs:** [NEWS_FEED_SYSTEM.md](docs/NEWS_FEED_SYSTEM.md)

---

## Development Commands

```bash
bun install           # Install dependencies
bun run dev           # Start Vite dev server (http://localhost:1420)
bun run build         # Build frontend for production
```

**Backend:** Bun server in `/server/`. Three SQLite databases in `/server/data/`. TypeScript with `.js` import extensions.

---

## Architecture

### Network
- **Client ↔ Server**: 100% WebSocket (`ws://localhost:4269/ws`)
- **Server ↔ Internet**: HTTP through the "door" (`server/src/network/door.ts`) with optional SOCKS/HTTP proxy
- **Docs:** [NETWORK_ARCHITECTURE.md](docs/NETWORK_ARCHITECTURE.md)

### Databases
1. **`user.db`** (persistent) - Player profiles, settings
2. **`npc.db`** (persistent) - NPC definitions, personalities, relationships
3. **`game.db`** (resettable) - Conversations, messages, memories, posts

### AI System
- Multi-provider: OpenAI-compatible (default localhost:1234), OpenAI API, Anthropic API
- Per-NPC model overrides in NPC table
- Vision/image generation proxies for models lacking those capabilities → [PROXY_SYSTEM.md](docs/PROXY_SYSTEM.md)

### NPC System
- Personality simulation: behavior flags, communication quirks, message patterns
- Relationship stats: Trust, Affinity, Familiarity (0-100)
- Stages: Stranger → Acquaintance → Friend → Close Friend → Best Friend (+ Romantic branch)
- **Docs:** [NPC_PERSONALITY_SYSTEM.md](docs/NPC_PERSONALITY_SYSTEM.md)

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Tauri 2.x
- **Backend**: Bun runtime, TypeScript, SQLite (bun:sqlite)
- **AI**: OpenAI-compatible APIs, Anthropic API

## Important Notes

- Bun is the package manager and runtime (not npm/yarn)
- TypeScript import paths use `.js` extensions (ES module convention)
- All database initialization is automatic via `getDB()` calls
- Cost tracking is critical - every AI call must log cost for budget enforcement
- Background tasks must respect budgets
- Vision/Image proxies are transparent to NPCs
