/**
 * WebSocket Handler Types
 *
 * Shared types and utilities for all WS message handlers.
 */

import type { ServerWebSocket } from 'bun';
import type { WSMessage, ServerMessage } from '../ws-protocol.js';

// Client session data (mirrors ws-server.ts)
export interface ClientSession {
  id: string;
  connectedAt: number;
  accountId?: string;
  subscribedToThoughts?: boolean;
  thoughtsNpcFilter?: string;
  subscribedToWorld?: boolean;
}

// Handler context - provides access to shared state and utilities
export interface HandlerContext {
  // Client management
  clients: Map<ServerWebSocket<ClientSession>, ClientSession>;
  socialSubscriptions: Map<ServerWebSocket<ClientSession>, Set<string>>;

  // Utility functions
  send: (ws: ServerWebSocket<ClientSession>, message: ServerMessage) => void;
  broadcast: (message: ServerMessage) => void;
}

// Handler function signature
export type WSHandler = (
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
) => void | Promise<void>;

// Handler map type
export type HandlerMap = Record<string, WSHandler>;
