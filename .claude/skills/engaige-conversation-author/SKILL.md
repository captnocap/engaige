---
name: engaige-conversation-author
description: Author conversation histories between NPCs in engAIge. Use when asked to "create conversations", "generate chat history", "seed messages", "write DM history", "create NPC chats", or "fill message logs".
metadata:
  author: engAIge
  version: 2.0.0
  category: content-authoring
---

# engAIge Conversation Author

Generate realistic conversation histories between NPCs. Creates the feeling that NPCs have existing relationships and ongoing lives before the player arrives.

## Import Path

Conversations and messages are inserted into the `conversations` and `messages` tables in `game.db`. There is no file-based auto-import — they must be inserted via SQL or a seed script. Generate JSON matching the exact DB schema below.

## Output Format

**CRITICAL:** Field names MUST match the DB table columns exactly (snake_case).

A conversation consists of two parts: the conversation record and its messages.

### Conversation Record

```json
{
  "conversation": {
    "npc_id": "npc_id_1",
    "participant_id": "npc_id_2",
    "participant_type": "npc",
    "conversation_type": "direct_message",
    "platform": "messages",
    "started_at": 1738108800,
    "last_message_at": 1738540800,
    "context": "friends who met at a concert"
  },
  "messages": [
    {
      "sender_id": "npc_id_1",
      "sender_type": "npc",
      "sender_name": "Alex Chen",
      "content": "dude",
      "timestamp": 1738108800,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "npc_id_2",
      "sender_type": "npc",
      "sender_name": "Jordan Kim",
      "content": "what",
      "timestamp": 1738108860,
      "is_read": 1,
      "content_rating": "normal"
    }
  ]
}
```

### Conversation Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `npc_id` | **Yes** | string | The primary NPC in the conversation. |
| `participant_id` | **Yes** | string | The other participant's ID. |
| `participant_type` | **Yes** | string | `'npc'` for NPC-NPC conversations, `'player'` for player-NPC. |
| `conversation_type` | No | string | `'direct_message'` (default), `'group_chat'`, or `'post_comments'` |
| `platform` | **Yes** | string | `'messages'`, `'myface_chat'`, `'instasnap_dm'` |
| `participant_ids` | No | string | JSON array for group chats: `'["npc1","npc2","npc3"]'` |
| `group_name` | No | string | Group chat display name (only for group_chat type) |
| `started_at` | Yes | integer | Unix timestamp (seconds) of conversation start. |
| `last_message_at` | Yes | integer | Unix timestamp (seconds) of most recent message. |
| `context` | No | string | Relationship context note (for AI reference). |

### Message Field Reference

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `sender_id` | **Yes** | string | NPC ID of the sender. |
| `sender_type` | **Yes** | string | `'npc'` or `'player'` |
| `sender_name` | Yes | string | Display name of sender. |
| `content` | **Yes** | string | Message text. |
| `timestamp` | **Yes** | integer | **Unix timestamp in seconds.** Must be between `started_at` and `last_message_at`. |
| `is_read` | No | integer | `1` for read, `0` for unread. Default 0. Seed conversations should use `1`. |
| `metadata` | No | string | JSON object for attachments: `'{"has_image": true, "image_urls": ["desc"]}'` |
| `content_rating` | No | string | `harsh`, `strict`, `normal`, `relaxed`, `none`. Default `normal`. |

### Fields That Do NOT Exist

Do NOT include these — they are not in the database:
- ~~`participants`~~ — Not a field. Use `npc_id` + `participant_id` + `participant_type`.
- ~~`relationship_context`~~ — Use `context` instead.
- ~~`started_offset_hours`~~ — Not a field. Use `started_at` (unix timestamp).
- ~~`offset_hours`~~ — Not a field. Use `timestamp` (unix timestamp) on each message.
- ~~`has_attachment`~~ — Not a direct field. Put attachment info in `metadata` JSON.
- ~~`id`~~ / ~~`conversation_id`~~ — Auto-generated at import time.

### Group Chat Format

For group chats with 3+ participants:

```json
{
  "conversation": {
    "npc_id": "npc_id_1",
    "participant_id": null,
    "participant_type": "npc",
    "conversation_type": "group_chat",
    "platform": "messages",
    "participant_ids": "[\"npc_id_1\", \"npc_id_2\", \"npc_id_3\"]",
    "group_name": "Work Chat",
    "started_at": 1738108800,
    "last_message_at": 1738540800
  },
  "messages": []
}
```

## Conversation Patterns

### Friends
- Casual, relaxed tone
- Inside jokes and references
- Short messages, lots of back-and-forth
- Random check-ins
- Sharing memes (describe in metadata)
- Making plans

Example flow:
```
A: "dude"
B: "what"
A: "I just saw the WEIRDEST thing at the grocery store"
B: "oh no"
B: "tell me everything"
A: "ok so this guy was buying like 47 cans of beans"
A: "JUST beans"
A: "nothing else"
B: "maybe he really likes beans"
A: "no one likes beans THAT much"
```

### Coworkers
- Mix of work and personal
- Slightly more formal but still friendly
- Work complaints and venting
- Coordinating on tasks
- Water cooler chat

### Acquaintances
- Polite, somewhat formal
- Specific purposes (planning events, sharing info)
- Less frequent messaging
- More complete sentences

### Romantic Interest
- Flirty undertones
- More thoughtful messages
- Questions about each other
- Planning dates
- Good morning/good night messages
- Emojis more common

## Message Formatting by Personality

### Multi-Message Senders
Some NPCs naturally send multiple messages in a row:
```
"So anyway"
"I was thinking"
"What if we tried that new place downtown"
"The one with the rooftop?"
```
(Each is a separate message object with timestamps 10-60 seconds apart)

### Single-Message Senders
Others compose complete thoughts:
```
"Hey! I was thinking we could try that new rooftop place downtown this weekend if you're free. Let me know what works for you."
```

### Emoji Users vs Non-Users
- Heavy: "omg yesss!!! I'm so down"
- Light: "Sounds good to me"
- None: "That works for me. See you then."

## Realistic Timing Patterns

### Active Chat (real-time feel)
Messages 1-5 minutes apart (60-300 seconds), rapid-fire exchange.

### Async Chat (busy people)
- First message: timestamp T
- Reply: T + 7200 (2 hours later)
- Response: T + 14400 (2 more hours)

### Dead Air Patterns
Realistic conversations have gaps:
```
[Monday 2pm]  A: "Want to hang out this week?"     (timestamp: T)
[Monday 8pm]  B: "Sorry just saw this! Yeah def"   (timestamp: T + 21600)
[Tuesday 10am] A: "How about Thursday?"             (timestamp: T + 72000)
```

## Conversation Topics by Relationship Stage

### Strangers to Acquaintances
- How they met, finding common ground, awkward small talk, gradual opening up

### Acquaintances to Friends
- Shared experiences, deeper topics emerging, more vulnerability, making plans independently

### Friends to Close Friends
- Life updates, emotional support, inside jokes accumulated, can pick up after long silences

## Example Conversation (DB-Ready)

```json
{
  "conversation": {
    "npc_id": "alex_chen",
    "participant_id": "jordan_kim",
    "participant_type": "npc",
    "conversation_type": "direct_message",
    "platform": "messages",
    "started_at": 1737504000,
    "last_message_at": 1737507600,
    "context": "close friends who bonded over indie games"
  },
  "messages": [
    {
      "sender_id": "alex_chen",
      "sender_type": "npc",
      "sender_name": "Alex Chen",
      "content": "dude have you seen the trailer for Hollow Knight 3",
      "timestamp": 1737504000,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "jordan_kim",
      "sender_type": "npc",
      "sender_name": "Jordan Kim",
      "content": "YES",
      "timestamp": 1737504120,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "jordan_kim",
      "sender_type": "npc",
      "sender_name": "Jordan Kim",
      "content": "I literally screamed",
      "timestamp": 1737504125,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "jordan_kim",
      "sender_type": "npc",
      "sender_name": "Jordan Kim",
      "content": "my roommate thought something was wrong",
      "timestamp": 1737504140,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "alex_chen",
      "sender_type": "npc",
      "sender_name": "Alex Chen",
      "content": "lmao same energy as when Silksong dropped",
      "timestamp": 1737504200,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "alex_chen",
      "sender_type": "npc",
      "sender_name": "Alex Chen",
      "content": "wanna do a co-op run when it comes out?",
      "timestamp": 1737504260,
      "is_read": 1,
      "content_rating": "normal"
    },
    {
      "sender_id": "jordan_kim",
      "sender_type": "npc",
      "sender_name": "Jordan Kim",
      "content": "obviously. I'll bring snacks",
      "timestamp": 1737507600,
      "is_read": 1,
      "content_rating": "normal"
    }
  ]
}
```

## Generating Conversation Batches

When creating multiple conversations:

1. **Vary the length** - Some are 5 messages, some are 50
2. **Vary the tone** - Not every conversation is deep or meaningful
3. **Include mundane exchanges** - "want to get food?" "sure" "cool"
4. **Leave some unfinished** - Real convos don't always have neat endings
5. **Reference shared history** - "remember when we..." type callbacks

## Delivery

1. Output as JSON — one conversation object per file, or an array of conversations
2. Place in `server/data/seed/conversations/` (create if needed)
3. Import via seed script, which must:
   - Generate `id` for each conversation (use `generateId()`)
   - Generate `id` for each message
   - Set `conversation_id` on each message to its parent conversation's generated ID

## Quality Checklist

Before finalizing conversations:
- [ ] All field names match DB columns (snake_case)
- [ ] Conversation has `npc_id`, `participant_id`, `participant_type`
- [ ] All messages have `sender_id`, `sender_type`, `sender_name`, `content`, `timestamp`
- [ ] `timestamp` values are unix seconds, in chronological order
- [ ] `started_at` matches first message timestamp
- [ ] `last_message_at` matches last message timestamp
- [ ] No fake fields (`participants`, `offset_hours`, `has_attachment`)
- [ ] Messages feel authentic to each character's personality
- [ ] Timing patterns are realistic (not too uniform)
- [ ] Relationship stage matches content tone
- [ ] JSON is valid and complete
