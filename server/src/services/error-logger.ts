/**
 * Error Logger - Centralized Error Handling
 *
 * ALL errors should go through this service for consistent logging,
 * persistence, and debugging.
 *
 * Usage:
 *   import { errorLogger } from '../services/error-logger.js';
 *
 *   // Log an error with context
 *   errorLogger.log(error, {
 *     source: 'ai',
 *     operation: 'generateNPCResponse',
 *     npc_id: npcId,
 *   });
 *
 *   // Or use the wrapper for try/catch
 *   const result = await errorLogger.wrap(
 *     () => riskyOperation(),
 *     { source: 'scheduler', operation: 'processTask' }
 *   );
 */

import { Database } from 'bun:sqlite';
import { eventBus, EventTypes } from '../events/index.js';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  source: string;           // Service/module that threw: 'ai', 'scheduler', 'conversation', etc.
  operation: string;        // What was being attempted: 'generateResponse', 'sendMessage', etc.

  // Optional context
  npc_id?: string;
  player_id?: string;
  conversation_id?: string;
  task_id?: string;
  request_id?: string;
  session_id?: string;

  // Additional data
  metadata?: Record<string, unknown>;

  // Override severity (auto-detected if not provided)
  severity?: ErrorSeverity;
}

export interface LoggedError {
  id: string;
  timestamp: number;
  severity: ErrorSeverity;

  // Error details
  error_type: string;       // Error class name
  message: string;
  stack?: string;
  code?: string;            // Error code if available

  // Context
  source: string;
  operation: string;
  npc_id?: string;
  player_id?: string;
  conversation_id?: string;
  task_id?: string;
  request_id?: string;
  session_id?: string;
  metadata?: Record<string, unknown>;

  // Resolution
  resolved: boolean;
  resolved_at?: number;
  resolution_notes?: string;
}

// ─────────────────────────────────────────────────────────────────
// Error Logger Service
// ─────────────────────────────────────────────────────────────────

class ErrorLogger {
  private db: Database | null = null;
  private initialized = false;

  // Error patterns for auto-severity detection
  private readonly criticalPatterns = [
    /database.*corrupt/i,
    /out of memory/i,
    /fatal/i,
    /unrecoverable/i,
  ];

  private readonly highPatterns = [
    /budget.*exceed/i,
    /api.*key.*invalid/i,
    /authentication.*fail/i,
    /rate.*limit/i,
    /timeout/i,
  ];

  private readonly mediumPatterns = [
    /not found/i,
    /invalid.*input/i,
    /validation.*fail/i,
    /parse.*error/i,
  ];

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  initialize(db: Database): void {
    if (this.initialized) return;

    this.db = db;
    this.createTable();
    this.setupGlobalHandlers();
    this.initialized = true;

    console.log('[ErrorLogger] Initialized - all errors will be logged');
  }

  private createTable(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS error_log (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        severity TEXT NOT NULL,

        error_type TEXT NOT NULL,
        message TEXT NOT NULL,
        stack TEXT,
        code TEXT,

        source TEXT NOT NULL,
        operation TEXT NOT NULL,
        npc_id TEXT,
        player_id TEXT,
        conversation_id TEXT,
        task_id TEXT,
        request_id TEXT,
        session_id TEXT,
        metadata TEXT,

        resolved INTEGER DEFAULT 0,
        resolved_at INTEGER,
        resolution_notes TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON error_log(timestamp);
      CREATE INDEX IF NOT EXISTS idx_errors_severity ON error_log(severity);
      CREATE INDEX IF NOT EXISTS idx_errors_source ON error_log(source);
      CREATE INDEX IF NOT EXISTS idx_errors_resolved ON error_log(resolved);
      CREATE INDEX IF NOT EXISTS idx_errors_type ON error_log(error_type);
    `);
  }

  private setupGlobalHandlers(): void {
    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.log(error, {
        source: 'system',
        operation: 'unhandledRejection',
        severity: 'high',
        metadata: { promise: String(promise) },
      });
    });

    // Catch uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.log(error, {
        source: 'system',
        operation: 'uncaughtException',
        severity: 'critical',
      });

      // Log but don't exit - let the process continue if possible
      console.error('[ErrorLogger] Uncaught exception logged, continuing...');
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Main Logging Function
  // ─────────────────────────────────────────────────────────────

  /**
   * Log an error with context
   */
  log(error: Error | unknown, context: ErrorContext): LoggedError {
    const err = error instanceof Error ? error : new Error(String(error));
    const severity = context.severity ?? this.detectSeverity(err);
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const loggedError: LoggedError = {
      id,
      timestamp,
      severity,
      error_type: err.constructor.name,
      message: err.message,
      stack: err.stack,
      code: (err as any).code,
      source: context.source,
      operation: context.operation,
      npc_id: context.npc_id,
      player_id: context.player_id,
      conversation_id: context.conversation_id,
      task_id: context.task_id,
      request_id: context.request_id,
      session_id: context.session_id,
      metadata: context.metadata,
      resolved: false,
    };

    // Persist to database
    if (this.db) {
      this.persist(loggedError);
    }

    // Emit event
    eventBus.fire(EventTypes.SYSTEM_ERROR, {
      error_type: loggedError.error_type,
      message: loggedError.message,
      stack: loggedError.stack,
      context: {
        source: context.source,
        operation: context.operation,
        ...context.metadata,
      },
    }, {
      source: context.source,
      npc_id: context.npc_id,
      player_id: context.player_id,
      conversation_id: context.conversation_id,
      session_id: context.session_id,
      importance: this.severityToImportance(severity),
    });

    // Console output with color coding
    this.consoleLog(loggedError);

    return loggedError;
  }

  /**
   * Wrapper for try/catch with automatic error logging
   */
  async wrap<T>(
    fn: () => T | Promise<T>,
    context: ErrorContext,
    options?: {
      rethrow?: boolean;      // Re-throw after logging (default: true)
      fallback?: T;           // Return this instead of throwing
    }
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.log(error, context);

      if (options?.fallback !== undefined) {
        return options.fallback;
      }

      if (options?.rethrow !== false) {
        throw error;
      }

      throw error; // TypeScript needs this
    }
  }

  /**
   * Synchronous wrapper for try/catch
   */
  wrapSync<T>(
    fn: () => T,
    context: ErrorContext,
    options?: {
      rethrow?: boolean;
      fallback?: T;
    }
  ): T {
    try {
      return fn();
    } catch (error) {
      this.log(error, context);

      if (options?.fallback !== undefined) {
        return options.fallback;
      }

      if (options?.rethrow !== false) {
        throw error;
      }

      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Query Functions
  // ─────────────────────────────────────────────────────────────

  /**
   * Get recent errors
   */
  getRecent(limit = 50): LoggedError[] {
    if (!this.db) return [];

    const rows = this.db.prepare(`
      SELECT * FROM error_log
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit);

    return rows.map(this.deserialize);
  }

  /**
   * Get errors by severity
   */
  getBySeverity(severity: ErrorSeverity, limit = 50): LoggedError[] {
    if (!this.db) return [];

    const rows = this.db.prepare(`
      SELECT * FROM error_log
      WHERE severity = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(severity, limit);

    return rows.map(this.deserialize);
  }

  /**
   * Get errors by source
   */
  getBySource(source: string, limit = 50): LoggedError[] {
    if (!this.db) return [];

    const rows = this.db.prepare(`
      SELECT * FROM error_log
      WHERE source = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(source, limit);

    return rows.map(this.deserialize);
  }

  /**
   * Get unresolved errors
   */
  getUnresolved(limit = 100): LoggedError[] {
    if (!this.db) return [];

    const rows = this.db.prepare(`
      SELECT * FROM error_log
      WHERE resolved = 0
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        timestamp DESC
      LIMIT ?
    `).all(limit);

    return rows.map(this.deserialize);
  }

  /**
   * Get error by ID
   */
  getById(id: string): LoggedError | null {
    if (!this.db) return null;

    const row = this.db.prepare('SELECT * FROM error_log WHERE id = ?').get(id);
    return row ? this.deserialize(row) : null;
  }

  /**
   * Search errors by message
   */
  search(query: string, limit = 50): LoggedError[] {
    if (!this.db) return [];

    const rows = this.db.prepare(`
      SELECT * FROM error_log
      WHERE message LIKE ? OR stack LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(`%${query}%`, `%${query}%`, limit);

    return rows.map(this.deserialize);
  }

  /**
   * Get error statistics
   */
  getStats(since?: number): {
    total: number;
    by_severity: Record<ErrorSeverity, number>;
    by_source: Record<string, number>;
    unresolved: number;
  } {
    if (!this.db) {
      return {
        total: 0,
        by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
        by_source: {},
        unresolved: 0,
      };
    }

    const whereClause = since ? 'WHERE timestamp > ?' : '';
    const params = since ? [since] : [];

    const total = this.db.prepare(`
      SELECT COUNT(*) as count FROM error_log ${whereClause}
    `).get(...params) as { count: number };

    const bySeverity = this.db.prepare(`
      SELECT severity, COUNT(*) as count FROM error_log ${whereClause} GROUP BY severity
    `).all(...params) as Array<{ severity: ErrorSeverity; count: number }>;

    const bySource = this.db.prepare(`
      SELECT source, COUNT(*) as count FROM error_log ${whereClause} GROUP BY source
    `).all(...params) as Array<{ source: string; count: number }>;

    const unresolved = this.db.prepare(`
      SELECT COUNT(*) as count FROM error_log WHERE resolved = 0 ${since ? 'AND timestamp > ?' : ''}
    `).get(...params) as { count: number };

    return {
      total: total.count,
      by_severity: {
        low: bySeverity.find(s => s.severity === 'low')?.count ?? 0,
        medium: bySeverity.find(s => s.severity === 'medium')?.count ?? 0,
        high: bySeverity.find(s => s.severity === 'high')?.count ?? 0,
        critical: bySeverity.find(s => s.severity === 'critical')?.count ?? 0,
      },
      by_source: Object.fromEntries(bySource.map(s => [s.source, s.count])),
      unresolved: unresolved.count,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Resolution
  // ─────────────────────────────────────────────────────────────

  /**
   * Mark an error as resolved
   */
  resolve(id: string, notes?: string): boolean {
    if (!this.db) return false;

    const result = this.db.prepare(`
      UPDATE error_log
      SET resolved = 1, resolved_at = ?, resolution_notes = ?
      WHERE id = ?
    `).run(Date.now(), notes ?? null, id);

    return result.changes > 0;
  }

  /**
   * Mark multiple errors as resolved
   */
  resolveMany(ids: string[], notes?: string): number {
    if (!this.db || ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const result = this.db.prepare(`
      UPDATE error_log
      SET resolved = 1, resolved_at = ?, resolution_notes = ?
      WHERE id IN (${placeholders})
    `).run(Date.now(), notes ?? null, ...ids);

    return result.changes;
  }

  // ─────────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────────

  private persist(error: LoggedError): void {
    if (!this.db) return;

    try {
      this.db.prepare(`
        INSERT INTO error_log (
          id, timestamp, severity,
          error_type, message, stack, code,
          source, operation, npc_id, player_id,
          conversation_id, task_id, request_id, session_id,
          metadata, resolved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        error.id,
        error.timestamp,
        error.severity,
        error.error_type,
        error.message,
        error.stack ?? null,
        error.code ?? null,
        error.source,
        error.operation,
        error.npc_id ?? null,
        error.player_id ?? null,
        error.conversation_id ?? null,
        error.task_id ?? null,
        error.request_id ?? null,
        error.session_id ?? null,
        error.metadata ? JSON.stringify(error.metadata) : null,
        error.resolved ? 1 : 0
      );
    } catch (err) {
      // Don't throw from error logger - just console
      console.error('[ErrorLogger] Failed to persist error:', err);
    }
  }

  private detectSeverity(error: Error): ErrorSeverity {
    const message = error.message;

    for (const pattern of this.criticalPatterns) {
      if (pattern.test(message)) return 'critical';
    }

    for (const pattern of this.highPatterns) {
      if (pattern.test(message)) return 'high';
    }

    for (const pattern of this.mediumPatterns) {
      if (pattern.test(message)) return 'medium';
    }

    return 'low';
  }

  private severityToImportance(severity: ErrorSeverity): number {
    switch (severity) {
      case 'critical': return 1.0;
      case 'high': return 0.8;
      case 'medium': return 0.6;
      case 'low': return 0.4;
    }
  }

  private consoleLog(error: LoggedError): void {
    const severityColors: Record<ErrorSeverity, string> = {
      critical: '\x1b[41m\x1b[37m', // Red background, white text
      high: '\x1b[31m',              // Red
      medium: '\x1b[33m',            // Yellow
      low: '\x1b[36m',               // Cyan
    };
    const reset = '\x1b[0m';
    const color = severityColors[error.severity];

    console.error(
      `${color}[ERROR:${error.severity.toUpperCase()}]${reset}`,
      `[${error.source}:${error.operation}]`,
      error.message
    );

    if (error.severity === 'critical' || error.severity === 'high') {
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }

  private deserialize(row: unknown): LoggedError {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      timestamp: r.timestamp as number,
      severity: r.severity as ErrorSeverity,
      error_type: r.error_type as string,
      message: r.message as string,
      stack: r.stack as string | undefined,
      code: r.code as string | undefined,
      source: r.source as string,
      operation: r.operation as string,
      npc_id: r.npc_id as string | undefined,
      player_id: r.player_id as string | undefined,
      conversation_id: r.conversation_id as string | undefined,
      task_id: r.task_id as string | undefined,
      request_id: r.request_id as string | undefined,
      session_id: r.session_id as string | undefined,
      metadata: r.metadata ? JSON.parse(r.metadata as string) : undefined,
      resolved: Boolean(r.resolved),
      resolved_at: r.resolved_at as number | undefined,
      resolution_notes: r.resolution_notes as string | undefined,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────────

export const errorLogger = new ErrorLogger();
export default errorLogger;
