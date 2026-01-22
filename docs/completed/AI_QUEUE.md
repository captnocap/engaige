# AI Request Queue System

> **MANDATORY**: All AI requests that affect game state should go through the queue. Use `queuedGenerateNPCResponse()` instead of `generateNPCResponse()` for proper priority and budget management.

## Overview

The AI Queue (`server/src/services/ai-queue.ts`) manages all AI requests with:

- **Priority-based execution** - User DMs always process before background posts
- **Budget reservation** - Higher priorities have reserved budget allocation
- **Automatic deferral** - Low-priority requests wait when budget is tight
- **Retry logic** - Transient failures auto-retry with backoff

## Priority Tiers

| Tier | Priority | Name | Budget Reserve | Min Budget | Max Queue Time | Deferrable |
|------|----------|------|----------------|------------|----------------|------------|
| 1 | `CRITICAL` | Critical | 40% | 0% | 30s | No |
| 2 | `HIGH` | High | 25% | 5% | 1m | Yes |
| 3 | `MEDIUM` | Medium | 20% | 35% | 5m | Yes |
| 4 | `LOW` | Low | 10% | 50% | 1h | Yes |
| 5 | `IDLE` | Idle | 5% | 80% | 24h | Yes |

### When Each Tier Runs

| Budget Remaining | Critical | High | Medium | Low | Idle |
|------------------|----------|------|--------|-----|------|
| 80-100% | RUN | RUN | RUN | RUN | RUN |
| 50-80% | RUN | RUN | RUN | RUN | DEFER |
| 35-50% | RUN | RUN | RUN | DEFER | DEFER |
| 20-35% | RUN | RUN | DEFER | DEFER | DEFER |
| 5-20% | RUN | DEFER | DEFER | DEFER | DEFER |
| 0-5% | WARN | DEFER | DEFER | DEFER | DEFER |

## Quick Reference

```typescript
import {
  queuedGenerateNPCResponse,
  queuedGenerateNPCPost,
  queuedNPCInteraction,
  queuedPregenerate,
  Priority
} from '../services/ai.js';

// User sends DM (CRITICAL priority - default)
const result = await queuedGenerateNPCResponse(npcId, message, history, {
  player_id: playerId,
  conversation_id: convId,
  isUserInitiated: true, // Default, ensures CRITICAL priority
});

if (result.status === 'completed') {
  console.log(result.result); // The NPC's response
}

// NPC creates scheduled post (MEDIUM priority)
const postResult = await queuedGenerateNPCPost(npcId, 'twitter', 'Share your morning thoughts', {
  isScheduled: true,
});

// Background NPC post (LOW priority)
const bgResult = await queuedGenerateNPCPost(npcId, 'instagram', undefined, {
  isBackground: true,
});

// NPC-to-NPC interaction (LOW priority)
const interactionResult = await queuedNPCInteraction(
  sourceNpcId,
  targetNpcId,
  'comment',
  'Respond to their post about coffee'
);

// Pre-generate content (IDLE - only when budget > 80%)
const pregenResult = await queuedPregenerate(npcId, 'greeting', {
  platform: 'messaging',
});
```

## Request Types

| Type | Description | Default Priority |
|------|-------------|------------------|
| `npc_response` | NPC responding to user | CRITICAL |
| `npc_post` | NPC creating a post | MEDIUM |
| `npc_comment` | NPC commenting | MEDIUM |
| `npc_reaction` | NPC reacting | HIGH |
| `npc_initiate` | NPC starting conversation | MEDIUM |
| `npc_npc_interaction` | NPC-to-NPC | LOW |
| `image_generation` | Creating images | MEDIUM |
| `image_analysis` | Vision/analysis | HIGH |
| `memory_consolidation` | Memory processing | LOW |
| `content_pregeneration` | Pre-generating content | IDLE |
| `analytics` | Analytics/summaries | IDLE |

## Result Handling

```typescript
const result = await queuedGenerateNPCResponse(...);

switch (result.status) {
  case 'completed':
    // Success! result.result contains the response
    console.log('Response:', result.result);
    console.log('Wait time:', result.waitTime, 'ms');
    console.log('Cost:', result.actualCost, 'cents');
    break;

  case 'deferred':
    // Request is waiting for budget
    console.log('Deferred:', result.error);
    // The request will process later automatically
    break;

  case 'expired':
    // Waited too long in queue
    console.log('Expired after', result.waitTime, 'ms');
    break;

  case 'failed':
    // Execution error after retries
    console.log('Failed:', result.error);
    break;
}
```

## Queue Status

```typescript
import { aiQueue } from '../services/ai-queue.js';

const status = aiQueue.getStatus();
// {
//   queue: [{ priority: 1, count: 2 }, { priority: 4, count: 5 }],
//   deferred: [{ priority: 4, count: 3 }],
//   processing: 2,
//   stats: {
//     totalQueued: 150,
//     totalProcessed: 140,
//     totalDeferred: 20,
//     totalExpired: 2,
//     totalFailed: 3,
//     totalCostCents: 4523,
//   },
//   budgetStatus: { ... }
// }

// Get pending requests for an NPC
const pending = aiQueue.getPendingForNPC(npcId);

// Cancel a specific request
aiQueue.cancel(requestId);

// Cancel all requests for an NPC
aiQueue.cancelForNPC(npcId);
```

## Events

The queue emits events for all state changes:

| Event | When | Payload |
|-------|------|---------|
| `ai:queued` | Request added to queue | request_id, priority, type, queue_position |
| `ai:processing` | Request started executing | request_id, priority, attempt |
| `ai:deferred` | Request moved to deferred queue | request_id, reason |
| `ai:queue_completed` | Request completed successfully | request_id, wait_time_ms, processing_time_ms |
| `ai:queue_failed` | Request failed after retries | request_id, error, attempts |
| `ai:queue_expired` | Request expired in queue | request_id, age_ms |
| `ai:queue_resumed` | Deferred requests moved back | count, budget_percent |

## Budget Integration

The queue integrates tightly with the budget system:

1. **Pre-check**: Before queueing, estimates cost and checks budget
2. **Reservation**: Higher priorities have reserved budget percentages
3. **Deferral**: When budget is low, lower-priority requests defer
4. **Auto-resume**: When budget refreshes, deferred requests process

```
┌─────────────────────────────────────────────────────────────┐
│                    Budget: $1.00/day                        │
├─────────────────────────────────────────────────────────────┤
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  40% remaining  │
├─────────────────────────────────────────────────────────────┤
│ Reserved:                                                   │
│   Tier 1 (Critical): $0.40  ✓ Available                    │
│   Tier 2 (High):     $0.25  ✓ Available                    │
│   Tier 3 (Medium):   $0.20  ⚠ Partial                      │
│   Tier 4 (Low):      $0.10  ✗ Blocked                      │
│   Tier 5 (Idle):     $0.05  ✗ Blocked                      │
├─────────────────────────────────────────────────────────────┤
│ Deferred Queue: 5 requests waiting                          │
│   3x npc_post (LOW)                                         │
│   2x npc_npc_interaction (LOW)                              │
└─────────────────────────────────────────────────────────────┘
```

## Direct vs Queued Functions

| Use This | When |
|----------|------|
| `queuedGenerateNPCResponse()` | User interactions, anything user-facing |
| `queuedGenerateNPCPost()` | Scheduled or background NPC posts |
| `queuedNPCInteraction()` | NPC-to-NPC interactions |
| `queuedPregenerate()` | Pre-generating content for later |
| `generateNPCResponse()` | Internal calls already in queue, testing |
| `generateNPCPost()` | Internal calls already in queue, testing |

## Configuration

The queue starts automatically with the server. Default settings:

```typescript
// In ai-queue.ts
private maxConcurrent = 3;           // Max parallel requests
private processInterval = 100;        // Queue check interval (ms)
private expireCheckInterval = 10000;  // Expiration check interval (ms)
private deferredCheckInterval = 60000; // Deferred queue check interval (ms)
```

## Best Practices

1. **Always use queued functions** for user-facing features
2. **Let priority be automatic** - the defaults are sensible
3. **Handle deferred status** - show user "pending" state if needed
4. **Don't bypass the queue** for budget-affecting requests
5. **Use IDLE priority** for non-urgent background work
6. **Monitor the deferred queue** - many deferred requests = budget too low

## Architecture

```
User Action
    │
    ▼
┌─────────────────┐     ┌─────────────────┐
│ queuedGenerate  │────▶│    AI Queue     │
│ NPCResponse()   │     │                 │
└─────────────────┘     │  ┌───────────┐  │
                        │  │ Priority  │  │
                        │  │  Sorted   │  │
                        │  │   Queue   │  │
                        │  └─────┬─────┘  │
                        │        │        │
                        │  ┌─────▼─────┐  │
                        │  │  Budget   │◀─┼──── Budget System
                        │  │   Check   │  │
                        │  └─────┬─────┘  │
                        │        │        │
                        │   OK?  │  No    │
                        │   ┌────┴────┐   │
                        │   │         │   │
                        │   ▼         ▼   │
                        │ Execute  Defer  │
                        │   │         │   │
                        └───┼─────────┼───┘
                            │         │
                            ▼         ▼
                    ┌──────────┐  ┌──────────┐
                    │ AI Call  │  │ Deferred │
                    │ (door)   │  │  Queue   │
                    └────┬─────┘  └──────────┘
                         │
                         ▼
                    ┌──────────┐
                    │Event Bus │
                    └──────────┘
```
