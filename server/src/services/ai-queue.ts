/**
 * AI Request Queue - Priority-Based Request Management
 *
 * ALL AI requests go through this queue. It manages:
 * - Priority-based execution (user DMs > background posts)
 * - Budget reservation per priority tier
 * - Request deferral when budget is low
 * - Automatic processing when budget refreshes
 *
 * Usage:
 *   import { aiQueue, Priority } from '../services/ai-queue.js';
 *
 *   // Queue a request
 *   const result = await aiQueue.enqueue({
 *     priority: Priority.CRITICAL,
 *     type: 'npc_response',
 *     npcId: 'npc_123',
 *     execute: async () => generateNPCResponse(...),
 *     estimatedCost: 0.02,
 *   });
 */

import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';
import { getBudgetStatus, checkBudgetAllows } from './budget.js';

// ─────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────

/**
 * Priority tiers - lower number = higher priority
 */
export enum Priority {
  CRITICAL = 1,  // User-initiated (DMs, direct requests)
  HIGH = 2,      // User-adjacent (NPC follow-ups, reactions)
  MEDIUM = 3,    // Game mechanics (NPC initiates, scheduled events)
  LOW = 4,       // Background (NPC posts, NPC-NPC interactions)
  IDLE = 5,      // Opportunistic (pre-generation, analytics)
}

/**
 * Priority tier configuration
 */
interface TierConfig {
  name: string;
  budgetReservePercent: number;  // % of daily budget reserved for this tier
  minBudgetPercent: number;      // Minimum remaining budget to process
  canDefer: boolean;             // Whether requests can be deferred
  maxQueueTime: number;          // Max time in queue before expiring (ms)
}

const TIER_CONFIG: Record<Priority, TierConfig> = {
  [Priority.CRITICAL]: {
    name: 'Critical',
    budgetReservePercent: 40,
    minBudgetPercent: 0,      // Always runs, even at 0%
    canDefer: false,          // Never deferred
    maxQueueTime: 30_000,     // 30 seconds max wait
  },
  [Priority.HIGH]: {
    name: 'High',
    budgetReservePercent: 25,
    minBudgetPercent: 5,      // Needs at least 5% budget
    canDefer: true,
    maxQueueTime: 60_000,     // 1 minute
  },
  [Priority.MEDIUM]: {
    name: 'Medium',
    budgetReservePercent: 20,
    minBudgetPercent: 35,     // Needs 35% budget
    canDefer: true,
    maxQueueTime: 300_000,    // 5 minutes
  },
  [Priority.LOW]: {
    name: 'Low',
    budgetReservePercent: 10,
    minBudgetPercent: 50,     // Needs 50% budget
    canDefer: true,
    maxQueueTime: 3600_000,   // 1 hour
  },
  [Priority.IDLE]: {
    name: 'Idle',
    budgetReservePercent: 5,
    minBudgetPercent: 80,     // Only runs when budget > 80%
    canDefer: true,
    maxQueueTime: 86400_000,  // 24 hours (until next reset)
  },
};

/**
 * Request types for categorization
 */
export type RequestType =
  | 'npc_response'           // NPC responding to user
  | 'npc_post'               // NPC creating a post
  | 'npc_comment'            // NPC commenting on something
  | 'npc_reaction'           // NPC reacting to user action
  | 'npc_initiate'           // NPC starting conversation
  | 'npc_npc_interaction'    // NPC-to-NPC interaction
  | 'image_generation'       // Image creation
  | 'image_analysis'         // Vision/image analysis
  | 'memory_consolidation'   // Memory processing
  | 'content_pregeneration'  // Pre-generating content
  | 'analytics'              // Analytics/summaries
  | 'other';

/**
 * A queued AI request
 */
export interface QueuedRequest<T = unknown> {
  id: string;
  priority: Priority;
  type: RequestType;

  // Execution
  execute: () => Promise<T>;
  estimatedCost: number;      // Estimated cost in cents

  // Context
  npcId?: string;
  playerId?: string;
  conversationId?: string;
  featureCategory?: string;

  // Metadata
  metadata?: Record<string, unknown>;

  // Internal tracking
  createdAt: number;
  attempts: number;
  lastError?: string;
}

/**
 * Request status
 */
export type RequestStatus =
  | 'queued'      // Waiting in queue
  | 'processing'  // Currently executing
  | 'completed'   // Successfully completed
  | 'deferred'    // Moved to deferred queue (budget)
  | 'expired'     // Timed out in queue
  | 'failed'      // Failed after retries
  | 'rejected';   // Rejected (budget exhausted for critical)

/**
 * Result of a queue operation
 */
export interface QueueResult<T = unknown> {
  status: RequestStatus;
  requestId: string;
  result?: T;
  error?: string;
  waitTime: number;        // Time spent in queue (ms)
  actualCost?: number;     // Actual cost in cents
}

// ─────────────────────────────────────────────────────────────────
// AI Queue Service
// ─────────────────────────────────────────────────────────────────

class AIQueue {
  // Active queue (priority-ordered)
  private queue: QueuedRequest[] = [];

  // Deferred queue (waiting for budget)
  private deferredQueue: QueuedRequest[] = [];

  // Currently processing
  private processing: Set<string> = new Set();

  // Concurrency limit
  private maxConcurrent = 3;

  // Processing interval
  private processInterval: Timer | null = null;

  // Stats
  private stats = {
    totalQueued: 0,
    totalProcessed: 0,
    totalDeferred: 0,
    totalExpired: 0,
    totalFailed: 0,
    totalCostCents: 0,
  };

  // ─────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────

  /**
   * Start the queue processor
   */
  start(): void {
    if (this.processInterval) return;

    // Process queue every 100ms
    this.processInterval = setInterval(() => this.processQueue(), 100);

    // Check for expired requests every 10 seconds
    setInterval(() => this.expireOldRequests(), 10_000);

    // Check deferred queue every minute
    setInterval(() => this.checkDeferredQueue(), 60_000);

    console.log('[AIQueue] Started - processing requests');
  }

  /**
   * Stop the queue processor
   */
  stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
    console.log('[AIQueue] Stopped');
  }

  // ─────────────────────────────────────────────────────────────
  // Main API
  // ─────────────────────────────────────────────────────────────

  /**
   * Enqueue an AI request
   * Returns a promise that resolves when the request completes
   */
  async enqueue<T>(request: Omit<QueuedRequest<T>, 'id' | 'createdAt' | 'attempts'>): Promise<QueueResult<T>> {
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const queuedRequest: QueuedRequest<T> = {
      ...request,
      id,
      createdAt,
      attempts: 0,
    };

    this.stats.totalQueued++;

    // Check if we should defer immediately based on budget
    const shouldDefer = this.shouldDeferRequest(queuedRequest);

    if (shouldDefer.defer) {
      if (!TIER_CONFIG[request.priority].canDefer) {
        // Critical requests that can't be deferred - warn but process
        console.warn(`[AIQueue] Critical request proceeding despite low budget`);
      } else {
        // Defer the request
        return this.deferRequest(queuedRequest, shouldDefer.reason);
      }
    }

    // Add to queue
    this.queue.push(queuedRequest);
    this.sortQueue();

    // Emit queued event
    eventBus.fire(EventTypes.AI_QUEUED, {
      request_id: id,
      priority: request.priority,
      priority_name: TIER_CONFIG[request.priority].name,
      type: request.type,
      estimated_cost: request.estimatedCost,
      queue_position: this.queue.findIndex(r => r.id === id) + 1,
      queue_length: this.queue.length,
    }, {
      source: 'ai-queue',
      npc_id: request.npcId,
      player_id: request.playerId,
      conversation_id: request.conversationId,
    });

    // Wait for completion
    return this.waitForCompletion<T>(id);
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queue: { priority: Priority; count: number }[];
    deferred: { priority: Priority; count: number }[];
    processing: number;
    stats: typeof this.stats;
    budgetStatus: ReturnType<typeof getBudgetStatus>;
  } {
    const queueByPriority = this.countByPriority(this.queue);
    const deferredByPriority = this.countByPriority(this.deferredQueue);

    return {
      queue: queueByPriority,
      deferred: deferredByPriority,
      processing: this.processing.size,
      stats: { ...this.stats },
      budgetStatus: getBudgetStatus(),
    };
  }

  /**
   * Get pending requests for a specific NPC
   */
  getPendingForNPC(npcId: string): QueuedRequest[] {
    return [
      ...this.queue.filter(r => r.npcId === npcId),
      ...this.deferredQueue.filter(r => r.npcId === npcId),
    ];
  }

  /**
   * Cancel a pending request
   */
  cancel(requestId: string): boolean {
    const queueIndex = this.queue.findIndex(r => r.id === requestId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
      return true;
    }

    const deferredIndex = this.deferredQueue.findIndex(r => r.id === requestId);
    if (deferredIndex !== -1) {
      this.deferredQueue.splice(deferredIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Cancel all pending requests for an NPC
   */
  cancelForNPC(npcId: string): number {
    const beforeQueue = this.queue.length;
    const beforeDeferred = this.deferredQueue.length;

    this.queue = this.queue.filter(r => r.npcId !== npcId);
    this.deferredQueue = this.deferredQueue.filter(r => r.npcId !== npcId);

    return (beforeQueue - this.queue.length) + (beforeDeferred - this.deferredQueue.length);
  }

  // ─────────────────────────────────────────────────────────────
  // Queue Processing
  // ─────────────────────────────────────────────────────────────

  private async processQueue(): Promise<void> {
    // Don't process if at concurrency limit
    if (this.processing.size >= this.maxConcurrent) return;

    // Get next request that can be processed
    const request = this.getNextProcessable();
    if (!request) return;

    // Remove from queue and mark as processing
    const index = this.queue.findIndex(r => r.id === request.id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
    this.processing.add(request.id);

    // Process the request
    this.executeRequest(request);
  }

  private getNextProcessable(): QueuedRequest | null {
    const budgetStatus = getBudgetStatus();
    const remainingPercent = (budgetStatus.remaining_cents / budgetStatus.daily_limit_cents) * 100;

    for (const request of this.queue) {
      const tierConfig = TIER_CONFIG[request.priority];

      // Check if this tier can run at current budget level
      if (remainingPercent < tierConfig.minBudgetPercent) {
        // Can't process this tier - check if we should defer
        if (tierConfig.canDefer) {
          continue; // Skip to next request
        }
        // Critical request - process anyway but warn
      }

      // Check if we have enough budget for this specific request
      const budgetCheck = checkBudgetAllows(
        request.featureCategory || 'other',
        request.estimatedCost
      );

      if (!budgetCheck.allowed && tierConfig.canDefer) {
        continue; // Skip, try next request
      }

      return request;
    }

    return null;
  }

  private async executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
    const startTime = Date.now();
    request.attempts++;

    // Emit processing event
    eventBus.fire(EventTypes.AI_PROCESSING, {
      request_id: request.id,
      priority: request.priority,
      type: request.type,
      attempt: request.attempts,
    }, {
      source: 'ai-queue',
      npc_id: request.npcId,
      player_id: request.playerId,
    });

    try {
      const result = await request.execute();

      const waitTime = startTime - request.createdAt;
      const processingTime = Date.now() - startTime;

      this.stats.totalProcessed++;
      this.stats.totalCostCents += request.estimatedCost; // Will be updated by actual cost

      // Emit completed event
      eventBus.fire(EventTypes.AI_QUEUE_COMPLETED, {
        request_id: request.id,
        priority: request.priority,
        type: request.type,
        wait_time_ms: waitTime,
        processing_time_ms: processingTime,
        estimated_cost: request.estimatedCost,
      }, {
        source: 'ai-queue',
        npc_id: request.npcId,
        player_id: request.playerId,
      });

      // Resolve the waiting promise
      this.resolveRequest(request.id, {
        status: 'completed',
        requestId: request.id,
        result,
        waitTime,
        actualCost: request.estimatedCost, // Updated by actual logging
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      request.lastError = errorMessage;

      errorLogger.log(error, {
        source: 'ai-queue',
        operation: 'executeRequest',
        npc_id: request.npcId,
        player_id: request.playerId,
        metadata: {
          request_id: request.id,
          type: request.type,
          priority: request.priority,
          attempt: request.attempts,
        },
      });

      // Retry logic for transient errors
      if (request.attempts < 3 && this.isRetryableError(errorMessage)) {
        // Re-queue with exponential backoff
        setTimeout(() => {
          this.queue.unshift(request); // Add to front
          this.sortQueue();
        }, Math.pow(2, request.attempts) * 1000);

        return;
      }

      this.stats.totalFailed++;

      // Emit failed event
      eventBus.fire(EventTypes.AI_QUEUE_FAILED, {
        request_id: request.id,
        priority: request.priority,
        type: request.type,
        error: errorMessage,
        attempts: request.attempts,
      }, {
        source: 'ai-queue',
        npc_id: request.npcId,
        importance: 0.7,
      });

      // Resolve with error
      this.resolveRequest(request.id, {
        status: 'failed',
        requestId: request.id,
        error: errorMessage,
        waitTime: Date.now() - request.createdAt,
      });

    } finally {
      this.processing.delete(request.id);
    }
  }

  private isRetryableError(error: string): boolean {
    const retryablePatterns = [
      /rate.*limit/i,
      /timeout/i,
      /temporarily.*unavailable/i,
      /503/,
      /429/,
      /network.*error/i,
    ];
    return retryablePatterns.some(p => p.test(error));
  }

  // ─────────────────────────────────────────────────────────────
  // Deferral Logic
  // ─────────────────────────────────────────────────────────────

  private shouldDeferRequest(request: QueuedRequest): { defer: boolean; reason: string } {
    const tierConfig = TIER_CONFIG[request.priority];

    // Critical requests are never deferred
    if (!tierConfig.canDefer) {
      return { defer: false, reason: '' };
    }

    const budgetStatus = getBudgetStatus();
    const remainingPercent = (budgetStatus.remaining_cents / budgetStatus.daily_limit_cents) * 100;

    // Check if budget is below minimum for this tier
    if (remainingPercent < tierConfig.minBudgetPercent) {
      return {
        defer: true,
        reason: `Budget at ${remainingPercent.toFixed(1)}%, tier requires ${tierConfig.minBudgetPercent}%`,
      };
    }

    // Check budget reservation for higher priorities
    const reservedForHigher = this.calculateReservedBudget(request.priority);
    const availableAfterReserve = budgetStatus.remaining_cents - reservedForHigher;

    if (availableAfterReserve < request.estimatedCost) {
      return {
        defer: true,
        reason: `Budget reserved for higher priority requests`,
      };
    }

    return { defer: false, reason: '' };
  }

  private calculateReservedBudget(belowPriority: Priority): number {
    const budgetStatus = getBudgetStatus();
    let reserved = 0;

    for (let p = Priority.CRITICAL; p < belowPriority; p++) {
      const tierConfig = TIER_CONFIG[p as Priority];
      reserved += (budgetStatus.daily_limit_cents * tierConfig.budgetReservePercent) / 100;
    }

    return reserved;
  }

  private async deferRequest<T>(request: QueuedRequest<T>, reason: string): Promise<QueueResult<T>> {
    this.deferredQueue.push(request);
    this.stats.totalDeferred++;

    // Emit deferred event
    eventBus.fire(EventTypes.AI_DEFERRED, {
      request_id: request.id,
      priority: request.priority,
      priority_name: TIER_CONFIG[request.priority].name,
      type: request.type,
      reason,
      deferred_queue_length: this.deferredQueue.length,
    }, {
      source: 'ai-queue',
      npc_id: request.npcId,
      importance: 0.5,
    });

    console.log(`[AIQueue] Deferred ${TIER_CONFIG[request.priority].name} request: ${reason}`);

    // Return immediately with deferred status
    // The request will be processed later when budget allows
    return {
      status: 'deferred',
      requestId: request.id,
      error: reason,
      waitTime: 0,
    };
  }

  private checkDeferredQueue(): void {
    if (this.deferredQueue.length === 0) return;

    const budgetStatus = getBudgetStatus();
    const remainingPercent = (budgetStatus.remaining_cents / budgetStatus.daily_limit_cents) * 100;

    // Sort deferred by priority
    this.deferredQueue.sort((a, b) => a.priority - b.priority);

    // Try to move requests back to main queue
    const toMove: QueuedRequest[] = [];

    for (const request of this.deferredQueue) {
      const tierConfig = TIER_CONFIG[request.priority];

      if (remainingPercent >= tierConfig.minBudgetPercent) {
        toMove.push(request);
      }
    }

    if (toMove.length > 0) {
      // Remove from deferred
      this.deferredQueue = this.deferredQueue.filter(
        r => !toMove.find(m => m.id === r.id)
      );

      // Add to main queue
      this.queue.push(...toMove);
      this.sortQueue();

      console.log(`[AIQueue] Moved ${toMove.length} requests from deferred queue`);

      // Emit event
      eventBus.fire(EventTypes.AI_QUEUE_RESUMED, {
        count: toMove.length,
        budget_percent: remainingPercent,
      }, {
        source: 'ai-queue',
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Expiration
  // ─────────────────────────────────────────────────────────────

  private expireOldRequests(): void {
    const now = Date.now();
    const expired: QueuedRequest[] = [];

    // Check main queue
    this.queue = this.queue.filter(request => {
      const tierConfig = TIER_CONFIG[request.priority];
      const age = now - request.createdAt;

      if (age > tierConfig.maxQueueTime) {
        expired.push(request);
        return false;
      }
      return true;
    });

    // Check deferred queue
    this.deferredQueue = this.deferredQueue.filter(request => {
      const tierConfig = TIER_CONFIG[request.priority];
      const age = now - request.createdAt;

      if (age > tierConfig.maxQueueTime) {
        expired.push(request);
        return false;
      }
      return true;
    });

    // Handle expired requests
    for (const request of expired) {
      this.stats.totalExpired++;

      eventBus.fire(EventTypes.AI_QUEUE_EXPIRED, {
        request_id: request.id,
        priority: request.priority,
        type: request.type,
        age_ms: now - request.createdAt,
      }, {
        source: 'ai-queue',
        npc_id: request.npcId,
      });

      this.resolveRequest(request.id, {
        status: 'expired',
        requestId: request.id,
        error: 'Request expired in queue',
        waitTime: now - request.createdAt,
      });
    }

    if (expired.length > 0) {
      console.log(`[AIQueue] Expired ${expired.length} old requests`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Promise Management
  // ─────────────────────────────────────────────────────────────

  private pendingPromises = new Map<string, {
    resolve: (result: QueueResult) => void;
    reject: (error: Error) => void;
  }>();

  private waitForCompletion<T>(requestId: string): Promise<QueueResult<T>> {
    return new Promise((resolve, reject) => {
      this.pendingPromises.set(requestId, {
        resolve: resolve as (result: QueueResult) => void,
        reject
      });
    });
  }

  private resolveRequest(requestId: string, result: QueueResult): void {
    const pending = this.pendingPromises.get(requestId);
    if (pending) {
      pending.resolve(result);
      this.pendingPromises.delete(requestId);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private sortQueue(): void {
    // Sort by priority (ascending), then by creation time (ascending)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.createdAt - b.createdAt;
    });
  }

  private countByPriority(queue: QueuedRequest[]): { priority: Priority; count: number }[] {
    const counts = new Map<Priority, number>();

    for (const request of queue) {
      counts.set(request.priority, (counts.get(request.priority) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));
  }
}

// ─────────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────────

export const aiQueue = new AIQueue();

// ─────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────

/**
 * Determine priority based on request context
 */
export function determinePriority(context: {
  isUserInitiated: boolean;
  isConversationActive: boolean;
  isScheduled: boolean;
  isBackground: boolean;
}): Priority {
  if (context.isUserInitiated) {
    return Priority.CRITICAL;
  }

  if (context.isConversationActive) {
    return Priority.HIGH;
  }

  if (context.isScheduled) {
    return Priority.MEDIUM;
  }

  if (context.isBackground) {
    return Priority.LOW;
  }

  return Priority.IDLE;
}

/**
 * Get human-readable priority name
 */
export function getPriorityName(priority: Priority): string {
  return TIER_CONFIG[priority].name;
}

export default aiQueue;
