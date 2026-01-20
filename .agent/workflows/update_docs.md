---
description: Update project documentation based on recent changes
---

1. Analyze the recent changes in the codebase.
   ```bash
   # Optional: Check git diff to see what changed if available
   git diff HEAD~1 --stat
   ```
2. Read the current documentation to understand the baseline.
   - `docs/README.md`
   - `docs/ARCHITECTURE.md`
   - `docs/BACKEND.md`
   - `docs/FRONTEND.md`
   - `docs/TAURI.md`
3. Identify which documentation files need updates based on the code changes (e.g., if `server/src` changed, check `BACKEND.md`).
4. Update the documentation files to reflect the new state of the project.
   - Add new features or components.
   - Update modified architecture or logic.
   - Remove deprecated information.
5. Verify that the documentation is consistent and links are working.
