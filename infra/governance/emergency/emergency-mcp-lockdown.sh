#\!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/mcp-emergency-$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="$HOME/.vscode-emergency-backup/$(date +%Y%m%d_%H%M%S)"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"  < /dev/null |  tee -a "$LOG_FILE"
}

# Create backup
log "Creating backup at $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r ~/.vscode-server/extensions/*cline* "$BACKUP_DIR/" 2>/dev/null || true
cp -r ~/.vscode-server/extensions/*kilo* "$BACKUP_DIR/" 2>/dev/null || true

# Disable high-risk extensions
log "Disabling high-risk extensions..."
for ext in rooveterinaryinc.roo-cline kilocode.kilo-code; do
    if code --list-extensions | grep -q "$ext"; then
        code --uninstall-extension "$ext" && log "✅ Disabled $ext" || log "❌ Failed to disable $ext"
    fi
done

# Kill unauthorized MCP processes
log "Terminating ungoverned MCP servers..."
for proc in "mcp-server-slack" "@e2b/mcp-server" "context7-mcp"; do
    if pgrep -f "$proc" > /dev/null; then
        pkill -f "$proc" && log "✅ Terminated $proc" || log "❌ Failed to terminate $proc"
    fi
done

# Deploy monitoring
log "Deploying emergency monitoring..."
docker run -d \
    --name mcp-emergency-monitor \
    --restart unless-stopped \
    -p 3099:3099 \
    -v "$LOG_FILE:/logs/emergency.log" \
    -e ALERT_MODE=HIGH \
    localhost:5000/idp/mcp-monitor:latest || log "⚠️  Monitor deployment failed"

log "Emergency lockdown complete. Review log: $LOG_FILE"
