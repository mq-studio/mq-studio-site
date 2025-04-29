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
