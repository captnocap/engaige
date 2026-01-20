# Autonomous Content Generation Context

## Current State (Minimal Context)

Right now, when NPCs autonomously generate content, they get:

```typescript
// generateNPCPost() currently sends:
const messages = [
  {
    role: 'system',
    content: `
      You are ${npc.display_name}.
      [personality, bio, interests]
      ## Your Relevant Memories
      - Had a conversation: "User asked about..."
      - Had a conversation: "Talked about coffee..."

      Create a ${platform} post. Keep it authentic to your character.
    `
  },
  {
    role: 'user',
    content: 'Create a post for myspace. Share something interesting.'
  },
];
```

**Problem**: NPCs are generating in a vacuum! They don't know:
- What other NPCs have been posting about
- Recent social interactions
- Current "vibe" of their social circle
- Time of day / what they'd realistically be doing

## Proposed Context Structure by Scenario

### Scenario 1: NPC Posts on MySpace/Instagram

**Context Should Include:**

```typescript
async function buildAutonomousPostContext(npcId: string, platform: string) {
  return {
    // 1. NPC's current state
    npc_profile: {
      name: "Alex",
      current_mood: "inspired", // Could track this
      time_of_day: "evening",
      day_of_week: "Friday"
    },

    // 2. Recent memories (last 3 days)
    recent_memories: [
      { content: "Had coffee with Sam, talked about mural project", importance: 0.8 },
      { content: "Finished a big commission today", importance: 0.9 },
      { content: "User shared their favorite band with me", importance: 0.7 }
    ],

    // 3. Recent own posts (last 5) - don't repeat yourself!
    recent_own_posts: [
      { content: "Working on this new design 🎨✨", timestamp: "2 days ago" },
      { content: "Coffee shop vibes ☕", timestamp: "4 days ago" }
    ],

    // 4. Friend activity (last 24 hours) - social coherency!
    friends_recent_activity: [
      {
        npc: "Sam",
        post: "Just got tickets to see Tame Impala!",
        relationship: "close_friend"
      },
      {
        npc: "Jordan",
        post: "Anyone want to hit the art museum this weekend?",
        relationship: "friend"
      }
    ],

    // 5. Trending topics in their circle
    trending_topics: ["concert tickets", "weekend plans", "new music"],

    // 6. Contextual events
    recent_interactions: [
      { type: "conversation", with: "Player", about: "music taste", when: "3 hours ago" },
      { type: "comment", on: "Sam's post", when: "1 day ago" }
    ]
  };
}
```

**System Prompt:**
```
You are Alex. It's Friday evening.

## Your Recent Life
- Finished a big commission today (feeling accomplished!)
- Had coffee with Sam yesterday, talked about mural project
- User shared their favorite band with you recently

## What Your Friends Are Up To
- Sam just got Tame Impala tickets
- Jordan wants to hit the art museum this weekend

## Your Recent Posts
- 2 days ago: "Working on this new design 🎨✨"
- 4 days ago: "Coffee shop vibes ☕"

## Guidelines
- Create a MySpace post about what's on your mind right now
- You can respond to friends' posts or share something new
- Don't repeat what you just posted about
- Keep it authentic to your personality and current mood
- Consider the time (Friday evening - weekend vibes!)

What would you post?
```

---

### Scenario 2: NPC Comments on Another NPC's Post

**Context Should Include:**

```typescript
async function buildCommentContext(npcId: string, postId: string) {
  const post = getPost(postId);
  const poster = getNPC(post.npc_id);

  return {
    // 1. The post they're commenting on
    post: {
      author: "Sam",
      content: "Just got tickets to see Tame Impala! Who wants to come?",
      posted_at: "30 minutes ago",
      platform: "myspace"
    },

    // 2. Relationship with poster
    relationship: {
      with: "Sam",
      stage: "close_friend",
      trust: 85,
      affinity: 90,
      shared_interests: ["music", "art", "coffee"]
    },

    // 3. Existing comments (social context)
    existing_comments: [
      { author: "Jordan", content: "OMG YES! I'm so down!" },
      { author: "Riley", content: "When is it??" }
    ],

    // 4. NPC's interest in the topic
    topic_interest: {
      music: 0.95,  // Alex LOVES music
      tame_impala: "favorite band" // Could track specific artists
    },

    // 5. Relevant memories about this topic
    relevant_memories: [
      { content: "Sam and I always talk about indie music", importance: 0.7 },
      { content: "User just shared Tame Impala with me yesterday!", importance: 0.9 }
    ]
  };
}
```

**System Prompt:**
```
You are Alex. Your close friend Sam just posted on MySpace.

## Sam's Post
"Just got tickets to see Tame Impala! Who wants to come?"

## Your Relationship with Sam
- Close friend (trust: 85, affinity: 90)
- You both love: music, art, coffee
- Recent memory: Had coffee with Sam yesterday, talked about mural project

## Your Interest in This
- Music interest: 0.95 (you LOVE music!)
- Tame Impala is literally one of your favorite bands
- User just shared Tame Impala with you yesterday - wild coincidence!

## Other Comments Already
- Jordan: "OMG YES! I'm so down!"
- Riley: "When is it??"

## Guidelines
- Comment naturally on Sam's post
- You can be excited (this is your favorite band!)
- You can reference your shared interests
- Keep it conversational, not forced
- React to existing comments if relevant

What would you comment?
```

---

### Scenario 3: NPC Initiates Message to Player

**Context Should Include:**

```typescript
async function buildInitiateConversationContext(npcId: string, playerId: string) {
  const relationship = getRelationship(playerId, npcId);
  const recentConversation = getRecentConversation(playerId, npcId);

  return {
    // 1. Why are they reaching out?
    trigger_reason: "saw_something_reminded_of_player", // or "random_check_in", "shared_interest", etc.

    // 2. Relationship context
    relationship: {
      stage: "friend",
      trust: 65,
      affinity: 70,
      familiarity: 60,
      last_talked: "3 days ago"
    },

    // 3. Conversation history (last 10 messages)
    recent_conversation_summary: "Last talked about coffee shops and music taste. User shared their favorite Tame Impala album.",

    // 4. Shared memories
    shared_memories: [
      { content: "User loves coffee just like I do", importance: 0.7 },
      { content: "User shared Tame Impala with me - great taste!", importance: 0.8 },
      { content: "Talked about going to art museum sometime", importance: 0.6 }
    ],

    // 5. What triggered this message
    trigger_event: {
      type: "saw_concert_tickets",
      description: "Just saw Sam's post about Tame Impala tickets - remembered user loves this band"
    },

    // 6. Time/context appropriateness
    time_context: {
      current_time: "Friday 7pm",
      is_appropriate_time: true,
      player_likely_available: true
    }
  };
}
```

**System Prompt:**
```
You are Alex. It's Friday evening, 7pm.

## Why You're Reaching Out
Your friend Sam just posted about getting Tame Impala tickets. You immediately thought of the user because they JUST shared Tame Impala with you yesterday! What a coincidence.

## Your Relationship with User
- Friend (trust: 65, affinity: 70)
- Last talked: 3 days ago
- You talked about: coffee shops, music taste
- User shared their favorite Tame Impala album with you

## Shared Interests & Memories
- You both love coffee
- User has great music taste (they showed you Tame Impala)
- You mentioned maybe hitting the art museum sometime

## Current Context
- Friday evening, casual time to reach out
- Sam just posted about Tame Impala tickets
- You're excited and want to share this with user

## Guidelines
- Reach out naturally (maybe share Sam's post or ask if they want to go?)
- Reference your recent conversation about music
- Keep it friendly and casual
- Show genuine excitement about the shared interest

What would you message the user?
```

---

### Scenario 4: NPC-to-NPC Interaction (Background Social Coherency)

**This is the magic for world-building:**

```typescript
async function buildNPCToNPCContext(npc1_id: string, npc2_id: string, interaction_type: string) {
  const relationship = getNPCRelationship(npc1_id, npc2_id);

  return {
    // 1. Their relationship
    relationship: {
      type: "close_friends",
      trust: 80,
      affinity: 85,
      how_they_met: "Art class in college",
      friendship_length: "4 years"
    },

    // 2. Recent interactions
    recent_interactions: [
      {
        type: "conversation",
        about: "mural project and weekend plans",
        when: "yesterday",
        sentiment: "positive"
      }
    ],

    // 3. Shared history
    shared_memories: [
      { content: "We always go to concerts together", importance: 0.8 },
      { content: "Sam introduced me to some of my favorite bands", importance: 0.7 }
    ],

    // 4. What's happening in each of their lives
    npc1_recent_life: [
      { event: "Finished big commission", mood: "accomplished" }
    ],
    npc2_recent_life: [
      { event: "Just got concert tickets", mood: "excited" }
    ]
  };
}
```

---

## Implementation Strategy

### 1. Create Context Builder Service

```typescript
// server/src/services/context-builder.ts

export async function buildContextForAutonomousPost(
  npcId: string,
  platform: string
): Promise<{
  systemPrompt: string;
  contextData: any;
}> {
  // Gather all context
  const npc = getNPC(npcId);
  const recentMemories = getRecentMemories(npcId, 3); // Last 3 days
  const recentOwnPosts = getRecentPosts(npcId, 5);
  const friendActivity = getFriendsRecentActivity(npcId, 24); // Last 24 hours
  const timeContext = getCurrentTimeContext();

  // Build rich system prompt
  const systemPrompt = `
You are ${npc.display_name}. It's ${timeContext.day_of_week} ${timeContext.time_period}.

## Your Recent Life
${recentMemories.map(m => `- ${m.content}`).join('\n')}

## What Your Friends Are Up To
${friendActivity.map(a => `- ${a.npc_name}: ${a.activity}`).join('\n')}

## Your Recent Posts (don't repeat these topics)
${recentOwnPosts.map(p => `- ${p.timestamp}: "${p.content.slice(0, 50)}..."`).join('\n')}

## Guidelines
- Create a ${platform} post about what's on your mind right now
- You can respond to friends' activity or share something new from your life
- Consider the time and day (${timeContext.context})
- Keep it authentic to your personality
- Don't repeat what you just posted about

What would you post?
  `.trim();

  return { systemPrompt, contextData: { recentMemories, friendActivity, timeContext } };
}
```

### 2. Update generateNPCPost

```typescript
export async function generateNPCPost(
  npcId: string,
  platform: string,
  prompt?: string,
  options?: {
    use_social_context?: boolean; // Default true
    feature_category?: string;
  }
): Promise<string> {
  const useSocialContext = options?.use_social_context ?? true;

  let systemPrompt: string;

  if (useSocialContext) {
    const { systemPrompt: richPrompt } = await buildContextForAutonomousPost(npcId, platform);
    systemPrompt = richPrompt;
  } else {
    // Fallback to simple prompt
    systemPrompt = buildNPCSystemPrompt(npc);
    systemPrompt += `\n\nCreate a ${platform} post${prompt ? ` about: ${prompt}` : ''}.`;
  }

  // Rest of implementation...
}
```

### 3. Track Social Graph

```sql
-- Track NPC-NPC interactions for social coherency
CREATE TABLE IF NOT EXISTS npc_social_interactions (
  id TEXT PRIMARY KEY,
  npc_id TEXT NOT NULL,
  target_npc_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'comment', 'like', 'message', 'mention'
  content TEXT,
  timestamp INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (npc_id) REFERENCES npcs(id),
  FOREIGN KEY (target_npc_id) REFERENCES npcs(id)
);

CREATE INDEX idx_npc_social_timestamp ON npc_social_interactions(timestamp);
CREATE INDEX idx_npc_social_npc ON npc_social_interactions(npc_id);
```

## Benefits

With this context system:

✅ **Social Coherency**: NPCs reference each other's posts and activities
✅ **Temporal Awareness**: Posts make sense for time of day/week
✅ **No Repetition**: NPCs don't post the same thing twice
✅ **Realistic Triggers**: Messages have clear reasons (not random spam)
✅ **Relationship Depth**: Comments/messages reflect actual friendship levels
✅ **World Building**: The social network feels alive and interconnected

## Example Output Comparison

### Before (Minimal Context):
```
Alex's post: "Just finished a cool design project! 🎨"
Sam's post: "Working on some art today"
Alex's post: "Love creating new designs ✨"
```
❌ Generic, repetitive, no social connection

### After (Rich Context):
```
Sam's post: "Just got Tame Impala tickets! Who's in? 🎶"

Alex's comment: "OMG SAM YES!! I literally just talked to [User] about them yesterday, this is wild 😭 count me IN"

Jordan's comment: "You two are gonna have so much fun! Wish I could go 😢"

Alex's post (later): "Concert plans with Sam = weekend made ✨🎶 Also that coffee chat was exactly what I needed today @Sam"
```
✅ Social, coherent, feels like real people interacting!
