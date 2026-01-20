# NPC Personality & Relationship System

## Overview

A comprehensive system that makes each NPC feel unique and alive through behavioral flags, communication quirks, message patterns, and dynamic relationship tracking.

## Core Components

### 1. Behavior Flags

Control what NPCs can do autonomously:

```typescript
interface BehaviorFlags {
  is_enabled_to_post_freely: boolean;      // Can post on social media
  can_initiate_conversations: boolean;     // Can DM player first
  can_send_images: boolean;                // Can share photos
  can_request_images: boolean;             // Can ask for photos
  is_active_hours_aware: boolean;          // Respects sleep/work hours
  can_like_posts: boolean;                 // Can like posts
  can_comment_on_posts: boolean;           // Can comment on posts
  will_share_posts: boolean;               // Will reshare content
}
```

**Examples:**
- **Social Butterfly**: All flags true, very active
- **Introvert**: Only passive actions (likes), no initiating
- **Professional**: Active hours 9-5, no random posting

### 2. Topic Interests

What NPCs care about (0-1 intensity per topic):

```typescript
interface TopicInterests {
  // Social
  dating: 0.8,           // Loves talking about relationships
  gossip: 0.6,           // Enjoys drama
  social_life: 0.7,      // Party person

  // Intellectual
  science: 0.9,          // Super into science
  philosophy: 0.4,       // Casual interest
  religion: 0.2,         // Not really into it

  // Creative
  art: 0.8,
  music: 0.9,
  photography: 0.7,

  // Other
  gaming: 0.5,
  fitness: 0.6,
  memes: 0.9,
  // ... 20+ topics total
}
```

**Usage:**
- Affects what NPCs post about
- Determines conversation engagement
- Influences response depth
- Drives autonomous behavior choices

### 3. Communication Quirks

How NPCs express themselves:

```typescript
interface CommunicationQuirks {
  verbosity: 0.7,              // 0=short, 1=long messages
  sarcasm: 0.4,                // Sarcasm level
  outlook: 0.6,                // -1=pessimistic, 1=optimistic
  formality: 0.2,              // 0=casual, 1=formal
  emoji_usage: 0.8,            // How often they use emojis
  typo_frequency: 0.2,         // Realistic imperfection

  // Punctuation style
  uses_periods: true,
  uses_ellipsis: true,
  uses_exclamation: true,
  uses_all_caps: false,        // For EMPHASIS

  // Language style
  uses_abbreviations: true,    // "u", "r", "ur"
  uses_internet_slang: true,   // "fr", "ngl", "tbh"
}
```

**Examples:**

**High Verbosity + Formal:**
```
"I wanted to express my sincere gratitude for your message.
It truly brightened my day, and I've been thinking about
what you said regarding the sunset. The way you described
the colors was absolutely beautiful."
```

**Low Verbosity + Casual + Slang:**
```
"omg fr tho"
"that was so cool"
"ngl i loved it 😂"
```

### 4. Message Patterns

How NPCs send messages:

```typescript
interface MessagePatterns {
  multi_message_sender: true,          // Sends multiple rapid messages
  messages_per_thought: 4,             // 1-5 messages per response
  typing_speed: 45,                    // Characters per second
  average_response_delay_seconds: 30,  // Base delay before responding
  response_delay_variance: 0.3,        // Randomness (30%)

  reads_immediately: true,             // Or waits to read
  average_read_delay_seconds: 120,     // If not immediate reader

  uses_voice_messages: false,
  voice_message_frequency: 0.1,

  active_hours: {                      // If is_active_hours_aware
    start: 9,
    end: 22,
  },
  timezone: "America/New_York",
}
```

**Message Breaking Example:**

AI generates:
```
"Hey! I'm so glad you asked. I've been thinking about this a lot lately.
We should totally do something this weekend. What do you think?"
```

Multi-message sender (4 messages):
```
[Delay: 30s] "Hey! I'm so glad you asked."
[Delay: 2s]  "I've been thinking about this a lot lately."
[Delay: 3s]  "We should totally do something this weekend."
[Delay: 2s]  "What do you think?"
```

Single-message sender:
```
[Delay: 45s] "Hey! I'm so glad you asked. I've been thinking about
this a lot lately. We should totally do something this weekend.
What do you think?"
```

### 5. Relationship Stats

**Core Stats (0-100):**
- **Trust**: How much they trust you (affects vulnerability, sharing secrets)
- **Affinity**: How much they like you (affects enthusiasm, initiative)
- **Familiarity**: How well they know you (affects references to past, inside jokes)

**Interaction Tracking:**
- Total messages sent/received
- Images shared
- Posts liked/commented
- Last interaction timestamps

**Relationship Stages:**
1. **Stranger** (0 trust, 0 affinity, 0 familiarity)
2. **Acquaintance** (10+ trust, 10+ affinity, 5+ messages)
3. **Friend** (30+ trust, 30+ affinity, 20+ messages)
4. **Close Friend** (50+ trust, 50+ affinity, 50+ messages)
5. **Best Friend** (70+ trust, 60+ affinity, 100+ messages)
6. **Romantic Interest** (40+ trust, 70+ affinity, 30+ messages)
7. **Partner** (80+ trust, 90+ affinity, 150+ messages)

**Progression System:**
- Stats increase with positive interactions
- Can decrease with negative interactions (ignored messages, long gaps)
- Stage unlocks new conversation topics, content, and behaviors
- Visual progress bars in UI

### 6. Personality Presets

Pre-configured archetypes for quick NPC generation:

**social_butterfly:**
- Posts freely, initiates conversations, sends images
- High emoji usage, casual, enthusiastic
- Multi-message sender, fast responses

**introvert:**
- Rarely posts, doesn't initiate, passive interaction
- Low emoji, formal, thoughtful
- Single messages, slow responses

**chaotic_fun:**
- Very active, sends tons of messages rapidly
- High emojis, typos, slang, all caps
- 5 messages per thought, immediate responses

**professional:**
- No autonomous posting, measured responses
- Formal, no emojis, proper punctuation
- Active hours 9-5, slow deliberate responses

**flirty:**
- Active, initiates, requests images
- Medium-high emojis, playful, uses ellipsis
- 2-3 messages per thought, moderate delays

## Implementation Examples

### Example 1: Message Flow with Personality

**User sends**: "Hey! How was your day?"

**NPC (Social Butterfly)**:
```
[Shows typing... for 8 seconds]
[30 seconds] "omg hiiii!!! 😊"
[2 seconds]  "my day was SO good"
[3 seconds]  "went to this amazing cafe"
[2 seconds]  "u have to come with me next time!! ✨"
```

**NPC (Introvert)**:
```
[Shows typing... for 25 seconds]
[180 seconds] "It was fine. Worked on some projects. How was yours?"
```

**NPC (Chaotic Fun)**:
```
[15 seconds] "DUDE"
[1 second]  "OMG"
[2 seconds]  "so much happened"
[1 second]  "i cant even"
[2 seconds]  "where do i START lmaooo 💀"
```

### Example 2: Stat Progression

**Day 1: First Message**
```
Trust: 0 → 2
Affinity: 0 → 1
Familiarity: 0 → 1
Stage: Stranger
```

**Day 5: Regular chatting (20 messages)**
```
Trust: 15
Affinity: 18
Familiarity: 12
Stage: Acquaintance
```

**Week 3: Shared personal photo**
```
Trust: 28 → 31 (+3 for image)
Affinity: 25 → 27
Familiarity: 25 → 27
Stage: Friend (just unlocked!)
```

**Month 2: Deep conversations**
```
Trust: 72
Affinity: 68
Familiarity: 75
Stage: Best Friend
```

### Example 3: Active Hours

**NPC with active_hours: 9-22**

User messages at 3 AM:
```
[Read receipt: Not delivered]
[NPC reads at 9:15 AM]
[Response at 9:45 AM]: "Morning! Sorry, was asleep 😴"
```

User messages at 2 PM:
```
[Read receipt: Read immediately]
[Response in 30s]: "Hey! What's up?"
```

## Auto-Generated Personalities

When generating NPCs, the system creates:

1. **Random Topic Interests**: 5-8 topics with 0.3-0.9 intensity
2. **Personality Preset** or **Random Mix**: Social butterfly, introvert, etc.
3. **Communication Style**: Random quirks within bounds
4. **Message Patterns**: Response delays, multi-message behavior

**Example Generated NPC:**
```json
{
  "display_name": "Sarah Chen",
  "topic_interests": {
    "photography": 0.9,
    "art": 0.8,
    "coffee": 0.7,
    "dating": 0.5,
    "technology": 0.6
  },
  "behavior_flags": {
    "is_enabled_to_post_freely": true,
    "can_initiate_conversations": true,
    "can_send_images": true
  },
  "communication_quirks": {
    "verbosity": 0.6,
    "emoji_usage": 0.5,
    "formality": 0.3,
    "sarcasm": 0.2
  },
  "message_patterns": {
    "multi_message_sender": true,
    "messages_per_thought": 2,
    "average_response_delay_seconds": 45
  }
}
```

Sarah will:
- Post photography content autonomously
- Send 2-3 messages per response
- Use moderate emojis, casual tone
- Respond within 45-90 seconds (with variance)
- Initiate conversations about photography

## Integration with Other Systems

### With Budget System
- Each personality type has different API costs
- Verbose NPCs cost more (longer responses)
- Multi-message senders = multiple API calls
- Active hour awareness reduces unnecessary calls

### With Memory System
- Familiarity unlocks references to past conversations
- High trust = NPCs share personal memories
- Relationship stage affects memory importance weighting

### With Social Media
- Topic interests drive autonomous post content
- Behavior flags control posting frequency
- Communication quirks affect post style

### With Random Events
- can_initiate_conversations enables random DMs
- Affinity level affects initiative frequency
- Active hours control when events can trigger

## Benefits

✅ **Unique NPCs** - Each feels genuinely different
✅ **Realistic behavior** - Typing delays, multi-messages, quirks
✅ **Meaningful progression** - Relationships evolve naturally
✅ **Immersive** - NPCs act like real people
✅ **Varied experiences** - Different NPCs = different vibes
✅ **Emergent gameplay** - Stats unlock new interactions
✅ **Budget friendly** - Can disable expensive behaviors
✅ **Highly configurable** - Every aspect is tunable

## Future Enhancements

1. **Sentiment Analysis**: Detect message tone, adjust affinity accordingly
2. **Conflict System**: Negative interactions decrease stats
3. **Mood States**: NPCs have moods that affect responses
4. **Personality Drift**: NPCs evolve based on interactions
5. **Group Dynamics**: Stats for NPC-to-NPC relationships
6. **Jealousy System**: NPCs react to player interacting with others
7. **Memory-Driven Quirks**: Learn user's preferences, adapt style
8. **Voice Message Simulation**: Generate audio (future feature)
