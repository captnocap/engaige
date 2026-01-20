import { getDB } from '../db/index.js';
import {
  getBudgetStatus,
  getBudgetConfig,
  updateBudgetConfig,
  type BudgetConfig,
  type ApiCostLog,
} from '../services/budget.js';

export interface LogQueryParams {
  category?: string;
  limit?: number;
  offset?: number;
  startDate?: number;
  endDate?: number;
}

export interface LogsResponse {
  logs: ApiCostLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface CategoryInfo {
  name: string;
  display_name: string;
  description: string;
}

// Get activity logs with filtering and pagination
export function getLogs(params: LogQueryParams): LogsResponse {
  const db = getDB('user');
  const limit = Math.min(params.limit || 50, 200);
  const offset = params.offset || 0;

  let whereClause = '1=1';
  const queryParams: any[] = [];

  if (params.category && params.category !== 'all') {
    whereClause += ' AND feature_category = ?';
    queryParams.push(params.category);
  }

  if (params.startDate) {
    whereClause += ' AND timestamp >= ?';
    queryParams.push(params.startDate);
  }

  if (params.endDate) {
    whereClause += ' AND timestamp < ?';
    queryParams.push(params.endDate);
  }

  // Get total count
  const countResult = db.prepare(`
    SELECT COUNT(*) as total FROM api_costs WHERE ${whereClause}
  `).get(...queryParams) as { total: number };

  // Get logs with pagination
  const logs = db.prepare(`
    SELECT * FROM api_costs
    WHERE ${whereClause}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
  `).all(...queryParams, limit, offset) as any[];

  return {
    logs: logs.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      provider: row.provider,
      model: row.model,
      feature_category: row.feature_category,
      input_tokens: row.input_tokens,
      output_tokens: row.output_tokens,
      total_tokens: row.total_tokens,
      cost_cents: row.cost_cents,
      request_metadata: row.request_metadata ? JSON.parse(row.request_metadata) : undefined,
    })),
    total: countResult.total,
    limit,
    offset,
  };
}

// Get all available categories
export function getCategories(): CategoryInfo[] {
  const db = getDB('user');
  const rows = db.prepare('SELECT name, display_name, description FROM feature_categories').all() as any[];

  return rows.map(row => ({
    name: row.name,
    display_name: row.display_name,
    description: row.description || '',
  }));
}

// Route handler factory
export function createBudgetRoutes() {
  return {
    // GET /api/budget/status
    getStatus: () => {
      return getBudgetStatus();
    },

    // GET /api/budget/config
    getConfig: () => {
      return getBudgetConfig();
    },

    // PUT /api/budget/config
    updateConfig: (body: Partial<BudgetConfig>) => {
      updateBudgetConfig(body);
      return getBudgetConfig();
    },

    // GET /api/budget/logs
    getLogs: (params: LogQueryParams) => {
      return getLogs(params);
    },

    // GET /api/budget/logs/categories
    getCategories: () => {
      return getCategories();
    },
  };
}

export default createBudgetRoutes;
