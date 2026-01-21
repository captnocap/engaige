/**
 * Logs Routes
 *
 * Provides access to backend logging systems:
 * - Events: Master event log from the event bus
 * - Errors: Error log with severity and resolution tracking
 * - Queue: AI request queue status
 */

import { eventBus } from '../events/index.js';
import { errorLogger, type ErrorSeverity } from '../services/error-logger.js';
import { aiQueue, Priority } from '../services/ai-queue.js';

// ============================================================================
// Event Logs
// ============================================================================

export interface GetEventsParams {
  category?: string;
  limit?: number;
  offset?: number;
}

export function getEvents(params: GetEventsParams = {}) {
  const limit = params.limit ?? 100;

  let events;
  if (params.category && params.category !== 'all') {
    events = eventBus.getByCategory(params.category as any, limit);
  } else {
    events = eventBus.getRecent(limit);
  }

  // Serialize payloads for transport
  const serializedEvents = events.map(event => ({
    ...event,
    payload: JSON.stringify(event.payload),
  }));

  return {
    events: serializedEvents,
    total: serializedEvents.length,
  };
}

// ============================================================================
// Error Logs
// ============================================================================

export interface GetErrorsParams {
  severity?: ErrorSeverity;
  unresolved?: boolean;
  limit?: number;
}

export function getErrors(params: GetErrorsParams = {}) {
  const limit = params.limit ?? 100;

  let errors;
  if (params.unresolved) {
    errors = errorLogger.getUnresolved(limit);
  } else if (params.severity) {
    errors = errorLogger.getBySeverity(params.severity, limit);
  } else {
    errors = errorLogger.getRecent(limit);
  }

  // Serialize metadata for transport
  const serializedErrors = errors.map(error => ({
    ...error,
    metadata: error.metadata ? JSON.stringify(error.metadata) : undefined,
  }));

  return {
    errors: serializedErrors,
    total: serializedErrors.length,
    stats: errorLogger.getStats(),
  };
}

export interface ResolveErrorParams {
  errorId: string;
  notes?: string;
}

export function resolveError(params: ResolveErrorParams) {
  const success = errorLogger.resolve(params.errorId, params.notes);
  return { success };
}

// ============================================================================
// Queue Status
// ============================================================================

interface QueueItemForTransport {
  id: string;
  priority: number;
  priorityName: string;
  type: string;
  estimatedCost: number;
  npcId?: string;
  playerId?: string;
  featureCategory?: string;
  createdAt: number;
  attempts: number;
  lastError?: string;
  status: string;
}

export function getQueueStatus() {
  const status = aiQueue.getStatus();

  // Convert queue items to transport format
  const formatItems = (items: typeof status.queue, statusLabel: string): QueueItemForTransport[] => {
    return items.map(item => ({
      id: crypto.randomUUID(), // Queue items don't expose their IDs in status
      priority: item.priority,
      priorityName: getPriorityName(item.priority),
      type: 'queued',
      estimatedCost: 0,
      createdAt: Date.now(),
      attempts: 0,
      status: statusLabel,
    }));
  };

  // Calculate stats by priority
  const byPriority: Record<number, number> = {};
  for (const item of status.queue) {
    byPriority[item.priority] = (byPriority[item.priority] || 0) + item.count;
  }

  // Calculate stats by type (not available in current status, so use empty)
  const byType: Record<string, number> = {};

  return {
    active: status.queue.map(q => ({
      id: `queue_${q.priority}`,
      priority: q.priority,
      priorityName: getPriorityName(q.priority),
      type: 'queued',
      estimatedCost: 0,
      createdAt: Date.now(),
      attempts: 0,
      status: 'queued',
      count: q.count,
    })),
    deferred: status.deferred.map(d => ({
      id: `deferred_${d.priority}`,
      priority: d.priority,
      priorityName: getPriorityName(d.priority),
      type: 'deferred',
      estimatedCost: 0,
      createdAt: Date.now(),
      attempts: 0,
      status: 'deferred',
      count: d.count,
    })),
    processing: status.processing,
    stats: {
      total: status.stats.totalQueued,
      totalProcessed: status.stats.totalProcessed,
      totalDeferred: status.stats.totalDeferred,
      totalExpired: status.stats.totalExpired,
      totalFailed: status.stats.totalFailed,
      totalCostCents: status.stats.totalCostCents,
      byPriority,
      byType,
    },
    budget: status.budgetStatus,
  };
}

function getPriorityName(priority: number): string {
  const names: Record<number, string> = {
    [Priority.CRITICAL]: 'CRITICAL',
    [Priority.HIGH]: 'HIGH',
    [Priority.MEDIUM]: 'MEDIUM',
    [Priority.LOW]: 'LOW',
    [Priority.IDLE]: 'IDLE',
  };
  return names[priority] || `P${priority}`;
}

// ============================================================================
// Factory for route handlers
// ============================================================================

export function createLogsRoutes() {
  return {
    getEvents,
    getErrors,
    resolveError,
    getQueueStatus,
  };
}
