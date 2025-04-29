#!/bin/bash

# install.sh - Installation script for dev-env CLI

# Determine script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/.local/bin"
COMMANDS_DIR="$SCRIPT_DIR/bin/commands"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"
mkdir -p "$COMMANDS_DIR"

# Copy main command script
cp "$SCRIPT_DIR/bin/dev-env" "$TARGET_DIR/dev-env"
chmod +x "$TARGET_DIR/dev-env"

# Copy command implementations
for cmd in "$SCRIPT_DIR/bin/commands"/*.sh; do
  if [ -f "$cmd" ]; then
    cp "$cmd" "$COMMANDS_DIR/$(basename "$cmd")"
    chmod +x "$COMMANDS_DIR/$(basename "$cmd")"
  fi
done

# Check if TARGET_DIR is in PATH
if [[ ":$PATH:" != *":$TARGET_DIR:"* ]]; then
  echo "Adding $TARGET_DIR to PATH in ~/.bashrc"
  echo 'export PATH="$PATH:'"$TARGET_DIR"'"' >> ~/.bashrc
  echo "Please restart your terminal or run 'source ~/.bashrc' to update your PATH"
else
  echo "$TARGET_DIR is already in PATH"
fi

echo "✅ dev-env CLI has been installed successfully!"
