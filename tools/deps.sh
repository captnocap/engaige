#!/bin/bash
# Dependency analysis for engaige
#
# Usage:
#   ./tools/deps.sh              # Generate report to stdout
#   ./tools/deps.sh --image      # Generate PNG diagram
#   ./tools/deps.sh --mermaid    # Output mermaid only (for pasting)
#   ./tools/deps.sh --all        # Show all nodes (not limited)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default settings for this project
FRONTEND_DIR="$PROJECT_DIR/src"
FRONTEND_ENTRY="main.tsx"
BACKEND_DIR="$PROJECT_DIR/server/src"
BACKEND_ENTRY="index.ts"

MAX_NODES=100
OUTPUT_MODE="report"
OUTPUT_FILE=""

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        --image|-i)
            OUTPUT_MODE="image"
            OUTPUT_FILE="${2:-deps.png}"
            if [[ "$2" != -* ]] && [[ -n "$2" ]]; then shift; fi
            shift
            ;;
        --mermaid|-m)
            OUTPUT_MODE="mermaid"
            shift
            ;;
        --all|-a)
            MAX_NODES=9999
            shift
            ;;
        --max-nodes=*)
            MAX_NODES="${1#*=}"
            shift
            ;;
        -h|--help)
            echo "Dependency analysis for engaige"
            echo ""
            echo "Usage:"
            echo "  ./tools/deps.sh              # Generate markdown report to stdout"
            echo "  ./tools/deps.sh --image      # Generate PNG diagram (deps.png)"
            echo "  ./tools/deps.sh --image out.png  # Generate PNG to specific file"
            echo "  ./tools/deps.sh --mermaid    # Output mermaid only (for copy/paste)"
            echo "  ./tools/deps.sh --all        # Show all nodes (not limited to 100)"
            echo ""
            echo "Options:"
            echo "  -i, --image [file]   Generate PNG image (default: deps.png)"
            echo "  -m, --mermaid        Output mermaid diagram only"
            echo "  -a, --all            Show all nodes"
            echo "  --max-nodes=N        Limit to N nodes (default: 100)"
            echo ""
            echo "Sources analyzed:"
            echo "  frontend: $FRONTEND_DIR (entry: $FRONTEND_ENTRY)"
            echo "  backend:  $BACKEND_DIR (entry: $BACKEND_ENTRY)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

case $OUTPUT_MODE in
    report)
        bun "$SCRIPT_DIR/dep-analyzer-fullstack.ts" \
            --frontend="$FRONTEND_DIR:$FRONTEND_ENTRY" \
            --backend="$BACKEND_DIR:$BACKEND_ENTRY" \
            --max-nodes="$MAX_NODES"
        ;;
    mermaid)
        bun "$SCRIPT_DIR/dep-analyzer-fullstack.ts" \
            --frontend="$FRONTEND_DIR:$FRONTEND_ENTRY" \
            --backend="$BACKEND_DIR:$BACKEND_ENTRY" \
            --max-nodes="$MAX_NODES" \
            --mermaid-only
        ;;
    image)
        # Check for mmdc
        if ! command -v mmdc &> /dev/null; then
            echo "Error: mmdc not found"
            echo "Install with: bun add -g @mermaid-js/mermaid-cli"
            exit 1
        fi

        OUTPUT_FILE="${OUTPUT_FILE:-deps.png}"
        TMPFILE=$(mktemp /tmp/dep-graph.XXXXXX.mmd)
        trap "rm -f $TMPFILE" EXIT

        echo "Analyzing dependencies..."
        bun "$SCRIPT_DIR/dep-analyzer-fullstack.ts" \
            --frontend="$FRONTEND_DIR:$FRONTEND_ENTRY" \
            --backend="$BACKEND_DIR:$BACKEND_ENTRY" \
            --max-nodes="$MAX_NODES" \
            --mermaid-only > "$TMPFILE"

        echo "Generating $OUTPUT_FILE..."
        mmdc -i "$TMPFILE" -o "$OUTPUT_FILE" -b transparent \
            -p "$SCRIPT_DIR/puppeteer.json" \
            -c "$SCRIPT_DIR/mermaid.json" \
            -w 3840 -H 2160 -s 2

        # Also save mermaid source
        cp "$TMPFILE" "${OUTPUT_FILE%.*}.mmd"
        echo "Done: $OUTPUT_FILE"
        echo "Mermaid: ${OUTPUT_FILE%.*}.mmd"
        ;;
esac
