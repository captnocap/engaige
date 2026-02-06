#!/usr/bin/env bun

/**
 * Full-stack dependency analyzer
 *
 * Analyzes multiple source directories (frontend, backend, shared) together
 * and shows cross-boundary dependencies.
 *
 * Usage:
 *   dep-analyzer-fullstack.ts --frontend=./client/src:App.tsx --backend=./server/src:index.ts
 *   dep-analyzer-fullstack.ts --src=./src:main.tsx,server.ts --shared=./lib:index.ts
 */

import * as fs from "fs";
import * as path from "path";

interface SourceConfig {
  name: string;
  dir: string;
  entries: string[];
  color: string;
}

interface DependencyGraph {
  nodes: Map<string, { source: string; file: string }>;
  edges: Map<string, Set<string>>;
}

interface AnalysisResult {
  active: Set<string>;
  unused: Set<string>;
  graph: DependencyGraph;
  sources: SourceConfig[];
}

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", ".next", "coverage"];

const SOURCE_COLORS: Record<string, { fill: string; stroke: string }> = {
  frontend: { fill: "#1a2a33", stroke: "#60a5fa" },
  backend: { fill: "#1a331a", stroke: "#4ade80" },
  shared: { fill: "#332a1a", stroke: "#fbbf24" },
  api: { fill: "#2a1a33", stroke: "#a78bfa" },
  default: { fill: "#1a332a", stroke: "#4ade80" },
};

function getAllFiles(dir: string, base: string = dir): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        files.push(...getAllFiles(fullPath, base));
      }
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(relativePath);
    }
  }

  return files;
}

function extractImports(filePath: string, baseDir: string): string[] {
  const content = fs.readFileSync(path.join(baseDir, filePath), "utf-8");
  const imports: string[] = [];

  const patterns = [
    /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /export\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g,
    /export\s*\*\s*from\s+['"]([^'"]+)['"]/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith(".")) {
        imports.push(importPath);
      }
    }
  }

  return imports;
}

function resolveImport(fromFile: string, importPath: string, allFiles: string[]): string | null {
  const fromDir = path.dirname(fromFile);
  let resolved = path.normalize(path.join(fromDir, importPath));
  const strippedResolved = resolved.replace(/\.(js|mjs|cjs)$/, "");

  if (allFiles.includes(resolved)) return resolved;

  for (const base of [resolved, strippedResolved]) {
    for (const ext of EXTENSIONS) {
      if (allFiles.includes(base + ext)) return base + ext;
    }
  }

  for (const base of [resolved, strippedResolved]) {
    for (const ext of EXTENSIONS) {
      const indexPath = path.join(base, `index${ext}`);
      if (allFiles.includes(indexPath)) return indexPath;
    }
  }

  return null;
}

function buildFullStackGraph(sources: SourceConfig[]): AnalysisResult {
  const graph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map(),
  };

  // Collect all files from all sources with prefixed paths
  const allFilesBySource: Map<string, string[]> = new Map();

  for (const source of sources) {
    const files = getAllFiles(source.dir);
    allFilesBySource.set(source.name, files);

    for (const file of files) {
      const globalPath = `${source.name}/${file}`;
      graph.nodes.set(globalPath, { source: source.name, file });
    }
  }

  // Build edges
  for (const source of sources) {
    const files = allFilesBySource.get(source.name) || [];

    for (const file of files) {
      const globalPath = `${source.name}/${file}`;
      const imports = extractImports(file, source.dir);
      const resolved = new Set<string>();

      for (const imp of imports) {
        // Try to resolve within same source first
        const target = resolveImport(file, imp, files);
        if (target) {
          const targetGlobalPath = `${source.name}/${target}`;
          // Filter out self-references (barrel file re-exports)
          if (targetGlobalPath !== globalPath) {
            resolved.add(targetGlobalPath);
          }
        }
      }

      graph.edges.set(globalPath, resolved);
    }
  }

  // BFS from all entry points
  const active = new Set<string>();
  const queue: string[] = [];

  for (const source of sources) {
    for (const entry of source.entries) {
      const globalPath = `${source.name}/${entry}`;
      if (graph.nodes.has(globalPath)) {
        queue.push(globalPath);
      }
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (active.has(current)) continue;
    active.add(current);

    const deps = graph.edges.get(current) || new Set();
    for (const dep of deps) {
      if (!active.has(dep)) queue.push(dep);
    }
  }

  const unused = new Set(
    [...graph.nodes.keys()].filter((f) => !active.has(f))
  );

  return { active, unused, graph, sources };
}

function getDisplayName(globalPath: string): string {
  // Show parent/filename for disambiguation
  const parts = globalPath.split("/");
  if (parts.length >= 3) {
    const filename = parts[parts.length - 1];
    const parent = parts[parts.length - 2];
    const ext = path.extname(filename);
    const base = path.basename(filename, ext);

    // If it's an index file, show parent/index
    if (base === "index") {
      return `${parent}/index`;
    }
    // Otherwise show parent/filename (without extension)
    return `${parent}/${base}`;
  }
  return path.basename(globalPath, path.extname(globalPath));
}

function generateMermaid(result: AnalysisResult, maxNodes: number = 50): string {
  const lines: string[] = [
    "%%{init: {'theme': 'base', 'themeVariables': { 'lineColor': '#000000', 'edgeLabelBackground': '#ffffff' }}}%%",
    "flowchart TD",
  ];

  const nodeId = (file: string) =>
    file.replace(/[^a-zA-Z0-9]/g, "_").replace(/^_+|_+$/g, "");

  // Group active files by source
  const activeBySource: Map<string, string[]> = new Map();
  for (const source of result.sources) {
    activeBySource.set(source.name, []);
  }

  for (const file of result.active) {
    const node = result.graph.nodes.get(file);
    if (node) {
      const list = activeBySource.get(node.source) || [];
      list.push(file);
      activeBySource.set(node.source, list);
    }
  }

  // Limit nodes per source proportionally
  const totalActive = result.active.size;
  const limitedFiles: string[] = [];

  for (const source of result.sources) {
    const files = activeBySource.get(source.name) || [];
    const proportion = files.length / totalActive;
    const limit = Math.max(5, Math.floor(maxNodes * proportion));
    limitedFiles.push(...files.slice(0, limit));
  }

  // Track all edges for cross-source connections
  const addedEdges = new Set<string>();
  const nodesInEdges = new Set<string>();

  // Generate subgraphs per source
  for (const source of result.sources) {
    const sourceFiles = limitedFiles.filter((f) => f.startsWith(`${source.name}/`));
    if (sourceFiles.length === 0) continue;

    const colors = SOURCE_COLORS[source.name] || SOURCE_COLORS.default;
    lines.push(`    subgraph ${source.name}["${source.name.toUpperCase()}"]`);

    for (const file of sourceFiles) {
      const deps = result.graph.edges.get(file) || new Set();
      for (const dep of deps) {
        if (result.active.has(dep) && limitedFiles.includes(dep)) {
          const fromId = nodeId(file);
          const toId = nodeId(dep);
          const edgeKey = `${fromId}->${toId}`;
          if (!addedEdges.has(edgeKey)) {
            const fromName = getDisplayName(file);
            const toName = getDisplayName(dep);
            lines.push(`        ${fromId}["${fromName}"] --> ${toId}["${toName}"]`);
            addedEdges.add(edgeKey);
            nodesInEdges.add(fromId);
            nodesInEdges.add(toId);
          }
        }
      }
    }

    // Add isolated nodes
    for (const file of sourceFiles) {
      if (!nodesInEdges.has(nodeId(file))) {
        lines.push(`        ${nodeId(file)}["${getDisplayName(file)}"]`);
      }
    }

    lines.push("    end");
    lines.push(`    style ${source.name} fill:${colors.fill},stroke:${colors.stroke}`);
  }

  // Unused subgraph (limited)
  const unusedList = [...result.unused].slice(0, 10);
  if (unusedList.length > 0) {
    lines.push('    subgraph unused["✗ Unused"]');
    for (const file of unusedList) {
      lines.push(`        ${nodeId(file)}["${getDisplayName(file)}"]`);
    }
    lines.push("    end");
    lines.push("    style unused fill:#332a2a,stroke:#f87171");
  }

  return lines.join("\n");
}

function generateReport(result: AnalysisResult, maxNodes: number = 50): string {
  const lines: string[] = [];

  lines.push("# Full-Stack Dependency Analysis\n");

  for (const source of result.sources) {
    const count = [...result.active].filter((f) => f.startsWith(`${source.name}/`)).length;
    lines.push(`**${source.name}:** ${count} active files`);
  }

  lines.push(`\n**Total active:** ${result.active.size}`);
  lines.push(`**Unused:** ${result.unused.size}`);
  lines.push(`**Total:** ${result.graph.nodes.size}\n`);

  if (result.unused.size > 0) {
    lines.push("## Potentially Unused Files\n");
    for (const file of [...result.unused].sort().slice(0, 30)) {
      lines.push(`- \`${file}\``);
    }
    if (result.unused.size > 30) {
      lines.push(`- ... and ${result.unused.size - 30} more`);
    }
  }

  lines.push("\n## Dependency Graph\n");
  lines.push("```mermaid");
  lines.push(generateMermaid(result, maxNodes));
  lines.push("```");

  return lines.join("\n");
}

// CLI
function parseSourceArg(arg: string): SourceConfig | null {
  // Format: --name=./path:entry1,entry2
  const match = arg.match(/^--(\w+)=([^:]+):(.+)$/);
  if (!match) return null;

  const [, name, dir, entriesStr] = match;
  const entries = entriesStr.split(",").map((e) => e.trim());

  return {
    name,
    dir: path.resolve(dir),
    entries,
    color: SOURCE_COLORS[name]?.stroke || SOURCE_COLORS.default.stroke,
  };
}

const args = process.argv.slice(2);
let maxNodes = 100;
let mermaidOnly = false;

const sources: SourceConfig[] = [];

for (const arg of args) {
  if (arg === "--mermaid-only") {
    mermaidOnly = true;
  } else if (arg.startsWith("--max-nodes=")) {
    maxNodes = parseInt(arg.split("=")[1]) || 100;
  } else if (arg === "--all") {
    maxNodes = Infinity;
  } else if (arg.startsWith("--")) {
    const source = parseSourceArg(arg);
    if (source) {
      sources.push(source);
    }
  }
}

if (sources.length === 0) {
  console.log(`Full-Stack Dependency Analyzer

Usage:
  dep-analyzer-fullstack.ts --<name>=<dir>:<entries> [--<name>=<dir>:<entries>...]

Arguments:
  --<name>=<dir>:<entries>   Define a source (name, directory, comma-separated entry points)

Options:
  --mermaid-only            Output only Mermaid diagram
  --max-nodes=N             Max nodes in diagram (default: 100)
  --all                     Show all nodes

Examples:
  # React frontend + Express backend
  dep-analyzer-fullstack.ts --frontend=./client/src:App.tsx --backend=./server/src:index.ts

  # Monorepo with shared code
  dep-analyzer-fullstack.ts --frontend=./apps/web/src:main.tsx --backend=./apps/api/src:index.ts --shared=./packages/common/src:index.ts

  # Single fullstack app with multiple entries
  dep-analyzer-fullstack.ts --app=./src:client/App.tsx,server/index.ts

Predefined colors:
  frontend (blue), backend (green), shared (yellow), api (purple)
`);
  process.exit(1);
}

// Validate sources exist
for (const source of sources) {
  if (!fs.existsSync(source.dir)) {
    console.error(`Directory not found: ${source.dir}`);
    process.exit(1);
  }
}

const result = buildFullStackGraph(sources);

if (mermaidOnly) {
  console.log(generateMermaid(result, maxNodes));
} else {
  console.log(generateReport(result, maxNodes));
}
