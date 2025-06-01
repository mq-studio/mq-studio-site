#!/bin/bash

# IDP Governance Real-Time Sync Management Shortcuts

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start real-time sync
start-governance-sync() {
    "$TOOLS_DIR/governance-sync-service.sh" start
}

# Stop real-time sync  
stop-governance-sync() {
    "$TOOLS_DIR/governance-sync-service.sh" stop
}

# Check sync status
governance-sync-status() {
    "$TOOLS_DIR/governance-sync-service.sh" status
}

# Manual refresh all clients
refresh-governance() {
    python3 "$TOOLS_DIR/governance-auto-refresh.py" --refresh-all
}

# View sync logs
governance-logs() {
    "$TOOLS_DIR/governance-sync-service.sh" logs
}

# Test sync system
test-governance-sync() {
    "$TOOLS_DIR/governance-sync-service.sh" test
}

# Enhanced IDP Banner
echo ""
echo -e "\033[96m\033[1m🚀 Integrated Development Platform (IDP) Ready\033[0m"
echo -e "\033[96m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\033[0m"
echo ""
echo -e "\033[92m📋 Quick Start Commands:\033[0m"
echo -e "  \033[93midp-start\033[0m                  🎯 Intelligent project concierge & full IDP startup"
echo -e "  \033[93mrefresh-governance\033[0m         🔄 Refresh governance context for all AI clients"
echo ""
echo -e "\033[92m🔧 Governance Management:\033[0m"
echo -e "  \033[93mgovernance-sync-status\033[0m     📊 Check governance sync service status"
echo -e "  \033[93mstart-governance-sync\033[0m      ▶️  Start real-time governance monitoring"
echo -e "  \033[93mstop-governance-sync\033[0m       ⏹️  Stop real-time governance monitoring"
echo -e "  \033[93mgovernance-logs\033[0m            📜 View governance sync logs"
echo -e "  \033[93mtest-governance-sync\033[0m       🧪 Test the governance sync system"
echo ""
echo -e "\033[94m💡 Tip: Run '\033[93midp-start\033[94m' for guided project setup with intelligent recommendations\033[0m"
echo ""
