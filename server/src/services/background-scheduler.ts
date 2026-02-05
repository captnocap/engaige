// Background task scheduler for autonomous NPC behaviors

import { getDB, generateId, now } from '../db/index.js';
import { checkBudgetAllows, getBudgetStatus } from './budget.js';
import { eventBus, EventTypes } from '../events/index.js';

export type TaskType =
  | 'generate_memory'
  | 'analyze_relationship'
  | 'populate_profile'
  | 'generate_post'
  | 'react_to_post'
  | 'initiate_conversation'
  | 'send_scheduled_message'
  | 'generate_news_stories'
  | 'refresh_rss_feeds'
  | 'generate_npc_wave';

export interface BackgroundTask {
  id: string;
  task_type: TaskType;
  npc_id?: string;
  player_id?: string;
  priority: number; // 0-10 (10 = highest)
  scheduled_for: number;
  executed_at?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  error_message?: string;
  budget_category: string;
}

// Task handlers registry
type TaskHandler = (task: BackgroundTask) => Promise<void>;
const taskHandlers: Map<TaskType, TaskHandler> = new Map();

// Register a task handler
export function registerTaskHandler(taskType: TaskType, handler: TaskHandler): void {
  taskHandlers.set(taskType, handler);
  console.log(`[Scheduler] Registered handler for ${taskType}`);
}

// Schedule a background task
export function scheduleTask(
  taskType: TaskType,
  options: {
    npc_id?: string;
    player_id?: string;
    priority?: number;
    delay_seconds?: number;
    metadata?: Record<string, any>;
    budget_category?: string;
  } = {}
): BackgroundTask {
  const db = getDB('game');
  const id = generateId();

  const scheduledFor = now() + (options.delay_seconds || 0);

  const task: BackgroundTask = {
    id,
    task_type: taskType,
    npc_id: options.npc_id,
    player_id: options.player_id,
    priority: options.priority || 5,
    scheduled_for: scheduledFor,
    status: 'pending',
    metadata: options.metadata,
    budget_category: options.budget_category || inferBudgetCategory(taskType),
  };

  db.prepare(`
    INSERT INTO npc_activities (id, npc_id, activity_type, scheduled_for, status, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    task.npc_id || null,
    taskType,
    scheduledFor,
    'pending',
    JSON.stringify({ ...task.metadata, budget_category: task.budget_category, priority: task.priority })
  );

  // Emit task scheduled event
  eventBus.fire(EventTypes.SCHEDULER_TASK_SCHEDULED, {
    task_id: id,
    task_type: taskType,
    scheduled_for: scheduledFor,
    priority: task.priority,
    budget_category: task.budget_category,
  }, {
    source: 'scheduler',
    npc_id: task.npc_id,
    importance: 0.3,
  });

  return task;
}

// Infer budget category from task type
function inferBudgetCategory(taskType: TaskType): string {
  const categoryMap: Record<TaskType, string> = {
    generate_memory: 'autonomous_posts',
    analyze_relationship: 'conversation',
    populate_profile: 'npc_generation',
    generate_post: 'autonomous_posts',
    react_to_post: 'autonomous_posts',
    initiate_conversation: 'random_events',
    send_scheduled_message: 'conversation',
    generate_news_stories: 'story_generation',
    refresh_rss_feeds: 'other',
    generate_npc_wave: 'npc_generation',
  };

  return categoryMap[taskType] || 'other';
}

// Process pending tasks (called periodically)
export async function processTasks(maxTasks = 10): Promise<{
  processed: number;
  skipped: number;
  failed: number;
}> {
  const db = getDB('game');
  const currentTime = now();

  // Get pending tasks that are ready to execute
  const tasks = db.prepare(`
    SELECT * FROM npc_activities
    WHERE status = 'pending' AND scheduled_for <= ?
    ORDER BY scheduled_for ASC, metadata->>'priority' DESC
    LIMIT ?
  `).all(currentTime, maxTasks) as any[];

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const taskRow of tasks) {
    const task = parseTask(taskRow);
    const handler = taskHandlers.get(task.task_type);

    if (!handler) {
      console.warn(`[Scheduler] No handler for task type: ${task.task_type}`);
      skipped++;
      continue;
    }

    // Check budget before executing (estimate 100 cents per task)
    const budgetCheck = checkBudgetAllows(task.budget_category, 100);
    if (!budgetCheck.allowed) {
      console.log(`[Scheduler] Task ${task.id} skipped: ${budgetCheck.reason}`);
      // Mark as cancelled due to budget
      db.prepare(`
        UPDATE npc_activities SET status = 'cancelled', metadata = ? WHERE id = ?
      `).run(JSON.stringify({ ...task.metadata, cancel_reason: budgetCheck.reason }), task.id);

      // Emit task cancelled event
      eventBus.fire(EventTypes.SCHEDULER_TASK_CANCELLED, {
        task_id: task.id,
        task_type: task.task_type,
        error_message: budgetCheck.reason,
      }, {
        source: 'scheduler',
        npc_id: task.npc_id,
        importance: 0.5,
      });

      skipped++;
      continue;
    }

    // Execute task
    const taskStartTime = Date.now();
    try {
      // Mark as running
      db.prepare(`
        UPDATE npc_activities SET status = 'running' WHERE id = ?
      `).run(task.id);

      // Emit task started event
      eventBus.fire(EventTypes.SCHEDULER_TASK_STARTED, {
        task_id: task.id,
        task_type: task.task_type,
      }, {
        source: 'scheduler',
        npc_id: task.npc_id,
        importance: 0.3,
      });

      await handler(task);

      // Mark as completed
      db.prepare(`
        UPDATE npc_activities SET status = 'completed', executed_at = ? WHERE id = ?
      `).run(now(), task.id);

      // Emit task completed event
      eventBus.fire(EventTypes.SCHEDULER_TASK_COMPLETED, {
        task_id: task.id,
        task_type: task.task_type,
        duration_ms: Date.now() - taskStartTime,
      }, {
        source: 'scheduler',
        npc_id: task.npc_id,
        importance: 0.4,
      });

      processed++;
    } catch (error: any) {
      console.error(`[Scheduler] Task ${task.id} failed:`, error.message);

      // Mark as failed
      db.prepare(`
        UPDATE npc_activities SET status = 'failed', metadata = ? WHERE id = ?
      `).run(
        JSON.stringify({ ...task.metadata, error: error.message }),
        task.id
      );

      // Emit task failed event
      eventBus.fire(EventTypes.SCHEDULER_TASK_FAILED, {
        task_id: task.id,
        task_type: task.task_type,
        duration_ms: Date.now() - taskStartTime,
        error_message: error.message,
      }, {
        source: 'scheduler',
        npc_id: task.npc_id,
        importance: 0.7,
      });

      failed++;
    }
  }

  return { processed, skipped, failed };
}

// Start background scheduler (runs every N seconds)
let schedulerInterval: Timer | null = null;

export function startScheduler(intervalSeconds = 30): void {
  if (schedulerInterval) {
    console.warn('[Scheduler] Already running');
    return;
  }

  console.log(`[Scheduler] Starting with ${intervalSeconds}s interval`);

  schedulerInterval = setInterval(async () => {
    const budget = getBudgetStatus();

    // Don't process if budget is exhausted
    if (budget.remaining_cents < 10) {
      console.log('[Scheduler] Budget exhausted, skipping task processing');
      return;
    }

    const result = await processTasks(10);

    if (result.processed > 0 || result.skipped > 0 || result.failed > 0) {
      console.log(`[Scheduler] Processed: ${result.processed}, Skipped: ${result.skipped}, Failed: ${result.failed}`);
    }
  }, intervalSeconds * 1000);
}

export function stopScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Stopped');
  }
}

// Get task status
export function getTaskStatus(taskId: string): BackgroundTask | null {
  const db = getDB('game');
  const task = db.prepare('SELECT * FROM npc_activities WHERE id = ?').get(taskId) as any;
  if (!task) return null;

  return parseTask(task);
}

// Cancel a pending task
export function cancelTask(taskId: string): boolean {
  const db = getDB('game');
  const result = db.prepare(`
    UPDATE npc_activities SET status = 'cancelled' WHERE id = ? AND status = 'pending'
  `).run(taskId);

  return result.changes > 0;
}

// Get all pending tasks
export function getPendingTasks(npcId?: string): BackgroundTask[] {
  const db = getDB('game');

  const query = npcId
    ? 'SELECT * FROM npc_activities WHERE status = \'pending\' AND npc_id = ? ORDER BY scheduled_for ASC'
    : 'SELECT * FROM npc_activities WHERE status = \'pending\' ORDER BY scheduled_for ASC';

  const params = npcId ? [npcId] : [];
  return db.prepare(query).all(...params).map((t: any) => parseTask(t));
}

// Helper to parse task from database
function parseTask(task: any): BackgroundTask {
  const metadata = task.metadata ? JSON.parse(task.metadata) : {};

  return {
    id: task.id,
    task_type: task.activity_type,
    npc_id: task.npc_id,
    player_id: metadata.player_id,
    priority: metadata.priority || 5,
    scheduled_for: task.scheduled_for,
    executed_at: task.executed_at,
    status: task.status,
    metadata: metadata,
    error_message: metadata.error,
    budget_category: metadata.budget_category || 'other',
  };
}

export default {
  registerTaskHandler,
  scheduleTask,
  processTasks,
  startScheduler,
  stopScheduler,
  getTaskStatus,
  cancelTask,
  getPendingTasks,
};
