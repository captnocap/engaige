# Event Bus Architecture

> **Design Philosophy**: Just like `door.ts` is the single exit point for all HTTP requests, `event-bus.ts` is the single point for all in-game events. Nothing happens in the game without going through the bus.

## Overview

The Event Bus provides:
1. **Master Event Log** - Every game event persisted to SQLite with full payload
2. **Pub/Sub** - Services subscribe to events they care about
3. **Audit Trail** - Complete history for debugging, replay, analytics
4. **Decoupled Architecture** - Services don't call each other directly

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         EVENT BUS                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   emit()    │→ │   log()     │→ │   notify subscribers    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         ↑                   ↓                      ↓
    All Services      game_events table       Subscribed Handlers
```

## Event Categories

```typescript
export type EventCategory =
  | 'player'        // Player actions (login, profile update, settings change)
  | 'npc'           // NPC state changes (created, updated, mood change)
  | 'conversation'  // Messages (sent, received, read)
  | 'relationship'  // Relationship changes (stats, stage transitions)
  | 'social'        // Social platform events (post, like, comment, share)
  | 'memory'        // Memory system (created, recalled, expired)
  | 'budget'        // Budget events (spent, allocation change, warning)
  | 'system'        // System events (startup, shutdown, error)
  | 'scheduler'     // Background task events (scheduled, executed, failed)
  | 'ai'            // AI interactions (request, response, error)
  | 'media';        // Media events (uploaded, generated, deleted)
```

## Event Types (Examples)

```typescript
// Conversation Events
'conversation:message_sent'      // Player sent a message
'conversation:message_received'  // NPC responded
'conversation:message_read'      // Message marked as read
'conversation:started'           // New conversation began
'conversation:ended'             // Conversation closed

// Relationship Events
'relationship:stats_updated'     // Trust/affinity/familiarity changed
'relationship:stage_changed'     // stranger→friend, friend→partner, etc.
'relationship:first_interaction' // First ever contact with NPC
'relationship:milestone'         // 100 messages, 1 month anniversary, etc.

// Social Events
'social:post_created'           // NPC created a post
'social:post_liked'             // Player/NPC liked a post
'social:post_commented'         // Player/NPC commented
'social:profile_viewed'         // Player viewed NPC profile

// NPC Events
'npc:created'                   // New NPC generated
'npc:mood_changed'              // NPC emotional state changed
'npc:activity_started'          // NPC began an activity
'npc:went_online'               // NPC became active
'npc:went_offline'              // NPC became inactive

// Memory Events
'memory:created'                // New memory stored
'memory:recalled'               // Memory retrieved for context
'memory:expired'                // Memory reached expiration
'memory:importance_updated'     // Memory importance recalculated

// Budget Events
'budget:spent'                  // API cost incurred
'budget:warning'                // Approaching limit
'budget:exhausted'              // Category depleted
'budget:allocation_changed'     // User changed budget settings

// System Events
'system:startup'                // Server started
'system:shutdown'               // Server stopping
'system:error'                  // Unhandled error occurred
'system:ws_connected'           // WebSocket client connected
'system:ws_disconnected'        // WebSocket client disconnected

// Scheduler Events
'scheduler:task_scheduled'      // Task queued
'scheduler:task_started'        // Task execution began
'scheduler:task_completed'      // Task finished successfully
'scheduler:task_failed'         // Task errored
'scheduler:task_cancelled'      // Task cancelled (budget, etc.)

// AI Events
'ai:request_sent'               // Request sent to AI provider
'ai:response_received'          // Response received
'ai:error'                      // AI provider error
'ai:vision_proxied'             // Vision request proxied to capable model
'ai:image_generated'            // Image generation completed

// Player Events
'player:profile_updated'        // Player changed their profile
'player:settings_changed'       // Player changed settings
'player:logged_in'              // Session started
'player:logged_out'             // Session ended

// Media Events
'media:uploaded'                // File uploaded
'media:generated'               // AI generated media
'media:deleted'                 // File removed
```

## Database Schema

```sql
-- Add to game.db
CREATE TABLE IF NOT EXISTS game_events (
  id TEXT PRIMARY KEY,

  -- Event identification
  event_type TEXT NOT NULL,           -- 'conversation:message_sent'
  category TEXT NOT NULL,             -- 'conversation'

  -- Context
  player_id TEXT,                     -- Player involved (if any)
  npc_id TEXT,                        -- NPC involved (if any)
  conversation_id TEXT,               -- Conversation context (if any)
  post_id TEXT,                       -- Post context (if any)

  -- Payload
  payload TEXT NOT NULL,              -- JSON: full event data

  -- Metadata
  source TEXT NOT NULL,               -- Service that emitted: 'conversation', 'scheduler', etc.
  session_id TEXT,                    -- WebSocket session (if from client action)

  -- Timing
  timestamp INTEGER NOT NULL,         -- Unix timestamp (ms)

  -- Indexing helpers
  importance REAL DEFAULT 0.5,        -- 0-1 for filtering significant events

  -- For debugging/replay
  parent_event_id TEXT,               -- Event that triggered this one (causal chain)

  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (npc_id) REFERENCES npcs(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_events_type ON game_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON game_events(category);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON game_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_npc ON game_events(npc_id);
CREATE INDEX IF NOT EXISTS idx_events_player ON game_events(player_id);
CREATE INDEX IF NOT EXISTS idx_events_importance ON game_events(importance);
CREATE INDEX IF NOT EXISTS idx_events_parent ON game_events(parent_event_id);
```

## Core API

### `server/src/events/event-bus.ts`

```typescript
import { Database } from 'bun:sqlite';
import { v4 as uuid } from 'uuid';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type EventCategory =
  | 'player' | 'npc' | 'conversation' | 'relationship'
  | 'social' | 'memory' | 'budget' | 'system'
  | 'scheduler' | 'ai' | 'media';

export interface GameEvent<T = unknown> {
  id: string;
  event_type: string;
  category: EventCategory;
  payload: T;
  timestamp: number;

  // Optional context
  player_id?: string;
  npc_id?: string;
  conversation_id?: string;
  post_id?: string;

  // Metadata
  source: string;
  session_id?: string;
  importance?: number;
  parent_event_id?: string;
}

type EventHandler<T = unknown> = (event: GameEvent<T>) => void | Promise<void>;

// ─────────────────────────────────────────────────────────────────
// Event Bus Singleton
// ─────────────────────────────────────────────────────────────────

class EventBus {
  private db: Database | null = null;
  private subscribers: Map<string, Set<EventHandler>> = new Map();
  private categorySubscribers: Map<EventCategory, Set<EventHandler>> = new Map();
  private globalSubscribers: Set<EventHandler> = new Set();

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  initialize(db: Database): void {
    this.db = db;
    this.createTable();
    console.log('[EventBus] Initialized');
  }

  private createTable(): void {
    // Schema creation (see above)
  }

  // ─────────────────────────────────────────────────────────────
  // Emit (The Main Entry Point)
  // ─────────────────────────────────────────────────────────────

  async emit<T>(
    eventType: string,
    payload: T,
    context: {
      source: string;
      player_id?: string;
      npc_id?: string;
      conversation_id?: string;
      post_id?: string;
      session_id?: string;
      importance?: number;
      parent_event_id?: string;
    }
  ): Promise<GameEvent<T>> {
    const category = this.extractCategory(eventType);

    const event: GameEvent<T> = {
      id: uuid(),
      event_type: eventType,
      category,
      payload,
      timestamp: Date.now(),
      importance: context.importance ?? this.calculateImportance(eventType),
      ...context,
    };

    // 1. Persist to database (the master log)
    this.persist(event);

    // 2. Notify subscribers (async, non-blocking)
    this.notifySubscribers(event);

    // 3. Log to console (dev visibility)
    this.logEvent(event);

    return event;
  }

  // ─────────────────────────────────────────────────────────────
  // Subscribe
  // ─────────────────────────────────────────────────────────────

  /** Subscribe to specific event type */
  on<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => this.subscribers.get(eventType)?.delete(handler as EventHandler);
  }

  /** Subscribe to all events in a category */
  onCategory(category: EventCategory, handler: EventHandler): () => void {
    if (!this.categorySubscribers.has(category)) {
      this.categorySubscribers.set(category, new Set());
    }
    this.categorySubscribers.get(category)!.add(handler);

    return () => this.categorySubscribers.get(category)?.delete(handler);
  }

  /** Subscribe to ALL events (use sparingly) */
  onAll(handler: EventHandler): () => void {
    this.globalSubscribers.add(handler);
    return () => this.globalSubscribers.delete(handler);
  }

  // ─────────────────────────────────────────────────────────────
  // Query (Read from Master Log)
  // ─────────────────────────────────────────────────────────────

  /** Get events by type */
  getByType(eventType: string, limit = 100): GameEvent[] {
    return this.db!.prepare(`
      SELECT * FROM game_events
      WHERE event_type = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(eventType, limit).map(this.deserialize);
  }

  /** Get events by category */
  getByCategory(category: EventCategory, limit = 100): GameEvent[] {
    return this.db!.prepare(`
      SELECT * FROM game_events
      WHERE category = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(category, limit).map(this.deserialize);
  }

  /** Get events for an NPC */
  getByNPC(npcId: string, limit = 100): GameEvent[] {
    return this.db!.prepare(`
      SELECT * FROM game_events
      WHERE npc_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(npcId, limit).map(this.deserialize);
  }

  /** Get event chain (parent→child relationships) */
  getEventChain(eventId: string): GameEvent[] {
    const events: GameEvent[] = [];
    let currentId: string | null = eventId;

    while (currentId) {
      const event = this.db!.prepare(`
        SELECT * FROM game_events WHERE id = ?
      `).get(currentId);

      if (!event) break;
      events.unshift(this.deserialize(event));
      currentId = event.parent_event_id;
    }

    return events;
  }

  /** Get recent high-importance events */
  getSignificantEvents(since: number, minImportance = 0.7): GameEvent[] {
    return this.db!.prepare(`
      SELECT * FROM game_events
      WHERE timestamp > ? AND importance >= ?
      ORDER BY timestamp DESC
    `).all(since, minImportance).map(this.deserialize);
  }

  /** Full-text search in payloads */
  search(query: string, limit = 50): GameEvent[] {
    return this.db!.prepare(`
      SELECT * FROM game_events
      WHERE payload LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(`%${query}%`, limit).map(this.deserialize);
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private persist(event: GameEvent): void {
    this.db!.prepare(`
      INSERT INTO game_events (
        id, event_type, category, player_id, npc_id,
        conversation_id, post_id, payload, source,
        session_id, timestamp, importance, parent_event_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.event_type,
      event.category,
      event.player_id ?? null,
      event.npc_id ?? null,
      event.conversation_id ?? null,
      event.post_id ?? null,
      JSON.stringify(event.payload),
      event.source,
      event.session_id ?? null,
      event.timestamp,
      event.importance ?? 0.5,
      event.parent_event_id ?? null
    );
  }

  private notifySubscribers(event: GameEvent): void {
    // Specific event type subscribers
    const typeHandlers = this.subscribers.get(event.event_type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try { handler(event); } catch (e) { console.error('[EventBus] Handler error:', e); }
      }
    }

    // Category subscribers
    const categoryHandlers = this.categorySubscribers.get(event.category);
    if (categoryHandlers) {
      for (const handler of categoryHandlers) {
        try { handler(event); } catch (e) { console.error('[EventBus] Handler error:', e); }
      }
    }

    // Global subscribers
    for (const handler of this.globalSubscribers) {
      try { handler(event); } catch (e) { console.error('[EventBus] Handler error:', e); }
    }
  }

  private extractCategory(eventType: string): EventCategory {
    const category = eventType.split(':')[0];
    return category as EventCategory;
  }

  private calculateImportance(eventType: string): number {
    // High importance events
    if (eventType.includes('stage_changed')) return 1.0;
    if (eventType.includes('milestone')) return 0.9;
    if (eventType.includes('first_interaction')) return 0.9;
    if (eventType.includes('error')) return 0.8;
    if (eventType.includes('created') && eventType.startsWith('npc:')) return 0.8;

    // Medium importance
    if (eventType.includes('message_sent')) return 0.6;
    if (eventType.includes('post_created')) return 0.6;
    if (eventType.includes('stats_updated')) return 0.5;

    // Low importance (high volume)
    if (eventType.includes('typing')) return 0.1;
    if (eventType.includes('recalled')) return 0.2;
    if (eventType.includes('read')) return 0.2;

    return 0.5; // default
  }

  private logEvent(event: GameEvent): void {
    const icon = this.getCategoryIcon(event.category);
    const importance = event.importance ?? 0.5;

    // Only log medium+ importance to console
    if (importance >= 0.4) {
      console.log(
        `${icon} [${event.category}] ${event.event_type}`,
        event.npc_id ? `npc:${event.npc_id.slice(0, 8)}` : '',
        importance >= 0.7 ? '⭐' : ''
      );
    }
  }

  private getCategoryIcon(category: EventCategory): string {
    const icons: Record<EventCategory, string> = {
      player: '👤',
      npc: '🤖',
      conversation: '💬',
      relationship: '❤️',
      social: '📱',
      memory: '🧠',
      budget: '💰',
      system: '⚙️',
      scheduler: '⏰',
      ai: '🤖',
      media: '📁',
    };
    return icons[category] ?? '📌';
  }

  private deserialize(row: any): GameEvent {
    return {
      ...row,
      payload: JSON.parse(row.payload),
    };
  }
}

// Singleton export
export const eventBus = new EventBus();
```

## Usage Examples

### Emitting Events

```typescript
import { eventBus } from '../events/event-bus.js';

// In conversation.ts - when player sends message
await eventBus.emit('conversation:message_sent', {
  content: message.content,
  message_id: message.id,
  word_count: message.content.split(' ').length,
}, {
  source: 'conversation',
  player_id: playerId,
  npc_id: npcId,
  conversation_id: conversationId,
  session_id: wsSessionId,
});

// In relationships.ts - when relationship stage changes
await eventBus.emit('relationship:stage_changed', {
  previous_stage: 'friend',
  new_stage: 'close_friend',
  trust: 75,
  affinity: 80,
  familiarity: 90,
}, {
  source: 'relationships',
  player_id: playerId,
  npc_id: npcId,
  importance: 1.0, // High importance - this is significant!
  parent_event_id: triggeringMessageEventId,
});

// In ai.ts - when AI responds
await eventBus.emit('ai:response_received', {
  model: 'gpt-4o-mini',
  provider: 'openai',
  tokens_used: 450,
  cost_cents: 0.02,
  latency_ms: 1200,
}, {
  source: 'ai',
  npc_id: npcId,
  conversation_id: conversationId,
});
```

### Subscribing to Events

```typescript
import { eventBus } from '../events/event-bus.js';

// WebSocket server forwards events to clients
eventBus.onCategory('conversation', (event) => {
  if (event.event_type === 'conversation:message_received') {
    broadcast({
      type: 'ai:response',
      payload: event.payload,
    });
  }
});

// Budget service tracks all AI costs
eventBus.on('ai:response_received', (event) => {
  const { cost_cents } = event.payload;
  addSpending(cost_cents, event.npc_id);
});

// Analytics/debugging - log all high-importance events
eventBus.onAll((event) => {
  if (event.importance >= 0.8) {
    console.log(`[SIGNIFICANT] ${event.event_type}`, event.payload);
  }
});
```

### Querying Event History

```typescript
// Debug: What happened with this NPC recently?
const npcEvents = eventBus.getByNPC(npcId, 50);

// Analytics: All relationship changes today
const relationshipEvents = eventBus.getByCategory('relationship', 100)
  .filter(e => e.timestamp > Date.now() - 86400000);

// Replay: Trace what led to this event
const eventChain = eventBus.getEventChain(errorEventId);

// Search: Find all events mentioning "jealous"
const jealousEvents = eventBus.search('jealous');
```

## Integration Points

### 1. Conversation Service
```typescript
// Before: Direct function calls
await updateStatsForMessage(playerId, npcId, message);

// After: Emit event, let relationship service subscribe
await eventBus.emit('conversation:message_sent', { ... });
// relationships.ts subscribes to 'conversation:message_sent'
```

### 2. Background Scheduler
```typescript
// Before: Console.log only
console.log(`[Scheduler] Task ${task.id} completed`);

// After: Emit event
await eventBus.emit('scheduler:task_completed', {
  task_id: task.id,
  task_type: task.task_type,
  duration_ms: endTime - startTime,
}, { source: 'scheduler', npc_id: task.npc_id });
```

### 3. WebSocket Server
```typescript
// Subscribe to events that should be forwarded to clients
eventBus.onCategory('conversation', forwardToClient);
eventBus.onCategory('social', forwardToClient);
eventBus.on('npc:went_online', forwardToClient);
eventBus.on('budget:warning', forwardToClient);
```

### 4. Memory Writer Agent
```typescript
// Subscribe instead of being called directly
eventBus.on('conversation:message_received', async (event) => {
  // Schedule memory generation
  await scheduleMemoryGeneration(event.npc_id, event.conversation_id);
});
```

## Migration Strategy

### Phase 1: Add Infrastructure
- [ ] Create `event-bus.ts` with full API
- [ ] Add `game_events` table to schema
- [ ] Initialize event bus in server startup

### Phase 2: Instrument High-Value Events
- [ ] `conversation:message_sent` / `conversation:message_received`
- [ ] `relationship:stats_updated` / `relationship:stage_changed`
- [ ] `ai:response_received` / `ai:error`
- [ ] `budget:spent`

### Phase 3: Move to Pub/Sub
- [ ] Relationship service subscribes to conversation events
- [ ] Memory writer subscribes to conversation events
- [ ] WebSocket server subscribes to relevant events

### Phase 4: Full Coverage
- [ ] All NPC events
- [ ] All social platform events
- [ ] All scheduler events
- [ ] System events

## Benefits

1. **Single Source of Truth** - Every event in one table
2. **Debugging** - "What happened at 2:30 PM?" → Query the log
3. **Replay** - Reconstruct game state from events
4. **Analytics** - "How many messages per day?" → Query events
5. **Decoupling** - Services don't need to know about each other
6. **Audit Trail** - Complete history of all game actions
7. **Future Features**:
   - Event replay for testing
   - Time-travel debugging
   - User activity dashboard
   - NPC behavior analytics
   - A/B testing different behaviors

## File Structure

```
server/src/
├── events/
│   ├── event-bus.ts        # Core event bus (the "door" for events)
│   ├── event-types.ts      # Type definitions for all events
│   └── index.ts            # Re-exports
├── services/
│   └── (existing services emit events)
└── agents/
    └── (subscribe to events instead of direct calls)
```
