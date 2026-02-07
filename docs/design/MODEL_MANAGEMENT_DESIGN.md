# Model Management System - Product Design

**Status:** Design Phase
**Reference:** [Cherry Studio](https://github.com/CherryHQ/cherry-studio) Model Provider UX
**Scope:** Settings > AI Providers — complete redesign

---

## 1. Reference Audit

### Cherry Studio's UX (What Works)

Cherry Studio is the gold standard for multi-provider LLM management in a desktop client. Key patterns:

| Pattern | How It Works | Why It Works |
|---------|-------------|--------------|
| **3-column layout** | Sidebar nav → Provider list → Provider detail | Progressive disclosure — you see everything at a glance without modal hell |
| **Provider list as sidebar** | Scrollable list with icons, search, ON/OFF badges | Quick switching between providers without losing context |
| **"Check" button on API key** | Inline validation right next to the key field | Instant confidence — did I paste the right key? |
| **Fetch models from API** | Hits `/models` endpoint, populates a managed list | No guessing model IDs; you see what's actually available |
| **Model management modal** | Full-screen list with search, capability filters (Vision/Reasoning/Tool/etc.), add/remove toggles | Hundreds of models become manageable; you curate your list |
| **Per-model settings** | Edit modal: Model ID, display name, group, capability badges (toggleable), pricing (input/output per M tokens) | Power users can declare what a model can do and what it costs |
| **Per-conversation tuning** | Temperature slider, Top-P slider, Context window, Max tokens toggle, Stream toggle, Tool Use mode, Custom Parameters | Full control without touching provider config |
| **Default model roles** | Separate dropdowns for: Default Assistant, Quick Model, Translation Model | Different tasks use different models — cheap for naming, smart for chat |
| **Capability badges** | Visual chips on each model: Vision, WebSearch, Reasoning, Tool, Embedding | At-a-glance understanding of what each model can do |

### What We Should NOT Copy

| Pattern | Why Skip |
|---------|---------|
| 30+ pre-configured providers | engAIge users run local models or use 1-2 APIs. We don't need SiliconFlow/PPIO/etc. |
| Embedding/Reranker model types | Not relevant to NPC chat simulation |
| Translation/Quick model roles | Our "roles" are game-specific (NPC chat, post gen, vision proxy) |
| MCP Servers integration | Out of scope |

---

## 2. Current State Audit (engAIge)

### What Exists

| Component | State |
|-----------|-------|
| `ai_providers` table | 3 hardcoded providers (Local, OpenAI, Anthropic). Schema supports custom but UI doesn't. |
| `image_gen_providers` table | DALL-E 3 only. UI has add/edit/delete. |
| Provider CRUD (server) | Full CRUD exists: create, update, delete, setActive, test. Well-built. |
| WS handlers | All message types registered and working. |
| Zustand store | Complete store with all actions. `useAIProviders()` hook ready. |
| Settings UI | Card-based list. Edit modal has 3 fields (API key, base URL, default model). No "Add" button for text providers. |
| Model selection | Free-text input field. No fetching, no list, no capabilities. |
| Per-model tuning | None. |
| Per-NPC override | DB columns exist (`ai_provider_id`). No UI to assign. |
| Model capabilities | Hardcoded map in `model-capabilities.ts`. No user-facing control. |

### The Gaps

1. **Can't add new providers** — No UI for "Add AI Text Provider"
2. **Can't discover models** — No model fetching from provider API
3. **Can't curate models** — No model list management (add/remove/search)
4. **Can't declare capabilities** — No way to say "this local model supports vision"
5. **Can't tune models** — No temperature/top_p/context/max_tokens controls
6. **Can't set per-model pricing** — `cost_config` column exists but is never populated from UI
7. **Can't assign models to game roles** — No "use this model for post generation" vs "use this for DMs"
8. **Can't assign providers to NPCs** — DB supports it, UI doesn't expose it
9. **Edit modal is modal** — Every change requires open modal → edit → save → close. Cherry Studio uses inline editing.

---

## 3. Feature Tier List

### Tier 1: Crucial (Must ship — the basics are broken)

| Feature | Description | Why |
|---------|-------------|-----|
| **Add Provider** | Button to create new AI text providers (name, type, base URL, API key) | Users can't add OpenRouter, Groq, local vLLM, etc. |
| **API Key Check** | "Check" button next to API key field that validates connection | Cherry Studio's #1 UX win — instant confidence |
| **Fetch Models** | "Fetch Models" button that hits the provider's `/models` endpoint and populates a list | Eliminates guessing model IDs |
| **Model List** | Display fetched models in a searchable, grouped list with add/remove toggles | Users curate which models they care about |
| **Provider Enable/Disable** | Toggle switch per provider (already in DB, not in UI) | Don't delete a provider just because you're not using it right now |
| **Inline Provider Detail** | Replace modal-based editing with inline panel (click provider → detail appears) | Matches Cherry Studio's superior UX; less friction |
| **Provider Type Support** | Support at minimum: OpenAI-compatible, OpenAI, Anthropic. Expose type selection on create. | Already in DB, just not in UI |

### Tier 2: High Value (Power user features that differentiate)

| Feature | Description | Why |
|---------|-------------|-----|
| **Per-Model Capability Badges** | Toggleable chips: Vision, Tool Use, Reasoning | Users declare what their local models support; replaces hardcoded `model-capabilities.ts` |
| **Per-Model Pricing** | Input/Output price fields ($ per M tokens) | Budget tracking becomes accurate for any provider |
| **Model Tuning Defaults** | Temperature, Top-P, Max Tokens, Context Window — set per-provider or per-model | Power users want control over NPC personality variance |
| **Game Role Assignment** | Dropdowns for: Primary Chat Model, Post Generation Model, Cheap/Fast Model (topic naming, summaries) | Different tasks have different cost/quality tradeoffs |
| **Provider Reordering / Priority** | Drag or set priority on providers for fallback chains | If local model is down, fall back to OpenAI |
| **Multiple API Keys** | Comma-separated keys with rotation (Cherry Studio supports this) | Load balancing / rate limit avoidance |

### Tier 3: Nice-to-Have (Polish and power-user delight)

| Feature | Description | Why |
|---------|-------------|-----|
| **Per-NPC Model Assignment** | In NPC editor: dropdown to assign a specific provider+model to an NPC | "Make this NPC use Claude, that one use a local model" |
| **Model Search & Filter** | Search by name, filter by capability tab (All / Vision / Reasoning / Tool) | Cherry Studio's model management modal |
| **Custom Parameters** | Key-value pairs for arbitrary API params (frequency_penalty, presence_penalty, etc.) | Niche but powerful |
| **Cost Estimator** | Show estimated cost-per-message based on model pricing and average token count | Budget visibility before committing |
| **Connection Status Indicators** | Live ping/status dot on each provider (green/yellow/red) | Know at a glance which providers are reachable |
| **Import/Export Config** | Export provider configs as JSON, import to restore | Backup and sharing |

### Tier 4: Overkill (Don't build)

| Feature | Why Skip |
|---------|---------|
| 30+ pre-seeded providers | Our users are power users who know their endpoints |
| Provider marketplace/discovery | Not a platform play |
| Auto-model-selection AI | Over-engineering |
| Embedding/Reranker model types | Not relevant to game simulation |
| API key sharing/team features | Single-player game |

---

## 4. Information Architecture

### Navigation Restructure

Current settings sidebar:
```
Display | Theme | Wallpaper | Typography | Graphics | Audio | Accessibility | Content Rating | AI Providers | Developer
```

Proposed — split "AI Providers" into a richer section:
```
Display | Theme | Wallpaper | Typography | Graphics | Audio | Accessibility | Content Rating | Model Providers | Developer
```

"Model Providers" becomes a mini-app within settings, using its own internal layout.

### Model Providers Layout (Cherry Studio-inspired)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Settings > Model Providers                                         │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  🔍 Search   │  Provider Name                          [ON/OFF]    │
│              │                                                      │
│  ● Local     │  API Key  [••••••••••••••••••]  [Check]             │
│    LM Studio │  hint: Use commas to separate multiple keys          │
│              │                                                      │
│  ○ OpenAI    │  Base URL [http://localhost:1234/v1____]             │
│              │  Preview: http://localhost:1234/v1/chat/completions   │
│  ○ Anthropic │                                                      │
│              │  ─────────────────────────────────────────────────── │
│  ○ OpenRouter│                                                      │
│              │  Models (12)                    [Fetch] [Manage]     │
│              │                                                      │
│              │  ▼ meta-llama                                        │
│              │    ◉ llama-3.1-70b-instruct   [Vision] [Tool] ⚙ ✕  │
│              │    ◉ llama-3.1-8b-instruct           [Tool]   ⚙ ✕  │
│              │                                                      │
│              │  ▼ mistralai                                         │
│              │    ◉ mixtral-8x7b-instruct           [Tool]   ⚙ ✕  │
│              │                                                      │
│              │  + Add model manually                                │
│              │                                                      │
│  ───────────│  ─────────────────────────────────────────────────── │
│  Image Gen   │                                                      │
│  ● DALL-E 3  │  Game Roles                                         │
│              │  Primary Chat:  [llama-3.1-70b ▾] ⚙                 │
│  ───────────│  Post Gen:      [llama-3.1-8b  ▾] ⚙                 │
│  Vision Proxy│  Fast/Cheap:    [llama-3.1-8b  ▾]                   │
│  ○ gpt-4o-m  │                                                      │
│              │                                                      │
│  + Add       │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

**Key layout decisions:**
- **Left column**: Provider list (text providers, image gen providers, vision proxy) — all in one scrollable list, grouped by type
- **Right column**: Detail panel for selected provider — inline editing, no modals for basic fields
- **Models section**: Inline within provider detail, collapsible groups
- **Game Roles**: Below models section — assign specific models to game functions
- **Modals only for**: Model management (fetch/filter/bulk toggle), per-model edit (capabilities/pricing)

---

## 5. Detailed UX Flows

### Flow 1: Adding a New Provider

```
1. User clicks "+ Add" at bottom of provider list
2. Inline form appears (or small popover):
   - Provider Name: [____________]
   - Provider Type: [OpenAI-compatible ▾]  (OpenAI | OpenAI-compatible | Anthropic)
   - [Add]  [Cancel]
3. New provider appears in list, selected, with empty detail panel
4. User fills in API Key, Base URL
5. User clicks [Check] → validates connection
6. User clicks [Fetch Models] → models populate
7. User curates model list (remove ones they don't need)
```

**No onboarding wizard needed.** The inline panel IS the setup flow.

### Flow 2: Fetching & Curating Models

```
1. User clicks [Fetch Models] button in provider detail
2. Loading spinner appears
3. Server hits provider's /models endpoint via doorFetch
4. Response parsed → models grouped by org/family prefix
5. All fetched models shown with + (add) buttons
6. User clicks + to add models to their active list, or - to remove
7. [Manage] button opens full-screen model management modal:
   - Search bar
   - Capability filter tabs: All | Vision | Reasoning | Tool
   - Grouped list with add/remove toggles
   - Bulk actions: "Add All", "Remove All"
```

### Flow 3: Editing Model Settings

```
1. User clicks ⚙ (gear) icon on a model in the list
2. Model settings panel/modal opens:
   - Model ID (read-only, copyable)
   - Display Name (editable — for showing "Claude Sonnet" instead of "claude-sonnet-4-20250514")
   - Group Name (for organizing — auto-detected from model ID prefix)
   - Capability Badges: [Vision] [Tool Use] [Reasoning] — toggleable chips
   - Pricing:
     - Input Price: [____] $/M tokens
     - Output Price: [____] $/M tokens
   - [Save] [Cancel]
```

### Flow 4: Model Tuning (Per-Game-Role)

```
1. In "Game Roles" section, user clicks ⚙ next to a role's model dropdown
2. Tuning panel opens:
   - Temperature:    [====●========] 0.85    [ON/OFF toggle]
   - Top-P:          [===========●=] 0.95    [ON/OFF toggle]
   - Context Window:  [=====●=======] 4096   (or Unlimited)
   - Max Tokens:      [OFF toggle] → when ON: [____] number input
   - Stream Output:   [ON toggle]
   - Custom Params:   [+ Add Parameter] → key/value pairs
   - [Reset to Defaults]
```

**Each toggle** means "override the model default" vs "let the API decide." This is Cherry Studio's pattern and it's excellent — you see what you're controlling vs what's automatic.

### Flow 5: Setting the Active Provider

```
1. In provider list, the active provider has a filled dot (●)
2. Inactive providers have an empty dot (○)
3. User clicks an inactive provider → it's selected for viewing (not activated)
4. To activate: either click the provider's ON/OFF toggle, or there's a
   clear "Set as Active" action in the detail panel
5. Only one text provider can be active at a time
6. Changing active provider shows a confirmation if NPCs are mid-conversation
```

---

## 6. Game-Specific Integration

### Game Roles (engAIge-unique concept)

Cherry Studio has "Default Model / Quick Model / Translation Model." Our equivalent:

| Game Role | Description | Cost Sensitivity |
|-----------|-------------|-----------------|
| **Primary Chat** | Powers NPC DM conversations with the player | Medium — quality matters, but happens often |
| **Post Generation** | Generates NPC social media posts, comments | High — happens frequently in background |
| **Fast/Cheap** | Topic naming, conversation summaries, simple classification | Very High — should use smallest model |
| **Vision Proxy** | Image analysis when primary model lacks vision | Low frequency — can use expensive model |
| **Image Generation** | DALL-E / SD image creation | Separate provider entirely |

**Why this matters:** A user running a local 70B model for chat might want an 8B model for background posts and a cloud API for vision. Current system forces one model for everything.

### Per-NPC Model Assignment (Tier 3, but architecturally important)

The DB already has `ai_provider_id` on NPCs. The UI integration would be:
- In the NPC editor, add a "Model Override" section
- Dropdown: "Use default" or pick a specific provider + model
- This lets users give their "main character" NPC a premium model while background NPCs use cheap models

### Budget Integration

Per-model pricing feeds directly into the existing budget system:
- When `cost_config` is set on a provider, the AI queue uses those prices for cost estimation
- The cost estimator in the model settings shows: "~$0.003 per NPC message at average 500 tokens"
- Budget warnings become model-aware: "Switching to gpt-4o will exhaust your daily budget in ~47 messages"

---

## 7. Data Model Changes

### New: `provider_models` table (in `user.db`)

```sql
CREATE TABLE IF NOT EXISTS provider_models (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,              -- e.g., "meta-llama/llama-3.1-70b-instruct"
  display_name TEXT,                   -- e.g., "Llama 3.1 70B"
  group_name TEXT,                     -- e.g., "meta-llama" (for UI grouping)
  is_enabled INTEGER DEFAULT 1,        -- user's curated list toggle
  supports_vision INTEGER DEFAULT 0,
  supports_tools INTEGER DEFAULT 0,
  supports_reasoning INTEGER DEFAULT 0,
  max_context_tokens INTEGER,
  input_price_per_m REAL,              -- $ per million input tokens
  output_price_per_m REAL,             -- $ per million output tokens
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(provider_id, model_id)
);
```

### New: `model_tuning_profiles` table (in `user.db`)

```sql
CREATE TABLE IF NOT EXISTS model_tuning_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                   -- "Primary Chat", "Post Gen", etc. or custom name
  game_role TEXT,                       -- 'primary_chat' | 'post_gen' | 'fast' | NULL (custom)
  provider_id TEXT REFERENCES ai_providers(id),
  model_id TEXT,                        -- FK to provider_models.model_id
  temperature REAL,                     -- NULL = use API default
  top_p REAL,
  max_tokens INTEGER,
  context_window INTEGER,
  stream INTEGER DEFAULT 1,
  custom_params TEXT,                   -- JSON: arbitrary key-value pairs
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(game_role)                     -- only one profile per game role
);
```

### Modified: `ai_providers` table

Add column:
```sql
ALTER TABLE ai_providers ADD COLUMN models_fetched_at INTEGER;  -- last time /models was hit
```

The existing `default_model`, `supports_vision`, `supports_tools`, `max_context_tokens`, and `cost_config` columns become fallback/legacy. The new `provider_models` table is the source of truth per-model.

---

## 8. Server-Side Changes Summary

| Area | Change |
|------|--------|
| **New route: `models`** | `fetchModels(providerId)` — hits provider's `/models` endpoint, parses response, upserts into `provider_models` |
| **New route: `provider_models` CRUD** | get/update/delete models within a provider. Enable/disable toggles. |
| **New route: `model_tuning_profiles` CRUD** | get/set tuning profiles per game role |
| **Modified: `ai.ts`** | `getModelConfig()` reads from tuning profiles → provider_models → provider defaults (cascade) |
| **Modified: `ai-provider-config.ts`** | `getProviderModels(providerId)` returns curated model list |
| **Modified: `model-capabilities.ts`** | Falls back to `provider_models` table instead of hardcoded map |
| **New WS handlers** | `providerModels:fetch`, `providerModels:getAll`, `providerModels:update`, `providerModels:delete`, `tuningProfile:get`, `tuningProfile:set` |
| **New event types** | `ai:models_fetched`, `ai:model_updated`, `ai:tuning_profile_changed` |

---

## 9. Implementation Priority

### Phase 1: Foundation (Unblock the basics)
1. Add "Add Provider" button + create flow for text providers
2. Add enable/disable toggle to provider cards
3. Add "Check" (test connection) button inline with API key
4. Implement model fetching (`/models` endpoint)
5. Create `provider_models` table + CRUD
6. Display fetched models in provider detail (grouped, searchable)
7. Replace modal-based editing with inline provider detail panel

### Phase 2: Model Intelligence
8. Per-model capability badges (editable)
9. Per-model pricing fields
10. Model management modal (search, filter by capability, bulk add/remove)
11. Wire pricing into budget/cost tracking

### Phase 3: Tuning & Roles
12. Game role assignment UI (Primary Chat, Post Gen, Fast/Cheap)
13. `model_tuning_profiles` table + CRUD
14. Per-role tuning sliders (temperature, top_p, max_tokens, context)
15. Custom parameters support

### Phase 4: Polish
16. Per-NPC model assignment in NPC editor
17. Cost estimator per message
18. Connection status indicators (live ping)
19. Provider fallback chains

---

## 10. Aesthetic Direction

**Design language:** "Dark Pro Tool" — matching Cherry Studio's energy but within engAIge's existing theme system.

- Use existing CSS variables (`--color-bg`, `--color-bgSecondary`, etc.)
- Provider list: compact, icon + name + status badge
- Detail panel: generous spacing, clear section headers
- Model list: compact rows with capability badges as small colored chips
- Sliders: thin track with dot handle (like Cherry Studio's pink sliders, but using `--color-primary`)
- Toggles: small pill switches (ON = `--color-primary`, OFF = `--color-bgTertiary`)
- The overall vibe: "I'm configuring serious infrastructure" — not "I'm in a game settings menu"

---

---
---

# Part 2: Zero-Config AI — Bundled LLM & In-Game Model Browser

**The Problem:** Cherry Studio assumes users have API keys and know what a "base URL" is. engAIge is a game. Games just work when you install them.

**The Insight:** Indie games ship 2-10GB. AAA games ship 50-150GB. Our game installs at ~100MB (Tauri + Bun + assets). We ship llama-server but NOT a model. On first launch, we probe hardware, ask the user's comfort level, and start downloading the *right model for their machine* in the background — while they continue onboarding. By the time they've set up their profile and NPC preferences (~4-6 minutes), the model is ready.

---

## 11. Three-Tier User Model

| Tier | User | Experience | Technical Knowledge Required |
|------|------|-----------|------------------------------|
| **Casual** | "I bought a game" | Picks "Just Play" → model auto-downloads during onboarding → game works | Zero |
| **Enthusiast** | "I want better RP models" | Opens in-game Model Browser, browses HuggingFace, one-click download | Knows what "RP model" means, nothing else |
| **Power User** | "I run my own inference" | Cherry Studio-style settings (Part 1 of this doc) | Has API keys, knows endpoints |

All three tiers coexist. The user declares their tier during onboarding, and the system adapts.

---

## 12. Tier 1: Automatic Model Setup (Zero Config)

### Why NOT Bundle a Model

Shipping a model in the installer has problems:
- **Bloated install for power users** who will never use it (they have their own API/models)
- **Wrong model for the hardware** — a 3B model wastes a user's RTX 4090, a 13B model won't run on integrated graphics
- **Larger download before first play** even for users with fast local setups
- **Update friction** — changing the default model means re-shipping the whole game

Instead: **Ship light (~100MB), probe first, download right.**

### Architecture: llama-server + On-Demand Model Download

```
┌─────────────────────────────────────────────────┐
│  engAIge Install Directory (~100 MB)             │
│                                                  │
│  engaige.exe / engaige.app        (Tauri shell)  │
│  server/                          (Bun backend)  │
│  bin/                                            │
│    └── llama-server(.exe)              (~30 MB)  │
│  models/                          (empty at      │
│    └── (downloaded on first launch)  install)    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Why llama-server (not Ollama)

| Factor | llama-server | Ollama |
|--------|-------------|--------|
| Binary size | ~30 MB | ~50 MB |
| Model management | None — just loads a file | Full registry, layer system |
| Complexity | One binary, one flag | Background service, registry, CLI |
| OpenAI-compatible API | Yes (`/v1/chat/completions`) | Yes |
| GPU detection | Auto (CUDA/Metal/Vulkan/CPU fallback) | Auto |
| Hot model swap | `POST /slots` or restart with new `--model` | `ollama run <model>` |
| Embeddability | Designed for it — it's just a server | Designed as a standalone service |
| Control | Full — we own the process lifecycle | Installs as a system service, may conflict |

**llama-server is the right choice** because it's simpler, smaller, and we control the full lifecycle. Ollama adds a layer of abstraction we don't need.

### Existing AI Detection (Pre-Probe)

Before even asking the user what tier they are, the Bun server scans for existing local AI infrastructure. If found, we can skip the download entirely.

**Detection runs in three layers, fast to slow:**

#### Layer 1: Running Services (~1 second)

Probe known ports for active inference servers:

```typescript
const SERVICE_PROBES = [
  {
    name: "Ollama",
    url: "http://localhost:11434/v1/models",
    // Also try: http://localhost:11434/api/tags (Ollama-native API)
    provider_type: "openai-compatible" as const,
    base_url: "http://localhost:11434/v1",
  },
  {
    name: "LM Studio",
    url: "http://localhost:1234/v1/models",
    provider_type: "openai-compatible" as const,
    base_url: "http://localhost:1234/v1",
  },
  {
    name: "KoboldCpp",
    url: "http://localhost:5001/api/v1/model",
    provider_type: "openai-compatible" as const,
    base_url: "http://localhost:5001/v1",
  },
  {
    name: "text-generation-webui",
    url: "http://localhost:5000/v1/models",
    provider_type: "openai-compatible" as const,
    base_url: "http://localhost:5000/v1",
  },
  {
    name: "vLLM",
    url: "http://localhost:8000/v1/models",
    provider_type: "openai-compatible" as const,
    base_url: "http://localhost:8000/v1",
  },
];
```

If a service responds, we get its model list from the API. The user sees:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  We detected AI running on your system!                          │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  LM Studio is running on port 1234                        │   │
│  │  Model loaded: meta-llama/Llama-3.1-8B-Instruct           │   │
│  │                                                           │   │
│  │  [Use This]                                               │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Or choose a different setup:                                    │
│  [Download a model]  [Configure manually]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

One click → auto-configure provider → skip to profile setup. Zero friction.

#### Layer 2: Local GGUF File Discovery (~2-5 seconds)

Scan known directories for existing model files we can use directly with llama-server:

```typescript
interface ModelFileLocation {
  tool: string;
  paths: string[];  // Platform-specific paths to check
  structure: 'flat' | 'nested';  // flat = GGUFs in root, nested = publisher/model/file.gguf
  usable_directly: boolean;  // Can llama-server load these files?
}

const KNOWN_MODEL_LOCATIONS: ModelFileLocation[] = [
  {
    tool: "LM Studio",
    paths: [
      "~/.lmstudio/models",           // Primary (newer versions)
      "~/.cache/lm-studio/models",    // Older versions / cache
    ],
    structure: "nested",  // {publisher}/{model}/{file}.gguf
    usable_directly: true,  // Plain GGUF files — llama-server can load them
  },
  {
    tool: "GPT4All",
    paths: [
      "~/.cache/gpt4all",                        // Linux
      "~/.local/share/nomic.ai/GPT4All",         // Linux alt
      "~/Library/Caches/nomic.ai/GPT4All",       // macOS
      "%LOCALAPPDATA%/nomic.ai/GPT4All",         // Windows
    ],
    structure: "flat",
    usable_directly: true,  // Plain GGUF files
  },
  {
    tool: "Jan",
    paths: [
      "~/jan/models",
    ],
    structure: "nested",
    usable_directly: true,  // Plain GGUF files
  },
  {
    tool: "Ollama",
    paths: [
      "~/.ollama/models",                            // Linux/macOS user
      "/usr/share/ollama/.ollama/models",             // Linux system
      "%USERPROFILE%/.ollama/models",                 // Windows
    ],
    structure: "nested",  // manifests + blobs (SHA256-named)
    usable_directly: false,  // NOT plain GGUF — content-addressed blobs
    // BUT: presence confirms Ollama is installed. We can start it.
  },
];
```

**Key insight:** LM Studio, GPT4All, and Jan all store **plain GGUF files**. We can point our bundled llama-server directly at them — no copying, no conversion, just a file path. The user doesn't need to download anything.

If GGUF files are found:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  We found AI models on your system!                              │
│                                                                  │
│  From LM Studio:                                                 │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  ○  meta-llama/Llama-3.1-8B-Instruct (Q4_K_M, 4.9 GB)   │   │
│  │  ○  DavidAU/L3.1-RP-Hero-8B (Q5_K_M, 5.7 GB)            │   │
│  │  ○  mistralai/Mistral-7B-Instruct (Q4_K_M, 4.1 GB)      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  From GPT4All:                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  ○  nous-hermes-2-mistral-7b.Q4_0.gguf (3.8 GB)          │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Select a model to use:  [Use Selected]                          │
│                                                                  │
│  Or: [Download a different model]  [Configure manually]          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

User picks one → llama-server starts with that file path → auto-configure provider → done. **No download at all.**

#### Layer 3: Installed Tool Detection (~1 second)

Check if tools are installed but not currently running:

```typescript
// Check for installed binaries
const BINARY_CHECKS = [
  { tool: "Ollama",   commands: ["which ollama", "where ollama"],
    action: "start_and_connect" },  // We can start Ollama for them
  { tool: "LM Studio", paths: [
      "/Applications/LM Studio.app",                    // macOS
      "~/.local/share/applications/lm-studio.desktop",  // Linux
      "%LOCALAPPDATA%/Programs/LM Studio",              // Windows
    ],
    action: "scan_models" },  // Can't start it easily, but can use its model files
];
```

If Ollama is installed but not running, and it has models in `~/.ollama/models/manifests/`, we know the user has local AI experience. We could offer: "Start Ollama and use your existing models?" — but since Ollama blobs aren't plain GGUF, the more reliable path is to find any GGUF files they may have from other tools, or start the Ollama service and connect to its API.

#### Detection Flow Summary

```
First Launch Detection (runs before onboarding Step 1):
│
├── Layer 1: Service Probe (parallel port checks, ~1s)
│   ├── Found running service → "Use this?" → [Yes] → Skip to Step 2 ✓
│   └── Nothing running → continue
│
├── Layer 2: GGUF File Scan (check known dirs, ~2-5s)
│   ├── Found GGUF files → "We found models!" → [Pick one] → Skip to Step 2 ✓
│   └── No files found → continue
│
├── Layer 3: Tool Detection (binary check, ~1s)
│   ├── Found installed tool → Factor into tier recommendation
│   └── Nothing found → continue
│
└── No existing AI detected → Hardware probe → Tier selection
    ├── "Just Play" → auto-download recommended model
    ├── "Choose My Model" → open Model Browser
    └── "I Have My Own" → manual provider config
```

The entire detection sequence takes **3-7 seconds** and runs during the boot screen / initial loading — the user never waits for it.

### Hardware Detection & Adaptation

The Bun server probes the system on first launch (before onboarding begins):

```typescript
// server/src/services/hardware-probe.ts
interface HardwareProfile {
  gpu_detected: boolean;
  gpu_name?: string;          // "NVIDIA RTX 3060", "Apple M2", etc.
  gpu_vram_mb?: number;       // 6144, 8192, etc.
  system_ram_mb: number;      // 16384, 32768, etc.
  cpu_cores: number;
  os: 'windows' | 'macos' | 'linux';
  internet_speed_mbps?: number;  // Quick bandwidth estimate
  recommended_model: RecommendedModel;  // The model we'd auto-pick
  max_model_params_b: number;   // Largest model params (billions) they can run
  recommended_ctx_size: number;
  recommended_gpu_layers: number;

  // Existing AI detection results
  existing_ai: {
    running_services: DetectedService[];     // Layer 1 results
    found_gguf_files: FoundModelFile[];      // Layer 2 results
    installed_tools: InstalledTool[];        // Layer 3 results
    has_existing_setup: boolean;             // true if ANY layer found something
  };
}

interface DetectedService {
  name: string;              // "LM Studio", "Ollama", etc.
  base_url: string;          // "http://localhost:1234/v1"
  models: string[];          // Model IDs from the /models endpoint
  provider_type: string;
}

interface FoundModelFile {
  tool: string;              // "LM Studio", "GPT4All", etc.
  file_path: string;         // Full absolute path to the .gguf file
  file_name: string;         // "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"
  display_name: string;      // Parsed: "Llama 3.1 8B Instruct (Q4_K_M)"
  size_bytes: number;
  quantization?: string;     // Parsed from filename: "Q4_K_M"
  compatible: boolean;       // Can run on this hardware?
}

interface InstalledTool {
  name: string;
  path: string;              // Binary path or app path
  has_models: boolean;       // Found model files/manifests?
}

interface RecommendedModel {
  hf_repo: string;            // "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF"
  filename: string;           // "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf"
  display_name: string;       // "Llama 3.1 8B"
  size_bytes: number;         // 4_920_000_000
  estimated_download_mins: number;  // based on internet_speed_mbps
  why: string;                // "Best fit for your RTX 3060 (6GB VRAM)"
}
```

### Model Recommendation Matrix

The probe picks the best model for the user's hardware automatically:

| Hardware Tier | VRAM / RAM | Recommended Model | Size | Quality |
|--------------|------------|-------------------|------|---------|
| **Potato** | No GPU, <8GB RAM | Llama 3.2 3B Q4_K_M | ~2 GB | Passable — NPC chat works, limited creativity |
| **Low** | No GPU, 8-16GB RAM | Llama 3.2 3B Q6_K | ~2.5 GB | Good on CPU with enough RAM for higher quant |
| **Mid** | 4-6GB VRAM | Llama 3.1 8B Q4_K_M | ~4.5 GB | Great balance — most gamers land here |
| **High** | 8-12GB VRAM | Llama 3.1 8B Q6_K or RP-tuned 8B | ~5.5 GB | Excellent RP quality |
| **Ultra** | 16GB+ VRAM | 13B-20B RP model Q4_K_M | ~8-12 GB | Premium experience |
| **Overkill** | 24GB+ VRAM | 30B+ model | ~18 GB+ | Enthusiast picks from Model Browser |

Most gamers (Steam hardware survey: median is GTX 1650-RTX 3060 range, 6-8GB VRAM) land in **Mid tier** — an 8B model is the sweet spot.

### The Onboarding Timing Trick

The critical insight: **model download must happen in parallel with onboarding, not before or after it.**

Current onboarding steps (post account creation):
```
Step 1: AI Provider setup     ← THIS CHANGES
Step 2: Budget config          ~30 seconds
Step 3: Profile creation       ~1-2 minutes (username, bio, interests, vibe)
Step 4: NPC Preferences        ~1 minute (romantic level, friend count, age range)
→ NPC Generation               ~1-3 minutes (server generates NPCs with AI)
```

Total time from "Create Account" to "AI needed": **~4-6 minutes**

New onboarding flow:

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 0: Create Account (username, password)                     │
│  [Create Account] ← button press triggers Step 1 IMMEDIATELY    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: "How do you want to power your game?"                   │
│  (appears RIGHT after account creation)                          │
│                                                                  │
│  System detected: 16GB RAM, NVIDIA RTX 3060 (6GB VRAM)          │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  JUST PLAY                                        [Pick]   │ │
│  │  We'll download the best AI model for your PC.              │ │
│  │  Recommended: Llama 3.1 8B (4.5 GB, ~3 min download)       │ │
│  │  No setup. No accounts. No API keys.                        │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  CHOOSE MY MODEL                                  [Pick]   │ │
│  │  Browse roleplay-optimized models from HuggingFace.         │ │
│  │  Download one that fits your style and hardware.            │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  I HAVE MY OWN                                    [Pick]   │ │
│  │  Connect to your own LLM server or cloud API.               │ │
│  │  (OpenAI, Anthropic, LM Studio, Ollama, etc.)              │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**When the user picks "Just Play":**

```
1. IMMEDIATELY: Server begins downloading recommended model in background
   → doorFetch() streams GGUF from HuggingFace to disk
   → Progress events pushed to frontend via WS

2. User proceeds to Step 2 (Budget) → Step 3 (Profile) → Step 4 (NPC Prefs)
   → A small, persistent download indicator appears in the corner:
     ┌────────────────────────────────┐
     │  Downloading AI model...       │
     │  ████████████░░░░  72%  ~1 min │
     └────────────────────────────────┘

3. When user finishes Step 4 and clicks "Generate NPCs":
   ├─ Model finished downloading?
   │   YES → Start llama-server → generate NPCs → play!
   │   NO  → Show a waiting screen with progress:
   │         "Almost ready! Finishing AI download..."
   │         ████████████████████░░  89%  ~30 seconds
   └─ Either way, user NEVER goes back to configure anything.

4. llama-server auto-starts with downloaded model
5. Provider auto-configured: "Local AI" → http://127.0.0.1:11435/v1
6. Game begins.
```

**When the user picks "Choose My Model":**
```
1. Opens Model Browser (Section 13) in a modal/panel
2. User browses, picks a model, clicks Download
3. Download starts → user proceeds to Steps 2-4 with progress indicator
4. Same convergence at NPC generation step
```

**When the user picks "I Have My Own":**
```
1. Shows provider configuration (API key, base URL, model)
   → Same as current onboarding Step 1, but better (with Check button)
2. User proceeds to Steps 2-4 normally
3. No model download needed — they're connecting to an existing service
```

### Download Timing Math

| Model Size | Internet Speed | Download Time | Fits in Onboarding? |
|-----------|---------------|---------------|-------------------|
| 2 GB (3B) | 25 Mbps | ~11 min | Tight — may need wait screen |
| 2 GB (3B) | 50 Mbps | ~5 min | Yes |
| 2 GB (3B) | 100 Mbps | ~3 min | Easily |
| 4.5 GB (8B) | 25 Mbps | ~24 min | No — needs wait screen |
| 4.5 GB (8B) | 50 Mbps | ~12 min | Tight — short wait likely |
| 4.5 GB (8B) | 100 Mbps | ~6 min | Yes |
| 4.5 GB (8B) | 200 Mbps | ~3 min | Easily |

Most gamers have 50-200+ Mbps. The 8B model will finish for most users during onboarding. For slower connections, we either:
- **Recommend a smaller model** (factor internet speed into the recommendation)
- **Show a polished wait screen** — not an error, just "Your AI is loading. This is a one-time download."

The hardware probe should include a quick bandwidth estimate (small test download) to factor into model recommendation.

### On Subsequent Launches

```
1. Bun server starts
2. Check: Is there a downloaded model in ./models/?
   ├─ YES → Spawn llama-server with that model → auto-configure → boot
   └─ NO  → Check: Is a remote provider configured and reachable?
            ├─ YES → Boot with remote provider
            └─ NO  → Show "No AI configured" screen with options
3. Wait for llama-server health check (GET /health)
4. Game proceeds to boot screen / login
```

**On game shutdown:**
```
Bun server sends SIGTERM to llama-server child process → clean exit
```

---

## 13. Tier 2: In-Game Model Browser (Enthusiast)

### The "Model Store" Concept

This is NOT a technical model management tool. It's closer to a **game's mod browser** or a **Steam Workshop**. The user thinks: "I want my NPCs to be more creative" → browses models → downloads one → NPCs get better.

### HuggingFace API Integration

HuggingFace exposes public REST APIs with no auth required:

```
# Search for GGUF models tagged "roleplay"
GET https://huggingface.co/api/models?library=gguf&search=roleplay&sort=downloads&direction=-1

# Get model details (description, files, tags)
GET https://huggingface.co/api/models/{repo_id}

# List files in a model repo (to find GGUF variants)
GET https://huggingface.co/api/models/{repo_id}/tree/main

# Direct download (no auth for public models)
GET https://huggingface.co/{repo_id}/resolve/main/{filename}
```

All requests go through the Bun server's `doorFetch()` (supports proxy).

### Model Browser Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Model Browser                                           [✕]    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [🔍 Search models...                               ] [Search]  │
│                                                                  │
│  Categories:  [All] [Roleplay] [Creative] [Chat] [Uncensored]   │
│  Size:        [All] [≤3B] [7-8B] [13B] [20B+]                   │
│  Sort:        [Most Downloaded ▾]                                │
│                                                                  │
│  ────────────────────────────────────────────────────────────    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  DavidAU/L3.1-RP-Hero-InBetween-8B                        │  │
│  │  ★ 847 downloads                                          │  │
│  │                                                            │  │
│  │  Roleplay specialist with high detail and character depth. │  │
│  │  Uncensored. Great for immersive NPC conversations.        │  │
│  │                                                            │  │
│  │  Tags: [roleplay] [creative-writing] [uncensored]          │  │
│  │                                                            │  │
│  │  Variants:                                                 │  │
│  │    Q4_K_M  (4.9 GB)  — Best balance       [Download]      │  │
│  │    Q5_K_M  (5.7 GB)  — Higher quality      [Download]      │  │
│  │    Q3_K_M  (3.8 GB)  — Faster, lower qual  [Download]      │  │
│  │                                                            │  │
│  │  ⚠ Requires ~6GB RAM (Q4) or GPU with 5GB+ VRAM           │  │
│  │  ✓ Compatible with your system                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  DavidAU/L3.2-Rogue-Creative-Instruct-7B                  │  │
│  │  ★ 523 downloads                                          │  │
│  │                                                            │  │
│  │  Unusual levels of detail focused on moments and           │  │
│  │  characters. Designed for storytelling and fiction.         │  │
│  │  ...                                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ── Installed Models ────────────────────────────────────────    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ● Bundled Default — Llama 3.2 3B Q4_K_M (2.0 GB)         │  │
│  │    Status: Active                       [Set Active]       │  │
│  │                                                            │  │
│  │  ○ L3.1-RP-Hero-InBetween-8B Q4_K_M (4.9 GB)              │  │
│  │    Status: Downloaded                   [Set Active] [🗑]  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Disk Usage: 6.9 GB / 50 GB available                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Key UX Decisions

**1. Curated Categories, Not Raw HuggingFace**

Raw HuggingFace search returns thousands of results, many irrelevant. We maintain a lightweight curation layer:

```typescript
// server/src/services/model-catalog.ts
// Curated "collections" that map to HF search queries + manual picks
const COLLECTIONS = {
  roleplay: {
    label: "Roleplay & Character",
    hf_query: "library=gguf&search=roleplay+character",
    pinned: [  // Hand-picked models we know are good
      "DavidAU/L3.1-RP-Hero-InBetween-8B-GGUF",
      "DavidAU/L3.2-Rogue-Creative-Instruct-Uncensored-Abliterated-7B-GGUF",
    ],
    description: "Models tuned for immersive character roleplay and dialogue"
  },
  creative: {
    label: "Creative Writing",
    hf_query: "library=gguf&search=creative+writing+storytelling",
    pinned: [],
    description: "Models that excel at descriptive, narrative writing"
  },
  chat: {
    label: "General Chat",
    hf_query: "library=gguf&search=instruct+chat&sort=downloads",
    pinned: [
      "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF",
    ],
    description: "Well-rounded models for natural conversation"
  },
  uncensored: {
    label: "Uncensored",
    hf_query: "library=gguf&search=uncensored+abliterated",
    pinned: [],
    description: "Models without content restrictions"
  }
};
```

Pinned models appear first. HF search results fill in below. We can update the curated list with game updates without the user doing anything.

**2. Compatibility Badges**

Every model card shows whether it'll run on the user's hardware:

| Badge | Meaning |
|-------|---------|
| ✓ Compatible | Model fits in RAM/VRAM with room to spare |
| ⚠ Tight fit | Will work but may be slow or use swap |
| ✕ Too large | Model won't fit — hardware insufficient |

This is computed from the hardware probe (Section 12) + GGUF file size.

**3. Quantization Explained Simply**

Users don't know what "Q4_K_M" means. We translate:

| Internal | User-Facing Label |
|----------|------------------|
| Q3_K_M | "Faster, lower quality" |
| Q4_K_M | "Best balance" (default recommendation) |
| Q5_K_M | "Higher quality, slower" |
| Q6_K | "Near-original quality" |
| Q8_0 | "Maximum quality" |

Always recommend Q4_K_M. Show others as expandable options.

**4. Download Flow**

```
1. User clicks [Download] on a model variant
2. Confirmation: "Download L3.1-RP-Hero-8B (4.9 GB)? This may take a few minutes."
3. Progress bar appears on the model card:
   ████████████░░░░░░░░ 62%  (3.0 / 4.9 GB)  ~2 min remaining
4. Download complete → model saved to ./models/downloaded/{safe_name}.gguf
5. [Set Active] button appears
6. User clicks [Set Active]:
   - llama-server restarts with new --model flag
   - Provider auto-reconfigures to new model
   - "Model changed! Your NPCs are now powered by L3.1-RP-Hero-8B."
```

Download happens server-side via `doorFetch()` with streaming to disk. Progress pushed to frontend via WebSocket.

**5. Model Swap Without Restart**

When the user switches active models, the Bun server:
1. Sends a graceful shutdown to llama-server
2. Waits for in-flight requests to complete (or timeout after 5s)
3. Restarts llama-server with the new `--model` path
4. Waits for health check
5. Pushes "model ready" to frontend

The user sees a brief "Switching models..." overlay (~5-15 seconds). Game state is preserved.

### Server-Side: Model Manager Service

```typescript
// server/src/services/model-manager.ts

interface LocalModel {
  id: string;                    // "llama-3.2-3b-q4_k_m"
  file_path: string;             // "./models/default/llama-3.2-3b-q4_k_m.gguf"
  display_name: string;          // "Llama 3.2 3B"
  source: 'bundled' | 'downloaded';
  hf_repo?: string;              // "meta-llama/Llama-3.2-3B-Instruct-GGUF"
  quantization?: string;         // "Q4_K_M"
  file_size_bytes: number;
  is_active: boolean;
  downloaded_at?: number;
}

interface ModelManager {
  // Lifecycle
  startInferenceServer(modelPath: string): Promise<void>;
  stopInferenceServer(): Promise<void>;
  swapModel(modelId: string): Promise<void>;
  getServerStatus(): 'running' | 'starting' | 'stopped' | 'error';

  // Local model inventory
  getInstalledModels(): LocalModel[];
  getActiveModel(): LocalModel | null;
  setActiveModel(modelId: string): Promise<void>;
  deleteModel(modelId: string): Promise<void>;
  getDiskUsage(): { used_bytes: number; available_bytes: number };

  // HuggingFace catalog
  searchModels(query: string, filters: SearchFilters): Promise<HFModelCard[]>;
  getModelDetails(repoId: string): Promise<HFModelDetail>;
  downloadModel(repoId: string, filename: string, onProgress: ProgressCallback): Promise<LocalModel>;
  cancelDownload(downloadId: string): void;
}
```

### New WS Message Types

```
modelManager:getInstalled      → list of LocalModel[]
modelManager:getActive         → active LocalModel or null
modelManager:setActive         → { modelId } → triggers swap
modelManager:delete            → { modelId } → removes file
modelManager:getStatus         → inference server status
modelManager:getDiskUsage      → { used, available }

modelCatalog:search            → { query, filters } → HFModelCard[]
modelCatalog:getDetails        → { repoId } → HFModelDetail
modelCatalog:download          → { repoId, filename } → starts download
modelCatalog:downloadProgress  → server pushes progress events
modelCatalog:cancelDownload    → { downloadId }
```

### New Database Table: `local_models` (in `user.db`)

```sql
CREATE TABLE IF NOT EXISTS local_models (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('bundled', 'downloaded')),
  hf_repo TEXT,
  hf_filename TEXT,
  quantization TEXT,
  file_size_bytes INTEGER NOT NULL,
  is_active INTEGER DEFAULT 0,
  parameters_billions REAL,        -- 3, 7, 8, 13, etc.
  model_family TEXT,               -- "llama", "mistral", "phi", etc.
  tags TEXT,                       -- JSON array: ["roleplay", "creative"]
  downloaded_at INTEGER DEFAULT (unixepoch()),
  last_used_at INTEGER
);
```

---

## 14. How The Three Tiers Coexist

### Provider Resolution Order

When the AI service needs to make a request, the resolution cascade is:

```
1. Per-NPC override (ai_provider_id on NPC) → specific provider + model
2. Game Role profile (model_tuning_profiles) → role-specific provider + model
3. Active remote provider (ai_providers where is_active=1) → if configured
4. Active local model (local_models where is_active=1) → bundled/downloaded
5. Bundled default → always exists as final fallback
```

A user who has never opened settings hits step 4/5. A power user with an API key hits step 3. A user who assigned Claude to their favorite NPC hits step 1.

### Settings UI Integration

The "Model Providers" settings tab (from Part 1) gets a new section at the top:

```
┌──────────────────────────────────────────────────────────────────┐
│  Settings > Model Providers                                      │
├──────────────┬───────────────────────────────────────────────────┤
│              │                                                   │
│  LOCAL AI    │  Active Model                                     │
│  ● Llama 3.2│  Llama 3.2 3B (Q4_K_M) — Bundled                 │
│    3B        │  Status: Running on GPU (3.2 GB VRAM used)       │
│  ○ RP-Hero  │                                                   │
│    8B        │  [Open Model Browser]     [Stop Local AI]        │
│              │                                                   │
│  ───────────│  Performance                                      │
│  API        │  Tokens/sec: ~42          Ctx: 4096               │
│  PROVIDERS  │  GPU Layers: 33/33        RAM: 1.2 GB             │
│  ○ OpenAI   │                                                   │
│  ○ Anthropic│  ─────────────────────────────────────────────    │
│              │                                                   │
│  ───────────│  (Remote provider detail appears here when        │
│  Image Gen  │   an API provider is selected)                    │
│  ● DALL-E 3 │                                                   │
│              │                                                   │
│  + Add       │                                                   │
└──────────────┴───────────────────────────────────────────────────┘
```

Local models and remote API providers are in the **same sidebar list** but visually grouped. Selecting a local model shows its status and performance. Selecting a remote provider shows the Cherry Studio-style config (Part 1).

### The Handoff: Local → Remote

If a user configures an API provider and sets it active, the local llama-server can optionally be stopped to free resources:

```
"You've activated OpenAI as your AI provider.
 Would you like to stop the local AI to free up memory?"
 [Stop Local AI]  [Keep Running]
```

If they go back to local, it restarts automatically.

---

## 15. Implementation Phases (Updated)

### Phase 0: Hardware Probe + Existing AI Detection + Managed Inference (NEW — do this first)
1. Add `llama-server` binaries to build pipeline (per-platform: linux/mac/windows)
2. Create `hardware-probe.ts` (detect GPU, VRAM, RAM, CPU cores, bandwidth estimate)
3. Create `ai-detector.ts` — three-layer detection:
   a. Port probe for running services (Ollama, LM Studio, KoboldCpp, vLLM, text-gen-webui)
   b. Filesystem scan for GGUF files in known tool directories
   c. Binary/install detection for known tools
4. Create model recommendation engine (hardware profile → best model pick)
5. Create `model-manager.ts` service (download/start/stop/swap/health check)
6. Create `local_models` table + CRUD
7. Model download pipeline (streaming HF → disk via doorFetch, resume support, SHA256 verify)
8. Auto-start llama-server on game launch with downloaded/found model, auto-configure provider
9. Redesign onboarding Step 1:
   a. If existing AI detected → "We found [X]! Use it?" → one click → done
   b. If nothing detected → "Just Play" / "Choose My Model" / "I Have My Own"
10. Background download with progress indicator during onboarding Steps 2-4
11. Wait screen for when download outlasts onboarding

### Phase 0.5: Model Browser (NEW)
11. Create `model-catalog.ts` service (HF API integration, curated collections with pinned models)
12. Build Model Browser UI (search, categories, compatibility badges, quantization labels)
13. Model swap flow (graceful restart of llama-server)
14. Disk usage tracking, cleanup, and model deletion

### Phase 1: Provider Management (from Part 1)
13. Add Provider button + create flow
14. API Key Check inline
15. Fetch Models from provider API
16. Curated model list + inline provider detail panel

### Phase 2: Model Intelligence (from Part 1)
17. Capability badges, pricing, model management modal
18. Wire pricing into budget tracking

### Phase 3: Tuning & Roles (from Part 1)
19. Game role assignment, tuning sliders, custom parameters

### Phase 4: Polish (from Part 1)
20. Per-NPC model assignment, cost estimator, fallback chains

---

## 16. Build & Distribution Considerations

### Install Size: Lean by Default

The game ships at **~100MB** — just the Tauri shell, Bun server, frontend assets, and per-platform llama-server binary. No model bundled. This makes distribution fast and avoids wasting bandwidth for power users who will never use the bundled inference.

Models are downloaded on first launch (or from the Model Browser later) and stored locally.

### Platform-Specific llama-server Binaries

llama-server must be compiled per platform:

| Platform | Binary | GPU Support |
|----------|--------|-------------|
| Windows x64 | `llama-server.exe` | CUDA (NVIDIA), Vulkan (AMD/Intel) |
| macOS ARM | `llama-server` | Metal (Apple Silicon, automatic) |
| macOS x64 | `llama-server` | Metal (if available) or CPU |
| Linux x64 | `llama-server` | CUDA, Vulkan, or CPU |

**Pre-built binaries** are available from the [llama.cpp releases](https://github.com/ggml-org/llama.cpp/releases). We pull these into our build pipeline per-platform.

### Model Storage Location

```
{platform_data_dir}/engaige/
  models/                          # Survives app updates
    llama-3.1-8b-instruct-q4_k_m.gguf
    RP-Hero-InBetween-8B-q4_k_m.gguf
    ...
```

| Platform | Data Directory |
|----------|---------------|
| Linux | `~/.local/share/engaige/models/` |
| macOS | `~/Library/Application Support/engaige/models/` |
| Windows | `%APPDATA%/engaige/models/` |

Models live outside the install directory so they **survive app updates and reinstalls.** A user who spent 20 minutes downloading a 12GB model should never lose it to an update.

---

## 17. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| User's machine can't run any model (old hardware, <4GB RAM) | Game is unplayable without local AI | Hardware probe detects this BEFORE download. Show clear message: "Your system doesn't meet minimum specs for local AI. You can still play with a cloud API key." Surface free-tier API options or very small models (1B). |
| User has no/slow internet for model download | Can't complete "Just Play" setup | Bandwidth probe during hardware check. If <10 Mbps, recommend smallest viable model (3B, ~2GB). Show honest time estimate. Allow user to switch to "I Have My Own" path mid-download. |
| Model download fails halfway (network drop) | Wasted bandwidth, stuck onboarding | **Resume support via HTTP Range headers.** Verify file integrity (SHA256 from HF metadata). Retry with backoff. Never delete a partial download — resume from where it stopped. |
| Download outlasts onboarding window | User waiting at "Almost ready" screen | Keep the wait screen polished, show real progress + ETA. Allow user to "Skip — I'll wait for the download in the background" and enter the game in a limited mode (can explore UI, read posts, but NPCs won't respond yet). |
| llama-server crashes mid-conversation | NPC goes silent | Auto-restart with exponential backoff. AI queue holds requests. Frontend shows "NPC is thinking..." not an error. |
| Recommended model is too dumb for good RP | Bad first impression from auto-pick | Test the recommendation matrix extensively. Bias toward slightly larger models when hardware allows. Show "Upgrade your model" nudge in settings after first play session. |
| GPU detection fails, model runs on CPU | Unexpectedly slow | Always show performance info ("Running on CPU — responses may be slow"). Offer: "Download a smaller model for faster responses." |
| User fills disk with models | System instability | Show disk usage prominently in Model Browser. Warn when <5GB free. Suggest cleanup. Prevent downloads that would fill disk. |
| HuggingFace API is down or rate-limited | Model Browser empty, first-time download fails | Cache last-known catalog locally. For first-time download: maintain a list of mirror URLs. Show "offline" state gracefully with retry. |
| HuggingFace model is removed/renamed | Broken pinned recommendation or saved download link | Catalog checks model availability before recommending. Fallback to next-best model in tier. Log and alert so we can update curated list. |

---

## Sources

- [Cherry Studio GitHub](https://github.com/CherryHQ/cherry-studio)
- [Cherry Studio Custom Provider Docs](https://docs.cherry-ai.com/docs/en-us/pre-basic/providers/zi-ding-yi-fu-wu-shang)
- [Cherry Studio Model Settings Docs](https://docs.cherry-ai.com/docs/en-us/cherry-studio/preview/settings/providers)
- [Cherry Studio In-Depth Review (SkyWork)](https://skywork.ai/skypage/en/Cherry-Studio-An-In-Depth-Review-of-the-All-in-One-AI-Desktop-Client/1972882990813605888)
- [Cherry Studio LLM Integration (DeepWiki)](https://deepwiki.com/hyhfish/cherry-studio/4-llm-integration)
- [llama.cpp GitHub](https://github.com/ggml-org/llama.cpp)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [HuggingFace GGUF Docs](https://huggingface.co/docs/hub/en/gguf)
- [HuggingFace Hub Download API](https://huggingface.co/docs/huggingface_hub/en/guides/download)
- [HuggingFace GGUF Models](https://huggingface.co/models?library=gguf)
- [DavidAU on HuggingFace](https://www.aimodels.fyi/creators/huggingFace/DavidAU)
- [Collabnix Ollama Guide](https://collabnix.com/ollama-the-complete-guide-to-running-large-language-models-locally-in-2025/)
- [Sider.ai Ollama Review](https://sider.ai/blog/ai-tools/is-ollama-the-best-local-llm-runner-in-2025-a-no-hype-review)
