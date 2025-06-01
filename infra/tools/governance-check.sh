#!/bin/bash

# Governance Compliance Checker
# Automatically runs when Claude Code starts to ensure governance awareness

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$INFRA_DIR/logs/governance-check.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Header
echo "🏛️ IDP GOVERNANCE COMPLIANCE CHECK"
echo "=================================="
log "Starting governance compliance check"

# Check 1: CLAUDE.md exists and is current
echo -n "📋 Checking CLAUDE.md governance awareness... "
if [ -f "/home/ichardart/code/CLAUDE.md" ]; then
    if grep -q "IDP Governance Framework" "/home/ichardart/code/CLAUDE.md"; then
        echo "✅ PASS"
        log "CLAUDE.md governance awareness: PASS"
    else
        echo "❌ FAIL - Missing governance content"
        log "CLAUDE.md governance awareness: FAIL - Missing content"
    fi
else
    echo "❌ FAIL - CLAUDE.md not found"
    log "CLAUDE.md governance awareness: FAIL - File not found"
fi

# Check 2: MCP Server compliance
echo -n "🛠️ Checking MCP server compliance... "
if [ -f "$INFRA_DIR/mcp-registry.md" ]; then
    echo "✅ PASS"
    log "MCP server registry: PASS"
else
    echo "⚠️ WARNING - Registry not found"
    log "MCP server registry: WARNING - File not found"
fi

# Check 3: Cline configuration compliance
echo -n "🔒 Checking Cline MCP configuration... "
CLINE_CONFIG="/home/ichardart/.vscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json"
if [ -f "$CLINE_CONFIG" ]; then
    # Check for high-risk servers that are ENABLED
    HIGH_RISK_ENABLED=$(python3 -c "
import json, sys
try:
    with open('$CLINE_CONFIG', 'r') as f:
        config = json.load(f)
    high_risk = ['browser-tools', 'puppeteer', 'sequential-thinking']
    enabled_high_risk = []
    for server_name, server_config in config.get('mcpServers', {}).items():
        if any(risk in server_name for risk in high_risk):
            if not server_config.get('disabled', False):
                enabled_high_risk.append(server_name)
    if enabled_high_risk:
        print('FOUND')
        for server in enabled_high_risk:
            print(f'   - {server}')
    else:
        print('NONE')
except Exception as e:
    print('ERROR')
" 2>/dev/null)
    
    if echo "$HIGH_RISK_ENABLED" | grep -q "FOUND"; then
        echo "🚨 SECURITY RISK - Non-compliant servers detected"
        log "Cline configuration: SECURITY RISK - High-risk servers found"
        echo "   High-risk servers found:"
        echo "$HIGH_RISK_ENABLED" | grep "   -"
    else
        echo "✅ PASS"
        log "Cline configuration: PASS"
    fi
else
    echo "✅ PASS - No Cline config found"
    log "Cline configuration: PASS - No config file"
fi

# Check 4: Infrastructure components
echo -n "🌐 Checking infrastructure components... "
MISSING_COMPONENTS=()

if [ ! -d "$INFRA_DIR/mcp-server-hub" ]; then
    MISSING_COMPONENTS+=("MCP Server Hub")
fi

if [ ! -d "$INFRA_DIR/A2A" ]; then
    MISSING_COMPONENTS+=("A2A Protocol")
fi

if [ ! -d "$INFRA_DIR/idp-governance" ]; then
    MISSING_COMPONENTS+=("IDP Governance")
fi

if [ ${#MISSING_COMPONENTS[@]} -eq 0 ]; then
    echo "✅ PASS"
    log "Infrastructure components: PASS"
else
    echo "⚠️ WARNING - Missing components: ${MISSING_COMPONENTS[*]}"
    log "Infrastructure components: WARNING - Missing: ${MISSING_COMPONENTS[*]}"
fi

# Check 5: Security policies
echo -n "🔐 Checking security policies... "
if [ -d "$INFRA_DIR/security-tooling" ]; then
    echo "✅ PASS"
    log "Security policies: PASS"
else
    echo "⚠️ WARNING - Security tooling not found"
    log "Security policies: WARNING - Directory not found"
fi

# Check 6: Run MCP status check
echo -n "🔍 Running MCP status check... "
if [ -f "$INFRA_DIR/tools/mcp-status-checker.py" ]; then
    if python3 "$INFRA_DIR/tools/mcp-status-checker.py" --no-update > /dev/null 2>&1; then
        echo "✅ PASS"
        log "MCP status check: PASS"
    else
        echo "⚠️ WARNING - Status check failed"
        log "MCP status check: WARNING - Script execution failed"
    fi
else
    echo "⚠️ WARNING - Status checker not found"
    log "MCP status check: WARNING - Script not found"
fi

# Summary
echo ""
echo "📊 GOVERNANCE COMPLIANCE SUMMARY"
echo "================================"

# Count issues
TOTAL_CHECKS=6
WARNINGS=$(grep -c "WARNING\|FAIL\|SECURITY RISK" "$LOG_FILE" | tail -1)
PASSES=$(grep -c "PASS" "$LOG_FILE" | tail -1)

echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSES"
echo "Issues: $WARNINGS"

if [ "$WARNINGS" -eq 0 ]; then
    echo "🎉 ALL GOVERNANCE CHECKS PASSED"
    log "Governance check completed: ALL PASSED"
elif [ "$WARNINGS" -le 2 ]; then
    echo "⚠️ MINOR GOVERNANCE ISSUES DETECTED"
    log "Governance check completed: MINOR ISSUES ($WARNINGS)"
else
    echo "🚨 SIGNIFICANT GOVERNANCE ISSUES DETECTED"
    log "Governance check completed: SIGNIFICANT ISSUES ($WARNINGS)"
fi

# Provide remediation guidance
if [ "$WARNINGS" -gt 0 ]; then
    echo ""
    echo "🔧 REMEDIATION ACTIONS:"
    echo "======================"
    
    if grep -q "SECURITY RISK" "$LOG_FILE"; then
        echo "🚨 IMMEDIATE: Remove high-risk MCP servers from Cline configuration"
        echo "   File: $CLINE_CONFIG"
        echo "   Command: Edit file and remove browser-tools, puppeteer, sequential-thinking servers"
    fi
    
    if grep -q "CLAUDE.md.*FAIL" "$LOG_FILE"; then
        echo "📋 HIGH: Update CLAUDE.md with governance awareness"
        echo "   Command: python3 $INFRA_DIR/tools/mcp-status-checker.py"
    fi
    
    if grep -q "Infrastructure.*WARNING" "$LOG_FILE"; then
        echo "🌐 MEDIUM: Restore missing infrastructure components"
        echo "   Check: $INFRA_DIR directory structure"
    fi
fi

echo ""
echo "📖 For detailed governance information, see:"
echo "   /home/ichardart/code/CLAUDE.md"
echo "   $INFRA_DIR/idp-governance/IDP_GOVERNANCE_FRAMEWORK.md"

log "Governance compliance check completed"