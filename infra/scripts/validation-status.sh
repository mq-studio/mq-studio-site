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
    echo "✅ Health monitoring cron: ACTIVE (every 15 minutes)"
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
    echo "❓ No health check results found - run 'health-check' first"
fi

# Show recent validation activity
echo
echo "📈 Recent Validation Activity:"
if [[ -f "/home/ichardart/code/infra/logs/pre-commit-validation.log" ]]; then
    echo "Pre-commit validations (last 5):"
    tail -5 /home/ichardart/code/infra/logs/pre-commit-validation.log 2>/dev/null | while read line; do
        echo "   $line"
    done
else
    echo "   No pre-commit activity logged yet"
fi

echo
echo "🔧 Available Commands:"
echo "   health-check                    - Run immediate health check"
echo "   validate <type> <path>          - Run action validation"
echo "   validation-status               - Show this dashboard"
echo "   deploy-claude-desktop           - Deploy with validation gates"
echo "   bypass-validation 'reason'      - Emergency bypass next commit"
echo
echo "📊 Validation Framework Files:"
echo "   Enhanced Framework: /home/ichardart/code/infra/governance/enhanced-validation-framework.md"
echo "   Health Monitor: /home/ichardart/code/infra/scripts/claude-desktop-health.sh"
echo "   Action Validator: /home/ichardart/code/infra/scripts/validate-action.sh"
echo "   Deployment Gates: /home/ichardart/code/infra/scripts/validate-deployment.sh"
echo "   Pre-commit Hook: /home/ichardart/code/.git/hooks/pre-commit"