/**
 * engAIge Server
 *
 * Client <-> Server: WebSocket (100% WS communication)
 * Server <-> Internet: HTTP through the "door" (with optional proxy)
 */

import {
  handleOpen,
  handleClose,
  handleMessage,
  getClientCount,
  type ClientSession,
} from './network/ws-server.js';

const PORT = 4269;

// Simple CORS headers for any HTTP endpoints (health check, etc.)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Connection',
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

const server = Bun.serve<ClientSession>({
  port: PORT,

  // HTTP handler (minimal - just health check and WS upgrade)
  async fetch(req, server) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // WebSocket upgrade
    if (path === '/ws') {
      const upgraded = server.upgrade(req, {
        data: { id: '', connectedAt: 0 }, // Filled in handleOpen
      });

      if (upgraded) {
        return undefined; // Bun handles the upgrade
      }

      return new Response('WebSocket upgrade failed', { status: 400 });
    }

    // Health check (still useful for monitoring)
    if (path === '/health' || path === '/') {
      return json({
        status: 'ok',
        timestamp: Date.now(),
        clients: getClientCount(),
        version: '0.1.0',
      });
    }

    // 404 for unknown routes
    return json({ error: 'Not found. Connect via WebSocket at /ws' }, 404);
  },

  // WebSocket handlers
  websocket: {
    open(ws) {
      handleOpen(ws);
    },

    close(ws) {
      handleClose(ws);
    },

    async message(ws, message) {
      await handleMessage(ws, message);
    },

    // Optional: handle drain (backpressure relief)
    drain(ws) {
      console.log('[WS] Backpressure relieved');
    },
  },
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                    engAIge Server                          ║
╠════════════════════════════════════════════════════════════╣
║  WebSocket:  ws://localhost:${PORT}/ws                       ║
║  Health:     http://localhost:${PORT}/health                 ║
╠════════════════════════════════════════════════════════════╣
║  Client <-> Server: WebSocket                              ║
║  Server <-> Internet: HTTP (door with proxy support)       ║
╚════════════════════════════════════════════════════════════╝
`);
