#!/usr/bin/env bun
/**
 * Content Migration Tool
 *
 * Migrates JSON content files to the database with snapshot backups.
 *
 * Usage:
 *   bun run server/src/tools/content-migrate.ts [options]
 *
 * Options:
 *   --site <site_id>     Migrate only a specific site (e.g., vidtube)
 *   --file <path>        Migrate a specific file
 *   --dry-run            Validate without inserting
 *   --list-snapshots     List all migration snapshots
 *   --restore <id>       Restore from a snapshot
 *   --help               Show this help
 */

import { Database } from "bun:sqlite";
import { join, dirname, basename, relative } from "path";
import {
  readdirSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  copyFileSync,
  rmSync,
} from "fs";
import { getDB, generateId, now } from "../db/index.js";

// ============================================================================
// Types
// ============================================================================

interface ChannelJson {
  $schema: "channel";
  site_id: string;
  channels: Array<{
    slug: string;
    name: string;
    avatar_emoji?: string;
    avatar_url?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }>;
}

interface CommentJson {
  slug?: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  like_count?: number;
  dislike_count?: number;
  is_creator?: boolean;
  published_at?: string;
  replies?: CommentJson[];
}

interface ContentJson {
  $schema: "content";
  site_id: string;
  content_type: string;
  slug: string;
  channel_slug?: string;
  parent_slug?: string;
  category?: string;
  title: string;
  subtitle?: string;
  body?: string;
  summary?: string;
  thumbnail_emoji?: string;
  thumbnail_url?: string;
  media_urls?: string[];
  metadata?: Record<string, unknown>;
  tags?: string[];
  entities?: string[];
  keywords?: string;
  is_featured?: boolean;
  is_pinned?: boolean;
  published_at?: string;
  comments?: CommentJson[];
}

interface CategoryJson {
  $schema: "category";
  site_id: string;
  categories: Array<{
    slug: string;
    name: string;
    description?: string;
    icon_emoji?: string;
    parent_slug?: string;
    sort_order?: number;
  }>;
}

interface MigrationStats {
  channelsInserted: number;
  channelsUpdated: number;
  contentInserted: number;
  contentUpdated: number;
  commentsInserted: number;
  categoriesInserted: number;
  categoriesUpdated: number;
  filesProcessed: string[];
  errors: string[];
}

// ============================================================================
// Paths
// ============================================================================

const DATA_DIR = join(dirname(import.meta.url.replace("file://", "")), "../../data");
const CONTENT_DIR = join(DATA_DIR, "content");
const BACKUP_DIR = join(DATA_DIR, "backups/content");

// ============================================================================
// Helpers
// ============================================================================

function formatDate(date: Date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-").slice(0, 19).replace("T", "_");
}

function parseTimestamp(value?: string): number | null {
  if (!value) return null;
  // Handle relative times like "2 weeks ago" - just use current time
  if (value.includes("ago") || value.includes("watching")) {
    return now();
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : Math.floor(date.getTime() / 1000);
}

function findJsonFiles(dir: string, exclude = "_migrated"): string[] {
  if (!existsSync(dir)) return [];

  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === exclude || entry.name.startsWith(".")) continue;

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath, exclude));
    } else if (entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function moveToMigrated(filePath: string): void {
  const dir = dirname(filePath);
  const migratedDir = join(dir, "_migrated");
  ensureDir(migratedDir);
  const destPath = join(migratedDir, basename(filePath));
  renameSync(filePath, destPath);
}

// ============================================================================
// Snapshot Management
// ============================================================================

function createSnapshot(db: Database, name: string): string {
  const snapshotDir = join(BACKUP_DIR, name);
  ensureDir(snapshotDir);

  // Export each table to JSON
  const tables = ["site_channels", "site_content", "site_content_comments", "site_categories"];

  const manifest: Record<string, number> = {};

  for (const table of tables) {
    try {
      const rows = db.query(`SELECT * FROM ${table}`).all();
      writeFileSync(join(snapshotDir, `${table}.json`), JSON.stringify(rows, null, 2));
      manifest[table] = rows.length;
    } catch {
      // Table might not exist yet
      manifest[table] = 0;
    }
  }

  writeFileSync(
    join(snapshotDir, "manifest.json"),
    JSON.stringify(
      {
        created_at: new Date().toISOString(),
        tables: manifest,
      },
      null,
      2
    )
  );

  return snapshotDir;
}

function restoreSnapshot(db: Database, snapshotDir: string): void {
  const manifestPath = join(snapshotDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Snapshot manifest not found: ${manifestPath}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const tables = Object.keys(manifest.tables);

  // Clear existing data and restore
  for (const table of tables) {
    const dataPath = join(snapshotDir, `${table}.json`);
    if (!existsSync(dataPath)) continue;

    const rows = JSON.parse(readFileSync(dataPath, "utf-8"));
    if (rows.length === 0) continue;

    // Delete existing
    db.exec(`DELETE FROM ${table}`);

    // Insert rows
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => "?").join(", ");
    const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`);

    for (const row of rows) {
      stmt.run(...columns.map((col) => row[col]));
    }
  }

  console.log(`Restored from snapshot: ${snapshotDir}`);
}

function listSnapshots(): void {
  if (!existsSync(BACKUP_DIR)) {
    console.log("No snapshots found.");
    return;
  }

  const snapshots = readdirSync(BACKUP_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("snapshot_"))
    .map((d) => {
      const manifestPath = join(BACKUP_DIR, d.name, "manifest.json");
      let manifest = { created_at: "unknown", tables: {} };
      if (existsSync(manifestPath)) {
        manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      }
      return { name: d.name, ...manifest };
    })
    .sort((a, b) => b.name.localeCompare(a.name));

  if (snapshots.length === 0) {
    console.log("No snapshots found.");
    return;
  }

  console.log("\nMigration Snapshots:\n");
  for (const snap of snapshots) {
    console.log(`  ${snap.name}`);
    console.log(`    Created: ${snap.created_at}`);
    console.log(`    Tables: ${JSON.stringify(snap.tables)}`);
    console.log();
  }
}

// ============================================================================
// Migration Logic
// ============================================================================

function migrateChannels(db: Database, data: ChannelJson, stats: MigrationStats): void {
  const stmt = db.prepare(`
    INSERT INTO site_channels (id, site_id, slug, name, avatar_emoji, avatar_url, description, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (site_id, slug) DO UPDATE SET
      name = excluded.name,
      avatar_emoji = excluded.avatar_emoji,
      avatar_url = excluded.avatar_url,
      description = excluded.description,
      metadata = excluded.metadata,
      updated_at = excluded.updated_at
  `);

  for (const channel of data.channels) {
    const id = generateId();
    const timestamp = now();

    // Check if exists
    const existing = db
      .query("SELECT id FROM site_channels WHERE site_id = ? AND slug = ?")
      .get(data.site_id, channel.slug);

    stmt.run(
      existing ? (existing as { id: string }).id : id,
      data.site_id,
      channel.slug,
      channel.name,
      channel.avatar_emoji || null,
      channel.avatar_url || null,
      channel.description || null,
      JSON.stringify(channel.metadata || {}),
      timestamp,
      timestamp
    );

    if (existing) {
      stats.channelsUpdated++;
    } else {
      stats.channelsInserted++;
    }
  }
}

function migrateCategories(db: Database, data: CategoryJson, stats: MigrationStats): void {
  // First pass: insert all categories without parent references
  const insertStmt = db.prepare(`
    INSERT INTO site_categories (id, site_id, slug, name, description, icon_emoji, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (site_id, slug) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      icon_emoji = excluded.icon_emoji,
      sort_order = excluded.sort_order
  `);

  const categoryIds: Record<string, string> = {};

  for (const cat of data.categories) {
    const existing = db
      .query("SELECT id FROM site_categories WHERE site_id = ? AND slug = ?")
      .get(data.site_id, cat.slug) as { id: string } | null;

    const id = existing?.id || generateId();
    categoryIds[cat.slug] = id;

    insertStmt.run(
      id,
      data.site_id,
      cat.slug,
      cat.name,
      cat.description || null,
      cat.icon_emoji || null,
      cat.sort_order || 0,
      now()
    );

    if (existing) {
      stats.categoriesUpdated++;
    } else {
      stats.categoriesInserted++;
    }
  }

  // Second pass: update parent references
  const updateParentStmt = db.prepare(`
    UPDATE site_categories SET parent_id = ? WHERE site_id = ? AND slug = ?
  `);

  for (const cat of data.categories) {
    if (cat.parent_slug && categoryIds[cat.parent_slug]) {
      updateParentStmt.run(categoryIds[cat.parent_slug], data.site_id, cat.slug);
    }
  }
}

function migrateContent(db: Database, data: ContentJson, stats: MigrationStats): void {
  // Resolve channel_id if channel_slug provided
  let channelId: string | null = null;
  if (data.channel_slug) {
    const channel = db
      .query("SELECT id FROM site_channels WHERE site_id = ? AND slug = ?")
      .get(data.site_id, data.channel_slug) as { id: string } | null;
    channelId = channel?.id || null;
  }

  // Resolve parent_id if parent_slug provided
  let parentId: string | null = null;
  if (data.parent_slug) {
    const parent = db
      .query("SELECT id FROM site_content WHERE site_id = ? AND slug = ?")
      .get(data.site_id, data.parent_slug) as { id: string } | null;
    parentId = parent?.id || null;
  }

  // Check if content exists
  const existing = db
    .query("SELECT id FROM site_content WHERE site_id = ? AND slug = ?")
    .get(data.site_id, data.slug) as { id: string } | null;

  const contentId = existing?.id || generateId();
  const timestamp = now();
  const publishedAt = parseTimestamp(data.published_at) || timestamp;

  const stmt = db.prepare(`
    INSERT INTO site_content (
      id, site_id, content_type, slug, channel_id, parent_id, category,
      title, subtitle, body, summary,
      thumbnail_emoji, thumbnail_url, media_urls, metadata,
      tags, entities, keywords,
      is_featured, is_pinned, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (site_id, slug) DO UPDATE SET
      content_type = excluded.content_type,
      channel_id = excluded.channel_id,
      parent_id = excluded.parent_id,
      category = excluded.category,
      title = excluded.title,
      subtitle = excluded.subtitle,
      body = excluded.body,
      summary = excluded.summary,
      thumbnail_emoji = excluded.thumbnail_emoji,
      thumbnail_url = excluded.thumbnail_url,
      media_urls = excluded.media_urls,
      metadata = excluded.metadata,
      tags = excluded.tags,
      entities = excluded.entities,
      keywords = excluded.keywords,
      is_featured = excluded.is_featured,
      is_pinned = excluded.is_pinned,
      published_at = excluded.published_at,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    contentId,
    data.site_id,
    data.content_type,
    data.slug,
    channelId,
    parentId,
    data.category || null,
    data.title,
    data.subtitle || null,
    data.body || null,
    data.summary || null,
    data.thumbnail_emoji || null,
    data.thumbnail_url || null,
    JSON.stringify(data.media_urls || []),
    JSON.stringify(data.metadata || {}),
    JSON.stringify(data.tags || []),
    JSON.stringify(data.entities || []),
    data.keywords || null,
    data.is_featured ? 1 : 0,
    data.is_pinned ? 1 : 0,
    publishedAt,
    timestamp,
    timestamp
  );

  if (existing) {
    stats.contentUpdated++;
  } else {
    stats.contentInserted++;
  }

  // Migrate comments if present
  if (data.comments && data.comments.length > 0) {
    migrateComments(db, contentId, data.comments, stats);
  }
}

function migrateComments(
  db: Database,
  contentId: string,
  comments: CommentJson[],
  stats: MigrationStats,
  parentCommentId: string | null = null,
  rootCommentId: string | null = null,
  depth: number = 0
): void {
  const stmt = db.prepare(`
    INSERT INTO site_content_comments (
      id, content_id, parent_comment_id, root_comment_id, thread_depth,
      author_id, author_type, author_name, author_avatar,
      content, like_count, dislike_count, is_creator,
      published_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const comment of comments) {
    const commentId = generateId();
    const effectiveRootId = rootCommentId || (depth === 0 ? commentId : null);

    stmt.run(
      commentId,
      contentId,
      parentCommentId,
      effectiveRootId,
      depth,
      null, // author_id (filler comments don't have IDs)
      "filler",
      comment.author_name,
      comment.author_avatar || null,
      comment.content,
      comment.like_count || 0,
      comment.dislike_count || 0,
      comment.is_creator ? 1 : 0,
      parseTimestamp(comment.published_at) || now(),
      now()
    );

    stats.commentsInserted++;

    // Recurse for replies
    if (comment.replies && comment.replies.length > 0) {
      migrateComments(
        db,
        contentId,
        comment.replies,
        stats,
        commentId,
        effectiveRootId,
        depth + 1
      );
    }
  }
}

function processFile(
  db: Database,
  filePath: string,
  stats: MigrationStats,
  dryRun: boolean
): void {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    if (!data.$schema) {
      stats.errors.push(`${filePath}: Missing $schema field`);
      return;
    }

    console.log(`  Processing: ${relative(CONTENT_DIR, filePath)}`);

    if (!dryRun) {
      switch (data.$schema) {
        case "channel":
          migrateChannels(db, data as ChannelJson, stats);
          break;
        case "content":
          migrateContent(db, data as ContentJson, stats);
          break;
        case "category":
          migrateCategories(db, data as CategoryJson, stats);
          break;
        default:
          stats.errors.push(`${filePath}: Unknown schema type: ${data.$schema}`);
          return;
      }

      moveToMigrated(filePath);
    }

    stats.filesProcessed.push(filePath);
  } catch (err) {
    stats.errors.push(`${filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let siteFilter: string | null = null;
  let fileFilter: string | null = null;
  let dryRun = false;
  let showHelp = false;
  let doListSnapshots = false;
  let restoreSnapshotId: string | null = null;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--site":
        siteFilter = args[++i];
        break;
      case "--file":
        fileFilter = args[++i];
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--list-snapshots":
        doListSnapshots = true;
        break;
      case "--restore":
        restoreSnapshotId = args[++i];
        break;
      case "--help":
        showHelp = true;
        break;
    }
  }

  if (showHelp) {
    console.log(`
Content Migration Tool

Migrates JSON content files to the database with snapshot backups.

Usage:
  bun run server/src/tools/content-migrate.ts [options]

Options:
  --site <site_id>     Migrate only a specific site (e.g., vidtube)
  --file <path>        Migrate a specific file
  --dry-run            Validate without inserting
  --list-snapshots     List all migration snapshots
  --restore <id>       Restore from a snapshot
  --help               Show this help

Directory Structure:
  server/data/content/{site_id}/
    channels.json        - Channel definitions
    categories.json      - Category definitions
    {content_type}/      - Content files (videos/, articles/, etc.)
      some-content.json

After migration, processed files are moved to _migrated/ subdirectory.
`);
    return;
  }

  if (doListSnapshots) {
    listSnapshots();
    return;
  }

  // Get database
  const db = getDB("game");

  if (restoreSnapshotId) {
    const snapshotDir = join(BACKUP_DIR, restoreSnapshotId);
    if (!existsSync(snapshotDir)) {
      console.error(`Snapshot not found: ${restoreSnapshotId}`);
      process.exit(1);
    }
    restoreSnapshot(db, snapshotDir);
    return;
  }

  // Find files to process
  let files: string[] = [];

  if (fileFilter) {
    if (!existsSync(fileFilter)) {
      console.error(`File not found: ${fileFilter}`);
      process.exit(1);
    }
    files = [fileFilter];
  } else if (siteFilter) {
    const siteDir = join(CONTENT_DIR, siteFilter);
    if (!existsSync(siteDir)) {
      console.error(`Site directory not found: ${siteDir}`);
      process.exit(1);
    }
    files = findJsonFiles(siteDir);
  } else {
    files = findJsonFiles(CONTENT_DIR);
  }

  if (files.length === 0) {
    console.log("No files to process.");
    return;
  }

  console.log(`\nFound ${files.length} file(s) to process${dryRun ? " (dry run)" : ""}\n`);

  // Create snapshot before migration
  const snapshotName = `snapshot_${formatDate()}`;
  if (!dryRun) {
    console.log(`Creating snapshot: ${snapshotName}`);
    createSnapshot(db, snapshotName);
    console.log();
  }

  // Process files
  const stats: MigrationStats = {
    channelsInserted: 0,
    channelsUpdated: 0,
    contentInserted: 0,
    contentUpdated: 0,
    commentsInserted: 0,
    categoriesInserted: 0,
    categoriesUpdated: 0,
    filesProcessed: [],
    errors: [],
  };

  // Process channels first (they're referenced by content)
  const channelFiles = files.filter((f) => basename(f) === "channels.json");
  const categoryFiles = files.filter((f) => basename(f) === "categories.json");
  const contentFiles = files.filter(
    (f) => basename(f) !== "channels.json" && basename(f) !== "categories.json"
  );

  for (const file of channelFiles) {
    processFile(db, file, stats, dryRun);
  }

  for (const file of categoryFiles) {
    processFile(db, file, stats, dryRun);
  }

  for (const file of contentFiles) {
    processFile(db, file, stats, dryRun);
  }

  // Log migration to database
  if (!dryRun && stats.filesProcessed.length > 0) {
    db.prepare(`
      INSERT INTO content_migration_snapshots (
        id, snapshot_name, source_files, tables_affected,
        records_inserted, records_updated, backup_path, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      generateId(),
      snapshotName,
      JSON.stringify(stats.filesProcessed.map((f) => relative(CONTENT_DIR, f))),
      JSON.stringify(["site_channels", "site_content", "site_content_comments", "site_categories"]),
      stats.channelsInserted + stats.contentInserted + stats.commentsInserted + stats.categoriesInserted,
      stats.channelsUpdated + stats.contentUpdated + stats.categoriesUpdated,
      join(BACKUP_DIR, snapshotName),
      stats.errors.length > 0 ? "completed_with_errors" : "completed",
      now()
    );
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("Migration Summary");
  console.log("=".repeat(50));
  console.log(`Files processed: ${stats.filesProcessed.length}`);
  console.log(`Channels: ${stats.channelsInserted} inserted, ${stats.channelsUpdated} updated`);
  console.log(`Content: ${stats.contentInserted} inserted, ${stats.contentUpdated} updated`);
  console.log(`Comments: ${stats.commentsInserted} inserted`);
  console.log(`Categories: ${stats.categoriesInserted} inserted, ${stats.categoriesUpdated} updated`);

  if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    for (const err of stats.errors) {
      console.log(`  - ${err}`);
    }
  }

  if (!dryRun && stats.filesProcessed.length > 0) {
    console.log(`\nSnapshot saved: ${snapshotName}`);
    console.log(`Processed files moved to _migrated/ directories`);
  }
}

main().catch(console.error);
