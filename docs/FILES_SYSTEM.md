# Files System & Export/Import Documentation

## Overview

The Files app is a comprehensive media manager and export/import hub for the entire game ecosystem. It organizes all media, configurations, and data in one accessible location.

## Files App Structure

### Root Folders

**My Files**
- Personal uploads (photos, references for image generation)
- Downloaded content from NPCs
- Saved posts and images

**NPCs Folder**
- Individual folder for each NPC
- Each NPC folder contains:
  - Profile pictures and reference images
  - Generated images from that NPC
  - Images shared in conversations
  - Config files (JSON)
  - Memory logs (TXT)
  - Conversation exports (Markdown)

### File Categories

```typescript
type MediaCategory =
  | 'profile'        // Profile pictures
  | 'reference'      // Reference images for img2img
  | 'post'           // Social media post images
  | 'message'        // Images sent in messages
  | 'upload'         // User uploads
  | 'generated'      // AI-generated images
  | 'npc_config'     // NPC configuration JSON files
  | 'memory_log'     // NPC memory logs
  | 'other';         // Miscellaneous
```

## Database Schema

### media_files Table

```sql
CREATE TABLE media_files (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,

  -- Ownership
  owner_type TEXT CHECK (owner_type IN ('player', 'npc', 'system')),
  owner_id TEXT,

  -- Categorization
  category TEXT DEFAULT 'other',
  tags TEXT, -- JSON array

  -- Associations
  npc_id TEXT,
  conversation_id TEXT,
  post_id TEXT,

  -- Metadata
  width INTEGER,
  height INTEGER,
  generated_prompt TEXT,
  description TEXT,

  -- Timestamps
  created_at INTEGER,
  uploaded_at INTEGER
);
```

## Export Functionality

### 1. Conversation Export (Markdown)

**Purpose**: Export conversations with formatting and embedded images

**File**: `server/src/services/export.ts`

**Function**: `exportConversationToMarkdown(conversationId)`

**Output Format**:
```markdown
# Conversation with Emma

**Platform:** messaging
**Started:** 1/20/2025, 2:30 PM
**Messages:** 42

---

### 👤 **You** _2:30 PM_

Hey! How's it going?

---

### 🤖 **Emma** _2:31 PM_

Hey! I'm doing great! Just finished work. What about you?

---

### 👤 **You** _2:32 PM_

Check out this sunset!

![sunset.jpg](/media/uploads/sunset.jpg)

---

### 🤖 **Emma** _2:33 PM_

Wow, that's absolutely gorgeous! Where is this?

---
```

### 2. NPC Config Export (JSON)

**Purpose**: Export editable NPC configuration

**Function**: `exportNPCConfig(npcId)`

**Output Format**:
```json
{
  "version": "1.0",
  "exported_at": "2026-01-20T...",
  "npc": {
    "username": "emma_rose",
    "display_name": "Emma Rose",
    "bio": "Artist and coffee enthusiast...",
    "age": 26,
    "gender": "female",
    "occupation": "Graphic Designer",
    "interests": ["art", "photography", "coffee"],
    "personality_traits": {
      "personality_style": "warm and creative",
      "communication_style": "casual and friendly",
      "humor_style": "witty"
    },
    "system_prompt": "You are Emma Rose...",
    "social_media_handles": {
      "instagram": "@emma.creates"
    },
    "profile_image_url": "/media/npcs/emma_profile.jpg",
    "image_generation_prompt": "26-year-old female artist...",
    "model_config": {
      "provider": "openai-compatible",
      "model_name": "gpt-4o-mini"
    }
  }
}
```

**Use Cases**:
- Edit NPC personality and traits
- Share NPC configs with others
- Backup specific NPCs
- Version control for NPCs

### 3. Memory Log Export (TXT)

**Purpose**: Human-readable memory history

**Function**: `exportNPCMemoryLog(npcId, limit)`

**Output Format**:
```
Memory Log for Emma Rose (@emma_rose)
Exported: 1/20/2025, 3:45:22 PM
Total Memories: 87
============================================================

[1/20/2025, 2:33:15 PM] Type: conversation | Importance: 0.5
Had a conversation: User shared a beautiful sunset photo...
------------------------------------------------------------

[1/20/2025, 1:15:42 PM] Type: conversation | Importance: 0.7
User mentioned they love coffee - we have something in common!
Event ID: conv_abc123
------------------------------------------------------------

[1/19/2025, 5:22:31 PM] Type: post | Importance: 0.3
Posted about my new art project on Instagram
Event ID: post_xyz789
------------------------------------------------------------
```

### 4. Full NPC Export (JSON)

**Purpose**: Complete portable NPC package

**Function**: `exportNPCWithData(npcId, playerId?)`

**Includes**:
- NPC configuration
- All memories
- All relationships
- Conversation history (optionally filtered by player)
- All messages
- All posts
- All media files metadata
- Statistics

**Output Structure**:
```json
{
  "version": "1.0",
  "export_type": "npc_full",
  "exported_at": "2026-01-20T...",
  "npc": { /* full config */ },
  "relationships": [ /* NPC-to-NPC relationships */ ],
  "player_relationship": { /* relationship with exporting player */ },
  "memories": [ /* all memories */ ],
  "conversations": [ /* all conversation metadata */ ],
  "messages": [ /* all messages */ ],
  "posts": [ /* all posts */ ],
  "media_files": [ /* all media metadata */ ],
  "stats": {
    "total_memories": 156,
    "total_conversations": 8,
    "total_messages": 432,
    "total_posts": 23,
    "total_media_files": 67
  }
}
```

## Import Functionality

### Import NPC from Export

**Function**: `importNPCFromExport(filepath, options)`

**Options**:
```typescript
{
  preserveRelationships?: boolean,  // Import NPC relationships
  preserveMemories?: boolean,       // Import all memories
  preserveConversations?: boolean,  // Import conversation history
  playerId?: string                 // Associate with player
}
```

**Behavior**:
- Checks if username already exists
- Renames if necessary (adds "_imported" suffix)
- Creates new NPC with all data
- Optionally restores memories and conversations
- Preserves relationship levels with player
- Maintains conversation context

**Use Cases**:

1. **Save Your Favorites**: Export NPCs you love
2. **Fresh Start, Familiar Faces**: Import NPCs into new game
3. **Share NPCs**: Trade NPCs with friends
4. **Version Control**: Experiment with different NPC versions
5. **Long-Term Collection**: Build a "roster" of NPCs over time

## Example Workflows

### Workflow 1: Backup Favorite NPC

```typescript
// Export full NPC data
const exportPath = await exportNPCWithData(
  'npc_emma_id',
  'player_id'
);
// Creates: npc_emma_rose_full_export_1234567890.json

// Later, in a new game:
const newNpcId = await importNPCFromExport(
  exportPath,
  {
    preserveMemories: true,
    preserveConversations: true,
    playerId: 'new_player_id',
  }
);
// Emma remembers everything!
```

### Workflow 2: Create NPC Collection

```
Month 1: Create and interact with Emma, Sarah, Jake
         Export all three NPCs

Month 2: Start fresh game, import Emma
         Create new NPCs: Alex, Morgan
         Export all five

Month 3: Import entire collection
         Now have 5 NPCs that all remember you
         Continue building relationships
```

### Workflow 3: Share NPCs

```
1. Create amazing NPC with detailed personality
2. Export NPC config (just config, no personal data)
3. Share JSON file with friend
4. Friend imports, gets same NPC personality
5. Their NPC builds unique relationship with them
```

### Workflow 4: Edit NPC On-The-Fly

```
1. Open Files app
2. Navigate to NPC folder
3. Click "Export Config"
4. Open JSON file in editor
5. Tweak personality traits, bio, etc.
6. Save and reimport
7. NPC has updated personality
```

### Workflow 5: Preserve Conversations

```
1. Have meaningful conversation with NPC
2. Export conversation to Markdown
3. Save in personal collection
4. Share on social media
5. Print and keep physical copy
6. NPCs remember it in their memory log
```

## Files App UI Features

### Navigation
- Breadcrumb path display
- Back button
- Folder-based hierarchy

### View Modes
- **Grid View**: Visual thumbnails
- **List View**: Detailed file information

### File Actions
- **Upload**: Add files from computer
- **Delete**: Remove files
- **Send to NPC**: Attach to message
- **Use as Reference**: Set for img2img
- **Export Config**: Generate JSON
- **Export Memory Log**: Generate TXT
- **Export Conversation**: Generate Markdown

### Preview Panel
- Image preview
- File metadata
- Quick actions
- Description editing

### Search
- Search by filename
- Search by description
- Search by tags
- Filter by category

## Storage & Organization

**Directory Structure**:
```
data/
└── media/
    ├── player/          # Player's files
    ├── npcs/            # NPC profile images
    ├── posts/           # Social media images
    ├── generated/       # AI-generated images
    ├── uploads/         # User uploads
    ├── configs/         # NPC config exports
    └── logs/            # Memory log exports

data/
└── exports/
    ├── conversations/   # Markdown exports
    ├── npcs/            # Full NPC exports
    └── game_state/      # Complete game backups
```

## Security & Privacy

**What Gets Exported**:
- NPC configuration (personality, bio, traits)
- Relationship data (trust levels, notes)
- Memories (but can be filtered)
- Conversation history (but can be filtered)
- Public media files

**What Doesn't Get Exported**:
- API keys (security)
- Player's private data (unless explicit)
- Other players' data (privacy)
- System files

## Future Enhancements

1. **Cloud Sync**: Sync NPC collection across devices
2. **NPC Marketplace**: Share/trade NPCs with community
3. **Version Control**: Track NPC personality changes over time
4. **Automatic Backups**: Scheduled exports of game state
5. **Selective Import**: Choose which memories to import
6. **Merge NPCs**: Combine memories from multiple exports
7. **Export Templates**: Pre-configured export settings

## Benefits

✅ **Never lose your NPCs** - Full export/import system
✅ **Build long-term collection** - NPCs persist across games
✅ **Share creations** - Export and share with others
✅ **Edit on-the-fly** - Tweak NPC configs live
✅ **Preserve memories** - Export conversations for keepsake
✅ **Relationship continuity** - NPCs remember you across saves
✅ **Data portability** - Own your AI relationships
✅ **Privacy control** - Choose what to share
