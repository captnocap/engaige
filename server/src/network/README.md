# Network (`/server/src/network/`)

The network layer implements engAIge's **two-layer communication architecture**: WebSocket for client-server and HTTP "door" for server-internet.

---

## 🏗️ Architecture

```
┌─────────────┐              ┌─────────────┐              ┌─────────────┐
│   Frontend  │◄──WebSocket─►│   Backend   │◄────HTTP────►│  Internet   │
│  (Client)   │              │  (Server)   │   (door)     │   (APIs)    │
└─────────────┘              └─────────────┘              └─────────────┘
   Browser/Tauri              Bun Server                   OpenAI, etc.
```

---

## 📂 Files

| File | Purpose |
|------|---------|
| **ws-server.ts** | WebSocket server setup and connection handling |
| **ws-handlers/** | WebSocket message handlers (conversation, social, etc.) |
| **door.ts** | HTTP client for all outbound requests (proxy support) |

---

## 🔌 Layer 1: WebSocket (Client ↔ Server)

### Purpose

- **Real-time bidirectional communication**
- ALL game events flow through WebSocket
- Server pushes updates to client instantly

### Connection

**URL:** `ws://localhost:4269/ws`

**Client Connection:**
```typescript
// Frontend
const ws = new WebSocket("ws://localhost:4269/ws");

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Received:", message);
};

ws.send(JSON.stringify({
  type: "conversation:send_message",
  payload: { npc_id: "abc", content: "Hello!" }
}));
```

**Server Setup:**
```typescript
// server/src/network/ws-server.ts
const server = Bun.serve({
  port: 4269,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return; // WebSocket upgrade
    }
    return new Response("Not a WebSocket request", { status: 400 });
  },
  websocket: {
    message(ws, message) {
      handleWebSocketMessage(ws, message);
    }
  }
});
```

---

## 📨 WebSocket Message Format

### Client → Server

```typescript
{
  type: "conversation:send_message",  // Handler identifier
  payload: {                          // Handler-specific data
    npc_id: "npc_abc123",
    content: "Hello, how are you?"
  }
}
```

### Server → Client

```typescript
{
  type: "conversation:message_received",
  payload: {
    message_id: "msg_123",
    conversation_id: "conv_456",
    sender: "npc",
    content: "I'm doing well, thanks!",
    timestamp: "2024-01-20T12:00:00Z"
  }
}
```

---

## 📂 WebSocket Handlers (`/ws-handlers/`)

Handlers process incoming WebSocket messages and call appropriate services.

### Handler Structure

```typescript
// ws-handlers/conversation.ts
export async function handleConversationMessage(ws: WebSocket, payload: any) {
  const { npc_id, content } = payload;

  // 1. Validate input
  if (!npc_id || !content) {
    ws.send(JSON.stringify({
      type: "error",
      payload: { message: "Missing required fields" }
    }));
    return;
  }

  // 2. Call service
  const response = await conversationService.sendMessage(npc_id, content);

  // 3. Emit event (service handles this)
  // eventBus.fire(...) happens in service

  // 4. Push response to client
  ws.send(JSON.stringify({
    type: "conversation:message_received",
    payload: response
  }));
}
```

### Available Handlers

| Handler | Message Type | Purpose |
|---------|-------------|---------|
| **conversation.ts** | `conversation:send_message` | Send message to NPC |
| **social.ts** | `social:create_post` | Create social post |
| **comments.ts** | `comments:add_comment` | Add comment to post |
| **relationships.ts** | `relationships:get_stats` | Get relationship stats |
| **media.ts** | `media:upload` | Upload media file |
| **npc.ts** | `npc:create` | Create new NPC |

---

## 🚪 Layer 2: HTTP Door (Server ↔ Internet)

### Purpose

- **Single point for ALL outbound HTTP**
- Optional SOCKS/HTTP proxy support
- Rate limiting and error handling
- Consistent error logging

**Location:** `server/src/network/door.ts`

### Why "Door"?

All outbound traffic goes **through the door** - a single controlled exit point. This enables:
- Proxy configuration
- Rate limiting
- Request logging
- Error handling
- IP rotation (future)

### Usage

```typescript
import { door } from "../network/door.js";

// GET request
const data = await door.get("https://api.openai.com/v1/models", {
  headers: {
    "Authorization": `Bearer ${apiKey}`
  }
});

// POST request
const response = await door.post("https://api.openai.com/v1/chat/completions", {
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{ role: "user", content: "Hello" }]
  })
});
```

### Proxy Support

**SOCKS Proxy:**
```bash
# .env
HTTP_PROXY_ENABLED=true
SOCKS_PROXY=socks5://localhost:9050
```

**HTTP Proxy:**
```bash
# .env
HTTP_PROXY_ENABLED=true
HTTP_PROXY=http://localhost:8080
```

### Rate Limiting

```typescript
// door.ts includes rate limiting
const rateLimiter = {
  maxRequestsPerSecond: 10,
  requestQueue: []
};
```

### Error Handling

```typescript
// door.ts automatically logs errors
try {
  const response = await door.get(url);
  return response;
} catch (error) {
  // Logged to error_log table
  errorLogger.log(error, {
    source: "http_door",
    operation: "GET",
    url
  });
  throw error;
}
```

---

## 🎯 Message Flow Examples

### Example 1: Player Sends Message

```
1. Player types message in UI
   ↓
2. Frontend sends WebSocket message:
   {
     type: "conversation:send_message",
     payload: { npc_id: "abc", content: "Hello!" }
   }
   ↓
3. ws-server.ts receives message
   ↓
4. Routes to ws-handlers/conversation.ts
   ↓
5. Handler calls services/conversation.ts
   ↓
6. Service emits event (EVENT_BUS)
   ↓
7. Service queues AI request (AI_QUEUE)
   ↓
8. AI queue calls services/ai.ts
   ↓
9. services/ai.ts uses door.ts for HTTP request
   ↓
10. door.ts → OpenAI API (via proxy if configured)
   ↓
11. Response flows back up the chain
   ↓
12. Server pushes response to client via WebSocket:
   {
     type: "conversation:message_received",
     payload: { message_id: "msg_123", content: "Hi!" }
   }
   ↓
13. Frontend displays NPC message
```

### Example 2: Server Pushes Update

```
1. Background agent creates autonomous post
   ↓
2. services/social.ts emits SOCIAL_POST_CREATED event
   ↓
3. services/broadcast.ts listens to event
   ↓
4. broadcast.ts pushes update to ALL connected clients:
   {
     type: "social:post_created",
     payload: { post_id: "post_123", npc_id: "abc" }
   }
   ↓
5. All frontends receive update simultaneously
   ↓
6. Frontends update social feed UI
```

---

## 🚦 Best Practices

### WebSocket Handlers

**DO:**
```typescript
export async function handleMessage(ws: WebSocket, payload: any) {
  // 1. Validate
  if (!payload.required_field) {
    ws.send(JSON.stringify({
      type: "error",
      payload: { message: "Validation failed" }
    }));
    return;
  }

  // 2. Call service
  const result = await service.performAction(payload);

  // 3. Push response
  ws.send(JSON.stringify({
    type: "action:completed",
    payload: result
  }));
}
```

**DON'T:**
```typescript
// ❌ Don't put game logic in handlers
export async function handleMessage(ws: WebSocket, payload: any) {
  // ❌ Game logic belongs in services
  const db = getDB("game");
  const result = db.query("...").get();
  // ❌ No event emission
  ws.send(JSON.stringify({ type: "result", payload: result }));
}
```

### HTTP Door

**DO:**
```typescript
import { door } from "../network/door.js";

// Use door for ALL outbound HTTP
const response = await door.post(url, options);
```

**DON'T:**
```typescript
// ❌ Don't bypass the door
const response = await fetch(url, options);
```

---

## 🔒 Security

### WebSocket

- **Origin Validation** - Check request origin
- **Rate Limiting** - Prevent spam
- **Input Validation** - Validate all payloads
- **Error Handling** - Don't leak internal errors

### HTTP Door

- **API Key Management** - Store in env vars
- **Proxy Support** - Optional anonymity
- **Request Logging** - Track all outbound traffic
- **Error Redaction** - Don't leak sensitive data

---

## 📊 Monitoring

### WebSocket Connections

```typescript
// Track active connections
const connections = new Map<string, WebSocket>();

// On connect
ws.data = { playerId: "player_abc" };
connections.set(ws.data.playerId, ws);

// On disconnect
connections.delete(ws.data.playerId);
```

### HTTP Requests

```typescript
// door.ts logs all requests
eventBus.fire(EventTypes.HTTP_REQUEST_MADE, {
  url,
  method,
  status_code,
  duration_ms
});
```

---

## 📚 Documentation

- [NETWORK_ARCHITECTURE.md](../../../docs/completed/NETWORK_ARCHITECTURE.md) - Complete architecture
- [EVENT_BUS_SPEC.md](../../../docs/completed/EVENT_BUS_SPEC.md) - Event bus
- [BACKEND.md](../../../docs/BACKEND.md) - Backend overview
- [GAME_SYSTEMS.md](../../../docs/GAME_SYSTEMS.md) - System overview

---

## 🤝 Contributing

When working with the network layer:

1. **WebSocket for client-server** - Real-time bidirectional
2. **HTTP door for server-internet** - All outbound goes through door
3. **Handlers call services** - Keep handlers thin
4. **Services emit events** - Always use event bus
5. **Validate all input** - Check payloads in handlers
6. **Push updates to clients** - Use broadcast service
