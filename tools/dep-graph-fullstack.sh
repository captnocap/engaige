#!/bin/bash
# Generate full-stack dependency graph as image
#
# Usage: ./dep-graph-fullstack.sh --frontend=./client/src:App.tsx --backend=./server:index.ts [options]
#
# Requires: bun, @mermaid-js/mermaid-cli (mmdc)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="fullstack-deps.png"
WIDTH=3840
HEIGHT=2160
SCALE=2
MAX_NODES=""

# Parse args - extract output/size flags, pass rest to analyzer
ANALYZER_ARGS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT="$2"
            shift 2
            ;;
        -w|--width)
            WIDTH="$2"
            shift 2
            ;;
        -h|--height)
            HEIGHT="$2"
            shift 2
            ;;
        -s|--scale)
            SCALE="$2"
            shift 2
            ;;
        --max-nodes=*|--all)
            ANALYZER_ARGS+=("$1")
            shift
            ;;
        --*)
            # Pass source definitions to analyzer
            ANALYZER_ARGS+=("$1")
            shift
            ;;
        *)
            shift
            ;;
    esac
done

if [ ${#ANALYZER_ARGS[@]} -eq 0 ]; then
    echo "Usage: dep-graph-fullstack.sh --<name>=<dir>:<entries> [options]"
    echo ""
    echo "Source arguments (passed to analyzer):"
    echo "  --frontend=./path:entry.tsx    Frontend source"
    echo "  --backend=./path:entry.ts      Backend source"
    echo "  --shared=./path:index.ts       Shared code"
    echo "  --api=./path:index.ts          API layer"
    echo ""
    echo "Output options:"
    echo "  -o, --output FILE   Output file (default: fullstack-deps.png)"
    echo "  -w, --width N       Width in pixels (default: 3840)"
    echo "  -h, --height N      Height in pixels (default: 2160)"
    echo "  -s, --scale N       Scale factor (default: 2)"
    echo "  --max-nodes=N       Max nodes in diagram (default: 100)"
    echo "  --all               Show all nodes"
    echo ""
    echo "Examples:"
    echo "  ./dep-graph-fullstack.sh --frontend=./client/src:App.tsx --backend=./server/src:index.ts"
    echo "  ./dep-graph-fullstack.sh --frontend=./src:App.tsx --backend=./api:index.ts --all -o graph.svg"
    exit 1
fi

# Check for mmdc
if ! command -v mmdc &> /dev/null; then
    echo "Error: mmdc not found"
    echo "Install with: npm install -g @mermaid-js/mermaid-cli"
    exit 1
fi

# Create temp file for mermaid
TMPFILE=$(mktemp /tmp/dep-graph.XXXXXX.mmd)
trap "rm -f $TMPFILE" EXIT

# Run analyzer and capture mermaid output
echo "Analyzing: ${ANALYZER_ARGS[*]}"
bun "$SCRIPT_DIR/dep-analyzer-fullstack.ts" --mermaid-only "${ANALYZER_ARGS[@]}" > "$TMPFILE"
echo "Mermaid output: $(wc -l < "$TMPFILE") lines"

# Save mermaid file alongside output
MMD_OUTPUT="${OUTPUT%.*}.mmd"
cp "$TMPFILE" "$MMD_OUTPUT"

# Generate image
echo "Generating $OUTPUT (${WIDTH}x${HEIGHT} @${SCALE}x)..."
mmdc -i "$TMPFILE" -o "$OUTPUT" -b transparent -p "$SCRIPT_DIR/puppeteer.json" -c "$SCRIPT_DIR/mermaid.json" -w "$WIDTH" -H "$HEIGHT" -s "$SCALE"

echo "Done: $OUTPUT"
echo "Mermaid: $MMD_OUTPUT"
