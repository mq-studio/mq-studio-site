#!/bin/bash
# 🏛️ CONTINUOUS GOVERNANCE MONITORING
# Runs governance enforcement every 15 minutes and blocks violations

LOG_FILE="/home/ichardart/code/infra/logs/governance-enforcement.log"
mkdir -p "$(dirname "$LOG_FILE")"

while true; do
    echo "$(date): Running governance enforcement" >> "$LOG_FILE"
    
    # Run governance enforcer
    if python3 /home/ichardart/code/infra/tools/governance-enforcer.py >> "$LOG_FILE" 2>&1; then
        echo "$(date): ✅ Governance compliant" >> "$LOG_FILE"
    else
        echo "$(date): ❌ Violations detected and blocked" >> "$LOG_FILE"
        
        # Send notification (could extend to email, Slack, etc.)
        echo "GOVERNANCE VIOLATION DETECTED at $(date)" | \
            tee -a "$LOG_FILE"
    fi
    
    # Wait 15 minutes
    sleep 900
done