import { Database } from "bun:sqlite";
import { join, dirname, relative, basename } from "path";
import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "fs";

// Paths
const CWD = process.cwd();
const DATA_DIR = join(CWD, "server/data");
const DUMP_DIR = join(CWD, "tmp/db-dump");
const LORE_DIR = join(DATA_DIR, "content");

const DB_FILES = {
    global: join(DATA_DIR, "global.db"),
    game: join(DATA_DIR, "game.db"),
    npc: join(DATA_DIR, "npc.db"),
    user: join(DATA_DIR, "user.db"),
};

interface LoreFile {
    path: string;
    site_id: string;
    type: "channel" | "content" | "category" | "unknown";
    slugs: string[];
}

function findJsonFiles(dir: string): string[] {
    if (!existsSync(dir)) return [];
    const files: string[] = [];
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...findJsonFiles(fullPath));
        } else if (entry.name.endsWith(".json")) {
            files.push(fullPath);
        }
    }
    return files;
}

async function main() {
    console.log("🚀 Starting Database Dump & Lore Cross-Reference...");

    // 1. Prepare Dump Directory
    if (existsSync(DUMP_DIR)) {
        rmSync(DUMP_DIR, { recursive: true, force: true });
    }
    mkdirSync(DUMP_DIR, { recursive: true });

    const dbStats: Record<string, any> = {};
    const dbContents: Record<string, Record<string, any[]>> = {};

    // 2. Dump Databases
    for (const [name, path] of Object.entries(DB_FILES)) {
        if (!existsSync(path)) {
            console.warn(`⚠️  Database not found: ${path}`);
            continue;
        }

        console.log(`📦 Dumping database: ${name} (${path})`);
        const db = new Database(path);
        const dbDumpDir = join(DUMP_DIR, name);
        mkdirSync(dbDumpDir, { recursive: true });

        const tables = db.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];

        dbStats[name] = { tableCount: tables.length, tables: {} };
        dbContents[name] = {};

        for (const { name: tableName } of tables) {
            // Skip FTS virtual tables and their internal tables if they are too noisy, 
            // but the user wants a "massive context dump", so let's include them unless they are huge.
            // Actually, let's skip FTS internal tables like _idx, _content, etc.
            if (tableName.includes("_fts_") || tableName.endsWith("_fts")) {
                // We can skip these as they just mirror site_content
                continue;
            }

            const rows = db.query(`SELECT * FROM ${tableName}`).all();
            dbStats[name].tables[tableName] = rows.length;
            dbContents[name][tableName] = rows;

            writeFileSync(join(dbDumpDir, `${tableName}.json`), JSON.stringify(rows, null, 2));
        }
        db.close();
    }

    // 3. Scan Lore Files
    console.log(`📖 Scanning lore files in: ${LORE_DIR}`);
    const loreFiles = findJsonFiles(LORE_DIR);
    const loreReport: LoreFile[] = [];

    for (const file of loreFiles) {
        try {
            const content = JSON.parse(readFileSync(file, "utf-8"));
            const site_id = content.site_id || "unknown";
            const schema = content.$schema;

            let type: LoreFile["type"] = "unknown";
            let slugs: string[] = [];

            if (schema === "channel") {
                type = "channel";
                slugs = content.channels?.map((c: any) => c.slug) || [];
            } else if (schema === "content") {
                type = "content";
                slugs = [content.slug];
            } else if (schema === "category") {
                type = "category";
                slugs = content.categories?.map((c: any) => c.slug) || [];
            }

            loreReport.push({
                path: relative(DATA_DIR, file),
                site_id,
                type,
                slugs
            });
        } catch (e) {
            console.error(`❌ Error parsing lore file ${file}:`, e);
        }
    }

    // 4. Cross-Reference
    console.log("🔍 Cross-referencing DB with Lore files...");

    const gameDB = dbContents.game || {};
    const dbChannels = gameDB.site_channels || [];
    const dbContent = gameDB.site_content || [];
    const dbCategories = gameDB.site_categories || [];

    const dbChannelKeys = new Set(dbChannels.map(c => `${c.site_id}:${c.slug}`));
    const dbContentKeys = new Set(dbContent.map(c => `${c.site_id}:${c.slug}`));
    const dbCategoryKeys = new Set(dbCategories.map(c => `${c.site_id}:${c.slug}`));

    const crossRef = {
        pushed: [] as any[],
        missing: [] as any[],
        orphanedInDB: [] as any[], // In DB but no file found (might be deleted or moved)
    };

    const fileKeys = new Set<string>();

    for (const lore of loreReport) {
        for (const slug of lore.slugs) {
            const key = `${lore.site_id}:${slug}`;
            const typeKey = `${lore.type}:${key}`;
            fileKeys.add(typeKey);

            let isPushed = false;
            if (lore.type === "channel") isPushed = dbChannelKeys.has(key);
            else if (lore.type === "content") isPushed = dbContentKeys.has(key);
            else if (lore.type === "category") isPushed = dbCategoryKeys.has(key);

            if (isPushed) {
                crossRef.pushed.push({ type: lore.type, key, path: lore.path });
            } else {
                crossRef.missing.push({ type: lore.type, key, path: lore.path });
            }
        }
    }

    // Check for orphans (content in DB that isn't in our current lore file scan)
    for (const c of dbChannels) {
        const key = `${c.site_id}:${c.slug}`;
        if (!fileKeys.has(`channel:${key}`)) {
            crossRef.orphanedInDB.push({ type: "channel", key });
        }
    }
    for (const c of dbContent) {
        const key = `${c.site_id}:${c.slug}`;
        if (!fileKeys.has(`content:${key}`)) {
            crossRef.orphanedInDB.push({ type: "content", key });
        }
    }
    for (const c of dbCategories) {
        const key = `${c.site_id}:${c.slug}`;
        if (!fileKeys.has(`category:${key}`)) {
            crossRef.orphanedInDB.push({ type: "category", key });
        }
    }

    // 5. Generate Summary Report
    const report = {
        timestamp: new Date().toISOString(),
        dbStats,
        loreSummary: {
            totalFiles: loreFiles.length,
            channels: loreReport.filter(l => l.type === "channel").length,
            content: loreReport.filter(l => l.type === "content").length,
            categories: loreReport.filter(l => l.type === "category").length,
        },
        crossReference: {
            totalPushed: crossRef.pushed.length,
            totalMissing: crossRef.missing.length,
            totalOrphanedInDB: crossRef.orphanedInDB.length,
            missingItems: crossRef.missing,
            orphanedItems: crossRef.orphanedInDB
        }
    };

    writeFileSync(join(DUMP_DIR, "summary_report.json"), JSON.stringify(report, null, 2));

    // 6. Final Output
    console.log("\n" + "=".repeat(50));
    console.log("📊 DUMP SUMMARY");
    console.log("=".repeat(50));
    for (const [db, stats] of Object.entries(dbStats)) {
        console.log(`${db.toUpperCase()}.DB: ${stats.tableCount} tables`);
        for (const [table, count] of Object.entries(stats.tables)) {
            console.log(`  - ${table}: ${count} rows`);
        }
    }
    console.log("-".repeat(50));
    console.log(`Lore Files: ${loreReport.length} files found`);
    console.log(`Cross-Ref: ${crossRef.pushed.length} in both, ${crossRef.missing.length} only in files, ${crossRef.orphanedInDB.length} only in DB`);
    console.log("=".repeat(50));
    console.log(`\n✅ All data dumped to: ${DUMP_DIR}`);
    console.log(`See ${join(DUMP_DIR, "summary_report.json")} for full report.`);
}

main().catch(console.error);
