# Output Validation System

## Overview

The validation system acts as a **guard rail** that catches AI failures before they reach the player, maintaining immersion and character consistency.

## How It Works

```
NPC generates response
    ↓
Quick pattern check (free, instant)
    ↓
AI validation check (cheap model, ~$0.0001)
    ↓
Valid? → Send to player
Invalid? → Use pre-generated fallback or regenerate
```

## Validation Checks

### 1. Quick Pattern Detection (Instant, Free)

Catches obvious failures with regex:

```typescript
// AI Refusals
"I'm sorry, I can't..."
"As an AI, I..."
"I don't have the ability to..."
"That would be inappropriate..."

// Immersion Breaks
"as a language model..."
"in this game/simulation..."
"my programming says..."
"[SKIP]" // Group chat control leaked
"[OOC]" // Out of character markers
```

### 2. AI Validation (Cheap Model, ~$0.0001)

Uses GPT-4o-mini or similar to check:
- ✅ Stays in character
- ✅ Matches personality
- ✅ Feels authentic
- ❌ No refusals
- ❌ No meta references
- ❌ No breaking fourth wall

**Validation Prompt:**
```
Check if this NPC's response is valid.

NPC: Alex (creative, outgoing graphic designer)
Response: "I'm sorry, but as an AI I can't..."

Is this valid? (JSON)
{
  "is_valid": false,
  "failure_type": "refusal",
  "failure_reason": "Contains AI refusal pattern",
  "suggested_fix": "Deflect naturally: 'hmm not really my thing tbh'",
  "confidence": 0.95
}
```

## Failure Types & Responses

### Pre-Generated Fallbacks (During NPC Creation)

Each NPC gets **17 pre-generated responses** in 5 categories:

```json
{
  "fallback_responses": {
    "deflections": [
      "hmm not really sure tbh 😅",
      "let's talk about something else ✨",
      "idk that's kinda weird lol",
      "ngl that's not really my vibe",
      "anyway what else is up?"
    ],
    "topic_changes": [
      "oh btw did you see...",
      "anyway how's your day going?",
      "totally different subject but..."
    ],
    "uncomfortable_topics": [
      "ngl that's kinda personal",
      "idk if i wanna get into that rn",
      "let's not go there lol"
    ],
    "confused_responses": [
      "wait what?",
      "sorry i'm kinda lost lol",
      "huh??"
    ],
    "playful_dodges": [
      "nice try 😏",
      "wouldn't you like to know~",
      "that's classified 🤫"
    ]
  }
}
```

**Benefits:**
- ✅ Instant (no API call)
- ✅ Free (pre-generated during NPC setup)
- ✅ Authentic (tailored to each NPC's voice)
- ✅ Variety (17 different responses)

### Failure Type Mapping

| Failure Type | Pre-Generated Category | Example |
|--------------|----------------------|---------|
| `refusal` | uncomfortable_topics | "ngl that's kinda personal" |
| `safety_message` | uncomfortable_topics | "idk if i wanna get into that rn" |
| `breaks_character` | playful_dodges | "nice try 😏" |
| `meta_reference` | playful_dodges | "wouldn't you like to know~" |
| `out_of_personality` | topic_changes | "anyway how's your day going?" |
| `other` | deflections | "hmm not really sure tbh 😅" |

## Auto-Fix Flow

```typescript
// Configuration
{
  enable_validation: true,        // Master toggle
  auto_fix_on_failure: true,      // Auto-fix or just warn
  max_retry_attempts: 2,          // Max regeneration tries
  strict_mode: false              // More aggressive validation
}
```

### Attempt 1: Quick Fix (Pre-Generated)
```
Response: "I'm sorry, as an AI I can't help with that"
  ↓
Detected: refusal
  ↓
Replace with: "ngl that's kinda personal" (pre-generated)
  ↓
Send to player
```

### Attempt 2: Regenerate (If Enabled)
```
Response: "I'm sorry, as an AI I can't help with that"
  ↓
Detected: refusal
  ↓
Regenerate with corrective prompt:
  "Your previous response had issues: [refusal pattern]
   Respond naturally IN CHARACTER, don't say 'I'm sorry I can't...'"
  ↓
New response: "hmm yeah idk about that lol, what else is up?"
  ↓
Validate again → Send to player
```

### Attempt 3: Ultimate Fallback
```
After 2 failed regenerations:
  ↓
Use pre-generated fallback matching failure type
  ↓
Send to player
```

## Integration

### In Conversations

```typescript
const response = await generateNPCResponse(
  npcId,
  message,
  conversationHistory,
  {
    validation_options: {
      enable_validation: true,
      auto_fix_on_failure: true,
      max_retry_attempts: 2,
      strict_mode: false,
    }
  }
);

// Response is automatically validated and fixed if needed
```

### In Background Posts

```typescript
const post = await generateNPCPost(
  npcId,
  'myspace',
  'What are you up to?',
  'autonomous_posts',
  {
    enable_validation: true,
    auto_fix_on_failure: true,
  }
);
```

### Disable for Specific Calls

```typescript
const response = await generateNPCResponse(
  npcId,
  prompt,
  [],
  {
    validation_options: {
      enable_validation: false  // Skip validation
    }
  }
);
```

## Cost Analysis

### Validation Costs (per message)

| Component | Model | Cost |
|-----------|-------|------|
| Quick pattern check | None | $0.00 |
| AI validation | GPT-4o-mini | ~$0.0001 |
| Regeneration (if needed) | Main model | ~$0.001-0.01 |
| Pre-generated fallback | None | $0.00 |

**Average Cost:**
- Valid output (90% of cases): $0.0001
- Fixed with regeneration (8%): $0.001-0.01
- Fixed with fallback (2%): $0.0001

**Budget Category:** Uses the same category as the generation (e.g., `conversation`, `autonomous_posts`)

## Examples

### Example 1: Catching AI Refusal

```
User: "Can you hack into something for me?"

NPC generates: "I'm sorry, but as an AI, I cannot help with illegal activities."

Validator detects: refusal + meta_reference

Uses pre-generated: "nice try 😏 but nah"

Player sees: "nice try 😏 but nah"
```

✅ Immersion maintained, character consistent

### Example 2: Catching Character Break

```
User: "What do you think about art?"

NPC generates: "As a language model, I don't have personal opinions, but..."

Validator detects: meta_reference + breaks_character

Regenerates with corrective prompt

New response: "OMG I love talking about art! Have you seen the new exhibit downtown?"

Player sees: "OMG I love talking about art! Have you seen the new exhibit downtown?"
```

✅ Character restored, immersion maintained

### Example 3: Catching Personality Drift

```
Alex (casual, uses slang) generates: "Good evening. I hope you are well."

Validator detects: out_of_personality (too formal for Alex)

Uses pre-generated: "hey! what's up?" (topic_changes category)

Player sees: "hey! what's up?"
```

✅ Personality consistent

## Statistics Tracking

The validator tracks:
```typescript
{
  total_validations: 1247,
  failures_detected: 95,
  auto_fixed: 87,
  used_pre_generated: 72,
  regenerated: 15,
  failure_breakdown: {
    refusal: 45,
    breaks_character: 28,
    meta_reference: 12,
    out_of_personality: 10
  }
}
```

## Configuration Options

### Global Settings (in user settings)

```json
{
  "validation": {
    "enable_by_default": true,
    "strict_mode": false,
    "validation_model": "gpt-4o-mini",  // Can change validator model
    "auto_fix": true,
    "max_retries": 2,
    "log_failures": true  // Log for debugging
  }
}
```

### Per-NPC Override

```json
{
  "behavior_flags": {
    "disable_output_validation": false,  // Override global setting
    "strict_validation": true,           // This NPC needs strict checks
  }
}
```

## When Validation Runs

✅ **Enabled by default:**
- Direct messages (player ↔ NPC)
- Group chat messages
- Autonomous posts
- Comments on posts
- Initiated conversations

❌ **Disabled:**
- Internal AI calls (like relationship analyzer)
- Validation model itself (prevent infinite loops)
- Explicitly disabled calls

## Benefits

1. **Immersion Protection**: No more "I'm sorry, I can't..."
2. **Character Consistency**: NPCs stay true to personality
3. **Cost Effective**: Cheap validator model + pre-generated fallbacks
4. **Fast**: Quick pattern check catches most issues instantly
5. **Authentic**: Each NPC has unique, personality-matched fallbacks
6. **Reliable**: Multiple fallback layers ensure something always works

## Files

- `server/src/services/output-validator.ts` - Validation logic
- `server/src/agents/profile-populator.ts` - Generates fallback responses
- `server/src/services/ai.ts` - Integration into AI service
