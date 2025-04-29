#!/bin/bash

# initialize-project - Create a new project with standardized structure
# Part of dev-env CLI

# Default values
CODE_DIR="$HOME/code"
DEFAULT_PROJECT_TYPE="web"
PROJECT_NAME=""
PROJECT_TYPE=""
CREATE_GITHUB=false
GITHUB_PRIVATE=true

# Display help information
show_help() {
  echo "dev-env initialize-project - Create a new project with standardized structure"
  echo ""
  echo "Usage: dev-env initialize-project NAME [options]"
  echo ""
  echo "Options:"
  echo "  --type TYPE       Project type (infra, clients, products, experiments, web)"
  echo "                    Default: web"
  echo "  --github          Initialize and push to GitHub repository"
  echo "  --public          Make GitHub repository public (if --github is used)"
  echo "  --help            Show this help message"
  echo ""
  echo "Example:"
  echo "  dev-env initialize-project my-new-app --type products --github"
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
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
      PROJECT_TYPE="$2"
      shift 2
      ;;
    --github)
      CREATE_GITHUB=true
      shift
      ;;
    --public)
      GITHUB_PRIVATE=false
      shift
      ;;
    *)
      # First non-option argument is the project name
      if [ -z "$PROJECT_NAME" ]; then
        PROJECT_NAME="$1"
      else
        echo "Error: Unexpected argument '$1'"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate project name
if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Project name is required"
  show_help
  exit 1
fi

# Set default project type if not specified
if [ -z "$PROJECT_TYPE" ]; then
  PROJECT_TYPE="$DEFAULT_PROJECT_TYPE"
fi

# Validate project type
case "$PROJECT_TYPE" in
  infra|clients|products|experiments|web)
    # Valid project type
    ;;
  *)
    echo "Error: Invalid project type '$PROJECT_TYPE'"
    echo "Valid types: infra, clients, products, experiments, web"
    exit 1
    ;;
esac

# Construct project path
PROJECT_PATH="$CODE_DIR/$PROJECT_TYPE/$PROJECT_NAME"

# Check if project directory already exists
if [ -d "$PROJECT_PATH" ]; then
  echo "Error: Project directory already exists: $PROJECT_PATH"
  exit 1
fi

# Create project directory and structure
echo "Creating project structure for '$PROJECT_NAME' in $PROJECT_PATH..."

mkdir -p "$PROJECT_PATH"
mkdir -p "$PROJECT_PATH/docs"
mkdir -p "$PROJECT_PATH/scripts"
mkdir -p "$PROJECT_PATH/workflows"
mkdir -p "$PROJECT_PATH/assets"

# Create README.md
cat > "$PROJECT_PATH/README.md" << EOL
# Project: $PROJECT_NAME

## Overview
Brief description of the project

## Getting Started
Instructions for setting up and running the project

## Features
- Feature 1
- Feature 2

## Structure
- \`docs/\`: Documentation files
- \`scripts/\`: Utility scripts
- \`workflows/\`: GitHub workflow definitions
- \`assets/\`: Static assets
EOL

# Create manifest.md
cat > "$PROJECT_PATH/manifest.md" << EOL
# 📋 Manifest for $PROJECT_NAME

## Project Information
- **Name:** $PROJECT_NAME
- **Type:** $PROJECT_TYPE
- **Created:** $(date +"%Y-%m-%d")
- **Status:** Initialized

## Artifacts
| File/Directory | Purpose | Status |
|:---------------|:--------|:-------|
| README.md | Project documentation | Created |
| docs/ | Detailed documentation | Created |
| scripts/ | Utility scripts | Created |
| workflows/ | GitHub workflow definitions | Created |
| assets/ | Static assets | Created |

## Notes
- Initial project structure created via dev-env CLI
EOL

# Create .gitignore
cat > "$PROJECT_PATH/.gitignore" << EOL
# Dependencies
node_modules/
.pnp/
.pnp.js
package-lock.json
yarn.lock

# Testing
coverage/

# Production
build/
dist/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db
EOL

# Initialize Git repository
echo "Initializing Git repository..."
(cd "$PROJECT_PATH" && git init && git add . && git commit -m "Initial commit: Project structure")

# Create GitHub repository if requested
if [ "$CREATE_GITHUB" = true ]; then
  echo "Creating GitHub repository..."
  
  # Determine visibility flag
  if [ "$GITHUB_PRIVATE" = true ]; then
    VISIBILITY="--private"
  else
    VISIBILITY="--public"
  fi
  
  # Check if gh CLI is installed
  if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed. Cannot create GitHub repository."
    echo "Please install gh CLI and authenticate, or create the repository manually."
  else
    # Create repo and push
    (cd "$PROJECT_PATH" && gh repo create "$PROJECT_NAME" $VISIBILITY --source=. --push --yes)
    
    if [ $? -eq 0 ]; then
      echo "GitHub repository created and code pushed successfully."
    else
      echo "Error creating GitHub repository. Please check gh CLI authentication and try again."
    fi
  fi
fi

echo "✅ Project initialization complete!"
echo "Location: $PROJECT_PATH"

# Add to manifest.md that GitHub repo was created
if [ "$CREATE_GITHUB" = true ]; then
  # Append to manifest.md
  # Use sed to insert before the "## Notes" line
  sed -i '/## Notes/i ## GitHub\n- Repository created: '"$PROJECT_NAME"'\n- Visibility: '"$([ "$GITHUB_PRIVATE" = true ] && echo 'Private' || echo 'Public')"'\n' "$PROJECT_PATH/manifest.md"
fi

exit 0
