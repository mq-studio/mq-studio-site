#!/bin/bash
# 🔍 IDP Agent Context Detective
# Automatically determines the appropriate governance context for agent initialization

set -e

CURRENT_DIR=$(pwd)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IDP_CORE="/home/ichardart/code"

echo "🔍 IDP AGENT CONTEXT DETECTION"
echo "==============================="
echo "Current directory: $CURRENT_DIR"
echo

# Function to check if we're in a git repository
check_git_repo() {
    git rev-parse --git-dir > /dev/null 2>&1
}

# Function to check for IDP project markers
check_idp_markers() {
    local has_manifest=false
    local has_idp_root=false
    
    [[ -f "manifest.md" ]] && has_manifest=true
    [[ -f ".idp_project_root" ]] && has_idp_root=true
    
    echo "$has_manifest,$has_idp_root"
}

# Function to get project name from path
get_project_name() {
    basename "$CURRENT_DIR"
}

# Determine context
determine_context() {
    if [[ "$CURRENT_DIR" == "$IDP_CORE"* ]]; then
        echo "INFRASTRUCTURE"
    elif [[ "$CURRENT_DIR" == "/home/ichardart/idp-projects"* ]]; then
        echo "IDP_PROJECT"
    elif [[ "$CURRENT_DIR" == "/home/ichardart"* ]]; then
        echo "IDP_ADJACENT"
    else
        echo "EXTERNAL"
    fi
}

# Get governance readiness score
get_governance_readiness() {
    local context=$1
    local markers=$2
    local has_manifest=$(echo $markers | cut -d',' -f1)
    local has_idp_root=$(echo $markers | cut -d',' -f2)
    local score=0
    
    # Base scoring
    case $context in
        "INFRASTRUCTURE") score=100 ;;
        "IDP_PROJECT") score=70 ;;
        "IDP_ADJACENT") score=30 ;;
        "EXTERNAL") score=10 ;;
    esac
    
    # Adjust for markers
    [[ "$has_manifest" == "true" ]] && score=$((score + 15))
    [[ "$has_idp_root" == "true" ]] && score=$((score + 10))
    check_git_repo && score=$((score + 5))
    
    echo $score
}

# Main detection logic
CONTEXT=$(determine_context)
MARKERS=$(check_idp_markers)
PROJECT_NAME=$(get_project_name)
READINESS=$(get_governance_readiness "$CONTEXT" "$MARKERS")

echo "📋 DETECTION RESULTS"
echo "===================="
echo "Context Type: $CONTEXT"
echo "Project Name: $PROJECT_NAME"
echo "Governance Readiness: $READINESS%"
echo "Git Repository: $(check_git_repo && echo "Yes" || echo "No")"
echo "Has Manifest: $(echo $MARKERS | cut -d',' -f1)"
echo "Has IDP Root Marker: $(echo $MARKERS | cut -d',' -f2)"
echo

echo "🚀 RECOMMENDED AGENT INITIALIZATION"
echo "===================================="

case $CONTEXT in
    "INFRASTRUCTURE")
        echo "✅ INFRASTRUCTURE CONTEXT DETECTED"
        echo "Recommended initialization: CORE_INFRASTRUCTURE"
        echo
        echo "📋 Pre-session checklist:"
        echo "- Run: cd /home/ichardart/code"
        echo "- Run: ./infra/tools/governance-check.sh"
        echo "- Verify compliance score >75%"
        echo
        echo "🔗 Initialization prompt: Use 'Infrastructure Work' prompt from AGENT_QUICK_START_V2.md"
        echo "📁 Files to share: CLAUDE.md, manifest.md, OPERATING_RULES.md"
        ;;
        
    "IDP_PROJECT")
        echo "📦 IDP PROJECT CONTEXT DETECTED"
        echo "Recommended initialization: FEDERATED_PROJECT"
        echo
        echo "📋 Pre-session checklist:"
        echo "- Check for local manifest.md: $(echo $MARKERS | cut -d',' -f1)"
        echo "- Verify project governance readiness: $READINESS%"
        echo "- Link to core governance: $IDP_CORE"
        echo
        echo "🔗 Initialization prompt: Use 'IDP Project Work' prompt from AGENT_QUICK_START_V2.md"
        echo "📁 Files to share: Local manifest.md (if exists), ~/code/CLAUDE.md, ~/code/OPERATING_RULES.md"
        ;;
        
    "IDP_ADJACENT")
        echo "🌐 IDP-ADJACENT CONTEXT DETECTED"
        echo "Recommended initialization: GOVERNANCE_AWARE"
        echo
        echo "📋 Pre-session checklist:"
        echo "- Establish governance boundaries"
        echo "- Link to core IDP for reference"
        echo "- Clarify impact on main IDP"
        echo
        echo "🔗 Initialization prompt: Use 'External/Experimental Work' prompt from AGENT_QUICK_START_V2.md"
        echo "📁 Files to share: Local docs (if any), ~/code/CLAUDE.md"
        ;;
        
    "EXTERNAL")
        echo "🌍 EXTERNAL CONTEXT DETECTED"
        echo "Recommended initialization: MINIMAL_GOVERNANCE"
        echo
        echo "📋 Pre-session checklist:"
        echo "- Confirm isolation from IDP"
        echo "- Apply security-first principles"
        echo "- Document any IDP implications"
        echo
        echo "🔗 Initialization prompt: Use 'External/Experimental Work' prompt from AGENT_QUICK_START_V2.md"
        echo "📁 Files to share: Local README/docs, reference to ~/code/CLAUDE.md"
        ;;
esac

echo
echo "📖 For complete initialization workflows, see:"
echo "   - AGENT_QUICK_START_V2.md (context-aware prompts)"
echo "   - AGENT_ONBOARDING_WORKFLOW.md (detailed process)"
echo
echo "🔄 To change context, navigate to desired directory and re-run this script"

# Create context summary file for agent reference
cat > .agent_context_summary.tmp << EOF
{
  "detection_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "current_directory": "$CURRENT_DIR",
  "context_type": "$CONTEXT",
  "project_name": "$PROJECT_NAME",
  "governance_readiness": $READINESS,
  "has_git_repo": $(check_git_repo && echo "true" || echo "false"),
  "has_manifest": $(echo $MARKERS | cut -d',' -f1),
  "has_idp_root_marker": $(echo $MARKERS | cut -d',' -f2),
  "recommended_initialization": "$(case $CONTEXT in 
    INFRASTRUCTURE) echo "CORE_INFRASTRUCTURE" ;;
    IDP_PROJECT) echo "FEDERATED_PROJECT" ;;
    IDP_ADJACENT) echo "GOVERNANCE_AWARE" ;;
    EXTERNAL) echo "MINIMAL_GOVERNANCE" ;;
  esac)"
}
EOF

echo "💾 Context summary saved to: $CURRENT_DIR/.agent_context_summary.tmp"
echo "   (This file can be shared with agents for context awareness)"