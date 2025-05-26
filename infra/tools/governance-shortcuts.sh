#!/bin/bash

# IDP Governance Real-Time Sync Management Shortcuts

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start real-time sync
alias start-governance-sync="$TOOLS_DIR/governance-sync-service.sh start"

# Stop real-time sync  
alias stop-governance-sync="$TOOLS_DIR/governance-sync-service.sh stop"

# Check sync status
alias governance-sync-status="$TOOLS_DIR/governance-sync-service.sh status"

# Manual refresh all clients
alias refresh-governance="python3 $TOOLS_DIR/governance-auto-refresh.py --refresh-all"

# View sync logs
alias governance-logs="$TOOLS_DIR/governance-sync-service.sh logs"

# Test sync system
alias test-governance-sync="$TOOLS_DIR/governance-sync-service.sh test"

echo "🛠️ IDP Governance Sync Shortcuts Loaded"
echo "Available commands:"
echo "• start-governance-sync   - Start real-time monitoring"
echo "• stop-governance-sync    - Stop real-time monitoring"
echo "• governance-sync-status  - Check service status"
echo "• refresh-governance      - Manual refresh all clients"
echo "• governance-logs         - View live logs"
echo "• test-governance-sync    - Test the system"
