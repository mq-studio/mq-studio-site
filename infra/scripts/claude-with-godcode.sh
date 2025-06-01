#!/bin/bash
# Claude Code with GodCode integration

if [[ "$1" == "*GodCode" ]]; then
    echo "🧠 Activating GodCode Thinking Protocol..."
    touch /tmp/godcode-active
    export GODCODE_MODE=true
    echo "✅ GodCode mode activated. All future interactions will use comprehensive thinking."
    exit 0
fi

# Check if GodCode is active and prepend protocol
if [[ -f /tmp/godcode-active ]] && [[ -n "$1" ]]; then
    PROTOCOL_FILE="/home/ichardart/code/infra/config/godcode-thinking-protocol.txt"
    if [[ -f "$PROTOCOL_FILE" ]]; then
        echo "$(cat "$PROTOCOL_FILE")"
        echo ""
        echo "Human: $*"
    else
        echo "Human: $*"
    fi
else
    echo "Human: $*"
fi
