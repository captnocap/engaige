# World Map System

## Overview

The World Map System is an isometric city viewer that shows NPCs moving through a living SimCity-style world. It provides a visual representation of where AI NPCs and background NPCs are at any given time, with game time running at accelerated speed.

## Core Concepts

### Two-Tier NPC System

| Type | Count | AI Cost | Interactions |
|------|-------|---------|--------------|
| **AI NPCs** | 30-50 | Full budget | Conversations, relationships, memories, posts |
| **Background NPCs** | 500 | Zero | Visual presence only, simple routines |

### Game Time

Game time runs at an accelerated 1:15 ratio by default:
- 1 real minute = 15 game minutes
- 1 real hour = 15 game hours (almost a full day)
- ~1.5 real hours = full 24-hour NPC cycle

Time controls allow pausing, resuming, and adjusting speed (1x to 60x).

### The Experience

- **Zoomed out**: Bustling city with hundreds of moving dots
- **Zoomed in**: AI NPCs highlighted (blue), distinguishable from background (gray)
- **Hover AI NPC**: Rich profile card with status, activity, location, avatar
- **Hover Background NPC**: Simple tooltip ("Sarah, walking to work")
- **Click AI NPC**: Opens profile or messages window

## Architecture

### Backend Services

```
server/src/services/world/
├── world-state.ts       # City data & game time management
├── npc-location.ts      # AI NPC position tracking
├── npc-scheduler.ts     # Schedule-based NPC movement
├── background-npcs.ts   # Seeded background NPC generation
├── city-generator.ts    # One-time city data generation
└── index.ts             # Exports
```

### Frontend Components

```
src/components/world/
├── WorldWindow.tsx      # Desktop window wrapper
├── WorldViewer.tsx      # Main PixiJS viewer
├── WorldControls.tsx    # Time display & controls
├── NPCPopover.tsx       # Hover cards for NPCs
├── index.ts             # Exports
└── utils/
    └── isometric.ts     # Coordinate conversion utilities
```

### Data Files

```
server/data/world/
├── pinewood.json        # Generated city data (static)
└── name-mappings.json   # Portland → Pinewood name translations
```

## Database Schema

New tables added to `game.db`:

### districts
Cached city district data loaded from static JSON.
- `id`: District identifier
- `name`: Display name
- `type`: District category (downtown, arts, residential, etc.)
- `bounds`: GeoJSON polygon
- `color`: Hex color for rendering
- `peak_hours`: JSON array of busy hours
- `vibe`: Description

### buildings
Cached building data.
- `id`: Building identifier
- `name`: Building name
- `type`: Building category (cafe, office, apartment, etc.)
- `district_id`: Parent district
- `position`: JSON {x, y} grid coordinates
- `capacity`: Max NPCs inside
- `is_residential`: Boolean
- `is_workplace`: Boolean
- `hours`: JSON business hours

### landmarks
Notable locations for AI content generation.
- `id`: Landmark identifier
- `name`: Display name (e.g., "Chapter House Books")
- `building_id`: Associated building
- `description`: For AI context
- `keywords`: Tags for content generation
- `icon_emoji`: Display icon

### npc_locations
Runtime AI NPC position tracking.
- `npc_id`: NPC identifier
- `position`: JSON {x, y} grid coordinates
- `target_position`: Movement destination
- `building_id`: Current building
- `activity`: Activity state
- `activity_description`: Human-readable activity

### npc_schedules
Daily routines for AI NPCs.
- `npc_id`: NPC identifier
- `day_of_week`: 0-6 or NULL for every day
- `hour`: 0-23
- `building_id`: Where to go
- `activity`: What they do there

### game_time_state
Singleton table for game time persistence.
- `game_start_real_time`: Real world start timestamp
- `game_start_time`: Game world start timestamp
- `time_multiplier`: Speed factor (default 15)
- `is_paused`: Pause state

## WebSocket Protocol

### Client → Server Messages

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `world:getState` | - | Get full world snapshot |
| `world:subscribe` | - | Subscribe to updates |
| `world:unsubscribe` | - | Unsubscribe |
| `world:getBackgroundNPCs` | `{minX, maxX, minY, maxY}` | Get NPCs in viewport |
| `world:pauseTime` | - | Pause game time |
| `world:resumeTime` | - | Resume game time |
| `world:setTimeMultiplier` | `{multiplier: number}` | Set time speed (1-60) |

### Server → Client Messages

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `world:state` | Full world data | Initial state snapshot |
| `world:timeUpdate` | `{gameTime, formattedTime}` | Time tick updates |
| `world:npcMoved` | `{npcId, position, activity}` | NPC movement update |
| `world:backgroundNPCs` | `{npcs: [], viewportBounds}` | Background NPCs batch |

## City Generation

The city "Pinewood" is generated from Portland, OR structure:

### Districts (9)

| ID | Name | Type | Vibe |
|----|------|------|------|
| downtown | Central Pinewood | downtown | Professional, fast-paced |
| arts | Artisan Quarter | arts | Creative, bohemian |
| university | Campus District | university | Academic, youthful |
| nightlife | Neon Row | nightlife | Energetic, party |
| waterfront | Riverside | waterfront | Relaxed, scenic |
| residential-north | Maple Heights | residential | Quiet, family-friendly |
| residential-south | Southwood | residential | Established, peaceful |
| shopping | Commerce Corner | shopping | Busy, commercial |
| industrial | Eastside Works | industrial | Working class, gritty |

### Landmarks (10)

Notable locations NPCs can reference in posts/conversations:

- **Chapter House Books** - Legendary bookstore in Artisan Quarter
- **Pioneer Plaza** - Central gathering place downtown
- **Hex Donuts** - Quirky 24-hour donut shop in Neon Row
- **Pinewood Art Museum** - Premier art museum
- **Riverside Market** - Weekend farmers market
- **Thornwood Arena** - Sports/concert venue
- **Discovery Center** - Interactive science museum
- **Pinewood State University** - Main university campus
- **Treeline Coffee Roasters** - Third-wave coffee spot
- **The Basement** - Underground music venue

## Isometric Coordinates

### Grid to Screen
```typescript
function gridToIso(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: (gridX - gridY) * (TILE_WIDTH / 2),
    y: (gridX + gridY) * (TILE_HEIGHT / 2),
  };
}
```

### Z-Ordering
Objects further down and to the right render on top:
```typescript
function calculateZOrder(gridX: number, gridY: number, zOffset: number = 0): number {
  return gridX + gridY + zOffset;
}
```

## NPC Movement

### AI NPCs

AI NPCs have personalized schedules based on personality:
- **office_worker**: 9-5 work, gym, evening social
- **creative**: Late starts, cafe working, evening events
- **student**: Classes, study sessions, social life
- **night_owl**: Late schedule, works evenings
- **homebody**: Mostly at home, occasional errands
- **social_butterfly**: Constantly out meeting people

### Background NPCs

Generated deterministically from seeds:
- Consistent appearance across sessions
- Simple state machine: `home → commute → work → lunch → work → commute → home`
- Time-of-day drives crowd density per district
- No database persistence (regenerated on demand)

## Location-Aware Content

NPCs now have location context injected into their prompts:

```
## Your Current Location
You are currently at Treeline Coffee Roasters in the Artisan Quarter district.
This is a notable location: The city's most beloved coffee roaster.
You are getting coffee.

Feel free to naturally mention where you are if it's relevant to the conversation.
```

This allows NPCs to:
- Reference where they are in messages
- Mention landmarks in posts
- Create posts tagged with locations

## Store (Frontend)

The `worldStore.ts` Zustand store manages:

- City data (districts, buildings, landmarks)
- Game time state
- AI NPC locations
- Background NPCs in viewport
- Camera/viewport state (x, y, zoom)
- Hover/selection state

Key actions:
- `loadWorldState()` - Initial world load
- `subscribeToUpdates()` - Real-time updates
- `requestBackgroundNPCs(bounds)` - Fetch visible background NPCs
- `pauseTime() / resumeTime()` - Time controls
- `setSpeed(multiplier)` - Time speed

## Usage

### Opening the World Map

Double-click the "World Map" (🗺️) icon on desktop, or it can be opened programmatically.

### Navigation

- **Drag**: Pan the view
- **Scroll**: Zoom in/out
- **Hover NPCs**: See info popover
- **Click AI NPC**: Open profile/messages

### Time Controls

- **Play/Pause**: Toggle time progression
- **Speed dropdown**: 5x, 15x, 30x, 60x

## Future Enhancements

### NPC Promotion System

Background NPCs can be "promoted" to full AI NPCs:
1. Player hovers on interesting background NPC
2. Clicks "Learn more..."
3. System generates full AI personality
4. NPC becomes interactable

### 3D Renderer

The rendering layer is decoupled:
```
WorldState (positions, NPCs, buildings)
        ↓
  RenderAdapter (interface)
        ↓
┌───────┴───────┐
FlatRenderer    3DRenderer (future)
(current)       (low-poly isometric)
```

### Enhanced Visuals

- Animated sprites for NPCs
- Building detail at high zoom
- Weather effects
- Day/night lighting
- Animated wallpaper backgrounds

## Files Reference

### Backend

| File | Purpose |
|------|---------|
| `server/src/services/world/world-state.ts` | City data & game time |
| `server/src/services/world/npc-location.ts` | AI NPC positions |
| `server/src/services/world/npc-scheduler.ts` | Schedule management |
| `server/src/services/world/background-npcs.ts` | Background NPC generation |
| `server/src/services/world/city-generator.ts` | City data generation |
| `server/src/services/context-builder.ts` | Location context injection |
| `server/src/network/ws-protocol.ts` | World message types |
| `server/src/network/ws-server.ts` | World message handlers |
| `server/src/db/index.ts` | Database schema |
| `server/src/types/world.ts` | TypeScript types |
| `server/data/world/pinewood.json` | Static city data |

### Frontend

| File | Purpose |
|------|---------|
| `src/components/world/WorldWindow.tsx` | Desktop wrapper |
| `src/components/world/WorldViewer.tsx` | PixiJS viewer |
| `src/components/world/WorldControls.tsx` | UI controls |
| `src/components/world/NPCPopover.tsx` | Hover cards |
| `src/components/world/utils/isometric.ts` | Coordinate math |
| `src/stores/worldStore.ts` | World state store |
| `src/components/desktop/Desktop.tsx` | Window registration |

## Dependencies

### npm packages
- `pixi.js@8.15.0` - WebGL rendering
- `@pixi/react@8.0.5` - React integration (optional, using vanilla PixiJS)
