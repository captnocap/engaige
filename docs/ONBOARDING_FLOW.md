# Onboarding Flow Specification

> **Status:** Specification Phase
> **Priority:** High - First-time user experience and account creation
> **Dependencies:** Time System, Account Service, AI Providers, Budget System, Personality Assessment

## Overview

The Onboarding Flow guides new users through account setup, configuring their AI provider, budget limits, personal profile, personality assessment, world preferences, and time settings. This is the critical first impression and must be smooth, informative, and allow flexibility while having sensible defaults.

**Design Philosophy:**
- **Progressive disclosure** - Show basics first, advanced options later
- **Skip-friendly** - Defaults should work; users can refine later
- **Educational** - Explain what each setting does and why it matters
- **Reversible** - All settings can be changed later in Settings
- **Engaging** - Personality assessment makes onboarding feel personal, not just configuration

---

## Table of Contents

1. [Flow Overview](#flow-overview)
2. [Step 1: Welcome & Account Name](#step-1-welcome--account-name)
3. [Step 2: AI Provider Setup](#step-2-ai-provider-setup)
4. [Step 3: Budget Configuration](#step-3-budget-configuration)
5. [Step 4: User Profile](#step-4-user-profile)
6. [Step 5: Personality Assessment](#step-5-personality-assessment) ← **NEW**
7. [Step 6: World Preferences](#step-6-world-preferences)
8. [Step 7: Time Settings](#step-7-time-settings)
9. [Step 8: Content Rating](#step-8-content-rating)
10. [Step 9: Review & Generate](#step-9-review--generate)
11. [Data Structures](#data-structures)
12. [Backend Integration](#backend-integration)
13. [Frontend Components](#frontend-components)
14. [Validation Rules](#validation-rules)
15. [Skip & Default Behavior](#skip--default-behavior)
16. [Post-Onboarding](#post-onboarding)
17. [Error Handling](#error-handling)

---

## Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      ONBOARDING FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [1] Welcome        → Account name, quick intro                │
│       ↓                                                        │
│  [2] AI Provider    → Select provider, enter API key, test    │
│       ↓                                                        │
│  [3] Budget         → Spending limits, period, allocations     │
│       ↓                                                        │
│  [4] Profile        → Username, bio, interests, avatar         │
│       ↓                                                        │
│  [5] Personality    → Assessment test (maps triggers/prefs)    │  ← NEW
│       ↓                                                        │
│  [6] World Prefs    → NPC types, count, romantic/platonic mix  │
│       ↓                                                        │
│  [7] Time Settings  → Time scale, pause behavior               │
│       ↓                                                        │
│  [8] Content Rating → Safety level for AI content              │
│       ↓                                                        │
│  [9] Review         → Summary, confirm, generate NPCs          │
│       ↓                                                        │
│  [✓] Complete       → Enter desktop environment                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Progress Indicator

Each step shows progress: `Step 2 of 9 · AI Provider Setup`

### Navigation

- **Next** - Validate current step, proceed to next
- **Back** - Return to previous step (state preserved)
- **Skip** (where allowed) - Use defaults, proceed to next
- **Cancel** - Exit onboarding, delete partial account

---

## Step 1: Welcome & Account Name

### Purpose
Introduce the app, explain what an "account" represents, get account name.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    Welcome to engAIge                           │
│                                                                 │
│     Create a new world filled with AI characters who live,      │
│     post, and remember. Each account is a separate world        │
│     with its own NPCs, conversations, and memories.             │
│                                                                 │
│  ───────────────────────────────────────────────────────────── │
│                                                                 │
│     Account Name                                                │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ My World                                            │    │
│     └─────────────────────────────────────────────────────┘    │
│     This is just a label to identify this world.               │
│     You'll create your in-game profile in a later step.        │
│                                                                 │
│                                                                 │
│                                           [ Next → ]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `accountName` | string | Yes | "My World" | 1-30 chars, no leading/trailing whitespace |

### Actions

- **Next** → Validate name, proceed to AI Provider

---

## Step 2: AI Provider Setup

### Purpose
Configure which AI service powers the NPCs. Critical step - game doesn't work without valid AI.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 2 of 8 · AI Provider Setup                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     How should AI responses be generated?                       │
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐│
│     │ ○ OpenAI (GPT-4, GPT-4o, etc.)                         ││
│     │   Requires API key from platform.openai.com             ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ○ Anthropic (Claude Sonnet, Opus, etc.)                ││
│     │   Requires API key from console.anthropic.com           ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ● Local / OpenAI-Compatible  ✓ Selected                ││
│     │   Connect to LM Studio, Ollama, or any OpenAI-compatible││
│     │   endpoint. No API key required for local.              ││
│     └─────────────────────────────────────────────────────────┘│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Provider URL                                                │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ http://localhost:1234/v1                            │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     API Key (optional for local)                               │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ ••••••••••••••••••••                                │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     Default Model                                               │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ gpt-4o-mini                                    ▼    │    │
│     └─────────────────────────────────────────────────────┘    │
│     [ Fetch Available Models ]                                  │
│                                                                 │
│     ┌───────────────────────────────────────────────────────┐  │
│     │  ✓ Connection successful! Latency: 142ms              │  │
│     └───────────────────────────────────────────────────────┘  │
│                                                                 │
│                                  [ ← Back ]  [ Test & Next → ] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `providerType` | enum | Yes | `'openai-compatible'` | One of: `'openai'`, `'anthropic'`, `'openai-compatible'` |
| `baseUrl` | string | Conditional | `'http://localhost:1234/v1'` | Valid URL, required for openai-compatible |
| `apiKey` | string | Conditional | `''` | Required for openai/anthropic, optional for local |
| `defaultModel` | string | Yes | Auto-detected | Must be valid model from provider |

### Provider-Specific Behavior

**OpenAI:**
- Base URL auto-set to `https://api.openai.com/v1`
- API key required
- Model dropdown: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo

**Anthropic:**
- Base URL auto-set to `https://api.anthropic.com`
- API key required
- Model dropdown: claude-3-5-sonnet, claude-3-opus, claude-3-haiku

**OpenAI-Compatible:**
- User provides base URL
- API key optional
- Model dropdown populated via `/v1/models` endpoint or manual entry

### Advanced Options (Collapsed by Default)

```
▼ Advanced Options

  Vision Model Override (for image analysis)
  ┌─────────────────────────────────────────────────────┐
  │ Same as default                              ▼     │
  └─────────────────────────────────────────────────────┘
  If your main model doesn't support vision, we'll use this
  model to describe images to NPCs.

  Max Context Tokens
  ┌─────────────────────────────────────────────────────┐
  │ 8192                                               │
  └─────────────────────────────────────────────────────┘

  ☐ Enable function calling / tools
```

### Actions

- **Test Connection** → Validates URL/key, fetches models
- **Back** → Return to Welcome
- **Test & Next** → Validates and proceeds (must pass test)

### Connection Test

1. Attempt to fetch `/v1/models` (or provider equivalent)
2. If success: Show latency, populate model dropdown
3. If failure: Show error, suggest fixes (wrong URL, invalid key, etc.)

---

## Step 3: Budget Configuration

### Purpose
Set spending limits to prevent unexpected API costs. Critical for cost-conscious users.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 3 of 8 · Budget Configuration                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Control your AI spending                                    │
│     Set limits to prevent unexpected costs. You can always     │
│     adjust these later in Settings.                            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Spending Limit                                              │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ $ 10.00                                             │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│     Budget Period                                               │
│     ○ Daily    ● Monthly    ○ Weekly                           │
│                                                                 │
│     ☑ Roll over unused budget to next period                   │
│       (Up to 2x your limit)                                    │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ▼ Feature Allocations (Advanced)                               │
│                                                                 │
│     These percentages reserve budget for different features.    │
│     If one category runs out, it won't steal from others.      │
│                                                                 │
│     Conversations (DMs)              ███████████░░░░░  50%     │
│     Background Activity              ██████░░░░░░░░░░  25%     │
│     NPC Generation                   ███░░░░░░░░░░░░░  10%     │
│     Image Analysis                   ██░░░░░░░░░░░░░░   5%     │
│     Image Generation                 ██░░░░░░░░░░░░░░   5%     │
│     Other                            ██░░░░░░░░░░░░░░   5%     │
│                                      ─────────────────────      │
│                                                    Total: 100%  │
│                                                                 │
│     [ Reset to Defaults ]                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     💡 Using a local model (LM Studio, Ollama)?                │
│        Set your budget to $0 or very high - local models       │
│        are free!                                                │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `overallLimitCents` | number | Yes | `1000` ($10) | 0-100000 (0 = unlimited) |
| `periodType` | enum | Yes | `'monthly'` | `'daily'`, `'weekly'`, `'monthly'` |
| `rolloverEnabled` | boolean | Yes | `true` | - |
| `allocations` | object | No | See defaults | Sum must equal 100% |

### Default Allocations

```typescript
const DEFAULT_ALLOCATIONS = {
  conversations: 50,       // User DMs with NPCs
  background_activity: 25, // NPC posts, NPC-NPC chat
  npc_generation: 10,      // Creating new NPCs
  image_analysis: 5,       // Vision proxy
  image_generation: 5,     // DALL-E, etc.
  other: 5                 // Memories, news, misc
};
```

### Budget Presets (Optional Quick Select)

- **Minimal** - $5/month, conservative allocations
- **Standard** - $10/month, balanced (default)
- **Active** - $25/month, more background activity
- **Unlimited** - $0 (no limit), for local models

### Actions

- **Back** → Return to AI Provider
- **Next** → Validate and proceed
- **Skip** → Use defaults ($10/month, default allocations)

---

## Step 4: User Profile

### Purpose
Create the player's in-game identity. NPCs will know the player by this profile.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 4 of 8 · Your Profile                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Who are you in this world?                                  │
│     NPCs will know you by this profile.                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     ┌───────────┐  Username *                                  │
│     │           │  ┌─────────────────────────────────────┐     │
│     │  (avatar) │  │ alex_gaming                         │     │
│     │           │  └─────────────────────────────────────┘     │
│     │  [Change] │  This is your @handle. Lowercase, no spaces. │
│     └───────────┘                                               │
│                    Display Name                                │
│                    ┌─────────────────────────────────────┐     │
│                    │ Alex                                │     │
│                    └─────────────────────────────────────┘     │
│                    How NPCs will address you.                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Bio                                                        │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Coffee addict. Indie game dev. Night owl.          │    │
│     │ Looking for interesting conversations.              │    │
│     │                                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│     280 characters max · NPCs will read this                   │
│                                                                 │
│     Interests (select up to 10)                                │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ [Gaming ✓] [Music ✓] [Technology ✓] [Anime ✓]      │    │
│     │ [Movies] [Books] [Sports] [Cooking] [Travel]       │    │
│     │ [Art] [Photography] [Science] [Fitness] [Fashion]  │    │
│     │ [Pets] [Nature] [Writing] [Comedy] [History]       │    │
│     │ + Add custom...                                     │    │
│     └─────────────────────────────────────────────────────┘    │
│     NPCs with matching interests are more likely to connect.   │
│                                                                 │
│     Personality Vibe                                           │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Chill and casual                              ▼    │    │
│     └─────────────────────────────────────────────────────┘    │
│     Affects how NPCs perceive and interact with you.           │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `username` | string | Yes | `''` | 3-20 chars, lowercase, alphanumeric + underscore |
| `displayName` | string | No | Same as username | 1-30 chars |
| `bio` | string | No | `''` | 0-280 chars |
| `interests` | string[] | No | `[]` | 0-10 items |
| `personalityVibe` | enum | Yes | `'chill'` | See options below |
| `avatarSource` | enum | No | `'generated'` | `'generated'`, `'upload'`, `'url'` |
| `avatarUrl` | string | No | Auto-generated | Valid URL or data URL |

### Personality Vibe Options

| Value | Label | Description (shown to user) |
|-------|-------|----------------------------|
| `'chill'` | Chill and casual | Relaxed, easygoing conversations |
| `'enthusiastic'` | Enthusiastic and energetic | Excited, uses exclamations |
| `'thoughtful'` | Thoughtful and deep | Philosophical, asks questions |
| `'playful'` | Playful and flirty | Teasing, lighthearted |
| `'mysterious'` | Mysterious and reserved | Brief, enigmatic responses |
| `'supportive'` | Warm and supportive | Encouraging, empathetic |

### Avatar Options

- **Generate** - DiceBear/Boring Avatars style based on username
- **Upload** - Select from local files (PNG, JPG, WEBP)
- **URL** - Enter image URL
- **AI Generate** - Use image gen to create portrait (costs tokens)

### Actions

- **Back** → Return to Budget
- **Next** → Validate and proceed

---

## Step 5: Personality Assessment

> **Full specification:** See [PERSONALITY_ASSESSMENT.md](./PERSONALITY_ASSESSMENT.md)

### Purpose
A "personality test" that maps the player's emotional triggers, social preferences, and behavioral tolerances. This data directly informs NPC generation - creating characters they'll love, hate, and everything in between.

**What the player sees:** "A personality assessment to help match you with compatible characters."

**What it actually does:** Maps triggers to generate ~40% compatible NPCs, ~30% challenging NPCs, ~20% antagonistic NPCs, and ~10% wildcards.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 5 of 9 · Personality Assessment        Question 7 of 30   │
├─────────────────────────────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  Communication Styles                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     How do you feel when...                                    │
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐│
│     │                                                         ││
│     │   someone takes hours to respond to your message        ││
│     │                                                         ││
│     └─────────────────────────────────────────────────────────┘│
│                                                                 │
│     😠          😕          😐          🙂          😊          │
│                                                                 │
│     ○           ○           ○           ○           ○          │
│   Very       Somewhat    Neutral    Somewhat     Very          │
│  Negative    Negative              Positive    Positive        │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Question Categories

| Category | Questions | What It Maps |
|----------|-----------|--------------|
| Social Media | 6-8 | Posting habits tolerance, validation needs |
| Communication | 5-7 | Response speed, message style preferences |
| Personality | 6-8 | Trait tolerance (optimism, bluntness, etc.) |
| Relationships | 5-7 | Clinginess, distance, jealousy preferences |
| Conflict & Drama | 4-6 | Confrontation style, gossip tolerance |

### Player Archetypes (Detected)

Based on responses, classify into:
- `the_validator` - Needs constant engagement
- `the_independent` - Values space, dislikes clinginess
- `the_peacekeeper` - Avoids conflict
- `the_confronter` - Prefers direct communication
- `the_empath` - Sensitive to emotions
- `the_stoic` - Uncomfortable with emotional expression
- `the_social_butterfly` - High tolerance for all behaviors
- `the_selective` - Very particular about personality types
- `the_chaos_agent` - Enjoys drama
- `the_stability_seeker` - Prefers predictable relationships

### Results Display

After completion, show personality profile (positive framing):

```
┌─────────────────────────────────────────────────────────────────┐
│     🎯 Primary Type: The Independent                           │
│                                                                 │
│     You value personal space and autonomy. You appreciate      │
│     people who respect boundaries and don't require            │
│     constant attention.                                        │
│                                                                 │
│     Strengths: Clear boundaries, self-sufficient               │
│     Growth areas: Balance independence with vulnerability      │
└─────────────────────────────────────────────────────────────────┘
```

### Fields Collected

| Field | Type | Description |
|-------|------|-------------|
| `responses` | QuestionResponse[] | All answers with scores |
| `archetype` | PlayerArchetype | Primary personality type |
| `trait_scores` | TraitScore[] | Aggregated trait measurements |
| `behavioral_preferences` | BehavioralPreference[] | What behaviors to generate |
| `strong_likes` | string[] | Behaviors with score > 1.5 |
| `strong_dislikes` | string[] | Behaviors with score < -1.5 |

### Actions

- **Back** → Return to Profile
- **Next** → Complete question, advance (or finish if last)
- **Skip Assessment** → Use neutral defaults (discouraged)

---

## Step 6: World Preferences

### Purpose
Configure what types of NPCs populate the world and how many to generate. Now informed by personality assessment results.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 6 of 9 · World Preferences                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Customize your world's population                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Initial NPC Count                                          │
│                                                                 │
│     10 ─────────●───────────────────────────────────────── 50  │
│                 ▲                                              │
│                25 NPCs                                         │
│                                                                 │
│     More NPCs = more variety but uses more API tokens          │
│     during generation. You can always add more later.          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Relationship Types                                          │
│                                                                 │
│     Romantic Interest Level                                    │
│     ○ None - Purely platonic world                             │
│     ○ Low - A few potential romantic interests                 │
│     ● Medium - Balanced mix of romantic and platonic           │
│     ○ High - Mostly romantic interests                         │
│                                                                 │
│     Platonic Friends Level                                     │
│     ○ Low - Fewer friends, more focused interactions           │
│     ● Medium - Good variety of friendships                     │
│     ○ High - Large social circle                               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     NPC Demographics                                            │
│                                                                 │
│     Gender Mix                                                  │
│     ○ Any - Let AI decide naturally                            │
│     ● Mixed - Roughly balanced                                 │
│     ○ Mostly Male                                              │
│     ○ Mostly Female                                            │
│     ○ Non-binary focused                                       │
│                                                                 │
│     Age Range                                                   │
│     18 ─────●────────────────────●───────────────────────── 65 │
│             ▲                    ▲                              │
│            22                   38                              │
│     NPCs will be generated within this age range.              │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ▼ Advanced Options                                             │
│                                                                 │
│     World Flavor (affects NPC naming and aesthetics)           │
│     ● Modern day - Contemporary setting                        │
│     ○ Retro (80s/90s) - Nostalgic vibes                       │
│     ○ Near future - Slight sci-fi elements                    │
│     ○ Fantasy inspired - Unusual names, mystical hints        │
│                                                                 │
│     ☐ Include celebrity parody NPCs                            │
│     ☐ Include NPCs based on my interests                       │
│     ☑ Generate diverse personalities                           │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `npcCount` | number | Yes | `25` | 10-50 |
| `romanticLevel` | enum | Yes | `'medium'` | `'none'`, `'low'`, `'medium'`, `'high'` |
| `platonicLevel` | enum | Yes | `'medium'` | `'low'`, `'medium'`, `'high'` |
| `genderMix` | enum | Yes | `'mixed'` | `'any'`, `'mixed'`, `'mostly_male'`, `'mostly_female'`, `'nonbinary'` |
| `ageRange` | object | Yes | `{ min: 22, max: 38 }` | min >= 18, max <= 65, min < max |
| `worldFlavor` | enum | No | `'modern'` | `'modern'`, `'retro'`, `'near_future'`, `'fantasy'` |
| `includeCelebrityParodies` | boolean | No | `false` | - |
| `includeInterestBasedNPCs` | boolean | No | `true` | - |
| `diversePersonalities` | boolean | No | `true` | - |

### Actions

- **Back** → Return to Profile
- **Next** → Validate and proceed

---

## Step 7: Time Settings

### Purpose
Configure how time passes in the game world. See [TIME_SYSTEM.md](./TIME_SYSTEM.md) for full spec.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 7 of 9 · Time Settings                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     How fast should time pass in your world?                   │
│                                                                 │
│     Time in engAIge can run faster than real life.             │
│     This affects how often NPCs post, message, and             │
│     how quickly relationships develop.                         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐│
│     │ ○ Real-Time (1:1)                                      ││
│     │   1 real hour = 1 game hour                            ││
│     │   Most immersive, requires patience                     ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ● Standard (4x) ✓ Recommended                          ││
│     │   1 real hour = 4 game hours                           ││
│     │   A 4-hour play session covers a full game day         ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ○ Fast (8x)                                            ││
│     │   1 real hour = 8 game hours                           ││
│     │   For active, focused play sessions                     ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ○ Very Fast (24x)                                      ││
│     │   1 real hour = 1 game day                             ││
│     │   Rapid progression, lots of activity                   ││
│     └─────────────────────────────────────────────────────────┘│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     ☑ Pause world time when app is minimized                   │
│       Prevents the world from running while you're away        │
│                                                                 │
│     ☐ Show real time alongside game time                       │
│       Display both clocks in the taskbar                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     At 4x speed:                                               │
│     • NPCs post every 30-90 real minutes                       │
│     • Full game day passes in 6 real hours                     │
│     • Relationships develop 4x faster                          │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `timeScale` | number | Yes | `4` | 1, 2, 4, 8, 24, or custom 0.5-168 |
| `pauseWhenMinimized` | boolean | Yes | `true` | - |
| `showRealTimeInUI` | boolean | No | `false` | - |

### Actions

- **Back** → Return to World Preferences
- **Next** → Proceed to Content Rating

---

## Step 8: Content Rating

### Purpose
Set the content safety level for AI-generated content. See [CONTENT_GUARDRAILS.md](./CONTENT_GUARDRAILS.md).

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 8 of 9 · Content Rating                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     What content level are you comfortable with?               │
│                                                                 │
│     This controls how NPCs behave, what they can discuss,      │
│     and what images can be generated.                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐│
│     │ ○ Harsh                                                ││
│     │   Strictly platonic, clean language only                ││
│     │   No romantic content, family-friendly                  ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ○ Strict                                               ││
│     │   Romantic themes allowed, no sexual content            ││
│     │   Appropriate for teens                                 ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ● Normal ✓ Recommended                                 ││
│     │   Natural adult progression                             ││
│     │   Intimacy requires relationship development            ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ○ Relaxed                                              ││
│     │   Unrestricted adult content                            ││
│     │   NSFW images allowed                                   ││
│     ├─────────────────────────────────────────────────────────┤│
│     │ ○ None                                                 ││
│     │   No restrictions whatsoever                            ││
│     │   ⚠️ Not recommended - may produce harmful content      ││
│     └─────────────────────────────────────────────────────────┘│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     ⓘ This affects:                                            │
│     • How NPCs respond to romantic/sexual topics               │
│     • What images can be generated or shared                   │
│     • Language filtering in NPC messages                       │
│     • Available NPC personality types                          │
│                                                                 │
│     You can change this later in Settings > Content.           │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| `contentRating` | enum | Yes | `'normal'` | `'harsh'`, `'strict'`, `'normal'`, `'relaxed'`, `'none'` |

### Rating Implications

| Rating | Romance | Sexual | Language | NSFW Images |
|--------|---------|--------|----------|-------------|
| Harsh | No | No | Clean only | No |
| Strict | Yes | No | Mild | No |
| Normal | Yes | Relationship-gated | Natural | No |
| Relaxed | Yes | Yes | Unrestricted | Yes |
| None | Yes | Yes | Unrestricted | Yes |

### Warning for "None"

If user selects "None", show confirmation:

```
⚠️ Are you sure?

"None" removes all content filters. AI may generate:
• Explicit sexual content
• Graphic violence
• Potentially offensive material

This setting is not recommended.

[ Cancel ] [ I understand, proceed ]
```

### Actions

- **Back** → Return to Time Settings
- **Next** → Proceed to Review

---

## Step 9: Review & Generate

### Purpose
Show summary of all settings, allow final adjustments, then generate NPCs.

### UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 9 of 9 · Review & Create World                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Almost there! Review your settings:                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Account: My World                               [Edit]    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ AI Provider: Local (http://localhost:1234/v1)   [Edit]    │ │
│  │ Model: gpt-4o-mini                                        │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Budget: $10.00/month (rollover enabled)         [Edit]    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Profile: @alex_gaming (Alex)                    [Edit]    │ │
│  │ Interests: Gaming, Music, Technology, Anime               │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Personality: The Independent               [View/Retake]  │ │
│  │ "Values space, clear boundaries, self-sufficient"         │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ World: 25 NPCs, Mixed romantic/platonic         [Edit]    │ │
│  │ Ages 22-38, Mixed genders, Modern setting                 │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Time: 4x speed, Pause when minimized            [Edit]    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │ Content: Normal (relationship-gated intimacy)   [Edit]    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     ☑ Generate NPCs now (recommended)                          │
│       Creates 25 unique characters for your world.             │
│       Takes 1-2 minutes depending on your AI provider.         │
│                                                                 │
│     ☐ Skip NPC generation (dev mode)                           │
│       Start with an empty world. Add NPCs manually later.      │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Estimated initial cost: ~$0.15-0.30                        │
│     (for generating 25 NPCs with profiles)                     │
│                                                                 │
│                         [ ← Back ]  [ Create World → ]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Generation Progress

After clicking "Create World", show progress:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     Creating your world...                                      │
│                                                                 │
│     ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  40%            │
│                                                                 │
│     ✓ Account created                                          │
│     ✓ Settings saved                                           │
│     ✓ Profile created                                          │
│     ⟳ Generating NPCs... (10 of 25)                            │
│       Creating: Marcus Chen - Software Engineer                │
│     ○ Initializing world...                                    │
│                                                                 │
│     This may take a minute or two.                             │
│     Feel free to minimize - we'll let you know when ready.     │
│                                                                 │
│                              [ Cancel ]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Completion

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     ✓ World created successfully!                              │
│                                                                 │
│     25 NPCs are ready to meet you.                             │
│                                                                 │
│     Your world includes:                                        │
│     • 8 potential romantic interests                           │
│     • 17 friends and acquaintances                             │
│     • Ages 22-37, diverse backgrounds                          │
│                                                                 │
│     Cost: $0.23                                                │
│                                                                 │
│                              [ Enter World → ]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Actions

- **Edit** links → Jump back to that step
- **Back** → Return to Content Rating
- **Create World** → Execute onboarding, generate NPCs
- **Cancel** (during generation) → Abort, keep partial progress

---

## Data Structures

### OnboardingData (Complete)

```typescript
interface OnboardingData {
  // Step 1: Account
  accountName: string;

  // Step 2: AI Provider
  provider: {
    type: 'openai' | 'anthropic' | 'openai-compatible';
    baseUrl: string;
    apiKey: string;
    defaultModel: string;
    visionModelOverride?: string;
    maxContextTokens?: number;
    enableTools?: boolean;
  };

  // Step 3: Budget
  budget: {
    overallLimitCents: number;
    periodType: 'daily' | 'weekly' | 'monthly';
    rolloverEnabled: boolean;
    allocations: {
      conversations: number;      // percentage
      background_activity: number;
      npc_generation: number;
      image_analysis: number;
      image_generation: number;
      other: number;
    };
  };

  // Step 4: Profile
  profile: {
    username: string;
    displayName: string;
    bio: string;
    interests: string[];
    personalityVibe: string;
    avatarSource: 'generated' | 'upload' | 'url';
    avatarUrl?: string;
  };

  // Step 5: Personality Assessment (see PERSONALITY_ASSESSMENT.md)
  personality: {
    responses: Array<{
      question_id: string;
      response: -2 | -1 | 0 | 1 | 2;
      category: string;
    }>;
    archetype: PlayerArchetype;
    archetypeConfidence: number;
    secondaryArchetype?: PlayerArchetype;
    traitScores: Record<string, number>;
    strongLikes: string[];      // Behaviors with score > 1.5
    strongDislikes: string[];   // Behaviors with score < -1.5
    generationWeights: {
      compatible: number;       // ~0.40
      challenging: number;      // ~0.30
      antagonistic: number;     // ~0.20
      wildcard: number;         // ~0.10
    };
    skipped: boolean;           // True if player skipped assessment
  };

  // Step 6: World Preferences
  world: {
    npcCount: number;
    romanticLevel: 'none' | 'low' | 'medium' | 'high';
    platonicLevel: 'low' | 'medium' | 'high';
    genderMix: 'any' | 'mixed' | 'mostly_male' | 'mostly_female' | 'nonbinary';
    ageRange: { min: number; max: number };
    worldFlavor: 'modern' | 'retro' | 'near_future' | 'fantasy';
    includeCelebrityParodies: boolean;
    includeInterestBasedNPCs: boolean;
    diversePersonalities: boolean;
  };

  // Step 7: Time
  time: {
    scale: number;
    pauseWhenMinimized: boolean;
    showRealTimeInUI: boolean;
  };

  // Step 8: Content
  content: {
    rating: 'harsh' | 'strict' | 'normal' | 'relaxed' | 'none';
  };

  // Step 9: Options
  generateNPCs: boolean;
}

type PlayerArchetype =
  | 'the_validator'
  | 'the_independent'
  | 'the_peacekeeper'
  | 'the_confronter'
  | 'the_empath'
  | 'the_stoic'
  | 'the_social_butterfly'
  | 'the_selective'
  | 'the_chaos_agent'
  | 'the_stability_seeker';
```

### OnboardingState (Frontend)

```typescript
interface OnboardingState {
  currentStep: number;           // 1-8
  data: Partial<OnboardingData>;
  validation: {
    [step: number]: {
      valid: boolean;
      errors: string[];
    };
  };
  isSubmitting: boolean;
  generationProgress: {
    phase: string;
    current: number;
    total: number;
    currentNPCName?: string;
  } | null;
  error: string | null;
}
```

---

## Backend Integration

### WebSocket Routes

| Route | Direction | Payload | Response |
|-------|-----------|---------|----------|
| `onboarding:validateProvider` | Client→Server | Provider config | `{ valid, error?, models? }` |
| `onboarding:complete` | Client→Server | `OnboardingData` | `{ success, player_id, npc_count }` |
| `onboarding:progress` | Server→Client | Progress update | - (push) |
| `onboarding:cancel` | Client→Server | `{}` | `{ cancelled: true }` |

### Backend Service Updates

```typescript
// server/src/services/onboarding.ts

export async function completeOnboarding(
  accountId: string,
  data: OnboardingData
): Promise<OnboardingResult> {

  // 1. Configure AI provider
  await configureProvider(data.provider);

  // 2. Initialize budget
  await initializeBudget(accountId, data.budget);

  // 3. Create player profile
  const playerId = await createPlayer(accountId, data.profile);

  // 4. Save preferences
  await savePreferences(accountId, {
    world: data.world,
    time: data.time,
    content: data.content
  });

  // 5. Initialize time system
  await initializeTimeConfig(accountId, data.time);

  // 6. Generate NPCs (if enabled)
  let npcCount = 0;
  if (data.generateNPCs) {
    npcCount = await generateInitialNPCs(accountId, data.world, data.profile, {
      onProgress: (progress) => {
        broadcastToAccount(accountId, 'onboarding:progress', progress);
      }
    });
  }

  // 7. Mark onboarding complete
  await markOnboardingComplete(accountId);

  return {
    success: true,
    player_id: playerId,
    npc_count: npcCount
  };
}
```

---

## Frontend Components

### Component Structure

```
src/components/onboarding/
├── OnboardingWizard.tsx      # Main container, step routing
├── OnboardingProgress.tsx    # Progress bar and step indicator
├── steps/
│   ├── WelcomeStep.tsx       # Step 1
│   ├── ProviderStep.tsx      # Step 2
│   ├── BudgetStep.tsx        # Step 3
│   ├── ProfileStep.tsx       # Step 4
│   ├── WorldPrefsStep.tsx    # Step 5
│   ├── TimeStep.tsx          # Step 6
│   ├── ContentStep.tsx       # Step 7
│   └── ReviewStep.tsx        # Step 8
├── GenerationProgress.tsx    # NPC generation overlay
└── OnboardingComplete.tsx    # Success screen
```

### OnboardingWizard Props

```typescript
interface OnboardingWizardProps {
  accountId: string;
  onComplete: () => void;
  onCancel: () => void;
  copyFrom?: {
    accountId: string;
    mode: 'everything' | 'settings_only';
  };
}
```

---

## Validation Rules

### Per-Step Validation

| Step | Field | Rule |
|------|-------|------|
| 1 | accountName | Required, 1-30 chars |
| 2 | providerType | Required |
| 2 | apiKey | Required for openai/anthropic |
| 2 | baseUrl | Valid URL for openai-compatible |
| 2 | defaultModel | Required, must be valid |
| 2 | Connection | Must pass test |
| 3 | overallLimitCents | >= 0 |
| 3 | allocations | Must sum to 100% |
| 4 | username | Required, 3-20 chars, lowercase alphanumeric |
| 4 | interests | Max 10 items |
| 5 | npcCount | 10-50 |
| 5 | ageRange.min | >= 18 |
| 5 | ageRange.max | <= 65, > min |
| 6 | timeScale | 0.5-168 |
| 7 | contentRating | Required |

### Real-time Validation

Validate on field blur and before proceeding to next step.

---

## Skip & Default Behavior

### Skippable Steps

| Step | Name | Skippable | What Happens If Skipped |
|------|------|-----------|------------------------|
| 1 | Welcome | No | Must provide account name |
| 2 | AI Provider | No | Must configure AI (game won't work) |
| 3 | Budget | Yes | Uses $10/month, default allocations |
| 4 | Profile | Partial | Username required, rest optional |
| 5 | **Personality** | **Yes** | **Neutral scores, balanced NPC generation** |
| 6 | World Prefs | Yes | Uses 25 NPCs, medium everything |
| 7 | Time | Yes | Uses 4x, pause when minimized |
| 8 | Content | Yes | Uses "Normal" rating |
| 9 | Review | No | Must confirm to create |

### Personality Assessment Skip Behavior

If skipped:
- All trait scores set to 0 (neutral)
- Archetype defaults to `the_social_butterfly`
- NPC generation uses balanced distribution (25% each category)
- Show reminder: "Take the assessment anytime in Settings to personalize your world"

### Copy From Existing Account

When creating account with "Copy Everything" or "Copy Settings Only":

**Copy Everything:**
- Skip steps 2-8 (copy all settings including personality)
- Show abbreviated review at step 9
- Only generate new NPCs (don't copy NPCs)
- New NPCs use copied personality assessment data

**Copy Settings Only:**
- Skip steps 2-3 (copy provider + budget)
- Still do steps 4-8 (new profile, new personality, new preferences)
- Fresh personality assessment for new world

---

## Post-Onboarding

### Immediate Actions

1. **Mark account as onboarded** - `has_completed_onboarding = true`
2. **Update last played** - Touch `last_played_at`
3. **Initialize game state** - Create empty tables in game.db
4. **Start background scheduler** - Begin NPC autonomous tasks
5. **Emit events:**
   - `PLAYER_PROFILE_CREATED`
   - `SYSTEM_STARTUP` (for this account)

### First-Time UI Hints

After entering desktop for first time:
- Show tooltip pointing to messaging app: "Start a conversation!"
- Subtle highlight on social feed: "See what NPCs are posting"
- Tutorial prompt: "Would you like a quick tour?" (dismissable)

---

## Error Handling

### Connection Test Failures

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Connection Failed                                          │
│                                                                 │
│  Could not connect to http://localhost:1234/v1                 │
│                                                                 │
│  Possible causes:                                               │
│  • LM Studio is not running                                    │
│  • The URL is incorrect                                        │
│  • Firewall is blocking the connection                         │
│                                                                 │
│  [ Try Again ] [ Enter Different URL ]                         │
└─────────────────────────────────────────────────────────────────┘
```

### API Key Invalid

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Invalid API Key                                            │
│                                                                 │
│  The API key was rejected by OpenAI.                           │
│                                                                 │
│  • Check that you copied the full key                          │
│  • Verify your key at platform.openai.com                      │
│  • Ensure your account has available credits                   │
│                                                                 │
│  [ Try Again ]                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Generation Failed Mid-Way

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Generation Interrupted                                     │
│                                                                 │
│  Created 12 of 25 NPCs before encountering an error.           │
│                                                                 │
│  Error: Rate limit exceeded. Please wait 60 seconds.           │
│                                                                 │
│  [ Continue with 12 NPCs ] [ Retry Remaining ] [ Cancel ]      │
└─────────────────────────────────────────────────────────────────┘
```

### Budget Exhausted During Generation

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Budget Limit Reached                                       │
│                                                                 │
│  Created 18 of 25 NPCs before hitting your $10 budget.         │
│                                                                 │
│  Options:                                                       │
│  • Continue with 18 NPCs (you can add more later)              │
│  • Increase budget and retry                                   │
│                                                                 │
│  [ Continue with 18 NPCs ] [ Increase Budget ]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Backend
- [ ] Update `onboarding.ts` with new OnboardingData structure
- [ ] Add time config initialization
- [ ] Add content rating persistence
- [ ] Add world preferences persistence
- [ ] Update NPC generation with new parameters
- [ ] Add progress broadcasting
- [ ] Add validation endpoint

### Frontend
- [ ] Create OnboardingWizard component
- [ ] Create OnboardingProgress component
- [ ] Create all 8 step components
- [ ] Create GenerationProgress overlay
- [ ] Create OnboardingComplete screen
- [ ] Wire up to account creation flow
- [ ] Add form validation
- [ ] Add error handling UI

### Integration
- [ ] Connect LoginScreen → OnboardingWizard
- [ ] Handle "Copy From" account flows
- [ ] Test full flow end-to-end
- [ ] Add onboarding events to event bus

---

## Summary

The onboarding flow is designed to:
1. **Be approachable** - Sensible defaults mean users can click through quickly
2. **Be educational** - Each step explains why it matters
3. **Be flexible** - Power users can configure everything
4. **Be recoverable** - All settings changeable later
5. **Feel rewarding** - NPC generation creates anticipation and payoff

The 8-step structure balances thoroughness with momentum, keeping users engaged while gathering all necessary configuration for a personalized experience.
