#!/bin/bash
# 🔄 Auto-Documentation Hook
# Automatically triggers documentation updates for infrastructure changes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHANGE_TRACKER="$SCRIPT_DIR/enhanced-change-tracker.py"

echo "🔍 Running automatic change detection..."

# Run the enhanced change tracker
if [[ -f "$CHANGE_TRACKER" ]]; then
    python3 "$CHANGE_TRACKER"
else
    echo "❌ Change tracker not found: $CHANGE_TRACKER"
    exit 1
fi

echo "✅ Automatic documentation check complete"