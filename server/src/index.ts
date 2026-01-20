import { createBudgetRoutes } from './routes/budget.js';

const PORT = 4269;

// Initialize routes
const budgetRoutes = createBudgetRoutes();

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// JSON response helper
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Error response helper
function error(message: string, status = 400) {
  return json({ error: message }, status);
}

// Parse URL params
function getParams(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // === BUDGET ROUTES ===

      // GET /api/budget/status
      if (path === '/api/budget/status' && method === 'GET') {
        return json(budgetRoutes.getStatus());
      }

      // GET /api/budget/config
      if (path === '/api/budget/config' && method === 'GET') {
        return json(budgetRoutes.getConfig());
      }

      // PUT /api/budget/config
      if (path === '/api/budget/config' && method === 'PUT') {
        const body = await req.json();
        return json(budgetRoutes.updateConfig(body));
      }

      // GET /api/budget/logs
      if (path === '/api/budget/logs' && method === 'GET') {
        const params = getParams(url);
        return json(budgetRoutes.getLogs({
          category: params.category,
          limit: params.limit ? parseInt(params.limit) : undefined,
          offset: params.offset ? parseInt(params.offset) : undefined,
          startDate: params.startDate ? parseInt(params.startDate) : undefined,
          endDate: params.endDate ? parseInt(params.endDate) : undefined,
        }));
      }

      // GET /api/budget/logs/categories
      if (path === '/api/budget/logs/categories' && method === 'GET') {
        return json(budgetRoutes.getCategories());
      }

      // Health check
      if (path === '/health' || path === '/') {
        return json({ status: 'ok', timestamp: Date.now() });
      }

      // 404 for unknown routes
      return error('Not found', 404);

    } catch (err) {
      console.error('API Error:', err);
      return error(err instanceof Error ? err.message : 'Internal server error', 500);
    }
  },
});

console.log(`Server running at http://localhost:${PORT}`);
