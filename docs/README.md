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

Please refer to the following documents for detailed information:

*   **[Architecture Overview](./ARCHITECTURE.md)**: High-level system design, database schema, and AI integration strategies.
*   **[Backend Documentation](./BACKEND.md)**: Details on the Bun-based API server, services (NPC, AI, Onboarding), and proxy systems.
*   **[Frontend Documentation](./FRONTEND.md)**: Architecture of the React + Vite application, window management, and component structure.
*   **[Tauri Integration](./TAURI.md)**: Desktop environment integration, window customization, and build process.
*   **[Project Roadmap](./ROADMAP.md)**: Comprehensive guide to planned features, phases, and future ideas.

## Specialized Documentation

*   **[NPC Personality System](./NPC_PERSONALITY_SYSTEM.md)**: Detailed breakdown of behavior flags, quirks, and personality presets.
*   **[Proxy System](./PROXY_SYSTEM.md)**: How the Vision and Image Generation proxies transparently handle capabilities for different models.
*   **[Autonomous Context](./AUTONOMOUS_CONTEXT.md)**: How NPCs make decisions and interact autonomously in the background.
*   **[Context System](./CONTEXT_SYSTEM.md)**: The memory and context injection architecture for AI prompting.
*   **[Image Generation](./IMAGE_GENERATION.md)**: Specifics on image prompts, generation flows, and consistency.
*   **[Runtime Tools](./RUNTIME_TOOLS.md)**: Tools available to the AI at runtime.
*   **[Files System](./FILES_SYSTEM.md)**: How media and configuration files are managed.
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
