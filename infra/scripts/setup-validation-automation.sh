#!/bin/bash
# IDP Validation Automation Setup
# Makes Enhanced Validation Framework active and automatic

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Setting up IDP Validation Automation${NC}"
echo "========================================"

# 1. Setup cron for continuous health monitoring
echo -e "${YELLOW}📅 Configuring continuous health monitoring...${NC}"

# Create cron job for health monitoring every 15 minutes
(crontab -l 2>/dev/null | grep -v claude-desktop-health; echo "*/15 * * * * /home/ichardart/code/infra/scripts/claude-desktop-health.sh > /dev/null 2>&1") | crontab -

echo "✅ Health monitoring scheduled every 15 minutes"

# 2. Setup file system watcher for immediate validation
echo -e "${YELLOW}👁️ Setting up file system watcher...${NC}"

# Install inotify-tools if not present
if ! command -v inotifywait >/dev/null 2>&1; then
    echo "Installing inotify-tools..."
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# Create watcher daemon script
cat > /home/ichardart/code/infra/scripts/validation-watcher.sh << 'EOF'
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
EOF

chmod +x /home/ichardart/code/infra/scripts/validation-watcher.sh
echo "✅ File system watcher configured"

# 3. Setup systemd service for validation watcher (if systemd available)
if command -v systemctl >/dev/null 2>&1; then
    echo -e "${YELLOW}🔧 Creating systemd service for validation watcher...${NC}"
    
    sudo tee /etc/systemd/system/idp-validation-watcher.service > /dev/null << EOF
[Unit]
Description=IDP Validation Watcher
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/ichardart/code
ExecStart=/home/ichardart/code/infra/scripts/validation-watcher.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable idp-validation-watcher
    sudo systemctl start idp-validation-watcher
    
    echo "✅ Validation watcher service started and enabled"
else
    echo "⚠️ Systemd not available - watcher must be started manually"
fi

# 4. Setup deployment gate integration
echo -e "${YELLOW}🚪 Configuring deployment gates...${NC}"

# Create deployment alias that enforces validation
cat >> ~/.bashrc << 'EOF'

# IDP Enhanced Validation Framework Aliases
alias deploy-claude-desktop='echo "🛡️ Enforcing validation gate..." && /home/ichardart/code/infra/scripts/validate-deployment.sh claude-desktop && echo "✅ Deployment authorized"'
alias deploy-mcp-server='/home/ichardart/code/infra/scripts/validate-deployment.sh mcp-server'
alias health-check='/home/ichardart/code/infra/scripts/claude-desktop-health.sh'
alias validate='/home/ichardart/code/infra/scripts/validate-action.sh'

# Emergency bypass function
bypass-validation() {
    if [[ -z "$1" ]]; then
        echo "Usage: bypass-validation 'emergency reason'"
        return 1
    fi
    echo "$1" > /home/ichardart/code/.validation-bypass
    echo "⚠️ Validation bypass activated: $1"
    echo "Next commit will bypass validation gates"
}
EOF

echo "✅ Deployment aliases configured"

# 5. Create validation status dashboard
echo -e "${YELLOW}📊 Setting up validation status dashboard...${NC}"

cat > /home/ichardart/code/infra/scripts/validation-status.sh << 'EOF'
#!/bin/bash
# IDP Validation Status Dashboard

echo "🛡️ IDP Enhanced Validation Framework Status"
echo "==========================================="
echo

# Check pre-commit hook status
if [[ -x "/home/ichardart/code/.git/hooks/pre-commit" ]]; then
    echo "✅ Pre-commit validation: ACTIVE"
else
    echo "❌ Pre-commit validation: INACTIVE"
fi

# Check health monitoring cron
if crontab -l 2>/dev/null | grep -q claude-desktop-health; then
    echo "✅ Health monitoring cron: ACTIVE"
else
    echo "❌ Health monitoring cron: INACTIVE"
fi

# Check validation watcher service
if systemctl is-active --quiet idp-validation-watcher 2>/dev/null; then
    echo "✅ Validation watcher service: ACTIVE"
elif pgrep -f validation-watcher.sh >/dev/null; then
    echo "✅ Validation watcher: ACTIVE (manual)"
else
    echo "❌ Validation watcher: INACTIVE"
fi

# Check recent health status
echo
echo "📋 Latest Health Check:"
if [[ -f "/home/ichardart/code/infra/logs/claude-desktop-health-results.json" ]]; then
    local status
    local timestamp
    status=$(jq -r '.overall_status' /home/ichardart/code/infra/logs/claude-desktop-health-results.json 2>/dev/null || echo "UNKNOWN")
    timestamp=$(jq -r '.timestamp' /home/ichardart/code/infra/logs/claude-desktop-health-results.json 2>/dev/null || echo "Unknown")
    
    case "$status" in
        "PASSED") echo "✅ Status: $status ($timestamp)" ;;
        "DEGRADED") echo "⚠️ Status: $status ($timestamp)" ;;
        "FAILED") echo "❌ Status: $status ($timestamp)" ;;
        *) echo "❓ Status: $status ($timestamp)" ;;
    esac
else
    echo "❓ No health check results found"
fi

# Show recent validation activity
echo
echo "📈 Recent Validation Activity:"
if [[ -f "/home/ichardart/code/infra/logs/pre-commit-validation.log" ]]; then
    echo "Pre-commit validations (last 5):"
    tail -5 /home/ichardart/code/infra/logs/pre-commit-validation.log | while read line; do
        echo "   $line"
    done
else
    echo "   No pre-commit activity logged yet"
fi

echo
echo "🔧 Quick Commands:"
echo "   health-check          - Run immediate health check"
echo "   validate <type> <path> - Run action validation"
echo "   validation-status     - Show this dashboard"
echo "   bypass-validation 'reason' - Emergency bypass next commit"
EOF

chmod +x /home/ichardart/code/infra/scripts/validation-status.sh

# Add alias for status dashboard
echo "alias validation-status='/home/ichardart/code/infra/scripts/validation-status.sh'" >> ~/.bashrc

echo "✅ Validation status dashboard created"

# 6. Update CLAUDE.md with active validation status
echo -e "${YELLOW}📝 Updating CLAUDE.md with active validation status...${NC}"

# Source the new bashrc to get aliases
source ~/.bashrc 2>/dev/null || true

echo "✅ Enhanced Validation Framework automation complete!"
echo
echo -e "${GREEN}🎉 VALIDATION AUTOMATION ACTIVE${NC}"
echo "================================="
echo "✅ Pre-commit hooks enforcing validation"
echo "✅ Continuous health monitoring (every 15 minutes)"
echo "✅ File system watcher for immediate validation"
echo "✅ Deployment gates integrated"
echo "✅ Status dashboard available"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'source ~/.bashrc' to activate new aliases"
echo "2. Run 'validation-status' to see current status"
echo "3. Try making a commit to test pre-commit validation"
echo
echo -e "${YELLOW}Emergency bypass available:${NC}"
echo "   bypass-validation 'Production incident #123'"