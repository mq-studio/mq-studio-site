#!/bin/bash

# Emergency Monitoring Script for Ungoverned MCP Servers
# Extends governance monitoring to /idp-projects/servers/

set -euo pipefail

UNGOVERNED_DIR="/home/ichardart/idp-projects/servers/src"
LOG_DIR="/home/ichardart/code/infra/logs"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
EMERGENCY_LOG="$LOG_DIR/emergency-mcp-monitoring-$TIMESTAMP.json"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

echo "🚨 EMERGENCY MCP MONITORING - $(date)" | tee -a "$EMERGENCY_LOG"
echo "Target: $UNGOVERNED_DIR" | tee -a "$EMERGENCY_LOG"

# Function to check if server is running
check_server_status() {
    local server_name=$1
    local server_path=$2
    
    # Check for running processes
    local processes=$(ps aux | grep -E "$server_name" | grep -v grep | wc -l)
    
    # Check if directory exists and has configuration
    local has_config="false"
    if [[ -f "$server_path/package.json" ]] || [[ -f "$server_path/pyproject.toml" ]]; then
        has_config="true"
    fi
    
    # Determine risk level based on governance framework
    local risk_level="UNKNOWN"
    case "$server_name" in
        "puppeteer") risk_level="CRITICAL - PROHIBITED" ;;
        "sequentialthinking") risk_level="HIGH - PROHIBITED" ;;
        "filesystem") risk_level="HIGH - REDUNDANT" ;;
        "github"|"gitlab") risk_level="MEDIUM - REMEDIABLE" ;;
        "postgres"|"sqlite") risk_level="MEDIUM - REMEDIABLE" ;;
        "fetch") risk_level="MEDIUM - REMEDIABLE" ;;
        "slack"|"gdrive") risk_level="MEDIUM - REMEDIABLE" ;;
        *) risk_level="MEDIUM - ASSESSMENT_NEEDED" ;;
    esac
    
    echo "  Server: $server_name"
    echo "    Processes: $processes"
    echo "    Config: $has_config"
    echo "    Risk: $risk_level"
    echo "    Path: $server_path"
    
    # JSON output for structured logging
    cat >> "$EMERGENCY_LOG" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "server": "$server_name",
  "path": "$server_path",
  "processes_running": $processes,
  "has_configuration": $has_config,
  "risk_level": "$risk_level",
  "governance_status": "UNGOVERNED",
  "action_required": true
}
EOF
}

echo "Scanning ungoverned MCP servers..." | tee -a "$EMERGENCY_LOG"

# Scan all servers in ungoverned directory
if [[ -d "$UNGOVERNED_DIR" ]]; then
    for server_dir in "$UNGOVERNED_DIR"/*; do
        if [[ -d "$server_dir" ]]; then
            server_name=$(basename "$server_dir")
            check_server_status "$server_name" "$server_dir"
            echo "---"
        fi
    done
else
    echo "❌ Ungoverned directory not found: $UNGOVERNED_DIR" | tee -a "$EMERGENCY_LOG"
    exit 1
fi

# Generate summary
echo "📊 MONITORING SUMMARY:" | tee -a "$EMERGENCY_LOG"
echo "- Total servers scanned: $(find "$UNGOVERNED_DIR" -maxdepth 1 -type d | wc -l)" | tee -a "$EMERGENCY_LOG"
echo "- Prohibited servers found: $(find "$UNGOVERNED_DIR" -name "puppeteer" -o -name "sequentialthinking" | wc -l)" | tee -a "$EMERGENCY_LOG"
echo "- Log file: $EMERGENCY_LOG" | tee -a "$EMERGENCY_LOG"

# Check for critical violations
CRITICAL_VIOLATIONS=$(ps aux | grep -E "(puppeteer|sequentialthinking)" | grep -v grep | wc -l)
if [[ $CRITICAL_VIOLATIONS -gt 0 ]]; then
    echo "🚨 CRITICAL: $CRITICAL_VIOLATIONS prohibited servers still running!" | tee -a "$EMERGENCY_LOG"
    echo "Action required: Immediate termination" | tee -a "$EMERGENCY_LOG"
else
    echo "✅ No prohibited servers currently running" | tee -a "$EMERGENCY_LOG"
fi

echo "🔍 Emergency monitoring complete - $(date)" | tee -a "$EMERGENCY_LOG"
echo "Next steps: Apply governance extension plan"