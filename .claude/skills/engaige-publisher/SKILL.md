---
name: engaige-publisher
description: Handles content publishing to the database, including migration and snapshot backups. Use when asked to "publish content", "migrate data", "run migration", "restore snapshot", or "backup content".
metadata:
  author: engAIge
  version: 1.0.0
  category: deployment
---

# engAIge Publisher

The Publisher handles the transition of hand-crafted JSON content from `server/data/content/` into the live `game.db` database. It ensures every publish is safe by creating a point-in-time snapshot.

## 1. Publishing Workflow

### 🚀 Running a Migration
To publish all new content in the queue:
```bash
bun run server/src/tools/content-migrate.ts
```

### 🎯 Selective Publishing
- **By Site**: Publish only content for a specific site (e.g., `vidtube`).
  ```bash
  bun run server/src/tools/content-migrate.ts --site vidtube
  ```
- **By File**: Publish a specific JSON file.
  ```bash
  bun run server/src/tools/content-migrate.ts --file server/data/content/vidtube/videos/my-video.json
  ```

### 🧪 Safety Check (Dry Run)
Validate your JSON schemas and see what would happen without actually modifying the database:
```bash
bun run server/src/tools/content-migrate.ts --dry-run
```

## 2. Snapshot & Backup System

### 📸 Automatic Backups
The migration tool **automatically** creates a snapshot of the relevant tables (`site_channels`, `site_content`, etc.) before every migration.
- Snapshots are stored in `server/data/backups/content/`.
- Every migration is logged in the `content_migration_snapshots` table in `game.db`.

### 📋 Managing Snapshots
- **List All Snapshots**: View history of publishing events.
  ```bash
  bun run server/src/tools/content-migrate.ts --list-snapshots
  ```
- **Restore After Failure**: Revert the database to a previous state.
  ```bash
  bun run server/src/tools/content-migrate.ts --restore snapshot_2026-02-05_14-30-00
  ```

## 3. Directory Lifecycle

1. **Authors** place JSON files in `server/data/content/{site_id}/`.
2. **Publisher** scans these directories.
3. **Migration** occurs:
   - Channels and Categories are updated/inserted first.
   - Content and Comments are processed.
4. **Success**: Processed files are moved to a `_migrated/` subdirectory to prevent double-publishing.

## 4. Usage Instructions

When invoked, the Publisher will:
1. Verify the location and schema of files to be published.
2. Recommend a dry-run if the changes are extensive.
3. Execute the migration script and confirm the snapshot name.
4. Verify that the files were correctly moved to `_migrated/`.
