# engAIge Roadmap

**Last Updated:** 2026-01-24
**Overall Progress:** ~95% of Original Roadmap Complete

This roadmap is organized into completed phases (for reference) and active development phases (for implementation). Features are ordered by dependencies and priority.

---

## Current Status Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Core Infrastructure | **Complete** | 100% |
| Phase 2: Social Platforms | **Complete** | 100% |
| Phase 3: Autonomous Systems | **Complete** | 95% |
| Phase 4: Desktop Apps & Content | **Complete** | 90% |
| Phase 5: Polish & Completion | **In Progress** | 60% |
| Phase 6: Advanced Features | **Planned** | 0% |
| Phase 7: Multiplayer | **Spec Only** | 0% |

---

## Phase 5: Polish & Completion (Current Priority)

These are partially implemented features that need completion. Order reflects dependencies.

### 5.1 Content Guardrails Completion
**Documentation:** [CONTENT_GUARDRAILS.md](CONTENT_GUARDRAILS.md)
**Status:** 80% complete - System designed, not fully wired

**What's Done:**
- Rating levels defined (harsh/strict/normal/relaxed/none)
- System prompt injection framework
- Output validation against ratings

**What's Needed:**
- [ ] Add `content_rating` column to `posts` table
- [ ] Add `content_rating` column to `messages` table
- [ ] Add `content_rating` column to `media_files` table
- [ ] Implement content filtering queries per rating
- [ ] Add Content Rating selector to Settings UI
- [ ] Wire rating to NPC generation prompts
- [ ] Test enforcement across all content types

**Priority:** HIGH - Blocks safe content display

---

### 5.2 Files System Import
**Documentation:** [FILES_SYSTEM.md](FILES_SYSTEM.md)
**Status:** 80% complete - Export works, import missing

**What's Done:**
- `exportConversationToMarkdown()` - Conversation export
- `exportNPCConfig()` - NPC config export (JSON)
- `exportNPCMemoryLog()` - Memory log export (TXT)
- `exportNPCWithData()` - Full NPC export with all data

**What's Needed:**
- [ ] Implement `importNPCFromExport()` function
- [ ] Handle relationship preservation on import
- [ ] Handle conversation history restoration
- [ ] Handle memory restoration with new IDs
- [ ] Add import UI to Files window
- [ ] Test round-trip: export -> import -> verify

**Priority:** MEDIUM - Enables NPC portability

---

### 5.3 News Feed RSS Integration
**Documentation:** [NEWS_FEED_SYSTEM.md](NEWS_FEED_SYSTEM.md)
**Status:** 90% complete - Core loop works, RSS fetching missing

**What's Done:**
- Unified feed architecture
- Lore article loading from JSON
- AI article generation from NPC trends
- Trend detection and story generator
- NPC news exposure tracking
- Background task integration

**What's Needed:**
- [ ] Implement RSS feed fetching in `news-tasks.ts`
- [ ] Add RSS feed URL configuration
- [ ] Parse and normalize external articles
- [ ] Handle feed errors gracefully
- [ ] Add RSS source attribution

**Priority:** LOW - Nice to have for world grounding

---

### 5.4 Events System Completion
**Status:** Scheduler ready, event content not implemented

**What's Done:**
- Background scheduler with 11+ task types
- Event bus with 40+ event types
- Time system with day/night awareness

**What's Needed:**
- [ ] Birthday event implementation
  - [ ] Track NPC birthdays in database
  - [ ] Trigger birthday posts from NPCs
  - [ ] Birthday message prompts
  - [ ] Birthday gift mechanics
- [ ] Holiday event implementation
  - [ ] Holiday calendar configuration
  - [ ] Holiday-themed NPC posts
  - [ ] Seasonal mood adjustments
- [ ] Random drama events
  - [ ] Event trigger probability system
  - [ ] Drama scenario templates
  - [ ] NPC reaction chains

**Priority:** MEDIUM - Adds life to the world

---

### 5.5 Notification System UI
**Status:** Events fire, no UI toast

**What's Done:**
- Event emission for all significant actions
- Event persistence in database
- WebSocket event streaming

**What's Needed:**
- [ ] Toast notification component
- [ ] Notification center window
- [ ] Notification preferences in Settings
- [ ] Notification history view
- [ ] Desktop notification integration (Tauri)
- [ ] Notification sounds (tie to audio system)

**Priority:** MEDIUM - Improves engagement

---

### 5.6 Budget Analytics Dashboard
**Status:** Data available, no visualizations

**What's Done:**
- Wallet window with spending overview
- Cost logs viewer
- Feature category breakdown
- Historical cost tracking

**What's Needed:**
- [ ] Spending over time chart
- [ ] Category breakdown pie chart
- [ ] Daily/weekly/monthly trend graphs
- [ ] Budget usage progress bars
- [ ] Cost prediction estimates

**Priority:** LOW - Nice to have

---

### 5.7 Top 8 Friends Feature
**Status:** UI placeholder exists

**What's Needed:**
- [ ] Top 8 selection UI on profile
- [ ] Top 8 display on MyFace profiles
- [ ] NPC Top 8 generation during creation
- [ ] Relationship effects from Top 8 inclusion/removal
- [ ] Drama events when NPCs notice changes

**Priority:** LOW - Nostalgia feature

---

## Phase 6: Advanced Features (Next Major Phase)

These are well-specified features that haven't been implemented yet.

### 6.1 Rare Spawn System
**Documentation:** [RARE_SPAWN_SYSTEM.md](RARE_SPAWN_SYSTEM.md)
**Status:** Spec complete, not implemented

**Concept:** Special NPC abilities assigned by rarity tier, creating unique content variety.

**Rarity Tiers:**
- Common (40%): No special abilities
- Uncommon (25%): 1 basic tool
- Rare (10%): 1-2 enhanced tools
- Legendary (2%): Unique ability
- Vanilla (23%): Pure personality, no tools

**Tools (10 types):**
| Tool | Description |
|------|-------------|
| `blog_writer` | Writes long-form blog posts |
| `shitposter` | Creates memes and shitposts |
| `review_writer` | Reviews restaurants, movies, products |
| `photographer` | Posts aesthetic photography |
| `poet_writer` | Writes poetry and prose |
| `artist` | Creates digital art |
| `musician` | Shares music and playlists |
| `conspiracy_poster` | Posts conspiracy theories |
| `developer` | Posts about tech and code |
| `journalist` | Investigative posts about world events |

**Implementation Tasks:**
- [ ] Add database schema
  - [ ] `spawn_rarity` column on NPCs
  - [ ] `assigned_tool` column on NPCs
  - [ ] `tool_config` JSON column
  - [ ] `tool_artifacts` table for tool outputs
- [ ] Modify NPC generator
  - [ ] Rarity roll on generation
  - [ ] Tool assignment logic
  - [ ] Guaranteed slots (10 tools in first 30 NPCs)
- [ ] Implement tool runtime
  - [ ] Tool execution scheduling
  - [ ] Tool-specific prompting
  - [ ] Artifact storage and display
- [ ] Add UI elements
  - [ ] Tool badge on NPC profiles
  - [ ] Tool artifact galleries
  - [ ] Developer mode: NPC inspector

**Priority:** HIGH - Adds significant content variety

---

### 6.2 Personality Assessment System
**Documentation:** Referenced in [ONBOARDING_FLOW.md](ONBOARDING_FLOW.md)
**Status:** Specified in onboarding, needs standalone implementation

**Concept:** 30-question personality test during onboarding that shapes NPC generation.

**10 Player Archetypes:**
| Archetype | Behavior |
|-----------|----------|
| `the_validator` | Seeks agreement and validation |
| `the_independent` | Values autonomy, dislikes neediness |
| `the_peacekeeper` | Avoids conflict, mediates |
| `the_confronter` | Enjoys debate and challenge |
| `the_empath` | Deep emotional connections |
| `the_stoic` | Reserved, values privacy |
| `the_social_butterfly` | Many casual connections |
| `the_selective` | Few deep relationships |
| `the_chaos_agent` | Enjoys unpredictability |
| `the_stability_seeker` | Values routine and consistency |

**NPC Distribution Based on Assessment:**
- 40% compatible with player archetype
- 30% challenging (growth opportunities)
- 20% antagonistic (conflict generators)
- 10% wildcards (random personalities)

**Implementation Tasks:**
- [ ] Create question bank (30 questions)
- [ ] Build assessment UI component
- [ ] Implement scoring algorithm
- [ ] Archetype detection logic
- [ ] Integrate with NPC generator weights
- [ ] Store assessment results in player profile

**Priority:** MEDIUM - Improves NPC relevance

---

### 6.3 World Map System
**Documentation:** [WORLD_MAP_DEVELOPMENT_GUIDE.md](WORLD_MAP_DEVELOPMENT_GUIDE.md), [WORLD_MAP_QUICK_START.md](WORLD_MAP_QUICK_START.md), [WORLD_MAP_VISUAL_SIMULATION.md](WORLD_MAP_VISUAL_SIMULATION.md)
**Status:** Recently added, Three.js implementation

**What Exists:**
- 3D globe visualization
- Pure Three.js (replaced maptalks)

**What May Need:**
- [ ] NPC location markers
- [ ] Location-based events
- [ ] Travel mechanics
- [ ] Region-specific content

**Priority:** LOW - Visual enhancement

---

## Phase 7: Multiplayer (Future)

### 7.1 Discord Mesh Network
**Documentation:** [MULTIPLAYER_ARCHITECTURE.md](MULTIPLAYER_ARCHITECTURE.md)
**Status:** Comprehensive spec, not implemented

**Concept:** Decentralized multiplayer using Discord bots as encrypted relays.

**Key Features:**
- No central server required
- No IP exposure or port forwarding
- Player-controlled Discord bots as relays
- End-to-end encryption (AES-256-GCM)
- Friend-of-friend content bridging
- Full privacy controls

**5 Implementation Phases:**

**Phase 7.1a: Basic Sync**
- [ ] Discord bot scaffolding
- [ ] Encryption layer implementation
- [ ] Single-server sync
- [ ] Basic message schemas

**Phase 7.1b: Full Content**
- [ ] NPC post sharing
- [ ] NPC profile sync
- [ ] World event broadcasting
- [ ] Media handling

**Phase 7.1c: Bridging**
- [ ] Friend-of-friend discovery
- [ ] Content routing
- [ ] Multi-hop encryption

**Phase 7.1d: Control & Privacy**
- [ ] User blocking
- [ ] Content deletion propagation
- [ ] Sharing preferences
- [ ] Receiver-side content filtering

**Phase 7.1e: Polish**
- [ ] Rate limiting
- [ ] Error recovery
- [ ] UI for network status
- [ ] Onboarding flow

**Dependencies:**
- Content Guardrails must be complete (receiver-side safety)
- Event bus (for sync events)
- Export/Import system (for NPC sharing)

**Priority:** LOW - Major future feature

---

## Reference: Completed Phases

These phases are complete and documented in `/docs/completed/`.

### Phase 1: Core Infrastructure (100% Complete)

| Component | Documentation |
|-----------|---------------|
| Event Bus | `completed/EVENT_BUS_SPEC.md`, `completed/EVENT_REFERENCE.md` |
| Error Logging | `completed/ERROR_LOGGING.md` |
| AI Queue | `completed/AI_QUEUE.md` |
| AI Providers | `completed/AI_PROVIDERS.md` |
| Network Architecture | `completed/NETWORK_ARCHITECTURE.md` |
| Budget System | Embedded in main docs |
| Background Scheduler | Embedded in main docs |

### Phase 2: Social Platforms (100% Complete)

| Platform | Status |
|----------|--------|
| MyFace (MySpace) | Full profiles, feeds, comments |
| InstaSnap (Instagram) | Feed, profiles, stories, hashtags |
| Messenger | DMs, group chats, typing indicators |
| Dating App (Spark) | Swipe interface, matching |
| Threadit (Reddit) | Forums, threading, communities |
| 20+ Filler Sites | WikiKnow, VidTube, DailyBuzz, etc. |

### Phase 3: Autonomous Systems (95% Complete)

| System | Status |
|--------|--------|
| Social Autopilot | NPC autonomous posting |
| Conversation Initiator | NPCs DM first |
| Memory System | Auto-generation, retrieval |
| Relationship System | 7 stages, stat tracking |
| Drama Engine | NPC-NPC drama automation |
| NPC Thoughts | Reasoning extraction, deliberation |

### Phase 4: Desktop Apps & Content (90% Complete)

| App | Status |
|-----|--------|
| Desktop Environment | Windows, taskbar, icons |
| Settings | Display, theme, typography, graphics |
| Browser | 20+ parody sites |
| Files | Export (import pending) |
| Wallet | Budget overview |
| Logs | Events, errors, queue |
| NPC Inspector | Developer mode |

---

## World Building Reference

These are reference documents that guide content creation, not features to implement.

| Document | Purpose |
|----------|---------|
| [WORLD_LORE.md](WORLD_LORE.md) | Interconnected lore (Quantum Coffee, Hartwell Building, 847 Easter egg) |
| [FILLER_SITES.md](FILLER_SITES.md) | Quality standards for browser sites |
| [CONTENT_TEMPLATES.md](CONTENT_TEMPLATES.md) | Templates for NPC content generation |
| [EXAMPLE_CONFIGS.md](EXAMPLE_CONFIGS.md) | Reference configs for NPCs and players |

---

## Implementation Priority Summary

### Immediate (Current Sprint)
1. **Content Guardrails Completion** - HIGH - 3-5 days
2. **Files System Import** - MEDIUM - 2-3 days
3. **Events System (Birthday/Holiday)** - MEDIUM - 3-5 days

### Short Term (Next Sprint)
4. **Rare Spawn System** - HIGH - 5-10 days
5. **Personality Assessment** - MEDIUM - 4-6 days
6. **Notification UI** - MEDIUM - 2-3 days

### Medium Term (Next Month)
7. **RSS Feed Integration** - LOW - 1-2 days
8. **Budget Analytics Charts** - LOW - 2-3 days
9. **Top 8 Friends** - LOW - 2-3 days

### Long Term (Future)
10. **Multiplayer (Discord Mesh)** - LOW - 2-3 weeks

---

## Technical Debt

Minor issues to address when convenient:

| Issue | Location | Priority |
|-------|----------|----------|
| File deletion doesn't remove actual files | `media.ts` | Low |
| Group chat typing indicators incomplete | `group-chat.ts` | Low |
| Top 8 UI placeholder | MyFaceSite | Low |

---

## Success Metrics

How we know engAIge is working:

**Engagement:**
- Time spent in app
- Messages sent/received ratio
- Events attended
- Friend count growth

**Immersion:**
- AI refusal rate (target: <1%)
- Validation failure rate
- User feedback on NPC authenticity

**Technical:**
- Budget efficiency (cost per hour)
- Response times
- Background task completion rate

**Fun Factor:**
- Easter eggs discovered
- Screenshots taken
- Relationship milestones achieved

---

## The Vision

engAIge is a **living world** where:

- NPCs live their lives whether you're watching or not
- Drama unfolds organically in group chats and social feeds
- Seasons change, trends evolve, relationships deepen
- Every interaction matters and is remembered
- Friday nights feel different than Tuesday mornings
- The world feels ALIVE

This is the game we're building.
