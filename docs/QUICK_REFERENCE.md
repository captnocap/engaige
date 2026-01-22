# Documentation Quick Reference

**Last Updated:** 2026-01-22

Fast lookup guide for finding the right documentation.

## 🔍 I need to...

### Understand what's already built
→ **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Complete audit of all features

### Learn about a working system
→ **[/completed/](./completed/)** - All fully implemented systems (17 docs)

### See what's planned
→ **[ROADMAP.md](./ROADMAP.md)** - Full vision and future features
→ **[ROADMAP_CHECKLIST.md](./ROADMAP_CHECKLIST.md)** - Phase-by-phase tracking

### Add a new feature that uses...

#### Events
→ **[completed/EVENT_REFERENCE.md](./completed/EVENT_REFERENCE.md)** - All event types with examples
→ **[completed/EVENT_BUS_SPEC.md](./completed/EVENT_BUS_SPEC.md)** - Architecture and patterns

#### Errors
→ **[completed/ERROR_LOGGING.md](./completed/ERROR_LOGGING.md)** - All error handling patterns

#### AI Requests
→ **[completed/AI_QUEUE.md](./completed/AI_QUEUE.md)** - How to queue requests properly
→ **[completed/AI_PROVIDERS.md](./completed/AI_PROVIDERS.md)** - Provider configuration

#### NPCs
→ **[completed/NPC_PERSONALITY_SYSTEM.md](./completed/NPC_PERSONALITY_SYSTEM.md)** - Personality system
→ **[completed/NPC_THOUGHTS_SYSTEM.md](./completed/NPC_THOUGHTS_SYSTEM.md)** - Reasoning extraction
→ **[completed/AUTONOMOUS_CONTEXT.md](./completed/AUTONOMOUS_CONTEXT.md)** - Autonomous behavior

#### Images
→ **[completed/PROXY_SYSTEM.md](./completed/PROXY_SYSTEM.md)** - Vision & image proxies
→ **[completed/IMAGE_GENERATION.md](./completed/IMAGE_GENERATION.md)** - Image generation

#### Conversations
→ **[completed/CONTEXT_SYSTEM.md](./completed/CONTEXT_SYSTEM.md)** - 1-on-1, group, threaded
→ **[completed/RUNTIME_TOOLS.md](./completed/RUNTIME_TOOLS.md)** - Tools NPCs can use

#### UI Components
→ **[completed/COMPONENT_ARCHITECTURE.md](./completed/COMPONENT_ARCHITECTURE.md)** - Reusable patterns
→ **[FILLER_SITES.md](./FILLER_SITES.md)** - Browser site reference

### Debug or monitor the system
→ **[completed/LOGS_VIEWER.md](./completed/LOGS_VIEWER.md)** - Using the logs window
→ **[completed/EVENT_REFERENCE.md](./completed/EVENT_REFERENCE.md)** - Understanding events
→ **[completed/ERROR_LOGGING.md](./completed/ERROR_LOGGING.md)** - Query error logs

### Understand the codebase structure
→ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - High-level overview
→ **[BACKEND.md](./BACKEND.md)** - Server structure
→ **[FRONTEND.md](./FRONTEND.md)** - Client structure
→ **[TAURI.md](./TAURI.md)** - Desktop integration

---

## 📚 By Topic

### Core Systems (All in /completed/)
| Topic | File |
|-------|------|
| Events | EVENT_BUS_SPEC.md, EVENT_REFERENCE.md |
| Errors | ERROR_LOGGING.md |
| AI Queue | AI_QUEUE.md |
| AI Providers | AI_PROVIDERS.md |
| Network | NETWORK_ARCHITECTURE.md |
| Logging | LOGS_VIEWER.md |

### NPC Intelligence (All in /completed/)
| Topic | File |
|-------|------|
| Personality | NPC_PERSONALITY_SYSTEM.md |
| Thoughts | NPC_THOUGHTS_SYSTEM.md |
| Autonomous Behavior | AUTONOMOUS_CONTEXT.md |
| Drama Generation | DRAMA_AUTOMATION.md |

### AI & Content (All in /completed/)
| Topic | File |
|-------|------|
| Vision Proxy | PROXY_SYSTEM.md |
| Image Generation | IMAGE_GENERATION.md |
| Runtime Tools | RUNTIME_TOOLS.md |
| Output Validation | OUTPUT_VALIDATION.md |
| Conversation Context | CONTEXT_SYSTEM.md |

### UI & Frontend (Mixed)
| Topic | File | Status |
|-------|------|--------|
| Component Patterns | completed/COMPONENT_ARCHITECTURE.md | ✅ |
| Browser Sites | FILLER_SITES.md | ✅ |
| Settings System | CLAUDE.md (embedded) | ✅ |
| Desktop Environment | FRONTEND.md | ✅ |

### Future/Partial Features
| Topic | File | Status |
|-------|------|--------|
| Content Guardrails | CONTENT_GUARDRAILS.md | 🟡 Partial |
| Files Import | FILES_SYSTEM.md | 🟡 Export only |
| Rare Spawns | RARE_SPAWN_SYSTEM.md | ❌ Spec only |
| Multiplayer | MULTIPLAYER_ARCHITECTURE.md | ❌ Spec only |
| RSS Feeds | NEWS_FEED_SYSTEM.md | 🟡 90% done |

---

## 🎯 Common Tasks

### Adding a new event type
1. Read: **[completed/EVENT_REFERENCE.md](./completed/EVENT_REFERENCE.md)**
2. Add to: `server/src/events/event-types.ts`
3. Emit using: `eventBus.fire(EventTypes.YOUR_EVENT, payload, context)`

### Adding a new AI provider
1. Read: **[completed/AI_PROVIDERS.md](./completed/AI_PROVIDERS.md)**
2. Use: `upsertAIProvider()` in `server/src/services/ai-provider-config.ts`

### Creating a new NPC
1. Read: **[EXAMPLE_CONFIGS.md](./EXAMPLE_CONFIGS.md)**
2. Use: `createNPC()` in `server/src/services/npc.ts`
3. Or: Use onboarding flow to generate batch

### Adding a new browser site
1. Read: **[FILLER_SITES.md](./FILLER_SITES.md)**
2. Create: `src/components/browser/sites/YourSite.tsx`
3. Register in: `src/components/browser/BrowserSiteContainer.tsx`

### Debugging an issue
1. Open: Logs window in app (📊 icon)
2. Read: **[completed/LOGS_VIEWER.md](./completed/LOGS_VIEWER.md)**
3. Check: Events tab, Errors tab, Queue tab

---

## 📏 Documentation Standards

### When writing new docs
- Place completed features in **/completed/**
- Place specs/plans in **/docs/**
- Always include implementation status at top
- Cross-reference related docs
- Include code examples
- Keep it up to date with code

### When moving docs to /completed/
1. Feature must be 100% implemented
2. Code must be tested and working
3. No major TODOs remaining
4. Update IMPLEMENTATION_STATUS.md
5. Add "Reference documentation" note at top

---

## 🗂️ File Count

| Directory | Count | Purpose |
|-----------|-------|---------|
| /docs/ | 16 | Active development, specs, overviews |
| /completed/ | 18 | Fully implemented reference docs |
| **Total** | **34** | Complete documentation set |

---

## 💡 Pro Tips

1. **New to the project?** Start with ARCHITECTURE.md, then ROADMAP.md
2. **Implementing a feature?** Check IMPLEMENTATION_STATUS.md first
3. **Using an existing system?** Check /completed/ for reference
4. **Planning new features?** See ROADMAP.md for vision alignment
5. **Debugging?** Use Logs window + ERROR_LOGGING.md
6. **Understanding NPCs?** Read NPC_PERSONALITY_SYSTEM.md first

---

**Need something not listed here?** Check **[README.md](./README.md)** for full index.
