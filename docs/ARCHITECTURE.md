# Architecture Overview

This document outlines the high-level architecture of the LoveAI project.

## System Components

The application consists of three main parts:

1.  **Frontend**: A React-based Single Page Application (SPA) built with Vite and Tailwind CSS. It manages the UI, including the desktop environment simulation, window management, and user interactions.
2.  **Backend**: A Bun-based API server that handles business logic, AI interactions, database management, and autonomous NPC simulation.
3.  **Tauri Shell**: A lightweight wrapper that provides system-level integration, file system access, and window customization for the distributed desktop application.

## Database Architecture

The system uses three distinct SQLite databases (powered by `bun:sqlite`) to manage data persistence and state:

### 1. `user.db`
*   **Purpose**: Persistent storage for user-specific data.
*   **Contents**: Player profiles, settings, global preferences, and API keys.

### 2. `npc.db`
*   **Purpose**: Persistent storage for NPC definitions.
*   **Contents**: NPC personalities, system prompts, base bios, and static attributes.
*   **Key Feature**: Allows for exporting and sharing NPCs.

### 3. `game.db`
*   **Purpose**: Dynamic, resettable game state.
*   **Contents**: Active conversations, messages, generated posts, NPC memories, and relationships.
*   **Benefit**: Can be reset to start a new "playthrough" without losing custom NPCs or user settings.

## AI integration Architecture

The AI system is designed to be provider-agnostic and cost-aware.

### Multi-Provider Support
*   **Primary**: OpenAI-compatible endpoints (e.g., local models via LM Studio).
*   **Secondary**: Official OpenAI and Anthropic APIs.
*   **Configuration**: Per-NPC model overrides allow mixing high-intelligence models for main interactions with cheaper models for background tasks.

### Prompting Strategy
*   **Dynamic Construction**: System prompts are built at runtime combining NPC identity, current platform context, and retrieved memories.
*   **Memory Retrieval**: Context-aware memory injection based on keywords in the conversation.
*   **Platform Specifics**: Prompts adapt to the context (e.g., "DM style" vs "Social Post style").

### Proxy Systems
To ensure immersion and capability regardless of the underlying model, the system uses "Transparent Proxies":

*   **Vision Proxy**: If an NPC's model cannot "see" images, the image is first routed to a vision-capable model (like GPT-4o-mini) to generate a text description, which is then passed to the NPC.
*   **Image Generation Proxy**: When an NPC needs to "draw" something, they generate a prompt which is sent to an image generation model (like DALL-E 3).

*See [PROXY_SYSTEM.md](../PROXY_SYSTEM.md) for detailed diagrams and flows.*
