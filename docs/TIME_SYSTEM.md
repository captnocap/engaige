# Time System Specification

> **Status:** Specification Phase
> **Priority:** High - Core system that affects all time-based game mechanics
> **Dependencies:** Background Scheduler, Event Bus, Settings Store

## Overview

The Time System establishes a configurable world clock that governs all time-based mechanics in engAIge. Players can choose between real-time simulation or accelerated time scales, allowing them to experience days or weeks of in-game time within hours of real play.

**Core Principle:** The world runs on "game time" while UI interactions remain in "real time" for natural feel.

---

## Table of Contents

1. [Concepts & Terminology](#concepts--terminology)
2. [Time Scale Options](#time-scale-options)
3. [What Uses Game Time vs Real Time](#what-uses-game-time-vs-real-time)
4. [Data Structures](#data-structures)
5. [Core Functions](#core-functions)
6. [Backend Integration](#backend-integration)
7. [Frontend Integration](#frontend-integration)
8. [Persistence & State](#persistence--state)
9. [Edge Cases](#edge-cases)
10. [WebSocket API](#websocket-api)
11. [Configuration During Onboarding](#configuration-during-onboarding)
12. [Future Considerations](#future-considerations)

---

## Concepts & Terminology

| Term | Definition |
|------|------------|
| **Real Time** | Actual wall-clock time (Date.now()) |
| **Game Time** | Simulated in-world time, scaled by time multiplier |
| **Time Scale** | Multiplier for how fast game time passes (1 = real-time, 4 = 4x faster) |
| **Game Epoch** | The real timestamp when the current game session started |
| **Time Anchor** | A sync point where game time and real time are aligned |
| **Active Hours** | Hours of the game day when an NPC is "awake" (e.g., 8am-11pm) |

### The Time Equation

```
gameTimeElapsed = realTimeElapsed × timeScale
currentGameTime = timeAnchorGameTime + (realNow - timeAnchorRealTime) × timeScale
```

---

## Time Scale Options

### Preset Options

| Scale | Name | Description | Use Case |
|-------|------|-------------|----------|
| `1` | Real-Time | 1 real hour = 1 game hour | Immersive, patient play |
| `2` | Gentle | 1 real hour = 2 game hours | Slight acceleration |
| `4` | **Standard** | 1 real hour = 4 game hours | **Recommended default** |
| `8` | Fast | 1 real hour = 8 game hours | Active play sessions |
| `24` | Day-per-Hour | 1 real hour = 1 game day | Testing, rapid progression |
| `168` | Week-per-Hour | 1 real hour = 1 game week | Debug/testing only |

### Custom Scale

Players can set any value from `0.5` (half-speed) to `168` (week-per-hour).

**Why 4x is Recommended:**
- A 4-hour play session covers a full game day
- NPCs post every 30-90 real minutes (feels active but not spammy)
- Relationships progress noticeably within a session
- Still slow enough to feel "lived in"

---

## What Uses Game Time vs Real Time

### Uses Game Time (Scaled)

These systems consult the game clock and scale accordingly:

| System | Real-Time Behavior | At 4x Scale |
|--------|-------------------|-------------|
| **NPC Posting** | Post every 2-6 hours | Post every 30-90 min |
| **NPC Active Hours** | Awake 8am-11pm game time | Cycles through in 3.75 real hours |
| **Relationship Decay** | -1 point per day of silence | -1 point per 6 real hours |
| **News Feed Refresh** | New articles every 6 hours | New articles every 90 min |
| **Scheduled Events** | Birthdays, holidays on game dates | Occur 4x faster |
| **NPC-to-NPC Chat** | Check every 4 hours | Check every hour |
| **Memory Expiration** | Memories with TTL in game-days | Expire 4x faster |
| **Story Generation** | Generate every 6 hours | Generate every 90 min |
| **Budget Period** | Daily budget = 24 game hours | Resets every 6 real hours |

### Uses Real Time (Not Scaled)

These systems use wall-clock time for natural UX feel:

| System | Reason |
|--------|--------|
| **Typing Indicators** | "Alex is typing..." should feel realistic |
| **Message Delivery Delay** | 2-10 second delays feel natural regardless of scale |
| **Read Receipts** | Should reflect actual viewing time |
| **UI Animations** | Transitions, hover effects |
| **Session Duration** | How long player has been playing |
| **API Rate Limits** | Real-world rate limits don't scale |
| **Budget Spending Tracking** | Real cost accrual |
| **Auto-Save** | Save every N real minutes |

### Hybrid (Configurable)

Some systems could go either way based on player preference:

| System | Default | Option |
|--------|---------|--------|
| **Notification Cooldown** | Real time | Could batch by game-time periods |
| **"Last Seen" Display** | Game time | Could show real time |

---

## Data Structures

### TimeConfig (Per-Account Setting)

```typescript
interface TimeConfig {
  // Core settings
  scale: number;                    // 1-168, multiplier

  // Sync point (updated on pause/resume/load)
  anchor: {
    realTime: number;               // Real timestamp (ms since epoch)
    gameTime: number;               // Game timestamp at that moment
  };

  // Behavioral options
  pauseWhenMinimized: boolean;      // Pause world time when app loses focus
  pauseWhenIdle: boolean;           // Pause after N minutes of no interaction
  idleThresholdMinutes: number;     // Minutes before idle pause (default: 30)

  // Display preferences
  use24HourFormat: boolean;         // 14:30 vs 2:30 PM
  showRealTimeInUI: boolean;        // Show real clock alongside game clock

  // State
  isPaused: boolean;                // Manually paused by player
  pausedAt: number | null;          // When pause started (real time)
}
```

### TimeState (Runtime State)

```typescript
interface TimeState {
  config: TimeConfig;

  // Computed (updated frequently)
  currentGameTime: Date;            // Current game time
  gameTimeMs: number;               // As milliseconds since epoch

  // Derived display values
  gameHour: number;                 // 0-23
  gameMinute: number;               // 0-59
  gameDayOfWeek: string;            // "Monday", "Tuesday", etc.
  gameDate: string;                 // "January 15, 2026"
  isNightTime: boolean;             // 10pm-6am game time

  // Session stats
  sessionStartReal: number;         // When this session started (real)
  sessionStartGame: number;         // Game time at session start
  realTimePlayedMs: number;         // Real time in this session
  gameTimePassedMs: number;         // Game time passed this session
}
```

### NPCActiveHours (Existing, Interacts with Time)

```typescript
interface NPCActiveHours {
  start: number;                    // Hour (0-23) when NPC "wakes up"
  end: number;                      // Hour (0-23) when NPC "sleeps"
  timezone_offset?: number;         // Optional: NPC in different timezone
}
```

---

## Core Functions

### Time Calculation

```typescript
// server/src/services/time.ts

/**
 * Get current game time based on config and real time
 */
export function getGameTime(config: TimeConfig): Date {
  if (config.isPaused && config.pausedAt) {
    // Return the frozen time when paused
    const elapsedBeforePause = config.pausedAt - config.anchor.realTime;
    const gameElapsed = elapsedBeforePause * config.scale;
    return new Date(config.anchor.gameTime + gameElapsed);
  }

  const realElapsed = Date.now() - config.anchor.realTime;
  const gameElapsed = realElapsed * config.scale;
  return new Date(config.anchor.gameTime + gameElapsed);
}

/**
 * Get current game time as Unix timestamp (ms)
 */
export function getGameTimeMs(config: TimeConfig): number {
  return getGameTime(config).getTime();
}

/**
 * Convert a real-time duration to game-time duration
 */
export function realToGameDuration(realMs: number, scale: number): number {
  return realMs * scale;
}

/**
 * Convert a game-time duration to real-time duration
 */
export function gameToRealDuration(gameMs: number, scale: number): number {
  return gameMs / scale;
}

/**
 * Calculate real delay for scheduling something N game-hours from now
 */
export function scheduleInGameHours(gameHours: number, scale: number): number {
  const gameMs = gameHours * 60 * 60 * 1000;
  return gameMs / scale; // Real ms to wait
}

/**
 * Calculate real delay for scheduling something N game-minutes from now
 */
export function scheduleInGameMinutes(gameMinutes: number, scale: number): number {
  const gameMs = gameMinutes * 60 * 1000;
  return gameMs / scale;
}

/**
 * Check if a game-time hour falls within NPC active hours
 */
export function isWithinActiveHours(
  gameHour: number,
  activeHours: { start: number; end: number }
): boolean {
  const { start, end } = activeHours;

  if (start <= end) {
    // Normal range: e.g., 8am to 11pm
    return gameHour >= start && gameHour < end;
  } else {
    // Overnight range: e.g., 10pm to 6am
    return gameHour >= start || gameHour < end;
  }
}

/**
 * Get next wake time for an NPC (in real ms from now)
 */
export function getNextWakeTime(
  config: TimeConfig,
  activeHours: { start: number; end: number }
): number {
  const gameTime = getGameTime(config);
  const currentHour = gameTime.getHours();

  if (isWithinActiveHours(currentHour, activeHours)) {
    return 0; // Already awake
  }

  // Calculate hours until wake
  let hoursUntilWake: number;
  if (currentHour < activeHours.start) {
    hoursUntilWake = activeHours.start - currentHour;
  } else {
    hoursUntilWake = (24 - currentHour) + activeHours.start;
  }

  return scheduleInGameHours(hoursUntilWake, config.scale);
}
```

### Time Management

```typescript
/**
 * Pause game time
 */
export function pauseTime(config: TimeConfig): TimeConfig {
  if (config.isPaused) return config;

  return {
    ...config,
    isPaused: true,
    pausedAt: Date.now()
  };
}

/**
 * Resume game time
 */
export function resumeTime(config: TimeConfig): TimeConfig {
  if (!config.isPaused || !config.pausedAt) return config;

  // Create new anchor at current state
  const gameTimeAtPause = getGameTime(config);

  return {
    ...config,
    isPaused: false,
    pausedAt: null,
    anchor: {
      realTime: Date.now(),
      gameTime: gameTimeAtPause.getTime()
    }
  };
}

/**
 * Change time scale (preserves current game time)
 */
export function setTimeScale(config: TimeConfig, newScale: number): TimeConfig {
  const currentGameTime = getGameTime(config);

  return {
    ...config,
    scale: Math.max(0.5, Math.min(168, newScale)),
    anchor: {
      realTime: Date.now(),
      gameTime: currentGameTime.getTime()
    }
  };
}

/**
 * Initialize time config for new account
 */
export function createTimeConfig(scale: number = 4): TimeConfig {
  const now = Date.now();

  return {
    scale,
    anchor: {
      realTime: now,
      gameTime: now  // Game starts at "now"
    },
    pauseWhenMinimized: true,
    pauseWhenIdle: false,
    idleThresholdMinutes: 30,
    use24HourFormat: false,
    showRealTimeInUI: false,
    isPaused: false,
    pausedAt: null
  };
}
```

---

## Backend Integration

### Background Scheduler Updates

The scheduler must use game time for interval calculations:

```typescript
// server/src/services/background-scheduler.ts

import { getTimeConfig, scheduleInGameHours } from './time.js';

// Instead of: scheduleTask('npc:post', npcId, 2 * 60 * 60 * 1000)
// Use:
function scheduleNPCPost(npcId: string) {
  const config = getTimeConfig();
  const gameHoursDelay = 2 + Math.random() * 4; // 2-6 game hours
  const realMsDelay = scheduleInGameHours(gameHoursDelay, config.scale);

  scheduleTask('npc:post', { npcId }, realMsDelay);
}
```

### Event Timestamps

Events should record both real and game time:

```typescript
// Enhanced event emission
eventBus.fire(EventTypes.NPC_POST_CREATED, {
  post_id: postId,
  npc_id: npcId,
  content: content,
  // Timestamps
  real_timestamp: Date.now(),
  game_timestamp: getGameTimeMs(timeConfig)
}, context);
```

### NPC Active Hours Check

```typescript
// server/src/services/npc.ts

export function isNPCActive(npc: NPC): boolean {
  const config = getTimeConfig();
  const gameTime = getGameTime(config);
  const gameHour = gameTime.getHours();

  return isWithinActiveHours(gameHour, npc.active_hours);
}

export function getNPCResponseDelay(npc: NPC): number {
  if (!isNPCActive(npc)) {
    // NPC is "asleep" - schedule for when they wake up
    return getNextWakeTime(getTimeConfig(), npc.active_hours);
  }

  // Normal response delay (real time for UX)
  const baseDelay = calculateTypingDelay(npc, messageLength);
  return baseDelay; // Real milliseconds, not scaled
}
```

### Budget Period Alignment

Budget periods can align to game time:

```typescript
// Option 1: Real-time budgets (simpler, recommended)
// Daily budget = 24 real hours
// Not affected by time scale

// Option 2: Game-time budgets (more immersive)
// Daily budget = 24 game hours
// At 4x scale, resets every 6 real hours

interface BudgetConfig {
  period_type: 'daily' | 'weekly' | 'monthly';
  use_game_time: boolean;  // If true, periods are in game time
  overall_limit_cents: number;
}
```

---

## Frontend Integration

### Time Display Component

```tsx
// src/components/ui/GameClock.tsx

import { useTimeStore } from '../../stores/timeStore';

export function GameClock() {
  const {
    currentGameTime,
    config,
    isNightTime,
    gameDayOfWeek
  } = useTimeStore();

  const formattedTime = config.use24HourFormat
    ? format(currentGameTime, 'HH:mm')
    : format(currentGameTime, 'h:mm a');

  const formattedDate = format(currentGameTime, 'MMM d');

  return (
    <div className="game-clock">
      <span className={`time ${isNightTime ? 'night' : 'day'}`}>
        {formattedTime}
      </span>
      <span className="date">{gameDayOfWeek}, {formattedDate}</span>
      {config.scale !== 1 && (
        <span className="scale-badge">{config.scale}x</span>
      )}
      {config.isPaused && (
        <span className="paused-badge">PAUSED</span>
      )}
    </div>
  );
}
```

### Time Store (Zustand)

```typescript
// src/stores/timeStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface TimeStore {
  // Config (persisted to backend)
  config: TimeConfig;

  // Runtime state (computed frequently)
  currentGameTime: Date;
  isNightTime: boolean;
  gameDayOfWeek: string;

  // Actions
  setScale: (scale: number) => void;
  pause: () => void;
  resume: () => void;
  syncFromServer: (config: TimeConfig) => void;

  // Internal
  _tickInterval: NodeJS.Timeout | null;
  _startTicking: () => void;
  _stopTicking: () => void;
}

export const useTimeStore = create<TimeStore>()(
  subscribeWithSelector((set, get) => ({
    config: createTimeConfig(4),
    currentGameTime: new Date(),
    isNightTime: false,
    gameDayOfWeek: 'Monday',
    _tickInterval: null,

    setScale: async (scale) => {
      const newConfig = setTimeScale(get().config, scale);
      set({ config: newConfig });
      await ws.request('time:setScale', { scale });
    },

    pause: async () => {
      const newConfig = pauseTime(get().config);
      set({ config: newConfig });
      await ws.request('time:pause', {});
    },

    resume: async () => {
      const newConfig = resumeTime(get().config);
      set({ config: newConfig });
      await ws.request('time:resume', {});
    },

    syncFromServer: (config) => {
      set({ config });
      get()._startTicking();
    },

    _startTicking: () => {
      const existing = get()._tickInterval;
      if (existing) clearInterval(existing);

      const tick = () => {
        const config = get().config;
        const gameTime = getGameTime(config);
        const hour = gameTime.getHours();

        set({
          currentGameTime: gameTime,
          isNightTime: hour >= 22 || hour < 6,
          gameDayOfWeek: format(gameTime, 'EEEE')
        });
      };

      tick(); // Immediate first tick
      const interval = setInterval(tick, 1000); // Update every second
      set({ _tickInterval: interval });
    },

    _stopTicking: () => {
      const interval = get()._tickInterval;
      if (interval) {
        clearInterval(interval);
        set({ _tickInterval: null });
      }
    }
  }))
);
```

### Taskbar Integration

The game clock should appear in the taskbar:

```tsx
// In Taskbar.tsx
<div className="taskbar-right">
  <GameClock />
  <SystemTray />
</div>
```

### Time Settings UI

```tsx
// In SettingsWindow.tsx - Time section

function TimeSettings() {
  const { config, setScale, pause, resume } = useTimeStore();

  const presets = [
    { value: 1, label: 'Real-Time (1:1)' },
    { value: 2, label: 'Gentle (2x)' },
    { value: 4, label: 'Standard (4x)', recommended: true },
    { value: 8, label: 'Fast (8x)' },
    { value: 24, label: 'Day per Hour (24x)' },
  ];

  return (
    <section>
      <h3>World Time</h3>

      <div className="setting-group">
        <label>Time Scale</label>
        <Select
          value={config.scale}
          onChange={(v) => setScale(Number(v))}
          options={presets.map(p => ({
            value: p.value,
            label: p.label + (p.recommended ? ' (Recommended)' : '')
          }))}
        />
        <p className="description">
          At {config.scale}x, 1 real hour = {config.scale} game hours
        </p>
      </div>

      <div className="setting-group">
        <label>Pause Controls</label>
        <button onClick={config.isPaused ? resume : pause}>
          {config.isPaused ? 'Resume' : 'Pause'} World Time
        </button>
      </div>

      <div className="setting-group">
        <Checkbox
          checked={config.pauseWhenMinimized}
          onChange={(v) => updateConfig({ pauseWhenMinimized: v })}
          label="Pause when app is minimized"
        />
      </div>
    </section>
  );
}
```

---

## Persistence & State

### Storage Location

Time config is **per-account** and stored in the account's `player.db`:

```sql
-- In player.db
CREATE TABLE IF NOT EXISTS time_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Single row
  scale REAL NOT NULL DEFAULT 4,
  anchor_real_time INTEGER NOT NULL,
  anchor_game_time INTEGER NOT NULL,
  pause_when_minimized INTEGER NOT NULL DEFAULT 1,
  pause_when_idle INTEGER NOT NULL DEFAULT 0,
  idle_threshold_minutes INTEGER NOT NULL DEFAULT 30,
  use_24_hour_format INTEGER NOT NULL DEFAULT 0,
  show_real_time_in_ui INTEGER NOT NULL DEFAULT 0,
  is_paused INTEGER NOT NULL DEFAULT 0,
  paused_at INTEGER
);
```

### Load on Account Select

When an account is selected:

1. Load time config from `player.db`
2. If was paused, stay paused
3. If wasn't paused, create new anchor (time continued while away)
4. Send config to frontend

### Save on Changes

Any time config change:
1. Update database
2. Emit `time:config_changed` event
3. Broadcast to all connected clients

### Session Resume Logic

When player returns after being away:

```typescript
function resumeSession(storedConfig: TimeConfig): TimeConfig {
  if (storedConfig.isPaused) {
    // Time was paused - resume from where we left off
    return storedConfig; // No change needed
  }

  // Time was running - calculate how much game time passed
  const realTimePassed = Date.now() - storedConfig.anchor.realTime;
  const gameTimePassed = realTimePassed * storedConfig.scale;

  // Option 1: Accept all passed time (world continued without player)
  // The anchor stays the same, getGameTime() will show much later time

  // Option 2: Cap offline progression (e.g., max 24 game hours)
  const maxOfflineGameHours = 24;
  const maxOfflineGameMs = maxOfflineGameHours * 60 * 60 * 1000;

  if (gameTimePassed > maxOfflineGameMs) {
    // Cap the progression
    const cappedGameTime = storedConfig.anchor.gameTime + maxOfflineGameMs;
    return {
      ...storedConfig,
      anchor: {
        realTime: Date.now(),
        gameTime: cappedGameTime
      }
    };
  }

  return storedConfig;
}
```

---

## Edge Cases

### 1. App Minimized

**Behavior:** If `pauseWhenMinimized` is true, pause game time when window loses focus.

```typescript
// Frontend: Listen for visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden && config.pauseWhenMinimized) {
    pause();
  } else if (!document.hidden && config.isPaused) {
    // Only auto-resume if was auto-paused (not manually paused)
    resume();
  }
});
```

### 2. System Sleep/Hibernate

When system wakes:
- Detect large real-time gap
- Apply offline progression cap if configured
- Re-sync frontend time display

### 3. Time Scale Changed Mid-Session

When scale changes:
1. Calculate current game time with old scale
2. Create new anchor at current game time
3. Future calculations use new scale
4. Running timers should be rescheduled

### 4. Daylight Saving Time

Game time is independent of real-world DST. Use simple 24-hour days.

### 5. Multiple Clients

If multiple WebSocket clients connect to same account:
- All receive same time config
- Pause/resume affects all clients
- Scale changes broadcast to all

### 6. Server Restart

On server restart:
- Load time config from database
- Recalculate current game time
- Running background tasks lost, but scheduler rebuilds them

---

## WebSocket API

### Routes

| Route | Direction | Payload | Response |
|-------|-----------|---------|----------|
| `time:getConfig` | Client→Server | `{}` | `TimeConfig` |
| `time:setScale` | Client→Server | `{ scale: number }` | `TimeConfig` |
| `time:pause` | Client→Server | `{}` | `TimeConfig` |
| `time:resume` | Client→Server | `{}` | `TimeConfig` |
| `time:updateConfig` | Client→Server | `Partial<TimeConfig>` | `TimeConfig` |
| `time:sync` | Server→Client | `TimeConfig` | - (push) |

### Events

```typescript
// Event types
EventTypes.TIME_CONFIG_CHANGED = 'time:config_changed';
EventTypes.TIME_PAUSED = 'time:paused';
EventTypes.TIME_RESUMED = 'time:resumed';
EventTypes.TIME_SCALE_CHANGED = 'time:scale_changed';

// Example event
{
  type: 'time:scale_changed',
  payload: {
    old_scale: 4,
    new_scale: 8,
    game_time_at_change: 1706000000000
  },
  context: {
    source: 'settings',
    player_id: 'uuid',
    importance: 0.5
  }
}
```

---

## Configuration During Onboarding

During account creation, time settings appear in the "World Preferences" step:

### UI Mockup

```
┌─────────────────────────────────────────────────────────┐
│  World Time Settings                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  How fast should time pass in your world?               │
│                                                         │
│  ○ Real-Time (1:1)                                     │
│    1 real hour = 1 game hour                           │
│    Most immersive, requires patience                    │
│                                                         │
│  ● Standard (4x) ✓ Recommended                         │
│    1 real hour = 4 game hours                          │
│    A 4-hour session covers a full day                  │
│                                                         │
│  ○ Fast (8x)                                           │
│    1 real hour = 8 game hours                          │
│    For active play sessions                            │
│                                                         │
│  ○ Custom: [____] x                                    │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ☑ Pause world time when app is minimized              │
│  ☐ Show real time alongside game time                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Onboarding Data Extension

```typescript
interface OnboardingData {
  // ... existing fields ...

  time: {
    scale: number;
    pauseWhenMinimized: boolean;
    showRealTimeInUI: boolean;
  };
}
```

---

## Future Considerations

### 1. Time-Based Events

```typescript
// Schedule event for specific game date
interface ScheduledEvent {
  id: string;
  type: 'birthday' | 'holiday' | 'anniversary' | 'custom';
  gameDate: string;  // "2026-02-14" for Valentine's Day
  npc_id?: string;
  data: Record<string, unknown>;
}
```

### 2. NPC Timezone Support

NPCs could have different "timezones" affecting their active hours:

```typescript
// NPC in "different timezone" - shifted active hours
{
  active_hours: { start: 8, end: 23 },
  timezone_offset: -3  // 3 hours behind player
}
```

### 3. Time Travel / Flashbacks

Potential feature: View past conversations in their original time context.

### 4. Seasonal Effects

Time scale could affect seasonal content (holidays, weather descriptions).

### 5. Sleep Acceleration

When player sleeps (explicit action), time could fast-forward to morning.

---

## Implementation Checklist

### Backend
- [ ] Create `server/src/services/time.ts` with core functions
- [ ] Add `time_config` table to player.db schema
- [ ] Add WebSocket handlers for time routes
- [ ] Update background scheduler to use game time
- [ ] Add time events to event-types.ts
- [ ] Update NPC active hours checking

### Frontend
- [ ] Create `src/stores/timeStore.ts`
- [ ] Create `src/components/ui/GameClock.tsx`
- [ ] Add time settings section to SettingsWindow
- [ ] Integrate GameClock into Taskbar
- [ ] Add time config to onboarding flow
- [ ] Handle visibility change for auto-pause

### Integration
- [ ] Update onboarding service with time config
- [ ] Update account creation to initialize time config
- [ ] Update event emissions with game timestamps
- [ ] Test time scale changes with running scheduler

---

## Summary

The Time System provides a flexible foundation for all time-based mechanics in engAIge. By separating "game time" from "real time" and making the scale configurable, players can choose their preferred pace while maintaining a consistent, immersive experience.

**Key Decisions:**
1. **Default 4x scale** - Good balance of progression and immersion
2. **UI delays stay real-time** - Natural conversation feel
3. **Per-account settings** - Different accounts can have different speeds
4. **Auto-pause on minimize** - Prevents runaway time when AFK
5. **Offline progression cap** - World doesn't advance indefinitely when away
