# Error Logging System Reference

> **MANDATORY**: All error handling MUST use the error logger. Do NOT use plain `console.error()` for errors that should be tracked.

## Quick Reference

```typescript
import { errorLogger } from '../services/error-logger.js';

// Basic logging
errorLogger.log(error, {
  source: 'ai',
  operation: 'generateNPCResponse',
});

// With context
errorLogger.log(error, {
  source: 'conversation',
  operation: 'sendMessage',
  npc_id: npcId,
  player_id: playerId,
  conversation_id: conversationId,
});

// Async wrapper (auto-logs on throw)
const result = await errorLogger.wrap(
  () => riskyAsyncOperation(),
  { source: 'scheduler', operation: 'processTask' }
);

// Sync wrapper
const result = errorLogger.wrapSync(
  () => riskySyncOperation(),
  { source: 'db', operation: 'parseJSON' }
);

// With fallback (doesn't throw)
const result = await errorLogger.wrap(
  () => mightFail(),
  { source: 'ai', operation: 'parseResponse' },
  { fallback: defaultValue }
);
```

---

## Severity Levels

| Severity | When to Use | Auto-Detection Patterns |
|----------|-------------|-------------------------|
| `critical` | System is broken, data corruption, unrecoverable | `database.*corrupt`, `out of memory`, `fatal` |
| `high` | Feature broken, API failures, auth issues | `budget.*exceed`, `api.*key.*invalid`, `rate.*limit`, `timeout` |
| `medium` | Bad input, validation failures, parse errors | `not found`, `invalid.*input`, `validation.*fail` |
| `low` | Non-critical issues, warnings | Everything else |

```typescript
// Auto-detected based on error message
errorLogger.log(new Error('API key invalid'), { source: 'ai', operation: 'init' });
// → Severity: high (matches "api.*key.*invalid")

// Override severity
errorLogger.log(error, {
  source: 'system',
  operation: 'startup',
  severity: 'critical',
});
```

---

## Error Context Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | Yes | Module/service that threw: `ai`, `scheduler`, `conversation`, `budget`, etc. |
| `operation` | string | Yes | What was being attempted: `generateResponse`, `sendMessage`, etc. |
| `severity` | string | No | Override auto-detection: `low`, `medium`, `high`, `critical` |
| `npc_id` | string | No | Related NPC ID |
| `player_id` | string | No | Related player ID |
| `conversation_id` | string | No | Related conversation ID |
| `task_id` | string | No | Background task ID |
| `request_id` | string | No | HTTP/WS request ID |
| `session_id` | string | No | WebSocket session ID |
| `metadata` | object | No | Additional context data |

---

## Standard Sources

Use these source names consistently:

| Source | Description |
|--------|-------------|
| `system` | Server startup, shutdown, global handlers |
| `ai` | AI provider calls, response parsing |
| `conversation` | Message sending, conversation management |
| `npc` | NPC CRUD operations |
| `scheduler` | Background task processing |
| `budget` | Budget tracking, cost calculations |
| `relationships` | Relationship stat updates |
| `ws-server` | WebSocket connection handling |
| `door` | External HTTP requests |
| `db` | Database operations |
| `media` | File handling, uploads |
| `memory` | NPC memory operations |

---

## Usage Patterns

### Pattern 1: Direct Logging

```typescript
try {
  const response = await callAI(prompt);
} catch (error) {
  errorLogger.log(error, {
    source: 'ai',
    operation: 'callAI',
    npc_id: npcId,
    metadata: { prompt_length: prompt.length },
  });
  throw error; // or handle gracefully
}
```

### Pattern 2: Async Wrapper

```typescript
// Logs error automatically, re-throws by default
const response = await errorLogger.wrap(
  () => callAI(prompt),
  { source: 'ai', operation: 'callAI', npc_id: npcId }
);
```

### Pattern 3: Fallback Value

```typescript
// Returns fallback instead of throwing
const response = await errorLogger.wrap(
  () => callAI(prompt),
  { source: 'ai', operation: 'callAI' },
  { fallback: 'Sorry, I encountered an error.' }
);
```

### Pattern 4: Silent Logging

```typescript
// Log but don't throw
await errorLogger.wrap(
  () => optionalOperation(),
  { source: 'scheduler', operation: 'cleanup' },
  { rethrow: false, fallback: undefined }
);
```

---

## Query Functions

```typescript
// Recent errors (newest first)
const recent = errorLogger.getRecent(50);

// By severity
const critical = errorLogger.getBySeverity('critical', 20);

// By source
const aiErrors = errorLogger.getBySource('ai', 50);

// Unresolved (sorted by severity then time)
const unresolved = errorLogger.getUnresolved(100);

// Search by message/stack
const matches = errorLogger.search('timeout', 50);

// Statistics
const stats = errorLogger.getStats();
// { total, by_severity, by_source, unresolved }

// Stats since timestamp
const todayStats = errorLogger.getStats(Date.now() - 86400000);
```

---

## Error Resolution

```typescript
// Mark single error resolved
errorLogger.resolve('error-uuid', 'Fixed in commit abc123');

// Mark multiple resolved
errorLogger.resolveMany(['id1', 'id2'], 'Bulk fix applied');
```

---

## Console Output

Errors are color-coded in the console:

```
[ERROR:CRITICAL] [system:uncaughtException] Database connection lost
[ERROR:HIGH] [ai:generateResponse] API rate limit exceeded
[ERROR:MEDIUM] [conversation:sendMessage] NPC not found
[ERROR:LOW] [scheduler:cleanup] Optional task skipped
```

Critical and high severity errors include stack traces.

---

## Database Schema

```sql
CREATE TABLE error_log (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  severity TEXT NOT NULL,

  error_type TEXT NOT NULL,     -- Error class name (Error, TypeError, etc.)
  message TEXT NOT NULL,
  stack TEXT,
  code TEXT,                    -- error.code if available

  source TEXT NOT NULL,
  operation TEXT NOT NULL,
  npc_id TEXT,
  player_id TEXT,
  conversation_id TEXT,
  task_id TEXT,
  request_id TEXT,
  session_id TEXT,
  metadata TEXT,                -- JSON blob

  resolved INTEGER DEFAULT 0,
  resolved_at INTEGER,
  resolution_notes TEXT
);
```

Indexes on: `timestamp`, `severity`, `source`, `resolved`, `error_type`

---

## Event Bus Integration

All logged errors automatically emit a `system:error` event:

```typescript
eventBus.fire(EventTypes.SYSTEM_ERROR, {
  error_type: 'Error',
  message: 'Something went wrong',
  stack: '...',
  context: { source: 'ai', operation: 'generateResponse' },
}, {
  source: 'ai',
  importance: 0.8,  // Based on severity
});
```

---

## Example Log Output

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1705847234567,
  "severity": "high",
  "error_type": "Error",
  "message": "API rate limit exceeded. Please try again in 60 seconds.",
  "stack": "Error: API rate limit exceeded...\n    at callAI (ai.ts:42)...",
  "code": "RATE_LIMITED",
  "source": "ai",
  "operation": "generateNPCResponse",
  "npc_id": "npc_sarah_123",
  "player_id": "player_main",
  "conversation_id": "conv_abc",
  "metadata": {
    "model": "gpt-4",
    "tokens_requested": 2000
  },
  "resolved": false
}
```

---

## Global Error Handlers

The error logger automatically catches:

1. **Unhandled Promise Rejections** → Severity: `high`
2. **Uncaught Exceptions** → Severity: `critical`

These are logged and the server continues running when possible.

---

## Best Practices

1. **Always provide context** - Include relevant IDs (npc_id, player_id, etc.)
2. **Use meaningful operations** - Make it clear what was being attempted
3. **Add metadata for debugging** - Include relevant data that helps diagnose
4. **Use wrappers for async code** - Cleaner than try/catch everywhere
5. **Set severity only when auto-detection is wrong**
6. **Resolve errors when fixed** - Keep the unresolved list actionable
