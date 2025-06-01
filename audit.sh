#!/bin/bash

# Light Audit Script v0.1 — Baseline Validation for Development Environment

AUDIT_LOG="$HOME/.claude/session/env-checks.json"
mkdir -p "$(dirname "$AUDIT_LOG")"

echo "{ \"audit_started\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\" }" > "$AUDIT_LOG"

## PHASE A: Workspace Verification
echo "🔍 Phase A: Verifying ~/code workspace and Git status..."
WORKSPACE_DIR="$HOME/code"
BRANCH=$(git -C "$WORKSPACE_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)
if [[ -d "$WORKSPACE_DIR/.git" && "$BRANCH" == "main" ]]; then
  WS_STATUS="valid"
else
  WS_STATUS="invalid"
fi
echo "\"workspace\": { \"status\": \"$WS_STATUS\", \"branch\": \"$BRANCH\" }," >> "$AUDIT_LOG"

## PHASE B: Claude Config Check
echo "🔍 Phase B: Checking Claude config.json..."
CLAUDE_CFG="$HOME/.claude/config.json"
if [ -f "$CLAUDE_CFG" ]; then
  CFG_PATH=$(jq -r .workspace "$CLAUDE_CFG")
  TRUST_OK=$(grep -q "$WORKSPACE_DIR" <<< "$CFG_PATH" && echo "true" || echo "false")
else
  TRUST_OK="false"
fi
echo "\"claude_config\": { \"trusted\": $TRUST_OK }," >> "$AUDIT_LOG"

## PHASE C: Metadata File Check
echo "🔍 Phase C: Checking manifest.md, project.json, CLAUDE.md..."
declare -a META_FILES=("manifest.md" ".claude/project.json" ".claude/CLAUDE.md")
declare -A META_STATUS
for f in "${META_FILES[@]}"; do
  if [ -f "$HOME/code/$f" ]; then
    META_STATUS[$f]="present"
  else
    META_STATUS[$f]="missing"
  fi
done
echo "\"metadata\": { \"manifest.md\": \"${META_STATUS[manifest.md]}\", \"project.json\": \"${META_STATUS[.claude/project.json]}\", \"CLAUDE.md\": \"${META_STATUS[.claude/CLAUDE.md]}\" }," >> "$AUDIT_LOG"

## PHASE D: GitHub Remote Verification
echo "🔍 Phase D: Checking Git remote 'origin'..."
REMOTE_URL=$(git -C "$WORKSPACE_DIR" remote get-url origin 2>/dev/null)
if [[ "$REMOTE_URL" == https://* ]]; then
  REMOTE_STATUS="reachable"
else
  REMOTE_STATUS="missing_or_invalid"
fi
echo "\"git_remote\": { \"status\": \"$REMOTE_STATUS\", \"url\": \"$REMOTE_URL\" }" >> "$AUDIT_LOG"

echo "✅ Audit complete. Log written to $AUDIT_LOG"
