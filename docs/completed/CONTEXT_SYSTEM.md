# Conversation Context System

## Overview

The context system manages how conversation history is built and presented to AI models for generating NPC responses. It supports three conversation types:
1. **One-on-One Chats**: Player ↔ Single NPC
2. **Group Chats**: Player + Multiple NPCs
3. **Threaded Comments**: Replies to posts (branching conversations)

## Context Structure

### Base Message Format

Every message in the system has this structure:

```typescript
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;           // Player ID or NPC ID
  sender_type: 'player' | 'npc';
  sender_name: string;         // Display name
  content: string;
  timestamp: number;

  // Optional
  reply_to_message_id?: string;  // For threaded replies
  metadata?: {
    has_image?: boolean;
    image_urls?: string[];
    platform?: string;           // messenger, myspace, instagram, etc.
    is_typing?: boolean;
  };
}
```

### Conversation Types

```typescript
interface Conversation {
  id: string;
  conversation_type: 'direct_message' | 'group_chat' | 'post_comments';
  platform: string;              // messenger, myspace, groupchat, etc.

  // For direct messages
  npc_id?: string;
  participant_id?: string;       // Player ID

  // For group chats
  participant_ids?: string[];    // [player_id, npc_id_1, npc_id_2, ...]
  group_name?: string;

  // For post comments
  parent_post_id?: string;       // Which post this thread is on
  root_comment_id?: string;      // Top-level comment (null if this IS root)

  created_at: number;
  last_message_at: number;
}
```

## 1. One-on-One Conversations (Current)

### Context Building

```typescript
// Simple linear context
const messages = [
  { role: 'system', content: npcSystemPrompt },
  { role: 'user', content: 'Hey, how are you?' },
  { role: 'assistant', content: 'Hey! I\'m doing great, thanks!' },
  { role: 'user', content: 'Want to grab coffee?' },
  // NPC generates next assistant message
];
```

### Implementation

```typescript
async function buildDirectMessageContext(
  conversationId: string,
  npcId: string,
  limit = 20
): Promise<Array<{ role: 'user' | 'assistant'; content: string; name?: string }>> {
  const messages = getConversationMessages(conversationId, limit);

  return messages.map(m => ({
    role: m.sender_type === 'player' ? 'user' : 'assistant',
    content: m.content,
  }));
}
```

## 2. Group Chats

### Context Building

For group chats, we need to clearly identify **who** said **what**:

```typescript
// Group chat context with speaker labels
const messages = [
  { role: 'system', content: groupChatSystemPrompt },
  { role: 'user', content: 'Player: Hey everyone!' },
  { role: 'assistant', content: 'Alex: Hey! Good to see you!' },
  { role: 'user', content: 'Sam: What\'s up, squad?' },
  { role: 'assistant', content: 'Alex: Not much, just vibing' },
  { role: 'user', content: 'Player: Anyone want to hang out?' },
  // Alex generates response...
];
```

### System Prompt for Group Chats

```typescript
function buildGroupChatSystemPrompt(npc: NPC, otherParticipants: Participant[]): string {
  const others = otherParticipants
    .filter(p => p.id !== npc.id)
    .map(p => `- ${p.display_name}: ${p.short_bio || 'a friend'}`)
    .join('\n');

  return `
You are ${npc.display_name} in a group chat.

## Your Identity
${npc.system_prompt}

## Other Participants in this Chat
${others}

## Group Chat Guidelines
- You are in a group conversation with multiple people
- Pay attention to who says what - names are prefixed to messages
- Respond naturally to the flow of conversation
- You can address specific people or respond to the group
- Sometimes multiple people might be talking at once
- Don't always respond - only when you have something to add
- Keep responses concise in group settings
- Use @mentions when addressing someone specific

## Deciding When to Respond
- Respond if someone asks you a question directly
- Respond if the topic matches your interests
- Respond if you have something valuable to add
- Skip your turn if others are deep in conversation
- Skip if the topic doesn't interest you much

IMPORTANT: If you don't want to respond, output exactly: "[SKIP]"
`.trim();
}
```

### Parallel Generation in Group Chats

```typescript
interface GroupChatParticipant {
  npc_id: string;
  typing_started_at?: number;
  will_respond: boolean;
  response_delay: number;  // Calculated from personality
}

async function handleGroupChatMessage(
  groupChatId: string,
  newMessage: Message
): Promise<void> {
  // Get all NPC participants
  const conversation = getConversation(groupChatId);
  const npcIds = conversation.participant_ids.filter(id => isNPC(id));

  // Determine which NPCs will respond (in parallel)
  const responseDecisions = await Promise.all(
    npcIds.map(npcId => decideIfNPCResponds(npcId, groupChatId, newMessage))
  );

  // Filter to only NPCs that want to respond
  const respondingNPCs = responseDecisions.filter(d => d.will_respond);

  if (respondingNPCs.length === 0) {
    return; // No one wants to respond
  }

  // Show typing indicators for all responding NPCs
  for (const npc of respondingNPCs) {
    showTypingIndicator(groupChatId, npc.npc_id);
  }

  // Generate responses in parallel
  const responses = await Promise.all(
    respondingNPCs.map(npc =>
      generateGroupChatResponse(npc.npc_id, groupChatId, npc.response_delay)
    )
  );

  // Send responses with realistic timing
  for (const response of responses) {
    await sleep(response.delay);
    sendMessage(groupChatId, response.npc_id, response.content);
    hideTypingIndicator(groupChatId, response.npc_id);
  }
}

async function decideIfNPCResponds(
  npcId: string,
  conversationId: string,
  triggerMessage: Message
): Promise<{ npc_id: string; will_respond: boolean; response_delay: number }> {
  const npc = getNPC(npcId);
  const personality = JSON.parse(npc.personality_traits || '{}');

  // Build context
  const context = await buildGroupChatContext(conversationId, npcId);

  // Ask NPC if they want to respond
  const decision = await generateNPCResponse(
    npcId,
    `Someone said: "${triggerMessage.content}"\n\nDo you want to respond? Answer with YES or NO only.`,
    context,
    {
      feature_category: 'conversation',
      enable_tools: false,
    }
  );

  const willRespond = decision.toLowerCase().includes('yes');

  // Calculate response delay from personality
  const messagePatterns = personality.message_patterns || {};
  const baseDelay = messagePatterns.average_response_delay_seconds || 2;
  const typingSpeed = messagePatterns.typing_speed || 40; // chars/sec

  // Estimate response length and calculate realistic delay
  const estimatedLength = willRespond ? 50 + Math.random() * 100 : 0;
  const typingTime = estimatedLength / typingSpeed;
  const responseDelay = baseDelay + typingTime + (Math.random() * 2); // Add jitter

  return {
    npc_id: npcId,
    will_respond: willRespond,
    response_delay: responseDelay,
  };
}

async function buildGroupChatContext(
  conversationId: string,
  npcId: string,
  limit = 30
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages = getConversationMessages(conversationId, limit);
  const npc = getNPC(npcId);

  // In group chats, prefix each message with speaker name
  return messages.map(m => {
    const speakerName = m.sender_name;
    const isThisNPC = m.sender_id === npcId;

    return {
      role: isThisNPC ? 'assistant' : 'user',
      content: isThisNPC ? m.content : `${speakerName}: ${m.content}`,
    };
  });
}
```

### Group Chat Features

1. **Parallel Typing**: Multiple NPCs can type simultaneously
2. **Selective Response**: NPCs decide if they want to respond based on interest
3. **Realistic Delays**: Each NPC has different typing speeds
4. **Skip Mechanic**: NPCs can skip their turn with "[SKIP]" output

## 3. Threaded Comments on Posts

### Context Building for Threads

```typescript
interface CommentThread {
  post_id: string;
  root_comment_id: string | null;  // null if top-level comment
  comments: Comment[];
}

interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;  // Which comment this replies to
  author_id: string;
  author_type: 'player' | 'npc';
  author_name: string;
  content: string;
  timestamp: number;
}
```

### Thread Context Example

```
Post: "Just finished my new painting! 🎨"
  ├─ Comment 1: "This looks amazing!" (Player)
  │   └─ Reply 1.1: "Thanks so much!" (NPC - Alex)
  │       └─ Reply 1.1.1: "What inspired it?" (Player)
  │           └─ [Generate NPC response here with full thread context]
  │
  └─ Comment 2: "Love the colors!" (NPC - Sam)
      └─ Reply 2.1: "Me too, especially the blue" (Player)
```

### Building Thread Context

```typescript
async function buildThreadContext(
  commentId: string,  // The comment we're replying to
  npcId: string
): Promise<{
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}> {
  const comment = getComment(commentId);
  const post = getPost(comment.post_id);

  // Get the full thread chain from root to this comment
  const threadChain = getCommentThread(commentId);

  // Build system prompt with post context
  const systemPrompt = `
You are ${npc.display_name}.

## Context
You are commenting on a post by ${post.author_name}:
"${post.content}"

## This Thread
${threadChain.map(c => `${c.author_name}: ${c.content}`).join('\n')}

## Guidelines
- Stay relevant to the post and thread topic
- Keep comments conversational and natural
- You can reference the original post or earlier comments
- Be authentic to your personality
`.trim();

  // Build conversation from thread
  const messages = threadChain.map(c => ({
    role: c.author_id === npcId ? 'assistant' : 'user',
    content: `${c.author_name}: ${c.content}`,
  }));

  return { systemPrompt, messages };
}

function getCommentThread(commentId: string): Comment[] {
  const comments: Comment[] = [];
  let current = getComment(commentId);

  // Walk up to root
  while (current) {
    comments.unshift(current);
    current = current.parent_comment_id
      ? getComment(current.parent_comment_id)
      : null;
  }

  return comments;
}
```

### Thread Reply Generation

```typescript
async function generateThreadReply(
  npcId: string,
  parentCommentId: string
): Promise<string> {
  const { systemPrompt, messages } = await buildThreadContext(parentCommentId, npcId);

  const response = await generateNPCResponse(
    npcId,
    messages[messages.length - 1].content, // Latest comment
    messages.slice(0, -1), // Previous thread context
    {
      platform: 'comments',
      feature_category: 'conversation',
    }
  );

  return response;
}
```

## Database Schema Updates

```sql
-- Update conversations table to support all types
ALTER TABLE conversations ADD COLUMN conversation_type TEXT DEFAULT 'direct_message';
ALTER TABLE conversations ADD COLUMN participant_ids TEXT; -- JSON array for group chats
ALTER TABLE conversations ADD COLUMN group_name TEXT;
ALTER TABLE conversations ADD COLUMN parent_post_id TEXT;
ALTER TABLE conversations ADD COLUMN root_comment_id TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_post ON conversations(parent_post_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  parent_comment_id TEXT,           -- NULL for top-level comments
  root_comment_id TEXT,             -- Always points to thread root
  thread_depth INTEGER DEFAULT 0,   -- How deep in thread (0 = top-level)
  author_id TEXT NOT NULL,
  author_type TEXT NOT NULL,        -- 'player' or 'npc'
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),

  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id),
  FOREIGN KEY (root_comment_id) REFERENCES comments(id)
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(root_comment_id);

-- Group chat participants
CREATE TABLE IF NOT EXISTS group_chat_participants (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  participant_type TEXT NOT NULL,   -- 'player' or 'npc'
  participant_name TEXT NOT NULL,
  joined_at INTEGER DEFAULT (unixepoch()),
  last_read_at INTEGER,

  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  UNIQUE(conversation_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_group_participants ON group_chat_participants(conversation_id);
```

## Summary

### Context Types

| Type | Participants | Context Format | Key Feature |
|------|--------------|----------------|-------------|
| **Direct Message** | 1 Player + 1 NPC | Simple user/assistant alternation | Standard chat |
| **Group Chat** | 1 Player + N NPCs | Prefixed speaker names | Parallel generation |
| **Post Comments** | Anyone | Thread chain with post context | Branching threads |

### Key Principles

1. **Speaker Identification**: Always clear who said what
2. **Contextual Relevance**: Include only relevant history
3. **Parallel Processing**: Multiple NPCs can generate simultaneously
4. **Thread Awareness**: Maintain parent-child relationships
5. **Natural Timing**: Realistic delays based on personality

### Files to Create

- `server/src/services/group-chat.ts` - Group chat management
- `server/src/services/comments.ts` - Threaded comment system
- `server/src/services/context-builder.ts` - Universal context builder
