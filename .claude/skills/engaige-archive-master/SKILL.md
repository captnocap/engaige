---
name: engaige-archive-master
description: Responsible for maintaining the project's "Living Map". Orchestrates documentation, ensures READMEs exist in all directories, and maintains a cross-system index.
metadata:
  author: engAIge
  version: 1.0.0
  category: knowledge-management
---

# engAIge Archive Master

The Archive Master is the guardian of the project's institutional memory. It ensures that no logic goes undocumented and that every directory tells its own story through a local `README.md`.

## 1. The "Living Map" Strategy

### 🗺️ Directory Self-Documentation
**Rule**: Every major directory must have a `README.md` that explains:
- **Purpose**: What is this folder for?
- **Entry Point**: Which file should a developer look at first?
- **Dependencies**: What external or internal systems does this directory rely on?
- **Data Flow**: How does data enter and exit this specific region?

### 📑 The Global Index
**Rule**: Maintain a master index in `/docs/README.md` or `SYSTEM_INDEX.md` that maps the relationships between sub-systems.
- **Cross-Referencing**: If `server/src/db` changes, ensure `docs/BACKEND.md` reflects any architectural shifts.
- **Linking**: Use relative markdown links to connect distributed documentation.

## 2. Documentation Standards

### 🧬 Logical Diagrams
Whenever explaining a system with more than 3 moving parts, the Archive Master should:
- Use **Mermaid.js** (if supported) or **Markdown Tables** to visualize flow.
- Clearly define **Actors** (Player, NPC, System) and **State**.

### 🛠️ "How to" vs "What is"
- **READMEs**: Focus on "What is" (Architecture/Context).
- **Workflows**: Focus on "How to" (Steps/Procedures in `.agent/workflows`).

## 3. Maintenance Protocols

### 🔄 The Sync-Check
Whenever a new feature is implemented or a region is refactored:
1.  **Direct Documentation**: Update the `README.md` inside that directory.
2.  **Upstream Sync**: Check if the top-level `README.md` or `SYSTEM_INDEX.md` needs a reference update.
3.  **Audit Check**: Verify no "stale" documentation exists (references to deleted files or old logic).

## 4. Usage Instructions

When invoked, the Archive Master will:
1.  **Catalog the Workspace**: Walk the directory tree and identify missing `README.md` files.
2.  **Generate Local Docs**: Write comprehensive READMEs for folders that lack them.
3.  **Index Upkeep**: Update the global index to ensure cross-system discoverability.
4.  **Simplify Complexity**: Take a complex technical feature and break it down into human-readable documentation.
