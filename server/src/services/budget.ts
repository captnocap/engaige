import { getDB, generateId, now } from '../db/index.js';

// Budget configuration types
export interface BudgetConfig {
  overall_limit_cents: number;
  period_type: 'daily' | 'weekly' | 'monthly';
  rollover_enabled: boolean;
  max_rollover_days: number;
  allocations: Record<string, CategoryAllocation>;
}

export interface CategoryAllocation {
  percentage?: number; // 0-100, or use cents_override
  cents_override?: number; // Fixed amount instead of percentage
}

export interface BudgetStatus {
  period_start: number;
  period_end: number;
  overall_limit_cents: number;
  total_spent_cents: number;
  remaining_cents: number;
  rollover_available_cents: number;
  categories: CategoryStatus[];
}

export interface CategoryStatus {
  name: string;
  display_name: string;
  allocated_cents: number;
  spent_cents: number;
  remaining_cents: number;
}

export interface ApiCostLog {
  id: string;
  timestamp: number;
  provider: string;
  model: string;
  feature_category: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  cost_cents: number;
  request_metadata?: Record<string, any>;
}

// Initialize budget configuration (first-time setup)
export function initializeBudget(config: Partial<BudgetConfig>): void {
  const db = getDB('user');

  const defaultConfig: BudgetConfig = {
    overall_limit_cents: 1000, // $10 default
    period_type: 'monthly',
    rollover_enabled: true,
    max_rollover_days: 7,
    allocations: {
      conversation: { percentage: 35 },
      npc_generation: { percentage: 15 },
      autonomous_posts: { percentage: 10 },
      random_events: { percentage: 10 },
      vision_proxy: { percentage: 10 }, // For image analysis
      npc_tuning: { percentage: 5 },
      image_generation: { cents_override: 2000 }, // $20 fixed
      other: { percentage: 15 },
    },
    ...config,
  };

  db.prepare(`
    INSERT OR REPLACE INTO budget_config (
      id, overall_limit_cents, period_type, rollover_enabled, max_rollover_days, allocations, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?)
  `).run(
    defaultConfig.overall_limit_cents,
    defaultConfig.period_type,
    defaultConfig.rollover_enabled ? 1 : 0,
    defaultConfig.max_rollover_days,
    JSON.stringify(defaultConfig.allocations),
    now()
  );

  // Update category allocations
  for (const [category, allocation] of Object.entries(defaultConfig.allocations)) {
    db.prepare(`
      UPDATE feature_categories
      SET allocated_percentage = ?, allocated_cents_override = ?
      WHERE name = ?
    `).run(allocation.percentage || 0, allocation.cents_override || null, category);
  }
}

// Get current budget configuration
export function getBudgetConfig(): BudgetConfig {
  const db = getDB('user');
  const row = db.prepare('SELECT * FROM budget_config WHERE id = 1').get() as any;

  if (!row) {
    // Initialize with defaults if not exists
    initializeBudget({});
    return getBudgetConfig();
  }

  return {
    overall_limit_cents: row.overall_limit_cents,
    period_type: row.period_type,
    rollover_enabled: Boolean(row.rollover_enabled),
    max_rollover_days: row.max_rollover_days,
    allocations: JSON.parse(row.allocations || '{}'),
  };
}

// Update budget configuration
export function updateBudgetConfig(updates: Partial<BudgetConfig>): void {
  const db = getDB('user');
  const current = getBudgetConfig();
  const updated = { ...current, ...updates };

  db.prepare(`
    UPDATE budget_config
    SET overall_limit_cents = ?, period_type = ?, rollover_enabled = ?, max_rollover_days = ?, allocations = ?, updated_at = ?
    WHERE id = 1
  `).run(
    updated.overall_limit_cents,
    updated.period_type,
    updated.rollover_enabled ? 1 : 0,
    updated.max_rollover_days,
    JSON.stringify(updated.allocations),
    now()
  );

  // Update category allocations
  if (updates.allocations) {
    for (const [category, allocation] of Object.entries(updates.allocations)) {
      db.prepare(`
        UPDATE feature_categories
        SET allocated_percentage = ?, allocated_cents_override = ?
        WHERE name = ?
      `).run(allocation.percentage || 0, allocation.cents_override || null, category);
    }
  }
}

// Get current budget period boundaries
export function getCurrentPeriod(): { start: number; end: number } {
  const config = getBudgetConfig();
  const nowTimestamp = now();
  const date = new Date(nowTimestamp * 1000);

  let start: Date;
  let end: Date;

  if (config.period_type === 'daily') {
    start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (config.period_type === 'weekly') {
    const dayOfWeek = date.getDay();
    start = new Date(date);
    start.setDate(date.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else {
    // monthly
    start = new Date(date.getFullYear(), date.getMonth(), 1);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
  };
}

// Calculate rollover budget from unused periods
export function getRolloverBudget(): number {
  const config = getBudgetConfig();
  if (!config.rollover_enabled) return 0;

  const db = getDB('user');
  const { start: currentStart } = getCurrentPeriod();

  // Calculate how far back to look based on period type and max rollover days
  let lookbackPeriods = config.max_rollover_days;
  if (config.period_type === 'weekly') lookbackPeriods = Math.ceil(config.max_rollover_days / 7);
  if (config.period_type === 'monthly') lookbackPeriods = Math.ceil(config.max_rollover_days / 30);

  let rollover = 0;

  for (let i = 1; i <= lookbackPeriods; i++) {
    const periodStart = getPeriodStart(currentStart, config.period_type, -i);
    const periodEnd = getPeriodEnd(periodStart, config.period_type);

    const spent = db.prepare(`
      SELECT COALESCE(SUM(cost_cents), 0) as total
      FROM api_costs
      WHERE timestamp >= ? AND timestamp < ?
    `).get(periodStart, periodEnd) as any;

    const unused = config.overall_limit_cents - spent.total;
    if (unused > 0) rollover += unused;
  }

  return rollover;
}

// Helper to calculate period boundaries
function getPeriodStart(timestamp: number, periodType: string, offset: number): number {
  const date = new Date(timestamp * 1000);

  if (periodType === 'daily') {
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
  } else if (periodType === 'weekly') {
    date.setDate(date.getDate() + offset * 7);
    const dayOfWeek = date.getDay();
    date.setDate(date.getDate() - dayOfWeek);
    date.setHours(0, 0, 0, 0);
  } else {
    date.setMonth(date.getMonth() + offset);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
  }

  return Math.floor(date.getTime() / 1000);
}

function getPeriodEnd(periodStart: number, periodType: string): number {
  const date = new Date(periodStart * 1000);

  if (periodType === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (periodType === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  return Math.floor(date.getTime() / 1000);
}

// Get spending for current period by category
export function getSpendingByCategory(startDate?: number, endDate?: number): Map<string, number> {
  const db = getDB('user');
  const { start, end } = startDate && endDate ? { start: startDate, end: endDate } : getCurrentPeriod();

  const rows = db.prepare(`
    SELECT feature_category, SUM(cost_cents) as total
    FROM api_costs
    WHERE timestamp >= ? AND timestamp < ?
    GROUP BY feature_category
  `).all(start, end) as any[];

  const spending = new Map<string, number>();
  for (const row of rows) {
    spending.set(row.feature_category, row.total);
  }

  return spending;
}

// Get category allocation in cents
export function getCategoryAllocation(category: string): number {
  const config = getBudgetConfig();
  const allocation = config.allocations[category];

  if (!allocation) return 0;

  if (allocation.cents_override !== undefined) {
    return allocation.cents_override;
  }

  if (allocation.percentage !== undefined) {
    return Math.floor(config.overall_limit_cents * (allocation.percentage / 100));
  }

  return 0;
}

// Check if budget allows a request
export function checkBudgetAllows(category: string, estimatedCostCents: number): { allowed: boolean; reason?: string } {
  const db = getDB('user');
  const config = getBudgetConfig();
  const { start, end } = getCurrentPeriod();

  // Get total spent this period
  const totalSpent = db.prepare(`
    SELECT COALESCE(SUM(cost_cents), 0) as total
    FROM api_costs
    WHERE timestamp >= ? AND timestamp < ?
  `).get(start, end) as any;

  // Calculate available budget (including rollover)
  const rollover = getRolloverBudget();
  const totalAvailable = config.overall_limit_cents + rollover;

  if (totalSpent.total + estimatedCostCents > totalAvailable) {
    return {
      allowed: false,
      reason: `Would exceed overall budget limit. Available: ${totalAvailable - totalSpent.total} cents, needed: ${estimatedCostCents} cents`,
    };
  }

  // Check category-specific budget
  const categoryLimit = getCategoryAllocation(category);
  if (categoryLimit > 0) {
    const categorySpent = db.prepare(`
      SELECT COALESCE(SUM(cost_cents), 0) as total
      FROM api_costs
      WHERE timestamp >= ? AND timestamp < ? AND feature_category = ?
    `).get(start, end, category) as any;

    if (categorySpent.total + estimatedCostCents > categoryLimit) {
      return {
        allowed: false,
        reason: `Would exceed category budget for ${category}. Available: ${categoryLimit - categorySpent.total} cents, needed: ${estimatedCostCents} cents`,
      };
    }
  }

  return { allowed: true };
}

// Log an API cost
export function logApiCost(log: Omit<ApiCostLog, 'id' | 'timestamp'>): ApiCostLog {
  const db = getDB('user');
  const id = generateId();
  const timestamp = now();

  db.prepare(`
    INSERT INTO api_costs (
      id, timestamp, provider, model, feature_category,
      input_tokens, output_tokens, total_tokens, cost_cents, request_metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    timestamp,
    log.provider,
    log.model,
    log.feature_category,
    log.input_tokens || null,
    log.output_tokens || null,
    log.total_tokens || null,
    log.cost_cents,
    log.request_metadata ? JSON.stringify(log.request_metadata) : null
  );

  return {
    id,
    timestamp,
    ...log,
  };
}

// Get current budget status
export function getBudgetStatus(): BudgetStatus {
  const db = getDB('user');
  const config = getBudgetConfig();
  const { start, end } = getCurrentPeriod();

  const totalSpent = db.prepare(`
    SELECT COALESCE(SUM(cost_cents), 0) as total
    FROM api_costs
    WHERE timestamp >= ? AND timestamp < ?
  `).get(start, end) as any;

  const rollover = getRolloverBudget();
  const totalAvailable = config.overall_limit_cents + rollover;

  const spendingByCategory = getSpendingByCategory();

  // Get all categories
  const categories = db.prepare('SELECT name, display_name FROM feature_categories').all() as any[];

  const categoryStatuses: CategoryStatus[] = categories.map(cat => {
    const allocated = getCategoryAllocation(cat.name);
    const spent = spendingByCategory.get(cat.name) || 0;

    return {
      name: cat.name,
      display_name: cat.display_name,
      allocated_cents: allocated,
      spent_cents: spent,
      remaining_cents: Math.max(0, allocated - spent),
    };
  });

  return {
    period_start: start,
    period_end: end,
    overall_limit_cents: totalAvailable,
    total_spent_cents: totalSpent.total,
    remaining_cents: Math.max(0, totalAvailable - totalSpent.total),
    rollover_available_cents: rollover,
    categories: categoryStatuses,
  };
}

export default {
  initializeBudget,
  getBudgetConfig,
  updateBudgetConfig,
  getCurrentPeriod,
  getRolloverBudget,
  getSpendingByCategory,
  getCategoryAllocation,
  checkBudgetAllows,
  logApiCost,
  getBudgetStatus,
};
