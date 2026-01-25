# World Map Visual Simulation Guide

**Simulating the User Experience for engAIge World Map**

This document describes the visual and interactive experience players should have when exploring the game world map. Based on analysis of SimCity-style city simulators, this guide focuses on **feel** and **player experience** rather than technical implementation.

---

## Core Visual Experience

### The Player's Viewpoint

**Perspective: Isometric-style 3D**
- Camera orbits around a central point (the "focus")
- Player can rotate 360° around the map
- Camera elevation locked between 30° and 90° (never below horizon)
- Smooth zoom from close-up (individual NPCs) to bird's-eye (entire district)

**Camera Controls:**
- **Left Mouse Drag** → Rotate view around map
- **Right Mouse Drag** → Zoom in/out
- **Middle Mouse Drag** → Pan focus point (slide map left/right/forward/back)
- **Scroll Wheel** → Alternative zoom method

### Visual Layers

The map renders in multiple layers from bottom to top:

1. **Terrain Grid** - Base ground tiles (grass, water, pavement)
2. **Roads & Infrastructure** - Connecting pathways between locations
3. **Buildings** - Residential, commercial, venues, landmarks
4. **NPCs** - Small figures/icons representing characters at locations
5. **Effects** - Lighting, shadows, particles (rain, snow, ambient effects)
6. **ASCII Overlay** (Optional) - Retro text overlay for navigation

---

## Map Topology

### Scale & Density

**Small Town Feel (16x16 to 24x24 grid)**
- Each tile = ~50m × 50m conceptually
- Total map = ~800m × 800m (walkable small town)
- 50-100 total buildings/locations
- Dense urban core, sparse residential outskirts

**Location Types:**

| Type | Symbol | Color | Examples |
|------|--------|-------|----------|
| Residential | `R` | Green/Tan | Apartments, houses, NPC homes |
| Commercial | `C` | Blue | Shops, restaurants, offices |
| Entertainment | `E` | Magenta | The Underground, VidTube studio, theaters |
| Landmarks | `L` | Gold | Hartwell Building, Quantum Coffee, Overlook Park |
| Roads | `─│┼` | Gray | Connecting pathways |
| Parks | `P` | Dark Green | Green spaces, plazas |

### Named Districts

**Example Layout:**
```
┌─────────────────────────────────┐
│   RESIDENTIAL HILLS             │  (Quiet, houses, Derek lives here)
│   R  R     R  R    R            │
│      R  R     R       R         │
├─────────────────────────────────┤
│   DOWNTOWN                      │  (Commercial core, Hartwell Building)
│   C══C══L══C══C                │
│   ║  ║  ║  ║  ║                │  (Roads = ║ ══)
│   C══E══C══C══E                │  (E = The Underground, bars)
├─────────────────────────────────┤
│   TECH PARK                     │  (Offices, startups, VidTube HQ)
│   C  C     C  C    L            │
│      C  C     C       C         │
└─────────────────────────────────┘
```

---

## Dynamic Elements

### NPCs on the Map

**Visual Representation:**
- **3D Mode:** Small humanoid figures, simple meshes (capsules/spheres)
- **ASCII Mode:** Single characters (`@` for player's view, `n` for NPCs)

**NPC Behavior:**
- NPCs appear at their current location (home, work, venue)
- Smooth animation when moving between locations
- Highlight on hover (name tooltip, relationship indicator)
- Click to open character profile/messaging

**Example Scenario:**
```
Player hovers over The Underground building:
┌────────────────────────────────┐
│ The Underground                │
│ Live Music Venue               │
│ ─────────────────────────────  │
│ Currently here:                │
│ • Mars (Owner) ⭐              │
│ • Trust Fall Tim 🤸            │
│ • Derek (Quantum Coffee enthusiast) ☕ │
│ • 12 other patrons             │
└────────────────────────────────┘
```

### Time of Day

**Visual Progression:**
- **Dawn (6am-9am):** Soft orange lighting, long shadows
- **Day (9am-6pm):** Bright white sun, short shadows
- **Dusk (6pm-9pm):** Purple/pink gradient, lengthening shadows
- **Night (9pm-6am):** Blue moonlight, warm glowing windows

**NPC Activity Patterns:**
```
Morning:   Most NPCs at home → transitioning to work
Afternoon: NPCs at work locations, some at cafes
Evening:   NPCs at bars, restaurants, events
Night:     Most NPCs at home (except night owls)
```

### Weather Effects

**Seasonal Atmosphere:**
- **Spring:** Light rain, green tint, cherry blossoms (particle effects)
- **Summer:** Bright, clear, heat haze shimmer
- **Fall:** Orange leaves falling, overcast, cooler tones
- **Winter:** Snow, white ground, icicles on buildings

**Weather impacts mood:**
- Rain → Cozy indoor venues busier (NPCs at coffee shops)
- Snow → Outdoor parks empty, residential lights on
- Sunny → Parks full, outdoor events

---

## Interaction Modes

### Selection & Inspection

**Click on Building:**
```
┌────────────────────────────────┐
│ HARTWELL BUILDING              │
│ ─────────────────────────────  │
│ Type: Landmark (Mixed-Use)     │
│ Floors: 12 (no 13th!)          │
│ Lore: Built 1923, mysterious   │
│ 7th floor mirrors, Omnicorp    │
│ ─────────────────────────────  │
│ Current Occupants:             │
│ • Floor 7: Law Offices         │
│ • Floor 12: Penthouse (Empty?) │
│ ─────────────────────────────  │
│ [Visit] [Read Lore] [Close]    │
└────────────────────────────────┘
```

**Click on NPC:**
```
┌────────────────────────────────┐
│ Derek                          │
│ Age: 29 • Relationship: Friend │
│ ─────────────────────────────  │
│ Currently: Quantum Coffee      │
│ (Conducting "research" on 847th trial) │
│ ─────────────────────────────  │
│ Recent Activity:               │
│ • Posted about Martinez Study  │
│ • Messaged you 2 hours ago     │
│ ─────────────────────────────  │
│ [Message] [View Profile] [Close] │
└────────────────────────────────┘
```

### Travel & Fast Travel

**Double-click Building:**
- Smooth camera animation to that location
- Zoom in slightly, center on building
- Info panel opens automatically

**Fast Travel Menu:**
```
[FAST TRAVEL]
• Home (Your Apartment)
• Work (Office Building)
• Favorites:
  - Quantum Coffee (Derek's haunt)
  - The Underground (Mars's venue)
  - Overlook Park (scenic spot)
```

### Search & Filter

**Toolbar Options:**
- 🔍 **Search** - "Find: Quantum Coffee"
- 👤 **People** - Show only NPCs
- 🏢 **Places** - Show only buildings
- 📰 **Events** - Highlight locations with active events
- 🗺️ **Toggle ASCII** - Switch between 3D and text view

---

## World Map Aesthetics

### Art Style Options

**Option A: Low-Poly 3D**
- Simple geometric buildings (cubes, prisms)
- Flat-shaded materials, minimal textures
- Vibrant colors per building type
- Soft shadows, ambient occlusion
- **Vibe:** Indie game, stylized, accessible

**Option B: Voxel Style**
- Minecraft-inspired blocky buildings
- Textured facades (brick, concrete, glass)
- Sharp shadows, pixelated aesthetic
- **Vibe:** Retro-modern, nostalgic, quirky

**Option C: Hybrid ASCII/3D**
- 3D buildings as background layer
- ASCII characters overlaid on top
- Toggle between pure ASCII and pure 3D
- **Vibe:** Hacker aesthetic, unique, accessible to low-end hardware

### Color Palette

**Daytime:**
- Sky: `#87CEEB` (Light blue)
- Grass: `#7CFC00` (Lawn green)
- Roads: `#696969` (Dim gray)
- Buildings: Varied per type

**Nighttime:**
- Sky: `#191970` (Midnight blue)
- Ground: Desaturated, darker tones
- Windows: `#FFD700` (Warm yellow glow)
- Street lights: `#FFA500` (Orange pools)

### Lighting Moods

**The Underground at Night:**
- Neon sign glow (pink/purple)
- Spotlight on entrance
- Crowd silhouettes in windows
- Bass visualization (pulsing lights)

**Quantum Coffee Morning:**
- Warm interior lighting through windows
- Steam particles from rooftop vent
- Derek visible through window, gesturing wildly

**Hartwell Building Dusk:**
- Ominous shadow cast over adjacent buildings
- 7th floor mirrors reflecting sky
- Top floor dark (mystery)

---

## Player Experience Flow

### First-Time Map View

**Tutorial Sequence:**
1. Camera starts zoomed out, showing entire town
2. Highlight player's apartment: "This is your home"
3. Zoom to Derek's location: "Your friend Derek is here"
4. Pan to The Underground: "Events happen here"
5. Show camera controls overlay
6. Unlock free exploration

### Daily Routine View

**Morning (Player wakes up):**
- Camera at player's apartment
- Notification: "Derek messaged you"
- Icon over Quantum Coffee (Derek's location)
- Player clicks to zoom there

**Evening (Event notification):**
- "Live music tonight at The Underground!"
- Building pulses/glows on map
- Click to see event details
- Option to "attend" (triggers story sequence)

### Event-Driven Camera

**NPC Posts Photo:**
- "Mars posted from Overlook Park"
- Camera auto-pans to that location
- Highlight Mars's position
- Player can click to view post

**Breaking News:**
- "Mysterious activity at Hartwell Building"
- Camera dramatically zooms to Hartwell
- Ominous lighting effect
- Player prompted to investigate (optional)

---

## Map-Based Storytelling

### Location-Based Lore

**Clicking on empty park bench:**
```
┌────────────────────────────────┐
│ Overlook Park - North Bench    │
│ ─────────────────────────────  │
│ A weathered brass plaque reads:│
│ "In memory of Small Kevin,     │
│  who totally caught Trust Fall │
│  Tim that one time."           │
│ ─────────────────────────────  │
│ [Read More Lore]               │
└────────────────────────────────┘
```

**Hovering over 13th floor gap (Hartwell):**
```
There is no 13th floor.
(But the elevator buttons skip from 12 to 14...)
```

### NPC Movement Tells Story

**Derek's Daily Path:**
```
7am:  Home (Residential)
8am:  → Walking to work
9am:  Office (Tech Park)
12pm: → Quantum Coffee (lunch + "research")
1pm:  → Back to office
5pm:  → Quantum Coffee (after-work trial #847)
7pm:  → Home (defeated by caffeine science)
```

**Player notices pattern:**
- "Derek goes to Quantum Coffee twice daily"
- Build relationship → Derek invites you
- Unlock Quantum Coffee lore/storyline

### Seasonal Events

**Halloween:**
- Spooky decorations on buildings
- NPCs in costumes
- Hartwell Building extra ominous (flickering lights)
- Special "ghost tour" event unlocked

**New Year's Eve:**
- Fireworks particle effects
- NPCs gather at Downtown plaza
- Countdown timer on map
- Mass message from all contacts at midnight

---

## Technical Visual Specs

### Performance Targets

**Low-End Mode (ASCII primarily):**
- 60fps on integrated graphics
- Pure text rendering, minimal 3D
- NPCs as text characters `@`

**Mid-Range Mode (Low-poly 3D):**
- 60fps on GTX 1060 equivalent
- Simple meshes, flat shading
- Dynamic shadows (medium quality)

**High-End Mode (Full effects):**
- 60fps on RTX 2060+ equivalent
- Textured buildings, ambient occlusion
- Particle effects (rain, snow, lights)
- Advanced shadows (PCF soft shadows)

### Accessibility

**Visual Options:**
- **High Contrast Mode** - Bright outlines, bold colors
- **Colorblind Modes** - Deuteranopia, Protanopia, Tritanopia palettes
- **ASCII Toggle** - Pure text for screen readers
- **Zoom Limits** - Prevent motion sickness (clamp camera movement)
- **Reduced Motion** - Disable camera swoops, use cuts instead

---

## Implementation Priority

### MVP (Minimum Viable Product)

**Phase 1: Static Map**
- [x] 16x16 tile grid
- [x] Simple ground plane
- [ ] ~10 buildings (placeholder cubes)
- [ ] Camera orbit controls
- [ ] Click to select building

**Phase 2: NPC Integration**
- [ ] NPC icons appear at locations
- [ ] Hover to see NPC name
- [ ] Click to open character profile
- [ ] NPCs teleport (no walking animation yet)

**Phase 3: Visual Polish**
- [ ] Building textures
- [ ] Day/night cycle
- [ ] Shadow system
- [ ] Smooth NPC movement

### Future Enhancements

**Advanced Features:**
- Weather effects (rain, snow)
- Seasonal changes (autumn leaves, snow cover)
- Event lighting (neon signs, concert lights)
- Crowd simulation (groups of background NPCs)
- Procedural building interiors (visible through windows)

---

## User Experience Principles

### Guiding Principles

1. **Clarity** - Always clear where NPCs are, what buildings are
2. **Discoverability** - Hovering/clicking reveals secrets and lore
3. **Responsiveness** - Camera controls feel smooth, instant feedback
4. **Atmosphere** - Lighting/weather create mood and immersion
5. **Purpose** - Map isn't just pretty, it's a storytelling tool

### Player Mental Model

**"The map is a living social network"**
- NPCs aren't just dots, they're friends/characters
- Buildings aren't just geometry, they're story locations
- Movement isn't just animation, it's narrative
- Time of day isn't just lighting, it's context

**Player Questions Map Answers:**
- "Where is Derek?" → Icon over Quantum Coffee
- "What's The Underground?" → Click to see venue info
- "Why is Hartwell weird?" → Hover lore reveals mystery
- "What's happening tonight?" → Pulsing icons show events

---

## Summary: The World Map Feel

**What it feels like to play:**

1. **Open the map** - Smooth zoom out from current location to bird's-eye view
2. **See friends** - Derek at Quantum Coffee, Mars at The Underground, scattered NPCs
3. **Notice event** - The Underground pulsing (live music tonight)
4. **Zoom in** - Camera glides to The Underground, details emerge
5. **Read details** - "Trust Fall Tim performing 8pm, Derek attending"
6. **Decide** - Click "Message Derek" or "Attend Event"
7. **Watch** - Derek's icon smoothly moves from coffee shop to venue
8. **Explore** - Drag map around, discover Hartwell mystery, read lore
9. **Return** - Double-click home, camera flies back

**Mood: Cozy exploration meets social connection**

The map isn't a tactical view (like RTS games), it's a **social space visualizer**. Every building holds story potential. Every NPC movement tells you something about their day. The world feels alive, small enough to know intimately, detailed enough to keep discovering secrets.

---

**Design Goal:** Players should feel like they're peering into a living miniature town where their NPC friends live real lives, not just game pieces on a board.
