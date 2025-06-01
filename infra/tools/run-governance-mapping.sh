#!/bin/bash
# Run governance mapping with progress monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/home/ichardart/code/infra/logs/governance-mapping-$(date +%Y%m%d_%H%M%S).log"

echo "🏛️ Starting Governance Artifact Mapping"
echo "======================================="
echo "Log file: $LOG_FILE"
echo ""

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Run the mapping script with output to both console and log
echo "Starting mapping at $(date)" | tee "$LOG_FILE"

# Test on smaller directory first
echo "📂 Testing on /home/ichardart/code/infra first..." | tee -a "$LOG_FILE"

# Create a test version that only scans infra directory
python3 -c "
import sys
sys.path.append('$SCRIPT_DIR')
exec(open('$SCRIPT_DIR/map-governance-artifacts-v2.py').read().replace(
    'def run_mapping(self, root_dir=\"/home/ichardart\"):', 
    'def run_mapping(self, root_dir=\"/home/ichardart/code/infra\"):'
))
" 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Test run completed successfully!" | tee -a "$LOG_FILE"
    echo ""
    echo "🔄 Now running full scan on /home/ichardart..." | tee -a "$LOG_FILE"
    
    # Run full scan
    python3 "$SCRIPT_DIR/map-governance-artifacts-v2.py" 2>&1 | tee -a "$LOG_FILE"
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "✅ Full mapping completed successfully!" | tee -a "$LOG_FILE"
    else
        echo "❌ Full mapping failed - check log for details" | tee -a "$LOG_FILE"
    fi
else
    echo "❌ Test run failed - check log for details" | tee -a "$LOG_FILE"
fi

echo "📋 Scan completed at $(date)" | tee -a "$LOG_FILE"
echo "📄 Full log available at: $LOG_FILE"