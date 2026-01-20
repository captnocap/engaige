# Backend Documentation

The backend of LoveAI is a Bun-based API server responsible for the simulation logic, AI orchestration, and data management.

## Directory Structure (`server/src/`)

```
server/src/
├── db/                 # Database initialization and schema management
├── services/           # Core business logic and providers
│   ├── ai.ts           # AI provider abstraction layer
│   ├── npc.ts          # NPC management and generation
│   ├── vision-proxy.ts # Vision capability routing
│   ├── conversation.ts # Chat logic
│   └── ...
├── routes/             # API Endpoints (Express/Hono/Elysia style)
└── utils/              # Helper functions
```

## Key Services

### AI Service (`ai.ts`)
Handles all interactions with LLM providers. It abstracts the differences between OpenAI, Anthropic, and local models (LLaMA via LM Studio), providing a unified interface for the rest of the application.

### NPC Service (`npc.ts`)
Manages the lifecycle of NPCs:
*   **Creation**: Generates NPCs with unique personalities, backstories, and traits.
*   ** Retrieval**: Fetches NPC data for the frontend and simulation.
*   **Updates**: Modifies NPC state based on interactions.

### NPC Personality System (`npc-personality.ts`)
Defines the granular behavior and communication style of NPCs.
*   **Behavior Flags**: Controls capabilities like "can_send_images", "can_initiate_conversations", "is_active_hours_aware".
*   **Communication Quirks**: Defines style metrics like "verbosity", "sarcasm", "emoji_usage", and "typo_frequency".
*   **Message Patterns**: Controls "typing_speed", "average_response_delay", and "multi_message_sender" behavior.
*   **Presets**: Includes archetypes like "social_butterfly", "introvert", "chaotic_fun", "professional", and "flirty".

*See [NPC Personality System](./NPC_PERSONALITY_SYSTEM.md) for complete documentation.*

### NPC Interaction Service (`npc-interaction.ts`)
A high-level orchestration layer for communicating with NPCs.
*   **Unified Interface**: `sendMessageToNPC` handles both text and image messages.
*   **Automatic Proxying**: Checks model capabilities and automatically routes to Vision/ImageGen proxies if the underlying model lacks support.
*   **Image Requests**: `requestNPCImage` allows NPCs to "create" images by refining prompts and calling the image generation proxy.

### Message Formatter (`message-formatter.ts`)
Post-processing layer that applies personality quirks to AI-generated text.
*   **Quirk Application**: Adds emojis, typos, abbreviations, and internet slang based on the NPC's `CommunicationQuirks`.
*   **Message Splitting**: Breaks long thoughts into multiple rapid-fire messages if the NPC is a `multi_message_sender`.
*   **Delays**: Calculates realistic typing delays and response times based on `typing_speed` and message length.

### Proxy Services
To resolve the fragmentation of AI model capabilities, the backend implements proxy services:

*   **`model-capabilities.ts`**: detecting what a model can do (vision, image gen, context size).
*   **`vision-proxy.ts`**: Transparently handles image analysis for text-only models.
*   **`image-generation-proxy.ts`**: Handles image creation requests, routing them to dedicated image models like DALL-E.

### Budget Service (`budget.ts`)
(Planned/In-Progress)
Tracks API usage costs across different categories (conversation, image gen, onboarding) to ensure the user stays within their defined spending limits.

## Database Interaction

The backend uses `bun:sqlite` for high-performance synchronous database access.
*   **Initialization**: `db/index.ts` sets up the tables for `user.db`, `npc.db`, and `game.db` if they don't exist.
*   **Queries**: Most services interact directly with the database using prepared statements for security and speed.

## Running the Backend

The backend is typically run alongside the frontend during development.
```bash
# From project root
cd server
bun install
bun run dev
```
