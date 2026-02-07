# Events (`/server/src/events/`)

The **event bus is the central nervous system** of engAIge. ALL game events flow through it. This directory contains the event bus implementation and event type definitions.

---

## 🎯 Critical Principle

**EVERY significant game action MUST emit an event through the event bus.**

- Player sends message → Event
- NPC responds → Event
- Relationship changes → Event
- Social post created → Event
- Budget updated → Event
- Error occurs → Event
- Memory extracted → Event

**No exceptions.** The event bus is the single source of truth for what's happening in the game.

---

## 📂 Files

| File | Purpose |
|------|---------|
| **event-bus.ts** | Event bus singleton (fire/emit/on methods) |
| **event-types.ts** | Enum of all 40+ event types |
| **index.ts** | Barrel export for easy imports |

---

## 🔥 Event Bus API

### Import

```typescript
import { eventBus, EventTypes } from "../events/index.js";
```

### Fire Event (Fire and Forget)

```typescript
// Most common - fire event without waiting
eventBus.fire(
  EventTypes.CONVERSATION_MESSAGE_SENT,
  {
    // Event payload
    message_id: "msg_123",
    conversation_id: "conv_456",
    content: "Hello world",
    sender: "player",
    word_count: 2
  },
  {
    // Event context
    source: "conversation",
    player_id: "player_abc",
    npc_id: "npc_def",
    importance: 0.7,
    parent_event_id: "evt_parent" // Optional
  }
);
```

### Emit Event (Await Event ID)

```typescript
// When you need the event ID (for parent_event_id linking)
const event = await eventBus.emit(
  EventTypes.CONVERSATION_MESSAGE_SENT,
  payload,
  context
);

console.log(event.id); // "evt_123"

// Use event ID as parent for child events
eventBus.fire(
  EventTypes.MEMORY_EXTRACTED,
  { memory_count: 3 },
  {
    source: "memory_agent",
    parent_event_id: event.id // Link to parent
  }
);
```

### Listen to Events

```typescript
// Background agents listen to events
eventBus.on(EventTypes.CONVERSATION_MESSAGE_SENT, async (event) => {
  console.log("Message sent:", event.payload.message_id);

  // Process event asynchronously
  await extractMemories(event.payload);

  // Emit completion event
  eventBus.fire(EventTypes.MEMORY_EXTRACTED, {
    message_id: event.payload.message_id,
    memory_count: 3
  });
});
```

---

## 📋 Event Types

**See [EVENT_REFERENCE.md](../../../docs/completed/EVENT_REFERENCE.md) for complete list.**

### Categories

#### Conversation Events
- `CONVERSATION_CREATED`
- `CONVERSATION_MESSAGE_SENT`
- `CONVERSATION_NPC_RESPONDED`
- `CONVERSATION_PARTICIPANT_ADDED`

#### Social Events
- `SOCIAL_POST_CREATED`
- `SOCIAL_POST_LIKED`
- `SOCIAL_POST_COMMENTED`
- `SOCIAL_POST_SHARED`

#### Relationship Events
- `RELATIONSHIP_CREATED`
- `RELATIONSHIP_UPDATED`
- `RELATIONSHIP_STAGE_CHANGED`

#### NPC Events
- `NPC_CREATED`
- `NPC_UPDATED`
- `NPC_DELETED`
- `NPC_PROFILE_POPULATED`

#### Memory Events
- `MEMORY_CREATED`
- `MEMORY_EXTRACTED`
- `MEMORY_SEARCH_PERFORMED`

#### AI Events
- `AI_REQUEST_QUEUED`
- `AI_REQUEST_STARTED`
- `AI_REQUEST_COMPLETED`
- `AI_REQUEST_FAILED`

#### Budget Events
- `BUDGET_UPDATED`
- `BUDGET_CATEGORY_EXHAUSTED`
- `BUDGET_WARNING`

#### System Events
- `SYSTEM_ERROR`
- `SYSTEM_WARNING`
- `SYSTEM_INFO`

---

## 📊 Event Structure

### Event Object

```typescript
{
  id: "evt_abc123",              // Unique event ID
  type: "conversation:message_sent",
  payload: {                      // Event-specific data
    message_id: "msg_123",
    content: "Hello"
  },
  context: {                      // Metadata
    source: "conversation",
    player_id: "player_abc",
    npc_id: "npc_def",
    importance: 0.7,
    parent_event_id: "evt_parent"
  },
  timestamp: "2024-01-20T12:00:00Z"
}
```

### Event Payload

The payload contains **event-specific data**. Each event type has its own payload structure.

**Example: CONVERSATION_MESSAGE_SENT**
```typescript
{
  message_id: string;
  conversation_id: string;
  content: string;
  sender: "player" | "npc";
  word_count: number;
}
```

### Event Context

Context contains **metadata about the event**:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `source` | string | Yes | Where the event originated (e.g., "conversation", "social") |
| `player_id` | string | No | Associated player ID |
| `npc_id` | string | No | Associated NPC ID |
| `importance` | 0-1 | No | Event importance (for analytics/filtering) |
| `parent_event_id` | string | No | Parent event ID (for event chains) |

### Importance Levels

| Level | Range | Use Case |
|-------|-------|----------|
| Critical | 0.9-1.0 | User-initiated actions, critical errors |
| High | 0.7-0.9 | Important state changes, relationship updates |
| Medium | 0.4-0.7 | Normal gameplay events, NPC actions |
| Low | 0.1-0.4 | Background tasks, minor updates |
| Trace | 0.0-0.1 | Debug info, fine-grained logging |

---

## 🎯 Event Bus Patterns

### Pattern 1: Service Action with Event

```typescript
// Service performs action, then emits event
export function createPost(content: string, npcId: string) {
  // 1. Perform action
  const post = savePostToDB(content, npcId);

  // 2. Emit event
  eventBus.fire(EventTypes.SOCIAL_POST_CREATED, {
    post_id: post.id,
    npc_id: npcId,
    content
  }, {
    source: "social",
    npc_id: npcId,
    importance: 0.5
  });

  // 3. Return result
  return post;
}
```

### Pattern 2: Agent Processes Event

```typescript
// Agent listens to event, performs background task
eventBus.on(EventTypes.SOCIAL_POST_CREATED, async (event) => {
  const { post_id, npc_id } = event.payload;

  // Process in background
  await updateHashtags(post_id);
  await notifyFollowers(npc_id, post_id);

  // Emit completion (optional)
  eventBus.fire(EventTypes.SOCIAL_POST_PROCESSED, {
    post_id
  });
});
```

### Pattern 3: Event Chains (Parent-Child)

```typescript
// Parent event
const parentEvent = await eventBus.emit(
  EventTypes.CONVERSATION_MESSAGE_SENT,
  { message_id: "msg_123" },
  { source: "conversation" }
);

// Child event (linked via parent_event_id)
eventBus.fire(
  EventTypes.MEMORY_EXTRACTED,
  { memory_count: 3 },
  {
    source: "memory_agent",
    parent_event_id: parentEvent.id // Link to parent
  }
);
```

### Pattern 4: Error Events

```typescript
import { errorLogger } from "../services/error-logger.js";

try {
  await riskyOperation();
} catch (error) {
  // errorLogger automatically emits SYSTEM_ERROR event
  errorLogger.log(error, {
    source: "my_service",
    operation: "riskyOperation"
  });
}
```

---

## 🚦 Best Practices

### Always Emit Events

**DO:**
```typescript
export function updateRelationship(npcId: string, playerId: string, delta: any) {
  // Update database
  const relationship = applyDelta(npcId, playerId, delta);

  // Emit event ✅
  eventBus.fire(EventTypes.RELATIONSHIP_UPDATED, {
    npc_id: npcId,
    player_id: playerId,
    delta
  });

  return relationship;
}
```

**DON'T:**
```typescript
export function updateRelationship(npcId: string, playerId: string, delta: any) {
  const relationship = applyDelta(npcId, playerId, delta);
  // ❌ No event emission - breaks event bus pattern
  return relationship;
}
```

### Use Appropriate Importance

**DO:**
```typescript
// User-initiated = high importance
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT, payload, {
  source: "conversation",
  importance: 0.8 // High - user action
});

// Background task = low importance
eventBus.fire(EventTypes.MEMORY_EXTRACTED, payload, {
  source: "memory_agent",
  importance: 0.2 // Low - background
});
```

**DON'T:**
```typescript
// ❌ Everything marked as critical
eventBus.fire(EventTypes.MEMORY_EXTRACTED, payload, {
  source: "memory_agent",
  importance: 1.0 // ❌ Too high for background task
});
```

### Include Rich Context

**DO:**
```typescript
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT, payload, {
  source: "conversation",
  player_id: "player_abc",
  npc_id: "npc_def",
  importance: 0.7,
  parent_event_id: parentEventId
});
```

**DON'T:**
```typescript
// ❌ Missing context
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT, payload, {
  source: "conversation"
  // ❌ No player_id, npc_id, importance
});
```

---

## 🔍 Debugging with Events

### Logs Viewer

Events are logged to the database and viewable in the in-app **Logs Viewer**.

**Location:** Settings → Logs

**Filters:**
- Event type
- Source
- Importance
- Time range
- Player/NPC ID

### Event Bus Logging

```typescript
// Enable debug logging (development only)
process.env.DEBUG_EVENTS = "true";

// Events will be logged to console
```

---

## 📚 Documentation

- [EVENT_BUS_SPEC.md](../../../docs/completed/EVENT_BUS_SPEC.md) - Complete architecture
- [EVENT_REFERENCE.md](../../../docs/completed/EVENT_REFERENCE.md) - All 40+ event types
- [LOGS_VIEWER.md](../../../docs/completed/LOGS_VIEWER.md) - In-app event viewer
- [GAME_SYSTEMS.md](../../../docs/GAME_SYSTEMS.md) - System overview

---

## 🎯 Adding New Event Types

### 1. Add to event-types.ts

```typescript
export enum EventTypes {
  // ... existing events

  // My new events
  MY_ENTITY_CREATED = "my_entity:created",
  MY_ENTITY_UPDATED = "my_entity:updated",
  MY_ENTITY_DELETED = "my_entity:deleted"
}
```

### 2. Define Payload Type

```typescript
// In types/events.ts
export interface MyEntityCreatedPayload {
  entity_id: string;
  data: any;
}
```

### 3. Emit Events

```typescript
import { eventBus, EventTypes } from "../events/index.js";

export function createMyEntity(data: any) {
  const entity = saveEntityToDB(data);

  eventBus.fire(EventTypes.MY_ENTITY_CREATED, {
    entity_id: entity.id,
    data
  }, {
    source: "my_service",
    importance: 0.5
  });

  return entity;
}
```

### 4. Document

Add to [EVENT_REFERENCE.md](../../../docs/completed/EVENT_REFERENCE.md):

```markdown
### MY_ENTITY_CREATED

**Emitted when:** A new entity is created

**Payload:**
- `entity_id` (string) - Entity ID
- `data` (any) - Entity data

**Emitted by:** `services/my-service.ts`

**Consumed by:** Background agents, analytics
```

---

## ⚡ Performance

### Event Bus is Fast

- Events are emitted synchronously (fire-and-forget)
- Listeners process asynchronously (non-blocking)
- No performance overhead for emitting events

### Memory Management

- Events are logged to database (not kept in memory)
- Old events are periodically cleaned up
- In-memory listener list is small

---

## 🤝 Contributing

When working with events:

1. **Always emit events** - Don't skip this
2. **Use correct event types** - Check EVENT_REFERENCE.md
3. **Include rich context** - player_id, npc_id, importance
4. **Use appropriate importance** - Match the action's significance
5. **Document new events** - Update EVENT_REFERENCE.md
6. **Test event flow** - Use Logs Viewer to verify
