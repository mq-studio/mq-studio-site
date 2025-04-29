#!/bin/bash

# move-artifacts - Move artifacts between projects or locations
# Part of dev-env CLI

# Default values
CODE_DIR="$HOME/code"
SOURCE_PATH=""
DESTINATION_PATH=""
ARTIFACT_TYPE="file"  # file or directory
CREATE_BACKUP=true

# Display help information
show_help() {
  echo "dev-env move-artifacts - Move artifacts between projects or locations"
  echo ""
  echo "Usage: dev-env move-artifacts SOURCE DESTINATION [options]"
  echo ""
  echo "Arguments:"
  echo "  SOURCE        Source path of artifact to move"
  echo "  DESTINATION   Destination path for the artifact"
  echo ""
  echo "Options:"
  echo "  --type TYPE   Artifact type (file or directory), default: file"
  echo "  --no-backup   Skip creating backup of existing destination"
  echo "  --help        Show this help message"
  echo ""
  echo "Examples:"
  echo "  dev-env move-artifacts ~/code/web/project1/docs/architecture.md ~/code/infra/docs/"
  echo "  dev-env move-artifacts ~/code/experiments/proto1/assets/ ~/code/products/app1/assets/ --type directory"
}

# Check if no arguments or help requested
if [ $# -eq 0 ] || [ "$1" == "--help" ]; then
  show_help
  exit 0
fi

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)
      show_help
      exit 0
      ;;
    --type)
      ARTIFACT_TYPE="$2"
      shift 2
      ;;
    --no-backup)
      CREATE_BACKUP=false
      shift
      ;;
    *)
      # First non-option argument is the source path
      if [ -z "$SOURCE_PATH" ]; then
        SOURCE_PATH="$1"
      # Second non-option argument is the destination path
      elif [ -z "$DESTINATION_PATH" ]; then
        DESTINATION_PATH="$1"
      else
        echo "Error: Unexpected argument '$1'"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate required arguments
if [ -z "$SOURCE_PATH" ]; then
  echo "Error: Source path is required"
  show_help
  exit 1
fi

if [ -z "$DESTINATION_PATH" ]; then
  echo "Error: Destination path is required"
  show_help
  exit 1
fi

# Validate artifact type
if [ "$ARTIFACT_TYPE" != "file" ] && [ "$ARTIFACT_TYPE" != "directory" ]; then
  echo "Error: Invalid artifact type '$ARTIFACT_TYPE'"
  echo "Valid types: file, directory"
  exit 1
fi

# Validate source exists
if [ "$ARTIFACT_TYPE" == "file" ] && [ ! -f "$SOURCE_PATH" ]; then
  echo "Error: Source file does not exist: $SOURCE_PATH"
  exit 1
elif [ "$ARTIFACT_TYPE" == "directory" ] && [ ! -d "$SOURCE_PATH" ]; then
  echo "Error: Source directory does not exist: $SOURCE_PATH"
  exit 1
fi

# Extract filename/dirname from source path
if [ "$ARTIFACT_TYPE" == "file" ]; then
  ARTIFACT_NAME=$(basename "$SOURCE_PATH")
else
  ARTIFACT_NAME=$(basename "$SOURCE_PATH")
fi

# Determine destination full path
if [ -d "$DESTINATION_PATH" ]; then
  # If destination is a directory, put the artifact inside it
  DEST_FULL_PATH="$DESTINATION_PATH/$ARTIFACT_NAME"
else
  # Otherwise, use the destination path as is
  DEST_FULL_PATH="$DESTINATION_PATH"
  
  # Create parent directory if it doesn't exist
  PARENT_DIR=$(dirname "$DEST_FULL_PATH")
  if [ ! -d "$PARENT_DIR" ]; then
    echo "Creating parent directory: $PARENT_DIR"
    mkdir -p "$PARENT_DIR"
  fi
fi

# Check if destination already exists
if [ "$ARTIFACT_TYPE" == "file" ] && [ -f "$DEST_FULL_PATH" ]; then
  if [ "$CREATE_BACKUP" == true ]; then
    BACKUP_PATH="${DEST_FULL_PATH}.bak.$(date +%Y%m%d_%H%M%S)"
    echo "Backing up existing file to $BACKUP_PATH"
    cp "$DEST_FULL_PATH" "$BACKUP_PATH"
  else
    echo "Warning: Destination file already exists and will be overwritten: $DEST_FULL_PATH"
  fi
elif [ "$ARTIFACT_TYPE" == "directory" ] && [ -d "$DEST_FULL_PATH" ]; then
  if [ "$CREATE_BACKUP" == true ]; then
    BACKUP_PATH="${DEST_FULL_PATH}.bak.$(date +%Y%m%d_%H%M%S)"
    echo "Backing up existing directory to $BACKUP_PATH"
    cp -r "$DEST_FULL_PATH" "$BACKUP_PATH"
  else
    echo "Warning: Destination directory already exists and contents may be merged: $DEST_FULL_PATH"
  fi
fi

# Perform the move operation
echo "Moving $ARTIFACT_TYPE from $SOURCE_PATH to $DEST_FULL_PATH..."

if [ "$ARTIFACT_TYPE" == "file" ]; then
  cp "$SOURCE_PATH" "$DEST_FULL_PATH"
  rm "$SOURCE_PATH"
else
  cp -r "$SOURCE_PATH/." "$DEST_FULL_PATH/"
  rm -r "$SOURCE_PATH"
fi

# Update manifest files if they exist
SOURCE_PROJECT_DIR=$(dirname "$SOURCE_PATH")
while [ "$SOURCE_PROJECT_DIR" != "/" ]; do
  if [ -f "$SOURCE_PROJECT_DIR/manifest.md" ]; then
    echo "Found source project manifest at $SOURCE_PROJECT_DIR/manifest.md"
    echo "Note: You should update the manifest to reflect this artifact move."
    break
  fi
  SOURCE_PROJECT_DIR=$(dirname "$SOURCE_PROJECT_DIR")
done

DEST_PROJECT_DIR=$(dirname "$DEST_FULL_PATH")
while [ "$DEST_PROJECT_DIR" != "/" ]; do
  if [ -f "$DEST_PROJECT_DIR/manifest.md" ]; then
    echo "Found destination project manifest at $DEST_PROJECT_DIR/manifest.md"
    echo "Note: You should update the manifest to reflect this artifact addition."
    break
  fi
  DEST_PROJECT_DIR=$(dirname "$DEST_PROJECT_DIR")
done

echo "✅ Artifact moved successfully!"
echo "Source: $SOURCE_PATH"
echo "Destination: $DEST_FULL_PATH"

exit 0
