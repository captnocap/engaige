# Scene Seed NPC Generation System

## Overview

The Scene Seed system replaces batch NPC generation with **narrative-driven NPC clusters**. Instead of generating 30 generic NPCs from a single prompt, the system:

1. Runs a **personality test** during onboarding (7 questions)
2. Compiles a **player personality profile** with 8 dimensions + 3 derived scores
3. **Scores and selects** scene seeds based on the profile
4. **Generates NPC clusters** from seeds in waves (Wave 1 immediate, rest background)

Each seed produces 1-3 interconnected NPCs with pre-built motivations, relationships to each other, and attitudes toward the player.

## Architecture

```
Personality Test → Profile Compilation → Seed Scoring → Seed Selection
                                                              ↓
                                              Wave Planning (4+ waves)
                                                              ↓
                                         Wave 1 (immediate) → Player enters game
                                         Wave 2-N (background scheduler)
                                                              ↓
                                         Per-Seed: AI Call → NPC Creation
                                                   → Cluster Storage
                                                   → NPC-NPC Relationships
                                                   → Initial Memories
```

## Key Files

| File | Purpose |
|------|---------|
| `server/data/personality-test.json` | 7 personality test questions with weighted choices |
| `server/data/scene-seeds/**/*.json` | 18 scene seed files across 5 categories |
| `server/src/services/personality-test.ts` | Question loading, answer processing, profile compilation |
| `server/src/services/seed-scorer.ts` | Seed loading, scoring, selection, wave planning |
| `server/src/services/scene-seed-generator.ts` | AI generation pipeline, NPC creation, cluster storage |
| `server/src/services/onboarding.ts` | Integration point (new functions added) |

## Personality Dimensions

| Dimension | Low (0) | High (1) |
|-----------|---------|----------|
| `conflict_style` | Avoidant | Confrontational |
| `social_energy` | Introverted | Extroverted |
| `emotional_openness` | Guarded | Vulnerable |
| `humor_preference` | Dry/dark | Wholesome/silly |
| `trust_disposition` | Skeptical | Trusting |
| `romance_attitude` | Cautious | Passionate |
| `chaos_tolerance` | Structured | Chaotic |
| `ambition_level` | Content | Driven |

### Derived Scores

- **drama_affinity** = conflict_style(0.4) + chaos_tolerance(0.3) + emotional_openness(0.3)
- **romance_readiness** = romance_attitude(0.5) + emotional_openness(0.25) + trust_disposition(0.25)
- **social_appetite** = social_energy(0.5) + trust_disposition(0.25) + chaos_tolerance(0.25)

## Scene Seed Categories

| Category | Count | Description |
|----------|-------|-------------|
| `antagonist` | 4 | NPCs hostile/annoyed with player |
| `romantic` | 4 | Romantic interest NPCs (requires romance enabled) |
| `social` | 4 | Friend groups and acquaintances |
| `wildcard` | 3 | Weird/chaotic scenarios |
| `chain` | 3 | Take output from other seeds as input |

### Seed Library

**Antagonist:**
- `workplace-rivalry` - Coworker who hates you + sidekick (2 NPCs)
- `neighborhood-nemesis` - Neighbor with grudge + neutral spouse (2 NPCs)
- `online-troll` - Threadit troll + alt account persona (2 NPCs)
- `ex-friend` - Betrayed ex-friend + mutual caught in middle (2 NPCs)

**Romantic:**
- `ex-wife-upgrade` - Woman who left her ex + bitter ex-husband (2 NPCs)
- `coffee-shop-regular` - Barista crush + gossip coworker (2 NPCs)
- `dating-app-match` - Genuine match + overprotective best friend (2 NPCs)
- `wrong-number` - Accidental text connection + current situationship (2 NPCs)

**Social:**
- `gaming-crew` - Leader + tryhard + casual gamer (3 NPCs)
- `gym-buddies` - Workout partner + unsolicited advisor (2 NPCs)
- `book-club` - Intellectual + non-reader with opinions (2 NPCs)
- `bar-regulars` - Bartender + debate regular (2 NPCs)

**Wildcard:**
- `conspiracy-neighbor` - Conspiracy theorist + true believer (2 NPCs)
- `accidental-celebrity` - Viral lookalike + their agent (2 NPCs)
- `pet-parent` - Judgmental pet parent + dog walker (2 NPCs)

**Chain:**
- `best-friend-of` - Best friend of any generated NPC (1 NPC, chains from coffee-shop-regular)
- `disapproving-parent` - Parent of romantic NPC (1 NPC, chains from dating-app-match)
- `rebound` - Revenge date of jealous ex (1 NPC, chains from ex-wife-upgrade)

## Scoring Algorithm

For each seed against the player profile:

1. **Filter**: Skip if `requires_romantic_enabled` and romance disabled
2. **Dimension check**: Skip if player dimension outside seed's min/max bounds
3. **Affinity score**: Sum of `affinity * playerDimensionValue` for each weight
4. **Base priority**: Add `base_priority / 100`
5. **Drama boost**: Multiply drama_level by `1 + dramaLevel` when player drama > 0.5
6. **Romance boost**: Multiply romance_level by `romance_readiness` when enabled
7. **Diversity penalty**: -30% if >2 tags overlap with already-selected seeds

### Selection Rules

- At least 1 antagonist, 1 social, 1 wildcard
- Max 40% romantic seeds (if enabled)
- Chain seeds only if parent seed selected
- Greedy fill until target NPC count reached

## Wave Scheduling

| Wave | Timing | Seeds | NPCs |
|------|--------|-------|------|
| 1 | Immediate (blocking) | 3-4 (1 antagonist, 1-2 social, 1 wildcard) | ~8-10 |
| 2 | 2 min after game entry | 3-4 | ~6-8 |
| 3 | 5 min | 2-3 | ~4-6 |
| 4+ | 10+ min | Remaining + chains | ~4-6 |

## Database

### `npc_seed_clusters` table (game.db)

```sql
CREATE TABLE npc_seed_clusters (
  id TEXT PRIMARY KEY,
  seed_id TEXT NOT NULL,
  npc_ids TEXT NOT NULL,          -- JSON array of NPC IDs
  relationships TEXT NOT NULL,     -- JSON: NPC-NPC dynamics
  player_dynamics TEXT NOT NULL,   -- JSON: each NPC's stance toward player
  wave_number INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);
```

## Event Types

| Event | When |
|-------|------|
| `onboarding:personality_test_completed` | Profile compiled from answers |
| `onboarding:npc_wave_started` | Wave generation begins |
| `onboarding:npc_wave_completed` | Wave generation finishes |
| `onboarding:completed` | Wave 1 done, player can enter game |

## WebSocket Messages

### Client -> Server

| Message | Payload |
|---------|---------|
| `onboarding:getQuestions` | (none) |
| `onboarding:submitAnswer` | `{ questionId, choiceValue?, freeformText?, skipped }` |
| `onboarding:skipAll` | (none) |
| `onboarding:startGeneration` | `{ targetNPCCount?, romanticEnabled? }` |

### Server -> Client

| Message | Payload |
|---------|---------|
| `onboarding:questions` | `{ questions: [...] }` (weights stripped) |
| `onboarding:profileCompiled` | `{ summary, dimensions, drama_affinity, ... }` |
| `onboarding:waveProgress` | `{ wave, npcsCreated, totalExpected, ... }` |
| `onboarding:ready` | `{ totalNPCs, waves_remaining }` |

## Adding New Seeds

1. Create a JSON file in the appropriate `server/data/scene-seeds/{category}/` directory
2. Follow the `SceneSeed` schema (see `seed-scorer.ts` for the interface)
3. Use `{{player_name}}` and `{{player_persona_summary}}` in `narrative_prompt`
4. For chain seeds, also use `{{chain_input_npc}}` and set `chain_from`, `chain_input_role`, `chain_depth`
5. The seed will be automatically discovered and scored on next server start

## Initialization

Call `initializeSceneSeedSystem()` from onboarding.ts during server startup to register the wave task handler with the background scheduler.
