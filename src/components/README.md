# Frontend Components (`/src/components/`)

This directory contains all React components for the engAIge frontend. The frontend is a **"dumb terminal"** - it displays what the server sends and forwards user actions via WebSocket.

**Critical Rule:** NO game logic in components. Components render UI and send WebSocket messages only.

---

## 🎯 Architecture Principle

```
┌─────────────────────────────────────┐
│         Components (View)           │
│  • Display data from server         │
│  • Send WebSocket messages          │
│  • NO game logic                    │
│  • NO direct database access        │
└─────────────────┬───────────────────┘
                  │ WebSocket
┌─────────────────▼───────────────────┐
│         Server (Logic)              │
│  • ALL game logic                   │
│  • Event bus                        │
│  • Database operations              │
└─────────────────────────────────────┘
```

---

## 📂 Component Categories

### Desktop Environment

| Directory | Purpose |
|-----------|---------|
| **desktop/** | Desktop environment, window management, taskbar, icons |
| **boot/** | Boot sequence, loading screen, initialization |

**Entry Point:** `desktop/Desktop.tsx`

**Documentation:** [TAURI.md](../../docs/TAURI.md)

---

### Social Platforms

| Directory | Purpose |
|-----------|---------|
| **platforms/myface/** | MyFace (Facebook/MySpace parody) - profiles, timeline |
| **platforms/messenger/** | Direct messages (1-on-1 and group chats) |
| **platforms/feed/** | Unified social feed (InstaSnap, posts, stories) |

**Entry Point:** `platforms/` (each platform has its own router)

**Pattern:**
```typescript
// Send message to NPC
wsClient.send({
  type: "conversation:send_message",
  payload: { npc_id, content }
});

// Receive response
wsClient.on("conversation:message_received", (data) => {
  // Update UI
  setMessages(prev => [...prev, data.message]);
});
```

---

### In-Game Browser

| Directory | Purpose |
|-----------|---------|
| **browser/** | In-game web browser for filler sites |

**Features:**
- Navigate to 20+ filler sites (WikiKnow, Threadit, DailyBuzz, etc.)
- Address bar, tabs, navigation
- Render content from `server/data/content/`

**Entry Point:** `browser/Browser.tsx`

**Documentation:** [FILLER_SITES.md](../../docs/FILLER_SITES.md)

---

### Creative Apps

| Directory | Purpose |
|-----------|---------|
| **paint/** | Paint app (image editing, drawing) |
| **studio/** | Video studio (video creation, editing) |
| **ide/** | CobHub IDE (code editor for game modding) |

**Entry Points:**
- `paint/Paint.tsx`
- `studio/Studio.tsx`
- `ide/IDE.tsx`

**Documentation:** [COBHUB_IDE.md](../../docs/COBHUB_IDE.md)

---

### Minigames

| Directory | Purpose |
|-----------|---------|
| **chess/** | Chess game (play against NPCs) |
| **solitaire/** | Solitaire card game |
| **pinball/** | Pinball machine |

**Entry Points:**
- `chess/Chess.tsx`
- `solitaire/Solitaire.tsx`
- `pinball/Pinball.tsx`

**Pattern:**
```typescript
// Send game action
wsClient.send({
  type: "chess:make_move",
  payload: { game_id, from, to }
});

// Receive game state update
wsClient.on("chess:state_updated", (data) => {
  setGameState(data.state);
});
```

---

### Dating & Social

| Directory | Purpose |
|-----------|---------|
| **dating/** | Dating app (NPC matchmaking, profiles) |
| **phone/** | Phone interface (calls, texts, apps) |

**Entry Points:**
- `dating/Dating.tsx`
- `phone/Phone.tsx`

**Note:** Phone app is designed for **phone-native UX** - mobile patterns, gestures, etc.

**Documentation:** [phone-app-architect](../../.claude/agents/phone-app-architect.md)

---

### World & Navigation

| Directory | Purpose |
|-----------|---------|
| **world/** | World map, location navigation, exploration |

**Entry Point:** `world/WorldMap.tsx`

**Documentation:**
- [WORLD_MAP_SYSTEM.md](../../docs/completed/WORLD_MAP_SYSTEM.md)
- [WORLD_MAP_QUICK_START.md](../../docs/WORLD_MAP_QUICK_START.md)

---

### Settings & Onboarding

| Directory | Purpose |
|-----------|---------|
| **settings/** | Settings UI (theme, budget, content rating, AI config) |
| **onboarding/** | Player onboarding flow (personality test, initial setup) |

**Entry Points:**
- `settings/Settings.tsx`
- `onboarding/Onboarding.tsx`

**Documentation:**
- [ONBOARDING_FLOW.md](../../docs/ONBOARDING_FLOW.md)
- [PERSONALITY_ASSESSMENT.md](../../docs/PERSONALITY_ASSESSMENT.md)

---

### UI Components

| Directory | Purpose |
|-----------|---------|
| **ui/** | Reusable UI components (buttons, modals, inputs, etc.) |

**Key Components:**
- `Button.tsx` - Consistent button styling
- `Select.tsx` - Custom select dropdowns (**NEVER use native `<select>`**)
- `Message/` - Chat message bubbles
- `Window.tsx` - Desktop window container
- `Modal.tsx` - Overlay dialogs

**Documentation:**
- [COMPONENT_ARCHITECTURE.md](../../docs/completed/COMPONENT_ARCHITECTURE.md)
- [BUTTON_COMPONENT.md](../../docs/completed/BUTTON_COMPONENT.md)

---

## 🎨 Component Patterns

### WebSocket Communication

```typescript
import { useWebSocket } from "../../hooks/useWebSocket";

function MyComponent() {
  const { send, on } = useWebSocket();

  // Send message to server
  const handleAction = () => {
    send({
      type: "my_action",
      payload: { data: "value" }
    });
  };

  // Listen for server updates
  useEffect(() => {
    const unsubscribe = on("my_event", (data) => {
      console.log("Received:", data);
    });

    return unsubscribe;
  }, [on]);

  return <button onClick={handleAction}>Do Action</button>;
}
```

### State Management (Zustand)

```typescript
import { useConversationStore } from "../../stores/conversationStore";

function ConversationList() {
  const conversations = useConversationStore(state => state.conversations);
  const setActive = useConversationStore(state => state.setActive);

  return (
    <div>
      {conversations.map(conv => (
        <div key={conv.id} onClick={() => setActive(conv.id)}>
          {conv.title}
        </div>
      ))}
    </div>
  );
}
```

### Component Structure

```typescript
// MyComponent.tsx
import { useState, useEffect } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";

interface MyComponentProps {
  id: string;
  onClose?: () => void;
}

export function MyComponent({ id, onClose }: MyComponentProps) {
  const [data, setData] = useState<any>(null);
  const { send, on } = useWebSocket();

  // Fetch data on mount
  useEffect(() => {
    send({
      type: "fetch_data",
      payload: { id }
    });

    const unsubscribe = on("data_received", (receivedData) => {
      setData(receivedData);
    });

    return unsubscribe;
  }, [id, send, on]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="my-component">
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  );
}
```

---

## 🚦 Best Practices

### NO Game Logic in Components

**DO:**
```typescript
// Component sends action to server
function SendMessage() {
  const handleSend = (content: string) => {
    wsClient.send({
      type: "conversation:send_message",
      payload: { npc_id, content }
    });
  };

  return <input onSubmit={handleSend} />;
}
```

**DON'T:**
```typescript
// ❌ Don't process game logic in component
function SendMessage() {
  const handleSend = (content: string) => {
    // ❌ Game logic belongs on server
    const message = {
      id: generateId(),
      content,
      timestamp: Date.now(),
      sender: "player"
    };

    // ❌ Don't update database from frontend
    saveMessageToDB(message);
  };
}
```

### Always Use WebSocket Service

**DO:**
```typescript
import { useWebSocket } from "../../hooks/useWebSocket";

function MyComponent() {
  const { send } = useWebSocket();

  const handleAction = () => {
    send({ type: "action", payload: {} });
  };
}
```

**DON'T:**
```typescript
// ❌ Don't create new WebSocket connections
function MyComponent() {
  const ws = new WebSocket("ws://localhost:4269/ws");
  ws.send(JSON.stringify({ type: "action" }));
}
```

### Use UI Components

**DO:**
```typescript
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

function MyForm() {
  return (
    <>
      <Select options={options} onChange={handleChange} />
      <Button onClick={handleSubmit}>Submit</Button>
    </>
  );
}
```

**DON'T:**
```typescript
// ❌ Don't use native HTML elements
function MyForm() {
  return (
    <>
      <select>{/* ❌ Use <Select> component */}</select>
      <button>{/* Better to use <Button> component */}</button>
    </>
  );
}
```

---

## 🎨 Styling

### Tailwind CSS 4

All components use **Tailwind CSS 4** for styling.

```typescript
<div className="flex items-center gap-4 rounded-lg bg-surface p-4 shadow-md">
  <Avatar src={avatar} />
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="text-sm text-muted">{bio}</p>
  </div>
</div>
```

### Theme System

Themes are defined in `src/config/themes.ts` and applied via CSS variables.

**Available Themes:**
- Catppuccin (Mocha, Macchiato, Frappe, Latte)
- Nord
- Gruvbox
- Solarized (Dark, Light)
- Default

**Theme Variables:**
```css
--color-background
--color-surface
--color-text
--color-text-muted
--color-primary
--color-accent
```

---

## 📂 Directory Details

### `/desktop/` - Desktop Environment

**Files:**
- `Desktop.tsx` - Main desktop component
- `Window.tsx` - Window container with snap/drag
- `Taskbar.tsx` - Bottom taskbar
- `DesktopIcon.tsx` - Desktop shortcuts
- `ContextMenu.tsx` - Right-click menus

**Features:**
- Window management (minimize, maximize, close, snap)
- Desktop icons with grid layout
- Taskbar with app switcher
- Context menus

**Recent Fixes:**
- Window snapping uses window position (not mouse)
- Icons reflow on viewport resize
- Snap geometry applied directly (no stale state)

---

### `/platforms/` - Social Platforms

**Subdirectories:**
- `myface/` - MyFace profiles, timeline, top 8
- `messenger/` - Direct messages, group chats
- `feed/` - Unified social feed

**Key Files:**
- `myface/Profile.tsx` - NPC profile view
- `messenger/Conversation.tsx` - Message thread
- `feed/Post.tsx` - Social post card

**Features:**
- Real-time messaging
- Typing indicators
- Read receipts
- Threaded comments
- Likes, shares, saves

---

### `/browser/` - In-Game Browser

**Files:**
- `Browser.tsx` - Browser window
- `AddressBar.tsx` - URL input
- `SiteRenderer.tsx` - Render filler sites
- `sites/` - Site-specific components

**Navigation:**
```typescript
navigate("wikiknow.corn/Quantum_Coffee_Brewing");
```

**Content:**
Fetches content from `server/data/content/{site}/`

---

### `/ui/` - Reusable Components

**Key Components:**

| Component | Purpose |
|-----------|---------|
| **Button** | Consistent button styling |
| **Select** | Custom select dropdowns |
| **Message/** | Chat message bubbles |
| **Window** | Desktop window container |
| **Modal** | Overlay dialogs |
| **Avatar** | User/NPC avatars |
| **Input** | Text inputs |
| **Checkbox** | Checkboxes |
| **Radio** | Radio buttons |

**Barrel Export:**
```typescript
import { Button, Select, Modal } from "../ui";
```

---

## 🔄 Data Flow

### Client → Server

```
1. User action (click, type, etc.)
   ↓
2. Component handler
   ↓
3. WebSocket send
   ↓
4. Server processes
   ↓
5. Server emits event
   ↓
6. Database updated
```

### Server → Client

```
1. Server event (post created, message sent, etc.)
   ↓
2. Server pushes WebSocket message
   ↓
3. Frontend WebSocket listener
   ↓
4. Zustand store updated
   ↓
5. Components re-render
```

---

## 📚 Documentation

- [GAME_SYSTEMS.md](../../docs/GAME_SYSTEMS.md) - Complete game overview
- [FRONTEND.md](../../docs/FRONTEND.md) - Frontend architecture
- [TAURI.md](../../docs/TAURI.md) - Desktop integration
- [COMPONENT_ARCHITECTURE.md](../../docs/completed/COMPONENT_ARCHITECTURE.md) - Component patterns
- [BUTTON_COMPONENT.md](../../docs/completed/BUTTON_COMPONENT.md) - Button usage
- [FILLER_SITES.md](../../docs/FILLER_SITES.md) - Browser content

---

## 🤝 Contributing

When building components:

1. **NO game logic** - Send WebSocket messages only
2. **Use WebSocket service** - Don't create new connections
3. **Use UI components** - Don't reinvent Button, Select, etc.
4. **Follow Tailwind patterns** - Use utility classes
5. **Type your props** - Use TypeScript interfaces
6. **Handle loading states** - Show spinners, skeletons
7. **Handle errors** - Display error messages gracefully
8. **Test responsiveness** - Desktop and phone layouts
