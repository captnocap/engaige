# LoveAI Project Documentation

Welcome to the LoveAI project documentation. This documentation covers the architecture, backend services, frontend components, and Tauri integration of the project.

## Project Overview

LoveAI is a relationship simulator and social media game that reimagines the character AI experience. It features autonomous NPCs that live, post, and interact in the background, creating a dynamic social environment.

**Core Vision:**
*   **Social Platforms with Personality**: MySpace/Twitter/Instagram-style interactions.
*   **Unified Relationship System**: Consistent NPC relationships across all platforms.
*   **Autonomous NPCs**: Background simulation of NPC lives and interactions.
*   **Cost-Conscious AI**: Granular budget controls for API usage.
*   **Provider Agnostic**: Support for OpenAI, Anthropic, and local models.

## Documentation Index

### Core Architecture
*   **[Architecture Overview](./ARCHITECTURE.md)**: High-level system design, database schema, and AI integration strategies.
*   **[Backend Documentation](./BACKEND.md)**: Details on the Bun-based API server and core services.
*   **[Frontend Documentation](./FRONTEND.md)**: React + Vite application architecture and window management.
*   **[Tauri Integration](./TAURI.md)**: Desktop environment integration and build process.
*   **[Project Roadmap](./ROADMAP.md)**: Detailed feature roadmap and future vision.

### NPC & Simulation
*   **[NPC Personality System](./NPC_PERSONALITY_SYSTEM.md)**: Breakdown of behavior flags, quirks, and presets.
*   **[Autonomous Context](./AUTONOMOUS_CONTEXT.md)**: Background NPC decision-making and interaction logic.
*   **[Drama Automation](./DRAMA_AUTOMATION.md)**: Systems for generating and managing NPC-to-NPC narrative friction.
*   **[News Feed System](./NEWS_FEED_SYSTEM.md)**: Unified feed for world events, lore, and AI-generated trends.
*   **[Content Templates](./CONTENT_TEMPLATES.md)**: Reference for generating NPC content, profiles, and interactions.

### AI & Systems
*   **[AI Queue System](./AI_QUEUE.md)**: Priority-based request management and budget control.
*   **[Context System](./CONTEXT_SYSTEM.md)**: Memory and context injection architecture for AI prompting.
*   **[Image Generation](./IMAGE_GENERATION.md)**: Specifics on prompts, generation flows, and consistency.
*   **[Proxy System](./PROXY_SYSTEM.md)**: Transparent Vision and Image Gen proxies for different models.
*   **[Runtime Tools](./RUNTIME_TOOLS.md)**: Tools available to the AI at runtime.
*   **[Output Validation](./OUTPUT_VALIDATION.md)**: Ensuring AI content meets quality and tone standards.
*   **[Content Guardrails](./CONTENT_GUARDRAILS.md)**: User-configurable content rating and safety systems.

### Technical Foundations
*   **[Event Bus Specification](./EVENT_BUS_SPEC.md)**: Architecture for the central system event stream.
*   **[Event Reference](./EVENT_REFERENCE.md)**: Comprehensive guide to all system event types and payloads.
*   **[Error Logging](./ERROR_LOGGING.md)**: Standardized error handling and tracking across the project.
*   **[Network Architecture](./NETWORK_ARCHITECTURE.md)**: Two-layer design (WS locally, HTTP/Proxy externally).
*   **[Multiplayer Architecture](./MULTIPLAYER_ARCHITECTURE.md)**: Design for the decentralized mesh network between players.
*   **[Component Architecture](./COMPONENT_ARCHITECTURE.md)**: Philosophy for multi-platform UI components.
*   **[Files System](./FILES_SYSTEM.md)**: Management of media, configuration, and export files.

### Utilities & Reference
*   **[Logs Viewer](./LOGS_VIEWER.md)**: Documentation for the in-game event and error log viewing tools.
*   **[Filler Sites](./FILLER_SITES.md)**: Details on the satirical and informational "NetExplorer" websites.
*   **[Example Configs](./EXAMPLE_CONFIGS.md)**: Reference configurations for models and NPCs.

## Quick Start

### Frontend (Vite + React + Tauri)

```bash
bun install           # Install dependencies
bun run dev           # Start Vite dev server
bun run build         # Build for production
```

### Backend (Mock API Server)

The backend runs separately using Bun.
Data is stored in `server/data/`.
