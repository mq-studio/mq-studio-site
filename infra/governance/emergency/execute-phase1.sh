#\!/bin/bash
set -euo pipefail

echo "🚨 Executing Phase 1: Emergency Response"
echo "========================================"

# Step 1: Run pre-flight check
/tmp/pre-execution-check.sh || { echo "❌ Pre-flight check failed"; exit 1; }

# Step 2: Execute lockdown
echo -e "\n📌 Step 2: Emergency Lockdown"
./emergency-mcp-lockdown.sh

# Step 3: Deploy monitoring
echo -e "\n📌 Step 3: Deploy Emergency Monitoring"
docker-compose -f docker-compose.emergency.yml up -d --build

# Step 4: Run security scan
echo -e "\n📌 Step 4: Security Scan"
cd /home/ichardart/code/infra/governance/scanner
node extension-security-scanner.js

# Step 5: Generate status report
echo -e "\n📊 Phase 1 Complete - Status Report:"
echo "===================================="
docker ps  < /dev/null |  grep mcp-emergency-monitor && echo "✅ Emergency monitor running" || echo "❌ Monitor failed"
test -f /tmp/extension-security-report-*.json && echo "✅ Security scan complete" || echo "❌ Scan failed"

echo -e "\n✅ Phase 1 Emergency Response Complete!"
echo "Next: Execute Phase 2 with ./execute-phase2.sh"
