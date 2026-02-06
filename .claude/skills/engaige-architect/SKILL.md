---
name: engaige-architect
description: Verifies architecture compliance and system logic flow in engAIge. Use when asked to "check architecture", "verify event flow", "check server logic", or "validate system integration".
metadata:
  author: engAIge
  version: 1.0.0
  category: architecture
---

# engAIge Architect

The Architect ensures all code adheres to the project's core architectural pillars and that system logic flows correctly between services.

## 1. Core Architectural Pillars

### 🚌 Mandatory Event Bus Usage
**Rule**: ALL significant game events MUST go through `server/src/events/event-bus.ts`.
- **Check**: NPC state changes, relationship updates, AI completions, and message transmissions.
- **Verification**: Are `eventBus.fire()` or `eventBus.emit()` called with appropriate `EventTypes`?

### 🖥️ Server-Side Logic Enforcement
**Rule**: Game logic runs on the server ONLY. Frontend is a "dumb terminal".
- **Check**: Look for state manipulation or decision-making logic in `src/`.
- **Violations**: NPCs choosing to post from the frontend, relationship scores being calculated in a component.
- **Fix**: Move logic to `server/src/services/` and communicate via WebSocket/Events.

### 🤖 AI Queue Protocol
**Rule**: ALL AI requests MUST use `server/src/services/ai-queue.ts`.
- **Check**: Search for direct calls to `generateResponse` or `fetch` to AI providers.
- **Verification**: Ensure `Priority` tiers are applied correctly (CRITICAL for user DMs, LOW for background).

### 🚨 Error Logger Consistency
**Rule**: ALL errors must be logged via `server/src/services/error-logger.ts`.
- **Check**: Search for `console.error`.
- **Fix**: Replace with `errorLogger.log(error, context)` or `errorLogger.wrap()`.

## 2. System Flow Calibration

### 📰 News Feed Cycle
Verify the 6-step loop described in `CLAUDE.md`:
1. Lore/RSS entry.
2. NPC headline detection.
3. NPC mention tracking.
4. Trend detection (3+ mentions).
5. AI article generation.
6. Feed re-entry.

### 🤝 Relationship-Context Sync
Verify that interactions across different platforms (Messaging, Social Media) correctly update the **unified** relationship level in `server/src/services/relationships.ts`.

## 3. WebSocket Protocol Integrity
- Ensure all new features added to the frontend use the established message types in `server/src/network/ws-protocol.ts`.
- Check that the `wsStore.ts` in the frontend handles new server-pushed state updates correctly.

## 4. Usage Instructions

When invoked, the Architect will:
1. Audit the codebase for architectural drift.
2. Verify that new features didn't bypass the Event Bus or AI Queue.
3. Check for "Leaky Brain" (logic that should be server-side but leaked to the frontend).
4. Map the data flow of a feature to ensure it follows the "User Action -> WS -> Server -> Event -> DB -> WS -> UI" pattern.
