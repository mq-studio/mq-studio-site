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
