# Drama Automation System

This document describes the drama automation system that makes NPCs autonomously post, react, and discover secrets based on relationship events and social media activity.

## Overview

The drama automation system connects several existing systems to create emergent drama:

1. **Simulation Store** - Game clock that drives time-based events
2. **Drama Engine** - Central orchestrator for NPC behavior
3. **Social Store** - NPC content creation (posts, comments, likes)
4. **Awareness Store** - NPC social media checking with reactions
5. **Relationship Store** - Event broadcasting for relationship changes

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Simulation Store                             │
│  (Game Clock - ticks every N ms, advances game time)               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌───────────────────────────┴───────────────────────────┐
        │                                                       │
        ▼                                                       ▼
┌───────────────────┐                               ┌───────────────────┐
│  Awareness Store  │                               │   Drama Engine    │
│  (NPC checks      │──────────────────────────────▶│  (spontaneous     │
│   social media)   │   processPostReaction()      │   posts, affair   │
└───────────────────┘   checkForSuspiciousActivity │   discovery)      │
                                                    └───────────────────┘
                                                              │
                                                              ▼
                                                    ┌───────────────────┐
                                                    │  Relationship     │
                                                    │  Store Events     │◀───┐
                                                    │  (subscribed)     │    │
                                                    └───────────────────┘    │
                                                              │              │
                                                              ▼              │
                                                    ┌───────────────────┐    │
                                                    │  Social Store     │    │
                                                    │  (NPC posts,      │────┘
                                                    │   comments, likes)│
                                                    └───────────────────┘
```

## Key Files

### New Files Created

| File | Purpose |
|------|---------|
| `src/stores/simulationStore.ts` | Game clock, time management, simulation loop |
| `src/services/dramaEngine.ts` | Central drama orchestration, personality mapping |

### Modified Files

| File | Changes |
|------|---------|
| `src/stores/socialStore.ts` | Added `createNPCPost()`, `addNPCComment()`, `addNPCLike()`, `removeNPCLike()` |
| `src/stores/awarenessStore.ts` | Added drama engine calls when NPCs see posts |
| `src/stores/npcRelationshipStore.ts` | Added event broadcasting system |

## Simulation Store

The simulation store (`src/stores/simulationStore.ts`) manages game time and the main simulation loop.

### Configuration

```typescript
interface SimulationState {
  gameTime: Date              // Current in-game time
  isRunning: boolean          // Is simulation active
  isPaused: boolean           // Temporarily paused
  tickIntervalMs: number      // Real-time ms between ticks (default: 1000)
  gameTimeAdvanceMinutes: number  // In-game minutes per tick (default: 15)
  speedMultiplier: number     // Speed multiplier (1x, 2x, etc.)
}
```

### Time Scaling

Default settings:
- 1 real second = 15 in-game minutes
- 1 real minute = 15 in-game hours
- ~4 real minutes = 1 in-game day

### Usage

```typescript
import { useSimulationStore } from './stores/simulationStore'

// Start simulation
useSimulationStore.getState().start()

// Pause/resume
useSimulationStore.getState().pause()
useSimulationStore.getState().resume()

// Change speed
useSimulationStore.getState().setSpeed(2) // 2x speed

// Manual time advancement (for testing)
useSimulationStore.getState().advanceGameTime(60) // Advance 60 minutes
```

## Drama Engine

The drama engine (`src/services/dramaEngine.ts`) is the central orchestrator that:

1. Maps NPC personality to drama styles
2. Generates posts based on relationship events
3. Processes reactions when NPCs see posts
4. Handles affair discovery mechanics

### Personality Mapping

NPC personalities (Big Five traits) map to drama styles:

| Drama Style | Personality Traits |
|-------------|-------------------|
| `dramatic` | High extraversion + high neuroticism |
| `petty` | Low agreeableness + high neuroticism |
| `mature` | High agreeableness + low neuroticism |
| `subtle` | Low extraversion OR high conscientiousness |
| `chaotic` | High openness + low conscientiousness |

### Event → Post Mapping

| Relationship Event | Who Posts | Post Type |
|--------------------|-----------|-----------|
| `relationship_started` | Both (if public) | `happy_relationship` |
| `relationship_ended` | Dumped NPC | `post_breakup` |
| `affair_discovered` | Discoverer | `vague_post` or `indirect_callout` |
| `caught_cheating` | Victim | `caught_cheating_victim` |
| `caught_cheating` | Cheater | `caught_cheating_guilty` |
| `jealousy_incident` | Jealous NPC | `jealousy` |
| High drama relationship | Either NPC | `vague_post` |

### Post Reaction Logic

When an NPC "checks" social media:

1. **Filter posts** - Get unseen posts for their session
2. **Mark as seen** - Update `seenBy` on each post
3. **Consider reaction** - Based on:
   - NPC's `reactsOften` trait
   - Whether post is drama-related
   - Relationship to post author
   - Whether they know secrets about the author
4. **React** - Either like (low engagement) or comment (high engagement)

### Affair Discovery

Affairs can be discovered through:

1. **Random slip-ups** - High drama relationships have discovery chance per tick
2. **Suspicious posts** - NPC sees partner's vague post + shady comments
3. **Gossip** - NPCs who know can reveal to others (via `revealSecretTo`)

Discovery chance formula:
```typescript
const discoveryChance = 0.01 + (affair.drama / 100) * 0.05
// 1% base + up to 5% bonus at max drama
```

## Social Store NPC Functions

### createNPCPost

Creates a post from an NPC's perspective.

```typescript
createNPCPost: (
  npcId: string,
  content: string,
  platform?: 'myface' | 'chirp' | 'instasnap',
  images?: string[]
) => Post | null
```

### addNPCComment

NPC adds a comment to any post.

```typescript
addNPCComment: (postId: string, npcId: string, content: string) => void
```

### addNPCLike / removeNPCLike

NPC likes or unlikes a post.

```typescript
addNPCLike: (postId: string, npcId: string) => void
removeNPCLike: (postId: string, npcId: string) => void
```

## Relationship Event Broadcasting

The relationship store now broadcasts events for the drama engine to consume.

### Subscribing to Events

```typescript
import { subscribeToRelationshipEvents } from './stores/npcRelationshipStore'

const unsubscribe = subscribeToRelationshipEvents((event, relationship) => {
  console.log('Event:', event.type, 'Relationship:', relationship.id)
})

// Later: unsubscribe()
```

### Events That Broadcast

- `startRelationship()` → `relationship_started`
- `endRelationship()` → `relationship_ended`
- `discoverAffair()` → `affair_discovered`
- `exposeAffair()` → `caught_cheating`

## Example Drama Flow

**Setup:** Sarah and Jake are dating publicly. Sarah has a secret affair with Marcus.

**Hour 1:** Game starts, simulation begins

**Hour 2:** Sarah's relationship metrics (affair has high happiness, high drama):
- Drama engine tick detects high happiness in affair
- 1% chance Sarah posts "feeling butterflies again 🦋"

**Hour 3:** Emily checks MyFace (she checks every 2 hours):
- Sees Sarah's post
- Emily knows about the affair (she's in `secretKnownBy`)
- `processPostReaction()` is called
- Emily has high `reactsOften`, post is drama-related, she knows secrets
- Emily comments "👀" (shady comment because she knows)

**Hour 6:** Jake finally checks MyFace (he checks every 4 hours):
- Sees Sarah's post AND Emily's comment
- `checkForSuspiciousActivity()` detects suspicious pattern
- 15% chance Jake discovers the affair
- If discovered: `affair_discovered` event fires
- Jake might post "some people are SNAKES 🐍"

**Hour 8:** Affairs have base 1% discovery chance per tick:
- High drama increases this to ~5-6%
- If discovered, the drama cascade begins

## Tuning Parameters

### Reaction Frequencies

In `dramaEngine.ts`:
```typescript
const baseReactionChance = reactsOften ? 0.3 : 0.1
const commentChance = reactsOften ? 0.4 : 0.2
```

### Spontaneous Post Rates

In `dramaEngine.tick()`:
```typescript
const spontaneousPostChance = 0.02 // High drama relationships
const happyPostChance = 0.01      // Happy relationships
```

### Discovery Rates

```typescript
const baseDiscoveryChance = 0.01
const dramaBonus = (affair.drama / 100) * 0.05
const suspiciousActivityDiscovery = 0.15
```

## UI Controls

### Settings > Developer Section

The simulation can be controlled from **Settings > Developer**:

- **Start/Stop/Pause buttons** - Control simulation state
- **Game time display** - Shows current in-game day and time
- **Speed control** - 0.5x, 1x, 2x, 4x, 8x speed options
- **Tick count** - Shows total ticks processed
- **Manual tick button** - Advance one tick for debugging

### Taskbar Indicator

The taskbar shows simulation status in the system tray:

- **Green dot** = Simulation running
- **Yellow dot** = Simulation paused
- **Gray dot** = Simulation stopped
- Hover shows "Simulation: Running/Paused/Stopped"

### Store Initialization

Stores are automatically initialized when the desktop loads:
- `useAwarenessStore.getState().initialize()` - Sets up NPC social habits
- `useSocialStore.getState().initialize()` - Loads NPC profiles and mock posts

## Testing

### Quick Start Guide

1. Open **Settings > Developer**
2. Click **Start Simulation**
3. Verify taskbar shows green indicator
4. Check browser console for `[Simulation] Game time: ...` logs
5. Open **Browser > MyFace**
6. Wait a few ticks (1 tick = 1 second at 1x speed)
7. Verify new NPC posts appear in the feed

### Manual Testing (Console)

```typescript
// Start simulation
useSimulationStore.getState().start()

// Or run single tick
useSimulationStore.getState().tick()

// Manually trigger drama post
import { dramaEngine } from './services/dramaEngine'
dramaEngine.generateDramaPost('sarah', 'vague_post', {})

// Manually trigger affair discovery
useNPCRelationshipStore.getState().discoverAffair(affairId, 'jake')
```

### Setup Pre-existing Drama

The `gameSetupStore` has a "Pre-existing Drama" mode that sets up:
- Sarah + Jake dating (public)
- Emily + Marcus talking (public)
- Sarah + Marcus talking (SECRET AFFAIR)

This creates immediate drama potential when the simulation starts.

## NPC Profiles

The following NPCs have both awareness habits and social profiles:

| NPC | Check Frequency | Platforms | Personality |
|-----|----------------|-----------|-------------|
| Sarah | Every hour | MyFace, Chirp, InstaSnap | Heavy scroller, reacts often |
| Jake | Every 4 hours | MyFace, Chirp | Casual user |
| Emily | Every 2 hours | MyFace, InstaSnap | Night owl, reacts often |
| Marcus | Every 6 hours | MyFace, Chirp | Late night (8pm-3am) |
| Luna | Every 3 hours | InstaSnap, MyFace | Heavy scroller, reacts often |
