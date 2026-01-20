# Event Reference

> **Quick reference for all game events.** Use this when adding new events or debugging.

## How to Read This Document

Each event shows:
1. **Event Type** - The string you pass to `eventBus.emit()`
2. **Description** - When this event fires
3. **Payload** - What data to include
4. **Example** - What gets logged to `game_events` table

---

## Conversation Events

### `conversation:started`
**Description:** A new conversation was created between player/NPC.

**Payload:**
```typescript
{
  conversation_id: string;
  platform: string;          // 'chat', 'myspace', 'dating', etc.
  initiated_by: 'player' | 'npc';
}
```

**Example Log:**
```json
{
  "id": "a1b2c3d4-...",
  "event_type": "conversation:started",
  "category": "conversation",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "conversation_id": "conv_123",
  "payload": {
    "conversation_id": "conv_123",
    "platform": "chat",
    "initiated_by": "player"
  },
  "source": "conversation",
  "timestamp": 1705123456789,
  "importance": 0.5
}
```

---

### `conversation:message_sent`
**Description:** Player sent a message to an NPC.

**Payload:**
```typescript
{
  message_id: string;
  content: string;
  word_count: number;
  has_image?: boolean;
  image_urls?: string[];
}
```

**Example Log:**
```json
{
  "id": "msg_event_123",
  "event_type": "conversation:message_sent",
  "category": "conversation",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "conversation_id": "conv_123",
  "payload": {
    "message_id": "msg_456",
    "content": "Hey, how are you doing today?",
    "word_count": 6,
    "has_image": false
  },
  "source": "conversation",
  "timestamp": 1705123456789,
  "importance": 0.5
}
```

---

### `conversation:message_received`
**Description:** NPC sent a response to the player.

**Payload:**
```typescript
{
  message_id: string;
  content: string;
  word_count: number;
  has_image?: boolean;
  image_urls?: string[];
}
```

**Example Log:**
```json
{
  "id": "msg_event_124",
  "event_type": "conversation:message_received",
  "category": "conversation",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "conversation_id": "conv_123",
  "parent_event_id": "msg_event_123",
  "payload": {
    "message_id": "msg_457",
    "content": "I'm doing great! Just finished my morning coffee.",
    "word_count": 8,
    "has_image": false
  },
  "source": "conversation",
  "timestamp": 1705123458000,
  "importance": 0.5
}
```

---

### `conversation:message_read`
**Description:** Messages in a conversation were marked as read.

**Payload:**
```typescript
{
  messages_read: number;
}
```

**Example Log:**
```json
{
  "id": "read_event_123",
  "event_type": "conversation:message_read",
  "category": "conversation",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "conversation_id": "conv_123",
  "payload": {
    "messages_read": 3
  },
  "source": "conversation",
  "timestamp": 1705123460000,
  "importance": 0.2
}
```

---

## Relationship Events

### `relationship:first_interaction`
**Description:** Player interacted with an NPC for the first time ever.

**Payload:**
```typescript
{
  relationship_id: string;
}
```

**Example Log:**
```json
{
  "id": "rel_event_001",
  "event_type": "relationship:first_interaction",
  "category": "relationship",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "payload": {
    "relationship_id": "rel_789"
  },
  "source": "relationships",
  "timestamp": 1705123456789,
  "importance": 0.9
}
```

---

### `relationship:stats_updated`
**Description:** Trust, affinity, or familiarity changed.

**Payload:**
```typescript
{
  trust_delta?: number;
  affinity_delta?: number;
  familiarity_delta?: number;
  new_trust: number;
  new_affinity: number;
  new_familiarity: number;
  trigger: 'message_sent' | 'message_received' | 'image_shared' | 'post_liked' | 'post_commented' | 'unknown';
}
```

**Example Log:**
```json
{
  "id": "stats_event_001",
  "event_type": "relationship:stats_updated",
  "category": "relationship",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "payload": {
    "trust_delta": 2,
    "affinity_delta": 1,
    "familiarity_delta": 1,
    "new_trust": 45,
    "new_affinity": 52,
    "new_familiarity": 38,
    "trigger": "message_sent"
  },
  "source": "relationships",
  "timestamp": 1705123456789,
  "importance": 0.4
}
```

---

### `relationship:stage_changed`
**Description:** Relationship progressed to a new stage. **HIGH IMPORTANCE!**

**Payload:**
```typescript
{
  previous_stage: string;
  new_stage: string;
  trust: number;
  affinity: number;
  familiarity: number;
}
```

**Example Log:**
```json
{
  "id": "stage_event_001",
  "event_type": "relationship:stage_changed",
  "category": "relationship",
  "npc_id": "npc_abc123",
  "player_id": "player_xyz",
  "payload": {
    "previous_stage": "acquaintance",
    "new_stage": "friend",
    "trust": 35,
    "affinity": 42,
    "familiarity": 40
  },
  "source": "relationships",
  "timestamp": 1705123456789,
  "importance": 1.0
}
```

---

## NPC Events

### `npc:created`
**Description:** A new NPC was added to the game.

**Payload:**
```typescript
{
  npc_id: string;
  username: string;
  display_name: string;
  generation_method: 'ai' | 'manual' | 'import';
}
```

**Example Log:**
```json
{
  "id": "npc_event_001",
  "event_type": "npc:created",
  "category": "npc",
  "npc_id": "npc_new123",
  "payload": {
    "npc_id": "npc_new123",
    "username": "sarah_j",
    "display_name": "Sarah Johnson",
    "generation_method": "ai"
  },
  "source": "npc",
  "timestamp": 1705123456789,
  "importance": 0.8
}
```

---

### `npc:updated`
**Description:** An NPC's profile was modified.

**Payload:**
```typescript
{
  npc_id: string;
  fields_changed: string[];
}
```

**Example Log:**
```json
{
  "id": "npc_event_002",
  "event_type": "npc:updated",
  "category": "npc",
  "npc_id": "npc_abc123",
  "payload": {
    "npc_id": "npc_abc123",
    "fields_changed": ["bio", "avatar_url"]
  },
  "source": "npc",
  "timestamp": 1705123456789,
  "importance": 0.5
}
```

---

### `npc:deleted`
**Description:** An NPC was permanently removed.

**Payload:**
```typescript
{
  npc_id: string;
  username: string;
  display_name: string;
}
```

**Example Log:**
```json
{
  "id": "npc_event_003",
  "event_type": "npc:deleted",
  "category": "npc",
  "npc_id": "npc_old456",
  "payload": {
    "npc_id": "npc_old456",
    "username": "old_user",
    "display_name": "Old Character"
  },
  "source": "npc",
  "timestamp": 1705123456789,
  "importance": 0.7
}
```

---

## AI Events

### `ai:request_sent`
**Description:** An AI request was initiated.

**Payload:**
```typescript
{
  request_id: string;
  provider: string;
  model: string;
  prompt_tokens?: number;
  purpose: string;
}
```

**Example Log:**
```json
{
  "id": "ai_event_001",
  "event_type": "ai:request_sent",
  "category": "ai",
  "npc_id": "npc_abc123",
  "payload": {
    "request_id": "req_xyz789",
    "provider": "openai-compatible",
    "model": "gpt-4o-mini",
    "prompt_tokens": 1250,
    "purpose": "conversation"
  },
  "source": "ai",
  "timestamp": 1705123456789,
  "importance": 0.5
}
```

---

### `ai:response_received`
**Description:** AI response was successfully received.

**Payload:**
```typescript
{
  request_id: string;
  provider: string;
  model: string;
  tokens_used: number;
  cost_cents: number;
  latency_ms: number;
}
```

**Example Log:**
```json
{
  "id": "ai_event_002",
  "event_type": "ai:response_received",
  "category": "ai",
  "npc_id": "npc_abc123",
  "payload": {
    "request_id": "req_xyz789",
    "provider": "openai-compatible",
    "model": "gpt-4o-mini",
    "tokens_used": 450,
    "cost_cents": 2,
    "latency_ms": 1247
  },
  "source": "ai",
  "timestamp": 1705123458036,
  "importance": 0.5
}
```

---

### `ai:error`
**Description:** AI request failed.

**Payload:**
```typescript
{
  request_id?: string;
  provider: string;
  model: string;
  error_type: string;
  message: string;
}
```

**Example Log:**
```json
{
  "id": "ai_event_003",
  "event_type": "ai:error",
  "category": "ai",
  "npc_id": "npc_abc123",
  "payload": {
    "request_id": "req_xyz790",
    "provider": "openai",
    "model": "gpt-4o",
    "error_type": "api_error",
    "message": "Rate limit exceeded"
  },
  "source": "ai",
  "timestamp": 1705123456789,
  "importance": 0.8
}
```

---

## Budget Events

### `budget:spent`
**Description:** API cost was logged.

**Payload:**
```typescript
{
  cost_cents: number;
  feature_category: string;
  provider: string;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
}
```

**Example Log:**
```json
{
  "id": "budget_event_001",
  "event_type": "budget:spent",
  "category": "budget",
  "payload": {
    "cost_cents": 2,
    "feature_category": "conversation",
    "provider": "openai-compatible",
    "model": "gpt-4o-mini",
    "input_tokens": 1250,
    "output_tokens": 150,
    "total_tokens": 1400
  },
  "source": "budget",
  "timestamp": 1705123456789,
  "importance": 0.3
}
```

---

### `budget:warning`
**Description:** Category budget reached 90%.

**Payload:**
```typescript
{
  category: string;
  spent_cents: number;
  limit_cents: number;
  percentage_used: number;
}
```

**Example Log:**
```json
{
  "id": "budget_event_002",
  "event_type": "budget:warning",
  "category": "budget",
  "payload": {
    "category": "conversation",
    "spent_cents": 315,
    "limit_cents": 350,
    "percentage_used": 90
  },
  "source": "budget",
  "timestamp": 1705123456789,
  "importance": 0.7
}
```

---

### `budget:exhausted`
**Description:** Category budget reached 100%.

**Payload:**
```typescript
{
  category: string;
  spent_cents: number;
  limit_cents: number;
}
```

**Example Log:**
```json
{
  "id": "budget_event_003",
  "event_type": "budget:exhausted",
  "category": "budget",
  "payload": {
    "category": "autonomous_posts",
    "spent_cents": 100,
    "limit_cents": 100
  },
  "source": "budget",
  "timestamp": 1705123456789,
  "importance": 0.8
}
```

---

## Scheduler Events

### `scheduler:task_scheduled`
**Description:** A background task was queued.

**Payload:**
```typescript
{
  task_id: string;
  task_type: string;
  scheduled_for: number;
  priority: number;
  budget_category: string;
}
```

**Example Log:**
```json
{
  "id": "sched_event_001",
  "event_type": "scheduler:task_scheduled",
  "category": "scheduler",
  "npc_id": "npc_abc123",
  "payload": {
    "task_id": "task_123",
    "task_type": "generate_memory",
    "scheduled_for": 1705123500,
    "priority": 5,
    "budget_category": "autonomous_posts"
  },
  "source": "scheduler",
  "timestamp": 1705123456789,
  "importance": 0.3
}
```

---

### `scheduler:task_started`
**Description:** A background task began execution.

**Payload:**
```typescript
{
  task_id: string;
  task_type: string;
}
```

**Example Log:**
```json
{
  "id": "sched_event_002",
  "event_type": "scheduler:task_started",
  "category": "scheduler",
  "npc_id": "npc_abc123",
  "payload": {
    "task_id": "task_123",
    "task_type": "generate_memory"
  },
  "source": "scheduler",
  "timestamp": 1705123500000,
  "importance": 0.3
}
```

---

### `scheduler:task_completed`
**Description:** A background task finished successfully.

**Payload:**
```typescript
{
  task_id: string;
  task_type: string;
  duration_ms: number;
}
```

**Example Log:**
```json
{
  "id": "sched_event_003",
  "event_type": "scheduler:task_completed",
  "category": "scheduler",
  "npc_id": "npc_abc123",
  "payload": {
    "task_id": "task_123",
    "task_type": "generate_memory",
    "duration_ms": 2340
  },
  "source": "scheduler",
  "timestamp": 1705123502340,
  "importance": 0.4
}
```

---

### `scheduler:task_failed`
**Description:** A background task errored.

**Payload:**
```typescript
{
  task_id: string;
  task_type: string;
  duration_ms: number;
  error_message: string;
}
```

**Example Log:**
```json
{
  "id": "sched_event_004",
  "event_type": "scheduler:task_failed",
  "category": "scheduler",
  "npc_id": "npc_abc123",
  "payload": {
    "task_id": "task_124",
    "task_type": "generate_post",
    "duration_ms": 5120,
    "error_message": "AI provider timeout"
  },
  "source": "scheduler",
  "timestamp": 1705123507120,
  "importance": 0.7
}
```

---

### `scheduler:task_cancelled`
**Description:** A background task was cancelled (usually due to budget).

**Payload:**
```typescript
{
  task_id: string;
  task_type: string;
  error_message?: string;
}
```

**Example Log:**
```json
{
  "id": "sched_event_005",
  "event_type": "scheduler:task_cancelled",
  "category": "scheduler",
  "npc_id": "npc_abc123",
  "payload": {
    "task_id": "task_125",
    "task_type": "generate_post",
    "error_message": "Would exceed category budget for autonomous_posts"
  },
  "source": "scheduler",
  "timestamp": 1705123456789,
  "importance": 0.5
}
```

---

## System Events

### `system:startup`
**Description:** Server started.

**Payload:**
```typescript
{
  version: string;
  port: number;
}
```

**Example Log:**
```json
{
  "id": "sys_event_001",
  "event_type": "system:startup",
  "category": "system",
  "payload": {
    "version": "0.1.0",
    "port": 4269
  },
  "source": "system",
  "timestamp": 1705123456789,
  "importance": 0.5
}
```

---

### `system:ws_connected`
**Description:** A WebSocket client connected.

**Payload:**
```typescript
{
  session_id: string;
  client_count: number;
}
```

**Example Log:**
```json
{
  "id": "sys_event_002",
  "event_type": "system:ws_connected",
  "category": "system",
  "session_id": "session_1705123456789_abc123",
  "payload": {
    "session_id": "session_1705123456789_abc123",
    "client_count": 1
  },
  "source": "ws-server",
  "timestamp": 1705123456789,
  "importance": 0.4
}
```

---

### `system:ws_disconnected`
**Description:** A WebSocket client disconnected.

**Payload:**
```typescript
{
  session_id: string;
  client_count: number;
}
```

**Example Log:**
```json
{
  "id": "sys_event_003",
  "event_type": "system:ws_disconnected",
  "category": "system",
  "session_id": "session_1705123456789_abc123",
  "payload": {
    "session_id": "session_1705123456789_abc123",
    "client_count": 0
  },
  "source": "ws-server",
  "timestamp": 1705123556789,
  "importance": 0.4
}
```

---

## Quick Copy-Paste Templates

### Emit a conversation event
```typescript
eventBus.fire(EventTypes.CONVERSATION_MESSAGE_SENT, {
  message_id: id,
  content: content,
  word_count: content.split(/\s+/).length,
  has_image: false,
}, {
  source: 'conversation',
  player_id: playerId,
  npc_id: npcId,
  conversation_id: conversationId,
});
```

### Emit an NPC event
```typescript
eventBus.fire(EventTypes.NPC_CREATED, {
  npc_id: id,
  username: data.username,
  display_name: data.display_name,
  generation_method: 'ai',
}, {
  source: 'npc',
  npc_id: id,
  importance: 0.8,
});
```

### Emit a relationship event
```typescript
eventBus.fire(EventTypes.RELATIONSHIP_STAGE_CHANGED, {
  previous_stage: oldStage,
  new_stage: newStage,
  trust: trustLevel,
  affinity: affinityLevel,
  familiarity: familiarityLevel,
}, {
  source: 'relationships',
  player_id: playerId,
  npc_id: npcId,
  importance: 1.0,
});
```

### Emit with parent linking (for causal chains)
```typescript
const parentEvent = await eventBus.emit(EventTypes.CONVERSATION_MESSAGE_SENT, payload, context);

eventBus.fire(EventTypes.CONVERSATION_MESSAGE_RECEIVED, responsePayload, {
  ...context,
  parent_event_id: parentEvent.id,
});
```

---

## Importance Levels Guide

| Level | Use For |
|-------|---------|
| **1.0** | Stage changes, milestones, critical errors |
| **0.8-0.9** | NPC creation, first interactions, budget exhausted |
| **0.7** | Task failures, budget warnings, AI errors |
| **0.5** | Messages, NPC updates, AI responses (default) |
| **0.3-0.4** | Task scheduling, budget spent, stats updates |
| **0.1-0.2** | Message read, typing indicators, memory recalled |

Higher importance = logged to console, easier to find in queries.
