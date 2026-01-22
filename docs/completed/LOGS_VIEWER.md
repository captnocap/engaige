# Logs Viewer System

The Logs Viewer is a desktop window application for monitoring all backend systems in real-time.

## Overview

The Logs Viewer provides visibility into four core backend systems:

1. **Events** - Master event log from the Event Bus
2. **Errors** - Error log with severity tracking and resolution
3. **Budget** - API spending logs per category
4. **Queue** - AI request queue status and statistics

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LogsWindow.tsx                              │
│  (React component with 4 tabs, uses wsStore for WebSocket)         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ WebSocket (ws://localhost:4269/ws)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          ws-server.ts                                │
│  (Routes: logs:getEvents, logs:getErrors, logs:resolveError,        │
│           logs:getQueue)                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          routes/logs.ts                              │
│  (Handler functions that query backend services)                     │
└─────────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌────────────┐      ┌─────────────┐      ┌────────────┐
    │ Event Bus  │      │ Error Logger│      │  AI Queue  │
    │(SQLite:    │      │ (SQLite:    │      │ (In-memory)│
    │game_events)│      │ error_log)  │      │            │
    └────────────┘      └─────────────┘      └────────────┘
```

## Files

### New Files Created

| File | Purpose |
|------|---------|
| `src/components/desktop/LogsWindow.tsx` | React component with 4 tabs for viewing logs |
| `server/src/routes/logs.ts` | Backend handlers for querying log systems |

### Modified Files

| File | Changes |
|------|---------|
| `server/src/network/ws-protocol.ts` | Added logs message types |
| `server/src/network/ws-server.ts` | Added logs route handlers |
| `src/components/desktop/Desktop.tsx` | Registered LogsWindow and desktop icon |

## WebSocket Messages

### Client → Server

| Message Type | Payload | Description |
|--------------|---------|-------------|
| `logs:getEvents` | `{ category?: string, limit?: number }` | Fetch recent events |
| `logs:getErrors` | `{ severity?: string, unresolved?: boolean, limit?: number }` | Fetch error logs |
| `logs:resolveError` | `{ errorId: string, notes?: string }` | Mark an error as resolved |
| `logs:getQueue` | `{}` | Get AI queue status |

### Server → Client

All responses follow the standard response format:
```typescript
{
  type: 'response',
  id: string,      // Matches request ID
  success: boolean,
  payload: T,      // Response data
  error?: string   // Error message if success=false
}
```

## Tab Features

### Events Tab

- **Filter by category**: All, Player, NPC, Conversation, Relationship, Social, Memory, Budget, System, Scheduler, AI, Media, News
- **Auto-refresh**: Toggle to poll every 2 seconds
- **Expandable rows**: Click to view full event payload (JSON)
- **Importance indicator**: Color-coded by importance (0.0-1.0)
- **Timestamp**: Shows time in HH:MM:SS format

**Event Data Fields:**
- `event_type` - Full event type (e.g., "system:startup")
- `category` - Event category (e.g., "system")
- `payload` - Event-specific data (JSON)
- `source` - Service that emitted the event
- `importance` - 0.0-1.0 significance score
- `timestamp` - Unix timestamp in milliseconds

### Errors Tab

- **Filter by severity**: All, Critical, High, Medium, Low
- **Show resolved**: Toggle to include resolved errors
- **Mark resolved**: Button to mark errors as resolved
- **Stack traces**: Expandable view of full stack traces
- **Metadata**: Expandable view of error context (JSON)

**Error Data Fields:**
- `severity` - critical, high, medium, low
- `error_type` - Error class name
- `message` - Error message
- `stack` - Full stack trace
- `source` - Service where error occurred
- `operation` - What was being attempted
- `resolved` - Whether error has been addressed

### Budget Tab

- **Filter by category**: All, Conversation, NPC Generation, Autonomous Posts, etc.
- **Running total**: Shows sum of all visible costs
- **Token counts**: Input/output tokens per request
- **Cost display**: Formatted as $0.0000

**Budget Log Fields:**
- `provider` - AI provider (openai, anthropic, etc.)
- `model` - Model used (gpt-4, claude-3, etc.)
- `feature_category` - Budget category
- `input_tokens` - Prompt tokens
- `output_tokens` - Response tokens
- `cost_cents` - Cost in cents

### Queue Tab

- **Auto-refresh**: Enabled by default (1 second interval)
- **Processing count**: Number currently executing
- **Queue by priority**: CRITICAL, HIGH, MEDIUM, LOW, IDLE
- **Deferred queue**: Requests waiting for budget
- **Statistics**: Total processed, deferred, failed, cost

**Queue Status Fields:**
- `active` - Requests in queue by priority
- `deferred` - Requests paused due to budget
- `processing` - Count of currently executing
- `stats.totalProcessed` - All-time processed count
- `stats.totalDeferred` - All-time deferred count
- `stats.totalFailed` - All-time failure count
- `stats.totalCostCents` - All-time cost

## Usage

### Opening the Logs Window

1. **Desktop icon**: Double-click the "📊 Logs" icon
2. **Taskbar**: Click the Logs button if window is open

### Monitoring Events in Real-Time

1. Open the Logs window
2. Click the "Events" tab
3. Check "Auto-refresh" to poll every 2 seconds
4. Use the category filter to focus on specific event types
5. Click any event row to expand and view the full payload

### Debugging Errors

1. Open the Logs window
2. Click the "Errors" tab
3. Leave "Show resolved" unchecked to focus on active issues
4. Filter by severity if looking for critical issues
5. Expand errors to see stack traces
6. Click "Mark Resolved" when issues are addressed

### Monitoring AI Costs

1. Open the Logs window
2. Click the "Budget" tab
3. Use category filter to see spending by feature
4. Watch the running total in the header
5. Click rows to see token counts and metadata

### Watching the AI Queue

1. Open the Logs window
2. Click the "Queue" tab
3. Auto-refresh is enabled by default
4. Monitor processing count and queue depth
5. Watch for deferred requests (indicates budget pressure)

## Connection Status

The Logs window displays a connection indicator:

- **No banner** = Connected to server
- **Yellow banner** = "Connecting to server..." (WebSocket connecting)

The window automatically attempts to connect on mount. If the server is not running, you'll see connection errors in each tab.

## Data Sources

| Tab | Backend Service | Storage |
|-----|-----------------|---------|
| Events | `eventBus` | SQLite `game_events` table |
| Errors | `errorLogger` | SQLite `error_log` table |
| Budget | Budget routes | SQLite `api_costs` table |
| Queue | `aiQueue` | In-memory (not persisted) |

## Related Documentation

- **[EVENT_BUS_SPEC.md](EVENT_BUS_SPEC.md)** - Event Bus architecture
- **[EVENT_REFERENCE.md](EVENT_REFERENCE.md)** - All event types
- **[ERROR_LOGGING.md](ERROR_LOGGING.md)** - Error Logger patterns
- **[AI_QUEUE.md](AI_QUEUE.md)** - AI Queue system
- **[NETWORK_ARCHITECTURE.md](NETWORK_ARCHITECTURE.md)** - WebSocket protocol
