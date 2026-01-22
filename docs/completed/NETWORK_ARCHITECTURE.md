# Network Architecture

## Overview

engAIge uses a two-layer network architecture:

```
┌─────────────┐         WS          ┌─────────────┐       HTTP (door)      ┌─────────────┐
│   Client    │ ◄─────────────────► │   Server    │ ◄───────────────────► │  Internet   │
│  (Tauri)    │   bidirectional     │   (Bun)     │   proxy optional      │ (AI APIs)   │
└─────────────┘                     └─────────────┘                       └─────────────┘
```

**Client ↔ Server**: 100% WebSocket communication
- All user interactions (messages, requests) go through WebSocket
- Server pushes real-time updates (typing indicators, NPC posts, etc.)
- Single persistent connection per client

**Server ↔ Internet**: HTTP through the "door"
- All external requests (AI providers, external APIs) go through the door
- Optional proxy support (SOCKS4/SOCKS5/HTTP/HTTPS)
- Centralized point for network configuration

## The Door

The "door" is the single exit point for all external HTTP requests. Think of it like a house with one door - all traffic going outside must pass through it.

### Key Files

```
server/src/network/
├── door.ts           # Central fetch wrapper - ALL external requests go here
├── proxy-config.ts   # SOCKS/HTTP proxy settings
├── ws-protocol.ts    # WebSocket message type definitions
└── ws-server.ts      # WebSocket server handlers
```

### Usage

```typescript
// In any service file that needs to make external requests:
import { doorFetch } from '../network/door.js';

// Use doorFetch instead of native fetch
const response = await doorFetch('https://api.openai.com/v1/...', {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({ ... }),
});
```

### Proxy Configuration

```typescript
import { setProxyConfig, enableProxy, disableProxy } from '../network/proxy-config.js';

// Configure SOCKS5 proxy
setProxyConfig({
  enabled: true,
  type: 'socks5',
  host: '127.0.0.1',
  port: 1080,
  auth: {
    username: 'user',
    password: 'pass',
  },
});

// Or enable/disable on the fly
enableProxy();
disableProxy();
```

Supported proxy types:
- `socks5` - SOCKS5 proxy (recommended)
- `socks4` - SOCKS4 proxy
- `http` - HTTP proxy (CONNECT tunneling for HTTPS targets)
- `https` - HTTPS proxy

## WebSocket Communication

### Server Side

The server runs on `ws://localhost:4269/ws`. All client communication goes through WebSocket messages.

```typescript
// Message format
interface WSMessage {
  type: string;      // Message type (e.g., 'ai:sendMessage')
  payload?: any;     // Message data
  id?: string;       // For request-response correlation
}
```

### Client Side

Use the Zustand store at `src/stores/wsStore.ts`:

```typescript
import { useWSStore, useWSConnection, useWSRequest } from '../stores/wsStore';

// Connect on app startup
const { connect, disconnect, connected } = useWSConnection();
useEffect(() => {
  connect(); // Connects to ws://localhost:4269/ws
  return () => disconnect();
}, []);

// Make a request and wait for response
const { request } = useWSRequest();
const budgetStatus = await request('budget:getStatus');

// Subscribe to events
const unsubscribe = useWSStore.getState().subscribe('ai:typing', (message) => {
  console.log('NPC is typing:', message.payload);
});
```

### Message Types

**Client → Server:**
- `ping` - Health check
- `proxy:getConfig` - Get current proxy settings
- `proxy:setConfig` - Update proxy settings
- `budget:getStatus` - Get budget status
- `budget:getConfig` - Get budget configuration
- `budget:updateConfig` - Update budget configuration
- `budget:getLogs` - Get API cost logs
- `ai:sendMessage` - Send message to NPC
- `ai:generatePost` - Generate NPC post

**Server → Client:**
- `connected` - Connection established, includes sessionId
- `pong` - Response to ping
- `response` - Response to a request (matched by id)
- `error` - Error event
- `ai:typing` - NPC typing indicator
- `ai:response` - NPC message response
- `ai:postCreated` - NPC created a post
- `budget:status` - Budget status update

## Services Using the Door

These services have been updated to use `doorFetch`:

- `server/src/services/ai.ts` - Main AI provider calls (OpenAI, Anthropic)
- `server/src/services/vision-proxy.ts` - Vision analysis calls
- `server/src/services/image-generation-proxy.ts` - Image generation calls

All external HTTP requests in these services now go through the door, meaning:
1. Proxy settings automatically apply to all AI requests
2. Single point of configuration for network behavior
3. Easy to add logging, rate limiting, or other middleware

## Adding New External Requests

When adding new code that makes external HTTP requests:

1. **Always use `doorFetch`** instead of native `fetch`:
   ```typescript
   import { doorFetch } from '../network/door.js';

   // Good
   const response = await doorFetch('https://external-api.com/...');

   // Bad - bypasses proxy
   const response = await fetch('https://external-api.com/...');
   ```

2. **Never call external APIs directly** from the client - route through the server via WebSocket.

## Health Check

The server exposes a single HTTP endpoint for health monitoring:

```
GET http://localhost:4269/health

Response:
{
  "status": "ok",
  "timestamp": 1234567890,
  "clients": 2,
  "version": "0.1.0"
}
```

## Why This Architecture?

1. **Security**: Client never directly touches external APIs - all requests go through the server
2. **Privacy**: Easy to route all traffic through a proxy (VPN, Tor, etc.)
3. **Simplicity**: Single WebSocket connection handles all client-server communication
4. **Real-time**: Server can push updates to clients immediately (typing indicators, new posts, etc.)
5. **Maintainability**: Network configuration lives in one place, not scattered across services
