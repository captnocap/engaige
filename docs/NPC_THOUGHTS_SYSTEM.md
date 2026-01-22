# NPC Thoughts & Deliberation System

This document describes the system for extracting, filtering, and displaying NPC "thoughts" from AI reasoning models, as well as the forced deliberation loop system for extended NPC consideration.

## Overview

When using AI models that output reasoning in `<think>` blocks (like DeepSeek, QwQ, or Claude with extended thinking), this system:

1. **Extracts** reasoning blocks from AI responses
2. **Classifies** them as "in-character" thoughts vs "meta-AI" reasoning
3. **Stores** all thoughts in the database for logging/debugging
4. **Displays** only in-character thoughts in the "NPC Thoughts" UI
5. **Strips** reasoning blocks from the actual NPC response

Additionally, the **deliberation system** can force NPCs into extended thinking loops with variable depth based on personality, relationship, and topic factors.

---

## Reasoning Extraction

### Supported Block Formats

The system extracts content from these XML-style tags:

- `<think>...</think>`
- `<thinking>...</thinking>`
- `<reasoning>...</reasoning>`
- `<thought>...</thought>`
- `<internal>...</internal>`
- `<scratchpad>...</scratchpad>`

### Integration Point

All AI responses flow through `processAndStoreThoughts()` in `server/src/services/reasoning-extractor.ts`:

```typescript
// In ai.ts - after getting the raw AI response
const cleanResponse = await processAndStoreThoughts(response, npcId, {
  conversation_id: context?.conversation_id,
  trigger_message: message,
});
```

This ensures:
- Reasoning blocks are never shown to the user
- All thoughts are logged to the database
- Clean responses are passed to validation and the user

---

## Thought Classification

Thoughts are classified into three types:

| Type | Description | Displayed to User |
|------|-------------|-------------------|
| `in_character` | Genuine NPC feelings, reactions, considerations | Yes |
| `meta_ai` | AI reasoning about roleplay, instructions, safety | No (logging only) |
| `unknown` | Ambiguous content | Depends on confidence |

### In-Character Patterns (Good)

```
- "i feel nervous about this..."
- "hmm, what should I say?"
- "this person seems nice"
- "reminds me of when..."
- "hope they like me"
```

### Meta-AI Patterns (Filtered Out)

```
- "as an AI, I should..."
- "staying in character..."
- "according to my instructions..."
- "I'm roleplaying as..."
- "the user wants me to..."
```

### Confidence Scoring

Each classification includes a confidence score (0-1):
- High confidence (>0.7): Strong pattern matches
- Medium confidence (0.4-0.7): Mixed signals
- Low confidence (<0.4): No strong patterns either way

---

## Deliberation System

### Overview

The deliberation system forces NPCs into extended thinking loops using `</think>` as a stop sequence. This creates deeper, more considered responses for important moments.

### How It Works

1. **Calculate Thinking Depth** based on:
   - NPC personality (overthinking tendency, impulsivity, anxiety)
   - Relationship factors (stage, trust, familiarity, crush status)
   - Message factors (personal questions, sensitive topics, complexity)
   - Random chaos (human unpredictability)

2. **Execute Thinking Loops**:
   - Set `</think>` as stop sequence
   - Model enters `<think>` mode
   - Gets cut off before closing tag
   - Accumulate thoughts, repeat
   - Final call without stop sequence to get response

3. **Return** clean response + all captured thoughts

### Thinking Styles

| Style | Loops | When |
|-------|-------|------|
| `quick` | 1 | Comfortable topic, confident, impulsive |
| `normal` | 2 | Default interactions |
| `deliberate` | 3-4 | Sensitive topics, new relationships |
| `agonizing` | 5-7 | Has crush, very personal questions |

### Variable Depth Factors

```typescript
// Factors that INCREASE thinking depth:
- overthinking_tendency > 0.7
- anxiety_level > 0.6
- relationship_stage in ['stranger', 'acquaintance']
- has_crush = true (adds +2 loops!)
- is_personal_question = true
- is_sensitive_topic = true
- requires_emotional_response = true

// Factors that DECREASE thinking depth:
- impulsivity > 0.7
- trust_level > 80 && familiarity > 70
- confidence_on_topic > 0.8

// Chaos factor (15% chance):
- Overthink simple things
- Breeze through complex things
```

### Usage

```typescript
import { queuedDeliberateResponse } from './services/ai.js';

// Use deliberation for important conversations
const result = await queuedDeliberateResponse(
  npcId,
  message,
  conversationHistory,
  {
    player_id: playerId,
    conversation_id: convId,
    platform: 'chat',
    // Optional: force specific depth
    force_depth: 5,
  }
);

// Result includes:
// - response: The final clean response
// - thinking_loops: How many loops were executed
// - accumulated_thoughts: All captured thoughts
// - thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing'
// - total_thinking_time_ms: Total deliberation time
// - depth_reason: Why this depth was chosen
```

---

## Database Schema

### `npc_thoughts` Table (game.db)

```sql
CREATE TABLE npc_thoughts (
  id TEXT PRIMARY KEY,
  npc_id TEXT NOT NULL,
  content TEXT NOT NULL,
  thought_type TEXT NOT NULL,        -- 'in_character', 'meta_ai', 'unknown'
  confidence REAL DEFAULT 0.5,
  context TEXT,                      -- Trigger message
  conversation_id TEXT,
  thinking_style TEXT,               -- From deliberation
  deliberation_loop INTEGER,         -- Which loop (1, 2, 3...)
  created_at INTEGER DEFAULT (unixepoch())
);
```

### `deliberation_sessions` Table (game.db)

```sql
CREATE TABLE deliberation_sessions (
  id TEXT PRIMARY KEY,
  npc_id TEXT NOT NULL,
  conversation_id TEXT,
  total_loops INTEGER NOT NULL,
  thinking_style TEXT NOT NULL,
  depth_reason TEXT,
  total_time_ms INTEGER,
  started_at INTEGER DEFAULT (unixepoch()),
  completed_at INTEGER,
  trigger_message TEXT,
  final_response TEXT
);
```

---

## Event Types

### `npc:thought_captured`

Emitted when an in-character thought is extracted and stored.

```typescript
{
  thought_id: string;
  content: string;
  thought_type: 'in_character' | 'meta_ai' | 'unknown';
  confidence: number;
}
```

### `npc:deliberation_started`

Emitted when an NPC begins extended deliberation.

```typescript
{
  npc_id: string;
  target_loops: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  reason: string;
}
```

### `npc:deliberation_completed`

Emitted when deliberation finishes.

```typescript
{
  npc_id: string;
  loops_completed: number;
  thinking_style: string;
  total_time_ms: number;
  thought_count: number;
}
```

---

## WebSocket API

### Get Thoughts

```json
// Request
{ "type": "thoughts:get", "payload": {
  "npcId": "optional-npc-id",
  "limit": 20,
  "thoughtType": "in_character",
  "minConfidence": 0.5,
  "since": 1234567890
}}

// Response
{ "type": "response", "success": true, "payload": [
  {
    "id": "thought-123",
    "npc_id": "npc-456",
    "npc_display_name": "Luna",
    "content": "they seem really nice... should I tell them about my art?",
    "thought_type": "in_character",
    "confidence": 0.85,
    "created_at": 1234567890
  }
]}
```

### Subscribe to Real-Time Thoughts

```json
// Subscribe (optionally filter by NPC)
{ "type": "thoughts:subscribe", "payload": { "npcId": "optional" }}

// Unsubscribe
{ "type": "thoughts:unsubscribe" }

// Real-time events you'll receive:
{ "type": "thoughts:captured", "payload": { ... }}
{ "type": "thoughts:deliberationStarted", "payload": { ... }}
{ "type": "thoughts:deliberationCompleted", "payload": { ... }}
```

---

## Frontend Integration Ideas

### "What's on their mind?" Panel

A floating panel or window showing recent in-character thoughts from NPCs:

```
┌─────────────────────────────────────┐
│ 💭 NPC Thoughts                     │
├─────────────────────────────────────┤
│ Luna (2m ago)                       │
│ "they actually remembered my       │
│  birthday... that's so sweet 🥺"   │
│                                     │
│ Marcus (5m ago)                     │
│ "should I ask them to hang out     │
│  this weekend? is that too soon?"  │
│                                     │
│ Zara (12m ago)                      │
│ "hmm why did they like THAT post?" │
└─────────────────────────────────────┘
```

### Deliberation Indicator

Show when an NPC is "thinking hard" about their response:

```
┌─────────────────────────────────────┐
│ Luna is typing...                   │
│ 🤔 (thinking deeply)                │
│ ████████░░░░░░░░ Loop 3/5           │
└─────────────────────────────────────┘
```

### Relationship Insight

Use accumulated thoughts to show relationship progression:

```
Luna's thoughts about you:
- "they're really easy to talk to" (Day 3)
- "I wonder if they like me..." (Day 7)
- "ok I definitely have feelings" (Day 14)
```

---

## Cost Considerations

### Reasoning Extraction
- **Zero additional cost** - Just regex parsing of existing responses
- Works with any model that outputs `<think>` blocks

### Deliberation Loops
- **Multiplies cost** by number of loops (2-7x typical)
- Use strategically for important moments:
  - First conversations
  - Relationship milestones
  - Sensitive topics
  - When NPC "has a crush"
- Budget reserved under `conversation` category

### Recommendations

1. **Default**: Normal response with reasoning extraction (1x cost)
2. **Important moments**: Enable deliberation (2-4x cost)
3. **Romantic tension**: Full deliberation (5-7x cost, but worth it!)

---

## Files Reference

| File | Purpose |
|------|---------|
| `server/src/services/reasoning-extractor.ts` | Extraction, classification, storage |
| `server/src/services/deliberation.ts` | Forced thinking loops, depth calculation |
| `server/src/services/ai.ts` | Integration with AI pipeline |
| `server/src/events/event-types.ts` | Event definitions |
| `server/src/network/ws-protocol.ts` | WebSocket message types |
| `server/src/network/ws-server.ts` | WebSocket handlers |
| `server/src/db/index.ts` | Database schema |
