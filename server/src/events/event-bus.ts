/**
 * The Event Bus - Centralized Game Event Handler
 *
 * ALL in-game events go through this module.
 * This is the "door" for events - nothing happens without going through here.
 *
 * Usage:
 *   import { eventBus } from '../events/event-bus.js';
 *   await eventBus.emit('conversation:message_sent', { ... }, { source: 'conversation' });
 */

import { Database } from 'bun:sqlite';
import type { EventCategory, GameEvent, EventContext } from './event-types.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type EventHandler<T = unknown> = (event: GameEvent<T>) => void | Promise<void>;

interface EventBusConfig {
  logToConsole: boolean;
  minConsoleImportance: number;
  persistEvents: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Event Bus Singleton
// ─────────────────────────────────────────────────────────────────

class EventBus {
  private db: Database | null = null;
  private initialized = false;

  // Subscriber maps
  private typeSubscribers: Map<string, Set<EventHandler>> = new Map();
  private categorySubscribers: Map<EventCategory, Set<EventHandler>> = new Map();
  private globalSubscribers: Set<EventHandler> = new Set();

  // Configuration
  private config: EventBusConfig = {
    logToConsole: true,
    minConsoleImportance: 0.3,
    persistEvents: true,
  };

  // Category icons for console logging
  private readonly categoryIcons: Record<EventCategory, string> = {
    player: '\u{1F464}',      // 👤
    npc: '\u{1F916}',         // 🤖
    conversation: '\u{1F4AC}', // 💬
    relationship: '\u{2764}',  // ❤️
    social: '\u{1F4F1}',      // 📱
    memory: '\u{1F9E0}',      // 🧠
    budget: '\u{1F4B0}',      // 💰
    system: '\u{2699}',       // ⚙️
    scheduler: '\u{23F0}',    // ⏰
    ai: '\u{1F9E0}',          // 🧠
    media: '\u{1F4C1}',       // 📁
  };

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  /**
   * Initialize the event bus with a database connection
   * Call this after getDB('game') in server startup
   */
  initialize(db: Database): void {
    if (this.initialized) {
      console.warn('[EventBus] Already initialized');
      return;
    }

    this.db = db;
    this.createTable();
    this.initialized = true;
    console.log('[EventBus] Initialized - all game events will be logged');
  }

  /**
   * Configure event bus behavior
   */
  configure(config: Partial<EventBusConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private createTable(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        category TEXT NOT NULL,
        player_id TEXT,
        npc_id TEXT,
        conversation_id TEXT,
        post_id TEXT,
        payload TEXT NOT NULL,
        source TEXT NOT NULL,
        session_id TEXT,
        timestamp INTEGER NOT NULL,
        importance REAL DEFAULT 0.5,
        parent_event_id TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_events_type ON game_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_events_category ON game_events(category);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON game_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_events_npc ON game_events(npc_id);
      CREATE INDEX IF NOT EXISTS idx_events_player ON game_events(player_id);
      CREATE INDEX IF NOT EXISTS idx_events_importance ON game_events(importance);
      CREATE INDEX IF NOT EXISTS idx_events_parent ON game_events(parent_event_id);
      CREATE INDEX IF NOT EXISTS idx_events_source ON game_events(source);
    `);
  }

  // ─────────────────────────────────────────────────────────────
  // Emit (The Main Entry Point)
  // ─────────────────────────────────────────────────────────────

  /**
   * Emit a game event - THE main function for all game events
   *
   * @param eventType - Event type string (e.g., 'conversation:message_sent')
   * @param payload - Event-specific data
   * @param context - Source, IDs, and metadata
   * @returns The created event with ID and timestamp
   */
  async emit<T>(
    eventType: string,
    payload: T,
    context: EventContext
  ): Promise<GameEvent<T>> {
    if (!this.initialized) {
      console.warn('[EventBus] Not initialized, event will not be persisted:', eventType);
    }

    const category = this.extractCategory(eventType);
    const importance = context.importance ?? this.calculateImportance(eventType);

    const event: GameEvent<T> = {
      id: crypto.randomUUID(),
      event_type: eventType,
      category,
      payload,
      timestamp: Date.now(),
      importance,
      source: context.source,
      player_id: context.player_id,
      npc_id: context.npc_id,
      conversation_id: context.conversation_id,
      post_id: context.post_id,
      session_id: context.session_id,
      parent_event_id: context.parent_event_id,
    };

    // 1. Persist to database (the master log)
    if (this.config.persistEvents && this.db) {
      this.persist(event);
    }

    // 2. Notify subscribers (non-blocking)
    this.notifySubscribers(event);

    // 3. Log to console (dev visibility)
    if (this.config.logToConsole && importance >= this.config.minConsoleImportance) {
      this.logEvent(event);
    }

    return event;
  }

  /**
   * Emit without awaiting - fire and forget
   * Use when you don't need the event ID back
   */
  fire<T>(eventType: string, payload: T, context: EventContext): void {
    this.emit(eventType, payload, context).catch((err) => {
      console.error('[EventBus] Fire error:', err);
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Subscribe
  // ─────────────────────────────────────────────────────────────

  /**
   * Subscribe to a specific event type
   * @returns Unsubscribe function
   */
  on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.typeSubscribers.has(eventType)) {
      this.typeSubscribers.set(eventType, new Set());
    }
    this.typeSubscribers.get(eventType)!.add(handler as EventHandler);

    return () => {
      this.typeSubscribers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to all events in a category
   * @returns Unsubscribe function
   */
  onCategory(category: EventCategory, handler: EventHandler): () => void {
    if (!this.categorySubscribers.has(category)) {
      this.categorySubscribers.set(category, new Set());
    }
    this.categorySubscribers.get(category)!.add(handler);

    return () => {
      this.categorySubscribers.get(category)?.delete(handler);
    };
  }

  /**
   * Subscribe to ALL events (use sparingly - high volume)
   * @returns Unsubscribe function
   */
  onAll(handler: EventHandler): () => void {
    this.globalSubscribers.add(handler);
    return () => {
      this.globalSubscribers.delete(handler);
    };
  }

  /**
   * One-time event listener
   * @returns Unsubscribe function (in case you want to cancel before it fires)
   */
  once<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    const wrappedHandler: EventHandler<T> = (event) => {
      unsubscribe();
      handler(event);
    };
    const unsubscribe = this.on(eventType, wrappedHandler);
    return unsubscribe;
  }

  // ─────────────────────────────────────────────────────────────
  // Query (Read from Master Log)
  // ─────────────────────────────────────────────────────────────

  /**
   * Get events by type
   */
  getByType(eventType: string, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE event_type = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(eventType, limit).map(this.deserialize);
  }

  /**
   * Get events by category
   */
  getByCategory(category: EventCategory, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE category = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(category, limit).map(this.deserialize);
  }

  /**
   * Get events for an NPC
   */
  getByNPC(npcId: string, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE npc_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(npcId, limit).map(this.deserialize);
  }

  /**
   * Get events for a player
   */
  getByPlayer(playerId: string, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE player_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(playerId, limit).map(this.deserialize);
  }

  /**
   * Get events for a conversation
   */
  getByConversation(conversationId: string, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE conversation_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(conversationId, limit).map(this.deserialize);
  }

  /**
   * Get event by ID
   */
  getById(eventId: string): GameEvent | null {
    if (!this.db) return null;
    const stmt = this.db.prepare(`SELECT * FROM game_events WHERE id = ?`);
    const row = stmt.get(eventId);
    return row ? this.deserialize(row) : null;
  }

  /**
   * Get event chain (parent→child relationships)
   * Traces back through parent_event_id to build causal chain
   */
  getEventChain(eventId: string): GameEvent[] {
    if (!this.db) return [];

    const events: GameEvent[] = [];
    let currentId: string | null = eventId;

    while (currentId) {
      const event = this.getById(currentId);
      if (!event) break;
      events.unshift(event);
      currentId = event.parent_event_id ?? null;
    }

    return events;
  }

  /**
   * Get recent high-importance events
   */
  getSignificantEvents(since: number, minImportance = 0.7, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE timestamp > ? AND importance >= ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(since, minImportance, limit).map(this.deserialize);
  }

  /**
   * Get events by source service
   */
  getBySource(source: string, limit = 100): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE source = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(source, limit).map(this.deserialize);
  }

  /**
   * Full-text search in payloads
   */
  search(query: string, limit = 50): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      WHERE payload LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(`%${query}%`, limit).map(this.deserialize);
  }

  /**
   * Get event count by type (for analytics)
   */
  countByType(eventType: string, since?: number): number {
    if (!this.db) return 0;
    if (since) {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM game_events
        WHERE event_type = ? AND timestamp > ?
      `);
      return (stmt.get(eventType, since) as { count: number }).count;
    }
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM game_events WHERE event_type = ?
    `);
    return (stmt.get(eventType) as { count: number }).count;
  }

  /**
   * Get event count by category (for analytics)
   */
  countByCategory(category: EventCategory, since?: number): number {
    if (!this.db) return 0;
    if (since) {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM game_events
        WHERE category = ? AND timestamp > ?
      `);
      return (stmt.get(category, since) as { count: number }).count;
    }
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM game_events WHERE category = ?
    `);
    return (stmt.get(category) as { count: number }).count;
  }

  /**
   * Get recent events (for debugging/monitoring)
   */
  getRecent(limit = 50): GameEvent[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(`
      SELECT * FROM game_events
      ORDER BY timestamp DESC
      LIMIT ?
    `);
    return stmt.all(limit).map(this.deserialize);
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private persist(event: GameEvent): void {
    if (!this.db) return;

    try {
      const stmt = this.db.prepare(`
        INSERT INTO game_events (
          id, event_type, category, player_id, npc_id,
          conversation_id, post_id, payload, source,
          session_id, timestamp, importance, parent_event_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
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
    } catch (err) {
      console.error('[EventBus] Failed to persist event:', err);
    }
  }

  private notifySubscribers(event: GameEvent): void {
    // Type-specific subscribers
    const typeHandlers = this.typeSubscribers.get(event.event_type);
    if (typeHandlers) {
      for (const handler of typeHandlers) {
        try {
          const result = handler(event);
          if (result instanceof Promise) {
            result.catch((err) => console.error('[EventBus] Handler error:', err));
          }
        } catch (err) {
          console.error('[EventBus] Handler error:', err);
        }
      }
    }

    // Category subscribers
    const categoryHandlers = this.categorySubscribers.get(event.category);
    if (categoryHandlers) {
      for (const handler of categoryHandlers) {
        try {
          const result = handler(event);
          if (result instanceof Promise) {
            result.catch((err) => console.error('[EventBus] Handler error:', err));
          }
        } catch (err) {
          console.error('[EventBus] Handler error:', err);
        }
      }
    }

    // Global subscribers
    for (const handler of this.globalSubscribers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((err) => console.error('[EventBus] Handler error:', err));
        }
      } catch (err) {
        console.error('[EventBus] Handler error:', err);
      }
    }
  }

  private extractCategory(eventType: string): EventCategory {
    const category = eventType.split(':')[0];
    const validCategories: EventCategory[] = [
      'player', 'npc', 'conversation', 'relationship',
      'social', 'memory', 'budget', 'system',
      'scheduler', 'ai', 'media',
    ];

    if (validCategories.includes(category as EventCategory)) {
      return category as EventCategory;
    }

    console.warn(`[EventBus] Unknown category in event type: ${eventType}, defaulting to 'system'`);
    return 'system';
  }

  private calculateImportance(eventType: string): number {
    // Stage changes and milestones are most important
    if (eventType.includes('stage_changed')) return 1.0;
    if (eventType.includes('milestone')) return 0.9;
    if (eventType.includes('first_interaction')) return 0.9;

    // Errors are important
    if (eventType.includes('error')) return 0.8;
    if (eventType.includes('exhausted')) return 0.8;
    if (eventType.includes('warning')) return 0.7;

    // Creation events
    if (eventType.includes('created') && eventType.startsWith('npc:')) return 0.8;
    if (eventType.includes('created')) return 0.6;

    // Messages and interactions
    if (eventType.includes('message_sent')) return 0.5;
    if (eventType.includes('message_received')) return 0.5;
    if (eventType.includes('stats_updated')) return 0.4;

    // Low importance (high volume)
    if (eventType.includes('typing')) return 0.1;
    if (eventType.includes('recalled')) return 0.2;
    if (eventType.includes('read')) return 0.2;

    // Task lifecycle
    if (eventType.includes('task_scheduled')) return 0.3;
    if (eventType.includes('task_started')) return 0.3;
    if (eventType.includes('task_completed')) return 0.4;
    if (eventType.includes('task_failed')) return 0.7;

    return 0.5; // default
  }

  private logEvent(event: GameEvent): void {
    const icon = this.categoryIcons[event.category] ?? '\u{1F4CC}'; // 📌
    const importance = event.importance ?? 0.5;
    const star = importance >= 0.7 ? ' \u{2B50}' : ''; // ⭐

    // Build context string
    const context: string[] = [];
    if (event.npc_id) context.push(`npc:${event.npc_id.slice(0, 8)}`);
    if (event.player_id) context.push(`player:${event.player_id.slice(0, 8)}`);
    if (event.conversation_id) context.push(`conv:${event.conversation_id.slice(0, 8)}`);

    console.log(
      `${icon} [Event] ${event.event_type}`,
      context.length > 0 ? `(${context.join(', ')})` : '',
      `[${event.source}]`,
      star
    );
  }

  private deserialize(row: unknown): GameEvent {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      event_type: r.event_type as string,
      category: r.category as EventCategory,
      player_id: r.player_id as string | undefined,
      npc_id: r.npc_id as string | undefined,
      conversation_id: r.conversation_id as string | undefined,
      post_id: r.post_id as string | undefined,
      payload: JSON.parse(r.payload as string),
      source: r.source as string,
      session_id: r.session_id as string | undefined,
      timestamp: r.timestamp as number,
      importance: r.importance as number | undefined,
      parent_event_id: r.parent_event_id as string | undefined,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Status/Debug
  // ─────────────────────────────────────────────────────────────

  /**
   * Get event bus status (for debugging)
   */
  getStatus(): {
    initialized: boolean;
    typeSubscriberCount: number;
    categorySubscriberCount: number;
    globalSubscriberCount: number;
    config: EventBusConfig;
  } {
    let typeCount = 0;
    for (const set of this.typeSubscribers.values()) {
      typeCount += set.size;
    }

    let catCount = 0;
    for (const set of this.categorySubscribers.values()) {
      catCount += set.size;
    }

    return {
      initialized: this.initialized,
      typeSubscriberCount: typeCount,
      categorySubscriberCount: catCount,
      globalSubscriberCount: this.globalSubscribers.size,
      config: { ...this.config },
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────────

export const eventBus = new EventBus();
export default eventBus;
