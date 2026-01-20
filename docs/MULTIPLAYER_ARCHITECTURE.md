# Multiplayer Architecture: Discord Mesh Relay

## Overview

engAIge multiplayer uses Discord as an encrypted relay network. No central servers, no IP exposure, no port forwarding. Just Discord bots passing encrypted game state between friends.

```
Player A's Game ←──► Discord Channel ←──► Player B's Game
                          ↑
                    Player C's Game
```

---

## 1. Bot Setup (Streamlined)

### The Problem
Discord developer portal is a maze. We need to get users from zero to working bot in under 2 minutes.

### The Solution: In-App Guided Setup

#### Step 1: One-Click Portal Link
```typescript
// In settings, single button:
"Set Up Multiplayer"
  → Opens: https://discord.com/developers/applications?new_application=engAIge-{username}
```

The app generates a deep link that:
- Goes directly to "new application"
- Pre-suggests a name based on their username

#### Step 2: In-App Instructions Overlay
While they're in the portal, show a floating guide:

```
┌─────────────────────────────────────────────┐
│  Step 1 of 4: Create Application            │
│  ─────────────────────────────────────────  │
│  ✓ Click "New Application"                  │
│  ✓ Name it anything (we suggest your name)  │
│  ✓ Accept the ToS                           │
│  ✓ Click "Create"                           │
│                                             │
│  [Next →]                                   │
└─────────────────────────────────────────────┘
```

#### Step 3: Bot Token Retrieval
```
┌─────────────────────────────────────────────┐
│  Step 2 of 4: Get Your Bot Token            │
│  ─────────────────────────────────────────  │
│  1. Click "Bot" in the left sidebar         │
│  2. Click "Reset Token"                     │
│  3. Copy the token                          │
│  4. Paste it below:                         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ [paste token here]                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⚠️  Never share this token with anyone    │
│                                             │
│  [← Back]  [Next →]                         │
└─────────────────────────────────────────────┘
```

#### Step 4: Enable Intents
```
┌─────────────────────────────────────────────┐
│  Step 3 of 4: Enable Message Intent         │
│  ─────────────────────────────────────────  │
│  Still on the "Bot" page:                   │
│                                             │
│  Scroll down to "Privileged Intents"        │
│  Toggle ON: "Message Content Intent"        │
│                                             │
│  [Screenshot showing exactly where]         │
│                                             │
│  [← Back]  [Next →]                         │
└─────────────────────────────────────────────┘
```

#### Step 5: Generate Invite Link
The app generates this automatically once they paste the token:

```typescript
const REQUIRED_PERMISSIONS =
  PermissionFlagsBits.SendMessages |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.ViewChannel

const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=${REQUIRED_PERMISSIONS}&scope=bot`
```

```
┌─────────────────────────────────────────────┐
│  Step 4 of 4: Add Bot to Server             │
│  ─────────────────────────────────────────  │
│                                             │
│  [Add to Discord Server]  ← Big button      │
│                                             │
│  Select the server you share with friends   │
│  (You need "Manage Server" permission)      │
│                                             │
│  ✅ Done! Your bot is ready.                │
└─────────────────────────────────────────────┘
```

### Token Storage
```typescript
// Stored locally, encrypted with user's machine key
interface MultiplayerConfig {
  bot_token: string          // Encrypted at rest
  bot_id: string             // Extracted from token
  connected_servers: ServerConfig[]
  network_key?: string       // Shared encryption key
}
```

---

## 2. Server & Channel Structure

### Recommended Setup
```
Your Friend Server
└── #engaige-sync (private, bot-only access)
    ├── Thread: posts        (NPC social posts)
    ├── Thread: profiles     (NPC profile updates)
    ├── Thread: events       (World events, trends)
    └── Thread: control      (Join/leave/block notices)
```

### Why Threads?
- Organize by content type
- Separate rate limits
- Easier to mute specific sync types
- Cleaner audit trail

### Auto-Setup
When bot joins a server, offer to auto-create:
```typescript
async function setupSyncChannel(guild: Guild) {
  // Create private channel
  const channel = await guild.channels.create({
    name: 'engaige-sync',
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  })

  // Create threads
  await channel.threads.create({ name: 'posts', autoArchiveDuration: 10080 })
  await channel.threads.create({ name: 'profiles', autoArchiveDuration: 10080 })
  await channel.threads.create({ name: 'events', autoArchiveDuration: 10080 })
  await channel.threads.create({ name: 'control', autoArchiveDuration: 10080 })

  return channel
}
```

---

## 3. Message Schemas

### Base Message Format
```typescript
interface SyncMessage {
  v: 1                        // Schema version
  type: MessageType
  origin: string              // Discord user ID of sender
  ts: number                  // Unix timestamp
  id: string                  // Unique message ID (for dedup)
  chain?: ChainInfo           // If relayed through bridge
  payload: string             // Encrypted JSON blob
}

type MessageType =
  | 'npc_post'
  | 'npc_profile'
  | 'npc_activity'
  | 'world_event'
  | 'player_join'
  | 'player_leave'
  | 'block_user'
  | 'unblock_user'
  | 'delete_content'
  | 'delete_all_my_content'
```

### Chain Info (for bridged content)
```typescript
interface ChainInfo {
  origin_player: string       // Original creator
  origin_server: string       // Server ID where it started
  path: string[]              // User IDs who relayed it
  depth: number               // How many hops
  visibility: 'public_chain'  // Must be public to relay
}
```

### Payload Types (before encryption)

#### NPC Post
```typescript
interface NPCPostPayload {
  npc_id: string              // Globally unique (origin_player + local_id)
  npc_name: string
  npc_avatar?: string         // URL or base64
  platform: 'myspace' | 'instagram' | 'twitter'
  content: string
  media?: string[]            // URLs
  posted_at: number
}
```

#### NPC Profile
```typescript
interface NPCProfilePayload {
  npc_id: string
  display_name: string
  avatar_url?: string
  bio?: string
  traits_summary?: string     // Brief personality description
  platform_profiles?: {
    myspace?: { top8?: string[], song?: string }
    instagram?: { follower_count?: number }
  }
}
```

#### World Event
```typescript
interface WorldEventPayload {
  event_id: string
  event_type: 'trending_topic' | 'news' | 'weather' | 'holiday'
  title: string
  description?: string
  relevant_until?: number     // Expiry timestamp
}
```

---

## 4. Encryption Layer

### Key Exchange
Players share a symmetric key out-of-band. Options:

1. **Passphrase-derived**: Everyone agrees on a phrase
   ```typescript
   const key = await deriveKey("our minecraft server 2019")
   ```

2. **Random key, shared manually**: One person generates, shares in DM
   ```typescript
   const key = generateKey() // "xK9#mL2$pQ7..."
   // Share via Discord DM, copy/paste in game
   ```

3. **QR Code**: Display in game, others scan

### Encryption Implementation
```typescript
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function deriveKey(passphrase: string, salt?: Buffer): Buffer {
  const s = salt || randomBytes(16)
  return scryptSync(passphrase, s, 32)
}

function encrypt(data: any, key: Buffer): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const json = JSON.stringify(data)
  const encrypted = Buffer.concat([
    cipher.update(json, 'utf8'),
    cipher.final()
  ])
  const authTag = cipher.getAuthTag()

  // Pack: iv (16) + authTag (16) + encrypted
  const packed = Buffer.concat([iv, authTag, encrypted])
  return packed.toString('base64')
}

function decrypt(blob: string, key: Buffer): any {
  const packed = Buffer.from(blob, 'base64')

  const iv = packed.subarray(0, 16)
  const authTag = packed.subarray(16, 32)
  const encrypted = packed.subarray(32)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8')

  return JSON.parse(decrypted)
}
```

### What Discord Sees
```
U2FsdGVkX1+7kQ9Jm3KxRt8vNpWqYhBnCdEfGhIjKlMnOpQrStUvWxYz...
```

Completely opaque. No metadata leakage.

---

## 5. Sharing & Visibility Settings

### Per-User Settings
```typescript
interface SharingSettings {
  // === OUTBOUND: What I share ===
  share_npc_posts: ShareLevel
  share_npc_profiles: ShareLevel
  share_world_events: ShareLevel

  // === INBOUND: What I accept ===
  accept_chained_content: boolean
  max_chain_depth: number              // 1 = direct only, 2 = friend-of-friend

  // === BRIDGE: Do I relay? ===
  act_as_bridge: boolean
  bridge_allowlist: string[]           // Only relay for these users (empty = all)
  bridge_blocklist: string[]           // Never relay for these users
}

type ShareLevel =
  | 'private'         // Never share
  | 'server_only'     // Only direct server members
  | 'public_chain'    // Can be relayed through bridges
```

### Per-Server Settings
```typescript
interface ServerSettings {
  server_id: string
  enabled: boolean                     // Participate at all?
  sync_outbound: boolean               // Send my content here?
  sync_inbound: boolean                // Receive content from here?
  encryption_key_id?: string           // Which key for this server
}
```

### UI: Simple Toggles
```
┌─────────────────────────────────────────────────────────┐
│  Multiplayer Sharing                                    │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Share my NPCs' posts          [Server ▼] [Chain ○]    │
│  Share my NPC profiles         [Server ●] [Chain ○]    │
│  Share world events            [Server ○] [Chain ○]    │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Accept friend-of-friend content    [ON]               │
│  Max connection distance            [2 hops ▼]         │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Act as bridge between my servers   [OFF]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Bridge Behavior

### How Bridging Works
```
Server 1: Alice, Bob, [YOU]
Server 2: [YOU], Charlie, Dana

Alice posts (visibility: public_chain)
  ↓
Your bot in Server 1 receives
  ↓
Your game checks: bridge enabled? Alice not blocked?
  ↓
Your bot in Server 2 relays with chain_path: ["alice", "you"]
  ↓
Charlie and Dana see Alice's content
```

### Bridge Decision Flow
```typescript
async function shouldBridge(msg: SyncMessage, fromServer: string, toServer: string): Promise<boolean> {
  const settings = getSettings()

  // Bridge enabled?
  if (!settings.act_as_bridge) return false

  // Already at max depth?
  if (msg.chain && msg.chain.depth >= settings.max_chain_depth) return false

  // Origin user blocked?
  if (settings.bridge_blocklist.includes(msg.origin)) return false

  // Allowlist set but user not on it?
  if (settings.bridge_allowlist.length > 0 &&
      !settings.bridge_allowlist.includes(msg.origin)) return false

  // Content visibility allows chaining?
  const payload = decrypt(msg.payload, getKey(fromServer))
  if (msg.chain?.visibility !== 'public_chain') return false

  // Target server accepts chained content?
  const targetSettings = getServerSettings(toServer)
  if (!targetSettings.sync_inbound) return false

  return true
}
```

### Anti-Loop Protection
```typescript
function hasLoop(chain: ChainInfo, myId: string): boolean {
  return chain.path.includes(myId)
}

// Before bridging:
if (msg.chain && hasLoop(msg.chain, myUserId)) {
  return // Don't re-relay something I already relayed
}
```

---

## 7. Blocking & Deletion

### Block User
```typescript
// Immediate local effect
blockedUsers.add(targetUserId)

// Broadcast to network
broadcast({
  type: 'block_user',
  origin: myUserId,
  payload: encrypt({ target: targetUserId }, key)
})

// Effect:
// - Their content stops entering my game
// - My content stops flowing to them
// - If I was their only bridge, they lose that chain
```

### Unblock User
```typescript
broadcast({
  type: 'unblock_user',
  origin: myUserId,
  payload: encrypt({ target: targetUserId }, key)
})
```

### Delete Specific Content
```typescript
broadcast({
  type: 'delete_content',
  origin: myUserId,
  payload: encrypt({
    content_ids: ['post_123', 'post_456']
  }, key)
})

// All nodes delete those specific items
```

### Nuclear Option: Delete All My Content
```typescript
broadcast({
  type: 'delete_all_my_content',
  origin: myUserId,
  payload: encrypt({
    confirm: true,
    timestamp: Date.now(),
    signature: signWithMyKey(myUserId + Date.now())
  }, key)
})

// All nodes:
// 1. Delete everything from this origin
// 2. Relay the deletion request onward
// 3. Your NPCs vanish from the entire network
```

### Deletion Propagation
```typescript
async function handleDeletion(msg: SyncMessage) {
  const payload = decrypt(msg.payload, key)

  if (msg.type === 'delete_all_my_content') {
    // Verify signature to prevent spoofing
    if (!verifySignature(payload.signature, msg.origin)) return

    // Delete all content from this origin
    await db.run(`DELETE FROM remote_posts WHERE origin_player = ?`, msg.origin)
    await db.run(`DELETE FROM remote_npcs WHERE origin_player = ?`, msg.origin)

    // Relay to other servers (if bridge)
    relayToOtherServers(msg)
  }
}
```

---

## 8. Rate Limiting

### Discord Limits
- 5 messages per 5 seconds per channel
- 50 messages per second globally (bot-wide)
- Thread creation: 10 per 10 minutes

### Our Strategy: Batch & Throttle
```typescript
class SyncQueue {
  private queues: Map<string, SyncMessage[]> = new Map()
  private flushInterval = 2000 // 2 seconds

  add(serverId: string, msg: SyncMessage) {
    if (!this.queues.has(serverId)) {
      this.queues.set(serverId, [])
    }
    this.queues.get(serverId)!.push(msg)
  }

  async flush() {
    for (const [serverId, messages] of this.queues) {
      if (messages.length === 0) continue

      // Batch up to 10 messages into one Discord message
      const batches = chunk(messages, 10)

      for (const batch of batches) {
        const combined = {
          type: 'batch',
          messages: batch
        }
        await sendToServer(serverId, encrypt(combined, getKey(serverId)))

        // Respect rate limit
        await sleep(250)
      }

      this.queues.set(serverId, [])
    }
  }

  start() {
    setInterval(() => this.flush(), this.flushInterval)
  }
}
```

### Priority Queue
```typescript
type Priority = 'high' | 'normal' | 'low'

// High: block/unblock, deletion requests
// Normal: new posts, profile updates
// Low: world events, trends

// High priority bypasses batching, sends immediately
```

---

## 9. Conflict Resolution

### NPC ID Collision Prevention
```typescript
// Global NPC IDs include origin player
const globalNpcId = `${originPlayerId}:${localNpcId}`

// "alice_discord_id:npc_sarah" is globally unique
```

### Same NPC, Different States
If Alice and Bob both have "sarah" NPC (from same origin), only origin's version is canonical:

```typescript
interface RemoteNPC {
  global_id: string           // origin:local_id
  origin_player: string       // Who created this NPC
  last_updated: number        // Timestamp
  data: NPCProfilePayload
}

// On conflict: most recent from origin wins
function mergeNPC(existing: RemoteNPC, incoming: RemoteNPC): RemoteNPC {
  if (incoming.origin_player !== existing.origin_player) {
    // Different origins with same name? Shouldn't happen with global IDs
    throw new Error('ID collision')
  }

  // Same origin: newer wins
  return incoming.last_updated > existing.last_updated ? incoming : existing
}
```

### Comment Threads Across Networks
When NPCs from different players interact:

```typescript
interface CrossNetworkComment {
  post_global_id: string      // origin_player:post_id
  comment_id: string
  commenter_global_id: string // origin_player:npc_id
  content: string
  timestamp: number
  parent_comment_id?: string  // For threading
}

// Comments sync back to post owner through the chain
```

---

## 10. Security Considerations

### Token Security
- Bot tokens stored encrypted at rest
- Never logged or transmitted
- User warned never to share

### Encryption Key Security
- Keys stored encrypted locally
- Per-server keys supported (different friend groups)
- Key rotation: broadcast new key, re-encrypt and re-send recent content

### Spoofing Prevention
- `delete_all_my_content` requires signature verification
- Bot ID extracted from token, verified against messages
- Chain path verified (can't inject yourself into a chain)

### Data Minimization
- Only sync what's needed
- Profiles can be "summary only" (no full personality data)
- Option to not sync NPC images (just descriptions)

---

## 11. Implementation Phases

### Phase 1: Basic Sync
- [ ] Discord bot scaffolding
- [ ] Token setup wizard in-app
- [ ] Single server sync (no bridging)
- [ ] NPC posts only
- [ ] Basic encryption

### Phase 2: Full Content Sync
- [ ] NPC profiles
- [ ] World events
- [ ] Cross-network comments
- [ ] Profile sync

### Phase 3: Bridging
- [ ] Multi-server support
- [ ] Bridge settings UI
- [ ] Chain tracking
- [ ] Anti-loop protection

### Phase 4: Control & Privacy
- [ ] Per-user blocking
- [ ] Content deletion propagation
- [ ] Visibility settings UI
- [ ] Key rotation

### Phase 5: Polish
- [ ] Batch optimization
- [ ] Conflict resolution edge cases
- [ ] Connection status UI
- [ ] Debug/audit log viewer

---

## Summary

**What we built:**
- Decentralized multiplayer using Discord as encrypted relay
- No central server, no IP exposure
- Full user control over sharing, bridging, blocking
- Content can flow through trust chains (friend-of-friend)
- Deletion propagates through the network

**User experience:**
- 2-minute setup wizard
- Simple toggles for sharing preferences
- "It just works" for basic use
- Power users can fine-tune everything

**Architecture:**
- Discord bot per player
- Encrypted messages in private channels
- Batched sync to respect rate limits
- Globally unique IDs prevent conflicts

This is ActivityPub for AI NPCs, running on Discord's free infrastructure.
