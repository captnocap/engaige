/**
 * WebSocket Store
 *
 * Manages the WebSocket connection to the server.
 * All client <-> server communication goes through this store.
 */

import { create } from 'zustand';

// ============================================================================
// Types (mirrored from server, kept minimal for client)
// ============================================================================

export interface WSMessage<T = unknown> {
  type: string;
  payload?: T;
  id?: string;
}

export interface ResponseMessage<T = unknown> extends WSMessage<T> {
  type: 'response';
  success: boolean;
  error?: string;
}

type MessageHandler = (message: WSMessage) => void;
type ResponseCallback = (response: ResponseMessage) => void;

// ============================================================================
// Store State
// ============================================================================

interface WSState {
  // Connection state
  socket: WebSocket | null;
  connected: boolean;
  sessionId: string | null;
  reconnectAttempts: number;

  // Pending request callbacks (for request-response pattern)
  pendingRequests: Map<string, ResponseCallback>;

  // Message handlers by type
  handlers: Map<string, Set<MessageHandler>>;

  // Actions
  connect: (url?: string) => void;
  disconnect: () => void;
  send: <T = unknown>(type: string, payload?: T) => void;
  request: <TReq = unknown, TRes = unknown>(type: string, payload?: TReq) => Promise<TRes>;
  subscribe: (type: string, handler: MessageHandler) => () => void;
}

// ============================================================================
// Helper: Generate unique message ID
// ============================================================================

let messageIdCounter = 0;
function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}`;
}

// ============================================================================
// Store
// ============================================================================

const DEFAULT_WS_URL = 'ws://localhost:4269/ws';
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 10;

export const useWSStore = create<WSState>((set, get) => ({
  socket: null,
  connected: false,
  sessionId: null,
  reconnectAttempts: 0,
  pendingRequests: new Map(),
  handlers: new Map(),

  connect: (url = DEFAULT_WS_URL) => {
    const { socket, reconnectAttempts } = get();

    // Already connected or connecting
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log(`[WS] Connecting to ${url}...`);

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('[WS] Connected');
      set({ connected: true, reconnectAttempts: 0 });
    };

    ws.onclose = (event) => {
      console.log(`[WS] Disconnected (code: ${event.code})`);
      set({ connected: false, sessionId: null, socket: null });

      // Auto-reconnect unless explicitly closed
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        console.log(`[WS] Reconnecting in ${RECONNECT_DELAY_MS}ms... (attempt ${reconnectAttempts + 1})`);
        set({ reconnectAttempts: reconnectAttempts + 1 });
        setTimeout(() => get().connect(url), RECONNECT_DELAY_MS);
      }
    };

    ws.onerror = (error) => {
      console.error('[WS] Error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WSMessage;
        handleIncomingMessage(message, get, set);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close(1000, 'Client disconnect');
      set({ socket: null, connected: false, sessionId: null, reconnectAttempts: MAX_RECONNECT_ATTEMPTS });
    }
  },

  send: <T = unknown>(type: string, payload?: T) => {
    const { socket, connected } = get();

    if (!socket || !connected) {
      console.warn('[WS] Cannot send - not connected');
      return;
    }

    const message: WSMessage<T> = { type, payload };
    socket.send(JSON.stringify(message));
  },

  request: <TReq = unknown, TRes = unknown>(type: string, payload?: TReq): Promise<TRes> => {
    return new Promise((resolve, reject) => {
      const { socket, connected, pendingRequests } = get();

      if (!socket || !connected) {
        reject(new Error('Not connected to server'));
        return;
      }

      const id = generateMessageId();
      const message: WSMessage<TReq> = { type, payload, id };

      // Set up response callback
      const timeout = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, 30000); // 30 second timeout

      pendingRequests.set(id, (response: ResponseMessage) => {
        clearTimeout(timeout);
        pendingRequests.delete(id);

        if (response.success) {
          resolve(response.payload as TRes);
        } else {
          reject(new Error(response.error || 'Request failed'));
        }
      });

      socket.send(JSON.stringify(message));
    });
  },

  subscribe: (type: string, handler: MessageHandler) => {
    const { handlers } = get();

    if (!handlers.has(type)) {
      handlers.set(type, new Set());
    }

    handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const typeHandlers = handlers.get(type);
      if (typeHandlers) {
        typeHandlers.delete(handler);
      }
    };
  },
}));

// ============================================================================
// Internal: Handle incoming messages
// ============================================================================

function handleIncomingMessage(
  message: WSMessage,
  get: () => WSState,
  set: (partial: Partial<WSState>) => void
): void {
  const { pendingRequests, handlers } = get();

  // Handle 'connected' event
  if (message.type === 'connected') {
    const payload = message.payload as { sessionId: string; serverVersion: string };
    console.log(`[WS] Session: ${payload.sessionId}, Server: v${payload.serverVersion}`);
    set({ sessionId: payload.sessionId });
    return;
  }

  // Handle response messages (for request-response pattern)
  if (message.type === 'response' && message.id) {
    const callback = pendingRequests.get(message.id);
    if (callback) {
      callback(message as ResponseMessage);
      return;
    }
  }

  // Handle event messages with id (also responses to requests)
  if (message.id && pendingRequests.has(message.id)) {
    const callback = pendingRequests.get(message.id);
    if (callback) {
      // Wrap as response
      callback({
        type: 'response',
        id: message.id,
        success: true,
        payload: message.payload,
      });
      return;
    }
  }

  // Dispatch to type-specific handlers
  const typeHandlers = handlers.get(message.type);
  if (typeHandlers) {
    for (const handler of typeHandlers) {
      try {
        handler(message);
      } catch (err) {
        console.error(`[WS] Handler error for ${message.type}:`, err);
      }
    }
  }

  // Dispatch to wildcard handlers
  const wildcardHandlers = handlers.get('*');
  if (wildcardHandlers) {
    for (const handler of wildcardHandlers) {
      try {
        handler(message);
      } catch (err) {
        console.error(`[WS] Wildcard handler error:`, err);
      }
    }
  }
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get connection status
 */
export function useWSConnection() {
  const connected = useWSStore((state) => state.connected);
  const sessionId = useWSStore((state) => state.sessionId);
  const connect = useWSStore((state) => state.connect);
  const disconnect = useWSStore((state) => state.disconnect);

  return { connected, sessionId, connect, disconnect };
}

/**
 * Hook for making requests
 */
export function useWSRequest() {
  const request = useWSStore((state) => state.request);
  const connected = useWSStore((state) => state.connected);

  return { request, connected };
}

/**
 * Hook for sending fire-and-forget messages
 */
export function useWSSend() {
  const send = useWSStore((state) => state.send);
  const connected = useWSStore((state) => state.connected);

  return { send, connected };
}

export default useWSStore;
