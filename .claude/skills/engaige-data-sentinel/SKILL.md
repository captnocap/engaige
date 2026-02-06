---
name: engaige-data-sentinel
description: Audits the codebase to ensure game data flows properly from the database to the client. Identifies hard-coded values that should be dynamic and verifies data-driven implementations.
metadata:
  author: engAIge
  version: 1.0.0
  category: data-architecture
---

# engAIge Data Sentinel

The Data Sentinel is responsible for maintaining the integrity of the data pipeline. It ensures that the game engine is truly data-driven and that no "ghost data" (hard-coded mocks) exists in the production UI.

## 1. Hard-Code Detection

### 🚫 Mock Data Hunt
**Rule**: UI components should not contain large static arrays or objects representing game entities.
- **Check**: Look for `const MOCK_DATA = [...]` or static `JSON` objects inside `src/`.
- **Flag**: Static lists of NPCs, posts, or messages in frontend views.
- **Remedy**: Move mocks to `server/data/lore/` as JSON or seed them into the DB.

### 🧩 Logic Separation
**Rule**: Frontend logic should never calculate game state that is already tracked by the backend.
- **Check**: Redundant score calculations, relationship status changes, or inventory updates in React components.
- **Validation**: Ensure these values are fetched via API and stored in the global state (Zustand).

## 2. API & Pipeline Integrity

### 📡 Endpoint Verification
For any new game feature:
1. **DB**: Is there a table in `server/src/db/index.ts`?
2. **Service**: Is there a backend service in `server/src/services/`?
3. **Route**: Is there an Express route in `server/src/routes/`?
4. **Zustand**: Is there a store in `src/store/` (or equivalent) fetching this data?
5. **UI**: Is the component consuming data from the store?

### 🔄 Schema Alignment
**Rule**: Frontend types and DB schemas must be in sync.
- **Check**: Compare Typescript interfaces in `shared/` or `src/types/` with the `CREATE TABLE` definitions in the backend.

## 3. The "Lore-to-Live" Audit

### 📦 Lore Injection Check
Check if newly added lore (JSON files in `server/data/content`) has successfully made it to the client:
- Run `bun run dump:db` to check if the lore is in the DB.
- Verify the frontend view properly filters and displays the specific `site_id` or `category`.

## 4. Usage Instructions

When invoked, the Data Sentinel will:
1. **Audit a Feature**: Trace a piece of data from the DB to a React component.
2. **Refactor Mocks**: Identify hard-coded UI elements and propose a dynamic backend-backed implementation.
3. **Verify Schemas**: Check for type drift between frontend and backend.
4. **Enforce State-of-Truth**: Ensure only one source of truth exists for any piece of game data.
