# Background Agents (`/server/src/agents/`)

Background agents are **event-driven workers** that process game events asynchronously without blocking the main thread. They listen to the event bus and perform tasks like extracting memories, analyzing relationships, and generating content.

---

## 🎯 Purpose

Agents handle tasks that:
- Don't need immediate synchronous execution
- Can be processed in the background
- Should not block user-facing operations
- Require complex analysis or AI processing

---

## 📂 Agents

### Core Agents

| Agent | Trigger | Purpose |
|-------|---------|---------|
| **memory-writer.ts** | `CONVERSATION_MESSAGE_SENT` | Extracts key memories from conversations |
| **relationship-analyzer.ts** | `CONVERSATION_MESSAGE_SENT` | Updates trust/affinity/familiarity stats |
| **profile-populator.ts** | `NPC_CREATED` | Generates MyFace profile, picture, initial posts |

### Autopilot Agents

| Agent | Trigger | Purpose |
|-------|---------|---------|
| **conversation-initiator.ts** | Scheduled (background-scheduler) | NPCs initiate conversations with player |
| **social-autopilot.ts** | Scheduled (background-scheduler) | NPCs create posts/comments autonomously |
| **chess-autopilot.ts** | `CHESS_MOVE_NEEDED` | NPCs make chess moves |
| **pinball-autopilot.ts** | `PINBALL_GAME_ACTIVE` | NPCs play pinball |

---

## 🔄 How Agents Work

### Event-Driven Pattern

```typescript
import { eventBus, EventTypes } from "../events/index.js";

// Agent listens to event bus
eventBus.on(EventTypes.CONVERSATION_MESSAGE_SENT, async (event) => {
  // Extract data from event
  const { conversation_id, message_id } = event.payload;

  // Process asynchronously (doesn't block)
  await extractMemories(conversation_id, message_id);

  // Emit completion event (optional)
  eventBus.fire(EventTypes.MEMORY_EXTRACTED, {
    conversation_id,
    memory_count: 3
  });
});
```

### Key Principles

1. **Non-Blocking** - Agents process events asynchronously
2. **Idempotent** - Can be safely re-run with same input
3. **Fail-Safe** - Errors logged, don't crash server
4. **Event-Emitting** - Agents emit events for their actions

---

## 🧠 Agent Details

### Memory Writer
**File:** `memory-writer.ts`

**Trigger:** `CONVERSATION_MESSAGE_SENT`

**Purpose:** Extracts key memories from conversations and stores them in the memory bank.

**Process:**
1. Receives message_sent event
2. Fetches recent conversation history
3. Uses AI to extract important facts/moments
4. Tags with importance score (0-1)
5. Stores in `memories` table
6. Emits `MEMORY_EXTRACTED` event

**Example Memory:**
```json
{
  "content": "Player mentioned they love hiking in the mountains",
  "importance": 0.7,
  "tags": ["hobbies", "outdoor_activities"],
  "npc_id": "npc_abc123"
}
```

---

### Relationship Analyzer
**File:** `relationship-analyzer.ts`

**Trigger:** `CONVERSATION_MESSAGE_SENT`

**Purpose:** Analyzes conversation dynamics and updates relationship stats (trust, affinity, familiarity).

**Process:**
1. Receives message_sent event
2. Fetches recent conversation history
3. Uses AI to analyze emotional tone, connection
4. Calculates stat deltas (+/- for trust/affinity/familiarity)
5. Updates `npc_relationships` table
6. Emits `RELATIONSHIP_UPDATED` event

**Stats Updated:**
- **Trust** - Reliability, honesty, safety
- **Affinity** - Emotional connection, chemistry
- **Familiarity** - How well they know each other

**Example Delta:**
```json
{
  "trust": +2,
  "affinity": +5,
  "familiarity": +3
}
```

---

### Profile Populator
**File:** `profile-populator.ts`

**Trigger:** `NPC_CREATED`

**Purpose:** Generates complete MyFace profile when NPC is created.

**Process:**
1. Receives NPC_created event
2. Generates profile picture (using image generation)
3. Generates bio text (based on personality)
4. Creates 3-5 initial posts
5. Sets profile song
6. Picks aesthetic theme
7. Updates NPC profile in database
8. Emits `PROFILE_POPULATED` event

**Generated Content:**
- Profile picture
- Bio (2-3 sentences)
- Initial posts (establishing personality)
- Profile song (from music library)
- Aesthetic theme

---

### Conversation Initiator
**File:** `conversation-initiator.ts`

**Trigger:** Scheduled (via background-scheduler)

**Purpose:** NPCs initiate conversations with the player.

**Process:**
1. Runs on schedule (e.g., every 30 minutes)
2. Selects NPCs likely to initiate (based on extraversion, spontaneity)
3. Checks relationship stage (friends+ more likely)
4. Builds context (recent activity, shared memories)
5. Generates opening message
6. Creates conversation thread
7. Emits `CONVERSATION_INITIATED` event

**Selection Criteria:**
- High extraversion (>0.6)
- High spontaneity (>0.5)
- Relationship stage: Friend+ (40+)
- Not messaged recently (cooldown)

---

### Social Autopilot
**File:** `social-autopilot.ts`

**Trigger:** Scheduled (via background-scheduler)

**Purpose:** NPCs create autonomous posts and comments.

**Process:**
1. Runs on schedule (e.g., every 15 minutes)
2. Selects active NPCs (extraversion, spontaneity)
3. Decides action (post vs comment vs skip)
4. Builds social context (recent feed, trending topics)
5. Generates content
6. Creates post/comment
7. Emits `SOCIAL_POST_CREATED` or `COMMENT_CREATED`

**Action Types:**
- **Original Post** - NPC shares thought/photo/status
- **Comment** - NPC comments on another's post
- **Skip** - NPC stays quiet this cycle

**Documentation:** [DRAMA_AUTOMATION.md](../../../docs/completed/DRAMA_AUTOMATION.md)

---

### Chess Autopilot
**File:** `chess-autopilot.ts`

**Trigger:** `CHESS_MOVE_NEEDED`

**Purpose:** NPCs make chess moves when playing against player or other NPCs.

**Process:**
1. Receives move_needed event
2. Fetches current board state
3. Uses chess engine to calculate move
4. Applies NPC skill level (affects move quality)
5. Makes move
6. Emits `CHESS_MOVE_MADE` event

**Skill Levels:**
- Beginner (ELO 800-1000)
- Intermediate (ELO 1000-1400)
- Advanced (ELO 1400-1800)
- Expert (ELO 1800+)

---

### Pinball Autopilot
**File:** `pinball-autopilot.ts`

**Trigger:** `PINBALL_GAME_ACTIVE`

**Purpose:** NPCs play pinball automatically.

**Process:**
1. Receives game_active event
2. Fetches current game state
3. Decides flipper action (based on ball position)
4. Applies NPC reaction time (affects performance)
5. Executes action
6. Emits `PINBALL_ACTION_TAKEN` event

**Performance Factors:**
- Reaction time (based on reflexes trait)
- Timing precision (based on conscientiousness)
- Risk-taking (based on openness)

---

## 🎯 Adding a New Agent

### Template

```typescript
import { eventBus, EventTypes } from "../events/index.js";
import { errorLogger } from "../services/error-logger.js";

// Agent initialization
export function initMyAgent() {
  eventBus.on(EventTypes.MY_TRIGGER_EVENT, async (event) => {
    try {
      // Extract data from event
      const { some_id } = event.payload;

      // Perform background task
      await processTask(some_id);

      // Emit completion event (optional)
      eventBus.fire(EventTypes.MY_COMPLETION_EVENT, {
        some_id,
        result: "success"
      });
    } catch (error) {
      // Log error (doesn't throw)
      errorLogger.log(error, {
        source: "my_agent",
        operation: "processTask",
        some_id
      });
    }
  });
}

async function processTask(someId: string) {
  // Task logic here
}
```

### Checklist

1. **Choose Trigger Event** - What event should start this agent?
2. **Define Task** - What should the agent do?
3. **Handle Errors** - Use errorLogger, don't crash
4. **Emit Events** - Fire events for agent actions
5. **Test Idempotency** - Can it safely re-run?
6. **Add to Server Init** - Call `initMyAgent()` in `server/src/index.ts`

---

## 🚦 Best Practices

### Error Handling

**DO:**
```typescript
try {
  await riskyOperation();
} catch (error) {
  errorLogger.log(error, {
    source: "agent_name",
    operation: "operation_name"
  });
}
```

**DON'T:**
```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error(error); // ❌ Use errorLogger instead
  throw error; // ❌ Don't crash the agent
}
```

### Event Emission

**DO:**
```typescript
eventBus.fire(EventTypes.TASK_COMPLETED, {
  task_id: id,
  result: "success"
}, {
  source: "my_agent",
  importance: 0.3
});
```

**DON'T:**
```typescript
// ❌ Don't skip event emission
await completeTask();
// No event fired!
```

### AI Budget

**DO:**
```typescript
import { queuedGenerateNPCResponse, Priority } from "../services/ai.js";

// Use LOW/IDLE priority for background tasks
const response = await queuedGenerateNPCResponse(
  npcId,
  prompt,
  context,
  { priority: Priority.LOW }
);
```

**DON'T:**
```typescript
// ❌ Don't use HIGH/CRITICAL for background tasks
const response = await queuedGenerateNPCResponse(
  npcId,
  prompt,
  context,
  { priority: Priority.CRITICAL } // ❌ Wastes budget
);
```

---

## 📊 Performance Considerations

### Agent Execution

- Agents run **asynchronously** (non-blocking)
- Multiple agents can process events in parallel
- Use **queue** for rate-limiting if needed
- Respect **budget limits** for AI calls

### Scheduling

Scheduled agents (conversation-initiator, social-autopilot) should:
- Use **background-scheduler** service
- Have configurable intervals
- Respect budget limits
- Skip cycles if budget exhausted

---

## 📚 Documentation

- [EVENT_BUS_SPEC.md](../../../docs/completed/EVENT_BUS_SPEC.md) - Event bus architecture
- [EVENT_REFERENCE.md](../../../docs/completed/EVENT_REFERENCE.md) - All event types
- [DRAMA_AUTOMATION.md](../../../docs/completed/DRAMA_AUTOMATION.md) - Social autopilot
- [AI_QUEUE.md](../../../docs/completed/AI_QUEUE.md) - AI request queue
- [ERROR_LOGGING.md](../../../docs/completed/ERROR_LOGGING.md) - Error handling
