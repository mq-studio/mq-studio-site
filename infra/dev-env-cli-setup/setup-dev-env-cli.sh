#!/bin/bash

# This script creates the dev-env-cli package structure
# Run this script to create the full CLI package

# Define directories to create
mkdir -p dev-env-cli/bin/commands
mkdir -p dev-env-cli/docs

# Create main dev-env command file
cat > dev-env-cli/bin/dev-env << 'EOF'
#!/bin/bash

# dev-env - Development Environment CLI
# Main command handler

VERSION="0.1.0"
COMMANDS_DIR="$(dirname "$0")/commands"

# Display help information
show_help() {
  echo "Development Environment CLI v$VERSION"
  echo ""
  echo "Usage: dev-env COMMAND [options]"
  echo ""
  echo "Commands:"
  echo "  initialize-project    Create a new project with standardized structure"
  echo "  move-artifacts        Move artifacts between projects or locations"
  echo "  update-prompts        Update AI assistant prompt templates"
  echo "  validate-environment  Check environment configuration"
  echo "  backup                Create backups of projects or configurations"
  echo ""
  echo "For command-specific help, use: dev-env COMMAND --help"
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

# Process commands
COMMAND="$1"
shift  # Remove command from arguments

case "$COMMAND" in
  "initialize-project")
    # Check if the command script exists
    if [ -f "$COMMANDS_DIR/initialize-project.sh" ]; then
      # Execute the command script with all remaining arguments
      "$COMMANDS_DIR/initialize-project.sh" "$@"
    else
      echo "Error: Command 'initialize-project' implementation not found."
      exit 1
    fi
    ;;
  
  "move-artifacts")
    if [ -f "$COMMANDS_DIR/move-artifacts.sh" ]; then
      "$COMMANDS_DIR/move-artifacts.sh" "$@"
    else
      echo "Error: Command 'move-artifacts' implementation not found."
      exit 1
    fi
    ;;
    
  "update-prompts")
    if [ -f "$COMMANDS_DIR/update-prompts.sh" ]; then
      "$COMMANDS_DIR/update-prompts.sh" "$@"
    else
      echo "Error: Command 'update-prompts' implementation not found."
      exit 1
    fi
    ;;
    
  "validate-environment")
    if [ -f "$COMMANDS_DIR/validate-environment.sh" ]; then
      "$COMMANDS_DIR/validate-environment.sh" "$@"
    else
      echo "Error: Command 'validate-environment' implementation not found."
      exit 1
    fi
    ;;
    
  "backup")
    if [ -f "$COMMANDS_DIR/backup.sh" ]; then
      "$COMMANDS_DIR/backup.sh" "$@"
    else
      echo "Error: Command 'backup' implementation not found."
      exit 1
    fi
    ;;
  
  "--version")
    echo "dev-env version $VERSION"
    ;;
    
  "--help" | "-h")
    show_help
    ;;
    
  *)
    echo "Error: Unknown command '$COMMAND'"
    echo "Run 'dev-env --help' for usage information."
    exit 1
    ;;
esac
EOF

# Create initialize-project.sh
cat > dev-env-cli/bin/commands/initialize-project.sh << 'EOF'
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
EOF

# Create move-artifacts.sh
cat > dev-env-cli/bin/commands/move-artifacts.sh << 'EOF'
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
EOF

# Create update-prompts.sh
cat > dev-env-cli/bin/commands/update-prompts.sh << 'EOF'
#!/bin/bash

# update-prompts - Update AI assistant prompt templates
# Part of dev-env CLI

# Default values
CODE_DIR="$HOME/code"
PROMPTS_DIR="$HOME/code/infra/dev-env-docs/PROMPTS"
TARGET_PROJECT=""
ALL_PROJECTS=false
PROMPT_NAME=""
LIST_MODE=false

# Display help information
show_help() {
  echo "dev-env update-prompts - Update AI assistant prompt templates"
  echo ""
  echo "Usage: dev-env update-prompts [options]"
  echo ""
  echo "Options:"
  echo "  --project PATH  Target project to update prompts for"
  echo "  --all           Update prompts for all projects"
  echo "  --prompt NAME   Specific prompt template to update (e.g., 'new-session-context-prompt')"
  echo "  --list          List available prompt templates"
  echo "  --help          Show this help message"
  echo ""
  echo "Examples:"
  echo "  dev-env update-prompts --list"
  echo "  dev-env update-prompts --project ~/code/web/my-project --prompt new-session-context-prompt"
  echo "  dev-env update-prompts --all"
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
    --project)
      TARGET_PROJECT="$2"
      shift 2
      ;;
    --all)
      ALL_PROJECTS=true
      shift
      ;;
    --prompt)
      PROMPT_NAME="$2"
      shift 2
      ;;
    --list)
      LIST_MODE=true
      shift
      ;;
    *)
      echo "Error: Unexpected argument '$1'"
      show_help
      exit 1
      ;;
  esac
done

# Check if prompts directory exists
if [ ! -d "$PROMPTS_DIR" ]; then
  echo "Error: Prompts directory not found: $PROMPTS_DIR"
  echo "Please ensure the dev-env-docs repository is properly set up."
  exit 1
fi

# List available prompts if requested
if [ "$LIST_MODE" = true ]; then
  echo "Available prompt templates:"
  for prompt in "$PROMPTS_DIR"/*.md; do
    if [ -f "$prompt" ]; then
      PROMPT_FILENAME=$(basename "$prompt")
      PROMPT_NAME="${PROMPT_FILENAME%.md}"
      echo "  - $PROMPT_NAME"
      # Display a brief description from the first line of the file
      FIRST_LINE=$(head -n 1 "$prompt")
      if [[ "$FIRST_LINE" == "# "* ]]; then
        echo "    $(echo "$FIRST_LINE" | sed 's/# //')"
      fi
    fi
  done
  exit 0
fi

# Validate arguments
if [ "$ALL_PROJECTS" = false ] && [ -z "$TARGET_PROJECT" ]; then
  echo "Error: Either --project or --all must be specified"
  show_help
  exit 1
fi

if [ -n "$TARGET_PROJECT" ] && [ ! -d "$TARGET_PROJECT" ]; then
  echo "Error: Target project directory not found: $TARGET_PROJECT"
  exit 1
fi

# Helper function to update prompts for a project
update_project_prompts() {
  local project_dir="$1"
  local project_name=$(basename "$project_dir")
  
  echo "Updating prompts for project: $project_name"
  
  # Create prompts directory if it doesn't exist
  local project_prompts_dir="$project_dir/docs/prompts"
  mkdir -p "$project_prompts_dir"
  
  # Copy specific prompt or all prompts
  if [ -n "$PROMPT_NAME" ]; then
    local source_prompt="$PROMPTS_DIR/${PROMPT_NAME}.md"
    if [ ! -f "$source_prompt" ]; then
      echo "  Error: Prompt template not found: $PROMPT_NAME"
      return 1
    fi
    
    echo "  Updating prompt: $PROMPT_NAME"
    cp "$source_prompt" "$project_prompts_dir/"
  else
    echo "  Updating all prompts"
    for prompt in "$PROMPTS_DIR"/*.md; do
      if [ -f "$prompt" ]; then
        cp "$prompt" "$project_prompts_dir/"
      fi
    done
  fi
  
  echo "  ✅ Prompts updated successfully for $project_name"
  return 0
}

# Execute updates
if [ "$ALL_PROJECTS" = true ]; then
  # Find all projects across categories
  CATEGORIES=("infra" "clients" "products" "experiments" "web")
  
  for category in "${CATEGORIES[@]}"; do
    category_dir="$CODE_DIR/$category"
    if [ -d "$category_dir" ]; then
      for project_dir in "$category_dir"/*; do
        if [ -d "$project_dir" ]; then
          update_project_prompts "$project_dir"
        fi
      done
    fi
  done
else
  # Update for a single project
  update_project_prompts "$TARGET_PROJECT"
fi

echo "✅ Prompt update operation completed!"
exit 0
EOF

# Create validate-environment.sh
cat > dev-env-cli/bin/commands/validate-environment.sh << 'EOF'
#!/bin/bash

# validate-environment - Check environment configuration
# Part of dev-env CLI

# Default values
CHECK_WSL=true
CHECK_GIT=true
CHECK_NODE=true
CHECK_DOCKER=true
CHECK_FIREBASE=true
CHECK_VSCODE=true
VERBOSE=false
SHOW_FIXES=true

# Display help information
show_help() {
  echo "dev-env validate-environment - Check environment configuration"
  echo ""
  echo "Usage: dev-env validate-environment [options]"
  echo ""
  echo "Options:"
  echo "  --skip-wsl         Skip WSL environment checks"
  echo "  --skip-git         Skip Git configuration checks"
  echo "  --skip-node        Skip Node.js installation checks"
  echo "  --skip-docker      Skip Docker installation checks"
  echo "  --skip-firebase    Skip Firebase CLI checks"
  echo "  --skip-vscode      Skip VS Code configuration checks"
  echo "  --verbose          Show detailed check information"
  echo "  --no-fixes         Don't show suggested fixes for issues"
  echo "  --help             Show this help message"
  echo ""
  echo "Examples:"
  echo "  dev-env validate-environment"
  echo "  dev-env validate-environment --verbose --skip-docker"
}

# Check if help requested
if [ "$1" == "--help" ]; then
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
    --skip-wsl)
      CHECK_WSL=false
      shift
      ;;
    --skip-git)
      CHECK_GIT=false
      shift
      ;;
    --skip-node)
      CHECK_NODE=false
      shift
      ;;
    --skip-docker)
      CHECK_DOCKER=false
      shift
      ;;
    --skip-firebase)
      CHECK_FIREBASE=false
      shift
      ;;
    --skip-vscode)
      CHECK_VSCODE=false
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --no-fixes)
      SHOW_FIXES=false
      shift
      ;;
    *)
      echo "Error: Unexpected argument '$1'"
      show_help
      exit 1
      ;;
  esac
done

# Variables to track status
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run a check
run_check() {
  local name="$1"
  local command="$2"
  local expected_status="$3"
  local fix="$4"
  
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  echo -n "Checking $name... "
  
  # Run the command
  eval "$command" > /dev/null 2>&1
  local status=$?
  
  # Check if the status matches the expected status
  if [ $status -eq $expected_status ]; then
    echo "✅ Passed"
    if [ "$VERBOSE" = true ]; then
      echo "  Command: $command"
    fi
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    echo "❌ Failed"
    if [ "$VERBOSE" = true ]; then
      echo "  Command: $command"
      echo "  Expected status: $expected_status, got: $status"
    fi
    if [ "$SHOW_FIXES" = true ] && [ -n "$fix" ]; then
      echo "  Fix: $fix"
    fi
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
  fi
}

echo "Starting environment validation..."

if [ "$CHECK_WSL" = true ]; then
  echo "--- WSL Checks ---"
  
  run_check "WSL version" "wsl --status | grep -q 'WSL 2'" 0 "Update to WSL 2 with 'wsl --set-default-version 2'"
  
  run_check "Ubuntu distribution" "grep -q 'Ubuntu' /etc/os-release" 0 "Install Ubuntu distribution from the Microsoft Store"
  
  run_check "WSL filesystem" "mount | grep -q '/dev/sdb.*on / type ext4'" 0 "Your WSL filesystem might be using a virtual hard disk. This is usually fine."
  
  run_check "OneDrive location" "mount | grep -q 'OneDrive'" 1 "Consider moving WSL to a non-OneDrive location for better performance"
  
  run_check "WSL integration in Docker Desktop" "grep -q 'WSL INTEGRATION' ~/.docker/config.json 2>/dev/null || grep -q 'wsl' ~/.docker/daemon.json 2>/dev/null" 0 "Enable WSL integration in Docker Desktop settings"
fi

if [ "$CHECK_GIT" = true ]; then
  echo "--- Git Checks ---"
  
  run_check "Git installation" "command -v git" 0 "Install Git with 'sudo apt update && sudo apt install -y git'"
  
  run_check "Git user name" "git config --get user.name" 0 "Set Git user name with 'git config --global user.name \"Your Name\"'"
  
  run_check "Git user email" "git config --get user.email" 0 "Set Git user email with 'git config --global user.email \"your.email@example.com\"'"
  
  run_check "GitHub CLI installation" "command -v gh" 0 "Install GitHub CLI: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
  
  run_check "GitHub authentication" "gh auth status" 0 "Authenticate to GitHub with 'gh auth login'"
fi

if [ "$CHECK_NODE" = true ]; then
  echo "--- Node.js Checks ---"
  
  run_check "Node.js installation" "command -v node" 0 "Install Node.js with 'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs'"
  
  run_check "npm installation" "command -v npm" 0 "Install npm with 'sudo apt install -y npm'"
  
  run_check "Node version (>= 16)" "node -v | grep -E 'v1[6-9]|v[2-9][0-9]'" 0 "Update Node.js to v16 or later"
  
  run_check "npm version (>= 7)" "npm -v | grep -E '^[7-9]|^[1-9][0-9]'" 0 "Update npm with 'npm install -g npm@latest'"
fi

if [ "$CHECK_DOCKER" = true ]; then
  echo "--- Docker Checks ---"
  
  run_check "Docker installation" "command -v docker" 0 "Install Docker Desktop for Windows and enable WSL integration"
  
  run_check "Docker running" "docker info" 0 "Start Docker Desktop application"
  
  run_check "Docker Compose installation" "command -v docker-compose" 0 "Install Docker Compose with 'sudo apt install -y docker-compose'"
  
  run_check "Docker permissions" "docker ps" 0 "Add your user to the docker group with 'sudo usermod -aG docker $USER' and restart your terminal"
fi

if [ "$CHECK_FIREBASE" = true ]; then
  echo "--- Firebase Checks ---"
  
  run_check "Firebase CLI installation" "command -v firebase" 0 "Install Firebase CLI with 'npm install -g firebase-tools'"
  
  run_check "Firebase login" "firebase projects:list" 0 "Log in to Firebase with 'firebase login'"
  
  run_check "Firebase version (>= 9)" "firebase --version | grep -E '^9|^[1-9][0-9]'" 0 "Update Firebase CLI with 'npm install -g firebase-tools@latest'"
fi

if [ "$CHECK_VSCODE" = true ]; then
  echo "--- VS Code Checks ---"
  
  run_check "VS Code installation" "command -v code" 0 "Install VS Code and add it to PATH: https://code.visualstudio.com/docs/setup/linux#_path-setup"
  
  run_check "Remote WSL extension" "grep -q 'ms-vscode-remote.remote-wsl' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'Remote - WSL' extension in VS Code"
  
  run_check "ESLint extension" "grep -q 'dbaeumer.vscode-eslint' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'ESLint' extension in VS Code"
  
  run_check "Prettier extension" "grep -q 'esbenp.prettier-vscode' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'Prettier' extension in VS Code"
  
  run_check "GitHub Pull Requests extension" "grep -q 'github.vscode-pull-request-github' ~/.vscode/extensions/*/package.json 2>/dev/null" 0 "Install the 'GitHub Pull Requests and Issues' extension in VS Code"
fi

# Print summary
echo ""
echo "=== Validation Summary ==="
echo "Total checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"

if [ $FAILED_CHECKS -eq 0 ]; then
  echo "✅ All checks passed! Your environment is correctly configured."
  exit 0
else
  echo "❌ Some checks failed. Please address the issues above."
  exit 1
fi
EOF

# Create backup.sh
cat > dev-env-cli/bin/commands/backup.sh << 'EOF'
#!/bin/bash

# backup - Create backups of projects or configurations
# Part of dev-env CLI

# Default values
CODE_DIR="$HOME/code"
TARGET=""
BACKUP_TYPE="project"  # project, config, all
BACKUP_DIR="$HOME/dev-env-backups"
INCLUDE_NODE_MODULES=false
COMPRESS=true
DATE_TAG=$(date +"%Y%m%d_%H%M%S")

# Display help information
show_help() {
  echo "dev-env backup - Create backups of projects or configurations"
  echo ""
  echo "Usage: dev-env backup [options]"
  echo ""
  echo "Options:"
  echo "  --target PATH       Project or configuration to backup (default: all projects)"
  echo "  --type TYPE         Backup type (project, config, all), default: project"
  echo "  --backup-dir DIR    Directory to store backups, default: ~/dev-env-backups"
  echo "  --include-deps      Include node_modules and other dependencies"
  echo "  --no-compress       Skip compression of backup files"
  echo "  --help              Show this help message"
  echo ""
  echo "Examples:"
  echo "  dev-env backup --target ~/code/web/my-project"
  echo "  dev-env backup --type config"
  echo "  dev-env backup --type all --backup-dir /mnt/external-drive/backups"
}

# Check if help requested
if [ "$1" == "--help" ]; then
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
    --target)
      TARGET="$2"
      shift 2
      ;;
    --type)
      BACKUP_TYPE="$2"
      shift 2
      ;;
    --backup-dir)
      BACKUP_DIR="$2"
      shift 2
      ;;
    --include-deps)
      INCLUDE_NODE_MODULES=true
      shift
      ;;
    --no-compress)
      COMPRESS=false
      shift
      ;;
    *)
      echo "Error: Unexpected argument '$1'"
      show_help
      exit 1
      ;;
  esac
done

# Validate backup type
if [ "$BACKUP_TYPE" != "project" ] && [ "$BACKUP_TYPE" != "config" ] && [ "$BACKUP_TYPE" != "all" ]; then
  echo "Error: Invalid backup type '$BACKUP_TYPE'"
  echo "Valid types: project, config, all"
  exit 1
fi

# Create backup directory
if [ ! -d "$BACKUP_DIR" ]; then
  echo "Creating backup directory: $BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"
fi

# Backup a single project
backup_project() {
  local project_path="$1"
  local project_name=$(basename "$project_path")
  local backup_filename="${project_name}_${DATE_TAG}"
  local backup_path="$BACKUP_DIR/projects/$backup_filename"
  
  echo "Backing up project: $project_name"
  
  # Create backup directory
  mkdir -p "$BACKUP_DIR/projects"
  
  # Create temporary directory for the backup
  local temp_dir=$(mktemp -d)
  
  # Copy project to temporary directory
  if [ "$INCLUDE_NODE_MODULES" = true ]; then
    cp -r "$project_path" "$temp_dir/"
  else
    # Exclude node_modules, dist, build directories
    rsync -a --exclude='node_modules' --exclude='dist' --exclude='build' "$project_path/" "$temp_dir/$project_name/"
  fi
  
  # Create backup archive
  if [ "$COMPRESS" = true ]; then
    echo "Compressing backup..."
    (cd "$temp_dir" && tar -czf "$backup_path.tar.gz" "$project_name")
    echo "Backup created: $backup_path.tar.gz"
  else
    cp -r "$temp_dir/$project_name" "$backup_path"
    echo "Backup created: $backup_path"
  fi
  
  # Clean up temporary directory
  rm -rf "$temp_dir"
}

# Backup configuration files
backup_configs() {
  local backup_filename="dev_env_configs_${DATE_TAG}"
  local backup_path="$BACKUP_DIR/configs/$backup_filename"
  
  echo "Backing up development environment configurations"
  
  # Create backup directory
  mkdir -p "$BACKUP_DIR/configs"
  
  # Create temporary directory for the backup
  local temp_dir=$(mktemp -d)
  mkdir -p "$temp_dir/configs"
  
  # Copy relevant configuration files
  echo "Copying configuration files..."
  
  # Git configuration
  if [ -f "$HOME/.gitconfig" ]; then
    cp "$HOME/.gitconfig" "$temp_dir/configs/"
  fi
  
  # SSH keys (just the public ones for safety)
  if [ -d "$HOME/.ssh" ]; then
    mkdir -p "$temp_dir/configs/ssh"
    cp "$HOME/.ssh/*.pub" "$temp_dir/configs/ssh/" 2>/dev/null || true
  fi
  
  # VS Code settings
  if [ -d "$HOME/.vscode" ]; then
    mkdir -p "$temp_dir/configs/vscode"
    cp -r "$HOME/.vscode/settings.json" "$temp_dir/configs/vscode/" 2>/dev/null || true
    cp -r "$HOME/.vscode/keybindings.json" "$temp_dir/configs/vscode/" 2>/dev/null || true
  fi
  
  # Bash profile and configurations
  if [ -f "$HOME/.bashrc" ]; then
    cp "$HOME/.bashrc" "$temp_dir/configs/"
  fi
  
  if [ -f "$HOME/.bash_profile" ]; then
    cp "$HOME/.bash_profile" "$temp_dir/configs/"
  fi
  
  # Development environment documentation
  if [ -d "$CODE_DIR/infra/dev-env-docs" ]; then
    mkdir -p "$temp_dir/configs/dev-env-docs"
    cp -r "$CODE_DIR/infra/dev-env-docs" "$temp_dir/configs/"
  fi
  
  # Create backup archive
  if [ "$COMPRESS" = true ]; then
    echo "Compressing backup..."
    (cd "$temp_dir" && tar -czf "$backup_path.tar.gz" "configs")
    echo "Backup created: $backup_path.tar.gz"
  else
    cp -r "$temp_dir/configs" "$backup_path"
    echo "Backup created: $backup_path"
  fi
  
  # Clean up temporary directory
  rm -rf "$temp_dir"
}

# Execute backup based on type
if [ "$BACKUP_TYPE" = "project" ] || [ "$BACKUP_TYPE" = "all" ]; then
  if [ -n "$TARGET" ] && [ -d "$TARGET" ]; then
    # Backup specific project
    backup_project "$TARGET"
  elif [ -z "$TARGET" ] && [ "$BACKUP_TYPE" = "project" ]; then
    # No target specified for project backup
    echo "Error: --target is required for project backup"
    exit 1
  elif [ "$BACKUP_TYPE" = "all" ]; then
    # Backup all projects across categories
    CATEGORIES=("infra" "clients" "products" "experiments" "web")
    
    for category in "${CATEGORIES[@]}"; do
      category_dir="$CODE_DIR/$category"
      if [ -d "$category_dir" ]; then
        for project_dir in "$category_dir"/*; do
          if [ -d "$project_dir" ]; then
            backup_project "$project_dir"
          fi
        done
      fi
    done
  fi
fi

if [ "$BACKUP_TYPE" = "config" ] || [ "$BACKUP_TYPE" = "all" ]; then
  # Backup configuration files
  backup_configs
fi

echo "✅ Backup operation completed!"
echo "Backups are stored in: $BACKUP_DIR"

exit 0
EOF

# Create install.sh
cat > dev-env-cli/install.sh << 'EOF'
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
EOF

# Create README.md
cat > dev-env-cli/README.md << 'EOF'
# Development Environment CLI

A command-line interface tool for managing and optimizing the development environment.

## Installation

```bash
# Clone the repository
git clone <repository_url> dev-env
cd dev-env

# Run the installation script
./install.sh

# Restart your terminal or run
source ~/.bashrc
```

## Available Commands

- `initialize-project` - Create a new project with standardized structure
- `move-artifacts` - Move artifacts between projects or locations
- `update-prompts` - Update AI assistant prompt templates
- `validate-environment` - Check environment configuration
- `backup` - Create backups of projects or configurations

## Usage

```bash
# Show general help
dev-env --help

# Show command-specific help
dev-env initialize-project --help

# Create a new project
dev-env initialize-project my-new-app --type web

# Create a new project and push to GitHub
dev-env initialize-project my-new-app --type products --github
```

## Documentation

See the `docs/` directory for detailed documentation on each command.
EOF

# Create USAGE.md
cat > dev-env-cli/docs/USAGE.md << 'EOF'
# dev-env CLI Usage Guide

## General Usage

The dev-env CLI follows a consistent pattern:

```
dev-env COMMAND [options]
```

## Available Commands

### initialize-project

Creates a new project with standardized structure based on the project template.

```bash
dev-env initialize-project NAME [options]
```

Options:
- `--type TYPE` - Project type (infra, clients, products, experiments, web)
- `--github` - Initialize and push to GitHub repository
- `--public` - Make GitHub repository public (if --github is used)

Example:
```bash
dev-env initialize-project my-new-app --type products --github
```

This creates a new project in the products category with:
- Standard folder structure (docs/, scripts/, workflows/, assets/)
- README.md and manifest.md files
- Git initialization
- GitHub repository creation and push

### move-artifacts

Move artifacts between projects or locations.

```bash
dev-env move-artifacts SOURCE DESTINATION [options]
```

Options:
- `--type TYPE` - Artifact type (file or directory), default: file
- `--no-backup` - Skip creating backup of existing destination

Example:
```bash
dev-env move-artifacts ~/code/web/project1/docs/architecture.md ~/code/infra/docs/
```

### update-prompts

Update AI assistant prompt templates.

```bash
dev-env update-prompts [options]
```

Options:
- `--project PATH` - Target project to update prompts for
- `--all` - Update prompts for all projects
- `--prompt NAME` - Specific prompt template to update
- `--list` - List available prompt templates

Example:
```bash
dev-env update-prompts --project ~/code/web/my-project --prompt new-session-context-prompt
```

### validate-environment

Check environment configuration for compliance with standards.

```bash
dev-env validate-environment [options]
```

Options:
- `--skip-wsl` - Skip WSL environment checks
- `--skip-git` - Skip Git configuration checks
- `--skip-node` - Skip Node.js installation checks
- `--skip-docker` - Skip Docker installation checks
- `--skip-firebase` - Skip Firebase CLI checks
- `--skip-vscode` - Skip VS Code configuration checks
- `--verbose` - Show detailed check information
- `--no-fixes` - Don't show suggested fixes for issues

Example:
```bash
dev-env validate-environment --verbose
```

### backup

Create backups of projects or configurations.

```bash
dev-env backup [options]
```

Options:
- `--target PATH` - Project or configuration to backup
- `--type TYPE` - Backup type (project, config, all), default: project
- `--backup-dir DIR` - Directory to store backups, default: ~/dev-env-backups
- `--include-deps` - Include node_modules and other dependencies
- `--no-compress` - Skip compression of backup files

Example:
```bash
dev-env backup --target ~/code/web/my-project
```
EOF

# Create manifest.md
cat > dev-env-cli/manifest.md << 'EOF'
# 📋 Manifest for dev-env CLI

## Project Information
- **Name:** dev-env CLI
- **Type:** infra
- **Created:** 2025-04-27
- **Status:** In Development

## Overview
Command-line interface tool for managing and optimizing the development environment.

## Artifacts
| File/Directory | Purpose | Status |
|:---------------|:--------|:-------|
| bin/dev-env | Main command runner | Created |
| bin/commands/ | Individual command implementations | Created |
| bin/commands/initialize-project.sh | Project initialization command | Created |
| bin/commands/move-artifacts.sh | Artifact movement command | Created |
| bin/commands/update-prompts.sh | Prompt updating command | Created |
| bin/commands/validate-environment.sh | Environment validation command | Created |
| bin/commands/backup.sh | Backup command | Created |
| docs/ | Documentation | Created |
| docs/USAGE.md | Usage guide | Created |
| install.sh | Installation script | Created |
| manifest.md | Project manifest | Created |
| README.md | Project documentation | Created |

## Version History
- **0.1.0** - Initial implementation with all core commands

## Notes
- CLI follows modular design for future expansion
- Transitioning to Python or Go planned in future iterations
EOF

# Create package.sh - This is the script that creates a zip of everything
cat > package.sh << 'EOF'
#!/bin/bash

# package.sh - Create a zip file of the dev-env-cli package

PACKAGE_NAME="dev-env-cli"
ZIP_FILE="${PACKAGE_NAME}.zip"

# Check if the directory exists
if [ ! -d "$PACKAGE_NAME" ]; then
  echo "Error: $PACKAGE_NAME directory not found."
  exit 1
fi

# Create the zip file
echo "Creating $ZIP_FILE..."
zip -r "$ZIP_FILE" "$PACKAGE_NAME"

echo "✅ Package created: $ZIP_FILE"
echo "To install, run:"
echo "  unzip $ZIP_FILE"
echo "  cd $PACKAGE_NAME"
echo "  ./install.sh"

exit 0
EOF

# Make the package.sh script executable
chmod +x package.sh

# Run the package script to create the zip file
./package.sh

echo "✅ dev-env-cli package has been created and zipped."
echo "To deploy and install:"
echo "1. Extract the ZIP file: unzip dev-env-cli.zip"
echo "2. Navigate to the extracted directory: cd dev-env-cli"
echo "3. Run the installation script: ./install.sh"
echo "4. Restart your terminal or run: source ~/.bashrc"