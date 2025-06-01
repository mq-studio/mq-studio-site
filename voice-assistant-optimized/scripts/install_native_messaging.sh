#!/bin/bash

# Native Messaging Installation Script
# Sets up browser integration for voice assistant

set -e

echo "🌐 Installing Native Messaging for Browser Integration"
echo "===================================================="

# Determine script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Chrome/Chromium native messaging directory
CHROME_NATIVE_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
CHROMIUM_NATIVE_DIR="$HOME/.config/chromium/NativeMessagingHosts"

# Create directories
mkdir -p "$CHROME_NATIVE_DIR" 2>/dev/null || true
mkdir -p "$CHROMIUM_NATIVE_DIR" 2>/dev/null || true

# Get absolute path to the native messaging host
HOST_PATH="$(readlink -f "$PROJECT_DIR/native-messaging/voice_assistant_host.py")"

# Create the native messaging host manifest
cat > "$CHROME_NATIVE_DIR/com.voice.assistant.json" << EOF
{
  "name": "com.voice.assistant",
  "description": "Voice Assistant Native Messaging Host",
  "path": "$HOST_PATH",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://*/",
    "moz-extension://*/"
  ]
}
EOF

# Copy to Chromium directory
cp "$CHROME_NATIVE_DIR/com.voice.assistant.json" "$CHROMIUM_NATIVE_DIR/" 2>/dev/null || true

echo "✅ Native messaging host installed"
echo "📍 Chrome: $CHROME_NATIVE_DIR/com.voice.assistant.json"
echo "📍 Chromium: $CHROMIUM_NATIVE_DIR/com.voice.assistant.json"

# Make the host executable
chmod +x "$PROJECT_DIR/native-messaging/voice_assistant_host.py"

echo ""
echo "🔧 Browser Extension Setup:"
echo "1. Open Chrome/Chromium"
echo "2. Go to chrome://extensions/"
echo "3. Enable 'Developer mode'"
echo "4. Click 'Load unpacked'"
echo "5. Select: $PROJECT_DIR/browser-extension/"
echo ""
echo "✅ Native messaging setup complete!"