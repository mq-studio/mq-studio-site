#!/bin/bash
# Continuous validation watcher daemon

WATCH_DIR="/home/ichardart/code"
LOG_FILE="/home/ichardart/code/infra/logs/validation-watcher.log"

# Function to handle file changes
handle_change() {
    local file="$1"
    local event="$2"
    
    echo "$(date -Iseconds) - File changed: $file ($event)" >> "$LOG_FILE"
    
    case "$file" in
        */.claude/config.json)
            echo "$(date -Iseconds) - Triggering Claude Desktop health check" >> "$LOG_FILE"
            /home/ichardart/code/infra/scripts/claude-desktop-health.sh >> "$LOG_FILE" 2>&1 &
            ;;
        */infra/mcp-servers/*)
            echo "$(date -Iseconds) - MCP server change detected" >> "$LOG_FILE"
            /home/ichardart/code/infra/scripts/claude-desktop-health.sh >> "$LOG_FILE" 2>&1 &
            ;;
    esac
}

# Start watching
echo "$(date -Iseconds) - Starting validation watcher on $WATCH_DIR" >> "$LOG_FILE"

inotifywait -m -r -e modify,create,delete,move \
    --include '\.(json|js|py|sh|md)$' \
    "$WATCH_DIR" \
    --format '%w%f %e' |
while read file event; do
    handle_change "$file" "$event"
done
