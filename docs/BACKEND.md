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
