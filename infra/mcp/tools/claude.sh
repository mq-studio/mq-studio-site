#!/bin/bash

# MCP Claude CLI Wrapper — with debug logging
# Usage: ./claude.sh "your prompt here"
# Requires: $ANTHROPIC_API_KEY environment variable

API_KEY="${ANTHROPIC_API_KEY}"
LOG_DIR="$HOME/.mcp/sessions"
LOG_FILE="$LOG_DIR/claude_log.jsonl"

mkdir -p "$LOG_DIR"

if [[ -z "$API_KEY" ]]; then
  echo "❌ Error: ANTHROPIC_API_KEY not set."
  exit 1
fi

PROMPT="$1"

if [[ -z "$PROMPT" ]]; then
  echo "Usage: $0 \"your prompt here\""
  exit 1
fi

# Query Claude
RESPONSE=$(curl https://api.anthropic.com/v1/messages \
  -sS \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-opus-20240229",
    "max_tokens": 1024,
    "temperature": 0.7

