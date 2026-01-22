# engAIge Project Documentation

Welcome to the engAIge project documentation. This documentation covers the architecture, backend services, frontend components, and Tauri integration of the project.

## 📊 Implementation Status

**Current Status:** ~95% of roadmap complete

See **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** for:
- Comprehensive feature-by-feature implementation audit
- What's working vs what's documented
- Current gaps and TODOs
- Recommendations for next steps

## Project Overview

engAIge is a relationship simulator and social media game that reimagines the character AI experience. It features autonomous NPCs that live, post, and interact in the background, creating a dynamic social environment.

**Core Vision:**
*   **Social Platforms with Personality**: MySpace/Twitter/Instagram-style interactions.
*   **Unified Relationship System**: Consistent NPC relationships across all platforms.
*   **Autonomous NPCs**: Background simulation of NPC lives and interactions.
*   **Cost-Conscious AI**: Granular budget controls for API usage.
*   **Provider Agnostic**: Support for OpenAI, Anthropic, and local models.

---

## Documentation Organization

### 📁 [/completed/](./completed/)
**Fully implemented systems** - Reference documentation for working features:
- Event Bus & Event Reference
- Error Logging System
- AI Queue & Provider Management
- Network Architecture
- NPC Personality & Thoughts Systems
- Proxy Systems (Vision & Image Gen)
- Runtime Tools & Output Validation
- Conversation Context & Autonomous Behavior
- Component Architecture
- Logs Viewer
- Drama Automation

### 📁 /docs/ (this directory)
**Active development** - Specs for incomplete or future features:
- Content Guardrails (partial)
- Files System (import missing)
- Rare Spawn System (future)
- Multiplayer Architecture (future)
- Content Templates (guidance)

---

## Documentation Index

### 🎯 Start Here
*   **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)**: Complete audit of docs vs implementation
*   **[ROADMAP.md](./ROADMAP.md)**: Detailed feature roadmap and future vision
*   **[ROADMAP_CHECKLIST.md](./ROADMAP_CHECKLIST.md)**: Phase-by-phase completion tracking

### 🏗️ Core Architecture
*   **[ARCHITECTURE.md](./ARCHITECTURE.md)**: High-level system design, database schema
*   **[BACKEND.md](./BACKEND.md)**: Bun-based API server and core services
*   **[FRONTEND.md](./FRONTEND.md)**: React + Vite application architecture
*   **[TAURI.md](./TAURI.md)**: Desktop environment integration

### 🤖 NPC Systems (Implemented - See [/completed/](./completed/))
*   **NPC Personality System**: Behavior flags, quirks, presets
*   **NPC Thoughts System**: Reasoning extraction and deliberation
*   **Autonomous Context**: Rich context for autonomous behavior

### 🔧 Technical Foundations (Implemented - See [/completed/](./completed/))
*   **Event Bus Specification**: Central event stream architecture
*   **Event Reference**: All 40+ event types and payloads
*   **Error Logging**: Standardized error handling
*   **Network Architecture**: Two-layer design (WS + HTTP door)
*   **AI Queue System**: Priority-based request management
*   **AI Providers**: Multi-provider configuration

### 🎨 Content & Media (Implemented - See [/completed/](./completed/))
*   **Proxy System**: Vision and image generation proxies
*   **Image Generation**: Flexible provider templates
*   **Output Validation**: AI response validation and auto-fixing
*   **Runtime Tools**: Tools available to NPCs at runtime
*   **Component Architecture**: Reusable UI patterns
*   **Logs Viewer**: In-app debugging tools

### 🌍 World Building
*   **[NEWS_FEED_SYSTEM.md](./NEWS_FEED_SYSTEM.md)**: Unified feed with recursion loop (90% complete)
*   **[FILLER_SITES.md](./FILLER_SITES.md)**: 20+ parody websites (complete)
*   **[CONTENT_TEMPLATES.md](./CONTENT_TEMPLATES.md)**: Templates for content generation

### 🚧 In Progress / Future
*   **[CONTENT_GUARDRAILS.md](./CONTENT_GUARDRAILS.md)**: Content rating system (partial)
*   **[FILES_SYSTEM.md](./FILES_SYSTEM.md)**: Export/import (export done, import TODO)
*   **[RARE_SPAWN_SYSTEM.md](./RARE_SPAWN_SYSTEM.md)**: Special NPC abilities (future)
*   **[MULTIPLAYER_ARCHITECTURE.md](./MULTIPLAYER_ARCHITECTURE.md)**: Discord mesh (future)

### 📖 Reference
*   **[EXAMPLE_CONFIGS.md](./EXAMPLE_CONFIGS.md)**: Complete NPC and player configs

---

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

```bash
cd server
bun install
bun run dev
```

---

## Finding What You Need

### "How do I implement X?"
1. Check **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** to see if it exists
2. If ✅ complete, check **[/completed/](./completed/)** for reference docs
3. If 🟡 partial or ❌ not done, check main /docs/ for specs

### "What's already working?"
See **[/completed/](./completed/)** - everything there is implemented and working

### "What needs to be built?"
See **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Section "Recommendations"

### "What's the roadmap?"
See **[ROADMAP.md](./ROADMAP.md)** and **[ROADMAP_CHECKLIST.md](./ROADMAP_CHECKLIST.md)**
